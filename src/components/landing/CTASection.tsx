import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-aloe-10 py-16 md:py-[128px]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 text-center">
        <h2 className="mx-auto max-w-[720px] font-display text-[36px] font-[330] leading-[1.16] text-ink md:text-[55px] [font-feature-settings:'ss03']">
          Siap Mencuci Tanpa Ribet?
        </h2>

        <p className="mx-auto mt-6 max-w-[520px] font-body text-[18px] font-[550] leading-[1.56] text-shade-60 [font-feature-settings:'ss03']">
          Bergabung dengan ribuan pengguna yang sudah menikmati kemudahan laundry
          online. Gratis, tanpa komitmen.
        </p>

        <div className="mt-10">
          <Link
            href="/explore"
            className="inline-flex items-center justify-center rounded-pill bg-ink px-[26px] py-[12px] font-body text-[16px] font-[420] leading-[1.5] text-canvas-light transition-colors duration-150 hover:bg-shade-70 [font-feature-settings:'ss03']"
          >
            Mulai Cari Laundry
          </Link>
        </div>
      </div>
    </section>
  );
}
