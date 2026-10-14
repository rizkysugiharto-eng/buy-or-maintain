// Harga satuan dari RAB nyata di Kota Malang (dikirim keluarga), sebagai pembanding paket material.
// Alamat lengkap tidak dicantumkan.
//   RAB-1: renovasi rumah tinggal, Sawojajar — tahun harga tidak tertera; harga sudah bahan + upah.
//   RAB-2: finishing rumah kos dekat Polinema — Desember 2019; bahan + upah dipisah.
//   RAB-3: bangun rumah kos 5 lantai, daerah Sigura-gura, Lowokwaru — UPAH KERJA SAJA (harga baru),
//          luas bangunan 1.200 m², 50 kamar (50 kloset). Volume pekerjaannya juga dipakai untuk rasio
//          dinding/plafon per m² lantai di bawah.

export const RAB_SOURCES = {
  rab1: 'RAB renovasi rumah, Sawojajar (tahun tidak tertera)',
  rab2: 'RAB finishing rumah kos dekat Polinema (Des 2019)',
  rab3: 'RAB upah kerja kos 5 lantai 50 kamar, Sigura-gura (1.200 m², harga baru)',
};

// ── RAB-3: kos 5 lantai ──────────────────────────────────────────────────────────────────────
export const RAB3_AREA = 1_200;

// Volume dari RAB-3 → rasio per m² luas bangunan kos bersekat kamar & kamar mandi dalam
export const WALL_RATIO = 2_451 / RAB3_AREA; // pasangan hebel 2.451 m² → ±2,04 m² dinding per m² lantai
export const PLASTER_RATIO = 5_152 / RAB3_AREA; // plester, acian & cat dinding 5.152 m² (dua sisi) → ±4,29
export const CEILING_RATIO = 925 / RAB3_AREA; // plafon 925 m² → ±0,77

// Jumlah upah per kelompok pekerjaan, dikelompokkan seperti komponen paket material
export const RAB3_LABOR = [
  { part: 'Struktur & pondasi', amount: 1_035_500 + 9_731_038 + 573_820_765.32, how: 'persiapan, galian & beton (A–C)' },
  { part: 'Dinding', amount: 289_616_600, how: 'pasangan hebel, plester, acian, benangan (D)' },
  { part: 'Lantai', amount: 176_849_762.5, how: 'granit, keramik lantai & dinding KM, roster (E)' },
  { part: 'Pintu & jendela', amount: 129_591_700, how: 'kusen, pintu & jendela aluminium, railing (F)' },
  { part: 'Atap', amount: 14_817_600 + 5_321_400, how: 'rangka baja ringan + zincalum (G)' },
  { part: 'Plafon & cat', amount: 14_337_500 + 12_950_000 + 918_750 + 86_054_000, how: 'plafon gypsum + semua pengecatan (G, H)' },
  { part: 'Kamar mandi', amount: 4_550_000 + 327_250 + 229_250 + 47_250_000 + 4_375_000 + 22_750_000 + 262_500, how: 'kloset, shower, floor drain, kran (J)' },
  { part: 'Listrik & air', amount: 28_786_100 + 17_377_500 + 16_663_500 + 12_190_500 + 15_093_750 + 5_250_000 + 1_400_000 + 1_700_000, how: 'instalasi listrik, pipa, tandon, biotank (I, J)' },
];
export const RAB3_TOTAL = 1_493_249_965.82;

// Upah per satuan pekerjaan dari RAB-3
export const RAB3_ITEMS = [
  { part: 'Struktur', item: 'Beton site mix 1:2:3', unit: 'm³', price: 367_500 },
  { part: 'Struktur', item: 'Pembesian', unit: 'kg', price: 3_850 },
  { part: 'Struktur', item: 'Bekisting', unit: 'm²', price: 43_750 },
  { part: 'Dinding', item: 'Pasangan dinding bata ringan (hebel)', unit: 'm²', price: 56_000 },
  { part: 'Dinding', item: 'Plesteran dinding', unit: 'm²', price: 12_250 },
  { part: 'Dinding', item: 'Acian', unit: 'm²', price: 8_750 },
  { part: 'Lantai', item: 'Pasang granite tile 60 × 60', unit: 'm²', price: 106_750 },
  { part: 'Lantai', item: 'Pasang keramik lantai KM/WC', unit: 'm²', price: 56_000 },
  { part: 'Kamar mandi', item: 'Pasang keramik dinding KM/WC', unit: 'm²', price: 89_250 },
  { part: 'Pintu & jendela', item: 'Pasang kusen aluminium', unit: 'm′', price: 61_250 },
  { part: 'Pintu & jendela', item: 'Pasang panel pintu aluminium', unit: 'unit', price: 725_000 },
  { part: 'Atap', item: 'Rangka atap baja ringan', unit: 'm²', price: 88_200 },
  { part: 'Atap', item: 'Penutup atap zincalum 0,3', unit: 'm²', price: 31_675 },
  { part: 'Plafon & cat', item: 'Rangka plafon hollow + gypsum 9 mm', unit: 'm²', price: 15_500 + 14_000 },
  { part: 'Plafon & cat', item: 'Pengecatan dinding interior', unit: 'm²', price: 11_375 },
  { part: 'Plafon & cat', item: 'Pengecatan dinding exterior / plafon', unit: 'm²', price: 15_750 },
  { part: 'Listrik & air', item: 'Titik lampu / stop kontak', unit: 'titik', price: 36_750 },
  { part: 'Listrik & air', item: 'Pasang pipa air kotor PVC 3"', unit: 'm′', price: 40_250 },
];

// ── RAB-1 & RAB-2: bahan + upah ──────────────────────────────────────────────────────────────
export const RAB_ITEMS = [
  { part: 'Struktur', item: 'Beton 1 Pc : 2 Ps : 3 Kr', unit: 'm³', price: 1_095_820, src: 'rab1' },
  { part: 'Struktur', item: 'Pembesian besi beton', unit: 'kg', price: 23_069, src: 'rab1' },
  { part: 'Struktur', item: 'Bekisting kolom', unit: 'm²', price: 281_741, src: 'rab1' },
  { part: 'Dinding', item: 'Dinding bata ringan (hebel) tebal 10 cm', unit: 'm² dinding', price: 98_612, src: 'rab1' },
  { part: 'Dinding', item: 'Plesteran 1 : 4 tebal 15 mm', unit: 'm² dinding', price: 47_010, src: 'rab1' },
  { part: 'Dinding', item: 'Acian', unit: 'm² dinding', price: 27_041, src: 'rab1' },
  { part: 'Lantai', item: 'Lantai keramik 30 × 30', unit: 'm² lantai', price: 129_828, src: 'rab1' },
  { part: 'Lantai', item: 'Lantai keramik 60 × 120 setara granite tile', unit: 'm² lantai', price: 344_124, src: 'rab1' },
  { part: 'Kamar mandi', item: 'Keramik dinding 25 × 40', unit: 'm²', price: 169_669, src: 'rab1' },
  { part: 'Kamar mandi', item: 'Kloset duduk terpasang', unit: 'unit', price: 1_428_425, src: 'rab1' },
  { part: 'Kamar mandi', item: 'Wastafel terpasang', unit: 'unit', price: 771_209, src: 'rab1' },
  { part: 'Plafon & cat', item: 'Plafon gypsum 9 mm + rangka hollow', unit: 'm² plafon', price: 84_053, src: 'rab1' },
  { part: 'Plafon & cat', item: 'Plafon gypsum + rangka hollow (bahan Rp117 rb + upah Rp36 rb)', unit: 'm² plafon', price: 152_775, src: 'rab2' },
  { part: 'Plafon & cat', item: 'Plafon PVC 5 mm + rangka hollow', unit: 'm² plafon', price: 72_850, src: 'rab1' },
  { part: 'Plafon & cat', item: 'Cat dinding interior (1× dasar + 2× warna)', unit: 'm² dinding', price: 50_336, src: 'rab1' },
  { part: 'Plafon & cat', item: 'Cat dinding indoor (bahan + upah)', unit: 'm² dinding', price: 40_215, src: 'rab2' },
  { part: 'Atap', item: 'Penutup atap bitumen 3 mm', unit: 'm² atap', price: 239_598, src: 'rab1' },
  { part: 'Atap', item: 'Rangka baja WF dirakit', unit: 'kg', price: 25_736, src: 'rab1' },
  { part: 'Listrik & air', item: 'Titik lampu / stop kontak', unit: 'titik', price: 123_250, src: 'rab1' },
  { part: 'Listrik & air', item: 'Pipa PVC AW 3"', unit: 'm', price: 91_061, src: 'rab1' },
];

const f2 = (n) => n.toFixed(2).replace('.', ',');

// Perkiraan bahan + upah per m² luas bangunan: harga satuan RAB-1/RAB-2 × volume per m² dari RAB-3
export const RAB_PER_M2 = [
  {
    part: 'Dinding',
    low: (98_612 + 2 * 27_041) * WALL_RATIO,
    high: (98_612 + 2 * 47_010 + 2 * 27_041) * WALL_RATIO,
    how: `hebel 10 cm + acian (tanpa/ dengan plester) dua sisi × ${f2(WALL_RATIO)} m² dinding per m² lantai`,
  },
  {
    part: 'Lantai',
    low: 129_828,
    high: 344_124,
    how: 'keramik 30×30 sampai keramik 60×120 setara granit, per m² lantai',
  },
  {
    part: 'Plafon & cat',
    low: 72_850 * CEILING_RATIO + 40_215 * PLASTER_RATIO,
    high: 152_775 * CEILING_RATIO + 50_336 * PLASTER_RATIO,
    how: `plafon PVC/gypsum × ${f2(CEILING_RATIO)} m² + cat dinding × ${f2(PLASTER_RATIO)} m² per m² lantai`,
  },
];
