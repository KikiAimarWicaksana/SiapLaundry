"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs } from "@/components/ui/Tabs";
import { OrderCard } from "@/components/order/OrderCard";
import api from "@/lib/api";
import type { Order } from "@/types/order";

const TAB_ITEMS = [
  { label: "Berlangsung", value: "ongoing" },
  { label: "Selesai", value: "completed" },
  { label: "Dibatalkan", value: "cancelled" },
];

const ONGOING_STATUSES = new Set([
  "pending_confirmation",
  "confirmed",
  "pending_pickup",
  "driver_on_way_pickup",
  "picked_up",
  "at_laundry",
  "payment_pending",
  "washing",
  "ready_for_delivery",
  "driver_on_way_delivery",
  "delivered",
]);

function filterOrdersByTab(orders: Order[], tab: string): Order[] {
  switch (tab) {
    case "ongoing":
      return orders.filter((o) => ONGOING_STATUSES.has(o.status));
    case "completed":
      return orders.filter((o) => o.status === "completed");
    case "cancelled":
      return orders.filter((o) => o.status === "cancelled");
    default:
      return orders;
  }
}

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get("/buyer/orders");
        setOrders(res.data.data);
      } catch {
        setError("Gagal memuat pesanan.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = filterOrdersByTab(orders, activeTab);
  const ongoingCount = orders.filter((o) => ONGOING_STATUSES.has(o.status)).length;

  const tabItems = TAB_ITEMS.map((item) => ({
    ...item,
    badge: item.value === "ongoing" ? ongoingCount : undefined,
  }));

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />
      <main className="max-w-[1280px] mx-auto px-xl py-xl">
        <h1 className="font-display text-[28px] font-[330] text-ink mb-6 [font-feature-settings:'ss03']">
          Pesanan Saya
        </h1>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600">
            {error}
          </div>
        )}

        <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} className="mb-6" />

        <div className="flex flex-col gap-4">
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-shade-10 rounded-lg animate-pulse" />
            ))
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center py-12">
              <p className="font-body text-[16px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                {activeTab === "ongoing" && "Tidak ada pesanan yang sedang berlangsung."}
                {activeTab === "completed" && "Belum ada pesanan yang selesai."}
                {activeTab === "cancelled" && "Tidak ada pesanan yang dibatalkan."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
