"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { Tabs } from "@/components/ui/Tabs";

interface Review {
  id: string;
  buyerName: string;
  buyerAvatar?: string;
  rating: number;
  comment: string;
  serviceName: string;
  createdAt: string;
}

// Mock data
const mockReviews: Review[] = [
  {
    id: "rev-001",
    buyerName: "Andi Pratama",
    rating: 5,
    comment: "Hasil cucian sangat bersih dan wangi. Pengiriman tepat waktu. Sangat puas!",
    serviceName: "Cuci Setrika",
    createdAt: "2026-05-30T10:00:00Z",
  },
  {
    id: "rev-002",
    buyerName: "Siti Rahayu",
    rating: 4,
    comment: "Layanan bagus, tapi pengiriman agak terlambat 1 jam dari estimasi.",
    serviceName: "Cuci Kering",
    createdAt: "2026-05-28T14:30:00Z",
  },
  {
    id: "rev-003",
    buyerName: "Budi Santoso",
    rating: 5,
    comment: "Setrika rapi sekali, pakaian seperti baru. Recommended!",
    serviceName: "Setrika Saja",
    createdAt: "2026-05-27T09:15:00Z",
  },
  {
    id: "rev-004",
    buyerName: "Dewi Lestari",
    rating: 3,
    comment: "Hasil cuci oke, tapi ada satu baju yang masih ada noda. Semoga bisa lebih teliti.",
    serviceName: "Cuci Setrika",
    createdAt: "2026-05-25T16:00:00Z",
  },
  {
    id: "rev-005",
    buyerName: "Rudi Hermawan",
    rating: 5,
    comment: "Sepatu jadi bersih banget! Harga juga terjangkau. Pasti order lagi.",
    serviceName: "Cuci Sepatu",
    createdAt: "2026-05-24T11:45:00Z",
  },
  {
    id: "rev-006",
    buyerName: "Maya Sari",
    rating: 4,
    comment: "Pelayanan ramah dan cepat. Cucian bersih.",
    serviceName: "Cuci Setrika",
    createdAt: "2026-05-22T08:30:00Z",
  },
];

const overallRating = 4.3;
const totalReviews = mockReviews.length;
const ratingBreakdown = [
  { stars: 5, count: 3 },
  { stars: 4, count: 2 },
  { stars: 3, count: 1 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

type FilterValue = "semua" | "tertinggi" | "terendah";

export default function SellerReviewsPage() {
  const [filter, setFilter] = useState<FilterValue>("semua");

  const filteredReviews = [...mockReviews].sort((a, b) => {
    if (filter === "tertinggi") return b.rating - a.rating;
    if (filter === "terendah") return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Ulasan Pelanggan
      </h1>

      {/* Rating Summary */}
      <Card variant="default" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Overall rating */}
          <div className="flex flex-col items-center">
            <p className="font-display text-[48px] font-[500] leading-none text-ink">
              {overallRating}
            </p>
            <StarRating value={Math.round(overallRating)} readonly size="md" className="mt-2" />
            <p className="text-[13px] text-shade-50 mt-1">
              {totalReviews} ulasan
            </p>
          </div>

          {/* Rating breakdown */}
          <div className="flex-1">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 mb-1">
                <span className="text-[12px] text-shade-50 w-4 text-right">
                  {item.stars}
                </span>
                <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <div className="flex-1 h-2 bg-shade-30/30 rounded-pill overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-pill"
                    style={{
                      width: totalReviews > 0 ? `${(item.count / totalReviews) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className="text-[12px] text-shade-50 w-4">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <Tabs
        items={[
          { label: "Terbaru", value: "semua" },
          { label: "Tertinggi", value: "tertinggi" },
          { label: "Terendah", value: "terendah" },
        ]}
        value={filter}
        onChange={(val) => setFilter(val as FilterValue)}
        className="mb-6"
      />

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} variant="default">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-shade-30 flex items-center justify-center flex-shrink-0">
                <span className="text-[14px] font-[600] text-shade-60">
                  {review.buyerName.charAt(0)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[14px] font-[550] text-ink">
                    {review.buyerName}
                  </h3>
                  <span className="text-[12px] text-shade-50">
                    {new Date(review.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <StarRating value={review.rating} readonly size="sm" />
                  <span className="text-[12px] text-shade-50">
                    • {review.serviceName}
                  </span>
                </div>

                <p className="text-[13px] text-ink leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
