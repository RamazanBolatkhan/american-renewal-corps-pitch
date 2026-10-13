'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { emailConfigured } from '@/lib/email';
import { safeNext } from '@/lib/next-path';
import { getSession, isMember } from '@/lib/session';

export type FormResult = { ok?: string; error?: string } | null;

const field = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const messageOf = (error: unknown, fallback: string) => {
  const raw = error instanceof Error ? error.message : '';
  if (/invalid password/i.test(raw)) return 'That current password isn’t right.';
  if (/password too short/i.test(raw)) return 'Use at least 8 characters.';
  return raw || fallback;
};

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect('/');
}

/** Change the signed-in user's password; other devices are signed out. Clears a required change. */
export async function changePassword(_: FormResult, form: FormData): Promise<FormResult> {
  const session = await getSession();
  if (!session || !isMember(session)) return { error: 'Log in first.' };
  const current = field(form, 'current');
  const next = field(form, 'next');
  if (next.length < 8) return { error: 'Use at least 8 characters for the new password.' };
  if (next !== field(form, 'confirm')) return { error: 'The two new passwords don’t match.' };
  if (next === current) return { error: 'Choose a password different from the current one.' };
  try {
    await auth.api.changePassword({ headers: await headers(), body: { currentPassword: current, newPassword: next, revokeOtherSessions: true } });
  } catch (error) {
    return { error: messageOf(error, 'Couldn’t change the password. Try again.') };
  }
  const forced = session.user.mustChangePassword;
  await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, session.user.id));
  if (forced) redirect(safeNext(form.get('returnTo')));
  return { ok: 'Password changed. Other devices have been signed out.' };
}

/** Delete the signed-in account after confirming the password. */
export async function deleteAccount(_: FormResult, form: FormData): Promise<FormResult> {
  const session = await getSession();
  if (!session || !isMember(session)) return { error: 'Log in first.' };
  if (field(form, 'email').toLowerCase() !== session.user.email.toLowerCase()) return { error: 'Type your email address exactly to confirm.' };
  try {
    await auth.api.deleteUser({ headers: await headers(), body: { password: field(form, 'password') } });
  } catch (error) {
    return { error: messageOf(error, 'Couldn’t delete the account.') };
  }
  redirect('/');
}

export async function resendVerification(_: FormResult): Promise<FormResult> {
  const session = await getSession();
  if (!session || !isMember(session)) return { error: 'Log in first.' };
  if (!emailConfigured()) return { error: 'Email isn’t connected yet.' };
  await auth.api.sendVerificationEmail({ headers: await headers(), body: { email: session.user.email, callbackURL: '/account?verified=1' } });
  return { ok: `We sent a new link to ${session.user.email}.` };
}

/** Always answers the same way, so it never reveals whether an email has an account. */
export async function requestPasswordReset(_: FormResult, form: FormData): Promise<FormResult> {
  if (!emailConfigured()) return { error: 'Password emails aren’t connected yet. Ask an ARC admin to reset your password from the admin area.' };
  const email = field(form, 'email');
  if (!email.includes('@')) return { error: 'Enter the email you registered with.' };
  try {
    await auth.api.requestPasswordReset({ headers: await headers(), body: { email, redirectTo: '/reset-password' } });
  } catch {
    // Same answer either way.
  }
  return { ok: 'If that email has an ARC account, a reset link is on its way. It expires in one hour.' };
}

export async function resetPassword(_: FormResult, form: FormData): Promise<FormResult> {
  const token = field(form, 'token');
  const next = field(form, 'next');
  if (!token) return { error: 'This reset link is missing its code. Ask for a new one.' };
  if (next.length < 8) return { error: 'Use at least 8 characters.' };
  if (next !== field(form, 'confirm')) return { error: 'The two passwords don’t match.' };
  try {
    await auth.api.resetPassword({ headers: await headers(), body: { token, newPassword: next } });
  } catch {
    return { error: 'This reset link has expired or was already used. Ask for a new one.' };
  }
  redirect('/login?reset=1');
}
