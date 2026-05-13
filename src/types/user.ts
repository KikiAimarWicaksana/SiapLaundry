export type UserRole = 'buyer' | 'seller' | 'driver'

export interface AuthUser {
  id: string
  email: string
  phone: string
  name: string
  role: UserRole
  profilePhoto?: string
  isVerified: boolean
}

export interface LoginCredentials {
  emailOrPhone: string
  password: string
  role: UserRole
}

export interface RegisterBuyerData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address: string
  latitude: number
  longitude: number
}

export interface RegisterSellerData {
  laundryName: string
  ownerName: string
  email: string
  phone: string
  password: string
  address: string
  latitude: number
  longitude: number
  photos?: File[]
  operatingHours: Record<string, string>
}

export interface RegisterDriverData {
  name: string
  phone: string
  email: string
  password: string
  ktpPhoto: File
  simPhoto: File
  vehicleType: string
  vehiclePlate: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}
