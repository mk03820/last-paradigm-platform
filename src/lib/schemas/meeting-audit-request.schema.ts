import { z } from 'zod';
import { salaryDistributionSchema } from './salary-distribution.schema';

/**
 * Zod schema for Meeting Audit API request validation.
 *
 * Combines meeting details and salary distribution validation.
 * Used by the /api/calculate/meeting-audit endpoint.
 *
 * Covers: Story 3-1 Task 2 - API Request Validation
 */
export const meetingAuditRequestSchema = z.object({
  meetingCount: z
    .number({
      required_error: 'meetingCount is required',
      invalid_type_error: 'meetingCount must be a number',
    })
    .int('meetingCount must be a whole number')
    .positive('meetingCount must be greater than 0'),

  averageAttendees: z
    .number({
      required_error: 'averageAttendees is required',
      invalid_type_error: 'averageAttendees must be a number',
    })
    .int('averageAttendees must be a whole number')
    .positive('averageAttendees must be greater than 0'),

  averageDuration: z
    .number({
      required_error: 'averageDuration is required',
      invalid_type_error: 'averageDuration must be a number',
    })
    .int('averageDuration must be a whole number')
    .positive('averageDuration must be greater than 0'),

  salaryDistribution: salaryDistributionSchema,
});

/**
 * Additional validation: ensure salary distribution total equals averageAttendees.
 */
export const meetingAuditRequestWithTotalValidation = meetingAuditRequestSchema.refine(
  (data) => {
    const total =
      data.salaryDistribution.executive +
      data.salaryDistribution.senior +
      data.salaryDistribution.midLevel +
      data.salaryDistribution.entry;
    return total === data.averageAttendees;
  },
  {
    message: 'Salary distribution total must equal averageAttendees',
    path: ['salaryDistribution'],
  }
);

export type MeetingAuditRequestSchema = z.infer<typeof meetingAuditRequestSchema>;
