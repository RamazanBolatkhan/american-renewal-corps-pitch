'use client';

import { useState } from 'react';
import type { Question } from '@/lib/content/lessons';

/** One practice question. Picking an option reveals whether it is right and why. */
export function QuickCheck({ question, label = 'QUICK CHECK' }: { question: Question; label?: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = answered && question.options[picked].correct;

  return (
    <section className="lesson-check" aria-labelledby={`${question.id}-prompt`}>
      <p className="ui-label">{label} · {question.fact.toUpperCase()}</p>
      <h3 id={`${question.id}-prompt`} className="lesson-check-prompt">{question.prompt}</h3>
      <div className="lesson-options" role="group" aria-label="Answer options">
        {question.options.map((option, i) => {
          const state = !answered ? '' : option.correct ? ' is-correct' : i === picked ? ' is-wrong' : ' is-muted';
          return (
            <button key={option.text} type="button" className={`lesson-option${state}`} onClick={() => setPicked(i)} aria-pressed={picked === i}>
              {option.text}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={`lesson-feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status">
          <b>{correct ? 'Correct.' : question.options[picked].fromCommonMistake ? 'That’s the common mistake.' : 'Not quite.'}</b>{' '}
          {question.options[picked].explanation}
          {!correct && <> <button type="button" className="lesson-retry" onClick={() => setPicked(null)}>Try again</button></>}
        </p>
      )}
    </section>
  );
}
