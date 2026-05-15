"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Hanya focus saat pertama kali buka, bukan setiap re-render
  const hasAutoFocused = useRef(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap hanya untuk Tab — jangan ganggu pengetikan
      if (e.key === "Tab" && contentRef.current) {
        const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      hasAutoFocused.current = false;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Auto-focus ke input pertama (bukan tombol close), hanya sekali saat buka
      setTimeout(() => {
        if (hasAutoFocused.current) return;
        hasAutoFocused.current = true;
        const firstInput = contentRef.current?.querySelector<HTMLElement>(
          'input, select, textarea'
        );
        firstInput?.focus();
      }, 50);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-black/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Centering wrapper */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Content */}
        <div
          ref={contentRef}
          className={[
            "relative",
            "bg-canvas-light text-ink",
            "rounded-lg",
            "p-6 sm:p-8",
            "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]",
            "w-full",
            "min-w-[320px]",
            "max-w-lg",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2
                id="modal-title"
                className="font-display text-[20px] font-[500] leading-[1.4] tracking-[0.3px] [font-feature-settings:'ss03']"
              >
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto p-1 rounded-sm text-shade-50 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 cursor-pointer"
              aria-label="Tutup"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
