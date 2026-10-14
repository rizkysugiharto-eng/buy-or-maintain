// Penyimpanan di browser (localStorage) + link bagikan + simpan/buka file.
// Data keluarga TIDAK pernah dikirim ke server: tersimpan di HP/laptop masing-masing,
// dan dibagikan lewat link (data ada di bagian "#" link, yang tidak dikirim ke server)
// atau lewat file .json.

import { DEFAULT_SETTINGS } from './calc.js';
import { DATA_VERSION } from '../data/example.js';

const STORAGE_KEY = 'buy-or-maintain:data';
const BACKUP_KEY = 'buy-or-maintain:backup';
const PREFS_KEY = 'buy-or-maintain:prefs';

export function isValidData(data) {
  return (
    data &&
    typeof data === 'object' &&
    data.version === DATA_VERSION &&
    ['properties', 'plans', 'materials'].every((k) => Array.isArray(data[k]))
  );
}

// Lengkapi pengaturan yang belum ada (mis. data dari versi lama)
export function normalizeData(data) {
  return {
    ...data,
    settings: {
      ...DEFAULT_SETTINGS,
      ...data.settings,
      scenarios: { ...DEFAULT_SETTINGS.scenarios, ...data.settings?.scenarios },
    },
  };
}

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // localStorage bisa diblokir (mode private)
  }
}

function write(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Gagal simpan tidak menghentikan aplikasi; data tetap ada selama tab terbuka
  }
}

export function loadLocal() {
  const data = read(STORAGE_KEY);
  return isValidData(data) ? normalizeData(data) : null;
}

export const saveLocal = (data) => write(STORAGE_KEY, data);
export const loadBackup = () => {
  const data = read(BACKUP_KEY);
  return isValidData(data) ? normalizeData(data) : null;
};
export const saveBackup = (data) => write(BACKUP_KEY, data);
export const loadPrefs = () => read(PREFS_KEY) ?? {};
export const savePrefs = (prefs) => write(PREFS_KEY, prefs);

// ===== Link bagikan: JSON → dikompres → base64url =====

function toBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text) {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function pipe(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export async function encodeShare(data) {
  const json = new TextEncoder().encode(JSON.stringify(data));
  return toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
}

export async function decodeShare(text) {
  const bytes = await pipe(fromBase64Url(text), new DecompressionStream('deflate-raw'));
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!isValidData(data)) throw new Error('Data di link tidak dikenali');
  return normalizeData(data);
}

export async function shareUrl(data) {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/?data=${await encodeShare(data)}`;
}

// ===== File .json =====

export function downloadFile(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readJsonFile(file) {
  const data = JSON.parse(await file.text());
  if (!isValidData(data)) throw new Error('File ini bukan data dari aplikasi ini');
  return normalizeData(data);
}
