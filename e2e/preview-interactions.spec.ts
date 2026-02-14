/**
 * Preview Card Interactions E2E Tests
 *
 * Story 16.4: Premium Card Interactions
 * Task 8: Integration and E2E tests
 *
 * These tests verify the premium card interactions work correctly
 * across different scenarios including hover, keyboard, touch, and
 * accessibility features.
 */

import { test, expect } from '@playwright/test';

test.describe('Preview Card Interactions', () => {
  // Note: These tests assume a preview page exists at /preview
  // Adjust the URL based on actual route structure

  test.beforeEach(async ({ page }) => {
    // Navigate to preview page
    await page.goto('/preview');
  });

  test.describe('Hover States', () => {
    test('should show lift effect and enhanced shadow on hover', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Check initial state
      const initialTransform = await card.evaluate((el) =>
        getComputedStyle(el).transform
      );

      // Hover over card
      await card.hover();

      // Wait for transition
      await page.waitForTimeout(250);

      // Verify transform changed (lift effect)
      const hoverTransform = await card.evaluate((el) =>
        getComputedStyle(el).transform
      );

      // The transform should be different (indicating lift)
      expect(hoverTransform).not.toBe(initialTransform);
    });

    test('should show expanded description on hover', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();
      const description = card.locator('[data-testid="card-description"]');

      // Description should be hidden initially
      await expect(description).not.toBeVisible();

      // Hover over card
      await card.hover();

      // Wait for animation
      await page.waitForTimeout(250);

      // Description should now be visible
      await expect(description).toBeVisible();
    });
  });

  test.describe('Card Entry Animations', () => {
    test('should animate cards in with staggered timing', async ({ page }) => {
      const cards = page.locator('[data-testid="preview-card"]');

      // Wait for first card to be visible
      await expect(cards.first()).toBeVisible();

      // Verify multiple cards exist
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should not animate cards when reduced motion is preferred', async ({
      page,
    }) => {
      // Enable reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      // Reload page
      await page.reload();

      // Cards should be immediately visible without animation delay
      const cards = page.locator('[data-testid="preview-card"]');
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('Unlock Prompt', () => {
    test('should show unlock prompt when clicking a blurred card', async ({
      page,
    }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Click the card
      await card.click();

      // Unlock prompt should appear
      const overlay = page.locator('[role="dialog"]');
      await expect(overlay).toBeVisible();

      // Verify prompt content
      await expect(
        page.getByText(/Unlock.*with Playbook 2/)
      ).toBeVisible();
      await expect(page.getByText('$2,500')).toBeVisible();
      await expect(
        page.getByRole('link', { name: /Purchase Playbook 2/i })
      ).toBeVisible();
    });

    test('should close unlock prompt when clicking close button', async ({
      page,
    }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Open overlay
      await card.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Click close button
      await page.getByRole('button', { name: /Close/i }).click();

      // Overlay should be hidden
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should close unlock prompt when clicking backdrop', async ({
      page,
    }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Open overlay
      await card.click();
      const overlay = page.locator('[role="dialog"]');
      await expect(overlay).toBeVisible();

      // Click backdrop (outside the modal content)
      await page.mouse.click(10, 10);

      // Overlay should be hidden
      await expect(overlay).not.toBeVisible();
    });

    test('should close unlock prompt when pressing Escape', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Open overlay
      await card.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Overlay should be hidden
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be able to focus cards with Tab', async ({ page }) => {
      // Tab to first card
      await page.keyboard.press('Tab');

      // First card should be focused
      const firstCard = page.locator('[data-testid="preview-card"]').first();
      await expect(firstCard).toBeFocused();
    });

    test('should show focus ring when focused', async ({ page }) => {
      const firstCard = page.locator('[data-testid="preview-card"]').first();

      // Focus the card
      await firstCard.focus();

      // Check for focus-visible styling
      const hasFocusRing = await firstCard.evaluate((el) => {
        const styles = getComputedStyle(el);
        return styles.outlineWidth !== '0px' || styles.boxShadow.includes('rgb');
      });

      expect(hasFocusRing).toBe(true);
    });

    test('should open unlock prompt when pressing Enter', async ({ page }) => {
      const firstCard = page.locator('[data-testid="preview-card"]').first();

      // Focus and press Enter
      await firstCard.focus();
      await page.keyboard.press('Enter');

      // Overlay should appear
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    test('should open unlock prompt when pressing Space', async ({ page }) => {
      const firstCard = page.locator('[data-testid="preview-card"]').first();

      // Focus and press Space
      await firstCard.focus();
      await page.keyboard.press(' ');

      // Overlay should appear
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    test('should trap focus within unlock prompt', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Open overlay
      await card.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Focus should be on close button initially
      const closeButton = page.getByRole('button', { name: /Close/i });
      await expect(closeButton).toBeFocused();

      // Tab to CTA button
      await page.keyboard.press('Tab');
      const ctaButton = page.getByRole('link', { name: /Purchase Playbook 2/i });
      await expect(ctaButton).toBeFocused();

      // Tab again should wrap back to close button (focus trap)
      await page.keyboard.press('Tab');
      await expect(closeButton).toBeFocused();
    });

    test('should return focus to card when closing overlay', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Focus card and open overlay
      await card.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');

      // Focus should return to the card
      await expect(card).toBeFocused();
    });
  });

  test.describe('Touch Interactions', () => {
    test.use({ hasTouch: true });

    test('should show hover state on first tap', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // First tap
      await card.tap();

      // Wait for state change
      await page.waitForTimeout(100);

      // Should not show overlay yet
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should show unlock prompt on second tap', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // First tap
      await card.tap();
      await page.waitForTimeout(100);

      // Second tap
      await card.tap();

      // Overlay should appear
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    test('should reset after timeout between taps', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // First tap
      await card.tap();

      // Wait longer than the 3-second timeout
      await page.waitForTimeout(3500);

      // Tap again - should be treated as first tap
      await card.tap();
      await page.waitForTimeout(100);

      // Overlay should not appear
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test.describe('Reduced Motion Preference', () => {
    test('should disable animations when reduced motion is preferred', async ({
      page,
    }) => {
      // Enable reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();

      // Verify cards are visible immediately (no stagger delay)
      const cards = page.locator('[data-testid="preview-card"]');
      const firstCard = cards.first();
      const lastCard = cards.last();

      // Both should be visible immediately
      await expect(firstCard).toBeVisible();
      await expect(lastCard).toBeVisible();
    });

    test('should show overlay instantly without animation', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();

      const card = page.locator('[data-testid="preview-card"]').first();

      // Click card
      await card.click();

      // Overlay should appear instantly
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should use GPU-accelerated transforms', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Check that transforms are used (not top/left)
      await card.hover();
      await page.waitForTimeout(100);

      const usesTransform = await card.evaluate((el) => {
        const styles = getComputedStyle(el);
        return (
          styles.transform !== 'none' ||
          el.style.transform !== '' ||
          styles.willChange.includes('transform')
        );
      });

      expect(usesTransform).toBe(true);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes on cards', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Check role
      await expect(card).toHaveAttribute('role', 'button');

      // Check aria-label
      const ariaLabel = await card.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('Click to unlock');
    });

    test('should have proper ARIA attributes on unlock overlay', async ({
      page,
    }) => {
      const card = page.locator('[data-testid="preview-card"]').first();
      await card.click();

      const overlay = page.locator('[role="dialog"]');
      await expect(overlay).toBeVisible();

      // Check modal attributes
      await expect(overlay).toHaveAttribute('aria-modal', 'true');
      await expect(overlay).toHaveAttribute('aria-labelledby');
      await expect(overlay).toHaveAttribute('aria-describedby');
    });

    test('should prevent body scroll when overlay is open', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();
      await card.click();

      // Body should have overflow hidden
      const bodyOverflow = await page.evaluate(() =>
        getComputedStyle(document.body).overflow
      );
      expect(bodyOverflow).toBe('hidden');
    });

    test('should restore body scroll when overlay closes', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();

      // Open and close overlay
      await card.click();
      await page.keyboard.press('Escape');

      // Body should no longer have overflow hidden
      const bodyOverflow = await page.evaluate(() =>
        getComputedStyle(document.body).overflow
      );
      expect(bodyOverflow).not.toBe('hidden');
    });
  });

  test.describe('Visual Regression', () => {
    test('card default state', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();
      await expect(card).toHaveScreenshot('preview-card-default.png');
    });

    test('card hover state', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();
      await card.hover();
      await page.waitForTimeout(300); // Wait for animation
      await expect(card).toHaveScreenshot('preview-card-hover.png');
    });

    test('card focus state', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();
      await card.focus();
      await expect(card).toHaveScreenshot('preview-card-focus.png');
    });

    test('unlock overlay open', async ({ page }) => {
      const card = page.locator('[data-testid="preview-card"]').first();
      await card.click();
      await page.waitForTimeout(200); // Wait for animation
      await expect(page.locator('[role="dialog"]')).toHaveScreenshot(
        'unlock-overlay.png'
      );
    });
  });
});
