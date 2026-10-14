// Titik masuk aplikasi: React "dipasang" ke <div id="root"> di index.html.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { DataProvider } from './context/DataContext.jsx';
import './styles.css';

// HashRouter (alamat seperti /#/properti) dipakai agar aman di GitHub Pages,
// dan supaya data di link bagikan (#/?data=...) tidak pernah terkirim ke server.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </HashRouter>
  </StrictMode>,
);
