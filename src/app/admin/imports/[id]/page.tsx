import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { approveImport, retryImport, saveDraft } from '@/app/actions/imports';
import { AutoRefresh } from '@/components/AutoRefresh';
import { Icon } from '@/components/Icon';
import { ImportStatusPill } from '@/components/ImportStatus';
import { Eyebrow } from '@/components/ui';
import { db } from '@/db';
import { importJob } from '@/db/schema';
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
  const quoteFound = (quote: string) => !quote || source.includes(normalize(quote));

  return (
    <>
      <Link className="ui-crumb" href="/admin/imports"><Icon name="back" /> PLAN IMPORTS</Link>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>{job.status === 'approved' ? 'STEP 4 OF 6 · APPROVED' : 'STEP 3 OF 6 · REVIEW'}</Eyebrow>
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
          {job.status === 'approved' && (
            <p className="ui-small">Saved as new brief versions in module <b>{job.moduleId}</b>. <Link className="ui-table-link" href="/admin/content">View content</Link></p>
          )}
        </form>
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
