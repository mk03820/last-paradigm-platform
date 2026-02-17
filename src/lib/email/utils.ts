/**
 * Email Utility Functions
 *
 * Helper utilities for email operations including token generation,
 * formatting, and HTML escaping.
 *
 * Story 20.1: Email Template System
 * Task 4: Create email helper utilities (AC: 4)
 * Covers: FR62 (Dynamic content support)
 */

import * as crypto from 'crypto';

/**
 * Generate a secure random token for email operations
 * (unsubscribe links, email verification, etc.)
 *
 * @param length - Length of the token in bytes (default 32)
 * @returns Base64 URL-safe token string
 */
export function generateEmailToken(length = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Escape HTML special characters to prevent XSS
 *
 * @param unsafe - String that may contain HTML characters
 * @returns Escaped string safe for HTML rendering
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format a number as currency
 *
 * @param amount - Amount in dollars (not cents)
 * @param currency - Currency code (default 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with thousands separators
 *
 * @param value - Number to format
 * @returns Formatted string with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a percentage value
 *
 * @param value - Decimal value (e.g., 0.25 for 25%)
 * @param decimals - Number of decimal places (default 0)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Get a user's first name from their full name or email
 *
 * @param name - User's full name or null
 * @param email - User's email as fallback
 * @returns First name or "there" if no name available
 */
export function getFirstName(name: string | null | undefined, email?: string): string {
  if (name) {
    const firstName = name.split(' ')[0];
    return firstName || 'there';
  }

  if (email) {
    // Extract name-like portion from email (before @ and without numbers)
    const localPart = email.split('@')[0];
    const namePart = localPart.replace(/[0-9._-]+/g, '');
    if (namePart && namePart.length >= 2) {
      return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    }
  }

  return 'there';
}

/**
 * Generate an unsubscribe URL with secure token
 *
 * @param email - User's email address
 * @param token - Unsubscribe token
 * @param baseUrl - Platform base URL
 * @returns Full unsubscribe URL
 */
export function generateUnsubscribeUrl(
  email: string,
  token: string,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lastparadigm.com'
): string {
  const params = new URLSearchParams({
    email,
    token,
  });
  return `${baseUrl}/unsubscribe?${params.toString()}`;
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns true if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate days between two dates
 *
 * @param date1 - Start date
 * @param date2 - End date (default now)
 * @returns Number of days difference
 */
export function daysBetween(date1: Date, date2 = new Date()): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
}

/**
 * Get scheduled send time for nurture email
 *
 * @param triggerDate - Date the nurture sequence was triggered
 * @param day - Nurture email day (0, 3, 7, 10, 14)
 * @returns Scheduled send date
 */
export function getNurtureEmailSchedule(triggerDate: Date, day: number): Date {
  const scheduled = new Date(triggerDate);
  scheduled.setDate(scheduled.getDate() + day);
  return scheduled;
}
