"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import api from "@/lib/api";

export interface NavbarProps {
  variant: "dark" | "light";
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
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
  );
}

export function Navbar({ variant }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (variant === "dark") {
    return <NavbarDark mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />;
  }

  return <NavbarLight mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />;
}

interface NavbarInternalProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

function NavbarDark({ mobileMenuOpen, setMobileMenuOpen }: NavbarInternalProps) {
  return (
    <nav
      className="bg-canvas-night text-canvas-light px-xl py-lg"
      aria-label="Main navigation"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-[330] text-canvas-light tracking-wide [font-feature-settings:'ss03']"
        >
          SiapLaundry
        </Link>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline-dark" size="sm">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline-dark" size="sm">
              Daftar
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-canvas-light"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 pb-4">
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline-dark" size="sm" className="w-full">
              Masuk
            </Button>
          </Link>
          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline-dark" size="sm" className="w-full">
              Daftar
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

function NavbarLight({ mobileMenuOpen, setMobileMenuOpen }: NavbarInternalProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Fetch notifikasi dari API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data ?? []);
    } catch {
      // silent
    }
  }, [isAuthenticated, setNotifications]);

  useEffect(() => {
    fetchNotifications();
    // Poll setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    markAllAsRead();
    try { await api.patch("/notifications", { markAll: true }); } catch { /* silent */ }
  };

  const handleMarkRead = async (id: string, relatedId?: string | null, type?: string) => {
    markAsRead(id);
    try { await api.patch("/notifications", { id }); } catch { /* silent */ }
    setBellOpen(false);
    // Navigasi ke detail order jika notifikasi terkait order
    if (type === "order" && relatedId) {
      const role = user?.role;
      if (role === "buyer") router.push(`/order/${relatedId}`);
      else if (role === "seller") router.push(`/seller/orders/${relatedId}`);
      else if (role === "driver") router.push(`/driver/orders/${relatedId}`);
    }
  };

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/my-orders", label: "Pesanan" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <nav
      className="bg-canvas-light text-ink px-xl py-lg sticky top-0 z-50 border-b border-hairline-light"
      aria-label="Main navigation"
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-[330] text-ink tracking-wide [font-feature-settings:'ss03']">
          SiapLaundry
        </Link>

        {isAuthenticated ? (
          <>
            {/* Nav links desktop */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="font-body text-base font-[420] text-ink hover:text-shade-60 transition-colors [font-feature-settings:'ss03']">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Bell + Avatar desktop */}
            <div className="hidden md:flex items-center gap-4">
              {/* Notification Bell Dropdown */}
              <div ref={bellRef} className="relative">
                <button
                  onClick={() => setBellOpen((v) => !v)}
                  className="relative p-2 text-ink hover:text-shade-60 transition-colors"
                  aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[11px] font-[500] leading-none px-1" aria-hidden="true">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {bellOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[360px] bg-canvas-light rounded-lg border border-hairline-light shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-hairline-light">
                      <h3 className="font-body text-[14px] font-[550] text-ink">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead}
                          className="text-[12px] text-shade-50 hover:text-ink transition-colors">
                          Tandai semua dibaca
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-[13px] text-shade-40">Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleMarkRead(notif.id, notif.relatedId, notif.type)}
                            className={[
                              "w-full text-left px-4 py-3 border-b border-hairline-light last:border-b-0",
                              "hover:bg-canvas-cream transition-colors",
                              !notif.isRead ? "bg-blue-50/50" : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              )}
                              <div className={!notif.isRead ? "" : "pl-5"}>
                                <p className="text-[13px] font-[550] text-ink leading-[1.4]">{notif.title}</p>
                                <p className="text-[12px] text-shade-50 mt-0.5 leading-[1.5]">{notif.message}</p>
                                <p className="text-[11px] text-shade-40 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                  })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/profile" aria-label="Profile">
                <Avatar src={user?.profilePhoto} name={user?.name} size="sm" />
              </Link>
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"><Button variant="outline-light" size="sm">Masuk</Button></Link>
            <Link href="/register"><Button variant="primary" size="sm">Daftar</Button></Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-ink" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
          {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 pb-4 border-t border-hairline-light pt-4">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="font-body text-base font-[420] text-ink py-2 [font-feature-settings:'ss03']"
                  onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-2 border-t border-hairline-light mt-2">
                <div className="relative p-2 text-ink">
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[11px] font-[500] leading-none px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <Link href="/profile" aria-label="Profile" onClick={() => setMobileMenuOpen(false)}>
                  <Avatar src={user?.profilePhoto} name={user?.name} size="sm" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline-light" size="sm" className="w-full">Masuk</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Daftar</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
