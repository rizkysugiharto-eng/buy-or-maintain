// Harga satuan pekerjaan dari dua RAB nyata di Kota Malang (dikirim keluarga), sebagai pembanding
// komponen paket material. Alamat tidak dicantumkan.
//   RAB-1: renovasi rumah tinggal, Sawojajar, Kota Malang — tahun harga tidak tertera;
//          harga satuan sudah termasuk bahan + upah (kode item mengikuti penomoran HSPK).
//   RAB-2: pekerjaan finishing rumah kos dekat Polinema, Kota Malang — Desember 2019; bahan + upah dipisah.
// Kedua RAB bukan RAB bangun kos baru dari nol, jadi tidak memuat struktur/pondasi lengkap.

export const RAB_SOURCES = {
  rab1: 'RAB renovasi rumah, Sawojajar (tahun tidak tertera)',
  rab2: 'RAB finishing rumah kos dekat Polinema (Des 2019)',
};

// Rasio perkiraan untuk kos dengan sekat kamar & kamar mandi dalam (bukan dari RAB):
// ±1,2 m² dinding (dihitung satu sisi) untuk setiap 1 m² luas lantai.
export const WALL_RATIO = 1.2;

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

// Perkiraan per m² luas bangunan dari harga satuan di atas (rumus ditulis supaya bisa dicek)
export const RAB_PER_M2 = [
  {
    part: 'Dinding',
    low: (98_612 + 2 * 27_041) * WALL_RATIO,
    high: (98_612 + 2 * 27_041) * WALL_RATIO,
    how: 'hebel 10 cm + acian 2 sisi = Rp152,7 rb per m² dinding × 1,2 m² dinding per m² lantai',
  },
  {
    part: 'Lantai',
    low: 129_828,
    high: 344_124,
    how: 'keramik 30×30 sampai keramik 60×120 setara granit, per m² lantai',
  },
  {
    part: 'Plafon & cat',
    low: 72_850 + 40_215 * 2 * WALL_RATIO,
    high: 152_775 + 50_336 * 2 * WALL_RATIO,
    how: 'plafon PVC/gypsum per m² + cat dinding 2 sisi × 1,2 m² dinding per m² lantai',
  },
];
