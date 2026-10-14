import * as React from 'react';
import * as k from '@/components/iso/iso-kit';
import { Dots, Line, Solid } from '@/components/iso/react/draw';
import { RACKS } from './model';
import {
  AISLE, at, CRAH, CRAH_H, CUT_Z, DOOR_T, DOOR_X, FLOOR, FLOOR_T, HEADER_Z, P, PLENUM, RACK_D, RACK_H, RACK_W, ROW_A, ROW_B, ROW_LEN, ROW_X, TILE, TILE_HOME, TILE_HOT,
} from './view';

type Point3 = k.Point3;
type Item = { key: number; node: React.ReactNode };

/**
 * Static art for the data hall, built once on the server. Every state variant is drawn in its
 * painter's slot and tagged with `data-when`; the live component shows or hides variants and
 * slides the door leaves.
 *
 * For the build game, every buildable piece carries `data-piece` (shown once all listed pieces are
 * placed) and has a dashed ghost in its painter's slot tagged `data-slot`. Fault airflow carries
 * `data-explains` with the part it explains, so a zoom on that part can emphasise it.
 */

const depth = (p: Point3) => k.depthOf(p, P);
const path3 = (points: Point3[], closed = false) => k.pathOf(points.map(at), closed);
const facePoly = (x0: number, x1: number, y: number, z0: number, z1: number) => path3([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
const plan = (x: number, y: number, w: number, d: number, r = 0.4): k.Plan => ({ x, y, w, d, r });

/** A dashed ghost of a piece that has not been placed yet: the build game's drop target. */
function Ghost({ slot, paths }: { slot: string; paths: k.SolidPaths }) {
  return (
    <g data-slot={slot} className="hall-ghost">
      <path className="hall-hit" d={paths.fill} />
      <path className="hall-ghost-line" d={paths.outline} />
    </g>
  );
}

/* ------------------------------------------------------------------ floor ------------------------------------------------------------------ */

function Floor() {
  const SUB_Z = -(PLENUM + FLOOR_T + 3);
  const subfloor = k.slabOf(FLOOR, SUB_Z, 3, P, 2, 0.6);
  const slab = k.slabOf(FLOOR, -FLOOR_T, FLOOR_T, P, 2, 0.8);
  // Pedestals are only seen along the two near edges of the raised floor.
  const pedestals: Point3[] = [];
  for (let x = FLOOR.x + 10; x <= FLOOR.x + FLOOR.w - 6; x += TILE) pedestals.push([x, FLOOR.y + FLOOR.d - 6, 0]);
  for (let y = FLOOR.y + 10; y < FLOOR.y + FLOOR.d - 12; y += TILE) pedestals.push([FLOOR.x + FLOOR.w - 6, y, 0]);
  pedestals.sort((a, b) => depth(a) - depth(b));

  // Tile seams run edge to edge across the floor top.
  const seams: string[] = [];
  for (let x = ROW_X - 2 * TILE; x < FLOOR.x + FLOOR.w; x += TILE) if (x > FLOOR.x) seams.push(k.lineOnTop([x, FLOOR.y], [x, FLOOR.y + FLOOR.d], 0, P));
  for (let y = AISLE.y0 - 3 * TILE; y < FLOOR.y + FLOOR.d; y += TILE) if (y > FLOOR.y) seams.push(k.lineOnTop([FLOOR.x, y], [FLOOR.x + FLOOR.w, y], 0, P));

  return (
    <g key="floor">
      <path className="iso-halo" d={k.haloOf(FLOOR, SUB_Z, 3, P)} />
      <Solid paths={subfloor} tone="lo" />
      {pedestals.map(([x, y], i) => (
        <g key={i}>
          <Solid paths={k.cylinder(x, y, 2.6, SUB_Z + 3, 1, P, 16)} tone="lo" />
          <Solid paths={k.cylinder(x, y, 1.2, SUB_Z + 4, PLENUM - 1, P, 12)} tone="mid" crease="none" />
        </g>
      ))}
      <Solid paths={slab} tone="mid" inner={<Line d={k.sideSeam(FLOOR, -FLOOR_T / 2, P, 2)} tone="faint" />} />
      {seams.map((d, i) => <Line key={i} d={d} tone="faint" />)}
      <Line d={k.planOutline(k.insetPlan(FLOOR, 3), 0, P, 2)} tone="faint" />
    </g>
  );
}

/** A perforated floor tile: an inset outline and a grid of holes on the floor top. */
function PerfTile({ tile, when, part = 'perf-tile' }: { tile: k.Plan; when?: string; part?: string }) {
  const inner = k.insetPlan(tile, 2.4);
  const dots = k.dotGrid(inner.x + 1.6, inner.y + 1.6, 8, 8, (inner.w - 3.2) / 7, 0.05, P);
  return (
    <g data-when={when} data-part={part}>
      {/* An invisible hit area over the whole tile, so it is easy to point at. */}
      <path className="hall-hit" d={k.planOutline(tile, 0.05, P, 2)} />
      <Line d={k.planOutline(inner, 0.05, P, 2)} tone="lo" />
      <Dots points={dots} size={0.42} tone="mid" />
    </g>
  );
}

/* ------------------------------------------------------------------ cooling unit ------------------------------------------------------------------ */

function CoolingUnit() {
  const body = k.slabOf(CRAH, 0, CRAH_H, P, 2, 0.8);
  const x1 = CRAH.x + CRAH.w;
  const y1 = CRAH.y + CRAH.d;
  // Supply louvres on the +x face, a return grille on top, a display and a label plate.
  const louvres: string[] = [];
  for (let z = 10; z <= 46; z += 4) louvres.push(path3([[x1, CRAH.y + 4, z], [x1, y1 - 4, z]]));
  const grille = k.insetPlan(CRAH, 4);
  const plinth = k.slabOf(k.insetPlan(CRAH, -1.5), 0, 4, P, 2, 0.4);
  const panel = { y0: CRAH.y + 6, y1: CRAH.y + 18, z0: 62, z1: 74 };
  return (
    <g key="crah" data-part="cooling-unit" data-piece="cooling-unit">
      <path className="iso-halo" d={k.haloOf(CRAH, 0, CRAH_H, P)} />
      <Solid paths={plinth} tone="lo" />
      <Solid paths={body} tone="mid" inner={<Line d={k.sideSeam(CRAH, 52, P, 2)} tone="faint" />} />
      <Line d={path3([[x1, CRAH.y + 3, 6], [x1, y1 - 3, 6], [x1, y1 - 3, 50], [x1, CRAH.y + 3, 50]], true)} tone="lo" />
      {louvres.map((d, i) => <Line key={i} d={d} tone="lo" />)}
      <Line d={k.planOutline(grille, CRAH_H, P, 2)} tone="lo" />
      <Dots points={k.dotGrid(grille.x + 2, grille.y + 2, 9, 6, (grille.w - 4) / 8, CRAH_H, P)} size={0.4} tone="lo" />
      <Line d={path3([[x1, panel.y0, panel.z0], [x1, panel.y1, panel.z0], [x1, panel.y1, panel.z1], [x1, panel.y0, panel.z1]], true)} tone="mid" />
      <Line d={path3([[x1, panel.y0, panel.z1 - 3], [x1, panel.y1, panel.z1 - 3]])} tone="faint" />
      <Dots points={[at([x1, panel.y1 - 2, panel.z0 + 2.5]), at([x1, panel.y1 - 5, panel.z0 + 2.5])]} size={0.55} tone="hi" />
      <Line d={path3([[x1, y1 - 12, 80], [x1, y1 - 4, 80], [x1, y1 - 4, 86], [x1, y1 - 12, 86]], true)} tone="lo" />
      {[82, 84].map(z => <Line key={z} d={path3([[x1, y1 - 11, z], [x1, y1 - 6 - (z - 82), z]])} tone="faint" free />)}
    </g>
  );
}

/* ------------------------------------------------------------------ racks ------------------------------------------------------------------ */

/** Server heights from the bottom up for each row-A rack; 0 marks the slot that has a blanking panel. */
const STACK = [6, 6, 4, 4, 0, 6, 4, 4, 6, 4, 6, 4, 4];
const BLANK_H = 4;

function serverSlots() {
  const slots: { z: number; h: number; blank: boolean }[] = [];
  let z = 6;
  for (const h of STACK) {
    const height = h || BLANK_H;
    slots.push({ z, h: height - 0.6, blank: h === 0 });
    z += height;
  }
  return slots;
}

/** Row-A rack seen from the cold aisle: servers, a blanking panel slot, an inlet sensor with a display. */
function RackA({ index }: { index: number }) {
  const x = ROW_X + index * RACK_W;
  const y = AISLE.y0; // front face plane, facing +y
  const body = k.slabOf(plan(x, ROW_A.y, RACK_W, RACK_D, 0.4), 0, RACK_H, P, 2, 0.5);
  const top = k.insetPlan(plan(x, ROW_A.y, RACK_W, RACK_D), 3);
  const slots = serverSlots();
  const front = (
    <g data-when={`reversed!=${index}`}>
      {/* Mounting rails and the front frame */}
      <Line d={facePoly(x + 1.4, x + RACK_W - 1.4, y, 3, RACK_H - 3)} tone="lo" />
      {slots.map((s, i) =>
        s.blank ? (
          <g key={i} data-part={`blank-a${index}`}>
            <g data-when={`missingBlank!=${index}`}>
              <Solid paths={k.slabOf(plan(x + 2, y, RACK_W - 4, 0.8, 0.2), s.z, s.h, P, 2)} tone="lo" crease="none" />
              <Dots points={[at([x + 3.4, y + 0.8, s.z + s.h / 2]), at([x + RACK_W - 3.4, y + 0.8, s.z + s.h / 2])]} size={0.45} tone="mid" />
            </g>
            <g data-when={`missingBlank=${index}`} data-fault="gap">
              <path className="hall-void" d={facePoly(x + 2, x + RACK_W - 2, y + 0.05, s.z, s.z + s.h)} />
              <Line d={facePoly(x + 2, x + RACK_W - 2, y + 0.05, s.z, s.z + s.h)} tone="lit" />
              <Ghost slot={`blank-a${index}`} paths={k.slabOf(plan(x + 2, y, RACK_W - 4, 0.8, 0.2), s.z, s.h, P, 2)} />
            </g>
          </g>
        ) : (
          <g key={i}>
            <Solid paths={k.slabOf(plan(x + 2, y, RACK_W - 4, 1.6, 0.3), s.z, s.h, P, 2, 0.3)} tone="hi" crease="lo" />
            <Dots points={k.pointsAt([[x + RACK_W - 4, y + 1.6, s.z + s.h / 2], [x + RACK_W - 5.6, y + 1.6, s.z + s.h / 2]], P)} size={0.42} tone="hi" pulse={i % 3 === 0} />
            <Line d={path3([[x + 4, y + 1.6, s.z + s.h / 2], [x + RACK_W - 8, y + 1.6, s.z + s.h / 2]])} tone="faint" free />
          </g>
        ),
      )}
      {/* Inlet sensor clipped to the front frame, with a small display */}
      <Solid paths={k.slabOf(plan(x + RACK_W - 11, y, 10, 1.4, 0.3), 77.6, 5.6, P, 2, 0.2)} tone="mid" crease="lo" />
      <g transform={k.sideMatrix([x + RACK_W - 10.2, y + 1.45], 82.6, P, 'left')}>
        <clipPath id={`lcd-${index}`}><rect x={0} y={0.5} width={8.4} height={4.2} rx={0.4} /></clipPath>
        <rect className="hall-lcd-window" x={0} y={0.5} width={8.4} height={4.2} rx={0.4} />
        {/* Widest reading is "37.3°": about 7.4 units at this size, inside the 8.4 window. */}
        <text className="hall-lcd" data-inlet={index} x={4.2} y={3.7} fontSize={2.5} textAnchor="middle" clipPath={`url(#lcd-${index})`}>21.0°</text>
      </g>
    </g>
  );
  // The same rack installed the wrong way: its rear faces the cold aisle (fans and power supplies).
  const rear = (
    <g data-when={`reversed=${index}`} data-fault="reversed">
      <Line d={facePoly(x + 1.4, x + RACK_W - 1.4, y, 3, RACK_H - 3)} tone="lit" />
      {slots.filter(s => !s.blank).map((s, i) => (
        <g key={i}>
          <Solid paths={k.slabOf(plan(x + 2, y, RACK_W - 4, 1.2, 0.2), s.z, s.h, P, 2)} tone="mid" crease="lo" />
          {[x + 6, x + 12].map(cx => <path key={cx} className="hall-fan" d={k.sideRing([cx, y + 1.25, s.z + s.h / 2], Math.min(2, s.h / 2 - 0.4), 'y', P, 14)} />)}
          <Line d={path3([[x + 16, y + 1.2, s.z + 0.8], [x + 16, y + 1.2, s.z + s.h - 0.8]])} tone="lo" />
        </g>
      ))}
    </g>
  );
  return (
    <g data-part={`rack-a${index}`} data-piece={`rack-a${index}`}>
      <Solid paths={body} tone="mid" />
      <Line d={k.planOutline(top, RACK_H, P, 2)} tone="faint" />
      <Dots points={k.dotGrid(top.x + 2, top.y + 3, 5, 10, 3, RACK_H, P)} size={0.35} tone="lo" />
      {front}
      {rear}
    </g>
  );
}

/** Row-B rack. Rack B1 stands whole at the far end; the rest are cut away at CUT_Z to open the view. */
function RackB({ index }: { index: number }) {
  const x = ROW_X + index * RACK_W;
  const full = index === 0;
  const h = full ? RACK_H : CUT_Z;
  const body = k.slabOf(plan(x, ROW_B.y, RACK_W, RACK_D, 0.4), 0, h, P, 2, 0.5);
  const yBack = ROW_B.y + RACK_D;
  const rearSlots = serverSlots().filter(s => s.z + s.h <= h - 1);
  return (
    <g data-part={`rack-b${index}`} data-piece="rack-row-b">
      <Solid paths={body} tone="mid" />
      {/* Rear door perforations on the back (+y) face */}
      <Line d={facePoly(x + 1.4, x + RACK_W - 1.4, yBack, 2, h - 2)} tone="lo" />
      {rearSlots.map((s, i) => (
        <g key={i}>
          {[x + 6, x + 12].map(cx => <path key={cx} className="hall-fan" d={k.sideRing([cx, yBack, s.z + s.h / 2], Math.min(1.8, s.h / 2 - 0.5), 'y', P, 14)} />)}
        </g>
      ))}
      {!full && (
        <>
          {/* The cut: server sections and rails seen from above */}
          <Line d={k.planOutline(k.insetPlan(plan(x, ROW_B.y, RACK_W, RACK_D), 1.4), CUT_Z, P, 2)} tone="lo" />
          {[0, 1, 2, 3].map(j => <Line key={j} d={k.lineOnTop([x + 1.4, ROW_B.y + 6 + j * 8], [x + RACK_W - 1.4, ROW_B.y + 6 + j * 8], CUT_Z, P)} tone="faint" />)}
        </>
      )}
      {full && <Line d={k.planOutline(k.insetPlan(plan(x, ROW_B.y, RACK_W, RACK_D), 3), RACK_H, P, 2)} tone="faint" />}
    </g>
  );
}

/* ------------------------------------------------------------------ containment ------------------------------------------------------------------ */

function DoorFrame({ end }: { end: 'far' | 'near' }) {
  const x = DOOR_X[end] - 0.5;
  const posts = [AISLE.y0 - 3, AISLE.y1].map(y => k.slabOf(plan(x, y, 3, 3, 0.3), 0, HEADER_Z + 6, P, 2, 0.3));
  const header = k.slabOf(plan(x, AISLE.y0 - 3, 3, AISLE.y1 - AISLE.y0 + 6, 0.3), HEADER_Z, 6, P, 2, 0.3);
  return { posts, header, x };
}

/** One sliding leaf with a window and a pull; `side` is −1 for the leaf on the −y side. */
function Leaf({ end, side }: { end: 'far' | 'near'; side: -1 | 1 }) {
  const x = DOOR_X[end];
  const y0 = side < 0 ? AISLE.y0 : 0;
  const y1 = side < 0 ? 0 : AISLE.y1;
  const xf = x + DOOR_T; // the face toward +x
  const leaf = k.slabOf(plan(x, y0 + 0.3, DOOR_T, y1 - y0 - 0.6, 0.2), 1, HEADER_Z - 1.4, P, 2, 0.3);
  const win = [[y0 + 3, 40], [y1 - 3, 78]] as const;
  const pullY = side < 0 ? y1 - 3 : y0 + 3;
  return (
    <g data-leaf={`${end}:${side}`} data-part={`door-${end}`}>
      <Solid paths={leaf} tone="hi" crease="lo" />
      <Line d={path3([[xf, win[0][0], win[0][1]], [xf, win[1][0], win[0][1]], [xf, win[1][0], win[1][1]], [xf, win[0][0], win[1][1]]], true)} tone="lo" />
      <Line d={path3([[xf, win[0][0] + 1.2, win[0][1] + 1.2], [xf, win[1][0] - 1.2, win[0][1] + 1.2], [xf, win[1][0] - 1.2, win[1][1] - 1.2], [xf, win[0][0] + 1.2, win[1][1] - 1.2]], true)} tone="faint" />
      <Solid paths={k.slabOf(plan(xf, pullY - 0.6, 1.2, 1.2, 0.3), 30, 8, P, 2)} tone="mid" crease="none" />
    </g>
  );
}

/* ------------------------------------------------------------------ airflow ------------------------------------------------------------------ */

const curve = (a: Point3, b: Point3, c: Point3, steps = 12): Point3[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    return [0, 1, 2].map(j => u * u * a[j] + 2 * u * t * b[j] + t * t * c[j]) as Point3;
  });

/** Cool air rises from the perforated tiles and curves into the rack fronts of row A. */
function coolFlows() {
  const flows: [number, number, number][] = [
    [ROW_X + 2 * TILE + 12, AISLE.y0 + 12, 30], // tile in front of rack A3
    [ROW_X + TILE + 12, 12, 48], // centre tile, into rack A2
    [ROW_X + TILE + 12, AISLE.y0 + 12, 40], // the movable tile, while it is in the cold aisle
  ];
  return flows.map(([x, y, z], i) => {
    // End on the left end of a server's rule line, so the flow lands on a drawn part of the rack.
    const rackX = ROW_X + Math.floor(x / RACK_W) * RACK_W;
    const slot = serverSlots().filter(sl => !sl.blank).reduce((best, sl) => (Math.abs(sl.z + sl.h / 2 - z) < Math.abs(best.z + best.h / 2 - z) ? sl : best));
    const end: Point3 = [rackX + 4, AISLE.y0 + 1.6, slot.z + slot.h / 2];
    // Start on a perforation hole of the tile (PerfTile's 8 × 8 grid), so the flow rises from a drawn hole.
    const gap = (TILE - 4.8 - 3.2) / 7;
    const hole: Point3 = [x - TILE / 2 + 4 + gap * 4, y - TILE / 2 + 4 + gap * 4, 0.05];
    const pts = curve(hole, [hole[0], hole[1] - 2, end[2] + 16], end, 16);
    return { key: depth([x, y, 0]), d: path3(pts), id: `cool-${i}`, rack: Math.floor(x / RACK_W) };
  });
}

/** Hot exhaust leaves the back of row A and returns over the hot aisle to the cooling unit's top grille. */
function hotReturns() {
  return Array.from({ length: RACKS }, (_, i) => {
    const x = ROW_X + i * RACK_W + RACK_W / 2;
    const grille = k.insetPlan(CRAH, 4);
    const gap = (grille.w - 4) / 8;
    const hx = grille.x + 2 + gap * (2 + 2 * (i % 3));
    const hy = grille.y + 2 + gap * (2 + (i > 2 ? 1 : 0));
    const vent: Point3 = [ROW_X + i * RACK_W + 3 + 2 + 3 * 2, ROW_A.y + 3 + 3, RACK_H];
    const pts = curve(vent, [vent[0] - 10, ROW_A.y - 20, RACK_H + 26], [hx, hy, CRAH_H], 16);
    return { key: depth([x, ROW_A.y - 10, RACK_H]), d: path3(pts), id: `hot-${i}` };
  });
}

/** The whole doorway at one end of the aisle, for the build game's ghost. */
function doorway(end: 'far' | 'near') {
  return k.slabOf(plan(DOOR_X[end] - 0.5, AISLE.y0 - 3, 3, AISLE.y1 - AISLE.y0 + 6, 0.3), 0, HEADER_Z + 6, P, 2, 0.3);
}

/** Exhaust leaking through an open door: from the top vents of the end rack, round the row end, into the end rack's front. */
function doorLeak(end: 'far' | 'near') {
  const i = end === 'far' ? 0 : RACKS - 1;
  const out = end === 'far' ? -1 : 1;
  const vent: Point3 = [ROW_X + i * RACK_W + 3 + 2 + 3 * 2, ROW_A.y + 3 + 3, RACK_H];
  const door = end === 'far' ? DOOR_X.far - 8 : DOOR_X.near + DOOR_T + 8;
  const slot = serverSlots().filter(sl => !sl.blank).reduce((best, sl) => (Math.abs(sl.z + sl.h / 2 - 44) < Math.abs(best.z + best.h / 2 - 44) ? sl : best));
  const inlet: Point3 = [ROW_X + i * RACK_W + 4, AISLE.y0 + 1.6, slot.z + slot.h / 2];
  const turn: Point3 = [door, -2, 56];
  const first = curve(vent, [vent[0] + out * 6, ROW_A.y - 6, RACK_H + 18], turn, 12);
  const second = curve(turn, [inlet[0] + out * 2, 8, 50], inlet, 12);
  return path3([...first, ...second.slice(1)]);
}

/** Cold air from a tile in the hot aisle rises into the rear fans of the cut row next to it. */
function tileWaste() {
  const gap = (TILE - 4.8 - 3.2) / 7;
  const hole: Point3 = [TILE_HOT.x + 4 + gap * 3, TILE_HOT.y + 4 + gap * 3, 0.05];
  const slot = serverSlots().find(sl => sl.z + sl.h <= CUT_Z - 1)!;
  const r = Math.min(1.8, slot.h / 2 - 0.5);
  const rim: Point3 = [ROW_X + 2 * RACK_W + 12 + r, ROW_B.y + RACK_D, slot.z + slot.h / 2];
  return path3(curve(hole, [hole[0], hole[1] - 2, 22], rim, 14));
}

/* ------------------------------------------------------------------ assembly ------------------------------------------------------------------ */

export function HallArt() {
  const items: Item[] = [];
  const add = (key: number, node: React.ReactNode) => items.push({ key, node });

  add(depth([CRAH.x + CRAH.w / 2, CRAH.y + CRAH.d / 2, 0]), <CoolingUnit key="crah" />);
  add(depth([CRAH.x + CRAH.w / 2, CRAH.y + CRAH.d / 2, 0]) - 0.01, <Ghost key="crah-slot" slot="cooling-unit" paths={k.slabOf(CRAH, 0, CRAH_H, P, 2, 0.8)} />);
  hotReturns().forEach((r, i) => add(r.key, <g key={r.id} data-piece={`cooling-unit rack-a${i}`}><Line d={r.d} tone="red" flow /></g>));
  for (let i = 0; i < RACKS; i++) {
    const key = depth([ROW_X + i * RACK_W + RACK_W / 2, ROW_A.y + RACK_D / 2, 0]);
    add(key - 0.01, <Ghost key={`a${i}-slot`} slot={`rack-a${i}`} paths={k.slabOf(plan(ROW_X + i * RACK_W, ROW_A.y, RACK_W, RACK_D, 0.4), 0, RACK_H, P, 2, 0.5)} />);
    add(key, <RackA key={`a${i}`} index={i} />);
  }
  // The last cool flow rises from the movable tile, so it disappears when the tile is moved to the hot aisle.
  coolFlows().forEach((f, i, all) => {
    const last = i === all.length - 1;
    add(f.key + 20, (
      <g key={f.id} data-when={last ? 'tile=cold' : undefined} data-piece={`cooling-unit rack-a${f.rack}${last ? ' tile-movable' : ''}`} data-explains={last ? 'tile-movable' : undefined}>
        <Line d={f.d} tone="blue" flow />
      </g>
    ));
  });

  // Reversed rack exhaust: blown from its rear across the cold aisle onto the cut row opposite.
  for (let i = 0; i < RACKS; i++) {
    const x = ROW_X + i * RACK_W + RACK_W / 2;
    const fanSlot = serverSlots().filter(sl => !sl.blank).reduce((best, sl) => (Math.abs(sl.z + sl.h / 2 - 52) < Math.abs(best.z + best.h / 2 - 52) ? sl : best));
    const fanR = Math.min(2, fanSlot.h / 2 - 0.4);
    const fanRim: Point3 = [ROW_X + i * RACK_W + 12 + fanR, AISLE.y0 + 1.25, fanSlot.z + fanSlot.h / 2];
    const pts = curve(fanRim, [x, 0, 46], [x, AISLE.y1 + 2, i === 0 ? 40 : CUT_Z]);
    add(depth([x, 0, 30]) + 30, (
      <g key={`leak-${i}`} data-when={`reversed=${i}`} data-piece={`rack-a${i}`} data-explains={`rack-a${i}`}><Line d={path3(pts)} tone="red" flow /></g>
    ));
    // Missing blanking panel: exhaust curls back through the gap toward the floor in front of the rack.
    const gz = serverSlots().find(s => s.blank)!.z + 2;
    const back = curve([x, AISLE.y0 + 0.2, gz], [x + 4, AISLE.y0 + 12, gz + 2], [x + 5, 0, 0]);
    add(depth([x, AISLE.y0 + 6, gz]) + 30, (
      <g key={`gap-${i}`} data-when={`missingBlank=${i}`} data-piece={`rack-a${i}`} data-explains={`blank-a${i}`}><Line d={path3(back)} tone="red" flow /></g>
    ));
  }

  // Far door: frame and two leaves. The door stands at the far end of the aisle, so the end racks
  // of both rows are always nearer the viewer: it is drawn before either of them, open or closed.
  const far = DoorFrame({ end: 'far' });
  const beforeEnds = Math.min(depth([ROW_X + RACK_W / 2, ROW_A.y + RACK_D / 2, 0]), depth([ROW_X + RACK_W / 2, ROW_B.y + RACK_D / 2, 0])) - 1;
  add(beforeEnds - 0.5, <Ghost key="far-slot" slot="door-far" paths={doorway('far')} />);
  add(beforeEnds - 0.4, <g key="far-post-a" data-piece="door-far"><Solid paths={far.posts[0]} tone="mid" /></g>);
  add(beforeEnds - 0.3, <g key="far-leaf-a" data-piece="door-far"><Leaf end="far" side={-1} /></g>);
  add(beforeEnds - 0.2, <g key="far-leaf-b" data-piece="door-far"><Leaf end="far" side={1} /></g>);
  add(beforeEnds - 0.1, <g key="far-post-b" data-piece="door-far"><Solid paths={far.posts[1]} tone="mid" /></g>);

  add(depth([ROW_X + RACK_W / 2, ROW_B.y + RACK_D / 2, 0]) + 29.9, (
    <Ghost key="b-slot" slot="rack-row-b" paths={k.slabOf(plan(ROW_X, ROW_B.y, ROW_LEN, RACK_D, 0.4), 0, CUT_Z, P, 2, 0.5)} />
  ));
  for (let i = 0; i < RACKS; i++) add(depth([ROW_X + i * RACK_W + RACK_W / 2, ROW_B.y + RACK_D / 2, 0]) + 30, <RackB key={`b${i}`} index={i} />);

  const roof = k.slabOf(plan(DOOR_X.far - 0.5, AISLE.y0, RACK_W + 3.5, AISLE.y1 - AISLE.y0, 0.3), HEADER_Z + 6, 1.6, P, 2, 0.3);
  add(depth([10, 0, HEADER_Z]) + 199.9, <Ghost key="roof-slot" slot="roof" paths={roof} />);
  add(depth([10, 0, HEADER_Z]) + 200, (
    <g key="roof" data-part="roof" data-piece="roof">
      <Solid paths={far.header} tone="mid" />
      <Solid paths={roof} tone="lo" />
      <Line d={k.planOutline(k.insetPlan(plan(DOOR_X.far - 0.5, AISLE.y0, RACK_W + 3.5, AISLE.y1 - AISLE.y0), 2.4), HEADER_Z + 7.6, P, 2)} tone="faint" />
    </g>
  ));

  // Near door at the open end of the aisle.
  const near = DoorFrame({ end: 'near' });
  add(depth([near.x, AISLE.y0, 0]) + 239.9, <Ghost key="near-slot" slot="door-near" paths={doorway('near')} />);
  add(depth([near.x, AISLE.y0, 0]) + 240, <g key="near-post-a" data-piece="door-near"><Solid paths={near.posts[0]} tone="mid" /></g>);
  add(depth([DOOR_X.near, -12, 40]) + 240, <g key="near-leaf-a" data-piece="door-near"><Leaf end="near" side={-1} /></g>);
  add(depth([DOOR_X.near, 12, 40]) + 240, <g key="near-leaf-b" data-piece="door-near"><Leaf end="near" side={1} /></g>);
  add(depth([near.x, AISLE.y1, 0]) + 240, <g key="near-post-b" data-piece="door-near"><Solid paths={near.posts[1]} tone="mid" /></g>);
  add(depth([near.x, 0, HEADER_Z]) + 250, <g key="near-header" data-piece="door-near"><Solid paths={near.header} tone="mid" /></g>);

  // Open doors: hot exhaust from the hot aisle curls round the end of the rows and into the cold aisle.
  for (const end of ['far', 'near'] as const) {
    const flow = doorLeak(end);
    add(depth([DOOR_X[end], 0, 40]) + 260, (
      <g key={`door-leak-${end}`} data-when={end === 'far' ? 'doorFar=open' : 'doorNear=open'} data-piece={`door-${end}`} data-explains={`door-${end}`}>
        <Line d={flow} tone="red" flow />
      </g>
    ));
  }
  // A perforated tile in the hot aisle: its cold air rises straight into the exhaust behind row B.
  add(depth([TILE_HOT.x + TILE / 2, TILE_HOT.y + TILE / 2, 0]) + 40, (
    <g key="tile-waste" data-when="tile=hot" data-piece="tile-movable" data-explains="tile-movable"><Line d={tileWaste()} tone="blue" flow /></g>
  ));

  items.sort((a, b) => a.key - b.key);

  return (
    <>
      <defs>
        {/* Arrowheads for the airflow a zoomed-in explanation is about. */}
        {(['red', 'blue'] as const).map(tone => (
          <marker key={tone} id={`hall-arrow-${tone}`} className="hall-arrow" data-tone={tone} viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse">
            <path d="M0 0.4 6 3 0 5.6Z" />
          </marker>
        ))}
      </defs>
      <Floor />
      <PerfTile tile={plan(ROW_X, AISLE.y0, TILE, TILE)} />
      <PerfTile tile={plan(ROW_X + 2 * TILE, AISLE.y0, TILE, TILE)} />
      <PerfTile tile={plan(ROW_X + TILE, 0, TILE, TILE)} />
      <Ghost slot="tile-cold" paths={k.slabOf(k.insetPlan(TILE_HOME, 0.6), 0, 0.05, P, 2)} />
      <Ghost slot="tile-hot" paths={k.slabOf(k.insetPlan(TILE_HOT, 0.6), 0, 0.05, P, 2)} />
      <g data-piece="tile-movable"><PerfTile tile={TILE_HOME} when="tile=cold" part="tile-movable" /></g>
      <g data-when="tile=hot" data-fault="tile" data-part="tile-movable" data-piece="tile-movable">
        <PerfTile tile={TILE_HOT} part="tile-movable" />
        <Line d={k.planOutline(k.insetPlan(TILE_HOT, 0.6), 0.05, P, 2)} tone="lit" />
      </g>
      {items.map((item, i) => <React.Fragment key={i}>{item.node}</React.Fragment>)}
    </>
  );
}

export const ROW_LENGTH = ROW_LEN;
