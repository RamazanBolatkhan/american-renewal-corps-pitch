import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { approveImport, generateMissing, retryImport, saveDraft } from '@/app/actions/imports';
import { AutoRefresh } from '@/components/AutoRefresh';
import { Icon } from '@/components/Icon';
import { ImportStatusPill } from '@/components/ImportStatus';
import { Eyebrow } from '@/components/ui';
import { db } from '@/db';
import { brief, generationRun, importJob, topic } from '@/db/schema';
import { coverageOf, formatKinds } from '@/lib/content/generate';
import { ExtractedPlan } from '@/lib/content/plan';
import { can } from '@/lib/permissions';
import { requireStaff } from '@/lib/session';

const isUuid = (value: string) => /^[0-9a-f-]{36}$/i.test(value);
const normalize = (value: string) => value.toLowerCase().replace(/[“”"]/g, '"').replace(/[‘’']/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

export default async function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff('/admin/imports');
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const job = await db.query.importJob.findFirst({ where: eq(importJob.id, id) });
  if (!job) notFound();

  const draft = ExtractedPlan.safeParse(job.draft);
  const plan = draft.success ? draft.data : null;
  const editable = job.status === 'needs_review' && can(session.user.role, 'edit');
  const canApprove = job.status === 'needs_review' && can(session.user.role, 'publish');
  const source = normalize(job.sourceText ?? '');
  const generation = ['generating', 'published', 'partial'].includes(job.status) ? await generationOf(job.id) : null;
  const quoteFound = (quote: string) => !quote || source.includes(normalize(quote));

  return (
    <>
      <Link className="ui-crumb" href="/admin/imports"><Icon name="back" /> PLAN IMPORTS</Link>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>{job.status === 'published' ? 'STEP 6 OF 6 · PUBLISHED' : generation ? 'STEP 4–5 OF 6 · GENERATING AND CHECKING' : 'STEP 3 OF 6 · REVIEW'}</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(34px,4vw,64px)', wordBreak: 'break-word' }}>{plan?.module.title.toUpperCase() ?? job.fileName.toUpperCase()}</h1>
          <p className="ui-small" style={{ marginTop: 10 }}>{job.fileName}{job.model ? ` · read by ${job.model}` : ''}</p>
        </div>
        <ImportStatusPill status={job.status} />
      </div>

      {job.status === 'extracting' && (
        <div className="ui-frame ui-frame--corner" role="status">
          <AutoRefresh />
          <h2 className="ui-h3">READING YOUR PLAN…</h2>
          <p className="ui-small" style={{ marginTop: 10 }}>AI is drafting topics, key facts and common mistakes. This usually takes under a minute; the page updates by itself.</p>
        </div>
      )}

      {job.status === 'failed' && (
        <div className="ui-frame">
          <h2 className="ui-h3">THE IMPORT FAILED</h2>
          <p className="ui-small" style={{ marginTop: 10 }}>{job.error}</p>
          {can(session.user.role, 'upload') && (
            <form action={retryImport} style={{ marginTop: 16 }}>
              <input type="hidden" name="id" value={job.id} />
              <button className="ui-button ui-button--paper" type="submit">TRY AGAIN <Icon name="arrow" /></button>
            </form>
          )}
        </div>
      )}

      {plan && job.status !== 'extracting' && (
        <form className="ui-review">
          <input type="hidden" name="id" value={job.id} />

          {job.issues.length > 0 && (
            <section aria-labelledby="issues-title">
              <h2 id="issues-title" className="ui-label" style={{ marginBottom: 10 }}>{job.issues.length} THING{job.issues.length === 1 ? '' : 'S'} TO CHECK</h2>
              <ul className="ui-issues">{job.issues.map((issue, i) => <li key={i}><b>{issue.where}</b>{issue.message}</li>)}</ul>
            </section>
          )}

          <fieldset>
            <legend>MODULE</legend>
            <label className="ui-dfield">TITLE<input name="module.title" defaultValue={plan.module.title} readOnly={!editable} required /></label>
            <label className="ui-dfield">PROGRAM<input name="module.program" defaultValue={plan.module.program} readOnly={!editable} /></label>
            <label className="ui-dfield">LAB TASK<textarea name="module.labTask" rows={3} defaultValue={plan.module.labTask} readOnly={!editable} /></label>
            <label className="ui-dfield">SKILLS · ONE PER LINE<textarea name="module.skills" rows={3} defaultValue={plan.module.skills.join('\n')} readOnly={!editable} /></label>
          </fieldset>

          {plan.topics.map((t, i) => (
            <fieldset key={i}>
              <legend>TOPIC {i + 1}</legend>
              <label className="ui-dfield">TITLE<input name={`topics.${i}.title`} defaultValue={t.title} readOnly={!editable} required /></label>
              <label className="ui-dfield">OBJECTIVE<textarea name={`topics.${i}.objective`} rows={2} defaultValue={t.objective} readOnly={!editable} /></label>
              {t.facts.map((f, j) => (
                <div className="ui-fact" key={f.key}>
                  <b>{f.key.toUpperCase()}</b>
                  <label className="ui-dfield">
                    <span className="ui-sr">Fact {f.key}</span>
                    <textarea name={`topics.${i}.facts.${j}.text`} rows={2} defaultValue={f.text} readOnly={!editable} />
                    <span className={`ui-quote ${quoteFound(f.sourceQuote) ? '' : 'ui-quote--missing'}`}>
                      {quoteFound(f.sourceQuote) ? 'Source: ' : 'Not found in source: '}“{f.sourceQuote}”
                    </span>
                  </label>
                </div>
              ))}
              <label className="ui-dfield">COMMON MISTAKE<textarea name={`topics.${i}.commonMistake`} rows={2} defaultValue={t.commonMistake} readOnly={!editable} /></label>
            </fieldset>
          ))}

          {(editable || canApprove) && (
            <div className="ui-actions">
              {editable && <button className="ui-button ui-button--outline" formAction={saveDraft} type="submit">SAVE CHANGES</button>}
              {canApprove && <button className="ui-button ui-button--paper" formAction={approveImport} type="submit">APPROVE &amp; SAVE BRIEFS <Icon name="arrow" /></button>}
              {editable && !canApprove && <span className="ui-small">A publisher approves the briefs.</span>}
            </div>
          )}
          {generation && (
            <p className="ui-small">Saved as new brief versions in module <b>{job.moduleId}</b>. <Link className="ui-table-link" href="/admin/content">View content</Link></p>
          )}
        </form>
      )}

      {generation && (
        <section className="ui-section" aria-labelledby="gen-title">
          {job.status === 'generating' && <AutoRefresh everyMs={4000} />}
          <h2 id="gen-title" className="ui-h3">LESSONS</h2>
          <p className="ui-small" style={{ margin: '8px 0 14px', maxWidth: 680 }}>
            {job.status === 'generating'
              ? 'AI is writing every format for every topic and checking each one. This page updates by itself.'
              : job.status === 'published'
                ? 'Every lesson passed the checks and is live for students.'
                : 'Some lessons did not pass the checks after three tries. Students see the ones that did.'}
            {' '}Tokens used: {generation.tokens.toLocaleString('en-US')}.
          </p>
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead><tr><th>TOPIC</th>{formatKinds.map(f => <th key={f}>{f.toUpperCase()}</th>)}<th>QUESTIONS</th></tr></thead>
              <tbody>
                {generation.rows.map(r => (
                  <tr key={r.briefId}>
                    <td>{r.title}</td>
                    {formatKinds.map(f => <td key={f}>{r.done.includes(f) ? <span className="ui-pill ui-pill--approved">READY</span> : r.failed.includes(f) ? <span className="ui-pill ui-pill--failed">FAILED</span> : <span className="ui-pill">…</span>}</td>)}
                    <td>{r.questions ? <span className="ui-pill ui-pill--approved">READY</span> : r.failed.includes('questions') ? <span className="ui-pill ui-pill--failed">FAILED</span> : <span className="ui-pill">…</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {generation.problems.length > 0 && job.status !== 'generating' && (
            <ul className="ui-issues" style={{ marginTop: 14 }}>{generation.problems.map((p, i) => <li key={i}><b>{p.where}</b>{p.message}</li>)}</ul>
          )}
          {job.status === 'partial' && can(session.user.role, 'publish') && (
            <form action={generateMissing} style={{ marginTop: 16 }}>
              <input type="hidden" name="id" value={job.id} />
              <button className="ui-button ui-button--paper" type="submit">GENERATE MISSING <Icon name="arrow" /></button>
            </form>
          )}
        </section>
      )}

      {job.sourceText && (
        <details className="ui-details ui-section">
          <summary>SHOW THE TEXT READ FROM THE FILE</summary>
          <pre className="ui-source">{job.sourceText}</pre>
        </details>
      )}
    </>
  );
}

/** Per-topic generation status for an approved import, from stored lessons and the run log. */
async function generationOf(jobId: string) {
  const briefs = await db
    .select({ id: brief.id, title: topic.title, position: topic.position })
    .from(brief)
    .innerJoin(topic, eq(topic.id, brief.topicId))
    .where(eq(brief.importJobId, jobId))
    .orderBy(asc(topic.position));
  const ids = briefs.map(b => b.id);
  const have = await coverageOf(ids);
  const runs = ids.length ? await db.select().from(generationRun).where(inArray(generationRun.briefId, ids)).orderBy(desc(generationRun.createdAt)) : [];
  const lastRun = (briefId: string, kind: string) => runs.find(r => r.briefId === briefId && r.kind === kind);
  const rows = briefs.map(b => {
    const done = have.lessons.filter(l => l.briefId === b.id).map(l => l.format as string);
    const questions = have.questions.includes(b.id);
    const failed = [...formatKinds, 'questions'].filter(k => {
      const ok = k === 'questions' ? questions : done.includes(k);
      const run = lastRun(b.id, k);
      return !ok && run && run.status !== 'ok' && run.attempt >= 3;
    });
    return { briefId: b.id, title: b.title, done, questions, failed };
  });
  const problems = rows.flatMap(r => r.failed.map(k => ({ where: `${r.title} · ${k}`, message: (lastRun(r.briefId, k)?.problems ?? []).slice(0, 3).join(' ') || 'Generation failed.' })));
  const tokens = runs.reduce((sum, r) => sum + (r.inputTokens ?? 0) + (r.outputTokens ?? 0), 0);
  return { rows, problems, tokens };
}
