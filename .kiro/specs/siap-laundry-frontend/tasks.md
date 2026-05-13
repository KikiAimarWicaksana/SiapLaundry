# Implementation Plan: SiapLaundry Frontend

## Overview

Implementasi frontend SiapLaundry menggunakan Next.js 14 (App Router) dengan TypeScript. Pendekatan incremental: mulai dari fondasi (design system, layout, auth), lalu fitur per role (Pembeli → Penjual → Kurir), diakhiri dengan integrasi real-time (Socket.io, Google Maps).

Bahasa implementasi: **TypeScript** (Next.js App Router)

---

## Tasks

- [x] 1. Setup proyek dan fondasi teknis
  - Inisialisasi proyek Next.js 14 dengan TypeScript dan App Router
  - Konfigurasi Tailwind CSS dengan design tokens dari DESIGN.md (warna, tipografi, spacing, border-radius)
  - Setup `globals.css` dengan `font-feature-settings: "ss03"` secara global dan import font Neue Haas Grotesk Display + Inter Variable
  - Konfigurasi `tailwind.config.ts` dengan semua custom tokens: `canvas-night`, `canvas-light`, `canvas-cream`, `aloe-10`, `pistachio-10`, `shade-*`, `hairline-*`, `rounded-pill`, dll
  - Install dan konfigurasi dependensi: Zustand, React Hook Form, Zod, Axios, date-fns, Socket.io-client, @react-google-maps/api, fast-check, Vitest, @testing-library/react
  - Buat struktur folder sesuai design document: `src/app`, `src/components`, `src/stores`, `src/hooks`, `src/lib`, `src/types`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Implementasi TypeScript types dan design system primitif
  - [x] 2.1 Buat semua TypeScript type definitions di `src/types/`
    - `user.ts`: `UserRole`, `AuthUser`, `AuthState`
    - `order.ts`: `OrderStatus`, `PickupTimeSlot`, `Order`, `OrderStatusEvent`, `DriverInfo`
    - `laundry.ts`: `Service`, `Seller`
    - `chat.ts`: `Message`, `ChatContact`, `Notification`
    - `api.ts`: generic API response types
    - _Requirements: 2.2, 5.1, 7.7, 8.1_

  - [x] 2.2 Implementasi komponen Button
    - Buat `src/components/ui/Button.tsx` dengan varian: `primary`, `outline-dark`, `outline-light`, `aloe`
    - Semua varian menggunakan `border-radius: 9999px` (pill shape) — tidak ada varian rounded-rectangle
    - Implementasi state: default, hover, pressed (`shade-70`), disabled, loading (spinner)
    - _Requirements: 1.3_

  - [x]* 2.3 Tulis unit test untuk komponen Button
    - Test semua varian dan state (disabled, loading)
    - Verifikasi semua varian menggunakan pill shape
    - _Requirements: 1.3_

  - [x] 2.4 Implementasi komponen UI primitif lainnya
    - `Card.tsx`: varian `default`, `pricing`, `pricing-featured`, `cinematic`, `pistachio`
    - `Badge.tsx` dan `PillTag.tsx`: varian `mint` dan `shade`
    - `Input.tsx`: text input dengan styling `rounded-md`, border `hairline-light`
    - `StarRating.tsx`: mode readonly dan interaktif (1-5 bintang)
    - `Avatar.tsx`, `Modal.tsx`, `Tabs.tsx`, `Skeleton.tsx`, `Toast.tsx`
    - _Requirements: 1.3, 1.7, 1.8_

  - [x]* 2.5 Tulis unit test untuk komponen UI primitif
    - Test StarRating: interaksi klik dan nilai yang dihasilkan
    - Test Tabs: navigasi antar tab
    - Test Skeleton: muncul saat loading prop true
    - _Requirements: 1.8_

- [x] 3. Implementasi Zustand stores dan utilitas
  - [x] 3.1 Implementasi `authStore.ts`
    - State: `user`, `token`, `isAuthenticated`
    - Actions: `login`, `logout`, `refreshToken`, `setUser`
    - Persist token di httpOnly cookie (via API call), bukan localStorage
    - _Requirements: 2.8, 2.10_

  - [x] 3.2 Implementasi `orderStore.ts`, `chatStore.ts`, `notificationStore.ts`
    - `orderStore.ts`: state orders, actions fetch/update order
    - `chatStore.ts`: state messages per contact, actions send/receive
    - `notificationStore.ts`: state notifications, unread count
    - _Requirements: 8.4, 10.3, 17.2_

  - [x]* 3.3 Tulis property test untuk serialisasi state auth
    - **Properti 3: Serialisasi State Auth Round-Trip**
    - Untuk semua objek `AuthUser` yang valid, serialize ke JSON dan deserialize kembali harus menghasilkan objek yang ekuivalen
    - **Validates: Requirements 2.8**
    - _Requirements: 2.8_

  - [x] 3.4 Implementasi utilitas di `src/lib/`
    - `api.ts`: Axios instance dengan base URL, interceptor untuk Authorization header, interceptor 401 untuk auto-refresh token
    - `utils.ts`: `formatCurrency(amount)`, `formatDate(date)`, `formatOrderNumber(date, seq)`, `getStatusLabel(status)`, `getStatusColor(status)`
    - `socket.ts`: Socket.io client setup dengan auto-reconnect
    - _Requirements: 2.5, 2.6, 17.4_

  - [x]* 3.5 Tulis property test untuk kalkulasi harga
    - **Properti 1: Kalkulasi Harga Order Selalu Konsisten**
    - Untuk semua berat (> 0) dan harga per unit (> 0) yang valid, `calculateOrderPrice(weight, pricePerUnit, deliveryFee)` harus selalu mengembalikan `weight * pricePerUnit + deliveryFee`
    - **Validates: Requirements 7.2, 7.10, 12.6**
    - _Requirements: 7.2, 7.10, 12.6_

  - [x]* 3.6 Tulis property test untuk validasi whitespace
    - **Properti 5: Validasi Input Whitespace Konsisten**
    - Untuk semua string yang hanya berisi whitespace (spasi, tab, newline, kombinasi) dengan panjang berapa pun, `validateRequired(str)` harus selalu mengembalikan false
    - **Validates: Requirements 3.7**
    - _Requirements: 3.7_

- [x] 4. Checkpoint — Pastikan semua test lulus
  - Pastikan semua test lulus, tanyakan kepada user jika ada pertanyaan.

- [x] 5. Implementasi layout sistem dan navigasi
  - [x] 5.1 Implementasi Root Layout (`src/app/layout.tsx`)
    - Setup font loading (Neue Haas Grotesk Display + Inter Variable)
    - Wrap dengan Zustand providers dan Toast provider
    - _Requirements: 1.4, 1.5, 1.6_

  - [x] 5.2 Implementasi komponen Navbar
    - `Navbar.tsx` dengan dua mode: dark (untuk public pages) dan light (untuk dashboard)
    - Dark mode: logo putih, tombol `outline-on-dark`
    - Light mode: logo hitam, avatar user, ikon notifikasi dengan badge unread
    - _Requirements: 1.1, 1.2, 17.3_

  - [x] 5.3 Implementasi komponen Footer
    - `Footer.tsx` dengan dua mode: dark dan light
    - Dark footer: 4 kolom link dengan muted tones
    - _Requirements: 4.6_

  - [x] 5.4 Implementasi layout Penjual dengan sidebar
    - `src/app/seller/layout.tsx` dengan `SellerSidebar.tsx`
    - Sidebar: Dashboard, Orders, Services, Reviews, Profile
    - Badge notifikasi pada item Orders jika ada order baru
    - _Requirements: 11.5, 11.2_

  - [x] 5.5 Implementasi layout Kurir dengan bottom nav mobile
    - `src/app/driver/layout.tsx` dengan `DriverBottomNav.tsx`
    - Bottom nav pada viewport < 768px: Dashboard, Orders, Map, Profile
    - _Requirements: 14.6_

- [x] 6. Implementasi middleware autentikasi dan routing
  - [x] 6.1 Buat `src/middleware.ts` untuk route protection
    - Validasi JWT token dari cookie untuk semua rute protected
    - Redirect ke `/login` jika tidak terautentikasi
    - Redirect ke dashboard sesuai role jika role tidak sesuai rute
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x]* 6.2 Tulis property test untuk role-based access control
    - **Properti 6: Role-Based Access Control Konsisten**
    - Untuk semua kombinasi role (`buyer`, `seller`, `driver`) dan semua rute yang tidak sesuai role tersebut, middleware harus selalu redirect ke dashboard yang benar
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 6.3 Implementasi halaman Login (`/login`)
    - Form: Email/Telepon, Password, checkbox "Ingat Saya", link "Lupa Password?"
    - 3 tombol role selection dengan visual active state
    - Integrasi dengan `authStore.login()`
    - Error handling: tampilkan pesan error dari API
    - _Requirements: 2.7, 2.8, 2.9_

  - [x] 6.4 Implementasi halaman Register (`/register`)
    - Step 1: pilih role (3 card besar)
    - Step 2: form berbeda per role (Pembeli/Penjual/Kurir)
    - Integrasi LocationPicker untuk field alamat
    - Validasi Zod schema per role
    - File upload untuk foto KTP/SIM/laundry
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x]* 6.5 Tulis property test untuk validasi file upload
    - **Properti 7: Validasi Ukuran dan Tipe File Upload**
    - Untuk semua file dengan ukuran > 5MB atau tipe bukan image/jpeg atau image/png, `validateFileUpload(file)` harus selalu mengembalikan error
    - **Validates: Requirements 3.8, 3.9**
    - _Requirements: 3.8, 3.9_

- [x] 7. Checkpoint — Pastikan semua test lulus
  - Pastikan semua test lulus, tanyakan kepada user jika ada pertanyaan.

- [x] 8. Implementasi halaman Landing Page
  - [x] 8.1 Implementasi `HeroSection.tsx`
    - Headline `display-xxl` (96px, weight 330) pada canvas hitam
    - Sub-headline `body-lg` dengan warna `shade-40`
    - Tombol CTA `button-outline-on-dark`
    - Responsif: headline turun ke ~56px pada mobile
    - _Requirements: 4.1_

  - [x] 8.2 Implementasi section Cara Kerja, Fitur, Testimoni, CTA
    - `HowItWorksSection.tsx`: 4 step cards menggunakan `card-feature-cinematic`
    - `FeaturesSection.tsx`: grid 2x2 feature cards
    - `TestimonialsSection.tsx`: carousel review
    - `CTASection.tsx`: tombol mengarah ke `/login` atau `/explore`
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.7_

  - [x] 8.3 Wire landing page di `src/app/page.tsx`
    - Susun semua section dalam urutan yang benar
    - Tambahkan Navbar dark dan Footer dark
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 9. Implementasi fitur Eksplorasi Laundry (Pembeli)
  - [x] 9.1 Implementasi komponen LaundryCard dan LaundryGrid
    - `LaundryCard.tsx`: foto, nama, rating, jarak, harga mulai, badge buka/tutup
    - `LaundryGrid.tsx`: grid responsif (3-up desktop, 2-up tablet, 1-up mobile)
    - _Requirements: 5.1_

  - [x] 9.2 Implementasi komponen LaundryFilter
    - Filter: jarak (radio), rating (checkbox), harga (range slider), layanan (checkbox multi-select)
    - Tombol "Terapkan Filter" dan "Reset Filter"
    - _Requirements: 5.5, 5.6, 5.7, 5.8_

  - [x] 9.3 Implementasi halaman Explore (`/explore`)
    - Search bar dengan debounce 300ms
    - Integrasi `Location_Service` untuk geolokasi
    - Fallback input manual jika geolokasi ditolak
    - Integrasi `Filter_Engine` dengan LaundryFilter
    - Empty state saat tidak ada hasil
    - _Requirements: 5.2, 5.3, 5.4, 5.11_

  - [x]* 9.4 Tulis property test untuk Filter Engine
    - **Properti 2: Filter Laundry Menghasilkan Subset Valid**
    - Untuk semua kombinasi filter valid dan dataset laundry valid, setiap item dalam hasil harus memenuhi semua kriteria filter dan hasil harus subset dari dataset asli
    - **Validates: Requirements 5.4, 5.5, 5.6, 5.7, 5.8, 5.9**
    - _Requirements: 5.9_

- [x] 10. Implementasi halaman Detail Laundry dan Order
  - [x] 10.1 Implementasi halaman Detail Laundry (`/laundry/:id`)
    - Foto carousel dengan navigasi prev/next
    - Tabel layanan dengan tombol "Pilih"
    - Google Maps embed untuk lokasi laundry
    - Section ulasan dengan filter dan ReviewCard
    - Sticky CTA "Pesan Sekarang"
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 10.2 Implementasi komponen LocationPicker
    - `LocationPicker.tsx`: Google Maps dengan marker yang bisa di-drag
    - Reverse geocoding otomatis saat marker dipindah
    - _Requirements: 3.5, 7.4_

  - [x] 10.3 Implementasi halaman Buat Order (`/order/create`)
    - Multi-step form (3 langkah): Pilih Layanan → Alamat & Jadwal → Konfirmasi
    - Slider estimasi berat dengan kalkulasi harga real-time
    - Pilihan alamat tersimpan + tambah baru dengan LocationPicker
    - Date picker dan time slot selector
    - Ringkasan order di langkah konfirmasi
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [x] 11. Implementasi manajemen order Pembeli
  - [x] 11.1 Implementasi komponen OrderTimeline dan OrderStatusBadge
    - `OrderTimeline.tsx`: progress bar vertikal dengan semua status dan timestamp
    - `OrderStatusBadge.tsx`: badge berwarna untuk setiap status dengan label Indonesia
    - _Requirements: 8.2, 8.6_

  - [x] 11.2 Implementasi halaman My Orders (`/my-orders`)
    - Tab: Berlangsung, Selesai, Dibatalkan
    - OrderCard dengan timeline ringkas dan action buttons
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 11.3 Implementasi halaman Detail Order (`/order/:orderId`)
    - OrderTimeline lengkap
    - Info kurir (avatar, nama, plat)
    - Rincian pembayaran
    - Tombol "Lacak Kurir" (jika status driver_on_way_*)
    - Tombol "Beri Rating & Ulasan" (jika status completed)
    - _Requirements: 8.6, 8.7, 8.8, 8.9_

  - [x]* 11.4 Tulis property test untuk urutan status order
    - **Properti 4: Status Order Hanya Maju (Tidak Mundur)**
    - Untuk semua urutan transisi status yang valid, setiap status baru harus selalu berada di posisi lebih tinggi dalam urutan yang ditentukan
    - **Validates: Requirements 8.10**
    - _Requirements: 8.10_

  - [x] 11.5 Implementasi halaman Review (`/order/:orderId/review`)
    - StarRating interaktif untuk laundry dan kurir
    - Textarea ulasan
    - Upload foto dengan drag & drop
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 12. Checkpoint — Pastikan semua test lulus
  - Pastikan semua test lulus, tanyakan kepada user jika ada pertanyaan.

- [x] 13. Implementasi fitur Chat real-time
  - [x] 13.1 Implementasi custom hook `useSocket.ts` dan `useChat.ts`
    - `useSocket.ts`: koneksi Socket.io dengan auto-reconnect, join room user
    - `useChat.ts`: subscribe ke event `chat:new_message`, send message, mark as read
    - _Requirements: 10.5, 10.6, 10.7_

  - [x] 13.2 Implementasi komponen Chat
    - `ChatSidebar.tsx`: list kontak dengan unread badge
    - `ChatWindow.tsx`: riwayat pesan dengan bubble style
    - `MessageBubble.tsx`: bubble kanan (sent, bg `aloe-10`) dan kiri (received, bg `canvas-light`)
    - `ChatInput.tsx`: text input + send button
    - _Requirements: 10.1, 10.2, 10.4_

  - [x] 13.3 Implementasi halaman Chat (`/chat`)
    - Layout split: sidebar kiri + chat window kanan
    - Integrasi `useChat` hook
    - Optimistic update: pesan muncul di UI sebelum konfirmasi server
    - Banner koneksi terputus
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [x]* 13.4 Tulis unit test untuk optimistic update chat
    - Test bahwa pesan muncul di UI sebelum konfirmasi server
    - Test banner koneksi terputus muncul saat socket disconnect
    - _Requirements: 10.9_

- [x] 14. Implementasi real-time tracking order
  - [x] 14.1 Implementasi custom hook `useOrderTracking.ts`
    - Subscribe ke event `order:status_updated` dan `driver:location_updated`
    - Update `orderStore` secara real-time
    - _Requirements: 8.4, 17.2_

  - [x] 14.2 Implementasi komponen DriverTracker
    - `DriverTracker.tsx`: Google Maps dengan marker posisi kurir yang bergerak real-time
    - Integrasi dengan `useOrderTracking` hook
    - _Requirements: 8.7_

  - [x] 14.3 Implementasi `Notification_Manager`
    - Subscribe ke event Socket.io untuk notifikasi
    - Tampilkan toast notifikasi saat status order berubah
    - Update badge unread di navbar
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

- [x] 15. Implementasi dashboard dan fitur Penjual
  - [x] 15.1 Implementasi halaman Dashboard Penjual (`/seller/dashboard`)
    - 4 widget: Total Order, Pendapatan, Rating, Order Baru
    - Tabel recent orders
    - Badge merah pada widget Order Baru jika ada order pending
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6_

  - [x] 15.2 Implementasi halaman Order Management Penjual (`/seller/orders`)
    - 4 tab: Order Baru, Sedang Proses, Siap Diantar, Selesai
    - OrderCard dengan tombol update status per tab
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 15.3 Implementasi halaman Detail Order Penjual (`/seller/orders/:orderId`)
    - Info pembeli, detail order, input berat aktual
    - Kalkulasi harga final otomatis saat berat aktual diisi
    - Tombol update status dengan validasi berat aktual
    - _Requirements: 12.5, 12.6, 12.7, 12.8_

  - [x] 15.4 Implementasi halaman Katalog Layanan (`/seller/services`)
    - Tabel layanan dengan aksi Edit/Hapus
    - Form tambah/edit layanan dengan validasi Zod
    - Konfirmasi dialog sebelum hapus
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x]* 15.5 Tulis property test untuk validasi harga layanan
    - Untuk semua nilai harga ≤ 0, `validateServicePrice(price)` harus selalu mengembalikan error
    - Untuk semua nilai harga > 0, `validateServicePrice(price)` harus selalu mengembalikan valid
    - **Validates: Requirements 13.5**
    - _Requirements: 13.5_

  - [x] 15.6 Implementasi halaman Ulasan Penjual (`/seller/reviews`)
    - Summary rating keseluruhan
    - Daftar ulasan dengan filter
    - _Requirements: 6.4_

  - [x] 15.7 Implementasi halaman Profil Penjual (`/seller/profile`)
    - Form edit profil laundry: nama, alamat, jam operasional, foto, telepon
    - _Requirements: 16.4_

- [x] 16. Implementasi dashboard dan fitur Kurir
  - [x] 16.1 Implementasi halaman Dashboard Kurir (`/driver/dashboard`)
    - Toggle Online/Offline yang menonjol
    - 3 widget: Order Hari Ini, Total Pengantaran, Pendapatan
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 16.2 Implementasi halaman Order Kurir (`/driver/orders`)
    - 2 tab: Pickup dan Delivery
    - OrderCard dengan jarak dari lokasi kurir
    - Tombol aksi: Ambil Order, Mulai Pickup, Mulai Delivery
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.6_

  - [x] 16.3 Implementasi halaman Detail Order Kurir (`/driver/orders/:orderId`)
    - Info pembeli dengan tombol Chat dan Telepon
    - Alamat dengan tombol "Buka di Maps"
    - Tombol update status sesuai tahap (pickup/delivery)
    - _Requirements: 15.5, 15.7, 15.8, 15.9_

  - [x] 16.4 Implementasi halaman Profil Kurir (`/driver/profile`)
    - Info profil: nama, telepon, kendaraan, plat, rating
    - Form edit profil
    - _Requirements: 16.1, 16.2_

- [x] 17. Implementasi halaman Profil Pembeli
  - Halaman `/profile` dengan info profil dan daftar alamat tersimpan
  - Form edit profil dan ubah password
  - Manajemen alamat: tambah, edit, hapus, set default
  - _Requirements: 16.1, 16.2, 16.3, 16.5, 16.6, 16.7_

- [x] 18. Checkpoint akhir — Pastikan semua test lulus
  - Pastikan semua test lulus, tanyakan kepada user jika ada pertanyaan.

---

## Notes

- Task yang ditandai `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan persyaratan spesifik untuk keterlacakan
- Checkpoint memastikan validasi incremental
- Property tests memvalidasi properti kebenaran universal
- Unit tests memvalidasi contoh spesifik dan edge cases
- Semua komponen harus memenuhi standar aksesibilitas WCAG 2.1 AA (label ARIA, keyboard navigation, color contrast)

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2", "3"] },
    { "wave": 2, "tasks": ["4", "5", "6"] },
    { "wave": 3, "tasks": ["7", "8", "9", "10"] },
    { "wave": 4, "tasks": ["11", "12", "13", "14"] },
    { "wave": 5, "tasks": ["15", "16", "17", "18"] }
  ]
}
```
