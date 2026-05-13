export interface Service {
  id: string
  sellerId: string
  serviceName: string
  pricePerUnit: number
  unit: 'kg' | 'pcs'
  estimatedDurationDays: number
  description?: string
  isActive: boolean
}

export interface Seller {
  id: string
  laundryName: string
  ownerName: string
  address: string
  latitude: number
  longitude: number
  photos: string[]
  operatingHours: Record<string, string>
  isOpen: boolean
  averageRating: number
  totalReviews: number
  distanceKm?: number
  services: Service[]
}
