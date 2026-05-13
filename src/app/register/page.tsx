"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { RegisterBuyerForm } from "@/components/forms/RegisterBuyerForm";
import { RegisterSellerForm } from "@/components/forms/RegisterSellerForm";
import { RegisterDriverForm } from "@/components/forms/RegisterDriverForm";
import type { UserRole } from "@/types/user";

/* ===== Role Icons ===== */

function BuyerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="24" cy="16" r="8" />
      <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" />
      <path d="M30 38l4 4 6-8" />
    </svg>
  );
}

function SellerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="20" width="36" height="22" rx="2" />
      <path d="M6 20l4-12h28l4 12" />
      <path d="M18 20v-2a6 6 0 0 1 12 0v2" />
      <circle cx="24" cy="32" r="4" />
    </svg>
  );
}

function DriverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 30V18a2 2 0 0 1 2-2h20l8 8v6a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" />
      <circle cx="16" cy="34" r="4" />
      <circle cx="32" cy="34" r="4" />
      <path d="M20 34h8" />
      <path d="M30 16v8h8" />
    </svg>
  );
}

/* ===== Role Data ===== */

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleOptions: RoleOption[] = [
  {
    value: "buyer",
    label: "Customer",
    description: "Pesan layanan laundry dengan jemput-antar ke lokasi Anda",
    icon: BuyerIcon,
  },
  {
    value: "seller",
    label: "Mitra Laundry",
    description: "Daftarkan laundry Anda dan terima pesanan dari pelanggan",
    icon: SellerIcon,
  },
  {
    value: "driver",
    label: "Mitra Kurir",
    description: "Ambil dan antarkan pesanan laundry, dapatkan penghasilan",
    icon: DriverIcon,
  },
];

/* ===== Progress Indicator ===== */

function ProgressIndicator({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-sm mb-xl">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={[
            "h-[4px] flex-1 rounded-pill transition-colors duration-300",
            i < step ? "bg-ink" : "bg-shade-30",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/* ===== Main Page ===== */

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const currentStep = selectedRole ? 2 : 1;

  return (
    <div className="min-h-screen bg-canvas-cream flex flex-col">
      {/* Navbar Light */}
      <Navbar variant="light" />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-xl py-huge">
        <div className="w-full max-w-[720px]">
          {/* Progress Indicator */}
          <ProgressIndicator step={currentStep} totalSteps={2} />

          {/* Step 1: Role Selection */}
          {!selectedRole && (
            <div className="flex flex-col gap-xl">
              <div className="text-center mb-xl">
                <h1 className="font-display text-[48px] font-[330] leading-[1.14] text-ink tracking-[0] [font-feature-settings:'ss03']">
                  Daftar
                </h1>
                <p className="font-body text-[18px] font-[550] leading-[1.56] text-shade-50 [font-feature-settings:'ss03'] mt-md">
                  Pilih peran Anda untuk memulai
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Card
                      key={role.value}
                      variant="default"
                      onClick={() => setSelectedRole(role.value)}
                      className="cursor-pointer hover:border-ink border-2 border-transparent transition-all duration-200 flex flex-col items-center text-center gap-lg"
                    >
                      <Icon className="w-16 h-16 text-ink" />
                      <h2 className="font-display text-[20px] font-[500] leading-[1.4] tracking-[0.3px] text-ink [font-feature-settings:'ss03']">
                        {role.label}
                      </h2>
                      <p className="font-body text-[14px] font-[420] leading-[1.5] text-shade-50 [font-feature-settings:'ss03']">
                        {role.description}
                      </p>
                    </Card>
                  );
                })}
              </div>

              {/* Login Link */}
              <p className="text-center text-[14px] font-[420] text-shade-50 [font-feature-settings:'ss03'] mt-xl">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-ink font-[550] hover:underline">
                  Masuk
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {selectedRole && (
            <div className="flex flex-col gap-xl">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-sm text-shade-50 hover:text-ink transition-colors self-start"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                <span className="font-body text-[14px] font-[420] [font-feature-settings:'ss03']">
                  Kembali pilih role
                </span>
              </button>

              {/* Form Card */}
              <div className="bg-canvas-light rounded-lg border border-hairline-light p-xxl shadow-[0_8px_8px_rgba(0,0,0,0.06),0_4px_4px_rgba(0,0,0,0.06),0_2px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
                <div className="mb-xl">
                  <h2 className="font-display text-[24px] font-[400] leading-[1.14] tracking-[0.36px] text-ink [font-feature-settings:'ss03']">
                    Daftar sebagai{" "}
                    {roleOptions.find((r) => r.value === selectedRole)?.label}
                  </h2>
                  <p className="font-body text-[14px] font-[420] text-shade-50 mt-sm [font-feature-settings:'ss03']">
                    Lengkapi data di bawah untuk membuat akun
                  </p>
                </div>

                {selectedRole === "buyer" && <RegisterBuyerForm />}
                {selectedRole === "seller" && <RegisterSellerForm />}
                {selectedRole === "driver" && <RegisterDriverForm />}
              </div>

              {/* Login Link */}
              <p className="text-center text-[14px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-ink font-[550] hover:underline">
                  Masuk
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
