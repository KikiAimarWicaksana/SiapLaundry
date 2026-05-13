import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrderStore } from './orderStore'
import type { Order } from '@/types/order'

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

const mockOrder: Order = {
  id: 'order-1',
  orderNumber: 'SL20240101001',
  buyerId: 'buyer-1',
  seller: { id: 'seller-1', laundryName: 'Clean Laundry', photos: [] },
  service: { id: 'svc-1', serviceName: 'Cuci Kering', pricePerUnit: 7000, unit: 'kg' },
  pickupAddress: 'Jl. Merdeka 10',
  pickupLatitude: -6.2,
  pickupLongitude: 106.8,
  pickupDate: '2024-01-02',
  pickupTimeSlot: 'morning',
  deliveryFee: 5000,
  status: 'pending_pickup',
  paymentStatus: 'pending',
  createdAt: '2024-01-01T10:00:00Z',
  statusHistory: [],
}

describe('orderStore', () => {
  beforeEach(() => {
    useOrderStore.setState({
      orders: [],
      currentOrder: null,
      isLoading: false,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty orders, null currentOrder, and isLoading false', () => {
      const state = useOrderStore.getState()
      expect(state.orders).toEqual([])
      expect(state.currentOrder).toBeNull()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('fetchOrders', () => {
    it('should set orders from API response', async () => {
      const { default: api } = await import('@/lib/api')
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [mockOrder] } })

      await useOrderStore.getState().fetchOrders()

      const state = useOrderStore.getState()
      expect(state.orders).toEqual([mockOrder])
      expect(state.isLoading).toBe(false)
    })

    it('should handle API response without nested data', async () => {
      const { default: api } = await import('@/lib/api')
      vi.mocked(api.get).mockResolvedValueOnce({ data: [mockOrder] })

      await useOrderStore.getState().fetchOrders()

      const state = useOrderStore.getState()
      expect(state.orders).toEqual([mockOrder])
    })

    it('should set isLoading false on error', async () => {
      const { default: api } = await import('@/lib/api')
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

      await useOrderStore.getState().fetchOrders()

      const state = useOrderStore.getState()
      expect(state.orders).toEqual([])
      expect(state.isLoading).toBe(false)
    })
  })

  describe('fetchOrderById', () => {
    it('should set currentOrder from API response', async () => {
      const { default: api } = await import('@/lib/api')
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockOrder } })

      await useOrderStore.getState().fetchOrderById('order-1')

      const state = useOrderStore.getState()
      expect(state.currentOrder).toEqual(mockOrder)
      expect(state.isLoading).toBe(false)
    })

    it('should set isLoading false on error', async () => {
      const { default: api } = await import('@/lib/api')
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Not found'))

      await useOrderStore.getState().fetchOrderById('order-999')

      const state = useOrderStore.getState()
      expect(state.currentOrder).toBeNull()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status in orders list and currentOrder', async () => {
      const updatedOrder = { ...mockOrder, status: 'at_laundry' as const }
      useOrderStore.setState({ orders: [mockOrder], currentOrder: mockOrder })

      const { default: api } = await import('@/lib/api')
      vi.mocked(api.patch).mockResolvedValueOnce({ data: { data: updatedOrder } })

      await useOrderStore.getState().updateOrderStatus('order-1', 'at_laundry')

      const state = useOrderStore.getState()
      expect(state.orders[0].status).toBe('at_laundry')
      expect(state.currentOrder?.status).toBe('at_laundry')
    })

    it('should not update currentOrder if it is a different order', async () => {
      const otherOrder = { ...mockOrder, id: 'order-2' }
      const updatedOrder = { ...mockOrder, status: 'washing' as const }
      useOrderStore.setState({ orders: [mockOrder], currentOrder: otherOrder })

      const { default: api } = await import('@/lib/api')
      vi.mocked(api.patch).mockResolvedValueOnce({ data: { data: updatedOrder } })

      await useOrderStore.getState().updateOrderStatus('order-1', 'washing')

      const state = useOrderStore.getState()
      expect(state.currentOrder?.id).toBe('order-2')
    })
  })

  describe('setOrders', () => {
    it('should replace orders array', () => {
      useOrderStore.getState().setOrders([mockOrder])

      const state = useOrderStore.getState()
      expect(state.orders).toEqual([mockOrder])
    })
  })

  describe('updateOrder', () => {
    it('should update matching order in list', () => {
      useOrderStore.setState({ orders: [mockOrder] })
      const updated = { ...mockOrder, status: 'delivered' as const }

      useOrderStore.getState().updateOrder(updated)

      const state = useOrderStore.getState()
      expect(state.orders[0].status).toBe('delivered')
    })

    it('should update currentOrder if it matches', () => {
      useOrderStore.setState({ orders: [mockOrder], currentOrder: mockOrder })
      const updated = { ...mockOrder, status: 'completed' as const }

      useOrderStore.getState().updateOrder(updated)

      const state = useOrderStore.getState()
      expect(state.currentOrder?.status).toBe('completed')
    })

    it('should not update currentOrder if it does not match', () => {
      const otherOrder = { ...mockOrder, id: 'order-other' }
      useOrderStore.setState({ orders: [mockOrder], currentOrder: otherOrder })
      const updated = { ...mockOrder, status: 'completed' as const }

      useOrderStore.getState().updateOrder(updated)

      const state = useOrderStore.getState()
      expect(state.currentOrder?.id).toBe('order-other')
      expect(state.currentOrder?.status).toBe('pending_pickup')
    })
  })
})
