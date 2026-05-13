"use client";

import React, { useCallback, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/Button";

const MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

export interface PickedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onConfirm: (location: PickedLocation) => void;
  onCancel: () => void;
}

export function LocationPicker({ initialLocation, onConfirm, onCancel }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: MAP_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    initialLocation ?? null
  );
  const [address, setAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);

  const defaultCenter = initialLocation ?? { lat: -6.9175, lng: 107.6191 };

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMarkerPos({ lat, lng });
        reverseGeocode(lat, lng);
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(16);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (!markerPos) return;
    onConfirm({ lat: markerPos.lat, lng: markerPos.lng, address });
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64 bg-shade-10 rounded-lg text-shade-50 text-[13px]">
        Gagal memuat peta.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-shade-10 rounded-lg animate-pulse">
        <span className="text-shade-50 text-[13px]">Memuat peta...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tombol lokasi terkini */}
      <Button
        variant="outline-light"
        size="sm"
        onClick={handleUseCurrentLocation}
        loading={locating}
        className="self-start gap-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Gunakan Lokasi Terkini
      </Button>

      {/* Peta — klik untuk pilih lokasi */}
      <div className="relative">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "300px", borderRadius: "8px" }}
          center={markerPos ?? defaultCenter}
          zoom={14}
          onLoad={(map) => { mapRef.current = map; }}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {markerPos && (
            <Marker
              position={markerPos}
              draggable
              onDragEnd={(e) => {
                if (!e.latLng) return;
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setMarkerPos({ lat, lng });
                reverseGeocode(lat, lng);
              }}
            />
          )}
        </GoogleMap>
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] px-3 py-1 rounded-pill pointer-events-none">
          Klik peta atau seret pin untuk memilih lokasi
        </p>
      </div>

      {/* Alamat hasil geocoding */}
      {markerPos && (
        <div className="p-3 bg-canvas-cream rounded-md">
          <p className="text-[12px] text-shade-50 mb-1">Alamat terdeteksi:</p>
          <p className="text-[13px] text-ink font-[500]">
            {geocoding ? "Mencari alamat..." : address || `${markerPos.lat.toFixed(6)}, ${markerPos.lng.toFixed(6)}`}
          </p>
        </div>
      )}

      {/* Tombol aksi */}
      <div className="flex gap-3 pt-1">
        <Button
          variant="primary"
          size="md"
          onClick={handleConfirm}
          disabled={!markerPos || geocoding}
        >
          Konfirmasi Lokasi
        </Button>
        <Button variant="outline-light" size="md" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  );
}

export default LocationPicker;
