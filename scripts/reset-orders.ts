import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ Menghapus seluruh data pesanan...')

  try {
    // 1. Hapus Notifikasi terkait order (biasanya menggunakan relatedId)
    // Karena onDelete Cascade tidak berlaku otomatis untuk field generic like relatedId
    await prisma.notification.deleteMany({
      where: { type: 'order' }
    })

    // 2. Hapus Chat Messages (sudah cascade, tapi deleteMany lebih cepat jika mau eksplisit)
    await prisma.chatMessage.deleteMany({})

    // 3. Hapus Reviews (sudah cascade)
    await prisma.review.deleteMany({})

    // 4. Hapus Status History (sudah cascade)
    await prisma.orderStatusHistory.deleteMany({})

    // 5. Hapus Orders
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`✅ Berhasil menghapus ${deletedOrders.count} pesanan.`)

    // 6. Reset counter di Seller & Driver
    await prisma.seller.updateMany({
      data: { totalOrders: 0 }
    })
    await prisma.driver.updateMany({
      data: { totalDeliveries: 0 }
    })
    console.log('✅ Berhasil meriset counter pesanan pada Seller dan Driver.')

  } catch (error) {
    console.error('❌ Gagal menghapus data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
