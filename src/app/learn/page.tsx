import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Eyebrow } from '@/components/PageShell';
import { DemoBanner, LearnShell } from '@/components/LearnShell';
import { Icon } from '@/components/Icon';
import { StyleSwitcher } from '@/components/StyleSwitcher';
import { coolingModule, formatInfo, formats } from '@/lib/module';
import { buildPlan } from '@/lib/plan';
import { getLearningStyle, getSession } from '@/lib/session';

export const metadata: Metadata = { title: 'Cooling & airflow — American Renewal Corps' };

export default async function ModulePlanPage() {
  const session = await getSession();
  const style = session ? await getLearningStyle(session.user.id) : null;
  if (!style) redirect('/learn/style');
  const plan = buildPlan(style, coolingModule.topics.map(topic => topic.id));

  return (
    <LearnShell>
      <DemoBanner />
      <Eyebrow>MODULE 01 / {coolingModule.program.toUpperCase()}</Eyebrow>
      <h1 className="ui-title">COOLING &amp;<br /><span>AIRFLOW.</span></h1>
      <p className="ui-lede">Three topics that prepare you for the containment walk-down lab. Each one starts in your format, with a second format to lock it in.</p>

      <div className="ui-plan">
        <section aria-labelledby="plan-title">
          <div className="ui-admin-head" style={{ marginBottom: 8 }}>
            <h2 id="plan-title" className="ui-label">YOUR PLAN</h2>
            <StyleSwitcher current={style} />
          </div>
          {plan.topics.map((item, index) => {
            const topic = coolingModule.topics.find(t => t.id === item.topic_id)!;
            const others = formats.filter(f => f !== item.primary && f !== item.secondary);
            return (
              <article className="ui-topic" key={topic.id}>
                <span className="ui-topic-num">0{index + 1}</span>
                <div>
                  <h3 className="ui-h3" style={{ fontSize: 32 }}>{topic.title.toUpperCase()}</h3>
                  <p>{topic.objective}</p>
                  <div className="ui-topic-actions">
                    <Link className="ui-button ui-button--paper" href={`/learn/${topic.id}/${item.primary}`}>
                      START · {formatInfo[item.primary].short} <Icon name="arrow" />
                    </Link>
                    <Link className="ui-chip" href={`/learn/${topic.id}/${item.secondary}`}><b>THEN</b> {formatInfo[item.secondary].short}</Link>
                    {others.map(format => (
                      <Link key={format} className="ui-chip" href={`/learn/${topic.id}/${format}`}>ALSO {formatInfo[format].short}</Link>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="ui-aside">
          <div className="ui-frame ui-frame--corner">
            <h3>LAB TASK</h3>
            <p>{coolingModule.labTask}</p>
          </div>
          <div className="ui-frame">
            <h3>SKILLS YOU’RE BUILDING</h3>
            <ol>{coolingModule.skills.map(skill => <li key={skill}>{skill}</li>)}</ol>
          </div>
          <div className="ui-frame">
            <h3>PROGRESS</h3>
            <p>Mastery for each key fact will appear here once lessons and practice are connected.</p>
          </div>
        </aside>
      </div>
    </LearnShell>
  );
}
