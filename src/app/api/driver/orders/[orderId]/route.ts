import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'

const updateSchema = z.object({
  status: z.enum([
    'driver_on_way_pickup',
    'picked_up',
    'at_laundry',
    'driver_on_way_delivery',
    'delivered',
  ]).optional(),
  currentLatitude: z.number().optional(),
  currentLongitude: z.number().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'driver') return unauthorized('Akses ditolak')

    const driver = await prisma.driver.findUnique({ where: { userId: authUser.userId } })
    if (!driver) return unauthorized('Driver tidak ditemukan')

    const { orderId } = await params
    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        OR: [{ pickupDriverId: driver.id }, { deliveryDriverId: driver.id }],
      },
      include: {
        buyer: { include: { user: { select: { name: true, phone: true } } } },
        seller: { select: { laundryName: true, address: true, latitude: true, longitude: true } },
        service: { select: { serviceName: true } },
      },
    })

    if (!order) return notFound('Order tidak ditemukan')

    const isPickup = order.pickupDriverId === driver.id
    const type = isPickup ? 'pickup' : 'delivery'

    return NextResponse.json({
      success: true,
      data: {
        id: String(order.id),
        orderNumber: order.orderNumber,
        status: order.status,
        type,
        buyer: {
          name: order.buyer.user.name,
          phone: order.buyer.user.phone,
        },
        // Untuk pickup: tuju alamat buyer. Untuk delivery: tuju alamat buyer juga (antar balik)
        address: type === 'pickup' ? order.pickupAddress : (order.deliveryAddress ?? order.pickupAddress),
        latitude: type === 'pickup' ? Number(order.pickupLatitude) : Number(order.pickupLatitude),
        longitude: type === 'pickup' ? Number(order.pickupLongitude) : Number(order.pickupLongitude),
        laundryName: order.seller.laundryName,
        laundryAddress: order.seller.address,
        laundryLatitude: Number(order.seller.latitude),
        laundryLongitude: Number(order.seller.longitude),
        service: order.service.serviceName,
        estimatedWeight: order.estimatedWeight ? Number(order.estimatedWeight) : null,
        deliveryFee: Number(order.deliveryFee),
        buyerNotes: order.buyerNotes ?? null,
        createdAt: order.createdAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('[GET /api/driver/orders/:id]', err)
    return serverError()
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'driver') return unauthorized('Akses ditolak')

    const driver = await prisma.driver.findUnique({ where: { userId: authUser.userId } })
    if (!driver) return unauthorized('Driver tidak ditemukan')

    const { orderId } = await params
    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        OR: [{ pickupDriverId: driver.id }, { deliveryDriverId: driver.id }],
      },
    })
    if (!order) return notFound('Order tidak ditemukan')

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const { status, currentLatitude, currentLongitude } = parsed.data

    // Update posisi kurir
    if (currentLatitude !== undefined && currentLongitude !== undefined) {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { currentLatitude, currentLongitude },
      })
    }

    // Update status order
    if (status) {
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/driver/orders/:id]', err)
    return serverError()
  }
}
