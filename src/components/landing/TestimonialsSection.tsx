"use client";

import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: "1",
    name: "Rina Susanti",
    rating: 5,
    comment:
      "Sangat praktis! Tinggal pesan, kurir datang jemput, dan cucian bersih diantar kembali. Harga juga transparan.",
  },
  {
    id: "2",
    name: "Budi Hartono",
    rating: 5,
    comment:
      "Tracking real-time-nya keren banget. Saya bisa tahu persis kapan cucian dijemput dan diantar. Recommended!",
  },
  {
    id: "3",
    name: "Siti Nurhaliza",
    rating: 4,
    comment:
      "Banyak pilihan laundry dengan harga bersaing. Rating dan review dari pelanggan lain sangat membantu memilih.",
  },
  {
    id: "4",
    name: "Ahmad Fauzi",
    rating: 5,
    comment:
      "Sebagai orang sibuk, SiapLaundry sangat membantu. Tidak perlu antar-jemput sendiri, semua diurus kurir.",
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export function TestimonialsSection() {
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
          Apa Kata Mereka
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {testimonials.map((testimonial) => (
            <motion.article
              key={testimonial.id}
              variants={itemVariants}
              className="rounded-lg bg-canvas-cream border border-hairline-light p-[32px] flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow h-full"
            >
              <div className="flex items-center gap-3">
                <Avatar name={testimonial.name} size="md" />
                <span className="font-body text-[16px] font-[550] leading-[1.5] text-ink [font-feature-settings:'ss03']">
                  {testimonial.name}
                </span>
              </div>

              <StarRating value={testimonial.rating} readonly size="sm" />

              <p className="font-body text-[16px] font-[420] leading-[1.5] text-shade-60 [font-feature-settings:'ss03']">
                &ldquo;{testimonial.comment}&rdquo;
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
