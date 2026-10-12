'use client';

import * as React from 'react';
import { HallScene } from '@/components/figures/hall/live';
import { healthyHall, type HallState } from '@/components/figures/hall/model';
import type { SceneState, SimContent } from '@/lib/content/lessons';
import { FactChips } from './FactChips';
import { useFactMarks } from './factMarks';

const sceneOf = (...layers: (SceneState | undefined)[]): HallState => Object.assign({ ...healthyHall }, ...layers.filter(Boolean));

/**
 * A practice scenario: one decision at a time on the data-hall scene. Each decision sets the
 * scene; a choice can change it, so a wrong call (opening the doors) shows its consequence.
 */
export function SimLesson({ content, art }: { content: SimContent; art?: React.ReactNode }) {
  const [step, setStep] = React.useState(0);
  const [picked, setPicked] = React.useState<number | null>(null);
  const [misses, setMisses] = React.useState(0);
  const finished = step >= content.decisions.length;
  const decision = content.decisions[Math.min(step, content.decisions.length - 1)];
  const choice = picked === null ? null : decision.choices[picked];
  const state = finished ? sceneOf() : sceneOf(decision.scene, choice?.scene);
  // Highlight the current decision's facts; a wrong choice marks them as broken.
  useFactMarks(!finished && choice && !choice.correct ? decision.facts : [], finished ? [] : decision.facts);

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (!decision.choices[i].correct) setMisses(m => m + 1);
  };
  const next = () => { setStep(s => s + 1); setPicked(null); };
  const restart = () => { setStep(0); setPicked(null); setMisses(0); };

  return (
    <article className="lesson lesson-sim">
      <h2 className="lesson-title">{content.title}</h2>
      <p className="sim-scenario">{content.scenario}</p>
      {art && <HallScene art={art} state={state} fig="Sim" title={finished ? 'Walk-down complete' : `Decision ${step + 1} of ${content.decisions.length}`} hint="Example readings" />}

      <ol className="sim-progress" aria-label="Progress">
        {content.decisions.map((d, i) => (
          <li key={d.id} className={i < step ? 'is-done' : i === step && !finished ? 'is-now' : ''}><span className="ui-sr">Decision {i + 1}{i < step ? ', done' : ''}</span></li>
        ))}
      </ol>

      {!finished ? (
        <section className="lesson-check" aria-labelledby={`${decision.id}-prompt`}>
          <p className="ui-label">DECISION {step + 1} · <FactChips facts={decision.facts} /></p>
          <h3 id={`${decision.id}-prompt`} className="lesson-check-prompt">{decision.prompt}</h3>
          <div className="lesson-options" role="group" aria-label="Choices">
            {decision.choices.map((c, i) => {
              const stateClass = picked === null ? '' : c.correct && picked === i ? ' is-correct' : i === picked ? ' is-wrong' : ' is-muted';
              return (
                <button key={c.text} type="button" className={`lesson-option${stateClass}`} onClick={() => pick(i)} aria-pressed={picked === i} disabled={picked !== null && picked !== i}>
                  {c.text}
                </button>
              );
            })}
          </div>
          {choice && (
            <div className={`lesson-feedback ${choice.correct ? 'is-correct' : 'is-wrong'}`} role="status">
              <b>{choice.correct ? 'Good call.' : choice.fromCommonMistake ? 'That’s the common mistake.' : 'Not quite.'}</b> {choice.feedback}
              <div className="game-actions">
                {choice.correct ? (
                  <button type="button" className="ui-button ui-button--paper" onClick={next}>{step + 1 < content.decisions.length ? 'NEXT DECISION' : 'FINISH'}</button>
                ) : (
                  <button type="button" className="ui-button ui-button--outline" onClick={() => setPicked(null)}>TRY AGAIN</button>
                )}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="lesson-check" role="status">
          <p className="ui-label">WALK-DOWN COMPLETE</p>
          <h3 className="lesson-check-prompt">
            {misses === 0 ? 'Every call right the first time.' : `Done, with ${misses} call${misses === 1 ? '' : 's'} to rethink along the way.`}
          </h3>
          <p className="ui-small">You practised <FactChips facts={[...new Set(content.decisions.flatMap(d => d.facts))].sort()} />.</p>
          <div className="game-actions"><button type="button" className="ui-button ui-button--outline" onClick={restart}>RUN IT AGAIN</button></div>
        </section>
      )}
    </article>
  );
}
