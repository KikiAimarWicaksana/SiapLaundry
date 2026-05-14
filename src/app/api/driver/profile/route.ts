import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, serverError, ok } from '@/lib/api-response'

const updateSchema = z.object({
  vehiclePlate: z.string().min(1).max(20).optional(),
  phone: z.string().min(10).max(15).optional(),
})

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'driver') return unauthorized('Akses ditolak')

    const driver = await prisma.driver.findUnique({
      where: { userId: authUser.userId },
      include: { user: { select: { name: true, email: true, phone: true, createdAt: true } } },
    })
    if (!driver) return unauthorized('Driver tidak ditemukan')

    return NextResponse.json({
      success: true,
      data: {
        name: driver.user.name,
        email: driver.user.email,
        phone: driver.user.phone,
        vehicleType: driver.vehicleType,
        vehiclePlate: driver.vehiclePlate,
        averageRating: Number(driver.averageRating),
        totalDeliveries: driver.totalDeliveries,
        isOnline: driver.isOnline,
        joinedDate: driver.user.createdAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      },
    })
  } catch (err) {
    console.error('[GET /api/driver/profile]', err)
    return serverError()
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'driver') return unauthorized('Akses ditolak')

    const driver = await prisma.driver.findUnique({ where: { userId: authUser.userId } })
    if (!driver) return unauthorized('Driver tidak ditemukan')

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return unauthorized('Data tidak valid')

    if (parsed.data.vehiclePlate) {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { vehiclePlate: parsed.data.vehiclePlate },
      })
    }
    if (parsed.data.phone) {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: { phone: parsed.data.phone },
      })
    }

    return ok({ message: 'Profil berhasil diperbarui' })
  } catch (err) {
    console.error('[PATCH /api/driver/profile]', err)
    return serverError()
  }
}
