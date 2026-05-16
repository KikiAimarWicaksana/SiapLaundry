"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

const driverSchema = z.object({
  name: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .refine((val) => val.trim().length > 0, "Nama tidak boleh hanya spasi"),
  phone: z
    .string()
    .min(1, "No. telepon wajib diisi")
    .refine((val) => val.trim().length > 0, "No. telepon tidak boleh hanya spasi"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  vehicleType: z.enum(["Motor", "Mobil"], {
    error: "Pilih jenis kendaraan",
  }),
  vehiclePlate: z
    .string()
    .min(1, "Plat nomor wajib diisi")
    .refine((val) => val.trim().length > 0, "Plat nomor tidak boleh hanya spasi"),
});

type DriverFormData = z.infer<typeof driverSchema>;

function validateFile(file: File | null, label: string): string | null {
  if (!file) return `${label} wajib diunggah`;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${label} harus berformat JPG atau PNG`;
  if (file.size > MAX_FILE_SIZE) return `${label} maksimal 5MB`;
  return null;
}

export function RegisterDriverForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // File states
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpError, setKtpError] = useState<string | null>(null);
  const [simFile, setSimFile] = useState<File | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      vehicleType: undefined,
      vehiclePlate: "",
    },
  });

  const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const error = file ? validateFile(file, "Foto KTP") : null;
    if (error && file) {
      setKtpError(error);
      setKtpFile(null);
    } else {
      setKtpError(null);
      setKtpFile(file);
    }
  };

  const handleSimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const error = file ? validateFile(file, "Foto SIM") : null;
    if (error && file) {
      setSimError(error);
      setSimFile(null);
    } else {
      setSimError(null);
      setSimFile(file);
    }
  };

  const onSubmit = async (data: DriverFormData) => {
    // Validate files before submit
    const ktpValidation = validateFile(ktpFile, "Foto KTP");
    const simValidation = validateFile(simFile, "Foto SIM");

    if (ktpValidation) {
      setKtpError(ktpValidation);
      return;
    }
    if (simValidation) {
      setSimError(simValidation);
      return;
    }

    setApiError(null);
    try {
      const { default: api } = await import("@/lib/api");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("vehicleType", data.vehicleType);
      formData.append("vehiclePlate", data.vehiclePlate);
      formData.append("ktpPhoto", ktpFile!);
      formData.append("simPhoto", simFile!);

      const res = await api.post("/auth/register/driver", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const payload = res.data.data ?? res.data;
      if (payload?.user) setUser(payload.user);
      window.location.href = "/driver/dashboard";
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
      {/* Nama Lengkap */}
      <Input
        label="Nama Lengkap"
        placeholder="Masukkan nama lengkap"
        error={errors.name?.message}
        {...register("name")}
      />

      {/* No. Telepon */}
      <Input
        label="No. Telepon"
        type="tel"
        placeholder="08123456789"
        error={errors.phone?.message}
        {...register("phone")}
      />

      {/* Email */}
      <Input
        label="Email"
        type="email"
        placeholder="contoh@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* Password */}
      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="driver-password"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="driver-password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 6 karakter"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "driver-password-error" : undefined}
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
          <p id="driver-password-error" className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Foto KTP (required) */}
      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="driver-ktp"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Foto KTP <span className="text-red-500">*</span>
        </label>
        <input
          id="driver-ktp"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleKtpChange}
          className={[
            "bg-canvas-light text-ink",
            "font-body text-[14px] font-[420] leading-[1.5]",
            "[font-feature-settings:'ss03']",
            "px-[12px] py-[10px]",
            "rounded-md",
            "border",
            ktpError ? "border-red-500" : "border-hairline-light",
            "file:mr-3 file:py-1 file:px-3 file:rounded-pill file:border-0",
            "file:text-[13px] file:font-[500] file:bg-shade-30 file:text-ink",
            "cursor-pointer",
          ].join(" ")}
        />
        {ktpFile && (
          <p className="text-[13px] font-[500] text-shade-50 leading-[1.5]">
            {ktpFile.name} ({(ktpFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        {ktpError && (
          <p className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {ktpError}
          </p>
        )}
        <p className="text-[12px] font-[400] text-shade-50">
          Format: JPG/PNG, Maks: 5MB
        </p>
      </div>

      {/* Foto SIM (required) */}
      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="driver-sim"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Foto SIM <span className="text-red-500">*</span>
        </label>
        <input
          id="driver-sim"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleSimChange}
          className={[
            "bg-canvas-light text-ink",
            "font-body text-[14px] font-[420] leading-[1.5]",
            "[font-feature-settings:'ss03']",
            "px-[12px] py-[10px]",
            "rounded-md",
            "border",
            simError ? "border-red-500" : "border-hairline-light",
            "file:mr-3 file:py-1 file:px-3 file:rounded-pill file:border-0",
            "file:text-[13px] file:font-[500] file:bg-shade-30 file:text-ink",
            "cursor-pointer",
          ].join(" ")}
        />
        {simFile && (
          <p className="text-[13px] font-[500] text-shade-50 leading-[1.5]">
            {simFile.name} ({(simFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        {simError && (
          <p className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {simError}
          </p>
        )}
        <p className="text-[12px] font-[400] text-shade-50">
          Format: JPG/PNG, Maks: 5MB
        </p>
      </div>

      {/* Jenis Kendaraan */}
      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="driver-vehicle-type"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Jenis Kendaraan
        </label>
        <select
          id="driver-vehicle-type"
          aria-invalid={!!errors.vehicleType}
          className={[
            "bg-canvas-light text-ink",
            "font-body text-[16px] font-[420] leading-[1.5]",
            "[font-feature-settings:'ss03']",
            "px-[12px] py-[10px]",
            "rounded-md",
            "border",
            errors.vehicleType ? "border-red-500" : "border-hairline-light",
            "outline-none",
            "focus:ring-2 focus:ring-ink/20 focus:border-ink",
            "transition-colors duration-150",
          ].join(" ")}
          {...register("vehicleType")}
        >
          <option value="">Pilih jenis kendaraan</option>
          <option value="Motor">Motor</option>
          <option value="Mobil">Mobil</option>
        </select>
        {errors.vehicleType && (
          <p className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {errors.vehicleType.message}
          </p>
        )}
      </div>

      {/* Plat Nomor */}
      <Input
        label="Plat Nomor"
        placeholder="Contoh: B 1234 ABC"
        error={errors.vehiclePlate?.message}
        {...register("vehiclePlate")}
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
        Daftar sebagai Mitra Kurir
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
