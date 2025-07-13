/**
 * Format a phone number for display
 * Handles US numbers (10 digits) and international numbers
 * @param phone - Phone number as string of digits
 * @returns Formatted phone number with dashes
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle US phone numbers (10 digits)
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Handle US phone numbers with country code (11 digits starting with 1)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Handle international numbers (keep as is but add + prefix if not present)
  if (digits.length > 10) {
    return phone.startsWith('+') ? phone : `+${phone}`;
  }
  
  // For any other format, return as is
  return phone;
}