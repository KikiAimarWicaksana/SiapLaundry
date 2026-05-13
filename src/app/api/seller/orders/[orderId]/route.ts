import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, badRequest, notFound, serverError } from '@/lib/api-response'

const updateSchema = z.object({
  status: z.enum(['washing', 'ready_for_delivery']).optional(),
  actualWeight: z.number().positive().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const { orderId } = await params
    const order = await prisma.order.findFirst({
      where: { id: Number(orderId), sellerId: seller.id },
      include: {
        buyer: { include: { user: { select: { name: true, phone: true } } } },
        service: { select: { serviceName: true, pricePerUnit: true, unit: true } },
      },
    })

    if (!order) return notFound('Order tidak ditemukan')

    return NextResponse.json({
      success: true,
      data: {
        id: String(order.id),
        orderNumber: order.orderNumber,
        status: order.status,
        buyer: {
          name: order.buyer.user.name,
          phone: order.buyer.user.phone,
          address: order.pickupAddress,
        },
        service: {
          name: order.service.serviceName,
          pricePerUnit: Number(order.service.pricePerUnit),
          unit: order.service.unit,
        },
        estimatedWeight: order.estimatedWeight ? Number(order.estimatedWeight) : null,
        actualWeight: order.actualWeight ? Number(order.actualWeight) : null,
        deliveryFee: Number(order.deliveryFee),
        estimatedPrice: order.estimatedPrice ? Number(order.estimatedPrice) : null,
        finalPrice: order.finalPrice ? Number(order.finalPrice) : null,
        totalPrice: order.totalPrice ? Number(order.totalPrice) : null,
        pickupDate: order.pickupDate.toISOString().split('T')[0],
        pickupTimeSlot: order.pickupTimeSlot,
        buyerNotes: order.buyerNotes,
        createdAt: order.createdAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('[GET /api/seller/orders/:id]', err)
    return serverError()
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const { orderId } = await params
    const order = await prisma.order.findFirst({
      where: { id: Number(orderId), sellerId: seller.id },
    })
    if (!order) return notFound('Order tidak ditemukan')

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const { status, actualWeight } = parsed.data

    // Calculate final price if actualWeight provided
    let finalPrice: number | undefined
    let totalPrice: number | undefined
    if (actualWeight) {
      const service = await prisma.service.findUnique({ where: { id: order.serviceId } })
      if (service) {
        finalPrice = actualWeight * Number(service.pricePerUnit)
        totalPrice = finalPrice + Number(order.deliveryFee)
      }
    }

    const updated = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        ...(status ? { status } : {}),
        ...(actualWeight ? { actualWeight } : {}),
        ...(finalPrice !== undefined ? { finalPrice } : {}),
        ...(totalPrice !== undefined ? { totalPrice } : {}),
      },
    })

    return NextResponse.json({ success: true, data: { status: updated.status } })
  } catch (err) {
    console.error('[PATCH /api/seller/orders/:id]', err)
    return serverError()
  }
}
