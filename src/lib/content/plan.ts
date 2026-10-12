import { z } from 'zod';

/**
 * What the AI must return when it reads a learning plan, and what editors review.
 * Every fact and common mistake carries the exact source sentence it came from.
 */
export const ExtractedFact = z.object({
  key: z.string().regex(/^f\d+$/).describe('Fact key such as "f1". Keep the source numbering when it has one.'),
  text: z.string().min(1).describe('The fact, copied from the source with only whitespace or bullet cleanup.'),
  sourceQuote: z.string().min(1).describe('The exact sentence or line in the source this fact comes from.'),
});

export const ExtractedTopic = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  facts: z.array(ExtractedFact).min(1),
  commonMistake: z.string().describe('Empty string if the source gives none.'),
  commonMistakeSourceQuote: z.string().describe('Exact source text of the common mistake, or empty string.'),
});

export const ExtractedPlan = z.object({
  module: z.object({
    title: z.string().min(1),
    program: z.string().describe('Program name, or empty string if not stated.'),
    labTask: z.string().describe('The in-person lab task, or empty string if not stated.'),
    skills: z.array(z.string()),
  }),
  topics: z.array(ExtractedTopic).min(1),
  issues: z
    .array(z.object({ where: z.string(), message: z.string() }))
    .describe('Anything missing, unclear or contradictory in the source. Never fill gaps by inventing content.'),
});

export type ExtractedPlan = z.infer<typeof ExtractedPlan>;
export type PlanIssue = ExtractedPlan['issues'][number];

/** Stricter rules for approval: everything a brief needs must be present. */
export const ApprovablePlan = ExtractedPlan.extend({
  module: ExtractedPlan.shape.module.extend({ labTask: z.string().min(1, 'Lab task is required') }),
  topics: z.array(ExtractedTopic.extend({ commonMistake: z.string().min(1, 'Common mistake is required') })).min(1),
});

export function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60) || 'untitled';
}

const normalize = (value: string) =>
  value.toLowerCase().replace(/[“”"]/g, '"').replace(/[‘’']/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

/** Deterministic checks the AI can't skip: quotes must exist in the source, keys must be unique. */
export function checkAgainstSource(plan: ExtractedPlan, sourceText: string): PlanIssue[] {
  const source = normalize(sourceText);
  const issues: PlanIssue[] = [];
  plan.topics.forEach((t, i) => {
    const where = `Topic ${i + 1}: ${t.title}`;
    const keys = new Set<string>();
    t.facts.forEach(f => {
      if (keys.has(f.key)) issues.push({ where, message: `Fact key ${f.key} is used twice.` });
      keys.add(f.key);
      if (!source.includes(normalize(f.sourceQuote))) issues.push({ where: `${where}, ${f.key}`, message: 'Source quote not found in the uploaded file. Check this fact against the original.' });
    });
    if (!t.commonMistake) issues.push({ where, message: 'No common mistake found in the source.' });
    else if (t.commonMistakeSourceQuote && !source.includes(normalize(t.commonMistakeSourceQuote)))
      issues.push({ where, message: 'Common mistake quote not found in the uploaded file.' });
  });
  if (!plan.module.labTask) issues.push({ where: 'Module', message: 'No lab task found in the source.' });
  return issues;
}
