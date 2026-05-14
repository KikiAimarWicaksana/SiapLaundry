import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, badRequest, serverError, ok } from '@/lib/api-response'

const createOrderSchema = z.object({
  sellerId: z.string().min(1),
  serviceId: z.string().min(1),
  pickupAddress: z.string().min(1),
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
  pickupDate: z.string().min(1),
  pickupTimeSlot: z.enum(['morning', 'afternoon', 'evening']),
  estimatedWeight: z.number().positive(),
  buyerNotes: z.string().optional(),
})

function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `SL${date}${rand}`
}

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'buyer') return unauthorized('Akses ditolak')

    const buyer = await prisma.buyer.findUnique({ where: { userId: authUser.userId } })
    if (!buyer) return unauthorized('Buyer tidak ditemukan')

    const orders = await prisma.order.findMany({
      where: { buyerId: buyer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { laundryName: true, photos: true } },
        service: { select: { serviceName: true, pricePerUnit: true, unit: true } },
        pickupDriver: { include: { user: { select: { name: true, phone: true } } } },
        deliveryDriver: { include: { user: { select: { name: true, phone: true } } } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json({
      success: true,
      data: orders.map((o) => ({
        id: String(o.id),
        orderNumber: o.orderNumber,
        buyerId: String(o.buyerId),
        seller: {
          id: String(o.sellerId),
          laundryName: o.seller.laundryName,
          photos: (o.seller.photos as string[]) ?? [],
        },
        service: {
          id: String(o.serviceId),
          serviceName: o.service.serviceName,
          pricePerUnit: Number(o.service.pricePerUnit),
          unit: o.service.unit,
        },
        pickupAddress: o.pickupAddress,
        pickupLatitude: Number(o.pickupLatitude),
        pickupLongitude: Number(o.pickupLongitude),
        pickupDate: o.pickupDate.toISOString().split('T')[0],
        pickupTimeSlot: o.pickupTimeSlot,
        pickupDriver: o.pickupDriver
          ? { id: String(o.pickupDriver.id), name: o.pickupDriver.user.name, phone: o.pickupDriver.user.phone, vehiclePlate: o.pickupDriver.vehiclePlate }
          : undefined,
        deliveryDriver: o.deliveryDriver
          ? { id: String(o.deliveryDriver.id), name: o.deliveryDriver.user.name, phone: o.deliveryDriver.user.phone, vehiclePlate: o.deliveryDriver.vehiclePlate }
          : undefined,
        estimatedWeight: o.estimatedWeight ? Number(o.estimatedWeight) : undefined,
        actualWeight: o.actualWeight ? Number(o.actualWeight) : undefined,
        estimatedPrice: o.estimatedPrice ? Number(o.estimatedPrice) : undefined,
        finalPrice: o.finalPrice ? Number(o.finalPrice) : undefined,
        deliveryFee: Number(o.deliveryFee),
        totalPrice: o.totalPrice ? Number(o.totalPrice) : undefined,
        status: o.status,
        buyerNotes: o.buyerNotes ?? undefined,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt.toISOString(),
        statusHistory: o.statusHistory.map((h) => ({
          status: h.status,
          createdAt: h.createdAt.toISOString(),
          notes: h.notes ?? undefined,
        })),
      })),
    })
  } catch (err) {
    console.error('[GET /api/buyer/orders]', err)
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'buyer') return unauthorized('Akses ditolak')

    const buyer = await prisma.buyer.findUnique({ where: { userId: authUser.userId } })
    if (!buyer) return unauthorized('Buyer tidak ditemukan')

    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const { sellerId, serviceId, pickupAddress, pickupLatitude, pickupLongitude,
      pickupDate, pickupTimeSlot, estimatedWeight, buyerNotes } = parsed.data

    // Validasi seller & service
    const service = await prisma.service.findFirst({
      where: { id: Number(serviceId), sellerId: Number(sellerId), isActive: true },
    })
    if (!service) return badRequest('Layanan tidak ditemukan')

    const estimatedPrice = Number(service.pricePerUnit) * estimatedWeight

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerId: buyer.id,
        sellerId: Number(sellerId),
        serviceId: Number(serviceId),
        pickupAddress,
        pickupLatitude,
        pickupLongitude,
        pickupDate: new Date(pickupDate),
        pickupTimeSlot: pickupTimeSlot as never,
        estimatedWeight,
        estimatedPrice,
        deliveryFee: 5000,
        buyerNotes: buyerNotes ?? null,
        status: 'pending_confirmation',
        statusHistory: {
          create: {
            status: 'pending_confirmation',
            createdBy: authUser.userId,
          },
        },
      },
    })

    // Notifikasi ke seller
    const seller = await prisma.seller.findUnique({ where: { id: Number(sellerId) } })
    if (seller) {
      await prisma.notification.create({
        data: {
          userId: seller.userId,
          title: 'Pesanan Baru Masuk',
          message: `Ada pesanan baru #${order.orderNumber} menunggu konfirmasi Anda.`,
          type: 'order',
          relatedId: order.id,
        },
      })
    }

    // Update total orders seller
    await prisma.seller.update({
      where: { id: Number(sellerId) },
      data: { totalOrders: { increment: 1 } },
    })

    return ok({ id: String(order.id), orderNumber: order.orderNumber })
  } catch (err) {
    console.error('[POST /api/buyer/orders]', err)
    return serverError()
  }
}
