'use server';

import { headers } from 'next/headers';
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
