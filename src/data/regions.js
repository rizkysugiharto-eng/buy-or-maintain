// Aturan & acuan harga per daerah (Kota/Kabupaten). Dipakai otomatis oleh properti sesuai daerahnya;
// setiap angka bisa ditimpa di halaman properti kalau sudah dapat angka pasti dari Bapenda/notaris.
// status: 'dicek' = ada dasar peraturan/pernyataan resmi; 'nasional' = memakai batas nasional UU HKPD
// karena aturan daerahnya belum ditemukan; 'belum' = belum pasti.
//
// Indeks harga bangun = perbandingan HSBGN daerah terhadap Kota Malang (rata-rata kelas sederhana &
// tidak sederhana, Pergub Jatim No. 34/2022). Paket material bawaan dikalibrasi untuk Kota Malang.

const PERGUB_HSBGN = { label: 'Pergub Jatim 34/2022 — HSBGN per kab/kota', url: 'https://dokumjdih.jatimprov.go.id/upload/45172/2022PERGUBJATIM034.pdf' };
const UU_HKPD_NPOPTKP = { label: 'DDTC — UU HKPD: NPOPTKP minimal Rp80 jt', url: 'https://news.ddtc.co.id/uu-hkpd-revisi-aturan-npoptkp-tanah-dan-atau-bangunan-ini-rinciannya-35545' };
const KEMENKEU_KOS = { label: 'DDTC — Kemenkeu: kos bisa jadi objek pajak jasa perhotelan', url: 'https://news.ddtc.co.id/berita/nasional/1805491/catat-kemenkeu-sebut-kos-kosan-termasuk-objek-pajak-jasa-perhotelan' };

export const REGIONS = {
  'kota-malang': {
    name: 'Kota Malang',
    bphtbPct: 5,
    npoptkp: 80_000_000,
    kosTaxPct: 0,
    buildIndex: 1,
    status: { bphtbPct: 'dicek', npoptkp: 'dicek', kosTaxPct: 'dicek', buildIndex: 'dicek' },
    notes: {
      bphtbPct: 'Perda Kota Malang No. 4/2023 (berlaku 2024)',
      npoptkp: 'Naik dari Rp60 jt jadi Rp80 jt (Bapenda Kota Malang)',
      kosTaxPct: 'Tidak dipungut sejak UU HKPD — Pemkot Malang, Juni 2025. Pemkot berharap bisa memungut lagi.',
      buildIndex: 'Patokan (= 1,00). HSBGN 2022: Rp6,48 jt (≤2 lantai) / Rp8,62 jt per m² (>2 lantai)',
    },
    market: 'Sewa kos AC + KM dalam di Lowokwaru Rp1,3–1,9 jt/bulan (iklan Okt 2026). Tanah Suhat Rp9,5–13,5 jt/m², jalan dalam ±Rp7 jt/m² (iklan 2026).',
    links: [
      { label: 'Perda Kota Malang No. 4/2023', url: 'https://pasal.id/peraturan/perda/perda-kota-malang-4-2023' },
      {
        label: 'Bapenda Kota Malang — Perda 4/2023 berlaku',
        url: 'https://bapenda.malangkota.go.id/dengan-berlaku-perda-no-4-tahun-2023-tentang-pdrd-bapenda-kota-malang-siap-naikkan-pad-tahun-2024-demi-kemandirian-keuangan-daerah/',
      },
      { label: 'Pemkot Malang — rumah kos tak lagi kena pajak daerah', url: 'https://malangkota.go.id/2025/06/10/uu-hkpd-berlaku-rumah-kos-tak-lagi-kena-pajak-daerah/' },
      PERGUB_HSBGN,
    ],
  },
  'kab-malang': {
    name: 'Kabupaten Malang',
    bphtbPct: 5,
    npoptkp: 80_000_000,
    kosTaxPct: null,
    buildIndex: 1,
    status: { bphtbPct: 'dicek', npoptkp: 'dicek', kosTaxPct: 'belum', buildIndex: 'belum' },
    notes: {
      bphtbPct: 'Perda Kabupaten Malang No. 7/2023 (berlaku 1 Jan 2024)',
      npoptkp: 'Rp80 jt untuk perolehan pertama (Perda 7/2023, diberitakan Radar Malang)',
      kosTaxPct: 'Belum pasti apakah kos dipungut pajak jasa perhotelan. Kalau dipungut, umumnya 10% dari sewa. Tanyakan Bapenda Kab. Malang.',
      buildIndex: 'HSBGN Kab. Malang belum ditemukan — sementara disamakan dengan Kota Malang',
    },
    market: 'Belum ada data sewa & tanah — sangat beda antar kecamatan (mis. Lowokwaru-perbatasan vs Kepanjen). Wajib survei.',
    links: [
      { label: 'Radar Malang — NPOPTKP Kab. Malang Rp80 jt', url: 'https://radarmalang.jawapos.com/kabupaten-malang/815585254/pemkab-malang-andalkan-bphtb-targetnya-malah-diturunkan-6-persen' },
      { label: 'DDTC — Perda Kab. Malang 7/2023', url: 'https://news.ddtc.co.id/berita/daerah/1804423/pemkab-malang-tetapkan-12-tarif-untuk-pajak-bumi-dan-bangunan' },
      KEMENKEU_KOS,
    ],
  },
  'kota-blitar': {
    name: 'Kota Blitar',
    bphtbPct: 5,
    npoptkp: 80_000_000,
    kosTaxPct: null,
    buildIndex: 0.7,
    status: { bphtbPct: 'nasional', npoptkp: 'nasional', kosTaxPct: 'belum', buildIndex: 'dicek' },
    notes: {
      bphtbPct: 'Perda pajak Kota Blitar belum ditemukan — memakai tarif maksimal nasional 5% (UU HKPD)',
      npoptkp: 'Memakai batas minimal nasional Rp80 jt (UU HKPD); Perda bisa menetapkan lebih tinggi',
      kosTaxPct: 'Belum pasti apakah kos dipungut pajak jasa perhotelan. Kalau dipungut, umumnya 10% dari sewa. Tanyakan Bapenda Kota Blitar.',
      buildIndex: 'HSBGN 2022 Kota Blitar Rp4,74 jt (≤2 lantai) / Rp5,82 jt per m² (>2 lantai) ≈ 0,70 × Kota Malang',
    },
    market: 'Sewa kos KM dalam (+AC) Kota Blitar ±Rp550 rb–1,2 jt/bulan (iklan Pinhome/Mamikos). Tanah: pinggiran (Sukorejo) ±Rp1,4 jt/m², pusat kota (Kepanjenkidul, Jl. Sudirman) Rp6,7–8,9 jt/m² (iklan).',
    links: [
      PERGUB_HSBGN,
      UU_HKPD_NPOPTKP,
      KEMENKEU_KOS,
      { label: 'Pinhome — kos di Kota Blitar', url: 'https://www.pinhome.id/kost/kota-blitar-179' },
      { label: '99.co — tanah di Blitar', url: 'https://www.99.co/id/jual/tanah/blitar' },
    ],
  },
  'kab-blitar': {
    name: 'Kabupaten Blitar',
    bphtbPct: 5,
    npoptkp: 80_000_000,
    kosTaxPct: null,
    buildIndex: 0.95,
    status: { bphtbPct: 'dicek', npoptkp: 'nasional', kosTaxPct: 'belum', buildIndex: 'dicek' },
    notes: {
      bphtbPct: 'Perda Kabupaten Blitar No. 8/2023 tentang Pajak Daerah: tarif BPHTB 5%',
      npoptkp: 'Angka di Perda belum ditemukan — memakai batas minimal nasional Rp80 jt (UU HKPD)',
      kosTaxPct: 'Belum pasti apakah kos dipungut pajak jasa perhotelan. Kalau dipungut, umumnya 10% dari sewa. Tanyakan Bapenda Kab. Blitar.',
      buildIndex: 'HSBGN 2022 Kab. Blitar Rp6,61 jt (≤2 lantai) / Rp7,51 jt per m² (>2 lantai) ≈ 0,95 × Kota Malang',
    },
    market: 'Belum ada data sewa & tanah per kecamatan — wajib survei. Acuan kota: sewa Kota Blitar ±Rp550 rb–1,2 jt/bulan.',
    links: [
      { label: 'Perda Kab. Blitar 8/2023 (teks lengkap, DDTC)', url: 'https://perpajakan.ddtc.co.id/sumber-hukum/peraturan-daerah/perda-kabupaten-blitar-8-tahun-2023' },
      { label: 'Bapenda Kabupaten Blitar', url: 'https://bapenda.blitarkab.go.id/' },
      PERGUB_HSBGN,
      UU_HKPD_NPOPTKP,
    ],
  },
  lainnya: {
    name: 'Daerah lain',
    bphtbPct: null, // pakai aturan bawaan di Data & Asumsi
    npoptkp: null,
    kosTaxPct: null,
    buildIndex: 1,
    status: { bphtbPct: 'nasional', npoptkp: 'nasional', kosTaxPct: 'belum', buildIndex: 'belum' },
    notes: {
      bphtbPct: 'Memakai aturan bawaan di Data & Asumsi (maks. nasional 5%) — isi sesuai Perda daerahnya',
      npoptkp: 'Memakai aturan bawaan (min. nasional Rp80 jt) — isi sesuai Perda daerahnya',
      kosTaxPct: 'Tanyakan Bapenda setempat apakah kos dipungut pajak jasa perhotelan',
      buildIndex: 'Isi perbandingan HSBGN daerah itu terhadap Kota Malang (lihat Pergub Jatim 34/2022)',
    },
    market: '',
    links: [UU_HKPD_NPOPTKP, PERGUB_HSBGN],
  },
};

export const DEFAULT_REGION = 'kota-malang';

export const REGION_FIELDS = {
  bphtbPct: 'Tarif BPHTB',
  npoptkp: 'Batas tidak kena BPHTB (NPOPTKP)',
  kosTaxPct: 'Pajak daerah kos',
  buildIndex: 'Indeks harga bangun',
};

/** Aturan daerah yang berlaku untuk satu properti: angka timpaan properti > preset daerah > bawaan di pengaturan. */
export function regionRules(property, settings = {}) {
  const key = property?.region && REGIONS[property.region] ? property.region : DEFAULT_REGION;
  const preset = REGIONS[key];
  const own = property?.regionRules ?? {};
  const pick = (field, fallback) => own[field] ?? preset[field] ?? fallback;
  return {
    key,
    name: preset.name,
    bphtbPct: pick('bphtbPct', settings.bphtbPct ?? 5),
    npoptkp: pick('npoptkp', settings.npoptkp ?? 80_000_000),
    kosTaxPct: pick('kosTaxPct', 0),
    buildIndex: pick('buildIndex', 1),
    kosTaxUnknown: own.kosTaxPct == null && preset.kosTaxPct == null,
    preset,
  };
}
