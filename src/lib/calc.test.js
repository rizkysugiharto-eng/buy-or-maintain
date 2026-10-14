// Tes mesin hitung: angka harus sama dengan laporan "Analisis & Perbandingan Kos #1–#3"
// (Oktober 2026). Toleransi kecil karena laporan membulatkan angka.

import { describe, expect, it } from 'vitest';
import { analyze, costApproach, incomeApproach, materialCostPerM2, reportCard } from './calc.js';
import { DEFAULT_SETTINGS } from './calc.js';
import { parseMoney, parseNumber } from './format.js';

const jt = (v) => v * 1e6;
const M = (v) => v * 1e9;
const opex = { opexFixedMonthly: jt(1), opexPerRoomMonthly: jt(0.21), maintenancePct: 6, transactionPct: 6.5 };
const near = (actual, expected, tolerance) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);

const kos1 = { askingPrice: M(3.2), landArea: 111, landPriceMin: jt(8), landPriceMax: jt(12), buildingValueMin: jt(1440), buildingValueMax: jt(1700) };
const kos1Plan = {
  type: 'beli',
  ...opex,
  extraCosts: [{ amount: jt(30) }],
  rooms: 12,
  rentPerRoom: jt(1.7),
  occupancyPct: 92,
  pbbYearly: jt(5),
  buildMonths: 0,
};

describe('Kos #1 — beli jadi', () => {
  const r = analyze(kos1Plan, kos1, null);
  it('total modal, uang bersih, hasil bersih, balik modal', () => {
    near(r.capex.total, jt(3438), jt(1));
    near(r.income.effective, jt(225.2), jt(0.1));
    near(r.income.noi, jt(164.5), jt(0.5));
    near(r.noiMonthly, jt(13.7), jt(0.05));
    near(r.netYield, 4.8, 0.05);
    near(r.grossYield, 7.1, 0.05);
    near(r.paybackYears, 21, 0.5);
    expect(r.incomeStartMonth).toBe(0);
  });
  it('titik impas keterisian ±20%', () => near(r.breakEvenOccupancy, 20.5, 0.5));
  it('skenario pesimis: hasil 3,3% dan balik modal ±31 tahun', () => {
    const p = analyze(kos1Plan, kos1, null, DEFAULT_SETTINGS, 'pesimis');
    near(p.netYield, 3.3, 0.1);
    near(p.paybackYears, 31, 0.5);
  });
  it('dengan fee pengelola 15%: ±Rp10,9 jt/bulan', () => {
    near(analyze({ ...kos1Plan, managementPct: 15 }, kos1, null).noiMonthly, jt(10.9), jt(0.1));
  });
  it('harga wajar: nilai aset Rp2,35–3,05 M dan dari pendapatan Rp2,55–2,80 M', () => {
    const cost = costApproach(kos1);
    near(cost.min, M(2.33), jt(30));
    near(cost.max, M(3.03), jt(30));
    const income = incomeApproach(kos1Plan, kos1, null);
    near(income.min, M(2.55), jt(20));
    near(income.max, M(2.78), jt(20));
  });
  it('rapor: harga Cukup, langsung menghasilkan Baik, balik modal Cukup → Layak', () => {
    const card = reportCard({ ...kos1, locationRating: 'baik', riskRating: 'baik' }, r);
    const get = (k) => card.rows.find((row) => row.key === k).rating;
    expect(get('harga')).toBe('cukup');
    expect(get('langsung')).toBe('baik');
    expect(get('payback')).toBe('cukup');
    expect(card.verdict.label).toBe('Layak');
  });
});

describe('Kos #2 — bangun 15 kamar, paket Standar Rp4,8 jt/m²', () => {
  const property = { askingPrice: M(1.9) };
  const plan = {
    type: 'bangun',
    ...opex,
    buildArea: 350,
    buildCostPerM2: jt(4.8),
    furnishingPerRoom: jt(12),
    designPct: 6,
    contingencyPct: 10,
    extraCosts: [{ amount: jt(30) }, { amount: jt(50) }],
    rooms: 15,
    rentPerRoom: jt(1.25),
    occupancyPct: 90,
    pbbYearly: jt(4),
    buildMonths: 10,
  };
  const r = analyze(plan, property, null);
  it('biaya bangun Rp2.209 jt, total modal Rp4,23 M', () => {
    near(r.capex.build, jt(2209), jt(1));
    near(r.capex.total, M(4.23), jt(5));
  });
  it('uang bersih Rp11,4 jt/bulan, hasil 3,2%, balik modal ±32 tahun', () => {
    near(r.noiMonthly, jt(11.4), jt(0.05));
    near(r.netYield, 3.2, 0.05);
    near(r.paybackYears, 32, 0.5);
    expect(r.incomeStartMonth).toBe(10);
  });
  it('pesimis: ±53 tahun', () => near(analyze(plan, property, null, DEFAULT_SETTINGS, 'pesimis').paybackYears, 53, 1));
});

describe('Kos #3C — bongkar & bangun ulang 22 kamar', () => {
  const property = { askingPrice: M(3) };
  const standar = { components: [{ costPerM2: jt(3) }, { costPerM2: jt(1.8) }] };
  const plan = {
    type: 'bangun',
    ...opex,
    buildArea: 510,
    furnishingPerRoom: jt(12),
    designPct: 6,
    contingencyPct: 10,
    extraCosts: [{ amount: jt(120) }],
    rooms: 22,
    rentPerRoom: jt(1.8),
    occupancyPct: 92,
    pbbYearly: jt(8),
    buildMonths: 12,
  };
  const r = analyze(plan, property, standar);
  it('biaya per m² diambil dari jumlah komponen material', () => expect(materialCostPerM2(standar)).toBe(jt(4.8)));
  it('total modal Rp6,42 M, Rp28 jt/bulan, 5,2%, ±20 tahun', () => {
    near(r.capex.build, jt(3224), jt(1));
    near(r.capex.total, M(6.42), jt(5));
    near(r.noiMonthly, jt(28), jt(0.1));
    near(r.netYield, 5.2, 0.05);
    near(r.paybackYears, 20, 0.5);
  });
  it('harga beli maks. agar hasil 5,5%: ±Rp2,70 M', () => near(r.maxPrice, M(2.7), jt(10)));
  it('pesimis: hasil 3,4% dan ±30 tahun', () => {
    const p = analyze(plan, property, standar, DEFAULT_SETTINGS, 'pesimis');
    near(p.netYield, 3.4, 0.1);
    near(p.paybackYears, 30, 0.5);
  });
  it('material dengan sewa +20% dan bangun 1 bulan lebih lama mengubah hasil', () => {
    const premium = { ...standar, rentAdjustPct: 20, buildMonthsAdjust: 1 };
    const p = analyze(plan, property, premium);
    near(p.params.rentPerRoom, jt(2.16), 1);
    expect(p.incomeStartMonth).toBe(13);
    expect(p.paybackYears).toBeLessThan(r.paybackYears);
  });
  it('peremajaan berkala memperlambat balik modal', () => {
    const withRefresh = analyze(plan, property, { ...standar, refreshEveryYears: 10, refreshCostPerM2: jt(0.3) });
    expect(withRefresh.paybackYears).toBeGreaterThan(r.paybackYears);
  });
});

describe('Kos #3A — apa adanya', () => {
  it('balik modal lebih dari 60 tahun → null', () => {
    const plan = { type: 'beli', ...opex, extraCosts: [{ amount: jt(50) }], rooms: 9, rentPerRoom: jt(1), occupancyPct: 90, pbbYearly: jt(6) };
    const r = analyze(plan, { askingPrice: M(3) }, null);
    near(r.noiMonthly, jt(4.2), jt(0.05));
    expect(r.paybackYears).toBeNull();
  });
});

describe('parseMoney', () => {
  it.each([
    ['3,2 M', 3_200_000_000],
    ['3.2 miliar', 3_200_000_000],
    ['1,7 jt', 1_700_000],
    ['1,7jt', 1_700_000],
    ['450rb', 450_000],
    ['Rp 3.200.000.000', 3_200_000_000],
    ['3200000000', 3_200_000_000],
    ['', null],
    ['abc', null],
  ])('%s → %s', (text, expected) => expect(parseMoney(text)).toBe(expected));
});

describe('parseNumber', () => {
  it.each([
    ['92', 92],
    ['6,5', 6.5],
    ['6.5', 6.5],
    ['1.200', 1200],
    ['1.200,5', 1200.5],
    ['x', null],
  ])('%s → %s', (text, expected) => expect(parseNumber(text)).toBe(expected));
});

describe('Sumber angka', () => {
  it('setiap baris punya langkah cara dapetin angka & tempat memasukkannya', async () => {
    const { SOURCES } = await import('../data/sources.js');
    for (const src of SOURCES) {
      expect(src.how.length).toBeGreaterThan(1);
      expect(src.where).toBeTruthy();
    }
  });
});
