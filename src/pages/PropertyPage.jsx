// Detail satu properti: data, rencana-rencananya, penilaian, harga wajar, dan daftar cek sebelum DP.

import { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MoneyField, NumberField, RatingBadge, RatingPicker, Segmented, TextField } from '../components/Fields.jsx';
import Icon from '../components/Icon.jsx';
import RegionRules from '../components/RegionRules.jsx';
import SourceItem from '../components/SourceItem.jsx';
import { primaryRow, useData } from '../context/DataContext.jsx';
import { CHECKLIST } from '../data/example.js';
import { propertySourceProgress, propertySources } from '../data/sources.js';
import { costApproach, incomeApproach, planTypesFor, reportCard, saleProceeds } from '../lib/calc.js';
import { formatCompact, formatMonths, formatPercent, formatYears } from '../lib/format.js';

function Range({ label, range, help }) {
  return (
    <div className="range">
      <span className="stat-label">{label}</span>
      <strong>{range ? `${formatCompact(range.min, 2)} – ${formatCompact(range.max, 2)}` : '–'}</strong>
      {help && <span className="small muted">{help}</span>}
    </div>
  );
}

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, analysis, updateProperty, updatePropertySource, deleteProperty, addPlan, duplicatePlan, deletePlan } = useData();
  const property = data.properties.find((p) => p.id === id);
  const [params] = useSearchParams();

  // Dari Data & Asumsi → Sumber angka: langsung ke bagian cek sumber
  // (ditunda sebentar: kerangka halaman menggulir ke atas setiap pindah menu)
  useEffect(() => {
    if (params.get('bagian') !== 'sumber') return undefined;
    const timer = setTimeout(() => document.getElementById('cek-sumber')?.scrollIntoView({ block: 'start' }), 50);
    return () => clearTimeout(timer);
  }, [params]);

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

  const set = (key) => (value) => updateProperty(property.id, { [key]: value });
  const plans = data.plans.filter((p) => p.propertyId === property.id);
  const primary = primaryRow(analysis, property);
  const card = reportCard(property, primary?.result, data.settings);
  const fairCost = costApproach(property);
  const fairIncome = primary ? incomeApproach(primary.plan, property, primary.material, data.settings) : null;
  const checklist = property.checklist ?? {};
  const doneCount = CHECKLIST.filter((c) => checklist[c.key]).length;
  const owned = !!property.owned;
  const types = planTypesFor(property);
  const sale = owned ? saleProceeds(property, data.settings) : null;
  const sourceProg = propertySourceProgress(property);

  function remove() {
    if (window.confirm(`Hapus "${property.name}" beserta semua rencananya?`)) {
      deleteProperty(property.id);
      navigate('/properti');
    }
  }

  return (
    <div className="page">
      <Link to="/properti" className="back-link">
        <Icon name="back" /> Semua properti
      </Link>
      <div className="page-head">
        <div>
          <h1>{property.name}</h1>
          <p className="muted">{property.address}</p>
        </div>
        {card.verdict && <RatingBadge rating={card.verdict.level}>Kesimpulan: {card.verdict.label}</RatingBadge>}
      </div>

      <section className="card">
        <h2>
          <span className="step">1</span> Data properti
        </h2>
        <div className="form-grid">
          <Segmented
            label="Status"
            value={owned ? 'milik' : 'beli'}
            onChange={(v) => set('owned')(v === 'milik')}
            options={[
              {
                value: 'beli',
                label: 'Mau dibeli',
                hint: 'Dibandingkan harga dari penjual',
              },
              {
                value: 'milik',
                label: 'Sudah milik keluarga',
                hint: 'Dijual, atau disewakan / dibangun',
              },
            ]}
          />
          <TextField label="Nama properti" value={property.name} onChange={set('name')} help="Misal: Kos #1 · Suhat Indah" />
          <TextField label="Nama singkat (untuk grafik)" value={property.shortName} onChange={set('shortName')} placeholder="Kos #1" />
          <TextField label="Alamat / lokasi" value={property.address} onChange={set('address')} wide />
          {owned ? (
            <MoneyField
              label="Perkiraan harga kalau dijual"
              value={property.askingPrice}
              onChange={set('askingPrice')}
              help="Luas tanah × harga tanah sekitar (+ nilai bangunan), atau tawaran pembeli"
            />
          ) : (
            <MoneyField label="Harga yang diminta penjual" value={property.askingPrice} onChange={set('askingPrice')} />
          )}
          <NumberField label="Luas tanah" unit="m²" value={property.landArea} onChange={set('landArea')} min={0} />
          <NumberField label="Luas bangunan" unit="m²" value={property.buildingArea} onChange={set('buildingArea')} min={0} />
          <NumberField label="Jumlah kamar sekarang" unit="kamar" value={property.rooms} onChange={set('rooms')} min={0} />
          <TextField
            label="Kondisi sekarang"
            value={property.description}
            onChange={set('description')}
            multiline
            wide
            placeholder="Misal: kos 3 lantai, 12 kamar, AC, kamar mandi dalam, penuh"
          />
        </div>
        <RegionRules property={property} settings={data.settings} onChange={(patch) => updateProperty(property.id, patch)} />
      </section>

      <section className="card">
        <h2>
          <span className="step">2</span> Rencana untuk properti ini
        </h2>
        <p className="muted">
          {owned
            ? 'Bandingkan dengan menjualnya: disewakan apa adanya, direnovasi dulu, atau dibangun baru (bisa membandingkan paket material). '
            : 'Bandingkan beberapa cara: dibeli lalu langsung disewakan, direnovasi dulu, atau dibongkar dan dibangun kos baru. '}
          Rencana bertanda ★ dipakai di Ringkasan.
        </p>
        {owned && (
          <div className="sale-box">
            <strong>Kalau dijual</strong>
            {sale ? (
              <p>
                Terima bersih ±<b>{formatCompact(sale.net, 2)}</b> (harga {formatCompact(sale.value, 2)} − PPh final{' '}
                {formatPercent(data.settings.saleTaxPct)}
                {sale.agent > 0 ? ` − komisi makelar ${formatPercent(data.settings.saleAgentPct)}` : ''}
                ). Kalau uangnya ditaruh di SBN ritel ±{formatCompact((sale.net * data.settings.benchmarkSbn) / 100 / 12)}
                /bulan, di deposito ±{formatCompact((sale.net * data.settings.benchmarkDeposit) / 100 / 12)}
                /bulan — tanpa repot mengelola.
              </p>
            ) : (
              <p className="muted">Isi “Perkiraan harga kalau dijual” di atas supaya bisa dibandingkan.</p>
            )}
            <p className="small muted">
              Setiap rencana di bawah dihitung seolah nilai jual bersih ini “ditanam” di properti, jadi hasilnya bisa langsung dibandingkan dengan
              menjual.
            </p>
          </div>
        )}
        <div className="plan-list">
          {plans.map((plan) => {
            const variants = analysis.rows.filter((r) => r.plan.id === plan.id);
            const isPrimary = property.primaryPlanId === plan.id || (!property.primaryPlanId && plans[0]?.id === plan.id);
            return (
              <div key={plan.id} className={`plan-item${isPrimary ? ' primary' : ''}`}>
                <div className="plan-item-head">
                  <button
                    type="button"
                    className={`star${isPrimary ? ' on' : ''}`}
                    onClick={() => updateProperty(property.id, { primaryPlanId: plan.id })}
                    aria-label={isPrimary ? 'Rencana utama' : 'Jadikan rencana utama'}
                    title={isPrimary ? 'Rencana utama' : 'Jadikan rencana utama'}
                  >
                    ★
                  </button>
                  <div className="plan-title">
                    <Link to={`/rencana/${plan.id}`}>
                      <strong>{plan.name}</strong>
                    </Link>
                    <span className="small muted">{types[plan.type].label}</span>
                  </div>
                  <div className="plan-actions">
                    <Link className="btn small primary" to={`/rencana/${plan.id}`}>
                      Ubah angka
                    </Link>
                    <button
                      type="button"
                      className="btn-icon"
                      title="Salin rencana"
                      aria-label="Salin rencana"
                      onClick={() => navigate(`/rencana/${duplicatePlan(plan)}`)}
                    >
                      <Icon name="copy" />
                    </button>
                    <button
                      type="button"
                      className="btn-icon danger"
                      title="Hapus rencana"
                      aria-label="Hapus rencana"
                      onClick={() => window.confirm(`Hapus rencana "${plan.name}"?`) && deletePlan(plan.id)}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="table numbers compact">
                    <thead>
                      <tr>
                        {variants.length > 1 && <th>Material</th>}
                        <th>{owned ? 'Uang baru' : 'Total modal'}</th>
                        <th>Uang bersih / bulan</th>
                        <th>Hasil / tahun</th>
                        <th>Modal kembali</th>
                        <th>Mulai dapat uang</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v) => (
                        <tr key={v.key}>
                          {variants.length > 1 && <th scope="row">{v.material?.name}</th>}
                          <td>{formatCompact(owned ? v.result.capex.newMoney : v.result.capex.total, 2)}</td>
                          <td>{formatCompact(v.result.noiMonthly)}</td>
                          <td>{formatPercent(v.result.netYield)}</td>
                          <td>{formatYears(v.result.paybackYears, data.settings.maxYears)}</td>
                          <td>{formatMonths(v.result.incomeStartMonth)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        <div className="add-plan">
          <span className="small muted">Tambah rencana:</span>
          {Object.entries(types).map(([type, t]) => (
            <button key={type} type="button" className="btn" onClick={() => navigate(`/rencana/${addPlan(property, type)}`)} title={t.hint}>
              <Icon name="plus" /> {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>
          <span className="step">3</span> Penilaian keluarga
        </h2>
        <p className="muted">Dua hal ini tidak bisa dihitung, jadi dinilai sendiri setelah survei.</p>
        <div className="form-grid">
          <RatingPicker label="Lokasi & peminat" value={property.locationRating} onChange={set('locationRating')} />
          <TextField label="Alasannya" value={property.locationNote} onChange={set('locationNote')} placeholder="Misal: kawasan kos, dekat kampus" />
          <RatingPicker label="Risiko" value={property.riskRating} onChange={set('riskRating')} help="Baik = risikonya rendah" />
          <TextField label="Alasannya" value={property.riskNote} onChange={set('riskNote')} placeholder="Misal: perlu cek rembesan atap" />
          <TextField
            label="Kesimpulan / catatan untuk keluarga"
            value={property.verdictNote}
            onChange={set('verdictNote')}
            wide
            placeholder="Misal: layak kalau bisa ditawar ke ±Rp2,8 M"
          />
        </div>
      </section>

      <section className="card">
        <h2>
          <span className="step">4</span> Harga wajar
        </h2>
        <p className="muted">Perkiraan harga yang pantas dibayar, dari dua sisi: nilai tanah + bangunannya, dan uang sewa yang bisa dihasilkan.</p>
        <div className="form-grid">
          <MoneyField
            label="Harga tanah sekitar (terendah) per m²"
            value={property.landPriceMin}
            onChange={set('landPriceMin')}
            help="Dari iklan tanah di sekitar"
          />
          <MoneyField label="Harga tanah sekitar (tertinggi) per m²" value={property.landPriceMax} onChange={set('landPriceMax')} />
          <MoneyField
            label="Nilai bangunan + isi (terendah)"
            value={property.buildingValueMin}
            onChange={set('buildingValueMin')}
            help="≈ luas bangunan × biaya bangun × (1 − penyusutan); isi 0 kalau bangunan akan dibongkar"
          />
          <MoneyField label="Nilai bangunan + isi (tertinggi)" value={property.buildingValueMax} onChange={set('buildingValueMax')} />
        </div>
        <div className="ranges">
          <Range label="Dari nilai tanah + bangunan" range={fairCost} />
          <Range
            label={`Dari uang sewa (hasil ${formatPercent(data.settings.targetYieldLow)}–${formatPercent(data.settings.targetYieldHigh)})`}
            range={fairIncome}
            help={
              primary ? `memakai rencana ★ ${primary.plan.name}${primary.material ? ` · ${primary.material.name}` : ''}` : 'tambahkan rencana dulu'
            }
          />
          <div className="range">
            <span className="stat-label">{owned ? 'Perkiraan harga jual' : 'Harga yang diminta'}</span>
            <strong>{formatCompact(property.askingPrice, 2)}</strong>
            {card.rows[0].rating && <RatingBadge rating={card.rows[0].rating}>{card.rows[0].note}</RatingBadge>}
          </div>
        </div>
        {primary?.result.maxPrice != null && (
          <p className="meaning">
            <b>Artinya:</b> supaya hasil bersih minimal {formatPercent(data.settings.targetYieldLow)} per tahun, harga beli sebaiknya tidak lebih dari{' '}
            <b>{formatCompact(primary.result.maxPrice, 2)}</b>.
          </p>
        )}
      </section>

      {!owned && (
        <section className="card">
          <h2>
            <span className="step">5</span> Cek sebelum bayar DP{' '}
            <span className="small muted">
              ({doneCount}/{CHECKLIST.length} selesai)
            </span>
          </h2>
          <ul className="checklist">
            {CHECKLIST.map((c) => (
              <li key={c.key}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!checklist[c.key]}
                    onChange={(e) =>
                      set('checklist')({
                        ...checklist,
                        [c.key]: e.target.checked,
                      })
                    }
                  />
                  <span>{c.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card" id="cek-sumber">
        <h2>
          <span className="step">{owned ? 5 : 6}</span> Cek sumber angka{' '}
          <span className="small muted">
            ({sourceProg.done}/{sourceProg.total} sudah dicek)
          </span>
        </h2>
        <p className="muted">
          Angka properti ini yang perlu dipastikan. Ganti angkanya di tempat yang disebut “Masukkan di”, lalu tandai <b>Sudah dicek</b> dan tulis
          buktinya.
        </p>
        <div className="source-list">
          {propertySources(property).map((src) => (
            <SourceItem
              key={src.key}
              src={src}
              state={property.sources?.[src.key]}
              onChange={(patch) => updatePropertySource(property.id, src.key, patch)}
              compact
            />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>
          <span className="step">{owned ? 6 : 7}</span> Catatan & temuan lapangan
        </h2>
        <TextField
          label="Catatan"
          value={property.notes}
          onChange={set('notes')}
          multiline
          wide
          placeholder="Misal: noda di dinding void, parkir hanya motor, kos sebelah sedang cari penyewa…"
        />
      </section>

      <div className="danger-zone">
        <button type="button" className="btn danger" onClick={remove}>
          <Icon name="trash" /> Hapus properti ini
        </button>
      </div>
    </div>
  );
}
