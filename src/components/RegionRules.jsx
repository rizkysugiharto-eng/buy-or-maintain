// Pilihan Kota/Kabupaten + aturan daerah sebuah properti (BPHTB, NPOPTKP, pajak daerah kos,
// indeks harga bangun). Kosong = memakai angka bawaan daerah; diisi = menimpa untuk properti ini.

import { useId } from 'react';
import { REGIONS, REGION_FIELDS, regionRules } from '../data/regions.js';
import { formatCompact, formatNumber } from '../lib/format.js';
import { MoneyField, NumberField } from './Fields.jsx';

const STATUS = {
  dicek: { label: 'Ada dasar resmi', className: 'rating-baik' },
  nasional: { label: 'Pakai batas nasional', className: 'rating-cukup' },
  belum: { label: 'Belum pasti', className: 'rating-kurang' },
};

const show = (field, value) => {
  if (value == null) return '–';
  if (field === 'npoptkp') return formatCompact(value);
  if (field === 'buildIndex') return `× ${formatNumber(value, 2)}`;
  return `${formatNumber(value, value % 1 ? 1 : 0)}%`;
};

export default function RegionRules({ property, settings, onChange }) {
  const id = useId();
  const rules = regionRules(property, settings);
  const preset = rules.preset;
  const own = property.regionRules ?? {};
  const setRule = (field) => (value) => onChange({ regionRules: { ...own, [field]: value ?? undefined } });

  return (
    <div className="region">
      <div className="field">
        <label htmlFor={id}>Kota / Kabupaten</label>
        <select id={id} value={rules.key} onChange={(e) => onChange({ region: e.target.value })}>
          {Object.entries(REGIONS).map(([key, r]) => (
            <option key={key} value={key}>
              {r.name}
            </option>
          ))}
        </select>
        <span className="field-help">Menentukan aturan pajak beli, pajak daerah kos, dan penyesuaian harga bangun.</span>
      </div>

      <div className="region-rules">
        <h3>Aturan daerah: {rules.name}</h3>
        <p className="small muted">Kosongkan isian untuk memakai angka bawaan daerah. Isi kalau sudah dapat angka pasti dari Bapenda/notaris.</p>
        <div className="form-grid">
          {Object.keys(REGION_FIELDS).map((field) => {
            const status = STATUS[own[field] != null ? 'dicek' : preset.status[field]];
            const common = {
              label: REGION_FIELDS[field],
              value: own[field] ?? null,
              onChange: setRule(field),
              placeholder: `Bawaan: ${show(field, preset[field] ?? rules[field])}`,
            };
            return (
              <div key={field} className="region-field">
                {field === 'npoptkp' ? (
                  <MoneyField {...common} help=" " />
                ) : (
                  <NumberField
                    {...common}
                    unit={field === 'buildIndex' ? '×' : field === 'kosTaxPct' ? '% sewa' : '%'}
                    min={0}
                    max={field === 'buildIndex' ? 3 : 30}
                    help=" "
                  />
                )}
                <span className={`badge ${own[field] != null ? 'rating-baik' : status.className}`}>
                  {own[field] != null ? 'Diisi sendiri' : status.label}
                </span>
                <span className="small muted">{preset.notes[field]}</span>
              </div>
            );
          })}
        </div>
        {rules.kosTaxUnknown && (
          <p className="meaning">
            <b>Pajak daerah kos belum pasti di {rules.name}.</b> Untuk hitungan yang aman, coba isi <b>10</b> di “Pajak daerah kos” dan lihat
            pengaruhnya ke balik modal.
          </p>
        )}
        {preset.market && (
          <p className="small">
            <b>Acuan pasar:</b> {preset.market}
          </p>
        )}
        {preset.links?.length > 0 && (
          <ul className="source-links small">
            {preset.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
