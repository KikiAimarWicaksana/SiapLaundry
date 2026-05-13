import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from './notificationStore'
import type { Notification } from '@/types/chat'

const mockNotification: Notification = {
  id: 'notif-1',
  title: 'Order Baru',
  message: 'Pesanan Anda sedang diproses',
  type: 'order',
  relatedId: 'order-1',
  isRead: false,
  createdAt: '2024-01-01T10:00:00Z',
}

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
    })
  })

  describe('initial state', () => {
    it('should have empty notifications and zero unread count', () => {
      const state = useNotificationStore.getState()
      expect(state.notifications).toEqual([])
      expect(state.unreadCount).toBe(0)
    })
  })

  describe('addNotification', () => {
    it('should prepend notification and increment unread count', () => {
      useNotificationStore.getState().addNotification(mockNotification)

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]).toEqual(mockNotification)
      expect(state.unreadCount).toBe(1)
    })

    it('should not increment unread count for already-read notifications', () => {
      const readNotif = { ...mockNotification, isRead: true }
      useNotificationStore.getState().addNotification(readNotif)

      expect(useNotificationStore.getState().unreadCount).toBe(0)
    })

    it('should prepend new notifications (newest first)', () => {
      useNotificationStore.getState().addNotification(mockNotification)
      const newer = { ...mockNotification, id: 'notif-2', title: 'Newer' }
      useNotificationStore.getState().addNotification(newer)

      const state = useNotificationStore.getState()
      expect(state.notifications[0].id).toBe('notif-2')
      expect(state.notifications[1].id).toBe('notif-1')
    })
  })

  describe('markAsRead', () => {
    it('should mark a specific notification as read and decrement unread count', () => {
      useNotificationStore.setState({
        notifications: [mockNotification],
        unreadCount: 1,
      })

      useNotificationStore.getState().markAsRead('notif-1')

      const state = useNotificationStore.getState()
      expect(state.notifications[0].isRead).toBe(true)
      expect(state.unreadCount).toBe(0)
    })

    it('should not decrement unread count if notification is already read', () => {
      const readNotif = { ...mockNotification, isRead: true }
      useNotificationStore.setState({
        notifications: [readNotif],
        unreadCount: 0,
      })

      useNotificationStore.getState().markAsRead('notif-1')

      expect(useNotificationStore.getState().unreadCount).toBe(0)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read and reset unread count', () => {
      const notif2 = { ...mockNotification, id: 'notif-2' }
      useNotificationStore.setState({
        notifications: [mockNotification, notif2],
        unreadCount: 2,
      })

      useNotificationStore.getState().markAllAsRead()

      const state = useNotificationStore.getState()
      expect(state.notifications.every((n) => n.isRead)).toBe(true)
      expect(state.unreadCount).toBe(0)
    })
  })

  describe('setNotifications', () => {
    it('should replace notifications and compute unread count', () => {
      const readNotif = { ...mockNotification, id: 'notif-2', isRead: true }
      useNotificationStore.getState().setNotifications([mockNotification, readNotif])

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(2)
      expect(state.unreadCount).toBe(1)
    })
  })

  describe('clearAll', () => {
    it('should clear all notifications and reset unread count', () => {
      useNotificationStore.setState({
        notifications: [mockNotification],
        unreadCount: 1,
      })

      useNotificationStore.getState().clearAll()

      const state = useNotificationStore.getState()
      expect(state.notifications).toEqual([])
      expect(state.unreadCount).toBe(0)
    })
  })
})
