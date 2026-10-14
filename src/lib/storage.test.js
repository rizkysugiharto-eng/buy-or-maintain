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
    data.sources = { 'biaya-bangun': { status: 'dicek', note: 'RAB CV X' } };
    data.properties[0].sources = { 'harga-tanah': { status: 'dicek', note: 'ZNT BPN' } };
    const opened = await decodeShare(await encodeShare(data));
    expect(results(opened)).toEqual(results(data));
    expect(opened.materials.map((m) => m.name)).toContain('Hebel A');
    expect(opened.settings.budget).toBe(5_000_000_000);
    expect(opened.properties[0].checklist).toEqual({ shm: true });
    expect(opened.sources).toEqual({ 'biaya-bangun': { status: 'dicek', note: 'RAB CV X' } });
    expect(opened.properties[0].sources).toEqual({ 'harga-tanah': { status: 'dicek', note: 'ZNT BPN' } });
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

describe('tambah dari file', () => {
  it('menambah properti baru beserta rencananya tanpa mengubah data lama', async () => {
    const { mergeData } = await import('./storage.js');
    const current = exampleData();
    const incoming = {
      ...exampleData(),
      properties: [{ id: 'p-baru', name: 'Tanah baru', primaryPlanId: 'plan-x' }, current.properties[0]],
      plans: [{ ...current.plans[0], id: 'plan-x', propertyId: 'p-baru' }],
    };
    const { data, added } = mergeData(current, incoming);
    expect(added).toBe(1);
    expect(data.properties).toHaveLength(current.properties.length + 1);
    expect(data.properties.slice(0, current.properties.length)).toEqual(current.properties);
    expect(data.plans.at(-1)).toMatchObject({ id: 'plan-x', propertyId: 'p-baru' });
  });

  it('id yang bentrok dengan properti lain diganti, rencana utama ikut', async () => {
    const { mergeData } = await import('./storage.js');
    const current = exampleData();
    const clash = { ...current.properties[0], name: 'Beda nama', primaryPlanId: current.plans[0].id };
    const incoming = { ...current, properties: [clash], plans: [{ ...current.plans[0] }] };
    const { data, added } = mergeData(current, incoming);
    expect(added).toBe(1);
    const added1 = data.properties.at(-1);
    expect(added1.id).not.toBe(clash.id);
    const plan = data.plans.at(-1);
    expect(plan.propertyId).toBe(added1.id);
    expect(plan.id).not.toBe(current.plans[0].id);
    expect(added1.primaryPlanId).toBe(plan.id);
  });
});

describe('sumber angka per properti', () => {
  it('status lama angka per properti dipindah ke tiap properti', async () => {
    const { normalizeData } = await import('./storage.js');
    const { sourceProgress } = await import('../data/sources.js');
    const data = exampleData();
    data.sources = { 'harga-tanah': { status: 'dicek', note: 'ZNT' }, 'biaya-bangun': { status: 'dicek' } };
    data.properties[1].sources = { 'harga-tanah': { status: 'perkiraan', note: 'belum' } };
    const out = normalizeData(data);
    expect(out.sources).toEqual({ 'biaya-bangun': { status: 'dicek' } });
    expect(out.properties[0].sources['harga-tanah']).toEqual({ status: 'dicek', note: 'ZNT' });
    expect(out.properties[1].sources['harga-tanah']).toEqual({ status: 'perkiraan', note: 'belum' }); // isian properti tidak ditimpa
    const prog = sourceProgress(out);
    expect(prog.done).toBe(1 + 2); // biaya-bangun + harga-tanah di Contoh 1 & 3
    expect(prog.total).toBe(4 + 3 * 8);
  });

  it('properti milik keluarga tidak perlu cek biaya surat-surat pembeli', async () => {
    const { propertySources } = await import('../data/sources.js');
    expect(propertySources({ owned: true }).map((s) => s.key)).not.toContain('surat-surat');
    expect(propertySources({}).map((s) => s.key)).toContain('surat-surat');
  });
});
