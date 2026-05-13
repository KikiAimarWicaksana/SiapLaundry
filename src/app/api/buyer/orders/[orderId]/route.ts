import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, serverError } from '@/lib/api-response'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'buyer') return unauthorized('Akses ditolak')

    const buyer = await prisma.buyer.findUnique({ where: { userId: authUser.userId } })
    if (!buyer) return unauthorized('Buyer tidak ditemukan')

    const { orderId } = await params
    const order = await prisma.order.findFirst({
      where: { id: Number(orderId), buyerId: buyer.id },
      include: {
        seller: { select: { laundryName: true, photos: true, latitude: true, longitude: true } },
        service: { select: { serviceName: true, pricePerUnit: true, unit: true } },
        pickupDriver: {
          include: { user: { select: { name: true, phone: true } } },
        },
        deliveryDriver: {
          include: { user: { select: { name: true, phone: true } } },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!order) return notFound('Order tidak ditemukan')

    // Ambil posisi kurir aktif jika sedang dalam perjalanan
    let driverPosition: { lat: number; lng: number } | null = null
    const activeDriverId =
      order.status === 'driver_on_way_pickup' || order.status === 'picked_up'
        ? order.pickupDriverId
        : order.status === 'driver_on_way_delivery'
          ? order.deliveryDriverId
          : null

    if (activeDriverId) {
      const driver = await prisma.driver.findUnique({ where: { id: activeDriverId } })
      if (driver?.currentLatitude && driver?.currentLongitude) {
        driverPosition = {
          lat: Number(driver.currentLatitude),
          lng: Number(driver.currentLongitude),
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(order.id),
        orderNumber: order.orderNumber,
        buyerId: String(order.buyerId),
        seller: {
          id: String(order.sellerId),
          laundryName: order.seller.laundryName,
          photos: (order.seller.photos as string[]) ?? [],
          latitude: Number(order.seller.latitude),
          longitude: Number(order.seller.longitude),
        },
        service: {
          id: String(order.serviceId),
          serviceName: order.service.serviceName,
          pricePerUnit: Number(order.service.pricePerUnit),
          unit: order.service.unit,
        },
        pickupAddress: order.pickupAddress,
        pickupLatitude: Number(order.pickupLatitude),
        pickupLongitude: Number(order.pickupLongitude),
        pickupDate: order.pickupDate.toISOString().split('T')[0],
        pickupTimeSlot: order.pickupTimeSlot,
        pickupDriver: order.pickupDriver
          ? {
              id: String(order.pickupDriver.id),
              name: order.pickupDriver.user.name,
              phone: order.pickupDriver.user.phone,
              vehiclePlate: order.pickupDriver.vehiclePlate,
            }
          : null,
        deliveryDriver: order.deliveryDriver
          ? {
              id: String(order.deliveryDriver.id),
              name: order.deliveryDriver.user.name,
              phone: order.deliveryDriver.user.phone,
              vehiclePlate: order.deliveryDriver.vehiclePlate,
            }
          : null,
        estimatedWeight: order.estimatedWeight ? Number(order.estimatedWeight) : null,
        actualWeight: order.actualWeight ? Number(order.actualWeight) : null,
        estimatedPrice: order.estimatedPrice ? Number(order.estimatedPrice) : null,
        finalPrice: order.finalPrice ? Number(order.finalPrice) : null,
        deliveryFee: Number(order.deliveryFee),
        totalPrice: order.totalPrice ? Number(order.totalPrice) : null,
        status: order.status,
        buyerNotes: order.buyerNotes ?? null,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
        statusHistory: order.statusHistory.map((h) => ({
          status: h.status,
          createdAt: h.createdAt.toISOString(),
          notes: h.notes ?? null,
        })),
        driverPosition,
      },
    })
  } catch (err) {
    console.error('[GET /api/buyer/orders/:id]', err)
    return serverError()
  }
}
