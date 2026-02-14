/**
 * Magic Link Request Validation Schema
 *
 * Zod schema for validating magic link authentication requests.
 *
 * Covers: Story 15.4 Task 1.2
 */

import { z } from 'zod';

/**
 * Schema for magic link request
 */
export const magicLinkRequestSchema = z.object({
  email: z
    .string({
      required_error: 'Email address is required',
    })
    .trim()
    .min(1, 'Email address is required')
    .max(255, 'Email address is too long')
    .email('Please enter a valid email address'),
});

export type MagicLinkRequestInput = z.infer<typeof magicLinkRequestSchema>;

/**
 * Schema for magic link verification
 */
export const magicLinkVerifySchema = z.object({
  token: z
    .string({
      required_error: 'Token is required',
    })
    .min(1, 'Token is required'),
});

export type MagicLinkVerifyInput = z.infer<typeof magicLinkVerifySchema>;
