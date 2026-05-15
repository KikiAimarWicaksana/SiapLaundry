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
import { motion } from "framer-motion";

const buyerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama lengkap wajib diisi")
      .refine((val) => val.trim().length > 0, "Nama tidak boleh hanya spasi"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    phone: z
      .string()
      .min(1, "No. telepon wajib diisi")
      .refine((val) => val.trim().length > 0, "No. telepon tidak boleh hanya spasi"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    address: z
      .string()
      .min(1, "Alamat wajib diisi")
      .refine((val) => val.trim().length > 0, "Alamat tidak boleh hanya spasi"),
    latitude: z.number(),
    longitude: z.number(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type BuyerFormData = z.infer<typeof buyerSchema>;

export function RegisterBuyerForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const handleLocationSelect = (loc: PickedLocation) => {
    setValue("address", loc.address, { shouldValidate: true });
    setValue("latitude", loc.lat);
    setValue("longitude", loc.lng);
  };

  const onSubmit = async (data: BuyerFormData) => {
    setApiError(null);
    try {
      const { default: api } = await import("@/lib/api");
      const res = await api.post("/auth/register/buyer", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      });
      const payload = res.data.data ?? res.data;
      if (payload?.user) {
        setUser(payload.user);
      }
      router.push("/explore");
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
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-xl w-full"
      noValidate
    >
      <Input
        label="Nama Lengkap"
        placeholder="Masukkan nama lengkap"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Email"
        type="email"
        placeholder="contoh@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="No. Telepon"
        type="tel"
        placeholder="08123456789"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="buyer-password"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="buyer-password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 6 karakter"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "buyer-password-error" : undefined}
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
          <p id="buyer-password-error" className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="buyer-confirm-password"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Konfirmasi Password
        </label>
        <div className="relative">
          <input
            id="buyer-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Ulangi password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "buyer-confirm-password-error" : undefined}
            className={[
              "bg-canvas-light text-ink w-full",
              "font-body text-[16px] font-[420] leading-[1.5]",
              "[font-feature-settings:'ss03']",
              "px-[12px] py-[10px] pr-[44px]",
              "rounded-md",
              "border",
              errors.confirmPassword ? "border-red-500" : "border-hairline-light",
              "outline-none",
              "focus:ring-2 focus:ring-ink/20 focus:border-ink",
              "placeholder:text-shade-40",
              "transition-colors duration-150",
            ].join(" ")}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-shade-50 hover:text-ink transition-colors"
            aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            <EyeIcon open={showConfirmPassword} />
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="buyer-confirm-password-error" className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-[4px] p-4 bg-canvas-cream border border-hairline-light rounded-xl shadow-sm">
        <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] mb-1">
          Alamat Rumah
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

      {apiError && (
        <div
          className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600 [font-feature-settings:'ss03']"
          role="alert"
        >
          {apiError}
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full mt-sm shadow-md hover:shadow-lg transition-shadow"
      >
        Daftar sebagai Customer
      </Button>
    </motion.form>
  );
}

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
