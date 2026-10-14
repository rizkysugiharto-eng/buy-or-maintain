// Satu tempat untuk semua data (properti, rencana, paket material, asumsi)
// beserta fungsi ubah/tambah/hapus. Setiap perubahan langsung disimpan di browser.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { emptyData, exampleData } from '../data/example.js';
import { analyze, planVariants } from '../lib/calc.js';
import { loadBackup, loadLocal, loadPrefs, mergeData, saveBackup, saveLocal, savePrefs } from '../lib/storage.js';

const DataContext = createContext(null);

const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const jt = (v) => v * 1e6;

// Isian awal rencana baru, mengikuti kebiasaan di laporan
// Properti milik keluarga (sering di luar kawasan kos): sewa, kamar, biaya rutin & luas bangun dikosongkan
// supaya diisi sesuai keadaan setempat, bukan memakai angka kos Malang.
function planTemplate(property, type) {
  const owned = !!property.owned;
  const base = {
    id: newId('plan'),
    propertyId: property.id,
    type,
    purchasePrice: null,
    transactionPct: 6.5,
    transactionAuto: true,
    extraCosts: [],
    rooms: property.rooms || (owned ? null : 10),
    rentPerRoom: owned ? null : jt(1.5),
    occupancyPct: 90,
    opexFixedMonthly: owned ? null : jt(1),
    opexPerRoomMonthly: owned ? null : jt(0.21),
    maintenancePct: 6,
    pbbYearly: owned ? null : jt(5),
    managementPct: 0,
    incomeTaxPct: 0,
    buildMonths: 0,
  };
  if (type === 'beli')
    return {
      ...base,
      name: owned ? 'Sewakan apa adanya' : 'Beli jadi',
      extraCosts: owned ? [] : [{ id: newId('x'), label: 'Perbaikan kecil', amount: jt(30) }],
    };
  if (type === 'renovasi')
    return {
      ...base,
      name: owned ? 'Renovasi lalu sewakan' : 'Renovasi',
      buildMonths: 5,
      extraCosts: [{ id: newId('x'), label: 'Biaya renovasi', amount: jt(500) }],
    };
  return {
    ...base,
    name: owned ? 'Bangun lalu sewakan' : 'Bangun kos baru',
    buildMonths: 10,
    buildArea: owned ? null : Math.round((property.landArea || 150) * 0.65 * 3),
    buildCostPerM2: jt(4.8),
    materialIds: [],
    furnishingPerRoom: jt(12),
    designPct: 6,
    contingencyPct: 10,
    extraCosts: [{ id: newId('x'), label: 'Bongkar bangunan lama', amount: jt(30) }],
  };
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => loadLocal() ?? exampleData());
  const [prefs, setPrefs] = useState(() => ({ theme: 'light', ...loadPrefs() }));
  const [notice, setNotice] = useState(null); // pesan di atas halaman (mis. setelah buka link)

  useEffect(() => {
    saveLocal(data);
  }, [data]);
  useEffect(() => {
    savePrefs(prefs);
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs]);

  const setPref = useCallback((key, value) => setPrefs((p) => ({ ...p, [key]: value })), []);

  // Ubah satu daftar (properties / plans / materials) secara aman
  const patchList = useCallback((list, id, patch) => {
    setData((d) => ({ ...d, [list]: d[list].map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
  }, []);

  const actions = useMemo(
    () => ({
      updateProperty: (id, patch) => patchList('properties', id, patch),
      updatePlan: (id, patch) => patchList('plans', id, patch),
      updateMaterial: (id, patch) => patchList('materials', id, patch),
      updateSettings: (patch) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      updateSource: (key, patch) => setData((d) => ({ ...d, sources: { ...d.sources, [key]: { ...d.sources?.[key], ...patch } } })),
      updatePropertySource: (propertyId, key, patch) =>
        setData((d) => ({
          ...d,
          properties: d.properties.map((p) =>
            p.id === propertyId ? { ...p, sources: { ...p.sources, [key]: { ...p.sources?.[key], ...patch } } } : p,
          ),
        })),
      setTitle: (title) => setData((d) => ({ ...d, title })),

      addProperty: () => {
        const property = {
          id: newId('prop'),
          name: 'Properti baru',
          region: 'kota-malang',
          regionRules: {},
          address: '',
          description: '',
          askingPrice: null,
          landArea: null,
          buildingArea: null,
          rooms: null,
          landPriceMin: null,
          landPriceMax: null,
          buildingValueMin: null,
          buildingValueMax: null,
          locationRating: '',
          locationNote: '',
          riskRating: '',
          riskNote: '',
          notes: '',
          checklist: {},
          primaryPlanId: null,
        };
        setData((d) => ({ ...d, properties: [...d.properties, property] }));
        return property.id;
      },
      deleteProperty: (id) =>
        setData((d) => ({
          ...d,
          properties: d.properties.filter((p) => p.id !== id),
          plans: d.plans.filter((p) => p.propertyId !== id),
        })),

      addPlan: (property, type) => {
        const plan = planTemplate(property, type);
        setData((d) => ({
          ...d,
          plans: [...d.plans, plan],
          properties: d.properties.map((p) => (p.id === property.id && !p.primaryPlanId ? { ...p, primaryPlanId: plan.id } : p)),
        }));
        return plan.id;
      },
      duplicatePlan: (plan) => {
        const copy = { ...structuredClone(plan), id: newId('plan'), name: `${plan.name} (salinan)` };
        setData((d) => ({ ...d, plans: [...d.plans, copy] }));
        return copy.id;
      },
      deletePlan: (id) =>
        setData((d) => ({
          ...d,
          plans: d.plans.filter((p) => p.id !== id),
          properties: d.properties.map((p) => (p.primaryPlanId === id ? { ...p, primaryPlanId: null } : p)),
        })),

      addMaterial: (from) => {
        const material = from
          ? { ...structuredClone(from), id: newId('mat'), name: `${from.name} (salinan)` }
          : {
              id: newId('mat'),
              name: 'Paket baru',
              note: '',
              components: [{ id: newId('c'), part: 'Struktur & pondasi', material: '', costPerM2: jt(1.5) }],
              furnishingPerRoom: null,
              designPct: null,
              buildMonthsAdjust: 0,
              rentAdjustPct: 0,
              occupancyAdjustPt: 0,
              maintenancePct: null,
              refreshEveryYears: null,
              refreshCostPerM2: null,
            };
        setData((d) => ({ ...d, materials: [...d.materials, material] }));
        return material.id;
      },
      deleteMaterial: (id) =>
        setData((d) => ({
          ...d,
          materials: d.materials.filter((m) => m.id !== id),
          plans: d.plans.map((p) => (p.materialIds?.includes(id) ? { ...p, materialIds: p.materialIds.filter((m) => m !== id) } : p)),
        })),

      // Ganti seluruh data (buka file / link / contoh). Data lama disimpan sebagai cadangan.
      replaceData: (next, message) => {
        setData((current) => {
          saveBackup(current);
          return next;
        });
        if (message) setNotice({ message, canUndo: true });
      },
      // Tambahkan properti dari file lain tanpa menghapus yang sudah ada
      mergeIn: (incoming, fileName) => {
        setData((current) => {
          const { data: next, added, addedPlans } = mergeData(current, incoming);
          saveBackup(current);
          const parts = [added && `${added} properti`, addedPlans && `${addedPlans} rencana`].filter(Boolean);
          setNotice({
            message: parts.length
              ? `${parts.join(' dan ')} dari "${fileName}" sudah ditambahkan.`
              : `Semua isi "${fileName}" sudah ada — tidak ada yang ditambahkan.`,
            canUndo: parts.length > 0,
          });
          return next;
        });
      },
      undoReplace: () => {
        const backup = loadBackup();
        if (backup) setData(backup);
        setNotice(null);
      },
      loadExample: () => setData(exampleData()),
      clearAll: () => {
        setData((current) => {
          saveBackup(current);
          return emptyData();
        });
        setNotice({ message: 'Semua data dikosongkan.', canUndo: true });
      },
    }),
    [patchList],
  );

  // Hasil hitung (skenario normal) untuk semua rencana × paket material
  const analysis = useMemo(() => {
    const byKey = {};
    const rows = [];
    for (const plan of data.plans) {
      const property = data.properties.find((p) => p.id === plan.propertyId);
      if (!property) continue;
      for (const v of planVariants(plan, data.materials)) {
        const result = analyze(plan, property, v.material, data.settings);
        const row = { ...v, plan, property, result };
        byKey[v.key] = row;
        rows.push(row);
      }
    }
    return { rows, byKey };
  }, [data]);

  const value = { data, prefs, setPref, notice, setNotice, analysis, ...actions };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}

// Varian utama sebuah properti (rencana utama, paket material pertama)
export function primaryRow(analysis, property) {
  const rows = analysis.rows.filter((r) => r.property.id === property.id);
  return rows.find((r) => r.plan.id === property.primaryPlanId) ?? rows[0] ?? null;
}
