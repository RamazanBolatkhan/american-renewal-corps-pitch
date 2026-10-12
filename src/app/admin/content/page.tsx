import { Eyebrow, SkeletonNote } from '@/components/PageShell';
import { coolingModule, formatInfo, formats } from '@/lib/module';

export default function ContentPage() {
  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>MODULE 01 / {coolingModule.program.toUpperCase()}</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>CONTENT</h1>
        </div>
        <span className="ui-pill">BRIEFS · V1 DRAFT</span>
      </div>
      <p className="ui-small" style={{ maxWidth: 640 }}>Every key fact should be taught by every format and checked by at least one question. Gaps and stale lessons show up here.</p>

      {coolingModule.topics.map((topic, index) => (
        <section className="ui-section" key={topic.id} aria-labelledby={`${topic.id}-title`}>
          <h2 id={`${topic.id}-title`} className="ui-h3">0{index + 1} · {topic.title.toUpperCase()}</h2>
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr><th>FACT</th>{formats.map(f => <th key={f}>{formatInfo[f].short}</th>)}<th>QUESTIONS</th></tr>
              </thead>
              <tbody>
                {topic.facts.map(fact => (
                  <tr key={fact.key}>
                    <td><b className="ui-yes" style={{ fontWeight: 400 }}>{fact.key.toUpperCase()}</b> {fact.text}</td>
                    {formats.map(f => <td key={f}><span className="ui-pill">NOT GENERATED</span></td>)}
                    <td><span className="ui-pill">NONE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <SkeletonNote>Coverage comes from lesson fact references once lessons are generated and stored.</SkeletonNote>
    </>
  );
}
