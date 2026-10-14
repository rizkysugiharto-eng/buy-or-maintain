// Pengaman: kalau sebuah halaman error, tampilkan pesan + tombol muat ulang,
// bukan layar putih kosong. Teks error ikut ditampilkan supaya bisa dilaporkan.

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Halaman gagal ditampilkan:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="card crash" role="alert">
        <h2>Maaf, halaman ini gagal ditampilkan</h2>
        <p>Data kamu aman, tetap tersimpan di perangkat ini. Coba muat ulang halaman.</p>
        <div className="btn-row">
          <button type="button" className="btn primary" onClick={() => window.location.reload()}>
            Muat ulang
          </button>
          <a className="btn" href="#/" onClick={() => setTimeout(() => window.location.reload(), 0)}>
            Ke Ringkasan
          </a>
        </div>
        <p className="small muted">
          Kalau Chrome menawarkan terjemahan halaman, pilih “Jangan terjemahkan”. Kalau masih terjadi, kirim tulisan di bawah ini:
        </p>
        <pre className="crash-detail">{String(error?.message || error)}</pre>
      </div>
    );
  }
}
