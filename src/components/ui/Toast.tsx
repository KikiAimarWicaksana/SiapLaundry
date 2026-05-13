"use client";

import React, { useEffect, useState, useCallback, createContext, useContext } from "react";

// Toast types
export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

// Toast context
interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Container
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[380px]"
      aria-live="polite"
      aria-label="Notifikasi"
    >
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

// Individual toast
const variantStyles: Record<ToastVariant, { bg: string; icon: string }> = {
  success: { bg: "bg-green-50 border-green-200 text-green-800", icon: "✓" },
  error: { bg: "bg-red-50 border-red-200 text-red-800", icon: "✕" },
  info: { bg: "bg-blue-50 border-blue-200 text-blue-800", icon: "ℹ" },
  warning: { bg: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: "⚠" },
};

function ToastMessage({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  const style = variantStyles[toast.variant];

  return (
    <div
      className={[
        "flex items-start gap-3",
        "px-4 py-3",
        "rounded-md border",
        "shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
        "animate-[slideIn_0.2s_ease-out]",
        "text-[14px] font-[500] leading-[1.49]",
        "[font-feature-settings:'ss03']",
        style.bg,
      ].join(" ")}
      role="alert"
    >
      <span className="shrink-0 text-[16px]" aria-hidden="true">
        {style.icon}
      </span>
      <p className="flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 rounded-sm opacity-60 hover:opacity-100 cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <svg
          width="14"
          height="14"
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
  );
}

export default ToastProvider;
