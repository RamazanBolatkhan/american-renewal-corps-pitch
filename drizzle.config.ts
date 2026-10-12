import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// Locally, read the connection strings pulled by `vercel env pull`.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');

// Migrations use Neon's direct (non-pooled) connection.
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '' },
});
