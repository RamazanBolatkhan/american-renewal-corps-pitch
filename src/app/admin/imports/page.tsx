import { Eyebrow, SkeletonNote } from '@/components/PageShell';
import { UploadPanel } from '@/components/UploadPanel';

export default function ImportsPage() {
  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>STEP 1 OF 6</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>PLAN IMPORTS</h1>
        </div>
      </div>
      <UploadPanel />
      <SkeletonNote>Choosing a file stays in your browser. Upload to storage, AI extraction and the review step will connect next.</SkeletonNote>

      <section className="ui-section" aria-labelledby="jobs-title">
        <h2 id="jobs-title" className="ui-h3">IMPORT JOBS</h2>
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead><tr><th>FILE</th><th>UPLOADED BY</th><th>STATUS</th><th>TOPICS</th><th>ISSUES</th><th>CREATED</th></tr></thead>
            <tbody><tr><td colSpan={6} className="ui-empty">No imports yet.</td></tr></tbody>
          </table>
        </div>
      </section>
    </>
  );
}
