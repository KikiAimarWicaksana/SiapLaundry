"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { LoginForm } from "@/components/forms/LoginForm";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect jika sudah login
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    switch (user.role) {
      case "buyer": router.replace("/explore"); break;
      case "seller": router.replace("/seller/dashboard"); break;
      case "driver": router.replace("/driver/dashboard"); break;
    }
  }, [isAuthenticated, user, router]);
  // Jangan render form jika sudah login
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-canvas-cream flex flex-col">
      {/* Navbar Light */}
      <Navbar variant="light" />

      {/* Main Content: Split Layout */}
      <main className="flex-1 flex items-center justify-center px-xl py-huge">
        <div className="w-full max-w-[1080px] flex flex-col lg:flex-row items-center gap-huge">
          {/* Left: Branding / Illustration */}
          <div className="hidden lg:flex flex-1 flex-col gap-xl">
            <h1 className="font-display text-[55px] font-[330] leading-[1.16] text-ink tracking-[0] [font-feature-settings:'ss03']">
              Laundry Mudah,
              <br />
              Jemput Antar,
              <br />
              Tanpa Ribet.
            </h1>
            <p className="font-body text-[18px] font-[550] leading-[1.56] text-shade-50 [font-feature-settings:'ss03'] max-w-[400px]">
              Masuk ke akun Anda dan nikmati layanan laundry terbaik di sekitar Anda.
            </p>
          </div>

          {/* Right: Login Form Card */}
          <div className="w-full max-w-[440px] bg-canvas-light rounded-lg border border-hairline-light p-xxl shadow-[0_8px_8px_rgba(0,0,0,0.06),0_4px_4px_rgba(0,0,0,0.06),0_2px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
            {/* Mobile heading */}
            <div className="lg:hidden mb-xl">
              <h1 className="font-display text-[28px] font-[500] leading-[1.28] tracking-[0.42px] text-ink [font-feature-settings:'ss03']">
                Masuk
              </h1>
              <p className="font-body text-[14px] font-[420] text-shade-50 mt-sm [font-feature-settings:'ss03']">
                Masuk ke akun SiapLaundry Anda
              </p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block mb-xl">
              <h2 className="font-display text-[24px] font-[400] leading-[1.14] tracking-[0.36px] text-ink [font-feature-settings:'ss03']">
                Masuk ke Akun
              </h2>
            </div>

            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
