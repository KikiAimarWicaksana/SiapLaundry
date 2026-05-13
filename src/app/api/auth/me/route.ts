import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/api-response'

export async function GET() {
  try {
    const payload = await getAuthUser()
    if (!payload) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })
    if (!user) return unauthorized()

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
    })
  } catch (err) {
    console.error('[GET /api/auth/me]', err)
    return serverError()
  }
}
