/**
 * Registration Schema
 *
 * Zod validation schema for user registration.
 *
 * Covers: Story 15.2 Task 2, FR38 (Account creation), FR56 (Premium UX)
 */

import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password-utils';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(72, 'Password cannot exceed 72 characters') // bcrypt truncates at 72 bytes
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  name: z
    .string()
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Schema for API request (no confirmPassword needed)
export const registerApiSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(72, 'Password cannot exceed 72 characters') // bcrypt truncates at 72 bytes
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
  name: z
    .string()
    .optional(),
});

export type RegisterApiInput = z.infer<typeof registerApiSchema>;
