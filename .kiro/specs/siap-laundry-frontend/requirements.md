# Requirements Document

## Introduction

SiapLaundry adalah platform marketplace laundry berbasis web yang memungkinkan Pembeli memesan layanan laundry dengan pickup dan delivery, Penjual (Laundry Owner) mengelola order dan katalog layanan, serta Kurir (Driver) mengelola pengambilan dan pengantaran cucian. Frontend dibangun dengan Next.js (App Router), TypeScript, Tailwind CSS, Zustand, React Hook Form, Google Maps API, dan Socket.io client. Desain mengikuti sistem dua kanvas: Dark Track untuk halaman publik/marketing dan Light Track untuk halaman dashboard/transaksi.

---

## Glossary

- **Sistem**: Aplikasi web frontend SiapLaundry secara keseluruhan
- **Pembeli**: Pengguna dengan role `buyer` yang memesan layanan laundry
- **Penjual**: Pengguna dengan role `seller` yang memiliki dan mengelola usaha laundry
- **Kurir**: Pengguna dengan role `driver` yang melakukan pickup dan delivery cucian
- **Auth_Manager**: Modul autentikasi yang mengelola JWT token, sesi, dan routing berbasis role
- **Order_Manager**: Modul yang mengelola state dan alur order dari pembuatan hingga penyelesaian
- **Chat_Manager**: Modul real-time messaging berbasis Socket.io
- **Notification_Manager**: Modul yang mengelola notifikasi real-time dan push notification
- **Location_Service**: Modul yang mengelola integrasi Google Maps API dan geolokasi
- **Filter_Engine**: Modul yang memproses dan menerapkan filter pencarian laundry
- **Price_Calculator**: Modul yang menghitung estimasi dan harga final order
- **Form_Validator**: Modul validasi form menggunakan React Hook Form + Zod
- **Dark_Track**: Kanvas desain hitam (`#000000`) untuk halaman publik/marketing
- **Light_Track**: Kanvas desain terang (`#ffffff`, `#fbfbf5`) untuk halaman dashboard/transaksi
- **OrderStatus**: Enum status order: `pending_pickup`, `driver_on_way_pickup`, `picked_up`, `at_laundry`, `washing`, `ready_for_delivery`, `driver_on_way_delivery`, `delivered`, `completed`, `cancelled`

---

## Requirements

### Persyaratan 1: Sistem Desain dan Komponen UI

**User Story:** Sebagai pengguna, saya ingin antarmuka yang konsisten dan estetis, sehingga pengalaman menggunakan SiapLaundry terasa profesional dan mudah digunakan.

#### Kriteria Penerimaan

1. THE Sistem SHALL menerapkan Dark Track (canvas `#000000`, teks `#ffffff`) pada semua halaman publik (`/`, `/login`, `/register`)
2. THE Sistem SHALL menerapkan Light Track (canvas `#fbfbf5` atau `#ffffff`, teks `#000000`) pada semua halaman dashboard Pembeli, Penjual, dan Kurir
3. THE Sistem SHALL menggunakan bentuk pill (`border-radius: 9999px`) untuk semua komponen tombol tanpa pengecualian
4. THE Sistem SHALL menerapkan font Neue Haas Grotesk Display (weight 330) untuk semua teks display dan heading besar
5. THE Sistem SHALL menerapkan font Inter Variable (weight 420-550) untuk semua teks body, label tombol, dan form
6. THE Sistem SHALL mengaktifkan `font-feature-settings: "ss03"` secara global pada elemen root
7. THE Sistem SHALL menggunakan warna `aloe-10` (`#c1fbd4`) dan `pistachio-10` (`#d4f9e0`) hanya pada Light Track, tidak pernah pada Dark Track
8. WHEN halaman dimuat dan data belum tersedia, THE Sistem SHALL menampilkan komponen skeleton loading
9. WHEN terjadi error pada pemuatan data, THE Sistem SHALL menampilkan pesan error dengan tombol "Coba Lagi"
10. THE Sistem SHALL responsif pada breakpoint: Mobile (< 768px), Tablet (768-1023px), Desktop (1024-1440px), Wide (≥ 1440px)

---

### Persyaratan 2: Autentikasi dan Manajemen Sesi

**User Story:** Sebagai pengguna, saya ingin dapat login dan register dengan role yang sesuai, sehingga saya dapat mengakses fitur yang relevan dengan peran saya.

#### Kriteria Penerimaan

1. WHEN pengguna mengakses halaman yang memerlukan autentikasi tanpa token valid, THE Auth_Manager SHALL mengarahkan pengguna ke halaman `/login`
2. WHEN pengguna berhasil login, THE Auth_Manager SHALL mengarahkan pengguna ke dashboard sesuai role: Pembeli ke `/explore`, Penjual ke `/seller/dashboard`, Kurir ke `/driver/dashboard`
3. WHEN pengguna dengan role `seller` mencoba mengakses rute `/driver/*`, THE Auth_Manager SHALL mengarahkan pengguna ke `/seller/dashboard`
4. WHEN pengguna dengan role `buyer` mencoba mengakses rute `/seller/*` atau `/driver/*`, THE Auth_Manager SHALL mengarahkan pengguna ke `/explore`
5. WHEN JWT token expired saat pengguna aktif, THE Auth_Manager SHALL mencoba refresh token secara otomatis
6. IF refresh token gagal, THEN THE Auth_Manager SHALL mengarahkan pengguna ke `/login` dengan pesan "Sesi Anda telah berakhir"
7. WHEN pengguna memilih role pada halaman login, THE Sistem SHALL menampilkan label tombol yang sesuai: "Masuk sebagai Pembeli", "Masuk sebagai Penjual", atau "Masuk sebagai Kurir"
8. WHEN pengguna mengisi form login dengan email/telepon dan password yang valid, THE Auth_Manager SHALL memproses autentikasi dan menyimpan token di httpOnly cookie
9. IF pengguna mengisi form login dengan kredensial yang salah, THEN THE Auth_Manager SHALL menampilkan pesan error "Email/telepon atau password salah"
10. WHEN pengguna klik "Logout", THE Auth_Manager SHALL menghapus token, membersihkan state Zustand, dan mengarahkan ke halaman `/`

---

### Persyaratan 3: Registrasi Pengguna

**User Story:** Sebagai calon pengguna, saya ingin mendaftar dengan form yang sesuai peran saya, sehingga akun saya memiliki data yang lengkap dan relevan.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan tiga pilihan role pada halaman register: Pembeli, Penjual, dan Kurir
2. WHEN pengguna memilih role Pembeli, THE Form_Validator SHALL menampilkan form dengan field: Nama Lengkap, Email, No. Telepon, Password, Konfirmasi Password, dan Alamat dengan pin lokasi
3. WHEN pengguna memilih role Penjual, THE Form_Validator SHALL menampilkan form dengan field: Nama Laundry, Nama Pemilik, Email Bisnis, No. Telepon, Password, Alamat Laundry dengan pin lokasi, Foto Laundry (opsional), dan Jam Operasional
4. WHEN pengguna memilih role Kurir, THE Form_Validator SHALL menampilkan form dengan field: Nama Lengkap, No. Telepon, Email, Password, Foto KTP, Foto SIM, Jenis Kendaraan, dan Plat Nomor
5. WHEN pengguna mengisi field alamat, THE Location_Service SHALL menampilkan komponen LocationPicker dengan Google Maps untuk pin lokasi
6. IF pengguna mengisi password yang tidak cocok dengan konfirmasi password, THEN THE Form_Validator SHALL menampilkan pesan error "Password tidak cocok" sebelum form disubmit
7. IF pengguna mengisi field yang wajib dengan string yang hanya berisi whitespace, THEN THE Form_Validator SHALL menolak input dan menampilkan pesan error "Field ini wajib diisi"
8. WHEN pengguna mengupload foto (KTP, SIM, atau foto laundry), THE Sistem SHALL memvalidasi bahwa ukuran file tidak melebihi 5MB dan tipe file adalah image/jpeg atau image/png
9. IF file yang diupload melebihi 5MB atau bukan format gambar yang valid, THEN THE Sistem SHALL menampilkan pesan error "Ukuran file maksimal 5MB, format JPG atau PNG"
10. WHEN registrasi berhasil, THE Auth_Manager SHALL mengarahkan pengguna ke dashboard sesuai role yang dipilih

---

### Persyaratan 4: Halaman Landing

**User Story:** Sebagai pengunjung, saya ingin melihat halaman landing yang menarik dan informatif, sehingga saya memahami layanan SiapLaundry dan termotivasi untuk mendaftar.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan Hero Section dengan headline utama menggunakan tipografi `display-xxl` (96px, weight 330) pada canvas hitam
2. THE Sistem SHALL menampilkan section "Cara Kerja" dengan 4 langkah menggunakan `card-feature-cinematic`
3. THE Sistem SHALL menampilkan section "Fitur Unggulan" dengan minimal 4 fitur dalam grid 2x2
4. THE Sistem SHALL menampilkan section "Testimoni" dalam format carousel yang dapat di-scroll
5. THE Sistem SHALL menampilkan CTA Section dengan tombol `button-outline-on-dark` yang mengarahkan ke `/login` atau `/register`
6. THE Sistem SHALL menampilkan footer dengan link ke: Tentang Kami, FAQ, Kontak, dan Kebijakan Privasi
7. WHEN pengguna mengklik tombol CTA "Cari Laundry Terdekat", THE Sistem SHALL mengarahkan ke `/login` jika belum login, atau ke `/explore` jika sudah login sebagai Pembeli

---

### Persyaratan 5: Eksplorasi Laundry

**User Story:** Sebagai Pembeli, saya ingin menelusuri dan memfilter laundry terdekat, sehingga saya dapat menemukan laundry yang sesuai kebutuhan dan anggaran saya.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan daftar laundry dalam format grid card dengan informasi: foto, nama, rating, jumlah ulasan, jarak, harga mulai, dan status buka/tutup
2. WHEN halaman `/explore` dimuat, THE Location_Service SHALL meminta izin geolokasi browser untuk menghitung jarak laundry
3. IF pengguna menolak izin geolokasi, THEN THE Location_Service SHALL menampilkan input manual untuk memasukkan lokasi
4. WHEN pengguna mengetik di search bar, THE Filter_Engine SHALL memfilter laundry berdasarkan nama atau alamat secara real-time (debounce 300ms)
5. WHEN pengguna menerapkan filter jarak, THE Filter_Engine SHALL menampilkan hanya laundry dalam radius yang dipilih dari lokasi pengguna
6. WHEN pengguna menerapkan filter rating, THE Filter_Engine SHALL menampilkan hanya laundry dengan rating rata-rata ≥ nilai yang dipilih
7. WHEN pengguna menerapkan filter harga, THE Filter_Engine SHALL mengurutkan laundry dari harga terendah ke tertinggi
8. WHEN pengguna menerapkan filter layanan, THE Filter_Engine SHALL menampilkan hanya laundry yang menyediakan layanan yang dipilih
9. FOR ALL kombinasi filter yang valid, THE Filter_Engine SHALL memastikan setiap laundry dalam hasil filter memenuhi semua kriteria filter yang diterapkan
10. WHEN pengguna mengklik "Lihat Detail" pada LaundryCard, THE Sistem SHALL mengarahkan ke `/laundry/:id`
11. WHEN tidak ada laundry yang memenuhi kriteria filter, THE Sistem SHALL menampilkan pesan "Tidak ada laundry yang ditemukan. Coba ubah filter Anda."

---

### Persyaratan 6: Detail Laundry

**User Story:** Sebagai Pembeli, saya ingin melihat informasi lengkap tentang laundry termasuk layanan, harga, dan ulasan, sehingga saya dapat membuat keputusan pemesanan yang tepat.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan carousel foto laundry (3-5 foto) dengan navigasi prev/next
2. THE Sistem SHALL menampilkan tabel layanan dengan kolom: Nama Layanan, Harga per Unit, Estimasi Waktu, dan tombol Pilih
3. THE Sistem SHALL menampilkan peta Google Maps yang menunjukkan lokasi laundry
4. THE Sistem SHALL menampilkan ringkasan rating (angka rata-rata + breakdown per bintang) dan daftar ulasan
5. WHEN pengguna mengklik tombol "Pilih" pada layanan, THE Sistem SHALL menandai layanan tersebut sebagai dipilih dan mengaktifkan tombol "Pesan Sekarang"
6. WHEN pengguna mengklik "Pesan Sekarang", THE Sistem SHALL mengarahkan ke `/order/create` dengan data laundry dan layanan yang dipilih
7. WHEN pengguna memilih filter ulasan (Terbaru/Tertinggi/Terendah), THE Sistem SHALL mengurutkan ulasan sesuai pilihan
8. IF laundry sedang tutup, THEN THE Sistem SHALL menampilkan badge "Tutup" dan menonaktifkan tombol "Pesan Sekarang" dengan pesan "Laundry sedang tutup"

---

### Persyaratan 7: Pembuatan Order

**User Story:** Sebagai Pembeli, saya ingin membuat order dengan mudah melalui form multi-step, sehingga saya dapat menjadwalkan pickup cucian saya.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan form pembuatan order dalam 3 langkah: Pilih Layanan, Alamat & Jadwal, dan Konfirmasi
2. WHEN pengguna menggeser slider estimasi berat, THE Price_Calculator SHALL memperbarui estimasi harga secara real-time menggunakan formula: `estimasi_harga = harga_per_unit × estimasi_berat`
3. THE Sistem SHALL menampilkan pilihan alamat tersimpan dari profil pengguna dan opsi "Tambah Alamat Baru"
4. WHEN pengguna memilih "Tambah Alamat Baru", THE Location_Service SHALL menampilkan LocationPicker dengan Google Maps
5. THE Sistem SHALL menampilkan date picker untuk tanggal pickup dengan tanggal minimum adalah hari ini
6. THE Sistem SHALL menampilkan pilihan time slot: Pagi (08:00-12:00), Siang (12:00-15:00), Sore (15:00-18:00)
7. THE Sistem SHALL menampilkan ringkasan order pada langkah Konfirmasi dengan: nama laundry, layanan, estimasi berat, estimasi harga, biaya antar-jemput (Rp 5.000), dan total estimasi
8. WHEN pengguna mengklik "Konfirmasi Pesanan", THE Order_Manager SHALL mengirim data order ke API dan mengarahkan ke `/my-orders` jika berhasil
9. IF pengiriman order gagal, THEN THE Order_Manager SHALL menampilkan pesan error dan mempertahankan data form yang sudah diisi
10. FOR ALL nilai berat aktual (> 0) dan harga per unit (> 0) yang valid, THE Price_Calculator SHALL memastikan total harga selalu sama dengan `(berat × harga_per_unit) + biaya_antar_jemput`

---

### Persyaratan 8: Manajemen Order Pembeli

**User Story:** Sebagai Pembeli, saya ingin memantau status semua pesanan saya dan melihat detail lengkap setiap order, sehingga saya selalu tahu perkembangan cucian saya.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan daftar order dalam tiga tab: Berlangsung, Selesai, dan Dibatalkan
2. WHEN pengguna membuka tab "Berlangsung", THE Sistem SHALL menampilkan OrderCard dengan OrderStatusBadge yang sesuai untuk setiap order aktif
3. THE Sistem SHALL menampilkan timeline ringkas (2-3 event terakhir) pada setiap OrderCard di tab Berlangsung
4. WHEN status order berubah melalui Socket.io, THE Order_Manager SHALL memperbarui OrderStatusBadge dan timeline secara real-time tanpa reload halaman
5. WHEN pengguna mengklik "Lihat Detail Order", THE Sistem SHALL mengarahkan ke `/order/:orderId`
6. THE Sistem SHALL menampilkan OrderTimeline vertikal lengkap pada halaman detail order dengan semua event status beserta timestamp
7. WHEN status order adalah `driver_on_way_pickup` atau `driver_on_way_delivery`, THE Sistem SHALL menampilkan tombol "Lacak Kurir" yang membuka peta dengan posisi kurir real-time
8. WHEN status order adalah `completed`, THE Sistem SHALL menampilkan tombol "Beri Rating & Ulasan" yang mengarahkan ke `/order/:orderId/review`
9. WHEN pengguna mengklik "Chat dengan Laundry" atau "Chat dengan Kurir", THE Sistem SHALL mengarahkan ke `/chat` dengan kontak yang sesuai sudah terpilih
10. FOR ALL order dengan status selain `cancelled`, THE Order_Manager SHALL memastikan urutan status dalam timeline selalu mengikuti urutan yang telah ditentukan (tidak mundur)

---

### Persyaratan 9: Rating dan Ulasan

**User Story:** Sebagai Pembeli, saya ingin memberikan rating dan ulasan setelah order selesai, sehingga saya dapat membantu pengguna lain memilih laundry yang baik.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan form review hanya untuk order dengan status `completed`
2. THE Sistem SHALL menampilkan komponen StarRating interaktif (1-5 bintang) untuk rating laundry
3. THE Sistem SHALL menampilkan komponen StarRating interaktif (1-5 bintang) untuk rating kurir
4. THE Sistem SHALL menampilkan area upload foto (opsional) dengan drag & drop
5. WHEN pengguna mengklik bintang pada StarRating, THE Sistem SHALL memperbarui nilai rating secara visual secara langsung
6. IF pengguna mencoba submit form tanpa memilih rating laundry, THEN THE Form_Validator SHALL menampilkan pesan error "Rating laundry wajib diisi"
7. WHEN pengguna mengklik "Kirim Ulasan", THE Sistem SHALL mengirim data review ke API dan mengarahkan ke `/my-orders` jika berhasil

---

### Persyaratan 10: Chat Real-time

**User Story:** Sebagai pengguna, saya ingin berkomunikasi secara real-time dengan laundry atau kurir terkait order saya, sehingga saya dapat berkoordinasi dengan mudah.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan layout chat dengan sidebar daftar kontak di kiri dan jendela chat di kanan
2. THE Chat_Manager SHALL menampilkan badge jumlah pesan belum dibaca pada setiap kontak di sidebar
3. WHEN pengguna memilih kontak di sidebar, THE Chat_Manager SHALL memuat riwayat pesan dan menandai semua pesan sebagai sudah dibaca
4. WHEN pengguna mengirim pesan, THE Chat_Manager SHALL menampilkan pesan di bubble kanan dengan status "terkirim"
5. WHEN pesan baru masuk melalui Socket.io, THE Chat_Manager SHALL menampilkan pesan di bubble kiri secara real-time tanpa reload
6. WHEN koneksi Socket.io terputus, THE Chat_Manager SHALL menampilkan banner "Koneksi terputus, mencoba menghubungkan kembali..."
7. WHEN koneksi Socket.io pulih, THE Chat_Manager SHALL menyembunyikan banner dan memuat pesan yang mungkin terlewat
8. THE Sistem SHALL menampilkan indikator status online/offline untuk setiap kontak
9. FOR ALL pesan yang dikirim, THE Chat_Manager SHALL memastikan pesan muncul di sisi pengirim sebelum konfirmasi server (optimistic update)

---

### Persyaratan 11: Dashboard Penjual

**User Story:** Sebagai Penjual, saya ingin melihat ringkasan bisnis dan mengelola order masuk, sehingga saya dapat menjalankan usaha laundry dengan efisien.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan 4 widget pada dashboard: Total Order Bulan Ini, Total Pendapatan, Rating Rata-rata, dan Order Baru
2. WHEN ada order baru yang belum dikonfirmasi, THE Notification_Manager SHALL menampilkan badge merah pada widget "Order Baru" dan pada item navigasi "Orders"
3. THE Sistem SHALL menampilkan tabel recent orders dengan kolom: No. Order, Nama Pembeli, Layanan, Status, dan Aksi
4. WHEN Penjual mengklik "Lihat Detail" pada tabel, THE Sistem SHALL mengarahkan ke `/seller/orders/:orderId`
5. THE Sistem SHALL menampilkan sidebar navigasi dengan item: Dashboard, Orders, Services, Reviews, Profile
6. WHEN status order berubah melalui Socket.io, THE Order_Manager SHALL memperbarui widget dan tabel secara real-time

---

### Persyaratan 12: Manajemen Order Penjual

**User Story:** Sebagai Penjual, saya ingin mengelola semua order dan memperbarui status cucian, sehingga pembeli selalu mendapat informasi terkini tentang pesanan mereka.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan order dalam 4 tab: Order Baru, Sedang Proses, Siap Diantar, dan Selesai
2. WHEN Penjual mengklik "Konfirmasi Order" pada order baru, THE Order_Manager SHALL mengubah status order ke `at_laundry` dan memindahkan order ke tab "Sedang Proses"
3. WHEN Penjual mengklik "Mulai Cuci", THE Order_Manager SHALL mengubah status order ke `washing`
4. WHEN Penjual mengklik "Selesai Dicuci", THE Order_Manager SHALL mengubah status order ke `ready_for_delivery` dan memindahkan ke tab "Siap Diantar"
5. WHEN Penjual membuka detail order, THE Sistem SHALL menampilkan field input "Berat Aktual" untuk memasukkan berat setelah ditimbang
6. WHEN Penjual mengisi berat aktual, THE Price_Calculator SHALL menghitung dan menampilkan harga final secara otomatis
7. IF Penjual mencoba mengubah status tanpa mengisi berat aktual (untuk status `washing`), THEN THE Form_Validator SHALL menampilkan pesan error "Berat aktual wajib diisi sebelum memulai proses cuci"
8. WHEN status order berubah, THE Notification_Manager SHALL mengirim notifikasi real-time ke Pembeli yang bersangkutan

---

### Persyaratan 13: Katalog Layanan Penjual

**User Story:** Sebagai Penjual, saya ingin mengelola katalog layanan dan harga laundry saya, sehingga Pembeli dapat melihat informasi yang akurat dan terkini.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan tabel semua layanan aktif dengan kolom: Nama Layanan, Harga, Unit, Estimasi Waktu, dan Aksi (Edit/Hapus)
2. WHEN Penjual mengklik "Tambah Layanan Baru", THE Sistem SHALL menampilkan form dengan field: Nama Layanan, Harga per Unit, Unit (kg/pcs), Estimasi Waktu, dan Deskripsi (opsional)
3. WHEN Penjual mengklik "Edit" pada layanan, THE Sistem SHALL menampilkan form yang sudah terisi dengan data layanan yang ada
4. WHEN Penjual mengklik "Hapus" pada layanan, THE Sistem SHALL menampilkan konfirmasi dialog sebelum menghapus
5. IF Penjual mengisi harga dengan nilai ≤ 0, THEN THE Form_Validator SHALL menampilkan pesan error "Harga harus lebih dari 0"
6. WHEN layanan berhasil ditambah atau diedit, THE Sistem SHALL memperbarui tabel layanan tanpa reload halaman

---

### Persyaratan 14: Dashboard Kurir

**User Story:** Sebagai Kurir, saya ingin mengelola status ketersediaan saya dan melihat order yang tersedia, sehingga saya dapat bekerja secara efisien.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan toggle Online/Offline yang menonjol di bagian atas dashboard
2. WHEN Kurir mengaktifkan toggle ke "Online", THE Sistem SHALL mengirim update status ke server dan menampilkan indikator hijau (`aloe-10`)
3. WHEN Kurir mengaktifkan toggle ke "Offline", THE Sistem SHALL mengirim update status ke server dan menampilkan indikator abu-abu (`shade-30`)
4. WHILE Kurir berstatus Online, THE Notification_Manager SHALL menampilkan notifikasi untuk order pickup baru yang tersedia
5. THE Sistem SHALL menampilkan 3 widget: Order Hari Ini, Total Pengantaran Bulan Ini, dan Pendapatan Bulan Ini
6. THE Sistem SHALL dioptimalkan untuk penggunaan mobile dengan bottom navigation bar pada viewport < 768px

---

### Persyaratan 15: Manajemen Order Kurir

**User Story:** Sebagai Kurir, saya ingin melihat dan mengelola order pickup dan delivery, serta memperbarui status pengantaran, sehingga proses pickup dan delivery berjalan lancar.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan order dalam 2 tab: Pickup (Jemput) dan Delivery (Antar)
2. WHEN Kurir mengklik "Ambil Order", THE Order_Manager SHALL menugaskan order tersebut ke Kurir dan mengubah status ke `driver_on_way_pickup`
3. WHEN Kurir mengklik "Berangkat Jemput", THE Order_Manager SHALL memperbarui status dan mengirim notifikasi ke Pembeli
4. WHEN Kurir mengklik "Pakaian Diambil", THE Order_Manager SHALL mengubah status ke `picked_up`
5. WHEN Kurir membuka detail order, THE Sistem SHALL menampilkan alamat pickup/delivery lengkap dan tombol "Buka di Maps" yang membuka Google Maps dengan navigasi ke alamat tersebut
6. THE Sistem SHALL menampilkan jarak dari lokasi Kurir saat ini ke alamat pickup/delivery
7. WHEN Kurir mengklik "Pakaian Diterima Pembeli", THE Order_Manager SHALL mengubah status ke `delivered`
8. WHEN status order berubah, THE Notification_Manager SHALL mengirim notifikasi real-time ke Pembeli yang bersangkutan
9. THE Sistem SHALL menampilkan tombol "Chat Pembeli" dan "Telepon Pembeli" pada halaman detail order

---

### Persyaratan 16: Profil Pengguna

**User Story:** Sebagai pengguna, saya ingin mengelola informasi profil saya, sehingga data saya selalu akurat dan terkini.

#### Kriteria Penerimaan

1. THE Sistem SHALL menampilkan halaman profil yang sesuai dengan role pengguna (Pembeli, Penjual, atau Kurir)
2. WHEN pengguna mengklik "Edit Profil", THE Sistem SHALL menampilkan form yang sudah terisi dengan data profil saat ini
3. WHEN Pembeli mengedit profil, THE Sistem SHALL memungkinkan pengelolaan beberapa alamat tersimpan (tambah, edit, hapus, set default)
4. WHEN Penjual mengedit profil laundry, THE Sistem SHALL memungkinkan update: nama laundry, alamat, jam operasional, foto, dan nomor telepon
5. WHEN pengguna mengklik "Ubah Password", THE Form_Validator SHALL memvalidasi bahwa password baru dan konfirmasi password cocok
6. IF password baru sama dengan password lama, THEN THE Form_Validator SHALL menampilkan pesan error "Password baru harus berbeda dari password lama"
7. WHEN pengguna berhasil menyimpan perubahan profil, THE Sistem SHALL menampilkan toast notifikasi "Profil berhasil diperbarui"

---

### Persyaratan 17: Notifikasi Real-time

**User Story:** Sebagai pengguna, saya ingin menerima notifikasi real-time tentang perubahan status order dan pesan baru, sehingga saya selalu mendapat informasi terkini tanpa harus refresh halaman.

#### Kriteria Penerimaan

1. WHEN pengguna terautentikasi, THE Notification_Manager SHALL membuat koneksi Socket.io dan bergabung ke room `user:{userId}`
2. WHEN status order berubah, THE Notification_Manager SHALL menampilkan toast notifikasi dengan pesan yang sesuai status baru
3. WHEN pesan chat baru masuk, THE Notification_Manager SHALL menampilkan badge unread pada ikon chat di navbar
4. WHEN koneksi Socket.io terputus, THE Notification_Manager SHALL menampilkan banner peringatan dan mencoba reconnect secara otomatis
5. WHEN pengguna logout, THE Notification_Manager SHALL memutus koneksi Socket.io dan membersihkan semua state notifikasi
6. THE Sistem SHALL menampilkan daftar notifikasi yang dapat diakses dari ikon lonceng di navbar
7. WHEN pengguna mengklik notifikasi order, THE Sistem SHALL mengarahkan ke halaman detail order yang relevan
