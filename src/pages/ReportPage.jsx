// Laporan terperinci satu properti, dengan susunan seperti laporan analisis keluarga ("Analisis Kos #1"):
// kesimpulan, data, analisis tanah & bangunan, harga wajar, simulasi pendapatan, skenario, semua rencana,
// patokan negosiasi / pilihan jual, pemeriksaan sebelum DP, dan status sumber angka. Bisa diunduh sebagai PDF.

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { primaryRow, useData } from '../context/DataContext.jsx';
import { CHECKLIST } from '../data/example.js';
import { regionRules } from '../data/regions.js';
import { GENERAL_SOURCES, propertySources } from '../data/sources.js';
import {
  SCENARIOS,
  analyze,
  costApproach,
  fenceSale,
  incomeApproach,
  maxPriceForYield,
  planTypesFor,
  reportCard,
  resolvePlan,
  saleProceeds,
} from '../lib/calc.js';
import { formatCompact, formatMonths, formatNumber, formatPercent, formatRupiah, formatYears } from '../lib/format.js';
import { rowLabel, shortName } from '../lib/labels.js';
import { downloadPdf } from '../lib/pdf.js';

const range = (r) => (r ? `${formatCompact(r.min, 2)} – ${formatCompact(r.max, 2)}` : '–');
const jt = (v) => formatCompact(v, 1);
const RATING_LABEL = { baik: 'Baik', cukup: 'Cukup', kurang: 'Kurang' };

function Table({ head, rows, highlight = [] }) {
  return (
    <table className="report-table">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={highlight.includes(i) ? 'hl' : undefined}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const { data, analysis } = useData();
  const [pdfState, setPdfState] = useState(null);
  const s = data.settings;
  const property = data.properties.find((p) => p.id === id);
  if (!property) {
    return (
      <div className="empty">
        <p>Properti tidak ditemukan.</p>
        <Link className="btn" to="/properti">
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  const owned = !!property.owned;
  const region = regionRules(property, s);
  const types = planTypesFor(property);
  const found = primaryRow(analysis, property);
  const row = found && !found.result.incomplete ? found : null;
  const r = row?.result;
  const card = reportCard(property, r, s);
  const fairCost = costApproach(property);
  const income = row ? incomeApproach(row.plan, property, row.material, s) : null;
  const fairIncome = income && income.max > 0 ? income : null;
  const sale = owned ? saleProceeds(property, s) : null;
  const fence = owned && property.landArea ? fenceSale(property, s) : null;
  const rows = analysis.rows.filter((x) => x.property.id === property.id && !x.result.incomplete);
  const name = shortName(property);
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const price = Number(property.askingPrice) || 0;
  const land = Number(property.landArea) || 0;
  const building = Number(property.buildingArea) || 0;
  const rooms = Number(property.rooms) || 0;
  const priceRow = card.rows.find((x) => x.key === 'harga');

  // Kesimpulan di kotak paling atas
  const summary = owned
    ? [
        sale
          ? `Kalau dijual, terima bersih ±${formatCompact(sale.net, 2)} (setelah PPh final ${formatPercent(s.saleTaxPct)}).`
          : 'Perkiraan harga jual belum diisi.',
        r &&
          `${types[row.plan.type].label} (${rowLabel(row, { withProperty: false })}): uang baru ±${jt(r.capex.newMoney)}, uang bersih ±${formatCompact(r.noiMonthly)}/bulan — ${r.vsSbnMonthly >= 0 ? 'lebih untung' : 'lebih rugi'} ±${formatCompact(Math.abs(r.vsSbnMonthly))}/bulan dibanding dijual lalu ditaruh di SBN.`,
        fence?.value > 0 &&
          (() => {
            const best = [...fence.options].sort((a, b) => a.cost - b.cost)[0];
            return `Dipagar tembok ${formatNumber(fence.height, 1)} m dulu: paling hemat ${best.pkg.name} ±${jt(best.cost)}; baru untung kalau harga jual naik ≥ ${jt(best.breakEven)}.`;
          })(),
      ]
    : [
        `Harga penawaran ${formatCompact(price, 2)}${priceRow?.rating ? ` — ${priceRow.note}` : ''}.`,
        r &&
          `Dengan rencana ${rowLabel(row, { withProperty: false })}, skenario normal: modal kembali ${formatYears(r.paybackYears, s.maxYears)} (hasil bersih ${formatPercent(r.netYield)}/tahun).`,
        fairCost && `Kisaran harga wajar dari nilai tanah + bangunan: ${range(fairCost)}.`,
      ];

  async function savePdf() {
    setPdfState('membuat');
    try {
      const file = `Laporan-${name}`
        .replace(/[^\p{L}\p{N} #-]/gu, '')
        .trim()
        .replace(/[\s#]+/g, '-');
      await downloadPdf(
        document.getElementById('report'),
        `${file}-${new Date().toISOString().slice(0, 10)}.pdf`,
        `Analisis ${name} — ${region.name} · dibuat ${today}`,
      );
      setPdfState(null);
    } catch (err) {
      setPdfState(`PDF gagal dibuat (${err?.message || err}). Coba tombol Cetak.`);
    }
  }

  // Rincian modal & pendapatan rencana utama
  const p = r ? resolvePlan(row.plan, property, row.material, s) : null;
  const capexRows = r
    ? [
        [
          owned ? 'Nilai tanah (tidak jadi dijual)' : 'Harga beli',
          owned ? `harga jual − PPh ${formatPercent(s.saleTaxPct)}` : '',
          formatCompact(r.capex.purchase, 2),
        ],
        ...(!owned
          ? [
              [
                'Biaya surat-surat',
                p.transactionAuto
                  ? `BPHTB ${formatPercent(region.bphtbPct, 0)} × (harga − ${formatCompact(region.npoptkp)}) + PPAT + BPN`
                  : `${formatPercent(p.transactionPct)} dari harga`,
                jt(r.capex.transaction),
              ],
            ]
          : []),
        ...(r.capex.construction > 0
          ? [
              [
                'Konstruksi',
                `${formatNumber(p.buildArea)} m² × ${formatCompact(p.buildCostPerM2)}/m²${row.material ? ` (paket ${row.material.name})` : ''}`,
                jt(r.capex.construction),
              ],
            ]
          : []),
        ...(r.capex.furnishing > 0
          ? [['Isi kamar', `${formatNumber(p.rooms)} kamar × ${formatCompact(p.furnishingPerRoom)}`, jt(r.capex.furnishing)]]
          : []),
        ...(r.capex.design > 0 ? [['Desain, izin, pengawasan', `${formatPercent(p.designPct, 0)} dari konstruksi`, jt(r.capex.design)]] : []),
        ...(r.capex.contingency > 0
          ? [['Cadangan tak terduga', `${formatPercent(p.contingencyPct, 0)} dari konstruksi`, jt(r.capex.contingency)]]
          : []),
        ...(row.plan.extraCosts ?? []).filter((c) => c.amount).map((c) => [c.label || 'Biaya lain', '', jt(c.amount)]),
        [<b key="t">Total modal</b>, owned ? `uang baru ${jt(r.capex.newMoney)}` : '', <b key="v">{formatCompact(r.capex.total, 2)}</b>],
        ['Pendapatan kotor', `${formatNumber(p.rooms)} kamar × ${formatCompact(p.rentPerRoom)} × 12 bulan`, `${jt(r.income.gross)}/thn`],
        ['Pendapatan efektif', `keterisian rata-rata ${formatPercent(p.occupancyPct, 0)}`, `${jt(r.income.effective)}/thn`],
        [
          'Biaya operasional',
          `${formatCompact(p.opexFixedMonthly)} + ${formatCompact(p.opexPerRoomMonthly)} × ${formatNumber(p.rooms)} kamar per bulan`,
          `${jt(r.income.opex)}/thn`,
        ],
        ['Perawatan', `${formatPercent(p.maintenancePct, 0)} dari pendapatan efektif`, `${jt(r.income.maintenance)}/thn`],
        ['PBB', '', `${jt(r.income.pbb)}/thn`],
        ...(r.income.management > 0 ? [['Fee pengelola', `${formatPercent(p.managementPct, 0)}`, `${jt(r.income.management)}/thn`]] : []),
        ...(r.income.tax > 0 ? [['Pajak penghasilan', `${formatPercent(p.incomeTaxPct)}`, `${jt(r.income.tax)}/thn`]] : []),
        ...(r.income.localTax > 0 ? [['Pajak daerah kos', `${formatPercent(p.localTaxPct, 0)}`, `${jt(r.income.localTax)}/thn`]] : []),
        [
          <b key="n">Pendapatan bersih (NOI)</b>,
          `${jt(r.income.effective)} − ${jt(r.income.costs)}`,
          <b key="v">
            {jt(r.income.noi)}/thn (±{formatCompact(r.noiMonthly)}/bln)
          </b>,
        ],
      ]
    : [];
  const capexTotalIndex = capexRows.findIndex((x) => x[0]?.key === 't');

  const scenarioRows = r
    ? [
        ...Object.entries(SCENARIOS).map(([key, label]) => {
          const x = key === 'moderat' ? r : analyze(row.plan, property, row.material, s, key);
          return [label, formatCompact(x.noiMonthly), formatPercent(x.netYield), formatYears(x.paybackYears, s.maxYears)];
        }),
        (() => {
          const x = analyze({ ...row.plan, managementPct: 15 }, property, row.material, s);
          return ['Normal + pengelola (fee 15%)', formatCompact(x.noiMonthly), formatPercent(x.netYield), formatYears(x.paybackYears, s.maxYears)];
        })(),
      ]
    : [];

  const maxHigh = r && !owned ? maxPriceForYield(p, s.targetYieldHigh) : null;
  const maxLow = r && !owned ? maxPriceForYield(p, s.targetYieldLow) : null;
  const checklist = property.checklist ?? {};
  let n = 0;
  const num = () => (n += 1);

  return (
    <div className="page report-page">
      <div className="btn-row no-print report-actions">
        <Link to={`/properti/${property.id}`} className="back-link">
          <Icon name="back" /> {property.name}
        </Link>
        <span className="spacer" />
        <button type="button" className="btn primary" onClick={savePdf} disabled={pdfState === 'membuat'}>
          <Icon name="download" /> {pdfState === 'membuat' ? 'Membuat PDF…' : 'Unduh PDF'}
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
          <Icon name="print" /> Cetak
        </button>
      </div>
      {pdfState && pdfState !== 'membuat' && (
        <p className="field-error no-print" role="alert">
          {pdfState}
        </p>
      )}

      <article className="report" id="report">
        <header className="report-head">
          <h1>{owned ? `Analisis Jual atau Kelola ${name}` : `Analisis Kewajaran Harga & Balik Modal ${name}`}</h1>
          <p>
            {[property.address || property.name, (property.address ?? '').includes(region.name) ? null : region.name, `Disusun ${today}`].filter(Boolean).join(' | ')}
          </p>
        </header>

        <div className="report-box">
          <b>Kesimpulan{card.verdict ? `: ${card.verdict.label}` : ''}.</b> {summary.filter(Boolean).join(' ')}
          {property.verdictNote && <div className="report-note">{property.verdictNote}</div>}
        </div>

        <section>
          <h2>{num()}. Data Properti</h2>
          <Table
            head={['Item', 'Data']}
            rows={[
              [owned ? 'Perkiraan harga kalau dijual' : 'Harga penawaran', price ? formatRupiah(price) : 'belum diisi'],
              ['Status', owned ? 'Sudah milik keluarga' : 'Mau dibeli'],
              ['Daerah', region.name],
              ['Luas tanah / bangunan', `${land ? `${formatNumber(land)} m²` : '–'} / ${building ? `${formatNumber(building)} m²` : '–'}`],
              ['Jumlah kamar', rooms ? `${formatNumber(rooms)} kamar` : '–'],
              ...(property.description ? [['Kondisi', property.description]] : []),
            ]}
          />
        </section>

        {(price > 0 && (land || building || rooms)) || property.notes ? (
          <section>
            <h2>{num()}. Analisis Tanah & Bangunan</h2>
            {price > 0 && (land || building || rooms) && (
              <Table
                head={['Indikator', name]}
                rows={[
                  ...(rooms ? [['Harga per kamar', jt(price / rooms)]] : []),
                  ...(land ? [['Harga per m² tanah', jt(price / land)]] : []),
                  ...(building ? [['Harga per m² bangunan', jt(price / building)]] : []),
                  ...(rooms && building ? [['Luas bangunan per kamar', `±${formatNumber(building / rooms)} m²`]] : []),
                ]}
              />
            )}
            {property.notes && <p>{property.notes}</p>}
          </section>
        ) : null}

        <section>
          <h2>{num()}. Lokasi & Risiko</h2>
          <Table
            head={['Aspek', 'Penilaian', 'Alasan']}
            rows={[
              ['Lokasi & peminat', RATING_LABEL[property.locationRating] ?? '–', property.locationNote || '–'],
              ['Risiko (Baik = rendah)', RATING_LABEL[property.riskRating] ?? '–', property.riskNote || '–'],
            ]}
          />
          {region.preset.market && (
            <p className="report-small">
              Acuan pasar {region.name}: {region.preset.market}
            </p>
          )}
        </section>

        {(fairCost || fairIncome) && (
          <section>
            <h2>{num()}. Estimasi Harga Wajar</h2>
            <Table
              head={['Metode', 'Komponen', 'Nilai']}
              rows={[
                ...(fairCost
                  ? [
                      [
                        'Nilai tanah + bangunan',
                        `Tanah ${formatNumber(land)} m² × ${formatCompact(property.landPriceMin)}–${formatCompact(property.landPriceMax)}`,
                        range({ min: land * property.landPriceMin, max: land * property.landPriceMax }),
                      ],
                      ['', 'Bangunan + isi', range({ min: Number(property.buildingValueMin) || 0, max: Number(property.buildingValueMax) || 0 })],
                      [<b key="a">Total</b>, '', <b key="b">{range(fairCost)}</b>],
                    ]
                  : []),
                ...(fairIncome
                  ? [
                      [
                        'Pendapatan',
                        `Target hasil bersih ${formatPercent(s.targetYieldLow)}–${formatPercent(s.targetYieldHigh)} per tahun`,
                        range(fairIncome),
                      ],
                    ]
                  : []),
                [owned ? 'Perkiraan harga jual' : 'Harga penawaran', '', price ? formatCompact(price, 2) : '–'],
              ]}
              highlight={[fairCost ? 2 : -1]}
            />
          </section>
        )}

        {r && (
          <section>
            <h2>
              {num()}. Simulasi Pendapatan (Skenario Normal, {rowLabel(row, { withProperty: false })})
            </h2>
            <Table head={['Komponen', 'Perhitungan', 'Nilai']} rows={capexRows} highlight={[capexTotalIndex, capexRows.length - 1]} />
            <p className="report-small">
              <b>Rumus:</b> Hasil bersih = NOI ÷ total modal = {jt(r.income.noi)} ÷ {formatCompact(r.capex.total, 2)} ={' '}
              <b>{formatPercent(r.netYield)}</b>. Modal kembali (simulasi bulanan
              {r.incomeStartMonth ? `, termasuk ${formatMonths(r.incomeStartMonth)} masa bangun` : ''}) ={' '}
              <b>{formatYears(r.paybackYears, s.maxYears)}</b>.
            </p>
          </section>
        )}

        {r && (
          <section>
            <h2>{num()}. Analisis Skenario & Lama Balik Modal</h2>
            <Table head={['Skenario', 'Bersih/bulan', 'Hasil bersih/thn', 'Balik modal']} rows={scenarioRows} highlight={[1]} />
            <ul>
              {r.breakEvenOccupancy > 0 && (
                <li>
                  <b>Titik impas keterisian ±{formatPercent(r.breakEvenOccupancy, 0)}</b>: biaya rutin tertutup selama minimal{' '}
                  {Math.ceil((r.breakEvenOccupancy / 100) * p.rooms)} dari {formatNumber(p.rooms)} kamar terisi.
                </li>
              )}
              <li>
                Pesimis = sewa {s.scenarios.pesimis.rentPct}%, keterisian {s.scenarios.pesimis.occupancyPt} poin, biaya rutin +
                {s.scenarios.pesimis.opexPct}%, biaya bangun/renovasi +{s.scenarios.pesimis.capexPct}%.
              </li>
              <li>
                Pembanding: setiap Rp100 jt modal menghasilkan ±{formatCompact(r.per100jt)}/tahun; SBN ritel {formatPercent(s.benchmarkSbn)} = ±
                {formatCompact(s.benchmarkSbn * 1e6)}, deposito {formatPercent(s.benchmarkDeposit, 2)} = ±{formatCompact(s.benchmarkDeposit * 1e6)}.
              </li>
              <li>Kenaikan harga tanah menambah keuntungan, tetapi baru jadi uang saat dijual — tidak dimasukkan dalam balik modal.</li>
            </ul>
          </section>
        )}

        {rows.length > 1 && (
          <section>
            <h2>{num()}. Semua Pilihan Rencana & Material</h2>
            <Table
              head={['Pilihan', owned ? 'Uang baru' : 'Total modal', 'Bersih/bulan', 'Hasil/thn', 'Balik modal', 'Mulai dapat uang']}
              rows={rows.map((x) => [
                rowLabel(x, { withProperty: false }),
                formatCompact(owned ? x.result.capex.newMoney : x.result.capex.total, 2),
                formatCompact(x.result.noiMonthly),
                formatPercent(x.result.netYield),
                formatYears(x.result.paybackYears, s.maxYears),
                formatMonths(x.result.incomeStartMonth),
              ])}
              highlight={rows.map((x, i) => (x.key === row?.key ? i : -1))}
            />
          </section>
        )}

        {owned && (
          <section>
            <h2>{num()}. Pilihan Menjual</h2>
            {sale ? (
              <Table
                head={['Pilihan', 'Perhitungan', 'Nilai']}
                rows={[
                  [
                    'Dijual apa adanya',
                    `${formatCompact(sale.value, 2)} − PPh final ${formatPercent(s.saleTaxPct)}${sale.agent ? ` − komisi ${formatPercent(s.saleAgentPct)}` : ''}`,
                    formatCompact(sale.net, 2),
                  ],
                  [
                    'Kalau uangnya di SBN ritel',
                    `${formatPercent(s.benchmarkSbn)} per tahun`,
                    `${formatCompact((sale.net * s.benchmarkSbn) / 1200)}/bln`,
                  ],
                  [
                    'Kalau uangnya di deposito',
                    `${formatPercent(s.benchmarkDeposit, 2)} per tahun`,
                    `${formatCompact((sale.net * s.benchmarkDeposit) / 1200)}/bln`,
                  ],
                ]}
              />
            ) : (
              <p>Perkiraan harga jual belum diisi.</p>
            )}
            {fence && (
              <>
                <h3>
                  Dijual setelah dipagar tembok {formatNumber(fence.length)} m × {formatNumber(fence.height, 1)} m
                </h3>
                <Table
                  head={[
                    'Material pagar',
                    'Per m panjang',
                    'Biaya pagar',
                    'Impas kalau harga naik',
                    ...(fence.value ? ['Terima bersih', 'vs tanpa pagar'] : []),
                  ]}
                  rows={fence.options.map((o) => [
                    o.pkg.name,
                    formatCompact(o.perMeter),
                    jt(o.cost),
                    `≥ ${jt(o.breakEven)}${o.breakEvenPerM2 ? ` (±${formatCompact(o.breakEvenPerM2)}/m²)` : ''}`,
                    ...(fence.value ? [formatCompact(o.net, 2), `${o.vsPlain >= 0 ? '+' : '−'}${jt(Math.abs(o.vsPlain))}`] : []),
                  ])}
                />
                <p className="report-small">
                  Harga satuan dari Perwal Kota Malang 14/2025, upah RAB kos 5 lantai Sigura-gura & koefisien SNI/AHSP
                  {fence.priceIndex !== 1 ? `, × indeks ${formatNumber(fence.priceIndex, 2)} (${region.name})` : ''}. Perkiraan kenaikan harga jual
                  kalau dipagar: {fence.uplift ? jt(fence.uplift) : 'belum diisi'}.
                </p>
              </>
            )}
          </section>
        )}

        {!owned && r && maxLow != null && (
          <section>
            <h2>{num()}. Patokan Harga Negosiasi</h2>
            <Table
              head={['Patokan', 'Harga', 'Dasar']}
              rows={[
                ['Harga untuk hasil bersih ' + formatPercent(s.targetYieldHigh), formatCompact(maxHigh, 2), 'target yang nyaman'],
                ['Batas maksimal', formatCompact(maxLow, 2), `hasil bersih minimal ${formatPercent(s.targetYieldLow)}`],
                ['Harga penawaran sekarang', formatCompact(price, 2), `hasil bersih ${formatPercent(r.netYield)}`],
              ]}
              highlight={[1]}
            />
          </section>
        )}

        {!owned && (
          <section>
            <h2>{num()}. Pemeriksaan Wajib Sebelum DP</h2>
            <ul className="report-check">
              {CHECKLIST.map((c) => (
                <li key={c.key}>
                  {checklist[c.key] ? '☑' : '☐'} {c.label}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2>{num()}. Status Sumber Angka</h2>
          <Table
            head={['Angka', 'Status', 'Catatan / bukti']}
            rows={[
              ...propertySources(property).map((x) => [x, property.sources?.[x.key]]),
              ...GENERAL_SOURCES.map((x) => [x, data.sources?.[x.key]]),
            ].map(([src, st]) => [src.label, st?.status === 'dicek' ? 'Sudah dicek' : 'Perkiraan', st?.note || '–'])}
          />
        </section>

        <div className="report-box">
          <b>Rekomendasi akhir:</b>{' '}
          {property.verdictNote ||
            (card.verdict
              ? `${card.verdict.label} — berdasarkan rapor ${card.rows.filter((x) => x.rating).length} aspek.`
              : 'Lengkapi data & rencana untuk mendapat kesimpulan.')}{' '}
          Angka yang masih “Perkiraan” perlu dicek sebelum mengambil keputusan.
        </div>
      </article>
    </div>
  );
}
