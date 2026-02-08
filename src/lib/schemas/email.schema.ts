import { z } from 'zod';

/**
 * Zod validation schema for email capture.
 *
 * Validates email format with user-friendly error messages.
 *
 * Covers: FR29 (Email input), Story 4-4 Task 3
 */
export const emailSchema = z.object({
  email: z
    .string({
      required_error: 'Email address is required',
    })
    .trim()
    .min(1, 'Email address is required')
    .max(255, 'Email address is too long')
    .email('Please enter a valid email address'),
});

export type EmailFormData = z.infer<typeof emailSchema>;

/**
 * API request schema for email submission.
 * Extends the base schema with optional source field.
 */
export const emailSubmissionSchema = emailSchema.extend({
  source: z.string().max(50).optional().default('meeting-audit-results'),
});

export type EmailSubmission = z.infer<typeof emailSubmissionSchema>;
