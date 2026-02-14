'use client';

import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

/**
 * Stripe "Powered by Stripe" badge
 * Simplified monochrome version for professional presentation
 */
export function StripeBadge({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 119 28"
      className={cn('h-7', className)}
      role="img"
      aria-label="Powered by Stripe"
    >
      <title>Powered by Stripe</title>
      <g fill="currentColor" fillRule="evenodd">
        <path d="M4 14c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10S4 19.523 4 14zm10-6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" />
        <path d="M39.168 11.736h-3.138v4.596c0 1.068.432 1.392 1.332 1.392.54 0 .972-.108 1.32-.252v2.352c-.516.252-1.296.432-2.244.432-2.208 0-3.546-1.08-3.546-3.384v-5.136h-1.596v-2.34h1.596V6.804h3.138v2.592h3.138v2.34zm8.244-2.34h3.03l-4.32 10.512H43.2l-4.32-10.512h3.156l2.676 7.308 2.7-7.308zm6.48 0h3.024v10.512h-3.024V9.396zm1.512-1.668c-.972 0-1.764-.792-1.764-1.764s.792-1.764 1.764-1.764 1.764.792 1.764 1.764-.792 1.764-1.764 1.764zm10.26 1.308c1.224 0 2.34.396 3.132 1.224V9.396h3.024v10.512h-3.024V18.9c-.792.84-1.908 1.248-3.132 1.248-2.736 0-4.896-2.16-4.896-5.556 0-3.384 2.16-5.556 4.896-5.556zm.828 8.352c1.476 0 2.448-1.2 2.448-2.796s-.972-2.784-2.448-2.784c-1.476 0-2.448 1.188-2.448 2.784 0 1.596.972 2.796 2.448 2.796zm14.016 2.52c-3.252 0-5.46-2.196-5.46-5.544 0-3.324 2.208-5.568 5.46-5.568 2.028 0 3.684.936 4.536 2.4l-2.412 1.392c-.408-.756-1.152-1.224-2.088-1.224-1.536 0-2.532 1.188-2.532 3 0 1.824 1.008 3 2.532 3 .924 0 1.668-.456 2.088-1.224l2.412 1.392c-.84 1.464-2.508 2.376-4.536 2.376zm15.768-5.544c0 .324-.024.648-.072.96h-7.704c.276 1.452 1.26 2.208 2.592 2.208 1.02 0 1.764-.408 2.244-1.044l2.1 1.476c-.876 1.26-2.388 1.968-4.38 1.968-3.216 0-5.496-2.184-5.496-5.568 0-3.36 2.28-5.544 5.364-5.544 2.952 0 5.352 2.04 5.352 5.544zm-5.316-3.096c-1.236 0-2.052.672-2.328 1.92h4.536c-.228-1.2-.96-1.92-2.208-1.92z" />
      </g>
    </svg>
  );
}

/**
 * Visa credit card logo
 * Simplified monochrome version
 */
export function VisaLogo({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={cn('h-6', className)}
      role="img"
      aria-label="Visa accepted"
    >
      <title>Visa</title>
      <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.1" />
      <path
        d="M19.5 21h-2.4l1.5-9h2.4l-1.5 9zm6.5-8.8c-.5-.2-1.2-.4-2.2-.4-2.4 0-4.1 1.3-4.1 3.1 0 1.4 1.2 2.1 2.1 2.6.9.5 1.2.8 1.2 1.2 0 .7-.7 1-1.4 1-.9 0-1.4-.1-2.2-.5l-.3-.1-.3 2c.6.3 1.6.5 2.6.5 2.6 0 4.2-1.3 4.2-3.2 0-1.1-.6-1.9-2-2.5-.8-.4-1.3-.7-1.3-1.1 0-.4.4-.8 1.3-.8.8 0 1.3.2 1.7.4l.2.1.4-1.8zm6.4-.2h-1.9c-.6 0-1 .2-1.3.7l-3.6 8.3h2.5l.5-1.4h3.1l.3 1.4h2.2l-1.8-9zm-2.4 5.8l1.3-3.4.7 3.4h-2zm-13.5-5.8l-2.4 6.1-.3-1.3c-.5-1.6-1.9-3.3-3.5-4.2l2.2 8.3h2.6l3.9-9h-2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Mastercard credit card logo
 * Simplified monochrome version
 */
export function MastercardLogo({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={cn('h-6', className)}
      role="img"
      aria-label="Mastercard accepted"
    >
      <title>Mastercard</title>
      <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.1" />
      <circle cx="19" cy="16" r="7" fill="currentColor" fillOpacity="0.4" />
      <circle cx="29" cy="16" r="7" fill="currentColor" fillOpacity="0.4" />
      <path
        d="M24 10.27a7 7 0 0 0 0 11.46 7 7 0 0 0 0-11.46z"
        fill="currentColor"
        fillOpacity="0.6"
      />
    </svg>
  );
}

/**
 * American Express credit card logo
 * Simplified monochrome version
 */
export function AmexLogo({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={cn('h-6', className)}
      role="img"
      aria-label="American Express accepted"
    >
      <title>American Express</title>
      <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.1" />
      <path
        d="M15 18h2.5l-1.25-3-1.25 3zm18-6h-4l-2 2.3-2-2.3h-9l-2.5 5.5L11 12H7l-3 8h2.5l.5-1.5h3l.5 1.5h5v-6l2.5 6h2l2.5-6v6h2l2.5-3 2.5 3h3l-4-4 4-4z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Lock/Shield icon for secure checkout
 */
export function SecureLockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-5 w-5', className)}
      role="img"
      aria-label="Secure checkout"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Secure</title>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/**
 * Shield with checkmark icon for guarantee badge
 */
export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-6 w-6', className)}
      role="img"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/**
 * Book icon for methodology attribution
 */
export function BookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-5 w-5', className)}
      role="img"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/**
 * Chevron icon for expandable sections
 */
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-4 w-4', className)}
      role="img"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Quote icon for testimonials
 */
export function QuoteIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-8 w-8', className)}
      role="img"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
    </svg>
  );
}
