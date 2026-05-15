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

    const participants: { role: string; userId: number; name: string }[] = [
      { role: 'buyer', userId: order.buyer.user.id, name: order.buyer.user.name },
      { role: 'seller', userId: order.seller.user.id, name: order.seller.user.name },
    ]

    const addDriver = (driver: any) => {
      if (driver && !participants.some(p => p.userId === driver.user.id)) {
        participants.push({
          role: 'driver',
          userId: driver.user.id,
          name: `${driver.user.name} (Kurir)`,
        })
      }
    }

    // Driver hanya muncul jika sudah "Accept" (status berubah dari confirmed/pending_pickup)
    const pickupActive = [
      'driver_on_way_pickup', 'picked_up', 'at_laundry', 
      'payment_pending', 'washing', 'ready_for_delivery'
    ];
    const deliveryActive = [
      'driver_on_way_delivery', 'delivered', 'completed'
    ];

    if (order.pickupDriver && pickupActive.includes(order.status)) {
      addDriver(order.pickupDriver);
    }
    if (order.deliveryDriver && deliveryActive.includes(order.status)) {
      addDriver(order.deliveryDriver);
    }

    // Filter out current user
    const others = participants.filter((p) => p.userId !== authUser.userId)

    return NextResponse.json({ success: true, data: others })
  } catch (err) {
    console.error('[GET /api/chat/:orderId/participants]', err)
    return serverError()
  }
}
