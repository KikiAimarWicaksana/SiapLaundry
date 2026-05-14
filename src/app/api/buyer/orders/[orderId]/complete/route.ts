import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, serverError } from '@/lib/api-response'

export async function POST(
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
      where: { id: Number(orderId), buyerId: buyer.id, status: 'delivered' },
    })
    if (!order) return notFound('Order tidak ditemukan atau belum dalam status terkirim')

    const now = new Date()

    // Update order ke completed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'completed',
        completedAt: now,
        statusHistory: {
          create: {
            status: 'completed',
            notes: 'Dikonfirmasi selesai oleh customer',
            createdBy: authUser.userId,
          },
        },
      },
    })

    const totalPrice = Number(order.totalPrice ?? 0)
    const deliveryFee = Number(order.deliveryFee ?? 0)
    const laundryRevenue = totalPrice - deliveryFee

    // Update pendapatan seller: totalOrders sudah ada, update averageRating nanti via review
    // Untuk demo: tidak ada transfer nyata, tapi update totalOrders seller
    await prisma.seller.update({
      where: { id: order.sellerId },
      data: { totalOrders: { increment: 1 } },
    })

    // Update totalDeliveries driver (delivery driver)
    if (order.deliveryDriverId) {
      await prisma.driver.update({
        where: { id: order.deliveryDriverId },
        data: { totalDeliveries: { increment: 1 } },
      })
    }

    // Notifikasi ke seller
    const seller = await prisma.seller.findUnique({ where: { id: order.sellerId } })
    if (seller) {
      await prisma.notification.create({
        data: {
          userId: seller.userId,
          title: 'Pesanan Selesai',
          message: `Order #${order.orderNumber} telah selesai. Pendapatan Rp ${laundryRevenue.toLocaleString('id-ID')} akan masuk ke dashboard Anda.`,
          type: 'order',
          relatedId: order.id,
        },
      })
    }

    // Notifikasi ke driver
    if (order.deliveryDriverId) {
      const driver = await prisma.driver.findUnique({ where: { id: order.deliveryDriverId } })
      if (driver) {
        await prisma.notification.create({
          data: {
            userId: driver.userId,
            title: 'Pengantaran Selesai',
            message: `Order #${order.orderNumber} telah dikonfirmasi selesai. Ongkir Rp ${deliveryFee.toLocaleString('id-ID')} masuk ke dashboard Anda.`,
            type: 'order',
            relatedId: order.id,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'completed',
        laundryRevenue,
        deliveryFee,
      },
    })
  } catch (err) {
    console.error('[POST /api/buyer/orders/:id/complete]', err)
    return serverError()
  }
}
