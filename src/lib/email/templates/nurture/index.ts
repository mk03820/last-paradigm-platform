/**
 * Nurture Email Templates Index
 *
 * Exports all nurture email templates and utilities.
 *
 * Story 20.3: Nurture Sequence Content
 * Covers: FR52 (5-email nurture sequence)
 */

export { generateNurtureEmailDay0 } from './day-0';
export { generateNurtureEmailDay3 } from './day-3';
export { generateNurtureEmailDay7 } from './day-7';
export { generateNurtureEmailDay10 } from './day-10';
export { generateNurtureEmailDay14 } from './day-14';

import { generateNurtureEmailDay0 } from './day-0';
import { generateNurtureEmailDay3 } from './day-3';
import { generateNurtureEmailDay7 } from './day-7';
import { generateNurtureEmailDay10 } from './day-10';
import { generateNurtureEmailDay14 } from './day-14';
import type { NurtureDay, NurtureEmailContext } from '../../nurture-config';
import { NURTURE_SCHEDULE } from '../../nurture-config';

/**
 * Email generation result
 */
export interface NurtureEmailResult {
  subject: string;
  text: string;
  html: string;
}

/**
 * Generate nurture email for a specific day
 *
 * @param day - Nurture day (0, 3, 7, 10, 14)
 * @param context - Email personalization context
 * @returns Generated email content
 */
export function generateNurtureEmail(
  day: NurtureDay,
  context: NurtureEmailContext
): NurtureEmailResult {
  switch (day) {
    case NURTURE_SCHEDULE.DAY_0:
      return generateNurtureEmailDay0(context);
    case NURTURE_SCHEDULE.DAY_3:
      return generateNurtureEmailDay3(context);
    case NURTURE_SCHEDULE.DAY_7:
      return generateNurtureEmailDay7(context);
    case NURTURE_SCHEDULE.DAY_10:
      return generateNurtureEmailDay10(context);
    case NURTURE_SCHEDULE.DAY_14:
      return generateNurtureEmailDay14(context);
    default:
      throw new Error(`Invalid nurture day: ${day}`);
  }
}
