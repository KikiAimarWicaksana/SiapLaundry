"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { LocationPicker } from "@/components/maps/LocationPicker";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, calculateOrderPrice } from "@/lib/utils";
import type { Service } from "@/types/laundry";
import type { PickupTimeSlot } from "@/types/order";

// --- Mock Data ---
interface MockLaundry {
  id: string;
  laundryName: string;
  services: Service[];
}

const MOCK_LAUNDRY: MockLaundry = {
  id: "1",
  laundryName: "Laundry Bersih Cemerlang",
  services: [
    {
      id: "s1",
      sellerId: "1",
      serviceName: "Cuci Kering",
      pricePerUnit: 7000,
      unit: "kg",
      estimatedDurationDays: 2,
      description: "Cuci kering tanpa setrika",
      isActive: true,
    },
    {
      id: "s2",
      sellerId: "1",
      serviceName: "Cuci Setrika",
      pricePerUnit: 10000,
      unit: "kg",
      estimatedDurationDays: 3,
      description: "Cuci lengkap dengan setrika rapi",
      isActive: true,
    },
    {
      id: "s3",
      sellerId: "1",
      serviceName: "Setrika Saja",
      pricePerUnit: 5000,
      unit: "kg",
      estimatedDurationDays: 1,
      description: "Setrika pakaian yang sudah bersih",
      isActive: true,
    },
  ],
};

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
}

const MOCK_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "addr1",
    label: "Rumah",
    address: "Jl. Merdeka No. 45, Bandung, Jawa Barat 40115",
    latitude: -6.9175,
    longitude: 107.6191,
  },
  {
    id: "addr2",
    label: "Kantor",
    address: "Jl. Asia Afrika No. 12, Bandung, Jawa Barat 40111",
    latitude: -6.9219,
    longitude: 107.607,
  },
];

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
                "w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-[550] [font-feature-settings:'ss03'] transition-colors",
                currentStep >= step.number
                  ? "bg-ink text-canvas-light"
                  : "bg-shade-30 text-shade-50",
              ].join(" ")}
              aria-current={currentStep === step.number ? "step" : undefined}
            >
              {currentStep > step.number ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={[
                "hidden sm:inline font-body text-[13px] font-[500] [font-feature-settings:'ss03']",
                currentStep >= step.number ? "text-ink" : "text-shade-50",
              ].join(" ")}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={[
                "w-8 sm:w-12 h-[2px] rounded-full transition-colors",
                currentStep > step.number ? "bg-ink" : "bg-shade-30",
              ].join(" ")}
              aria-hidden="true"
            />
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

  // Read URL params
  const serviceIdParam = searchParams.get("serviceId") || MOCK_LAUNDRY.services[0].id;

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceIdParam);
  const [estimatedWeight, setEstimatedWeight] = useState(5);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(MOCK_SAVED_ADDRESSES[0].id);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: "", lat: 0, lng: 0 });
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState<PickupTimeSlot>("morning");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived data
  const selectedService = useMemo(
    () => MOCK_LAUNDRY.services.find((s) => s.id === selectedServiceId) || MOCK_LAUNDRY.services[0],
    [selectedServiceId]
  );

  const estimatedPrice = useMemo(
    () => selectedService.pricePerUnit * estimatedWeight,
    [selectedService, estimatedWeight]
  );

  const totalPrice = useMemo(
    () => calculateOrderPrice(estimatedWeight, selectedService.pricePerUnit, DELIVERY_FEE),
    [estimatedWeight, selectedService]
  );

  const selectedAddress = useMemo(() => {
    if (showNewAddress) {
      return { label: "Alamat Baru", address: newAddress.address, latitude: newAddress.lat, longitude: newAddress.lng };
    }
    return MOCK_SAVED_ADDRESSES.find((a) => a.id === selectedAddressId) || MOCK_SAVED_ADDRESSES[0];
  }, [selectedAddressId, showNewAddress, newAddress]);

  // Today's date for min date picker
  const todayStr = new Date().toISOString().split("T")[0];

  // Navigation
  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Submit order
  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    addToast("Pesanan berhasil dibuat! Menunggu penjemputan.", "success");
    router.push("/my-orders");
  };

  // Validate step 2
  const isStep2Valid = useMemo(() => {
    const hasAddress = showNewAddress ? newAddress.address.trim().length > 0 : !!selectedAddressId;
    const hasDate = pickupDate.length > 0;
    return hasAddress && hasDate;
  }, [showNewAddress, newAddress.address, selectedAddressId, pickupDate]);

  return (
    <div className="min-h-screen bg-canvas-cream">
      <Navbar variant="light" />

      <main className="max-w-[640px] mx-auto px-xl py-xl">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step 1: Pilih Layanan */}
        {currentStep === 1 && (
          <div className="bg-canvas-light rounded-lg border border-hairline-light p-6">
            <h1 className="font-display text-[22px] font-[330] leading-[1.3] text-ink [font-feature-settings:'ss03'] mb-6">
              Pilih Layanan
            </h1>

            {/* Laundry Name */}
            <div className="mb-6">
              <p className="font-body text-[13px] font-[500] text-shade-50 [font-feature-settings:'ss03'] mb-1">
                Laundry
              </p>
              <p className="font-body text-[16px] font-[550] text-ink [font-feature-settings:'ss03']">
                {MOCK_LAUNDRY.laundryName}
              </p>
            </div>

            {/* Service Selection */}
            <div className="mb-6">
              <label className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03'] mb-3 block">
                Layanan
              </label>
              <div className="flex flex-col gap-2">
                {MOCK_LAUNDRY.services.map((service) => (
                  <label
                    key={service.id}
                    className={[
                      "flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors",
                      selectedServiceId === service.id
                        ? "border-ink bg-canvas-cream"
                        : "border-hairline-light hover:border-shade-30",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={selectedServiceId === service.id}
                        onChange={() => setSelectedServiceId(service.id)}
                        className="w-4 h-4 accent-ink"
                      />
                      <div>
                        <p className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                          {service.serviceName}
                        </p>
                        <p className="font-body text-[12px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                          Estimasi {service.estimatedDurationDays} hari
                        </p>
                      </div>
                    </div>
                    <span className="font-body text-[14px] font-[550] text-ink [font-feature-settings:'ss03']">
                      {formatCurrency(service.pricePerUnit)}/{service.unit}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weight Slider */}
            <div className="mb-6">
              <label
                htmlFor="weight-slider"
                className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03'] mb-2 block"
              >
                Estimasi Berat
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="weight-slider"
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-shade-30 rounded-full appearance-none cursor-pointer accent-ink"
                  aria-valuemin={1}
                  aria-valuemax={20}
                  aria-valuenow={estimatedWeight}
                  aria-valuetext={`${estimatedWeight} kilogram`}
                />
                <span className="font-body text-[16px] font-[550] text-ink [font-feature-settings:'ss03'] min-w-[60px] text-right">
                  {estimatedWeight} kg
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-body text-[11px] font-[420] text-shade-40 [font-feature-settings:'ss03']">
                  1 kg
                </span>
                <span className="font-body text-[11px] font-[420] text-shade-40 [font-feature-settings:'ss03']">
                  20 kg
                </span>
              </div>
            </div>

            {/* Real-time Price Calculation */}
            <div className="bg-canvas-cream rounded-md p-4 border border-hairline-light">
              <div className="flex justify-between items-center">
                <span className="font-body text-[14px] font-[420] text-shade-60 [font-feature-settings:'ss03']">
                  Estimasi Harga
                </span>
                <span className="font-body text-[20px] font-[550] text-ink [font-feature-settings:'ss03']">
                  {formatCurrency(estimatedPrice)}
                </span>
              </div>
              <p className="font-body text-[12px] font-[420] text-shade-50 [font-feature-settings:'ss03'] mt-1">
                {formatCurrency(selectedService.pricePerUnit)}/{selectedService.unit} × {estimatedWeight} {selectedService.unit}
              </p>
            </div>

            {/* Next Button */}
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="md" onClick={handleNext}>
                Lanjutkan
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Alamat & Jadwal */}
        {currentStep === 2 && (
          <div className="bg-canvas-light rounded-lg border border-hairline-light p-6">
            <h1 className="font-display text-[22px] font-[330] leading-[1.3] text-ink [font-feature-settings:'ss03'] mb-6">
              Alamat & Jadwal
            </h1>

            {/* Saved Addresses */}
            <div className="mb-6">
              <label className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03'] mb-3 block">
                Alamat Penjemputan
              </label>
              <div className="flex flex-col gap-2">
                {MOCK_SAVED_ADDRESSES.map((addr) => (
                  <label
                    key={addr.id}
                    className={[
                      "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                      !showNewAddress && selectedAddressId === addr.id
                        ? "border-ink bg-canvas-cream"
                        : "border-hairline-light hover:border-shade-30",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={!showNewAddress && selectedAddressId === addr.id}
                      onChange={() => {
                        setSelectedAddressId(addr.id);
                        setShowNewAddress(false);
                      }}
                      className="w-4 h-4 accent-ink mt-0.5"
                    />
                    <div>
                      <p className="font-body text-[14px] font-[550] text-ink [font-feature-settings:'ss03']">
                        {addr.label}
                      </p>
                      <p className="font-body text-[13px] font-[420] text-shade-60 [font-feature-settings:'ss03']">
                        {addr.address}
                      </p>
                    </div>
                  </label>
                ))}

                {/* Add New Address Option */}
                <label
                  className={[
                    "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                    showNewAddress
                      ? "border-ink bg-canvas-cream"
                      : "border-hairline-light hover:border-shade-30",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="address"
                    value="new"
                    checked={showNewAddress}
                    onChange={() => setShowNewAddress(true)}
                    className="w-4 h-4 accent-ink"
                  />
                  <span className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                    + Tambah Alamat Baru
                  </span>
                </label>
              </div>

              {/* LocationPicker for new address */}
              {showNewAddress && (
                <div className="mt-4 pl-7">
                  <LocationPicker
                    onLocationSelect={(lat, lng, address) =>
                      setNewAddress({ lat, lng, address })
                    }
                    label="Alamat Baru"
                  />
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div className="mb-6">
              <label
                htmlFor="pickup-date"
                className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03'] mb-2 block"
              >
                Tanggal Penjemputan
              </label>
              <input
                id="pickup-date"
                type="date"
                min={todayStr}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className={[
                  "w-full bg-canvas-light text-ink",
                  "font-body text-[16px] font-[420] leading-[1.5]",
                  "[font-feature-settings:'ss03']",
                  "px-[12px] py-[10px]",
                  "rounded-md",
                  "border border-hairline-light",
                  "outline-none",
                  "focus:ring-2 focus:ring-ink/20 focus:border-ink",
                  "transition-colors duration-150",
                ].join(" ")}
              />
            </div>

            {/* Time Slot Selector */}
            <div className="mb-6">
              <label className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03'] mb-3 block">
                Waktu Penjemputan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => setPickupTimeSlot(slot.value)}
                    className={[
                      "flex flex-col items-center p-3 rounded-md border transition-colors cursor-pointer",
                      pickupTimeSlot === slot.value
                        ? "border-ink bg-canvas-cream"
                        : "border-hairline-light hover:border-shade-30",
                    ].join(" ")}
                    aria-pressed={pickupTimeSlot === slot.value}
                  >
                    <span className="font-body text-[14px] font-[550] text-ink [font-feature-settings:'ss03']">
                      {slot.label}
                    </span>
                    <span className="font-body text-[11px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                      {slot.time}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label
                htmlFor="order-notes"
                className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03'] mb-2 block"
              >
                Catatan <span className="text-shade-40">(opsional)</span>
              </label>
              <textarea
                id="order-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pakaian ada di depan pintu, tolong hubungi sebelum datang..."
                rows={3}
                className={[
                  "w-full bg-canvas-light text-ink",
                  "font-body text-[16px] font-[420] leading-[1.5]",
                  "[font-feature-settings:'ss03']",
                  "px-[12px] py-[10px]",
                  "rounded-md",
                  "border border-hairline-light",
                  "outline-none",
                  "focus:ring-2 focus:ring-ink/20 focus:border-ink",
                  "placeholder:text-shade-40",
                  "transition-colors duration-150",
                  "resize-none",
                ].join(" ")}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button variant="outline-light" size="md" onClick={handleBack}>
                Kembali
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={!isStep2Valid}
              >
                Lanjutkan
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Konfirmasi */}
        {currentStep === 3 && (
          <div className="bg-canvas-light rounded-lg border border-hairline-light p-6">
            <h1 className="font-display text-[22px] font-[330] leading-[1.3] text-ink [font-feature-settings:'ss03'] mb-6">
              Konfirmasi Pesanan
            </h1>

            {/* Order Summary */}
            <div className="space-y-4 mb-6">
              {/* Laundry & Service */}
              <div className="flex justify-between items-start pb-4 border-b border-hairline-light">
                <div>
                  <p className="font-body text-[13px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                    Laundry
                  </p>
                  <p className="font-body text-[15px] font-[550] text-ink [font-feature-settings:'ss03']">
                    {MOCK_LAUNDRY.laundryName}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start pb-4 border-b border-hairline-light">
                <div>
                  <p className="font-body text-[13px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                    Layanan
                  </p>
                  <p className="font-body text-[15px] font-[550] text-ink [font-feature-settings:'ss03']">
                    {selectedService.serviceName}
                  </p>
                </div>
                <span className="font-body text-[14px] font-[420] text-shade-60 [font-feature-settings:'ss03']">
                  {formatCurrency(selectedService.pricePerUnit)}/{selectedService.unit}
                </span>
              </div>

              {/* Weight */}
              <div className="flex justify-between items-center pb-4 border-b border-hairline-light">
                <p className="font-body text-[13px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                  Estimasi Berat
                </p>
                <p className="font-body text-[15px] font-[550] text-ink [font-feature-settings:'ss03']">
                  {estimatedWeight} {selectedService.unit}
                </p>
              </div>

              {/* Address */}
              <div className="pb-4 border-b border-hairline-light">
                <p className="font-body text-[13px] font-[420] text-shade-50 [font-feature-settings:'ss03'] mb-1">
                  Alamat Penjemputan
                </p>
                <p className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                  {selectedAddress.address}
                </p>
              </div>

              {/* Schedule */}
              <div className="flex justify-between items-center pb-4 border-b border-hairline-light">
                <div>
                  <p className="font-body text-[13px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                    Jadwal Penjemputan
                  </p>
                  <p className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                    {pickupDate} • {TIME_SLOTS.find((s) => s.value === pickupTimeSlot)?.label} ({TIME_SLOTS.find((s) => s.value === pickupTimeSlot)?.time})
                  </p>
                </div>
              </div>

              {/* Notes */}
              {notes.trim() && (
                <div className="pb-4 border-b border-hairline-light">
                  <p className="font-body text-[13px] font-[420] text-shade-50 [font-feature-settings:'ss03'] mb-1">
                    Catatan
                  </p>
                  <p className="font-body text-[14px] font-[420] text-ink [font-feature-settings:'ss03']">
                    {notes}
                  </p>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-canvas-cream rounded-md p-4 border border-hairline-light mb-6">
              <h3 className="font-body text-[14px] font-[550] text-ink [font-feature-settings:'ss03'] mb-3">
                Rincian Biaya
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-body text-[14px] font-[420] text-shade-60 [font-feature-settings:'ss03']">
                    Estimasi Harga Layanan
                  </span>
                  <span className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                    {formatCurrency(estimatedPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-[14px] font-[420] text-shade-60 [font-feature-settings:'ss03']">
                    Biaya Antar-Jemput
                  </span>
                  <span className="font-body text-[14px] font-[500] text-ink [font-feature-settings:'ss03']">
                    {formatCurrency(DELIVERY_FEE)}
                  </span>
                </div>
                <div className="border-t border-hairline-light pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-body text-[15px] font-[550] text-ink [font-feature-settings:'ss03']">
                      Total Estimasi
                    </span>
                    <span className="font-body text-[18px] font-[550] text-ink [font-feature-settings:'ss03']">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button variant="outline-light" size="md" onClick={handleBack}>
                Kembali
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                loading={isSubmitting}
              >
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas-cream">
          <Navbar variant="light" />
          <main className="max-w-[640px] mx-auto px-xl py-xl">
            <div className="flex items-center justify-center py-12">
              <p className="font-body text-[14px] font-[420] text-shade-50 [font-feature-settings:'ss03']">
                Memuat...
              </p>
            </div>
          </main>
        </div>
      }
    >
      <OrderCreateForm />
    </Suspense>
  );
}
