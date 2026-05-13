"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types/laundry";

export interface ServiceTableProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
}

export function ServiceTable({
  services,
  selectedServiceId,
  onSelectService,
}: ServiceTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse" aria-label="Daftar layanan laundry">
        <thead>
          <tr className="border-b border-hairline-light">
            <th className="text-left font-body text-[14px] font-[550] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] py-3 px-4">
              Layanan
            </th>
            <th className="text-left font-body text-[14px] font-[550] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] py-3 px-4">
              Harga
            </th>
            <th className="text-left font-body text-[14px] font-[550] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] py-3 px-4">
              Estimasi Waktu
            </th>
            <th className="text-right font-body text-[14px] font-[550] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] py-3 px-4">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <tr
                key={service.id}
                className={[
                  "border-b border-hairline-light transition-colors duration-150",
                  isSelected ? "bg-aloe-10/20" : "hover:bg-canvas-cream",
                ].join(" ")}
              >
                <td className="font-body text-[14px] font-[420] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] py-4 px-4">
                  <div>
                    <span className="font-[500]">{service.serviceName}</span>
                    {service.description && (
                      <p className="text-[12px] text-shade-50 mt-1">
                        {service.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="font-body text-[14px] font-[420] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] py-4 px-4">
                  {formatCurrency(service.pricePerUnit)}/{service.unit}
                </td>
                <td className="font-body text-[14px] font-[420] leading-[1.49] tracking-[0.28px] text-shade-50 [font-feature-settings:'ss03'] py-4 px-4">
                  {service.estimatedDurationDays} hari
                </td>
                <td className="py-4 px-4 text-right">
                  <Button
                    variant={isSelected ? "primary" : "aloe"}
                    size="sm"
                    onClick={() => onSelectService(service.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? "✓ Dipilih" : "Pilih"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ServiceTable;
