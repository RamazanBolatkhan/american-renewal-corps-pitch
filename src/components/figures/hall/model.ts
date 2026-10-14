/**
 * The data hall's state and an illustrative inlet-temperature model.
 *
 * The brief gives the rules (which way air should flow, what breaks containment, the 18–27 °C
 * recommended inlet range); it gives no thermal model. These numbers are a simple, clearly
 * labelled illustration of those rules, not measurements.
 */

export const RACKS = 4; // per row
export const RANGE = { min: 18, max: 27 } as const;

export type HallState = {
  /** Containment doors at the far (x = 0) and near (x = max) end of the cold aisle. */
  doorFar: 'closed' | 'open';
  doorNear: 'closed' | 'open';
  /** Index (or indexes, in the build game) in row A of racks installed facing the wrong way, or null. */
  reversed: number | number[] | null;
  /** Index in row A of a rack with an empty space and no blanking panel, or null. */
  missingBlank: number | null;
  /** Where the movable perforated tile sits. */
  tile: 'cold' | 'hot';
};

export const healthyHall: HallState = { doorFar: 'closed', doorNear: 'closed', reversed: null, missingBlank: null, tile: 'cold' };

/** Every row-A rack installed facing the wrong way. */
export const reversedRacks = (state: Pick<HallState, 'reversed'>): number[] =>
  state.reversed === null || state.reversed === undefined ? [] : Array.isArray(state.reversed) ? state.reversed : [state.reversed];

const BASE = 21; // °C at every inlet when nothing is wrong (example value)

/** Example inlet temperature at the front of each row-A rack, in °C. */
export function inletTemps(state: HallState): number[] {
  return Array.from({ length: RACKS }, (_, i) => {
    let t = BASE + (i % 2 ? 0.6 : 0); // small natural spread along the row
    if (state.doorFar === 'open') t += [5.5, 3.5, 1.5, 0.5][i]; // hot exhaust leaks in nearest the open door
    if (state.doorNear === 'open') t += [0.5, 1.5, 3.5, 5.5][i];
    for (const r of reversedRacks(state)) t += Math.max(0, 6.5 - 2.5 * Math.abs(i - r)); // exhaust blown into the cold aisle
    if (state.missingBlank === i) t += 7; // exhaust flows back through the gap to this rack's front
    if (state.tile === 'hot') t += 1.2; // less cold air reaches the rack fronts
    return Math.round(t * 10) / 10;
  });
}

export const inRange = (t: number) => t >= RANGE.min && t <= RANGE.max;

export function readoutOf(state: HallState) {
  const temps = inletTemps(state);
  const out = temps.filter(t => !inRange(t)).length;
  const lo = Math.min(...temps).toFixed(1);
  const hi = Math.max(...temps).toFixed(1);
  return `inlets ${lo}–${hi} °C · ${out === 0 ? 'all in range' : `${out} out of range`}`;
}

/** Plain-language list of what is wrong, for the aria label and the caption. */
export function faultsOf(state: HallState): string[] {
  const faults: string[] = [];
  if (state.doorFar === 'open') faults.push('the far containment door is open');
  if (state.doorNear === 'open') faults.push('the near containment door is open');
  for (const r of reversedRacks(state)) faults.push(`rack A${r + 1} faces the wrong way`);
  if (state.missingBlank !== null) faults.push(`rack A${state.missingBlank + 1} has an empty space with no blanking panel`);
  if (state.tile === 'hot') faults.push('a perforated tile sits in the hot aisle');
  return faults;
}

/* ---------- Direct interaction: what each part is, and what clicking it changes ---------- */

export type PartInfo = { name: string; does: string; action?: string };

/** Plain-language description of a part, tied to the brief's facts. */
export function partInfo(part: string, state: HallState): PartInfo | null {
  const rack = part.match(/^rack-([ab])(\d)$/);
  if (rack) {
    const n = Number(rack[2]);
    if (rack[1] === 'b') return { name: `Rack B${n + 1}`, does: 'Faces the cold aisle from the other side; cut away so you can see in.' };
    const wrong = reversedRacks(state).includes(n);
    return {
      name: `Rack A${n + 1}`,
      does: wrong ? 'Facing the wrong way: it blows hot exhaust into the cold aisle.' : 'Draws cool air in at the front and pushes hot air out the back.',
      action: wrong ? 'Click to turn it the right way' : 'Click to turn it around',
    };
  }
  const blank = part.match(/^blank-a(\d)$/);
  if (blank) {
    const missing = state.missingBlank === Number(blank[1]);
    return {
      name: missing ? 'Empty rack space' : 'Blanking panel',
      does: missing ? 'Exhaust flows back through the gap to the rack front.' : 'Covers an empty space so exhaust cannot flow back to the front.',
      action: missing ? 'Click to fit the panel' : 'Click to remove it',
    };
  }
  if (part === 'door-far' || part === 'door-near') {
    const open = (part === 'door-far' ? state.doorFar : state.doorNear) === 'open';
    return {
      name: `${part === 'door-far' ? 'Far' : 'Near'} containment door`,
      does: open ? 'Open: hot exhaust leaks into the cold aisle.' : 'Closed: keeps hot and cold air apart.',
      action: open ? 'Click to close it' : 'Click to open it',
    };
  }
  if (part === 'tile-movable') {
    const hot = state.tile === 'hot';
    return {
      name: 'Perforated floor tile',
      does: hot ? 'In the hot aisle: its cold air is wasted.' : 'In the cold aisle: delivers cold air to the rack fronts.',
      action: hot ? 'Click to move it back to the cold aisle' : 'Click to move it to the hot aisle',
    };
  }
  if (part === 'perf-tile') return { name: 'Perforated floor tile', does: 'Delivers cold air from under the floor to the rack fronts.' };
  if (part === 'cooling-unit') return { name: 'Cooling unit', does: 'Takes in the hot return air at the top and supplies cold air under the floor.' };
  if (part === 'roof') return { name: 'Containment roof panel', does: 'Closes the top of the cold aisle so hot and cold air cannot mix.' };
  return null;
}

/** The state after clicking a part, or null when the part only explains itself. */
export function toggled(part: string, state: HallState): HallState | null {
  const rack = part.match(/^rack-a(\d)$/);
  if (rack) {
    const n = Number(rack[1]);
    const now = reversedRacks(state);
    const next = now.includes(n) ? now.filter(r => r !== n) : [...now, n].sort();
    return { ...state, reversed: next.length === 0 ? null : next.length === 1 ? next[0] : next };
  }
  const blank = part.match(/^blank-a(\d)$/);
  if (blank) {
    const n = Number(blank[1]);
    return { ...state, missingBlank: state.missingBlank === n ? null : n };
  }
  if (part === 'door-far') return { ...state, doorFar: state.doorFar === 'open' ? 'closed' : 'open' };
  if (part === 'door-near') return { ...state, doorNear: state.doorNear === 'open' ? 'closed' : 'open' };
  if (part === 'tile-movable') return { ...state, tile: state.tile === 'hot' ? 'cold' : 'hot' };
  return null;
}

/* ---------- Linking scene problems to the brief's facts ---------- */

/** Kinds of problem the scene can show. Both doors count as one kind: an open containment door. */
export type FaultKind = 'door' | 'reversed' | 'missingBlank' | 'tile';

export function faultKinds(state: Partial<HallState>): FaultKind[] {
  const kinds: FaultKind[] = [];
  if (state.doorFar === 'open' || state.doorNear === 'open') kinds.push('door');
  if (reversedRacks({ reversed: state.reversed ?? null }).length) kinds.push('reversed');
  if (state.missingBlank !== undefined && state.missingBlank !== null) kinds.push('missingBlank');
  if (state.tile === 'hot') kinds.push('tile');
  return kinds;
}

/** Which kind of problem a part can cause, for highlighting facts on hover. */
export function partKind(part: string): FaultKind | null {
  if (part.startsWith('door-')) return 'door';
  if (/^rack-a\d$/.test(part)) return 'reversed';
  if (part.startsWith('blank-')) return 'missingBlank';
  if (part === 'tile-movable' || part === 'perf-tile') return 'tile';
  return null;
}

/** What is wrong, in plain words, for the current state. */
export function faultSentence(kind: FaultKind, state: HallState): string {
  if (kind === 'door') {
    const ends = [state.doorFar === 'open' && 'far', state.doorNear === 'open' && 'near'].filter(Boolean);
    return `The ${ends.join(' and ')} containment door${ends.length > 1 ? 's are' : ' is'} open.`;
  }
  if (kind === 'reversed') {
    const racks = reversedRacks(state).map(r => `A${r + 1}`);
    return `Rack${racks.length > 1 ? 's' : ''} ${racks.join(' and ')} face${racks.length > 1 ? '' : 's'} the wrong way.`;
  }
  if (kind === 'missingBlank') return `Rack A${(state.missingBlank ?? 0) + 1} has an empty space with no blanking panel.`;
  return 'A perforated floor tile sits in the hot aisle.';
}

/* ---------- Zoomed-in explanations ---------- */

export type Explanation = { name: string; title: string; body: string; fault: boolean };

const reading = (t: number) => `Example inlet reading ${t.toFixed(1)} °C${inRange(t) ? ', inside' : ', above'} the ${RANGE.min}–${RANGE.max} °C recommended range.`;

/** What a part is doing right now, in a sentence a student can act on. Faults say what goes wrong. */
export function explainPart(part: string, state: HallState): Explanation | null {
  const info = partInfo(part, state);
  if (!info) return null;
  const temps = inletTemps(state);
  const rack = part.match(/^rack-a(\d)$/);
  if (rack) {
    const n = Number(rack[1]);
    return reversedRacks(state).includes(n)
      ? { name: info.name, fault: true, title: `Rack A${n + 1} is installed facing the wrong way`, body: `Its back faces the cold aisle, so it blows hot exhaust into the cold aisle. ${reading(temps[n])}` }
      : { name: info.name, fault: false, title: `Rack A${n + 1} faces the right way`, body: `${info.does} ${reading(temps[n])}` };
  }
  const blank = part.match(/^blank-a(\d)$/);
  if (blank && state.missingBlank === Number(blank[1])) {
    const n = Number(blank[1]);
    return { name: info.name, fault: true, title: `Rack A${n + 1} has an empty space with no blanking panel`, body: `Hot exhaust flows back through the gap to the rack front. ${reading(temps[n])}` };
  }
  if (part === 'door-far' || part === 'door-near') {
    const far = part === 'door-far';
    if ((far ? state.doorFar : state.doorNear) === 'open') {
      const n = far ? 0 : RACKS - 1;
      return { name: info.name, fault: true, title: `The ${far ? 'far' : 'near'} containment door is open`, body: `Hot exhaust leaks into the cold aisle at this end. At rack A${n + 1}: ${reading(temps[n]).replace(/^E/, 'e')}` };
    }
  }
  if (part === 'tile-movable' && state.tile === 'hot') {
    return { name: info.name, fault: true, title: 'A perforated tile sits in the hot aisle', body: 'Its cold air is wasted in the hot aisle instead of reaching the rack fronts.' };
  }
  return { name: info.name, fault: false, title: info.name, body: info.does };
}

/** One explanation for several parts of the same kind (both doors, two reversed racks). */
export function explainParts(parts: string[], state: HallState): Explanation | null {
  const each = parts.map(p => explainPart(p, state)).filter((e): e is Explanation => e !== null);
  if (each.length <= 1) return each[0] ?? null;
  const kind = partKind(parts[0]);
  const faults = each.filter(e => e.fault);
  if (!kind || faults.length < 2 || !parts.every(p => partKind(p) === kind)) return each[0];
  const temps = inletTemps(state);
  const worst = temps.indexOf(Math.max(...temps));
  const what = kind === 'door' ? 'Hot exhaust leaks into the cold aisle at both ends.' : 'Each one blows hot exhaust into the cold aisle.';
  return {
    name: kind === 'door' ? 'Both containment doors' : faults.map(f => f.name).join(' and '),
    fault: true,
    title: faultSentence(kind, state).replace(/\.$/, ''),
    body: `${what} Highest at rack A${worst + 1}: ${reading(temps[worst]).replace(/^E/, 'e')}`,
  };
}

/** The parts that show a kind of problem, for zooming in on it. */
export function faultParts(kind: FaultKind, state: HallState): string[] {
  if (kind === 'door') return [state.doorFar === 'open' && 'door-far', state.doorNear === 'open' && 'door-near'].filter(Boolean) as string[];
  if (kind === 'reversed') return reversedRacks(state).map(r => `rack-a${r}`);
  if (kind === 'missingBlank') return state.missingBlank === null ? [] : [`blank-a${state.missingBlank}`];
  return ['tile-movable'];
}
