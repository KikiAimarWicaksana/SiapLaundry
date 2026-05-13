"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

// Mock data
const driverStats = {
  ordersToday: 5,
  totalDeliveries: 87,
  monthlyEarnings: 3250000,
};

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

export default function DriverDashboardPage() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Dashboard Kurir
      </h1>

      {/* Online/Offline Toggle */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          className={[
            "w-full flex items-center justify-between",
            "rounded-lg px-6 py-5",
            "transition-colors duration-200",
            "cursor-pointer",
            isOnline ? "bg-aloe-10" : "bg-shade-30",
          ].join(" ")}
          aria-pressed={isOnline}
          aria-label={isOnline ? "Status: Online. Klik untuk offline" : "Status: Offline. Klik untuk online"}
        >
          <div className="flex items-center gap-3">
            <div
              className={[
                "w-3 h-3 rounded-full",
                isOnline ? "bg-green-500" : "bg-shade-50",
              ].join(" ")}
              aria-hidden="true"
            />
            <span className="text-[18px] font-[600] text-ink">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          {/* Toggle switch visual */}
          <div
            className={[
              "relative w-[52px] h-[28px] rounded-pill transition-colors duration-200",
              isOnline ? "bg-green-500" : "bg-shade-50",
            ].join(" ")}
            aria-hidden="true"
          >
            <div
              className={[
                "absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-transform duration-200",
                isOnline ? "translate-x-[27px]" : "translate-x-[3px]",
              ].join(" ")}
            />
          </div>
        </button>
        <p className="mt-2 text-[13px] text-shade-50">
          {isOnline
            ? "Anda sedang menerima order. Order baru akan masuk otomatis."
            : "Aktifkan untuk mulai menerima order pickup dan delivery."}
        </p>
      </div>

      {/* Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Order Hari Ini */}
        <Card variant="default" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">
              Order Hari Ini
            </span>
            <OrderIcon />
          </div>
          <p className="font-display text-[32px] font-[500] leading-none text-ink">
            {driverStats.ordersToday}
          </p>
          <p className="text-[12px] text-shade-50">Pickup &amp; Delivery</p>
        </Card>

        {/* Total Pengantaran */}
        <Card variant="default" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">
              Total Pengantaran
            </span>
            <DeliveryIcon />
          </div>
          <p className="font-display text-[32px] font-[500] leading-none text-ink">
            {driverStats.totalDeliveries}
          </p>
          <p className="text-[12px] text-shade-50">Bulan ini</p>
        </Card>

        {/* Pendapatan */}
        <Card variant="default" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">
              Pendapatan
            </span>
            <EarningsIcon />
          </div>
          <p className="font-display text-[28px] font-[500] leading-none text-ink">
            {formatCurrency(driverStats.monthlyEarnings)}
          </p>
          <p className="text-[12px] text-shade-50">Bulan ini</p>
        </Card>
      </div>
    </div>
  );
}
