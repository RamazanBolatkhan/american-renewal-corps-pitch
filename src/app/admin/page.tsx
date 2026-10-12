import Link from 'next/link';
import { Eyebrow, SkeletonNote } from '@/components/ui';
import { requireStaff } from '@/lib/session';
import { Icon } from '@/components/Icon';
import { coolingModule, formats } from '@/lib/module';

const steps = [
  ['Upload', 'Add a learning plan file.'],
  ['Extract', 'AI drafts topics, briefs and key facts.'],
  ['Review', 'An editor checks every fact against the source.'],
  ['Generate', 'AI writes each topic in all four formats.'],
  ['Check', 'Automatic checks for coverage, length and answers.'],
  ['Publish', 'A publisher releases the topic to students.'],
];

export default async function AdminOverview() {
  await requireStaff();
  const facts = coolingModule.topics.reduce((sum, topic) => sum + topic.facts.length, 0);
  const stats = [
    [1, 'MODULES'],
    [coolingModule.topics.length, 'TOPICS'],
    [facts, 'KEY FACTS'],
    [`0/${coolingModule.topics.length * formats.length}`, 'LESSONS GENERATED'],
  ] as const;
  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>CONTENT STUDIO</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>OVERVIEW</h1>
        </div>
        <Link className="ui-button ui-button--paper" href="/admin/imports">IMPORT A PLAN <Icon name="arrow" /></Link>
      </div>

      <div className="ui-stats">
        {stats.map(([value, label]) => (
          <div className="ui-stat" key={label}><span className="ui-stat-value">{value}</span><span className="ui-label">{label}</span></div>
        ))}
      </div>

      <section className="ui-section" aria-labelledby="pipeline-title">
        <h2 id="pipeline-title" className="ui-h3">FROM PLAN TO LESSONS</h2>
        <ol className="ui-pipeline">
          {steps.map(([title, text], i) => <li key={title}><b><span>{i + 1}</span>{title.toUpperCase()}</b>{text}</li>)}
        </ol>
      </section>

      <section className="ui-section" aria-labelledby="recent-title">
        <h2 id="recent-title" className="ui-h3">RECENT IMPORTS</h2>
        <div className="ui-table-wrap"><p className="ui-empty">No plans imported yet. The sample module is loaded from the assignment.</p></div>
      </section>
      <SkeletonNote>Figures come from the sample module in code. Live counts will come from the database.</SkeletonNote>
    </>
  );
}
