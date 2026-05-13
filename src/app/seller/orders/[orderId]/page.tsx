"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { OrderStatus } from "@/types/order";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  buyer: { name: string; phone: string; address: string };
  service: { name: string; pricePerUnit: number; unit: string };
  estimatedWeight: number | null;
  actualWeight: number | null;
  deliveryFee: number;
  estimatedPrice: number | null;
  finalPrice: number | null;
  totalPrice: number | null;
  pickupDate: string;
  pickupTimeSlot: string;
  buyerNotes: string | null;
  createdAt: string;
}

const sellerStatusFlow: OrderStatus[] = ["at_laundry", "washing", "ready_for_delivery"];

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

const timeSlotLabels: Record<string, string> = {
  morning: "Pagi (08:00 - 12:00)",
  afternoon: "Siang (12:00 - 17:00)",
  evening: "Sore (17:00 - 20:00)",
};

export default function SellerOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualWeightInput, setActualWeightInput] = useState("");
  const [weightError, setWeightError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get(`/seller/orders/${orderId}`);
        const data = res.data.data;
        setOrder(data);
        if (data.actualWeight) setActualWeightInput(String(data.actualWeight));
      } catch {
        setError("Gagal memuat detail order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const actualWeight = actualWeightInput ? parseFloat(actualWeightInput) : null;

  const finalPrice = useMemo(() => {
    if (!order) return 0;
    const weight = actualWeight ?? order.estimatedWeight ?? 0;
    return weight * order.service.pricePerUnit;
  }, [actualWeight, order]);

  const totalPrice = order ? finalPrice + order.deliveryFee : 0;

  const nextStatus = order ? getNextStatus(order.status) : null;

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActualWeightInput(e.target.value);
    setWeightError("");
    if (e.target.value && (isNaN(parseFloat(e.target.value)) || parseFloat(e.target.value) <= 0)) {
      setWeightError("Berat harus berupa angka positif");
    }
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus || !order) return;
    if (nextStatus === "washing" && !actualWeight) {
      setWeightError("Berat aktual harus diisi sebelum memulai proses cuci");
      return;
    }
    if (actualWeight && actualWeight <= 0) {
      setWeightError("Berat harus berupa angka positif");
      return;
    }

    setUpdating(true);
    try {
      await api.patch(`/seller/orders/${orderId}`, {
        status: nextStatus,
        ...(actualWeight ? { actualWeight } : {}),
      });
      setOrder((prev) =>
        prev ? { ...prev, status: nextStatus, actualWeight: actualWeight ?? prev.actualWeight } : prev
      );
      setSuccessMsg("Status order berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Gagal memperbarui status order.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-shade-10 rounded" />
        <div className="h-40 bg-shade-10 rounded-lg" />
        <div className="h-40 bg-shade-10 rounded-lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl">
        <div className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600">
          {error ?? "Order tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[24px] font-[500] leading-[1.3] text-ink">Detail Order</h1>
          <p className="text-[14px] text-shade-50 mt-1">{order.orderNumber}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-[13px] text-green-800">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-[13px] text-red-800">
          {error}
        </div>
      )}

      <Card variant="default" className="mb-4">
        <h2 className="font-display text-[16px] font-[500] text-ink mb-3">Informasi Pembeli</h2>
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

      <Card variant="default" className="mb-4">
        <h2 className="font-display text-[16px] font-[500] text-ink mb-3">Detail Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
          <div>
            <span className="text-shade-50">Layanan:</span>
            <p className="text-ink font-[500]">{order.service.name}</p>
          </div>
          <div>
            <span className="text-shade-50">Harga per {order.service.unit}:</span>
            <p className="text-ink font-[500]">{formatCurrency(order.service.pricePerUnit)}</p>
          </div>
          {order.estimatedWeight && (
            <div>
              <span className="text-shade-50">Estimasi Berat:</span>
              <p className="text-ink font-[500]">{order.estimatedWeight} {order.service.unit}</p>
            </div>
          )}
          <div>
            <span className="text-shade-50">Jadwal Pickup:</span>
            <p className="text-ink font-[500]">
              {order.pickupDate} — {timeSlotLabels[order.pickupTimeSlot] ?? order.pickupTimeSlot}
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

      <Card variant="default" className="mb-4">
        <h2 className="font-display text-[16px] font-[500] text-ink mb-3">
          Berat Aktual &amp; Kalkulasi Harga
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
        <div className="border-t border-hairline-light pt-3 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-shade-50">
              Harga Laundry ({actualWeight ?? order.estimatedWeight ?? 0} {order.service.unit} × {formatCurrency(order.service.pricePerUnit)})
            </span>
            <span className="text-ink font-[500]">{formatCurrency(finalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-shade-50">Biaya Antar-Jemput</span>
            <span className="text-ink font-[500]">{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-hairline-light pt-2">
            <span className="text-ink font-[600]">Total</span>
            <span className="text-ink font-[600] text-[15px]">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </Card>

      {nextStatus && (
        <Card variant="default">
          <h2 className="font-display text-[16px] font-[500] text-ink mb-3">Update Status</h2>
          <p className="text-[13px] text-shade-50 mb-4">
            Klik tombol di bawah untuk mengubah status order ke tahap berikutnya.
          </p>
          <Button variant="primary" size="md" onClick={handleUpdateStatus} loading={updating}>
            {getNextStatusLabel(nextStatus)}
          </Button>
        </Card>
      )}
    </div>
  );
}
