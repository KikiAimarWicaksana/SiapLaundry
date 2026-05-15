import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { unauthorized, badRequest, serverError, ok } from '@/lib/api-response'

const addressSchema = z.object({
  label: z.string().min(1).max(50),
  address_line: z.string().min(1).max(500),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
  notes: z.string().max(200).optional(),
  is_default: z.boolean().optional(),
})

interface AddressEntry {
  id: string
  label: string
  address_line: string
  latitude: number
  longitude: number
  notes?: string
  is_default: boolean
}

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'buyer') return unauthorized('Akses ditolak')

    const buyer = await prisma.buyer.findUnique({ where: { userId: authUser.userId } })
    if (!buyer) return unauthorized('Buyer tidak ditemukan')

    let addresses = (buyer.addresses as unknown as AddressEntry[]) ?? []

    // Pastikan setiap alamat punya id — migrasi data lama yang tidak punya id
    let needsMigration = false
    addresses = addresses.map((a) => {
      if (!a.id) {
        needsMigration = true
        return { ...a, id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
      }
      return a
    })

    if (needsMigration) {
      await prisma.buyer.update({
        where: { userId: authUser.userId },
        data: { addresses: addresses as any },
      })
    }

    return NextResponse.json({ success: true, data: addresses })
  } catch (err) {
    console.error('[GET /api/buyer/addresses]', err)
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
    const parsed = addressSchema.safeParse(body)
    if (!parsed.success) return badRequest('Data tidak valid')

    const existing = (buyer.addresses as unknown as AddressEntry[]) ?? []
    const newAddr: AddressEntry = {
      id: `addr-${Date.now()}`,
      label: parsed.data.label,
      address_line: parsed.data.address_line,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      notes: parsed.data.notes,
      is_default: existing.length === 0 ? true : (parsed.data.is_default ?? false),
    }

    // Jika set sebagai default, reset yang lain
    let updated = existing.map((a) => ({
      ...a,
      is_default: newAddr.is_default ? false : a.is_default,
    }))
    updated = [...updated, newAddr]

    await prisma.buyer.update({
      where: { userId: authUser.userId },
      data: { addresses: updated as any },
    })

    return ok(newAddr)
  } catch (err) {
    console.error('[POST /api/buyer/addresses]', err)
    return serverError()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'buyer') return unauthorized('Akses ditolak')

    const buyer = await prisma.buyer.findUnique({ where: { userId: authUser.userId } })
    if (!buyer) return unauthorized('Buyer tidak ditemukan')

    const body = await request.json()
    const { id, ...data } = body
    if (!id) return badRequest('ID alamat wajib diisi')

    const parsed = addressSchema.partial().safeParse(data)
    if (!parsed.success) return badRequest('Data tidak valid')

    let addresses = (buyer.addresses as unknown as AddressEntry[]) ?? []

    // Jika set default, reset yang lain
    if (parsed.data.is_default) {
      addresses = addresses.map((a) => ({ ...a, is_default: false }))
    }

    addresses = addresses.map((a) =>
      a.id === id ? { ...a, ...parsed.data } : a
    )

    await prisma.buyer.update({
      where: { userId: authUser.userId },
      data: { addresses: addresses as any },
    })

    return ok(addresses.find((a) => a.id === id))
  } catch (err) {
    console.error('[PUT /api/buyer/addresses]', err)
    return serverError()
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'buyer') return unauthorized('Akses ditolak')

    const buyer = await prisma.buyer.findUnique({ where: { userId: authUser.userId } })
    if (!buyer) return unauthorized('Buyer tidak ditemukan')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return badRequest('ID alamat wajib diisi')

    let addresses = (buyer.addresses as unknown as AddressEntry[]) ?? []
    addresses = addresses.filter((a) => a.id !== id)

    // Jika yang dihapus adalah default, set yang pertama sebagai default
    if (addresses.length > 0 && !addresses.some((a) => a.is_default)) {
      addresses[0].is_default = true
    }

    await prisma.buyer.update({
      where: { userId: authUser.userId },
      data: { addresses: addresses as any },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/buyer/addresses]', err)
    return serverError()
  }
}
