import { z } from 'zod';

/**
 * Zod validation schema for Meeting Details form.
 *
 * Covers: FR5 (meetingCount), FR6 (averageAttendees), FR7 (averageDuration)
 * Validation: positive integers with user-friendly error messages
 */
export const meetingDetailsSchema = z.object({
  meetingCount: z
    .number({
      required_error: 'Number of meetings is required',
      invalid_type_error: 'Please enter a valid number',
    })
    .int('Please enter a whole number')
    .positive('Number of meetings must be greater than 0'),

  averageAttendees: z
    .number({
      required_error: 'Average attendees is required',
      invalid_type_error: 'Please enter a valid number',
    })
    .int('Please enter a whole number')
    .positive('Average attendees must be greater than 0'),

  averageDuration: z
    .number({
      required_error: 'Average duration is required',
      invalid_type_error: 'Please enter a valid number',
    })
    .int('Please enter a whole number')
    .positive('Duration must be greater than 0'),
});

export type MeetingDetailsFormData = z.infer<typeof meetingDetailsSchema>;
