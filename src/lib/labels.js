// Nama tampilan yang ringkas untuk tabel & grafik.

// "Kos #1 · Suhat Indah" → "Kos #1"; bisa ditimpa lewat isian "Nama singkat"
export function shortName(property) {
  if (property.shortName) return property.shortName;
  return (property.name || 'Properti').split(' · ')[0].slice(0, 22);
}

// "Kos #2 · Bangun kos 15 kamar · Premium"
export function rowLabel(row, { withProperty = true } = {}) {
  const parts = [];
  if (withProperty) parts.push(shortName(row.property));
  parts.push(row.plan.name);
  if (row.material) parts.push(row.material.name);
  return parts.join(' · ');
}
