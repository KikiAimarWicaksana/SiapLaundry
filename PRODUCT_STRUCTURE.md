# SiapLaundry - Product Requirements Document (PRD)

## 1. Overview

**Product Name:** SiapLaundry  
**Product Type:** Marketplace Laundry dengan Pickup/Delivery Service  
**Target Users:** Pembeli (Customer), Penjual (Laundry Owner), Kurir (Driver)

### Vision Statement
Menjadi platform marketplace laundry pertama di Indonesia yang menghubungkan pelanggan dengan laundry lokal terdekat, dilengkapi sistem pickup dan delivery yang transparan dengan tracking real-time.

---

## 2. User Roles & Personas

### 2.1 Pembeli (Customer)
**Karakteristik:**
- Usia: 18-40 tahun (mahasiswa, pekerja kantoran, ibu rumah tangga)
- Butuh layanan laundry yang praktis tanpa harus antar-jemput sendiri
- Ingin transparansi harga dan kualitas layanan

**Needs:**
- Cari laundry terdekat dengan harga terbaik
- Pesan pickup langsung dari rumah/kos
- Tracking status cucian real-time
- Rating & review laundry sebelum pesan

---

### 2.2 Penjual (Laundry Owner)
**Karakteristik:**
- Pemilik UMKM laundry lokal
- Ingin memperluas jangkauan pelanggan
- Butuh sistem order management yang jelas

**Needs:**
- Dashboard untuk kelola order masuk
- Update status cucian (terima → cuci → selesai)
- Kelola katalog layanan & harga
- Lihat rating dan ulasan dari pelanggan

---

### 2.3 Kurir (Driver)
**Karakteristik:**
- Driver freelance atau internal laundry
- Bertanggung jawab jemput & antar cucian
- Butuh informasi alamat dan order yang jelas

**Needs:**
- Notifikasi order pickup/delivery baru
- Informasi detail alamat & kontak pembeli
- Update status "sedang dijemput" atau "sedang diantar"
- Chat dengan pembeli untuk koordinasi

---

## 3. Website Structure & Pages

### 3.1 Landing Page (Homepage)
**URL:** `/`  
**Reference Design:** https://situkang.com/

**Sections:**
1. **Hero Section**
   - Headline: "Laundry Dekat, Jemput Antar, Harga Transparan"
   - CTA: "Cari Laundry Terdekat"
   - Visual: Ilustrasi laundry + kurir

2. **Cara Kerja (How It Works)**
   - Step 1: Pilih Laundry Terdekat
   - Step 2: Pesan & Kurir Jemput
   - Step 3: Tracking Status Cucian
   - Step 4: Cucian Diantar Kembali

3. **Fitur Unggulan**
   - Marketplace Multi-Laundry
   - Real-time Tracking
   - Rating & Review Transparan
   - Harga Jelas per Layanan

4. **Testimoni**
   - Carousel review dari pembeli

5. **CTA Section**
   - "Mulai Cari Laundry" (Button → Login/Register)

6. **Footer**
   - Link: Tentang Kami, FAQ, Kontak, Kebijakan Privasi

---

### 3.2 Authentication Pages

#### 3.2.1 Login Page
**URL:** `/login`

**Fields:**
- Email/No. Telepon
- Password
- Checkbox: "Ingat Saya"
- Link: "Lupa Password?"

**Options:**
- Tombol: "Masuk sebagai Pembeli"
- Tombol: "Masuk sebagai Penjual"
- Tombol: "Masuk sebagai Kurir"

**Footer:**
- "Belum punya akun? Daftar sekarang"

---

#### 3.2.2 Register Page
**URL:** `/register`

**Pilihan Role:**
1. Daftar sebagai Pembeli
2. Daftar sebagai Penjual (Laundry Owner)
3. Daftar sebagai Kurir

**Form Fields (Pembeli):**
- Nama Lengkap
- Email
- No. Telepon
- Password
- Konfirmasi Password
- Alamat Lengkap (+ Pin Lokasi di Maps)

**Form Fields (Penjual):**
- Nama Laundry
- Nama Pemilik
- Email Bisnis
- No. Telepon
- Password
- Alamat Laundry (+ Pin Lokasi di Maps)
- Foto Laundry (optional)
- Jam Operasional

**Form Fields (Kurir):**
- Nama Lengkap
- No. Telepon
- Email
- Password
- Foto KTP
- Foto SIM
- Jenis Kendaraan (Motor/Mobil)
- Plat Nomor

---

### 3.3 Pembeli Dashboard

#### 3.3.1 Explore Laundry (Katalog)
**URL:** `/explore`

**Features:**
- **Search Bar:** Cari berdasarkan nama/lokasi
- **Filter:**
  - Jarak (1km, 3km, 5km, 10km+)
  - Rating (4+, 3+, dst)
  - Harga (Termurah → Termahal)
  - Layanan (Cuci Kering, Cuci Setrika, Dry Clean)
  
**Laundry Card Display:**
- Foto Laundry
- Nama Laundry
- Rating ⭐ (4.5/5 · 128 ulasan)
- Jarak (1.2 km dari lokasi kamu)
- Harga mulai dari: "Rp 5.000/kg"
- Badge: "Buka Hari Ini" / "Tutup"
- Tombol: "Lihat Detail"

---

#### 3.3.2 Detail Laundry
**URL:** `/laundry/:id`

**Sections:**
1. **Header**
   - Foto Laundry (carousel 3-5 foto)
   - Nama Laundry
   - Rating & Total Ulasan
   - Jarak dari lokasi user
   - Status: Buka/Tutup
   - Jam Operasional

2. **Katalog Layanan & Harga**
   Table format:
   | Layanan | Harga | Estimasi Waktu | Action |
   |---------|-------|----------------|--------|
   | Cuci Kering | Rp 5.000/kg | 1-2 hari | [+] |
   | Cuci Setrika | Rp 7.000/kg | 2-3 hari | [+] |
   | Setrika Saja | Rp 4.000/kg | 1 hari | [+] |
   | Dry Clean | Rp 15.000/pcs | 3-5 hari | [+] |

3. **Alamat & Lokasi**
   - Embed Google Maps
   - Alamat lengkap

4. **Rating & Ulasan**
   - Summary: 4.5/5 (128 ulasan)
   - Filter: Terbaru, Rating Tertinggi, Rating Terendah
   - Review Card:
     - Nama User (Avatar)
     - Rating (⭐⭐⭐⭐⭐)
     - Tanggal
     - Komentar
     - Foto (jika ada)

5. **CTA Button:**
   - "Pesan Sekarang" → Redirect ke form order

---

#### 3.3.3 Order Form (Checkout)
**URL:** `/order/create`

**Form Fields:**
1. **Pilihan Layanan** (dari katalog yang dipilih)
   - Nama Layanan
   - Estimasi Berat (slider: 1kg - 20kg)
   - Subtotal

2. **Alamat Pickup**
   - Gunakan alamat profil / Tambah alamat baru
   - Detail alamat (Patokan, nomor rumah, dll)

3. **Jadwal Pickup**
   - Tanggal Pickup
   - Waktu Pickup (Pagi 08-12, Siang 12-15, Sore 15-18)

4. **Catatan untuk Laundry** (optional)
   - Textarea

5. **Ringkasan Order**
   - Laundry: [Nama]
   - Layanan: [Nama Layanan]
   - Estimasi Harga: Rp XX.XXX (final setelah ditimbang)
   - Biaya Antar-Jemput: Rp 5.000
   - **Total Estimasi:** Rp XX.XXX

6. **Tombol:**
   - "Konfirmasi Pesanan"

---

#### 3.3.4 Pesanan Saya (My Orders)
**URL:** `/my-orders`

**Tab Navigation:**
- Berlangsung
- Selesai
- Dibatalkan

**Order Card (Berlangsung):**
- Foto Laundry
- Nama Laundry
- No. Order: #SL20260513001
- Status Badge: 
  - 🟡 Menunggu Pickup
  - 🔵 Sedang Dijemput Kurir
  - 🟢 Sedang Dicuci
  - 🟣 Siap Diantar
  - 🟠 Sedang Diantar
  - ✅ Selesai

**Detail Status Timeline (dalam card):**
```
✅ Pesanan Dibuat - 13 Mei 2026, 10:00
🔵 Kurir Menjemput - 13 Mei, 11:30 (Nama Kurir: Budi | Plat: B 1234 XX)
🟢 Tiba di Laundry - 13 Mei, 12:00
⏳ Sedang Dicuci - Estimasi selesai: 15 Mei
```

**Action Buttons:**
- "Chat dengan Laundry"
- "Chat dengan Kurir" (jika sedang pickup/delivery)
- "Lacak Kurir" (jika sedang dijemput/diantar)
- "Lihat Detail Order"

---

#### 3.3.5 Detail Order
**URL:** `/order/:orderId`

**Sections:**
1. **Status Timeline** (visual progress bar)
2. **Informasi Pesanan**
   - No. Order
   - Tanggal Pemesanan
   - Laundry
   - Layanan
   - Berat Aktual (setelah ditimbang)
   - Harga Final

3. **Info Kurir (Pickup)**
   - Nama Kurir
   - No. Telepon
   - Plat Kendaraan
   - Foto Profil
   - Tombol: "Chat Kurir"

4. **Info Kurir (Delivery)**
   - (sama seperti pickup, bisa berbeda kurir)

5. **Rincian Pembayaran**
   - Biaya Laundry: Rp XX.XXX
   - Biaya Antar-Jemput: Rp XX.XXX
   - **Total:** Rp XX.XXX
   - Status Pembayaran: Lunas/Belum Lunas

6. **Setelah Selesai:**
   - Tombol: "Beri Rating & Ulasan"

---

#### 3.3.6 Beri Rating & Ulasan
**URL:** `/order/:orderId/review`

**Form:**
1. **Rating Laundry** (1-5 bintang)
2. **Ulasan Laundry** (textarea)
3. **Rating Kurir** (1-5 bintang)
4. **Foto (optional)** - upload hasil cucian
5. **Tombol:** "Kirim Ulasan"

---

#### 3.3.7 Chat (In-App Messaging)
**URL:** `/chat`

**Layout:**
- Sidebar: List kontak (Laundry / Kurir)
- Main Panel: Chat window
  - Nama kontak
  - Status online/offline
  - Text input
  - Send button

---

#### 3.3.8 Profil Pembeli
**URL:** `/profile`

**Sections:**
- Foto Profil
- Nama
- Email
- No. Telepon
- Alamat-alamat Tersimpan
- Edit Profil
- Ubah Password
- Logout

---

### 3.4 Penjual Dashboard

#### 3.4.1 Dashboard Overview
**URL:** `/seller/dashboard`

**Widgets:**
- Total Order Bulan Ini
- Total Pendapatan
- Rating Rata-rata
- Order Baru (perlu konfirmasi)

**Recent Orders Table:**
- No. Order
- Nama Pembeli
- Layanan
- Status
- Aksi (Lihat Detail)

---

#### 3.4.2 Order Management
**URL:** `/seller/orders`

**Tab:**
- Order Baru
- Sedang Proses
- Siap Diantar
- Selesai

**Order Card:**
- No. Order
- Nama Pembeli
- Layanan
- Status Saat Ini
- Tombol Update Status:
  - "Konfirmasi Order" (Order Baru)
  - "Mulai Cuci" (Setelah ditimbang)
  - "Selesai Dicuci - Siap Diantar"

---

#### 3.4.3 Detail Order (Seller View)
**URL:** `/seller/orders/:orderId`

**Sections:**
1. Info Pembeli
   - Nama
   - No. Telepon
   - Alamat Pickup

2. Detail Order
   - Layanan
   - Estimasi Berat (dari pembeli)
   - **Input Berat Aktual** (setelah ditimbang)
   - Harga Final (auto-calculate)

3. Status Timeline

4. Tombol Update Status

5. Chat dengan Pembeli

---

#### 3.4.4 Katalog Layanan
**URL:** `/seller/services`

**Features:**
- Tabel Layanan & Harga
- Tombol: "Tambah Layanan Baru"
- Edit / Hapus Layanan

**Form Tambah Layanan:**
- Nama Layanan
- Harga per kg / per pcs
- Estimasi Waktu Pengerjaan
- Deskripsi (optional)

---

#### 3.4.5 Ulasan & Rating
**URL:** `/seller/reviews`

**Display:**
- Rating Keseluruhan
- Total Ulasan
- List Ulasan dari Pembeli
- Filter: Terbaru, Rating Tertinggi, Rating Terendah

---

#### 3.4.6 Profil Laundry
**URL:** `/seller/profile`

**Edit:**
- Nama Laundry
- Alamat
- Jam Operasional
- Foto Laundry
- No. Telepon
- Email

---

### 3.5 Kurir Dashboard

#### 3.5.1 Dashboard Overview
**URL:** `/driver/dashboard`

**Status Toggle:**
- Online / Offline (available untuk order)

**Widgets:**
- Order Hari Ini
- Total Pengantaran Bulan Ini
- Pendapatan Bulan Ini

---

#### 3.5.2 Order Pickup/Delivery
**URL:** `/driver/orders`

**Tab:**
- Order Pickup (Jemput)
- Order Delivery (Antar)

**Order Card:**
- No. Order
- Nama Pembeli
- Alamat
- Jarak dari lokasi kurir
- Waktu Pickup/Delivery
- Tombol: "Ambil Order" / "Mulai Pickup" / "Mulai Delivery"

---

#### 3.5.3 Detail Order (Driver View)
**URL:** `/driver/orders/:orderId`

**Sections:**
1. Info Pembeli
   - Nama
   - No. Telepon
   - Tombol: "Chat Pembeli"
   - Tombol: "Telepon Pembeli"

2. Alamat Pickup/Delivery
   - Alamat Lengkap
   - Pin di Google Maps
   - Tombol: "Buka di Maps"

3. Status Action:
   - "Berangkat Jemput"
   - "Sampai di Lokasi"
   - "Pakaian Diambil - Kirim ke Laundry"
   - (atau untuk delivery)
   - "Berangkat Antar"
   - "Sampai di Lokasi"
   - "Pakaian Diterima Pembeli"

---

#### 3.5.4 Profil Kurir
**URL:** `/driver/profile`

**Sections:**
- Foto Profil
- Nama
- No. Telepon
- Jenis Kendaraan
- Plat Nomor
- Rating Rata-rata (dari pembeli)
- Edit Profil

---

## 4. User Flow Diagrams

### 4.1 Pembeli Flow (Happy Path)

```
1. User buka Homepage
   ↓
2. Klik "Cari Laundry Terdekat"
   ↓
3. Register/Login sebagai Pembeli
   ↓
4. Browse Katalog Laundry (/explore)
   ↓
5. Filter berdasarkan jarak/rating/harga
   ↓
6. Klik "Lihat Detail" pada laundry pilihan
   ↓
7. Lihat layanan, harga, rating, ulasan
   ↓
8. Klik "Pesan Sekarang"
   ↓
9. Isi form order (layanan, estimasi berat, alamat, jadwal pickup)
   ↓
10. Konfirmasi Pesanan
   ↓
11. Order masuk ke sistem → Status: "Menunggu Pickup"
   ↓
12. Kurir menerima order → Status: "Sedang Dijemput"
   ↓
13. Pembeli bisa chat kurir & tracking real-time
   ↓
14. Kurir sampai → ambil pakaian → Status: "Dalam Perjalanan ke Laundry"
   ↓
15. Pakaian sampai laundry → ditimbang → Status: "Sedang Dicuci"
   ↓
16. Penjual update status → Status: "Siap Diantar"
   ↓
17. Kurir delivery → Status: "Sedang Diantar"
   ↓
18. Pakaian sampai ke pembeli → Status: "Selesai"
   ↓
19. Pembeli beri rating & ulasan
```

---

### 4.2 Penjual Flow

```
1. Owner laundry daftar sebagai Penjual
   ↓
2. Isi data laundry (nama, alamat, foto, jam operasional)
   ↓
3. Setup Katalog Layanan & Harga
   ↓
4. Order baru masuk dari pembeli → Notifikasi
   ↓
5. Penjual konfirmasi order
   ↓
6. Kurir jemput pakaian dari pembeli → bawa ke laundry
   ↓
7. Penjual timbang pakaian → input berat aktual
   ↓
8. Harga final ter-update otomatis
   ↓
9. Penjual update status: "Mulai Cuci"
   ↓
10. Selesai cuci → update status: "Siap Diantar"
   ↓
11. Kurir delivery → pakaian sampai ke pembeli
   ↓
12. Order selesai → Penjual terima pembayaran
   ↓
13. Penjual bisa lihat rating & ulasan dari pembeli
```

---

### 4.3 Kurir Flow

```
1. Kurir daftar & verifikasi (KTP, SIM, kendaraan)
   ↓
2. Login & set status "Online"
   ↓
3. Order pickup baru muncul → Notifikasi
   ↓
4. Kurir terima order (atau sistem auto-assign)
   ↓
5. Lihat detail alamat pembeli
   ↓
6. Update status: "Berangkat Jemput"
   ↓
7. Bisa chat pembeli jika ada kendala lokasi
   ↓
8. Sampai lokasi → ambil pakaian → foto bukti pickup (optional)
   ↓
9. Update status: "Pakaian Diambil"
   ↓
10. Antar ke laundry
   ↓
11. (Nanti setelah cucian selesai) Order delivery muncul
   ↓
12. Kurir ambil cucian dari laundry
   ↓
13. Update status: "Berangkat Antar"
   ↓
14. Antar ke pembeli
   ↓
15. Update status: "Pakaian Diterima Pembeli"
   ↓
16. Order selesai → Kurir terima fee pengantaran
```

---

## 5. Database Schema

### 5.1 Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller', 'driver') NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_photo VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 5.2 Buyers Table
```sql
CREATE TABLE buyers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  addresses JSON, -- Array of addresses dengan format { address_line, latitude, longitude, is_default }
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 5.3 Sellers (Laundries) Table
```sql
CREATE TABLE sellers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  laundry_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  business_email VARCHAR(255),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  photos JSON, -- Array of photo URLs
  operating_hours JSON, -- { "monday": "08:00-20:00", "tuesday": "08:00-20:00", ... }
  is_open BOOLEAN DEFAULT TRUE,
  average_rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 5.4 Drivers Table
```sql
CREATE TABLE drivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  ktp_number VARCHAR(20) NOT NULL,
  ktp_photo VARCHAR(255) NOT NULL,
  sim_number VARCHAR(20) NOT NULL,
  sim_photo VARCHAR(255) NOT NULL,
  vehicle_type ENUM('motorcycle', 'car') NOT NULL,
  vehicle_plate VARCHAR(20) NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  average_rating DECIMAL(2,1) DEFAULT 0,
  total_deliveries INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 5.5 Services Table
```sql
CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  unit ENUM('kg', 'pcs') DEFAULT 'kg',
  estimated_duration_days INT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);
```

---

### 5.6 Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL, -- Format: SL20260513001
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  service_id INT NOT NULL,
  
  -- Pickup Info
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time_slot ENUM('morning', 'afternoon', 'evening') NOT NULL,
  pickup_driver_id INT,
  
  -- Delivery Info
  delivery_driver_id INT,
  delivery_address TEXT,
  
  -- Order Details
  estimated_weight DECIMAL(5,2), -- dari pembeli
  actual_weight DECIMAL(5,2), -- setelah ditimbang oleh penjual
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  delivery_fee DECIMAL(10,2) DEFAULT 5000,
  total_price DECIMAL(10,2),
  
  -- Status
  status ENUM(
    'pending_pickup',
    'driver_on_way_pickup',
    'picked_up',
    'at_laundry',
    'washing',
    'ready_for_delivery',
    'driver_on_way_delivery',
    'delivered',
    'completed',
    'cancelled'
  ) DEFAULT 'pending_pickup',
  
  -- Notes
  buyer_notes TEXT,
  
  -- Payment
  payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  payment_method VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  picked_up_at TIMESTAMP NULL,
  arrived_at_laundry_at TIMESTAMP NULL,
  washing_started_at TIMESTAMP NULL,
  washing_completed_at TIMESTAMP NULL,
  delivery_started_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  FOREIGN KEY (buyer_id) REFERENCES buyers(id),
  FOREIGN KEY (seller_id) REFERENCES sellers(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (pickup_driver_id) REFERENCES drivers(id),
  FOREIGN KEY (delivery_driver_id) REFERENCES drivers(id)
);
```

---

### 5.7 Order Status History Table
```sql
CREATE TABLE order_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by INT, -- user_id yang update status
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

---

### 5.8 Reviews Table
```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT UNIQUE NOT NULL,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  
  -- Rating Laundry
  laundry_rating INT CHECK (laundry_rating >= 1 AND laundry_rating <= 5),
  laundry_review TEXT,
  
  -- Rating Kurir
  driver_id INT,
  driver_rating INT CHECK (driver_rating >= 1 AND driver_rating <= 5),
  
  -- Photos
  photos JSON, -- Array of photo URLs
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id),
  FOREIGN KEY (seller_id) REFERENCES sellers(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
```

---

### 5.9 Chats Table
```sql
CREATE TABLE chats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  sender_id INT NOT NULL, -- user_id
  receiver_id INT NOT NULL, -- user_id
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

---

### 5.10 Notifications Table
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order', 'chat', 'review', 'system') NOT NULL,
  related_id INT, -- order_id, chat_id, dll
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 6. Key Features & Business Logic

### 6.1 Order Status Workflow

**Status Flow:**
```
1. pending_pickup (Order dibuat, menunggu kurir)
   ↓
2. driver_on_way_pickup (Kurir berangkat jemput)
   ↓
3. picked_up (Pakaian sudah diambil kurir)
   ↓
4. at_laundry (Pakaian sampai di laundry)
   ↓
5. washing (Sedang dicuci - penjual update)
   ↓
6. ready_for_delivery (Cucian selesai, siap diantar)
   ↓
7. driver_on_way_delivery (Kurir berangkat antar)
   ↓
8. delivered (Pakaian sampai ke pembeli)
   ↓
9. completed (Pembeli konfirmasi & beri rating)
```

**Cancellation:**
- Pembeli bisa cancel sebelum status `picked_up`
- Setelah `picked_up`, harus koordinasi dengan penjual

---

### 6.2 Pricing Calculation

**Formula:**
```
Estimated Price = Service Price x Estimated Weight
Final Price = Service Price x Actual Weight (after ditimbang)
Total Price = Final Price + Delivery Fee
```

**Delivery Fee:**
- Flat: Rp 5.000 per order
- (Future: bisa dynamic berdasarkan jarak)

---

### 6.3 Rating Calculation

**Seller Average Rating:**
```sql
UPDATE sellers 
SET average_rating = (SELECT AVG(laundry_rating) FROM reviews WHERE seller_id = ?)
WHERE id = ?;
```

**Driver Average Rating:**
```sql
UPDATE drivers 
SET average_rating = (SELECT AVG(driver_rating) FROM reviews WHERE driver_id = ?)
WHERE id = ?;
```

---

### 6.4 Real-time Features

**1. Order Tracking:**
- WebSocket connection untuk update status real-time
- Pembeli bisa lihat pergerakan kurir di map (via GPS)

**2. Chat:**
- Real-time messaging menggunakan Socket.io atau Firebase
- Notifikasi push saat ada pesan baru

**3. Notifications:**
- Push notification untuk:
  - Order baru (untuk penjual & kurir)
  - Status update (untuk pembeli)
  - Chat baru
  - Review baru (untuk penjual & kurir)

---

## 7. Technical Requirements

### 7.1 Frontend Stack (Rekomendasi)
- **Framework:** React.js / Next.js
- **UI Library:** Tailwind CSS / Material-UI
- **Maps:** Google Maps API / Mapbox
- **Real-time:** Socket.io client
- **State Management:** Redux / Zustand
- **Form Handling:** React Hook Form

---

### 7.2 Backend Stack (Rekomendasi)
- **Framework:** Node.js + Express / Laravel / Django
- **Database:** MySQL / PostgreSQL
- **Authentication:** JWT / OAuth
- **Real-time:** Socket.io server
- **File Upload:** AWS S3 / Cloudinary
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Email:** SendGrid / Mailgun

---

### 7.3 Third-party Integrations
1. **Google Maps API** - Untuk maps, geocoding, distance calculation
2. **Firebase** - Push notifications & real-time chat
3. **Payment Gateway** - Midtrans / Xendit (untuk future payment)
4. **SMS Gateway** - Twilio / Vonage (untuk OTP verification)

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Page load time < 3 detik
- Real-time chat latency < 1 detik
- API response time < 500ms

### 8.2 Security
- HTTPS untuk semua endpoint
- Password hashing dengan bcrypt
- JWT token expiry & refresh mechanism
- Input validation & sanitization
- SQL injection prevention
- XSS protection

### 8.3 Scalability
- Database indexing pada kolom yang sering di-query
- Caching untuk data laundry catalog
- Load balancing untuk handle traffic tinggi

---

## 9. Future Enhancements (V2)

1. **Payment Integration**
   - Integrasi payment gateway (Midtrans, GoPay, OVO, dll)
   - E-wallet & QRIS

2. **Promo & Voucher System**
   - Voucher diskon untuk pembeli baru
   - Loyalty points

3. **Advanced Analytics**
   - Dashboard analytics untuk penjual
   - Insights: peak hours, popular services, dll

4. **Multi-language Support**
   - Bahasa Indonesia & English

5. **Driver Mobile App**
   - Native app untuk kurir (Android & iOS)

6. **Subscription Plans**
   - Paket berlangganan laundry bulanan untuk pembeli tetap

---

## 10. Success Metrics (KPIs)

1. **User Acquisition:**
   - Total registered users (breakdown: buyer, seller, driver)
   - Monthly Active Users (MAU)

2. **Engagement:**
   - Order completion rate
   - Average order value
   - Repeat order rate

3. **Quality:**
   - Average laundry rating
   - Average driver rating
   - Order cancellation rate

4. **Business:**
   - Total GMV (Gross Merchandise Value)
   - Commission per order
   - Customer retention rate

---

## Appendix

### Status Keterangan Pakaian untuk Pembeli (Summary)

| Status | Keterangan untuk Pembeli | Icon |
|--------|--------------------------|------|
| `pending_pickup` | Menunggu Pickup - Order kamu sedang dicari kurir | 🟡 |
| `driver_on_way_pickup` | Kurir Sedang Menuju Lokasi Kamu | 🔵 |
| `picked_up` | Pakaian Sudah Diambil Kurir | 🚗 |
| `at_laundry` | Pakaian Sampai di Laundry | 🏪 |
| `washing` | Sedang Dicuci - Estimasi selesai: [tanggal] | 🧺 |
| `ready_for_delivery` | Cucian Siap Diantar | ✅ |
| `driver_on_way_delivery` | Kurir Sedang Mengantarkan Cucianmu | 🛵 |
| `delivered` | Cucian Sudah Sampai - Mohon konfirmasi penerimaan | 📦 |
| `completed` | Order Selesai - Terima kasih! | ✅ |

---

**Document Version:** 1.0  
**Last Updated:** 13 Mei 2026  
**Prepared by:** Product Manager - SiapLaundry Team
