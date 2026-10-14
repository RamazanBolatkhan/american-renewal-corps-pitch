import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import '@/components/iso/iso.css';
import '@/components/figures/hall/hall.css';
import { publishJudged, rejectJudged, rejudge } from '@/app/actions/judge';
import { HallArt } from '@/components/figures/hall/art';
import { Icon } from '@/components/Icon';
import { DiagramLesson } from '@/components/lessons/DiagramLesson';
import { GameLesson } from '@/components/lessons/GameLesson';
import { ReadLesson } from '@/components/lessons/ReadLesson';
import { SimLesson } from '@/components/lessons/SimLesson';
import { Eyebrow } from '@/components/ui';
import { db } from '@/db';
import { judgment, topic, user } from '@/db/schema';
import { loadBriefs } from '@/lib/content/generate';
import { contentOf } from '@/lib/content/judge';
import { verdictOf } from '@/lib/content/judging';
import { DiagramContent, GameContent, Question, ReadContent, SimContent } from '@/lib/content/lessons';
import { can } from '@/lib/permissions';
import { requireStaff } from '@/lib/session';

const isUuid = (value: string) => /^[0-9a-f-]{36}$/i.test(value);

/** The content as a student would see it. */
function Preview({ kind, content }: { kind: string; content: unknown }) {
  if (kind === 'read') { const c = ReadContent.safeParse(content); if (c.success) return <ReadLesson content={c.data} />; }
  if (kind === 'diagram') { const c = DiagramContent.safeParse(content); if (c.success) return <DiagramLesson content={c.data} />; }
  if (kind === 'game') {
    const c = GameContent.safeParse(content);
    if (c.success) return <GameLesson content={c.data} art={c.data.items.some(i => i.scene) ? <HallArt key="art" /> : undefined} />;
  }
  if (kind === 'sim') {
    const c = SimContent.safeParse(content);
    if (c.success) return <SimLesson content={c.data} art={c.data.decisions.some(d => d.scene || d.choices.some(ch => ch.scene)) ? <HallArt key="art" /> : undefined} />;
  }
  if (kind === 'questions' && Array.isArray(content)) {
    const questions = content.map(q => Question.safeParse(q)).flatMap(q => (q.success ? [q.data] : []));
    return (
      <ol className="judge-questions">
        {questions.map(q => (
          <li key={q.id}>
            <b>{q.fact.toUpperCase()} · {q.prompt}</b>
            <ul>{q.options.map(o => <li key={o.text} className={o.correct ? 'is-correct' : ''}>{o.correct ? '✓ ' : ''}{o.text}<span className="ui-small"> — {o.explanation}</span></li>)}</ul>
          </li>
        ))}
      </ol>
    );
  }
  return <pre className="judge-raw">{JSON.stringify(content, null, 2)}</pre>;
}

export default async function ReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const session = await requireStaff(`/admin/reviews/${id}`);
  const { error } = await searchParams;
  if (!isUuid(id)) notFound();
  const row = await db.query.judgment.findFirst({ where: eq(judgment.id, id) });
  if (!row) notFound();
  const [b] = await loadBriefs([row.briefId]);
  const t = await db.query.topic.findFirst({ where: eq(topic.id, row.topicId) });
  const content = await contentOf(row.briefId, row.kind);
  const decider = row.decidedBy ? await db.query.user.findFirst({ where: eq(user.id, row.decidedBy) }) : null;
  const judgeSays = row.status === 'error' ? null : verdictOf(row.findings);
  const canDecide = can(session.user.role, 'edit') && content;

  return (
    <>
      <Link className="ui-crumb" href="/admin/reviews"><Icon name="back" /> REVIEWS</Link>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>{row.kind.toUpperCase()} · JUDGED WITH GUIDE V{row.guideVersion} · {row.model}</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(32px,4vw,60px)' }}>{t?.title.toUpperCase() ?? 'REVIEW'}</h1>
        </div>
        <span className={`ui-pill ${row.status === 'flagged' ? 'ui-pill--warn' : row.status === 'error' ? 'ui-pill--failed' : 'ui-pill--approved'}`}>
          {row.status === 'flagged' ? 'FLAGGED · HIDDEN FROM STUDENTS' : row.status === 'error' ? 'JUDGE FAILED · HIDDEN' : row.status === 'passed' ? 'PASSED · VISIBLE' : 'PUBLISHED BY EDITOR'}
        </span>
      </div>

      <div className="judge-layout">
        <div className="judge-main">
          <section aria-labelledby="findings-title">
            <h2 id="findings-title" className="ui-label" style={{ marginBottom: 10 }}>WHAT THE JUDGE FOUND</h2>
            {row.findings.length === 0 ? (
              <p className="ui-small">No problems found.</p>
            ) : (
              <ul className="ui-issues">
                {row.findings.map((f, i) => (
                  <li key={i} className={f.severity === 'warning' ? 'is-warning' : ''}><b>{f.severity.toUpperCase()} · {f.rule} · {f.where}</b>{f.problem}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="judge-preview" aria-labelledby="preview-title">
            <h2 id="preview-title" className="ui-label" style={{ margin: '28px 0 12px' }}>WHAT STUDENTS WOULD SEE</h2>
            {content ? <Preview kind={row.kind} content={content} /> : <p className="ui-small">This content no longer exists.</p>}
          </section>
        </div>

        <aside className="judge-side">
          {b && (
            <section className="ui-frame">
              <h2 className="ui-label">THE BRIEF</h2>
              <p className="ui-small" style={{ marginTop: 8 }}><b>Objective:</b> {b.objective}</p>
              <ul className="ui-facts" style={{ marginTop: 10 }}>{b.facts.map(f => <li key={f.key}><b>{f.key.toUpperCase()}</b>{f.text}</li>)}</ul>
              <p className="ui-small" style={{ marginTop: 10 }}><b>Common mistake:</b> {b.commonMistake}</p>
            </section>
          )}

          {row.status === 'published' ? (
            <p className="ui-small" style={{ marginTop: 16 }}>Published by {decider?.name ?? decider?.email ?? 'an editor'}{row.decidedAt ? ` on ${row.decidedAt.toLocaleDateString('en-US')}` : ''}.</p>
          ) : null}

          {canDecide && (
            <form className="ui-frame judge-decide" style={{ marginTop: 16 }}>
              <input type="hidden" name="id" value={row.id} />
              <h2 className="ui-label">YOUR DECISION</h2>
              <p className="ui-small">
                {judgeSays === 'flag' ? 'The judge says this should not go out.' : judgeSays === 'pass' ? 'The judge found nothing that blocks it.' : 'The judge could not run; decide yourself.'}{' '}
                If you disagree with the judge, say why: your note is what the next guide learns from.
              </p>
              <label className="ui-dfield">
                NOTE FOR THE JUDGE
                <textarea name="note" rows={4} placeholder="e.g. The flagged answer is right: f2 says rack fronts face each other, so the judge misread the brief." />
              </label>
              {error === 'note' && <p className="ui-status ui-status--error" role="alert">You disagreed with the judge, so add a note saying why.</p>}
              <div className="ui-actions">
                <button className="ui-button ui-button--paper" type="submit" formAction={publishJudged}>PUBLISH</button>
                <button className="ui-button ui-button--outline" type="submit" formAction={rejectJudged}>REJECT &amp; REGENERATE</button>
              </div>
              <button className="ui-link judge-rejudge" type="submit" formAction={rejudge}>Judge again with the current guide</button>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
