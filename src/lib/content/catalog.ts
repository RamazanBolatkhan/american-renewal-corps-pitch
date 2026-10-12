import 'server-only';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { brief, briefFact, curriculumModule, generatedLesson, generatedQuestion, topic } from '@/db/schema';
import { coolingModule, type Format } from '@/lib/module';
import { Lesson, Question } from './lessons';
import { getSampleLesson, getSampleQuestions } from './sample';

/**
 * What students can learn: approved modules whose lessons have been generated, plus the
 * hand-written sample module. A generated module with the same id replaces the sample.
 */

export type CatalogTopic = {
  id: string;
  title: string;
  objective: string;
  facts: { key: string; text: string }[];
  commonMistake: string;
  /** The latest brief version, for generated modules. */
  briefId?: string;
};

export type CatalogModule = {
  id: string;
  title: string;
  program: string | null;
  labTask: string;
  skills: string[];
  topics: CatalogTopic[];
  source: 'sample' | 'generated';
};

const sample: CatalogModule = {
  id: coolingModule.id,
  title: coolingModule.title,
  program: coolingModule.program,
  labTask: coolingModule.labTask,
  skills: coolingModule.skills,
  topics: coolingModule.topics.map(t => ({ id: t.id, title: t.title, objective: t.objective, facts: t.facts, commonMistake: t.commonMistake })),
  source: 'sample',
};

async function generatedModules(): Promise<CatalogModule[]> {
  const modules = await db.select().from(curriculumModule).orderBy(asc(curriculumModule.title));
  if (!modules.length) return [];
  const topics = await db.select().from(topic).where(inArray(topic.moduleId, modules.map(m => m.id))).orderBy(asc(topic.position));
  if (!topics.length) return [];
  const briefs = await db.select().from(brief).where(inArray(brief.topicId, topics.map(t => t.id))).orderBy(desc(brief.version));
  const latest = new Map<string, (typeof briefs)[number]>();
  for (const b of briefs) if (!latest.has(b.topicId)) latest.set(b.topicId, b);
  const latestIds = [...latest.values()].map(b => b.id);
  if (!latestIds.length) return [];
  const facts = await db.select().from(briefFact).where(inArray(briefFact.briefId, latestIds)).orderBy(asc(briefFact.position));
  const lessons = await db.select({ briefId: generatedLesson.briefId }).from(generatedLesson).where(inArray(generatedLesson.briefId, latestIds));
  const withLessons = new Set(lessons.map(l => l.briefId));

  return modules
    .map(m => ({
      id: m.id,
      title: m.title,
      program: m.program,
      labTask: m.labTask,
      skills: m.skills,
      source: 'generated' as const,
      topics: topics
        .filter(t => t.moduleId === m.id && latest.has(t.id))
        .map(t => {
          const b = latest.get(t.id)!;
          return { id: t.id, title: t.title, objective: b.objective, commonMistake: b.commonMistake, briefId: b.id, facts: facts.filter(f => f.briefId === b.id).map(f => ({ key: f.key, text: f.text })) };
        }),
    }))
    // Students only see a module once at least one of its topics has lessons.
    .filter(m => m.topics.some(t => withLessons.has(t.briefId!)));
}

export async function listModules(): Promise<CatalogModule[]> {
  const generated = await generatedModules();
  return generated.some(m => m.id === sample.id) ? generated : [sample, ...generated];
}

export async function getModule(id: string | undefined) {
  const modules = await listModules();
  return modules.find(m => m.id === id) ?? modules[0];
}

/** The module a topic belongs to, with the topic and its position. */
export async function findTopic(topicId: string) {
  for (const m of await listModules()) {
    const index = m.topics.findIndex(t => t.id === topicId);
    if (index >= 0) return { module: m, topic: m.topics[index], index };
  }
  return null;
}

export async function getLesson(t: CatalogTopic, format: Format) {
  if (!t.briefId) return getSampleLesson(t.id, format);
  const row = await db.query.generatedLesson.findFirst({ where: (l, { and }) => and(eq(l.briefId, t.briefId!), eq(l.format, format)) });
  if (!row) return null;
  const parsed = Lesson.safeParse({ id: `${t.id}.${format}`, topicId: t.id, format, facts: row.facts, content: row.content });
  return parsed.success ? parsed.data : null;
}

export async function getQuestions(t: CatalogTopic) {
  if (!t.briefId) return getSampleQuestions(t.id);
  const rows = await db.select().from(generatedQuestion).where(eq(generatedQuestion.briefId, t.briefId)).orderBy(asc(generatedQuestion.position));
  return rows.map(r => Question.safeParse(r.content)).flatMap(r => (r.success ? [r.data] : []));
}
