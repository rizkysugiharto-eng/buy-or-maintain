// Data & asumsi: bagikan, simpan/buka file, unduh tabel Excel, dan asumsi hitungan.

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShareDialog } from '../components/Layout.jsx';
import { MoneyField, NumberField, TextField } from '../components/Fields.jsx';
import Icon from '../components/Icon.jsx';
import { useData } from '../context/DataContext.jsx';
import { exampleData } from '../data/example.js';
import { SOURCES, checkedCount } from '../data/sources.js';
import { formatCompact, formatNumber } from '../lib/format.js';
import { DEFAULT_SETTINGS } from '../lib/calc.js';
import { downloadFile, readJsonFile } from '../lib/storage.js';

const csvCell = (v) => {
  if (v == null) return '';
  const s = typeof v === 'number' ? String(Math.round(v * 100) / 100).replace('.', ',') : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const signed = (v) => `${v > 0 ? '+' : ''}${formatNumber(v ?? 0, v % 1 ? 1 : 0)}`;

// Contoh hitungan langsung di bawah tiap isian, supaya arti angka minus/plus jelas
function ScenarioFields({ label, value, onChange, note }) {
  const set = (key) => (v) => onChange({ ...value, [key]: v ?? 0 });
  const pct = (base, v) => base * (1 + (v ?? 0) / 100);
  return (
    <fieldset className="field wide scenario">
      <legend>{label}</legend>
      <p className="small muted">{note}</p>
      <div className="form-grid">
        <NumberField
          label="Sewa per kamar"
          unit="%"
          value={value.rentPct}
          onChange={set('rentPct')}
          min={-90}
          max={100}
          help={`${signed(value.rentPct)}% → sewa Rp1,7 jt jadi ${formatCompact(pct(1_700_000, value.rentPct), 2)}`}
        />
        <NumberField
          label="Kamar terisi"
          unit="poin"
          value={value.occupancyPt}
          onChange={set('occupancyPt')}
          min={-100}
          max={100}
          help={`${signed(value.occupancyPt)} poin → terisi 92% jadi ${formatNumber(Math.min(100, Math.max(0, 92 + (value.occupancyPt ?? 0))))}%`}
        />
        <NumberField
          label="Biaya rutin"
          unit="%"
          value={value.opexPct}
          onChange={set('opexPct')}
          min={-90}
          max={200}
          help={`${signed(value.opexPct)}% → Rp3,5 jt/bulan jadi ${formatCompact(pct(3_500_000, value.opexPct), 2)}`}
        />
        <NumberField
          label="Biaya bangun/renovasi"
          unit="%"
          value={value.capexPct}
          onChange={set('capexPct')}
          min={-90}
          max={200}
          help={`${signed(value.capexPct)}% → Rp2 M jadi ${formatCompact(pct(2_000_000_000, value.capexPct), 2)}`}
        />
      </div>
    </fieldset>
  );
}

function SourcesSection() {
  const { data, updateSource } = useData();
  const sources = data.sources ?? {};
  const done = checkedCount(sources);
  return (
    <section className="card" id="sumber-angka">
      <h2>Sumber angka</h2>
      <p className="muted">
        Dari mana setiap angka berasal, dan sumber resmi untuk memastikannya. Tandai <b>Sudah dicek</b> setelah angkanya diganti dengan data
        yang bisa dipegang, dan tulis buktinya di catatan.
      </p>
      <div className="source-progress" aria-label={`${done} dari ${SOURCES.length} sudah dicek`}>
        <div className="source-bar">
          <span style={{ width: `${(done / SOURCES.length) * 100}%` }} />
        </div>
        <strong>
          {done} dari {SOURCES.length} sudah dicek
        </strong>
      </div>
      <div className="source-list">
        {SOURCES.map((src) => {
          const state = sources[src.key] ?? {};
          const checked = state.status === 'dicek';
          return (
            <div key={src.key} className={`source-item${checked ? ' checked' : ''}`}>
              <div className="source-head">
                <h3>{src.label}</h3>
                <div className="segmented source-status" role="group" aria-label={`Status ${src.label}`}>
                  <button type="button" className={`seg${!checked ? ' active' : ''}`} aria-pressed={!checked} onClick={() => updateSource(src.key, { status: 'perkiraan' })}>
                    Perkiraan
                  </button>
                  <button
                    type="button"
                    className={`seg rating-baik${checked ? ' active' : ''}`}
                    aria-pressed={checked}
                    onClick={() => updateSource(src.key, { status: 'dicek' })}
                  >
                    Sudah dicek
                  </button>
                </div>
              </div>
              <dl className="source-meta">
                <dt>Dipakai di</dt>
                <dd>{src.usedIn}</dd>
                <dt>Sumber sekarang</dt>
                <dd>{src.now}</dd>
                <dt>Cara memastikan</dt>
                <dd>{src.verify}</dd>
              </dl>
              <details className="source-how">
                <summary>Cara dapetin angkanya</summary>
                <ol>
                  {src.how.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="small">
                  <b>Masukkan di:</b> {src.where}
                </p>
              </details>
              <TextField
                label="Catatan / bukti"
                value={state.note}
                onChange={(note) => updateSource(src.key, { note })}
                placeholder="Misal: RAB CV Maju Jaya, 20 Okt 2026 — Rp4,6 jt/m²"
                wide
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const { data, analysis, updateSettings, setTitle, replaceData, clearAll } = useData();
  const [sharing, setSharing] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInput = useRef(null);
  const s = data.settings;
  const set = (key) => (value) => updateSettings({ [key]: value ?? DEFAULT_SETTINGS[key] });
  const stamp = new Date().toISOString().slice(0, 10);
  const [params] = useSearchParams();

  // Dibuka dari Ringkasan (?bagian=sumber) → langsung gulir ke Sumber angka
  // (ditunda sebentar: kerangka halaman menggulir ke atas setiap pindah menu)
  useEffect(() => {
    if (params.get('bagian') !== 'sumber') return undefined;
    const timer = setTimeout(() => document.getElementById('sumber-angka')?.scrollIntoView({ block: 'start' }), 50);
    return () => clearTimeout(timer);
  }, [params]);

  async function openFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      replaceData(await readJsonFile(file), `File "${file.name}" sudah dibuka.`);
      setFileError(null);
    } catch (err) {
      setFileError(err.message || 'File tidak bisa dibuka');
    }
  }

  function exportCsv() {
    const header = ['Properti', 'Rencana', 'Material', 'Harga beli', 'Total modal', 'Biaya bangun/renovasi', 'Uang bersih per bulan', 'Hasil bersih %/tahun', 'Modal kembali (tahun)', 'Mulai dapat uang (bulan)', 'Kamar', 'Sewa per kamar'];
    const lines = analysis.rows.map((r) =>
      [
        r.property.name,
        r.plan.name,
        r.material?.name ?? '',
        r.result.capex.purchase,
        r.result.capex.total,
        r.result.capex.build,
        r.result.noiMonthly,
        r.result.netYield,
        r.result.paybackYears ?? `>${s.maxYears}`,
        r.result.incomeStartMonth,
        r.result.params.rooms,
        r.result.params.rentPerRoom,
      ]
        .map(csvCell)
        .join(';'),
    );
    downloadFile(`perbandingan-kos-${stamp}.csv`, `﻿${[header.join(';'), ...lines].join('\n')}`, 'text/csv;charset=utf-8');
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Data & Asumsi</h1>
          <p className="muted">Data tersimpan otomatis di perangkat ini. Untuk pindah perangkat atau berbagi, pakai link atau file.</p>
        </div>
      </div>

      <section className="card">
        <h2>Bagikan & simpan</h2>
        <div className="form-grid">
          <TextField label="Judul perbandingan" value={data.title} onChange={setTitle} placeholder="Misal: Pilihan kos Malang, Oktober 2026" wide />
        </div>
        <div className="action-grid">
          <button type="button" className="action" onClick={() => setSharing(true)}>
            <Icon name="share" size={22} />
            <strong>Bagikan link</strong>
            <span>Kirim ke keluarga lewat WhatsApp</span>
          </button>
          <button type="button" className="action" onClick={() => downloadFile(`data-kos-${stamp}.json`, JSON.stringify(data, null, 2))}>
            <Icon name="download" size={22} />
            <strong>Simpan ke file</strong>
            <span>Cadangan data (.json)</span>
          </button>
          <button type="button" className="action" onClick={() => fileInput.current?.click()}>
            <Icon name="upload" size={22} />
            <strong>Buka file</strong>
            <span>Dari file .json yang pernah disimpan</span>
          </button>
          <button type="button" className="action" onClick={exportCsv}>
            <Icon name="download" size={22} />
            <strong>Unduh tabel Excel</strong>
            <span>Semua pilihan & angkanya (.csv)</span>
          </button>
        </div>
        <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={openFile} />
        {fileError && (
          <p className="field-error" role="alert">
            {fileError}
          </p>
        )}
      </section>

      <section className="card">
        <h2>Asumsi hitungan</h2>
        <p className="muted">Berlaku untuk semua properti. Angka bawaan mengikuti laporan analisis.</p>
        <div className="form-grid">
          <MoneyField label="Dana yang disiapkan keluarga" value={s.budget} onChange={set('budget')} help="Modal di atas ini dinilai Cukup/Kurang di rapor" allowEmpty={false} />
          <TextField label="Mulai hitung dari bulan" value={s.startMonth} onChange={set('startMonth')} help="Format TAHUN-BULAN, misal 2026-11" />
          <NumberField label="Hasil bersih yang dianggap layak (minimal)" unit="%/tahun" value={s.targetYieldLow} onChange={set('targetYieldLow')} min={0.1} max={50} />
          <NumberField label="Hasil bersih yang dianggap layak (ideal)" unit="%/tahun" value={s.targetYieldHigh} onChange={set('targetYieldHigh')} min={0.1} max={50} />
          <NumberField label="Balik modal dinilai Baik kalau ≤" unit="tahun" value={s.paybackGood} onChange={set('paybackGood')} min={1} max={60} />
          <NumberField label="Balik modal dinilai Cukup kalau ≤" unit="tahun" value={s.paybackOk} onChange={set('paybackOk')} min={1} max={60} />
          <NumberField label="Kenaikan sewa per tahun" unit="%" value={s.rentGrowthPct} onChange={set('rentGrowthPct')} help="0 = sewa dianggap tetap (seperti di laporan)" min={-20} max={30} />
          <NumberField label="Kenaikan biaya rutin per tahun" unit="%" value={s.costGrowthPct} onChange={set('costGrowthPct')} min={-20} max={30} />
          <NumberField label="Panjang grafik perjalanan uang" unit="tahun" value={s.chartYears} onChange={set('chartYears')} min={5} max={60} />
        </div>
        <ScenarioFields
          label="Keadaan pesimis"
          note="Seberapa jauh keadaan memburuk dibanding normal. Minus = turun, plus = naik. Kamar terisi memakai “poin” karena sudah berupa persen: 92% − 12 poin = 80%."
          value={s.scenarios.pesimis}
          onChange={(v) => updateSettings({ scenarios: { ...s.scenarios, pesimis: v } })}
        />
        <ScenarioFields
          label="Keadaan optimis"
          note="Seberapa jauh keadaan membaik dibanding normal. Kamar terisi maksimal 100%."
          value={s.scenarios.optimis}
          onChange={(v) => updateSettings({ scenarios: { ...s.scenarios, optimis: v } })}
        />
        <button type="button" className="btn small" onClick={() => updateSettings(structuredClone(DEFAULT_SETTINGS))}>
          Kembalikan asumsi bawaan
        </button>
      </section>

      <SourcesSection />

      <section className="card">
        <h2>Mulai ulang</h2>
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => window.confirm('Ganti semua data dengan data contoh?') && replaceData(exampleData(), 'Data contoh dimuat.')}>
            Muat data contoh
          </button>
          <button type="button" className="btn danger" onClick={() => window.confirm('Kosongkan semua properti & rencana?') && clearAll()}>
            <Icon name="trash" /> Kosongkan semua
          </button>
        </div>
        <p className="small muted">Data sebelumnya selalu bisa dikembalikan lewat tombol “Kembalikan data sebelumnya” yang muncul di atas.</p>
      </section>

      {sharing && <ShareDialog onClose={() => setSharing(false)} />}
    </div>
  );
}
