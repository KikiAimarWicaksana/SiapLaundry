import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api-response'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'driver') return unauthorized('Akses ditolak')

    const driver = await prisma.driver.findUnique({ where: { userId: authUser.userId } })
    if (!driver) return unauthorized('Driver tidak ditemukan')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    // Order hari ini (sebagai pickup atau delivery driver)
    const ordersToday = await prisma.order.count({
      where: {
        OR: [{ pickupDriverId: driver.id }, { deliveryDriverId: driver.id }],
        createdAt: { gte: today, lt: tomorrow },
      },
    })

    // Pendapatan bulan ini (dari delivery fee order completed)
    const deliveriesResult = await prisma.order.aggregate({
      where: {
        OR: [{ pickupDriverId: driver.id }, { deliveryDriverId: driver.id }],
        status: 'completed',
        completedAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { deliveryFee: true },
      _count: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        isOnline: driver.isOnline,
        ordersToday,
        totalDeliveries: driver.totalDeliveries,
        monthlyEarnings: Number(deliveriesResult._sum.deliveryFee ?? 0),
        averageRating: Number(driver.averageRating),
      },
    })
  } catch (err) {
    console.error('[GET /api/driver/dashboard]', err)
    return serverError()
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'driver') return unauthorized('Akses ditolak')

    const driver = await prisma.driver.findUnique({ where: { userId: authUser.userId } })
    if (!driver) return unauthorized('Driver tidak ditemukan')

    const body = await request.json()
    const { isOnline, currentLatitude, currentLongitude } = body

    const updateData: Record<string, unknown> = {}
    if (isOnline !== undefined) updateData.isOnline = Boolean(isOnline)
    if (currentLatitude !== undefined) updateData.currentLatitude = currentLatitude === null ? null : Number(currentLatitude)
    if (currentLongitude !== undefined) updateData.currentLongitude = currentLongitude === null ? null : Number(currentLongitude)

    await prisma.driver.update({
      where: { id: driver.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: { isOnline: updateData.isOnline ?? driver.isOnline } })
  } catch (err) {
    console.error('[PATCH /api/driver/dashboard]', err)
    return serverError()
  }
}
