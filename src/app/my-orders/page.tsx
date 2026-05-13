"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs } from "@/components/ui/Tabs";
import { OrderCard } from "@/components/order/OrderCard";
import type { Order } from "@/types/order";

// --- Mock Data: Orders with different statuses ---
const MOCK_ORDERS: Order[] = [
  {
    id: "order-1",
    orderNumber: "SL20260513001",
    buyerId: "buyer-1",
    seller: {
      id: "seller-1",
      laundryName: "Laundry Bersih Cemerlang",
      photos: ["/placeholder-laundry.jpg"],
    },
    service: {
      id: "service-1",
      serviceName: "Cuci Setrika",
      pricePerUnit: 7000,
      unit: "kg",
    },
    pickupAddress: "Jl. Merdeka No. 10, Bandung",
    pickupLatitude: -6.917,
    pickupLongitude: 107.619,
    pickupDate: "2026-05-13",
    pickupTimeSlot: "morning",
    pickupDriver: {
      id: "driver-1",
      name: "Budi Santoso",
      phone: "081234567890",
      vehiclePlate: "D 1234 AB",
    },
    estimatedWeight: 5,
    actualWeight: 4.8,
    estimatedPrice: 35000,
    finalPrice: 33600,
    deliveryFee: 5000,
    totalPrice: 38600,
    status: "washing",
    paymentStatus: "pending",
    createdAt: "2026-05-13T08:30:00Z",
    statusHistory: [
      { status: "pending_pickup", createdAt: "2026-05-13T08:30:00Z" },
      { status: "driver_on_way_pickup", createdAt: "2026-05-13T09:00:00Z", actorName: "Budi Santoso" },
      { status: "picked_up", createdAt: "2026-05-13T09:25:00Z", actorName: "Budi Santoso" },
      { status: "at_laundry", createdAt: "2026-05-13T10:00:00Z", actorName: "Laundry Bersih Cemerlang" },
      { status: "washing", createdAt: "2026-05-13T10:30:00Z", actorName: "Laundry Bersih Cemerlang" },
    ],
  },
  {
    id: "order-2",
    orderNumber: "SL20260512002",
    buyerId: "buyer-1",
    seller: {
      id: "seller-2",
      laundryName: "Super Clean Laundry",
      photos: ["/placeholder-laundry.jpg"],
    },
    service: {
      id: "service-2",
      serviceName: "Dry Clean",
      pricePerUnit: 15000,
      unit: "pcs",
    },
    pickupAddress: "Jl. Asia Afrika No. 5, Bandung",
    pickupLatitude: -6.921,
    pickupLongitude: 107.607,
    pickupDate: "2026-05-12",
    pickupTimeSlot: "afternoon",
    pickupDriver: {
      id: "driver-2",
      name: "Andi Wijaya",
      phone: "081298765432",
      vehiclePlate: "D 5678 CD",
    },
    deliveryDriver: {
      id: "driver-3",
      name: "Rudi Hartono",
      phone: "081211112222",
      vehiclePlate: "D 9012 EF",
    },
    estimatedWeight: 3,
    actualWeight: 3,
    estimatedPrice: 45000,
    finalPrice: 45000,
    deliveryFee: 5000,
    totalPrice: 50000,
    status: "driver_on_way_delivery",
    paymentStatus: "paid",
    createdAt: "2026-05-12T14:00:00Z",
    statusHistory: [
      { status: "pending_pickup", createdAt: "2026-05-12T14:00:00Z" },
      { status: "driver_on_way_pickup", createdAt: "2026-05-12T14:30:00Z", actorName: "Andi Wijaya" },
      { status: "picked_up", createdAt: "2026-05-12T15:00:00Z", actorName: "Andi Wijaya" },
      { status: "at_laundry", createdAt: "2026-05-12T15:30:00Z", actorName: "Super Clean Laundry" },
      { status: "washing", createdAt: "2026-05-12T16:00:00Z", actorName: "Super Clean Laundry" },
      { status: "ready_for_delivery", createdAt: "2026-05-13T08:00:00Z", actorName: "Super Clean Laundry" },
      { status: "driver_on_way_delivery", createdAt: "2026-05-13T09:00:00Z", actorName: "Rudi Hartono" },
    ],
  },
  {
    id: "order-3",
    orderNumber: "SL20260510003",
    buyerId: "buyer-1",
    seller: {
      id: "seller-1",
      laundryName: "Laundry Bersih Cemerlang",
      photos: ["/placeholder-laundry.jpg"],
    },
    service: {
      id: "service-1",
      serviceName: "Cuci Setrika",
      pricePerUnit: 7000,
      unit: "kg",
    },
    pickupAddress: "Jl. Merdeka No. 10, Bandung",
    pickupLatitude: -6.917,
    pickupLongitude: 107.619,
    pickupDate: "2026-05-10",
    pickupTimeSlot: "morning",
    pickupDriver: {
      id: "driver-1",
      name: "Budi Santoso",
      phone: "081234567890",
      vehiclePlate: "D 1234 AB",
    },
    deliveryDriver: {
      id: "driver-1",
      name: "Budi Santoso",
      phone: "081234567890",
      vehiclePlate: "D 1234 AB",
    },
    estimatedWeight: 4,
    actualWeight: 3.5,
    estimatedPrice: 28000,
    finalPrice: 24500,
    deliveryFee: 5000,
    totalPrice: 29500,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2026-05-10T09:00:00Z",
    statusHistory: [
      { status: "pending_pickup", createdAt: "2026-05-10T09:00:00Z" },
      { status: "driver_on_way_pickup", createdAt: "2026-05-10T09:30:00Z", actorName: "Budi Santoso" },
      { status: "picked_up", createdAt: "2026-05-10T10:00:00Z", actorName: "Budi Santoso" },
      { status: "at_laundry", createdAt: "2026-05-10T10:30:00Z", actorName: "Laundry Bersih Cemerlang" },
      { status: "washing", createdAt: "2026-05-10T11:00:00Z", actorName: "Laundry Bersih Cemerlang" },
      { status: "ready_for_delivery", createdAt: "2026-05-11T08:00:00Z", actorName: "Laundry Bersih Cemerlang" },
      { status: "driver_on_way_delivery", createdAt: "2026-05-11T09:00:00Z", actorName: "Budi Santoso" },
      { status: "delivered", createdAt: "2026-05-11T09:30:00Z", actorName: "Budi Santoso" },
      { status: "completed", createdAt: "2026-05-11T09:35:00Z" },
    ],
  },
  {
    id: "order-4",
    orderNumber: "SL20260508004",
    buyerId: "buyer-1",
    seller: {
      id: "seller-3",
      laundryName: "Wangi Laundry & Dry Clean",
      photos: ["/placeholder-laundry.jpg"],
    },
    service: {
      id: "service-3",
      serviceName: "Cuci Kering",
      pricePerUnit: 9000,
      unit: "kg",
    },
    pickupAddress: "Jl. Braga No. 20, Bandung",
    pickupLatitude: -6.918,
    pickupLongitude: 107.609,
    pickupDate: "2026-05-08",
    pickupTimeSlot: "evening",
    estimatedWeight: 6,
    estimatedPrice: 54000,
    deliveryFee: 5000,
    totalPrice: 59000,
    status: "cancelled",
    buyerNotes: "Batal karena ada perubahan jadwal",
    paymentStatus: "pending",
    createdAt: "2026-05-08T17:00:00Z",
    statusHistory: [
      { status: "pending_pickup", createdAt: "2026-05-08T17:00:00Z" },
      { status: "cancelled", createdAt: "2026-05-08T18:00:00Z", notes: "Dibatalkan oleh pembeli" },
    ],
  },
];

// --- Tab definitions ---
const TAB_ITEMS = [
  { label: "Berlangsung", value: "ongoing" },
  { label: "Selesai", value: "completed" },
  { label: "Dibatalkan", value: "cancelled" },
];

// Statuses considered "ongoing" (not completed or cancelled)
const ONGOING_STATUSES = new Set([
  "pending_pickup",
  "driver_on_way_pickup",
  "picked_up",
  "at_laundry",
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

/**
 * My Orders page — displays all buyer orders organized by tabs.
 *
 * Tabs: Berlangsung, Selesai, Dibatalkan
 * Each tab shows OrderCards with timeline and action buttons.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.5
 */
export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState("ongoing");

  const filteredOrders = filterOrdersByTab(MOCK_ORDERS, activeTab);

  // Count badges for tabs
  const ongoingCount = MOCK_ORDERS.filter((o) =>
    ONGOING_STATUSES.has(o.status)
  ).length;

  const tabItems = TAB_ITEMS.map((item) => ({
    ...item,
    badge: item.value === "ongoing" ? ongoingCount : undefined,
  }));

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />

      <main className="max-w-[1280px] mx-auto px-xl py-xl">
        {/* Page title */}
        <h1 className="font-display text-[28px] font-[330] text-ink mb-6 [font-feature-settings:'ss03']">
          Pesanan Saya
        </h1>

        {/* Tabs */}
        <Tabs
          items={tabItems}
          value={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Order list */}
        <div className="flex flex-col gap-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
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
