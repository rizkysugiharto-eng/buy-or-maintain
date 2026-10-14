// Link bagikan harus bisa dibuka kembali dengan hasil hitung yang sama persis,
// dan cukup pendek untuk dikirim lewat WhatsApp.

import { describe, expect, it } from 'vitest';
import { exampleData } from '../data/example.js';
import { analyze, planVariants } from './calc.js';
import { decodeShare, encodeShare } from './storage.js';

// Ringkasan semua hasil hitung, untuk membandingkan sebelum & sesudah dibagikan
function results(data) {
  return data.plans.flatMap((plan) => {
    const property = data.properties.find((p) => p.id === plan.propertyId);
    return planVariants(plan, data.materials).map((v) => {
      const r = analyze(plan, property, v.material, data.settings);
      return [v.key, Math.round(r.capex.total), Math.round(r.income.noi), r.paybackMonth && Math.round(r.paybackMonth)];
    });
  });
}

describe('link bagikan', () => {
  it('hasil hitung sama persis setelah dibuka dari link', async () => {
    const data = exampleData();
    const opened = await decodeShare(await encodeShare(data));
    expect(results(opened)).toEqual(results(data));
    expect(opened.properties.map((p) => p.name)).toEqual(data.properties.map((p) => p.name));
    expect(opened.settings).toEqual(data.settings);
  });

  it('paket material & asumsi yang diubah ikut terbawa', async () => {
    const data = exampleData();
    data.materials[1].components[1].costPerM2 = 750_000;
    data.materials.push({ ...structuredClone(data.materials[0]), id: 'mat-baru', name: 'Hebel A' });
    data.plans[1].materialIds.push('mat-baru');
    data.settings.budget = 5_000_000_000;
    data.properties[0].checklist = { shm: true };
    data.sources = { 'harga-tanah': { status: 'dicek', note: 'ZNT BPN' } };
    const opened = await decodeShare(await encodeShare(data));
    expect(results(opened)).toEqual(results(data));
    expect(opened.materials.map((m) => m.name)).toContain('Hebel A');
    expect(opened.settings.budget).toBe(5_000_000_000);
    expect(opened.properties[0].checklist).toEqual({ shm: true });
    expect(opened.sources).toEqual({ 'harga-tanah': { status: 'dicek', note: 'ZNT BPN' } });
  });

  it('link data contoh pendek (< 1.600 karakter)', async () => {
    expect((await encodeShare(exampleData())).length).toBeLessThan(1600);
  });

  it('link rusak ditolak', async () => {
    await expect(decodeShare('bukan-data')).rejects.toThrow();
  });
});

describe('judul umum', () => {
  it('judul lama "Pilihan kos Malang" diganti judul umum', async () => {
    const { normalizeData, GENERAL_TITLE } = await import('./storage.js');
    expect(normalizeData({ title: 'Pilihan kos Malang · Oktober 2026', settings: {} }).title).toBe(GENERAL_TITLE);
    expect(normalizeData({ title: 'Kos Blitar', settings: {} }).title).toBe('Kos Blitar');
  });
});
