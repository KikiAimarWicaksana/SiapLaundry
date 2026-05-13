"use client";

import React, { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";
import type { OrderStatus } from "@/types/order";

interface SellerOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  service: string;
  estimatedWeight: number | null;
  actualWeight?: number | null;
  estimatedPrice: number | null;
  status: OrderStatus;
  createdAt: string;
  pickupAddress: string;
}

type TabValue = "baru" | "proses" | "siap" | "selesai";

const tabStatusMap: Record<TabValue, OrderStatus[]> = {
  baru: ["pending_pickup", "picked_up", "at_laundry"],
  proses: ["washing"],
  siap: ["ready_for_delivery"],
  selesai: ["delivered", "completed"],
};

function getActionButton(status: OrderStatus, orderId: string) {
  switch (status) {
    case "pending_pickup":
    case "picked_up":
    case "at_laundry":
      return (
        <Link href={`/seller/orders/${orderId}`}>
          <Button variant="aloe" size="sm">Konfirmasi Order</Button>
        </Link>
      );
    case "washing":
      return (
        <Link href={`/seller/orders/${orderId}`}>
          <Button variant="primary" size="sm">Selesai Dicuci</Button>
        </Link>
      );
    case "ready_for_delivery":
      return (
        <Link href={`/seller/orders/${orderId}`}>
          <Button variant="primary" size="sm">Lihat Detail</Button>
        </Link>
      );
    default:
      return (
        <Link href={`/seller/orders/${orderId}`}>
          <Button variant="outline-light" size="sm">Detail</Button>
        </Link>
      );
  }
}

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("baru");
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get("/seller/orders");
        setOrders(res.data.data);
      } catch {
        setError("Gagal memuat data order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) =>
    tabStatusMap[activeTab].includes(o.status)
  );

  const count = (tab: TabValue) =>
    orders.filter((o) => tabStatusMap[tab].includes(o.status)).length;

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Manajemen Order
      </h1>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <Tabs
        items={[
          { label: "Order Baru", value: "baru", badge: count("baru") },
          { label: "Sedang Proses", value: "proses", badge: count("proses") },
          { label: "Siap Diantar", value: "siap", badge: count("siap") },
          { label: "Selesai", value: "selesai" },
        ]}
        value={activeTab}
        onChange={(val) => setActiveTab(val as TabValue)}
        className="mb-6"
      />

      <div className="flex flex-col gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} variant="default" className="animate-pulse h-20" />
          ))
        ) : filteredOrders.length === 0 ? (
          <Card variant="default" className="text-center py-12">
            <p className="text-shade-50 text-[14px]">Tidak ada order di tab ini.</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} variant="default">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[15px] font-[550] text-ink">{order.buyerName}</h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-shade-50">
                    <span>{order.orderNumber}</span>
                    <span>•</span>
                    <span>{order.service}</span>
                    {order.estimatedWeight && (
                      <>
                        <span>•</span>
                        <span>Est. {order.estimatedWeight} kg</span>
                      </>
                    )}
                    {order.estimatedPrice && (
                      <>
                        <span>•</span>
                        <span>{formatCurrency(order.estimatedPrice)}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[12px] text-shade-40 mt-1">{order.pickupAddress}</p>
                </div>
                <div className="flex-shrink-0">
                  {getActionButton(order.status, order.id)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
