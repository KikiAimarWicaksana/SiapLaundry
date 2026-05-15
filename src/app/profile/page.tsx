"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/authStore";
import { LocationPicker } from "@/components/map/LocationPicker";
import type { PickedLocation } from "@/components/map/LocationPicker";
import api from "@/lib/api";
import { motion } from "framer-motion";

// --- Zod Schemas ---
const editProfileSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").trim(),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
});

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.newPassword !== d.oldPassword, {
    message: "Password baru harus berbeda dari password lama",
    path: ["newPassword"],
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

// --- Types ---
interface Address {
  id: string;
  label: string;
  address_line: string;
  latitude: number;
  longitude: number;
  notes?: string;
  is_default: boolean;
}

type AddressStep = "form" | "map";

export default function ProfilePage() {
  const { addToast } = useToast();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const profileData = user ?? {
    id: "", name: "", email: "", phone: "",
    role: "buyer" as const, profilePhoto: null, isVerified: false,
  };

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressStep, setAddressStep] = useState<AddressStep>("form");

  // Edit Profile form
  const [profileForm, setProfileForm] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileSaving, setProfileSaving] = useState(false);

  // Change Password form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Address form
  const [addressForm, setAddressForm] = useState({
    label: "",
    address_line: "",
    latitude: 0,
    longitude: 0,
    notes: "",
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [addressSaving, setAddressSaving] = useState(false);

  // Load addresses from API
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await api.get("/buyer/addresses");
        setAddresses(res.data.data ?? []);
      } catch {
        // silent
      } finally {
        setAddressLoading(false);
      }
    }
    if (user?.role === "buyer") fetchAddresses();
    else setAddressLoading(false);
  }, [user]);

  // --- Profile handlers ---
  function handleEditProfile() {
    setProfileForm({ name: profileData.name, email: profileData.email, phone: profileData.phone });
    setProfileErrors({});
    setEditProfileOpen(true);
  }

  async function handleSaveProfile() {
    const result = editProfileSchema.safeParse(profileForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) errors[String(issue.path[0])] = issue.message;
      }
      setProfileErrors(errors);
      return;
    }
    setProfileSaving(true);
    try {
      // TODO: connect to /api/buyer/profile PATCH when available
      setProfileErrors({});
      setEditProfileOpen(false);
      addToast("Profil berhasil diperbarui", "success");
    } finally {
      setProfileSaving(false);
    }
  }

  // --- Password handlers ---
  function handleChangePassword() {
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
    setChangePasswordOpen(true);
  }

  function handleSavePassword() {
    const result = changePasswordSchema.safeParse(passwordForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) errors[String(issue.path[0])] = issue.message;
      }
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({});
    setChangePasswordOpen(false);
    addToast("Password berhasil diubah", "success");
  }

  // --- Address handlers ---
  function handleAddAddress() {
    setEditingAddress(null);
    setAddressForm({ label: "", address_line: "", latitude: 0, longitude: 0, notes: "" });
    setAddressErrors({});
    setAddressStep("form");
    setAddressModalOpen(true);
  }

  function handleEditAddress(addr: Address) {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      address_line: addr.address_line,
      latitude: Number(addr.latitude),
      longitude: Number(addr.longitude),
      notes: addr.notes ?? "",
    });
    setAddressErrors({});
    setAddressStep("form");
    setAddressModalOpen(true);
  }

  function handleLocationPicked(loc: PickedLocation) {
    setAddressForm((f) => ({
      ...f,
      address_line: loc.address || f.address_line,
      latitude: loc.lat,
      longitude: loc.lng,
    }));
    setAddressStep("form");
  }

  async function handleSaveAddress() {
    if (!addressForm.label.trim()) {
      setAddressErrors({ label: "Label alamat wajib diisi" });
      return;
    }
    if (!addressForm.address_line.trim()) {
      setAddressErrors({ address_line: "Alamat wajib diisi" });
      return;
    }

    setAddressSaving(true);
    try {
      if (editingAddress) {
        const res = await api.put("/buyer/addresses", {
          id: editingAddress.id,
          ...addressForm,
        });
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddress.id ? res.data.data : a))
        );
        addToast("Alamat berhasil diperbarui", "success");
      } else {
        const res = await api.post("/buyer/addresses", addressForm);
        setAddresses((prev) => [...prev, res.data.data]);
        addToast("Alamat berhasil ditambahkan", "success");
      }
      setAddressModalOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Gagal menyimpan alamat";
      addToast(msg, "error");
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      await api.delete(`/buyer/addresses?id=${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      addToast("Alamat berhasil dihapus", "success");
    } catch {
      addToast("Gagal menghapus alamat", "error");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await api.put("/buyer/addresses", { id, is_default: true });
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
      addToast("Alamat default berhasil diubah", "success");
    } catch {
      addToast("Gagal mengubah alamat default", "error");
    }
  }

  function handleLogout() {
    logout();
    addToast("Berhasil logout", "info");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />

      <main className="max-w-[1280px] mx-auto px-xl py-xxl">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-8 [font-feature-settings:'ss03']"
        >
          Profil Saya
        </motion.h1>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="default" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar src={profileData.profilePhoto} name={profileData.name} size="lg" />
              <div className="flex-1">
                <h2 className="font-display text-[20px] font-[500] leading-[1.4] text-ink [font-feature-settings:'ss03']">
                  {profileData.name}
                </h2>
                <p className="text-[14px] text-shade-50 font-body leading-[1.5] [font-feature-settings:'ss03']">
                  {profileData.email}
                </p>
                <p className="text-[14px] text-shade-50 font-body leading-[1.5] [font-feature-settings:'ss03']">
                  {profileData.phone}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline-light" size="sm" onClick={handleEditProfile}>
                  Edit Profil
                </Button>
                <Button variant="outline-light" size="sm" onClick={handleChangePassword}>
                  Ubah Password
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Saved Addresses */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[20px] font-[500] leading-[1.4] text-ink [font-feature-settings:'ss03']">
              Alamat Tersimpan
            </h2>
            <Button variant="aloe" size="sm" onClick={handleAddAddress}>
              + Tambah Alamat
            </Button>
          </div>

          {addressLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 bg-shade-10 rounded-lg" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card variant="default">
                <p className="text-shade-50 text-center py-4 font-body text-[14px] [font-feature-settings:'ss03']">
                  Belum ada alamat tersimpan. Tambahkan alamat pertama Anda.
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr, index) => (
                <motion.div 
                  key={addr.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="default" className="!p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-body text-[14px] font-[550] text-ink [font-feature-settings:'ss03']">
                            {addr.label}
                          </span>
                          {addr.is_default && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-pill bg-aloe-10 text-ink text-[11px] font-[500] [font-feature-settings:'ss03']">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] text-shade-60 font-body leading-[1.5] [font-feature-settings:'ss03']">
                          {addr.address_line}
                        </p>
                        {addr.notes && (
                          <p className="text-[12px] text-shade-40 font-body mt-1 [font-feature-settings:'ss03']">
                            Catatan: {addr.notes}
                          </p>
                        )}
                        {addr.latitude !== 0 && (
                          <p className="text-[11px] text-shade-40 mt-0.5">
                            📍 {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap shrink-0">
                        {!addr.is_default && (
                          <Button variant="outline-light" size="sm" onClick={() => handleSetDefault(addr.id)}>
                            Set Default
                          </Button>
                        )}
                        <Button variant="outline-light" size="sm" onClick={() => handleEditAddress(addr)}>
                          Edit
                        </Button>
                        <Button variant="outline-light" size="sm" onClick={() => handleDeleteAddress(addr.id)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button variant="outline-light" size="md" onClick={handleLogout}>
            Logout
          </Button>
        </motion.div>
      </main>

      {/* Edit Profile Modal */}
      <Modal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} title="Edit Profil">
        <div className="flex flex-col gap-4">
          <Input label="Nama Lengkap" value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
            error={profileErrors.name} />
          <Input label="Email" type="email" value={profileForm.email}
            onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
            error={profileErrors.email} />
          <Input label="No. Telepon" type="tel" value={profileForm.phone}
            onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
            error={profileErrors.phone} />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline-light" size="sm" onClick={() => setEditProfileOpen(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSaveProfile} loading={profileSaving}>Simpan</Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} title="Ubah Password">
        <div className="flex flex-col gap-4">
          <Input label="Password Lama" type="password" value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))}
            error={passwordErrors.oldPassword} />
          <Input label="Password Baru" type="password" value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            error={passwordErrors.newPassword} />
          <Input label="Konfirmasi Password Baru" type="password" value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            error={passwordErrors.confirmPassword} />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline-light" size="sm" onClick={() => setChangePasswordOpen(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSavePassword}>Ubah Password</Button>
          </div>
        </div>
      </Modal>

      {/* Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddress ? "Edit Alamat" : "Tambah Alamat"}
      >
        {addressStep === "map" ? (
          <LocationPicker
            initialLocation={
              addressForm.latitude !== 0
                ? { lat: addressForm.latitude, lng: addressForm.longitude }
                : undefined
            }
            onConfirm={handleLocationPicked}
            onCancel={() => setAddressStep("form")}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Input
              label="Label Alamat"
              placeholder="Contoh: Rumah, Kantor, Kos"
              value={addressForm.label}
              onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
              error={addressErrors.label}
            />

            {/* Tombol pilih dari peta */}
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink">
                Lokasi
              </label>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setAddressStep("map")}
                className="self-start gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {addressForm.latitude !== 0 ? "Ubah Lokasi di Peta" : "Pilih Lokasi dari Peta"}
              </Button>
              {addressForm.latitude !== 0 && (
                <p className="text-[12px] text-shade-50">
                  📍 {addressForm.latitude.toFixed(5)}, {addressForm.longitude.toFixed(5)}
                </p>
              )}
            </div>

            <Input
              label="Alamat Lengkap"
              placeholder="Jl. Contoh No. 1, Kota"
              value={addressForm.address_line}
              onChange={(e) => setAddressForm((f) => ({ ...f, address_line: e.target.value }))}
              error={addressErrors.address_line}
            />
            <Input
              label="Catatan (opsional)"
              placeholder="Patokan atau catatan tambahan"
              value={addressForm.notes}
              onChange={(e) => setAddressForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <div className="flex gap-3 justify-end mt-2">
              <Button variant="outline-light" size="sm" onClick={() => setAddressModalOpen(false)}>Batal</Button>
              <Button variant="primary" size="sm" onClick={handleSaveAddress} loading={addressSaving}>
                {editingAddress ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
