import React from "react";

export interface CardProps {
  variant: "default" | "pricing" | "pricing-featured" | "cinematic" | "pistachio";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<CardProps["variant"], string> = {
  default: [
    "bg-canvas-light",
    "text-ink",
    "rounded-lg",
    "p-[32px]",
    "border border-hairline-light",
  ].join(" "),
  pricing: [
    "bg-canvas-light",
    "text-ink",
    "rounded-lg",
    "p-[32px]",
    "border border-hairline-light",
    "shadow-[0_8px_8px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)]",
  ].join(" "),
  "pricing-featured": [
    "bg-aloe-10",
    "text-ink",
    "rounded-lg",
    "p-[32px]",
  ].join(" "),
  cinematic: [
    "bg-canvas-night-elevated",
    "text-white",
    "rounded-lg",
    "p-[32px]",
  ].join(" "),
  pistachio: [
    "bg-pistachio-10",
    "text-ink",
    "rounded-lg",
    "p-[32px]",
  ].join(" "),
};

export function Card({
  variant,
  children,
  className = "",
  onClick,
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={[variantClasses[variant], className].filter(Boolean).join(" ")}
      {...(onClick && { type: "button" as const })}
    >
      {children}
    </Component>
  );
}

export default Card;
