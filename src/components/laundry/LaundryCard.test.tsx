import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LaundryCard, LaundryCardProps } from "./LaundryCard";
import { LaundryGrid } from "./LaundryGrid";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockLaundry: LaundryCardProps = {
  id: "laundry-1",
  name: "Laundry Bersih Kilat",
  photos: ["/photos/laundry1.jpg"],
  averageRating: 4,
  totalReviews: 120,
  distanceKm: 1.5,
  startingPrice: 7000,
  isOpen: true,
  services: ["Cuci Kering", "Cuci Setrika"],
};

describe("LaundryCard", () => {
  it("renders laundry name", () => {
    render(<LaundryCard {...mockLaundry} />);
    expect(screen.getByText("Laundry Bersih Kilat")).toBeInTheDocument();
  });

  it("renders photo with correct alt text", () => {
    render(<LaundryCard {...mockLaundry} />);
    const img = screen.getByAltText("Foto Laundry Bersih Kilat");
    expect(img).toHaveAttribute("src", "/photos/laundry1.jpg");
  });

  it("renders star rating", () => {
    render(<LaundryCard {...mockLaundry} />);
    const rating = screen.getByRole("img", { name: "Rating: 4 dari 5 bintang" });
    expect(rating).toBeInTheDocument();
  });

  it("renders total reviews count", () => {
    render(<LaundryCard {...mockLaundry} />);
    expect(screen.getByText("(120 ulasan)")).toBeInTheDocument();
  });

  it("renders distance", () => {
    render(<LaundryCard {...mockLaundry} />);
    expect(screen.getByText("1.5 km")).toBeInTheDocument();
  });

  it("renders starting price formatted as currency", () => {
    render(<LaundryCard {...mockLaundry} />);
    expect(screen.getByText("Mulai Rp 7.000/kg")).toBeInTheDocument();
  });

  it("renders 'Buka' badge when isOpen is true", () => {
    render(<LaundryCard {...mockLaundry} />);
    expect(screen.getByText("Buka")).toBeInTheDocument();
  });

  it("renders 'Tutup' badge when isOpen is false", () => {
    render(<LaundryCard {...mockLaundry} isOpen={false} />);
    expect(screen.getByText("Tutup")).toBeInTheDocument();
  });

  it("renders 'Lihat Detail' link pointing to correct URL", () => {
    render(<LaundryCard {...mockLaundry} />);
    const link = screen.getByText("Lihat Detail").closest("a");
    expect(link).toHaveAttribute("href", "/laundry/laundry-1");
  });

  it("uses Level 3 shadow (stacked tiny shadows)", () => {
    render(<LaundryCard {...mockLaundry} />);
    const article = screen.getByRole("article");
    expect(article.className).toContain("shadow-");
  });

  it("uses pill shape for the Lihat Detail button", () => {
    render(<LaundryCard {...mockLaundry} />);
    const link = screen.getByText("Lihat Detail");
    expect(link.className).toContain("rounded-pill");
  });
});

describe("LaundryGrid", () => {
  const mockLaundries: LaundryCardProps[] = [
    mockLaundry,
    { ...mockLaundry, id: "laundry-2", name: "Laundry Harum" },
    { ...mockLaundry, id: "laundry-3", name: "Laundry Express" },
  ];

  it("renders all laundry cards", () => {
    render(<LaundryGrid laundries={mockLaundries} />);
    expect(screen.getByText("Laundry Bersih Kilat")).toBeInTheDocument();
    expect(screen.getByText("Laundry Harum")).toBeInTheDocument();
    expect(screen.getByText("Laundry Express")).toBeInTheDocument();
  });

  it("renders responsive grid classes", () => {
    const { container } = render(<LaundryGrid laundries={mockLaundries} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("md:grid-cols-2");
    expect(grid.className).toContain("lg:grid-cols-3");
  });

  it("renders empty state message when no laundries", () => {
    render(<LaundryGrid laundries={[]} />);
    expect(
      screen.getByText("Tidak ada laundry yang ditemukan. Coba ubah filter Anda.")
    ).toBeInTheDocument();
  });

  it("does not render grid when laundries array is empty", () => {
    const { container } = render(<LaundryGrid laundries={[]} />);
    const grid = container.querySelector(".grid");
    expect(grid).not.toBeInTheDocument();
  });
});
