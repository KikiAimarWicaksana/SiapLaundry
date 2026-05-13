import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, badRequest, notFound, serverError, ok } from '@/lib/api-response'

const updateSchema = z.object({
  serviceName: z.string().min(1).max(100).optional(),
  pricePerUnit: z.number().int().min(1000).optional(),
  unit: z.enum(['kg', 'pcs']).optional(),
  estimatedDurationDays: z.number().int().min(1).max(14).optional(),
  description: z.string().max(500).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const { serviceId } = await params
    const service = await prisma.service.findFirst({
      where: { id: Number(serviceId), sellerId: seller.id },
    })
    if (!service) return notFound('Layanan tidak ditemukan')

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const updated = await prisma.service.update({
      where: { id: Number(serviceId) },
      data: parsed.data,
    })

    return ok({
      id: String(updated.id),
      serviceName: updated.serviceName,
      pricePerUnit: Number(updated.pricePerUnit),
      unit: updated.unit,
      estimatedDurationDays: updated.estimatedDurationDays,
      description: updated.description ?? undefined,
      isActive: updated.isActive,
    })
  } catch (err) {
    console.error('[PATCH /api/seller/services/:id]', err)
    return serverError()
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const { serviceId } = await params
    const service = await prisma.service.findFirst({
      where: { id: Number(serviceId), sellerId: seller.id },
    })
    if (!service) return notFound('Layanan tidak ditemukan')

    // Soft delete — set isActive = false
    await prisma.service.update({
      where: { id: Number(serviceId) },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/seller/services/:id]', err)
    return serverError()
  }
}
