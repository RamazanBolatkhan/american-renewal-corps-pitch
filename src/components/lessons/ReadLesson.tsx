import type { Question, ReadContent } from '@/lib/content/lessons';
import { FactChips } from './FactChips';
import { QuickCheck } from './QuickCheck';

/** Short, fact-led reading: one idea per paragraph, each marked with the fact it teaches. */
export function ReadLesson({ content, check }: { content: ReadContent; check?: Question }) {
  return (
    <article className="lesson lesson-read">
      <h2 className="lesson-title">{content.title}</h2>
      {content.paragraphs.map((p, i) => (
        <div className="lesson-para" key={i}>
          <FactChips facts={p.facts} />
          <p>{p.text}</p>
        </div>
      ))}
      {content.keyTerms.length > 0 && (
        <dl className="lesson-terms">
          {content.keyTerms.map(t => (
            <div key={t.term}><dt>{t.term}</dt><dd>{t.definition}</dd></div>
          ))}
        </dl>
      )}
      <aside className="lesson-mistake">
        <span className="ui-label">COMMON MISTAKE</span>
        <p>{content.commonMistake.text}</p>
      </aside>
      {check && <QuickCheck question={check} />}
    </article>
  );
}
