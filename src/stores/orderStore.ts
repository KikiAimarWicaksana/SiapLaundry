import { create } from 'zustand'
import type { Order, OrderStatus } from '@/types/order'

export interface OrderStoreState {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
}

export interface OrderStoreActions {
  fetchOrders: () => Promise<void>
  fetchOrderById: (id: string) => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  setOrders: (orders: Order[]) => void
  updateOrder: (order: Order) => void
}

export type OrderStore = OrderStoreState & OrderStoreActions

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true })
    try {
      const { default: api } = await import('@/lib/api')
      const response = await api.get('/orders')
      set({ orders: response.data.data ?? response.data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true })
    try {
      const { default: api } = await import('@/lib/api')
      const response = await api.get(`/orders/${id}`)
      set({ currentOrder: response.data.data ?? response.data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    try {
      const { default: api } = await import('@/lib/api')
      const response = await api.patch(`/orders/${orderId}/status`, { status })
      const updatedOrder: Order = response.data.data ?? response.data

      const { orders, currentOrder } = get()
      set({
        orders: orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        currentOrder: currentOrder?.id === orderId ? updatedOrder : currentOrder,
      })
    } catch {
      // Error handling delegated to caller
    }
  },

  setOrders: (orders: Order[]) => {
    set({ orders })
  },

  updateOrder: (order: Order) => {
    const { orders, currentOrder } = get()
    set({
      orders: orders.map((o) => (o.id === order.id ? order : o)),
      currentOrder: currentOrder?.id === order.id ? order : currentOrder,
    })
  },
}))
