import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "./LoginForm";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock auth store
const mockLogin = vi.fn();

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: { login: typeof mockLogin }) => unknown) =>
    selector({ login: mockLogin }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
  });

  describe("rendering", () => {
    it("renders role selection buttons", () => {
      render(<LoginForm />);
      expect(screen.getByText("Customer")).toBeInTheDocument();
      expect(screen.getByText("Mitra Laundry")).toBeInTheDocument();
      expect(screen.getByText("Mitra Kurir")).toBeInTheDocument();
    });

    it("renders email/phone input field", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Email atau No. Telepon")).toBeInTheDocument();
    });

    it("renders password input field", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("renders 'Ingat Saya' checkbox", () => {
      render(<LoginForm />);
      expect(screen.getByText("Ingat Saya")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("renders 'Lupa Password?' link", () => {
      render(<LoginForm />);
      const link = screen.getByText("Lupa Password?");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/forgot-password");
    });

    it("renders 'Daftar sekarang' link to /register", () => {
      render(<LoginForm />);
      const link = screen.getByText("Daftar sekarang");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/register");
    });

    it("renders submit button with default text 'Masuk'", () => {
      render(<LoginForm />);
      expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
    });
  });

  describe("role selection", () => {
    it("applies active state when role is selected", () => {
      render(<LoginForm />);
      const buyerBtn = screen.getByText("Customer");

      fireEvent.click(buyerBtn);

      expect(buyerBtn).toHaveAttribute("aria-pressed", "true");
      expect(buyerBtn).toHaveClass("bg-ink");
      expect(buyerBtn).toHaveClass("text-canvas-light");
    });

    it("applies inactive state to unselected roles", () => {
      render(<LoginForm />);
      const buyerBtn = screen.getByText("Customer");
      const sellerBtn = screen.getByText("Mitra Laundry");

      fireEvent.click(buyerBtn);

      expect(sellerBtn).toHaveAttribute("aria-pressed", "false");
      expect(sellerBtn).toHaveClass("bg-transparent");
    });

    it("updates submit button text based on selected role", () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByText("Customer"));
      expect(screen.getByRole("button", { name: "Masuk sebagai Customer" })).toBeInTheDocument();
    });

    it("shows 'Masuk sebagai Mitra Laundry' when seller is selected", () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByText("Mitra Laundry"));
      expect(screen.getByRole("button", { name: "Masuk sebagai Mitra Laundry" })).toBeInTheDocument();
    });

    it("shows 'Masuk sebagai Mitra Kurir' when driver is selected", () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByText("Mitra Kurir"));
      expect(screen.getByRole("button", { name: "Masuk sebagai Mitra Kurir" })).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("shows error when submitting without filling fields", async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

      await waitFor(() => {
        expect(screen.getByText("Email atau telepon minimal 3 karakter")).toBeInTheDocument();
      });
    });

    it("shows error for short email/phone input", async () => {
      render(<LoginForm />);

      fireEvent.click(screen.getByText("Customer"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "ab" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Customer" }));

      await waitFor(() => {
        expect(screen.getByText("Email atau telepon minimal 3 karakter")).toBeInTheDocument();
      });
    });

    it("shows error for short password", async () => {
      render(<LoginForm />);

      fireEvent.click(screen.getByText("Customer"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "test@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "12345" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Customer" }));

      await waitFor(() => {
        expect(screen.getByText("Password minimal 6 karakter")).toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    it("calls authStore.login with correct credentials on valid submit", async () => {
      render(<LoginForm />);

      fireEvent.click(screen.getByText("Customer"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "test@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Customer" }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          emailOrPhone: "test@email.com",
          password: "password123",
          role: "buyer",
        });
      });
    });

    it("redirects buyer to /explore on successful login", async () => {
      render(<LoginForm />);

      fireEvent.click(screen.getByText("Customer"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "test@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Customer" }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/explore");
      });
    });

    it("redirects seller to /seller/dashboard on successful login", async () => {
      render(<LoginForm />);

      fireEvent.click(screen.getByText("Mitra Laundry"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "seller@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Mitra Laundry" }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/seller/dashboard");
      });
    });

    it("redirects driver to /driver/dashboard on successful login", async () => {
      render(<LoginForm />);

      fireEvent.click(screen.getByText("Mitra Kurir"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "driver@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Mitra Kurir" }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/driver/dashboard");
      });
    });
  });

  describe("error handling", () => {
    it("displays error message when login fails with Error", async () => {
      mockLogin.mockRejectedValue(new Error("Email/telepon atau password salah"));

      render(<LoginForm />);

      fireEvent.click(screen.getByText("Customer"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "test@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "wrongpassword" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Customer" }));

      await waitFor(() => {
        expect(screen.getByText("Email/telepon atau password salah")).toBeInTheDocument();
      });
    });

    it("displays error message from axios response", async () => {
      mockLogin.mockRejectedValue({
        response: { data: { message: "Akun tidak ditemukan" } },
      });

      render(<LoginForm />);

      fireEvent.click(screen.getByText("Customer"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "test@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "wrongpassword" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Customer" }));

      await waitFor(() => {
        expect(screen.getByText("Akun tidak ditemukan")).toBeInTheDocument();
      });
    });

    it("displays generic error for unknown errors", async () => {
      mockLogin.mockRejectedValue("unknown error");

      render(<LoginForm />);

      fireEvent.click(screen.getByText("Customer"));
      fireEvent.change(screen.getByLabelText("Email atau No. Telepon"), {
        target: { value: "test@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "wrongpassword" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Masuk sebagai Customer" }));

      await waitFor(() => {
        expect(screen.getByText("Terjadi kesalahan. Silakan coba lagi.")).toBeInTheDocument();
      });
    });
  });

  describe("password visibility toggle", () => {
    it("password field is type password by default", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });

    it("toggles password visibility on button click", () => {
      render(<LoginForm />);
      const toggleBtn = screen.getByLabelText("Tampilkan password");

      fireEvent.click(toggleBtn);
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");

      const hideBtn = screen.getByLabelText("Sembunyikan password");
      fireEvent.click(hideBtn);
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });
  });
});
