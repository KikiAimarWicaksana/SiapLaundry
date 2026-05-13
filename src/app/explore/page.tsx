"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LaundryFilter, FilterState } from "@/components/laundry/LaundryFilter";
import { LaundryGrid } from "@/components/laundry/LaundryGrid";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LaundryCardProps } from "@/components/laundry/LaundryCard";

// --- Mock Data ---
const MOCK_LAUNDRIES: LaundryCardProps[] = [
  {
    id: "1",
    name: "Laundry Bersih Cemerlang",
    photos: ["/placeholder-laundry.jpg"],
    averageRating: 4.8,
    totalReviews: 124,
    distanceKm: 1.2,
    startingPrice: 7000,
    isOpen: true,
    services: ["Cuci Kering", "Cuci Setrika", "Setrika Saja"],
  },
  {
    id: "2",
    name: "Super Clean Laundry",
    photos: ["/placeholder-laundry.jpg"],
    averageRating: 4.5,
    totalReviews: 89,
    distanceKm: 2.4,
    startingPrice: 6000,
    isOpen: true,
    services: ["Cuci Kering", "Cuci Setrika", "Dry Clean"],
  },
  {
    id: "3",
    name: "Laundry Express Kilat",
    photos: ["/placeholder-laundry.jpg"],
    averageRating: 4.2,
    totalReviews: 56,
    distanceKm: 3.1,
    startingPrice: 8000,
    isOpen: false,
    services: ["Cuci Setrika", "Setrika Saja"],
  },
  {
    id: "4",
    name: "Wangi Laundry & Dry Clean",
    photos: ["/placeholder-laundry.jpg"],
    averageRating: 4.9,
    totalReviews: 210,
    distanceKm: 0.8,
    startingPrice: 9000,
    isOpen: true,
    services: ["Cuci Kering", "Cuci Setrika", "Dry Clean", "Setrika Saja"],
  },
  {
    id: "5",
    name: "Laundry Murah Meriah",
    photos: ["/placeholder-laundry.jpg"],
    averageRating: 3.8,
    totalReviews: 42,
    distanceKm: 4.5,
    startingPrice: 5000,
    isOpen: true,
    services: ["Cuci Kering", "Cuci Setrika"],
  },
  {
    id: "6",
    name: "Laundry Sejahtera",
    photos: ["/placeholder-laundry.jpg"],
    averageRating: 4.0,
    totalReviews: 67,
    distanceKm: 5.8,
    startingPrice: 6500,
    isOpen: true,
    services: ["Cuci Setrika", "Setrika Saja", "Dry Clean"],
  },
  {
    id: "7",
    name: "Queen Laundry Bandung",
    photos: ["/placeholder-laundry.jpg"],
    averageRating: 3.5,
    totalReviews: 31,
    distanceKm: 7.2,
    startingPrice: 5500,
    isOpen: false,
    services: ["Cuci Kering", "Setrika Saja"],
  },
  {
    id: "8",
    name: "Fresh & Clean Laundry",
    photos: ["/placeholder-laundry.jpg"],
    averageRating: 4.6,
    totalReviews: 98,
    distanceKm: 1.9,
    startingPrice: 7500,
    isOpen: true,
    services: ["Cuci Kering", "Cuci Setrika", "Dry Clean"],
  },
];

// --- Filter Logic ---
function applyFilters(
  laundries: LaundryCardProps[],
  filters: FilterState,
  searchTerm: string
): LaundryCardProps[] {
  let result = [...laundries];

  // Search filter: by name or address (using name here since mock data has no address field)
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    result = result.filter(
      (l) => l.name.toLowerCase().includes(term)
    );
  }

  // Distance filter
  if (filters.distance !== null) {
    result = result.filter((l) => l.distanceKm <= filters.distance!);
  }

  // Rating filter
  if (filters.minRating !== null) {
    result = result.filter((l) => l.averageRating >= filters.minRating!);
  }

  // Service filter
  if (filters.services.length > 0) {
    result = result.filter((l) =>
      filters.services.some((service) => l.services.includes(service))
    );
  }

  // Price sort
  if (filters.priceSort === "asc") {
    result.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (filters.priceSort === "desc") {
    result.sort((a, b) => b.startingPrice - a.startingPrice);
  }

  return result;
}

// --- Geolocation Status ---
type GeoStatus = "idle" | "requesting" | "granted" | "denied";

export default function ExplorePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [manualLocation, setManualLocation] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    distance: null,
    minRating: null,
    priceSort: null,
    services: [],
  });

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      () => {
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("denied");
      }
    );
  }, []);

  // Filter results
  const filteredLaundries = useMemo(
    () => applyFilters(MOCK_LAUNDRIES, filters, debouncedSearch),
    [filters, debouncedSearch]
  );

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({
      distance: null,
      minRating: null,
      priceSort: null,
      services: [],
    });
  }, []);

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />

      <main className="max-w-[1280px] mx-auto px-xl py-xl">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-shade-50"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari laundry berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={[
                "w-full bg-canvas-light text-ink",
                "font-body text-[16px] font-[420] leading-[1.5]",
                "[font-feature-settings:'ss03']",
                "pl-10 pr-4 py-3",
                "rounded-pill",
                "border border-hairline-light",
                "outline-none",
                "focus:ring-2 focus:ring-ink/20 focus:border-ink",
                "placeholder:text-shade-40",
                "transition-colors duration-150",
              ].join(" ")}
              aria-label="Cari laundry"
            />
          </div>
        </div>

        {/* Geolocation fallback: manual location input */}
        {geoStatus === "denied" && (
          <div className="mb-6 p-4 bg-canvas-light rounded-lg border border-hairline-light">
            <p className="font-body text-[14px] font-[500] text-shade-60 mb-2 [font-feature-settings:'ss03']">
              Izin lokasi ditolak. Masukkan lokasi Anda secara manual:
            </p>
            <Input
              placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              aria-label="Masukkan lokasi manual"
            />
          </div>
        )}

        {/* Main Content: Filter + Grid */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className="w-full md:w-[280px] md:flex-shrink-0">
            {isLoading ? (
              <div className="flex flex-col gap-4 p-4">
                <Skeleton variant="text" height="24px" width="100px" />
                <Skeleton variant="text" height="40px" />
                <Skeleton variant="text" height="40px" />
                <Skeleton variant="text" height="40px" />
                <Skeleton variant="text" height="40px" />
              </div>
            ) : (
              <LaundryFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleFilterReset}
              />
            )}
          </div>

          {/* Laundry Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton variant="image" />
                    <Skeleton variant="text" height="20px" width="70%" />
                    <Skeleton variant="text" height="16px" width="50%" />
                    <Skeleton variant="text" height="16px" width="40%" />
                    <Skeleton variant="text" height="40px" />
                  </div>
                ))}
              </div>
            ) : (
              <LaundryGrid laundries={filteredLaundries} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
