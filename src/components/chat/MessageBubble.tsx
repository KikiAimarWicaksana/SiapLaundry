"use client";

import React from "react";
import type { Message } from "@/types/chat";

export interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message, isSent }: MessageBubbleProps) {
  return (
    <div
      className={[
        "flex w-full",
        isSent ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[70%] rounded-lg px-[12px] py-[8px]",
          isSent
            ? "bg-aloe-10 text-ink rounded-br-none"
            : "bg-canvas-light text-ink border border-hairline-light rounded-bl-none",
        ].join(" ")}
      >
        <p className="text-[14px] font-[420] leading-[1.5] [font-feature-settings:'ss03'] break-words">
          {message.content}
        </p>
        <div
          className={[
            "flex items-center gap-[4px] mt-[4px]",
            isSent ? "justify-end" : "justify-start",
          ].join(" ")}
        >
          <span className="text-[11px] font-[400] text-shade-50 leading-[1.2]">
            {formatTime(message.timestamp)}
          </span>
          {isSent && (
            <span
              className="text-[11px] text-shade-50"
              aria-label={message.isRead ? "Dibaca" : "Terkirim"}
            >
              {message.isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
