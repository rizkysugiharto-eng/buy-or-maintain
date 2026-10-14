// Grafik yang dipakai ulang (Recharts). Warna mengikuti entitas (properti / paket material),
// bukan urutan peringkat, dan nilai selalu ditulis di ujung batang supaya tidak bergantung warna.

import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext.jsx';
import { formatCompact } from '../lib/format.js';

const SERIES = 8;

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name) => style.getPropertyValue(name).trim();
  return {
    series: Array.from({ length: SERIES }, (_, i) => get(`--series-${i + 1}`)),
    grid: get('--grid'),
    axis: get('--axis'),
    muted: get('--text-muted'),
    secondary: get('--text-secondary'),
    primary: get('--text-primary'),
    surface: get('--surface-1'),
  };
}

export function useChartColors() {
  const { prefs } = useData();
  const [colors, setColors] = useState(readColors);
  useEffect(() => setColors(readColors()), [prefs.theme]);
  return colors;
}

export const seriesVar = (index) => `var(--series-${(index % SERIES) + 1})`;

function TooltipBox({ active, payload, label, formatValue, formatLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tt-title">{formatLabel ? formatLabel(label, payload) : label}</div>
      {payload.map((p) => (
        <div className="tt-row" key={p.dataKey ?? p.name}>
          {payload.length > 1 && <span className="key" style={{ background: p.color }} />}
          <strong>{formatValue(p.value, p.payload)}</strong>
          {payload.length > 1 && <span>{p.name}</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * Batang horizontal, satu per pilihan. data: [{ label, value, colorIndex }]
 * Dibuat dengan HTML biasa: label di atas batang supaya tetap lega di layar HP,
 * dan nilai selalu tertulis di ujung batang (tidak bergantung warna).
 * `target` menggambar garis putus-putus (mis. batas balik modal ideal 18 tahun).
 */
export function HBarChart({ data, formatValue, target, targetLabel, domainMax }) {
  const max = domainMax ?? Math.max(...data.map((d) => d.value ?? 0), target ?? 0, 1);
  const pct = (v) => `${Math.max(0, Math.min(100, ((v ?? 0) / max) * 100))}%`;
  return (
    <ul className="hbars">
      {data.map((d) => (
        <li key={d.label}>
          <span className="hbar-label">{d.label}</span>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: pct(d.value), background: seriesVar(d.colorIndex) }} />
            <span className="hbar-value" style={{ left: `calc(${pct(d.value)} + 8px)` }}>
              {formatValue(d.value, d)}
            </span>
            {target != null && <span className="hbar-target" style={{ left: pct(target) }} aria-hidden="true" />}
          </div>
        </li>
      ))}
      {target != null && (
        <li className="hbar-target-note" aria-hidden="true">
          <span className="hbar-target-key" /> {targetLabel}
        </li>
      )}
    </ul>
  );
}

/**
 * Perjalanan uang (arus kas kumulatif): mulai minus sebesar modal, naik saat uang sewa masuk.
 * Garis memotong Rp0 = modal kembali. series: [{ key, label, colorIndex, yearly: [{year, value}] }]
 */
export function CashflowChart({ series, years = 30 }) {
  const colors = useChartColors();
  const rows = Array.from({ length: years + 1 }, (_, year) => {
    const row = { year };
    for (const s of series) row[s.key] = s.yearly[year]?.value ?? null;
    return row;
  });
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rows} margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid vertical={false} stroke={colors.grid} />
          <XAxis
            dataKey="year"
            tick={{ fill: colors.muted, fontSize: 12 }}
            tickFormatter={(y) => `th ${y}`}
            stroke={colors.axis}
            interval={years > 20 ? 4 : 1}
          />
          <YAxis tick={{ fill: colors.muted, fontSize: 12 }} tickFormatter={(v) => formatCompact(v, 1)} width={86} axisLine={false} tickLine={false} />
          <ReferenceLine y={0} stroke={colors.secondary} strokeWidth={1.5} label={{ value: 'modal kembali', position: 'insideTopLeft', fill: colors.secondary, fontSize: 11 }} />
          <Tooltip content={<TooltipBox formatValue={(v) => formatCompact(v)} formatLabel={(y) => `Akhir tahun ke-${y}`} />} />
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={colors.series[s.colorIndex % SERIES]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: colors.surface, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Keterangan warna (selalu ada kalau lebih dari satu seri). */
export function Legend({ items }) {
  if (items.length < 2) return null;
  return (
    <ul className="legend">
      {items.map((it) => (
        <li key={it.key}>
          <span className="swatch" style={{ background: seriesVar(it.colorIndex) }} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
