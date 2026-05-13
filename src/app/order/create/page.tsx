"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { LocationPicker } from "@/components/map/LocationPicker";
import type { PickedLocation } from "@/components/map/LocationPicker";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, calculateOrderPrice } from "@/lib/utils";
import api from "@/lib/api";
import type { PickupTimeSlot } from "@/types/order";

interface SavedAddress {
  id: string;
  label: string;
  address_line: string;
  latitude: number;
  longitude: number;
  notes?: string;
  is_default: boolean;
}

interface ServiceData {
  id: string;
  serviceName: string;
  pricePerUnit: number;
  unit: string;
  estimatedDurationDays: number;
  description?: string;
}

interface LaundryData {
  id: string;
  laundryName: string;
  services: ServiceData[];
}

const DELIVERY_FEE = 5000;

const TIME_SLOTS: { value: PickupTimeSlot; label: string; time: string }[] = [
  { value: "morning", label: "Pagi", time: "08:00 - 12:00" },
  { value: "afternoon", label: "Siang", time: "12:00 - 15:00" },
  { value: "evening", label: "Sore", time: "15:00 - 18:00" },
];

// --- Step Indicator ---
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: "Pilih Layanan" },
    { number: 2, label: "Alamat & Jadwal" },
    { number: 3, label: "Konfirmasi" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center gap-2">
            <div
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-[550] transition-colors",
                currentStep >= step.number
                  ? "bg-ink text-canvas-light"
                  : "bg-shade-30 text-shade-50",
              ].join(" ")}
              aria-current={currentStep === step.number ? "step" : undefined}
            >
              {currentStep > step.number ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : step.number}
            </div>
            <span className={["hidden sm:inline font-body text-[13px] font-[500]", currentStep >= step.number ? "text-ink" : "text-shade-50"].join(" ")}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={["w-8 sm:w-12 h-[2px] rounded-full transition-colors", currentStep > step.number ? "bg-ink" : "bg-shade-30"].join(" ")} aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function OrderCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const laundryId = searchParams.get("laundryId") ?? "";
  const serviceIdParam = searchParams.get("serviceId") ?? "";

  // Data dari API
  const [laundry, setLaundry] = useState<LaundryData | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceIdParam);
  const [estimatedWeight, setEstimatedWeight] = useState(5);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<{ address: string; lat: number; lng: number }>({ address: "", lat: 0, lng: 0 });
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState<PickupTimeSlot>("morning");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch laundry data dan saved addresses
  useEffect(() => {
    async function fetchData() {
      try {
        const [laundryRes, addressRes] = await Promise.all([
          api.get(`/laundry/${laundryId}`),
          api.get("/buyer/addresses"),
        ]);

        const laundryData = laundryRes.data.data;
        setLaundry({
          id: laundryData.id,
          laundryName: laundryData.laundryName ?? laundryData.name,
          services: laundryData.services ?? [],
        });

        const addresses: SavedAddress[] = addressRes.data.data ?? [];
        setSavedAddresses(addresses);

        // Set default address
        const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);

        // Set default service
        if (!selectedServiceId && laundryData.services?.length > 0) {
          setSelectedServiceId(laundryData.services[0].id);
        }
      } catch {
        addToast("Gagal memuat data. Silakan coba lagi.", "error");
      } finally {
        setLoadingData(false);
      }
    }

    if (laundryId) {
      fetchData();
    } else {
      setLoadingData(false);
    }
  }, [laundryId, addToast, selectedServiceId]);

  const selectedService = useMemo(
    () => laundry?.services.find((s) => s.id === selectedServiceId) ?? laundry?.services[0] ?? null,
    [laundry, selectedServiceId]
  );

  const estimatedPrice = useMemo(
    () => (selectedService ? selectedService.pricePerUnit * estimatedWeight : 0),
    [selectedService, estimatedWeight]
  );

  const totalPrice = useMemo(
    () => selectedService ? calculateOrderPrice(estimatedWeight, selectedService.pricePerUnit, DELIVERY_FEE) : 0,
    [estimatedWeight, selectedService]
  );

  const selectedAddress = useMemo(() => {
    if (showNewAddress) {
      return { label: "Alamat Baru", address_line: newAddress.address, latitude: newAddress.lat, longitude: newAddress.lng };
    }
    return savedAddresses.find((a) => a.id === selectedAddressId) ?? savedAddresses[0] ?? null;
  }, [selectedAddressId, showNewAddress, newAddress, savedAddresses]);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleNext = () => { if (currentStep < 3) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async () => {
    if (!selectedService || !selectedAddress || !laundry) return;
    setIsSubmitting(true);
    try {
      await api.post("/buyer/orders", {
        sellerId: laundry.id,
        serviceId: selectedService.id,
        pickupAddress: selectedAddress.address_line,
        pickupLatitude: selectedAddress.latitude,
        pickupLongitude: selectedAddress.longitude,
        pickupDate,
        pickupTimeSlot,
        estimatedWeight,
        buyerNotes: notes || undefined,
      });
      addToast("Pesanan berhasil dibuat! Menunggu penjemputan.", "success");
      router.push("/my-orders");
    } catch {
      addToast("Gagal membuat pesanan. Silakan coba lagi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep2Valid = useMemo(() => {
    const hasAddress = showNewAddress ? newAddress.address.trim().length > 0 : !!selectedAddressId;
    return hasAddress && pickupDate.length > 0;
  }, [showNewAddress, newAddress.address, selectedAddressId, pickupDate]);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-canvas-cream">
        <Navbar variant="light" />
        <main className="max-w-[640px] mx-auto px-xl py-xl">
          <div className="flex items-center justify-center py-12">
            <p className="font-body text-[14px] font-[420] text-shade-50">Memuat data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!laundry) {
    return (
      <div className="min-h-screen bg-canvas-cream">
        <Navbar variant="light" />
        <main className="max-w-[640px] mx-auto px-xl py-xl text-center py-12">
          <p className="text-shade-50 text-[14px]">Laundry tidak ditemukan.</p>
          <Button variant="primary" size="md" className="mt-4" onClick={() => router.push("/explore")}>
            Kembali ke Explore
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />

      <main className="max-w-[640px] mx-auto px-xl py-xl">
        <StepIndicator currentStep={currentStep} />

        {/* Step 1: Pilih Layanan */}
        {currentStep === 1 && (
          <div className="bg-canvas-light rounded-lg border border-hairline-light p-6">
            <h1 className="font-display text-[22px] font-[330] leading-[1.3] text-ink mb-6">Pilih Layanan</h1>

            <div className="mb-6">
              <p className="font-body text-[13px] font-[500] text-shade-50 mb-1">Laundry</p>
              <p className="font-body text-[16px] font-[550] text-ink">{laundry.laundryName}</p>
            </div>

            <div className="mb-6">
              <label className="font-body text-[14px] font-[500] text-ink mb-3 block">Layanan</label>
              <div className="flex flex-col gap-2">
                {laundry.services.map((service) => (
                  <label
                    key={service.id}
                    className={["flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors",
                      selectedServiceId === service.id ? "border-ink bg-canvas-cream" : "border-hairline-light hover:border-shade-30"].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" name="service" value={service.id}
                        checked={selectedServiceId === service.id}
                        onChange={() => setSelectedServiceId(service.id)}
                        className="w-4 h-4 accent-ink" />
                      <div>
                        <p className="font-body text-[14px] font-[500] text-ink">{service.serviceName}</p>
                        <p className="font-body text-[12px] font-[420] text-shade-50">Estimasi {service.estimatedDurationDays} hari</p>
                      </div>
                    </div>
                    <span className="font-body text-[14px] font-[550] text-ink">
                      {formatCurrency(service.pricePerUnit)}/{service.unit}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="weight-slider" className="font-body text-[14px] font-[500] text-ink mb-2 block">
                Estimasi Berat
              </label>
              <div className="flex items-center gap-4">
                <input id="weight-slider" type="range" min={1} max={20} step={0.5} value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-shade-30 rounded-full appearance-none cursor-pointer accent-ink" />
                <span className="font-body text-[16px] font-[550] text-ink min-w-[60px] text-right">{estimatedWeight} kg</span>
              </div>
            </div>

            <div className="bg-canvas-cream rounded-md p-4 border border-hairline-light">
              <div className="flex justify-between items-center">
                <span className="font-body text-[14px] font-[420] text-shade-60">Estimasi Harga</span>
                <span className="font-body text-[20px] font-[550] text-ink">{formatCurrency(estimatedPrice)}</span>
              </div>
              {selectedService && (
                <p className="font-body text-[12px] font-[420] text-shade-50 mt-1">
                  {formatCurrency(selectedService.pricePerUnit)}/{selectedService.unit} × {estimatedWeight} {selectedService.unit}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="md" onClick={handleNext} disabled={!selectedService}>
                Lanjutkan
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Alamat & Jadwal */}
        {currentStep === 2 && (
          <div className="bg-canvas-light rounded-lg border border-hairline-light p-6">
            <h1 className="font-display text-[22px] font-[330] leading-[1.3] text-ink mb-6">Alamat & Jadwal</h1>

            <div className="mb-6">
              <label className="font-body text-[14px] font-[500] text-ink mb-3 block">Alamat Penjemputan</label>
              <div className="flex flex-col gap-2">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={["flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                      !showNewAddress && selectedAddressId === addr.id ? "border-ink bg-canvas-cream" : "border-hairline-light hover:border-shade-30"].join(" ")}
                  >
                    <input type="radio" name="address" value={addr.id}
                      checked={!showNewAddress && selectedAddressId === addr.id}
                      onChange={() => { setSelectedAddressId(addr.id); setShowNewAddress(false); }}
                      className="w-4 h-4 accent-ink mt-0.5" />
                    <div>
                      <p className="font-body text-[14px] font-[550] text-ink">{addr.label}</p>
                      <p className="font-body text-[13px] font-[420] text-shade-60">{addr.address_line}</p>
                    </div>
                  </label>
                ))}

                {savedAddresses.length === 0 && !showNewAddress && (
                  <p className="text-[13px] text-shade-50 py-2">Belum ada alamat tersimpan.</p>
                )}

                <label className={["flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                  showNewAddress ? "border-ink bg-canvas-cream" : "border-hairline-light hover:border-shade-30"].join(" ")}>
                  <input type="radio" name="address" value="new" checked={showNewAddress}
                    onChange={() => setShowNewAddress(true)} className="w-4 h-4 accent-ink" />
                  <span className="font-body text-[14px] font-[500] text-ink">+ Tambah Alamat Baru</span>
                </label>
              </div>

              {showNewAddress && (
                <div className="mt-4">
                  <LocationPicker
                    onConfirm={(loc: PickedLocation) => setNewAddress({ address: loc.address, lat: loc.lat, lng: loc.lng })}
                    onCancel={() => setShowNewAddress(false)}
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="pickup-date" className="font-body text-[14px] font-[500] text-ink mb-2 block">
                Tanggal Penjemputan
              </label>
              <input id="pickup-date" type="date" min={todayStr} value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-canvas-light text-ink font-body text-[16px] font-[420] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink transition-colors" />
            </div>

            <div className="mb-6">
              <label className="font-body text-[14px] font-[500] text-ink mb-3 block">Waktu Penjemputan</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button key={slot.value} type="button" onClick={() => setPickupTimeSlot(slot.value)}
                    className={["flex flex-col items-center p-3 rounded-md border transition-colors cursor-pointer",
                      pickupTimeSlot === slot.value ? "border-ink bg-canvas-cream" : "border-hairline-light hover:border-shade-30"].join(" ")}
                    aria-pressed={pickupTimeSlot === slot.value}>
                    <span className="font-body text-[14px] font-[550] text-ink">{slot.label}</span>
                    <span className="font-body text-[11px] font-[420] text-shade-50">{slot.time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="order-notes" className="font-body text-[14px] font-[500] text-ink mb-2 block">
                Catatan <span className="text-shade-40">(opsional)</span>
              </label>
              <textarea id="order-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pakaian ada di depan pintu, tolong hubungi sebelum datang..." rows={3}
                className="w-full bg-canvas-light text-ink font-body text-[16px] font-[420] px-[12px] py-[10px] rounded-md border border-hairline-light outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink placeholder:text-shade-40 resize-none transition-colors" />
            </div>

            <div className="flex justify-between">
              <Button variant="outline-light" size="md" onClick={handleBack}>Kembali</Button>
              <Button variant="primary" size="md" onClick={handleNext} disabled={!isStep2Valid}>Lanjutkan</Button>
            </div>
          </div>
        )}

        {/* Step 3: Konfirmasi */}
        {currentStep === 3 && selectedService && selectedAddress && (
          <div className="bg-canvas-light rounded-lg border border-hairline-light p-6">
            <h1 className="font-display text-[22px] font-[330] leading-[1.3] text-ink mb-6">Konfirmasi Pesanan</h1>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-start pb-4 border-b border-hairline-light">
                <div>
                  <p className="font-body text-[13px] font-[420] text-shade-50">Laundry</p>
                  <p className="font-body text-[15px] font-[550] text-ink">{laundry.laundryName}</p>
                </div>
              </div>

              <div className="flex justify-between items-start pb-4 border-b border-hairline-light">
                <div>
                  <p className="font-body text-[13px] font-[420] text-shade-50">Layanan</p>
                  <p className="font-body text-[15px] font-[550] text-ink">{selectedService.serviceName}</p>
                </div>
                <span className="font-body text-[14px] font-[420] text-shade-60">
                  {formatCurrency(selectedService.pricePerUnit)}/{selectedService.unit}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-hairline-light">
                <p className="font-body text-[13px] font-[420] text-shade-50">Estimasi Berat</p>
                <p className="font-body text-[15px] font-[550] text-ink">{estimatedWeight} {selectedService.unit}</p>
              </div>

              <div className="pb-4 border-b border-hairline-light">
                <p className="font-body text-[13px] font-[420] text-shade-50 mb-1">Alamat Penjemputan</p>
                <p className="font-body text-[14px] font-[500] text-ink">{selectedAddress.address_line}</p>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-hairline-light">
                <div>
                  <p className="font-body text-[13px] font-[420] text-shade-50">Jadwal Penjemputan</p>
                  <p className="font-body text-[14px] font-[500] text-ink">
                    {pickupDate} • {TIME_SLOTS.find((s) => s.value === pickupTimeSlot)?.label} ({TIME_SLOTS.find((s) => s.value === pickupTimeSlot)?.time})
                  </p>
                </div>
              </div>

              {notes.trim() && (
                <div className="pb-4 border-b border-hairline-light">
                  <p className="font-body text-[13px] font-[420] text-shade-50 mb-1">Catatan</p>
                  <p className="font-body text-[14px] font-[420] text-ink">{notes}</p>
                </div>
              )}
            </div>

            <div className="bg-canvas-cream rounded-md p-4 border border-hairline-light mb-6">
              <h3 className="font-body text-[14px] font-[550] text-ink mb-3">Rincian Biaya</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-body text-[14px] font-[420] text-shade-60">Estimasi Harga Layanan</span>
                  <span className="font-body text-[14px] font-[500] text-ink">{formatCurrency(estimatedPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-[14px] font-[420] text-shade-60">Biaya Antar-Jemput</span>
                  <span className="font-body text-[14px] font-[500] text-ink">{formatCurrency(DELIVERY_FEE)}</span>
                </div>
                <div className="border-t border-hairline-light pt-2 mt-2 flex justify-between">
                  <span className="font-body text-[15px] font-[550] text-ink">Total Estimasi</span>
                  <span className="font-body text-[18px] font-[550] text-ink">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline-light" size="md" onClick={handleBack}>Kembali</Button>
              <Button variant="primary" size="md" onClick={handleSubmit} loading={isSubmitting}>
                Konfirmasi Pesanan
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OrderCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canvas-cream">
        <Navbar variant="light" />
        <main className="max-w-[640px] mx-auto px-xl py-xl flex items-center justify-center py-12">
          <p className="font-body text-[14px] font-[420] text-shade-50">Memuat...</p>
        </main>
      </div>
    }>
      <OrderCreateForm />
    </Suspense>
  );
}
