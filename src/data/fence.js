// Biaya pagar tembok keliling, per meter panjang pagar. Disusun dari:
//   - harga bahan & upah harian resmi Perwal Kota Malang No. 14/2025 (SHS, lihat shs.js),
//   - upah borongan nyata RAB kos 5 lantai Sigura-gura (rab.js: beton, pembesian, bekisting, plester, acian, galian),
//   - harga hebel terpasang dari RAB renovasi Sawojajar (bahan + upah),
//   - kebutuhan bahan per satuan pekerjaan menurut koefisien SNI/AHSP (mis. 70 bata merah per m² dinding ½ bata).
// Ukuran struktur (pondasi, sloof, kolom praktis tiap 3 m, ring balk) adalah ukuran umum pagar ±3 m;
// semua angka perkiraan — minta RAB tukang setempat untuk angka pasti.

const SAK = 40; // kg semen per sak
const PRICE = {
  semenKg: 68_350 / SAK,
  pasirPasang: 315_600, // m³
  pasirBeton: 394_500, // m³
  batuPecah: 357_100, // m³ (2/3)
  batuKali: 210_400, // m³
  besiKg: 81_900 / 7.4, // besi polos Ø10 × 12 m ≈ 7,4 kg
  bataMerah: 1_850, // buah
  multipleks9: 189_000, // lembar 120 × 240
  pekerja: 153_300, // orang/hari
  tukang: 138_000,
  kepalaTukang: 161_100,
  mandor: 204_400,
};
const RAB_UPAH = { galian: 26_250, beton: 367_500, besi: 3_850, bekisting: 43_750, plester: 12_250, acian: 8_750 };
const HEBEL_TERPASANG = 98_612; // RAB-1, per m² dinding (bahan + upah)

const upahSni = (pekerja, tukang, kepala, mandor) =>
  pekerja * PRICE.pekerja + tukang * PRICE.tukang + kepala * PRICE.kepalaTukang + mandor * PRICE.mandor;

// Harga satuan pekerjaan (bahan + upah)
export const FENCE_UNIT = {
  galian: { label: 'Galian tanah pondasi', unit: 'm³', price: RAB_UPAH.galian },
  pondasi: {
    label: 'Pasangan batu kali 1 : 5',
    unit: 'm³',
    price: 1.2 * PRICE.batuKali + 136 * PRICE.semenKg + 0.544 * PRICE.pasirPasang + upahSni(1.5, 0.75, 0.075, 0.075),
  },
  beton: {
    label: 'Beton 1 : 2 : 3 (sloof, kolom, ring balk)',
    unit: 'm³',
    price: 326 * PRICE.semenKg + 0.54 * PRICE.pasirBeton + 0.76 * PRICE.batuPecah + RAB_UPAH.beton,
  },
  besi: { label: 'Pembesian', unit: 'kg', price: PRICE.besiKg * 1.05 + RAB_UPAH.besi },
  bekisting: { label: 'Bekisting (multipleks dipakai 3×)', unit: 'm²', price: (PRICE.multipleks9 / 2.88 / 3) * 1.3 + RAB_UPAH.bekisting },
  bataMerah: {
    label: 'Pasangan bata merah ½ bata 1 : 4',
    unit: 'm²',
    price: 70 * PRICE.bataMerah + 11.5 * PRICE.semenKg + 0.043 * PRICE.pasirPasang + upahSni(0.3, 0.1, 0.01, 0.015),
  },
  hebel: { label: 'Pasangan hebel 10 cm (RAB Sawojajar)', unit: 'm²', price: HEBEL_TERPASANG },
  plester: { label: 'Plester 1 : 4 tebal 15 mm', unit: 'm²', price: 6.24 * PRICE.semenKg + 0.024 * PRICE.pasirPasang + RAB_UPAH.plester },
  acian: { label: 'Acian', unit: 'm²', price: 3.25 * PRICE.semenKg + RAB_UPAH.acian },
};

// Kebutuhan struktur per meter panjang pagar (sama untuk semua paket)
//   pondasi batu kali trapesium atas 25 cm, bawah 60 cm, dalam 60 cm; sloof 15/20; ring balk 15/15;
//   kolom praktis 15/15 tiap 3 m; besi 4 Ø10 + begel Ø8–15 cm.
const STRUCTURE_PER_M = { galian: 0.36, pondasi: 0.255, beton: 0.03 + 0.0225 + (0.15 * 0.15 * 3.3) / 3, besi: 12.6, bekisting: 1.18 };

export const FENCE_STRUCTURE = Object.entries(STRUCTURE_PER_M).map(([key, qty]) => ({
  key,
  qty,
  ...FENCE_UNIT[key],
  cost: qty * FENCE_UNIT[key].price,
}));
export const structurePerMeter = () => FENCE_STRUCTURE.reduce((s, r) => s + r.cost, 0);

// Paket dinding pagar: biaya per m² bidang dinding (satu muka)
export const FENCE_PACKAGES = [
  {
    id: 'pagar-hebel',
    name: 'Hebel',
    note: 'Bata ringan 10 cm, plester + acian kedua sisi. Lebih ringan & cepat dipasang.',
    parts: [
      ['hebel', 1],
      ['plester', 2],
      ['acian', 2],
    ],
  },
  {
    id: 'pagar-bata',
    name: 'Bata merah',
    note: 'Bata merah ½ bata, plester + acian kedua sisi. Paling umum, tahan lama.',
    parts: [
      ['bataMerah', 1],
      ['plester', 2],
      ['acian', 2],
    ],
  },
  {
    id: 'pagar-bata-hemat',
    name: 'Bata merah hemat',
    note: 'Bata merah ½ bata, plester + acian sisi luar saja; sisi dalam dibiarkan bata.',
    parts: [
      ['bataMerah', 1],
      ['plester', 1],
      ['acian', 1],
    ],
  },
];

export const wallPerM2 = (pkg) => pkg.parts.reduce((s, [key, qty]) => s + qty * FENCE_UNIT[key].price, 0);

/** Perkiraan keliling (m) tanah persegi dengan luas tertentu. */
export const squarePerimeter = (area) => (area > 0 ? 4 * Math.sqrt(area) : 0);
