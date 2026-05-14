"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/stores/authStore";

/** Waktu tidak aktif sebelum logout (ms) */
const IDLE_TIMEOUT_MS = 600_000; // 10 menit

/** Event yang dianggap sebagai aktivitas user */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

/** Modal notifikasi sesi berakhir */
function SessionExpiredModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 overflow-y-auto"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            width: "100%",
            maxWidth: "360px",
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              style={{ width: 28, height: 28, color: "#ef4444" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#ef4444"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          {/* Text */}
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#000",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Sesi Berakhir
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#71717a",
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              Maaf, sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "12px 24px",
              borderRadius: 9999,
              background: "#000",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function IdleLogout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [showModal, setShowModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoggedOutRef = useRef(false);

  const handleLogout = useCallback(() => {
    if (isLoggedOutRef.current) return;
    isLoggedOutRef.current = true;
    // Tampilkan modal dulu — logout baru terjadi saat user klik OK
    setShowModal(true);
  }, []);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated || isLoggedOutRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT_MS);
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Reset state saat user logout manual
      isLoggedOutRef.current = false;
      setShowModal(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Mulai timer saat user login
    isLoggedOutRef.current = false;
    resetTimer();

    // Pasang event listener aktivitas
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [isAuthenticated, resetTimer]);

  const handleClose = async () => {
    setShowModal(false);
    // 1. Bersihkan state Zustand
    logout(false);
    // 2. Hapus cookie di server — tunggu sampai selesai
    try {
      const { default: api } = await import('@/lib/api');
      await api.post('/auth/logout');
    } catch {
      // lanjut meski gagal
    }
    // 3. Hard reload ke landing page setelah cookie pasti terhapus
    window.location.replace('/');
  };

  if (!showModal) return null;

  return <SessionExpiredModal onClose={handleClose} />;
}

export default IdleLogout;
