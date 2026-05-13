import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders children text", () => {
      render(<Button variant="primary">Click me</Button>);
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("renders with default type button", () => {
      render(<Button variant="primary">Test</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("renders with submit type when specified", () => {
      render(<Button variant="primary" type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
  });

  describe("variants", () => {
    it("applies primary variant classes", () => {
      render(<Button variant="primary">Primary</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("bg-canvas-night");
      expect(btn).toHaveClass("text-canvas-light");
    });

    it("applies outline-dark variant classes", () => {
      render(<Button variant="outline-dark">Outline Dark</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("bg-transparent");
      expect(btn).toHaveClass("text-canvas-light");
      expect(btn).toHaveClass("border-canvas-light");
    });

    it("applies outline-light variant classes", () => {
      render(<Button variant="outline-light">Outline Light</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("bg-canvas-light");
      expect(btn).toHaveClass("text-ink");
      expect(btn).toHaveClass("border-ink");
    });

    it("applies aloe variant classes", () => {
      render(<Button variant="aloe">Aloe</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("bg-aloe-10");
      expect(btn).toHaveClass("text-ink");
    });
  });

  describe("pill shape", () => {
    it("always uses rounded-pill for all variants", () => {
      const variants = ["primary", "outline-dark", "outline-light", "aloe"] as const;
      variants.forEach((variant) => {
        const { unmount } = render(<Button variant={variant}>{variant}</Button>);
        const btn = screen.getByRole("button");
        expect(btn).toHaveClass("rounded-pill");
        unmount();
      });
    });
  });

  describe("sizes", () => {
    it("applies sm size classes", () => {
      render(<Button variant="primary" size="sm">Small</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("px-4", "py-2", "text-sm");
    });

    it("applies md size classes by default", () => {
      render(<Button variant="primary">Medium</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("px-6", "py-3", "text-base");
    });

    it("applies lg size classes", () => {
      render(<Button variant="primary" size="lg">Large</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("px-8", "py-4", "text-lg");
    });
  });

  describe("disabled state", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Button variant="primary" disabled>Disabled</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("does not fire onClick when disabled", () => {
      const onClick = vi.fn();
      render(<Button variant="primary" disabled onClick={onClick}>Disabled</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows spinner when loading", () => {
      render(<Button variant="primary" loading>Loading</Button>);
      const btn = screen.getByRole("button");
      const spinner = btn.querySelector("svg");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });

    it("is disabled when loading", () => {
      render(<Button variant="primary" loading>Loading</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("sets aria-busy when loading", () => {
      render(<Button variant="primary" loading>Loading</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });

    it("does not fire onClick when loading", () => {
      const onClick = vi.fn();
      render(<Button variant="primary" loading onClick={onClick}>Loading</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("onClick", () => {
    it("fires onClick when clicked", () => {
      const onClick = vi.fn();
      render(<Button variant="primary" onClick={onClick}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("custom className", () => {
    it("appends custom className", () => {
      render(<Button variant="primary" className="mt-4">Custom</Button>);
      expect(screen.getByRole("button")).toHaveClass("mt-4");
    });
  });

  describe("pressed state classes", () => {
    it("has active:bg-shade-70 for primary variant (pressed state)", () => {
      render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole("button")).toHaveClass("active:bg-shade-70");
    });

    it("has active:bg-shade-70 for outline-dark variant (pressed state)", () => {
      render(<Button variant="outline-dark">Outline Dark</Button>);
      expect(screen.getByRole("button")).toHaveClass("active:bg-shade-70");
    });

    it("has active:bg-shade-70 for outline-light variant (pressed state)", () => {
      render(<Button variant="outline-light">Outline Light</Button>);
      expect(screen.getByRole("button")).toHaveClass("active:bg-shade-70");
    });

    it("has active:bg-shade-70 for aloe variant (pressed state)", () => {
      render(<Button variant="aloe">Aloe</Button>);
      expect(screen.getByRole("button")).toHaveClass("active:bg-shade-70");
    });
  });
});
