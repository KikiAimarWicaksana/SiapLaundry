"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Order, OrderStatus } from "@/types/order";
import type { TimelineEvent } from "@/components/order/OrderTimeline";

// --- Mock Data (reused from my-orders page) ---
const MOCK_ORDERS: Order[] = [
  {
    id: "order-1",
    orderNumber: "SL20260513001",
    buyerId: "buyer-1",
    seller: {
      id: "seller-1",
      laundryName: "Laundry Bersih Cemerlang",
      photos: ["/placeholder-laundry.jpg"],
    },
    service: {
      id: "service-1",
      serviceName: "Cuci Setrika",
      pricePerUnit: 7000,
      unit: "kg",
    },
    pickupAddress: "Jl. Merdeka No. 10, Bandung",
    pickupLatitude: -6.917,
    pickupLongitude: 107.619,
    pickupDate: "2026-05-13",
    pickupTimeSlot: "morning",
    pickupDriver: {
      id: "driver-1",
      name: "Budi Santoso",
      phone: "081234567890",
      vehiclePlate: "D 1234 AB",
    },
    estimatedWeight: 5,
    actualWeight: 4.8,
    estimatedPrice: 35000,
    finalPrice: 33600,
    deliveryFee: 5000,
    totalPrice: 38600,
    status: "washing",
    paymentStatus: "pending",
    createdAt: "2026-05-13T08:30:00Z",
    statusHistory: [
      { status: "pending_pickup", createdAt: "2026-05-13T08:30:00Z" },
      { status: "driver_on_way_pickup", createdAt: "2026-05-13T09:00:00Z", actorName: "Budi Santoso" },
      { status: "picked_up", createdAt: "2026-05-13T09:25:00Z", actorName: "Budi Santoso" },
      { status: "at_laundry", createdAt: "2026-05-13T10:00:00Z", actorName: "Laundry Bersih Cemerlang" },
      { status: "washing", createdAt: "2026-05-13T10:30:00Z", actorName: "Laundry Bersih Cemerlang" },
    ],
  },
  {
    id: "order-2",
    orderNumber: "SL20260512002",
    buyerId: "buyer-1",
    seller: {
      id: "seller-2",
      laundryName: "Super Clean Laundry",
      photos: ["/placeholder-laundry.jpg"],
    },
    service: {
      id: "service-2",
      serviceName: "Dry Clean",
      pricePerUnit: 15000,
      unit: "pcs",
    },
    pickupAddress: "Jl. Asia Afrika No. 5, Bandung",
    pickupLatitude: -6.921,
    pickupLongitude: 107.607,
    pickupDate: "2026-05-12",
    pickupTimeSlot: "afternoon",
    pickupDriver: {
      id: "driver-2",
      name: "Andi Wijaya",
      phone: "081298765432",
      vehiclePlate: "D 5678 CD",
    },
    deliveryDriver: {
      id: "driver-3",
      name: "Rudi Hartono",
      phone: "081211112222",
      vehiclePlate: "D 9012 EF",
    },
    estimatedWeight: 3,
    actualWeight: 3,
    estimatedPrice: 45000,
    finalPrice: 45000,
    deliveryFee: 5000,
    totalPrice: 50000,
    status: "driver_on_way_delivery",
    paymentStatus: "paid",
    createdAt: "2026-05-12T14:00:00Z",
    statusHistory: [
      { status: "pending_pickup", createdAt: "2026-05-12T14:00:00Z" },
      { status: "driver_on_way_pickup", createdAt: "2026-05-12T14:30:00Z", actorName: "Andi Wijaya" },
      { status: "picked_up", createdAt: "2026-05-12T15:00:00Z", actorName: "Andi Wijaya" },
      { status: "at_laundry", createdAt: "2026-05-12T15:30:00Z", actorName: "Super Clean Laundry" },
      { status: "washing", createdAt: "2026-05-12T16:00:00Z", actorName: "Super Clean Laundry" },
      { status: "ready_for_delivery", createdAt: "2026-05-13T08:00:00Z", actorName: "Super Clean Laundry" },
      { status: "driver_on_way_delivery", createdAt: "2026-05-13T09:00:00Z", actorName: "Rudi Hartono" },
    ],
  },
  {
    id: "order-3",
    orderNumber: "SL20260510003",
    buyerId: "buyer-1",
    seller: {
      id: "seller-1",
      laundryName: "Laundry Bersih Cemerlang",
      photos: ["/placeholder-laundry.jpg"],
    },
    service: {
      id: "service-1",
      serviceName: "Cuci Setrika",
      pricePerUnit: 7000,
      unit: "kg",
    },
    pickupAddress: "Jl. Merdeka No. 10, Bandung",
    pickupLatitude: -6.917,
    pickupLongitude: 107.619,
    pickupDate: "2026-05-10",
    pickupTimeSlot: "morning",
    pickupDriver: {
      id: "driver-1",
      name: "Budi Santoso",
      phone: "081234567890",
      vehiclePlate: "D 1234 AB",
    },
    deliveryDriver: {
      id: "driver-1",
      name: "Budi Santoso",
      phone: "081234567890",
      vehiclePlate: "D 1234 AB",
    },
    estimatedWeight: 4,
    actualWeight: 3.5,
    estimatedPrice: 28000,
    finalPrice: 24500,
    deliveryFee: 5000,
    totalPrice: 29500,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2026-05-10T09:00:00Z",
    statusHistory: [
      { status: "pending_pickup", createdAt: "2026-05-10T09:00:00Z" },
      { status: "driver_on_way_pickup", createdAt: "2026-05-10T09:30:00Z", actorName: "Budi Santoso" },
      { status: "picked_up", createdAt: "2026-05-10T10:00:00Z", actorName: "Budi Santoso" },
      { status: "at_laundry", createdAt: "2026-05-10T10:30:00Z", actorName: "Laundry Bersih Cemerlang" },
      { status: "washing", createdAt: "2026-05-10T11:00:00Z", actorName: "Laundry Bersih Cemerlang" },
      { status: "ready_for_delivery", createdAt: "2026-05-11T08:00:00Z", actorName: "Laundry Bersih Cemerlang" },
      { status: "driver_on_way_delivery", createdAt: "2026-05-11T09:00:00Z", actorName: "Budi Santoso" },
      { status: "delivered", createdAt: "2026-05-11T09:30:00Z", actorName: "Budi Santoso" },
      { status: "completed", createdAt: "2026-05-11T09:35:00Z" },
    ],
  },
];

// --- Helpers ---

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending_pickup: "Menunggu Penjemputan",
    driver_on_way_pickup: "Kurir Menuju Lokasi",
    picked_up: "Pakaian Dijemput",
    at_laundry: "Di Laundry",
    washing: "Sedang Dicuci",
    ready_for_delivery: "Siap Diantar",
    driver_on_way_delivery: "Kurir Mengantar",
    delivered: "Terkirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return labels[status];
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

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function buildTimelineEvents(order: Order): TimelineEvent[] {
  // Build full timeline from status history
  return order.statusHistory.map((event) => ({
    status: event.status,
    label: getStatusLabel(event.status),
    timestamp: event.createdAt ? formatTimestamp(event.createdAt) : null,
    actor: event.actorName,
    vehiclePlate:
      event.status === "driver_on_way_pickup"
        ? order.pickupDriver?.vehiclePlate
        : event.status === "driver_on_way_delivery"
          ? order.deliveryDriver?.vehiclePlate
          : undefined,
  }));
}

function shouldShowTrackDriver(status: OrderStatus): boolean {
  return status === "driver_on_way_pickup" || status === "driver_on_way_delivery";
}

// --- Icons ---

function PhoneIcon() {
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
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
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

function StarIcon() {
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
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

// --- Driver Info Section Component ---

interface DriverInfoSectionProps {
  title: string;
  driver: {
    id: string;
    name: string;
    phone: string;
    vehiclePlate: string;
    profilePhoto?: string;
  };
  orderId: string;
}

function DriverInfoSection({ title, driver, orderId }: DriverInfoSectionProps) {
  return (
    <section className="bg-canvas-light rounded-lg border border-hairline-light p-4 md:p-6">
      <h2 className="font-body text-[14px] font-[550] text-shade-50 uppercase tracking-wider mb-3 [font-feature-settings:'ss03']">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <Avatar
          src={driver.profilePhoto}
          name={driver.name}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <p className="font-body text-[15px] font-[550] text-ink leading-tight [font-feature-settings:'ss03']">
            {driver.name}
          </p>
          <p className="font-body text-[13px] font-[420] text-shade-50 mt-0.5 [font-feature-settings:'ss03'] flex items-center gap-1">
            <PhoneIcon />
            {driver.phone}
          </p>
          <p className="font-body text-[13px] font-[420] text-shade-50 mt-0.5 [font-feature-settings:'ss03']">
            Plat: {driver.vehiclePlate}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <Link href={`/chat?order=${orderId}&contact=${driver.id}`}>
          <Button variant="outline-light" size="sm" className="gap-1.5">
            <ChatIcon />
            Chat Kurir
          </Button>
        </Link>
      </div>
    </section>
  );
}

/**
 * Order Detail page — displays full order information including timeline,
 * driver info, payment breakdown, and conditional action buttons.
 *
 * Validates: Requirements 8.6, 8.7, 8.8, 8.9
 */
export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  // Find the order from mock data
  const order = MOCK_ORDERS.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-canvas-cream">
        <Navbar variant="light" />
        <main className="max-w-[1280px] mx-auto px-xl py-xl">
          <p className="font-body text-[16px] font-[420] text-shade-50 text-center py-12 [font-feature-settings:'ss03']">
            Order tidak ditemukan.
          </p>
          <div className="text-center">
            <Link href="/my-orders">
              <Button variant="primary" size="md">
                Kembali ke Pesanan Saya
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const timelineEvents = buildTimelineEvents(order);
  const showTrackDriver = shouldShowTrackDriver(order.status);
  const showReviewButton = order.status === "completed";
  const laundryPrice = order.finalPrice ?? order.estimatedPrice ?? 0;
  const paymentStatusLabel = order.paymentStatus === "paid" ? "Lunas" : "Belum Dibayar";

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />

      <main className="max-w-[720px] mx-auto px-xl py-xl">
        {/* Back navigation */}
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-1 font-body text-[14px] font-[420] text-shade-50 hover:text-ink transition-colors mb-4 [font-feature-settings:'ss03']"
        >
          <ArrowLeftIcon />
          Kembali ke Pesanan
        </Link>

        {/* Section 1: Order Header */}
        <section className="bg-canvas-light rounded-lg border border-hairline-light p-4 md:p-6 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-body text-[12px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                {order.orderNumber}
              </p>
              <h1 className="font-display text-[22px] font-[330] text-ink mt-1 [font-feature-settings:'ss03']">
                {order.seller.laundryName}
              </h1>
              <p className="font-body text-[13px] font-[420] text-shade-50 mt-1 [font-feature-settings:'ss03']">
                {order.service.serviceName} • {order.actualWeight ?? order.estimatedWeight} {order.service.unit}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </section>

        {/* Section 2: Full OrderTimeline */}
        <section className="bg-canvas-light rounded-lg border border-hairline-light p-4 md:p-6 mb-4">
          <h2 className="font-body text-[14px] font-[550] text-shade-50 uppercase tracking-wider mb-4 [font-feature-settings:'ss03']">
            Status Order
          </h2>
          <OrderTimeline events={timelineEvents} currentStatus={order.status} />
        </section>

        {/* Section 3: Info Kurir (Pickup) */}
        {order.pickupDriver && (
          <div className="mb-4">
            <DriverInfoSection
              title="Kurir Pickup"
              driver={order.pickupDriver}
              orderId={order.id}
            />
          </div>
        )}

        {/* Section 4: Info Kurir (Delivery) */}
        {order.deliveryDriver && (
          <div className="mb-4">
            <DriverInfoSection
              title="Kurir Delivery"
              driver={order.deliveryDriver}
              orderId={order.id}
            />
          </div>
        )}

        {/* Section 5: Rincian Pembayaran */}
        <section className="bg-canvas-light rounded-lg border border-hairline-light p-4 md:p-6 mb-4">
          <h2 className="font-body text-[14px] font-[550] text-shade-50 uppercase tracking-wider mb-4 [font-feature-settings:'ss03']">
            Rincian Pembayaran
          </h2>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-body text-[14px] font-[420] text-ink [font-feature-settings:'ss03']">
                Biaya Laundry ({order.service.serviceName})
              </span>
              <span className="font-body text-[14px] font-[420] text-ink [font-feature-settings:'ss03']">
                {formatCurrency(laundryPrice)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-body text-[14px] font-[420] text-ink [font-feature-settings:'ss03']">
                Biaya Antar-Jemput
              </span>
              <span className="font-body text-[14px] font-[420] text-ink [font-feature-settings:'ss03']">
                {formatCurrency(order.deliveryFee)}
              </span>
            </div>

            <div className="border-t border-hairline-light my-2" />

            <div className="flex justify-between items-center">
              <span className="font-body text-[16px] font-[550] text-ink [font-feature-settings:'ss03']">
                Total
              </span>
              <span className="font-body text-[16px] font-[550] text-ink [font-feature-settings:'ss03']">
                {formatCurrency(order.totalPrice ?? laundryPrice + order.deliveryFee)}
              </span>
            </div>

            <div className="flex justify-between items-center mt-1">
              <span className="font-body text-[13px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                Status Pembayaran
              </span>
              <span
                className={[
                  "font-body text-[13px] font-[500] [font-feature-settings:'ss03']",
                  order.paymentStatus === "paid" ? "text-green-700" : "text-yellow-700",
                ].join(" ")}
              >
                {paymentStatusLabel}
              </span>
            </div>
          </div>
        </section>

        {/* Section 6: Action Buttons */}
        {(showTrackDriver || showReviewButton) && (
          <section className="flex flex-col gap-3">
            {showTrackDriver && (
              <Link href={`/order/${order.id}?track=true`} className="w-full">
                <Button variant="aloe" size="lg" className="w-full gap-2">
                  <LocationIcon />
                  Lacak Kurir
                </Button>
              </Link>
            )}

            {showReviewButton && (
              <Link href={`/order/${order.id}/review`} className="w-full">
                <Button variant="primary" size="lg" className="w-full gap-2">
                  <StarIcon />
                  Beri Rating &amp; Ulasan
                </Button>
              </Link>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
