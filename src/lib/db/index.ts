import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

/**
 * Drizzle database client for Vercel Postgres.
 *
 * Uses the POSTGRES_URL environment variable set by Vercel.
 * In production, this connects to the Vercel Postgres database.
 *
 * Covers: Story 4-4 Task 1 (Database Infrastructure)
 */
export const db = drizzle(sql, { schema });

export { schema };
