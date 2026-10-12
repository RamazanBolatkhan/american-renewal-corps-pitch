'use client';

import * as React from 'react';
import { translateAlong } from '@/components/iso/iso-kit';
import { IsoFigure, Plate } from '@/components/iso/react/draw';
import { follow, useLoop, useReadout } from '@/components/iso/react/live';
import { faultsOf, inletTemps, inRange, readoutOf, type HallState } from './model';
import { HEIGHT, P, WIDTH } from './view';

const DOOR_TRAVEL = 24;

/** `key=value` / `key!=value` against the state; null indexes compare as "none". */
function matches(rule: string, state: HallState) {
  const [key, value] = rule.split(/!?=/);
  const actual = String(state[key as keyof HallState] ?? 'none');
  return rule.includes('!=') ? actual !== value : actual === value;
}

type Props = {
  art: React.ReactNode;
  state: HallState;
  fig?: string;
  title?: string;
  hint?: string;
  caption?: React.ReactNode;
  /** Called with the `data-part` of whatever was clicked, for games and sims. */
  onPart?: (part: string) => void;
};

/** The data-hall figure. Static art comes in from the server; this only shows, hides and moves. */
export function HallScene({ art, state, fig = 'Fig 1', title = 'Contained cold aisle', hint = 'Example readings', caption, onPart }: Props) {
  const root = React.useRef<SVGGElement>(null);
  const { anchor, say } = useReadout<HTMLDivElement>();
  const doors = React.useRef<Record<string, number>>({});
  const target = React.useCallback((leaf: string) => {
    const [end, side] = leaf.split(':');
    const open = (end === 'far' ? state.doorFar : state.doorNear) === 'open';
    return open ? Number(side) * DOOR_TRAVEL : 0;
  }, [state.doorFar, state.doorNear]);

  // Variants, sensor displays and the readout follow the state immediately.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.querySelectorAll<SVGElement>('[data-when]').forEach(node => {
      node.style.display = matches(node.dataset.when!, state) ? '' : 'none';
    });
    const temps = inletTemps(state);
    el.querySelectorAll<SVGTextElement>('[data-inlet]').forEach(node => {
      const t = temps[Number(node.dataset.inlet)];
      node.textContent = `${t.toFixed(1)}°`;
      node.toggleAttribute('data-hot', !inRange(t));
    });
    el.querySelectorAll<SVGGElement>('[data-leaf]').forEach(node => {
      const solid = node.querySelector('.iso-solid');
      solid?.toggleAttribute('data-lit', target(node.dataset.leaf!) !== 0);
    });
    say(readoutOf(state));
  }, [state, say, target]);

  // Door leaves slide with an eased follow.
  const tick = React.useCallback((dt: number, calm: boolean) => {
    const el = root.current;
    if (!el) return false;
    let moving = false;
    el.querySelectorAll<SVGGElement>('[data-leaf]').forEach(node => {
      const leaf = node.dataset.leaf!;
      const goal = target(leaf);
      const now = follow(doors.current[leaf] ?? 0, goal, dt, 0.28, calm);
      doors.current[leaf] = now;
      node.setAttribute('transform', translateAlong(P, [0, now, 0]));
      if (now !== goal) moving = true;
    });
    return moving;
  }, [target]);
  const kick = useLoop(tick, true);
  React.useEffect(() => { kick(); }, [state, kick]);

  const faults = faultsOf(state);
  const label = `A contained cold aisle between two rows of server racks, seen from above with the near row cut away. ${
    faults.length ? `Problems: ${faults.join('; ')}.` : 'Doors closed, every rack facing the right way, blanking panels in place.'
  } Example inlet readings: ${inletTemps(state).map((t, i) => `rack A${i + 1} ${t.toFixed(1)} °C`).join(', ')}.`;

  return (
    <div className="iso hall" ref={anchor}>
      <Plate fig={fig} title={title} hint={hint} readout={readoutOf(state)} caption={caption}
        keys={[
          { mark: 'blue', label: 'Cool supply air' },
          { mark: 'red', label: 'Hot exhaust' },
          { mark: 'lit', label: 'What breaks containment' },
        ]}
      >
        <IsoFigure width={WIDTH} height={HEIGHT} label={label}>
          <g
            ref={root}
            onClick={onPart ? event => {
              const part = (event.target as Element).closest('[data-part]')?.getAttribute('data-part');
              if (part) onPart(part);
            } : undefined}
          >
            {art}
          </g>
        </IsoFigure>
      </Plate>
      <p className="ui-sr" aria-live="polite">{readoutOf(state)}</p>
    </div>
  );
}
