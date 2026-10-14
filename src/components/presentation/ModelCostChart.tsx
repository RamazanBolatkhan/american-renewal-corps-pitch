'use client';

import { useState } from 'react';

/** Measured average per topic on the published Cooling & airflow module (Read, Diagram, Game, Sim, questions, retries). */
const TOKENS = { input: 10_843, output: 17_407 };
const TOPICS_50_MODULES = 150;

type Provider = 'Anthropic' | 'OpenAI' | 'Google';
const providers: Provider[] = ['Anthropic', 'OpenAI', 'Google'];

/** AI Gateway list prices per 1M tokens (input / output), October 2026. */
const models: { name: string; provider: Provider; input: number; output: number; used?: boolean }[] = [
  { name: 'Claude Haiku 5.5', provider: 'Anthropic', input: 0.1, output: 0.5, used: true },
  { name: 'GPT-6 Luna', provider: 'OpenAI', input: 0.1, output: 0.5 },
  { name: 'Gemini 3.5 Flash Lite', provider: 'Google', input: 0.3, output: 2.5 },
  { name: 'Gemini 3.8 Flash', provider: 'Google', input: 0.75, output: 3.75 },
  { name: 'Claude Sonnet 5.5', provider: 'Anthropic', input: 2, output: 10 },
  { name: 'GPT-6.1 Sol', provider: 'OpenAI', input: 2, output: 10 },
  { name: 'Gemini 3.1 Pro', provider: 'Google', input: 2, output: 12 },
  { name: 'Claude Opus 5.5', provider: 'Anthropic', input: 4, output: 20 },
  { name: 'Claude Fable 5.1', provider: 'Anthropic', input: 10, output: 50 },
  { name: 'GPT-6 Astra', provider: 'OpenAI', input: 10, output: 50 },
];

const perTopic = (m: (typeof models)[number]) => (TOKENS.input * m.input + TOKENS.output * m.output) / 1e6;
const rows = models.map(m => ({ ...m, topic: perTopic(m), total: perTopic(m) * TOPICS_50_MODULES })).sort((a, b) => a.total - b.total);
const max = 150;
const ticks = [0, 50, 100, 150];

const usd = (n: number) => (n < 0.1 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`);
const slug = (p: Provider) => p.toLowerCase();

export function ModelCostChart() {
  const [active, setActive] = useState<string | null>(null);
  const shown = rows.find(r => r.name === active);

  return (
    <figure className="cost-chart">
      <figcaption className="cost-head">
        <span className="cost-title">Cost to generate 50 modules (150 topics)</span>
        <span className="cost-legend" aria-hidden="true">
          {providers.map(p => (
            <span key={p}><i className={`cost-key cost-key--${slug(p)}`} />{p}</span>
          ))}
        </span>
      </figcaption>

      <div className="cost-plot" role="list" onMouseLeave={() => setActive(null)}>
        <div className="cost-grid" aria-hidden="true">
          {ticks.map(t => <span key={t} style={{ left: `${(t / max) * 100}%` }}><b>${t}</b></span>)}
        </div>
        {rows.map(r => (
          <div
            key={r.name}
            role="listitem"
            tabIndex={0}
            className={`cost-row${active === r.name ? ' is-active' : ''}${r.used ? ' is-used' : ''}`}
            onMouseEnter={() => setActive(r.name)}
            onFocus={() => setActive(r.name)}
            onBlur={() => setActive(null)}
            aria-label={`${r.name} (${r.provider}): ${usd(r.total)} for 50 modules, ${usd(r.topic)} per topic${r.used ? ', the model this app uses' : ''}`}
          >
            <span className="cost-name">
              {r.name}
              {r.used && <em>USED</em>}
            </span>
            <span className="cost-track">
              <span className={`cost-bar cost-key--${slug(r.provider)}`} style={{ width: `max(4px, ${(r.total / max) * 100}%)` }} />
              <span className="cost-value">{usd(r.total)}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="cost-detail" aria-live="polite">
        {shown ? (
          <>
            <strong>{shown.name}</strong> · ${shown.input} / ${shown.output} per 1M tokens · {usd(shown.topic)} a topic · {usd(shown.topic * 3)} a module · {usd(shown.total)} for 50 modules
          </>
        ) : (
          <>Priced on Haiku’s measured tokens per topic ({TOKENS.input.toLocaleString('en-US')} in, {TOKENS.output.toLocaleString('en-US')} out); other models’ real counts would differ. AI Gateway list prices, October 2026. Hover a bar for details.</>
        )}
      </p>
    </figure>
  );
}
