"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TrackingMap } from "@/components/map/TrackingMap";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

interface DriverOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  type: "pickup" | "delivery";
  buyer: { name: string; phone: string };
  address: string;
  latitude: number;
  longitude: number;
  laundryName: string;
  laundryAddress: string;
  laundryLatitude: number;
  laundryLongitude: number;
  service: string;
  estimatedWeight: number | null;
  deliveryFee: number;
  buyerNotes: string | null;
  createdAt: string;
  pickupDate?: string;
  pickupTimeSlot?: string;
}

const STATUS_ACTIONS: Record<string, { label: string; nextStatus: string }> = {
  confirmed: { label: "Mulai Menuju Lokasi Pickup", nextStatus: "driver_on_way_pickup" },
  pending_pickup: { label: "Mulai Menuju Lokasi Pickup", nextStatus: "driver_on_way_pickup" },
  driver_on_way_pickup: { label: "Konfirmasi Sudah Pickup", nextStatus: "picked_up" },
  picked_up: { label: "Antar ke Laundry", nextStatus: "at_laundry" },
  ready_for_delivery: { label: "Mulai Menuju Lokasi Delivery", nextStatus: "driver_on_way_delivery" },
  driver_on_way_delivery: { label: "Konfirmasi Sudah Diantar", nextStatus: "delivered" },
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

function LocationIcon() {
  return (
    <svg className="h-5 w-5 text-shade-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export default function DriverOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<DriverOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get(`/driver/orders/${orderId}`);
        setOrder(res.data.data);
      } catch {
        setError("Gagal memuat detail order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  // Kirim posisi GPS kurir ke server setiap 10 detik saat sedang dalam perjalanan
  const sendLocation = useCallback(async (lat: number, lng: number) => {
    try {
      await api.patch(`/driver/orders/${orderId}`, {
        currentLatitude: lat,
        currentLongitude: lng,
      });
    } catch {
      // silent
    }
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    const isMoving =
      order.status === "driver_on_way_pickup" ||
      order.status === "driver_on_way_delivery";
    if (!isMoving) return;

    // Ambil posisi GPS
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverPosition({ lat: latitude, lng: longitude });
        sendLocation(latitude, longitude);
      },
      () => { /* permission denied atau error */ },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [order?.status, sendLocation, order]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    const action = STATUS_ACTIONS[order.status];
    if (!action) return;

    setUpdating(true);
    try {
      await api.patch(`/driver/orders/${orderId}`, { status: action.nextStatus });
      setOrder((prev) => prev ? { ...prev, status: action.nextStatus } : prev);
    } catch {
      setError("Gagal memperbarui status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-shade-10 rounded" />
        <div className="h-64 bg-shade-10 rounded-lg" />
        <div className="h-32 bg-shade-10 rounded-lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600">
        {error ?? "Order tidak ditemukan."}
      </div>
    );
  }

  const action = STATUS_ACTIONS[order.status];
  const isMoving = order.status === "driver_on_way_pickup" || order.status === "driver_on_way_delivery";

  // Delivery: tujuan pertama = laundry (ambil cucian), tujuan kedua = customer (antar)
  // Pickup: tujuan = lokasi customer
  const isDelivery = order.type === "delivery";

  // Saat delivery dan belum mulai jalan → tuju laundry dulu
  // Saat delivery dan sudah on the way → tuju customer
  const goToLaundryFirst = isDelivery && order.status === "ready_for_delivery";
  const mapDestination = goToLaundryFirst
    ? { lat: order.laundryLatitude, lng: order.laundryLongitude }
    : { lat: order.latitude, lng: order.longitude };
  const destinationLabel = goToLaundryFirst
    ? `Laundry: ${order.laundryName}`
    : isDelivery ? "Lokasi Customer" : "Lokasi Pickup";

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapDestination.lat},${mapDestination.lng}`;

  return (
    <div>
      <Link
        href="/driver/orders"
        className="inline-flex items-center gap-1 text-[13px] text-shade-50 hover:text-ink mb-4 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Kembali ke Order
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[24px] font-[500] leading-[1.3] tracking-[0.3px] text-ink">
            Detail Order
          </h1>
          <p className="text-[13px] text-shade-50 mt-1">{order.orderNumber}</p>
        </div>
        <OrderStatusBadge status={order.status as Parameters<typeof OrderStatusBadge>[0]["status"]} />
      </div>

      <div className="flex flex-col gap-4">
        {/* Peta navigasi */}
        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-[600] text-ink">
              Navigasi ke {destinationLabel}
            </h2>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline-light" size="sm">Buka Maps</Button>
            </a>
          </div>
          <TrackingMap
            destination={mapDestination}
            driverPosition={driverPosition ?? undefined}
            destinationLabel={destinationLabel}
            height="280px"
            showRoute={isMoving && !!driverPosition}
          />
          {isMoving && !driverPosition && (
            <p className="text-[12px] text-shade-50 mt-2 text-center">
              Mengambil lokasi GPS Anda...
            </p>
          )}
        </Card>

        {/* Info Pembeli */}
        <Card variant="default" className="flex flex-col gap-4">
          <h2 className="text-[15px] font-[600] text-ink">Info Pembeli</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-shade-30 flex items-center justify-center">
                <span className="text-[14px] font-[600] text-ink">{order.buyer.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[14px] font-[500] text-ink">{order.buyer.name}</p>
                <p className="text-[12px] text-shade-50">{order.buyer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/chat">
                <Button variant="outline-light" size="sm" className="gap-1">
                  <ChatIcon />
                  Chat
                </Button>
              </Link>
              <a href={`tel:${order.buyer.phone}`}>
                <Button variant="outline-light" size="sm" className="gap-1">
                  <PhoneIcon />
                  Telepon
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Alamat */}
        <Card variant="default" className="flex flex-col gap-3">
          {isDelivery ? (
            <>
              {/* Delivery: tampilkan laundry dulu, lalu customer */}
              <h2 className="text-[15px] font-[600] text-ink">Rute Pengantaran</h2>

              {/* Step 1: Ambil dari laundry */}
              <div className={[
                "flex items-start gap-3 p-3 rounded-md border",
                goToLaundryFirst ? "bg-yellow-50 border-yellow-200" : "bg-canvas-cream border-hairline-light opacity-60",
              ].join(" ")}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={["w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-[700]",
                    goToLaundryFirst ? "bg-yellow-500 text-white" : "bg-green-500 text-white"].join(" ")}>
                    {goToLaundryFirst ? "1" : "✓"}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-[600] text-shade-50 uppercase tracking-wider mb-1">
                    Ambil dari Laundry
                  </p>
                  <p className="text-[14px] font-[500] text-ink">{order.laundryName}</p>
                  <p className="text-[12px] text-shade-50 mt-0.5">{order.laundryAddress}</p>
                </div>
              </div>

              {/* Garis penghubung */}
              <div className="flex items-center gap-3 px-3">
                <div className="w-6 flex justify-center">
                  <div className="w-0.5 h-4 bg-shade-30" />
                </div>
                <p className="text-[11px] text-shade-40">lalu antar ke</p>
              </div>

              {/* Step 2: Antar ke customer */}
              <div className={[
                "flex items-start gap-3 p-3 rounded-md border",
                !goToLaundryFirst ? "bg-blue-50 border-blue-200" : "bg-canvas-cream border-hairline-light opacity-60",
              ].join(" ")}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={["w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-[700]",
                    !goToLaundryFirst ? "bg-blue-500 text-white" : "bg-shade-30 text-shade-50"].join(" ")}>
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-[600] text-shade-50 uppercase tracking-wider mb-1">
                    Antar ke Customer
                  </p>
                  <p className="text-[14px] font-[500] text-ink">{order.buyer.name}</p>
                  <p className="text-[12px] text-shade-50 mt-0.5">{order.address}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Pickup: tampilkan alamat customer */}
              <h2 className="text-[15px] font-[600] text-ink">Alamat Pickup</h2>
              <div className="flex items-start gap-3">
                <LocationIcon />
                <p className="text-[14px] text-ink leading-[1.6]">{order.address}</p>
              </div>
              <div className="mt-1 pt-3 border-t border-hairline-light">
                <p className="text-[12px] text-shade-50 mb-1">Antar ke Laundry:</p>
                <p className="text-[13px] font-[500] text-ink">{order.laundryName}</p>
                <p className="text-[12px] text-shade-50">{order.laundryAddress}</p>
              </div>
            </>
          )}
        </Card>

        {/* Detail Pesanan */}
        <Card variant="default" className="flex flex-col gap-3">
          <h2 className="text-[15px] font-[600] text-ink">Detail Pesanan</h2>

          {/* Jadwal Pickup */}
          {order.type === "pickup" && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <svg className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-[13px] font-[600] text-yellow-800">Jadwal Pickup</p>
                <p className="text-[13px] text-yellow-700 mt-0.5">
                  {new Date(order.pickupDate ?? "").toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
                <p className="text-[12px] text-yellow-600 mt-0.5">
                  {order.pickupTimeSlot === "morning" ? "⏰ Pagi (08:00 - 12:00)"
                    : order.pickupTimeSlot === "afternoon" ? "⏰ Siang (12:00 - 15:00)"
                    : order.pickupTimeSlot === "evening" ? "⏰ Sore (15:00 - 18:00)"
                    : order.pickupTimeSlot}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[12px] text-shade-50">Laundry</p>
              <p className="text-[14px] font-[500] text-ink">{order.laundryName}</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50">Layanan</p>
              <p className="text-[14px] font-[500] text-ink">{order.service}</p>
            </div>
            {order.estimatedWeight && (
              <div>
                <p className="text-[12px] text-shade-50">Estimasi Berat</p>
                <p className="text-[14px] font-[500] text-ink">{order.estimatedWeight} kg</p>
              </div>
            )}
            <div>
              <p className="text-[12px] text-shade-50">Ongkos Kirim</p>
              <p className="text-[14px] font-[500] text-ink">{formatCurrency(order.deliveryFee)}</p>
            </div>
          </div>
          {order.buyerNotes && (
            <div className="mt-2 p-3 bg-canvas-cream rounded-md">
              <p className="text-[12px] text-shade-50 mb-1">Catatan:</p>
              <p className="text-[13px] text-ink">{order.buyerNotes}</p>
            </div>
          )}
        </Card>

        {/* Tombol aksi */}
        {action && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleUpdateStatus}
              loading={updating}
            >
              {action.label}
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
