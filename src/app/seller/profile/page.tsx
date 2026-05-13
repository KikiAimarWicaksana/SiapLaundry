"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Zod schema for seller profile
const profileSchema = z.object({
  laundryName: z.string().min(1, "Nama laundry wajib diisi").max(100, "Maksimal 100 karakter"),
  address: z.string().min(1, "Alamat wajib diisi").max(300, "Maksimal 300 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").max(15, "Maksimal 15 digit"),
  operatingHoursOpen: z.string().min(1, "Jam buka wajib diisi"),
  operatingHoursClose: z.string().min(1, "Jam tutup wajib diisi"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Mock current profile
const currentProfile = {
  laundryName: "Laundry Bersih Cemerlang",
  address: "Jl. Kebon Jeruk No. 15, Jakarta Barat",
  phone: "081234567890",
  operatingHoursOpen: "08:00",
  operatingHoursClose: "20:00",
  photo: "/placeholder-laundry.jpg",
};

export default function SellerProfilePage() {
  const [saved, setSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      laundryName: currentProfile.laundryName,
      address: currentProfile.address,
      phone: currentProfile.phone,
      operatingHoursOpen: currentProfile.operatingHoursOpen,
      operatingHoursClose: currentProfile.operatingHoursClose,
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // In real app, this would call API
    console.log("Profile updated:", data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Profil Laundry
      </h1>

      {/* Success message */}
      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-[13px] text-green-800">
          Profil berhasil disimpan!
        </div>
      )}

      <Card variant="default">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Photo Upload */}
          <div>
            <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink block mb-2">
              Foto Laundry
            </label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg bg-shade-30 overflow-hidden flex-shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview foto laundry"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-shade-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoChange}
                  className="text-[13px] text-shade-50 file:mr-3 file:py-2 file:px-4 file:rounded-pill file:border-0 file:text-[13px] file:font-[500] file:bg-shade-30/50 file:text-ink hover:file:bg-shade-30 file:cursor-pointer"
                  aria-label="Upload foto laundry"
                />
                <p className="text-[12px] text-shade-50 mt-1">
                  Format: JPG, PNG. Maksimal 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Laundry Name */}
          <Input
            label="Nama Laundry"
            placeholder="Nama laundry Anda"
            error={errors.laundryName?.message}
            {...register("laundryName")}
          />

          {/* Address */}
          <div className="flex flex-col gap-[4px]">
            <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink">
              Alamat
            </label>
            <textarea
              className="bg-canvas-light text-ink font-body text-[16px] font-[420] leading-[1.5] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink resize-none"
              rows={3}
              placeholder="Alamat lengkap laundry"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-[13px] font-[500] text-red-600" role="alert">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <Input
            label="Nomor Telepon"
            type="tel"
            placeholder="081234567890"
            error={errors.phone?.message}
            {...register("phone")}
          />

          {/* Operating Hours */}
          <div>
            <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink block mb-2">
              Jam Operasional
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="time"
                error={errors.operatingHoursOpen?.message}
                {...register("operatingHoursOpen")}
              />
              <span className="text-[14px] text-shade-50">sampai</span>
              <Input
                type="time"
                error={errors.operatingHoursClose?.message}
                {...register("operatingHoursClose")}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button variant="primary" size="md" type="submit">
              Simpan Profil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
