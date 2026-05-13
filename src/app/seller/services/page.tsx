"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";

// Zod schema for service form
const serviceSchema = z.object({
  serviceName: z.string().min(1, "Nama layanan wajib diisi").max(100, "Maksimal 100 karakter"),
  pricePerUnit: z.string().min(1, "Harga wajib diisi"),
  unit: z.enum(["kg", "pcs"]),
  estimatedDurationDays: z.string().min(1, "Durasi wajib diisi"),
  description: z.string().max(500, "Maksimal 500 karakter").optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceItem {
  id: string;
  serviceName: string;
  pricePerUnit: number;
  unit: "kg" | "pcs";
  estimatedDurationDays: number;
  description?: string;
  isActive: boolean;
}

// Mock data
const initialServices: ServiceItem[] = [
  {
    id: "svc-001",
    serviceName: "Cuci Setrika",
    pricePerUnit: 7000,
    unit: "kg",
    estimatedDurationDays: 2,
    description: "Cuci bersih dan setrika rapi",
    isActive: true,
  },
  {
    id: "svc-002",
    serviceName: "Cuci Kering",
    pricePerUnit: 8000,
    unit: "kg",
    estimatedDurationDays: 3,
    description: "Dry cleaning untuk pakaian khusus",
    isActive: true,
  },
  {
    id: "svc-003",
    serviceName: "Setrika Saja",
    pricePerUnit: 5000,
    unit: "kg",
    estimatedDurationDays: 1,
    description: "Setrika saja tanpa cuci",
    isActive: true,
  },
  {
    id: "svc-004",
    serviceName: "Cuci Sepatu",
    pricePerUnit: 25000,
    unit: "pcs",
    estimatedDurationDays: 3,
    description: "Cuci sepatu berbagai jenis",
    isActive: true,
  },
];

export default function SellerServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const openAddForm = () => {
    setEditingService(null);
    reset({
      serviceName: "",
      pricePerUnit: "",
      unit: "kg",
      estimatedDurationDays: "",
      description: "",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (service: ServiceItem) => {
    setEditingService(service);
    reset({
      serviceName: service.serviceName,
      pricePerUnit: String(service.pricePerUnit),
      unit: service.unit,
      estimatedDurationDays: String(service.estimatedDurationDays),
      description: service.description || "",
    });
    setIsFormOpen(true);
  };

  const onSubmit = (data: ServiceFormData) => {
    const priceNum = parseInt(data.pricePerUnit, 10);
    const durationNum = parseInt(data.estimatedDurationDays, 10);

    if (isNaN(priceNum) || priceNum < 1000) return;
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 14) return;

    const serviceData = {
      serviceName: data.serviceName,
      pricePerUnit: priceNum,
      unit: data.unit,
      estimatedDurationDays: durationNum,
      description: data.description || undefined,
    };

    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? { ...s, ...serviceData }
            : s
        )
      );
    } else {
      const newService: ServiceItem = {
        id: `svc-${Date.now()}`,
        ...serviceData,
        isActive: true,
      };
      setServices((prev) => [...prev, newService]);
    }
    setIsFormOpen(false);
    setEditingService(null);
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink">
          Katalog Layanan
        </h1>
        <Button variant="primary" size="sm" onClick={openAddForm}>
          + Tambah Layanan
        </Button>
      </div>

      {/* Services Table */}
      <Card variant="default" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline-light">
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Layanan
                </th>
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Harga
                </th>
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Satuan
                </th>
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Durasi
                </th>
                <th className="pb-3 text-[12px] font-[600] text-shade-50 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-hairline-light last:border-b-0">
                  <td className="py-3">
                    <p className="text-[13px] font-[500] text-ink">
                      {service.serviceName}
                    </p>
                    {service.description && (
                      <p className="text-[12px] text-shade-50 mt-0.5">
                        {service.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-[13px] text-ink">
                    {formatCurrency(service.pricePerUnit)}
                  </td>
                  <td className="py-3 text-[13px] text-shade-50 uppercase">
                    {service.unit}
                  </td>
                  <td className="py-3 text-[13px] text-shade-50">
                    {service.estimatedDurationDays} hari
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => openEditForm(service)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => setDeleteConfirmId(service.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-shade-50 text-[14px]">
              Belum ada layanan. Tambahkan layanan pertama Anda.
            </p>
          </div>
        )}
      </Card>

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingService ? "Edit Layanan" : "Tambah Layanan"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nama Layanan"
            placeholder="Contoh: Cuci Setrika"
            error={errors.serviceName?.message}
            {...register("serviceName")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Harga"
              type="number"
              placeholder="7000"
              error={errors.pricePerUnit?.message}
              {...register("pricePerUnit")}
            />

            <div className="flex flex-col gap-[4px]">
              <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink">
                Satuan
              </label>
              <select
                className="bg-canvas-light text-ink font-body text-[16px] font-[420] leading-[1.5] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
                {...register("unit")}
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="pcs">Satuan (pcs)</option>
              </select>
              {errors.unit && (
                <p className="text-[13px] font-[500] text-red-600" role="alert">
                  {errors.unit.message}
                </p>
              )}
            </div>
          </div>

          <Input
            label="Estimasi Durasi (hari)"
            type="number"
            min="1"
            max="14"
            placeholder="2"
            error={errors.estimatedDurationDays?.message}
            {...register("estimatedDurationDays")}
          />

          <div className="flex flex-col gap-[4px]">
            <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink">
              Deskripsi (opsional)
            </label>
            <textarea
              className="bg-canvas-light text-ink font-body text-[16px] font-[420] leading-[1.5] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink resize-none"
              rows={3}
              placeholder="Deskripsi singkat layanan"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[13px] font-[500] text-red-600" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" type="submit">
              {editingService ? "Simpan Perubahan" : "Tambah Layanan"}
            </Button>
            <Button
              variant="outline-light"
              size="md"
              type="button"
              onClick={() => setIsFormOpen(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Hapus Layanan"
      >
        <p className="text-[14px] text-ink mb-4">
          Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            className="bg-red-600 hover:bg-red-700"
          >
            Ya, Hapus
          </Button>
          <Button
            variant="outline-light"
            size="md"
            onClick={() => setDeleteConfirmId(null)}
          >
            Batal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
