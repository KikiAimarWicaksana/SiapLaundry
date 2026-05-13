"use client";

import React, { useState } from "react";

export interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-[8px] px-[16px] py-[12px] border-t border-hairline-light bg-canvas-light"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ketik pesan..."
        disabled={disabled}
        aria-label="Ketik pesan"
        className={[
          "flex-1",
          "bg-canvas-cream text-ink",
          "font-body text-[14px] font-[420] leading-[1.5]",
          "[font-feature-settings:'ss03']",
          "px-[12px] py-[10px]",
          "rounded-pill",
          "border border-hairline-light",
          "outline-none",
          "focus:ring-2 focus:ring-ink/20 focus:border-ink",
          "placeholder:text-shade-40",
          "transition-colors duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        aria-label="Kirim pesan"
        className={[
          "inline-flex items-center justify-center",
          "w-[40px] h-[40px]",
          "rounded-full",
          "bg-ink text-canvas-light",
          "hover:bg-shade-60",
          "transition-colors duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "shrink-0",
        ].join(" ")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[18px] h-[18px]"
          aria-hidden="true"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
}

export default ChatInput;
