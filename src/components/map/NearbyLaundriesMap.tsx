"use client";

import React, { useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import Link from "next/link";

const MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const MAP_STYLES = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
];

export interface LaundryMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  isOpen: boolean;
  distanceKm: number;
}

interface NearbyLaundriesMapProps {
  laundries: LaundryMapItem[];
  userLocation: { lat: number; lng: number } | null;
  height?: string;
}

const USER_ICON = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: "#3b82f6",
  fillOpacity: 1,
  strokeColor: "#fff",
  strokeWeight: 2,
  scale: 1.6,
  anchor: { x: 12, y: 24 } as google.maps.Point,
};

const LAUNDRY_OPEN_ICON = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: "#22c55e",
  fillOpacity: 1,
  strokeColor: "#fff",
  strokeWeight: 2,
  scale: 1.4,
  anchor: { x: 12, y: 24 } as google.maps.Point,
};

const LAUNDRY_CLOSED_ICON = {
  ...LAUNDRY_OPEN_ICON,
  fillColor: "#94a3b8",
};

export function NearbyLaundriesMap({
  laundries,
  userLocation,
  height = "400px",
}: NearbyLaundriesMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: MAP_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const center = userLocation ?? { lat: -6.9175, lng: 107.6191 }; // default Bandung

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Fit bounds ke semua marker
    if (laundries.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      if (userLocation) bounds.extend(userLocation);
      laundries.forEach((l) => bounds.extend({ lat: l.latitude, lng: l.longitude }));
      map.fitBounds(bounds, 60);
    }
  }, [laundries, userLocation]);

  const selectedLaundry = laundries.find((l) => l.id === selectedId);

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center bg-shade-10 rounded-lg text-shade-50 text-[13px]"
        style={{ height }}
      >
        Gagal memuat peta.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-shade-10 rounded-lg animate-pulse"
        style={{ height }}
      >
        <span className="text-shade-50 text-[13px]">Memuat peta...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height, borderRadius: "12px" }}
      center={center}
      zoom={13}
      onLoad={onMapLoad}
      options={{
        styles: MAP_STYLES,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
      onClick={() => setSelectedId(null)}
    >
      {/* Marker lokasi user */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={USER_ICON}
          title="Lokasi Anda"
          zIndex={10}
        />
      )}

      {/* Marker setiap laundry */}
      {laundries.map((l) => (
        <Marker
          key={l.id}
          position={{ lat: l.latitude, lng: l.longitude }}
          icon={l.isOpen ? LAUNDRY_OPEN_ICON : LAUNDRY_CLOSED_ICON}
          title={l.name}
          onClick={() => setSelectedId(l.id)}
        />
      ))}

      {/* Info window saat marker diklik */}
      {selectedLaundry && (
        <InfoWindow
          position={{ lat: selectedLaundry.latitude, lng: selectedLaundry.longitude }}
          onCloseClick={() => setSelectedId(null)}
        >
          <div style={{ minWidth: 160, fontFamily: "sans-serif" }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
              {selectedLaundry.name}
            </p>
            <p style={{ fontSize: 12, color: selectedLaundry.isOpen ? "#16a34a" : "#64748b", marginBottom: 4 }}>
              {selectedLaundry.isOpen ? "Buka" : "Tutup"}
              {selectedLaundry.distanceKm > 0 && ` • ${selectedLaundry.distanceKm.toFixed(1)} km`}
            </p>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
              ⭐ {selectedLaundry.averageRating.toFixed(1)}
            </p>
            <Link
              href={`/laundry/${selectedLaundry.id}`}
              style={{
                display: "inline-block",
                fontSize: 12,
                color: "#fff",
                background: "#1a1a1a",
                padding: "4px 10px",
                borderRadius: 20,
                textDecoration: "none",
              }}
            >
              Lihat Detail →
            </Link>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
