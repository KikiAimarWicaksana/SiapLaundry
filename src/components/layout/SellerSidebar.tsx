"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotificationStore } from "@/stores/notificationStore";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  showBadge?: boolean;
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="14" x2="15" y2="14" />
      <line x1="9" y1="18" x2="12" y2="18" />
    </svg>
  );
}

function ServicesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function ReviewsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function SellerSidebar() {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const navItems: NavItem[] = [
    {
      href: "/seller/dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      href: "/seller/orders",
      label: "Orders",
      icon: <OrdersIcon />,
      showBadge: true,
    },
    {
      href: "/seller/services",
      label: "Services",
      icon: <ServicesIcon />,
    },
    {
      href: "/seller/reviews",
      label: "Reviews",
      icon: <ReviewsIcon />,
    },
    {
      href: "/seller/profile",
      label: "Profile",
      icon: <ProfileIcon />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/seller/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed top-0 left-0 h-full w-[240px] bg-canvas-light border-r border-hairline-light flex flex-col z-40"
      aria-label="Seller navigation"
    >
      {/* Logo */}
      <div className="px-xl py-lg border-b border-hairline-light">
        <Link
          href="/seller/dashboard"
          className="font-display text-xl font-[330] text-ink tracking-wide [font-feature-settings:'ss03']"
        >
          SiapLaundry
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-md py-lg" aria-label="Seller menu">
        <ul className="flex flex-col gap-xs">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-md px-lg py-md rounded-lg
                    font-body text-sm font-[450] transition-colors
                    [font-feature-settings:'ss03']
                    ${
                      active
                        ? "bg-aloe-10 text-ink font-[550]"
                        : "text-shade-60 hover:bg-canvas-cream hover:text-ink"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.showBadge && unreadCount > 0 && (
                    <span
                      className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[11px] font-[500] leading-none px-1"
                      aria-label={`${unreadCount} order baru`}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default SellerSidebar;
