"use client";

import React from "react";
import { Input } from "@/components/ui/Input";

export interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  label?: string;
  error?: string;
}

/**
 * Placeholder LocationPicker component.
 * Shows a text input for address + lat/lng fields.
 * Actual Google Maps integration will come in a later task.
 */
export function LocationPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  label = "Alamat",
  error,
}: LocationPickerProps) {
  const [address, setAddress] = React.useState("");
  const [lat, setLat] = React.useState(initialLat?.toString() ?? "");
  const [lng, setLng] = React.useState(initialLng?.toString() ?? "");

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    onLocationSelect(
      parseFloat(lat) || 0,
      parseFloat(lng) || 0,
      value
    );
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLat(value);
    onLocationSelect(parseFloat(value) || 0, parseFloat(lng) || 0, address);
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLng(value);
    onLocationSelect(parseFloat(lat) || 0, parseFloat(value) || 0, address);
  };

  return (
    <div className="flex flex-col gap-sm">
      <Input
        label={label}
        placeholder="Masukkan alamat lengkap"
        value={address}
        onChange={handleAddressChange}
        error={error}
      />
      <div className="flex gap-sm">
        <div className="flex-1">
          <Input
            label="Latitude"
            placeholder="-6.200000"
            value={lat}
            onChange={handleLatChange}
            type="text"
          />
        </div>
        <div className="flex-1">
          <Input
            label="Longitude"
            placeholder="106.816666"
            value={lng}
            onChange={handleLngChange}
            type="text"
          />
        </div>
      </div>
      <p className="text-[12px] font-[400] text-shade-50 [font-feature-settings:'ss03']">
        * Integrasi Google Maps akan tersedia di versi selanjutnya
      </p>
    </div>
  );
}

export default LocationPicker;
