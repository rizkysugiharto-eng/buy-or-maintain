import { describe, expect, it } from 'vitest';
import { FENCE_UNIT, structurePerMeter, squarePerimeter } from '../data/fence.js';
import { fenceSale } from './calc.js';

describe('pagar tembok keliling', () => {
  it('harga satuan masuk akal dibanding RAB Malang', () => {
    expect(FENCE_UNIT.pondasi.price).toBeGreaterThan(800_000); // batu kali per m³
    expect(FENCE_UNIT.pondasi.price).toBeLessThan(1_300_000);
    expect(FENCE_UNIT.bataMerah.price).toBeGreaterThan(150_000);
    expect(FENCE_UNIT.bataMerah.price).toBeLessThan(300_000);
    expect(FENCE_UNIT.plester.price + FENCE_UNIT.acian.price).toBeLessThan(47_010 + 27_041); // di bawah RAB-1 (harga lebih lama/lebih tinggi)
  });

  it('keliling bawaan dari luas tanah (anggap persegi)', () => {
    expect(squarePerimeter(1048)).toBeCloseTo(129.5, 1);
    expect(fenceSale({ landArea: 1048 }).length).toBe(129);
  });

  it('biaya = panjang × (struktur + tinggi × dinding) + biaya lain', () => {
    const r = fenceSale({ landArea: 1048, askingPrice: 1e9, fence: { length: 100, height: 3, extra: 10_000_000 } });
    for (const o of r.options) expect(o.cost).toBeCloseTo(100 * (structurePerMeter() + 3 * o.wallPerM2) + 10_000_000, 4);
    const [hebel, bata, hemat] = r.options;
    expect(hemat.cost).toBeLessThan(bata.cost);
    expect(hebel.cost).toBeLessThan(bata.cost);
  });

  it('impas kalau kenaikan harga = biaya ÷ (1 − PPh)', () => {
    const base = { landArea: 1048, askingPrice: 1e9, fence: { length: 129, height: 3 } };
    const o = fenceSale(base).options[0];
    const even = fenceSale({ ...base, fence: { ...base.fence, uplift: o.breakEven } }).options[0];
    expect(even.vsPlain).toBeCloseTo(0, 2);
    expect(fenceSale(base).options[0].vsPlain).toBeCloseTo(-o.cost, 2); // tanpa kenaikan harga: rugi sebesar biaya pagar
  });
});
