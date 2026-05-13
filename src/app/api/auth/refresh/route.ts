import { prisma } from '@/lib/prisma'
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  getRefreshTokenFromCookie,
} from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/api-response'

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookie()
    if (!refreshToken) {
      return unauthorized('Refresh token tidak ditemukan')
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      await clearAuthCookies()
      return unauthorized('Refresh token tidak valid')
    }

    // Pastikan refresh token masih ada di DB dan belum expired
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })
    if (!dbToken || dbToken.expiresAt < new Date()) {
      await clearAuthCookies()
      return unauthorized('Refresh token sudah kadaluarsa')
    }

    // Rotasi: hapus refresh lama, buat yang baru
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      await clearAuthCookies()
      return unauthorized('User tidak ditemukan')
    }

    const newPayload = { userId: user.id, role: user.role, email: user.email }
    const newAccess = signAccessToken(newPayload)
    const newRefresh = signRefreshToken(newPayload)

    await prisma.refreshToken.delete({ where: { id: dbToken.id } })
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefresh,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    })

    await setAuthCookies(newAccess, newRefresh)

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
      token: newAccess,
    })
  } catch (err) {
    console.error('[POST /api/auth/refresh]', err)
    return serverError()
  }
}
