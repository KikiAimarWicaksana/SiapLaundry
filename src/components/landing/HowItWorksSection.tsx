import { Card } from "@/components/ui/Card";

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

export function HowItWorksSection() {
  return (
    <section className="bg-canvas-light py-16 md:py-[128px]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <h2 className="mb-12 font-display text-[36px] font-[330] leading-[1.16] text-ink md:mb-16 md:text-[55px] [font-feature-settings:'ss03']">
          Cara Kerja
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.number} variant="default" className="flex flex-col gap-4">
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
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
