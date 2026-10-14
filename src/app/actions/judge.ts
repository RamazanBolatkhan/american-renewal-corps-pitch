'use server';

import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { generatedLesson, generatedQuestion, judgeFeedback, judgeGuide, judgment, type JudgedKind } from '@/db/schema';
import { briefText, generateForBriefs, loadBriefs } from '@/lib/content/generate';
import { activeGuide, contentOf, draftGuide, judgeAndRecord, saveDraft, scoreGuide } from '@/lib/content/judge';
import { DEFAULT_GUIDE, GUIDE_LIMIT, verdictOf } from '@/lib/content/judging';
import { can } from '@/lib/permissions';
import { requireStaff } from '@/lib/session';

async function requireCan(action: 'edit' | 'publish', next: string) {
  const session = await requireStaff(next);
  if (!can(session.user.role, action)) throw new Error('Your role can’t do this.');
  return session;
}

const isUuid = (value: string) => /^[0-9a-f-]{36}$/i.test(value);

async function briefTextOf(briefId: string) {
  const [b] = await loadBriefs([briefId]);
  if (!b) throw new Error('The brief for this content no longer exists.');
  return { text: briefText(b), topicId: b.topicId };
}

/**
 * An editor publishes or rejects judged content. The decision is kept with a copy of the content and the
 * judge's findings, so the next guide can learn from it. Disagreeing with the judge needs a reason.
 */
export async function publishJudged(formData: FormData) {
  return decide(formData, 'publish');
}

export async function rejectJudged(formData: FormData) {
  return decide(formData, 'reject');
}

async function decide(formData: FormData, decision: 'publish' | 'reject') {
  const id = String(formData.get('id'));
  const session = await requireCan('edit', `/admin/reviews/${id}`);
  const note = String(formData.get('note') ?? '').trim().slice(0, 2000);
  if (!isUuid(id)) throw new Error('Invalid decision.');
  const row = await db.query.judgment.findFirst({ where: eq(judgment.id, id) });
  if (!row) throw new Error('This review no longer exists.');
  const content = await contentOf(row.briefId, row.kind);
  if (!content) throw new Error('This content no longer exists.');

  const editorVerdict = decision === 'publish' ? 'pass' : 'flag';
  // A judge call that failed gave no verdict, so there is nothing for the guide to learn from it.
  if (row.status !== 'error') {
    const judgeVerdict = verdictOf(row.findings);
    if (judgeVerdict !== editorVerdict && !note) redirect(`/admin/reviews/${id}?error=note`);
    const { text } = await briefTextOf(row.briefId);
    await db.insert(judgeFeedback).values({ briefId: row.briefId, kind: row.kind, briefText: text, content, judgeVerdict, findings: row.findings, guideVersion: row.guideVersion, editorVerdict, note, decidedBy: session.user.id });
  }

  if (decision === 'publish') {
    await db.update(judgment).set({ status: 'published', decidedBy: session.user.id, decidedAt: new Date() }).where(eq(judgment.id, id));
  } else {
    // Rejected content is removed and made again; the new version is judged like any other.
    if (row.kind === 'questions') await db.delete(generatedQuestion).where(eq(generatedQuestion.briefId, row.briefId));
    else await db.delete(generatedLesson).where(and(eq(generatedLesson.briefId, row.briefId), eq(generatedLesson.format, row.kind)));
    await db.delete(judgment).where(eq(judgment.id, id));
    after(() => generateForBriefs([row.briefId], [row.kind]));
  }
  revalidatePath('/admin/reviews');
  revalidatePath('/admin/guide');
  redirect(`/admin/reviews?done=${decision}`);
}

/** Runs the current guide again on one piece of content (after a guide change, say). */
export async function rejudge(formData: FormData) {
  const id = String(formData.get('id'));
  await requireCan('edit', `/admin/reviews/${id}`);
  const row = isUuid(id) ? await db.query.judgment.findFirst({ where: eq(judgment.id, id) }) : null;
  if (!row) throw new Error('This review no longer exists.');
  const content = await contentOf(row.briefId, row.kind);
  if (!content) throw new Error('This content no longer exists.');
  const { text, topicId } = await briefTextOf(row.briefId);
  await judgeAndRecord({ briefId: row.briefId, topicId, briefText: text }, row.kind, content);
  revalidatePath('/admin/reviews');
  redirect(`/admin/reviews/${id}`);
}

/** Judges content generated before the judge existed (it stays visible until it is judged). */
export async function judgeUnjudged() {
  await requireCan('publish', '/admin/reviews');
  const lessons = await db.select({ briefId: generatedLesson.briefId, kind: generatedLesson.format, content: generatedLesson.content }).from(generatedLesson);
  const questionBriefs = [...new Set((await db.select({ briefId: generatedQuestion.briefId }).from(generatedQuestion)).map(q => q.briefId))];
  const judged = new Set((await db.select({ briefId: judgment.briefId, kind: judgment.kind }).from(judgment)).map(j => `${j.briefId}:${j.kind}`));
  const todo: { briefId: string; kind: JudgedKind; content?: unknown }[] = [
    ...lessons.filter(l => !judged.has(`${l.briefId}:${l.kind}`)),
    ...questionBriefs.filter(b => !judged.has(`${b}:questions`)).map(briefId => ({ briefId, kind: 'questions' as const })),
  ];
  after(async () => {
    for (const item of todo) {
      const content = item.content ?? (await contentOf(item.briefId, item.kind));
      if (!content) continue;
      const { text, topicId } = await briefTextOf(item.briefId);
      await judgeAndRecord({ briefId: item.briefId, topicId, briefText: text }, item.kind, content);
    }
  });
  redirect(`/admin/reviews?started=${todo.length}`);
}

/* ---------- HQ: the judging guide ---------- */

export async function draftGuideFromFeedback() {
  const session = await requireCan('publish', '/admin/guide');
  let version: number;
  try {
    version = await draftGuide(session.user.id);
    await scoreGuide(version);
  } catch (error) {
    redirect(`/admin/guide?error=${encodeURIComponent(error instanceof Error ? error.message.slice(0, 200) : 'Drafting failed.')}`);
  }
  revalidatePath('/admin/guide');
  redirect(`/admin/guide?v=${version}`);
}

/** HQ writes a draft by hand, starting from the active guide or editing an existing draft. */
export async function saveGuideDraft(formData: FormData) {
  const session = await requireCan('publish', '/admin/guide');
  const rules = String(formData.get('rules') ?? '').trim();
  const change = String(formData.get('change') ?? '').trim();
  const version = Number(formData.get('draftVersion'));
  if (!rules || rules.length > GUIDE_LIMIT) redirect(`/admin/guide?error=${encodeURIComponent(`The guide must be 1–${GUIDE_LIMIT} characters.`)}`);
  const existing = version ? await db.query.judgeGuide.findFirst({ where: eq(judgeGuide.version, version) }) : null;
  if (existing?.status === 'draft') {
    const changes = change ? [...existing.changes, { change, because: 'Written by HQ' }] : existing.changes;
    await db.update(judgeGuide).set({ rules, changes, score: null }).where(eq(judgeGuide.version, version));
    revalidatePath('/admin/guide');
    redirect(`/admin/guide?v=${version}`);
  }
  const created = await saveDraft(rules, [{ change: change || 'Edited by HQ', because: 'Written by HQ' }], session.user.id);
  revalidatePath('/admin/guide');
  redirect(`/admin/guide?v=${created}`);
}

export async function testGuide(formData: FormData) {
  await requireCan('publish', '/admin/guide');
  const version = Number(formData.get('version'));
  try {
    await scoreGuide(version);
  } catch (error) {
    redirect(`/admin/guide?error=${encodeURIComponent(error instanceof Error ? error.message.slice(0, 200) : 'Testing failed.')}`);
  }
  revalidatePath('/admin/guide');
  redirect(`/admin/guide?v=${version}`);
}

/** HQ approves a draft: from now on the judge follows it. Earlier versions are kept, retired. */
export async function approveGuide(formData: FormData) {
  const session = await requireCan('publish', '/admin/guide');
  const version = Number(formData.get('version'));
  const draft = await db.query.judgeGuide.findFirst({ where: eq(judgeGuide.version, version) });
  if (!draft || draft.status !== 'draft') throw new Error('Only a draft can be approved.');
  if (!draft.score) redirect(`/admin/guide?v=${version}&error=${encodeURIComponent('Test the draft against editor decisions before approving it.')}`);
  const current = await activeGuide();
  await db.transaction(async tx => {
    if (current.version === 1 && !(await tx.query.judgeGuide.findFirst({ where: eq(judgeGuide.version, 1) }))) {
      await tx.insert(judgeGuide).values({ version: 1, rules: DEFAULT_GUIDE, status: 'retired', changes: [] });
    }
    await tx.update(judgeGuide).set({ status: 'retired' }).where(and(eq(judgeGuide.status, 'active'), ne(judgeGuide.version, version)));
    await tx.update(judgeGuide).set({ status: 'active', approvedBy: session.user.id, approvedAt: new Date() }).where(eq(judgeGuide.version, version));
  });
  revalidatePath('/admin/guide');
  redirect(`/admin/guide?v=${version}&approved=1`);
}
