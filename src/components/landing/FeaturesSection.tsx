import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Marketplace Multi-Laundry",
    description:
      "Akses puluhan laundry terdekat dalam satu platform. Bandingkan harga, layanan, dan rating dengan mudah.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Real-time Tracking",
    description:
      "Lacak posisi kurir dan status cucian Anda secara langsung di peta. Tidak perlu menebak-nebak.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "Rating & Review Transparan",
    description:
      "Lihat ulasan jujur dari pelanggan lain. Berikan rating setelah cucian selesai untuk membantu komunitas.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: "Harga Jelas per Layanan",
    description:
      "Semua harga tercantum jelas per kilogram atau per potong. Tidak ada biaya tersembunyi.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-canvas-cream py-16 md:py-[128px]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <h2 className="mb-12 font-display text-[36px] font-[330] leading-[1.16] text-ink md:mb-16 md:text-[55px] [font-feature-settings:'ss03']">
          Fitur Unggulan
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} variant="default" className="flex flex-col gap-4">
              <div className="text-ink">{feature.icon}</div>
              <h3 className="font-display text-[20px] font-[500] leading-[1.4] tracking-[0.3px] text-ink [font-feature-settings:'ss03']">
                {feature.title}
              </h3>
              <p className="font-body text-[16px] font-[420] leading-[1.5] text-shade-50 [font-feature-settings:'ss03']">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
