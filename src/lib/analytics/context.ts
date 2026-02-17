/**
 * Analytics Context Utilities
 *
 * Helper functions for collecting device context and session information
 * for analytics events.
 *
 * Story 17.8: Purchase Analytics Events
 * Covers: AC5 (device context for purchase-related events)
 */

import type { DeviceContext } from './types';

/**
 * Session ID storage key
 */
const SESSION_ID_KEY = 'analytics_session_id';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}

/**
 * Get or create a session ID for the current browser session
 * Persists across page navigations within the same session
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Get the browser name from user agent
 */
function getBrowserName(): string {
  if (typeof navigator === 'undefined') return 'Unknown';

  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edge')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

/**
 * Get the OS name from user agent
 */
function getOSName(): string {
  if (typeof navigator === 'undefined') return 'Unknown';

  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  return 'Other';
}

/**
 * Get device context for analytics events
 * Returns device type, browser, OS, and screen dimensions
 */
export function getDeviceContext(): Partial<DeviceContext> {
  if (typeof window === 'undefined') {
    return {};
  }

  const width = window.innerWidth;
  let deviceType: DeviceContext['deviceType'] = 'desktop';

  if (width < 768) {
    deviceType = 'mobile';
  } else if (width < 1024) {
    deviceType = 'tablet';
  }

  return {
    deviceType,
    screenWidth: width,
    screenHeight: window.innerHeight,
    browser: getBrowserName(),
    os: getOSName(),
  };
}

/**
 * Hash a string using a simple encoding for anonymization
 * Note: This is NOT cryptographically secure - use for basic anonymization only
 */
export function hashForAnonymization(value: string): string {
  // Simple base64 encoding, truncated
  if (typeof btoa !== 'undefined') {
    return btoa(value).substring(0, 16);
  }

  // Server-side fallback
  return Buffer.from(value).toString('base64').substring(0, 16);
}

/**
 * Get page source from referrer or direct
 */
export function getPageSource(): 'preview' | 'email' | 'direct' {
  if (typeof document === 'undefined') {
    return 'direct';
  }

  const referrer = document.referrer;

  if (!referrer) {
    return 'direct';
  }

  // Check if coming from email service
  if (
    referrer.includes('mail.google.com') ||
    referrer.includes('outlook.') ||
    referrer.includes('mail.yahoo.com')
  ) {
    return 'email';
  }

  // Check if internal navigation from preview
  if (referrer.includes('/preview')) {
    return 'preview';
  }

  return 'direct';
}
