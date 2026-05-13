import { create } from 'zustand'
import type { Notification } from '@/types/chat'

export interface NotificationStoreState {
  notifications: Notification[]
  unreadCount: number
}

export interface NotificationStoreActions {
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  setNotifications: (notifications: Notification[]) => void
  clearAll: () => void
}

export type NotificationStore = NotificationStoreState & NotificationStoreActions

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification: Notification) => {
    const { notifications } = get()
    set({
      notifications: [notification, ...notifications],
      unreadCount: notification.isRead
        ? get().unreadCount
        : get().unreadCount + 1,
    })
  },

  markAsRead: (id: string) => {
    const { notifications, unreadCount } = get()
    const target = notifications.find((n) => n.id === id)
    if (target && !target.isRead) {
      set({
        notifications: notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, unreadCount - 1),
      })
    }
  },

  markAllAsRead: () => {
    const { notifications } = get()
    set({
      notifications: notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })
  },

  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length
    set({ notifications, unreadCount })
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },
}))
