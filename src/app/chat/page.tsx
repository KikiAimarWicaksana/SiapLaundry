"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/stores/chatStore";
import type { ChatContact } from "@/types/chat";

// Mock contacts data
const MOCK_CONTACTS: ChatContact[] = [
  {
    id: "contact-1",
    name: "Laundry Bersih Wangi",
    role: "seller",
    avatar: undefined,
    isOnline: true,
    lastMessage: "Pesanan Anda sedang kami proses",
    lastMessageTime: "10:30",
    unreadCount: 2,
    orderId: "order-101",
  },
  {
    id: "contact-2",
    name: "Pak Budi (Kurir)",
    role: "driver",
    avatar: undefined,
    isOnline: true,
    lastMessage: "Saya sudah di depan rumah",
    lastMessageTime: "09:15",
    unreadCount: 0,
    orderId: "order-102",
  },
  {
    id: "contact-3",
    name: "Express Laundry",
    role: "seller",
    avatar: undefined,
    isOnline: false,
    lastMessage: "Terima kasih sudah order",
    lastMessageTime: "Kemarin",
    unreadCount: 1,
    orderId: "order-103",
  },
];

// Current user ID for message display
const CURRENT_USER_ID = "user-me";

export default function ChatPage() {
  const [activeContactId, setActiveContactId] = useState<string | null>(null);

  // Selector terpisah — hindari infinite loop getSnapshot
  const contacts = useChatStore((state) => state.contacts);
  const setContacts = useChatStore((state) => state.setContacts);

  // Initialize mock contacts on mount
  useEffect(() => {
    if (contacts.length === 0) {
      setContacts(MOCK_CONTACTS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine active contact
  const activeContact = (contacts.length > 0 ? contacts : MOCK_CONTACTS).find(
    (c) => c.id === activeContactId
  );

  // Get orderId for the active contact (needed by useChat)
  const activeOrderId = activeContact?.orderId ?? "";

  // Use the chat hook for real-time messaging
  const { messages, sendMessage, isConnected, markAsRead } = useChat(
    activeOrderId,
    activeContactId ?? ""
  );

  // Handle contact selection
  const handleSelectContact = useCallback(
    (contactId: string) => {
      setActiveContactId(contactId);
      // Mark messages as read when selecting a contact
      markAsRead();
    },
    [markAsRead]
  );

  // Handle sending a message
  const handleSendMessage = useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage]
  );

  const displayContacts = contacts.length > 0 ? contacts : MOCK_CONTACTS;

  return (
    <div className="flex flex-col h-screen bg-canvas-cream">
      {/* Navbar */}
      <Navbar variant="light" />

      {/* Disconnection banner */}
      {!isConnected && (
        <div
          className="bg-red-500 text-canvas-light text-center py-[8px] px-[16px] text-[13px] font-[420] [font-feature-settings:'ss03']"
          role="alert"
          aria-live="polite"
        >
          Koneksi terputus, mencoba menghubungkan kembali...
        </div>
      )}

      {/* Chat layout: sidebar + chat window */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <ChatSidebar
          contacts={displayContacts}
          activeContactId={activeContactId}
          onSelectContact={handleSelectContact}
        />

        {/* Right: Chat window + input */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeContact ? (
            <>
              <ChatWindow
                messages={messages}
                currentUserId={CURRENT_USER_ID}
                contactName={activeContact.name}
                isOnline={activeContact.isOnline}
              />
              <ChatInput
                onSend={handleSendMessage}
                disabled={!isConnected}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-canvas-cream">
              <p className="text-[14px] text-shade-40 [font-feature-settings:'ss03']">
                Pilih kontak untuk memulai percakapan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
