"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="bg-canvas-cream py-32 md:py-[128px] overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: Text content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            <h1
              className="font-display text-[56px] font-[330] leading-[1.0] tracking-[2.4px] text-ink md:text-[96px] [font-feature-settings:'ss03']"
            >
              Laundry Dekat,
              <br />
              Jemput Antar,
              <br />
              Harga Transparan
            </h1>

            <p className="max-w-[520px] font-body text-[18px] font-[550] leading-[1.56] text-shade-50 [font-feature-settings:'ss03']">
              Temukan laundry terdekat, pesan mudah, dan lacak cucian Anda secara
              real-time.
            </p>

            <div>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center rounded-pill bg-ink px-[26px] py-[12px] font-body text-[16px] font-[420] leading-[1.5] text-canvas-light transition-colors duration-150 hover:bg-shade-70 [font-feature-settings:'ss03'] shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all"
              >
                Cari Laundry Terdekat
              </Link>
            </div>
          </motion.div>

          {/* Right: Illustration area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative aspect-square w-full max-w-[640px] overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
              <Image
                src="/hero-laundry.png"
                alt="Modern Laundry Service"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
