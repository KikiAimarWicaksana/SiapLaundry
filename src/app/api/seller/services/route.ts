import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, badRequest, serverError, ok } from '@/lib/api-response'

const serviceSchema = z.object({
  serviceName: z.string().min(1).max(100),
  pricePerUnit: z.number().int().min(1000),
  unit: z.enum(['kg', 'pcs']),
  estimatedDurationDays: z.number().int().min(1).max(14),
  description: z.string().max(500).optional(),
})

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const services = await prisma.service.findMany({
      where: { sellerId: seller.id, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: services.map((s) => ({
        id: String(s.id),
        serviceName: s.serviceName,
        pricePerUnit: Number(s.pricePerUnit),
        unit: s.unit,
        estimatedDurationDays: s.estimatedDurationDays,
        description: s.description ?? undefined,
        isActive: s.isActive,
      })),
    })
  } catch (err) {
    console.error('[GET /api/seller/services]', err)
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const body = await request.json()
    const parsed = serviceSchema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const service = await prisma.service.create({
      data: {
        sellerId: seller.id,
        ...parsed.data,
      },
    })

    return ok({
      id: String(service.id),
      serviceName: service.serviceName,
      pricePerUnit: Number(service.pricePerUnit),
      unit: service.unit,
      estimatedDurationDays: service.estimatedDurationDays,
      description: service.description ?? undefined,
      isActive: service.isActive,
    })
  } catch (err) {
    console.error('[POST /api/seller/services]', err)
    return serverError()
  }
}
