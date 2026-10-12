'use client';

import * as React from 'react';
import { HallScene } from '@/components/figures/hall/live';
import { faultKinds, faultSentence, healthyHall, partKind, type FaultKind, type HallState } from '@/components/figures/hall/model';
import type { GameContent, SceneState } from '@/lib/content/lessons';
import { FactChips } from './FactChips';
import { useFactMarks } from './factMarks';

type Item = GameContent['items'][number];

/** Same order on server and client: a shuffle seeded by the lesson's item ids. */
function shuffled<T>(list: T[], seedText: string) {
  let seed = [...seedText].reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0), 2166136261);
  const random = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const sceneOf = (scene?: SceneState): HallState => ({ ...healthyHall, ...scene });

/**
 * Plays a match, order or sort game from lesson data. When items carry a scene state, the data
 * hall shows what the selected item looks like.
 */
export function GameLesson({ content, art, facts: briefFacts = [] }: { content: GameContent; art?: React.ReactNode; facts?: { key: string; text: string }[] }) {
  const [active, setActive] = React.useState<Item | null>(null);
  // The student's own changes to the scene; hovering a statement previews it instead.
  const [own, setOwn] = React.useState<HallState>(healthyHall);
  const [pointed, setPointed] = React.useState<string | null>(null);
  const [checked, setChecked] = React.useState(false);
  const usesScene = Boolean(art && content.items.some(i => i.scene));
  const facts = [...new Set(content.items.flatMap(i => i.facts))].sort();
  const shown = active ? sceneOf(active.scene) : own;

  // Which facts each kind of problem breaks, read from the game items that show it on the scene.
  const factsFor = (kind: FaultKind) => [...new Set(content.items.filter(i => i.scene && faultKinds(i.scene).includes(kind)).flatMap(i => i.facts))].sort();
  const problems = usesScene ? faultKinds(shown).map(kind => ({ kind, sentence: faultSentence(kind, shown), facts: factsFor(kind) })) : [];
  const pointedKind = pointed ? partKind(pointed) : null;
  useFactMarks(problems.flatMap(p => p.facts), [...(pointedKind ? factsFor(pointedKind) : []), ...(active?.facts ?? [])]);
  const textOf = (key: string) => briefFacts.find(f => f.key === key)?.text;

  return (
    <article className="lesson lesson-game">
      <h2 className="lesson-title">{content.prompt}</h2>
      {usesScene && (
        <HallScene
          art={art}
          state={shown}
          onChange={next => { setActive(null); setOwn(next); }}
          onHover={setPointed}
          fig="Game"
          title={active ? 'What it looks like' : 'Try it: change the hall'}
          caption="Hover a statement to see it, or click doors, racks, blanking panels and the loose tile to try things yourself. Example readings."
        />
      )}
      {usesScene && (
        <section className={`scene-status ${problems.length ? 'is-broken' : 'is-ok'}`} aria-live="polite" aria-labelledby="scene-status-title">
          <h3 id="scene-status-title" className="ui-label">{active ? 'THIS STATEMENT ON THE SCENE' : problems.length ? 'WHAT’S WRONG NOW' : 'EVERYTHING IS IN PLACE'}</h3>
          {problems.length === 0 ? (
            <p>Doors closed, racks facing the right way, gaps covered, tiles in the cold aisle. Click a part to break something and see which fact it goes against.</p>
          ) : (
            <ul>
              {problems.map(p => (
                <li key={p.kind}>
                  <span className="scene-status-what">{p.sentence}</span>
                  {p.facts.length ? (
                    <span className="scene-status-fact">
                      Goes against <FactChips facts={p.facts} />{p.facts.length === 1 && textOf(p.facts[0]) ? <> “{textOf(p.facts[0])}”</> : null}
                    </span>
                  ) : (
                    <span className="scene-status-fact">This belongs to another topic in the module.</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      <div onMouseLeave={() => setActive(null)} onBlur={() => setActive(null)}>
      {content.kind === 'sort' && <SortGame content={content} onActive={setActive} checked={checked} setChecked={setChecked} />}
      {content.kind === 'order' && <OrderGame content={content} onActive={setActive} checked={checked} setChecked={setChecked} />}
      {content.kind === 'match' && <MatchGame content={content} onActive={setActive} checked={checked} setChecked={setChecked} />}
      </div>
      <p className="ui-small">This game covers <FactChips facts={facts} />.</p>
    </article>
  );
}

type Shared = { onActive: (item: Item | null) => void; checked: boolean; setChecked: (v: boolean) => void };

function Result({ right, total, onReset }: { right: number; total: number; onReset: () => void }) {
  const done = right === total;
  return (
    <div className={`lesson-feedback game-result ${done ? 'is-correct' : 'is-wrong'}`} role="status">
      <b>{done ? 'All correct.' : `${right} of ${total} correct.`}</b>{' '}
      {done ? 'Nice work. Every fact in this topic is in place.' : 'Change the ones marked and check again.'}
      {done && <> <button type="button" className="lesson-retry" onClick={onReset}>Play again</button></>}
    </div>
  );
}

/* ---------- Sort: put each item into a group ---------- */

function SortGame({ content, onActive, checked, setChecked }: Shared & { content: Extract<GameContent, { kind: 'sort' }> }) {
  const items = React.useMemo(() => shuffled(content.items, content.items.map(i => i.id).join()), [content.items]);
  const [placed, setPlaced] = React.useState<Record<string, string>>({});
  const answer = Object.fromEntries(content.answer.map(a => [a.item, a.group]));
  const right = items.filter(i => placed[i.id] === answer[i.id]).length;
  const allPlaced = items.every(i => placed[i.id]);

  return (
    <div className="game">
      <ul className="game-list">
        {items.map(item => {
          const state = !checked || !placed[item.id] ? '' : placed[item.id] === answer[item.id] ? ' is-correct' : ' is-wrong';
          return (
            <li key={item.id} className={`game-item${state}`} onMouseEnter={() => onActive(item)} onFocus={() => onActive(item)}>
              <span className="game-text">{item.text}</span>
              <span className="game-groups" role="group" aria-label={`Sort: ${item.text}`}>
                {content.groups.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    className={`game-chip${placed[item.id] === g.id ? ' is-on' : ''}`}
                    aria-pressed={placed[item.id] === g.id}
                    onClick={() => { setPlaced(p => ({ ...p, [item.id]: g.id })); setChecked(false); onActive(item); }}
                  >
                    {g.label}
                  </button>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="game-actions">
        <button type="button" className="ui-button ui-button--paper" disabled={!allPlaced} onClick={() => setChecked(true)}>CHECK ANSWERS</button>
        {!allPlaced && <span className="ui-small">Sort every statement to check.</span>}
      </div>
      {checked && <Result right={right} total={items.length} onReset={() => { setPlaced({}); setChecked(false); }} />}
    </div>
  );
}

/* ---------- Order: arrange items into the right sequence ---------- */

function OrderGame({ content, onActive, checked, setChecked }: Shared & { content: Extract<GameContent, { kind: 'order' }> }) {
  const start = React.useMemo(() => shuffled(content.items, content.items.map(i => i.id).join()), [content.items]);
  const [order, setOrder] = React.useState(start);
  const right = order.filter((item, i) => content.answer[i] === item.id).length;
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    setOrder(o => {
      const next = [...o];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setChecked(false);
  };

  return (
    <div className="game">
      <ol className="game-list">
        {order.map((item, i) => {
          const state = !checked ? '' : content.answer[i] === item.id ? ' is-correct' : ' is-wrong';
          return (
            <li key={item.id} className={`game-item game-item--order${state}`} onMouseEnter={() => onActive(item)} onFocus={() => onActive(item)}>
              <span className="game-step">{i + 1}</span>
              <span className="game-text">{item.text}</span>
              <span className="game-groups">
                <button type="button" className="game-chip" aria-label={`Move up: ${item.text}`} disabled={i === 0} onClick={() => move(i, i - 1)}>↑</button>
                <button type="button" className="game-chip" aria-label={`Move down: ${item.text}`} disabled={i === order.length - 1} onClick={() => move(i, i + 1)}>↓</button>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="game-actions">
        <button type="button" className="ui-button ui-button--paper" onClick={() => setChecked(true)}>CHECK ORDER</button>
      </div>
      {checked && <Result right={right} total={order.length} onReset={() => { setOrder(start); setChecked(false); }} />}
    </div>
  );
}

/* ---------- Match: pair each item on the left with one on the right ---------- */

function MatchGame({ content, onActive, checked, setChecked }: Shared & { content: Extract<GameContent, { kind: 'match' }> }) {
  const byId = Object.fromEntries(content.items.map(i => [i.id, i]));
  const left = React.useMemo(() => shuffled(content.answer.map(([a]) => byId[a]), 'left'), [content.answer]);
  const right = React.useMemo(() => shuffled(content.answer.map(([, b]) => byId[b]), 'right'), [content.answer]);
  const [pairs, setPairs] = React.useState<Record<string, string>>({});
  const [picked, setPicked] = React.useState<string | null>(null);
  const answer = Object.fromEntries(content.answer);
  const score = left.filter(i => pairs[i.id] === answer[i.id]).length;
  const taken = new Set(Object.values(pairs));

  return (
    <div className="game">
      <div className="game-match">
        <ul className="game-list">
          {left.map(item => {
            const state = !checked || !pairs[item.id] ? '' : pairs[item.id] === answer[item.id] ? ' is-correct' : ' is-wrong';
            return (
              <li key={item.id} className={`game-item${state}`}>
                <button type="button" className={`game-pick${picked === item.id ? ' is-on' : ''}`} aria-pressed={picked === item.id} onClick={() => { setPicked(item.id); onActive(item); }}>
                  {item.text}
                </button>
                {pairs[item.id] && <span className="ui-small">→ {byId[pairs[item.id]].text}</span>}
              </li>
            );
          })}
        </ul>
        <ul className="game-list">
          {right.map(item => (
            <li key={item.id} className="game-item">
              <button
                type="button"
                className={`game-pick${taken.has(item.id) ? ' is-used' : ''}`}
                disabled={!picked}
                onClick={() => {
                  if (!picked) return;
                  setPairs(p => Object.fromEntries([...Object.entries(p).filter(([, b]) => b !== item.id), [picked, item.id]]));
                  setPicked(null);
                  setChecked(false);
                  onActive(item);
                }}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="game-actions">
        <button type="button" className="ui-button ui-button--paper" disabled={Object.keys(pairs).length < left.length} onClick={() => setChecked(true)}>CHECK PAIRS</button>
        <span className="ui-small">Pick an item on the left, then its partner on the right.</span>
      </div>
      {checked && <Result right={score} total={left.length} onReset={() => { setPairs({}); setChecked(false); }} />}
    </div>
  );
}
