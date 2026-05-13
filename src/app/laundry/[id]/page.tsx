"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PillTag } from "@/components/ui/PillTag";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ServiceTable } from "@/components/laundry/ServiceTable";
import { ReviewCard } from "@/components/laundry/ReviewCard";
import { TrackingMap } from "@/components/map/TrackingMap";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { Service } from "@/types/laundry";

interface ReviewData {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  photos?: string[];
}

interface LaundryDetail {
  id: string;
  laundryName: string;
  ownerName: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  operatingHours: Record<string, string>;
  isOpen: boolean;
  averageRating: number;
  totalReviews: number;
  services: Service[];
  reviews: ReviewData[];
}

const REVIEW_FILTER_TABS = [
  { label: "Terbaru", value: "latest" },
  { label: "Tertinggi", value: "highest" },
  { label: "Terendah", value: "lowest" },
];

const DAY_LABELS: Record<string, string> = {
  monday: "Senin", tuesday: "Selasa", wednesday: "Rabu",
  thursday: "Kamis", friday: "Jumat", saturday: "Sabtu", sunday: "Minggu",
};

export default function LaundryDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [laundry, setLaundry] = useState<LaundryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState("latest");

  useEffect(() => {
    async function fetchLaundry() {
      try {
        const res = await api.get(`/laundry/${id}`);
        const d = res.data.data;
        setLaundry({
          id: d.id,
          laundryName: d.laundryName,
          ownerName: d.ownerName,
          address: d.address,
          latitude: d.latitude,
          longitude: d.longitude,
          photos: d.photos?.length > 0 ? d.photos : ["/placeholder-laundry.jpg"],
          operatingHours: (d.operatingHours as Record<string, string>) ?? {},
          isOpen: d.isOpen,
          averageRating: d.averageRating,
          totalReviews: d.totalReviews,
          services: d.services ?? [],
          reviews: (d.reviews ?? []).map((r: { id: string; buyerName: string; rating: number; createdAt: string; comment: string; photos?: string[] }) => ({
            id: r.id,
            name: r.buyerName,
            rating: r.rating,
            date: new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            comment: r.comment,
            photos: r.photos ?? [],
          })),
        });
      } catch {
        setError("Gagal memuat data laundry.");
      } finally {
        setLoading(false);
      }
    }
    fetchLaundry();
  }, [id]);

  const sortedReviews = useMemo(() => {
    if (!laundry) return [];
    const reviews = [...laundry.reviews];
    if (reviewFilter === "highest") return reviews.sort((a, b) => b.rating - a.rating);
    if (reviewFilter === "lowest") return reviews.sort((a, b) => a.rating - b.rating);
    return reviews;
  }, [reviewFilter, laundry]);

  const handleOrderNow = () => {
    if (selectedServiceId && laundry?.isOpen) {
      router.push(`/order/create?laundryId=${laundry.id}&serviceId=${selectedServiceId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-cream">
        <Navbar variant="light" />
        <main className="max-w-[1280px] mx-auto px-xl py-xl space-y-6 animate-pulse">
          <div className="aspect-[21/9] w-full bg-shade-10 rounded-xl" />
          <div className="h-8 w-64 bg-shade-10 rounded" />
          <div className="h-4 w-48 bg-shade-10 rounded" />
        </main>
      </div>
    );
  }

  if (error || !laundry) {
    return (
      <div className="min-h-screen bg-canvas-cream">
        <Navbar variant="light" />
        <main className="max-w-[1280px] mx-auto px-xl py-xl text-center py-12">
          <p className="text-shade-50 text-[14px] mb-4">{error ?? "Laundry tidak ditemukan."}</p>
          <Button variant="primary" size="md" onClick={() => router.push("/explore")}>
            Kembali ke Explore
          </Button>
        </main>
      </div>
    );
  }

  // Hitung rating breakdown dari reviews
  const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  laundry.reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) ratingBreakdown[r.rating]++;
  });

  return (
    <div className="min-h-screen bg-canvas-cream pb-[80px]">
      <Navbar variant="light" />

      <main className="max-w-[1280px] mx-auto px-xl py-xl">
        {/* Photo Carousel */}
        <section className="relative mb-8" aria-label="Foto laundry">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-xl bg-shade-30">
            <Image
              src={laundry.photos[currentPhotoIndex]}
              alt={`Foto ${laundry.laundryName} ${currentPhotoIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
            {laundry.photos.length > 1 && (
              <>
                <button onClick={() => setCurrentPhotoIndex((p) => p === 0 ? laundry.photos.length - 1 : p - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-canvas-light/80 backdrop-blur-sm flex items-center justify-center text-ink hover:bg-canvas-light transition-colors shadow-md"
                  aria-label="Foto sebelumnya">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button onClick={() => setCurrentPhotoIndex((p) => p === laundry.photos.length - 1 ? 0 : p + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-canvas-light/80 backdrop-blur-sm flex items-center justify-center text-ink hover:bg-canvas-light transition-colors shadow-md"
                  aria-label="Foto berikutnya">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {laundry.photos.map((_, i) => (
                    <button key={i} onClick={() => setCurrentPhotoIndex(i)}
                      className={["w-2.5 h-2.5 rounded-full transition-colors", i === currentPhotoIndex ? "bg-canvas-light" : "bg-canvas-light/50"].join(" ")}
                      aria-label={`Lihat foto ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Header Info */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-[28px] md:text-[36px] font-[330] leading-[1.2] text-ink [font-feature-settings:'ss03']">
                  {laundry.laundryName}
                </h1>
                <PillTag variant={laundry.isOpen ? "mint" : "shade"}>
                  {laundry.isOpen ? "Buka" : "Tutup"}
                </PillTag>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(laundry.averageRating)} readonly size="sm" />
                  <span className="font-body text-[14px] font-[500] text-shade-50">
                    {laundry.averageRating.toFixed(1)} ({laundry.totalReviews} ulasan)
                  </span>
                </div>
              </div>
              <p className="font-body text-[14px] font-[420] leading-[1.6] text-shade-60 mt-2">{laundry.address}</p>
            </div>

            {/* Operating Hours */}
            {Object.keys(laundry.operatingHours).length > 0 && (
              <div className="bg-canvas-light rounded-lg border border-hairline-light p-4 min-w-[220px]">
                <h3 className="font-body text-[14px] font-[550] text-ink mb-2">Jam Operasional</h3>
                <ul className="space-y-1">
                  {Object.entries(laundry.operatingHours).map(([day, hours]) => (
                    <li key={day} className="flex justify-between font-body text-[12px] font-[420] text-shade-60">
                      <span className="capitalize">{DAY_LABELS[day] ?? day}</span>
                      <span>{hours as string}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Services */}
        <section className="mb-8" aria-labelledby="services-heading">
          <h2 id="services-heading" className="font-display text-[22px] font-[330] leading-[1.3] text-ink mb-4">Layanan</h2>
          <div className="bg-canvas-light rounded-lg border border-hairline-light overflow-hidden">
            <ServiceTable
              services={laundry.services}
              selectedServiceId={selectedServiceId}
              onSelectService={(sid) => setSelectedServiceId((p) => p === sid ? null : sid)}
            />
          </div>
        </section>

        {/* Map */}
        <section className="mb-8" aria-labelledby="location-heading">
          <h2 id="location-heading" className="font-display text-[22px] font-[330] leading-[1.3] text-ink mb-4">Lokasi</h2>
          <TrackingMap
            destination={{ lat: laundry.latitude, lng: laundry.longitude }}
            destinationLabel={laundry.laundryName}
            height="300px"
            showRoute={false}
          />
        </section>

        {/* Reviews */}
        <section aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="font-display text-[22px] font-[330] leading-[1.3] text-ink mb-4">Ulasan</h2>

          <div className="bg-canvas-light rounded-lg border border-hairline-light p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center justify-center min-w-[120px]">
                <span className="font-display text-[48px] font-[330] leading-[1] text-ink">
                  {laundry.averageRating.toFixed(1)}
                </span>
                <StarRating value={Math.round(laundry.averageRating)} readonly size="md" className="mt-2" />
                <span className="font-body text-[12px] font-[420] text-shade-50 mt-1">{laundry.totalReviews} ulasan</span>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingBreakdown[star] ?? 0;
                  const pct = laundry.totalReviews > 0 ? (count / laundry.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="font-body text-[12px] font-[500] text-shade-60 w-[16px] text-right">{star}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400 shrink-0" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <div className="flex-1 h-2 bg-shade-30 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-body text-[12px] font-[420] text-shade-50 w-[32px]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Tabs items={REVIEW_FILTER_TABS} value={reviewFilter} onChange={setReviewFilter} />
          </div>

          {sortedReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-shade-50 text-[14px]">Belum ada ulasan untuk laundry ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <ReviewCard key={review.id} name={review.name} rating={review.rating}
                  date={review.date} comment={review.comment} photos={review.photos} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-canvas-light border-t border-hairline-light px-xl py-4 z-40">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {selectedServiceId ? (
              <p className="font-body text-[14px] font-[500] text-ink truncate">
                {laundry.services.find((s) => s.id === selectedServiceId)?.serviceName} —{" "}
                {formatCurrency(laundry.services.find((s) => s.id === selectedServiceId)?.pricePerUnit ?? 0)}
                /{laundry.services.find((s) => s.id === selectedServiceId)?.unit}
              </p>
            ) : (
              <p className="font-body text-[14px] font-[420] text-shade-50">Pilih layanan untuk melanjutkan</p>
            )}
          </div>
          <Button variant="primary" size="md" onClick={handleOrderNow}
            disabled={!selectedServiceId || !laundry.isOpen} className="shrink-0">
            {!laundry.isOpen ? "Laundry Tutup" : "Pesan Sekarang"}
          </Button>
        </div>
      </div>
    </div>
  );
}
