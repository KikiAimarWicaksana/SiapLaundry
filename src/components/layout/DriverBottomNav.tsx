"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
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

function MapPinIcon({ className }: { className?: string }) {
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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

function ChatNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    href: "/driver/dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    href: "/driver/orders",
    label: "Orders",
    icon: <OrdersIcon />,
  },
  {
    href: "/chat",
    label: "Chat",
    icon: <ChatNavIcon />,
  },
  {
    href: "/driver/map",
    label: "Map",
    icon: <MapPinIcon />,
  },
  {
    href: "/driver/profile",
    label: "Profile",
    icon: <ProfileIcon />,
  },
];

export function DriverBottomNav() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const [orderCount, setOrderCount] = React.useState(0);
  const [unreadChatCount, setUnreadChatCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchCounts() {
      try {
        const { default: api } = await import('@/lib/api');
        const [ordersRes, notifsRes] = await Promise.all([
          api.get('/driver/orders'),
          api.get('/notifications'),
        ]);
        
        const { pickup = [], delivery = [] } = ordersRes.data.data ?? {};
        setOrderCount(pickup.length + delivery.length);

        const notifs = notifsRes.data.data ?? [];
        const chatCount = notifs.filter((n: { type: string; isRead: boolean }) => n.type === 'chat' && !n.isRead).length;
        setUnreadChatCount(chatCount);
      } catch {
        // silent
      }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    if (href === "/driver/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile, shown on md+ */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-full w-[240px] bg-canvas-light border-r border-hairline-light flex-col z-40"
        aria-label="Driver navigation"
      >
        {/* Logo */}
        <div className="px-xl py-lg border-b border-hairline-light">
          <Link
            href="/driver/dashboard"
            className="font-display text-xl font-[330] text-ink tracking-wide [font-feature-settings:'ss03']"
          >
            SiapLaundry
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-md py-lg" aria-label="Driver menu">
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
                    {item.label === "Orders" && orderCount > 0 && (
                      <span className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[11px] font-[500] leading-none px-1">
                        {orderCount > 99 ? "99+" : orderCount}
                      </span>
                    )}
                    {item.label === "Chat" && unreadChatCount > 0 && (
                      <span className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[11px] font-[500] leading-none px-1">
                        {unreadChatCount > 99 ? "99+" : unreadChatCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-md py-lg border-t border-hairline-light">
          <button
            onClick={() => logout()}
            className="flex items-center gap-md px-lg py-md rounded-lg w-full
              font-body text-sm font-[450] text-shade-60 transition-colors
              [font-feature-settings:'ss03']
              hover:bg-red-50 hover:text-red-600"
            aria-label="Keluar dari akun"
          >
            <span className="flex-shrink-0"><LogoutIcon /></span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav - shown on mobile, hidden on md+ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-canvas-light border-t border-hairline-light md:hidden"
        aria-label="Driver mobile navigation"
      >
        <ul className="flex items-center justify-around h-[60px]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center gap-xxs px-sm py-xs
                    font-body text-[11px] font-[450] transition-colors
                    [font-feature-settings:'ss03']
                    ${
                      active
                        ? "text-ink"
                        : "text-shade-50 hover:text-ink"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={`
                      flex items-center justify-center w-[32px] h-[32px] rounded-pill transition-colors
                      ${active ? "bg-aloe-10" : ""}
                    `}
                  >
                    {item.icon}
                    {item.label === "Orders" && orderCount > 0 && (
                      <span className="absolute -top-[4px] -right-[4px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[9px] font-[600] leading-none px-1">
                        {orderCount > 99 ? "99+" : orderCount}
                      </span>
                    )}
                    {item.label === "Chat" && unreadChatCount > 0 && (
                      <span className="absolute -top-[4px] -right-[4px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-[9px] font-[600] leading-none px-1">
                        {unreadChatCount > 99 ? "99+" : unreadChatCount}
                      </span>
                    )}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          {/* Logout button */}
          <li>
            <button
              onClick={() => logout()}
              className="flex flex-col items-center justify-center gap-xxs px-sm py-xs
                font-body text-[11px] font-[450] text-shade-50 transition-colors
                [font-feature-settings:'ss03'] hover:text-red-600"
              aria-label="Keluar dari akun"
            >
              <span className="flex items-center justify-center w-[32px] h-[32px] rounded-pill">
                <LogoutIcon />
              </span>
              <span>Keluar</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default DriverBottomNav;
