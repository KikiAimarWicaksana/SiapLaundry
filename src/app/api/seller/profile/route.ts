import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, badRequest, serverError, ok } from '@/lib/api-response'
import { saveUploadedFile } from '@/lib/upload'

const updateSchema = z.object({
  laundryName: z.string().min(1).max(100).optional(),
  address: z.string().min(1).max(300).optional(),
  phone: z.string().min(10).max(15).optional(),
  operatingHoursOpen: z.string().optional(),
  operatingHoursClose: z.string().optional(),
  isOpen: z.coerce.boolean().optional(),
})

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({
      where: { userId: authUser.userId },
      include: { user: { select: { phone: true, name: true, email: true } } },
    })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const hours = seller.operatingHours as Record<string, string> | null
    const rawHours = (hours as { raw?: string })?.raw ?? ''

    return NextResponse.json({
      success: true,
      data: {
        laundryName: seller.laundryName,
        ownerName: seller.ownerName,
        address: seller.address,
        phone: seller.user.phone,
        email: seller.user.email,
        isOpen: seller.isOpen,
        photos: (seller.photos as string[]) ?? [],
        operatingHours: rawHours,
        averageRating: Number(seller.averageRating),
        totalReviews: seller.totalReviews,
      },
    })
  } catch (err) {
    console.error('[GET /api/seller/profile]', err)
    return serverError()
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const contentType = request.headers.get('content-type') ?? ''
    let raw: Record<string, unknown> = {}
    let photoFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') raw[key] = value
        else if (value instanceof File && value.size > 0) photoFile = value
      }
    } else {
      raw = await request.json()
    }

    const parsed = updateSchema.safeParse(raw)
    if (!parsed.success) return badRequest('Data tidak valid')

    const { laundryName, address, phone, operatingHoursOpen, operatingHoursClose, isOpen } = parsed.data

    // Upload foto baru ke Cloudinary jika ada
    let photos = (seller.photos as string[]) ?? []
    if (photoFile) {
      const url = await saveUploadedFile(photoFile, 'laundry')
      photos = [url, ...photos].slice(0, 5) // max 5 foto
    }

    // Update seller
    const updateData: Record<string, unknown> = { photos }
    if (laundryName) updateData.laundryName = laundryName
    if (address) updateData.address = address
    if (isOpen !== undefined) updateData.isOpen = isOpen
    if (operatingHoursOpen || operatingHoursClose) {
      const existing = (seller.operatingHours as { raw?: string })?.raw ?? ''
      updateData.operatingHours = {
        raw: operatingHoursOpen && operatingHoursClose
          ? `${operatingHoursOpen} - ${operatingHoursClose}`
          : existing,
      }
    }

    await prisma.seller.update({ where: { id: seller.id }, data: updateData })

    // Update phone di user jika berubah
    if (phone) {
      await prisma.user.update({ where: { id: authUser.userId }, data: { phone } })
    }

    return ok({ message: 'Profil berhasil diperbarui', photos })
  } catch (err) {
    console.error('[PATCH /api/seller/profile]', err)
    return serverError()
  }
}
