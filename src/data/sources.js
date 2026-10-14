// Daftar angka yang dipakai hitungan: dari mana asalnya sekarang, dan sumber resmi
// untuk memastikannya. Statusnya (perkiraan / sudah dicek) diisi keluarga di menu Data & Asumsi.

export const SOURCES = [
  {
    key: 'data-penjual',
    label: 'Harga jual, luas tanah & bangunan, jumlah kamar',
    usedIn: 'Data properti',
    now: 'Keterangan penjual / iklan',
    verify: 'Sertifikat SHM, PBG/IMB, SPPT PBB (luas tanah & bangunan resmi), ukur ulang di lokasi',
  },
  {
    key: 'sewa-sekarang',
    label: 'Sewa & keterisian kos yang dijual',
    usedIn: 'Rencana beli jadi',
    now: 'Klaim penjual (mis. “penuh, rata-rata Rp1,7 jt”)',
    verify: 'Mutasi rekening uang sewa 12 bulan terakhir + kontrak tiap penyewa',
  },
  {
    key: 'harga-tanah',
    label: 'Harga tanah sekitar per m²',
    usedIn: 'Harga wajar',
    now: 'Iklan Rumah123 / Brighton — harga penawaran, bukan harga transaksi',
    verify: 'Peta Zona Nilai Tanah BPN (bhumi.atrbpn.go.id), NJOP di SPPT PBB, harga transaksi tetangga',
  },
  {
    key: 'nilai-wajar',
    label: 'Nilai wajar properti',
    usedIn: 'Harga wajar & rapor',
    now: 'Hitungan aplikasi (nilai tanah + bangunan, dan dari uang sewa)',
    verify: 'Laporan penilaian KJPP (Kantor Jasa Penilai Publik berizin Kemenkeu) — satu-satunya yang resmi',
  },
  {
    key: 'sewa-pasar',
    label: 'Sewa pasar kos di sekitar',
    usedIn: 'Rencana renovasi & bangun',
    now: 'Artikel Mamikos + perkiraan',
    verify: 'Survei langsung 5–10 kos sekitar: harga, fasilitas, jumlah kamar kosong',
  },
  {
    key: 'biaya-bangun',
    label: 'Biaya bangun per m² (Ekonomis / Standar / Premium)',
    usedIn: 'Paket material',
    now: 'Artikel Medcom: kisaran biaya kontraktor 2025',
    verify: 'HSPK Kota Malang tahun berjalan + 2–3 RAB tertulis dari kontraktor lokal',
  },
  {
    key: 'komponen-material',
    label: 'Rincian harga per komponen material',
    usedIn: 'Banding Material',
    now: 'Perkiraan — dibagi supaya totalnya sama dengan biaya bangun per m²',
    verify: 'RAB kontraktor per pekerjaan (biaya ÷ luas bangunan); acuan AHSP Permen PUPR No. 1/2022',
  },
  {
    key: 'efek-material',
    label: 'Pengaruh material: sewa ±%, lama bangun, perawatan, peremajaan',
    usedIn: 'Banding Material',
    now: 'Asumsi',
    verify: 'Tanya kontraktor & pengelola kos; bandingkan sewa kos lain dengan finishing serupa',
  },
  {
    key: 'biaya-rutin',
    label: 'Biaya rutin: air, listrik bersama, wifi, penjaga, perawatan, PBB',
    usedIn: 'Semua rencana',
    now: 'Asumsi di laporan (Rp1 jt + Rp0,21 jt/kamar/bulan, perawatan 6%)',
    verify: 'Tagihan 3–6 bulan terakhir & gaji penjaga dari penjual; SPPT PBB',
  },
  {
    key: 'surat-surat',
    label: 'Biaya surat-surat ±6,5%',
    usedIn: 'Semua rencana',
    now: 'BPHTB maks. 5% (UU No. 1/2022) + notaris/PPAT ±1–1,5%',
    verify: 'Hitungan BPHTB dari Bapenda Kota Malang + penawaran biaya notaris/PPAT',
  },
  {
    key: 'pajak-sewa',
    label: 'Pajak penghasilan sewa',
    usedIn: 'Pengaturan lanjutan rencana',
    now: 'PPh final sewa tanah/bangunan 10% (PP No. 34/2017) — belum dimasukkan di contoh',
    verify: 'Konsultan pajak: tarif bisa berbeda tergantung atas nama siapa dan bentuk usahanya',
  },
  {
    key: 'asumsi-keluarga',
    label: 'Dana keluarga, target hasil, batas balik modal, keadaan pesimis/optimis',
    usedIn: 'Rapor & skenario',
    now: 'Asumsi (mengikuti laporan)',
    verify: 'Sepakati bersama keluarga; bandingkan target hasil dengan bunga deposito/SBN terbaru',
  },
];

export const checkedCount = (sources = {}) => SOURCES.filter((s) => sources[s.key]?.status === 'dicek').length;
