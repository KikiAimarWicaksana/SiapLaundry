import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api-response'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const reviews = await prisma.review.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { include: { user: { select: { name: true } } } },
        order: { include: { service: { select: { serviceName: true } } } },
      },
    })

    // Rating breakdown
    const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.laundryRating === stars).length,
    }))

    return NextResponse.json({
      success: true,
      data: {
        averageRating: Number(seller.averageRating),
        totalReviews: seller.totalReviews,
        breakdown,
        reviews: reviews.map((r) => ({
          id: String(r.id),
          buyerName: r.buyer.user.name,
          rating: r.laundryRating ?? 0,
          comment: r.laundryReview ?? '',
          serviceName: r.order.service.serviceName,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    })
  } catch (err) {
    console.error('[GET /api/seller/reviews]', err)
    return serverError()
  }
}
