import { describe, expect, it } from 'vitest';
import { pageBreaks } from './pdf.js';

describe('pembagian halaman PDF', () => {
  it('memotong di sela bagian, bukan di tengah baris', () => {
    // baris 0–300, 320–700, 720–1100; halaman 800 px → potong di sela 700–720
    const rows = [
      [0, 300],
      [320, 700],
      [720, 1100],
    ];
    const pages = pageBreaks(1100, rows, 800);
    expect(pages).toHaveLength(2);
    expect(pages[0][1]).toBeGreaterThanOrEqual(700);
    expect(pages[0][1]).toBeLessThanOrEqual(720);
    expect(pages[1][1]).toBe(1100);
  });

  it('bagian besar (mis. seluruh grafik) boleh dipotong di sela barisnya', () => {
    const rows = [[0, 2000], ...Array.from({ length: 20 }, (_, i) => [i * 100 + 5, i * 100 + 95])];
    const pages = pageBreaks(2000, rows, 800);
    for (const [, end] of pages.slice(0, -1)) expect(end % 100 <= 5 || end % 100 >= 95).toBe(true);
  });

  it('tanpa sela yang aman → dipotong tepat di batas halaman', () => {
    expect(pageBreaks(1900, [], 800)).toEqual([
      [0, 800],
      [800, 1600],
      [1600, 1900],
    ]);
  });
});
