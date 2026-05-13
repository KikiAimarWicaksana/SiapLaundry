import React from "react";

export interface SkeletonProps {
  variant?: "text" | "card" | "avatar" | "image";
  width?: string;
  height?: string;
  className?: string;
}

const variantClasses: Record<NonNullable<SkeletonProps["variant"]>, string> = {
  text: "h-[16px] w-full rounded-sm",
  card: "h-[200px] w-full rounded-lg",
  avatar: "h-[40px] w-[40px] rounded-full",
  image: "h-[180px] w-full rounded-md",
};

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={[
        "animate-pulse bg-shade-30/60",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }}
      role="status"
      aria-label="Memuat..."
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );
}

export default Skeleton;
