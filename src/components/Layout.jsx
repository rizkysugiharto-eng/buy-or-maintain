// Kerangka aplikasi: judul, menu utama (3 menu + pengaturan), tombol Bagikan, dan pesan pemberitahuan.

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { formatNumber } from '../lib/format.js';
import { shareUrl } from '../lib/storage.js';
import Icon from './Icon.jsx';

const NAV = [
  { to: '/', label: 'Ringkasan', icon: 'home' },
  { to: '/properti', label: 'Properti', icon: 'building' },
  { to: '/material', label: 'Banding Material', icon: 'layers' },
  { to: '/pengaturan', label: 'Data & Asumsi', icon: 'settings' },
  { to: '/cara-pakai', label: 'Cara Pakai', icon: 'info' },
];

export function ShareDialog({ onClose }) {
  const { data, prefs, setPref } = useData();
  const brief = prefs.shareBrief !== false; // bawaan: link ringkas
  const [urls, setUrls] = useState({ brief: '', full: '' });
  const [copied, setCopied] = useState(false);
  const url = brief ? urls.brief : urls.full;

  useEffect(() => {
    Promise.all([shareUrl(data, { brief: true }), shareUrl(data)]).then(([b, f]) => setUrls({ brief: b, full: f }));
  }, [data]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const box = document.getElementById('share-url');
      box?.closest('details')?.setAttribute('open', '');
      box?.select();
      document.execCommand?.('copy');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const waText = `Ini perbandingan properti keluarga, tinggal buka link-nya ya:\n${url}`;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="share-title">Bagikan ke keluarga</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Tutup">
            <Icon name="x" />
          </button>
        </div>
        <p>
          Kirim link ini lewat WhatsApp. Siapa pun yang membukanya akan melihat <b>angka yang sama persis</b> dengan yang ada di layar kamu sekarang —
          tanpa perlu daftar atau login.
        </p>
        <fieldset className="field">
          <legend>Isi link</legend>
          <div className="segmented">
            <button type="button" className={`seg${brief ? ' active' : ''}`} aria-pressed={brief} onClick={() => setPref('shareBrief', true)}>
              <strong>Ringkas</strong>
              <small>Semua angka & hasil, tanpa catatan · {formatNumber(urls.brief.length)} karakter</small>
            </button>
            <button type="button" className={`seg${!brief ? ' active' : ''}`} aria-pressed={!brief} onClick={() => setPref('shareBrief', false)}>
              <strong>Lengkap</strong>
              <small>Termasuk catatan & bukti sumber · {formatNumber(urls.full.length)} karakter</small>
            </button>
          </div>
        </fieldset>
        <details className="share-raw">
          <summary>Lihat link</summary>
          <textarea id="share-url" className="share-url" readOnly value={url} rows={4} onFocus={(e) => e.target.select()} />
        </details>
        <div className="btn-row">
          <a className="btn primary" href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer">
            Kirim lewat WhatsApp
          </a>
          <button type="button" className="btn" onClick={copy} disabled={!url}>
            <Icon name={copied ? 'check' : 'copy'} />
            {copied ? 'Tersalin' : 'Salin link'}
          </button>
        </div>
        <p className="muted small">
          🔒 Datanya ada di dalam link itu sendiri, tidak disimpan di server mana pun. Jadi cukup bagikan ke orang yang memang boleh melihat. Kalau
          ada angka yang diubah, kirim link baru.
        </p>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { prefs, setPref, notice, setNotice, undoReplace, data } = useData();
  const [sharing, setSharing] = useState(false);
  const location = useLocation();

  // Kurung kurawal penting: di Chrome terbaru scrollTo mengembalikan Promise, dan React
  // akan mencoba "membersihkan" efek dengan memanggil nilai itu saat pindah halaman.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <Icon name="building" size={18} />
            </span>
            <span>
              <span className="brand-title">Beli atau Rawat?</span>
              <span className="brand-sub">{data.title || 'Perbandingan properti keluarga'}</span>
            </span>
          </Link>
          <div className="header-tools">
            <button type="button" className="btn primary" onClick={() => setSharing(true)} aria-label="Bagikan">
              <Icon name="share" />
              <span>Bagikan</span>
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setPref('theme', prefs.theme === 'dark' ? 'light' : 'dark')}
              aria-label={prefs.theme === 'dark' ? 'Ganti ke tampilan terang' : 'Ganti ke tampilan gelap'}
              title="Terang / gelap"
            >
              <Icon name={prefs.theme === 'dark' ? 'sun' : 'moon'} />
            </button>
          </div>
        </div>
        <nav className="tabs" aria-label="Menu utama">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main">
        {notice && (
          <div className="notice" role="status">
            <Icon name="info" />
            <span>{notice.message}</span>
            {notice.canUndo && (
              <button type="button" className="btn small" onClick={undoReplace}>
                Kembalikan data sebelumnya
              </button>
            )}
            <button type="button" className="btn-icon" onClick={() => setNotice(null)} aria-label="Tutup pesan">
              <Icon name="x" />
            </button>
          </div>
        )}
        {children}
      </main>

      <footer className="footer">
        Semua angka adalah perkiraan, bukan jaminan hasil dan bukan nasihat keuangan profesional. Keputusan akhir tetap perlu cek lapangan oleh
        tukang/insinyur dan cek surat-surat oleh notaris/PPAT.
        <span className="version">Versi {typeof __APP_VERSION__ === 'undefined' ? 'pengembangan' : __APP_VERSION__}</span>
      </footer>

      {sharing && <ShareDialog onClose={() => setSharing(false)} />}
    </div>
  );
}
