"use client";

import React, { useEffect, useRef } from "react";
import type { Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { Avatar } from "@/components/ui/Avatar";

export interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  contactName: string;
  isOnline: boolean;
}

export function ChatWindow({
  messages,
  currentUserId,
  contactName,
  isOnline,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-[12px] px-[16px] py-[12px] border-b border-hairline-light bg-canvas-light">
        <Avatar name={contactName} size="sm" />
        <div className="flex flex-col">
          <span className="text-[14px] font-[550] leading-[1.4] text-ink [font-feature-settings:'ss03']">
            {contactName}
          </span>
          <span
            className={[
              "text-[12px] font-[400] leading-[1.2]",
              isOnline ? "text-green-600" : "text-shade-40",
            ].join(" ")}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-[16px] py-[12px] space-y-[8px] bg-canvas-cream">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[14px] text-shade-40 [font-feature-settings:'ss03']">
              Belum ada pesan. Mulai percakapan!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSent={msg.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
