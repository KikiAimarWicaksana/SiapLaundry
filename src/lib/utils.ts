import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { OrderStatus } from '@/types'

/**
 * Format a number to Indonesian Rupiah currency string.
 * e.g., 5000 → "Rp 5.000"
 */
export function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

/**
 * Format a date to Indonesian locale string.
 * e.g., "13 Mei 2026, 10:00"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMMM yyyy, HH:mm', { locale: idLocale })
}

/**
 * Format an order number from date and sequence.
 * e.g., SL20260513001
 */
export function formatOrderNumber(date: Date, seq: number): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const seqStr = String(seq).padStart(3, '0')
  return `SL${year}${month}${day}${seqStr}`
}

/**
 * Returns Indonesian label for each order status.
 */
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending_confirmation: "Menunggu Konfirmasi",
    confirmed: "Pesanan Dikonfirmasi",
    payment_pending: "Menunggu Pembayaran",
    pending_pickup: 'Menunggu Penjemputan',
    driver_on_way_pickup: 'Kurir Menuju Lokasi',
    picked_up: 'Pakaian Dijemput',
    at_laundry: 'Di Laundry',
    washing: 'Sedang Dicuci',
    ready_for_delivery: 'Siap Diantar',
    driver_on_way_delivery: 'Kurir Mengantar',
    delivered: 'Terkirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return labels[status]
}

/**
 * Returns Tailwind color class for each order status.
 */
export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending_confirmation: "bg-orange-100 text-orange-800",
    confirmed: "bg-blue-100 text-blue-800",
    payment_pending: "bg-yellow-100 text-yellow-800",
    pending_pickup: 'bg-yellow-100 text-yellow-800',
    driver_on_way_pickup: 'bg-blue-100 text-blue-800',
    picked_up: 'bg-blue-100 text-blue-800',
    at_laundry: 'bg-purple-100 text-purple-800',
    washing: 'bg-purple-100 text-purple-800',
    ready_for_delivery: 'bg-green-100 text-green-800',
    driver_on_way_delivery: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-green-200 text-green-900',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

/**
 * Calculate order price from weight, price per unit, and delivery fee.
 */
export function calculateOrderPrice(
  weight: number,
  pricePerUnit: number,
  deliveryFee: number
): number {
  return weight * pricePerUnit + deliveryFee
}

/**
 * Validate that a string has non-whitespace content.
 * Returns true if valid (has content), false if empty or whitespace-only.
 */
export function validateRequired(str: string): boolean {
  return str.trim().length > 0
}
