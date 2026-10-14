'use client';

import * as React from 'react';
import { translateAlong, type Point3 } from '@/components/iso/iso-kit';
import { IsoFigure, Plate } from '@/components/iso/react/draw';
import { follow, useLoop, useReadout } from '@/components/iso/react/live';
import { explainPart, explainParts, faultsOf, inletTemps, inRange, partInfo, readoutOf, toggled, type HallState } from './model';
import { HEIGHT, P, WIDTH } from './view';

const DOOR_TRAVEL = 24;
const MAX_ZOOM = 2.6;
const ZOOM_PAD = 28;
const DROP: Point3 = [0, 0, 80];

/** `key=value` / `key!=value` against the state; null indexes compare as "none", lists match any member. */
function matches(rule: string, state: HallState) {
  const [key, value] = rule.split(/!?=/);
  const raw = state[key as keyof HallState];
  const actual = Array.isArray(raw) ? raw.map(String) : [String(raw ?? 'none')];
  return rule.includes('!=') ? !actual.includes(value) : actual.includes(value);
}

/** A zoomed-in explanation: the parts to frame, and optionally the words to show instead of the part's own. */
export type Focus = { parts: string[]; title?: string; body?: string; seq?: number };

type Props = {
  art: React.ReactNode;
  state: HallState;
  fig?: string;
  title?: string;
  hint?: string;
  caption?: React.ReactNode;
  /** Replaces the inlet readout, for example while the hall is still being built. */
  readout?: string;
  /** Called with the `data-part` of whatever was clicked, for games and sims. */
  onPart?: (part: string) => void;
  /** Lets the student change the scene directly: click or press Enter on a door, rack, panel or tile. */
  onChange?: (next: HallState) => void;
  /** Called with the part under the pointer or keyboard focus (null when none). */
  onHover?: (part: string | null) => void;
  /** Zooms in on these parts and explains them; a new `seq` zooms again. */
  explain?: Focus | null;
  /** Build game: the pieces placed so far. Without it every piece is shown. */
  built?: string[];
  /** Build game: ghost slots to show, the ones for the piece in hand, and what placing there does. */
  slots?: string[];
  armed?: string[];
  slotLabel?: (slot: string) => string;
  onSlot?: (slot: string) => void;
};

type PieceMotion = { t: number; goal: number; dir: Point3; fade: boolean };

/** A different direction for each piece, so the hall flies apart instead of lifting as one block. */
function scatterOf(piece: string): Point3 {
  let h = 2166136261;
  for (const c of piece) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const a = ((h & 0xff) / 255) * Math.PI * 2;
  const reach = 70 + ((h >>> 8) & 0x3f);
  return [Math.cos(a) * reach, Math.sin(a) * reach, 60 + ((h >>> 14) & 0x3f)];
}

/** The data-hall figure. Static art comes in from the server; this only shows, hides, moves and zooms. */
export function HallScene({
  art, state, fig = 'Fig 1', title = 'Contained cold aisle', hint = 'Example readings', caption, readout,
  onPart, onChange, onHover, explain, built, slots = [], armed = [], slotLabel, onSlot,
}: Props) {
  const interactive = Boolean(onChange);
  const defaultHint = slots.length ? 'Pick a part, then click its dashed outline' : interactive ? 'Click a part to change it' : 'Click a part to zoom in';
  const zoomer = React.useRef<SVGGElement>(null);
  const root = React.useRef<SVGGElement>(null);
  const callout = React.useRef<HTMLHeadingElement>(null);
  const { anchor, say } = useReadout<HTMLDivElement>();
  const doors = React.useRef<Record<string, number>>({});
  const [focus, setFocus] = React.useState<Focus | null>(null);
  const focusByKey = React.useRef(false);
  const target = React.useCallback((leaf: string) => {
    const [end, side] = leaf.split(':');
    const open = (end === 'far' ? state.doorFar : state.doorNear) === 'open';
    return open ? Number(side) * DOOR_TRAVEL : 0;
  }, [state.doorFar, state.doorNear]);

  // The parent can ask for a zoom (a sim consequence, a build mistake).
  const explainKey = explain ? `${explain.parts.join()}|${explain.seq ?? ''}` : '';
  React.useEffect(() => { setFocus(explain ?? null); }, [explainKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Build game: which pieces are placed, dropping in or flying apart ---------- */

  const motion = React.useRef<Map<string, PieceMotion>>(new Map());
  const placed = React.useRef<Set<string> | null>(built ? new Set(built) : null);
  const builtKey = built?.join() ?? '';
  React.useEffect(() => {
    if (!built) return;
    const now = new Set(built);
    const before = placed.current ?? now;
    for (const piece of now) if (!before.has(piece)) motion.current.set(piece, { t: 1, goal: 0, dir: DROP, fade: false });
    for (const piece of before) if (!now.has(piece)) motion.current.set(piece, { t: 0, goal: 1, dir: scatterOf(piece), fade: true });
    placed.current = now;
  }, [builtKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Shows and hides variants, pieces and ghost slots, and moves pieces that are dropping or leaving. */
  const paint = React.useCallback(() => {
    const el = root.current;
    if (!el) return;
    const pieces = placed.current;
    el.querySelectorAll<SVGElement>('[data-when],[data-piece]').forEach(node => {
      const when = node.dataset.when;
      let shown = !when || matches(when, state);
      const list = node.dataset.piece?.split(' ');
      if (pieces && list) {
        const own = list.length === 1 ? motion.current.get(list[0]) : undefined;
        shown &&= own ? true : list.every(p => pieces.has(p) && !motion.current.has(p));
        if (own) {
          node.setAttribute('transform', translateAlong(P, [own.dir[0] * own.t, own.dir[1] * own.t, own.dir[2] * own.t]));
          node.style.opacity = own.fade ? String(1 - own.t) : '';
        } else if (node.hasAttribute('transform') && list.length === 1) {
          node.removeAttribute('transform');
          node.style.opacity = '';
        }
      }
      node.style.display = shown ? '' : 'none';
    });
    el.querySelectorAll<SVGElement>('[data-slot]').forEach(node => {
      const slot = node.dataset.slot!;
      const open = slots.includes(slot);
      node.style.display = open ? '' : 'none';
      node.toggleAttribute('data-armed', armed.includes(slot));
      if (open) {
        node.setAttribute('tabindex', '0');
        node.setAttribute('role', 'button');
        node.setAttribute('aria-label', slotLabel?.(slot) ?? 'Place a part here');
      } else node.removeAttribute('tabindex');
    });
  }, [state, slots, armed, slotLabel]);

  // Variants, sensor displays and the readout follow the state immediately.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    paint();
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
    say(readout ?? readoutOf(state));
  }, [state, say, target, paint, readout, builtKey]);

  /* ---------- Zoom: frame the focused parts and the airflow that explains them ---------- */

  const view = React.useRef({ s: 1, cx: WIDTH / 2, cy: HEIGHT / 2 });
  const goal = React.useRef({ s: 1, cx: WIDTH / 2, cy: HEIGHT / 2 });

  const frame = React.useCallback(() => {
    const el = root.current;
    if (!el) return;
    const parts = focus?.parts ?? [];
    el.querySelectorAll('[data-focus]').forEach(node => node.removeAttribute('data-focus'));
    const nodes = parts.flatMap(p => [...el.querySelectorAll<SVGGraphicsElement>(`[data-part="${p}"],[data-explains="${p}"]`)]);
    nodes.forEach(node => node.setAttribute('data-focus', ''));
    const toArt = el.getScreenCTM()?.inverse();
    let box: { x0: number; y0: number; x1: number; y1: number } | null = null;
    for (const node of nodes) {
      const r = node.getBoundingClientRect();
      if (!toArt || (r.width === 0 && r.height === 0)) continue;
      const a = new DOMPoint(r.left, r.top).matrixTransform(toArt);
      const b = new DOMPoint(r.right, r.bottom).matrixTransform(toArt);
      box = box
        ? { x0: Math.min(box.x0, a.x), y0: Math.min(box.y0, a.y), x1: Math.max(box.x1, b.x), y1: Math.max(box.y1, b.y) }
        : { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
    }
    if (!box) {
      goal.current = { s: 1, cx: WIDTH / 2, cy: HEIGHT / 2 };
    } else {
      const s = Math.max(1, Math.min(MAX_ZOOM, WIDTH / (box.x1 - box.x0 + 2 * ZOOM_PAD), HEIGHT / (box.y1 - box.y0 + 2 * ZOOM_PAD)));
      // Beside a wide figure the explanation card covers the left of the drawing, so the part sits right of centre.
      const wide = (anchor.current?.clientWidth ?? 0) > 640;
      const half = { w: WIDTH / (2 * s), h: HEIGHT / (2 * s) };
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      goal.current = {
        s,
        cx: clamp((box.x0 + box.x1) / 2 - (wide ? (WIDTH * 0.16) / s : 0), half.w, WIDTH - half.w),
        cy: clamp((box.y0 + box.y1) / 2 - (wide ? 0 : (HEIGHT * 0.04) / s), half.h, HEIGHT - half.h),
      };
    }
  }, [focus, anchor]);
  const reframe = React.useRef(frame);
  reframe.current = frame;

  React.useEffect(() => {
    frame();
    kick();
    if (focus && focusByKey.current) callout.current?.focus();
    focusByKey.current = false;
  }, [focus, state, builtKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Hover and keyboard focus explain a part in the corner and the note ---------- */

  const showHint = React.useCallback((text: string) => {
    const corner = anchor.current?.querySelector('[data-corner="hint"]');
    if (corner) corner.textContent = text;
  }, [anchor]);
  const lastFix = React.useRef('');
  const zoomedHint = 'Zoomed in · click empty space to zoom out';
  const describe = React.useCallback((part: string | null) => {
    const slot = part?.startsWith('slot:') ? part.slice(5) : null;
    const info = part && !slot ? partInfo(part, state) : null;
    const base = focus ? zoomedHint : defaultHint;
    showHint(slot ? slotLabel?.(slot) ?? base : info ? `${info.name}${info.action && interactive ? ` · ${info.action}` : ''}` : base);
    const note = anchor.current?.querySelector('.hall-note');
    if (note) note.textContent = info ? `${info.name}: ${info.does}` : lastFix.current;
    onHover?.(info ? part : null);
  }, [state, interactive, defaultHint, showHint, anchor, onHover, focus, slotLabel]);
  const hovered = React.useRef<string | null>(null);

  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.querySelectorAll<SVGGElement>('[data-part]').forEach(node => {
      const part = node.dataset.part!;
      const info = partInfo(part, state);
      if (!info) return;
      const changeable = interactive && toggled(part, state) !== null;
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `${info.name}. ${info.does}${changeable && info.action ? ` ${info.action}.` : ' Press Enter to zoom in.'}`);
      node.toggleAttribute('data-changeable', changeable);
    });
    describe(hovered.current);
  }, [state, interactive, describe]);

  /* ---------- Clicking: place a piece, change a part, or zoom in on it ---------- */

  const act = (part: string | null, byKey = false) => {
    focusByKey.current = byKey;
    if (!part) { setFocus(null); return; }
    if (part.startsWith('slot:')) { onSlot?.(part.slice(5)); return; }
    onPart?.(part);
    const next = onChange ? toggled(part, state) : null;
    if (next) {
      onChange!(next);
      // Breaking something zooms in on what goes wrong; fixing it zooms back out.
      const now = explainPart(part, next);
      lastFix.current = now && !now.fault && explainPart(part, state)?.fault ? `Fixed: ${now.title}.` : '';
      if (now?.fault) setFocus({ parts: [part] });
      else setFocus(null);
      return;
    }
    if (explainPart(part, state)) setFocus({ parts: [part] });
  };
  const partOf = (el: EventTarget | null) => {
    const node = el as Element | null;
    const slot = node?.closest?.('[data-slot]');
    if (slot) return `slot:${slot.getAttribute('data-slot')}`;
    return node?.closest?.('[data-part]')?.getAttribute('data-part') ?? null;
  };

  /* ---------- One loop for door leaves, pieces and the zoom ---------- */

  const tick = React.useCallback((dt: number, calm: boolean) => {
    const el = root.current;
    if (!el) return false;
    let moving = false;
    el.querySelectorAll<SVGGElement>('[data-leaf]').forEach(node => {
      const leaf = node.dataset.leaf!;
      const want = target(leaf);
      const now = follow(doors.current[leaf] ?? 0, want, dt, 0.28, calm);
      doors.current[leaf] = now;
      node.setAttribute('transform', translateAlong(P, [0, now, 0]));
      if (now !== want) moving = true;
    });
    if (motion.current.size) {
      for (const [piece, m] of motion.current) {
        m.t = follow(m.t, m.goal, dt, m.fade ? 0.22 : 0.16, calm);
        if (m.t === m.goal) motion.current.delete(piece);
      }
      paint();
      // Frame the zoom on where pieces land, not where they are mid-drop.
      if (!motion.current.size) reframe.current();
      moving = true;
    }
    const v = view.current;
    const g = goal.current;
    v.s = follow(v.s, g.s, dt, 0.24, calm);
    v.cx = follow(v.cx, g.cx, dt, 0.24, calm);
    v.cy = follow(v.cy, g.cy, dt, 0.24, calm);
    const zoomed = v.s !== 1 || g.s !== 1;
    zoomer.current?.setAttribute('transform', zoomed ? `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${v.s.toFixed(4)}) translate(${(-v.cx).toFixed(2)} ${(-v.cy).toFixed(2)})` : '');
    if (v.s !== g.s || v.cx !== g.cx || v.cy !== g.cy) moving = true;
    return moving;
  }, [target, paint]);
  const kick = useLoop(tick, true);
  React.useEffect(() => { kick(); }, [state, builtKey, kick]);

  const faults = faultsOf(state);
  const label = `A contained cold aisle between two rows of server racks, seen from above with the near row cut away. ${
    faults.length ? `Problems: ${faults.join('; ')}.` : 'Doors closed, every rack facing the right way, blanking panels in place.'
  } Example inlet readings: ${inletTemps(state).map((t, i) => `rack A${i + 1} ${t.toFixed(1)} °C`).join(', ')}.`;

  const shown = focus ? explainParts(focus.parts, state) : null;
  const fixable = Boolean(focus && interactive && shown?.fault && focus.parts.length === 1 && toggled(focus.parts[0], state));
  const fixLabel = fixable ? partInfo(focus!.parts[0], state)?.action?.replace(/^Click to /, '') : undefined;

  return (
    <div
      className={`iso hall${focus ? ' is-zoomed' : ''}${slots.length ? ' is-building' : ''}`}
      ref={anchor}
      onKeyDown={event => { if (event.key === 'Escape' && focus) { event.stopPropagation(); setFocus(null); } }}
    >
      <Plate fig={fig} title={title} hint={focus ? zoomedHint : defaultHint} readout={readout ?? readoutOf(state)} caption={caption}
        keys={[
          { mark: 'blue', label: 'Cool supply air' },
          { mark: 'red', label: 'Hot exhaust' },
          { mark: 'lit', label: 'What breaks containment' },
        ]}
      >
        <IsoFigure width={WIDTH} height={HEIGHT} label={label}>
          <g ref={zoomer}>
            <g
              ref={root}
              className={interactive ? 'hall-interactive' : 'hall-explain'}
              onClick={event => act(partOf(event.target))}
              onKeyDown={event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                act(partOf(event.target), true);
              }}
              onPointerOver={event => { hovered.current = partOf(event.target); describe(hovered.current); }}
              onPointerLeave={() => { hovered.current = null; describe(null); }}
              onFocus={event => { hovered.current = partOf(event.target); describe(hovered.current); }}
              onBlur={() => { hovered.current = null; describe(null); }}
            >
              {/* Clicking empty space zooms back out. */}
              <rect className="hall-hit" x={0} y={0} width={WIDTH} height={HEIGHT} />
              {art}
            </g>
          </g>
        </IsoFigure>
      </Plate>
      {focus && shown && (
        <section className={`hall-callout${shown.fault ? ' is-fault' : ''}`} aria-live="polite">
          <p className="hall-callout-label">{shown.fault ? 'What goes wrong' : 'Zoomed in'} · {shown.name}</p>
          <h3 className="hall-callout-title" ref={callout} tabIndex={-1}>{focus.title ?? shown.title}</h3>
          <p className="hall-callout-body">{focus.body ?? shown.body}</p>
          <div className="hall-callout-actions">
            {fixable && (
              <button type="button" className="ui-button ui-button--paper" onClick={() => act(focus.parts[0])}>{fixLabel?.toUpperCase()}</button>
            )}
            <button type="button" className="ui-button ui-button--outline" onClick={() => setFocus(null)}>ZOOM OUT</button>
          </div>
        </section>
      )}
      <p className="hall-note" aria-live="polite" />
      <p className="ui-sr" aria-live="polite">{readout ?? readoutOf(state)}</p>
    </div>
  );
}
