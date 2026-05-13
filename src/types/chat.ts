export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface ChatContact {
  id: string
  name: string
  role: 'seller' | 'driver'
  avatar?: string
  isOnline: boolean
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  orderId: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'chat' | 'review' | 'system'
  relatedId?: string
  isRead: boolean
  createdAt: string
}
