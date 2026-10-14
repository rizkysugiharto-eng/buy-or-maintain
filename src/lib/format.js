// Format & baca angka gaya Indonesia (titik ribuan, koma desimal).
// Uang disimpan dalam Rupiah penuh; tampilannya diringkas jadi "Rp 3,2 M" / "Rp 13,7 jt".

export function formatNumber(value, digits = 0) {
  if (value == null || Number.isNaN(value)) return '–';
  return value.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatRupiah(value) {
  return value == null || Number.isNaN(value) ? '–' : `Rp ${formatNumber(Math.round(value))}`;
}

// Rp 3,2 M · Rp 13,7 jt · Rp 450 rb
export function formatCompact(value, digits) {
  if (value == null || Number.isNaN(value)) return '–';
  const abs = Math.abs(value);
  if (abs >= 1e9) return `Rp ${formatNumber(value / 1e9, digits ?? 2)} M`;
  if (abs >= 1e6) return `Rp ${formatNumber(value / 1e6, digits ?? 1)} jt`;
  if (abs >= 1e3) return `Rp ${formatNumber(value / 1e3, digits ?? 0)} rb`;
  return `Rp ${formatNumber(value)}`;
}

export function formatPercent(value, digits = 1) {
  return value == null || Number.isNaN(value) ? '–' : `${formatNumber(value, digits)}%`;
}

// Lama balik modal: "±21 tahun"; null = tidak tercapai dalam batas hitung
export function formatYears(years, maxYears = 60) {
  if (years == null) return `>${maxYears} tahun`;
  if (years < 1) return `±${formatNumber(Math.max(1, Math.round(years * 12)))} bulan`;
  return `±${formatNumber(years, years < 10 ? 1 : 0)} tahun`;
}

export function formatMonths(months) {
  if (!months) return 'Langsung';
  return `±${formatNumber(months)} bulan`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Tanggal mulai (YYYY-MM) + jumlah bulan → "Okt 2047"
export function monthLabel(start, monthsAfter) {
  const [y, m] = (start || '2026-11').split('-').map(Number);
  const total = y * 12 + (m - 1) + Math.round(monthsAfter);
  return `${MONTHS[total % 12]} ${Math.floor(total / 12)}`;
}

/**
 * Baca isian uang yang ditulis bebas:
 * "3,2 M" / "3.2 miliar" → 3.200.000.000 · "1,7 jt" → 1.700.000 · "450rb" → 450.000
 * "3.200.000.000" / "Rp 3.200.000.000" → 3.200.000.000
 * Hasil null kalau kosong atau tidak bisa dibaca.
 */
export function parseMoney(text) {
  if (text == null) return null;
  if (typeof text === 'number') return Number.isFinite(text) ? text : null;
  let s = String(text).toLowerCase().replace(/rp\.?/g, '').replace(/\s+/g, '');
  if (!s) return null;
  const units = [
    [/(miliar|milyar|m)$/, 1e9],
    [/(juta|jt)$/, 1e6],
    [/(ribu|rb|k)$/, 1e3],
  ];
  let mult = 1;
  for (const [re, value] of units) {
    if (re.test(s)) {
      s = s.replace(re, '');
      mult = value;
      break;
    }
  }
  if (mult > 1) {
    // Dengan satuan: koma atau titik tunggal = desimal ("3,2 M", "3.2 M")
    s = s.replace(',', '.');
    if ((s.match(/\./g) || []).length > 1) return null;
  } else {
    // Tanpa satuan: titik = ribuan, koma = desimal
    s = s.replace(/\./g, '').replace(',', '.');
  }
  if (!/^-?\d*\.?\d+$/.test(s)) return null;
  return Math.round(Number(s) * mult);
}

// Angka biasa (luas, persen, bulan). Koma = desimal; titik = ribuan bila diikuti 3 angka ("1.200").
export function parseNumber(text) {
  if (text == null || text === '') return null;
  if (typeof text === 'number') return text;
  let s = String(text).trim().replace(/\s+/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  if (!/^-?\d*\.?\d+$/.test(s)) return null;
  return Number(s);
}
