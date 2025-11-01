import { headers } from 'next/headers';

/**
 * Get client IP address from request headers
 * Used for anonymous voting
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  
  // Try x-forwarded-for first (most common in production)
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  // Try x-real-ip
  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  // Fallback to unknown (should rarely happen)
  return 'unknown';
}
