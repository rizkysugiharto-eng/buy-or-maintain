import { describe, expect, it } from 'vitest';
import { SHS_ITEMS, SHS_MAINTENANCE, SHS_PER_M2 } from './shs.js';

describe('Standar Harga Satuan Kota Malang (Perwal 14/2025)', () => {
  it('setiap barang punya harga dan satuan', () => {
    for (const it of SHS_ITEMS) {
      expect(it.price).toBeGreaterThan(0);
      expect(it.unit).toBeTruthy();
    }
  });

  it('menghitung bahan per m² dari ukuran barang', () => {
    const per = Object.fromEntries(SHS_PER_M2.map((r) => [r.item, r.value]));
    expect(per['Hebel 10 cm']).toBeCloseTo(71_250, 0); // 8,33 blok × Rp8.550
    expect(per['Granit 60 × 60']).toBeCloseTo(464_444, 0); // 2,78 buah × Rp167.200
    expect(per['Gypsum 9 mm']).toBeCloseTo(26_736, 0); // Rp77.000 ÷ 2,88 m²
  });

  it('bahan hebel lebih murah dari hebel terpasang di RAB (bahan + upah)', () => {
    const hebel = SHS_PER_M2.find((r) => r.item === 'Hebel 10 cm').value;
    expect(hebel).toBeLessThan(98_612);
  });

  it('biaya pemeliharaan gedung bertingkat lebih tinggi', () => {
    expect(SHS_MAINTENANCE.multiStorey).toBeGreaterThan(SHS_MAINTENANCE.singleStorey);
  });
});
