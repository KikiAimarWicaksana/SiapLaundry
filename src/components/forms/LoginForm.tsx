"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@/types/user";

const loginSchema = z.object({
  emailOrPhone: z.string().min(3, "Email atau telepon minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["buyer", "seller", "driver"], {
    error: "Pilih role terlebih dahulu",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "buyer", label: "Customer" },
  { value: "seller", label: "Mitra Laundry" },
  { value: "driver", label: "Mitra Kurir" },
];

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
      role: undefined,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login({
        emailOrPhone: data.emailOrPhone,
        password: data.password,
        role: data.role,
      });

      // Redirect based on role
      switch (data.role) {
        case "buyer":
          window.location.href = "/explore";
          break;
        case "seller":
          window.location.href = "/seller/dashboard";
          break;
        case "driver":
          window.location.href = "/driver/dashboard";
          break;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setApiError(
          axiosError.response?.data?.message ||
            "Email/telepon atau password salah"
        );
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
      {/* Role Selection */}
      <div className="flex flex-col gap-sm">
        <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']">
          Masuk sebagai
        </label>
        <div className="flex flex-wrap gap-sm">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue("role", option.value, { shouldValidate: true })}
              className={[
                "px-4 py-2 rounded-pill font-body text-[14px] font-[420] transition-colors duration-150",
                "[font-feature-settings:'ss03']",
                selectedRole === option.value
                  ? "bg-ink text-canvas-light border-2 border-ink"
                  : "bg-transparent text-ink border-2 border-hairline-light hover:border-ink",
              ].join(" ")}
              aria-pressed={selectedRole === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.role && (
          <p className="text-[13px] font-[500] text-red-600 leading-[1.5]" role="alert">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Email/Phone Field */}
      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="emailOrPhone"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Email atau No. Telepon
        </label>
        <input
          id="emailOrPhone"
          type="text"
          placeholder="contoh@email.com atau 08123456789"
          aria-invalid={!!errors.emailOrPhone}
          aria-describedby={errors.emailOrPhone ? "emailOrPhone-error" : undefined}
          className={[
            "bg-canvas-light text-ink",
            "font-body text-[16px] font-[420] leading-[1.5]",
            "[font-feature-settings:'ss03']",
            "px-[12px] py-[10px]",
            "rounded-md",
            "border",
            errors.emailOrPhone ? "border-red-500" : "border-hairline-light",
            "outline-none",
            "focus:ring-2 focus:ring-ink/20 focus:border-ink",
            "placeholder:text-shade-40",
            "transition-colors duration-150",
          ].join(" ")}
          {...register("emailOrPhone")}
        />
        {errors.emailOrPhone && (
          <p
            id="emailOrPhone-error"
            className="text-[13px] font-[500] text-red-400 leading-[1.5]"
            role="alert"
          >
            {errors.emailOrPhone.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-[4px]">
        <label
          htmlFor="password"
          className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
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
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="text-[13px] font-[500] text-red-400 leading-[1.5]"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded-xs border-canvas-light bg-transparent accent-canvas-light"
          />
          <span className="text-[14px] font-[420] text-ink [font-feature-settings:'ss03']">
            Ingat Saya
          </span>
        </label>
        <Link
          href="/forgot-password"
          className="text-[14px] font-[420] text-shade-50 hover:text-ink hover:underline [font-feature-settings:'ss03']"
        >
          Lupa Password?
        </Link>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div
          className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3 text-[14px] text-red-600 [font-feature-settings:'ss03']"
          role="alert"
        >
          {apiError}
        </div>
      )}

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full mt-sm"
      >
        {selectedRole
          ? `Masuk sebagai ${roleOptions.find((r) => r.value === selectedRole)?.label}`
          : "Masuk"}
      </Button>

      {/* Register Link */}
      <p className="text-center text-[14px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-ink font-[550] hover:underline"
        >
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}

/* ===== Icons ===== */

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
