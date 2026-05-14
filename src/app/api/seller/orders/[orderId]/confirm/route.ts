import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'

const schema = z.object({
  action: z.enum(['accept', 'reject']),
  rejectReason: z.string().optional(),
})

/** Haversine distance in km */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const { orderId } = await params
    const order = await prisma.order.findFirst({
      where: { id: Number(orderId), sellerId: seller.id, status: 'pending_confirmation' },
    })
    if (!order) return notFound('Order tidak ditemukan atau sudah diproses')

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const { action, rejectReason } = parsed.data

    if (action === 'reject') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'cancelled',
          statusHistory: { create: { status: 'cancelled', notes: rejectReason ?? 'Ditolak oleh seller', createdBy: authUser.userId } },
        },
      })
      // Notifikasi ke buyer
      await prisma.notification.create({
        data: {
          userId: (await prisma.buyer.findUnique({ where: { id: order.buyerId } }))!.userId,
          title: 'Pesanan Ditolak',
          message: `Maaf, pesanan #${order.orderNumber} ditolak oleh laundry. ${rejectReason ?? ''}`,
          type: 'order',
          relatedId: order.id,
        },
      })
      return NextResponse.json({ success: true, data: { status: 'cancelled' } })
    }

    // ACC — cari kurir terdekat yang online
    // Prioritas: kurir yang punya koordinat (terdekat), fallback: kurir online manapun
    const driversWithLocation = await prisma.driver.findMany({
      where: { isOnline: true, currentLatitude: { not: null }, currentLongitude: { not: null } },
    })

    let nearestDriverId: number | null = null
    let minDist = Infinity

    if (driversWithLocation.length > 0) {
      for (const d of driversWithLocation) {
        const dist = haversine(
          Number(order.pickupLatitude), Number(order.pickupLongitude),
          Number(d.currentLatitude), Number(d.currentLongitude)
        )
        if (dist < minDist) { minDist = dist; nearestDriverId = d.id }
      }
    } else {
      // Fallback: ambil kurir online manapun
      const anyDriver = await prisma.driver.findFirst({ where: { isOnline: true } })
      if (anyDriver) { nearestDriverId = anyDriver.id; minDist = 0 }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'confirmed',
        pickupDriverId: nearestDriverId ?? undefined,
        statusHistory: { create: { status: 'confirmed', notes: 'Diterima oleh seller', createdBy: authUser.userId } },
      },
    })

    // Notifikasi ke buyer
    const buyer = await prisma.buyer.findUnique({ where: { id: order.buyerId } })
    if (buyer) {
      const pickupDate = order.pickupDate.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
      const timeSlotLabel: Record<string, string> = {
        morning: 'Pagi (08:00 - 12:00)',
        afternoon: 'Siang (12:00 - 15:00)',
        evening: 'Sore (15:00 - 18:00)',
      }
      await prisma.notification.create({
        data: {
          userId: buyer.userId,
          title: 'Pesanan Diterima ✓',
          message: `Pesanan #${order.orderNumber} diterima oleh ${seller.laundryName}! Kurir akan menjemput pada ${pickupDate}, ${timeSlotLabel[order.pickupTimeSlot] ?? order.pickupTimeSlot}.`,
          type: 'order',
          relatedId: order.id,
        },
      })
    }

    // Notifikasi ke driver dengan detail jadwal lengkap
    if (nearestDriverId) {
      const driver = await prisma.driver.findUnique({ where: { id: nearestDriverId } })
      if (driver) {
        const pickupDate = order.pickupDate.toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
        const timeSlotLabel: Record<string, string> = {
          morning: 'Pagi (08:00 - 12:00)',
          afternoon: 'Siang (12:00 - 15:00)',
          evening: 'Sore (15:00 - 18:00)',
        }
        const distText = minDist > 0 ? ` • Jarak: ${minDist.toFixed(1)} km` : ''
        await prisma.notification.create({
          data: {
            userId: driver.userId,
            title: '📦 Jadwal Pickup Baru',
            message: `Order #${order.orderNumber}\n📅 ${pickupDate}\n⏰ ${timeSlotLabel[order.pickupTimeSlot] ?? order.pickupTimeSlot}\n📍 ${order.pickupAddress}${distText}\n🏪 Antar ke: ${seller.laundryName}`,
            type: 'order',
            relatedId: order.id,
          },
        })
      }
    }

    return NextResponse.json({ success: true, data: { status: 'confirmed', driverAssigned: !!nearestDriverId } })
  } catch (err) {
    console.error('[POST /api/seller/orders/:id/confirm]', err)
    return serverError()
  }
}
