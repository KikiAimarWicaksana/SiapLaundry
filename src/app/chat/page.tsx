"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import type { ChatContact } from "@/types/chat";

interface EnrichedContact extends ChatContact {
  receiverUserId: number;
}

export default function ChatPage() {
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<EnrichedContact[]>([]);

  const user = useAuthStore((state) => state.user);
  const { setContacts: setStoreContacts } = useChatStore();

  useEffect(() => {
    async function fetchContacts() {
      if (!user) { setLoading(false); return; }
      try {
        const derived: EnrichedContact[] = [];
        const activeStatuses = [
          "pending_confirmation","confirmed","pending_pickup",
          "driver_on_way_pickup","picked_up","at_laundry",
          "payment_pending","washing","ready_for_delivery",
          "driver_on_way_delivery",
        ];

        if (user.role === "buyer") {
          const res = await api.get("/buyer/orders");
          for (const order of res.data.data ?? []) {
            if (!activeStatuses.includes(order.status)) continue;
            // Fetch participants untuk order ini
            try {
              const pRes = await api.get(`/chat/${order.id}/participants`);
              const participants: { userId: number; name: string; role: string }[] = pRes.data.data ?? [];
              const seller = participants.find(p => p.role === "seller");
              if (seller) {
                derived.push({
                  id: `order-${order.id}`,
                  name: order.seller.laundryName,
                  role: "seller" as const,
                  avatar: order.seller.photos?.[0],
                  isOnline: false,
                  lastMessage: "",
                  lastMessageTime: "",
                  unreadCount: 0,
                  orderId: String(order.id),
                  receiverUserId: seller.userId,
                });
              }
              const driver = participants.find(p => p.role === "driver");
              if (driver) {
                derived.push({
                  id: `order-driver-${order.id}`,
                  name: `${driver.name} (Kurir)`,
                  role: "driver" as const,
                  avatar: undefined,
                  isOnline: false,
                  lastMessage: "",
                  lastMessageTime: "",
                  unreadCount: 0,
                  orderId: String(order.id),
                  receiverUserId: driver.userId,
                });
              }
            } catch { /* skip order ini */ }
          }
        } else if (user.role === "seller") {
          const res = await api.get("/seller/orders");
          for (const order of res.data.data ?? []) {
            if (["completed","cancelled"].includes(order.status)) continue;
            try {
              const pRes = await api.get(`/chat/${order.id}/participants`);
              const participants: { userId: number; name: string; role: string }[] = pRes.data.data ?? [];
              const buyer = participants.find(p => p.role === "buyer");
              if (buyer) {
                derived.push({
                  id: `order-${order.id}`,
                  name: order.buyerName,
                  role: "buyer" as const,
                  avatar: undefined,
                  isOnline: false,
                  lastMessage: "",
                  lastMessageTime: "",
                  unreadCount: 0,
                  orderId: String(order.id),
                  receiverUserId: buyer.userId,
                });
              }
            } catch { /* skip */ }
          }
        } else if (user.role === "driver") {
          const res = await api.get("/driver/orders");
          const { pickup = [], delivery = [] } = res.data.data ?? {};
          const seen = new Set<string>();
          for (const order of [...pickup, ...delivery]) {
            if (seen.has(order.id)) continue;
            seen.add(order.id);
            try {
              const pRes = await api.get(`/chat/${order.id}/participants`);
              const participants: { userId: number; name: string; role: string }[] = pRes.data.data ?? [];
              const buyer = participants.find(p => p.role === "buyer");
              if (buyer) {
                derived.push({
                  id: `order-${order.id}`,
                  name: order.buyerName,
                  role: "buyer" as const,
                  avatar: undefined,
                  isOnline: false,
                  lastMessage: "",
                  lastMessageTime: "",
                  unreadCount: 0,
                  orderId: String(order.id),
                  receiverUserId: buyer.userId,
                });
              }
            } catch { /* skip */ }
          }
        }

        setContacts(derived);
        setStoreContacts(derived);
      } catch {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const activeOrderId = activeContact?.orderId ?? "";

  const { messages, sendMessage, isConnected, loading: msgLoading } = useChat(activeOrderId);

  const handleSelectContact = useCallback((contactId: string) => {
    setActiveContactId(contactId);
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeContact) return;
    await sendMessage(content, String(activeContact.receiverUserId));
  }, [sendMessage, activeContact]);

  return (
    <div className="flex flex-col h-screen bg-canvas-cream">
      <Navbar variant="light" />

      {!isConnected && (
        <div className="bg-red-500 text-canvas-light text-center py-[8px] px-[16px] text-[13px] font-[420]" role="alert">
          Koneksi bermasalah...
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[240px] md:w-[280px] border-r border-hairline-light bg-canvas-light flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[13px] text-shade-40">Memuat kontak...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
              <svg className="w-10 h-10 text-shade-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <p className="text-[13px] text-shade-50 leading-[1.5]">
                Belum ada percakapan. Chat akan muncul saat ada pesanan aktif.
              </p>
            </div>
          ) : (
            <ChatSidebar
              contacts={contacts}
              activeContactId={activeContactId}
              onSelectContact={handleSelectContact}
            />
          )}
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeContact ? (
            <>
              {msgLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[13px] text-shade-40">Memuat pesan...</p>
                </div>
              ) : (
                <ChatWindow
                  messages={messages}
                  currentUserId={user?.id ?? ""}
                  contactName={activeContact.name}
                  isOnline={activeContact.isOnline}
                />
              )}
              <ChatInput onSend={handleSendMessage} disabled={false} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-canvas-cream">
              <p className="text-[14px] text-shade-40">
                {contacts.length > 0 ? "Pilih kontak untuk memulai percakapan" : "Belum ada percakapan aktif"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
