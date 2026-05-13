import { create } from 'zustand'
import type { ChatContact, Message } from '@/types/chat'

export interface ChatStoreState {
  contacts: ChatContact[]
  messages: Record<string, Message[]>
  activeContactId: string | null
  isConnected: boolean
}

export interface ChatStoreActions {
  setContacts: (contacts: ChatContact[]) => void
  setActiveContact: (id: string | null) => void
  addMessage: (contactId: string, message: Message) => void
  markAsRead: (contactId: string) => void
  setConnected: (status: boolean) => void
  updateUnreadCount: (contactId: string, count: number) => void
}

export type ChatStore = ChatStoreState & ChatStoreActions

export const useChatStore = create<ChatStore>((set, get) => ({
  contacts: [],
  messages: {},
  activeContactId: null,
  isConnected: false,

  setContacts: (contacts: ChatContact[]) => {
    set({ contacts })
  },

  setActiveContact: (id: string | null) => {
    set({ activeContactId: id })
  },

  addMessage: (contactId: string, message: Message) => {
    const { messages } = get()
    const existing = messages[contactId] ?? []
    set({
      messages: {
        ...messages,
        [contactId]: [...existing, message],
      },
    })
  },

  markAsRead: (contactId: string) => {
    const { messages, contacts } = get()
    const contactMessages = messages[contactId]
    if (contactMessages) {
      set({
        messages: {
          ...messages,
          [contactId]: contactMessages.map((m) => ({ ...m, isRead: true })),
        },
        contacts: contacts.map((c) =>
          c.id === contactId ? { ...c, unreadCount: 0 } : c
        ),
      })
    }
  },

  setConnected: (status: boolean) => {
    set({ isConnected: status })
  },

  updateUnreadCount: (contactId: string, count: number) => {
    const { contacts } = get()
    set({
      contacts: contacts.map((c) =>
        c.id === contactId ? { ...c, unreadCount: count } : c
      ),
    })
  },
}))
