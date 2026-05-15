import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'buyer@demo.com' },
  })
  console.log('User found:', JSON.stringify(user, null, 2))

  if (user) {
    const valid = await bcrypt.compare('password123', user.passwordHash)
    console.log('Password valid:', valid)
  }
}

main().finally(() => prisma.$disconnect())
