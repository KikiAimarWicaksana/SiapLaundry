"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { Tabs } from "@/components/ui/Tabs";
import api from "@/lib/api";

interface Review {
  id: string;
  buyerName: string;
  rating: number;
  comment: string;
  serviceName: string;
  createdAt: string;
}

interface ReviewData {
  averageRating: number;
  totalReviews: number;
  breakdown: { stars: number; count: number }[];
  reviews: Review[];
}

type FilterValue = "semua" | "tertinggi" | "terendah";

export default function SellerReviewsPage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("semua");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.get("/seller/reviews");
        setData(res.data.data);
      } catch {
        setError("Gagal memuat ulasan.");
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const filteredReviews = data
    ? [...data.reviews].sort((a, b) => {
        if (filter === "tertinggi") return b.rating - a.rating;
        if (filter === "terendah") return a.rating - b.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : [];

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Ulasan Pelanggan
      </h1>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-shade-10 rounded-lg" />
          <div className="h-20 bg-shade-10 rounded-lg" />
          <div className="h-20 bg-shade-10 rounded-lg" />
        </div>
      ) : data && data.totalReviews > 0 ? (
        <>
          {/* Rating Summary */}
          <Card variant="default" className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex flex-col items-center">
                <p className="font-display text-[48px] font-[500] leading-none text-ink">
                  {data.averageRating.toFixed(1)}
                </p>
                <StarRating value={Math.round(data.averageRating)} readonly size="md" className="mt-2" />
                <p className="text-[13px] text-shade-50 mt-1">{data.totalReviews} ulasan</p>
              </div>
              <div className="flex-1">
                {data.breakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] text-shade-50 w-4 text-right">{item.stars}</span>
                    <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <div className="flex-1 h-2 bg-shade-30/30 rounded-pill overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-pill"
                        style={{ width: data.totalReviews > 0 ? `${(item.count / data.totalReviews) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-[12px] text-shade-50 w-4">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

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

          <div className="flex flex-col gap-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} variant="default">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-shade-30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px] font-[600] text-shade-60">
                      {review.buyerName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[14px] font-[550] text-ink">{review.buyerName}</h3>
                      <span className="text-[12px] text-shade-50">
                        {new Date(review.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating value={review.rating} readonly size="sm" />
                      <span className="text-[12px] text-shade-50">• {review.serviceName}</span>
                    </div>
                    {review.comment && (
                      <p className="text-[13px] text-ink leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card variant="default" className="text-center py-16">
          <p className="text-[14px] text-shade-50">Belum ada ulasan dari pelanggan.</p>
        </Card>
      )}
    </div>
  );
}
