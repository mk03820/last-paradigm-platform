/**
 * Inngest API Route Handler
 *
 * Serves Inngest functions and handles event processing.
 * This is the entry point for all Inngest background jobs.
 *
 * Covers: Story 15.10 Task 1, FR72 (Scheduled task infrastructure)
 */

import { serve } from 'inngest/next';
import { inngest, functions } from '@/lib/inngest';

// Create and export the serve handler for Next.js App Router
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
