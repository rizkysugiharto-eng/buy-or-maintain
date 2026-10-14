// Properti yang sudah milik keluarga: dibandingkan dengan menjualnya.
import { describe, expect, it } from 'vitest';
import { exampleData } from '../data/example.js';
import { DEFAULT_SETTINGS, analyze, planTypesFor, reportCard, saleProceeds } from './calc.js';

const setup = () => {
  const d = exampleData();
  const property = { ...d.properties.find((p) => p.id === 'p2'), owned: true, askingPrice: 2_000_000_000 };
  const plan = d.plans.find((p) => p.id === 'p2-bangun');
  const material = d.materials.find((m) => m.id === 'mat-standar');
  return { d, property, plan, material };
};

describe('properti milik keluarga', () => {
  it('nilai jual bersih = harga − PPh final 2,5% − komisi makelar', () => {
    expect(saleProceeds({ askingPrice: 2e9 }).net).toBe(1_950_000_000);
    expect(saleProceeds({ askingPrice: 2e9 }, { ...DEFAULT_SETTINGS, saleAgentPct: 2 }).net).toBe(1_910_000_000);
    expect(saleProceeds({ askingPrice: null })).toBeNull();
  });

  it('tanpa harga beli & surat-surat; nilai jual bersih jadi modal, uang baru = biaya bangun', () => {
    const { property, plan, material } = setup();
    const r = analyze(plan, property, material);
    expect(r.capex.purchase).toBe(1_950_000_000);
    expect(r.capex.transaction).toBe(0);
    expect(r.capex.newMoney).toBe(r.capex.build);
    expect(r.capex.total).toBe(r.capex.purchase + r.capex.build);
    expect(r.maxPrice).toBeNull();
  });

  it('selisih dengan menjual lalu menaruh semua uang di SBN', () => {
    const { property, plan, material } = setup();
    const r = analyze(plan, property, material);
    expect(r.vsSbnMonthly).toBeCloseTo((r.income.noi - r.capex.total * 0.069) / 12, 6);
  });

  it('uang baru kembali lebih cepat dari total (tanpa nilai tanah)', () => {
    const { property, plan, material } = setup();
    const r = analyze(plan, property, material);
    expect(r.newMoneyPaybackYears).toBeLessThan(r.paybackYears);
  });

  it('nama jenis rencana & rapor menyesuaikan', () => {
    const { property, plan, material } = setup();
    expect(planTypesFor(property).bangun.label).toBe('Bangun lalu sewakan');
    const card = reportCard(property, analyze(plan, property, material));
    expect(card.rows.find((x) => x.key === 'harga')).toMatchObject({ rating: null, note: 'milik keluarga' });
  });

  it('properti yang mau dibeli tidak berubah hitungannya', () => {
    const { d, plan, material } = setup();
    const original = d.properties.find((p) => p.id === 'p2');
    const r = analyze(plan, original, material);
    expect(r.capex.newMoney).toBe(r.capex.total);
    expect(r.capex.transaction).toBeGreaterThan(0);
  });
});
