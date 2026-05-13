"use client";

import React, { useState } from "react";
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
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "Password baru harus berbeda dari password lama",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

const addressSchema = z.object({
  label: z.string().min(1, "Label alamat wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  notes: z.string().optional(),
});

// --- Types ---

interface Address {
  id: string;
  label: string;
  address: string;
  notes?: string;
  isDefault: boolean;
}

// --- Mock Data ---

const mockAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Rumah",
    address: "Jl. Merdeka No. 10, Kelurahan Sukamaju, Kec. Cibeunying, Bandung 40123",
    notes: "Dekat masjid Al-Ikhlas",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Kantor",
    address: "Jl. Asia Afrika No. 45, Gedung Sate Lt. 3, Bandung 40112",
    notes: "",
    isDefault: false,
  },
  {
    id: "addr-3",
    label: "Kos",
    address: "Jl. Ganesha No. 12, Kos Putri Melati, Bandung 40132",
    isDefault: false,
  },
];

// --- Component ---

export default function ProfilePage() {
  const { addToast } = useToast();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Mock user data fallback
  const profileData = user || {
    id: "user-1",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    phone: "081234567890",
    role: "buyer" as const,
    profilePhoto: null,
    isVerified: true,
  };

  // State
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Edit Profile form state
  const [profileForm, setProfileForm] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Change Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Address form state
  const [addressForm, setAddressForm] = useState({
    label: "",
    address: "",
    notes: "",
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // --- Handlers ---

  function handleEditProfile() {
    setProfileForm({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    });
    setProfileErrors({});
    setEditProfileOpen(true);
  }

  function handleSaveProfile() {
    const result = editProfileSchema.safeParse(profileForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0];
        if (path) errors[String(path)] = issue.message;
      }
      setProfileErrors(errors);
      return;
    }
    setProfileErrors({});
    setEditProfileOpen(false);
    addToast("Profil berhasil diperbarui", "success");
  }

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
        const path = issue.path[0];
        if (path) errors[String(path)] = issue.message;
      }
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({});
    setChangePasswordOpen(false);
    addToast("Password berhasil diubah", "success");
  }

  function handleAddAddress() {
    setEditingAddress(null);
    setAddressForm({ label: "", address: "", notes: "" });
    setAddressErrors({});
    setAddressModalOpen(true);
  }

  function handleEditAddress(addr: Address) {
    setEditingAddress(addr);
    setAddressForm({ label: addr.label, address: addr.address, notes: addr.notes || "" });
    setAddressErrors({});
    setAddressModalOpen(true);
  }

  function handleSaveAddress() {
    const result = addressSchema.safeParse(addressForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0];
        if (path) errors[String(path)] = issue.message;
      }
      setAddressErrors(errors);
      return;
    }
    setAddressErrors({});

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddress.id
            ? { ...a, label: addressForm.label, address: addressForm.address, notes: addressForm.notes }
            : a
        )
      );
      addToast("Alamat berhasil diperbarui", "success");
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        label: addressForm.label,
        address: addressForm.address,
        notes: addressForm.notes,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
      addToast("Alamat berhasil ditambahkan", "success");
    }
    setAddressModalOpen(false);
  }

  function handleDeleteAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    addToast("Alamat berhasil dihapus", "success");
  }

  function handleSetDefault(id: string) {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    addToast("Alamat default berhasil diubah", "success");
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
        <h1 className="font-display text-[28px] font-[500] leading-[1.3] tracking-[0.3px] text-ink mb-8 [font-feature-settings:'ss03']">
          Profil Saya
        </h1>

        {/* Profile Header */}
        <Card variant="default" className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar
              src={profileData.profilePhoto}
              name={profileData.name}
              size="lg"
            />
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

          {addresses.length === 0 ? (
            <Card variant="default">
              <p className="text-shade-50 text-center py-4 font-body text-[14px] [font-feature-settings:'ss03']">
                Belum ada alamat tersimpan. Tambahkan alamat pertama Anda.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
                <Card key={addr.id} variant="default" className="!p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-body text-[14px] font-[550] text-ink [font-feature-settings:'ss03']">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-pill bg-aloe-10 text-ink text-[11px] font-[500] [font-feature-settings:'ss03']">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-shade-60 font-body leading-[1.5] [font-feature-settings:'ss03']">
                        {addr.address}
                      </p>
                      {addr.notes && (
                        <p className="text-[12px] text-shade-40 font-body mt-1 [font-feature-settings:'ss03']">
                          Catatan: {addr.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap shrink-0">
                      {!addr.isDefault && (
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={() => handleSetDefault(addr.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => handleEditAddress(addr)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-8">
          <Button variant="outline-light" size="md" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit Profil"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nama Lengkap"
            value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
            error={profileErrors.name}
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
            error={profileErrors.email}
          />
          <Input
            label="No. Telepon"
            type="tel"
            value={profileForm.phone}
            onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
            error={profileErrors.phone}
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline-light" size="sm" onClick={() => setEditProfileOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveProfile}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        title="Ubah Password"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Password Lama"
            type="password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))}
            error={passwordErrors.oldPassword}
          />
          <Input
            label="Password Baru"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            error={passwordErrors.newPassword}
          />
          <Input
            label="Konfirmasi Password Baru"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            error={passwordErrors.confirmPassword}
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline-light" size="sm" onClick={() => setChangePasswordOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSavePassword}>
              Ubah Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Address Modal (Add/Edit) */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddress ? "Edit Alamat" : "Tambah Alamat"}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Label Alamat"
            placeholder="Contoh: Rumah, Kantor, Kos"
            value={addressForm.label}
            onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
            error={addressErrors.label}
          />
          <Input
            label="Alamat Lengkap"
            placeholder="Jl. Contoh No. 1, Kota"
            value={addressForm.address}
            onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))}
            error={addressErrors.address}
          />
          <Input
            label="Catatan (opsional)"
            placeholder="Patokan atau catatan tambahan"
            value={addressForm.notes}
            onChange={(e) => setAddressForm((f) => ({ ...f, notes: e.target.value }))}
            error={addressErrors.notes}
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline-light" size="sm" onClick={() => setAddressModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAddress}>
              {editingAddress ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
