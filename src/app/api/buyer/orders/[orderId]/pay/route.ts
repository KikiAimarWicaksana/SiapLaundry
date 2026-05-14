import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'

const schema = z.object({
  paymentMethod: z.enum(['transfer', 'cash', 'ewallet']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'buyer') return unauthorized('Akses ditolak')

    const buyer = await prisma.buyer.findUnique({ where: { userId: authUser.userId } })
    if (!buyer) return unauthorized('Buyer tidak ditemukan')

    const { orderId } = await params
    const order = await prisma.order.findFirst({
      where: { id: Number(orderId), buyerId: buyer.id, status: 'payment_pending' },
    })
    if (!order) return notFound('Order tidak ditemukan atau belum dalam status pembayaran')

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'paid',
        paymentMethod: parsed.data.paymentMethod,
        status: 'washing',
        statusHistory: {
          create: {
            status: 'washing',
            notes: `Pembayaran diterima via ${parsed.data.paymentMethod}. Proses cuci dimulai.`,
            createdBy: authUser.userId,
          },
        },
      },
    })

    // Notifikasi ke seller bahwa pembayaran sudah diterima
    const seller = await prisma.seller.findUnique({ where: { id: order.sellerId } })
    if (seller) {
      await prisma.notification.create({
        data: {
          userId: seller.userId,
          title: 'Pembayaran Diterima',
          message: `Pembayaran untuk order #${order.orderNumber} sudah diterima. Silakan mulai proses cuci.`,
          type: 'order',
          relatedId: order.id,
        },
      })
    }

    return NextResponse.json({ success: true, data: { status: 'washing', paymentStatus: 'paid' } })
  } catch (err) {
    console.error('[POST /api/buyer/orders/:id/pay]', err)
    return serverError()
  }
}
