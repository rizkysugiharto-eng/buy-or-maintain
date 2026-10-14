// Standar Harga Satuan (SHS) Pemkot Malang — Peraturan Walikota Malang No. 14 Tahun 2025 (dokumen dikirim keluarga).
// SHS adalah batas tertinggi harga untuk belanja APBD Pemkot, jadi biasanya sedikit di atas harga toko.
// Angka dibaca dari teks hasil konversi PDF; kolomnya terpisah, jadi pasangan barang ↔ harga dicek manual
// (urutan nomor barang, satuan, dan kewajaran harga). Hanya barang yang pasangannya jelas yang dicantumkan.

export const SHS_SOURCE = {
  label: 'Perwali Kota Malang No. 14/2025 — Standar Harga Satuan',
  short: 'Perwal Malang 14/2025',
  url: 'https://peraturan.bpk.go.id/Search?keywords=standar%20harga%20satuan%20kota%20malang%202025',
};

// Lampiran IV (satuan harga barang) dan Lampiran I (jasa tenaga kerja)
export const SHS_ITEMS = [
  { part: 'Dinding', item: 'Bata ringan (hebel) tebal 10 cm', unit: 'buah', price: 8_550 },
  { part: 'Dinding', item: 'Bata ringan (hebel)', unit: 'm³', price: 1_040_000 },
  { part: 'Dinding', item: 'Bata merah', unit: 'buah', price: 1_850 },
  { part: 'Struktur', item: 'Semen Portland 40 kg', unit: 'sak', price: 68_350 },
  { part: 'Struktur', item: 'Pasir pasang', unit: 'm³', price: 315_600 },
  { part: 'Struktur', item: 'Pasir beton', unit: 'm³', price: 394_500 },
  { part: 'Struktur', item: 'Batu pecah 2/3', unit: 'm³', price: 357_100 },
  { part: 'Struktur', item: 'Batu belah kali (pondasi)', unit: 'm³', price: 210_400 },
  { part: 'Struktur', item: 'Besi beton polos SNI Ø8 mm, 12 m', unit: 'batang', price: 56_850 },
  { part: 'Struktur', item: 'Besi beton polos SNI Ø10 mm, 12 m', unit: 'batang', price: 81_900 },
  { part: 'Lantai', item: 'Keramik lantai polos 40 × 40', unit: 'm²', price: 86_200 },
  { part: 'Lantai', item: 'Keramik lantai motif 40 × 40', unit: 'm²', price: 75_550 },
  { part: 'Lantai', item: 'Keramik granit 60 × 60 (Cina)', unit: 'buah', price: 167_200 },
  { part: 'Kamar mandi', item: 'Keramik dinding 20 × 40', unit: 'm²', price: 81_200 },
  { part: 'Kamar mandi', item: 'Kloset duduk + selang + kran', unit: 'unit', price: 2_078_400 },
  { part: 'Plafon & cat', item: 'Gypsum board 9 mm, 120 × 240 cm', unit: 'lembar', price: 77_000 },
  { part: 'Plafon & cat', item: 'Cat tembok interior 5 kg', unit: 'kaleng', price: 145_300 },
  { part: 'Plafon & cat', item: 'Cat tembok exterior 5 kg', unit: 'kaleng', price: 188_500 },
  { part: 'Upah', item: 'Pekerja', unit: 'orang/hari', price: 153_300 },
  { part: 'Upah', item: 'Kepala tukang', unit: 'orang/hari', price: 161_100 },
  { part: 'Upah', item: 'Mandor', unit: 'orang/hari', price: 204_400 },
  { part: 'Upah', item: 'Pembantu tukang', unit: 'orang/hari', price: 110_000 },
];

// Tukang batu/kayu/cat/besi: kolom upahnya paling berantakan di teks, jadi hanya rentangnya yang dipakai.
export const SHS_TUKANG_RANGE = { low: 127_800, high: 173_800 };

// Lampiran III — satuan biaya pemeliharaan rutin gedung Pemkot (perbaikan s.d. 2% nilai bangunan), per m² per tahun
export const SHS_MAINTENANCE = { singleStorey: 170_000, multiStorey: 196_000 };

// Bahan saja per m² (tanpa upah, perekat/adukan, dan sisa potongan) — jumlah per m² dari ukuran barangnya
const HEBEL_PER_M2 = 1 / (0.6 * 0.2); // blok 60 × 20 cm → 8,33 buah per m² dinding
const GRANIT_PER_M2 = 1 / (0.6 * 0.6); // 2,78 buah per m²
const GYPSUM_M2_PER_SHEET = 1.2 * 2.4; // 2,88 m² per lembar

export const SHS_PER_M2 = [
  { part: 'Dinding', item: 'Hebel 10 cm', value: HEBEL_PER_M2 * 8_550, unit: 'm² dinding', how: '8,33 blok 60×20 cm per m² × Rp8.550' },
  { part: 'Lantai', item: 'Keramik 40 × 40', value: 86_200, unit: 'm² lantai', how: 'harga per m² di SHS' },
  { part: 'Lantai', item: 'Granit 60 × 60', value: GRANIT_PER_M2 * 167_200, unit: 'm² lantai', how: '2,78 buah per m² × Rp167.200' },
  { part: 'Plafon & cat', item: 'Gypsum 9 mm', value: 77_000 / GYPSUM_M2_PER_SHEET, unit: 'm² plafon', how: 'Rp77.000 ÷ 2,88 m² per lembar' },
];
