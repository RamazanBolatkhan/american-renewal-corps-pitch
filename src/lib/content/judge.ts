import 'server-only';
import { generateText, Output } from 'ai';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { generatedLesson, generatedQuestion, judgeFeedback, judgeGuide, judgment, type JudgedKind } from '@/db/schema';
import { DEFAULT_GUIDE, draftPrompt, draftSystem, GUIDE_LIMIT, GuideDraft, JudgeOutput, judgePrompt, judgeSystem, scoreOf, verdictOf, type FeedbackCase, type Verdict } from './judging';

/** The judge runs on every generated lesson, so it uses the cheap model. Override with JUDGE_MODEL. */
export const JUDGE_MODEL = process.env.JUDGE_MODEL || 'anthropic/claude-haiku-5.5';
/** Drafting a guide is rare and benefits from more care. Override with GUIDE_MODEL. */
export const GUIDE_MODEL = process.env.GUIDE_MODEL || JUDGE_MODEL;
/** Feedback cases a guide is scored on (the most recent ones). */
const SCORE_CASES = 40;

export type Guide = { version: number; rules: string };

/** The content a judgment is about, exactly as stored. */
export async function contentOf(briefId: string, kind: JudgedKind) {
  if (kind === 'questions') {
    const rows = await db.select().from(generatedQuestion).where(eq(generatedQuestion.briefId, briefId)).orderBy(asc(generatedQuestion.position));
    return rows.length ? rows.map(r => r.content) : null;
  }
  const row = await db.query.generatedLesson.findFirst({ where: and(eq(generatedLesson.briefId, briefId), eq(generatedLesson.format, kind)) });
  return row?.content ?? null;
}

/** The guide the judge follows now: HQ's latest approved version, or the built-in version 1. */
export async function activeGuide(): Promise<Guide> {
  const [row] = await db.select().from(judgeGuide).where(eq(judgeGuide.status, 'active')).orderBy(desc(judgeGuide.version)).limit(1);
  return row ? { version: row.version, rules: row.rules } : { version: 1, rules: DEFAULT_GUIDE };
}

/** One judge call. Returns the findings and the verdict that follows from them. */
export async function judgeContent(briefText: string, kind: JudgedKind, content: unknown, rules: string) {
  const result = await generateText({
    model: JUDGE_MODEL,
    system: judgeSystem(rules),
    prompt: judgePrompt(briefText, kind, content),
    output: Output.object({ schema: JudgeOutput }),
  });
  const findings = result.output.findings;
  return { findings, verdict: verdictOf(findings), usage: result.usage };
}

/**
 * Judges freshly generated content and records the verdict. A failed judge call fails closed: the
 * content is held for an editor rather than shown unchecked.
 */
export async function judgeAndRecord(target: { briefId: string; topicId: string; briefText: string }, kind: JudgedKind, content: unknown) {
  const guide = await activeGuide();
  let row: typeof judgment.$inferInsert;
  try {
    const { findings, verdict, usage } = await judgeContent(target.briefText, kind, content, guide.rules);
    row = {
      briefId: target.briefId, topicId: target.topicId, kind, status: verdict === 'pass' ? 'passed' : 'flagged', findings,
      guideVersion: guide.version, model: JUDGE_MODEL, inputTokens: usage?.inputTokens ?? null, outputTokens: usage?.outputTokens ?? null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : 'The judge call failed.';
    row = { briefId: target.briefId, topicId: target.topicId, kind, status: 'error', findings: [{ where: 'Judge', problem: message, rule: 'n/a', severity: 'error' }], guideVersion: guide.version, model: JUDGE_MODEL };
  }
  await db
    .insert(judgment)
    .values(row)
    .onConflictDoUpdate({ target: [judgment.briefId, judgment.kind], set: { ...row, decidedBy: null, decidedAt: null, createdAt: new Date() } });
}

/* ---------- Learning: draft a guide from editor feedback, and score guides against it ---------- */

async function feedbackCases(limit?: number) {
  const query = db.select().from(judgeFeedback).orderBy(desc(judgeFeedback.createdAt));
  return limit ? query.limit(limit) : query;
}

/** Asks the model for the next guide version from every editor decision so far; saves it as a draft. */
export async function draftGuide(createdBy: string) {
  const current = await activeGuide();
  const rows = await feedbackCases();
  const cases: FeedbackCase[] = rows.map(r => ({ id: r.id.slice(0, 8), kind: r.kind, judgeVerdict: r.judgeVerdict, editorVerdict: r.editorVerdict, note: r.note, findings: r.findings }));
  if (!cases.some(c => c.judgeVerdict !== c.editorVerdict)) throw new Error('Editors have agreed with the judge every time so far, so there is nothing to learn from yet.');
  const { output } = await generateText({
    model: GUIDE_MODEL,
    system: draftSystem(),
    prompt: draftPrompt(current.rules, cases),
    output: Output.object({ schema: GuideDraft }),
  });
  return saveDraft(output.rules.slice(0, GUIDE_LIMIT), output.changes, createdBy);
}

/** Saves a new draft version (from AI or written by HQ). */
export async function saveDraft(rules: string, changes: { change: string; because: string }[], createdBy: string) {
  const [last] = await db.select({ version: judgeGuide.version }).from(judgeGuide).orderBy(desc(judgeGuide.version)).limit(1);
  const version = Math.max(last?.version ?? 1, 1) + 1;
  await db.insert(judgeGuide).values({ version, rules, status: 'draft', changes, createdBy });
  return version;
}

/**
 * Re-judges the stored feedback cases with a guide and counts how often it matches the editors.
 * This is the test a draft has to pass before HQ approves it.
 */
export async function scoreGuide(version: number) {
  const guide = version === 1 ? (await db.query.judgeGuide.findFirst({ where: eq(judgeGuide.version, 1) })) ?? { rules: DEFAULT_GUIDE } : await db.query.judgeGuide.findFirst({ where: eq(judgeGuide.version, version) });
  if (!guide) throw new Error('That guide version does not exist.');
  const cases = await feedbackCases(SCORE_CASES);
  if (!cases.length) throw new Error('There are no editor decisions to test against yet.');
  const results = await Promise.all(
    cases.map(async c => {
      try {
        const { verdict } = await judgeContent(c.briefText, c.kind, c.content, guide.rules);
        return { feedbackId: c.id, editor: c.editorVerdict, judge: verdict };
      } catch {
        return null;
      }
    }),
  );
  const score = scoreOf(results.filter((r): r is { feedbackId: string; editor: Verdict; judge: Verdict } => r !== null));
  if (version === 1 && !(await db.query.judgeGuide.findFirst({ where: eq(judgeGuide.version, 1) }))) {
    // Store the built-in guide as a row the first time it is tested, so its score can be compared.
    await db.insert(judgeGuide).values({ version: 1, rules: DEFAULT_GUIDE, status: 'active', changes: [], score });
  } else {
    await db.update(judgeGuide).set({ score }).where(eq(judgeGuide.version, version));
  }
  return score;
}
