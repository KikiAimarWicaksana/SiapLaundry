import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth'
import { badRequest, conflict, created, serverError } from '@/lib/api-response'
import { saveUploadedFile } from '@/lib/upload'

/**
 * Register seller accepts multipart/form-data (karena ada upload foto laundry optional).
 * Untuk MVP, foto laundry di-skip dulu — file upload dihandle terpisah.
 */

const schema = z.object({
  laundryName: z.string().min(1),
  ownerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  address: z.string().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  operatingHours: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let raw: Record<string, unknown>
    let photoFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      raw = Object.fromEntries(
        [...formData.entries()].filter(([, v]) => typeof v === 'string')
      )
      const photo = formData.get('photo')
      if (photo instanceof File && photo.size > 0) {
        photoFile = photo
      }
    } else {
      raw = await request.json()
    }

    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      return badRequest('Data tidak valid', {
        _form: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      })
    }

    const d = parsed.data

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: d.email }, { phone: d.phone }] },
    })
    if (existing) {
      return conflict('Email atau nomor telepon sudah terdaftar')
    }

    const passwordHash = await hashPassword(d.password)

    // Simpan foto jika ada
    let photos: string[] = []
    if (photoFile) {
      try {
        const photoPath = await saveUploadedFile(photoFile, 'laundry')
        photos = [photoPath]
      } catch {
        // Lanjut tanpa foto jika gagal
      }
    }

    const user = await prisma.user.create({
      data: {
        email: d.email,
        phone: d.phone,
        passwordHash,
        role: 'seller',
        name: d.ownerName,
        seller: {
          create: {
            laundryName: d.laundryName,
            ownerName: d.ownerName,
            businessEmail: d.email,
            address: d.address,
            latitude: d.latitude,
            longitude: d.longitude,
            photos: photos.length > 0 ? photos : undefined,
            operatingHours: { raw: d.operatingHours },
          },
        },
      },
    })

    const payload = { userId: user.id, role: user.role, email: user.email }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    })

    await setAuthCookies(accessToken, refreshToken)

    return created({
      user: {
        id: String(user.id),
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
      },
      token: accessToken,
    })
  } catch (err) {
    console.error('[POST /api/auth/register/seller]', err)
    return serverError()
  }
}
