import { integer, jsonb, pgTable, primaryKey, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export * from './auth-schema';

/** A learner's saved preferences. Anonymous demo users get one too; it moves to their account on sign-up. */
export const learnerProfile = pgTable('learner_profile', {
  userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  learningStyle: text('learning_style').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

/* ---------- Plan imports: upload → AI extraction → review → approve ---------- */

export const importStatuses = ['extracting', 'needs_review', 'approved', 'generating', 'published', 'partial', 'failed'] as const;
export type ImportStatus = (typeof importStatuses)[number];

export const importJob = pgTable('import_job', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileName: text('file_name').notNull(),
  blobPathname: text('blob_pathname').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  uploadedBy: text('uploaded_by').references(() => user.id, { onDelete: 'set null' }),
  status: text('status').$type<ImportStatus>().notNull(),
  sourceText: text('source_text'),
  /** Editable draft in the ExtractedPlan shape (src/lib/content/plan.ts). */
  draft: jsonb('draft'),
  issues: jsonb('issues').$type<{ where: string; message: string }[]>().default([]).notNull(),
  error: text('error'),
  model: text('model'),
  moduleId: text('module_id'),
  approvedBy: text('approved_by').references(() => user.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

/* ---------- Curriculum: modules → topics → versioned briefs → facts ---------- */

export const curriculumModule = pgTable('module', {
  id: text('id').primaryKey(), // slug, e.g. "cooling-airflow"
  title: text('title').notNull(),
  program: text('program'),
  labTask: text('lab_task').notNull(),
  skills: jsonb('skills').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const topic = pgTable('topic', {
  id: text('id').primaryKey(), // "<module>--<topic slug>"
  moduleId: text('module_id').notNull().references(() => curriculumModule.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  position: integer('position').notNull(),
});

/** Briefs are never edited in place: every approved import adds a new version. */
export const brief = pgTable(
  'brief',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topicId: text('topic_id').notNull().references(() => topic.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    objective: text('objective').notNull(),
    commonMistake: text('common_mistake').notNull(),
    importJobId: uuid('import_job_id').references(() => importJob.id, { onDelete: 'set null' }),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [unique('brief_topic_version').on(table.topicId, table.version)],
);

export const briefFact = pgTable(
  'brief_fact',
  {
    briefId: uuid('brief_id').notNull().references(() => brief.id, { onDelete: 'cascade' }),
    key: text('key').notNull(), // "f1"
    text: text('text').notNull(),
    sourceQuote: text('source_quote'),
    position: integer('position').notNull(),
  },
  table => [primaryKey({ columns: [table.briefId, table.key] })],
);

/* ---------- Generated content: one lesson per brief version and format, questions per fact ---------- */

export const lessonFormats = ['read', 'diagram', 'game', 'sim'] as const;

/** A published lesson in the Appendix C shape (`content` is checked by `checkLesson` before it is saved). */
export const generatedLesson = pgTable(
  'lesson',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    briefId: uuid('brief_id').notNull().references(() => brief.id, { onDelete: 'cascade' }),
    topicId: text('topic_id').notNull().references(() => topic.id, { onDelete: 'cascade' }),
    format: text('format').$type<(typeof lessonFormats)[number]>().notNull(),
    facts: jsonb('facts').$type<string[]>().notNull(),
    content: jsonb('content').notNull(),
    model: text('model').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [unique('lesson_brief_format').on(table.briefId, table.format)],
);

export const generatedQuestion = pgTable('question', {
  id: uuid('id').primaryKey().defaultRandom(),
  briefId: uuid('brief_id').notNull().references(() => brief.id, { onDelete: 'cascade' }),
  topicId: text('topic_id').notNull().references(() => topic.id, { onDelete: 'cascade' }),
  fact: text('fact').notNull(),
  content: jsonb('content').notNull(),
  position: integer('position').notNull(),
});

/** Every AI call the generator makes: what it was for, how it went, and what it cost in tokens. */
export const generationRun = pgTable('generation_run', {
  id: uuid('id').primaryKey().defaultRandom(),
  briefId: uuid('brief_id').notNull().references(() => brief.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // read | diagram | game | sim | questions
  attempt: integer('attempt').notNull(),
  status: text('status').$type<'ok' | 'invalid' | 'error'>().notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  problems: jsonb('problems').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ---------- The judge: a second AI pass on meaning, editor decisions, and the guide it learns from ---------- */

export const judgedKinds = ['read', 'diagram', 'game', 'sim', 'questions'] as const;
export type JudgedKind = (typeof judgedKinds)[number];

/** A judge finding: what looks wrong, where, and which guide rule or brief fact it goes against. */
export type JudgeFinding = { where: string; problem: string; rule: string; severity: 'error' | 'warning' };

/**
 * The judge's latest verdict on one lesson (or a topic's question set). Students only see content that
 * passed or that an editor published; flagged content waits for an editor. Content generated before the
 * judge existed has no row and stays visible.
 */
export const judgment = pgTable(
  'judgment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    briefId: uuid('brief_id').notNull().references(() => brief.id, { onDelete: 'cascade' }),
    topicId: text('topic_id').notNull().references(() => topic.id, { onDelete: 'cascade' }),
    kind: text('kind').$type<JudgedKind>().notNull(),
    status: text('status').$type<'passed' | 'flagged' | 'published' | 'error'>().notNull(),
    findings: jsonb('findings').$type<JudgeFinding[]>().default([]).notNull(),
    guideVersion: integer('guide_version').notNull(),
    model: text('model').notNull(),
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    decidedBy: text('decided_by').references(() => user.id, { onDelete: 'set null' }),
    decidedAt: timestamp('decided_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [unique('judgment_brief_kind').on(table.briefId, table.kind)],
);

/**
 * Every editor decision on a judged lesson, kept forever with a copy of what was judged. These are the
 * cases a new judging guide is drafted from and scored against.
 */
export const judgeFeedback = pgTable('judge_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  briefId: uuid('brief_id').references(() => brief.id, { onDelete: 'set null' }),
  kind: text('kind').$type<JudgedKind>().notNull(),
  /** The brief and the content exactly as the judge saw them. */
  briefText: text('brief_text').notNull(),
  content: jsonb('content').notNull(),
  judgeVerdict: text('judge_verdict').$type<'pass' | 'flag'>().notNull(),
  findings: jsonb('findings').$type<JudgeFinding[]>().default([]).notNull(),
  guideVersion: integer('guide_version').notNull(),
  /** What the editor decided the content should be: publish it, or reject it for regeneration. */
  editorVerdict: text('editor_verdict').$type<'pass' | 'flag'>().notNull(),
  note: text('note').notNull(),
  decidedBy: text('decided_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/** HQ's judging guide. Drafts are written by HQ or proposed by AI from editor feedback; HQ approves each version. */
export const judgeGuide = pgTable('judge_guide', {
  version: integer('version').primaryKey(),
  rules: text('rules').notNull(),
  status: text('status').$type<'draft' | 'active' | 'retired'>().notNull(),
  /** Why this version differs from the one before it. */
  changes: jsonb('changes').$type<{ change: string; because: string }[]>().default([]).notNull(),
  /** How often this guide's verdicts matched editor decisions on the feedback cases, when tested. */
  score: jsonb('score').$type<{ agree: number; total: number; misses: { feedbackId: string; editor: 'pass' | 'flag'; judge: 'pass' | 'flag' }[]; testedAt: string } | null>(),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  approvedBy: text('approved_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
});
