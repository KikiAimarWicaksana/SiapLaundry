"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StarRating } from "@/components/ui/StarRating";

// Mock data
const driverProfile = {
  name: "Ahmad Kurniawan",
  phone: "081298765432",
  email: "ahmad.kurniawan@email.com",
  vehicle: "Motor",
  vehiclePlate: "D 1234 ABC",
  rating: 4.8,
  totalTrips: 342,
  joinedDate: "Januari 2025",
  profilePhoto: null,
};

export default function DriverProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: driverProfile.name,
    phone: driverProfile.phone,
    email: driverProfile.email,
    vehicle: driverProfile.vehicle,
    vehiclePlate: driverProfile.vehiclePlate,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In real app, this would call an API
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: driverProfile.name,
      phone: driverProfile.phone,
      email: driverProfile.email,
      vehicle: driverProfile.vehicle,
      vehiclePlate: driverProfile.vehiclePlate,
    });
    setIsEditing(false);
  };

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Profil Kurir
      </h1>

      {/* Profile Header */}
      <Card variant="default" className="flex flex-col items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-shade-30 flex items-center justify-center">
          <span className="text-[28px] font-[600] text-ink">
            {driverProfile.name.charAt(0)}
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-[18px] font-[600] text-ink">{driverProfile.name}</h2>
          <p className="text-[13px] text-shade-50 mt-1">Bergabung sejak {driverProfile.joinedDate}</p>
        </div>

        {/* Rating & Stats */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <StarRating value={Math.round(driverProfile.rating)} readonly size="sm" />
              <span className="text-[14px] font-[600] text-ink ml-1">{driverProfile.rating}</span>
            </div>
            <p className="text-[12px] text-shade-50 mt-1">Rating</p>
          </div>
          <div className="w-px h-8 bg-hairline-light" aria-hidden="true" />
          <div className="flex flex-col items-center">
            <p className="text-[18px] font-[600] text-ink">{driverProfile.totalTrips}</p>
            <p className="text-[12px] text-shade-50 mt-1">Total Trip</p>
          </div>
        </div>
      </Card>

      {/* Profile Details / Edit Form */}
      <Card variant="default" className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-[600] text-ink">Informasi Profil</h2>
          {!isEditing && (
            <Button variant="outline-light" size="sm" onClick={() => setIsEditing(true)}>
              Edit Profil
            </Button>
          )}
        </div>

        {isEditing ? (
          /* Edit Form */
          <div className="flex flex-col gap-4">
            <Input
              label="Nama Lengkap"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <Input
              label="No. Telepon"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              type="tel"
            />
            <Input
              label="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              type="email"
            />
            <Input
              label="Kendaraan"
              value={formData.vehicle}
              onChange={(e) => handleChange("vehicle", e.target.value)}
            />
            <Input
              label="Plat Nomor"
              value={formData.vehiclePlate}
              onChange={(e) => handleChange("vehiclePlate", e.target.value)}
            />

            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" size="md" onClick={handleSave}>
                Simpan
              </Button>
              <Button variant="outline-light" size="md" onClick={handleCancel}>
                Batal
              </Button>
            </div>
          </div>
        ) : (
          /* Display Mode */
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[12px] text-shade-50 mb-1">Nama Lengkap</p>
                <p className="text-[14px] font-[500] text-ink">{driverProfile.name}</p>
              </div>
              <div>
                <p className="text-[12px] text-shade-50 mb-1">No. Telepon</p>
                <p className="text-[14px] font-[500] text-ink">{driverProfile.phone}</p>
              </div>
              <div>
                <p className="text-[12px] text-shade-50 mb-1">Email</p>
                <p className="text-[14px] font-[500] text-ink">{driverProfile.email}</p>
              </div>
              <div>
                <p className="text-[12px] text-shade-50 mb-1">Kendaraan</p>
                <p className="text-[14px] font-[500] text-ink">{driverProfile.vehicle}</p>
              </div>
              <div>
                <p className="text-[12px] text-shade-50 mb-1">Plat Nomor</p>
                <p className="text-[14px] font-[500] text-ink">{driverProfile.vehiclePlate}</p>
              </div>
              <div>
                <p className="text-[12px] text-shade-50 mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <StarRating value={Math.round(driverProfile.rating)} readonly size="sm" />
                  <span className="text-[14px] font-[500] text-ink">{driverProfile.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
