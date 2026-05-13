import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth'
import { badRequest, conflict, created, serverError } from '@/lib/api-response'

const schema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return badRequest('Data tidak valid', {
        _form: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      })
    }

    const { name, email, phone, password, address, latitude, longitude } = parsed.data

    // Cek duplikasi
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    })
    if (existing) {
      return conflict('Email atau nomor telepon sudah terdaftar')
    }

    const passwordHash = await hashPassword(password)

    // Buat user + buyer profile dalam 1 transaksi
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: 'buyer',
        name,
        buyer: {
          create: {
            fullName: name,
            addresses: [
              {
                address_line: address,
                latitude,
                longitude,
                is_default: true,
              },
            ],
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
    console.error('[POST /api/auth/register/buyer]', err)
    return serverError()
  }
}
