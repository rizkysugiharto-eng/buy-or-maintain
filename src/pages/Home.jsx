// Ringkasan untuk keluarga: kesimpulan per properti, rapor Baik/Cukup/Kurang,
// grafik perbandingan dengan penjelasan "Artinya", dan tabel lengkap.

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { CashflowChart, HBarChart, Legend } from '../components/Charts.jsx';
import { RatingBadge } from '../components/Fields.jsx';
import Icon from '../components/Icon.jsx';
import { primaryRow, useData } from '../context/DataContext.jsx';
import { planTypesFor, reportCard, saleProceeds } from '../lib/calc.js';
import { downloadPdf } from '../lib/pdf.js';
import { formatCompact, formatMonths, formatPercent, formatYears, monthLabel } from '../lib/format.js';
import { rowLabel, shortName } from '../lib/labels.js';
import { propertySourceProgress, sourceProgress } from '../data/sources.js';
import { regionRules } from '../data/regions.js';

function Stat({ label, value, sub }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

function ChartBlock({ number, title, help, children, meaning }) {
  return (
    <section className="card chart-card">
      <h3>
        {number ? `${number}. ` : ''}
        {title}
      </h3>
      {help && <p className="muted">{help}</p>}
      {children}
      {meaning && (
        <p className="meaning">
          <b>Artinya:</b> {meaning}
        </p>
      )}
    </section>
  );
}

const best = (rows, get, lower = false) => rows.filter((r) => get(r) != null).sort((a, b) => (lower ? get(a) - get(b) : get(b) - get(a)))[0];

export default function Home() {
  const { data, analysis, loadExample, addProperty, prefs, setPref } = useData();
  const { settings } = data;
  const properties = data.properties;
  const [printing, setPrinting] = useState(false);
  const [pdfState, setPdfState] = useState(null); // null | 'membuat' | pesan galat
  const pageRef = useRef(null);
  const showDetail = !!prefs.homeDetail || printing;

  // Saat dicetak (tombol Cetak maupun Ctrl+P), detail lengkap selalu ikut
  useEffect(() => {
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  // Unduh PDF: buka detail lengkap dulu (seperti saat dicetak), beri waktu grafik tergambar, lalu foto halaman
  async function savePdf() {
    setPdfState('membuat');
    flushSync(() => setPrinting(true));
    try {
      await new Promise((r) => setTimeout(r, 500));
      const today = new Date();
      const stamp = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const name = (data.title || 'Ringkasan')
        .replace(/[^\p{L}\p{N} -]/gu, '')
        .trim()
        .replace(/\s+/g, '-');
      await downloadPdf(
        pageRef.current,
        `${name}-${today.toISOString().slice(0, 10)}.pdf`,
        `Beli atau Rawat? · ${data.title || 'Ringkasan'} · dibuat ${stamp}`,
      );
      setPdfState(null);
    } catch (err) {
      setPdfState(`PDF gagal dibuat (${err?.message || err}). Coba tombol Cetak lalu pilih “Simpan sebagai PDF”.`);
    } finally {
      setPrinting(false);
    }
  }

  function printAll() {
    setPrinting(true);
    setTimeout(() => window.print(), 400); // beri waktu grafik tergambar dulu
  }

  if (properties.length === 0) {
    return (
      <div className="empty">
        <h1>Belum ada properti</h1>
        <p>Mulai dengan menambahkan properti yang sedang dipertimbangkan, atau lihat dulu contoh pengisiannya.</p>
        <div className="btn-row center">
          <Link className="btn primary" to="/properti" onClick={() => addProperty()}>
            <Icon name="plus" /> Tambah properti
          </Link>
          <button type="button" className="btn" onClick={loadExample}>
            Lihat contoh
          </button>
        </div>
      </div>
    );
  }

  const progress = sourceProgress(data);
  const colorOf = (property) => properties.findIndex((p) => p.id === property.id);
  // Rencana yang sewanya belum diisi tidak ikut dibandingkan
  const cards = properties.map((property) => {
    const found = primaryRow(analysis, property);
    const incomplete = !!found?.result.incomplete;
    const row = incomplete ? null : found;
    return { property, row, incomplete, card: reportCard(property, row?.result, settings) };
  });
  const rows = analysis.rows.filter((r) => !r.result.incomplete);
  const bar = (get) => rows.map((r) => ({ label: rowLabel(r), value: get(r), colorIndex: colorOf(r.property), row: r }));

  const fastest = best(rows, (r) => r.result.paybackYears, true);
  const cheapest = best(rows, (r) => r.result.capex.total, true);
  const richest = best(rows, (r) => r.result.noiMonthly);
  const productive = best(rows, (r) => r.result.per100jt);
  const slow = rows.filter((r) => r.result.paybackYears == null || r.result.paybackYears > settings.paybackOk);
  const legend = properties.map((p, i) => ({ key: p.id, label: shortName(p), colorIndex: i }));
  const primaryRows = cards.map((c) => c.row).filter(Boolean);
  const fastestPrimary = best(primaryRows, (r) => r.result.paybackYears, true);
  const sbnPer100 = settings.benchmarkSbn * 1e6;
  const aboveSbn = primaryRows.filter((r) => r.result.per100jt >= sbnPer100);
  const aboveDeposit = primaryRows.filter((r) => r.result.per100jt >= settings.benchmarkDeposit * 1e6 && r.result.per100jt < sbnPer100);
  const names = (list) => list.map((r) => shortName(r.property)).join(', ');
  const benchmarkMeaning = primaryRows.length
    ? [
        aboveSbn.length
          ? `${names(aboveSbn)} menghasilkan lebih dari SBN ritel.`
          : `Semua pilihan menghasilkan lebih kecil dari SBN ritel (${formatPercent(settings.benchmarkSbn)}/tahun).`,
        aboveDeposit.length ? `${names(aboveDeposit)} masih di atas deposito (${formatPercent(settings.benchmarkDeposit, 2)}).` : '',
        'Kelebihan kos dibanding SBN: harga tanahnya bisa naik — itu belum dihitung di sini.',
      ]
        .filter(Boolean)
        .join(' ')
    : null;

  return (
    <div className="page" ref={pageRef}>
      <div className="page-head">
        <div>
          <h1>{data.title || 'Mana yang paling layak?'}</h1>
          <p className="muted">
            Perbandingan {properties.length} properti · {rows.length} pilihan rencana · hitungan mulai {monthLabel(settings.startMonth, 0)}
          </p>
        </div>
        <div className="btn-row no-print">
          <button type="button" className="btn primary" onClick={savePdf} disabled={pdfState === 'membuat'}>
            <Icon name="download" /> {pdfState === 'membuat' ? 'Membuat PDF…' : 'Unduh PDF'}
          </button>
          <button type="button" className="btn" onClick={printAll}>
            <Icon name="print" /> Cetak
          </button>
        </div>
      </div>

      {pdfState && pdfState !== 'membuat' && (
        <p className="field-error no-print" role="alert">
          {pdfState}
        </p>
      )}

      <p className="guide-hint no-print">
        Baru pertama kali? Baca <Link to="/cara-pakai">Cara Pakai</Link> — alur pengisian dan cara membaca angkanya.
      </p>

      <p className={`source-hint${progress.done === progress.total ? ' done' : ''}`}>
        <b>
          {progress.done} dari {progress.total} angka
        </b>{' '}
        sudah dicek dari sumber resmi.{' '}
        {progress.done < progress.total && 'Sisanya masih perkiraan — pakai hasil ini untuk menyaring, bukan dasar membayar DP. '}
        <Link to="/pengaturan?bagian=sumber">Lihat sumber angka</Link>
      </p>

      <section className="card intinya">
        <h2>Intinya</h2>
        <ul>
          {cards.map(({ property, row, card, incomplete }) => (
            <li key={property.id}>
              <b>{shortName(property)}</b> —{' '}
              {card.verdict ? <RatingBadge rating={card.verdict.level}>{card.verdict.label}</RatingBadge> : 'belum dinilai'}{' '}
              {property.owned &&
                saleProceeds(property, settings) &&
                `Kalau dijual terima bersih ±${formatCompact(saleProceeds(property, settings).net, 1)}. `}
              {property.owned && row
                ? `${planTypesFor(property)[row.plan.type].label}: ${row.result.capex.newMoney > 0 ? `uang baru ±${formatCompact(row.result.capex.newMoney, 1)}` : 'tanpa uang baru'}, uang bersih ±${formatCompact(row.result.noiMonthly)}/bulan — ${row.result.vsSbnMonthly >= 0 ? 'lebih untung' : 'lebih rugi'} ±${formatCompact(Math.abs(row.result.vsSbnMonthly))}/bulan dibanding dijual lalu ditaruh di SBN.`
                : row
                  ? `Modal ±${formatCompact(row.result.capex.total, 1)}, uang bersih ±${formatCompact(row.result.noiMonthly)}/bulan, modal kembali ${formatYears(row.result.paybackYears, settings.maxYears)}${row.result.incomeStartMonth ? ` (mulai dapat uang setelah ${formatMonths(row.result.incomeStartMonth)})` : ', uang masuk sejak bulan pertama'}.`
                  : incomplete
                    ? 'Sewa atau jumlah kamar/unit di rencananya belum diisi.'
                    : 'Belum ada rencana — buka propertinya lalu tambahkan rencana.'}
              {property.verdictNote && <span className="muted"> {property.verdictNote}</span>}
            </li>
          ))}
        </ul>
      </section>

      <div className="property-cards">
        {cards.map(({ property, row, card, incomplete }, i) => (
          <Link
            key={property.id}
            to={`/properti/${property.id}`}
            className="card property-card"
            style={{ '--accent': `var(--series-${(i % 8) + 1})` }}
          >
            <div className="property-card-head">
              <div>
                <h3>{property.name}</h3>
                <p className="muted small">
                  {regionRules(property, settings).name} · {property.askingPrice ? formatCompact(property.askingPrice, 1) : 'harga belum diisi'}
                  {row ? ` · ${planTypesFor(property)[row.plan.type].label.toLowerCase()}: ${rowLabel(row, { withProperty: false })}` : ''}
                </p>
              </div>
              {card.verdict && <RatingBadge rating={card.verdict.level}>{card.verdict.label}</RatingBadge>}
            </div>
            {row ? (
              <div className="stats">
                {property.owned ? (
                  <Stat
                    label="Uang baru"
                    value={formatCompact(row.result.capex.newMoney, 1)}
                    sub={`+ nilai tanah ${formatCompact(row.result.capex.purchase, 1)}`}
                  />
                ) : (
                  <Stat label="Total modal" value={formatCompact(row.result.capex.total, 1)} />
                )}
                <Stat label="Uang bersih / bulan" value={formatCompact(row.result.noiMonthly)} />
                <Stat
                  label="Modal kembali"
                  value={formatYears(row.result.paybackYears, settings.maxYears)}
                  sub={row.result.paybackMonth != null ? `±${monthLabel(settings.startMonth, row.result.paybackMonth)}` : null}
                />
                <Stat label="Mulai dapat uang" value={formatMonths(row.result.incomeStartMonth)} />
              </div>
            ) : (
              <p className="muted">{incomplete ? 'Sewa di rencananya belum diisi.' : 'Belum ada rencana.'}</p>
            )}
            <span className="card-foot">
              <span className="small muted">
                Sumber angka {propertySourceProgress(property).done}/{propertySourceProgress(property).total} dicek
              </span>
              <span className="card-link">
                Lihat detail <Icon name="chevron" size={14} />
              </span>
            </span>
          </Link>
        ))}
      </div>

      <section className="card">
        <h2>Rapor singkat</h2>
        <p className="muted">Setiap properti dinilai Baik, Cukup, atau Kurang memakai rencana utamanya.</p>
        <div className="table-wrap">
          <table className="table rapor">
            <thead>
              <tr>
                <th>Aspek</th>
                {cards.map(({ property }) => (
                  <th key={property.id}>{shortName(property)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards[0].card.rows.map((aspect, idx) => (
                <tr key={aspect.key}>
                  <th scope="row">{aspect.label}</th>
                  {cards.map(({ property, card }) => (
                    <td key={property.id}>
                      <RatingBadge rating={card.rows[idx].rating} />
                      {card.rows[idx].note && <div className="small muted">{card.rows[idx].note}</div>}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="verdict-row">
                <th scope="row">Kesimpulan</th>
                {cards.map(({ property, card }) => (
                  <td key={property.id}>{card.verdict ? <RatingBadge rating={card.verdict.level}>{card.verdict.label}</RatingBadge> : '–'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {primaryRows.length > 0 && (
        <div className="chart-grid">
          <ChartBlock
            title="Berapa tahun sampai modal kembali?"
            help={`Pilihan utama tiap properti. Makin pendek makin baik; garis putus-putus = batas ideal ±${settings.paybackGood} tahun.`}
            meaning={
              fastestPrimary &&
              `Paling cepat: ${shortName(fastestPrimary.property)} (${formatYears(fastestPrimary.result.paybackYears, settings.maxYears)}).`
            }
          >
            <HBarChart
              data={primaryRows.map((r) => ({
                label: rowLabel(r),
                value: r.result.paybackYears ?? settings.maxYears,
                colorIndex: colorOf(r.property),
                row: r,
              }))}
              formatValue={(v, d) => (d.row.result.paybackYears == null ? `>${settings.maxYears} th` : `±${Math.round(v)} th`)}
              target={settings.paybackGood}
              targetLabel={`batas ideal ±${settings.paybackGood} tahun`}
            />
          </ChartBlock>
          <ChartBlock
            title="Lebih untung dari SBN atau deposito?"
            help="Uang bersih per tahun dari setiap Rp100 juta modal, dibanding kalau uang yang sama ditaruh di SBN ritel atau deposito (tanpa repot mengelola kos)."
            meaning={benchmarkMeaning}
          >
            <HBarChart
              data={[
                ...primaryRows.map((r) => ({ label: rowLabel(r), value: r.result.per100jt, colorIndex: colorOf(r.property) })),
                {
                  label: `SBN ritel (${formatPercent(settings.benchmarkSbn)})`,
                  value: settings.benchmarkSbn * 1e6,
                  color: 'var(--text-muted)',
                  reference: true,
                },
                {
                  label: `Deposito bank (${formatPercent(settings.benchmarkDeposit, 2)})`,
                  value: settings.benchmarkDeposit * 1e6,
                  color: 'var(--axis)',
                  reference: true,
                },
              ]}
              formatValue={(v) => formatCompact(v)}
            />
          </ChartBlock>
        </div>
      )}

      <div className="detail-toggle no-print">
        <button type="button" className="btn" aria-expanded={showDetail} onClick={() => setPref('homeDetail', !prefs.homeDetail)}>
          {showDetail ? 'Sembunyikan detail' : 'Lihat detail lengkap: semua pilihan & grafik'}
          <Icon name="chevron" size={14} />
        </button>
      </div>

      {showDetail && (
        <>
          {rows.length > 0 && (
            <>
              <h2 className="section-title">Perbandingan dalam gambar</h2>
              <Legend items={legend} />
              <div className="chart-grid">
                <ChartBlock
                  number={1}
                  title="Berapa total modal yang harus disiapkan?"
                  help="Harga beli + biaya surat-surat + biaya bangun/renovasi. Makin pendek makin ringan."
                  meaning={cheapest && `Modal paling ringan: ${rowLabel(cheapest)} (${formatCompact(cheapest.result.capex.total, 1)}).`}
                >
                  <HBarChart data={bar((r) => r.result.capex.total)} formatValue={(v) => formatCompact(v, 1)} />
                </ChartBlock>
                <ChartBlock
                  number={2}
                  title="Berapa uang bersih yang masuk setiap bulan?"
                  help="Uang sewa setelah dipotong kamar kosong dan semua biaya rutin. Makin panjang makin baik."
                  meaning={richest && `Paling besar: ${rowLabel(richest)} (±${formatCompact(richest.result.noiMonthly)}/bulan).`}
                >
                  <HBarChart data={bar((r) => r.result.noiMonthly)} formatValue={(v) => formatCompact(v)} />
                </ChartBlock>
                <ChartBlock
                  number={3}
                  title="Berapa tahun sampai modal kembali?"
                  help={`Makin pendek makin baik. Garis putus-putus = batas ideal ±${settings.paybackGood} tahun.`}
                  meaning={
                    fastest &&
                    `Paling cepat: ${rowLabel(fastest)} (${formatYears(fastest.result.paybackYears)}).` +
                      (slow.length ? ` ${slow.length} pilihan butuh lebih dari ${settings.paybackOk} tahun.` : '')
                  }
                >
                  <HBarChart
                    data={bar((r) => r.result.paybackYears ?? settings.maxYears)}
                    formatValue={(v, d) => (d.row.result.paybackYears == null ? `>${settings.maxYears} th` : `±${Math.round(v)} th`)}
                    target={settings.paybackGood}
                    targetLabel={`batas ideal ±${settings.paybackGood} tahun`}
                  />
                </ChartBlock>
                <ChartBlock
                  number={4}
                  title="Dari setiap Rp100 juta modal, berapa yang kembali per tahun?"
                  help="Cara paling adil membandingkan pilihan yang modalnya berbeda-beda."
                  meaning={
                    productive &&
                    `Paling produktif: ${rowLabel(productive)} — ±${formatCompact(productive.result.per100jt)} per tahun (${formatPercent(productive.result.netYield)}).`
                  }
                >
                  <HBarChart data={bar((r) => r.result.per100jt)} formatValue={(v) => formatCompact(v)} />
                </ChartBlock>
              </div>

              <ChartBlock
                number={5}
                title="Perjalanan uang dari tahun ke tahun"
                help="Mulai dari minus sebesar modal, lalu naik saat uang sewa masuk. Saat garis menyentuh garis tebal Rp0, modal sudah kembali."
                meaning="Garis yang mulai paling dalam butuh modal paling besar; garis yang paling curam paling cepat mengumpulkan uang."
              >
                <CashflowChart
                  years={settings.chartYears}
                  series={cards
                    .filter((c) => c.row)
                    .map((c) => ({ key: c.property.id, label: rowLabel(c.row), colorIndex: colorOf(c.property), yearly: c.row.result.yearly }))}
                />
                <Legend
                  items={cards.filter((c) => c.row).map((c) => ({ key: c.property.id, label: rowLabel(c.row), colorIndex: colorOf(c.property) }))}
                />
              </ChartBlock>

              <details className="card details-card">
                <summary>Tabel lengkap semua pilihan (diurutkan dari yang paling cepat balik modal)</summary>
                <div className="table-wrap">
                  <table className="table numbers">
                    <thead>
                      <tr>
                        <th>Pilihan</th>
                        <th>Total modal</th>
                        <th>Uang bersih / bulan</th>
                        <th>Hasil bersih / tahun</th>
                        <th>Modal kembali</th>
                        <th>Mulai dapat uang</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...rows]
                        .sort((a, b) => (a.result.paybackYears ?? 1e9) - (b.result.paybackYears ?? 1e9))
                        .map((r) => (
                          <tr key={r.key}>
                            <th scope="row">
                              <Link to={`/rencana/${r.plan.id}`}>{rowLabel(r)}</Link>
                            </th>
                            <td>{formatCompact(r.result.capex.total, 2)}</td>
                            <td>{formatCompact(r.result.noiMonthly)}</td>
                            <td>{formatPercent(r.result.netYield)}</td>
                            <td>{formatYears(r.result.paybackYears, settings.maxYears)}</td>
                            <td>{formatMonths(r.result.incomeStartMonth)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className="small muted">
                  Hasil bersih = uang bersih setahun ÷ total modal. Belum memperhitungkan kenaikan harga tanah
                  {settings.rentGrowthPct ? '' : ' dan kenaikan sewa'}.
                </p>
              </details>
            </>
          )}
        </>
      )}
    </div>
  );
}
