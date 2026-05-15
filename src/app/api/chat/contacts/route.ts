import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api-response'

/**
 * GET /api/chat/contacts
 * Mengambil daftar kontak chat terbaru untuk user, 
 * termasuk pesan terakhir dan jumlah pesan belum dibaca.
 */
export async function GET(_req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorized('Akses ditolak')

    // 1. Ambil ID internal untuk masing-masing role user ini
    const [buyer, seller, driver] = await Promise.all([
      prisma.buyer.findUnique({ where: { userId: authUser.userId } }),
      prisma.seller.findUnique({ where: { userId: authUser.userId } }),
      prisma.driver.findUnique({ where: { userId: authUser.userId } }),
    ])

    // 2. Ambil semua order di mana user terlibat (menggunakan ID internal)
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: buyer?.id ?? -1 },
          { sellerId: seller?.id ?? -1 },
          { pickupDriverId: driver?.id ?? -1 },
          { deliveryDriverId: driver?.id ?? -1 },
        ],
      },
      include: {
        buyer: { include: { user: { select: { id: true, name: true, profilePhoto: true } } } },
        seller: { include: { user: { select: { id: true, name: true, profilePhoto: true } } } },
        pickupDriver: { include: { user: { select: { id: true, name: true, profilePhoto: true } } } },
        deliveryDriver: { include: { user: { select: { id: true, name: true, profilePhoto: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const contactMap = new Map<number, any>()

    for (const order of orders) {
      const participants: any[] = [
        { role: 'buyer', user: order.buyer.user, originalRole: 'buyer' },
        { role: 'seller', user: order.seller.user, originalRole: 'seller' },
      ]
      
      if (order.pickupDriver) participants.push({ role: 'driver', user: order.pickupDriver.user, originalRole: 'driver' })
      if (order.deliveryDriver) participants.push({ role: 'driver', user: order.deliveryDriver.user, originalRole: 'driver' })

      const others = participants.filter(p => p.user && p.user.id !== authUser.userId)

      // Cek apakah order ini aktif untuk user yang sedang login
      const userRole = String(authUser.role).toLowerCase();
      const isOrderActiveForChat = (role: string, status: string) => {
        if (role === 'buyer' || role === 'seller') return true;
        // Kurir bisa lihat chat untuk semua order yang ditugaskan (kecuali batal)
        return status !== 'cancelled';
      };

      if (!isOrderActiveForChat(userRole, order.status)) continue;

      for (const other of others) {
        if (!other.user) continue;

        // Jika orang lain adalah kurir, pelanggan/mitra hanya bisa lihat jika sudah "Mulai"
        if (other.role === 'driver') {
            const driverVisibleToOthers = [
              'driver_on_way_pickup', 'picked_up', 'at_laundry', 
              'payment_pending', 'washing', 'ready_for_delivery',
              'driver_on_way_delivery', 'delivered', 'completed'
            ];
            if (!driverVisibleToOthers.includes(order.status)) continue;
        }

        // Jika sudah ada kontak untuk user ini, kita mungkin mau update jika order ini lebih baru
        // Tapi kita perlu last message per private channel (orderId + otherId)
        // Karena sistem kita sekarang private channel per order, kita tampilkan satu entri per ORANG.
        // Kita ambil pesan terakhir antara authUser dan other.user.id di order MANAPUN yang terbaru.
        
        if (!contactMap.has(other.user.id)) {
            // Ambil pesan terakhir untuk user pair ini (di semua order atau order tertentu?)
            // Berdasarkan request user sebelumnya: "satu akun saja". 
            // Jadi kita cari pesan terakhir antara dua user ini di database.
            const lastMsg = await prisma.chatMessage.findFirst({
                where: {
                    OR: [
                        { senderId: authUser.userId, receiverId: other.user.id },
                        { senderId: other.user.id, receiverId: authUser.userId },
                    ]
                },
                orderBy: { createdAt: 'desc' },
            })

            const unreadCount = await prisma.chatMessage.count({
                where: {
                    senderId: other.user.id,
                    receiverId: authUser.userId,
                    isRead: false
                }
            })

            const sellerPhotos = order.seller.photos as any[];
            const avatar = other.role === 'seller' 
                ? (Array.isArray(sellerPhotos) ? sellerPhotos[0] : undefined)
                : other.user.profilePhoto;

            contactMap.set(other.user.id, {
                id: String(other.user.id),
                name: other.role === 'driver' ? `${other.user.name} (Kurir)` : (other.role === 'seller' ? order.seller.laundryName : other.user.name),
                role: other.role,
                avatar,
                isOnline: false,
                lastMessage: lastMsg?.message ?? "",
                lastMessageTime: lastMsg ? formatTime(lastMsg.createdAt) : "",
                unreadCount,
                orderId: String(order.id),
                receiverUserId: other.user.id,
                orderStatus: order.status,
                completedAt: order.completedAt?.toISOString() || null,
                _timestamp: lastMsg?.createdAt || order.createdAt
            })
        }
      }
    }

    const result = Array.from(contactMap.values()).sort((a, b) => b._timestamp.getTime() - a._timestamp.getTime())

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[GET /api/chat/contacts]', err)
    return serverError()
  }
}

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
