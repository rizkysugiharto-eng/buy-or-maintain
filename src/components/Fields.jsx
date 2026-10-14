// Isian formulir yang ramah: uang bisa ditulis "3,2 M" atau "1,7 jt",
// setiap isian punya penjelasan singkat dalam bahasa sehari-hari.

import { useEffect, useId, useState } from 'react';
import { RATINGS } from '../lib/calc.js';
import { formatCompact, formatNumber, formatRupiah, parseMoney, parseNumber } from '../lib/format.js';

function FieldShell({ id, label, help, error, children, wide }) {
  return (
    <div className={`field${wide ? ' wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : (
        help && <span className="field-help">{help}</span>
      )}
    </div>
  );
}

export function TextField({ label, value, onChange, help, placeholder, wide, multiline }) {
  const id = useId();
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <FieldShell id={id} label={label} help={help} wide={wide}>
      <Tag id={id} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={multiline ? 3 : undefined} />
    </FieldShell>
  );
}

/** Isian uang. Saat diketik tampil apa adanya; setelah selesai dirapikan jadi "Rp 3.200.000.000". */
export function MoneyField({ label, value, onChange, help, placeholder = 'contoh: 3,2 M atau 1,7 jt', allowEmpty = true, wide }) {
  const id = useId();
  const [text, setText] = useState(value == null ? '' : formatRupiah(value));
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!focused) setText(value == null ? '' : formatRupiah(value));
  }, [value, focused]);

  function commit() {
    setFocused(false);
    if (text.trim() === '' && allowEmpty) {
      setError(null);
      onChange(null);
      return;
    }
    const parsed = parseMoney(text);
    if (parsed == null) {
      setError('Tidak terbaca. Tulis misalnya 3,2 M · 450 jt · 1.700.000');
      return;
    }
    setError(null);
    onChange(parsed);
  }

  const preview = focused ? parseMoney(text) : null;
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      wide={wide}
      help={focused && preview != null ? `= ${formatCompact(preview)}` : help ?? (value != null ? `≈ ${formatCompact(value)}` : null)}
    >
      <input
        id={id}
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onFocus={(e) => {
          // Pilih semua isi supaya angka baru langsung menggantikan yang lama
          setFocused(true);
          e.target.select();
        }}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </FieldShell>
  );
}

const decimals = (v) => (v % 1 === 0 ? 0 : String(v).split('.')[1].length > 1 ? 2 : 1);

/** Isian angka biasa dengan satuan di belakang (m², %, bulan, kamar). */
export function NumberField({ label, value, onChange, unit, help, placeholder, min, max, wide }) {
  const id = useId();
  const [text, setText] = useState(value == null ? '' : formatNumber(value, decimals(value)));
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!focused) setText(value == null ? '' : formatNumber(value, decimals(value)));
  }, [value, focused]);

  function commit() {
    setFocused(false);
    if (text.trim() === '') {
      setError(null);
      onChange(null);
      return;
    }
    const parsed = parseNumber(text);
    if (parsed == null || (min != null && parsed < min) || (max != null && parsed > max)) {
      setError(min != null && max != null ? `Isi angka ${min}–${max}` : 'Isi dengan angka');
      return;
    }
    setError(null);
    onChange(parsed);
  }

  return (
    <FieldShell id={id} label={label} help={help} error={error} wide={wide}>
      <div className="input-unit">
        <input
          id={id}
          inputMode="decimal"
          value={text}
          placeholder={placeholder}
          onFocus={(e) => {
            setFocused(true);
            e.target.select();
          }}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        {unit && <span className="unit">{unit}</span>}
      </div>
    </FieldShell>
  );
}

/** Pilihan Baik / Cukup / Kurang berupa tombol besar. */
export function RatingPicker({ label, value, onChange, help }) {
  return (
    <fieldset className="field">
      <legend>{label}</legend>
      <div className="segmented ratings">
        {Object.entries(RATINGS).map(([key, r]) => (
          <button
            key={key}
            type="button"
            className={`seg rating-${key}${value === key ? ' active' : ''}`}
            aria-pressed={value === key}
            onClick={() => onChange(value === key ? '' : key)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {help && <span className="field-help">{help}</span>}
    </fieldset>
  );
}

export function Segmented({ label, value, options, onChange }) {
  return (
    <fieldset className="field wide">
      <legend>{label}</legend>
      <div className="segmented">
        {options.map((o) => (
          <button key={o.value} type="button" className={`seg${value === o.value ? ' active' : ''}`} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
            <strong>{o.label}</strong>
            {o.hint && <small>{o.hint}</small>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Daftar biaya bebas (nama + jumlah), mis. "Perbaikan atap — Rp 30 jt". */
export function CostList({ items, onChange, addLabel = 'Tambah biaya' }) {
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  return (
    <div className="cost-list">
      {items.map((it) => (
        <div className="cost-row" key={it.id}>
          <TextField label="Untuk apa" value={it.label} onChange={(label) => update(it.id, { label })} help=" " />
          <MoneyField label="Biaya" value={it.amount} onChange={(amount) => update(it.id, { amount })} allowEmpty={false} help=" " />
          <button type="button" className="btn-icon danger" aria-label={`Hapus ${it.label}`} onClick={() => onChange(items.filter((x) => x.id !== it.id))}>
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn small"
        onClick={() => onChange([...items, { id: `x-${Date.now().toString(36)}`, label: '', amount: 0 }])}
      >
        + {addLabel}
      </button>
    </div>
  );
}

export function RatingBadge({ rating, children }) {
  if (!rating) return <span className="badge rating-none">–</span>;
  return <span className={`badge rating-${rating}`}>{children ?? RATINGS[rating].label}</span>;
}
