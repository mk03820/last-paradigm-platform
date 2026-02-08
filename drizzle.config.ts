import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit configuration for database migrations.
 *
 * To generate migrations: npx drizzle-kit generate
 * To apply migrations: npx drizzle-kit migrate
 *
 * Requires POSTGRES_URL environment variable to be set.
 */
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
