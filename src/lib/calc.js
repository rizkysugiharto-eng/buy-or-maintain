// Mesin hitung: modal, uang bersih, balik modal, harga wajar, dan rapor.
// Rumusnya sama dengan laporan analisis kos keluarga:
//   Total modal  = harga beli + biaya surat-surat (±6,5%) + biaya bangun/renovasi
//   Uang bersih  = sewa × kamar × keterisian − operasional − perawatan − PBB (− fee pengelola − pajak)
//   Balik modal  = waktu sampai uang bersih terkumpul = total modal (+ masa bangun)
// Semua uang dalam Rupiah per tahun, kecuali disebut lain.

export const PLAN_TYPES = {
  beli: { label: 'Beli jadi', hint: 'Bangunan sudah jadi, langsung disewakan' },
  renovasi: { label: 'Renovasi', hint: 'Bangunan lama diperbaiki / ditambah kamar' },
  bangun: { label: 'Bangun baru', hint: 'Bangun kos dari tanah kosong atau setelah dibongkar' },
};

export const RATINGS = {
  baik: { label: 'Baik', score: 2 },
  cukup: { label: 'Cukup', score: 1 },
  kurang: { label: 'Kurang', score: 0 },
};

export const DEFAULT_SETTINGS = {
  budget: 4_000_000_000, // dana yang disiapkan keluarga
  targetYieldLow: 5.5, // hasil bersih yang dianggap layak (%/tahun)
  targetYieldHigh: 6,
  paybackGood: 18, // balik modal ≤ ini = Baik
  paybackOk: 25, // ≤ ini = Cukup
  rentGrowthPct: 0, // kenaikan sewa per tahun
  costGrowthPct: 0, // kenaikan biaya operasional per tahun
  startMonth: '2026-11', // bulan mulai hitung (YYYY-MM)
  chartYears: 30,
  maxYears: 60, // batas hitung balik modal
  scenarios: {
    optimis: { rentPct: 5, occupancyPt: 8, opexPct: 0, capexPct: 0 },
    pesimis: { rentPct: -10, occupancyPt: -12, opexPct: 15, capexPct: 15 },
  },
};

export const SCENARIOS = {
  optimis: 'Optimis',
  moderat: 'Normal',
  pesimis: 'Pesimis',
};

const num = (v, fallback = 0) => (v == null || v === '' || Number.isNaN(Number(v)) ? fallback : Number(v));
const pick = (override, base) => (override == null || override === '' ? base : override);

// Biaya bangun per m² dari paket material = jumlah biaya semua komponennya
export function materialCostPerM2(material) {
  return (material?.components ?? []).reduce((sum, c) => sum + num(c.costPerM2), 0);
}

/**
 * Gabungkan rencana + properti + (opsional) paket material jadi satu set angka siap hitung.
 * Paket material mengubah biaya bangun per m², dan bila diisi juga: isi kamar, biaya desain,
 * masa bangun (± bulan), sewa (± %), keterisian (± poin), perawatan, dan peremajaan berkala.
 */
export function resolvePlan(plan, property, material) {
  const isBuild = plan.type === 'bangun';
  const m = isBuild ? material : null;
  return {
    type: plan.type,
    purchasePrice: num(pick(plan.purchasePrice, property?.askingPrice)),
    transactionPct: num(plan.transactionPct, 6.5),
    extraCosts: (plan.extraCosts ?? []).reduce((sum, c) => sum + num(c.amount), 0),
    buildArea: isBuild ? num(plan.buildArea) : 0,
    buildCostPerM2: isBuild ? (m ? materialCostPerM2(m) : num(plan.buildCostPerM2)) : 0,
    furnishingPerRoom: isBuild ? num(pick(m?.furnishingPerRoom, plan.furnishingPerRoom)) : 0,
    designPct: isBuild ? num(pick(m?.designPct, plan.designPct)) : 0,
    contingencyPct: isBuild ? num(plan.contingencyPct) : 0,
    // Material bisa mempercepat/memperlambat bangun dan menaikkan/menurunkan sewa yang pantas
    buildMonths: Math.max(0, num(plan.buildMonths) + (isBuild ? num(m?.buildMonthsAdjust) : 0)),
    rooms: num(plan.rooms),
    rentPerRoom: num(plan.rentPerRoom) * (1 + (m ? num(m.rentAdjustPct) : 0) / 100),
    occupancyPct: Math.min(100, num(plan.occupancyPct, 90) + (m ? num(m.occupancyAdjustPt) : 0)),
    opexFixedMonthly: num(plan.opexFixedMonthly),
    opexPerRoomMonthly: num(plan.opexPerRoomMonthly),
    maintenancePct: num(pick(m?.maintenancePct, plan.maintenancePct), 6),
    pbbYearly: num(plan.pbbYearly),
    managementPct: num(plan.managementPct),
    incomeTaxPct: num(plan.incomeTaxPct),
    refreshEveryYears: m ? num(m.refreshEveryYears) : 0,
    refreshCostPerM2: m ? num(m.refreshCostPerM2) : 0,
  };
}

// Terapkan skenario optimis/pesimis ke angka rencana
export function applyScenario(p, scenario, settings = DEFAULT_SETTINGS) {
  const s = scenario === 'moderat' ? null : settings.scenarios?.[scenario];
  if (!s) return p;
  const capex = 1 + num(s.capexPct) / 100;
  const opex = 1 + num(s.opexPct) / 100;
  return {
    ...p,
    rentPerRoom: p.rentPerRoom * (1 + num(s.rentPct) / 100),
    occupancyPct: Math.min(100, Math.max(0, p.occupancyPct + num(s.occupancyPt))),
    opexFixedMonthly: p.opexFixedMonthly * opex,
    opexPerRoomMonthly: p.opexPerRoomMonthly * opex,
    extraCosts: p.extraCosts * capex,
    buildCostPerM2: p.buildCostPerM2 * capex,
    furnishingPerRoom: p.furnishingPerRoom * capex,
  };
}

// Rincian modal yang harus disiapkan
export function capexBreakdown(p) {
  const transaction = (p.purchasePrice * p.transactionPct) / 100;
  const construction = p.buildArea * p.buildCostPerM2;
  const furnishing = p.type === 'bangun' ? p.rooms * p.furnishingPerRoom : 0;
  const design = (construction * p.designPct) / 100;
  const contingency = (construction * p.contingencyPct) / 100;
  const build = construction + furnishing + design + contingency + p.extraCosts;
  return {
    purchase: p.purchasePrice,
    transaction,
    construction,
    furnishing,
    design,
    contingency,
    extras: p.extraCosts,
    build, // semua biaya di luar harga beli & surat-surat
    total: p.purchasePrice + transaction + build,
  };
}

// Pendapatan & biaya satu tahun penuh beroperasi (tahun pertama)
export function incomeBreakdown(p) {
  const gross = p.rooms * p.rentPerRoom * 12;
  const effective = (gross * p.occupancyPct) / 100;
  const opex = (p.opexFixedMonthly + p.opexPerRoomMonthly * p.rooms) * 12;
  const maintenance = (effective * p.maintenancePct) / 100;
  const management = (effective * p.managementPct) / 100;
  const tax = (effective * p.incomeTaxPct) / 100;
  const costs = opex + maintenance + p.pbbYearly + management + tax;
  return { gross, effective, opex, maintenance, pbb: p.pbbYearly, management, tax, costs, noi: effective - costs };
}

/**
 * Simulasi arus kas bulanan: bulan 0 seluruh modal keluar, selama masa bangun belum ada
 * pemasukan, setelah itu uang bersih masuk tiap bulan (bisa naik tiap tahun),
 * dikurangi biaya peremajaan berkala dari paket material.
 * Balik modal = saat kumulatif kembali ke ≥ 0 (diinterpolasi di dalam bulan).
 */
export function simulate(p, settings = DEFAULT_SETTINGS) {
  const cap = capexBreakdown(p);
  const base = incomeBreakdown(p);
  const rentGrowth = num(settings.rentGrowthPct) / 100;
  const costGrowth = num(settings.costGrowthPct) / 100;
  const maxMonths = num(settings.maxYears, 60) * 12;
  const fixedYear = base.opex + base.pbb;
  const variableShare = (p.maintenancePct + p.managementPct + p.incomeTaxPct) / 100;

  let cumulative = -cap.total;
  const yearly = [{ year: 0, value: cumulative }];
  let paybackMonth = null;
  for (let m = 1; m <= maxMonths; m += 1) {
    let flow = 0;
    if (m > p.buildMonths) {
      const opYear = Math.floor((m - p.buildMonths - 1) / 12); // tahun operasi ke- (0 = pertama)
      const calYear = Math.floor((m - 1) / 12);
      const effective = base.effective * (1 + rentGrowth) ** opYear;
      flow = (effective * (1 - variableShare) - fixedYear * (1 + costGrowth) ** calYear) / 12;
      const opMonth = m - p.buildMonths;
      if (p.refreshEveryYears > 0 && opMonth % (p.refreshEveryYears * 12) === 0) {
        flow -= p.refreshCostPerM2 * p.buildArea * (1 + costGrowth) ** calYear;
      }
    }
    const before = cumulative;
    cumulative += flow;
    if (paybackMonth == null && before < 0 && cumulative >= 0) {
      paybackMonth = m - 1 + (flow > 0 ? -before / flow : 1);
    }
    if (m % 12 === 0) yearly.push({ year: m / 12, value: cumulative });
  }
  return { yearly, paybackMonth, paybackYears: paybackMonth == null ? null : paybackMonth / 12 };
}

// Harga beli tertinggi supaya hasil bersih tetap ≥ target
export function maxPriceForYield(p, targetPct) {
  const { noi } = incomeBreakdown(p);
  const cap = capexBreakdown({ ...p, purchasePrice: 0 });
  if (noi <= 0 || !targetPct) return null;
  return Math.max(0, (noi / (targetPct / 100) - cap.build) / (1 + p.transactionPct / 100));
}

// Keterisian minimal agar biaya rutin tertutup
export function breakEvenOccupancy(p) {
  const inc = incomeBreakdown(p);
  const share = 1 - (p.maintenancePct + p.managementPct + p.incomeTaxPct) / 100;
  if (inc.gross <= 0 || share <= 0) return null;
  return ((inc.opex + inc.pbb) / (inc.gross * share)) * 100;
}

// Analisis lengkap satu rencana (+ satu paket material) untuk satu skenario
export function analyze(plan, property, material, settings = DEFAULT_SETTINGS, scenario = 'moderat') {
  const p = applyScenario(resolvePlan(plan, property, material), scenario, settings);
  const capex = capexBreakdown(p);
  const income = incomeBreakdown(p);
  const sim = simulate(p, settings);
  return {
    params: p,
    capex,
    income,
    noiMonthly: income.noi / 12,
    netYield: capex.total > 0 ? (income.noi / capex.total) * 100 : null,
    grossYield: capex.total > 0 ? (income.gross / capex.total) * 100 : null,
    per100jt: capex.total > 0 ? (income.noi / capex.total) * 100_000_000 : null,
    paybackYears: sim.paybackYears,
    paybackMonth: sim.paybackMonth,
    yearly: sim.yearly,
    incomeStartMonth: p.buildMonths,
    breakEvenOccupancy: breakEvenOccupancy(p),
    maxPrice: maxPriceForYield(p, settings.targetYieldLow),
    roomCost: p.rooms > 0 ? capex.total / p.rooms : null,
  };
}

// Semua varian sebuah rencana: rencana bangun bisa dibandingkan dengan beberapa paket material
export function planVariants(plan, materials) {
  if (plan.type !== 'bangun') return [{ key: plan.id, label: plan.name, material: null }];
  const chosen = (plan.materialIds ?? []).map((id) => materials.find((m) => m.id === id)).filter(Boolean);
  if (chosen.length === 0) return [{ key: plan.id, label: plan.name, material: null }];
  return chosen.map((m) => ({ key: `${plan.id}:${m.id}`, label: `${plan.name} · ${m.name}`, material: m }));
}

// Kisaran harga wajar sebuah properti dari nilai tanah + bangunan
export function costApproach(property) {
  const land = num(property.landArea);
  if (!land || !property.landPriceMin || !property.landPriceMax) return null;
  return {
    min: land * num(property.landPriceMin) + num(property.buildingValueMin),
    max: land * num(property.landPriceMax) + num(property.buildingValueMax),
  };
}

// Kisaran harga dari sisi pendapatan: harga beli yang masih memberi hasil bersih 5,5–6%
export function incomeApproach(plan, property, material, settings = DEFAULT_SETTINGS) {
  if (!plan) return null;
  const p = resolvePlan(plan, property, material);
  const low = maxPriceForYield(p, settings.targetYieldHigh);
  const high = maxPriceForYield(p, settings.targetYieldLow);
  return low == null || high == null ? null : { min: low, max: high };
}

function rate(value, good, ok) {
  if (value == null) return 'kurang';
  if (value <= good) return 'baik';
  if (value <= ok) return 'cukup';
  return 'kurang';
}

/**
 * Rapor singkat Baik / Cukup / Kurang untuk satu properti, memakai rencana utamanya.
 * Lokasi & risiko diisi sendiri oleh keluarga; sisanya dihitung otomatis.
 */
export function reportCard(property, result, settings = DEFAULT_SETTINGS) {
  const fair = costApproach(property);
  const priceRatio = fair ? num(property.askingPrice) / fair.max : null;
  const rows = [
    {
      key: 'harga',
      label: 'Harga diminta dibanding harga wajar',
      rating: priceRatio == null ? null : rate(priceRatio, 1, 1.1),
      note:
        priceRatio == null
          ? 'isi harga tanah sekitar'
          : priceRatio <= 1
            ? 'masih wajar'
            : `±${Math.round((priceRatio - 1) * 100)}% kemahalan`,
    },
    { key: 'lokasi', label: 'Lokasi & peminat', rating: property.locationRating || null, note: property.locationNote },
    {
      key: 'langsung',
      label: 'Langsung menghasilkan uang',
      rating: result ? rate(result.incomeStartMonth, 0, 6) : null,
      note: result ? (result.incomeStartMonth ? `menunggu ±${result.incomeStartMonth} bulan` : 'uang masuk sejak bulan pertama') : '',
    },
    {
      key: 'modal',
      label: 'Modal yang harus disiapkan',
      rating: result ? rate(result.capex.total, settings.budget, settings.budget * 1.3) : null,
      note: result ? `±Rp${(result.capex.total / 1e9).toFixed(1).replace('.', ',')} M` : '',
    },
    {
      key: 'payback',
      label: 'Lama modal kembali',
      rating: result ? rate(result.paybackYears, settings.paybackGood, settings.paybackOk) : null,
      note: result ? (result.paybackYears == null ? `lebih dari ${settings.maxYears} tahun` : `±${Math.round(result.paybackYears)} tahun`) : '',
    },
    { key: 'risiko', label: 'Risiko', rating: property.riskRating || null, note: property.riskNote },
  ];
  const rated = rows.filter((r) => r.rating);
  const score = rated.length ? rated.reduce((s, r) => s + RATINGS[r.rating].score, 0) / rated.length : null;
  let verdict = null;
  if (score != null) {
    if (score >= 1.5) verdict = { level: 'baik', label: 'Layak' };
    else if (score >= 0.8) verdict = { level: 'cukup', label: 'Pertimbangkan' };
    else verdict = { level: 'kurang', label: 'Tidak disarankan' };
  }
  return { rows, score, verdict };
}
