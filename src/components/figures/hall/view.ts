import { fitProjection, iso, type Flat, type Plan, type Point3, type Projection } from '@/components/iso/iso-kit';
import { RACKS } from './model';

/** World layout in units of about 1 px; x runs along the rows, y across them, z up. */
export const WIDTH = 640;
export const HEIGHT = 420;
export const AZIMUTH = 52;
export const ELEVATION = 38;

export const RACK_W = 24; // x
export const RACK_D = 40; // y
export const RACK_H = 84; // z
export const ROW_X = 0;
export const ROW_LEN = RACKS * RACK_W;

/** Row A (far) fronts face +y across the cold aisle; row B (near) fronts face −y. */
export const AISLE = { y0: -24, y1: 24 } as const;
export const ROW_A: Plan = { x: ROW_X, y: AISLE.y0 - RACK_D, w: ROW_LEN, d: RACK_D, r: 0.6 };
export const ROW_B: Plan = { x: ROW_X, y: AISLE.y1, w: ROW_LEN, d: RACK_D, r: 0.6 };
/** The near row is cut away at this height so the aisle can be seen. */
export const CUT_Z = 18;

export const FLOOR_T = 6; // raised-floor tile thickness
export const PLENUM = 10; // pedestal height under the tiles
export const FLOOR: Plan = { x: -60, y: -102, w: 178, d: 196, r: 2 };
export const TILE = 24;

export const DOOR_X = { far: ROW_X - 3, near: ROW_X + ROW_LEN + 1 } as const; // door leaf planes, 2 thick
export const DOOR_T = 2;
export const HEADER_Z = RACK_H;

/** Cooling unit (CRAH) at the far end of the far hot aisle. */
export const CRAH: Plan = { x: -54, y: -98, w: 40, d: 30, r: 1 };
export const CRAH_H = 96;

/** Movable perforated tile: home in the cold aisle, or misplaced in the near hot aisle. */
export const TILE_HOME: Plan = { x: ROW_X + 3 * TILE, y: 0, w: TILE, d: TILE, r: 0.6 };
export const TILE_HOT: Plan = { x: ROW_X + 3 * TILE, y: ROW_B.y + RACK_D, w: TILE, d: TILE, r: 0.6 };

const extremes: Point3[] = [
  [FLOOR.x, FLOOR.y, -PLENUM - 2],
  [FLOOR.x + FLOOR.w, FLOOR.y, -PLENUM - 2],
  [FLOOR.x, FLOOR.y + FLOOR.d, -PLENUM - 2],
  [FLOOR.x + FLOOR.w, FLOOR.y + FLOOR.d, -PLENUM - 2],
  [CRAH.x, CRAH.y, CRAH_H],
  [ROW_X, ROW_A.y, RACK_H + 8],
  [ROW_X + ROW_LEN, ROW_A.y, RACK_H + 8],
];

export const P: Projection = fitProjection(extremes, WIDTH, HEIGHT, { pad: 18, azimuth: AZIMUTH, elevation: ELEVATION });
export const at = (point: Point3): Flat => iso(point, P);
