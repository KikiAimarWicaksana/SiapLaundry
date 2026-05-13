"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

// Mock data for a single driver order detail
const orderDetail = {
  id: "ord-101",
  orderNumber: "SL20260601001",
  status: "driver_on_way_pickup" as const,
  type: "pickup" as const, // "pickup" | "delivery"
  buyer: {
    name: "Andi Pratama",
    phone: "081234567890",
    avatar: null,
  },
  address: "Jl. Merdeka No. 45, RT 03/RW 05, Kelurahan Citarum, Kecamatan Bandung Wetan, Bandung 40115",
  latitude: -6.9175,
  longitude: 107.6191,
  laundryName: "Fresh Laundry",
  service: "Cuci Setrika",
  estimatedWeight: 5,
  deliveryFee: 10000,
  notes: "Tolong hati-hati dengan baju putih, jangan dicampur.",
  createdAt: "2026-06-01T10:30:00Z",
};

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-5 w-5 text-shade-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function getStatusAction(status: string, type: string) {
  if (type === "pickup") {
    if (status === "pending_pickup") return "Ambil Order";
    if (status === "driver_on_way_pickup") return "Konfirmasi Pickup";
    if (status === "picked_up") return "Antar ke Laundry";
  }
  if (type === "delivery") {
    if (status === "ready_for_delivery") return "Ambil dari Laundry";
    if (status === "driver_on_way_delivery") return "Konfirmasi Delivery";
  }
  return null;
}

export default function DriverOrderDetailPage() {
  const actionLabel = getStatusAction(orderDetail.status, orderDetail.type);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${orderDetail.latitude},${orderDetail.longitude}`;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/driver/orders"
        className="inline-flex items-center gap-1 text-[13px] text-shade-50 hover:text-ink mb-4 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Kembali ke Order
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[24px] font-[500] leading-[1.3] tracking-[0.3px] text-ink">
            Detail Order
          </h1>
          <p className="text-[13px] text-shade-50 mt-1">{orderDetail.orderNumber}</p>
        </div>
        <OrderStatusBadge status={orderDetail.status} />
      </div>

      <div className="flex flex-col gap-4">
        {/* Buyer Info */}
        <Card variant="default" className="flex flex-col gap-4">
          <h2 className="text-[15px] font-[600] text-ink">Info Pembeli</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-shade-30 flex items-center justify-center">
                <span className="text-[14px] font-[600] text-ink">
                  {orderDetail.buyer.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-[14px] font-[500] text-ink">{orderDetail.buyer.name}</p>
                <p className="text-[12px] text-shade-50">{orderDetail.buyer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/chat">
                <Button variant="outline-light" size="sm" className="gap-1">
                  <ChatIcon />
                  Chat
                </Button>
              </Link>
              <a href={`tel:${orderDetail.buyer.phone}`}>
                <Button variant="outline-light" size="sm" className="gap-1">
                  <PhoneIcon />
                  Telepon
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card variant="default" className="flex flex-col gap-4">
          <h2 className="text-[15px] font-[600] text-ink">
            Alamat {orderDetail.type === "pickup" ? "Pickup" : "Delivery"}
          </h2>
          <div className="flex items-start gap-3">
            <LocationIcon />
            <p className="text-[14px] text-ink leading-[1.6]">{orderDetail.address}</p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline-light" size="sm" className="gap-1">
              <MapIcon />
              Buka di Maps
            </Button>
          </a>
        </Card>

        {/* Order Info */}
        <Card variant="default" className="flex flex-col gap-3">
          <h2 className="text-[15px] font-[600] text-ink">Detail Pesanan</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[12px] text-shade-50">Laundry</p>
              <p className="text-[14px] font-[500] text-ink">{orderDetail.laundryName}</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50">Layanan</p>
              <p className="text-[14px] font-[500] text-ink">{orderDetail.service}</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50">Estimasi Berat</p>
              <p className="text-[14px] font-[500] text-ink">{orderDetail.estimatedWeight} kg</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50">Ongkos Kirim</p>
              <p className="text-[14px] font-[500] text-ink">{formatCurrency(orderDetail.deliveryFee)}</p>
            </div>
          </div>
          {orderDetail.notes && (
            <div className="mt-2 p-3 bg-canvas-cream rounded-md">
              <p className="text-[12px] text-shade-50 mb-1">Catatan:</p>
              <p className="text-[13px] text-ink">{orderDetail.notes}</p>
            </div>
          )}
        </Card>

        {/* Action Button */}
        {actionLabel && (
          <div className="pt-2">
            <Button variant="primary" size="lg" className="w-full">
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
