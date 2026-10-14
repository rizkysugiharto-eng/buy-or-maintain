// Satu baris "Sumber angka": status perkiraan / sudah dicek, dari mana angkanya, cara memastikannya, dan catatan bukti.

import { TextField } from './Fields.jsx';

export default function SourceItem({ src, state = {}, onChange, compact = false }) {
  const checked = state.status === 'dicek';
  return (
    <div className={`source-item${checked ? ' checked' : ''}`}>
      <div className="source-head">
        <h3>{src.label}</h3>
        <div className="segmented source-status" role="group" aria-label={`Status ${src.label}`}>
          <button
            type="button"
            className={`seg${!checked ? ' active' : ''}`}
            aria-pressed={!checked}
            onClick={() => onChange({ status: 'perkiraan' })}
          >
            Perkiraan
          </button>
          <button
            type="button"
            className={`seg rating-baik${checked ? ' active' : ''}`}
            aria-pressed={checked}
            onClick={() => onChange({ status: 'dicek' })}
          >
            Sudah dicek
          </button>
        </div>
      </div>
      <dl className="source-meta">
        {!compact && (
          <>
            <dt>Dipakai di</dt>
            <dd>{src.usedIn}</dd>
            <dt>Sumber sekarang</dt>
            <dd>{src.now}</dd>
          </>
        )}
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
        {src.links?.length > 0 && (
          <ul className="source-links small">
            {src.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </details>
      <TextField
        label="Catatan / bukti"
        value={state.note}
        onChange={(note) => onChange({ note })}
        placeholder="Misal: SPPT PBB 2026 — tanah 111 m², bangunan 315 m²"
        wide
      />
    </div>
  );
}
