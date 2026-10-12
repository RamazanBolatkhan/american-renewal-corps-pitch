import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { learnerProfile } from '@/db/schema';
import { auth } from './auth';
import { isFormat, type Format } from './module';
import { isStaff } from './permissions';

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Signed in with a real account (not an anonymous demo user). */
export function isMember(session: Awaited<ReturnType<typeof getSession>>) {
  return Boolean(session && !session.user.isAnonymous);
}

export async function getLearningStyle(userId: string): Promise<Format | null> {
  const profile = await db.query.learnerProfile.findFirst({ where: eq(learnerProfile.userId, userId) });
  return isFormat(profile?.learningStyle) ? profile.learningStyle : null;
}

/** The real lock for the admin area. Call it in every admin page and admin action. */
export async function requireStaff(next = '/admin') {
  const session = await getSession();
  if (!session || session.user.isAnonymous) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!isStaff(session.user.role)) redirect('/no-access');
  return session;
}

export async function requireAdmin() {
  const session = await requireStaff('/admin/users');
  if (session.user.role !== 'admin') redirect('/no-access');
  return session;
}
