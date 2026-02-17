/**
 * Email Theme Constants
 *
 * Executive Clarity theme colors and styles for email templates.
 * Matches the platform design system for consistent branding.
 *
 * Story 20.1: Email Template System
 * Task 2: Create email theme constants (AC: 1)
 * Covers: FR62 (Branded, mobile-responsive email templates)
 */

/**
 * Executive Clarity theme color palette for emails
 */
export const emailTheme = {
  // Primary brand colors
  brandGold: '#D4AF37', // Primary accent color - The Last Paradigm gold

  // Background colors
  backgroundColor: '#0A0A0A', // Page background - charcoal
  cardBg: '#1A1A1A', // Card/content area background
  navyBg: '#1e293b', // Secondary accent background

  // Text colors
  textColor: '#E5E7EB', // Primary text - light gray
  mutedColor: '#9CA3AF', // Secondary/muted text
  headingColor: '#FFFFFF', // Headings - white

  // Border and divider
  borderColor: '#333333', // Subtle borders

  // Button colors
  buttonBg: '#D4AF37', // Primary button background
  buttonText: '#0A0A0A', // Primary button text (dark on gold)
  buttonHoverBg: '#B8941A', // Hover state (darker gold)

  // Status colors
  successColor: '#10B981', // Green for success states
  errorColor: '#EF4444', // Red for error states
  warningColor: '#F59E0B', // Amber for warnings
} as const;

/**
 * Typography styles for emails
 */
export const emailTypography = {
  // Font stack - system fonts for maximum compatibility
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

  // Font sizes
  sizes: {
    xs: '11px',
    sm: '12px',
    base: '15px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },

  // Font weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.6',
  },
} as const;

/**
 * Button styles for emails
 * Ensures tap-friendly sizing (minimum 44px height per AC2)
 */
export const emailButtonStyles = {
  primary: {
    display: 'inline-block',
    padding: '16px 36px',
    backgroundColor: emailTheme.brandGold,
    color: emailTheme.buttonText,
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    borderRadius: '8px',
    minHeight: '44px', // Tap-friendly (AC2)
  },

  secondary: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: emailTheme.brandGold,
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    borderRadius: '6px',
    border: `2px solid ${emailTheme.brandGold}`,
    minHeight: '44px',
  },
} as const;

/**
 * Common spacing values for emails
 */
export const emailSpacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
} as const;

/**
 * Email layout constraints
 */
export const emailLayout = {
  maxWidth: '520px', // Maximum content width
  contentPadding: '32px',
  mobilePadding: '20px',
} as const;
