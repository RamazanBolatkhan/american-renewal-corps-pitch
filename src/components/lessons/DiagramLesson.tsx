'use client';

import { useState } from 'react';
import type { DiagramContent } from '@/lib/content/lessons';
import { FactChips } from './FactChips';

type Element = DiagramContent['elements'][number];

/**
 * Draws a diagram from data. Selecting a caption (or a shape) highlights the parts that belong to
 * it, so the picture teaches one fact at a time.
 */
export function DiagramLesson({ content }: { content: DiagramContent }) {
  const [active, setActive] = useState<number | null>(null);
  const caption = active === null ? null : content.captions[active];
  const highlighted = new Set(caption?.elements ?? []);
  const isLit = (e: Element) => !caption || highlighted.has(e.id);

  const selectFromElement = (e: Element) => {
    const index = content.captions.findIndex(c => c.elements.includes(e.id));
    if (index >= 0) setActive(index === active ? null : index);
  };

  return (
    <article className="lesson lesson-diagram">
      <h2 className="lesson-title">{content.title}</h2>
      <div className="diagram-frame">
        <svg viewBox={`0 0 ${content.width} ${content.height}`} role="img" aria-label={content.title} className="diagram-svg">
          <defs>
            {(['neutral', 'cool', 'hot', 'warning'] as const).map(tone => (
              <marker key={tone} id={`arrow-${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 10 5 0 10z" className={`diagram-head tone-${tone}`} />
              </marker>
            ))}
          </defs>
          {[...content.elements]
            .sort((a, b) => order(a) - order(b))
            .map(e => (
              <g
                key={e.id}
                className={`diagram-el type-${e.type} tone-${e.tone}${isLit(e) ? '' : ' is-dim'}${highlighted.has(e.id) ? ' is-lit' : ''}`}
                onClick={() => selectFromElement(e)}
              >
                <Shape e={e} width={content.width} />
              </g>
            ))}
        </svg>
      </div>
      <ol className="diagram-captions">
        {content.captions.map((c, i) => (
          <li key={i}>
            <button type="button" className={`diagram-caption${active === i ? ' is-active' : ''}`} aria-pressed={active === i} onClick={() => setActive(active === i ? null : i)}>
              <FactChips facts={c.facts} />
              <span>{c.text}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="ui-small">Select a caption or a part of the drawing to see what belongs together.</p>
    </article>
  );
}

const order = (e: Element) => ({ zone: 0, rect: 1, arrow: 2, label: 3 })[e.type];

/** Rough text width at 12px, used to decide whether a label fits inside its box. */
const textWidth = (text: string) => text.length * 6.4;

function Shape({ e, width }: { e: Element; width: number }) {
  if (e.type === 'zone') {
    return (
      <>
        <rect x={e.x} y={e.y} width={e.w} height={e.h} />
        {e.label && <text x={e.x + 10} y={e.y + (e.h ?? 0) - 10} className="diagram-text is-zone">{e.label}</text>}
      </>
    );
  }
  if (e.type === 'rect') {
    const w = e.w ?? 0;
    const h = e.h ?? 0;
    const fits = e.label ? textWidth(e.label) <= w - 6 : true;
    const at = e.labelAt ?? (w < 30 ? (e.x < width / 2 ? 'left' : 'right') : fits ? 'inside' : 'above');
    const positions: Record<string, { x: number; y: number; anchor: 'start' | 'middle' | 'end' }> = {
      inside: { x: e.x + w / 2, y: e.y + h / 2, anchor: 'middle' },
      above: { x: e.x + w / 2, y: e.y - 8, anchor: 'middle' },
      below: { x: e.x + w / 2, y: e.y + h + 14, anchor: 'middle' },
      left: { x: e.x - 6, y: e.y + h / 2, anchor: 'end' },
      right: { x: e.x + w + 6, y: e.y + h / 2, anchor: 'start' },
    };
    const pos = positions[at] ?? positions.inside;
    return (
      <>
        <rect x={e.x} y={e.y} width={w} height={h} rx={3} />
        {e.label && <text x={pos.x} y={pos.y} textAnchor={pos.anchor} dominantBaseline="middle" className="diagram-text">{e.label}</text>}
      </>
    );
  }
  if (e.type === 'arrow') {
    const x2 = e.x2 ?? e.x;
    const y2 = e.y2 ?? e.y;
    const vertical = Math.abs(y2 - e.y) > Math.abs(x2 - e.x);
    const at = e.labelAt === 'start' || e.labelAt === 'end' ? e.labelAt : 'middle';
    const point = at === 'start' ? { x: e.x, y: e.y } : at === 'end' ? { x: x2, y: y2 } : { x: (e.x + x2) / 2, y: (e.y + y2) / 2 };
    const leftSide = vertical && e.x > width * 0.6;
    return (
      <>
        <line x1={e.x} y1={e.y} x2={x2} y2={y2} markerEnd={`url(#arrow-${e.tone})`} />
        {e.label && (
          <text
            x={vertical ? point.x + (leftSide ? -8 : 8) : point.x}
            y={vertical ? point.y : point.y - 9}
            textAnchor={vertical ? (leftSide ? 'end' : 'start') : 'middle'}
            dominantBaseline="middle"
            className="diagram-text is-arrow"
          >
            {e.label}
          </text>
        )}
      </>
    );
  }
  return <text x={e.x} y={e.y} dominantBaseline="middle" className="diagram-text is-note">{e.label}</text>;
}
