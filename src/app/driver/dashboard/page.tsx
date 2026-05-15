"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

interface DriverStats {
  isOnline: boolean;
  ordersToday: number;
  totalDeliveries: number;
  monthlyEarnings: number;
  averageRating: number;
}

function OrderIcon() {
  return (
    <svg className="h-6 w-6 text-shade-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg className="h-6 w-6 text-shade-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12l2 5h-2v4a1 1 0 01-1 1h-1a2 2 0 11-4 0H9a2 2 0 11-4 0H4a1 1 0 01-1-1v-4H2l2-5z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function EarningsIcon() {
  return (
    <svg className="h-6 w-6 text-shade-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export default function DriverDashboardPage() {
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "active" | "denied">("idle");
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/driver/dashboard");
        setStats(res.data.data);
      } catch {
        setStats({ isOnline: false, ordersToday: 0, totalDeliveries: 0, monthlyEarnings: 0, averageRating: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  /** Kirim posisi ke server */
  const sendLocation = useCallback(async (lat: number, lng: number) => {
    try {
      await api.patch("/driver/dashboard", { currentLatitude: lat, currentLongitude: lng });
    } catch {
      // silent
    }
  }, []);

  /** Mulai watch GPS */
  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("active");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCurrentPos({ lat, lng });
        sendLocation(lat, lng);
      },
      () => setGpsStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    // Kirim lokasi setiap 15 detik meski tidak bergerak
    locationIntervalRef.current = setInterval(() => {
      if (currentPos) sendLocation(currentPos.lat, currentPos.lng);
    }, 15000);
  }, [sendLocation, currentPos]);

  /** Stop watch GPS */
  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setGpsStatus("idle");
    setCurrentPos(null);
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => { stopGps(); };
  }, [stopGps]);

  const handleToggleOnline = async () => {
    if (!stats || toggling) return;
    setToggling(true);
    const newStatus = !stats.isOnline;
    try {
      await api.patch("/driver/dashboard", { isOnline: newStatus });
      setStats((prev) => prev ? { ...prev, isOnline: newStatus } : prev);
      if (newStatus) {
        // Saat online, langsung minta GPS
        startGps();
      } else {
        stopGps();
        // Reset koordinat di server
        await api.patch("/driver/dashboard", { currentLatitude: null, currentLongitude: null });
      }
    } catch {
      // revert
    } finally {
      setToggling(false);
    }
  };

  const handleToggleGps = () => {
    if (gpsStatus === "active") {
      stopGps();
    } else {
      startGps();
    }
  };

  const isOnline = stats?.isOnline ?? false;

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Dashboard Kurir
      </h1>

      {/* Online/Offline Toggle */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleToggleOnline}
          disabled={loading || toggling}
          className={[
            "w-full flex items-center justify-between",
            "rounded-lg px-6 py-5",
            "transition-colors duration-200",
            "cursor-pointer disabled:opacity-60",
            isOnline ? "bg-aloe-10" : "bg-shade-30",
          ].join(" ")}
          aria-pressed={isOnline}
        >
          <div className="flex items-center gap-3">
            <div className={["w-3 h-3 rounded-full", isOnline ? "bg-green-500" : "bg-shade-50"].join(" ")} aria-hidden="true" />
            <span className="text-[18px] font-[600] text-ink">
              {toggling ? "Memperbarui..." : isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className={["relative w-[52px] h-[28px] rounded-pill transition-colors duration-200", isOnline ? "bg-green-500" : "bg-shade-50"].join(" ")} aria-hidden="true">
            <div className={["absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-transform duration-200", isOnline ? "translate-x-[27px]" : "translate-x-[3px]"].join(" ")} />
          </div>
        </button>
        <p className="mt-2 text-[13px] text-shade-50">
          {isOnline ? "Anda sedang menerima order. Order baru akan masuk otomatis." : "Aktifkan untuk mulai menerima order pickup dan delivery."}
        </p>
      </div>

      {/* GPS Location Panel — tampil saat online */}
      {isOnline && (
        <div className={[
          "mb-8 rounded-lg border p-4 flex items-start gap-4",
          gpsStatus === "active" ? "bg-blue-50 border-blue-200" : gpsStatus === "denied" ? "bg-red-50 border-red-200" : "bg-canvas-light border-hairline-light",
        ].join(" ")}>
          <div className={["mt-0.5", gpsStatus === "active" ? "text-blue-600" : gpsStatus === "denied" ? "text-red-500" : "text-shade-50"].join(" ")}>
            <LocationIcon />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-[550] text-ink">
              {gpsStatus === "active" ? "Lokasi Aktif" : gpsStatus === "denied" ? "Izin Lokasi Ditolak" : "Lokasi Belum Aktif"}
            </p>
            <p className="text-[12px] text-shade-50 mt-0.5">
              {gpsStatus === "active" && currentPos
                ? `📍 ${currentPos.lat.toFixed(5)}, ${currentPos.lng.toFixed(5)} — Lokasi dikirim otomatis`
                : gpsStatus === "denied"
                ? "Aktifkan izin lokasi di browser untuk menerima order terdekat"
                : "Aktifkan lokasi agar sistem bisa mencocokkan order terdekat dengan Anda"}
            </p>
          </div>
          {gpsStatus !== "denied" && (
            <button
              onClick={handleToggleGps}
              className={[
                "shrink-0 px-3 py-1.5 rounded-pill text-[13px] font-[500] border transition-colors",
                gpsStatus === "active"
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-ink text-canvas-light border-ink hover:bg-shade-70",
              ].join(" ")}
            >
              {gpsStatus === "active" ? "Nonaktifkan" : "Aktifkan Lokasi"}
            </button>
          )}
        </div>
      )}

      {/* Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <Card key={i} variant="default" className="animate-pulse h-28"><div /></Card>)
        ) : (
          <>
            <Card variant="default" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">Order Hari Ini</span>
                <OrderIcon />
              </div>
              <p className="font-display text-[32px] font-[500] leading-none text-ink">{stats?.ordersToday ?? 0}</p>
              <p className="text-[12px] text-shade-50">Pickup &amp; Delivery</p>
            </Card>

            <Card variant="default" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">Total Pengantaran</span>
                <DeliveryIcon />
              </div>
              <p className="font-display text-[32px] font-[500] leading-none text-ink">{stats?.totalDeliveries ?? 0}</p>
              <p className="text-[12px] text-shade-50">Sepanjang waktu</p>
            </Card>

            <Card variant="default" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">Pendapatan</span>
                <EarningsIcon />
              </div>
              <p className="font-display text-[28px] font-[500] leading-none text-ink">{formatCurrency(stats?.monthlyEarnings ?? 0)}</p>
              <p className="text-[12px] text-shade-50">Bulan ini</p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
