import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth'
import { badRequest, conflict, created, serverError } from '@/lib/api-response'

/**
 * Register driver accepts multipart/form-data karena ada upload foto KTP + SIM.
 * Untuk MVP, file upload di-handle dengan menyimpan nama file placeholder
 * (implementasi S3/Cloudinary di phase berikutnya).
 */

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(6),
  vehicleType: z.enum(['Motor', 'Mobil']),
  vehiclePlate: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const raw = Object.fromEntries(formData.entries())

    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      return badRequest('Data tidak valid', {
        _form: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      })
    }

    const d = parsed.data
    const ktpFile = formData.get('ktpPhoto') as File | null
    const simFile = formData.get('simPhoto') as File | null

    if (!ktpFile || !simFile) {
      return badRequest('Foto KTP dan SIM wajib diunggah')
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: d.email }, { phone: d.phone }] },
    })
    if (existing) {
      return conflict('Email atau nomor telepon sudah terdaftar')
    }

    const passwordHash = await hashPassword(d.password)

    // Placeholder untuk file upload — nanti simpan URL S3/Cloudinary
    const ktpPhotoUrl = `/uploads/ktp/${Date.now()}-${ktpFile.name}`
    const simPhotoUrl = `/uploads/sim/${Date.now()}-${simFile.name}`

    const user = await prisma.user.create({
      data: {
        email: d.email,
        phone: d.phone,
        passwordHash,
        role: 'driver',
        name: d.name,
        driver: {
          create: {
            fullName: d.name,
            ktpNumber: '', // TODO: tambahkan input di form
            ktpPhoto: ktpPhotoUrl,
            simNumber: '',
            simPhoto: simPhotoUrl,
            vehicleType: d.vehicleType === 'Motor' ? 'motorcycle' : 'car',
            vehiclePlate: d.vehiclePlate,
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
    console.error('[POST /api/auth/register/driver]', err)
    return serverError()
  }
}
