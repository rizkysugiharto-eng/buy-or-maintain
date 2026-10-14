// Properti milik keluarga: dijual setelah dipagar tembok keliling — bandingkan paket material pagar
// dan apakah kenaikan harga jualnya menutup biaya pagar.

import { FENCE_STRUCTURE, FENCE_UNIT, squarePerimeter } from '../data/fence.js';
import { fenceSale } from '../lib/calc.js';
import { formatCompact, formatNumber, formatRupiah } from '../lib/format.js';
import { MoneyField, NumberField } from './Fields.jsx';

export default function FenceSection({ property, settings, onChange }) {
  const fence = property.fence ?? {};
  const set = (key) => (value) => onChange({ fence: { ...fence, [key]: value } });
  const r = fenceSale(property, settings);
  const perimeter = Math.round(squarePerimeter(Number(property.landArea) || 0));
  const best = [...r.options].sort((a, b) => a.cost - b.cost)[0];
  return (
    <>
      <p className="muted">
        Tanah dipagar tembok keliling dulu, lalu dijual. Bandingkan biaya pagar tiap material dan berapa harga jual harus naik supaya biayanya
        tertutup.
      </p>
      <div className="form-grid">
        <NumberField
          label="Panjang tembok"
          unit="m"
          value={fence.length}
          onChange={set('length')}
          min={0}
          help={
            perimeter
              ? `Kosong = keliling tanah persegi ±${formatNumber(perimeter)} m. Ukur keliling sebenarnya, kurangi lebar gerbang.`
              : 'Keliling tanah, kurangi lebar gerbang'
          }
        />
        <NumberField label="Tinggi tembok" unit="m" value={fence.height} onChange={set('height')} min={0} max={6} help="Kosong = 3 m" />
        <MoneyField label="Biaya lain" value={fence.extra} onChange={set('extra')} help="Mis. pintu gerbang, bongkar pagar lama, perataan tanah" />
        <MoneyField
          label="Perkiraan kenaikan harga jual kalau dipagar"
          value={fence.uplift}
          onChange={set('uplift')}
          help="Tanya makelar/pembeli: tanah berpagar laku berapa lebih mahal?"
        />
      </div>

      {!r.value && <p className="warn-text">Isi “Perkiraan harga kalau dijual” di atas supaya hasil penjualan bisa dihitung.</p>}

      <div className="table-wrap">
        <table className="table numbers compact">
          <thead>
            <tr>
              <th>Material pagar</th>
              <th>Biaya per m panjang</th>
              <th>Total biaya pagar</th>
              <th>Impas kalau harga naik</th>
              {r.value > 0 && <th>Terima bersih</th>}
              {r.value > 0 && <th>Dibanding jual tanpa pagar</th>}
            </tr>
          </thead>
          <tbody>
            {r.options.map((o) => (
              <tr key={o.pkg.id} className={o === best ? 'total' : undefined}>
                <th scope="row">
                  {o.pkg.name}
                  <div className="small muted text-cell">{o.pkg.note}</div>
                </th>
                <td>{formatCompact(o.perMeter)}</td>
                <td>{formatCompact(o.cost, 1)}</td>
                <td>
                  ≥ {formatCompact(o.breakEven, 1)}
                  {o.breakEvenPerM2 != null && <div className="small muted">±{formatCompact(o.breakEvenPerM2)}/m² tanah</div>}
                </td>
                {r.value > 0 && <td>{formatCompact(o.net, 2)}</td>}
                {r.value > 0 && (
                  <td className={o.vsPlain >= 0 ? 'good-text' : 'warn-text'}>
                    {o.vsPlain >= 0 ? '+' : '−'}
                    {formatCompact(Math.abs(o.vsPlain), 1)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="meaning">
        <b>Artinya:</b> tembok {formatNumber(r.length)} m × {formatNumber(r.height, 1)} m (±{formatNumber(Math.round(r.wallArea))} m² bidang dinding).
        Paling hemat: <b>{best.pkg.name}</b> ±{formatCompact(best.cost, 1)}. Memagar baru menguntungkan kalau harga jualnya naik minimal{' '}
        {formatCompact(best.breakEven, 1)}
        {best.breakEvenPerM2 != null ? ` (±${formatCompact(best.breakEvenPerM2)} per m² tanah)` : ''}
        {r.value > 0 ? ` — tanpa pagar terima bersih ±${formatCompact(r.plain, 2)}.` : '.'} Pagar juga menjaga batas tanah & mencegah penyerobotan,
        yang tidak terlihat di angka ini.
      </p>

      <details className="source-how">
        <summary>Dari mana angkanya?</summary>
        <p className="small">
          Harga bahan & upah harian dari Perwal Kota Malang 14/2025, upah borongan dari RAB kos 5 lantai Sigura-gura, hebel terpasang dari RAB
          Sawojajar, jumlah bahan per satuan menurut koefisien SNI/AHSP
          {r.priceIndex !== 1 ? `, lalu dikali indeks harga ${formatNumber(r.priceIndex, 2)} untuk daerah ini (HSBGN)` : ''}. Perkiraan — minta RAB
          tukang setempat.
        </p>
        <table className="table numbers compact">
          <tbody>
            {Object.values(FENCE_UNIT).map((u) => (
              <tr key={u.label}>
                <th scope="row">{u.label}</th>
                <td>
                  {formatRupiah(Math.round(u.price / 50) * 50)}
                  <div className="small muted">per {u.unit}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small">
          Struktur per meter pagar (sama untuk semua material): pondasi batu kali 25/60 cm dalam 60 cm, sloof 15/20, kolom praktis 15/15 tiap 3 m,
          ring balk 15/15, besi 4 Ø10 + begel Ø8 —{' '}
          {FENCE_STRUCTURE.map((s) => `${s.label.toLowerCase()} ${formatNumber(s.qty, 2)} ${s.unit}`).join(', ')} = ±{formatCompact(r.structure)}/m.
        </p>
      </details>
    </>
  );
}
