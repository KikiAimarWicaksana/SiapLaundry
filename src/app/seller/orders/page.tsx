"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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

type TabValue = "konfirmasi" | "baru" | "proses" | "bayar" | "selesai";

const tabStatusMap: Record<TabValue, string[]> = {
  konfirmasi: ["pending_confirmation"],
  baru: ["confirmed", "pending_pickup", "picked_up", "at_laundry"],
  proses: ["washing"],
  bayar: ["payment_pending"],
  selesai: ["ready_for_delivery", "driver_on_way_delivery", "delivered", "completed"],
};

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("konfirmasi");
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reject modal
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/seller/orders");
      setOrders(res.data.data);
    } catch {
      setError("Gagal memuat data order.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleAccept = async (orderId: string) => {
    setProcessing(orderId);
    try {
      await api.post(`/seller/orders/${orderId}/confirm`, { action: "accept" });
      await fetchOrders();
    } catch {
      setError("Gagal mengkonfirmasi order.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectOrderId) return;
    setProcessing(rejectOrderId);
    try {
      await api.post(`/seller/orders/${rejectOrderId}/confirm`, {
        action: "reject",
        rejectReason,
      });
      setRejectOrderId(null);
      setRejectReason("");
      await fetchOrders();
    } catch {
      setError("Gagal menolak order.");
    } finally {
      setProcessing(null);
    }
  };

  const filteredOrders = orders.filter((o) =>
    tabStatusMap[activeTab].includes(o.status)
  );

  const count = (tab: TabValue) =>
    orders.filter((o) => tabStatusMap[tab].includes(o.status)).length;

  function getActionButton(order: SellerOrder) {
    switch (order.status) {
      case "pending_confirmation":
        return (
          <div className="flex gap-2">
            <Button
              variant="aloe"
              size="sm"
              onClick={() => handleAccept(order.id)}
              loading={processing === order.id}
            >
              Terima
            </Button>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => { setRejectOrderId(order.id); setRejectReason(""); }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Tolak
            </Button>
          </div>
        );
      case "at_laundry":
        return (
          <Link href={`/seller/orders/${order.id}`}>
            <Button variant="primary" size="sm">Input Berat</Button>
          </Link>
        );
      case "payment_pending":
        return (
          <Link href={`/seller/orders/${order.id}`}>
            <Button variant="outline-light" size="sm">Lihat Detail</Button>
          </Link>
        );
      case "washing":
        return (
          <Link href={`/seller/orders/${order.id}`}>
            <Button variant="primary" size="sm">Selesai Dicuci</Button>
          </Link>
        );
      default:
        return (
          <Link href={`/seller/orders/${order.id}`}>
            <Button variant="outline-light" size="sm">Detail</Button>
          </Link>
        );
    }
  }

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
          { label: "Konfirmasi", value: "konfirmasi", badge: count("konfirmasi") },
          { label: "Dijemput", value: "baru", badge: count("baru") },
          { label: "Menunggu Bayar", value: "bayar", badge: count("bayar") },
          { label: "Proses Cuci", value: "proses", badge: count("proses") },
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
                <div className="flex-shrink-0">{getActionButton(order)}</div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Tolak Order */}
      <Modal
        isOpen={!!rejectOrderId}
        onClose={() => setRejectOrderId(null)}
        title="Tolak Pesanan"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-shade-60">
            Berikan alasan penolakan agar customer mengetahui penyebabnya.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-[14px] font-[500] text-ink">Alasan (opsional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Kapasitas penuh, sedang tutup, dll."
              className="bg-canvas-light text-ink font-body text-[14px] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleReject}
              loading={!!processing}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Tolak Pesanan
            </Button>
            <Button variant="outline-light" size="md" onClick={() => setRejectOrderId(null)}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
