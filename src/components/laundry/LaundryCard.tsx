import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PillTag } from "@/components/ui/PillTag";
import { StarRating } from "@/components/ui/StarRating";
import { formatCurrency } from "@/lib/utils";

export interface LaundryCardProps {
  id: string;
  name: string;
  photos: string[];
  averageRating: number;
  totalReviews: number;
  distanceKm: number;
  startingPrice: number;
  isOpen: boolean;
  services: string[];
}

export function LaundryCard({
  id,
  name,
  photos,
  averageRating,
  totalReviews,
  distanceKm,
  startingPrice,
  isOpen,
}: LaundryCardProps) {
  const photoSrc = photos.length > 0 ? photos[0] : "/placeholder-laundry.jpg";

  return (
    <article
      className={[
        "bg-canvas-light rounded-lg overflow-hidden",
        "shadow-[0_8px_8px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)]",
        "flex flex-col",
      ].join(" ")}
    >
      {/* Photo */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
        <Image
          src={photoSrc}
          alt={`Foto ${name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Badge Buka/Tutup */}
        <div className="absolute top-3 right-3">
          <PillTag variant={isOpen ? "mint" : "shade"}>
            {isOpen ? "Buka" : "Tutup"}
          </PillTag>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Nama Laundry */}
        <h3 className="font-body text-[16px] font-[550] leading-[1.5] text-ink [font-feature-settings:'ss03'] line-clamp-1">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating value={Math.round(averageRating)} readonly size="sm" />
          <span className="font-body text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-shade-50 [font-feature-settings:'ss03']">
            ({totalReviews} ulasan)
          </span>
        </div>

        {/* Jarak */}
        <div className="flex items-center gap-1 text-shade-50">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-body text-[14px] font-[500] leading-[1.49] tracking-[0.28px] [font-feature-settings:'ss03']">
            {distanceKm.toFixed(1)} km
          </span>
        </div>

        {/* Harga mulai */}
        <p className="font-body text-[16px] font-[550] leading-[1.5] text-ink [font-feature-settings:'ss03']">
          Mulai {formatCurrency(startingPrice)}/kg
        </p>

        {/* Tombol Lihat Detail */}
        <div className="mt-auto pt-3">
          <Link
            href={`/laundry/${id}`}
            className={[
              "inline-flex items-center justify-center w-full",
              "bg-canvas-night text-canvas-light",
              "rounded-pill",
              "px-6 py-3 text-base",
              "font-body font-[420] leading-[1.5]",
              "[font-feature-settings:'ss03']",
              "transition-colors duration-150 ease-in-out",
              "hover:bg-shade-60",
              "active:bg-shade-70",
            ].join(" ")}
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
