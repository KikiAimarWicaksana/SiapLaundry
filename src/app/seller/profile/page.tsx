"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";

interface SellerProfile {
  laundryName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  isOpen: boolean;
  photos: string[];
  operatingHours: string;
  averageRating: number;
  totalReviews: number;
}

function CameraIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

export default function SellerProfilePage() {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form state
  const [laundryName, setLaundryName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/seller/profile");
        const data: SellerProfile = res.data.data;
        setProfile(data);
        setLaundryName(data.laundryName);
        setAddress(data.address);
        setPhone(data.phone);
        setOperatingHours(data.operatingHours);
        setIsOpen(data.isOpen);
      } catch {
        addToast("Gagal memuat profil.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/seller/profile", {
        laundryName,
        address,
        phone,
        operatingHours,
        isOpen,
      });
      setProfile((prev) => prev ? { ...prev, laundryName, address, phone, operatingHours, isOpen } : prev);
      addToast("Profil berhasil disimpan!", "success");
    } catch {
      addToast("Gagal menyimpan profil.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast("Format file harus JPG, PNG, atau WebP.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("Ukuran file maksimal 5MB.", "error");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.patch("/seller/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newPhotos: string[] = res.data.data.photos;
      setProfile((prev) => prev ? { ...prev, photos: newPhotos } : prev);
      addToast("Foto berhasil diupload!", "success");
    } catch {
      addToast("Gagal mengupload foto.", "error");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      const newPhotos = (profile?.photos ?? []).filter((p) => p !== photoUrl);
      await api.patch("/seller/profile", { photos: newPhotos });
      setProfile((prev) => prev ? { ...prev, photos: newPhotos } : prev);
      addToast("Foto dihapus.", "success");
    } catch {
      addToast("Gagal menghapus foto.", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-shade-10 rounded" />
        <div className="h-64 bg-shade-10 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Profil Laundry
      </h1>

      {/* Foto Laundry */}
      <Card variant="default" className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[16px] font-[500] text-ink">Foto Laundry</h2>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button
              variant="aloe"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploadingPhoto}
              className="gap-2"
            >
              <CameraIcon />
              {uploadingPhoto ? "Mengupload..." : "Upload Foto"}
            </Button>
          </div>
        </div>

        {profile?.photos && profile.photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.photos.map((photo, i) => (
              <div key={i} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-shade-10">
                <Image
                  src={photo}
                  alt={`Foto laundry ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {/* Overlay hapus */}
                <button
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Hapus foto"
                >
                  <TrashIcon />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-pill">
                    Utama
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-hairline-light rounded-lg p-8 text-center cursor-pointer hover:border-shade-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <CameraIcon />
            <p className="text-[13px] text-shade-50 mt-2">Klik untuk upload foto laundry</p>
            <p className="text-[11px] text-shade-40 mt-1">JPG, PNG, WebP — Maks 5MB</p>
          </div>
        )}
      </Card>

      {/* Info Profil */}
      <Card variant="default" className="mb-4">
        <h2 className="font-display text-[16px] font-[500] text-ink mb-4">Informasi Laundry</h2>
        <div className="flex flex-col gap-4">
          <Input
            label="Nama Laundry"
            value={laundryName}
            onChange={(e) => setLaundryName(e.target.value)}
            placeholder="Nama laundry Anda"
          />

          <div className="flex flex-col gap-[4px]">
            <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink">
              Alamat
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Alamat lengkap laundry"
              className="bg-canvas-light text-ink font-body text-[16px] font-[420] leading-[1.5] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink resize-none transition-colors"
            />
          </div>

          <Input
            label="Nomor Telepon"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="081234567890"
          />

          <div className="flex flex-col gap-[4px]">
            <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink">
              Jam Operasional
            </label>
            <textarea
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              rows={3}
              placeholder="Contoh:
Senin - Jumat: 08:00 - 20:00
Sabtu: 09:00 - 18:00
Minggu: Tutup"
              className="bg-canvas-light text-ink font-body text-[16px] font-[420] leading-[1.5] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink resize-none transition-colors"
            />
          </div>

          {/* Status buka/tutup */}
          <div className="flex items-center justify-between p-3 bg-canvas-cream rounded-lg border border-hairline-light">
            <div>
              <p className="text-[14px] font-[500] text-ink">Status Laundry</p>
              <p className="text-[12px] text-shade-50">
                {isOpen ? "Laundry sedang buka dan menerima pesanan" : "Laundry sedang tutup"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={[
                "relative w-[52px] h-[28px] rounded-pill transition-colors duration-200 cursor-pointer",
                isOpen ? "bg-green-500" : "bg-shade-50",
              ].join(" ")}
              aria-pressed={isOpen}
              aria-label={isOpen ? "Tutup laundry" : "Buka laundry"}
            >
              <div
                className={[
                  "absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-transform duration-200",
                  isOpen ? "translate-x-[27px]" : "translate-x-[3px]",
                ].join(" ")}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Info read-only */}
      {profile && (
        <Card variant="default" className="mb-6">
          <h2 className="font-display text-[16px] font-[500] text-ink mb-3">Statistik</h2>
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <p className="text-shade-50">Email</p>
              <p className="text-ink font-[500]">{profile.email}</p>
            </div>
            <div>
              <p className="text-shade-50">Nama Pemilik</p>
              <p className="text-ink font-[500]">{profile.ownerName}</p>
            </div>
            <div>
              <p className="text-shade-50">Rating</p>
              <p className="text-ink font-[500]">
                {profile.averageRating > 0 ? `⭐ ${profile.averageRating.toFixed(1)}` : "Belum ada"}
              </p>
            </div>
            <div>
              <p className="text-shade-50">Total Ulasan</p>
              <p className="text-ink font-[500]">{profile.totalReviews}</p>
            </div>
          </div>
        </Card>
      )}

      <Button variant="primary" size="md" onClick={handleSave} loading={saving}>
        Simpan Perubahan
      </Button>
    </div>
  );
}
