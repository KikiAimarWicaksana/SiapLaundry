"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import Link from "next/link";
import api from "@/lib/api";

interface DriverOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  address: string;
  laundryName: string;
  service: string;
  status: string;
}

function LocationIcon() {
  return (
    <svg className="h-4 w-4 text-shade-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function getActionButton(status: string, type: "pickup" | "delivery") {
  if (type === "pickup") {
    if (status === "pending_pickup") return { label: "Ambil Order", variant: "aloe" as const };
    if (status === "driver_on_way_pickup") return { label: "Mulai Pickup", variant: "primary" as const };
  }
  if (type === "delivery") {
    if (status === "ready_for_delivery") return { label: "Ambil Order", variant: "aloe" as const };
    if (status === "driver_on_way_delivery") return { label: "Mulai Delivery", variant: "primary" as const };
  }
  return { label: "Lihat Detail", variant: "outline-light" as const };
}

export default function DriverOrdersPage() {
  const [activeTab, setActiveTab] = useState("pickup");
  const [pickupOrders, setPickupOrders] = useState<DriverOrder[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get("/driver/orders");
        setPickupOrders(res.data.data.pickup);
        setDeliveryOrders(res.data.data.delivery);
      } catch {
        setError("Gagal memuat order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const orders = activeTab === "pickup" ? pickupOrders : deliveryOrders;

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Order Kurir
      </h1>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <Tabs
        items={[
          { label: "Pickup", value: "pickup", badge: pickupOrders.length },
          { label: "Delivery", value: "delivery", badge: deliveryOrders.length },
        ]}
        value={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      <div className="flex flex-col gap-4">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <Card key={i} variant="default" className="animate-pulse h-32" />
          ))
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-shade-50 text-[15px]">
              Belum ada order {activeTab === "pickup" ? "pickup" : "delivery"}.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const action = getActionButton(order.status, activeTab as "pickup" | "delivery");
            return (
              <Card key={order.id} variant="default" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-shade-50">{order.orderNumber}</p>
                    <p className="text-[15px] font-[500] text-ink">{order.buyerName}</p>
                  </div>
                  <OrderStatusBadge status={order.status as Parameters<typeof OrderStatusBadge>[0]["status"]} />
                </div>
                <div className="flex items-start gap-2">
                  <LocationIcon />
                  <p className="text-[13px] text-ink leading-[1.5]">{order.address}</p>
                </div>
                <p className="text-[13px] text-shade-50">
                  Laundry: <span className="text-ink font-[500]">{order.laundryName}</span>
                </p>
                <p className="text-[13px] text-shade-50">
                  Layanan: <span className="text-ink font-[500]">{order.service}</span>
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Button variant={action.variant} size="sm">{action.label}</Button>
                  <Link href={`/driver/orders/${order.id}`}>
                    <Button variant="outline-light" size="sm">Detail</Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
