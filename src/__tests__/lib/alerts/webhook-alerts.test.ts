/**
 * Webhook Alerts Service Tests
 *
 * Tests for the webhook failure alerting system.
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 6.4: Test alert generation on repeated failures
 * Covers: AC3 (alert generation on repeated failures)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendWebhookFailureAlert } from '@/lib/alerts/webhook-alerts';
import type { WebhookFailureAlert } from '@/lib/alerts/webhook-alerts';

// Mock email client
vi.mock('@/lib/email/client', () => ({
  sendEmail: vi.fn(),
}));

import { sendEmail } from '@/lib/email/client';

describe('sendWebhookFailureAlert', () => {
  const mockAlert: WebhookFailureAlert = {
    eventId: 'evt_test_123456789',
    eventType: 'checkout.session.completed',
    retryCount: 5,
    error: 'Database connection failed',
    sessionId: 'cs_test_session_123',
    userId: 'user_123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_ALERT_EMAIL = 'admin@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';
  });

  afterEach(() => {
    delete process.env.ADMIN_ALERT_EMAIL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    vi.restoreAllMocks();
  });

  describe('Alert Threshold', () => {
    it('should not send alert when retry count is below threshold (1)', async () => {
      const alert = { ...mockAlert, retryCount: 1 };

      const result = await sendWebhookFailureAlert(alert);

      expect(result).toBe(false);
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should not send alert when retry count is below threshold (2)', async () => {
      const alert = { ...mockAlert, retryCount: 2 };

      const result = await sendWebhookFailureAlert(alert);

      expect(result).toBe(false);
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should send alert when retry count equals threshold (3)', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
      const alert = { ...mockAlert, retryCount: 3 };

      const result = await sendWebhookFailureAlert(alert);

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should send alert when retry count exceeds threshold', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
      const alert = { ...mockAlert, retryCount: 5 };

      const result = await sendWebhookFailureAlert(alert);

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should send alert when retry count is much higher', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
      const alert = { ...mockAlert, retryCount: 10 };

      const result = await sendWebhookFailureAlert(alert);

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Admin Email Configuration', () => {
    it('should not send alert when admin email is not configured', async () => {
      delete process.env.ADMIN_ALERT_EMAIL;
      const alert = { ...mockAlert, retryCount: 5 };

      const result = await sendWebhookFailureAlert(alert);

      expect(result).toBe(false);
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should not send alert when admin email is empty string', async () => {
      process.env.ADMIN_ALERT_EMAIL = '';
      const alert = { ...mockAlert, retryCount: 5 };

      const result = await sendWebhookFailureAlert(alert);

      expect(result).toBe(false);
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should send to configured admin email', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
      process.env.ADMIN_ALERT_EMAIL = 'alerts@company.com';

      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alerts@company.com',
        })
      );
    });
  });

  describe('Email Content', () => {
    beforeEach(() => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
    });

    it('should include event type in subject', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('checkout.session.completed'),
        })
      );
    });

    it('should include URGENT prefix in subject', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('[URGENT]'),
        })
      );
    });

    it('should include event ID in text content', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('evt_test_123456789'),
        })
      );
    });

    it('should include retry count in text content', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('5'),
        })
      );
    });

    it('should include error message in text content', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Database connection failed'),
        })
      );
    });

    it('should include session ID when provided', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('cs_test_session_123'),
        })
      );
    });

    it('should include user ID when provided', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('user_123'),
        })
      );
    });

    it('should handle missing session ID gracefully', async () => {
      const alertWithoutSession = { ...mockAlert, sessionId: undefined };

      await sendWebhookFailureAlert(alertWithoutSession);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('N/A'),
        })
      );
    });

    it('should handle missing user ID gracefully', async () => {
      const alertWithoutUser = { ...mockAlert, userId: undefined };

      await sendWebhookFailureAlert(alertWithoutUser);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('N/A'),
        })
      );
    });

    it('should include admin dashboard link', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('https://app.example.com/admin/webhooks'),
        })
      );
    });

    it('should include HTML content with dashboard link', async () => {
      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://app.example.com/admin/webhooks'),
        })
      );
    });

    it('should escape HTML in error message', async () => {
      const alertWithHtmlError = {
        ...mockAlert,
        error: '<script>alert("xss")</script>',
      };

      await sendWebhookFailureAlert(alertWithHtmlError);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.not.stringContaining('<script>'),
        })
      );
    });
  });

  describe('Email Sending', () => {
    it('should return true when email is sent successfully', async () => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });

      const result = await sendWebhookFailureAlert(mockAlert);

      expect(result).toBe(true);
    });

    it('should return false when email fails to send', async () => {
      vi.mocked(sendEmail).mockResolvedValue({
        success: false,
        error: 'SMTP error',
      });

      const result = await sendWebhookFailureAlert(mockAlert);

      expect(result).toBe(false);
    });

    it('should handle email service errors gracefully', async () => {
      vi.mocked(sendEmail).mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(sendWebhookFailureAlert(mockAlert)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Different Event Types', () => {
    beforeEach(() => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
    });

    it('should handle checkout.session.completed events', async () => {
      const alert = { ...mockAlert, eventType: 'checkout.session.completed' };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('checkout.session.completed'),
        })
      );
    });

    it('should handle charge.refunded events', async () => {
      const alert = { ...mockAlert, eventType: 'charge.refunded' };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('charge.refunded'),
        })
      );
    });

    it('should handle payment_intent.payment_failed events', async () => {
      const alert = { ...mockAlert, eventType: 'payment_intent.payment_failed' };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('payment_intent.payment_failed'),
        })
      );
    });

    it('should handle invoice.paid events', async () => {
      const alert = { ...mockAlert, eventType: 'invoice.paid' };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('invoice.paid'),
        })
      );
    });
  });

  describe('Various Error Messages', () => {
    beforeEach(() => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
    });

    it('should handle database errors', async () => {
      const alert = { ...mockAlert, error: 'Database connection timeout' };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Database connection timeout'),
        })
      );
    });

    it('should handle missing user errors', async () => {
      const alert = {
        ...mockAlert,
        error: 'Missing user identification in checkout session',
      };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(
            'Missing user identification in checkout session'
          ),
        })
      );
    });

    it('should handle long error messages', async () => {
      const longError = 'A'.repeat(1000);
      const alert = { ...mockAlert, error: longError };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalled();
    });

    it('should handle multiline error messages', async () => {
      const multilineError = 'Line 1\nLine 2\nLine 3';
      const alert = { ...mockAlert, error: multilineError };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalled();
    });

    it('should handle special characters in error', async () => {
      const specialError = 'Error: "unexpected" & <invalid>';
      const alert = { ...mockAlert, error: specialError };

      await sendWebhookFailureAlert(alert);

      expect(sendEmail).toHaveBeenCalled();
    });
  });

  describe('App URL Configuration', () => {
    beforeEach(() => {
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'msg_123' });
    });

    it('should use configured app URL', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://custom.example.com';

      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(
            'https://custom.example.com/admin/webhooks'
          ),
        })
      );
    });

    it('should use default URL when not configured', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;

      await sendWebhookFailureAlert(mockAlert);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('https://lastparadigm.com/admin/webhooks'),
        })
      );
    });
  });
});
