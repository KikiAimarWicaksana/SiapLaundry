import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'

const sendSchema = z.object({
  message: z.string().min(1).max(2000),
  receiverId: z.number().int().positive(),
})

/** GET /api/chat/[orderId] — ambil semua pesan untuk order ini */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorized('Akses ditolak')

    const { orderId } = await params

    // Pastikan user terlibat dalam order ini
    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        OR: [
          { buyer: { userId: authUser.userId } },
          { seller: { userId: authUser.userId } },
          { pickupDriver: { userId: authUser.userId } },
          { deliveryDriver: { userId: authUser.userId } },
        ],
      },
    })
    if (!order) return notFound('Order tidak ditemukan')

    const { searchParams } = new URL(_req.url)
    const otherId = searchParams.get('receiverId') ? Number(searchParams.get('receiverId')) : null

    const messages = await prisma.chatMessage.findMany({
      where: { 
        orderId: Number(orderId),
        ...(otherId ? {
          OR: [
            { senderId: authUser.userId, receiverId: otherId },
            { senderId: otherId, receiverId: authUser.userId },
          ]
        } : {})
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } },
      },
    })

    // Tandai pesan yang diterima sebagai sudah dibaca
    await prisma.chatMessage.updateMany({
      where: { orderId: Number(orderId), receiverId: authUser.userId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      data: messages.map((m) => ({
        id: String(m.id),
        senderId: String(m.senderId),
        senderName: m.sender.name,
        senderAvatar: m.sender.profilePhoto ?? undefined,
        content: m.message,
        timestamp: m.createdAt.toISOString(),
        isRead: m.isRead,
      })),
    })
  } catch (err) {
    console.error('[GET /api/chat/:orderId]', err)
    return serverError()
  }
}

/** POST /api/chat/[orderId] — kirim pesan */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorized('Akses ditolak')

    const { orderId } = await params
    const body = await request.json()
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const { message, receiverId } = parsed.data

    // Pastikan user terlibat dalam order ini
    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        OR: [
          { buyer: { userId: authUser.userId } },
          { seller: { userId: authUser.userId } },
          { pickupDriver: { userId: authUser.userId } },
          { deliveryDriver: { userId: authUser.userId } },
        ],
      },
    })
    if (!order) return notFound('Order tidak ditemukan')

    const chat = await prisma.chatMessage.create({
      data: {
        orderId: Number(orderId),
        senderId: authUser.userId,
        receiverId,
        message,
      },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } },
      },
    })

    // Kirim notifikasi ke penerima
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: `Pesan dari ${chat.sender.name}`,
        message: message.length > 80 ? message.slice(0, 80) + '...' : message,
        type: 'chat',
        relatedId: Number(orderId),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: String(chat.id),
        senderId: String(chat.senderId),
        senderName: chat.sender.name,
        senderAvatar: chat.sender.profilePhoto ?? undefined,
        content: chat.message,
        timestamp: chat.createdAt.toISOString(),
        isRead: false,
      },
    })
  } catch (err) {
    console.error('[POST /api/chat/:orderId]', err)
    return serverError()
  }
}
