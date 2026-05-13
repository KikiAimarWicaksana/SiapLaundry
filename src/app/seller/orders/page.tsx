"use client";

import React, { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { OrderStatus } from "@/types/order";

interface SellerOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  service: string;
  estimatedWeight: number;
  actualWeight?: number;
  estimatedPrice: number;
  status: OrderStatus;
  createdAt: string;
  pickupAddress: string;
}

// Mock data
const mockOrders: SellerOrder[] = [
  {
    id: "ord-001",
    orderNumber: "SL20260601001",
    buyerName: "Andi Pratama",
    buyerPhone: "081234567890",
    service: "Cuci Setrika",
    estimatedWeight: 5,
    estimatedPrice: 35000,
    status: "pending_pickup",
    createdAt: "2026-06-01T10:30:00Z",
    pickupAddress: "Jl. Merdeka No. 10, Jakarta Selatan",
  },
  {
    id: "ord-006",
    orderNumber: "SL20260601006",
    buyerName: "Rina Wati",
    buyerPhone: "081298765432",
    service: "Cuci Kering",
    estimatedWeight: 3,
    estimatedPrice: 24000,
    status: "at_laundry",
    createdAt: "2026-06-01T08:00:00Z",
    pickupAddress: "Jl. Sudirman No. 45, Jakarta Pusat",
  },
  {
    id: "ord-002",
    orderNumber: "SL20260601002",
    buyerName: "Siti Rahayu",
    buyerPhone: "081345678901",
    service: "Cuci Kering",
    estimatedWeight: 4,
    actualWeight: 4.2,
    estimatedPrice: 28000,
    status: "washing",
    createdAt: "2026-06-01T09:15:00Z",
    pickupAddress: "Jl. Gatot Subroto No. 22, Jakarta Selatan",
  },
  {
    id: "ord-003",
    orderNumber: "SL20260531003",
    buyerName: "Budi Santoso",
    buyerPhone: "081456789012",
    service: "Setrika Saja",
    estimatedWeight: 6,
    actualWeight: 5.8,
    estimatedPrice: 30000,
    status: "ready_for_delivery",
    createdAt: "2026-05-31T14:00:00Z",
    pickupAddress: "Jl. Thamrin No. 5, Jakarta Pusat",
  },
  {
    id: "ord-004",
    orderNumber: "SL20260531004",
    buyerName: "Dewi Lestari",
    buyerPhone: "081567890123",
    service: "Cuci Setrika",
    estimatedWeight: 3,
    actualWeight: 3.1,
    estimatedPrice: 21000,
    status: "completed",
    createdAt: "2026-05-31T08:45:00Z",
    pickupAddress: "Jl. Kuningan No. 8, Jakarta Selatan",
  },
  {
    id: "ord-005",
    orderNumber: "SL20260530005",
    buyerName: "Rudi Hermawan",
    buyerPhone: "081678901234",
    service: "Cuci Sepatu",
    estimatedWeight: 2,
    actualWeight: 2,
    estimatedPrice: 50000,
    status: "completed",
    createdAt: "2026-05-30T16:20:00Z",
    pickupAddress: "Jl. Rasuna Said No. 12, Jakarta Selatan",
  },
];

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
          <Button variant="aloe" size="sm">
            Konfirmasi Order
          </Button>
        </Link>
      );
    case "washing":
      return (
        <Link href={`/seller/orders/${orderId}`}>
          <Button variant="primary" size="sm">
            Selesai Dicuci
          </Button>
        </Link>
      );
    case "ready_for_delivery":
      return (
        <Link href={`/seller/orders/${orderId}`}>
          <Button variant="primary" size="sm">
            Lihat Detail
          </Button>
        </Link>
      );
    default:
      return (
        <Link href={`/seller/orders/${orderId}`}>
          <Button variant="outline-light" size="sm">
            Detail
          </Button>
        </Link>
      );
  }
}

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("baru");

  const filteredOrders = mockOrders.filter((order) =>
    tabStatusMap[activeTab].includes(order.status)
  );

  const newOrderCount = mockOrders.filter((o) =>
    tabStatusMap.baru.includes(o.status)
  ).length;

  const processingCount = mockOrders.filter((o) =>
    tabStatusMap.proses.includes(o.status)
  ).length;

  const readyCount = mockOrders.filter((o) =>
    tabStatusMap.siap.includes(o.status)
  ).length;

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Manajemen Order
      </h1>

      <Tabs
        items={[
          { label: "Order Baru", value: "baru", badge: newOrderCount },
          { label: "Sedang Proses", value: "proses", badge: processingCount },
          { label: "Siap Diantar", value: "siap", badge: readyCount },
          { label: "Selesai", value: "selesai" },
        ]}
        value={activeTab}
        onChange={(val) => setActiveTab(val as TabValue)}
        className="mb-6"
      />

      {/* Order Cards */}
      <div className="flex flex-col gap-4">
        {filteredOrders.length === 0 ? (
          <Card variant="default" className="text-center py-12">
            <p className="text-shade-50 text-[14px]">
              Tidak ada order di tab ini.
            </p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} variant="default">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[15px] font-[550] text-ink">
                      {order.buyerName}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-shade-50">
                    <span>{order.orderNumber}</span>
                    <span>•</span>
                    <span>{order.service}</span>
                    <span>•</span>
                    <span>Est. {order.estimatedWeight} kg</span>
                    <span>•</span>
                    <span>{formatCurrency(order.estimatedPrice)}</span>
                  </div>
                  <p className="text-[12px] text-shade-40 mt-1">
                    {order.pickupAddress}
                  </p>
                </div>

                {/* Action */}
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
