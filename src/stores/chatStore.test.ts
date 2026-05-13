import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from './chatStore'
import type { ChatContact, Message } from '@/types/chat'

const mockContact: ChatContact = {
  id: 'contact-1',
  name: 'Laundry Bersih',
  role: 'seller',
  isOnline: true,
  unreadCount: 3,
  orderId: 'order-1',
}

const mockMessage: Message = {
  id: 'msg-1',
  senderId: 'user-1',
  senderName: 'Buyer',
  content: 'Halo, kapan cucian saya selesai?',
  timestamp: '2024-01-01T10:00:00Z',
  isRead: false,
}

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      contacts: [],
      messages: {},
      activeContactId: null,
      isConnected: false,
    })
  })

  describe('initial state', () => {
    it('should have empty contacts, messages, null activeContactId, and disconnected', () => {
      const state = useChatStore.getState()
      expect(state.contacts).toEqual([])
      expect(state.messages).toEqual({})
      expect(state.activeContactId).toBeNull()
      expect(state.isConnected).toBe(false)
    })
  })

  describe('setContacts', () => {
    it('should set contacts array', () => {
      useChatStore.getState().setContacts([mockContact])

      const state = useChatStore.getState()
      expect(state.contacts).toEqual([mockContact])
    })
  })

  describe('setActiveContact', () => {
    it('should set active contact id', () => {
      useChatStore.getState().setActiveContact('contact-1')

      expect(useChatStore.getState().activeContactId).toBe('contact-1')
    })

    it('should allow setting to null', () => {
      useChatStore.setState({ activeContactId: 'contact-1' })
      useChatStore.getState().setActiveContact(null)

      expect(useChatStore.getState().activeContactId).toBeNull()
    })
  })

  describe('addMessage', () => {
    it('should add message to the correct contact', () => {
      useChatStore.getState().addMessage('contact-1', mockMessage)

      const state = useChatStore.getState()
      expect(state.messages['contact-1']).toHaveLength(1)
      expect(state.messages['contact-1'][0]).toEqual(mockMessage)
    })

    it('should append to existing messages', () => {
      useChatStore.setState({ messages: { 'contact-1': [mockMessage] } })

      const newMsg: Message = { ...mockMessage, id: 'msg-2', content: 'Terima kasih' }
      useChatStore.getState().addMessage('contact-1', newMsg)

      const state = useChatStore.getState()
      expect(state.messages['contact-1']).toHaveLength(2)
    })
  })

  describe('markAsRead', () => {
    it('should mark all messages for a contact as read', () => {
      useChatStore.setState({
        messages: { 'contact-1': [mockMessage, { ...mockMessage, id: 'msg-2' }] },
        contacts: [mockContact],
      })

      useChatStore.getState().markAsRead('contact-1')

      const state = useChatStore.getState()
      expect(state.messages['contact-1'].every((m) => m.isRead)).toBe(true)
      expect(state.contacts[0].unreadCount).toBe(0)
    })

    it('should do nothing if contact has no messages', () => {
      useChatStore.setState({ contacts: [mockContact] })

      useChatStore.getState().markAsRead('contact-1')

      // Should not throw, contacts remain unchanged
      expect(useChatStore.getState().contacts[0].unreadCount).toBe(3)
    })
  })

  describe('setConnected', () => {
    it('should set connection status to true', () => {
      useChatStore.getState().setConnected(true)
      expect(useChatStore.getState().isConnected).toBe(true)
    })

    it('should set connection status to false', () => {
      useChatStore.setState({ isConnected: true })
      useChatStore.getState().setConnected(false)
      expect(useChatStore.getState().isConnected).toBe(false)
    })
  })

  describe('updateUnreadCount', () => {
    it('should update unread count for a specific contact', () => {
      useChatStore.setState({ contacts: [mockContact] })

      useChatStore.getState().updateUnreadCount('contact-1', 5)

      expect(useChatStore.getState().contacts[0].unreadCount).toBe(5)
    })

    it('should not affect other contacts', () => {
      const contact2: ChatContact = { ...mockContact, id: 'contact-2', unreadCount: 1 }
      useChatStore.setState({ contacts: [mockContact, contact2] })

      useChatStore.getState().updateUnreadCount('contact-1', 0)

      const state = useChatStore.getState()
      expect(state.contacts[0].unreadCount).toBe(0)
      expect(state.contacts[1].unreadCount).toBe(1)
    })
  })
})
