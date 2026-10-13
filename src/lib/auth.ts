import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { nextCookies } from 'better-auth/next-js';
import { admin as adminPlugin, anonymous } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { actionEmail, emailConfigured, sendEmail } from './email';
import { ac, roles } from './permissions';

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

/** Google sign-in switches on once its OAuth client is configured. */
export const googleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: 'American Renewal Corps',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL: {
    // Production, this project's Vercel previews, and local development.
    allowedHosts: ['american-renewal-corps-pitch.vercel.app', 'american-renewa*.vercel.app', 'localhost:*', '127.0.0.1:*'],
    protocol: 'auto',
    fallback: 'https://american-renewal-corps-pitch.vercel.app',
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your ARC password',
        ...actionEmail({ name: user.name, intro: 'Someone asked to reset the password for your ARC account.', action: 'Choose a new password', url, outro: 'The link expires in one hour. If you didn’t ask for this, you can ignore this email.' }),
      });
    },
    onPasswordReset: async ({ user }) => {
      await db.update(schema.user).set({ mustChangePassword: false }).where(eq(schema.user.id, user.id));
    },
  },
  emailVerification: {
    sendOnSignUp: emailConfigured(),
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Confirm your ARC email',
        ...actionEmail({ name: user.name, intro: 'Please confirm this is your email address so we can keep your progress safe.', action: 'Confirm my email', url, outro: 'If you didn’t create an ARC account, you can ignore this email.' }),
      });
    },
  },
  user: {
    additionalFields: {
      /** Set for accounts an admin creates or resets; the person must choose their own password first. */
      mustChangePassword: { type: 'boolean', required: false, defaultValue: false, input: false },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async user => {
        // Keep at least one way into the admin area.
        if ((user as { role?: string }).role === 'admin') throw new Error('Admins can’t delete their own account. Ask another admin to change your role first.');
      },
    },
  },
  account: { accountLinking: { enabled: true, trustedProviders: ['google'] } },
  ...(googleConfigured()
    ? { socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } } }
    : {}),
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
