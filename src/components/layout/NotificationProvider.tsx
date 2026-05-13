"use client"

import React from 'react'
import { useNotifications } from '@/hooks/useNotifications'

/**
 * NotificationProvider — a client component that activates the useNotifications hook.
 * Wrap this around children in the root layout (inside ToastProvider) to enable
 * real-time notification handling across the app.
 *
 * Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useNotifications()

  return <>{children}</>
}

export default NotificationProvider
