"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PillTag } from "@/components/ui/PillTag";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ServiceTable } from "@/components/laundry/ServiceTable";
import { ReviewCard } from "@/components/laundry/ReviewCard";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types/laundry";

// --- Mock Data ---
interface ReviewData {
  id: string;
  name: string;
  avatar?: string;
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
  distanceKm: number;
  services: Service[];
  reviews: ReviewData[];
  ratingBreakdown: Record<number, number>;
}

const MOCK_LAUNDRY: LaundryDetail = {
  id: "1",
  laundryName: "Laundry Bersih Cemerlang",
  ownerName: "Budi Santoso",
  address: "Jl. Merdeka No. 45, Bandung, Jawa Barat 40115",
  latitude: -6.9175,
  longitude: 107.6191,
  photos: [
    "/placeholder-laundry.jpg",
    "/placeholder-laundry.jpg",
    "/placeholder-laundry.jpg",
    "/placeholder-laundry.jpg",
  ],
  operatingHours: {
    senin: "08:00 - 20:00",
    selasa: "08:00 - 20:00",
    rabu: "08:00 - 20:00",
    kamis: "08:00 - 20:00",
    jumat: "08:00 - 20:00",
    sabtu: "09:00 - 18:00",
    minggu: "Tutup",
  },
  isOpen: true,
  averageRating: 4.8,
  totalReviews: 124,
  distanceKm: 1.2,
  services: [
    {
      id: "s1",
      sellerId: "1",
      serviceName: "Cuci Kering",
      pricePerUnit: 7000,
      unit: "kg",
      estimatedDurationDays: 2,
      description: "Cuci kering tanpa setrika",
      isActive: true,
    },
    {
      id: "s2",
      sellerId: "1",
      serviceName: "Cuci Setrika",
      pricePerUnit: 10000,
      unit: "kg",
      estimatedDurationDays: 3,
      description: "Cuci lengkap dengan setrika rapi",
      isActive: true,
    },
    {
      id: "s3",
      sellerId: "1",
      serviceName: "Setrika Saja",
      pricePerUnit: 5000,
      unit: "kg",
      estimatedDurationDays: 1,
      description: "Setrika pakaian yang sudah bersih",
      isActive: true,
    },
    {
      id: "s4",
      sellerId: "1",
      serviceName: "Dry Clean",
      pricePerUnit: 25000,
      unit: "pcs",
      estimatedDurationDays: 4,
      description: "Dry cleaning untuk pakaian khusus",
      isActive: true,
    },
  ],
  reviews: [
    {
      id: "r1",
      name: "Andi Pratama",
      avatar: undefined,
      rating: 5,
      date: "12 Mei 2026",
      comment:
        "Pelayanan sangat memuaskan! Pakaian bersih dan wangi. Pengantaran tepat waktu. Recommended!",
      photos: [],
    },
    {
      id: "r2",
      name: "Siti Nurhaliza",
      avatar: undefined,
      rating: 4,
      date: "10 Mei 2026",
      comment:
        "Hasil cucian bagus, tapi estimasi waktu agak lebih lama dari yang dijanjikan. Overall masih oke.",
    },
    {
      id: "r3",
      name: "Rudi Hermawan",
      avatar: undefined,
      rating: 5,
      date: "8 Mei 2026",
      comment:
        "Sudah langganan di sini. Harga terjangkau dan kualitas selalu konsisten. Top!",
      photos: ["/placeholder-laundry.jpg"],
    },
    {
      id: "r4",
      name: "Maya Sari",
      avatar: undefined,
      rating: 4,
      date: "5 Mei 2026",
      comment: "Bersih dan rapi. Kurir juga ramah. Akan order lagi.",
    },
    {
      id: "r5",
      name: "Doni Setiawan",
      avatar: undefined,
      rating: 5,
      date: "3 Mei 2026",
      comment:
        "Dry clean-nya bagus banget. Jas saya jadi seperti baru lagi. Terima kasih!",
    },
  ],
  ratingBreakdown: {
    5: 78,
    4: 32,
    3: 10,
    2: 3,
    1: 1,
  },
};

// --- Review Filter Tabs ---
const REVIEW_FILTER_TABS = [
  { label: "Terbaru", value: "latest" },
  { label: "Tertinggi", value: "highest" },
  { label: "Terendah", value: "lowest" },
];

export default function LaundryDetailPage() {
  const router = useRouter();
  const laundry = MOCK_LAUNDRY;

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState("latest");

  // Carousel navigation
  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? laundry.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === laundry.photos.length - 1 ? 0 : prev + 1
    );
  };

  // Service selection
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId((prev) => (prev === serviceId ? null : serviceId));
  };

  // Sorted reviews
  const sortedReviews = useMemo(() => {
    const reviews = [...laundry.reviews];
    switch (reviewFilter) {
      case "highest":
        return reviews.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return reviews.sort((a, b) => a.rating - b.rating);
      case "latest":
      default:
        return reviews;
    }
  }, [reviewFilter, laundry.reviews]);

  // CTA handler
  const handleOrderNow = () => {
    if (selectedServiceId && laundry.isOpen) {
      router.push(`/order/create?laundryId=${laundry.id}&serviceId=${selectedServiceId}`);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-cream pb-[80px]">
      <Navbar variant="light" />

      <main className="max-w-[1280px] mx-auto px-xl py-xl">
        {/* Photo Carousel */}
        <section className="relative mb-8" aria-label="Foto laundry">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-xl bg-shade-30">
            <Image
              src={laundry.photos[currentPhotoIndex]}
              alt={`Foto ${laundry.laundryName} ${currentPhotoIndex + 1} dari ${laundry.photos.length}`}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />

            {/* Prev Button */}
            {laundry.photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-canvas-light/80 backdrop-blur-sm flex items-center justify-center text-ink hover:bg-canvas-light transition-colors shadow-md"
                  aria-label="Foto sebelumnya"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-canvas-light/80 backdrop-blur-sm flex items-center justify-center text-ink hover:bg-canvas-light transition-colors shadow-md"
                  aria-label="Foto berikutnya"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {/* Photo Indicators */}
            {laundry.photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {laundry.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={[
                      "w-2.5 h-2.5 rounded-full transition-colors",
                      index === currentPhotoIndex
                        ? "bg-canvas-light"
                        : "bg-canvas-light/50",
                    ].join(" ")}
                    aria-label={`Lihat foto ${index + 1}`}
                    aria-current={index === currentPhotoIndex ? "true" : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Laundry Header Info */}
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

              {/* Rating + Reviews + Distance */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(laundry.averageRating)} readonly size="sm" />
                  <span className="font-body text-[14px] font-[500] text-shade-50 [font-feature-settings:'ss03']">
                    {laundry.averageRating.toFixed(1)} ({laundry.totalReviews} ulasan)
                  </span>
                </div>
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
                  <span className="font-body text-[14px] font-[500] [font-feature-settings:'ss03']">
                    {laundry.distanceKm.toFixed(1)} km
                  </span>
                </div>
              </div>

              {/* Address */}
              <p className="font-body text-[14px] font-[420] leading-[1.6] text-shade-60 [font-feature-settings:'ss03'] mt-2">
                {laundry.address}
              </p>
            </div>

            {/* Operating Hours */}
            <div className="bg-canvas-light rounded-lg border border-hairline-light p-4 min-w-[220px]">
              <h3 className="font-body text-[14px] font-[550] text-ink [font-feature-settings:'ss03'] mb-2">
                Jam Operasional
              </h3>
              <ul className="space-y-1">
                {Object.entries(laundry.operatingHours).map(([day, hours]) => (
                  <li
                    key={day}
                    className="flex justify-between font-body text-[12px] font-[420] text-shade-60 [font-feature-settings:'ss03']"
                  >
                    <span className="capitalize">{day}</span>
                    <span>{hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Service Table */}
        <section className="mb-8" aria-labelledby="services-heading">
          <h2
            id="services-heading"
            className="font-display text-[22px] font-[330] leading-[1.3] text-ink [font-feature-settings:'ss03'] mb-4"
          >
            Layanan
          </h2>
          <div className="bg-canvas-light rounded-lg border border-hairline-light overflow-hidden">
            <ServiceTable
              services={laundry.services}
              selectedServiceId={selectedServiceId}
              onSelectService={handleSelectService}
            />
          </div>
        </section>

        {/* Map Section (Placeholder) */}
        <section className="mb-8" aria-labelledby="location-heading">
          <h2
            id="location-heading"
            className="font-display text-[22px] font-[330] leading-[1.3] text-ink [font-feature-settings:'ss03'] mb-4"
          >
            Lokasi
          </h2>
          <div className="w-full h-[300px] rounded-lg bg-shade-30 flex items-center justify-center border border-hairline-light">
            <div className="text-center">
              <svg
                className="mx-auto mb-2 text-shade-50"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="font-body text-[14px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                Google Maps akan ditampilkan di sini
              </p>
              <p className="font-body text-[12px] font-[420] text-shade-40 [font-feature-settings:'ss03'] mt-1">
                {laundry.address}
              </p>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section aria-labelledby="reviews-heading">
          <h2
            id="reviews-heading"
            className="font-display text-[22px] font-[330] leading-[1.3] text-ink [font-feature-settings:'ss03'] mb-4"
          >
            Ulasan
          </h2>

          {/* Rating Summary */}
          <div className="bg-canvas-light rounded-lg border border-hairline-light p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center min-w-[120px]">
                <span className="font-display text-[48px] font-[330] leading-[1] text-ink [font-feature-settings:'ss03']">
                  {laundry.averageRating.toFixed(1)}
                </span>
                <StarRating value={Math.round(laundry.averageRating)} readonly size="md" className="mt-2" />
                <span className="font-body text-[12px] font-[420] text-shade-50 [font-feature-settings:'ss03'] mt-1">
                  {laundry.totalReviews} ulasan
                </span>
              </div>

              {/* Rating Breakdown */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = laundry.ratingBreakdown[star] || 0;
                  const percentage =
                    laundry.totalReviews > 0
                      ? (count / laundry.totalReviews) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="font-body text-[12px] font-[500] text-shade-60 [font-feature-settings:'ss03'] w-[16px] text-right">
                        {star}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-yellow-400 shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <div className="flex-1 h-2 bg-shade-30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-body text-[12px] font-[420] text-shade-50 [font-feature-settings:'ss03'] w-[32px]">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review Filter Tabs */}
          <div className="mb-4">
            <Tabs
              items={REVIEW_FILTER_TABS}
              value={reviewFilter}
              onChange={setReviewFilter}
            />
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {sortedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                name={review.name}
                avatar={review.avatar}
                rating={review.rating}
                date={review.date}
                comment={review.comment}
                photos={review.photos}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-canvas-light border-t border-hairline-light px-xl py-4 z-40">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {selectedServiceId ? (
              <p className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03'] truncate">
                {laundry.services.find((s) => s.id === selectedServiceId)?.serviceName} —{" "}
                {formatCurrency(
                  laundry.services.find((s) => s.id === selectedServiceId)
                    ?.pricePerUnit ?? 0
                )}
                /{laundry.services.find((s) => s.id === selectedServiceId)?.unit}
              </p>
            ) : (
              <p className="font-body text-[14px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                Pilih layanan untuk melanjutkan
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleOrderNow}
            disabled={!selectedServiceId || !laundry.isOpen}
            className="shrink-0"
          >
            {!laundry.isOpen ? "Laundry Tutup" : "Pesan Sekarang"}
          </Button>
        </div>
      </div>
    </div>
  );
}
