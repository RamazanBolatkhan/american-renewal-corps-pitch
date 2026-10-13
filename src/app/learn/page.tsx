import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Eyebrow } from '@/components/PageShell';
import { DemoBanner, LearnShell } from '@/components/LearnShell';
import { Icon } from '@/components/Icon';
import { StyleSwitcher } from '@/components/StyleSwitcher';
import { getModule, listModules } from '@/lib/content/catalog';
import { formatInfo, formats } from '@/lib/module';
import { buildPlan } from '@/lib/plan';
import { getLearningStyle, getSession, requireOwnPassword } from '@/lib/session';

export const metadata: Metadata = { title: 'Your plan — American Renewal Corps' };

export default async function ModulePlanPage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const session = await getSession();
  requireOwnPassword(session, '/learn');
  const style = session ? await getLearningStyle(session.user.id) : null;
  if (!style) redirect('/learn/style');
  const modules = await listModules();
  const module = await getModule((await searchParams).module);
  const plan = buildPlan(style, module.topics.map(topic => topic.id));

  return (
    <LearnShell>
      <DemoBanner />
      {modules.length > 1 && (
        <nav className="ui-tabs" aria-label="Modules" style={{ marginTop: 0, marginBottom: 28 }}>
          {modules.map(m => (
            <Link key={m.id} className="ui-tab" href={`/learn?module=${m.id}`} aria-current={m.id === module.id ? 'page' : undefined}>{m.title.toUpperCase()}</Link>
          ))}
        </nav>
      )}
      <Eyebrow>MODULE{module.program ? ` / ${module.program.toUpperCase()}` : ''}</Eyebrow>
      <h1 className="ui-title">{module.title.toUpperCase()}<span>.</span></h1>
      <p className="ui-lede">
        {module.topics.length} topic{module.topics.length === 1 ? '' : 's'} that prepare you for the lab task. Each one starts in your format, with a second format to lock it in.
      </p>

      <div className="ui-plan">
        <section aria-labelledby="plan-title">
          <div className="ui-admin-head" style={{ marginBottom: 8 }}>
            <h2 id="plan-title" className="ui-label">YOUR PLAN</h2>
            <StyleSwitcher current={style} />
          </div>
          {plan.topics.map((item, index) => {
            const topic = module.topics.find(t => t.id === item.topic_id)!;
            const others = formats.filter(f => f !== item.primary && f !== item.secondary);
            return (
              <article className="ui-topic" key={topic.id}>
                <span className="ui-topic-num">{String(index + 1).padStart(2, '0')}</span>
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
            <p>{module.labTask}</p>
          </div>
          {module.skills.length > 0 && (
            <div className="ui-frame">
              <h3>SKILLS YOU’RE BUILDING</h3>
              <ol>{module.skills.map(skill => <li key={skill}>{skill}</li>)}</ol>
            </div>
          )}
          <div className="ui-frame">
            <h3>{module.source === 'generated' ? 'GENERATED LESSONS' : 'SAMPLE LESSONS'}</h3>
            <p>{module.source === 'generated'
              ? 'Written by AI from the approved brief and checked automatically: every fact covered, nothing outside the brief, answers that work.'
              : 'Written by hand from the assignment’s sample brief.'}</p>
          </div>
        </aside>
      </div>
    </LearnShell>
  );
}
