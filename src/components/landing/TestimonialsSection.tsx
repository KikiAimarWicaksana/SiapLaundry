"use client";

import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";

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

export function TestimonialsSection() {
  return (
    <section className="bg-canvas-light py-16 md:py-[128px]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <h2 className="mb-12 font-display text-[36px] font-[330] leading-[1.16] text-ink md:mb-16 md:text-[55px] [font-feature-settings:'ss03']">
          Apa Kata Mereka
        </h2>

        <div
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          role="region"
          aria-label="Testimoni pelanggan"
        >
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="min-w-[300px] max-w-[360px] shrink-0 snap-start rounded-lg bg-canvas-cream border border-hairline-light p-[32px] flex flex-col gap-4"
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
