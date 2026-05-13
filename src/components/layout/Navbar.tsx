"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

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
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

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
        <Link
          href="/"
          className="font-display text-xl font-[330] text-ink tracking-wide [font-feature-settings:'ss03']"
        >
          SiapLaundry
        </Link>

        {isAuthenticated ? (
          <>
            {/* Center nav links (desktop) — logged in */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-base font-[420] text-ink hover:text-shade-60 transition-colors [font-feature-settings:'ss03']"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side: notification bell + avatar (desktop) */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/notifications"
                className="relative p-2 text-ink hover:text-shade-60 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[11px] font-[500] leading-none px-1"
                    aria-hidden="true"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/profile" aria-label="Profile">
                <Avatar src={user?.profilePhoto} name={user?.name} size="sm" />
              </Link>
            </div>
          </>
        ) : (
          /* Right side: Masuk + Daftar (desktop) — not logged in */
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline-light" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Daftar
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 pb-4 border-t border-hairline-light pt-4">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-base font-[420] text-ink py-2 [font-feature-settings:'ss03']"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-2 border-t border-hairline-light mt-2">
                <Link
                  href="/notifications"
                  className="relative p-2 text-ink"
                  aria-label="Notifications"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[11px] font-[500] leading-none px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" aria-label="Profile" onClick={() => setMobileMenuOpen(false)}>
                  <Avatar src={user?.profilePhoto} name={user?.name} size="sm" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline-light" size="sm" className="w-full">
                  Masuk
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
