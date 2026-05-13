import { NextResponse } from 'next/server'

/**
 * API response helpers — format konsisten untuk seluruh backend.
 */

export function ok<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message }, { status: 200 })
}

export function created<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message }, { status: 201 })
}

export function badRequest(message: string, errors?: Record<string, string[]>) {
  return NextResponse.json(
    { success: false, message, errors },
    { status: 400 }
  )
}

export function unauthorized(message = 'Tidak terautentikasi') {
  return NextResponse.json({ success: false, message }, { status: 401 })
}

export function forbidden(message = 'Akses ditolak') {
  return NextResponse.json({ success: false, message }, { status: 403 })
}

export function notFound(message = 'Tidak ditemukan') {
  return NextResponse.json({ success: false, message }, { status: 404 })
}

export function conflict(message: string) {
  return NextResponse.json({ success: false, message }, { status: 409 })
}

export function serverError(message = 'Terjadi kesalahan server') {
  return NextResponse.json({ success: false, message }, { status: 500 })
}
