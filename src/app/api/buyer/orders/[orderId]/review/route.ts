import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, badRequest, conflict, serverError } from '@/lib/api-response'
import { saveUploadedFile } from '@/lib/upload'

const reviewSchema = z.object({
  laundryRating: z.coerce.number().int().min(1).max(5),
  laundryReview: z.string().max(1000).optional(),
  driverRating: z.coerce.number().int().min(1).max(5).optional(),
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
      where: { id: Number(orderId), buyerId: buyer.id, status: 'completed' },
    })
    if (!order) return notFound('Order tidak ditemukan atau belum selesai')

    // Cek sudah pernah review
    const existing = await prisma.review.findUnique({ where: { orderId: order.id } })
    if (existing) return conflict('Ulasan sudah pernah diberikan')

    const contentType = request.headers.get('content-type') ?? ''
    let raw: Record<string, unknown> = {}
    const photoFiles: File[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') raw[key] = value
        else if (value instanceof File && value.size > 0) photoFiles.push(value)
      }
    } else {
      raw = await request.json()
    }

    const parsed = reviewSchema.safeParse(raw)
    if (!parsed.success) return badRequest('Data tidak valid')

    const { laundryRating, laundryReview, driverRating } = parsed.data

    // Upload foto jika ada
    const photoUrls: string[] = []
    for (const file of photoFiles) {
      try {
        const url = await saveUploadedFile(file, 'reviews')
        photoUrls.push(url)
      } catch { /* skip */ }
    }

    // Buat review
    await prisma.review.create({
      data: {
        orderId: order.id,
        buyerId: buyer.id,
        sellerId: order.sellerId,
        laundryRating,
        laundryReview: laundryReview ?? null,
        driverId: driverRating && order.deliveryDriverId ? order.deliveryDriverId : null,
        driverRating: driverRating ?? null,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      },
    })

    // Update averageRating seller
    const sellerReviews = await prisma.review.findMany({
      where: { sellerId: order.sellerId, laundryRating: { not: null } },
      select: { laundryRating: true },
    })
    const avgRating = sellerReviews.reduce((sum, r) => sum + (r.laundryRating ?? 0), 0) / sellerReviews.length
    await prisma.seller.update({
      where: { id: order.sellerId },
      data: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: sellerReviews.length,
      },
    })

    // Update averageRating driver jika ada
    if (driverRating && order.deliveryDriverId) {
      const driverReviews = await prisma.review.findMany({
        where: { driverId: order.deliveryDriverId, driverRating: { not: null } },
        select: { driverRating: true },
      })
      const avgDriverRating = driverReviews.reduce((sum, r) => sum + (r.driverRating ?? 0), 0) / driverReviews.length
      await prisma.driver.update({
        where: { id: order.deliveryDriverId },
        data: { averageRating: Math.round(avgDriverRating * 10) / 10 },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/buyer/orders/:id/review]', err)
    return serverError()
  }
}
