import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { nextCookies } from 'better-auth/next-js';
import { admin as adminPlugin, anonymous } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { ac, roles } from './permissions';

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

export const auth = betterAuth({
  appName: 'American Renewal Corps',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL: {
    // Production, this project's Vercel previews, and local development.
    allowedHosts: ['american-renewal-corps-pitch.vercel.app', 'american-renewa*.vercel.app', 'localhost:*', '127.0.0.1:*'],
    protocol: 'auto',
    fallback: 'https://american-renewal-corps-pitch.vercel.app',
  },
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
  databaseHooks: {
    user: {
      create: {
        // The configured admin email becomes the first admin. Everyone else starts as a student.
        before: async newUser => {
          if (adminEmail && newUser.email?.toLowerCase() === adminEmail) return { data: { ...newUser, role: 'admin' } };
        },
      },
    },
  },
  plugins: [
    anonymous({
      // Runs before the demo user is deleted: keep their learning style on the new account.
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const existing = await db.query.learnerProfile.findFirst({ where: eq(schema.learnerProfile.userId, newUser.user.id) });
        if (existing) return;
        await db.update(schema.learnerProfile).set({ userId: newUser.user.id }).where(eq(schema.learnerProfile.userId, anonymousUser.user.id));
      },
    }),
    adminPlugin({ ac, roles, defaultRole: 'student', adminRoles: ['admin'] }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
