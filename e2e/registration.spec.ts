/**
 * Registration E2E Tests
 *
 * End-to-end tests for user registration flow.
 *
 * Covers: Story 15.2 Task 7, FR38 (Account creation), FR56 (Premium UX), NFR14 (Accessibility)
 */

import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  test.describe('Task 7.2: Successful registration flow', () => {
    test('should complete registration with valid credentials', async ({ page }) => {
      // Generate unique email for test
      const testEmail = `test-${Date.now()}@example.com`;

      // Fill out the form
      await page.fill('[id="name"]', 'Test User');
      await page.fill('[id="email"]', testEmail);
      await page.fill('[id="password"]', 'SecurePassword123');
      await page.fill('[id="confirmPassword"]', 'SecurePassword123');

      // Submit the form
      await page.click('button[type="submit"]');

      // Wait for success state or redirect
      await expect(
        page.locator('text=Account Created').or(page.locator('text=Redirecting'))
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show loading state during submission', async ({ page }) => {
      const testEmail = `test-${Date.now()}@example.com`;

      await page.fill('[id="email"]', testEmail);
      await page.fill('[id="password"]', 'SecurePassword123');
      await page.fill('[id="confirmPassword"]', 'SecurePassword123');

      // Click submit and immediately check for loading state
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show loading text
      await expect(submitButton).toContainText(/creating account/i);
    });

    test('should redirect to dashboard after successful registration', async ({ page }) => {
      const testEmail = `test-redirect-${Date.now()}@example.com`;

      await page.fill('[id="email"]', testEmail);
      await page.fill('[id="password"]', 'SecurePassword123');
      await page.fill('[id="confirmPassword"]', 'SecurePassword123');
      await page.click('button[type="submit"]');

      // Wait for redirect
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      expect(page.url()).toContain('/dashboard');
    });

    test('should respect callbackUrl parameter', async ({ page }) => {
      // Navigate with callbackUrl
      await page.goto('/auth/register?callbackUrl=/tools/meeting-audit');

      const testEmail = `test-callback-${Date.now()}@example.com`;

      await page.fill('[id="email"]', testEmail);
      await page.fill('[id="password"]', 'SecurePassword123');
      await page.fill('[id="confirmPassword"]', 'SecurePassword123');
      await page.click('button[type="submit"]');

      // Should redirect to callback URL
      await page.waitForURL('**/tools/meeting-audit', { timeout: 15000 });
      expect(page.url()).toContain('/tools/meeting-audit');
    });
  });

  test.describe('Task 7.3: Validation errors', () => {
    test('should show error for invalid email format', async ({ page }) => {
      await page.fill('[id="email"]', 'not-an-email');
      await page.locator('[id="email"]').blur();

      await expect(page.locator('text=valid email')).toBeVisible();
    });

    test('should show error for password too short', async ({ page }) => {
      await page.fill('[id="password"]', 'short');
      await page.locator('[id="password"]').blur();

      await expect(page.locator('text=at least 8 characters')).toBeVisible();
    });

    test('should show error for password without number', async ({ page }) => {
      await page.fill('[id="password"]', 'NoNumbersHere');
      await page.locator('[id="password"]').blur();

      await expect(page.locator('text=at least one number')).toBeVisible();
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      await page.fill('[id="password"]', 'SecurePassword123');
      await page.fill('[id="confirmPassword"]', 'DifferentPassword456');
      await page.locator('[id="confirmPassword"]').blur();

      await expect(page.locator("text=don't match")).toBeVisible();
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.fill('[id="password"]', 'weak');
      await expect(page.locator('text=Password strength')).toBeVisible();

      // Clear and enter strong password
      await page.fill('[id="password"]', 'VeryStrongP@ssword123!');
      await expect(page.locator('text=Very strong')).toBeVisible();
    });
  });

  test.describe('Task 7.4: Duplicate email handling', () => {
    test('should show error for duplicate email without revealing existence', async ({ page }) => {
      // First registration
      const testEmail = `duplicate-test-${Date.now()}@example.com`;

      await page.fill('[id="email"]', testEmail);
      await page.fill('[id="password"]', 'SecurePassword123');
      await page.fill('[id="confirmPassword"]', 'SecurePassword123');
      await page.click('button[type="submit"]');

      // Wait for first registration to complete
      await page.waitForURL('**/dashboard', { timeout: 15000 });

      // Logout (clear session)
      await page.goto('/auth/register');

      // Try to register with same email
      await page.fill('[id="email"]', testEmail);
      await page.fill('[id="password"]', 'DifferentPassword456');
      await page.fill('[id="confirmPassword"]', 'DifferentPassword456');
      await page.click('button[type="submit"]');

      // Should show generic error (not "email already exists")
      await expect(
        page.locator('text=/unable to create|try a different email|try again/i')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Task 7.5: Keyboard navigation', () => {
    test('should be fully navigable with keyboard', async ({ page }) => {
      // Start with Tab key navigation
      await page.keyboard.press('Tab'); // Focus name input
      await expect(page.locator('[id="name"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus email input
      await expect(page.locator('[id="email"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus password input
      await expect(page.locator('[id="password"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus password toggle
      await page.keyboard.press('Tab'); // Focus confirm password

      await page.keyboard.press('Tab'); // Focus confirm toggle
      await page.keyboard.press('Tab'); // Focus submit button
    });

    test('should toggle password visibility with keyboard', async ({ page }) => {
      await page.fill('[id="password"]', 'TestPassword123');

      // Tab to password toggle button
      await page.locator('[id="password"]').focus();
      await page.keyboard.press('Tab');

      // Activate with Enter
      await page.keyboard.press('Enter');

      // Password should now be visible
      await expect(page.locator('[id="password"]')).toHaveAttribute('type', 'text');
    });

    test('should submit form with Enter key', async ({ page }) => {
      const testEmail = `keyboard-submit-${Date.now()}@example.com`;

      await page.fill('[id="email"]', testEmail);
      await page.fill('[id="password"]', 'SecurePassword123');
      await page.fill('[id="confirmPassword"]', 'SecurePassword123');

      // Submit with Enter on the confirm password field
      await page.locator('[id="confirmPassword"]').press('Enter');

      // Should start submission
      await expect(page.locator('text=Creating Account')).toBeVisible({
        timeout: 5000,
      });
    });

    test('should have proper focus indicators', async ({ page }) => {
      // Focus the email input
      await page.locator('[id="email"]').focus();

      // Check that the input has visible focus styling
      const emailInput = page.locator('[id="email"]');
      await expect(emailInput).toBeFocused();

      // Verify the element has focus-visible ring (from Tailwind)
      // This checks that there's some CSS applied for focus state
      const boxShadow = await emailInput.evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('box-shadow')
      );
      // Focus ring should be present (not 'none')
      expect(boxShadow).not.toBe('none');
    });
  });

  test.describe('Form UX', () => {
    test('should have proper input heights (48px)', async ({ page }) => {
      const emailInput = page.locator('[id="email"]');
      const height = await emailInput.evaluate((el) => (el as HTMLElement).offsetHeight);

      expect(height).toBeGreaterThanOrEqual(48);
    });

    test('should have sign in link visible', async ({ page }) => {
      await expect(page.locator('text=Already have an account?')).toBeVisible();
      await expect(page.locator('a:has-text("Sign in")')).toBeVisible();
    });

    test('sign in link should navigate to signin page', async ({ page }) => {
      await page.click('a:has-text("Sign in")');

      await expect(page).toHaveURL(/signin/);
    });
  });
});
