'use server';

import { randomInt } from 'node:crypto';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { user } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { isRole } from '@/lib/permissions';
import { requireAdmin } from '@/lib/session';

export async function setUserRole(formData: FormData) {
  const session = await requireAdmin();
  const userId = formData.get('userId');
  const role = formData.get('role');
  if (typeof userId !== 'string' || !isRole(role)) throw new Error('Invalid role change');
  // Keep at least one admin: admins cannot demote themselves.
  if (userId === session.user.id && role !== 'admin') throw new Error('You cannot remove your own admin role');
  await auth.api.setRole({ headers: await headers(), body: { userId, role } });
  revalidatePath('/admin/users');
}

export type AdminResult = { ok?: string; error?: string; password?: string; email?: string } | null;

/** 14 characters without look-alikes (no 0/O, 1/l/I), shown to the admin once. */
function temporaryPassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 14 }, () => alphabet[randomInt(alphabet.length)]).join('');
}

/** Admin creates an account with a role and a temporary password; the person must change it at first log-in. */
export async function createStaffUser(_: AdminResult, form: FormData): Promise<AdminResult> {
  await requireAdmin();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const role = form.get('role');
  if (!name || !email.includes('@')) return { error: 'Enter a name and a valid email.' };
  if (!isRole(role)) return { error: 'Choose a role.' };
  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existing) return { error: 'An account with that email already exists. Change its role in the table below instead.' };
  const password = temporaryPassword();
  try {
    await auth.api.createUser({ headers: await headers(), body: { name, email, password, role, data: { mustChangePassword: true, emailVerified: true } } });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Couldn’t create the account.' };
  }
  revalidatePath('/admin/users');
  return { ok: `Account created for ${name} as ${role}.`, password, email };
}

/** Admin sets a new temporary password (the fallback while password emails aren't connected). */
export async function resetUserPassword(_: AdminResult, form: FormData): Promise<AdminResult> {
  const session = await requireAdmin();
  const userId = String(form.get('userId') ?? '');
  if (!userId || userId === session.user.id) return { error: 'Use your account page to change your own password.' };
  const target = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!target) return { error: 'That account no longer exists.' };
  const password = temporaryPassword();
  await auth.api.setUserPassword({ headers: await headers(), body: { userId, newPassword: password } });
  await auth.api.revokeUserSessions({ headers: await headers(), body: { userId } });
  await db.update(user).set({ mustChangePassword: true }).where(eq(user.id, userId));
  revalidatePath('/admin/users');
  return { ok: `New temporary password for ${target.name}. They’ll choose their own at next log-in.`, password, email: target.email };
}
