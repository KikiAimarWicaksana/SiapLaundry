"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";

const MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const MAP_STYLES = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
];

export interface LatLng {
  lat: number;
  lng: number;
}

interface TrackingMapProps {
  /** Posisi tujuan (alamat buyer untuk pickup, atau alamat buyer untuk delivery) */
  destination: LatLng;
  /** Posisi kurir real-time (opsional — jika ada) */
  driverPosition?: LatLng;
  /** Label tujuan */
  destinationLabel?: string;
  /** Tinggi container peta */
  height?: string;
  /** Tampilkan rute dari kurir ke tujuan */
  showRoute?: boolean;
}

const containerStyle = (height: string) => ({
  width: "100%",
  height,
  borderRadius: "8px",
});

// Custom marker icons
const DRIVER_ICON = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: "#22c55e",
  fillOpacity: 1,
  strokeColor: "#fff",
  strokeWeight: 2,
  scale: 1.5,
  anchor: { x: 12, y: 24 } as google.maps.Point,
};

const DESTINATION_ICON = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: "#3b82f6",
  fillOpacity: 1,
  strokeColor: "#fff",
  strokeWeight: 2,
  scale: 1.5,
  anchor: { x: 12, y: 24 } as google.maps.Point,
};

export function TrackingMap({
  destination,
  driverPosition,
  destinationLabel = "Tujuan",
  height = "320px",
  showRoute = true,
}: TrackingMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: MAP_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const center = driverPosition ?? destination;

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Fetch rute dari kurir ke tujuan
  useEffect(() => {
    if (!isLoaded || !showRoute || !driverPosition) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: driverPosition,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, driverPosition, destination, showRoute]);

  // Fit bounds saat ada dua titik
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !driverPosition) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(driverPosition);
    bounds.extend(destination);
    mapRef.current.fitBounds(bounds, 80);
  }, [isLoaded, driverPosition, destination]);

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
      mapContainerStyle={containerStyle(height)}
      center={center}
      zoom={14}
      onLoad={onMapLoad}
      options={{
        styles: MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* Rute kurir → tujuan */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#22c55e",
              strokeWeight: 4,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}

      {/* Marker kurir */}
      {driverPosition && (
        <Marker
          position={driverPosition}
          icon={DRIVER_ICON}
          title="Posisi Kurir"
          label={{
            text: "Kurir",
            color: "#fff",
            fontSize: "11px",
            fontWeight: "600",
          }}
        />
      )}

      {/* Marker tujuan */}
      <Marker
        position={destination}
        icon={DESTINATION_ICON}
        title={destinationLabel}
        label={{
          text: destinationLabel,
          color: "#fff",
          fontSize: "11px",
          fontWeight: "600",
        }}
      />
    </GoogleMap>
  );
}
