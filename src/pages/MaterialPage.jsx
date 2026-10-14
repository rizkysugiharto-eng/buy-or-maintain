// Banding material: untuk satu rencana bangun, bandingkan paket material A vs B vs C —
// habis berapa, kapan mulai dapat uang, kapan modal kembali. Di bawahnya daftar paket material.

import { Link, useSearchParams } from 'react-router-dom';
import { CashflowChart, Legend, seriesVar } from '../components/Charts.jsx';
import { MoneyField, NumberField, TextField } from '../components/Fields.jsx';
import Icon from '../components/Icon.jsx';
import { useData } from '../context/DataContext.jsx';
import { materialCostPerM2 } from '../lib/calc.js';
import { formatCompact, formatMonths, formatNumber, formatYears, monthLabel } from '../lib/format.js';
import { shortName } from '../lib/labels.js';

const signed = (v, unit = '') => (v ? `${v > 0 ? '+' : ''}${formatNumber(v, v % 1 ? 1 : 0)}${unit}` : '–');

function diffSentence(a, b, settings) {
  const ra = a.result;
  const rb = b.result;
  const capexDiff = rb.capex.total - ra.capex.total;
  const parts = [`${b.material.name} dibanding ${a.material.name}: modal ${capexDiff >= 0 ? 'lebih besar' : 'lebih hemat'} ${formatCompact(Math.abs(capexDiff), 1)}`];
  if (rb.incomeStartMonth !== ra.incomeStartMonth) {
    const d = rb.incomeStartMonth - ra.incomeStartMonth;
    parts.push(`mulai dapat uang ${Math.abs(d)} bulan ${d > 0 ? 'lebih lambat' : 'lebih cepat'}`);
  }
  const noiDiff = rb.noiMonthly - ra.noiMonthly;
  if (Math.abs(noiDiff) >= 50_000) parts.push(`uang bersih ${noiDiff > 0 ? '+' : '−'}${formatCompact(Math.abs(noiDiff))}/bulan`);
  if (ra.paybackYears != null && rb.paybackYears != null) {
    const d = rb.paybackYears - ra.paybackYears;
    parts.push(Math.abs(d) < 0.5 ? 'balik modal hampir sama' : `modal kembali ±${formatNumber(Math.abs(d), 1)} tahun ${d > 0 ? 'lebih lama' : 'lebih cepat'}`);
  } else if (rb.paybackYears == null && ra.paybackYears != null) {
    parts.push(`modal tidak kembali dalam ${settings.maxYears} tahun`);
  }
  return `${parts.join(', ')}.`;
}

function Comparison({ plan }) {
  const { data, analysis, updatePlan } = useData();
  const { settings } = data;
  const property = data.properties.find((p) => p.id === plan.propertyId);
  const variants = analysis.rows.filter((r) => r.plan.id === plan.id && r.material);
  const chosen = plan.materialIds ?? [];
  const toggle = (mid) => updatePlan(plan.id, { materialIds: chosen.includes(mid) ? chosen.filter((x) => x !== mid) : [...chosen, mid] });

  const bestBy = (get) => {
    const valid = variants.filter((v) => get(v) != null);
    if (valid.length < 2) return null;
    return valid.reduce((a, b) => (get(b) < get(a) ? b : a)).key;
  };
  const cheapest = bestBy((v) => v.result.capex.total);
  const fastest = bestBy((v) => v.result.paybackYears);
  const richest = bestBy((v) => -v.result.noiMonthly);
  const colorOf = (v) => data.materials.findIndex((m) => m.id === v.material.id);
  const parts = [...new Set(variants.flatMap((v) => v.material.components.map((c) => c.part)))];

  return (
    <>
      <section className="card">
        <h2>Paket yang dibandingkan</h2>
        <div className="material-picks">
          {data.materials.map((m) => (
            <label key={m.id} className={`pick${chosen.includes(m.id) ? ' on' : ''}`}>
              <input type="checkbox" checked={chosen.includes(m.id)} onChange={() => toggle(m.id)} />
              <span>
                <strong>{m.name}</strong>
                <small>{formatCompact(materialCostPerM2(m))}/m²</small>
              </span>
            </label>
          ))}
        </div>
        <p className="small muted">
          Rencana: {shortName(property)} · {plan.name} · {formatNumber(plan.buildArea)} m² · {plan.rooms} kamar.{' '}
          <Link to={`/rencana/${plan.id}`}>Ubah angka rencana</Link>
        </p>
      </section>

      {variants.length === 0 && <p className="empty">Centang minimal satu paket material di atas.</p>}

      {variants.length > 0 && (
        <>
          <div className="variant-cards">
            {variants.map((v) => {
              const r = v.result;
              return (
                <section key={v.key} className="card variant-card" style={{ '--accent': seriesVar(colorOf(v)) }}>
                  <h3>
                    <span className="swatch" style={{ background: seriesVar(colorOf(v)), color: seriesVar(colorOf(v)) }} />
                    {v.material.name}
                  </h3>
                  <div className="tags">
                    {v.key === cheapest && <span className="badge rating-baik">Modal paling hemat</span>}
                    {v.key === fastest && <span className="badge rating-baik">Paling cepat balik modal</span>}
                    {v.key === richest && <span className="badge rating-baik">Uang bulanan terbesar</span>}
                  </div>
                  <dl className="qa">
                    <dt>Habis berapa?</dt>
                    <dd>
                      <strong>{formatCompact(r.capex.total, 2)}</strong>
                      <span className="small muted">
                        termasuk bangun {formatCompact(r.capex.build, 2)} ({formatCompact(r.params.buildCostPerM2)}/m²)
                      </span>
                    </dd>
                    <dt>Mulai dapat uang kapan?</dt>
                    <dd>
                      <strong>{r.incomeStartMonth ? `setelah ${formatMonths(r.incomeStartMonth)}` : 'Langsung'}</strong>
                      {r.incomeStartMonth > 0 && <span className="small muted">sekitar {monthLabel(settings.startMonth, r.incomeStartMonth)}</span>}
                    </dd>
                    <dt>Uang bersih per bulan</dt>
                    <dd>
                      <strong>{formatCompact(r.noiMonthly)}</strong>
                      <span className="small muted">sewa {formatCompact(r.params.rentPerRoom)}/kamar</span>
                    </dd>
                    <dt>Modal kembali kapan?</dt>
                    <dd>
                      <strong>{formatYears(r.paybackYears, settings.maxYears)}</strong>
                      {r.paybackMonth != null && <span className="small muted">sekitar {monthLabel(settings.startMonth, r.paybackMonth)}</span>}
                    </dd>
                  </dl>
                  {v.material.note && <p className="small muted">{v.material.note}</p>}
                </section>
              );
            })}
          </div>

          {variants.length > 1 && (
            <section className="card intinya">
              <h2>Intinya</h2>
              <ul>
                {variants.slice(1).map((v) => (
                  <li key={v.key}>{diffSentence(variants[0], v, settings)}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="card">
            <h2>Perjalanan uang per paket</h2>
            <p className="muted">Garis menyentuh Rp0 = modal kembali. Turunan kecil di tengah jalan = biaya peremajaan (cat ulang, ganti atap, dll.).</p>
            <CashflowChart
              years={settings.chartYears}
              series={variants.map((v) => ({ key: v.key, label: v.material.name, colorIndex: colorOf(v), yearly: v.result.yearly }))}
            />
            <Legend items={variants.map((v) => ({ key: v.key, label: v.material.name, colorIndex: colorOf(v) }))} />
          </section>

          <section className="card">
            <h2>Isi tiap paket</h2>
            <div className="table-wrap">
              <table className="table numbers compact">
                <thead>
                  <tr>
                    <th>Bagian</th>
                    {variants.map((v) => (
                      <th key={v.key}>{v.material.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part) => (
                    <tr key={part}>
                      <th scope="row">{part}</th>
                      {variants.map((v) => {
                        const c = v.material.components.find((x) => x.part === part);
                        return (
                          <td key={v.key} className="text-cell">
                            {c ? (
                              <>
                                <div>{c.material || '–'}</div>
                                <div className="small muted">{formatCompact(c.costPerM2)}/m²</div>
                              </>
                            ) : (
                              '–'
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="total">
                    <th scope="row">Biaya bangun per m²</th>
                    {variants.map((v) => (
                      <td key={v.key}>{formatCompact(materialCostPerM2(v.material))}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Lama bangun</th>
                    {variants.map((v) => (
                      <td key={v.key}>{signed(v.material.buildMonthsAdjust, ' bulan')}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Sewa dibanding standar</th>
                    {variants.map((v) => (
                      <td key={v.key}>{signed(v.material.rentAdjustPct, '%')}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Perawatan per tahun</th>
                    {variants.map((v) => (
                      <td key={v.key}>{v.material.maintenancePct != null ? `${formatNumber(v.material.maintenancePct)}% sewa` : '–'}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Peremajaan</th>
                    {variants.map((v) => (
                      <td key={v.key}>
                        {v.material.refreshEveryYears
                          ? `tiap ${v.material.refreshEveryYears} th, ${formatCompact(v.material.refreshCostPerM2)}/m²`
                          : '–'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function MaterialEditor({ material, index }) {
  const { updateMaterial, deleteMaterial, addMaterial, data } = useData();
  const set = (key) => (value) => updateMaterial(material.id, { [key]: value });
  const components = material.components ?? [];
  const setComp = (cid, patch) => set('components')(components.map((c) => (c.id === cid ? { ...c, ...patch } : c)));
  const usedBy = data.plans.filter((p) => p.materialIds?.includes(material.id)).length;

  return (
    <details className="card material-editor">
      <summary>
        <span className="swatch" style={{ background: seriesVar(index), color: seriesVar(index) }} />
        <strong>{material.name}</strong>
        <span className="muted">{formatCompact(materialCostPerM2(material))}/m²</span>
        <span className="small muted">{usedBy ? `dipakai ${usedBy} rencana` : 'belum dipakai'}</span>
      </summary>
      <div className="form-grid">
        <TextField label="Nama paket" value={material.name} onChange={set('name')} />
        <TextField label="Keterangan singkat" value={material.note} onChange={set('note')} />
      </div>

      <h3>Komponen & harga per m² bangunan</h3>
      <p className="small muted">Harga borongan (bahan + upah) per m² luas bangunan. Jumlah semua komponen = biaya bangun per m².</p>
      <div className="component-list">
        {components.map((c) => (
          <div className="component-row" key={c.id}>
            <TextField label="Bagian" value={c.part} onChange={(part) => setComp(c.id, { part })} help=" " />
            <TextField label="Material" value={c.material} onChange={(m) => setComp(c.id, { material: m })} help=" " />
            <MoneyField label="Per m²" value={c.costPerM2} onChange={(costPerM2) => setComp(c.id, { costPerM2 })} allowEmpty={false} help=" " />
            <button type="button" className="btn-icon danger" aria-label={`Hapus ${c.part}`} onClick={() => set('components')(components.filter((x) => x.id !== c.id))}>
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn small"
          onClick={() => set('components')([...components, { id: `c-${Date.now().toString(36)}`, part: '', material: '', costPerM2: 0 }])}
        >
          + Tambah komponen
        </button>
      </div>

      <h3>Pengaruh ke hasil</h3>
      <p className="small muted">Kosongkan kalau sama dengan isian di rencana.</p>
      <div className="form-grid">
        <NumberField label="Lama bangun" unit="± bulan" value={material.buildMonthsAdjust} onChange={set('buildMonthsAdjust')} help="Misal −1 kalau lebih cepat dibangun" min={-24} max={24} />
        <NumberField label="Sewa per kamar" unit="± %" value={material.rentAdjustPct} onChange={set('rentAdjustPct')} help="Misal +20 kalau finishing lebih bagus" min={-90} max={300} />
        <NumberField label="Keterisian" unit="± poin" value={material.occupancyAdjustPt} onChange={set('occupancyAdjustPt')} min={-50} max={50} />
        <NumberField label="Perawatan per tahun" unit="% sewa" value={material.maintenancePct} onChange={set('maintenancePct')} min={0} max={50} />
        <MoneyField label="Isi kamar per kamar" value={material.furnishingPerRoom} onChange={set('furnishingPerRoom')} placeholder="Kosong = ikut rencana" />
        <NumberField label="Desain, izin, pengawasan" unit="%" value={material.designPct} onChange={set('designPct')} min={0} max={30} />
        <NumberField label="Peremajaan setiap" unit="tahun" value={material.refreshEveryYears} onChange={set('refreshEveryYears')} help="Cat ulang, ganti atap/keramik, dll." min={0} max={60} />
        <MoneyField label="Biaya peremajaan per m²" value={material.refreshCostPerM2} onChange={set('refreshCostPerM2')} />
      </div>

      <div className="btn-row">
        <button type="button" className="btn" onClick={() => addMaterial(material)}>
          <Icon name="copy" /> Salin paket ini
        </button>
        <button
          type="button"
          className="btn danger"
          onClick={() => window.confirm(`Hapus paket "${material.name}"?${usedBy ? ` Paket ini dipakai ${usedBy} rencana.` : ''}`) && deleteMaterial(material.id)}
        >
          <Icon name="trash" /> Hapus paket
        </button>
      </div>
    </details>
  );
}

export default function MaterialPage() {
  const { data, addMaterial } = useData();
  const [params, setParams] = useSearchParams();
  const buildPlans = data.plans.filter((p) => p.type === 'bangun' && data.properties.some((x) => x.id === p.propertyId));
  const selected = buildPlans.find((p) => p.id === params.get('rencana')) ?? buildPlans[0];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Banding Material</h1>
          <p className="muted">Kalau bangun pakai material A habis berapa, kapan mulai dapat uang, dan kapan modal kembali — dibanding material B.</p>
        </div>
      </div>

      {buildPlans.length === 0 ? (
        <section className="card">
          <p>
            Belum ada rencana <b>Bangun baru</b>. Buka salah satu <Link to="/properti">properti</Link>, lalu tekan “+ Bangun baru”.
          </p>
        </section>
      ) : (
        <>
          <div className="field plan-select">
            <label htmlFor="plan-select">Rencana yang dibandingkan</label>
            <select id="plan-select" value={selected.id} onChange={(e) => setParams({ rencana: e.target.value })}>
              {buildPlans.map((p) => {
                const property = data.properties.find((x) => x.id === p.propertyId);
                return (
                  <option key={p.id} value={p.id}>
                    {shortName(property)} · {p.name}
                  </option>
                );
              })}
            </select>
          </div>
          <Comparison plan={selected} />
        </>
      )}

      <h2 className="section-title">Daftar paket material</h2>
      <p className="muted">Ketuk paket untuk mengubah isi dan harganya. Angka bawaan adalah perkiraan — ganti dengan RAB dari kontraktor.</p>
      <div className="material-list">
        {data.materials.map((m, i) => (
          <MaterialEditor key={m.id} material={m} index={i} />
        ))}
      </div>
      <button type="button" className="btn" onClick={() => addMaterial()}>
        <Icon name="plus" /> Tambah paket material
      </button>
    </div>
  );
}
