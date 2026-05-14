"use client";

import React, { useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const orderId = params.orderId as string;

  // Form state
  const [laundryRating, setLaundryRating] = useState(0);
  const [laundryReview, setLaundryReview] = useState("");
  const [courierRating, setCourierRating] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file: File) => file.type.startsWith("image/")
    );
    setPhotos((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files).filter(
          (file: File) => file.type.startsWith("image/")
        );
        setPhotos((prev) => [...prev, ...selectedFiles]);
      }
    },
    []
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (laundryRating === 0) {
      setRatingError("Rating laundry wajib diisi");
      return;
    }

    setRatingError("");
    setIsSubmitting(true);

    try {
      if (photos.length > 0) {
        // Kirim dengan FormData jika ada foto
        const formData = new FormData();
        formData.append("laundryRating", String(laundryRating));
        if (laundryReview) formData.append("laundryReview", laundryReview);
        if (courierRating > 0) formData.append("driverRating", String(courierRating));
        photos.forEach((photo) => formData.append("photos", photo));
        await api.post(`/buyer/orders/${orderId}/review`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/buyer/orders/${orderId}/review`, {
          laundryRating,
          laundryReview: laundryReview || undefined,
          driverRating: courierRating > 0 ? courierRating : undefined,
        });
      }

      addToast("Ulasan berhasil dikirim", "success");
      router.push("/my-orders");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Gagal mengirim ulasan. Silakan coba lagi.";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />

      <main className="max-w-[640px] mx-auto px-xl py-xxl">
        <h1 className="font-display text-2xl font-[330] text-ink mb-xl tracking-wide [font-feature-settings:'ss03']">
          Beri Ulasan
        </h1>

        <div className="bg-canvas-light rounded-lg border border-hairline-light p-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
            {/* Rating Laundry */}
            <div className="flex flex-col gap-sm">
              <label className="font-body text-sm font-[500] text-ink [font-feature-settings:'ss03']">
                Rating Laundry <span className="text-red-500">*</span>
              </label>
              <StarRating
                value={laundryRating}
                onChange={(value) => {
                  setLaundryRating(value);
                  if (ratingError) setRatingError("");
                }}
                size="lg"
              />
              {ratingError && (
                <p className="text-red-500 text-sm font-body [font-feature-settings:'ss03']" role="alert">
                  {ratingError}
                </p>
              )}
            </div>

            {/* Ulasan Laundry */}
            <div className="flex flex-col gap-sm">
              <label
                htmlFor="laundry-review"
                className="font-body text-sm font-[500] text-ink [font-feature-settings:'ss03']"
              >
                Ulasan Laundry
              </label>
              <textarea
                id="laundry-review"
                value={laundryReview}
                onChange={(e) => setLaundryReview(e.target.value)}
                placeholder="Ceritakan pengalaman Anda dengan laundry ini..."
                rows={4}
                className="w-full px-lg py-md rounded-md border border-hairline-light bg-canvas-light text-ink font-body text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ink/20 placeholder:text-shade-40 [font-feature-settings:'ss03']"
              />
            </div>

            {/* Rating Kurir */}
            <div className="flex flex-col gap-sm">
              <label className="font-body text-sm font-[500] text-ink [font-feature-settings:'ss03']">
                Rating Kurir
              </label>
              <StarRating
                value={courierRating}
                onChange={setCourierRating}
                size="lg"
              />
            </div>

            {/* Upload Foto */}
            <div className="flex flex-col gap-sm">
              <label className="font-body text-sm font-[500] text-ink [font-feature-settings:'ss03']">
                Upload Foto (opsional)
              </label>
              <div
                onDrop={handlePhotoDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={[
                  "flex flex-col items-center justify-center gap-sm",
                  "w-full min-h-[120px] px-lg py-xl",
                  "rounded-md border-2 border-dashed cursor-pointer",
                  "transition-colors duration-150",
                  isDragging
                    ? "border-ink bg-shade-30/20"
                    : "border-hairline-light hover:border-shade-40",
                ].join(" ")}
                role="button"
                tabIndex={0}
                aria-label="Upload foto, klik atau drag & drop"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <UploadIcon />
                <p className="font-body text-sm text-shade-50 text-center [font-feature-settings:'ss03']">
                  Drag & drop foto di sini, atau{" "}
                  <span className="text-ink font-[500]">klik untuk pilih</span>
                </p>
                <p className="font-body text-xs text-shade-40 [font-feature-settings:'ss03']">
                  Format: JPG, PNG (maks. 5MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                aria-hidden="true"
              />

              {/* Photo previews */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-sm mt-sm">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Foto ulasan ${index + 1}`}
                        className="w-[72px] h-[72px] object-cover rounded-md border border-hairline-light"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-canvas-light text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Hapus foto ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Kirim Ulasan
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-shade-40"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
