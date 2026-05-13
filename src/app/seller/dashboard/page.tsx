"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

// Mock data
const dashboardStats = {
  totalOrders: 156,
  revenue: 12450000,
  averageRating: 4.7,
  newOrders: 3,
};

const recentOrders = [
  {
    id: "ord-001",
    orderNumber: "SL20260601001",
    buyerName: "Andi Pratama",
    service: "Cuci Setrika",
    status: "pending_pickup" as const,
    createdAt: "2026-06-01T10:30:00Z",
  },
  {
    id: "ord-002",
    orderNumber: "SL20260601002",
    buyerName: "Siti Rahayu",
    service: "Cuci Kering",
    status: "washing" as const,
    createdAt: "2026-06-01T09:15:00Z",
  },
  {
    id: "ord-003",
    orderNumber: "SL20260531003",
    buyerName: "Budi Santoso",
    service: "Setrika Saja",
    status: "ready_for_delivery" as const,
    createdAt: "2026-05-31T14:00:00Z",
  },
  {
    id: "ord-004",
    orderNumber: "SL20260531004",
    buyerName: "Dewi Lestari",
    service: "Cuci Setrika",
    status: "completed" as const,
    createdAt: "2026-05-31T08:45:00Z",
  },
  {
    id: "ord-005",
    orderNumber: "SL20260530005",
    buyerName: "Rudi Hermawan",
    service: "Cuci Sepatu",
    status: "completed" as const,
    createdAt: "2026-05-30T16:20:00Z",
  },
];

function OrderIcon() {
  return (
    <svg className="h-6 w-6 text-shade-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg className="h-6 w-6 text-shade-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function NewOrderIcon() {
  return (
    <svg className="h-6 w-6 text-shade-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function SellerDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Dashboard
      </h1>

      {/* Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Order */}
        <Card variant="default" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">
              Total Order
            </span>
            <OrderIcon />
          </div>
          <p className="font-display text-[32px] font-[500] leading-none text-ink">
            {dashboardStats.totalOrders}
          </p>
          <p className="text-[12px] text-shade-50">Bulan ini</p>
        </Card>

        {/* Pendapatan */}
        <Card variant="default" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">
              Pendapatan
            </span>
            <RevenueIcon />
          </div>
          <p className="font-display text-[28px] font-[500] leading-none text-ink">
            {formatCurrency(dashboardStats.revenue)}
          </p>
          <p className="text-[12px] text-shade-50">Bulan ini</p>
        </Card>

        {/* Rating */}
        <Card variant="default" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">
              Rating
            </span>
            <StarRating value={1} readonly size="sm" />
          </div>
          <p className="font-display text-[32px] font-[500] leading-none text-ink">
            {dashboardStats.averageRating}
          </p>
          <p className="text-[12px] text-shade-50">Rata-rata dari pelanggan</p>
        </Card>

        {/* Order Baru */}
        <Card variant="default" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">
              Order Baru
            </span>
            <div className="relative">
              <NewOrderIcon />
              {dashboardStats.newOrders > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-pill bg-red-500 text-white text-[11px] font-[600] leading-none">
                  {dashboardStats.newOrders}
                </span>
              )}
            </div>
          </div>
          <p className="font-display text-[32px] font-[500] leading-none text-ink">
            {dashboardStats.newOrders}
          </p>
          <p className="text-[12px] text-shade-50">Menunggu konfirmasi</p>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card variant="default" className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[18px] font-[500] leading-[1.4] text-ink">
            Order Terbaru
          </h2>
          <Link href="/seller/orders">
            <Button variant="outline-light" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline-light">
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  No. Order
                </th>
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Pembeli
                </th>
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Layanan
                </th>
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-hairline-light last:border-b-0">
                  <td className="py-3 text-[13px] font-[500] text-ink">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 text-[13px] text-ink">
                    {order.buyerName}
                  </td>
                  <td className="py-3 text-[13px] text-shade-50">
                    {order.service}
                  </td>
                  <td className="py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3">
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button variant="outline-light" size="sm">
                        Detail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
