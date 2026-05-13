"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface FilterState {
  distance: number | null; // km radius, null = all
  minRating: number | null; // minimum rating, null = all
  priceSort: "asc" | "desc" | null; // sort direction
  services: string[]; // selected service names
}

export interface LaundryFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const DISTANCE_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Semua", value: null },
  { label: "1 km", value: 1 },
  { label: "3 km", value: 3 },
  { label: "5 km", value: 5 },
  { label: "10 km+", value: 10 },
];

const RATING_OPTIONS: { label: string; value: number }[] = [
  { label: "4+", value: 4 },
  { label: "3+", value: 3 },
  { label: "2+", value: 2 },
];

const PRICE_SORT_OPTIONS: { label: string; value: "asc" | "desc" }[] = [
  { label: "Termurah", value: "asc" },
  { label: "Termahal", value: "desc" },
];

const SERVICE_OPTIONS: string[] = [
  "Cuci Kering",
  "Cuci Setrika",
  "Setrika Saja",
  "Dry Clean",
];

export function LaundryFilter({
  filters,
  onFilterChange,
  onReset,
}: LaundryFilterProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDistanceChange = (value: number | null) => {
    setLocalFilters((prev) => ({ ...prev, distance: value }));
  };

  const handleRatingChange = (value: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === value ? null : value,
    }));
  };

  const handlePriceSortChange = (value: "asc" | "desc") => {
    setLocalFilters((prev) => ({
      ...prev,
      priceSort: prev.priceSort === value ? null : value,
    }));
  };

  const handleServiceToggle = (service: string) => {
    setLocalFilters((prev) => {
      const services = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetState: FilterState = {
      distance: null,
      minRating: null,
      priceSort: null,
      services: [],
    };
    setLocalFilters(resetState);
    onReset();
  };

  const filterContent = (
    <div className="flex flex-col gap-6">
      {/* Jarak */}
      <fieldset>
        <legend className="font-body text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] mb-2">
          Jarak
        </legend>
        <div className="flex flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((option) => (
            <label
              key={option.label}
              className={[
                "inline-flex items-center gap-2 cursor-pointer",
                "px-3 py-2 rounded-md border transition-colors duration-150",
                localFilters.distance === option.value
                  ? "border-ink bg-canvas-night text-canvas-light"
                  : "border-hairline-light bg-canvas-light text-ink hover:border-shade-40",
              ].join(" ")}
            >
              <input
                type="radio"
                name="distance"
                value={option.value ?? "all"}
                checked={localFilters.distance === option.value}
                onChange={() => handleDistanceChange(option.value)}
                className="sr-only"
                aria-label={`Jarak ${option.label}`}
              />
              <span className="font-body text-[14px] font-[420] leading-[1.5] [font-feature-settings:'ss03']">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Rating */}
      <fieldset>
        <legend className="font-body text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] mb-2">
          Rating Minimum
        </legend>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "inline-flex items-center gap-2 cursor-pointer",
                "px-3 py-2 rounded-md border transition-colors duration-150",
                localFilters.minRating === option.value
                  ? "border-ink bg-canvas-night text-canvas-light"
                  : "border-hairline-light bg-canvas-light text-ink hover:border-shade-40",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={localFilters.minRating === option.value}
                onChange={() => handleRatingChange(option.value)}
                className="sr-only"
                aria-label={`Rating minimum ${option.label}`}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-body text-[14px] font-[420] leading-[1.5] [font-feature-settings:'ss03']">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Harga (Sort Direction) */}
      <fieldset>
        <legend className="font-body text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] mb-2">
          Urutkan Harga
        </legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_SORT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "inline-flex items-center gap-2 cursor-pointer",
                "px-3 py-2 rounded-md border transition-colors duration-150",
                localFilters.priceSort === option.value
                  ? "border-ink bg-canvas-night text-canvas-light"
                  : "border-hairline-light bg-canvas-light text-ink hover:border-shade-40",
              ].join(" ")}
            >
              <input
                type="radio"
                name="priceSort"
                value={option.value}
                checked={localFilters.priceSort === option.value}
                onChange={() => handlePriceSortChange(option.value)}
                className="sr-only"
                aria-label={`Urutkan harga ${option.label}`}
              />
              <span className="font-body text-[14px] font-[420] leading-[1.5] [font-feature-settings:'ss03']">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Layanan */}
      <fieldset>
        <legend className="font-body text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] mb-2">
          Layanan
        </legend>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((service) => (
            <label
              key={service}
              className={[
                "inline-flex items-center gap-2 cursor-pointer",
                "px-3 py-2 rounded-md border transition-colors duration-150",
                localFilters.services.includes(service)
                  ? "border-ink bg-canvas-night text-canvas-light"
                  : "border-hairline-light bg-canvas-light text-ink hover:border-shade-40",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={localFilters.services.includes(service)}
                onChange={() => handleServiceToggle(service)}
                className="sr-only"
                aria-label={`Layanan ${service}`}
              />
              <span className="font-body text-[14px] font-[420] leading-[1.5] [font-feature-settings:'ss03']">
                {service}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="primary" size="sm" onClick={handleApply}>
          Terapkan Filter
        </Button>
        <Button variant="outline-light" size="sm" onClick={handleReset}>
          Reset Filter
        </Button>
      </div>
    </div>
  );

  return (
    <aside
      className="bg-canvas-cream rounded-lg p-4 md:p-6"
      aria-label="Filter laundry"
    >
      {/* Mobile: collapsible toggle */}
      <button
        type="button"
        className="flex items-center justify-between w-full md:hidden"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="filter-panel"
      >
        <span className="font-body text-[16px] font-[550] leading-[1.5] text-ink [font-feature-settings:'ss03']">
          Filter
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Mobile: collapsible content */}
      <div
        id="filter-panel"
        className={`md:block ${isExpanded ? "block mt-4" : "hidden"}`}
      >
        {filterContent}
      </div>
    </aside>
  );
}

export default LaundryFilter;
