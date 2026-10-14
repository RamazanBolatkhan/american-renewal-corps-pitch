'use client';

import * as React from 'react';
import { healthyHall, RACKS, reversedRacks, type HallState } from './model';
import { HallScene } from './live';

/** Preview with a switch for every state the lessons can set. */
export const allFaults: HallState = { doorFar: 'open', doorNear: 'open', reversed: 2, missingBlank: 1, tile: 'hot' };

export function HallDemo({ art, initial = healthyHall }: { art: React.ReactNode; initial?: HallState }) {
  const [state, setState] = React.useState<HallState>(initial);
  const set = (patch: Partial<HallState>) => setState(s => ({ ...s, ...patch }));
  const rackOptions = (value: number | null, pick: (v: number | null) => void, label: string) => (
    <label className="hall-control">{label}
      <select value={value ?? ''} onChange={e => pick(e.target.value === '' ? null : Number(e.target.value))}>
        <option value="">None</option>
        {Array.from({ length: RACKS }, (_, i) => <option key={i} value={i}>Rack A{i + 1}</option>)}
      </select>
    </label>
  );
  return (
    <div className="hall-demo">
      <HallScene art={art} state={state} onChange={setState} caption="Click a door, rack, blanking panel or the loose floor tile to change it. Illustrative model: temperatures are example readings that follow the brief’s rules, not measurements." />
      <div className="hall-controls" role="group" aria-label="Scene state">
        <label className="hall-control"><input type="checkbox" checked={state.doorFar === 'open'} onChange={e => set({ doorFar: e.target.checked ? 'open' : 'closed' })} /> Far door open</label>
        <label className="hall-control"><input type="checkbox" checked={state.doorNear === 'open'} onChange={e => set({ doorNear: e.target.checked ? 'open' : 'closed' })} /> Near door open</label>
        {rackOptions(reversedRacks(state)[0] ?? null, v => set({ reversed: v }), 'Rack facing the wrong way')}
        {rackOptions(state.missingBlank, v => set({ missingBlank: v }), 'Missing blanking panel')}
        <label className="hall-control"><input type="checkbox" checked={state.tile === 'hot'} onChange={e => set({ tile: e.target.checked ? 'hot' : 'cold' })} /> Perforated tile in hot aisle</label>
        <button type="button" className="ui-button ui-button--outline" onClick={() => setState(healthyHall)}>RESET</button>
      </div>
    </div>
  );
}
