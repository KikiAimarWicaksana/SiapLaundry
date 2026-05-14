import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api-response'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorized('Akses ditolak')

    const notifications = await prisma.notification.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    return NextResponse.json({
      success: true,
      data: notifications.map((n) => ({
        id: String(n.id),
        title: n.title,
        message: n.message,
        type: n.type,
        relatedId: n.relatedId ? String(n.relatedId) : null,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error('[GET /api/notifications]', err)
    return serverError()
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorized('Akses ditolak')

    const body = await request.json()
    const { id, markAll } = body

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: authUser.userId, isRead: false },
        data: { isRead: true },
      })
    } else if (id) {
      await prisma.notification.update({
        where: { id: Number(id) },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/notifications]', err)
    return serverError()
  }
}
