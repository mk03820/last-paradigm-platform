/**
 * Invoice Notification Email Service Tests
 *
 * Tests for invoice request email notifications.
 *
 * Story 17.7: Invoice Request Flow
 * Task 7.4: Test email notification sending
 * Covers: AC4, AC7 (email notification to admin team)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sendInvoiceRequestNotification,
  sendInvoiceRequestConfirmation,
  type InvoiceRequestNotificationData,
} from '@/lib/email/invoice-notifications';

// Mock email client
vi.mock('@/lib/email/client', () => ({
  sendEmail: vi.fn(),
}));

import { sendEmail } from '@/lib/email/client';

describe('sendInvoiceRequestNotification', () => {
  const mockData: InvoiceRequestNotificationData = {
    requestId: 'req_123456',
    companyName: 'Acme Corporation',
    billingEmail: 'billing@acme.com',
    billingAddress: {
      street: '123 Business St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    poNumber: 'PO-12345',
    userName: 'John Doe',
    userEmail: 'john@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BILLING_ADMIN_EMAIL = 'billing-admin@example.com';
    process.env.ADMIN_ALERT_EMAIL = 'admin@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';
  });

  afterEach(() => {
    delete process.env.BILLING_ADMIN_EMAIL;
    delete process.env.ADMIN_ALERT_EMAIL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    vi.restoreAllMocks();
  });

  describe('Email Configuration', () => {
    it('should use BILLING_ADMIN_EMAIL when set', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
      process.env.BILLING_ADMIN_EMAIL = 'billing-team@example.com';

      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'billing-team@example.com',
        })
      );
    });

    it('should fall back to ADMIN_ALERT_EMAIL when BILLING_ADMIN_EMAIL not set', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
      delete process.env.BILLING_ADMIN_EMAIL;
      process.env.ADMIN_ALERT_EMAIL = 'admin-fallback@example.com';

      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin-fallback@example.com',
        })
      );
    });

    it('should return false when no admin email is configured', async () => {
      delete process.env.BILLING_ADMIN_EMAIL;
      delete process.env.ADMIN_ALERT_EMAIL;

      const result = await sendInvoiceRequestNotification(mockData);

      expect(result).toBe(false);
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('Email Content', () => {
    beforeEach(() => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
    });

    it('should include ACTION REQUIRED in subject', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('[ACTION REQUIRED]'),
        })
      );
    });

    it('should include company name in subject', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Acme Corporation'),
        })
      );
    });

    it('should include company name in text body', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Acme Corporation'),
        })
      );
    });

    it('should include billing email in body', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('billing@acme.com'),
        })
      );
    });

    it('should include formatted billing address', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('123 Business St, New York, NY 10001, United States'),
        })
      );
    });

    it('should include PO number when provided', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('PO-12345'),
        })
      );
    });

    it('should handle missing PO number', async () => {
      const dataWithoutPO = { ...mockData, poNumber: null };

      await sendInvoiceRequestNotification(dataWithoutPO);

      // Should still send successfully
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should include user name', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('John Doe'),
        })
      );
    });

    it('should include user email', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('john@example.com'),
        })
      );
    });

    it('should include admin panel link', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('https://app.example.com/admin/invoices'),
        })
      );
    });

    it('should include next steps instructions', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Create invoice in Stripe'),
        })
      );
    });

    it('should include price in body', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('$2,500'),
        })
      );
    });
  });

  describe('HTML Content', () => {
    beforeEach(() => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
    });

    it('should include HTML content', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.any(String),
        })
      );
    });

    it('should escape HTML in company name', async () => {
      const dataWithHtml = {
        ...mockData,
        companyName: '<script>alert("xss")</script>',
      };

      await sendInvoiceRequestNotification(dataWithHtml);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.not.stringContaining('<script>'),
        })
      );
    });

    it('should include admin panel button in HTML', async () => {
      await sendInvoiceRequestNotification(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('View in Admin Panel'),
        })
      );
    });
  });

  describe('Return Value', () => {
    it('should return true when email is sent successfully', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });

      const result = await sendInvoiceRequestNotification(mockData);

      expect(result).toBe(true);
    });

    it('should return false when email fails to send', async () => {
      vi.mocked(sendEmail).mockResolvedValue({
        success: false,
        error: 'SMTP error',
      });

      const result = await sendInvoiceRequestNotification(mockData);

      expect(result).toBe(false);
    });
  });
});

describe('sendInvoiceRequestConfirmation', () => {
  const mockData: InvoiceRequestNotificationData = {
    requestId: 'req_123456',
    companyName: 'Acme Corporation',
    billingEmail: 'billing@acme.com',
    billingAddress: {
      street: '123 Business St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    poNumber: 'PO-12345',
    userName: 'John Doe',
    userEmail: 'john@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Email Recipient', () => {
    it('should send to user email', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
        })
      );
    });
  });

  describe('Email Content', () => {
    it('should have appropriate subject line', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Invoice Request Received'),
        })
      );
    });

    it('should include The Last Paradigm in subject', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('The Last Paradigm'),
        })
      );
    });

    it('should greet user by name', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('John Doe'),
        })
      );
    });

    it('should include company name', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Acme Corporation'),
        })
      );
    });

    it('should include billing email', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('billing@acme.com'),
        })
      );
    });

    it('should include PO number when provided', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('PO-12345'),
        })
      );
    });

    it('should mention 1 business day timeline', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('1 business day'),
        })
      );
    });

    it('should include contact email', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('billing@lastparadigm.com'),
        })
      );
    });

    it('should include signature', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('The Last Paradigm Team'),
        })
      );
    });
  });

  describe('HTML Content', () => {
    it('should include HTML version', async () => {
      await sendInvoiceRequestConfirmation(mockData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.any(String),
        })
      );
    });

    it('should escape user input in HTML', async () => {
      const dataWithHtml = {
        ...mockData,
        userName: '<script>alert("xss")</script>',
      };

      await sendInvoiceRequestConfirmation(dataWithHtml);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.not.stringContaining('<script>'),
        })
      );
    });
  });

  describe('Return Value', () => {
    it('should return true on success', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });

      const result = await sendInvoiceRequestConfirmation(mockData);

      expect(result).toBe(true);
    });

    it('should return false on failure', async () => {
      vi.mocked(sendEmail).mockResolvedValue({
        success: false,
        error: 'Email failed',
      });

      const result = await sendInvoiceRequestConfirmation(mockData);

      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined PO number', async () => {
      const dataWithoutPO = { ...mockData, poNumber: undefined };

      await sendInvoiceRequestConfirmation(dataWithoutPO);

      expect(sendEmail).toHaveBeenCalled();
    });

    it('should handle null PO number', async () => {
      const dataWithoutPO = { ...mockData, poNumber: null };

      await sendInvoiceRequestConfirmation(dataWithoutPO);

      expect(sendEmail).toHaveBeenCalled();
    });

    it('should handle special characters in company name', async () => {
      const dataWithSpecialChars = {
        ...mockData,
        companyName: 'ABC & Sons "Corp"',
      };

      await sendInvoiceRequestConfirmation(dataWithSpecialChars);

      expect(sendEmail).toHaveBeenCalled();
    });

    it('should handle international characters', async () => {
      const dataWithInternational = {
        ...mockData,
        companyName: 'Müller & Söhne GmbH',
        billingAddress: {
          ...mockData.billingAddress,
          city: 'München',
        },
      };

      await sendInvoiceRequestConfirmation(dataWithInternational);

      expect(sendEmail).toHaveBeenCalled();
    });
  });
});
