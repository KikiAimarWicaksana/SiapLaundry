"use client";

import React from "react";
import type { ChatContact } from "@/types/chat";
import { Avatar } from "@/components/ui/Avatar";

export interface ChatSidebarProps {
  contacts: ChatContact[];
  activeContactId: string | null;
  onSelectContact: (contactId: string) => void;
}

export function ChatSidebar({
  contacts,
  activeContactId,
  onSelectContact,
}: ChatSidebarProps) {
  return (
    <aside className="w-[320px] h-full border-r border-hairline-light bg-canvas-light flex flex-col">
      {/* Header */}
      <div className="px-[16px] py-[14px] border-b border-hairline-light">
        <h2 className="text-[16px] font-[550] leading-[1.4] text-ink [font-feature-settings:'ss03']">
          Chat
        </h2>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex items-center justify-center h-full px-[16px]">
            <p className="text-[14px] text-shade-40 [font-feature-settings:'ss03']">
              Belum ada percakapan
            </p>
          </div>
        ) : (
          <ul role="list">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <button
                  type="button"
                  onClick={() => onSelectContact(contact.id)}
                  aria-current={activeContactId === contact.id ? "true" : undefined}
                  className={[
                    "w-full flex items-center gap-[12px] px-[16px] py-[12px]",
                    "text-left transition-colors duration-150",
                    "hover:bg-canvas-cream",
                    activeContactId === contact.id
                      ? "bg-canvas-cream"
                      : "bg-transparent",
                  ].join(" ")}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative shrink-0">
                    <Avatar
                      src={contact.avatar}
                      name={contact.name}
                      size="md"
                    />
                    <span
                      className={[
                        "absolute bottom-0 right-0",
                        "w-[10px] h-[10px] rounded-full border-2 border-canvas-light",
                        contact.isOnline ? "bg-green-500" : "bg-shade-30",
                      ].join(" ")}
                      aria-label={contact.isOnline ? "Online" : "Offline"}
                    />
                  </div>

                  {/* Contact info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-[550] leading-[1.4] text-ink truncate [font-feature-settings:'ss03']">
                        {contact.name}
                      </span>
                      {contact.lastMessageTime && (
                        <span className="text-[11px] font-[400] text-shade-40 shrink-0 ml-[8px]">
                          {contact.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-[2px]">
                      <span className="text-[13px] font-[400] text-shade-50 truncate leading-[1.4] [font-feature-settings:'ss03']">
                        {contact.lastMessage || "Belum ada pesan"}
                      </span>
                      {contact.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full bg-ink text-canvas-light text-[11px] font-[500] leading-[1] shrink-0 ml-[8px]">
                          {contact.unreadCount > 99
                            ? "99+"
                            : contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default ChatSidebar;
