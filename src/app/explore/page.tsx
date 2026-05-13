"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LaundryFilter, FilterState } from "@/components/laundry/LaundryFilter";
import { LaundryGrid } from "@/components/laundry/LaundryGrid";
import { NearbyLaundriesMap } from "@/components/map/NearbyLaundriesMap";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LaundryCardProps } from "@/components/laundry/LaundryCard";
import api from "@/lib/api";

// --- API Response Types ---
interface ApiLaundry {
  id: string;
  name: string;
  photos: string[];
  averageRating: number;
  totalReviews: number;
  startingPrice: number;
  isOpen: boolean;
  services: string[];
  latitude: number;
  longitude: number;
}

// --- Geolocation helper: Haversine distance in km ---
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Filter Logic ---
function applyFilters(
  laundries: LaundryCardProps[],
  filters: FilterState,
  searchTerm: string
): LaundryCardProps[] {
  let result = [...laundries];

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    result = result.filter((l) => l.name.toLowerCase().includes(term));
  }
  if (filters.distance !== null) {
    result = result.filter((l) => l.distanceKm <= filters.distance!);
  }
  if (filters.minRating !== null) {
    result = result.filter((l) => l.averageRating >= filters.minRating!);
  }
  if (filters.services.length > 0) {
    result = result.filter((l) =>
      filters.services.some((service) => l.services.includes(service))
    );
  }
  if (filters.priceSort === "asc") {
    result.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (filters.priceSort === "desc") {
    result.sort((a, b) => b.startingPrice - a.startingPrice);
  }

  return result;
}

type GeoStatus = "idle" | "requesting" | "granted" | "denied";

export default function ExplorePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [laundries, setLaundries] = useState<LaundryCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLocation, setManualLocation] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    distance: null,
    minRating: null,
    priceSort: null,
    services: [],
  });

  // Fetch laundries from API
  useEffect(() => {
    let cancelled = false;

    async function fetchLaundries() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<{ success: boolean; data: ApiLaundry[] }>("/laundry");
        if (cancelled) return;

        const raw = res.data.data ?? [];

        const mapped: LaundryCardProps[] = raw.map((l) => {
          const distanceKm = userLocation
            ? haversineDistance(
                userLocation.lat,
                userLocation.lng,
                l.latitude,
                l.longitude
              )
            : 0;
          return {
            id: l.id,
            name: l.name,
            photos: l.photos.length > 0 ? l.photos : ["/placeholder-laundry.jpg"],
            averageRating: l.averageRating,
            totalReviews: l.totalReviews,
            distanceKm,
            startingPrice: l.startingPrice,
            isOpen: l.isOpen,
            services: l.services,
            // simpan koordinat untuk peta
            latitude: l.latitude,
            longitude: l.longitude,
          } as LaundryCardProps & { latitude: number; longitude: number };
        });

        setLaundries(mapped);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Gagal memuat data laundry. Silakan coba lagi.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchLaundries();
    return () => {
      cancelled = true;
    };
  }, [userLocation]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
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
      (pos) => {
        setGeoStatus("granted");
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setGeoStatus("denied");
      }
    );
  }, []);

  const filteredLaundries = useMemo(
    () => applyFilters(laundries, filters, debouncedSearch),
    [laundries, filters, debouncedSearch]
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
        {/* Search Bar + Toggle Peta */}
        <div className="mb-6 flex gap-3 items-center">
          <div className="relative flex-1">
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
          {/* Toggle tampilan peta */}
          <Button
            variant={showMap ? "primary" : "outline-light"}
            size="md"
            onClick={() => setShowMap((v) => !v)}
            className="shrink-0 gap-2"
            aria-pressed={showMap}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            {showMap ? "Sembunyikan Peta" : "Tampilkan Peta"}
          </Button>
        </div>

        {/* Status lokasi */}
        {geoStatus === "requesting" && (
          <div className="mb-4 flex items-center gap-2 text-[13px] text-shade-50">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Mengambil lokasi Anda...
          </div>
        )}
        {geoStatus === "granted" && userLocation && (
          <div className="mb-4 flex items-center gap-2 text-[13px] text-green-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Menampilkan laundry terdekat dari lokasi Anda
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[14px]">
            {error}
          </div>
        )}

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

        {/* Peta laundry terdekat */}
        {showMap && (
          <div className="mb-6">
            <NearbyLaundriesMap
              laundries={filteredLaundries.map((l) => ({
                id: l.id,
                name: l.name,
                latitude: (l as LaundryCardProps & { latitude?: number }).latitude ?? 0,
                longitude: (l as LaundryCardProps & { longitude?: number }).longitude ?? 0,
                averageRating: l.averageRating,
                isOpen: l.isOpen,
                distanceKm: l.distanceKm,
              }))}
              userLocation={userLocation}
              height="420px"
            />
          </div>
        )}

        {/* Main Content: Filter + Grid */}
        <div className="flex flex-col md:flex-row gap-6">
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
