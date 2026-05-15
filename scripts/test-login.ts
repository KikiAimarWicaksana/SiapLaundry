/**
 * Test login API directly (bypass HTTP layer)
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { verifyPassword, signAccessToken, signRefreshToken } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  const emailOrPhone = 'buyer@demo.com'
  const password = 'password123'
  const role = 'buyer'

  console.log('Testing login for:', emailOrPhone, 'role:', role)

  const user = await prisma.user.findFirst({
    where: {
      role,
      OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    },
  })

  if (!user) {
    console.error('❌ User not found')
    return
  }
  console.log('✓ User found:', user.email, 'role:', user.role)

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    console.error('❌ Password invalid')
    return
  }
  console.log('✓ Password valid')

  const payload = { userId: user.id, role: user.role, email: user.email }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)
  console.log('✓ Tokens generated')
  console.log('  Access token (first 50 chars):', accessToken.substring(0, 50) + '...')

  // Test saving refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  })
  console.log('✓ Refresh token saved to DB')

  console.log('\n✅ Login flow works correctly!')
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(() => prisma.$disconnect())
