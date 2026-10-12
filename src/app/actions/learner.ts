'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { learnerProfile } from '@/db/schema';
import { auth } from '@/lib/auth';
import { isFormat } from '@/lib/module';
import { getSession } from '@/lib/session';

/**
 * Saves the learning style. Visitors without a session get an anonymous demo account
 * first, so their choice is stored and carried over if they register later.
 */
export async function chooseLearningStyle(formData: FormData) {
  const style = formData.get('style');
  if (!isFormat(style)) throw new Error('Unknown learning style');

  const session = await getSession();
  const userId = session?.user.id ?? (await auth.api.signInAnonymous({ headers: await headers() }))?.user.id;
  if (!userId) throw new Error('Could not start the demo');

  await db
    .insert(learnerProfile)
    .values({ userId, learningStyle: style })
    .onConflictDoUpdate({ target: learnerProfile.userId, set: { learningStyle: style } });

  redirect('/learn');
}
