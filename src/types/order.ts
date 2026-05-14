import type { Seller, Service } from './laundry'

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'pending_pickup'
  | 'driver_on_way_pickup'
  | 'picked_up'
  | 'at_laundry'
  | 'payment_pending'
  | 'washing'
  | 'ready_for_delivery'
  | 'driver_on_way_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type PickupTimeSlot = 'morning' | 'afternoon' | 'evening'

export interface DriverInfo {
  id: string
  name: string
  phone: string
  vehiclePlate: string
  profilePhoto?: string
  currentLat?: number
  currentLng?: number
}

export interface OrderStatusEvent {
  status: OrderStatus
  notes?: string
  createdAt: string
  actorName?: string
}

export interface Order {
  id: string
  orderNumber: string
  buyerId: string
  seller: Pick<Seller, 'id' | 'laundryName' | 'photos'>
  service: Pick<Service, 'id' | 'serviceName' | 'pricePerUnit' | 'unit'>
  pickupAddress: string
  pickupLatitude: number
  pickupLongitude: number
  pickupDate: string
  pickupTimeSlot: PickupTimeSlot
  pickupDriver?: DriverInfo
  deliveryDriver?: DriverInfo
  estimatedWeight?: number
  actualWeight?: number
  estimatedPrice?: number
  finalPrice?: number
  deliveryFee: number
  totalPrice?: number
  status: OrderStatus
  buyerNotes?: string
  paymentStatus: 'pending' | 'paid'
  createdAt: string
  statusHistory: OrderStatusEvent[]
}
