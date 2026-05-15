"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Bagaimana cara memesan layanan laundry?",
    answer:
      "Cukup buka halaman Explore, pilih laundry terdekat, pilih layanan yang diinginkan, lalu klik 'Pesan Sekarang'. Isi jadwal penjemputan dan konfirmasi pesanan. Kurir kami akan menjemput pakaian Anda sesuai jadwal.",
  },
  {
    question: "Berapa lama proses laundry selesai?",
    answer:
      "Estimasi waktu tergantung layanan yang dipilih. Cuci kering biasanya 1–2 hari, cuci setrika 2–3 hari, dan dry clean 3–4 hari. Estimasi waktu ditampilkan di halaman detail layanan.",
  },
  {
    question: "Bagaimana sistem pembayaran bekerja?",
    answer:
      "Pembayaran dilakukan setelah mitra laundry menimbang berat aktual pakaian Anda. Anda akan menerima notifikasi tagihan dan bisa membayar via Transfer Bank, E-Wallet, atau Tunai kepada kurir.",
  },
  {
    question: "Apakah pakaian saya aman?",
    answer:
      "Semua mitra laundry di SiapLaundry telah melalui proses verifikasi. Setiap pesanan dilacak secara real-time dari penjemputan hingga pengantaran. Anda juga bisa chat langsung dengan mitra laundry dan kurir.",
  },
  {
    question: "Bagaimana jika ada pakaian yang rusak atau hilang?",
    answer:
      "Hubungi customer service kami segera di cs@siaplaundry.id. Kami akan menindaklanjuti klaim Anda dalam 1×24 jam dan berkoordinasi dengan mitra laundry terkait.",
  },
  {
    question: "Apakah bisa menjadwalkan penjemputan untuk hari tertentu?",
    answer:
      "Ya! Saat memesan, Anda bisa memilih tanggal dan waktu penjemputan (Pagi, Siang, atau Sore). Kurir akan datang sesuai jadwal yang Anda pilih.",
  },
  {
    question: "Bagaimana cara mendaftar sebagai Mitra Laundry atau Mitra Kurir?",
    answer:
      "Klik tombol 'Daftar' di halaman utama, pilih role 'Mitra Laundry' atau 'Mitra Kurir', lalu lengkapi data yang diperlukan. Tim kami akan memverifikasi pendaftaran Anda dalam 1–2 hari kerja.",
  },
  {
    question: "Apakah ada biaya antar-jemput?",
    answer:
      "Ya, ada biaya antar-jemput sebesar Rp 5.000 per pesanan. Biaya ini sudah termasuk dalam total tagihan yang ditampilkan saat konfirmasi pesanan.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={["w-5 h-5 text-shade-50 transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-[80px] bg-canvas-cream" id="faq" aria-labelledby="faq-heading">
      <div className="max-w-[800px] mx-auto px-xl">
        {/* Heading */}
        <div className="text-center mb-[48px]">
          <h2
            id="faq-heading"
            className="font-display text-[36px] md:text-[44px] font-[330] leading-[1.2] text-ink [font-feature-settings:'ss03']"
          >
            Pertanyaan Umum
          </h2>
          <p className="font-body text-[16px] font-[420] text-shade-50 mt-md [font-feature-settings:'ss03']">
            Temukan jawaban atas pertanyaan yang sering ditanyakan
          </p>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col gap-sm">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-canvas-light rounded-lg border border-hairline-light overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-xl py-lg text-left gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-body text-[15px] font-[550] text-ink [font-feature-settings:'ss03']">
                    {faq.question}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>
                {isOpen && (
                  <div className="px-xl pb-lg">
                    <p className="font-body text-[14px] font-[420] text-shade-60 leading-[1.7] [font-feature-settings:'ss03']">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-[40px] text-center">
          <p className="font-body text-[14px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
            Masih punya pertanyaan?{" "}
            <a
              href="#contact"
              className="text-ink font-[550] hover:underline"
            >
              Hubungi kami
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
