import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from '@/lib/auth'
import { badRequest, ok, serverError, unauthorized } from '@/lib/api-response'

const loginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(['buyer', 'seller', 'driver']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest('Data tidak valid', {
        _form: parsed.error.issues.map((i) => i.message),
      })
    }

    const { emailOrPhone, password, role } = parsed.data

    // Cari user berdasarkan email ATAU phone + role
    const user = await prisma.user.findFirst({
      where: {
        role,
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    })

    if (!user) {
      return unauthorized('Email/telepon atau password salah')
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return unauthorized('Email/telepon atau password salah')
    }

    const payload = { userId: user.id, role: user.role, email: user.email }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    // Simpan refresh token di DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    })

    await setAuthCookies(accessToken, refreshToken)

    return ok({
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
    console.error('[POST /api/auth/login]', err)
    return serverError()
  }
}
