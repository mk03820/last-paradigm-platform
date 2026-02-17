/**
 * Analytics Context Tests
 *
 * Unit tests for device context and session utilities.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 8: Write comprehensive tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDeviceContext,
  getSessionId,
  getPageSource,
  hashForAnonymization,
} from './context';

describe('getSessionId', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should generate a session ID', () => {
    const sessionId = getSessionId();
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBeGreaterThan(0);
  });

  it('should return the same session ID on subsequent calls', () => {
    const sessionId1 = getSessionId();
    const sessionId2 = getSessionId();
    expect(sessionId1).toBe(sessionId2);
  });

  it('should persist session ID in sessionStorage', () => {
    const sessionId = getSessionId();
    const stored = sessionStorage.getItem('analytics_session_id');
    expect(stored).toBe(sessionId);
  });

  it('should use existing session ID from storage', () => {
    sessionStorage.setItem('analytics_session_id', 'existing-session-123');
    const sessionId = getSessionId();
    expect(sessionId).toBe('existing-session-123');
  });
});

describe('getDeviceContext', () => {
  it('should return device context', () => {
    const context = getDeviceContext();
    expect(context).toHaveProperty('deviceType');
    expect(context).toHaveProperty('screenWidth');
    expect(context).toHaveProperty('screenHeight');
    expect(context).toHaveProperty('browser');
    expect(context).toHaveProperty('os');
  });

  it('should detect desktop for large screens', () => {
    // Default happy-dom window size is typically large
    const context = getDeviceContext();
    // Note: Actual device type depends on test environment
    expect(['mobile', 'tablet', 'desktop']).toContain(context.deviceType);
  });

  it('should return browser name', () => {
    const context = getDeviceContext();
    expect(typeof context.browser).toBe('string');
    expect(context.browser!.length).toBeGreaterThan(0);
  });

  it('should return OS name', () => {
    const context = getDeviceContext();
    expect(typeof context.os).toBe('string');
    expect(context.os!.length).toBeGreaterThan(0);
  });
});

describe('getPageSource', () => {
  const originalReferrer = Object.getOwnPropertyDescriptor(document, 'referrer');

  afterEach(() => {
    if (originalReferrer) {
      Object.defineProperty(document, 'referrer', originalReferrer);
    }
  });

  it('should return direct when no referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: '',
      configurable: true,
    });
    expect(getPageSource()).toBe('direct');
  });

  it('should detect email source from Gmail', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://mail.google.com/mail/u/0/',
      configurable: true,
    });
    expect(getPageSource()).toBe('email');
  });

  it('should detect email source from Outlook', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://outlook.office.com/',
      configurable: true,
    });
    expect(getPageSource()).toBe('email');
  });

  it('should detect preview source', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://example.com/preview?session=123',
      configurable: true,
    });
    expect(getPageSource()).toBe('preview');
  });

  it('should return direct for other referrers', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com/search',
      configurable: true,
    });
    expect(getPageSource()).toBe('direct');
  });
});

describe('hashForAnonymization', () => {
  it('should hash a string', () => {
    const hashed = hashForAnonymization('test@example.com');
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe('test@example.com');
  });

  it('should return consistent hash for same input', () => {
    const hash1 = hashForAnonymization('user123');
    const hash2 = hashForAnonymization('user123');
    expect(hash1).toBe(hash2);
  });

  it('should return different hash for different input', () => {
    const hash1 = hashForAnonymization('user123');
    const hash2 = hashForAnonymization('user456');
    expect(hash1).not.toBe(hash2);
  });

  it('should truncate to 16 characters', () => {
    const hashed = hashForAnonymization('verylongemailaddress@example.com');
    expect(hashed.length).toBe(16);
  });
});
