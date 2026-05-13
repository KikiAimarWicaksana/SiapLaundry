"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge, OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import Link from "next/link";

// Mock data for driver orders
const pickupOrders = [
  {
    id: "ord-101",
    orderNumber: "SL20260601001",
    buyerName: "Andi Pratama",
    pickupAddress: "Jl. Merdeka No. 45, Bandung",
    laundryName: "Fresh Laundry",
    status: "pending_pickup" as const,
    distanceKm: 1.2,
  },
  {
    id: "ord-102",
    orderNumber: "SL20260601002",
    buyerName: "Siti Rahayu",
    pickupAddress: "Jl. Sudirman No. 12, Bandung",
    laundryName: "Clean Express",
    status: "pending_pickup" as const,
    distanceKm: 2.5,
  },
  {
    id: "ord-103",
    orderNumber: "SL20260601003",
    buyerName: "Budi Santoso",
    pickupAddress: "Jl. Asia Afrika No. 78, Bandung",
    laundryName: "Sparkle Wash",
    status: "driver_on_way_pickup" as const,
    distanceKm: 0.8,
  },
];

const deliveryOrders = [
  {
    id: "ord-201",
    orderNumber: "SL20260531001",
    buyerName: "Dewi Lestari",
    deliveryAddress: "Jl. Dago No. 33, Bandung",
    laundryName: "Fresh Laundry",
    status: "ready_for_delivery" as const,
    distanceKm: 3.1,
  },
  {
    id: "ord-202",
    orderNumber: "SL20260531002",
    buyerName: "Rudi Hermawan",
    deliveryAddress: "Jl. Braga No. 56, Bandung",
    laundryName: "Clean Express",
    status: "driver_on_way_delivery" as const,
    distanceKm: 1.8,
  },
];

function LocationIcon() {
  return (
    <svg className="h-4 w-4 text-shade-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function DistanceIcon() {
  return (
    <svg className="h-4 w-4 text-shade-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function getActionButton(status: string, type: "pickup" | "delivery") {
  if (type === "pickup") {
    if (status === "pending_pickup") {
      return { label: "Ambil Order", variant: "aloe" as const };
    }
    if (status === "driver_on_way_pickup") {
      return { label: "Mulai Pickup", variant: "primary" as const };
    }
  }
  if (type === "delivery") {
    if (status === "ready_for_delivery") {
      return { label: "Ambil Order", variant: "aloe" as const };
    }
    if (status === "driver_on_way_delivery") {
      return { label: "Mulai Delivery", variant: "primary" as const };
    }
  }
  return { label: "Lihat Detail", variant: "outline-light" as const };
}

export default function DriverOrdersPage() {
  const [activeTab, setActiveTab] = useState("pickup");

  const tabItems = [
    { label: "Pickup", value: "pickup", badge: pickupOrders.length },
    { label: "Delivery", value: "delivery", badge: deliveryOrders.length },
  ];

  const orders = activeTab === "pickup" ? pickupOrders : deliveryOrders;

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Order Kurir
      </h1>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        value={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Order Cards */}
      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const address =
            activeTab === "pickup"
              ? (order as (typeof pickupOrders)[0]).pickupAddress
              : (order as (typeof deliveryOrders)[0]).deliveryAddress;
          const action = getActionButton(order.status, activeTab as "pickup" | "delivery");

          return (
            <Card key={order.id} variant="default" className="flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-shade-50">{order.orderNumber}</p>
                  <p className="text-[15px] font-[500] text-ink">{order.buyerName}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Address */}
              <div className="flex items-start gap-2">
                <LocationIcon />
                <p className="text-[13px] text-ink leading-[1.5]">{address}</p>
              </div>

              {/* Distance */}
              <div className="flex items-center gap-2">
                <DistanceIcon />
                <p className="text-[13px] text-shade-50">
                  {order.distanceKm} km dari lokasi Anda
                </p>
              </div>

              {/* Laundry name */}
              <p className="text-[13px] text-shade-50">
                Laundry: <span className="text-ink font-[500]">{order.laundryName}</span>
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button variant={action.variant} size="sm">
                  {action.label}
                </Button>
                <Link href={`/driver/orders/${order.id}`}>
                  <Button variant="outline-light" size="sm">
                    Detail
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-shade-50 text-[15px]">Belum ada order {activeTab === "pickup" ? "pickup" : "delivery"}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
