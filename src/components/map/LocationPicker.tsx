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
  const [manualAddress, setManualAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [forwardGeocoding, setForwardGeocoding] = useState(false);

  const defaultCenter = initialLocation ?? { lat: -6.9175, lng: 107.6191 };

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results[0]) {
        const found = result.results[0].formatted_address;
        setAddress(found);
        setManualAddress(found);
      }
    } catch {
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallback);
      setManualAddress(fallback);
    } finally {
      setGeocoding(false);
    }
  }, []);

  /** Geocode alamat teks → koordinat (forward geocoding) */
  const forwardGeocode = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setForwardGeocoding(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: text });
      if (result.results[0]) {
        const loc = result.results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        setMarkerPos({ lat, lng });
        setAddress(result.results[0].formatted_address);
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(16);
      }
    } catch {
      // tidak ditemukan
    } finally {
      setForwardGeocoding(false);
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
    if (!markerPos && !manualAddress.trim()) return;
    // Jika hanya isi manual tanpa pilih peta, gunakan koordinat 0,0
    onConfirm({
      lat: markerPos?.lat ?? 0,
      lng: markerPos?.lng ?? 0,
      address: manualAddress.trim() || address,
    });
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
      {/* Input manual alamat */}
      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-[500] text-shade-60 [font-feature-settings:'ss03']">
          Ketik alamat secara manual
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); forwardGeocode(manualAddress); } }}
            placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
            className="flex-1 bg-canvas-light text-ink font-body text-[14px] font-[420] px-[12px] py-[9px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink placeholder:text-shade-40 transition-colors"
          />
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => forwardGeocode(manualAddress)}
            loading={forwardGeocoding}
            className="shrink-0"
          >
            Cari
          </Button>
        </div>
        <p className="text-[11px] text-shade-40">Tekan Enter atau klik Cari untuk tampilkan di peta</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-hairline-light" />
        <span className="text-[12px] text-shade-40 font-[420]">atau pilih dari peta</span>
        <div className="flex-1 h-px bg-hairline-light" />
      </div>

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

      {/* Peta */}
      <div className="relative">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "280px", borderRadius: "8px" }}
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
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] px-3 py-1 rounded-pill pointer-events-none whitespace-nowrap">
          Klik peta atau seret pin untuk memilih lokasi
        </p>
      </div>

      {/* Alamat terpilih */}
      {(markerPos || manualAddress.trim()) && (
        <div className="p-3 bg-canvas-cream rounded-md border border-hairline-light">
          <p className="text-[12px] text-shade-50 mb-1">Alamat yang akan disimpan:</p>
          <p className="text-[13px] text-ink font-[500]">
            {geocoding
              ? "Mencari alamat..."
              : manualAddress.trim() || address || `${markerPos?.lat.toFixed(6)}, ${markerPos?.lng.toFixed(6)}`}
          </p>
          {markerPos && (
            <p className="text-[11px] text-shade-40 mt-1">
              📍 {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
            </p>
          )}
        </div>
      )}

      {/* Tombol aksi */}
      <div className="flex gap-3 pt-1">
        <Button
          variant="primary"
          size="md"
          onClick={handleConfirm}
          disabled={(!markerPos && !manualAddress.trim()) || geocoding}
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
