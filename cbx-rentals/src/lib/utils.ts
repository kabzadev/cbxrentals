import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility functions for CBX Rentals application

/**
 * Merge class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(arrivalDate: Date, exitDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000 // hours * minutes * seconds * milliseconds
  const diffDays = Math.round(
    Math.abs((exitDate.getTime() - arrivalDate.getTime()) / oneDay)
  )
  return diffDays
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX if US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  // Return original if not a standard US phone number
  return phone
}
