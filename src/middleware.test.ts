import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

/**
 * Helper to create a fake JWT token with a given payload.
 * Does NOT sign it — just base64url encodes header + payload + fake signature.
 */
function createFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'fake-signature'
  return `${header}.${body}.${signature}`
}

/**
 * Helper to create a NextRequest with optional auth-token cookie.
 */
function createRequest(pathname: string, token?: string): NextRequest {
  const url = new URL(pathname, 'http://localhost:3000')
  const request = new NextRequest(url)
  if (token) {
    request.cookies.set('auth-token', token)
  }
  return request
}

describe('middleware', () => {
  describe('unauthenticated access', () => {
    it('redirects to /login when no token is present', () => {
      const request = createRequest('/explore')
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/login')
    })

    it('redirects to /login when token is malformed', () => {
      const request = createRequest('/explore', 'not-a-valid-jwt')
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/login')
    })

    it('redirects to /login when token has no role', () => {
      const token = createFakeJwt({ id: '123', email: 'test@test.com' })
      const request = createRequest('/explore', token)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/login')
    })
  })

  describe('buyer role access', () => {
    const buyerToken = createFakeJwt({ role: 'buyer', id: '1' })

    it('allows buyer to access /explore', () => {
      const request = createRequest('/explore', buyerToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('allows buyer to access /laundry/123', () => {
      const request = createRequest('/laundry/123', buyerToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('allows buyer to access /order/create', () => {
      const request = createRequest('/order/create', buyerToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('allows buyer to access /my-orders', () => {
      const request = createRequest('/my-orders', buyerToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('allows buyer to access /chat', () => {
      const request = createRequest('/chat', buyerToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('allows buyer to access /profile', () => {
      const request = createRequest('/profile', buyerToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('redirects buyer to /explore when accessing /seller/dashboard', () => {
      const request = createRequest('/seller/dashboard', buyerToken)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/explore')
    })

    it('redirects buyer to /explore when accessing /driver/dashboard', () => {
      const request = createRequest('/driver/dashboard', buyerToken)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/explore')
    })
  })

  describe('seller role access', () => {
    const sellerToken = createFakeJwt({ role: 'seller', id: '2' })

    it('allows seller to access /seller/dashboard', () => {
      const request = createRequest('/seller/dashboard', sellerToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('allows seller to access /seller/orders', () => {
      const request = createRequest('/seller/orders', sellerToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('redirects seller to /seller/dashboard when accessing /driver/dashboard', () => {
      const request = createRequest('/driver/dashboard', sellerToken)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/seller/dashboard')
    })

    it('redirects seller to /seller/dashboard when accessing /explore', () => {
      const request = createRequest('/explore', sellerToken)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/seller/dashboard')
    })

    it('redirects seller to /seller/dashboard when accessing /my-orders', () => {
      const request = createRequest('/my-orders', sellerToken)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/seller/dashboard')
    })
  })

  describe('driver role access', () => {
    const driverToken = createFakeJwt({ role: 'driver', id: '3' })

    it('allows driver to access /driver/dashboard', () => {
      const request = createRequest('/driver/dashboard', driverToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('allows driver to access /driver/orders/123', () => {
      const request = createRequest('/driver/orders/123', driverToken)
      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('redirects driver to /driver/dashboard when accessing /seller/dashboard', () => {
      const request = createRequest('/seller/dashboard', driverToken)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/driver/dashboard')
    })

    it('redirects driver to /driver/dashboard when accessing /explore', () => {
      const request = createRequest('/explore', driverToken)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/driver/dashboard')
    })

    it('redirects driver to /driver/dashboard when accessing /chat', () => {
      const request = createRequest('/chat', driverToken)
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/driver/dashboard')
    })
  })
})
