import { describe, expect, it } from 'vitest';
import { RAB3_AREA, RAB3_LABOR, RAB3_TOTAL, RAB_PER_M2, WALL_RATIO } from './rab.js';

describe('RAB kos 5 lantai (upah kerja)', () => {
  it('kelompok upah menjumlah tepat ke total RAB', () => {
    const sum = RAB3_LABOR.reduce((t, r) => t + r.amount, 0);
    expect(sum).toBeCloseTo(RAB3_TOTAL, 2);
  });

  it('upah ±Rp1,24 jt per m² luas bangunan', () => {
    expect(RAB3_TOTAL / RAB3_AREA).toBeCloseTo(1_244_375, 0);
  });

  it('rasio dinding diambil dari volume pasangan hebel', () => {
    expect(WALL_RATIO).toBeCloseTo(2.04, 2);
    const dinding = RAB_PER_M2.find((r) => r.part === 'Dinding');
    expect(dinding.high).toBeGreaterThan(dinding.low);
    expect(dinding.high).toBeCloseTo(503_913, -3); // hebel + plester + acian dua sisi
  });
});
