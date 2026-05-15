/**
 * Seed script — populate database with demo data.
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
  console.log('🌱 Starting seed...')

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

  // ==== Buyer ====
  const buyerUser = await prisma.user.create({
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
              address_line: 'Jl. Merdeka No. 10, Bandung',
              latitude: -6.9175,
              longitude: 107.6191,
              is_default: true,
            },
          ],
        },
      },
    },
  })
  console.log('  ✓ Created buyer:', buyerUser.email)

  // ==== Sellers (3 laundry) ====
  const seller1User = await prisma.user.create({
    data: {
      email: 'laundry1@demo.com',
      phone: '081234567891',
      passwordHash: password,
      role: 'seller',
      name: 'Pemilik Laundry Cemerlang',
      isVerified: true,
      seller: {
        create: {
          laundryName: 'Laundry Bersih Cemerlang',
          ownerName: 'Pemilik Laundry Cemerlang',
          businessEmail: 'laundry1@demo.com',
          address: 'Jl. Asia Afrika No. 5, Bandung',
          latitude: -6.921,
          longitude: 107.607,
          isOpen: true,
          averageRating: 4.8,
          totalReviews: 120,
          operatingHours: {
            monday: '08:00-20:00',
            tuesday: '08:00-20:00',
            wednesday: '08:00-20:00',
            thursday: '08:00-20:00',
            friday: '08:00-20:00',
            saturday: '09:00-18:00',
            sunday: 'Tutup',
          },
          photos: ['/placeholder-laundry.jpg'],
          services: {
            create: [
              {
                serviceName: 'Cuci Setrika',
                pricePerUnit: 7000,
                unit: 'kg',
                estimatedDurationDays: 2,
                description: 'Cuci + setrika rapi',
              },
              {
                serviceName: 'Cuci Kering',
                pricePerUnit: 5000,
                unit: 'kg',
                estimatedDurationDays: 1,
                description: 'Cuci kering tanpa setrika',
              },
              {
                serviceName: 'Dry Clean',
                pricePerUnit: 25000,
                unit: 'pcs',
                estimatedDurationDays: 3,
                description: 'Untuk jas, gaun, dll',
              },
            ],
          },
        },
      },
    },
  })
  console.log('  ✓ Created seller 1:', seller1User.email)

  const seller2User = await prisma.user.create({
    data: {
      email: 'laundry2@demo.com',
      phone: '081234567892',
      passwordHash: password,
      role: 'seller',
      name: 'Pemilik Laundry Kilat',
      isVerified: true,
      seller: {
        create: {
          laundryName: 'Laundry Express Kilat',
          ownerName: 'Pemilik Laundry Kilat',
          businessEmail: 'laundry2@demo.com',
          address: 'Jl. Dago No. 33, Bandung',
          latitude: -6.892,
          longitude: 107.614,
          isOpen: true,
          averageRating: 4.5,
          totalReviews: 85,
          operatingHours: {
            monday: '07:00-21:00',
            tuesday: '07:00-21:00',
            wednesday: '07:00-21:00',
            thursday: '07:00-21:00',
            friday: '07:00-21:00',
            saturday: '08:00-19:00',
            sunday: '09:00-17:00',
          },
          photos: ['/placeholder-laundry.jpg'],
          services: {
            create: [
              {
                serviceName: 'Cuci Setrika Express',
                pricePerUnit: 10000,
                unit: 'kg',
                estimatedDurationDays: 1,
                description: 'Selesai dalam 1 hari',
              },
              {
                serviceName: 'Setrika Saja',
                pricePerUnit: 4000,
                unit: 'kg',
                estimatedDurationDays: 1,
              },
            ],
          },
        },
      },
    },
  })
  console.log('  ✓ Created seller 2:', seller2User.email)

  const seller3User = await prisma.user.create({
    data: {
      email: 'laundry3@demo.com',
      phone: '081234567893',
      passwordHash: password,
      role: 'seller',
      name: 'Pemilik Wangi Laundry',
      isVerified: true,
      seller: {
        create: {
          laundryName: 'Wangi Laundry Premium',
          ownerName: 'Pemilik Wangi Laundry',
          businessEmail: 'laundry3@demo.com',
          address: 'Jl. Braga No. 77, Bandung',
          latitude: -6.918,
          longitude: 107.608,
          isOpen: false,
          averageRating: 4.9,
          totalReviews: 210,
          operatingHours: {
            monday: '09:00-19:00',
            tuesday: '09:00-19:00',
            wednesday: '09:00-19:00',
            thursday: '09:00-19:00',
            friday: '09:00-19:00',
            saturday: '09:00-19:00',
            sunday: 'Tutup',
          },
          photos: ['/placeholder-laundry.jpg'],
          services: {
            create: [
              {
                serviceName: 'Premium Wash',
                pricePerUnit: 12000,
                unit: 'kg',
                estimatedDurationDays: 2,
                description: 'Premium detergent + pewangi khusus',
              },
              {
                serviceName: 'Dry Clean Jas',
                pricePerUnit: 35000,
                unit: 'pcs',
                estimatedDurationDays: 3,
              },
            ],
          },
        },
      },
    },
  })
  console.log('  ✓ Created seller 3:', seller3User.email)

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
          vehiclePlate: 'D 1234 XY',
          isOnline: false,
          averageRating: 4.7,
          totalDeliveries: 45,
        },
      },
    },
  })
  console.log('  ✓ Created driver:', driverUser.email)

  console.log('\n✅ Seed completed!')
  console.log('\n📝 Demo accounts (password: password123):')
  console.log('  - buyer@demo.com (Customer)')
  console.log('  - laundry1@demo.com (Mitra Laundry)')
  console.log('  - laundry2@demo.com (Mitra Laundry)')
  console.log('  - laundry3@demo.com (Mitra Laundry)')
  console.log('  - driver@demo.com (Mitra Kurir)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
