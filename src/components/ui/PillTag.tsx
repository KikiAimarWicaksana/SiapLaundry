import React from "react";

export interface PillTagProps {
  variant?: "mint" | "shade";
  children: React.ReactNode;
  className?: string;
}

const pillTagVariantClasses: Record<NonNullable<PillTagProps["variant"]>, string> = {
  mint: "bg-aloe-10 text-ink",
  shade: "bg-shade-30 text-ink",
};

export function PillTag({
  variant = "mint",
  children,
  className = "",
}: PillTagProps) {
  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-pill",
        "px-[12px] py-[4px]",
        "text-[12px] font-[400] leading-[1.2] tracking-[0.72px]",
        "[font-feature-settings:'ss03']",
        "uppercase",
        pillTagVariantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

export default PillTag;
