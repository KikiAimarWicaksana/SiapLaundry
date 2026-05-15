import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, serverError } from '@/lib/api-response'

/**
 * GET /api/chat/[orderId]/participants
 * Return semua peserta dalam order ini beserta userId mereka
 * untuk keperluan kirim pesan
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorized('Akses ditolak')

    const { orderId } = await params
    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        OR: [
          { buyer: { userId: authUser.userId } },
          { seller: { userId: authUser.userId } },
          { pickupDriver: { userId: authUser.userId } },
          { deliveryDriver: { userId: authUser.userId } },
        ],
      },
      include: {
        buyer: { include: { user: { select: { id: true, name: true } } } },
        seller: { include: { user: { select: { id: true, name: true } } } },
        pickupDriver: { include: { user: { select: { id: true, name: true } } } },
        deliveryDriver: { include: { user: { select: { id: true, name: true } } } },
      },
    })

    if (!order) return notFound('Order tidak ditemukan')

    const participants = [
      { role: 'buyer', userId: order.buyer.user.id, name: order.buyer.user.name },
      { role: 'seller', userId: order.seller.user.id, name: order.seller.user.name },
    ]

    if (order.pickupDriver) {
      participants.push({
        role: 'driver',
        userId: order.pickupDriver.user.id,
        name: `${order.pickupDriver.user.name} (Kurir)`,
      })
    }

    // Filter out current user
    const others = participants.filter((p) => p.userId !== authUser.userId)

    return NextResponse.json({ success: true, data: others })
  } catch (err) {
    console.error('[GET /api/chat/:orderId/participants]', err)
    return serverError()
  }
}
