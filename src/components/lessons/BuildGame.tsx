'use client';

import * as React from 'react';
import * as k from '@/components/iso/iso-kit';
import { Dots, Line, Solid } from '@/components/iso/react/draw';
import { HallScene, type Focus } from '@/components/figures/hall/live';
import { faultKinds, faultSentence, healthyHall, reversedRacks, type FaultKind, type HallState } from '@/components/figures/hall/model';
import { FactChips } from './FactChips';
import { useFactMarks } from './factMarks';

/* ---------- The parts bin ---------- */

type PieceId = 'cooling' | 'rack' | 'row-b' | 'tile' | 'blank' | 'roof' | 'door';
type Piece = { id: PieceId; name: string; note: string; slots: string[] };

const RACK_SLOTS = ['rack-a0', 'rack-a1', 'rack-a2', 'rack-a3'];
const PIECES: Piece[] = [
  { id: 'cooling', name: 'Cooling unit', note: 'Cold air under the floor.', slots: ['cooling-unit'] },
  { id: 'rack', name: 'Server rack', note: 'Air in at the front, out the back.', slots: RACK_SLOTS },
  { id: 'row-b', name: 'Opposite row', note: 'Four racks, cut away.', slots: ['rack-row-b'] },
  { id: 'tile', name: 'Perforated tile', note: 'Lets cold air up.', slots: ['tile-cold', 'tile-hot'] },
  { id: 'blank', name: 'Blanking panel', note: 'Covers an empty rack space.', slots: ['blank-a1'] },
  { id: 'roof', name: 'Containment roof', note: 'Closes the aisle top.', slots: ['roof'] },
  { id: 'door', name: 'Containment door', note: 'Closes an aisle end.', slots: ['door-far', 'door-near'] },
];
/** What each slot adds to the scene (both tile slots place the same tile). */
const pieceOfSlot = (slot: string) => (slot.startsWith('tile-') ? 'tile-movable' : slot);
const ALL = [...PIECES.flatMap(p => p.slots).filter(s => s !== 'tile-hot').map(pieceOfSlot)];
const TOTAL = ALL.length;

const slotNames: Record<string, string> = {
  'cooling-unit': 'Place the cooling unit at the end of the outer aisle',
  'rack-row-b': 'Place the opposite row',
  'tile-cold': 'Lay the tile in the aisle between the rows',
  'tile-hot': 'Lay the tile in the aisle behind the cut-away row',
  'blank-a1': 'Fit the blanking panel into the empty space in rack A2',
  roof: 'Fit the roof over the aisle between the rows',
  'door-far': 'Fit a door at the far end of the aisle',
  'door-near': 'Fit a door at the near end of the aisle',
};
const slotLabel = (slot: string) => slotNames[slot] ?? `Place a server rack in slot A${Number(slot.slice(-1)) + 1}`;

/* ---------- Small isometric drawings of each piece, in the scene's linework ---------- */

const ICON = { w: 84, h: 64 };
const plan = (x: number, y: number, w: number, d: number, r = 0.4): k.Plan => ({ x, y, w, d, r });

function PieceIcon({ id }: { id: PieceId }) {
  const shapes: Record<PieceId, { box: k.Point3; draw: (p: k.Projection) => React.ReactNode }> = {
    cooling: {
      box: [40, 30, 96],
      draw: p => (
        <>
          <Solid paths={k.slabOf(plan(0, 0, 40, 30, 1), 0, 96, p, 2, 0.8)} tone="mid" />
          {[14, 22, 30, 38].map(z => <Line key={z} d={k.pathOf([k.iso([40, 4, z], p), k.iso([40, 26, z], p)])} tone="lo" />)}
        </>
      ),
    },
    rack: {
      box: [24, 40, 84],
      draw: p => (
        <>
          <Solid paths={k.slabOf(plan(0, 0, 24, 40), 0, 84, p, 2, 0.5)} tone="mid" />
          {[12, 22, 32, 42, 52, 62, 72].map(z => <Line key={z} d={k.pathOf([k.iso([2, 40, z], p), k.iso([22, 40, z], p)])} tone="lo" />)}
        </>
      ),
    },
    'row-b': {
      box: [96, 40, 18],
      draw: p => <>{[0, 1, 2, 3].map(i => <Solid key={i} paths={k.slabOf(plan(i * 24, 0, 24, 40), 0, 18, p, 2, 0.5)} tone="mid" />)}</>,
    },
    tile: {
      box: [24, 24, 2],
      draw: p => (
        <>
          <Solid paths={k.slabOf(plan(0, 0, 24, 24), 0, 2, p, 2)} tone="mid" />
          <Dots points={k.dotGrid(4, 4, 6, 6, 3.2, 2, p)} size={0.5} tone="mid" />
        </>
      ),
    },
    blank: {
      box: [20, 2, 6],
      draw: p => (
        <>
          <Solid paths={k.slabOf(plan(0, 0, 20, 2, 0.2), 0, 6, p, 2)} tone="mid" />
          <Dots points={[k.iso([2, 2, 3], p), k.iso([18, 2, 3], p)]} size={0.7} tone="mid" />
        </>
      ),
    },
    roof: {
      box: [30, 48, 2],
      draw: p => <Solid paths={k.slabOf(plan(0, 0, 30, 48, 0.3), 0, 2, p, 2, 0.3)} tone="mid" />,
    },
    door: {
      box: [2, 24, 80],
      draw: p => (
        <>
          <Solid paths={k.slabOf(plan(0, 0, 2, 24, 0.2), 0, 80, p, 2, 0.3)} tone="hi" crease="lo" />
          <Line d={k.pathOf([[2, 3, 40], [2, 21, 40], [2, 21, 74], [2, 3, 74]].map(q => k.iso(q as k.Point3, p)), true)} tone="lo" />
        </>
      ),
    },
  };
  const { box, draw } = shapes[id];
  const corners: k.Point3[] = [0, 1].flatMap(a => [0, 1].flatMap(b => [0, 1].map(c => [a * box[0], b * box[1], c * box[2]] as k.Point3)));
  const p = k.fitProjection(corners, ICON.w, ICON.h, { pad: 6, azimuth: 52, elevation: 38 });
  return <svg className="iso-svg bin-icon" viewBox={`0 0 ${ICON.w} ${ICON.h}`} aria-hidden="true" focusable="false">{draw(p)}</svg>;
}

/* ---------- The game ---------- */

type Phase = 'intro' | 'build';
const emptyHall: HallState = { ...healthyHall };

/**
 * Lego-style build: the working hall is knocked apart into a parts bin, and the student puts it
 * back together. Every placement is real: a rack can go in facing the wrong way and a tile can go
 * in the wrong aisle, and the scene zooms in on what that does.
 */
export function BuildGame({ art, factsFor, textOf }: { art: React.ReactNode; factsFor: (kind: FaultKind) => string[]; textOf: (key: string) => string | undefined }) {
  const [phase, setPhase] = React.useState<Phase>('intro');
  const [placed, setPlaced] = React.useState<string[]>(ALL);
  const [hall, setHall] = React.useState<HallState>(emptyHall);
  const [armed, setArmed] = React.useState<PieceId | null>(null);
  const [facing, setFacing] = React.useState<'cold' | 'hot' | null>(null);
  const [explain, setExplain] = React.useState<Focus | null>(null);
  const [message, setMessage] = React.useState('');
  const seq = React.useRef(0);
  const has = (piece: string) => placed.includes(piece);

  const open = (piece: Piece): string[] => {
    if (phase !== 'build') return [];
    if (piece.id === 'tile') return has('tile-movable') ? [] : piece.slots;
    const left = piece.slots.filter(s => !has(s));
    if (piece.id === 'blank') return has('rack-a1') && !reversedRacks(hall).includes(1) ? left : [];
    if (piece.id === 'roof' || piece.id === 'door') return RACK_SLOTS.every(has) && has('rack-row-b') ? left : [];
    return left;
  };
  const remaining = (piece: Piece) => (piece.id === 'tile' ? (has('tile-movable') ? 0 : 1) : piece.slots.filter(s => !has(s)).length);
  const waitingFor = (piece: Piece) => {
    if (remaining(piece) === 0 || open(piece).length) return null;
    if (piece.id === 'blank') return has('rack-a1') ? 'Turn rack A2 round first.' : 'Comes with rack A2.';
    return 'Needs both rows first.';
  };

  const armedPiece = PIECES.find(p => p.id === armed) ?? null;
  const armedSlots = armedPiece && (armedPiece.id !== 'rack' || facing) ? open(armedPiece) : [];
  const visibleSlots = PIECES.flatMap(open);
  const done = placed.length === TOTAL;

  const zoom = (parts: string[]) => setExplain({ parts, seq: ++seq.current });

  const start = () => {
    setPhase('build');
    setPlaced([]);
    setHall(emptyHall);
    setArmed(null);
    setFacing(null);
    setExplain(null);
    setMessage('The hall is in pieces. Start with the cooling unit, or any part you like.');
  };

  const place = (slot: string) => {
    const piece = PIECES.find(p => p.slots.includes(slot));
    if (!piece || !open(piece).includes(slot)) return;
    if (piece.id === 'rack' && !facing) {
      setArmed('rack');
      setMessage('First choose which way the rack’s front faces, in the parts bin.');
      return;
    }
    const nextPlaced = [...placed, pieceOfSlot(slot)];
    let next = hall;
    let focusOn: string[] | null = null;
    const rack = slot.match(/^rack-a(\d)$/);
    if (rack) {
      const n = Number(rack[1]);
      if (facing === 'hot') {
        next = { ...next, reversed: [...reversedRacks(next), n].sort() };
        focusOn = [slot];
      }
      if (n === 1 && !has('blank-a1')) {
        next = { ...next, missingBlank: 1 };
        focusOn ??= ['blank-a1'];
      }
    }
    if (slot === 'blank-a1') next = { ...next, missingBlank: null };
    if (slot === 'tile-hot') { next = { ...next, tile: 'hot' }; focusOn = ['tile-movable']; }
    if (slot === 'tile-cold') next = { ...next, tile: 'cold' };
    const r = reversedRacks(next);
    if (r.length === 1) next = { ...next, reversed: r[0] };
    setPlaced(nextPlaced);
    setHall(next);
    if (focusOn) zoom(focusOn);
    else setExplain(null);
    const left = piece.id === 'tile' ? 0 : piece.slots.filter(s => !nextPlaced.includes(s)).length;
    if (!left) setArmed(null);
    setMessage(nextPlaced.length === TOTAL ? 'Every part is in. Check the readings below the hall.' : `${slotLabel(slot).replace(/^(Place|Lay|Fit) /, 'Placed: ')}.`);
  };

  // Clicking parts in the scene still works: turn a rack, move the tile, fit or remove the panel, open a door.
  const change = (next: HallState) => {
    if (hall.missingBlank === 1 && next.missingBlank === null && !has('blank-a1')) setPlaced(p => [...p, 'blank-a1']);
    if (next.missingBlank === 1 && has('blank-a1')) setPlaced(p => p.filter(x => x !== 'blank-a1'));
    setHall(next);
  };

  const pick = (piece: Piece) => {
    setArmed(a => (a === piece.id ? null : piece.id));
    setExplain(null);
    if (piece.id === 'rack' && !facing) setMessage('Choose which way the rack’s front faces, then click a dashed outline in row A.');
    else setMessage(`Now click a dashed outline in the hall to place the ${piece.name.toLowerCase()}.`);
  };

  const problems = phase === 'build' ? faultKinds(hall).map(kind => ({ kind, sentence: faultSentence(kind, hall), facts: factsFor(kind) })) : [];
  useFactMarks(done ? problems.flatMap(p => p.facts) : [], problems.flatMap(p => p.facts));
  const working = done && problems.length === 0;

  return (
    <div className="build">
      <HallScene
        art={art}
        state={hall}
        onChange={phase === 'build' ? change : undefined}
        explain={explain}
        built={placed}
        slots={visibleSlots}
        armed={armedSlots}
        slotLabel={slotLabel}
        onSlot={place}
        readout={phase === 'build' && !done ? `${placed.length} of ${TOTAL} parts placed` : undefined}
        fig="Build"
        title={phase === 'intro' ? 'A working hall' : done ? (working ? 'Built and working' : 'Built, with problems') : 'Rebuild the hall'}
        caption={phase === 'intro'
          ? 'This hall works: cool air in at the rack fronts, hot air back to the cooling unit. Knock it apart and build it again yourself.'
          : 'Pick a part from the bin, then click its dashed outline in the hall. Click a placed part to zoom in or change it. Example readings.'}
      />

      {phase === 'intro' ? (
        <div className="build-start">
          <button type="button" className="ui-button ui-button--paper" onClick={start}>KNOCK IT APART AND BUILD IT</button>
          <span className="ui-small">{TOTAL} parts. Each one has a right place and a right way round.</span>
        </div>
      ) : (
        <>
          <p className="build-message" aria-live="polite">{message}</p>
          {!done && <section className="build-bin" aria-label="Parts bin">
            <h3 className="ui-label">PARTS BIN</h3>
            <ul className="iso hall build-bin-list">
              {PIECES.map((piece, i) => {
                const left = remaining(piece);
                const wait = waitingFor(piece);
                const on = armed === piece.id;
                return (
                  <li key={piece.id} className={`bin-card${on ? ' is-on' : ''}${left === 0 ? ' is-empty' : ''}`} style={{ '--tilt': `${[-2.5, 1.8, -1.2, 2.4, -1.8, 1.2, -2.2][i]}deg` } as React.CSSProperties}>
                    <button type="button" className="bin-pick" aria-pressed={on} disabled={left === 0 || Boolean(wait)} onClick={() => pick(piece)}>
                      <PieceIcon id={piece.id} />
                      <span className="bin-name">{piece.name}{left > 1 ? <em> ×{left}</em> : null}</span>
                      <span className="bin-note">{left === 0 ? 'All placed' : wait ?? piece.note}</span>
                    </button>
                    {piece.id === 'rack' && on && (
                      <span className="bin-facing" role="group" aria-label="Which way the rack’s front faces">
                        <span className="ui-small">Front faces</span>
                        {(['cold', 'hot'] as const).map(side => (
                          <button key={side} type="button" className={`game-chip${facing === side ? ' is-on' : ''}`} aria-pressed={facing === side}
                            onClick={() => { setFacing(side); setMessage('Now click a dashed outline in row A.'); }}>
                            {side === 'cold' ? 'COLD AISLE' : 'HOT AISLE'}
                          </button>
                        ))}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>}

          <section className={`scene-status ${working ? 'is-ok' : problems.length ? 'is-broken' : ''}`} aria-live="polite">
            <h3 className="ui-label">{working ? 'THE HALL WORKS' : problems.length ? 'WHAT’S WRONG NOW' : done ? 'BUILT' : 'BUILDING'}</h3>
            {working ? (
              <p>Every rack faces the cold aisle, the gap is covered, the tile feeds the rack fronts and the aisle is closed. Every inlet reads inside the recommended range (example readings).</p>
            ) : problems.length ? (
              <ul>
                {problems.map(p => (
                  <li key={p.kind}>
                    <span className="scene-status-what">{p.sentence}</span>
                    <span className="scene-status-fact">Click it in the hall to zoom in and fix it.</span>
                    {p.facts.length ? (
                      <span className="scene-status-fact">
                        Goes against <FactChips facts={p.facts} />{p.facts.length === 1 && textOf(p.facts[0]) ? <> “{textOf(p.facts[0])}”</> : null}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{placed.length} of {TOTAL} parts placed. Nothing is wrong so far.</p>
            )}
            {done && <div className="game-actions"><button type="button" className="ui-button ui-button--outline" onClick={start}>BUILD IT AGAIN</button></div>}
          </section>
        </>
      )}
    </div>
  );
}
