"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocationPicker } from "@/components/map/LocationPicker";
import type { PickedLocation } from "@/components/map/LocationPicker";
import { useAuthStore } from "@/stores/authStore";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

const sellerSchema = z.object({
  laundryName: z
    .string()
    .min(1, "Nama laundry wajib diisi")
    .refine((val) => val.trim().length > 0, "Nama laundry tidak boleh hanya spasi"),
  ownerName: z
    .string()
    .min(1, "Nama pemilik wajib diisi")
    .refine((val) => val.trim().length > 0, "Nama pemilik tidak boleh hanya spasi"),
  email: z
    .string()
    .min(1, "Email bisnis wajib diisi")
    .email("Format email tidak valid"),
  phone: z
    .string()
    .min(1, "No. telepon wajib diisi")
    .refine((val) => val.trim().length > 0, "No. telepon tidak boleh hanya spasi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  address: z
    .string()
    .min(1, "Alamat laundry wajib diisi")
    .refine((val) => val.trim().length > 0, "Alamat tidak boleh hanya spasi"),
  latitude: z.number(),
  longitude: z.number(),
  operatingHours: z.string().min(1, "Jam operasional wajib diisi"),
});

type SellerFormData = z.infer<typeof sellerSchema>;

export function RegisterSellerForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      laundryName: "",
      ownerName: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      latitude: 0,
      longitude: 0,
      operatingHours: "",
    },
  });

  const handleLocationSelect = (loc: PickedLocation) => {
    setValue("address", loc.address, { shouldValidate: true });
    setValue("latitude", loc.lat);
    setValue("longitude", loc.lng);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Format file harus JPG atau PNG");
      setPhotoFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError("Ukuran file maksimal 5MB");
      setPhotoFile(null);
      return;
    }
    setPhotoFile(file);
  };

  const onSubmit = async (data: SellerFormData) => {
    setApiError(null);
    try {
      const { default: api } = await import("@/lib/api");

      const formData = new FormData();
      formData.append("laundryName", data.laundryName);
      formData.append("ownerName", data.ownerName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("password", data.password);
      formData.append("address", data.address);
      formData.append("latitude", data.latitude.toString());
      formData.append("longitude", data.longitude.toString());
      formData.append("operatingHours", data.operatingHours);
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await api.post("/auth/register/seller", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const payload = res.data.data ?? res.data;
      if (payload?.user) setUser(payload.user);
      router.push("/seller/dashboard");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setApiError(axiosError.response?.data?.message || "Gagal mendaftar. Silakan coba lagi.");
      } else {
        setApiError("Terjadi kesalahan. Silakan coba lagi.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-xl w-full"
      noValidate
    >
      {/* Nama Laundry */}
      <Input
        label="Nama Laundry"
        placeholder="Contoh: Laundry Bersih Kilat"
        error={errors.laundryName?.message}
        {...register("laundryName")}
      />

      {/* Nama Pemilik */}
      <Input
        label="Nama Pemilik"
        placeholder="Masukkan nama pemilik"
        error={errors.ownerName?.message}
        {...register("ownerName")}
      />

      {/* Email Bisnis */}
      <Input
        label="Email Bisnis"
        type="email"
        placeholder="bisnis@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* No. Telepon */}
      <Input
        label="No. Telepon"
        type="tel"
        placeholder="08123456789"
        error={errors.phone?.message}
        {...register("phone")}
      />

      {/* Password */}
      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="seller-password"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="seller-password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 6 karakter"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "seller-password-error" : undefined}
            className={[
              "bg-canvas-light text-ink w-full",
              "font-body text-[16px] font-[420] leading-[1.5]",
              "[font-feature-settings:'ss03']",
              "px-[12px] py-[10px] pr-[44px]",
              "rounded-md",
              "border",
              errors.password ? "border-red-500" : "border-hairline-light",
              "outline-none",
              "focus:ring-2 focus:ring-ink/20 focus:border-ink",
              "placeholder:text-shade-40",
              "transition-colors duration-150",
            ].join(" ")}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-shade-50 hover:text-ink transition-colors"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {errors.password && (
          <p id="seller-password-error" className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Alamat + LocationPicker */}
      <div className="flex flex-col gap-[4px]">
        <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']">
          Alamat Laundry
        </label>
        <LocationPicker
          onConfirm={handleLocationSelect}
          onCancel={() => {}}
        />
        {errors.address && (
          <p className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Foto Laundry (optional) */}
      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="seller-photo"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Foto Laundry <span className="text-shade-50">(opsional)</span>
        </label>
        <input
          id="seller-photo"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handlePhotoChange}
          className={[
            "bg-canvas-light text-ink",
            "font-body text-[14px] font-[420] leading-[1.5]",
            "[font-feature-settings:'ss03']",
            "px-[12px] py-[10px]",
            "rounded-md",
            "border",
            photoError ? "border-red-500" : "border-hairline-light",
            "file:mr-3 file:py-1 file:px-3 file:rounded-pill file:border-0",
            "file:text-[13px] file:font-[500] file:bg-shade-30 file:text-ink",
            "cursor-pointer",
          ].join(" ")}
        />
        {photoFile && (
          <p className="text-[13px] font-[500] text-shade-50 leading-[1.5]">
            {photoFile.name} ({(photoFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        {photoError && (
          <p className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {photoError}
          </p>
        )}
        <p className="text-[12px] font-[400] text-shade-50">
          Format: JPG/PNG, Maks: 5MB
        </p>
      </div>

      {/* Jam Operasional */}
      <Input
        label="Jam Operasional"
        placeholder="Contoh: Senin-Sabtu 08:00-20:00"
        error={errors.operatingHours?.message}
        {...register("operatingHours")}
      />

      {/* API Error */}
      {apiError && (
        <div
          className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600 [font-feature-settings:'ss03']"
          role="alert"
        >
          {apiError}
        </div>
      )}

      {/* Submit */}
      <Button
        variant="primary"
        size="lg"
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full mt-sm"
      >
        Daftar sebagai Mitra Laundry
      </Button>
    </form>
  );
}

/* ===== Eye Icon ===== */
function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default RegisterSellerForm;
