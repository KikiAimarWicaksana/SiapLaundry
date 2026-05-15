import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'driver') return unauthorized('Akses ditolak')

    const driver = await prisma.driver.findUnique({ where: { userId: authUser.userId } })
    if (!driver) return unauthorized('Driver tidak ditemukan')

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'pickup' | 'delivery'

    const pickupOrders = await prisma.order.findMany({
      where: {
        pickupDriverId: driver.id,
        status: { in: ['confirmed', 'pending_pickup', 'driver_on_way_pickup', 'picked_up'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { include: { user: { select: { name: true } } } },
        seller: { select: { laundryName: true } },
        service: { select: { serviceName: true } },
      },
    })

    const deliveryOrders = await prisma.order.findMany({
      where: {
        deliveryDriverId: driver.id,
        status: { in: ['ready_for_delivery', 'driver_on_way_delivery', 'delivered', 'completed'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { include: { user: { select: { name: true } } } },
        seller: { select: { laundryName: true } },
        service: { select: { serviceName: true } },
      },
    })

    const mapOrder = (o: typeof pickupOrders[0], addrField: 'pickup' | 'delivery') => ({
      id: String(o.id),
      orderNumber: o.orderNumber,
      buyerName: o.buyer.user.name,
      address: addrField === 'pickup' ? o.pickupAddress : (o.deliveryAddress ?? o.pickupAddress),
      laundryName: o.seller.laundryName,
      service: o.service.serviceName,
      status: o.status,
      pickupDate: o.pickupDate.toISOString().split('T')[0],
      pickupTimeSlot: o.pickupTimeSlot,
      completedAt: o.completedAt?.toISOString() || null,
    })

    if (type === 'pickup') {
      return NextResponse.json({ success: true, data: pickupOrders.map((o) => mapOrder(o, 'pickup')) })
    }
    if (type === 'delivery') {
      return NextResponse.json({ success: true, data: deliveryOrders.map((o) => mapOrder(o as typeof pickupOrders[0], 'delivery')) })
    }

    return NextResponse.json({
      success: true,
      data: {
        pickup: pickupOrders.map((o) => mapOrder(o, 'pickup')),
        delivery: deliveryOrders.map((o) => mapOrder(o as typeof pickupOrders[0], 'delivery')),
      },
    })
  } catch (err) {
    console.error('[GET /api/driver/orders]', err)
    return serverError()
  }
}
