import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DriverBottomNav } from "./DriverBottomNav";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/navigation
let mockPathname = "/driver/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("DriverBottomNav", () => {
  beforeEach(() => {
    mockPathname = "/driver/dashboard";
  });

  it("renders desktop sidebar with navigation landmark", () => {
    render(<DriverBottomNav />);
    const sidebar = screen.getByRole("navigation", { name: "Driver menu" });
    expect(sidebar).toBeInTheDocument();
  });

  it("renders mobile bottom nav with navigation landmark", () => {
    render(<DriverBottomNav />);
    const bottomNav = screen.getByRole("navigation", {
      name: "Driver mobile navigation",
    });
    expect(bottomNav).toBeInTheDocument();
  });

  it("renders SiapLaundry logo linking to driver dashboard", () => {
    render(<DriverBottomNav />);
    const logo = screen.getByText("SiapLaundry");
    expect(logo.closest("a")).toHaveAttribute("href", "/driver/dashboard");
  });

  it("renders all 4 navigation items in desktop sidebar", () => {
    render(<DriverBottomNav />);
    const dashboardLinks = screen.getAllByText("Dashboard");
    const ordersLinks = screen.getAllByText("Orders");
    const mapLinks = screen.getAllByText("Map");
    const profileLinks = screen.getAllByText("Profile");
    // Each item appears twice: once in sidebar, once in bottom nav
    expect(dashboardLinks).toHaveLength(2);
    expect(ordersLinks).toHaveLength(2);
    expect(mapLinks).toHaveLength(2);
    expect(profileLinks).toHaveLength(2);
  });

  it("links Dashboard to /driver/dashboard", () => {
    render(<DriverBottomNav />);
    const links = screen.getAllByText("Dashboard");
    expect(links[0].closest("a")).toHaveAttribute("href", "/driver/dashboard");
  });

  it("links Orders to /driver/orders", () => {
    render(<DriverBottomNav />);
    const links = screen.getAllByText("Orders");
    expect(links[0].closest("a")).toHaveAttribute("href", "/driver/orders");
  });

  it("links Map to /driver/map", () => {
    render(<DriverBottomNav />);
    const links = screen.getAllByText("Map");
    expect(links[0].closest("a")).toHaveAttribute("href", "/driver/map");
  });

  it("links Profile to /driver/profile", () => {
    render(<DriverBottomNav />);
    const links = screen.getAllByText("Profile");
    expect(links[0].closest("a")).toHaveAttribute("href", "/driver/profile");
  });

  it("highlights active nav item with aria-current", () => {
    mockPathname = "/driver/dashboard";
    render(<DriverBottomNav />);
    const dashboardLinks = screen.getAllByText("Dashboard");
    expect(dashboardLinks[0].closest("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("applies active styles to current route in sidebar", () => {
    mockPathname = "/driver/orders";
    render(<DriverBottomNav />);
    const ordersLinks = screen.getAllByText("Orders");
    expect(ordersLinks[0].closest("a")).toHaveClass("bg-aloe-10");
  });

  it("does not highlight inactive items", () => {
    mockPathname = "/driver/dashboard";
    render(<DriverBottomNav />);
    const ordersLinks = screen.getAllByText("Orders");
    expect(ordersLinks[0].closest("a")).not.toHaveAttribute("aria-current");
  });

  it("matches active state for nested order routes", () => {
    mockPathname = "/driver/orders/abc123";
    render(<DriverBottomNav />);
    const ordersLinks = screen.getAllByText("Orders");
    expect(ordersLinks[0].closest("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("desktop sidebar is hidden on mobile via CSS class", () => {
    render(<DriverBottomNav />);
    const aside = document.querySelector("aside");
    expect(aside).toHaveClass("hidden", "md:flex");
  });

  it("mobile bottom nav is hidden on desktop via CSS class", () => {
    render(<DriverBottomNav />);
    const bottomNav = screen.getByRole("navigation", {
      name: "Driver mobile navigation",
    });
    expect(bottomNav).toHaveClass("md:hidden");
  });

  it("desktop sidebar has fixed positioning and 240px width", () => {
    render(<DriverBottomNav />);
    const aside = document.querySelector("aside");
    expect(aside).toHaveClass("fixed", "w-[240px]");
  });

  it("mobile bottom nav is fixed at bottom", () => {
    render(<DriverBottomNav />);
    const bottomNav = screen.getByRole("navigation", {
      name: "Driver mobile navigation",
    });
    expect(bottomNav).toHaveClass("fixed", "bottom-0");
  });
});
