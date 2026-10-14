import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { judgeUnjudged } from '@/app/actions/judge';
import { Icon } from '@/components/Icon';
import { Eyebrow, SkeletonNote } from '@/components/ui';
import { db } from '@/db';
import { judgeFeedback, judgment, topic } from '@/db/schema';
import { can } from '@/lib/permissions';
import { requireStaff } from '@/lib/session';

const statusLabel = { flagged: 'FLAGGED', error: 'JUDGE FAILED', passed: 'PASSED', published: 'PUBLISHED BY EDITOR' } as const;
const statusPill = { flagged: 'ui-pill--warn', error: 'ui-pill--failed', passed: 'ui-pill--approved', published: 'ui-pill--approved' } as const;
const order = { flagged: 0, error: 1, passed: 2, published: 3 } as const;

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ done?: string; started?: string }> }) {
  const session = await requireStaff('/admin/reviews');
  const { done, started } = await searchParams;
  const rows = await db
    .select({ j: judgment, topicTitle: topic.title })
    .from(judgment)
    .innerJoin(topic, eq(topic.id, judgment.topicId))
    .orderBy(desc(judgment.createdAt));
  rows.sort((a, b) => order[a.j.status] - order[b.j.status]);
  const waiting = rows.filter(r => r.j.status === 'flagged' || r.j.status === 'error').length;
  const decisions = await db.select({ judge: judgeFeedback.judgeVerdict, editor: judgeFeedback.editorVerdict }).from(judgeFeedback);
  const agreed = decisions.filter(d => d.judge === d.editor).length;

  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>{waiting ? `${waiting} WAITING FOR AN EDITOR` : 'NOTHING WAITING'}</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>REVIEWS</h1>
        </div>
      </div>
      <p className="ui-small" style={{ maxWidth: 680 }}>
        After code checks the structure of each generated lesson, an AI judge checks its meaning against the brief, following HQ’s{' '}
        <Link className="ui-table-link" href="/admin/guide">judging guide</Link>. Flagged lessons stay hidden from students until an editor publishes or rejects them.
        Every decision teaches the next version of the guide.
      </p>
      {done && <p className="ui-status ui-status--ok" role="status" style={{ marginTop: 16 }}>{done === 'publish' ? 'Published. Students can see it now.' : 'Rejected. A new version is being generated and will be judged again.'}</p>}
      {started && <p className="ui-status ui-status--ok" role="status" style={{ marginTop: 16 }}>Judging {started} item{started === '1' ? '' : 's'} in the background. Refresh in a minute.</p>}

      <section className="ui-section" aria-labelledby="agree-title">
        <h2 id="agree-title" className="ui-h3">JUDGE VS EDITORS</h2>
        <p className="ui-small" style={{ marginTop: 8 }}>
          {decisions.length ? `Editors agreed with the judge on ${agreed} of ${decisions.length} decisions.` : 'No editor decisions yet.'}{' '}
          {decisions.length > agreed && <Link className="ui-table-link" href="/admin/guide">Use the disagreements to improve the guide</Link>}
        </p>
      </section>

      <section className="ui-section" aria-labelledby="queue-title">
        <h2 id="queue-title" className="ui-h3">JUDGED CONTENT</h2>
        {rows.length === 0 ? (
          <p className="ui-small" style={{ marginTop: 10 }}>Nothing judged yet. New lessons are judged as they are generated.</p>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead><tr><th>TOPIC</th><th>FORMAT</th><th>VERDICT</th><th>FINDINGS</th><th>GUIDE</th><th /></tr></thead>
              <tbody>
                {rows.map(({ j, topicTitle }) => (
                  <tr key={j.id}>
                    <td>{topicTitle}</td>
                    <td>{j.kind.toUpperCase()}</td>
                    <td><span className={`ui-pill ${statusPill[j.status]}`}>{statusLabel[j.status]}</span></td>
                    <td>{j.findings.filter(f => f.severity === 'error').length} errors · {j.findings.filter(f => f.severity === 'warning').length} warnings</td>
                    <td>V{j.guideVersion}</td>
                    <td><Link className="ui-table-link" href={`/admin/reviews/${j.id}`}>{j.status === 'flagged' || j.status === 'error' ? 'REVIEW' : 'OPEN'}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {can(session.user.role, 'publish') && (
        <form action={judgeUnjudged} className="ui-section">
          <button className="ui-button ui-button--outline" type="submit">JUDGE LESSONS MADE BEFORE THE JUDGE <Icon name="arrow" /></button>
          <p className="ui-small" style={{ marginTop: 8 }}>Lessons generated before the judge existed stay visible until they are judged.</p>
        </form>
      )}
      <SkeletonNote>The judge is an AI and can be wrong both ways. Editors have the final say; their notes on disagreements are what HQ’s next guide is drafted from.</SkeletonNote>
    </>
  );
}
