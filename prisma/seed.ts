/**
 * Seed script — populate database with demo data (15 Mitra Laundry di Jakarta Timur).
 * Jalankan: npm run db:seed
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hash(password: string) {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('🌱 Starting seed (15 Mitra Laundry Jakarta Timur)...')

  // Clear existing data (order matters karena FK)
  await prisma.chatMessage.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderStatusHistory.deleteMany()
  await prisma.order.deleteMany()
  await prisma.service.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.buyer.deleteMany()
  await prisma.seller.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.user.deleteMany()

  console.log('  ✓ Cleared existing data')

  const password = await hash('password123')
  const kikiPassword = await hash('12345678')

  // ==== Buyers (6 Akun Pelanggan dengan alamat di Jakarta Timur) ====
  const kikiUser = await prisma.user.create({
    data: {
      email: 'wicaksanakikiaimar@gmail.com',
      phone: '081234567899',
      passwordHash: kikiPassword,
      role: 'buyer',
      name: 'Kiki Aimar Wicaksana',
      isVerified: true,
      buyer: {
        create: {
          fullName: 'Kiki Aimar Wicaksana',
          addresses: [
            {
              address_line: 'Jl. Raden Inten II No. 45, Duren Sawit, Jakarta Timur',
              latitude: -6.2350,
              longitude: 106.9200,
              is_default: true,
            },
          ],
        },
      },
    },
    include: { buyer: true },
  })
  console.log('  ✓ Created customer Kiki:', kikiUser.email)

  const buyer1User = await prisma.user.create({
    data: {
      email: 'buyer@demo.com',
      phone: '081234567890',
      passwordHash: password,
      role: 'buyer',
      name: 'Budi Pembeli',
      isVerified: true,
      buyer: {
        create: {
          fullName: 'Budi Pembeli',
          addresses: [
            {
              address_line: 'Jl. Pemuda Raya No. 10, Rawamangun, Jakarta Timur',
              latitude: -6.1950,
              longitude: 106.8850,
              is_default: true,
            },
          ],
        },
      },
    },
    include: { buyer: true },
  })
  console.log('  ✓ Created buyer 1:', buyer1User.email)

  const buyer2User = await prisma.user.create({
    data: {
      email: 'siti@demo.com',
      phone: '081234567801',
      passwordHash: password,
      role: 'buyer',
      name: 'Siti Rahmawati',
      isVerified: true,
      buyer: {
        create: {
          fullName: 'Siti Rahmawati',
          addresses: [
            {
              address_line: 'Jl. Otista III No. 22, Jatinegara, Jakarta Timur',
              latitude: -6.2400,
              longitude: 106.8750,
              is_default: true,
            },
          ],
        },
      },
    },
    include: { buyer: true },
  })
  console.log('  ✓ Created buyer 2:', buyer2User.email)

  const buyer3User = await prisma.user.create({
    data: {
      email: 'fajar@demo.com',
      phone: '081234567802',
      passwordHash: password,
      role: 'buyer',
      name: 'Fajar Nugroho',
      isVerified: true,
      buyer: {
        create: {
          fullName: 'Fajar Nugroho',
          addresses: [
            {
              address_line: 'Jl. Pahlawan Revolusi No. 8, Pondok Bambu, Jakarta Timur',
              latitude: -6.2300,
              longitude: 106.9000,
              is_default: true,
            },
          ],
        },
      },
    },
    include: { buyer: true },
  })
  console.log('  ✓ Created buyer 3:', buyer3User.email)

  const buyer4User = await prisma.user.create({
    data: {
      email: 'rina@demo.com',
      phone: '081234567803',
      passwordHash: password,
      role: 'buyer',
      name: 'Rina Melati',
      isVerified: true,
      buyer: {
        create: {
          fullName: 'Rina Melati',
          addresses: [
            {
              address_line: 'Jl. Raya Condet No. 55, Kramat Jati, Jakarta Timur',
              latitude: -6.2750,
              longitude: 106.8650,
              is_default: true,
            },
          ],
        },
      },
    },
    include: { buyer: true },
  })
  console.log('  ✓ Created buyer 4:', buyer4User.email)

  const buyer5User = await prisma.user.create({
    data: {
      email: 'hendra@demo.com',
      phone: '081234567804',
      passwordHash: password,
      role: 'buyer',
      name: 'Hendra Pratama',
      isVerified: true,
      buyer: {
        create: {
          fullName: 'Hendra Pratama',
          addresses: [
            {
              address_line: 'Jl. Buaran Raya No. 12, Klender, Jakarta Timur',
              latitude: -6.2200,
              longitude: 106.9150,
              is_default: true,
            },
          ],
        },
      },
    },
    include: { buyer: true },
  })
  console.log('  ✓ Created buyer 5:', buyer5User.email)

  const buyers = [
    kikiUser.buyer!,
    buyer1User.buyer!,
    buyer2User.buyer!,
    buyer3User.buyer!,
    buyer4User.buyer!,
    buyer5User.buyer!,
  ]

  // ==== 15 Data Mitra Laundry di Daerah Jakarta Timur ====
  const sellersData = [
    {
      email: 'laundry1@demo.com',
      ownerName: 'Pemilik Laundry Cemerlang',
      laundryName: 'Laundry Cemerlang Rawamangun',
      address: 'Jl. Balai Pustaka Timur No. 15, Rawamangun, Jakarta Timur',
      lat: -6.1980, lng: 106.8870,
      isOpen: true, rating: 4.8, reviewsCount: 6, totalOrders: 54,
      services: [
        { serviceName: 'Cuci Setrika Premium', pricePerUnit: 8000, unit: 'kg', estimatedDurationDays: 2, description: 'Deterjen premium + pelembut khusus harum mawar' },
        { serviceName: 'Cuci Kering Kilat', pricePerUnit: 6000, unit: 'kg', estimatedDurationDays: 1, description: 'Selesai 24 jam tanpa setrika' },
        { serviceName: 'Dry Clean Jas / Gaun', pricePerUnit: 30000, unit: 'pcs', estimatedDurationDays: 3, description: 'Perawatan khusus pakaian formal & jas' }
      ],
      reviews: [
        { buyerIdx: 0, rating: 5, serviceIdx: 0, comment: 'Langganan terus! Cucian selalu bersih, wangi tahan lama, dan rapi banget lipatannya. Recommended di Rawamangun!', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 1, rating: 5, serviceIdx: 2, comment: 'Jas kerja saya dicuci sangat hati-hati, tidak ada kusut sama sekali. Terasa seperti baru beli.', daysAgo: 2, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 0, comment: 'Pengerjaan cepat dan admin ramah saat dihubungi via chat. Harganya pas di kantong.', daysAgo: 3, photos: [] },
        { buyerIdx: 3, rating: 5, serviceIdx: 1, comment: 'Penyelamat saat musim hujan. Pakaian kering sempurna dan wangi bunga sakura.', daysAgo: 5, photos: [] },
        { buyerIdx: 4, rating: 5, serviceIdx: 0, comment: 'Kurir ramah dan tepat waktu saat antar jemput. Sangat membantu kesibukan saya.', daysAgo: 7, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 5, rating: 5, serviceIdx: 0, comment: 'Sangat profesional. Baju dikemas rapi dengan plastik tebal anti air.', daysAgo: 8, photos: [] },
      ]
    },
    {
      email: 'laundry2@demo.com',
      ownerName: 'Pemilik Express Kilat',
      laundryName: 'Express Kilat Duren Sawit',
      address: 'Jl. Raden Inten II No. 88, Duren Sawit, Jakarta Timur',
      lat: -6.2360, lng: 106.9220,
      isOpen: true, rating: 4.6, reviewsCount: 5, totalOrders: 42,
      services: [
        { serviceName: 'Cuci Setrika Express (1 Hari)', pricePerUnit: 12000, unit: 'kg', estimatedDurationDays: 1, description: 'Layanan super kilat selesai dalam 24 jam' },
        { serviceName: 'Setrika Saja', pricePerUnit: 5000, unit: 'kg', estimatedDurationDays: 1, description: 'Setrika rapi licin anti kusut' }
      ],
      reviews: [
        { buyerIdx: 0, rating: 5, serviceIdx: 0, comment: 'Benar-benar kilat! Pagi dijemput, malam sudah diantar lagi ke rumah dalam keadaan wangi dan licin.', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 2, rating: 5, serviceIdx: 1, comment: 'Setrikaannya sangat mulus dan lipatannya presisi. Sangat menghemat waktu akhir pekan saya.', daysAgo: 3, photos: [] },
        { buyerIdx: 3, rating: 4, serviceIdx: 0, comment: 'Kecepatan luar biasa. Pakaian bersih, cuma wangi pewanginya agak lembut.', daysAgo: 4, photos: [] },
        { buyerIdx: 4, rating: 5, serviceIdx: 0, comment: 'Super express! Penyelamat saat butuh seragam kerja mendadak untuk besok pagi.', daysAgo: 6, photos: [] },
        { buyerIdx: 1, rating: 4, serviceIdx: 1, comment: 'Sangat terbantu! Baju rapi dan pengemasan rapi anti air.', daysAgo: 9, photos: [] }
      ]
    },
    {
      email: 'laundry3@demo.com',
      ownerName: 'Pemilik Wangi Premium',
      laundryName: 'Wangi Premium Jatinegara',
      address: 'Jl. Jatinegara Timur No. 45, Jatinegara, Jakarta Timur',
      lat: -6.2250, lng: 106.8700,
      isOpen: false, rating: 4.9, reviewsCount: 6, totalOrders: 65,
      services: [
        { serviceName: 'Premium Wash & Fold', pricePerUnit: 10000, unit: 'kg', estimatedDurationDays: 2, description: 'Deterjen premium + pewangi tahan 7 hari' },
        { serviceName: 'Cuci Bedcover King Size', pricePerUnit: 35000, unit: 'pcs', estimatedDurationDays: 3, description: 'Pencucian khusus bedcover dan selimut tebal' },
        { serviceName: 'Dry Clean Gaun Pesta', pricePerUnit: 45000, unit: 'pcs', estimatedDurationDays: 3, description: 'Pembersihan gaun pesta mewah' }
      ],
      reviews: [
        { buyerIdx: 1, rating: 5, serviceIdx: 0, comment: 'Kualitas premium yang sesungguhnya! Serat kain tetap lembut dan wanginya elegan banget seperti parfum mahal.', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 0, rating: 5, serviceIdx: 1, comment: 'Bedcover saya jadi harum dan super empuk saat dipakai tidur. Bersih sempurna dari noda debu.', daysAgo: 2, photos: [] },
        { buyerIdx: 2, rating: 5, serviceIdx: 2, comment: 'Gaun pesta saya dibersihkan dengan sangat teliti tanpa merusak payet. Hebat!', daysAgo: 4, photos: [] },
        { buyerIdx: 3, rating: 5, serviceIdx: 0, comment: 'Pakaian dibungkus satu per satu dengan hanger. Sangat eksklusif dan higienis.', daysAgo: 5, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 4, rating: 4, serviceIdx: 1, comment: 'Hasil cucian bedcover luar biasa harum. Harganya memang sedikit lebih tinggi tapi sebanding.', daysAgo: 6, photos: [] },
        { buyerIdx: 5, rating: 5, serviceIdx: 0, comment: 'Wangi pewanginya tahan berhari-hari di lemari. Langganan terbaik di Jatinegara.', daysAgo: 8, photos: [] }
      ]
    },
    {
      email: 'laundry4@demo.com',
      ownerName: 'Pemilik Klinik Laundry',
      laundryName: 'Klinik Laundry Buaran',
      address: 'Jl. Buaran Raya Blok A No. 3, Duren Sawit, Jakarta Timur',
      lat: -6.2210, lng: 106.9180,
      isOpen: true, rating: 4.7, reviewsCount: 5, totalOrders: 38,
      services: [
        { serviceName: 'Cuci Setrika Reguler', pricePerUnit: 7500, unit: 'kg', estimatedDurationDays: 2, description: 'Layanan harian bersih harum' },
        { serviceName: 'Cuci Sepatu Sneakers', pricePerUnit: 25000, unit: 'pcs', estimatedDurationDays: 3, description: 'Deep cleaning sepatu kesayangan' },
        { serviceName: 'Cuci Tas Ransel', pricePerUnit: 30000, unit: 'pcs', estimatedDurationDays: 3, description: 'Pencucian tas ransel & laptop' }
      ],
      reviews: [
        { buyerIdx: 5, rating: 5, serviceIdx: 1, comment: 'Sepatu putih saya yang dekil jadi kinclong seperti baru lagi! Wangi apel yang segar.', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 0, rating: 5, serviceIdx: 0, comment: 'Cucian pakaian harian bersih dan disetrika dengan rapi. Pengantaran on-time.', daysAgo: 2, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 2, comment: 'Tas ransel anak saya jadi bersih dari noda tinta. Pelayanan ramah.', daysAgo: 5, photos: [] },
        { buyerIdx: 3, rating: 5, serviceIdx: 0, comment: 'Hasil cuci sangat wangi dan bebas noda minyak. Terima kasih Klinik Laundry!', daysAgo: 7, photos: [] },
        { buyerIdx: 4, rating: 5, serviceIdx: 1, comment: 'Pengerjaan sepatu sangat profesional. Sol sepatu bersih sempurna.', daysAgo: 10, photos: [] }
      ]
    },
    {
      email: 'laundry5@demo.com',
      ownerName: 'Pemilik Fresh Clean',
      laundryName: 'Fresh Clean Condet',
      address: 'Jl. Raya Condet No. 99, Kramat Jati, Jakarta Timur',
      lat: -6.2780, lng: 106.8640,
      isOpen: true, rating: 4.8, reviewsCount: 5, totalOrders: 49,
      services: [
        { serviceName: 'Cuci Setrika Harum Mawar', pricePerUnit: 7000, unit: 'kg', estimatedDurationDays: 2, description: 'Wangi bunga mawar pilihan tahan lama' },
        { serviceName: 'Cuci Karpet Permadani', pricePerUnit: 15000, unit: 'kg', estimatedDurationDays: 4, description: 'Pencucian karpet tebal higienis' }
      ],
      reviews: [
        { buyerIdx: 4, rating: 5, serviceIdx: 0, comment: 'Wangi mawar kesukaan keluarga saya. Tahan lama walau disimpan lama di lemari.', daysAgo: 1, photos: [] },
        { buyerIdx: 0, rating: 5, serviceIdx: 1, comment: 'Karpet ruang tamu jadi super bersih dan bulunya lembut kembali. Tidak bau lembab.', daysAgo: 3, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 1, rating: 5, serviceIdx: 0, comment: 'Harga sangat bersahabat untuk warga Condet. Lipatannya rapi banget.', daysAgo: 4, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 0, comment: 'Pengerjaan konsisten bagus. Kurir jemput sangat responsif via WhatsApp.', daysAgo: 6, photos: [] },
        { buyerIdx: 3, rating: 5, serviceIdx: 0, comment: 'Pakaian tidak ada yang luntur atau susut. Sangat terpercaya.', daysAgo: 8, photos: [] }
      ]
    },
    {
      email: 'laundry6@demo.com',
      ownerName: 'Pemilik SuperWash Otista',
      laundryName: 'SuperWash Otista',
      address: 'Jl. Otto Iskandardinata No. 120, Cawang, Jakarta Timur',
      lat: -6.2420, lng: 106.8730,
      isOpen: true, rating: 4.6, reviewsCount: 5, totalOrders: 35,
      services: [
        { serviceName: 'Cuci Kilat 6 Jam', pricePerUnit: 15000, unit: 'kg', estimatedDurationDays: 1, description: 'Selesai dalam 6 jam untuk keadaan darurat' },
        { serviceName: 'Cuci Setrika Harian', pricePerUnit: 8000, unit: 'kg', estimatedDurationDays: 2, description: 'Paket harian bersih licin' }
      ],
      reviews: [
        { buyerIdx: 2, rating: 5, serviceIdx: 0, comment: 'Luar biasa cepat! Siang dikirim, sore jam 6 sudah diantar lagi dalam keadaan siap pakai.', daysAgo: 1, photos: [] },
        { buyerIdx: 0, rating: 4, serviceIdx: 1, comment: 'Hasil setrika bagus, baju kerja saya jadi rapi semua. Lokasi strategis di Otista.', daysAgo: 3, photos: [] },
        { buyerIdx: 1, rating: 5, serviceIdx: 1, comment: 'Paking plastik rapat dan rapi. Driver ramah.', daysAgo: 5, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 4, rating: 5, serviceIdx: 0, comment: 'Penyelamat saat butuh baju mendadak untuk penerbangan malam. Terima kasih SuperWash!', daysAgo: 7, photos: [] },
        { buyerIdx: 5, rating: 4, serviceIdx: 1, comment: 'Bersih dan harum. Rekomendasi buat anak kos sekitar Cawang.', daysAgo: 9, photos: [] }
      ]
    },
    {
      email: 'laundry7@demo.com',
      ownerName: 'Pemilik Eco Laundry',
      laundryName: 'Pondok Bambu Eco Laundry',
      address: 'Jl. Pahlawan Revolusi No. 35, Pondok Bambu, Jakarta Timur',
      lat: -6.2320, lng: 106.9020,
      isOpen: true, rating: 4.8, reviewsCount: 5, totalOrders: 50,
      services: [
        { serviceName: 'Eco-Friendly Wash (Non-Allergenic)', pricePerUnit: 9000, unit: 'kg', estimatedDurationDays: 2, description: 'Deterjen organik aman untuk kulit sensitif' },
        { serviceName: 'Cuci Perlengkapan Bayi', pricePerUnit: 12000, unit: 'kg', estimatedDurationDays: 2, description: 'Khusus pakaian dan boneka bayi higienis' }
      ],
      reviews: [
        { buyerIdx: 3, rating: 5, serviceIdx: 0, comment: 'Kulit saya sensitif, tapi pakai laundry ini tidak pernah gatal atau iritasi. Deterjen organiknya mantap.', daysAgo: 1, photos: [] },
        { buyerIdx: 0, rating: 5, serviceIdx: 1, comment: 'Pakaian bayi dan boneka anak saya dicuci bersih tanpa bau bahan kimia menyengat. Sangat aman.', daysAgo: 2, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 1, rating: 5, serviceIdx: 0, comment: 'Konsep ramah lingkungannya patut diacungi jempol. Hasil cuci tetap bersih maksimal.', daysAgo: 4, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 0, comment: 'Pengemasan menggunakan tas spunbond yang bisa dipakai ulang. Bagus sekali.', daysAgo: 6, photos: [] },
        { buyerIdx: 4, rating: 5, serviceIdx: 1, comment: 'Selimut bayi jadi sangat lembut dan harum alami bunga chamomile.', daysAgo: 8, photos: [] }
      ]
    },
    {
      email: 'laundry8@demo.com',
      ownerName: 'Pemilik Cibubur Premium',
      laundryName: 'Cibubur Premium Care',
      address: 'Jl. Lapangan Tembak No. 18, Cibubur, Jakarta Timur',
      lat: -6.3350, lng: 106.8820,
      isOpen: true, rating: 4.9, reviewsCount: 5, totalOrders: 60,
      services: [
        { serviceName: 'Luxury Wash & Care', pricePerUnit: 12000, unit: 'kg', estimatedDurationDays: 2, description: 'Perawatan khusus bahan sutra & katun jepang' },
        { serviceName: 'Dry Clean Batik Tulis', pricePerUnit: 35000, unit: 'pcs', estimatedDurationDays: 3, description: 'Pencucian hati-hati untuk kemeja batik tulis' },
        { serviceName: 'Cuci Helm Motor', pricePerUnit: 25000, unit: 'pcs', estimatedDurationDays: 2, description: 'Deep cleaning helm luar & busa dalam' }
      ],
      reviews: [
        { buyerIdx: 0, rating: 5, serviceIdx: 1, comment: 'Batik tulis sutra saya dicuci sempurna, warnanya tetap cerah dan tidak pudar sedikitpun.', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 4, rating: 5, serviceIdx: 2, comment: 'Helm motor saya jadi harum segar dan bebas bau keringat. Busa helm terasa seperti baru.', daysAgo: 3, photos: [] },
        { buyerIdx: 1, rating: 5, serviceIdx: 0, comment: 'Kualitas bintang 5 di Cibubur! Sangat teliti dalam menyetrika bagian kerah dan kancing.', daysAgo: 5, photos: [] },
        { buyerIdx: 2, rating: 5, serviceIdx: 0, comment: 'Pakaian digantung dengan hanger dan dibungkus cover plastik rapi. Mewah.', daysAgo: 7, photos: [] },
        { buyerIdx: 5, rating: 4, serviceIdx: 1, comment: 'Pelayanan prima. Driver selalu ramah saat ambil dan antar cucian.', daysAgo: 10, photos: [] }
      ]
    },
    {
      email: 'laundry9@demo.com',
      ownerName: 'Pemilik Cakung Express',
      laundryName: 'Cakung Express Clean',
      address: 'Jl. Raya Pulogebang No. 7, Cakung, Jakarta Timur',
      lat: -6.2050, lng: 106.9450,
      isOpen: true, rating: 4.5, reviewsCount: 5, totalOrders: 40,
      services: [
        { serviceName: 'Cuci Setrika Borongan (>5kg)', pricePerUnit: 6500, unit: 'kg', estimatedDurationDays: 2, description: 'Harga hemat untuk cucian keluarga besar' },
        { serviceName: 'Setrika Kilat', pricePerUnit: 4500, unit: 'kg', estimatedDurationDays: 1, description: 'Setrika licin express' }
      ],
      reviews: [
        { buyerIdx: 5, rating: 5, serviceIdx: 0, comment: 'Sangat cocok untuk keluarga besar. Timbangannya jujur dan harganya sangat bersahabat di Cakung.', daysAgo: 2, photos: [] },
        { buyerIdx: 0, rating: 4, serviceIdx: 0, comment: 'Hasil cuci bersih dan rapi. Kurir sampai tepat waktu di rumah.', daysAgo: 4, photos: [] },
        { buyerIdx: 1, rating: 5, serviceIdx: 1, comment: 'Setrikaan mulus, kemeja dan celana kerja saya siap dipakai semua.', daysAgo: 6, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 3, rating: 4, serviceIdx: 0, comment: 'Wangi apelnya segar. Pengemasan plastik dobel.', daysAgo: 8, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 1, comment: 'Praktis dan cepat. Sangat membantu di akhir pekan.', daysAgo: 9, photos: [] }
      ]
    },
    {
      email: 'laundry10@demo.com',
      ownerName: 'Pemilik Matraman Hub',
      laundryName: 'Matraman Laundry Hub',
      address: 'Jl. Matraman Raya No. 64, Matraman, Jakarta Timur',
      lat: -6.2080, lng: 106.8580,
      isOpen: true, rating: 4.7, reviewsCount: 5, totalOrders: 45,
      services: [
        { serviceName: 'Cuci Setrika Karyawan', pricePerUnit: 8000, unit: 'kg', estimatedDurationDays: 2, description: 'Paket kemeja & celana kerja rapi licin' },
        { serviceName: 'Cuci Kering Tanpa Setrika', pricePerUnit: 5500, unit: 'kg', estimatedDurationDays: 1, description: 'Cepat kering harum wangi' }
      ],
      reviews: [
        { buyerIdx: 2, rating: 5, serviceIdx: 0, comment: 'Kemeja kantor saya disetrika dengan garis lipatan yang sangat tegas dan rapi. Mantap Matraman Hub!', daysAgo: 1, photos: [] },
        { buyerIdx: 0, rating: 5, serviceIdx: 1, comment: 'Cucian kering sempurna walau cuaca di luar sedang hujan deras.', daysAgo: 3, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 4, rating: 4, serviceIdx: 0, comment: 'Admin sangat responsif via chat. Pengiriman sesuai jadwal.', daysAgo: 5, photos: [] },
        { buyerIdx: 1, rating: 5, serviceIdx: 0, comment: 'Wangi pelembutnya sangat tahan lama. Baju tidak mudah kusut saat dipakai kerja.', daysAgo: 7, photos: [] },
        { buyerIdx: 3, rating: 4, serviceIdx: 1, comment: 'Hemat dan bersih. Rekomendasi buat karyawan sekitar Matraman.', daysAgo: 9, photos: [] }
      ]
    },
    {
      email: 'laundry11@demo.com',
      ownerName: 'Pemilik Halim Wash',
      laundryName: 'Halim Executive Wash',
      address: 'Jl. Raya Halim Perdanakusuma No. 2, Makasar, Jakarta Timur',
      lat: -6.2600, lng: 106.8900,
      isOpen: true, rating: 4.9, reviewsCount: 5, totalOrders: 58,
      services: [
        { serviceName: 'Executive Wash & Iron', pricePerUnit: 10000, unit: 'kg', estimatedDurationDays: 2, description: 'Standar pencucian higienis maskapai/kantor' },
        { serviceName: 'Suit & Uniform Dry Cleaning', pricePerUnit: 35000, unit: 'pcs', estimatedDurationDays: 3, description: 'Khusus seragam resmi dan jas eksekutif' }
      ],
      reviews: [
        { buyerIdx: 0, rating: 5, serviceIdx: 1, comment: 'Seragam dinas saya dicuci dengan standar tinggi. Bersih tanpa noda, kerah kaku sempurna.', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 3, rating: 5, serviceIdx: 0, comment: 'Sangat teliti dalam pengerjaan. Tidak ada satu pun kancing yang kendur atau lepas.', daysAgo: 2, photos: [] },
        { buyerIdx: 1, rating: 5, serviceIdx: 1, comment: 'Jas dibungkus dalam cover jas pelindung. Terasa sangat premium di Halim.', daysAgo: 4, photos: [] },
        { buyerIdx: 5, rating: 5, serviceIdx: 0, comment: 'Pengantaran selalu on time. Sangat bisa diandalkan untuk mobilitas tinggi.', daysAgo: 6, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 0, comment: 'Wangi parfumnya mewah dan elegan. Baju terasa nyaman dipakai.', daysAgo: 8, photos: [] }
      ]
    },
    {
      email: 'laundry12@demo.com',
      ownerName: 'Pemilik Cililitan Fast',
      laundryName: 'Cililitan Fast Wash',
      address: 'Jl. Dewi Sartika No. 40, Cililitan, Jakarta Timur',
      lat: -6.2580, lng: 106.8660,
      isOpen: true, rating: 4.6, reviewsCount: 5, totalOrders: 36,
      services: [
        { serviceName: 'Cuci Setrika Mahasiswa / Kos', pricePerUnit: 7000, unit: 'kg', estimatedDurationDays: 2, description: 'Paket ekonomis bersih harum mawar' },
        { serviceName: 'Cuci Boneka Jumbo', pricePerUnit: 25000, unit: 'pcs', estimatedDurationDays: 3, description: 'Pencucian boneka besar bebas debu & tungau' }
      ],
      reviews: [
        { buyerIdx: 4, rating: 5, serviceIdx: 1, comment: 'Boneka beruang jumbo anak saya jadi wangi dan bulunya mengembang empuk lagi. Bebas debu!', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 0, rating: 4, serviceIdx: 0, comment: 'Cucian harian rapi dan harganya sangat cocok untuk anak kos sekitar Cililitan.', daysAgo: 3, photos: [] },
        { buyerIdx: 1, rating: 5, serviceIdx: 0, comment: 'Driver ramah dan tanggap saat ambil baju. Proses pengerjaan 2 hari tepat.', daysAgo: 5, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 0, comment: 'Bersih dan wanginya enak tidak bikin pusing.', daysAgo: 7, photos: [] },
        { buyerIdx: 3, rating: 5, serviceIdx: 1, comment: 'Boneka dicuci higienis dan dikemas plastik besar tertutup rapat.', daysAgo: 9, photos: [] }
      ]
    },
    {
      email: 'laundry13@demo.com',
      ownerName: 'Pemilik Klender Coin',
      laundryName: 'Klender Coin & Drop',
      address: 'Jl. I Gusti Ngurah Rai No. 80, Klender, Jakarta Timur',
      lat: -6.2180, lng: 106.9100,
      isOpen: true, rating: 4.7, reviewsCount: 5, totalOrders: 44,
      services: [
        { serviceName: 'Wash & Fold Reguler', pricePerUnit: 7500, unit: 'kg', estimatedDurationDays: 2, description: 'Deterjen anti bakteri + pengeringan mesin panas' },
        { serviceName: 'Cuci Selimut & Bedcover', pricePerUnit: 30000, unit: 'pcs', estimatedDurationDays: 3, description: 'Pencucian selimut tebal wangi lavender' }
      ],
      reviews: [
        { buyerIdx: 0, rating: 5, serviceIdx: 0, comment: 'Pakaian selalu harum dan bersih. Pengeringan mesin membuat baju tidak bau lembab walau cuaca mendung.', daysAgo: 1, photos: [] },
        { buyerIdx: 5, rating: 5, serviceIdx: 1, comment: 'Selimut tebal saya bersih maksimal dan wanginya bikin tidur lebih nyenyak.', daysAgo: 2, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 1, rating: 4, serviceIdx: 0, comment: 'Lokasi gampang dicari di Klender. Kurir jemput sangat cepat sampai.', daysAgo: 4, photos: [] },
        { buyerIdx: 3, rating: 5, serviceIdx: 0, comment: 'Timbangan akurat dan transparan. Packing baju sangat rapi.', daysAgo: 6, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 1, comment: 'Pembersihan noda di selimut cukup bagus. Rekomendasi di Klender.', daysAgo: 8, photos: [] }
      ]
    },
    {
      email: 'laundry14@demo.com',
      ownerName: 'Pemilik Ciracas Family',
      laundryName: 'Ciracas Family Laundry',
      address: 'Jl. Raya Kelapa Dua Wetan No. 14, Ciracas, Jakarta Timur',
      lat: -6.3250, lng: 106.8850,
      isOpen: true, rating: 4.8, reviewsCount: 5, totalOrders: 52,
      services: [
        { serviceName: 'Paket Keluarga Harum (10kg)', pricePerUnit: 6800, unit: 'kg', estimatedDurationDays: 2, description: 'Paket hemat cucian keluarga wangi akasia' },
        { serviceName: 'Cuci Gordyn & Tirai', pricePerUnit: 15000, unit: 'kg', estimatedDurationDays: 3, description: 'Pembersihan gorden jendela besar anti tungau' }
      ],
      reviews: [
        { buyerIdx: 1, rating: 5, serviceIdx: 1, comment: 'Gorden ruang tamu saya yang sudah berdebu tahunan jadi bersih cemerlang dan harum akasia segar!', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 0, rating: 5, serviceIdx: 0, comment: 'Sangat menghemat tenaga ibu rumah tangga. Cucian sekeluarga bersih semua.', daysAgo: 3, photos: [] },
        { buyerIdx: 4, rating: 5, serviceIdx: 0, comment: 'Pakaian dilipat sangat rapi per kategori pakaian anak dan dewasa. Teliti sekali.', daysAgo: 5, photos: [] },
        { buyerIdx: 2, rating: 4, serviceIdx: 0, comment: 'Admin komunikatif dan driver sopan. Terpercaya di wilayah Ciracas.', daysAgo: 7, photos: [] },
        { buyerIdx: 3, rating: 5, serviceIdx: 1, comment: 'Gorden tidak ada yang rusak pengaitnya. Hasil cuci memuaskan.', daysAgo: 10, photos: [] }
      ]
    },
    {
      email: 'laundry15@demo.com',
      ownerName: 'Pemilik Kramat Jati Bersih',
      laundryName: 'Kramat Jati Super Bersih',
      address: 'Jl. Raya Bogor Km. 19 No. 5, Kramat Jati, Jakarta Timur',
      lat: -6.2700, lng: 106.8700,
      isOpen: true, rating: 4.7, reviewsCount: 5, totalOrders: 48,
      services: [
        { serviceName: 'Cuci Setrika Higienis', pricePerUnit: 7500, unit: 'kg', estimatedDurationDays: 2, description: 'Pembersihan uap panas anti kuman & bakteri' },
        { serviceName: 'Cuci Stroller Anak', pricePerUnit: 45000, unit: 'pcs', estimatedDurationDays: 3, description: 'Deep wash & sanitasi stroller kereta dorong bayi' }
      ],
      reviews: [
        { buyerIdx: 0, rating: 5, serviceIdx: 1, comment: 'Stroller bayi saya dibongkar dan dicuci bersih di setiap sela-sela roda dan kainnya. Seperti baru lagi!', daysAgo: 1, photos: ['/placeholder-laundry.jpg'] },
        { buyerIdx: 2, rating: 5, serviceIdx: 0, comment: 'Pakaian kerja dan harian bersih higienis. Wanginya segar dan tidak apek.', daysAgo: 2, photos: [] },
        { buyerIdx: 3, rating: 4, serviceIdx: 0, comment: 'Lokasi strategis di Raya Bogor. Pengantaran on time oleh driver.', daysAgo: 4, photos: [] },
        { buyerIdx: 5, rating: 5, serviceIdx: 0, comment: 'Paking plastik rapi dan kedap udara. Pakaian tetap harum sampai dipakai.', daysAgo: 6, photos: [] },
        { buyerIdx: 1, rating: 4, serviceIdx: 1, comment: 'Sanitasi stroller sangat bagus. Nyaman dipakai anak untuk jalan-jalan lagi.', daysAgo: 8, photos: [] }
      ]
    }
  ]

  const createdSellers = []
  let sellerCounter = 1

  for (const sData of sellersData) {
    const user = await prisma.user.create({
      data: {
        email: sData.email,
        phone: `0812345679${(sellerCounter++).toString().padStart(2, '0')}`,
        passwordHash: password,
        role: 'seller',
        name: sData.ownerName,
        isVerified: true,
        seller: {
          create: {
            laundryName: sData.laundryName,
            ownerName: sData.ownerName,
            businessEmail: sData.email,
            address: sData.address,
            latitude: sData.lat,
            longitude: sData.lng,
            isOpen: sData.isOpen,
            averageRating: sData.rating,
            totalReviews: sData.reviewsCount,
            totalOrders: sData.totalOrders,
            operatingHours: {
              monday: '07:00-21:00',
              tuesday: '07:00-21:00',
              wednesday: '07:00-21:00',
              thursday: '07:00-21:00',
              friday: '07:00-21:00',
              saturday: '08:00-20:00',
              sunday: '09:00-17:00',
            },
            photos: [
              ['/laundry_modern.png', '/laundry_premium.png'],
              ['/laundry_premium.png', '/laundry_eco.png'],
              ['/laundry_eco.png', '/laundry_1.png'],
              ['/laundry_1.png', '/laundry_2.png'],
              ['/laundry_2.png', '/laundry_3.png'],
              ['/laundry_3.png', '/laundry_modern.png'],
            ][(sellerCounter - 1) % 6],
            services: {
              create: sData.services as any,
            },
          },
        },
      },
      include: {
        seller: {
          include: { services: true },
        },
      },
    })
    console.log(`  ✓ Created seller: ${sData.laundryName}`)
    createdSellers.push(user)
  }

  // ==== Driver ====
  const driverUser = await prisma.user.create({
    data: {
      email: 'driver@demo.com',
      phone: '081234567894',
      passwordHash: password,
      role: 'driver',
      name: 'Andi Kurir',
      isVerified: true,
      driver: {
        create: {
          fullName: 'Andi Kurir',
          ktpNumber: '3273010101010001',
          ktpPhoto: '/uploads/ktp/demo.jpg',
          simNumber: 'SIM-12345',
          simPhoto: '/uploads/sim/demo.jpg',
          vehicleType: 'motorcycle',
          vehiclePlate: 'B 1234 JKT',
          isOnline: true,
          currentLatitude: -6.2250,
          currentLongitude: 106.8900,
          averageRating: 4.8,
          totalDeliveries: 120,
        },
      },
    },
    include: { driver: true },
  })
  console.log('  ✓ Created driver:', driverUser.email)

  // ==== Seeding Orders & Reviews untuk 15 Mitra ====
  console.log('  ✓ Seeding Orders & Reviews untuk 15 Mitra...')
  const driver = driverUser.driver!

  let orderCounter = 1

  for (let i = 0; i < sellersData.length; i++) {
    const sData = sellersData[i]
    const sObj = createdSellers[i].seller!

    for (const rItem of sData.reviews) {
      const buyer = buyers[rItem.buyerIdx]
      const service = sObj.services[rItem.serviceIdx]
      const qty = service.unit === 'kg' ? 3.5 : 1
      const price = Number(service.pricePerUnit)
      const total = qty * price + 5000
      const pickupDate = new Date(Date.now() - rItem.daysAgo * 24 * 60 * 60 * 1000)
      const completedDate = new Date(pickupDate.getTime() + 24 * 60 * 60 * 1000)
      const addr = (buyer.addresses as any[])?.[0]?.address_line || 'Jl. Raden Inten II No. 45, Jakarta Timur'
      const lat = (buyer.addresses as any[])?.[0]?.latitude || -6.2350
      const lng = (buyer.addresses as any[])?.[0]?.longitude || 106.9200

      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-2026-${sObj.id}-${orderCounter++}`,
          buyerId: buyer.id,
          sellerId: sObj.id,
          serviceId: service.id,
          pickupAddress: addr,
          pickupLatitude: lat,
          pickupLongitude: lng,
          pickupDate: pickupDate,
          pickupTimeSlot: 'morning',
          pickupDriverId: driver.id,
          deliveryDriverId: driver.id,
          deliveryAddress: addr,
          estimatedWeight: qty,
          actualWeight: qty,
          estimatedPrice: qty * price,
          finalPrice: qty * price,
          deliveryFee: 5000,
          totalPrice: total,
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'qris',
          createdAt: pickupDate,
          pickedUpAt: new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000),
          arrivedAtLaundryAt: new Date(pickupDate.getTime() + 3 * 60 * 60 * 1000),
          washingStartedAt: new Date(pickupDate.getTime() + 4 * 60 * 60 * 1000),
          washingCompletedAt: new Date(completedDate.getTime() - 4 * 60 * 60 * 1000),
          deliveryStartedAt: new Date(completedDate.getTime() - 2 * 60 * 60 * 1000),
          deliveredAt: completedDate,
          completedAt: completedDate,
        },
      })

      await prisma.review.create({
        data: {
          orderId: order.id,
          buyerId: buyer.id,
          sellerId: sObj.id,
          laundryRating: rItem.rating,
          laundryReview: rItem.comment,
          driverId: driver.id,
          driverRating: 5,
          photos: rItem.photos && rItem.photos.length > 0 ? ['/review_clean.png'] : [],
          createdAt: completedDate,
        },
      })
    }
  }

  console.log('\n✅ Seed completed successfully (15 Mitra Jakarta Timur)!')
  console.log('\n📝 Akun Utama Anda (password: 12345678):')
  console.log('  - wicaksanakikiaimar@gmail.com (Customer - Kiki)')
  console.log('\n📝 Akun Mitra Laundry Demo (password: password123):')
  for (const sData of sellersData.slice(0, 5)) {
    console.log(`  - ${sData.email} (${sData.laundryName})`)
  }
  console.log('  ... dan 10 akun mitra lainnya (laundry6@demo.com s/d laundry15@demo.com)')
  console.log('\n📝 Akun Driver Demo (password: password123):')
  console.log('  - driver@demo.com (Mitra Kurir - Andi)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
