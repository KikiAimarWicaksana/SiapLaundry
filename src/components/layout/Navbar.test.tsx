import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Navbar } from "./Navbar";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock auth store
const mockAuthStore = {
  user: null as { id: string; name: string; profilePhoto?: string } | null,
};

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: typeof mockAuthStore) => unknown) => selector(mockAuthStore),
}));

// Mock notification store
const mockNotificationStore = {
  unreadCount: 0,
};

vi.mock("@/stores/notificationStore", () => ({
  useNotificationStore: (selector: (state: typeof mockNotificationStore) => unknown) => selector(mockNotificationStore),
}));

describe("Navbar", () => {
  beforeEach(() => {
    mockAuthStore.user = null;
    mockNotificationStore.unreadCount = 0;
  });

  describe("Dark variant (public pages)", () => {
    it("renders with dark background", () => {
      render(<Navbar variant="dark" />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("bg-canvas-night");
      expect(nav).toHaveClass("text-canvas-light");
    });

    it("renders white logo wordmark", () => {
      render(<Navbar variant="dark" />);
      const logo = screen.getByText("SiapLaundry");
      expect(logo).toHaveClass("text-canvas-light");
    });

    it("renders Masuk and Daftar buttons on desktop", () => {
      render(<Navbar variant="dark" />);
      expect(screen.getByText("Masuk")).toBeInTheDocument();
      expect(screen.getByText("Daftar")).toBeInTheDocument();
    });

    it("links Masuk button to /login", () => {
      render(<Navbar variant="dark" />);
      const masukLink = screen.getByText("Masuk").closest("a");
      expect(masukLink).toHaveAttribute("href", "/login");
    });

    it("links Daftar button to /register", () => {
      render(<Navbar variant="dark" />);
      const daftarLink = screen.getByText("Daftar").closest("a");
      expect(daftarLink).toHaveAttribute("href", "/register");
    });

    it("renders hamburger menu button for mobile", () => {
      render(<Navbar variant="dark" />);
      const hamburger = screen.getByLabelText("Open menu");
      expect(hamburger).toBeInTheDocument();
    });

    it("toggles mobile menu on hamburger click", () => {
      render(<Navbar variant="dark" />);
      const hamburger = screen.getByLabelText("Open menu");
      fireEvent.click(hamburger);
      // After opening, the button label changes to "Close menu"
      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });
  });

  describe("Light variant (dashboard pages)", () => {
    it("renders with light background", () => {
      render(<Navbar variant="light" />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("bg-canvas-light");
      expect(nav).toHaveClass("text-ink");
    });

    it("renders black logo wordmark", () => {
      render(<Navbar variant="light" />);
      const logo = screen.getByText("SiapLaundry");
      expect(logo).toHaveClass("text-ink");
    });

    it("is sticky at top", () => {
      render(<Navbar variant="light" />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("sticky", "top-0");
    });

    it("renders nav links: Explore, Pesanan, Chat", () => {
      render(<Navbar variant="light" />);
      expect(screen.getByText("Explore")).toBeInTheDocument();
      expect(screen.getByText("Pesanan")).toBeInTheDocument();
      expect(screen.getByText("Chat")).toBeInTheDocument();
    });

    it("renders notification bell icon", () => {
      render(<Navbar variant="light" />);
      const bellLink = screen.getByLabelText("Notifications");
      expect(bellLink).toBeInTheDocument();
    });

    it("shows unread badge when unreadCount > 0", () => {
      mockNotificationStore.unreadCount = 5;
      render(<Navbar variant="light" />);
      const badge = screen.getByText("5");
      expect(badge).toBeInTheDocument();
    });

    it("shows 99+ when unreadCount exceeds 99", () => {
      mockNotificationStore.unreadCount = 150;
      render(<Navbar variant="light" />);
      expect(screen.getByText("99+")).toBeInTheDocument();
    });

    it("does not show badge when unreadCount is 0", () => {
      mockNotificationStore.unreadCount = 0;
      render(<Navbar variant="light" />);
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    it("renders user avatar", () => {
      mockAuthStore.user = { id: "1", name: "John Doe", profilePhoto: undefined };
      render(<Navbar variant="light" />);
      const avatar = screen.getByRole("img", { name: "John Doe" });
      expect(avatar).toBeInTheDocument();
    });

    it("renders avatar with initials when no photo", () => {
      mockAuthStore.user = { id: "1", name: "John Doe", profilePhoto: undefined };
      render(<Navbar variant="light" />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });
});
