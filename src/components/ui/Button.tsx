"use client";

import React from "react";

export interface ButtonProps {
  variant: "primary" | "outline-dark" | "outline-light" | "aloe";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const variantClasses: Record<ButtonProps["variant"], string> = {
  primary: [
    "bg-canvas-night text-canvas-light",
    "border-2 border-transparent",
    "hover:bg-shade-60",
    "active:bg-shade-70",
  ].join(" "),
  "outline-dark": [
    "bg-transparent text-canvas-light",
    "border-2 border-canvas-light",
    "hover:bg-canvas-light/10",
    "active:bg-shade-70",
  ].join(" "),
  "outline-light": [
    "bg-canvas-light text-ink",
    "border border-ink",
    "hover:bg-shade-30/30",
    "active:bg-shade-70 active:text-canvas-light",
  ].join(" "),
  aloe: [
    "bg-aloe-10 text-ink",
    "border-2 border-transparent",
    "hover:bg-pistachio-10",
    "active:bg-shade-70 active:text-canvas-light",
  ].join(" "),
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Button({
  variant,
  size = "md",
  children,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = [
    "inline-flex items-center justify-center gap-2",
    "rounded-pill",
    "font-body font-[420]",
    "transition-colors duration-150 ease-in-out",
    "cursor-pointer",
    "select-none",
    "leading-[1.5]",
    "[font-feature-settings:'ss03']",
  ].join(" ");

  const disabledClasses = isDisabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabledClasses,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export default Button;
