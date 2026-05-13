import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SellerSidebar } from "./SellerSidebar";

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
let mockPathname = "/seller/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Mock notification store
const mockNotificationStore = {
  unreadCount: 0,
};

vi.mock("@/stores/notificationStore", () => ({
  useNotificationStore: (
    selector: (state: typeof mockNotificationStore) => unknown
  ) => selector(mockNotificationStore),
}));

describe("SellerSidebar", () => {
  beforeEach(() => {
    mockPathname = "/seller/dashboard";
    mockNotificationStore.unreadCount = 0;
  });

  it("renders sidebar with navigation landmark", () => {
    render(<SellerSidebar />);
    const sidebar = screen.getByRole("navigation", { name: "Seller menu" });
    expect(sidebar).toBeInTheDocument();
  });

  it("renders SiapLaundry logo linking to seller dashboard", () => {
    render(<SellerSidebar />);
    const logo = screen.getByText("SiapLaundry");
    expect(logo.closest("a")).toHaveAttribute("href", "/seller/dashboard");
  });

  it("renders all 5 navigation items", () => {
    render(<SellerSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("links Dashboard to /seller/dashboard", () => {
    render(<SellerSidebar />);
    const link = screen.getByText("Dashboard").closest("a");
    expect(link).toHaveAttribute("href", "/seller/dashboard");
  });

  it("links Orders to /seller/orders", () => {
    render(<SellerSidebar />);
    const link = screen.getByText("Orders").closest("a");
    expect(link).toHaveAttribute("href", "/seller/orders");
  });

  it("links Services to /seller/services", () => {
    render(<SellerSidebar />);
    const link = screen.getByText("Services").closest("a");
    expect(link).toHaveAttribute("href", "/seller/services");
  });

  it("links Reviews to /seller/reviews", () => {
    render(<SellerSidebar />);
    const link = screen.getByText("Reviews").closest("a");
    expect(link).toHaveAttribute("href", "/seller/reviews");
  });

  it("links Profile to /seller/profile", () => {
    render(<SellerSidebar />);
    const link = screen.getByText("Profile").closest("a");
    expect(link).toHaveAttribute("href", "/seller/profile");
  });

  it("highlights active nav item with aria-current", () => {
    mockPathname = "/seller/dashboard";
    render(<SellerSidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("applies active styles to current route", () => {
    mockPathname = "/seller/orders";
    render(<SellerSidebar />);
    const ordersLink = screen.getByText("Orders").closest("a");
    expect(ordersLink).toHaveClass("bg-aloe-10");
  });

  it("does not highlight inactive items", () => {
    mockPathname = "/seller/dashboard";
    render(<SellerSidebar />);
    const ordersLink = screen.getByText("Orders").closest("a");
    expect(ordersLink).not.toHaveAttribute("aria-current");
  });

  it("shows notification badge on Orders when unreadCount > 0", () => {
    mockNotificationStore.unreadCount = 3;
    render(<SellerSidebar />);
    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-red-500");
  });

  it("shows 99+ when unreadCount exceeds 99", () => {
    mockNotificationStore.unreadCount = 120;
    render(<SellerSidebar />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("does not show badge when unreadCount is 0", () => {
    mockNotificationStore.unreadCount = 0;
    render(<SellerSidebar />);
    expect(screen.queryByLabelText(/order baru/)).not.toBeInTheDocument();
  });

  it("has fixed positioning and 240px width", () => {
    render(<SellerSidebar />);
    const aside = screen.getByRole("complementary", { hidden: true }) || 
      document.querySelector("aside");
    expect(aside).toHaveClass("fixed", "w-[240px]");
  });

  it("matches active state for nested order routes", () => {
    mockPathname = "/seller/orders/abc123";
    render(<SellerSidebar />);
    const ordersLink = screen.getByText("Orders").closest("a");
    expect(ordersLink).toHaveAttribute("aria-current", "page");
  });
});
