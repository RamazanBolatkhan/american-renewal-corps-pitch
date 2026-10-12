import { asc, desc, eq, inArray } from 'drizzle-orm';
import { Eyebrow, SkeletonNote } from '@/components/ui';
import { db } from '@/db';
import { brief, briefFact, curriculumModule, generatedLesson, generatedQuestion, topic } from '@/db/schema';
import { coolingModule, formatInfo, formats } from '@/lib/module';
import { requireStaff } from '@/lib/session';

type TopicView = { id: string; title: string; version: number | null; facts: { key: string; text: string }[]; formats: string[]; questionFacts: string[] };
type ModuleView = { id: string; title: string; program: string | null; topics: TopicView[] };

/** Approved modules with each topic's latest brief version. */
async function loadModules(): Promise<ModuleView[]> {
  const modules = await db.select().from(curriculumModule).orderBy(asc(curriculumModule.title));
  if (modules.length === 0) return [];
  const topics = await db.select().from(topic).where(inArray(topic.moduleId, modules.map(m => m.id))).orderBy(asc(topic.position));
  const briefs = topics.length
    ? await db.select().from(brief).where(inArray(brief.topicId, topics.map(t => t.id))).orderBy(desc(brief.version))
    : [];
  const latest = new Map<string, (typeof briefs)[number]>();
  for (const b of briefs) if (!latest.has(b.topicId)) latest.set(b.topicId, b);
  const facts = latest.size
    ? await db.select().from(briefFact).where(inArray(briefFact.briefId, [...latest.values()].map(b => b.id))).orderBy(asc(briefFact.position))
    : [];
  const latestIds = [...latest.values()].map(b => b.id);
  const lessons = latestIds.length ? await db.select({ briefId: generatedLesson.briefId, format: generatedLesson.format }).from(generatedLesson).where(inArray(generatedLesson.briefId, latestIds)) : [];
  const questions = latestIds.length ? await db.select({ briefId: generatedQuestion.briefId, fact: generatedQuestion.fact }).from(generatedQuestion).where(inArray(generatedQuestion.briefId, latestIds)) : [];
  return modules.map(m => ({
    id: m.id,
    title: m.title,
    program: m.program,
    topics: topics.filter(t => t.moduleId === m.id).map(t => {
      const b = latest.get(t.id);
      return {
        id: t.id, title: t.title, version: b?.version ?? null, facts: b ? facts.filter(f => f.briefId === b.id) : [],
        formats: b ? lessons.filter(l => l.briefId === b.id).map(l => l.format) : [],
        questionFacts: b ? questions.filter(q => q.briefId === b.id).map(q => q.fact) : [],
      };
    }),
  }));
}

export default async function ContentPage() {
  await requireStaff('/admin/content');
  const stored = await loadModules();
  const modules: ModuleView[] = stored.length
    ? stored
    : [{ id: coolingModule.id, title: coolingModule.title, program: coolingModule.program, topics: coolingModule.topics.map(t => ({ id: t.id, title: t.title, version: null, facts: t.facts, formats: [...formats], questionFacts: t.facts.map(f => f.key) })) }];

  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>{stored.length ? `${stored.length} APPROVED MODULE${stored.length === 1 ? '' : 'S'}` : 'SAMPLE MODULE · NOTHING APPROVED YET'}</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>CONTENT</h1>
        </div>
      </div>
      <p className="ui-small" style={{ maxWidth: 640 }}>Every key fact should be taught by every format and checked by at least one question. Gaps and stale lessons show up here.</p>

      {modules.map(m => (
        <div key={m.id}>
          <h2 className="ui-h2" style={{ marginTop: 40 }}>{m.title.toUpperCase()}</h2>
          {m.program && <p className="ui-small" style={{ marginTop: 6 }}>{m.program}</p>}
          {m.topics.map((t, index) => (
            <section className="ui-section" key={t.id} aria-labelledby={`${t.id}-title`}>
              <h3 id={`${t.id}-title`} className="ui-h3">
                0{index + 1} · {t.title.toUpperCase()} {t.version && <span className="ui-pill" style={{ marginLeft: 10, verticalAlign: 'middle' }}>BRIEF V{t.version}</span>}
              </h3>
              <div className="ui-table-wrap" style={{ marginTop: 14 }}>
                <table className="ui-table">
                  <thead><tr><th>FACT</th>{formats.map(f => <th key={f}>{formatInfo[f].short}</th>)}<th>QUESTIONS</th></tr></thead>
                  <tbody>
                    {t.facts.map(fact => (
                      <tr key={fact.key}>
                        <td><b className="ui-yes" style={{ fontWeight: 400 }}>{fact.key.toUpperCase()}</b> {fact.text}</td>
                        {formats.map(f => <td key={f}>{t.formats.includes(f) ? <span className="ui-pill ui-pill--approved">READY</span> : <span className="ui-pill">NOT GENERATED</span>}</td>)}
                        <td>{t.questionFacts.includes(fact.key) ? <span className="ui-pill ui-pill--approved">READY</span> : <span className="ui-pill">NONE</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      ))}
      <SkeletonNote>Ready means the lesson for the topic’s latest brief passed every check, including teaching every fact. The sample module is hand-written.</SkeletonNote>
    </>
  );
}
