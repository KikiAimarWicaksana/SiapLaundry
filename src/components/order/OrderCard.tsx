"use client";

import React from "react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Order, OrderStatus } from "@/types/order";
import type { TimelineEvent } from "@/components/order/OrderTimeline";

export interface OrderCardProps {
  order: Order;
}

/**
 * Returns the last N timeline events from the order's status history.
 */
function getRecentTimelineEvents(order: Order, count: number): TimelineEvent[] {
  const history = order.statusHistory || [];
  const recent = history.slice(-count);

  return recent.map((event) => ({
    status: event.status,
    label: getStatusLabel(event.status),
    timestamp: event.createdAt
      ? formatTimestamp(event.createdAt)
      : null,
    actor: event.actorName,
  }));
}

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending_confirmation: "Menunggu Konfirmasi Laundry",
    confirmed: "Pesanan Dikonfirmasi",
    pending_pickup: "Menunggu Penjemputan",
    driver_on_way_pickup: "Kurir Menuju Lokasi",
    picked_up: "Pakaian Dijemput",
    at_laundry: "Di Laundry",
    payment_pending: "Menunggu Pembayaran",
    washing: "Sedang Dicuci",
    ready_for_delivery: "Siap Diantar",
    driver_on_way_delivery: "Kurir Mengantar",
    delivered: "Terkirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return labels[status] ?? status;
}

function formatTimestamp(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Determines if the "Lacak Kurir" button should be shown.
 */
function shouldShowTrackDriver(status: OrderStatus): boolean {
  return (
    status === "driver_on_way_pickup" || status === "driver_on_way_delivery"
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DotIcon({ active }: { active?: boolean }) {
  return (
    <span
      className={[
        "block h-2.5 w-2.5 rounded-full",
        active ? "bg-ink" : "bg-shade-30",
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

function ChatIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

/**
 * OrderCard — displays a summary of an order with timeline and action buttons.
 *
 * Shows:
 * - Laundry photo (small thumbnail)
 * - Laundry name
 * - Order number (caption style)
 * - OrderStatusBadge
 * - Timeline ringkas (last 2-3 events)
 * - Action buttons: Chat, Lacak Kurir (conditional), Lihat Detail
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.5
 */
export function OrderCard({ order }: OrderCardProps) {
  const recentEvents = getRecentTimelineEvents(order, 3);
  const showTrackDriver = shouldShowTrackDriver(order.status);
  const laundryPhoto = order.seller.photos?.[0] || "/placeholder-laundry.jpg";

  return (
    <article className="bg-canvas-light rounded-lg border border-hairline-light p-4 md:p-6">
      {/* Header: Laundry info + Status badge */}
      <div className="flex items-start gap-3 mb-4">
        {/* Laundry thumbnail */}
        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-shade-30">
          <img
            src={laundryPhoto}
            alt={order.seller.laundryName}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Laundry name + order number */}
        <div className="flex-1 min-w-0">
          <h3 className="font-body text-[15px] font-[550] text-ink leading-tight truncate [font-feature-settings:'ss03']">
            {order.seller.laundryName}
          </h3>
          <p className="font-body text-[12px] font-[420] text-shade-50 mt-0.5 [font-feature-settings:'ss03']">
            {order.orderNumber}
          </p>
        </div>

        {/* Status badge */}
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline ringkas */}
      {recentEvents.length > 0 && (
        <div className="mb-4 pl-1">
          <ol className="flex flex-col gap-0" aria-label="Timeline ringkas">
            {recentEvents.map((event, index) => {
              const isLast = index === recentEvents.length - 1;
              const isActive = event.status === order.status;

              return (
                <li key={`${event.status}-${index}`} className="relative flex gap-2.5">
                  {/* Vertical connector */}
                  {!isLast && (
                    <span
                      className="absolute left-[5px] top-4 w-0.5 h-[calc(100%-4px)] bg-shade-30"
                      aria-hidden="true"
                    />
                  )}

                  {/* Icon */}
                  <span className="relative z-10 flex h-[14px] w-[14px] shrink-0 items-center justify-center mt-0.5">
                    {!isActive && !isLast ? (
                      <CheckIcon />
                    ) : (
                      <DotIcon active={isActive} />
                    )}
                  </span>

                  {/* Content */}
                  <div className="flex flex-col pb-3">
                    <span
                      className={[
                        "text-[13px] font-[450] leading-tight [font-feature-settings:'ss03']",
                        isActive ? "text-ink" : "text-shade-50",
                      ].join(" ")}
                    >
                      {event.label}
                    </span>
                    {event.timestamp && (
                      <span className="text-[11px] text-shade-40 mt-0.5 [font-feature-settings:'ss03']">
                        {event.timestamp}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline-light">
        {order.status !== "completed" && order.status !== "cancelled" && (
          <Link href={`/chat?order=${order.id}`}>
            <Button variant="outline-light" size="sm" className="gap-1.5">
              <ChatIcon />
              Chat dengan Laundry
            </Button>
          </Link>
        )}

        {showTrackDriver && (
          <Link href={`/order/${order.id}?track=true`}>
            <Button variant="aloe" size="sm" className="gap-1.5">
              <LocationIcon />
              Lacak Kurir
            </Button>
          </Link>
        )}

        <Link href={`/order/${order.id}`}>
          <Button variant="primary" size="sm">
            Lihat Detail Order
          </Button>
        </Link>
      </div>
    </article>
  );
}
