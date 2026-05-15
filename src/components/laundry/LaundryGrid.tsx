import React from "react";
import { LaundryCard, LaundryCardProps } from "./LaundryCard";

export interface LaundryGridProps {
  laundries: LaundryCardProps[];
}

export function LaundryGrid({ laundries }: LaundryGridProps) {
  if (laundries.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="font-body text-[16px] font-[420] leading-[1.5] text-shade-50 [font-feature-settings:'ss03'] text-center">
          Tidak ada laundry yang ditemukan. Coba ubah filter Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {laundries.map((laundry) => (
        <LaundryCard key={laundry.id} {...laundry} />
      ))}
    </div>
  );
}
