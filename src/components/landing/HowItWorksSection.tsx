"use client";

import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Pilih Laundry Terdekat",
    description:
      "Cari dan bandingkan laundry di sekitar Anda berdasarkan rating, harga, dan jarak.",
  },
  {
    number: "02",
    title: "Pesan & Kurir Jemput",
    description:
      "Pilih layanan, jadwalkan pickup, dan kurir kami akan menjemput cucian Anda.",
  },
  {
    number: "03",
    title: "Tracking Status Cucian",
    description:
      "Pantau status cucian Anda secara real-time dari penjemputan hingga selesai.",
  },
  {
    number: "04",
    title: "Cucian Diantar Kembali",
    description:
      "Cucian bersih diantar langsung ke rumah Anda. Lacak kurir di peta.",
  },
];

const containerVariants: any = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export function HowItWorksSection() {
  return (
    <section className="bg-canvas-light py-16 md:py-[128px]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 font-display text-[36px] font-[330] leading-[1.16] text-ink md:mb-16 md:text-[55px] [font-feature-settings:'ss03']"
        >
          Cara Kerja
        </motion.h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step) => (
            <motion.div key={step.number} variants={itemVariants}>
              <Card variant="default" className="flex flex-col gap-4 h-full shadow-sm hover:shadow-md transition-shadow">
                <span className="font-display text-[48px] font-[330] leading-[1.14] text-ink [font-feature-settings:'ss03']">
                  {step.number}
                </span>
                <h3 className="font-display text-[20px] font-[500] leading-[1.4] tracking-[0.3px] text-ink [font-feature-settings:'ss03']">
                  {step.title}
                </h3>
                <p className="font-body text-[16px] font-[420] leading-[1.5] text-shade-50 [font-feature-settings:'ss03']">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
