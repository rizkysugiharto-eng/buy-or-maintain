// Daftar halaman + pembuka link bagikan (#/?data=...).

import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Layout from './components/Layout.jsx';
import { useData } from './context/DataContext.jsx';
import { decodeShare } from './lib/storage.js';
import GuidePage from './pages/GuidePage.jsx';
import Home from './pages/Home.jsx';
import MaterialPage from './pages/MaterialPage.jsx';
import PlanPage from './pages/PlanPage.jsx';
import Properties from './pages/Properties.jsx';
import PropertyPage from './pages/PropertyPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Kalau halaman dibuka dari link bagikan, muat datanya lalu bersihkan alamatnya
function SharedLinkLoader() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { replaceData, setNotice } = useData();
  const encoded = params.get('data');
  const handled = useRef(null); // cegah dibuka dua kali (data lama jangan tertimpa sebagai cadangan)

  useEffect(() => {
    if (!encoded || handled.current === encoded) return;
    handled.current = encoded;
    decodeShare(encoded)
      .then((data) => replaceData(data, 'Data dari link bagikan sudah dibuka dan tersimpan di perangkat ini.'))
      .catch(() => setNotice({ message: 'Link tidak bisa dibuka — mungkin terpotong saat disalin. Minta kirim ulang link-nya.' }))
      .finally(() => navigate('/', { replace: true }));
  }, [encoded, navigate, replaceData, setNotice]);

  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <Layout>
      <SharedLinkLoader />
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properti" element={<Properties />} />
          <Route path="/properti/:id" element={<PropertyPage />} />
          <Route path="/rencana/:id" element={<PlanPage />} />
          <Route path="/material" element={<MaterialPage />} />
          <Route path="/pengaturan" element={<SettingsPage />} />
          <Route path="/cara-pakai" element={<GuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}
