import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/api-response'

/**
 * GET /api/laundry
 * Query params:
 *   - q: search term (name/address)
 *   - minRating: filter minimum rating
 *   - isOpen: only show open laundries
 *
 * Jarak (distance) dihitung di client-side berdasarkan geolokasi pengguna.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const minRating = searchParams.get('minRating')
    const isOpenParam = searchParams.get('isOpen')

    const where: Record<string, unknown> = {}
    if (q) {
      where.OR = [
        { laundryName: { contains: q } },
        { address: { contains: q } },
      ]
    }
    if (minRating) {
      where.averageRating = { gte: parseFloat(minRating) }
    }
    if (isOpenParam === 'true') {
      where.isOpen = true
    }

    const sellers = await prisma.seller.findMany({
      where,
      include: {
        services: { where: { isActive: true } },
      },
      orderBy: { averageRating: 'desc' },
    })

    const laundries = sellers.map((s) => {
      const startingPrice =
        s.services.length > 0
          ? Math.min(...s.services.map((sv) => Number(sv.pricePerUnit)))
          : 0
      return {
        id: String(s.id),
        name: s.laundryName,
        address: s.address,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        photos: (s.photos as string[]) ?? [],
        averageRating: Number(s.averageRating),
        totalReviews: s.totalReviews,
        isOpen: s.isOpen,
        operatingHours: s.operatingHours,
        startingPrice,
        services: s.services.map((sv) => sv.serviceName),
      }
    })

    return ok(laundries)
  } catch (err) {
    console.error('[GET /api/laundry]', err)
    return serverError()
  }
}
