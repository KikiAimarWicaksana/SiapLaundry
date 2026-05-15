import Link from "next/link";

export interface FooterProps {
  variant: "dark" | "light";
}

const linkColumns = [
  {
    title: "Layanan",
    links: [
      { label: "Cari Laundry", href: "/explore" },
      { label: "Cara Kerja", href: "/#cara-kerja" },
      { label: "Harga", href: "/#harga" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "/tentang" },
      { label: "Karir", href: "/karir" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Kontak", href: "/kontak" },
      { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
    ],
  },
  {
    title: "Ikuti Kami",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Facebook", href: "https://facebook.com" },
    ],
  },
];

const columnColors = [
  "text-link-cool-1",
  "text-link-cool-2",
  "text-link-cool-3",
  "text-link-mint",
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer({ variant }: FooterProps) {
  if (variant === "dark") {
    return <FooterDark />;
  }
  return <FooterLight />;
}

function FooterDark() {
  return (
    <footer
      className="bg-canvas-night text-on-primary px-xl py-huge [font-feature-settings:'ss03']"
      aria-label="Footer"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {linkColumns.map((column, colIndex) => (
            <div key={column.title}>
              <h3 className="font-body text-sm font-[500] leading-[1.49] tracking-[0.28px] text-canvas-light mb-4">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`font-body text-sm font-[500] leading-[1.49] tracking-[0.28px] ${columnColors[colIndex]} hover:text-canvas-light transition-colors`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social icons row */}
        <div className="flex items-center gap-4 mt-12 pt-8 border-t border-hairline-dark">
          <Link
            href="https://instagram.com"
            className="text-link-cool-1 hover:text-canvas-light transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </Link>
          <Link
            href="https://twitter.com"
            className="text-link-cool-2 hover:text-canvas-light transition-colors"
            aria-label="Twitter"
          >
            <TwitterIcon />
          </Link>
          <Link
            href="https://facebook.com"
            className="text-link-cool-3 hover:text-canvas-light transition-colors"
            aria-label="Facebook"
          >
            <FacebookIcon />
          </Link>
        </div>

        {/* Legal row */}
        <div className="mt-8">
          <p className="font-body text-[13px] font-[500] leading-[1.5] tracking-[-0.13px] text-shade-40">
            © {new Date().getFullYear()} SiapLaundry. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLight() {
  return (
    <footer
      className="bg-canvas-light text-ink px-xl py-huge [font-feature-settings:'ss03']"
      aria-label="Footer"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {linkColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-body text-sm font-[500] leading-[1.49] tracking-[0.28px] text-ink mb-4">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-sm font-[500] leading-[1.49] tracking-[0.28px] text-shade-50 hover:text-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social icons row */}
        <div className="flex items-center gap-4 mt-12 pt-8 border-t border-hairline-light">
          <Link
            href="https://instagram.com"
            className="text-shade-50 hover:text-ink transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </Link>
          <Link
            href="https://twitter.com"
            className="text-shade-50 hover:text-ink transition-colors"
            aria-label="Twitter"
          >
            <TwitterIcon />
          </Link>
          <Link
            href="https://facebook.com"
            className="text-shade-50 hover:text-ink transition-colors"
            aria-label="Facebook"
          >
            <FacebookIcon />
          </Link>
        </div>

        {/* Legal row */}
        <div className="mt-8">
          <p className="font-body text-[13px] font-[500] leading-[1.5] tracking-[-0.13px] text-shade-40">
            © {new Date().getFullYear()} SiapLaundry. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
