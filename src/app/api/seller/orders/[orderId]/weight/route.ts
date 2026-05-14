import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'

const schema = z.object({
  actualWeight: z.number().positive(),
})

export async function POST(
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
      where: { id: Number(orderId), sellerId: seller.id, status: 'at_laundry' },
      include: { service: true },
    })
    if (!order) return notFound('Order tidak ditemukan atau belum sampai di laundry')

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const { actualWeight } = parsed.data
    const finalPrice = actualWeight * Number(order.service.pricePerUnit)
    const totalPrice = finalPrice + Number(order.deliveryFee)

    await prisma.order.update({
      where: { id: order.id },
      data: {
        actualWeight,
        finalPrice,
        totalPrice,
        status: 'payment_pending',
        statusHistory: {
          create: {
            status: 'payment_pending',
            notes: `Berat aktual: ${actualWeight} kg. Total: Rp ${totalPrice.toLocaleString('id-ID')}`,
            createdBy: authUser.userId,
          },
        },
      },
    })

    // Notifikasi pembayaran ke buyer
    const buyer = await prisma.buyer.findUnique({ where: { id: order.buyerId } })
    if (buyer) {
      await prisma.notification.create({
        data: {
          userId: buyer.userId,
          title: 'Konfirmasi Pembayaran',
          message: `Berat pakaian Anda: ${actualWeight} kg. Total tagihan: Rp ${totalPrice.toLocaleString('id-ID')}. Silakan lakukan pembayaran.`,
          type: 'order',
          relatedId: order.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: { actualWeight, finalPrice, totalPrice, status: 'payment_pending' },
    })
  } catch (err) {
    console.error('[POST /api/seller/orders/:id/weight]', err)
    return serverError()
  }
}
