import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow, SkeletonNote } from '@/components/PageShell';
import { DemoBanner, LearnShell } from '@/components/LearnShell';
import { FormatArt } from '@/components/FormatArt';
import { Icon } from '@/components/Icon';
import { coolingModule, formatInfo, formats, getTopic, isFormat } from '@/lib/module';
import { buildPlan } from '@/lib/plan';

type Props = {
  params: Promise<{ topicId: string; format: string }>;
  searchParams: Promise<{ style?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  return { title: `${topic?.title ?? 'Lesson'} — American Renewal Corps` };
}

export default async function LessonPage({ params, searchParams }: Props) {
  const { topicId, format } = await params;
  const { style: rawStyle } = await searchParams;
  const topic = getTopic(topicId);
  if (!topic || !isFormat(format)) notFound();

  const style = isFormat(rawStyle) ? rawStyle : format;
  const planItem = buildPlan(style, coolingModule.topics.map(t => t.id)).topics.find(t => t.topic_id === topic.id)!;
  const topicIndex = coolingModule.topics.indexOf(topic);
  const next = coolingModule.topics[topicIndex + 1];
  const nextPrimary = next ? buildPlan(style, [next.id]).topics[0].primary : undefined;
  const role = (f: string) => (f === planItem.primary ? 'START' : f === planItem.secondary ? 'THEN' : 'ALSO');

  return (
    <LearnShell>
      <DemoBanner />
      <Link className="ui-crumb" href={`/learn?style=${style}`}><Icon name="back" /> COOLING &amp; AIRFLOW / YOUR PLAN</Link>
      <Eyebrow>TOPIC 0{topicIndex + 1} / {formatInfo[format].label.toUpperCase()}</Eyebrow>
      <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,80px)' }}>{topic.title.toUpperCase()}</h1>
      <p className="ui-lede">{topic.objective}</p>

      <nav className="ui-tabs" aria-label="Lesson formats">
        {formats.map(f => (
          <Link key={f} className="ui-tab" href={`/learn/${topic.id}/${f}?style=${style}`} aria-current={f === format ? 'page' : undefined}>
            <em>{role(f)}</em> {formatInfo[f].short}
          </Link>
        ))}
      </nav>

      <div className="ui-lesson">
        <section className="ui-renderer" aria-label={`${formatInfo[format].label} lesson`}>
          <div>
            <FormatArt format={format} />
            <h2 className="ui-h3" style={{ margin: '18px 0 10px' }}>{formatInfo[format].label.toUpperCase()} LESSON</h2>
            <p>{formatInfo[format].description} This lesson will be generated from the topic’s content brief, and every part of it will point to the key facts it teaches.</p>
          </div>
        </section>
        <aside className="ui-frame ui-frame--corner" aria-labelledby="facts-title">
          <h2 id="facts-title" className="ui-label" style={{ marginBottom: 14 }}>KEY FACTS IN THIS TOPIC</h2>
          <ul className="ui-facts">
            {topic.facts.map(fact => <li key={fact.key}><b>{fact.key.toUpperCase()}</b>{fact.text}</li>)}
          </ul>
          <p className="ui-mistake"><span>COMMON MISTAKE</span>{topic.commonMistake}</p>
          <SkeletonNote>Lesson renderers and practice questions arrive with the content generator.</SkeletonNote>
        </aside>
      </div>

      <div className="ui-pager">
        <Link className="ui-button ui-button--outline" href={`/learn?style=${style}`}><Icon name="back" /> BACK TO PLAN</Link>
        {next && nextPrimary && (
          <Link className="ui-button ui-button--paper" href={`/learn/${next.id}/${nextPrimary}?style=${style}`}>NEXT: {next.title.toUpperCase()} <Icon name="arrow" /></Link>
        )}
      </div>
    </LearnShell>
  );
}
