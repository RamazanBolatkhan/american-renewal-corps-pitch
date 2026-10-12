import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { Eyebrow } from '@/components/ui';
import { ImportStatusPill } from '@/components/ImportStatus';
import { UploadPanel } from '@/components/UploadPanel';
import { db } from '@/db';
import { importJob, user } from '@/db/schema';
import { ExtractedPlan } from '@/lib/content/plan';
import { can } from '@/lib/permissions';
import { requireStaff } from '@/lib/session';

const when = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export default async function ImportsPage() {
  const session = await requireStaff('/admin/imports');
  const jobs = await db
    .select({ job: importJob, uploader: user.name })
    .from(importJob)
    .leftJoin(user, eq(user.id, importJob.uploadedBy))
    .orderBy(desc(importJob.createdAt))
    .limit(50);

  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>STEP 1 OF 6</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>PLAN IMPORTS</h1>
        </div>
      </div>
      <UploadPanel canUpload={can(session.user.role, 'upload')} />
      <p className="ui-small" style={{ marginTop: 14, maxWidth: 680 }}>
        The file is stored privately. AI reads it and drafts the module, topics, key facts and common mistakes, quoting the source for each fact.
        Nothing reaches students until a publisher approves it.
      </p>

      <section className="ui-section" aria-labelledby="jobs-title">
        <h2 id="jobs-title" className="ui-h3">IMPORT JOBS</h2>
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead><tr><th>FILE</th><th>UPLOADED BY</th><th>STATUS</th><th>TOPICS</th><th>ISSUES</th><th>CREATED</th></tr></thead>
            <tbody>
              {jobs.length === 0 && <tr><td colSpan={6} className="ui-empty">No imports yet.</td></tr>}
              {jobs.map(({ job, uploader }) => {
                const draft = ExtractedPlan.safeParse(job.draft);
                return (
                  <tr key={job.id}>
                    <td><Link className="ui-table-link" href={`/admin/imports/${job.id}`}>{job.fileName}</Link></td>
                    <td>{uploader ?? '—'}</td>
                    <td><ImportStatusPill status={job.status} /></td>
                    <td>{draft.success ? draft.data.topics.length : '—'}</td>
                    <td>{job.status === 'extracting' ? '—' : job.issues.length}</td>
                    <td>{when.format(job.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
