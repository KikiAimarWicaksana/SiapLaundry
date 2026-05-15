import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'seller') return unauthorized('Akses ditolak')

    const seller = await prisma.seller.findUnique({ where: { userId: authUser.userId } })
    if (!seller) return unauthorized('Seller tidak ditemukan')

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const statusFilter: string[] = status
      ? status.split(',')
      : []

    const orders = await prisma.order.findMany({
      where: {
        sellerId: seller.id,
        ...(statusFilter.length > 0 ? { status: { in: statusFilter as never[] } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { include: { user: { select: { name: true, phone: true } } } },
        service: { select: { serviceName: true, pricePerUnit: true, unit: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: orders.map((o) => ({
        id: String(o.id),
        orderNumber: o.orderNumber,
        buyerName: o.buyer.user.name,
        buyerPhone: o.buyer.user.phone,
        service: o.service.serviceName,
        pricePerUnit: Number(o.service.pricePerUnit),
        unit: o.service.unit,
        estimatedWeight: o.estimatedWeight ? Number(o.estimatedWeight) : null,
        actualWeight: o.actualWeight ? Number(o.actualWeight) : null,
        estimatedPrice: o.estimatedPrice ? Number(o.estimatedPrice) : null,
        finalPrice: o.finalPrice ? Number(o.finalPrice) : null,
        deliveryFee: Number(o.deliveryFee),
        totalPrice: o.totalPrice ? Number(o.totalPrice) : null,
        status: o.status,
        pickupAddress: o.pickupAddress,
        buyerNotes: o.buyerNotes,
        createdAt: o.createdAt.toISOString(),
        completedAt: o.completedAt?.toISOString() || null,
      })),
    })
  } catch (err) {
    console.error('[GET /api/seller/orders]', err)
    return serverError()
  }
}
