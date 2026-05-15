import React from "react";
import type { OrderStatus } from "@/types/order";

export interface BadgeProps {
  variant?: "mint" | "shade";
  children: React.ReactNode;
  className?: string;
}

const badgeVariantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  mint: "bg-aloe-10 text-ink",
  shade: "bg-shade-30 text-ink",
};

export function Badge({
  variant = "mint",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-pill",
        "px-[12px] py-[4px]",
        "text-[12px] font-[400] leading-[1.2] tracking-[0.72px]",
        "[font-feature-settings:'ss03']",
        badgeVariantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

// OrderStatusBadge

const statusConfig: Record<
  OrderStatus,
  { label: string; colorClass: string }
> = {
  pending_confirmation: { label: "Menunggu Konfirmasi", colorClass: "bg-orange-100 text-orange-800" },
  confirmed: { label: "Dikonfirmasi", colorClass: "bg-blue-100 text-blue-800" },
  pending_pickup: { label: "Menunggu Pickup", colorClass: "bg-yellow-100 text-yellow-800" },
  driver_on_way_pickup: { label: "Sedang Dijemput", colorClass: "bg-blue-100 text-blue-800" },
  picked_up: { label: "Pakaian Diambil", colorClass: "bg-blue-100 text-blue-800" },
  at_laundry: { label: "Di Laundry", colorClass: "bg-green-100 text-green-800" },
  payment_pending: { label: "Menunggu Pembayaran", colorClass: "bg-yellow-100 text-yellow-800" },
  washing: { label: "Sedang Dicuci", colorClass: "bg-green-100 text-green-800" },
  ready_for_delivery: { label: "Siap Diantar", colorClass: "bg-purple-100 text-purple-800" },
  driver_on_way_delivery: { label: "Sedang Diantar", colorClass: "bg-orange-100 text-orange-800" },
  delivered: { label: "Sudah Diantar", colorClass: "bg-green-100 text-green-800" },
  completed: { label: "Selesai", colorClass: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", colorClass: "bg-red-100 text-red-800" },
};

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, colorClass: "bg-shade-30 text-ink" };

  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-pill",
        "px-[12px] py-[4px]",
        "text-[12px] font-[500] leading-[1.2] tracking-[0.72px]",
        "[font-feature-settings:'ss03']",
        config.colorClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {config.label}
    </span>
  );
}
