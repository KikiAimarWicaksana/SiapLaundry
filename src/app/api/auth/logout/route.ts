import { prisma } from '@/lib/prisma'
import { clearAuthCookies, getRefreshTokenFromCookie } from '@/lib/auth'
import { ok, serverError } from '@/lib/api-response'

export async function POST() {
  try {
    // Hapus refresh token dari DB supaya tidak bisa dipakai lagi
    const refreshToken = await getRefreshTokenFromCookie()
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }

    await clearAuthCookies()
    return ok({ loggedOut: true })
  } catch (err) {
    console.error('[POST /api/auth/logout]', err)
    // Clear cookies meskipun DB gagal
    await clearAuthCookies()
    return serverError()
  }
}
