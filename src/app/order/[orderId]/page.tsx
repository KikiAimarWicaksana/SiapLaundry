"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { TrackingMap } from "@/components/map/TrackingMap";
import api from "@/lib/api";
import type { OrderStatus } from "@/types/order";
import type { TimelineEvent } from "@/components/order/OrderTimeline";

interface OrderDetail {
  id: string;
  orderNumber: string;
  buyerId: string;
  seller: { id: string; laundryName: string; photos: string[]; latitude: number; longitude: number };
  service: { id: string; serviceName: string; pricePerUnit: number; unit: string };
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupDate: string;
  pickupTimeSlot: string;
  pickupDriver: { id: string; name: string; phone: string; vehiclePlate: string } | null;
  deliveryDriver: { id: string; name: string; phone: string; vehiclePlate: string } | null;
  estimatedWeight: number | null;
  actualWeight: number | null;
  estimatedPrice: number | null;
  finalPrice: number | null;
  deliveryFee: number;
  totalPrice: number | null;
  status: OrderStatus;
  buyerNotes: string | null;
  paymentStatus: string;
  createdAt: string;
  statusHistory: { status: string; createdAt: string; notes?: string | null }[];
  driverPosition: { lat: number; lng: number } | null;
}

const STATUS_LABELS: Record<string, string> = {
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

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Pagi (08:00 - 12:00)",
  afternoon: "Siang (12:00 - 17:00)",
  evening: "Sore (17:00 - 20:00)",
};

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

interface DriverInfoSectionProps {
  title: string;
  driver: { id: string; name: string; phone: string; vehiclePlate: string };
  orderId: string;
}

function DriverInfoSection({ title, driver, orderId }: DriverInfoSectionProps) {
  return (
    <section className="bg-canvas-light rounded-lg border border-hairline-light p-4 md:p-6">
      <h2 className="font-body text-[14px] font-[550] text-shade-50 uppercase tracking-wider mb-3 [font-feature-settings:'ss03']">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <Avatar src={undefined} name={driver.name} size="lg" />
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

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get(`/buyer/orders/${orderId}`);
        setOrder(res.data.data);
      } catch {
        setError("Order tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();

    // Poll posisi kurir setiap 10 detik jika sedang dalam perjalanan
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/buyer/orders/${orderId}`);
        const data: OrderDetail = res.data.data;
        if (data.driverPosition) {
          setOrder((prev) => prev ? { ...prev, driverPosition: data.driverPosition } : prev);
        }
      } catch {
        // silent
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-cream">
        <Navbar variant="light" />
        <main className="max-w-[720px] mx-auto px-xl py-xl space-y-4 animate-pulse">
          <div className="h-6 w-32 bg-shade-10 rounded" />
          <div className="h-24 bg-shade-10 rounded-lg" />
          <div className="h-48 bg-shade-10 rounded-lg" />
          <div className="h-32 bg-shade-10 rounded-lg" />
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-canvas-cream">
        <Navbar variant="light" />
        <main className="max-w-[720px] mx-auto px-xl py-xl text-center">
          <p className="text-shade-50 text-[16px] py-12">{error ?? "Order tidak ditemukan."}</p>
          <Link href="/my-orders">
            <Button variant="primary" size="md">Kembali ke Pesanan Saya</Button>
          </Link>
        </main>
      </div>
    );
  }

  const timelineEvents: TimelineEvent[] = order.statusHistory.map((h) => ({
    status: h.status,
    label: STATUS_LABELS[h.status] ?? h.status,
    timestamp: h.createdAt ? formatTimestamp(h.createdAt) : null,
  }));

  const isDriverOnWay =
    order.status === "driver_on_way_pickup" || order.status === "driver_on_way_delivery";

  const showTrackDriver = isDriverOnWay;
  const showReviewButton = order.status === "completed";
  const laundryPrice = order.finalPrice ?? order.estimatedPrice ?? 0;

  // Tentukan destination peta: saat pickup → lokasi buyer, saat delivery → lokasi buyer
  const mapDestination = {
    lat: order.pickupLatitude,
    lng: order.pickupLongitude,
  };

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />

      <main className="max-w-[720px] mx-auto px-xl py-xl">
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-1 font-body text-[14px] font-[420] text-shade-50 hover:text-ink transition-colors mb-4 [font-feature-settings:'ss03']"
        >
          <ArrowLeftIcon />
          Kembali ke Pesanan
        </Link>

        {/* Header */}
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
                {order.service.serviceName} • {order.actualWeight ?? order.estimatedWeight ?? "—"} {order.service.unit}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </section>

        {/* Peta tracking — tampil saat kurir sedang dalam perjalanan */}
        {isDriverOnWay && (
          <section className="bg-canvas-light rounded-lg border border-hairline-light p-4 md:p-6 mb-4">
            <h2 className="font-body text-[14px] font-[550] text-shade-50 uppercase tracking-wider mb-3 [font-feature-settings:'ss03']">
              Lacak Kurir
            </h2>
            <TrackingMap
              destination={mapDestination}
              driverPosition={order.driverPosition ?? undefined}
              destinationLabel="Lokasi Anda"
              height="300px"
              showRoute={!!order.driverPosition}
            />
            {!order.driverPosition && (
              <p className="text-[12px] text-shade-50 mt-2 text-center">
                Menunggu data lokasi kurir...
              </p>
            )}
          </section>
        )}

        {/* Timeline */}
        <section className="bg-canvas-light rounded-lg border border-hairline-light p-4 md:p-6 mb-4">
          <h2 className="font-body text-[14px] font-[550] text-shade-50 uppercase tracking-wider mb-4 [font-feature-settings:'ss03']">
            Status Order
          </h2>
          <OrderTimeline events={timelineEvents} currentStatus={order.status} />
        </section>

        {/* Info Kurir Pickup */}
        {order.pickupDriver && (
          <div className="mb-4">
            <DriverInfoSection title="Kurir Pickup" driver={order.pickupDriver} orderId={order.id} />
          </div>
        )}

        {/* Info Kurir Delivery */}
        {order.deliveryDriver && (
          <div className="mb-4">
            <DriverInfoSection title="Kurir Delivery" driver={order.deliveryDriver} orderId={order.id} />
          </div>
        )}

        {/* Rincian Pembayaran */}
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
              <span className="font-body text-[16px] font-[550] text-ink [font-feature-settings:'ss03']">Total</span>
              <span className="font-body text-[16px] font-[550] text-ink [font-feature-settings:'ss03']">
                {formatCurrency(order.totalPrice ?? laundryPrice + order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-body text-[13px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                Status Pembayaran
              </span>
              <span className={["font-body text-[13px] font-[500] [font-feature-settings:'ss03']",
                order.paymentStatus === "paid" ? "text-green-700" : "text-yellow-700"].join(" ")}>
                {order.paymentStatus === "paid" ? "Lunas" : "Belum Dibayar"}
              </span>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        {(showTrackDriver || showReviewButton) && (
          <section className="flex flex-col gap-3">
            {showTrackDriver && (
              <div className="w-full p-3 bg-aloe-10 rounded-lg text-center">
                <p className="text-[13px] text-ink font-[500]">
                  <LocationIcon />
                  Kurir sedang dalam perjalanan — peta di atas diperbarui otomatis
                </p>
              </div>
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
