import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatOrderNumber,
  getStatusLabel,
  getStatusColor,
  calculateOrderPrice,
  validateRequired,
} from './utils'
import type { OrderStatus } from '@/types'

describe('formatCurrency', () => {
  it('formats small amounts', () => {
    expect(formatCurrency(5000)).toBe('Rp 5.000')
  })

  it('formats larger amounts', () => {
    expect(formatCurrency(15000)).toBe('Rp 15.000')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('Rp 0')
  })

  it('formats millions', () => {
    expect(formatCurrency(1500000)).toBe('Rp 1.500.000')
  })
})

describe('formatDate', () => {
  it('formats a Date object to Indonesian locale', () => {
    const date = new Date(2026, 4, 13, 10, 0) // May 13, 2026 10:00
    const result = formatDate(date)
    expect(result).toBe('13 Mei 2026, 10:00')
  })

  it('formats a date string to Indonesian locale', () => {
    const result = formatDate('2026-01-15T14:30:00')
    expect(result).toBe('15 Januari 2026, 14:30')
  })
})

describe('formatOrderNumber', () => {
  it('formats order number with date and sequence', () => {
    const date = new Date(2026, 4, 13) // May 13, 2026
    expect(formatOrderNumber(date, 1)).toBe('SL20260513001')
  })

  it('pads sequence to 3 digits', () => {
    const date = new Date(2026, 4, 13)
    expect(formatOrderNumber(date, 42)).toBe('SL20260513042')
  })

  it('handles 3-digit sequence', () => {
    const date = new Date(2026, 11, 1) // Dec 1, 2026
    expect(formatOrderNumber(date, 999)).toBe('SL20261201999')
  })

  it('pads month and day to 2 digits', () => {
    const date = new Date(2026, 0, 5) // Jan 5, 2026
    expect(formatOrderNumber(date, 7)).toBe('SL20260105007')
  })
})

describe('getStatusLabel', () => {
  it('returns Indonesian label for each status', () => {
    const statuses: OrderStatus[] = [
      'pending_pickup',
      'driver_on_way_pickup',
      'picked_up',
      'at_laundry',
      'washing',
      'ready_for_delivery',
      'driver_on_way_delivery',
      'delivered',
      'completed',
      'cancelled',
    ]

    statuses.forEach((status) => {
      const label = getStatusLabel(status)
      expect(label).toBeDefined()
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })
  })

  it('returns correct label for pending_pickup', () => {
    expect(getStatusLabel('pending_pickup')).toBe('Menunggu Penjemputan')
  })

  it('returns correct label for completed', () => {
    expect(getStatusLabel('completed')).toBe('Selesai')
  })

  it('returns correct label for cancelled', () => {
    expect(getStatusLabel('cancelled')).toBe('Dibatalkan')
  })
})

describe('getStatusColor', () => {
  it('returns Tailwind classes for each status', () => {
    const statuses: OrderStatus[] = [
      'pending_pickup',
      'driver_on_way_pickup',
      'picked_up',
      'at_laundry',
      'washing',
      'ready_for_delivery',
      'driver_on_way_delivery',
      'delivered',
      'completed',
      'cancelled',
    ]

    statuses.forEach((status) => {
      const color = getStatusColor(status)
      expect(color).toBeDefined()
      expect(color).toContain('bg-')
      expect(color).toContain('text-')
    })
  })
})

describe('calculateOrderPrice', () => {
  it('calculates price correctly', () => {
    expect(calculateOrderPrice(3, 7000, 5000)).toBe(26000)
  })

  it('handles zero delivery fee', () => {
    expect(calculateOrderPrice(2, 10000, 0)).toBe(20000)
  })

  it('handles decimal weight', () => {
    expect(calculateOrderPrice(1.5, 10000, 5000)).toBe(20000)
  })
})

describe('validateRequired', () => {
  it('returns true for non-empty string', () => {
    expect(validateRequired('hello')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(validateRequired('')).toBe(false)
  })

  it('returns false for whitespace-only string', () => {
    expect(validateRequired('   ')).toBe(false)
  })

  it('returns false for tabs and newlines', () => {
    expect(validateRequired('\t\n  ')).toBe(false)
  })

  it('returns true for string with leading/trailing whitespace', () => {
    expect(validateRequired('  hello  ')).toBe(true)
  })
})
