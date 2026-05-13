"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

// Mock order detail
const mockOrderDetail = {
  id: "ord-001",
  orderNumber: "SL20260601001",
  status: "at_laundry" as OrderStatus,
  buyer: {
    name: "Andi Pratama",
    phone: "081234567890",
    address: "Jl. Merdeka No. 10, Jakarta Selatan",
  },
  service: {
    name: "Cuci Setrika",
    pricePerUnit: 7000,
    unit: "kg" as const,
  },
  estimatedWeight: 5,
  actualWeight: null as number | null,
  deliveryFee: 10000,
  pickupDate: "2026-06-01",
  pickupTimeSlot: "Pagi (08:00 - 12:00)",
  buyerNotes: "Tolong pisahkan pakaian putih dan berwarna",
  createdAt: "2026-06-01T10:30:00Z",
};

// Status flow for seller
const sellerStatusFlow: OrderStatus[] = [
  "at_laundry",
  "washing",
  "ready_for_delivery",
];

function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = sellerStatusFlow.indexOf(current);
  if (idx === -1 || idx >= sellerStatusFlow.length - 1) return null;
  return sellerStatusFlow[idx + 1];
}

function getNextStatusLabel(next: OrderStatus): string {
  const labels: Partial<Record<OrderStatus, string>> = {
    washing: "Mulai Cuci",
    ready_for_delivery: "Selesai Dicuci",
  };
  return labels[next] || "Update Status";
}

export default function SellerOrderDetailPage() {
  const [order, setOrder] = useState(mockOrderDetail);
  const [actualWeightInput, setActualWeightInput] = useState("");
  const [weightError, setWeightError] = useState("");
  const [statusUpdated, setStatusUpdated] = useState(false);

  const actualWeight = actualWeightInput ? parseFloat(actualWeightInput) : null;

  const finalPrice = useMemo(() => {
    const weight = actualWeight ?? order.estimatedWeight;
    return weight * order.service.pricePerUnit;
  }, [actualWeight, order.estimatedWeight, order.service.pricePerUnit]);

  const totalPrice = finalPrice + order.deliveryFee;

  const nextStatus = getNextStatus(order.status);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setActualWeightInput(val);
    setWeightError("");

    if (val && (isNaN(parseFloat(val)) || parseFloat(val) <= 0)) {
      setWeightError("Berat harus berupa angka positif");
    }
  };

  const handleUpdateStatus = () => {
    if (!nextStatus) return;

    // Validate actual weight is filled before moving to washing
    if (nextStatus === "washing" && !actualWeight) {
      setWeightError("Berat aktual harus diisi sebelum memulai proses cuci");
      return;
    }

    if (actualWeight && actualWeight <= 0) {
      setWeightError("Berat harus berupa angka positif");
      return;
    }

    setOrder((prev) => ({
      ...prev,
      status: nextStatus,
      actualWeight: actualWeight ?? prev.actualWeight,
    }));
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 3000);
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[24px] font-[500] leading-[1.3] text-ink">
            Detail Order
          </h1>
          <p className="text-[14px] text-shade-50 mt-1">
            {order.orderNumber}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Success message */}
      {statusUpdated && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-[13px] text-green-800">
          Status order berhasil diperbarui!
        </div>
      )}

      {/* Buyer Info */}
      <Card variant="default" className="mb-4">
        <h2 className="font-display text-[16px] font-[500] text-ink mb-3">
          Informasi Pembeli
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
          <div>
            <span className="text-shade-50">Nama:</span>
            <p className="text-ink font-[500]">{order.buyer.name}</p>
          </div>
          <div>
            <span className="text-shade-50">Telepon:</span>
            <p className="text-ink font-[500]">{order.buyer.phone}</p>
          </div>
          <div className="md:col-span-2">
            <span className="text-shade-50">Alamat Pickup:</span>
            <p className="text-ink font-[500]">{order.buyer.address}</p>
          </div>
        </div>
      </Card>

      {/* Order Detail */}
      <Card variant="default" className="mb-4">
        <h2 className="font-display text-[16px] font-[500] text-ink mb-3">
          Detail Order
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
          <div>
            <span className="text-shade-50">Layanan:</span>
            <p className="text-ink font-[500]">{order.service.name}</p>
          </div>
          <div>
            <span className="text-shade-50">Harga per {order.service.unit}:</span>
            <p className="text-ink font-[500]">
              {formatCurrency(order.service.pricePerUnit)}
            </p>
          </div>
          <div>
            <span className="text-shade-50">Estimasi Berat:</span>
            <p className="text-ink font-[500]">{order.estimatedWeight} {order.service.unit}</p>
          </div>
          <div>
            <span className="text-shade-50">Jadwal Pickup:</span>
            <p className="text-ink font-[500]">
              {order.pickupDate} — {order.pickupTimeSlot}
            </p>
          </div>
          {order.buyerNotes && (
            <div className="md:col-span-2">
              <span className="text-shade-50">Catatan Pembeli:</span>
              <p className="text-ink font-[500]">{order.buyerNotes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Actual Weight Input & Price Calculation */}
      <Card variant="default" className="mb-4">
        <h2 className="font-display text-[16px] font-[500] text-ink mb-3">
          Berat Aktual & Kalkulasi Harga
        </h2>

        <div className="mb-4">
          <Input
            label="Berat Aktual (kg)"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="Masukkan berat aktual"
            value={actualWeightInput}
            onChange={handleWeightChange}
            error={weightError}
          />
        </div>

        {/* Price breakdown */}
        <div className="border-t border-hairline-light pt-3 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-shade-50">
              Harga Laundry ({actualWeight ?? order.estimatedWeight} {order.service.unit} × {formatCurrency(order.service.pricePerUnit)})
            </span>
            <span className="text-ink font-[500]">{formatCurrency(finalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-shade-50">Biaya Antar-Jemput</span>
            <span className="text-ink font-[500]">{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-hairline-light pt-2">
            <span className="text-ink font-[600]">Total</span>
            <span className="text-ink font-[600] text-[15px]">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      </Card>

      {/* Update Status */}
      {nextStatus && (
        <Card variant="default">
          <h2 className="font-display text-[16px] font-[500] text-ink mb-3">
            Update Status
          </h2>
          <p className="text-[13px] text-shade-50 mb-4">
            Klik tombol di bawah untuk mengubah status order ke tahap berikutnya.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={handleUpdateStatus}
          >
            {getNextStatusLabel(nextStatus)}
          </Button>
        </Card>
      )}
    </div>
  );
}
