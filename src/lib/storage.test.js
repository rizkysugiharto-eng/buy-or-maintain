// Link bagikan harus bisa dibuka kembali utuh, dan cukup pendek untuk dikirim lewat WhatsApp.

import { describe, expect, it } from 'vitest';
import { exampleData } from '../data/example.js';
import { decodeShare, encodeShare } from './storage.js';

describe('link bagikan', () => {
  it('data kembali utuh setelah dikodekan & dibuka', async () => {
    const data = exampleData();
    expect(await decodeShare(await encodeShare(data))).toEqual(data);
  });
  it('panjang link data contoh < 8.000 karakter', async () => {
    expect((await encodeShare(exampleData())).length).toBeLessThan(8000);
  });
  it('link rusak ditolak', async () => {
    await expect(decodeShare('bukan-data')).rejects.toThrow();
  });
});
