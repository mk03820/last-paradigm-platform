import { describe, it, expect } from 'vitest';
import { emailSchema, emailSubmissionSchema } from '@/lib/schemas/email.schema';

describe('emailSchema', () => {
  describe('valid emails', () => {
    it('should accept a valid email', () => {
      const result = emailSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should accept email with subdomain', () => {
      const result = emailSchema.safeParse({ email: 'user@mail.example.com' });
      expect(result.success).toBe(true);
    });

    it('should accept email with plus sign', () => {
      const result = emailSchema.safeParse({ email: 'user+tag@example.com' });
      expect(result.success).toBe(true);
    });

    it('should accept email with dots in local part', () => {
      const result = emailSchema.safeParse({ email: 'first.last@example.com' });
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from email', () => {
      const result = emailSchema.safeParse({ email: '  test@example.com  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });
  });

  describe('invalid emails', () => {
    it('should reject empty email', () => {
      const result = emailSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Email address is required');
      }
    });

    it('should reject missing email field', () => {
      const result = emailSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject email without @', () => {
      const result = emailSchema.safeParse({ email: 'testexample.com' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Please enter a valid email address');
      }
    });

    it('should reject email without domain', () => {
      const result = emailSchema.safeParse({ email: 'test@' });
      expect(result.success).toBe(false);
    });

    it('should reject email without local part', () => {
      const result = emailSchema.safeParse({ email: '@example.com' });
      expect(result.success).toBe(false);
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = emailSchema.safeParse({ email: longEmail });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Email address is too long');
      }
    });

    it('should reject non-string email', () => {
      const result = emailSchema.safeParse({ email: 123 });
      expect(result.success).toBe(false);
    });

    it('should reject email with spaces', () => {
      const result = emailSchema.safeParse({ email: 'test @example.com' });
      expect(result.success).toBe(false);
    });
  });
});

describe('emailSubmissionSchema', () => {
  it('should include source field with default value', () => {
    const result = emailSubmissionSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe('meeting-audit-results');
    }
  });

  it('should accept custom source', () => {
    const result = emailSubmissionSchema.safeParse({
      email: 'test@example.com',
      source: 'custom-source',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe('custom-source');
    }
  });

  it('should reject source that is too long', () => {
    const result = emailSubmissionSchema.safeParse({
      email: 'test@example.com',
      source: 'a'.repeat(51),
    });
    expect(result.success).toBe(false);
  });
});
