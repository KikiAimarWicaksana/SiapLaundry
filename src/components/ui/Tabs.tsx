"use client";

import React, { useState } from "react";

export interface TabItem {
  label: string;
  value: string;
  badge?: number;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Tabs({
  items,
  defaultValue,
  value: controlledValue,
  onChange,
  className = "",
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(
    defaultValue || items[0]?.value || ""
  );

  const activeValue = controlledValue ?? internalValue;

  const handleChange = (val: string) => {
    if (controlledValue === undefined) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  return (
    <div
      className={["flex border-b border-hairline-light", className]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.value === activeValue;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleChange(item.value)}
            className={[
              "relative px-[16px] py-[12px]",
              "text-[14px] font-[500] leading-[1.49] tracking-[0.28px]",
              "[font-feature-settings:'ss03']",
              "cursor-pointer",
              "transition-colors duration-150",
              "border-b-2 -mb-[1px]",
              isActive
                ? "border-ink text-ink"
                : "border-transparent text-shade-50 hover:text-ink",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="inline-flex items-center gap-[6px]">
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-pill bg-red-500 text-white text-[11px] font-[600] leading-none"
                  aria-label={`${item.badge} item`}
                >
                  {item.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
