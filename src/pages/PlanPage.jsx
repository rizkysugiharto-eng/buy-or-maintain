// Ubah angka satu rencana; hasilnya langsung terlihat di sebelah kanan.

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CashflowChart, Legend } from '../components/Charts.jsx';
import { CostList, MoneyField, NumberField, Segmented, TextField } from '../components/Fields.jsx';
import Icon from '../components/Icon.jsx';
import { useData } from '../context/DataContext.jsx';
import { regionRules } from '../data/regions.js';
import { SHS_MAINTENANCE, SHS_SOURCE } from '../data/shs.js';
import { materialPricesVerified } from '../data/sources.js';
import { PLAN_TYPES, SCENARIOS, analyze, materialCostPerM2 } from '../lib/calc.js';
import { formatCompact, formatMonths, formatNumber, formatPercent, formatYears, monthLabel } from '../lib/format.js';

function Line({ label, value, strong, minus }) {
  return (
    <tr className={strong ? 'total' : undefined}>
      <th scope="row">{label}</th>
      <td>
        {minus && value ? '− ' : ''}
        {formatCompact(value, 1)}
      </td>
    </tr>
  );
}

export function ResultDetail({ plan, property, material, settings }) {
  const r = analyze(plan, property, material, settings);
  const { capex: c, income: inc } = r;
  const area = r.params.buildArea || Number(property?.buildingArea) || 0;
  return (
    <>
      <div className="stats big">
        <div className="stat">
          <span className="stat-label">Total modal</span>
          <strong className="stat-value">{formatCompact(c.total, 2)}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Uang bersih / bulan</span>
          <strong className="stat-value">{formatCompact(r.noiMonthly)}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Modal kembali</span>
          <strong className="stat-value">{formatYears(r.paybackYears, settings.maxYears)}</strong>
          {r.paybackMonth != null && <span className="stat-sub">sekitar {monthLabel(settings.startMonth, r.paybackMonth)}</span>}
        </div>
        <div className="stat">
          <span className="stat-label">Mulai dapat uang</span>
          <strong className="stat-value">{formatMonths(r.incomeStartMonth)}</strong>
          {r.incomeStartMonth > 0 && <span className="stat-sub">sekitar {monthLabel(settings.startMonth, r.incomeStartMonth)}</span>}
        </div>
      </div>

      <h3>Kalau keadaan lebih baik / lebih buruk</h3>
      <div className="table-wrap">
        <table className="table numbers compact">
          <thead>
            <tr>
              <th>Keadaan</th>
              <th>Uang bersih / bulan</th>
              <th>Hasil / tahun</th>
              <th>Modal kembali</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(SCENARIOS).map(([key, label]) => {
              const s = key === 'moderat' ? r : analyze(plan, property, material, settings, key);
              return (
                <tr key={key} className={key === 'moderat' ? 'total' : undefined}>
                  <th scope="row">{label}</th>
                  <td>{formatCompact(s.noiMonthly)}</td>
                  <td>{formatPercent(s.netYield)}</td>
                  <td>{formatYears(s.paybackYears, settings.maxYears)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        Pesimis = sewa {settings.scenarios.pesimis.rentPct}%, keterisian {settings.scenarios.pesimis.occupancyPt} poin, biaya rutin +
        {settings.scenarios.pesimis.opexPct}%, biaya bangun/renovasi +{settings.scenarios.pesimis.capexPct}%.
      </p>

      <div className="two-tables">
        <div>
          <h3>Rincian modal</h3>
          <table className="table numbers compact">
            <tbody>
              <Line label="Harga beli" value={c.purchase} />
              <Line label={`Surat-surat (${formatPercent(c.transactionPct)})`} value={c.transaction} />
              {c.construction > 0 && <Line label="Konstruksi" value={c.construction} />}
              {c.furnishing > 0 && <Line label="Isi kamar" value={c.furnishing} />}
              {c.design > 0 && <Line label="Desain, izin, pengawasan" value={c.design} />}
              {c.contingency > 0 && <Line label="Cadangan tak terduga" value={c.contingency} />}
              {c.extras > 0 && <Line label="Biaya lain" value={c.extras} />}
              <Line label="Total modal" value={c.total} strong />
            </tbody>
          </table>
        </div>
        <div>
          <h3>Uang masuk & keluar per tahun</h3>
          <table className="table numbers compact">
            <tbody>
              <Line label="Sewa kalau selalu penuh" value={inc.gross} />
              <Line label={`Sewa yang masuk (terisi ${formatPercent(r.params.occupancyPct, 0)})`} value={inc.effective} />
              <Line label="Air, wifi, listrik bersama, penjaga" value={inc.opex} minus />
              <Line label="Perawatan" value={inc.maintenance} minus />
              <Line label="PBB" value={inc.pbb} minus />
              {inc.management > 0 && <Line label="Fee pengelola" value={inc.management} minus />}
              {inc.tax > 0 && <Line label="Pajak penghasilan" value={inc.tax} minus />}
              {inc.localTax > 0 && <Line label="Pajak daerah kos" value={inc.localTax} minus />}
              <Line label="Uang bersih per tahun" value={inc.noi} strong />
            </tbody>
          </table>
        </div>
      </div>
      <ul className="facts">
        <li>
          Hasil bersih <b>{formatPercent(r.netYield)}</b> per tahun — setiap Rp100 juta modal kembali ±{formatCompact(r.per100jt)} per tahun.
        </li>
        {r.breakEvenOccupancy != null && (
          <li>
            Biaya rutin sudah tertutup kalau minimal <b>{formatPercent(r.breakEvenOccupancy, 0)}</b> kamar terisi (±
            {Math.ceil((r.breakEvenOccupancy / 100) * r.params.rooms)} dari {r.params.rooms} kamar).
          </li>
        )}
        {r.maxPrice != null && (
          <li>
            Supaya hasil minimal {formatPercent(settings.targetYieldLow)}, harga beli maksimal <b>{formatCompact(r.maxPrice, 2)}</b>.
          </li>
        )}
        {r.roomCost != null && <li>Modal per kamar ±{formatCompact(r.roomCost)}.</li>}
        {area > 0 && inc.maintenance > 0 && (
          <li>
            Perawatan ±{formatCompact(inc.maintenance / area)} per m² bangunan per tahun. Sebagai batas atas: Pemkot Malang menganggarkan{' '}
            {formatCompact(SHS_MAINTENANCE.singleStorey)} (1 lantai) – {formatCompact(SHS_MAINTENANCE.multiStorey)} (bertingkat) per m² per tahun
            untuk gedung kantornya ({SHS_SOURCE.short}).
          </li>
        )}
      </ul>
    </>
  );
}

export default function PlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, analysis, updatePlan, deletePlan, duplicatePlan } = useData();
  const [variantIdx, setVariantIdx] = useState(0);
  const plan = data.plans.find((p) => p.id === id);
  const property = plan && data.properties.find((p) => p.id === plan.propertyId);

  if (!plan || !property) {
    return (
      <div className="empty">
        <p>Rencana tidak ditemukan.</p>
        <Link className="btn" to="/properti">
          Kembali
        </Link>
      </div>
    );
  }

  const set = (key) => (value) => updatePlan(plan.id, { [key]: value });
  const settings = data.settings;
  const variants = analysis.rows.filter((r) => r.plan.id === plan.id);
  const current = variants[Math.min(variantIdx, variants.length - 1)];
  const region = regionRules(property, settings);
  const isBuild = plan.type === 'bangun';
  const chosen = plan.materialIds ?? [];
  // Warna mengikuti paket material, sama dengan di halaman Banding Material
  const colorOf = (v) => Math.max(0, data.materials.findIndex((m) => m.id === v.material?.id));

  function toggleMaterial(mid) {
    set('materialIds')(chosen.includes(mid) ? chosen.filter((x) => x !== mid) : [...chosen, mid]);
  }

  return (
    <div className="page">
      <Link to={`/properti/${property.id}`} className="back-link">
        <Icon name="back" /> {property.name}
      </Link>
      <div className="page-head">
        <div>
          <h1>{plan.name}</h1>
          <p className="muted">
            {PLAN_TYPES[plan.type].label} · {property.name}
          </p>
        </div>
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => navigate(`/rencana/${duplicatePlan(plan)}`)}>
            <Icon name="copy" /> Salin
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              if (window.confirm(`Hapus rencana "${plan.name}"?`)) {
                deletePlan(plan.id);
                navigate(`/properti/${property.id}`);
              }
            }}
          >
            <Icon name="trash" /> Hapus
          </button>
        </div>
      </div>

      <div className="split">
        <div className="split-form">
          <section className="card">
            <h2>
              <span className="step">1</span> Rencananya
            </h2>
            <div className="form-grid">
              <TextField label="Nama rencana" value={plan.name} onChange={set('name')} wide />
              <Segmented
                label="Jenis rencana"
                value={plan.type}
                onChange={set('type')}
                options={Object.entries(PLAN_TYPES).map(([value, t]) => ({ value, label: t.label, hint: t.hint }))}
              />
            </div>
          </section>

          <section className="card">
            <h2>
              <span className="step">2</span> Modal
            </h2>
            <div className="form-grid">
              <MoneyField
                label="Harga beli"
                value={plan.purchasePrice}
                onChange={set('purchasePrice')}
                placeholder="Kosong = harga diminta"
                help={plan.purchasePrice == null ? `Memakai harga yang diminta: ${formatCompact(property.askingPrice, 2)}. Isi kalau mau coba harga tawar.` : null}
              />
              {plan.transactionAuto ? (
                <div className="field">
                  <span className="field-label">Biaya surat-surat</span>
                  <div className="readout">
                    <strong>{formatCompact(current?.result.capex.transaction, 1)}</strong>
                    <span className="muted"> ≈ {formatPercent(current?.result.capex.transactionPct)} dari harga</span>
                  </div>
                  <span className="field-help">
                    BPHTB {formatPercent(region.bphtbPct, 0)} × (harga − {formatCompact(region.npoptkp)}) + PPAT maks. 1% + balik nama BPN · {region.name}
                  </span>
                </div>
              ) : (
                <NumberField
                  label="Biaya surat-surat"
                  unit="%"
                  value={plan.transactionPct}
                  onChange={set('transactionPct')}
                  help="Pajak beli (BPHTB), notaris/PPAT"
                  min={0}
                  max={30}
                />
              )}
              <label className="check wide">
                <input type="checkbox" checked={!!plan.transactionAuto} onChange={(e) => set('transactionAuto')(e.target.checked)} />
                <span>
                  Hitung biaya surat-surat otomatis sesuai aturan {region.name} (BPHTB & NPOPTKP dari aturan daerah di halaman properti, honor
                  PPAT PP No. 24/2016). Matikan kalau sudah dapat angka pasti dari notaris.
                </span>
              </label>
            </div>

            {isBuild && (
              <>
                <h3>Biaya bangun</h3>
                <div className="form-grid">
                  <NumberField label="Luas bangunan baru" unit="m²" value={plan.buildArea} onChange={set('buildArea')} help="Total semua lantai" min={0} />
                  <MoneyField label="Isi kamar per kamar" value={plan.furnishingPerRoom} onChange={set('furnishingPerRoom')} help="AC, kasur, lemari" />
                </div>
                <fieldset className="field wide">
                  <legend>Paket material yang mau dibandingkan</legend>
                  <div className="material-picks">
                    {data.materials.map((m) => (
                      <label key={m.id} className={`pick${chosen.includes(m.id) ? ' on' : ''}`}>
                        <input type="checkbox" checked={chosen.includes(m.id)} onChange={() => toggleMaterial(m.id)} />
                        <span>
                          <strong>{m.name}</strong>
                          <small>{formatCompact(materialCostPerM2(m))}/m²</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  {region.buildIndex !== 1 && (
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={plan.regionalPriceAdjust !== false}
                        onChange={(e) => set('regionalPriceAdjust')(e.target.checked)}
                      />
                      <span>
                        Sesuaikan harga paket ke harga {region.name} (× {formatNumber(region.buildIndex, 2)}, acuan HSBGN). Matikan kalau harga paketnya
                        sudah dari RAB kontraktor setempat.
                      </span>
                    </label>
                  )}
                  <span className="field-help">
                    {!materialPricesVerified(data.sources) && <b className="warn-text">Harga paket masih angka contoh, belum dari RAB. </b>}
                    Pilih 2 atau lebih untuk dibandingkan. Isi & harga tiap paket diatur di menu <Link to="/material">Banding Material</Link>.
                  </span>
                </fieldset>
                {chosen.length === 0 && (
                  <div className="form-grid">
                    <MoneyField label="Biaya bangun per m²" value={plan.buildCostPerM2} onChange={set('buildCostPerM2')} help="Dipakai kalau belum memilih paket material" />
                  </div>
                )}
              </>
            )}

            <h3>{plan.type === 'renovasi' ? 'Rincian biaya renovasi' : isBuild ? 'Biaya lain (bongkar, pemasaran, cadangan)' : 'Perbaikan / biaya lain'}</h3>
            <CostList items={plan.extraCosts ?? []} onChange={set('extraCosts')} />
          </section>

          <section className="card">
            <h2>
              <span className="step">3</span> Uang sewa
            </h2>
            <div className="form-grid">
              <NumberField
                label={plan.type === 'beli' ? 'Waktu sebelum bisa disewakan' : isBuild ? 'Lama pembangunan' : 'Lama renovasi'}
                unit="bulan"
                value={plan.buildMonths}
                onChange={set('buildMonths')}
                help={isBuild && chosen.length ? 'Paket material bisa mempercepat/memperlambat' : 'Selama ini belum ada uang sewa masuk'}
                min={0}
                max={120}
              />
              <NumberField label="Jumlah kamar" unit="kamar" value={plan.rooms} onChange={set('rooms')} min={0} />
              <MoneyField
                label="Sewa per kamar per bulan"
                value={plan.rentPerRoom}
                onChange={set('rentPerRoom')}
                help={isBuild && chosen.length ? 'Untuk paket Standar; paket lain bisa lebih mahal/murah' : null}
              />
              <NumberField label="Rata-rata kamar terisi" unit="%" value={plan.occupancyPct} onChange={set('occupancyPct')} help="Kos ramai umumnya 88–92%" min={0} max={100} />
            </div>
            <details className="advanced">
              <summary>Biaya rutin & pengaturan lanjutan</summary>
              <div className="form-grid">
                <MoneyField label="Biaya tetap per bulan" value={plan.opexFixedMonthly} onChange={set('opexFixedMonthly')} help="Penjaga/kebersihan, wifi dasar" />
                <MoneyField label="Biaya per kamar per bulan" value={plan.opexPerRoomMonthly} onChange={set('opexPerRoomMonthly')} help="Air, listrik bersama (listrik kamar pakai token penyewa)" />
                <NumberField label="Perawatan" unit="% sewa" value={plan.maintenancePct} onChange={set('maintenancePct')} help="Bisa diganti oleh paket material" min={0} max={50} />
                <MoneyField label="PBB per tahun" value={plan.pbbYearly} onChange={set('pbbYearly')} />
                <NumberField label="Fee pengelola" unit="% sewa" value={plan.managementPct} onChange={set('managementPct')} help="Kalau dikelola orang lain, umumnya 10–15%" min={0} max={50} />
                <NumberField
                  label="Pajak penghasilan kos"
                  unit="% sewa"
                  value={plan.incomeTaxPct}
                  onChange={set('incomeTaxPct')}
                  help="Pemilik perorangan: 0 kalau sewa setahun di bawah Rp500 jt (PPh UMKM 0,5% hanya atas kelebihannya, PP 55/2022). Kos tidak kena PPh final sewa 10%."
                  min={0}
                  max={50}
                />
                {isBuild && (
                  <>
                    <NumberField label="Desain, izin (PBG), pengawasan" unit="% konstruksi" value={plan.designPct} onChange={set('designPct')} min={0} max={30} />
                    <NumberField label="Cadangan tak terduga" unit="% konstruksi" value={plan.contingencyPct} onChange={set('contingencyPct')} min={0} max={50} />
                  </>
                )}
              </div>
            </details>
          </section>
        </div>

        <aside className="split-result">
          <section className="card result-card">
            <h2>Hasilnya</h2>
            {variants.length > 1 && (
              <div className="segmented tabs-seg" role="tablist" aria-label="Pilih paket material">
                {variants.map((v, i) => (
                  <button
                    key={v.key}
                    type="button"
                    role="tab"
                    aria-selected={v === current}
                    className={`seg${v === current ? ' active' : ''}`}
                    onClick={() => setVariantIdx(i)}
                  >
                    {v.material?.name}
                  </button>
                ))}
              </div>
            )}
            {current && <ResultDetail plan={plan} property={property} material={current.material} settings={settings} />}
            <h3>Perjalanan uang</h3>
            <CashflowChart
              years={settings.chartYears}
              series={variants.map((v) => ({ key: v.key, label: v.material?.name ?? plan.name, colorIndex: colorOf(v), yearly: v.result.yearly }))}
            />
            <Legend items={variants.map((v) => ({ key: v.key, label: v.material?.name ?? plan.name, colorIndex: colorOf(v) }))} />
            {variants.length > 1 && (
              <Link className="btn" to={`/material?rencana=${plan.id}`}>
                <Icon name="layers" /> Bandingkan material berdampingan
              </Link>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
