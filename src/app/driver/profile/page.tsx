"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StarRating } from "@/components/ui/StarRating";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";

interface DriverProfile {
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  averageRating: number;
  totalDeliveries: number;
  isOnline: boolean;
  joinedDate: string;
}

export default function DriverProfilePage() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ phone: "", vehiclePlate: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/driver/profile");
        const data: DriverProfile = res.data.data;
        setProfile(data);
        setFormData({ phone: data.phone, vehiclePlate: data.vehiclePlate });
      } catch {
        addToast("Gagal memuat profil.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/driver/profile", formData);
      setProfile((prev) => prev ? { ...prev, ...formData } : prev);
      setIsEditing(false);
      addToast("Profil berhasil disimpan!", "success");
    } catch {
      addToast("Gagal menyimpan profil.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) setFormData({ phone: profile.phone, vehiclePlate: profile.vehiclePlate });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-shade-10 rounded" />
        <div className="h-48 bg-shade-10 rounded-lg" />
        <div className="h-64 bg-shade-10 rounded-lg" />
      </div>
    );
  }

  if (!profile) return null;

  const vehicleLabel = profile.vehicleType === "motorcycle" ? "Motor" : "Mobil";

  return (
    <div>
      <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-6">
        Profil Kurir
      </h1>

      {/* Profile Header */}
      <Card variant="default" className="flex flex-col items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-shade-30 flex items-center justify-center">
          <span className="text-[28px] font-[600] text-ink">{profile.name.charAt(0)}</span>
        </div>
        <div className="text-center">
          <h2 className="text-[18px] font-[600] text-ink">{profile.name}</h2>
          <p className="text-[13px] text-shade-50 mt-1">Bergabung sejak {profile.joinedDate}</p>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <StarRating value={Math.round(profile.averageRating)} readonly size="sm" />
              <span className="text-[14px] font-[600] text-ink ml-1">
                {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "—"}
              </span>
            </div>
            <p className="text-[12px] text-shade-50 mt-1">Rating</p>
          </div>
          <div className="w-px h-8 bg-hairline-light" aria-hidden="true" />
          <div className="flex flex-col items-center">
            <p className="text-[18px] font-[600] text-ink">{profile.totalDeliveries}</p>
            <p className="text-[12px] text-shade-50 mt-1">Total Trip</p>
          </div>
        </div>
      </Card>

      {/* Profile Details */}
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
          <div className="flex flex-col gap-4">
            <Input
              label="No. Telepon"
              value={formData.phone}
              onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
              type="tel"
            />
            <Input
              label="Plat Nomor"
              value={formData.vehiclePlate}
              onChange={(e) => setFormData((f) => ({ ...f, vehiclePlate: e.target.value }))}
            />
            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" size="md" onClick={handleSave} loading={saving}>Simpan</Button>
              <Button variant="outline-light" size="md" onClick={handleCancel}>Batal</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[12px] text-shade-50 mb-1">Nama Lengkap</p>
              <p className="text-[14px] font-[500] text-ink">{profile.name}</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50 mb-1">No. Telepon</p>
              <p className="text-[14px] font-[500] text-ink">{profile.phone}</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50 mb-1">Email</p>
              <p className="text-[14px] font-[500] text-ink">{profile.email}</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50 mb-1">Kendaraan</p>
              <p className="text-[14px] font-[500] text-ink">{vehicleLabel}</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50 mb-1">Plat Nomor</p>
              <p className="text-[14px] font-[500] text-ink">{profile.vehiclePlate}</p>
            </div>
            <div>
              <p className="text-[12px] text-shade-50 mb-1">Rating</p>
              <div className="flex items-center gap-1">
                <StarRating value={Math.round(profile.averageRating)} readonly size="sm" />
                <span className="text-[14px] font-[500] text-ink">
                  {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "Belum ada"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
