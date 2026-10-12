import { z } from 'zod';

/**
 * Lesson, question and module-plan shapes from Appendix C of the assignment, extended so that
 * every element points at the key facts it teaches. The generator writes these, the renderers
 * read them, and `checkLesson` / `checkQuestion` enforce the rules the schema alone can't.
 */

export const FactKey = z.string().regex(/^f\d+$/, 'Fact keys look like "f1"');
const Facts = z.array(FactKey).min(1, 'Every element must reference at least one fact');
const Id = z.string().regex(/^[a-z0-9-]+$/, 'Ids are lowercase words joined by dashes');

/* ---------- Read: one short paragraph per idea, each tagged with its facts ---------- */

export const ReadContent = z.object({
  title: z.string().min(3),
  paragraphs: z.array(z.object({ text: z.string().min(1), facts: Facts })).min(1),
  keyTerms: z.array(z.object({ term: z.string().min(1), definition: z.string().min(1), facts: Facts })).default([]),
  commonMistake: z.object({ text: z.string().min(1), facts: Facts }),
});

/* ---------- Diagram: shapes described as data, drawn by the app ---------- */

export const DiagramElement = z.object({
  id: Id,
  type: z.enum(['rect', 'zone', 'arrow', 'label']),
  x: z.number(),
  y: z.number(),
  /** rect and zone size; arrows end at (x2, y2) instead. */
  w: z.number().positive().optional(),
  h: z.number().positive().optional(),
  x2: z.number().optional(),
  y2: z.number().optional(),
  label: z.string().optional(),
  tone: z.enum(['neutral', 'cool', 'hot', 'warning']).default('neutral'),
  /** Where the label sits. Boxes: inside, above, below, left, right. Arrows: start, middle, end. Omitted means automatic. */
  labelAt: z.enum(['inside', 'above', 'below', 'left', 'right', 'start', 'middle', 'end']).optional(),
  facts: Facts,
});

export const DiagramContent = z.object({
  title: z.string().min(3),
  width: z.number().positive(),
  height: z.number().positive(),
  elements: z.array(DiagramElement).min(1),
  captions: z.array(z.object({ text: z.string().min(1), facts: Facts, elements: z.array(Id).default([]) })).min(1),
});

/* ---------- Scene states: what the data-hall scene shows for an item, decision or choice ---------- */

const RackIndex = z.number().int().min(0).max(3).nullable();
export const SceneState = z
  .object({
    doorFar: z.enum(['closed', 'open']),
    doorNear: z.enum(['closed', 'open']),
    reversed: RackIndex,
    missingBlank: RackIndex,
    tile: z.enum(['cold', 'hot']),
  })
  .partial();
export type SceneState = z.infer<typeof SceneState>;

/* ---------- Game: match pairs, put in order, or sort into groups ---------- */

const GameItem = z.object({ id: Id, text: z.string().min(1), facts: Facts, scene: SceneState.optional() });

export const GameContent = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('match'),
    prompt: z.string().min(1),
    items: z.array(GameItem).min(4),
    /** Pairs of item ids that belong together. */
    answer: z.array(z.tuple([Id, Id])).min(2),
  }),
  z.object({
    kind: z.literal('order'),
    prompt: z.string().min(1),
    items: z.array(GameItem).min(3),
    /** Item ids in the correct order. */
    answer: z.array(Id).min(3),
  }),
  z.object({
    kind: z.literal('sort'),
    prompt: z.string().min(1),
    groups: z.array(z.object({ id: Id, label: z.string().min(1) })).min(2),
    items: z.array(GameItem).min(3),
    /** Which group each item belongs in. */
    answer: z.array(z.object({ item: Id, group: Id })).min(3),
  }),
]);

/* ---------- Practice sim: a scenario with decisions ---------- */

export const Choice = z.object({
  text: z.string().min(1),
  correct: z.boolean(),
  feedback: z.string().min(1),
  fromCommonMistake: z.boolean().default(false),
  /** What the scene shows after this choice, layered over the decision's scene. */
  scene: SceneState.optional(),
});

export const SimContent = z.object({
  title: z.string().min(3),
  scenario: z.string().min(1),
  decisions: z
    .array(z.object({ id: Id, prompt: z.string().min(1), facts: Facts, scene: SceneState.optional(), choices: z.array(Choice).min(2) }))
    .min(1),
});

/* ---------- Lesson: shared fields plus format-specific content ---------- */

const LessonBase = { id: z.string().min(1), topicId: z.string().min(1), facts: Facts };

export const Lesson = z.discriminatedUnion('format', [
  z.object({ ...LessonBase, format: z.literal('read'), content: ReadContent }),
  z.object({ ...LessonBase, format: z.literal('diagram'), content: DiagramContent }),
  z.object({ ...LessonBase, format: z.literal('game'), content: GameContent }),
  z.object({ ...LessonBase, format: z.literal('sim'), content: SimContent }),
]);

/* ---------- Question: practice and assessment, one fact each ---------- */

export const Question = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  fact: FactKey,
  prompt: z.string().min(1),
  options: z
    .array(z.object({ text: z.string().min(1), correct: z.boolean(), explanation: z.string().min(1), fromCommonMistake: z.boolean().default(false) }))
    .min(2),
});

/* ---------- Module plan: the output of personalization ---------- */

export const LessonFormat = z.enum(['read', 'diagram', 'game', 'sim']);
export const ModulePlan = z.object({
  style: LessonFormat,
  topics: z.array(z.object({ topicId: z.string(), primary: LessonFormat, secondary: LessonFormat })),
});

export type Lesson = z.infer<typeof Lesson>;
export type LessonInput = z.input<typeof Lesson>;
export type Question = z.infer<typeof Question>;
export type QuestionInput = z.input<typeof Question>;
export type ReadContent = z.infer<typeof ReadContent>;
export type DiagramContent = z.infer<typeof DiagramContent>;
export type GameContent = z.infer<typeof GameContent>;
export type SimContent = z.infer<typeof SimContent>;
export type ModulePlan = z.infer<typeof ModulePlan>;

/* ---------- Rules beyond the shape ---------- */

export const READ_WORDS = { min: 150, max: 250 };

export const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export function readWordCount(content: ReadContent) {
  return wordCount([content.title, ...content.paragraphs.map(p => p.text), ...content.keyTerms.map(t => `${t.term} ${t.definition}`), content.commonMistake.text].join(' '));
}

/** Every fact key referenced anywhere inside a lesson's content. */
export function factsTaught(lesson: Lesson): Set<string> {
  const c = lesson.content;
  const lists: string[][] = [];
  switch (lesson.format) {
    case 'read': {
      const r = c as ReadContent;
      lists.push(...r.paragraphs.map(p => p.facts), ...r.keyTerms.map(t => t.facts), r.commonMistake.facts);
      break;
    }
    case 'diagram': {
      const d = c as DiagramContent;
      lists.push(...d.elements.map(e => e.facts), ...d.captions.map(cap => cap.facts));
      break;
    }
    case 'game':
      lists.push(...(c as GameContent).items.map(i => i.facts));
      break;
    case 'sim':
      lists.push(...(c as SimContent).decisions.map(d => d.facts));
      break;
  }
  return new Set(lists.flat());
}

function gameProblems(game: GameContent): string[] {
  const ids = new Set(game.items.map(i => i.id));
  const problems: string[] = [];
  if (ids.size !== game.items.length) problems.push('Game item ids must be unique.');
  if (game.kind === 'match') {
    const used = game.answer.flat();
    if (used.some(id => !ids.has(id))) problems.push('A match pair uses an item that does not exist.');
    if (new Set(used).size !== used.length) problems.push('Each item can be in only one pair.');
    if (used.length !== ids.size) problems.push('Every item must be in exactly one pair.');
  }
  if (game.kind === 'order') {
    if (game.answer.length !== ids.size || new Set(game.answer).size !== ids.size || game.answer.some(id => !ids.has(id)))
      problems.push('The order answer must list every item exactly once.');
  }
  if (game.kind === 'sort') {
    const groups = new Set(game.groups.map(g => g.id));
    if (game.answer.some(a => !ids.has(a.item) || !groups.has(a.group))) problems.push('A sort answer uses an unknown item or group.');
    if (game.answer.length !== ids.size || new Set(game.answer.map(a => a.item)).size !== ids.size) problems.push('Every item must be sorted into exactly one group.');
    const usedGroups = new Set(game.answer.map(a => a.group));
    if (game.groups.some(g => !usedGroups.has(g.id))) problems.push('Every group needs at least one item.');
  }
  return problems;
}

/* ---------- Diagram layout: label boxes estimated the way DiagramLesson places them ---------- */

type Box = { x: number; y: number; w: number; h: number; owner: string };
const overlaps = (a: Box, b: Box, pad = 0) => a.x < b.x + b.w - pad && b.x < a.x + a.w - pad && a.y < b.y + b.h - pad && b.y < a.y + a.h - pad;

function labelBox(e: DiagramContent['elements'][number], width: number): Box | null {
  if (!e.label) return null;
  const n = e.label.length;
  if (e.type === 'zone') return { x: e.x + 10, y: e.y + (e.h ?? 0) - 20, w: n * 7.6, h: 12, owner: e.id };
  if (e.type === 'label') return { x: e.x, y: e.y - 7, w: n * 6.4, h: 14, owner: e.id };
  if (e.type === 'rect') {
    const w = e.w ?? 0;
    const h = e.h ?? 0;
    const tw = n * 6.4;
    const at = e.labelAt ?? (w < 30 ? (e.x < width / 2 ? 'left' : 'right') : tw <= w - 6 ? 'inside' : 'above');
    if (at === 'inside') return null; // fits inside its own box
    if (at === 'above') return { x: e.x + w / 2 - tw / 2, y: e.y - 15, w: tw, h: 14, owner: e.id };
    if (at === 'below') return { x: e.x + w / 2 - tw / 2, y: e.y + h + 7, w: tw, h: 14, owner: e.id };
    if (at === 'left') return { x: e.x - 6 - tw, y: e.y + h / 2 - 7, w: tw, h: 14, owner: e.id };
    return { x: e.x + w + 6, y: e.y + h / 2 - 7, w: tw, h: 14, owner: e.id };
  }
  const x2 = e.x2 ?? e.x;
  const y2 = e.y2 ?? e.y;
  const vertical = Math.abs(y2 - e.y) > Math.abs(x2 - e.x);
  const at = e.labelAt === 'start' ? [e.x, e.y] : e.labelAt === 'end' ? [x2, y2] : [(e.x + x2) / 2, (e.y + y2) / 2];
  const tw = n * 6;
  if (!vertical) return { x: at[0] - tw / 2, y: at[1] - 16, w: tw, h: 13, owner: e.id };
  const left = e.x > width * 0.6;
  return { x: left ? at[0] - 8 - tw : at[0] + 8, y: at[1] - 6.5, w: tw, h: 13, owner: e.id };
}

/** Layout rules a generated diagram must meet so it reads cleanly: no collisions, arrows that connect, a filled canvas. */
export function diagramLayoutProblems(content: DiagramContent): string[] {
  const problems: string[] = [];
  const { elements, width, height } = content;
  const rects = elements.filter(e => e.type === 'rect').map(e => ({ x: e.x, y: e.y, w: e.w ?? 0, h: e.h ?? 0, owner: e.id }));
  const areas = elements.filter(e => e.type === 'rect' || e.type === 'zone').map(e => ({ x: e.x, y: e.y, w: e.w ?? 0, h: e.h ?? 0, owner: e.id }));
  // A part drawn fully inside another (a panel inside a rack row) is fine; a partial overlap is not.
  const inside = (a: Box, b: Box) => a.x >= b.x - 0.5 && a.y >= b.y - 0.5 && a.x + a.w <= b.x + b.w + 0.5 && a.y + a.h <= b.y + b.h + 0.5;
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++)
      if (overlaps(rects[i], rects[j], 1) && !inside(rects[i], rects[j]) && !inside(rects[j], rects[i]))
        problems.push(`Rects ${rects[i].owner} and ${rects[j].owner} partly overlap; move them apart or put one fully inside the other.`);

  const labels = elements.map(e => labelBox(e, width)).filter((b): b is Box => b !== null);
  for (let i = 0; i < labels.length; i++) {
    const a = labels[i];
    if (a.x < 4 || a.y < 4 || a.x + a.w > width - 4 || a.y + a.h > height - 4) problems.push(`The label of ${a.owner} runs off the canvas; shorten it or move the element.`);
    for (let j = i + 1; j < labels.length; j++) if (overlaps(a, labels[j], 1)) problems.push(`The labels of ${a.owner} and ${labels[j].owner} collide; move one of them.`);
    for (const r of rects) if (r.owner !== a.owner && overlaps(a, r, 1)) problems.push(`The label of ${a.owner} sits on top of ${r.owner}; move one of them.`);
  }

  // Every arrow starts or ends at a part (a rect or zone, within 30 units).
  for (const e of elements.filter(el => el.type === 'arrow')) {
    const near = (x: number, y: number) => areas.some(a => x >= a.x - 30 && x <= a.x + a.w + 30 && y >= a.y - 30 && y <= a.y + a.h + 30);
    if (!near(e.x, e.y) && !near(e.x2 ?? e.x, e.y2 ?? e.y)) problems.push(`Arrow ${e.id} doesn't start or end on any part; connect it to the thing it describes.`);
  }

  // The drawing should use the canvas, not sit in one corner.
  const xs = elements.flatMap(e => [e.x, e.type === 'arrow' ? e.x2 ?? e.x : e.x + (e.w ?? 0)]);
  const ys = elements.flatMap(e => [e.y, e.type === 'arrow' ? e.y2 ?? e.y : e.y + (e.h ?? 0)]);
  if (Math.max(...xs) - Math.min(...xs) < width * 0.55 || Math.max(...ys) - Math.min(...ys) < height * 0.5)
    problems.push('The drawing uses too little of the canvas; spread the parts out to fill most of it.');
  return problems;
}

/**
 * Checks a lesson against its brief's fact keys. Returns readable problems; an empty list means
 * the lesson can be published.
 */
export function checkLesson(input: unknown, briefFacts: string[]): string[] {
  const parsed = Lesson.safeParse(input);
  if (!parsed.success) return parsed.error.issues.map(i => `${i.path.join('.') || 'lesson'}: ${i.message}`);
  const lesson = parsed.data;
  const known = new Set(briefFacts);
  const problems: string[] = [];
  const taught = factsTaught(lesson);

  const unknown = [...taught, ...lesson.facts].filter(f => !known.has(f));
  if (unknown.length) problems.push(`References facts that are not in the brief: ${[...new Set(unknown)].join(', ')}.`);
  const missing = briefFacts.filter(f => !taught.has(f));
  if (missing.length) problems.push(`Does not teach: ${missing.join(', ')}.`);
  const declared = new Set(lesson.facts);
  if (taught.size !== declared.size || [...taught].some(f => !declared.has(f))) problems.push('The lesson’s facts list must match the facts its elements teach.');

  if (lesson.format === 'read') {
    const words = readWordCount(lesson.content);
    if (words < READ_WORDS.min || words > READ_WORDS.max) problems.push(`Read lessons must be ${READ_WORDS.min}–${READ_WORDS.max} words (this one is ${words}).`);
  }
  if (lesson.format === 'diagram') {
    const { width, height, elements, captions } = lesson.content;
    const ids = new Set(elements.map(e => e.id));
    if (ids.size !== elements.length) problems.push('Diagram element ids must be unique.');
    for (const e of elements) {
      const right = e.type === 'arrow' ? Math.max(e.x, e.x2 ?? e.x) : e.x + (e.w ?? 0);
      const bottom = e.type === 'arrow' ? Math.max(e.y, e.y2 ?? e.y) : e.y + (e.h ?? 0);
      const left = e.type === 'arrow' ? Math.min(e.x, e.x2 ?? e.x) : e.x;
      const top = e.type === 'arrow' ? Math.min(e.y, e.y2 ?? e.y) : e.y;
      if (left < 0 || top < 0 || right > width || bottom > height) problems.push(`Diagram element ${e.id} is outside the canvas.`);
      if ((e.type === 'rect' || e.type === 'zone') && (!e.w || !e.h)) problems.push(`Diagram element ${e.id} needs a width and height.`);
      if (e.type === 'arrow' && (e.x2 === undefined || e.y2 === undefined)) problems.push(`Diagram arrow ${e.id} needs an end point.`);
    }
    for (const cap of captions) if (cap.elements.some(id => !ids.has(id))) problems.push('A caption points at a diagram element that does not exist.');
    problems.push(...diagramLayoutProblems(lesson.content));
  }
  if (lesson.format === 'game') problems.push(...gameProblems(lesson.content));
  if (lesson.format === 'sim') {
    for (const d of lesson.content.decisions) {
      const correct = d.choices.filter(c => c.correct).length;
      if (correct !== 1) problems.push(`Decision ${d.id} must have exactly one correct choice (has ${correct}).`);
    }
  }
  return problems;
}

export function checkQuestion(input: unknown, briefFacts: string[]): string[] {
  const parsed = Question.safeParse(input);
  if (!parsed.success) return parsed.error.issues.map(i => `${i.path.join('.') || 'question'}: ${i.message}`);
  const q = parsed.data;
  const problems: string[] = [];
  if (!briefFacts.includes(q.fact)) problems.push(`Question ${q.id} tests ${q.fact}, which is not in the brief.`);
  const correct = q.options.filter(o => o.correct).length;
  if (correct !== 1) problems.push(`Question ${q.id} must have exactly one correct option (has ${correct}).`);
  return problems;
}
