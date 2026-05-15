import React from "react";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-[32px] h-[32px] text-[12px]",
  md: "w-[40px] h-[40px] text-[14px]",
  lg: "w-[56px] h-[56px] text-[18px]",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = getInitials(name);
  const label = alt || name || "Avatar";

  return (
    <div
      className={[
        "relative inline-flex items-center justify-center",
        "rounded-full overflow-hidden",
        "bg-shade-30 text-ink font-[500]",
        "[font-feature-settings:'ss03']",
        "shrink-0",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={label}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
