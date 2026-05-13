import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Footer } from "./Footer";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Footer", () => {
  describe("Dark variant", () => {
    it("renders with dark background", () => {
      render(<Footer variant="dark" />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveClass("bg-canvas-night");
      expect(footer).toHaveClass("text-on-primary");
    });

    it("renders 4 link columns", () => {
      render(<Footer variant="dark" />);
      expect(screen.getByText("Layanan")).toBeInTheDocument();
      expect(screen.getByText("Perusahaan")).toBeInTheDocument();
      expect(screen.getByText("Bantuan")).toBeInTheDocument();
      expect(screen.getByText("Ikuti Kami")).toBeInTheDocument();
    });

    it("renders Layanan links", () => {
      render(<Footer variant="dark" />);
      expect(screen.getByText("Cari Laundry")).toBeInTheDocument();
      expect(screen.getByText("Cara Kerja")).toBeInTheDocument();
      expect(screen.getByText("Harga")).toBeInTheDocument();
    });

    it("renders Perusahaan links", () => {
      render(<Footer variant="dark" />);
      expect(screen.getByText("Tentang Kami")).toBeInTheDocument();
      expect(screen.getByText("Karir")).toBeInTheDocument();
      expect(screen.getByText("Blog")).toBeInTheDocument();
    });

    it("renders Bantuan links", () => {
      render(<Footer variant="dark" />);
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("Kontak")).toBeInTheDocument();
      expect(screen.getByText("Kebijakan Privasi")).toBeInTheDocument();
    });

    it("renders social media links with muted colors", () => {
      render(<Footer variant="dark" />);
      const instagram = screen.getByLabelText("Instagram");
      const twitter = screen.getByLabelText("Twitter");
      const facebook = screen.getByLabelText("Facebook");
      expect(instagram).toHaveClass("text-link-cool-1");
      expect(twitter).toHaveClass("text-link-cool-2");
      expect(facebook).toHaveClass("text-link-cool-3");
    });

    it("renders link columns with muted tone colors", () => {
      render(<Footer variant="dark" />);
      const cariLaundry = screen.getByText("Cari Laundry");
      expect(cariLaundry).toHaveClass("text-link-cool-1");
    });

    it("renders legal text", () => {
      render(<Footer variant="dark" />);
      const year = new Date().getFullYear();
      expect(screen.getByText(`© ${year} SiapLaundry. Semua hak dilindungi.`)).toBeInTheDocument();
    });

    it("uses padding huge (64px) vertically", () => {
      render(<Footer variant="dark" />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveClass("py-huge");
    });

    it("links to correct hrefs", () => {
      render(<Footer variant="dark" />);
      const faqLink = screen.getByText("FAQ").closest("a");
      expect(faqLink).toHaveAttribute("href", "/faq");
      const kontakLink = screen.getByText("Kontak").closest("a");
      expect(kontakLink).toHaveAttribute("href", "/kontak");
    });
  });

  describe("Light variant", () => {
    it("renders with light background", () => {
      render(<Footer variant="light" />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveClass("bg-canvas-light");
      expect(footer).toHaveClass("text-ink");
    });

    it("renders 4 link columns", () => {
      render(<Footer variant="light" />);
      expect(screen.getByText("Layanan")).toBeInTheDocument();
      expect(screen.getByText("Perusahaan")).toBeInTheDocument();
      expect(screen.getByText("Bantuan")).toBeInTheDocument();
      expect(screen.getByText("Ikuti Kami")).toBeInTheDocument();
    });

    it("renders social icons with shade-50 color", () => {
      render(<Footer variant="light" />);
      const instagram = screen.getByLabelText("Instagram");
      expect(instagram).toHaveClass("text-shade-50");
    });

    it("renders links with shade-50 color", () => {
      render(<Footer variant="light" />);
      const cariLaundry = screen.getByText("Cari Laundry");
      expect(cariLaundry).toHaveClass("text-shade-50");
    });

    it("uses light hairline border for separator", () => {
      render(<Footer variant="light" />);
      const footer = screen.getByRole("contentinfo");
      const socialRow = footer.querySelector(".border-t");
      expect(socialRow).toHaveClass("border-hairline-light");
    });

    it("renders legal text", () => {
      render(<Footer variant="light" />);
      const year = new Date().getFullYear();
      expect(screen.getByText(`© ${year} SiapLaundry. Semua hak dilindungi.`)).toBeInTheDocument();
    });
  });
});
