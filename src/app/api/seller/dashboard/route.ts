import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api-response'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') {
      return unauthorized('Akses ditolak')
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: authUser.userId },
    })

    if (!seller) {
      return unauthorized('Seller tidak ditemukan')
    }

    // Hitung bulan ini
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Total order bulan ini
    const totalOrders = await prisma.order.count({
      where: {
        sellerId: seller.id,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    // Pendapatan bulan ini (dari order completed)
    const revenueResult = await prisma.order.aggregate({
      where: {
        sellerId: seller.id,
        status: 'completed',
        completedAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { totalPrice: true },
    })
    const revenue = Number(revenueResult._sum.totalPrice ?? 0)

    // Order baru (pending_pickup)
    const newOrders = await prisma.order.count({
      where: {
        sellerId: seller.id,
        status: 'pending_pickup',
      },
    })

    // 5 order terbaru
    const recentOrders = await prisma.order.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        buyer: { include: { user: { select: { name: true } } } },
        service: { select: { serviceName: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          revenue,
          averageRating: Number(seller.averageRating),
          newOrders,
        },
        recentOrders: recentOrders.map((o) => ({
          id: String(o.id),
          orderNumber: o.orderNumber,
          buyerName: o.buyer.user.name,
          service: o.service.serviceName,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        })),
      },
    })
  } catch (err) {
    console.error('[GET /api/seller/dashboard]', err)
    return serverError()
  }
}
