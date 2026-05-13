import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, notFound, serverError, badRequest } from '@/lib/api-response'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const sellerId = parseInt(id, 10)
    if (isNaN(sellerId)) return badRequest('ID laundry tidak valid')

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        services: { where: { isActive: true } },
        reviews: {
          include: {
            buyer: { select: { fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!seller) return notFound('Laundry tidak ditemukan')

    return ok({
      id: String(seller.id),
      laundryName: seller.laundryName,
      ownerName: seller.ownerName,
      address: seller.address,
      latitude: Number(seller.latitude),
      longitude: Number(seller.longitude),
      photos: (seller.photos as string[]) ?? [],
      operatingHours: seller.operatingHours,
      isOpen: seller.isOpen,
      averageRating: Number(seller.averageRating),
      totalReviews: seller.totalReviews,
      services: seller.services.map((s) => ({
        id: String(s.id),
        sellerId: String(s.sellerId),
        serviceName: s.serviceName,
        pricePerUnit: Number(s.pricePerUnit),
        unit: s.unit,
        estimatedDurationDays: s.estimatedDurationDays,
        description: s.description,
        isActive: s.isActive,
      })),
      reviews: seller.reviews.map((r) => ({
        id: String(r.id),
        buyerName: r.buyer.fullName,
        rating: r.laundryRating ?? 0,
        comment: r.laundryReview ?? '',
        photos: (r.photos as string[]) ?? [],
        createdAt: r.createdAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error('[GET /api/laundry/[id]]', err)
    return serverError()
  }
}
