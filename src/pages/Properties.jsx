// Daftar properti yang sedang dipertimbangkan.

import { Link, useNavigate } from 'react-router-dom';
import { RatingBadge } from '../components/Fields.jsx';
import Icon from '../components/Icon.jsx';
import { primaryRow, useData } from '../context/DataContext.jsx';
import { reportCard } from '../lib/calc.js';
import { regionRules } from '../data/regions.js';
import { formatCompact, formatNumber, formatYears } from '../lib/format.js';

export default function Properties() {
  const { data, analysis, addProperty } = useData();
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Properti</h1>
          <p className="muted">Setiap properti bisa punya beberapa rencana: beli jadi, renovasi, atau bangun baru.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => navigate(`/properti/${addProperty()}`)}>
          <Icon name="plus" /> Tambah properti
        </button>
      </div>

      {data.properties.length === 0 && <p className="empty">Belum ada properti. Tekan “Tambah properti” untuk mulai.</p>}

      <div className="list">
        {data.properties.map((property, i) => {
          const row = primaryRow(analysis, property);
          const { verdict } = reportCard(property, row?.result, data.settings);
          const planCount = data.plans.filter((p) => p.propertyId === property.id).length;
          return (
            <Link key={property.id} to={`/properti/${property.id}`} className="card list-item" style={{ '--accent': `var(--series-${(i % 8) + 1})` }}>
              <div className="list-main">
                <h3>{property.name}</h3>
                <p className="muted small">
                  {regionRules(property, data.settings).name} · {property.address || 'Alamat belum diisi'}
                </p>
                <p className="small">
                  {property.askingPrice ? formatCompact(property.askingPrice, 1) : 'Harga belum diisi'}
                  {property.landArea ? ` · tanah ${formatNumber(property.landArea)} m²` : ''}
                  {` · ${planCount} rencana`}
                  {row && !row.result.incomplete ? ` · modal kembali ${formatYears(row.result.paybackYears, data.settings.maxYears)}` : ''}
                </p>
              </div>
              {verdict && <RatingBadge rating={verdict.level}>{verdict.label}</RatingBadge>}
              <Icon name="chevron" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
