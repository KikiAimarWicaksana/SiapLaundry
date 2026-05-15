import React from "react";

function EmailIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const contacts = [
  {
    icon: <EmailIcon />,
    label: "Email",
    value: "cs@siaplaundry.id",
    href: "mailto:cs@siaplaundry.id",
    description: "Balas dalam 1×24 jam",
  },
  {
    icon: <PhoneIcon />,
    label: "Telepon",
    value: "021-5555-1234",
    href: "tel:02155551234",
    description: "Senin–Sabtu, 08:00–20:00",
  },
  {
    icon: <WhatsAppIcon />,
    label: "WhatsApp",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
    description: "Respon cepat via chat",
  },
  {
    icon: <ClockIcon />,
    label: "Jam Operasional",
    value: "Senin – Sabtu",
    href: null,
    description: "08:00 – 20:00 WIB",
  },
];

export function ContactSection() {
  return (
    <section className="py-[80px] bg-canvas-light" id="contact" aria-labelledby="contact-heading">
      <div className="max-w-[1080px] mx-auto px-xl">
        {/* Heading */}
        <div className="text-center mb-[48px]">
          <h2
            id="contact-heading"
            className="font-display text-[36px] md:text-[44px] font-[330] leading-[1.2] text-ink [font-feature-settings:'ss03']"
          >
            Hubungi Kami
          </h2>
          <p className="font-body text-[16px] font-[420] text-shade-50 mt-md [font-feature-settings:'ss03']">
            Tim customer service kami siap membantu Anda
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-[48px]">
          {contacts.map((contact, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-md p-xl bg-canvas-cream rounded-lg border border-hairline-light"
            >
              <div className="w-12 h-12 rounded-full bg-aloe-10 flex items-center justify-center text-ink">
                {contact.icon}
              </div>
              <div>
                <p className="font-body text-[12px] font-[500] text-shade-50 uppercase tracking-wider [font-feature-settings:'ss03']">
                  {contact.label}
                </p>
                {contact.href ? (
                  <a
                    href={contact.href}
                    target={contact.href.startsWith("http") ? "_blank" : undefined}
                    rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="font-body text-[15px] font-[550] text-ink hover:underline [font-feature-settings:'ss03'] block mt-xs"
                  >
                    {contact.value}
                  </a>
                ) : (
                  <p className="font-body text-[15px] font-[550] text-ink [font-feature-settings:'ss03'] mt-xs">
                    {contact.value}
                  </p>
                )}
                <p className="font-body text-[12px] font-[420] text-shade-50 [font-feature-settings:'ss03'] mt-xxs">
                  {contact.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="max-w-[600px] mx-auto bg-canvas-cream rounded-lg border border-hairline-light p-xxl">
          <h3 className="font-display text-[22px] font-[330] text-ink mb-lg [font-feature-settings:'ss03']">
            Kirim Pesan
          </h3>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Pesan terkirim! (Demo)"); }}
            className="flex flex-col gap-lg"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                  Nama
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap Anda"
                  required
                  className="bg-canvas-light text-ink font-body text-[14px] font-[420] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink placeholder:text-shade-40 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  required
                  className="bg-canvas-light text-ink font-body text-[14px] font-[420] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink placeholder:text-shade-40 transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                Subjek
              </label>
              <input
                type="text"
                placeholder="Topik pertanyaan Anda"
                required
                className="bg-canvas-light text-ink font-body text-[14px] font-[420] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink placeholder:text-shade-40 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                Pesan
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan pertanyaan atau keluhan Anda..."
                required
                className="bg-canvas-light text-ink font-body text-[14px] font-[420] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink placeholder:text-shade-40 resize-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-[12px] px-[24px] rounded-pill bg-ink text-canvas-light font-body text-[15px] font-[550] [font-feature-settings:'ss03'] hover:bg-shade-70 transition-colors cursor-pointer"
            >
              Kirim Pesan
            </button>
            <p className="text-center text-[12px] text-shade-40 [font-feature-settings:'ss03']">
              * Formulir ini hanya untuk keperluan demo
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
