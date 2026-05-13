"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

interface DashboardStats {
  totalOrders: number;
  revenue: number;
  averageRating: number;
  newOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  service: string;
  status: string;
  createdAt: string;
}

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

function SkeletonCard() {
  return (
    <Card variant="default" className="flex flex-col gap-3 animate-pulse">
      <div className="h-4 w-24 bg-shade-10 rounded" />
      <div className="h-8 w-16 bg-shade-10 rounded" />
      <div className="h-3 w-20 bg-shade-10 rounded" />
    </Card>
  );
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/seller/dashboard");
        const { stats, recentOrders } = res.data.data;
        setStats(stats);
        setRecentOrders(recentOrders);
      } catch {
        setError("Gagal memuat data dashboard. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Dashboard
      </h1>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      {/* Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stats ? (
          <>
            {/* Total Order */}
            <Card variant="default" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-[500] text-shade-50 tracking-[0.28px]">
                  Total Order
                </span>
                <OrderIcon />
              </div>
              <p className="font-display text-[32px] font-[500] leading-none text-ink">
                {stats.totalOrders}
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
                {formatCurrency(stats.revenue)}
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
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
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
                  {stats.newOrders > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-pill bg-red-500 text-white text-[11px] font-[600] leading-none">
                      {stats.newOrders}
                    </span>
                  )}
                </div>
              </div>
              <p className="font-display text-[32px] font-[500] leading-none text-ink">
                {stats.newOrders}
              </p>
              <p className="text-[12px] text-shade-50">Menunggu konfirmasi</p>
            </Card>
          </>
        ) : null}
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

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-shade-10 rounded" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[14px] text-shade-50">Belum ada order masuk.</p>
          </div>
        ) : (
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
                      <OrderStatusBadge status={order.status as Parameters<typeof OrderStatusBadge>[0]["status"]} />
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
        )}
      </Card>
    </div>
  );
}
