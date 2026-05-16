import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ Menghapus seluruh data pesanan, chat, dan ulasan...')

  try {
    // 1. Hapus Notifikasi terkait order, chat, dan review
    const deletedNotifs = await prisma.notification.deleteMany({
      where: {
        type: {
          in: ['order', 'chat', 'review'],
        },
      },
    })
    console.log(`✅ Berhasil menghapus ${deletedNotifs.count} notifikasi terkait pesanan/chat/ulasan.`)

    // 2. Hapus Chat Messages
    const deletedChats = await prisma.chatMessage.deleteMany({})
    console.log(`✅ Berhasil menghapus ${deletedChats.count} pesan chat.`)

    // 3. Hapus Reviews
    const deletedReviews = await prisma.review.deleteMany({})
    console.log(`✅ Berhasil menghapus ${deletedReviews.count} ulasan.`)

    // 4. Hapus Status History
    const deletedStatus = await prisma.orderStatusHistory.deleteMany({})
    console.log(`✅ Berhasil menghapus ${deletedStatus.count} riwayat status pesanan.`)

    // 5. Hapus Orders
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`✅ Berhasil menghapus ${deletedOrders.count} pesanan.`)

    // 6. Reset counter di Seller & Driver
    await prisma.seller.updateMany({
      data: {
        totalOrders: 0,
        totalReviews: 0,
        averageRating: 0,
      },
    })
    await prisma.driver.updateMany({
      data: {
        totalDeliveries: 0,
        averageRating: 0,
      },
    })
    console.log('✅ Berhasil meriset counter pesanan dan ulasan pada Seller dan Driver.')

  } catch (error) {
    console.error('❌ Gagal menghapus data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
