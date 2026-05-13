"use client";

import React, { useState } from "react";

export interface StarRatingProps {
  value: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<StarRatingProps["size"]>, { star: number; gap: string }> = {
  sm: { star: 16, gap: "gap-[2px]" },
  md: { star: 24, gap: "gap-[4px]" },
  lg: { star: 32, gap: "gap-[4px]" },
};

function StarIcon({
  filled,
  size,
}: {
  filled: boolean;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function StarRating({
  value,
  readonly = false,
  onChange,
  size = "md",
  className = "",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const { star: starSize, gap } = sizeMap[size];

  const displayValue = hoverValue || value;

  if (readonly) {
    return (
      <div
        className={["inline-flex items-center", gap, "text-yellow-400", className]
          .filter(Boolean)
          .join(" ")}
        role="img"
        aria-label={`Rating: ${value} dari 5 bintang`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= value} size={starSize} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={["inline-flex items-center", gap, "text-yellow-400", className]
        .filter(Boolean)
        .join(" ")}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="cursor-pointer p-0 border-none bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded-sm"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} bintang`}
        >
          <StarIcon filled={star <= displayValue} size={starSize} />
        </button>
      ))}
    </div>
  );
}

export default StarRating;
