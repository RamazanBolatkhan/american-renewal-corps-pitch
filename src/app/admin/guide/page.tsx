import { desc } from 'drizzle-orm';
import { approveGuide, draftGuideFromFeedback, saveGuideDraft, testGuide } from '@/app/actions/judge';
import { Icon } from '@/components/Icon';
import { PendingButton } from '@/components/PendingButton';
import { Eyebrow, SkeletonNote } from '@/components/ui';
import { db } from '@/db';
import { judgeFeedback, judgeGuide } from '@/db/schema';
import { activeGuide } from '@/lib/content/judge';
import { DEFAULT_GUIDE, GUIDE_LIMIT, percent } from '@/lib/content/judging';
import { can } from '@/lib/permissions';
import { requireStaff } from '@/lib/session';

type Props = { searchParams: Promise<{ v?: string; error?: string; approved?: string }> };

export default async function GuidePage({ searchParams }: Props) {
  const session = await requireStaff('/admin/guide');
  const hq = can(session.user.role, 'publish');
  const { v, error, approved } = await searchParams;
  const active = await activeGuide();
  const stored = await db.select().from(judgeGuide).orderBy(desc(judgeGuide.version));
  const versions = stored.some(g => g.version === 1)
    ? stored
    : [...stored, { version: 1, rules: DEFAULT_GUIDE, status: active.version === 1 ? 'active' : 'retired', changes: [], score: null, createdAt: null, approvedAt: null } as const];
  const feedback = await db.select().from(judgeFeedback).orderBy(desc(judgeFeedback.createdAt));
  const disagreements = feedback.filter(f => f.judgeVerdict !== f.editorVerdict);
  const selected = versions.find(g => g.version === Number(v)) ?? versions.find(g => g.status === 'draft') ?? versions.find(g => g.version === active.version)!;
  const activeRow = versions.find(g => g.version === active.version);

  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>HQ · THE JUDGE FOLLOWS VERSION {active.version}</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>JUDGING GUIDE</h1>
        </div>
      </div>
      <p className="ui-small" style={{ maxWidth: 700 }}>
        The rules the AI judge follows when it checks a lesson’s meaning. It gets better in a loop: editors publish or reject what the judge passed or flagged and say why when
        they disagree; a new version is drafted from those notes; it is tested against every past editor decision; HQ approves it only if it agrees with editors more often.
      </p>
      {error && <p className="ui-status ui-status--error" role="alert" style={{ marginTop: 16 }}>{error}</p>}
      {approved && <p className="ui-status ui-status--ok" role="status" style={{ marginTop: 16 }}>Version {selected.version} is now the guide. New lessons are judged with it; use “Judge again” on a review to re-check older ones.</p>}

      <ol className="judge-loop" aria-label="The learning loop">
        <li><b>{feedback.length}</b> editor decisions</li>
        <li><b>{disagreements.length}</b> disagreements with the judge</li>
        <li><b>{versions.filter(g => g.status === 'draft').length}</b> drafts waiting</li>
        <li><b>{percent(activeRow?.score) ?? '—'}{activeRow?.score ? '%' : ''}</b> current guide agrees with editors{activeRow?.score ? ` (${activeRow.score.agree}/${activeRow.score.total})` : ''}</li>
      </ol>

      {hq && (
        <div className="ui-actions" style={{ marginTop: 20 }}>
          <form action={draftGuideFromFeedback}>
            <PendingButton className="ui-button ui-button--paper" pending="DRAFTING AND TESTING…" disabled={!disagreements.length}>DRAFT NEXT VERSION FROM FEEDBACK <Icon name="arrow" /></PendingButton>
          </form>
          {!disagreements.length && <span className="ui-small">Drafting needs at least one decision where an editor disagreed with the judge.</span>}
        </div>
      )}

      <div className="judge-layout" style={{ marginTop: 28 }}>
        <section className="judge-main" aria-labelledby="version-title">
          <h2 id="version-title" className="ui-h3">VERSION {selected.version} · {selected.status.toUpperCase()}</h2>
          <ScoreLine score={selected.score} active={activeRow?.score ?? null} isActive={selected.version === active.version} />
          {selected.changes.length > 0 && (
            <ul className="ui-issues" style={{ marginTop: 12 }}>
              {selected.changes.map((c, i) => <li key={i}><b>CHANGE</b>{c.change} <span className="ui-small">Because: {c.because}</span></li>)}
            </ul>
          )}
          {hq ? (
            <form className="judge-edit">
              <input type="hidden" name="draftVersion" value={selected.status === 'draft' ? selected.version : 0} />
              <input type="hidden" name="version" value={selected.version} />
              <label className="ui-dfield">
                {selected.status === 'draft' ? 'EDIT THIS DRAFT' : 'START A NEW DRAFT FROM THIS VERSION'}
                <textarea name="rules" rows={18} defaultValue={selected.rules} maxLength={GUIDE_LIMIT} />
              </label>
              <label className="ui-dfield">WHAT YOU CHANGED (OPTIONAL)<input name="change" placeholder="e.g. Rule 5: a scene may show other normal parts" /></label>
              <div className="ui-actions">
                <PendingButton className="ui-button ui-button--outline" formAction={saveGuideDraft} pending="SAVING…">SAVE AS DRAFT</PendingButton>
                <PendingButton className="ui-button ui-button--outline" formAction={testGuide} pending="TESTING…" disabled={!feedback.length}>
                  TEST AGAINST EDITOR DECISIONS
                </PendingButton>
                {selected.status === 'draft' && (
                  <PendingButton className="ui-button ui-button--paper" formAction={approveGuide} pending="APPROVING…">APPROVE VERSION {selected.version}</PendingButton>
                )}
              </div>
              {selected.status === 'draft' && <p className="ui-small">Saving edits clears the test score; test again before approving.</p>}
            </form>
          ) : (
            <pre className="judge-rules">{selected.rules}</pre>
          )}
        </section>

        <aside className="judge-side">
          <section className="ui-frame">
            <h2 className="ui-label">VERSIONS</h2>
            <ul className="judge-versions">
              {versions.map(g => (
                <li key={g.version}>
                  <a href={`/admin/guide?v=${g.version}`} aria-current={g.version === selected.version ? 'true' : undefined}>V{g.version}</a>
                  <span className={`ui-pill ${g.status === 'active' ? 'ui-pill--approved' : g.status === 'draft' ? 'ui-pill--warn' : ''}`}>{g.status.toUpperCase()}</span>
                  <span className="ui-small">{percent(g.score) !== null ? `${percent(g.score)}% agree` : 'not tested'}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="ui-frame" style={{ marginTop: 16 }}>
            <h2 className="ui-label">LATEST DISAGREEMENTS</h2>
            {disagreements.length === 0 ? (
              <p className="ui-small" style={{ marginTop: 8 }}>None yet.</p>
            ) : (
              <ul className="judge-feedback">
                {disagreements.slice(0, 8).map(f => (
                  <li key={f.id}>
                    <b>{f.kind.toUpperCase()} · judge {f.judgeVerdict === 'flag' ? 'flagged' : 'passed'}, editor {f.editorVerdict === 'flag' ? 'rejected' : 'published'}</b>
                    <span>{f.note}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
      <SkeletonNote>A test re-judges up to 40 recent editor decisions with the chosen version: about one cheap AI call each. Every version is kept, so HQ can see how the guide changed and why.</SkeletonNote>
    </>
  );
}

function ScoreLine({ score, active, isActive }: { score: { agree: number; total: number; testedAt: string } | null; active: { agree: number; total: number } | null; isActive: boolean }) {
  if (!score) return <p className="ui-small" style={{ marginTop: 6 }}>Not tested against editor decisions yet.</p>;
  const mine = percent(score)!;
  const theirs = percent(active);
  return (
    <p className="ui-small" style={{ marginTop: 6 }}>
      Agrees with editors on <b>{score.agree} of {score.total}</b> decisions ({mine}%)
      {!isActive && theirs !== null ? <>, against <b>{theirs}%</b> for the current guide{mine > theirs ? ' — better' : mine < theirs ? ' — worse' : ' — the same'}</> : null}. Tested {new Date(score.testedAt).toLocaleString('en-US')}.
    </p>
  );
}
