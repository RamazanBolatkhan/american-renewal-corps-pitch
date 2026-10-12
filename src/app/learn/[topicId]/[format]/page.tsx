import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow, SkeletonNote } from '@/components/PageShell';
import { DemoBanner, LearnShell } from '@/components/LearnShell';
import { FormatArt } from '@/components/FormatArt';
import '@/components/iso/iso.css';
import '@/components/figures/hall/hall.css';
import { HallArt } from '@/components/figures/hall/art';
import { DiagramLesson } from '@/components/lessons/DiagramLesson';
import { GameLesson } from '@/components/lessons/GameLesson';
import { SimLesson } from '@/components/lessons/SimLesson';
import { ReadLesson } from '@/components/lessons/ReadLesson';
import { getSampleLesson, getSampleQuestions } from '@/lib/content/sample';
import { Icon } from '@/components/Icon';
import { coolingModule, formatInfo, formats, getTopic, isFormat } from '@/lib/module';
import { buildPlan } from '@/lib/plan';
import { getLearningStyle, getSession } from '@/lib/session';

type Props = {
  params: Promise<{ topicId: string; format: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  return { title: `${topic?.title ?? 'Lesson'} — American Renewal Corps` };
}

export default async function LessonPage({ params }: Props) {
  const { topicId, format } = await params;
  const topic = getTopic(topicId);
  if (!topic || !isFormat(format)) notFound();

  const session = await getSession();
  // Visitors who haven't chosen a style can still open a lesson; the viewed format stands in.
  const style = (session && (await getLearningStyle(session.user.id))) || format;
  const planItem = buildPlan(style, coolingModule.topics.map(t => t.id)).topics.find(t => t.topic_id === topic.id)!;
  const topicIndex = coolingModule.topics.indexOf(topic);
  const next = coolingModule.topics[topicIndex + 1];
  const nextPrimary = next ? buildPlan(style, [next.id]).topics[0].primary : undefined;
  const lesson = getSampleLesson(topic.id, format);
  // The Read lesson ends with a check on the fact its common mistake is about.
  const check = getSampleQuestions(topic.id).find(q => q.options.some(o => o.fromCommonMistake)) ?? getSampleQuestions(topic.id)[0];
  const role = (f: string) => (f === planItem.primary ? 'START' : f === planItem.secondary ? 'THEN' : 'ALSO');

  return (
    <LearnShell>
      <DemoBanner />
      <Link className="ui-crumb" href={`/learn`}><Icon name="back" /> COOLING &amp; AIRFLOW / YOUR PLAN</Link>
      <Eyebrow>TOPIC 0{topicIndex + 1} / {formatInfo[format].label.toUpperCase()}</Eyebrow>
      <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,80px)' }}>{topic.title.toUpperCase()}</h1>
      <p className="ui-lede">{topic.objective}</p>

      <nav className="ui-tabs" aria-label="Lesson formats">
        {formats.map(f => (
          <Link key={f} className="ui-tab" href={`/learn/${topic.id}/${f}`} aria-current={f === format ? 'page' : undefined}>
            <em>{role(f)}</em> {formatInfo[f].short}
          </Link>
        ))}
      </nav>

      <div className="ui-lesson">
        {lesson?.format === 'read' ? (
          <ReadLesson content={lesson.content} check={check} />
        ) : lesson?.format === 'diagram' ? (
          <DiagramLesson content={lesson.content} />
        ) : lesson?.format === 'game' ? (
          <GameLesson content={lesson.content} art={<HallArt key="art" />} />
        ) : lesson?.format === 'sim' ? (
          <SimLesson content={lesson.content} art={<HallArt key="art" />} />
        ) : (
          <section className="ui-renderer" aria-label={`${formatInfo[format].label} lesson`}>
            <div>
              <FormatArt format={format} />
              <h2 className="ui-h3" style={{ margin: '18px 0 10px' }}>{formatInfo[format].label.toUpperCase()} LESSON</h2>
              <p>{formatInfo[format].description} The interactive version is being built next, on an illustrated data-hall scene.</p>
            </div>
          </section>
        )}
        <aside className="ui-frame ui-frame--corner" aria-labelledby="facts-title">
          <h2 id="facts-title" className="ui-label" style={{ marginBottom: 14 }}>KEY FACTS IN THIS TOPIC</h2>
          <ul className="ui-facts">
            {topic.facts.map(fact => <li key={fact.key}><b>{fact.key.toUpperCase()}</b>{fact.text}</li>)}
          </ul>
          <p className="ui-mistake"><span>COMMON MISTAKE</span>{topic.commonMistake}</p>
          <SkeletonNote>Sample lessons written by hand from the brief. The AI generator will produce the same shapes from approved briefs.</SkeletonNote>
        </aside>
      </div>

      <div className="ui-pager">
        <Link className="ui-button ui-button--outline" href={`/learn`}><Icon name="back" /> BACK TO PLAN</Link>
        {next && nextPrimary && (
          <Link className="ui-button ui-button--paper" href={`/learn/${next.id}/${nextPrimary}`}>NEXT: {next.title.toUpperCase()} <Icon name="arrow" /></Link>
        )}
      </div>
    </LearnShell>
  );
}
