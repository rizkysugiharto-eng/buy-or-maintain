// Daftar angka yang dipakai hitungan: dari mana asalnya sekarang, dan sumber resmi
// untuk memastikannya. Statusnya (perkiraan / sudah dicek) diisi keluarga di menu Data & Asumsi.

export const SOURCES = [
  {
    key: 'data-penjual',
    label: 'Harga jual, luas tanah & bangunan, jumlah kamar',
    usedIn: 'Data properti',
    now: 'Keterangan penjual / iklan',
    verify: 'Sertifikat SHM, PBG/IMB, SPPT PBB (luas tanah & bangunan resmi), ukur ulang di lokasi',
    where: 'Properti → Data properti',
    how: [
      'Minta fotokopi SHM, PBG/IMB, dan SPPT PBB tahun terakhir ke penjual.',
      'Luas tanah & bangunan resmi ada di SPPT PBB dan SHM — pakai angka itu, bukan angka iklan.',
      'Minta notaris/PPAT melakukan pengecekan sertifikat ke BPN (memastikan asli, bebas sengketa & agunan).',
      'Hitung sendiri jumlah kamar saat survei lokasi.',
    ],
  },
  {
    key: 'sewa-sekarang',
    label: 'Sewa & keterisian kos yang dijual',
    usedIn: 'Rencana beli jadi',
    now: 'Klaim penjual (mis. “penuh, rata-rata Rp1,7 jt”)',
    verify: 'Mutasi rekening uang sewa 12 bulan terakhir + kontrak tiap penyewa',
    where: 'Rencana → Uang sewa (sewa per kamar & rata-rata kamar terisi)',
    how: [
      'Minta mutasi rekening penerimaan sewa 12 bulan terakhir (atau buku catatan sewa).',
      'Jumlahkan uang sewa setahun ÷ 12 ÷ jumlah kamar = sewa rata-rata yang benar-benar masuk.',
      'Hitung berapa bulan tiap kamar terisi dalam setahun → rata-rata kamar terisi (%).',
      'Minta kontrak penyewa yang masih berjalan; kalau bisa, ngobrol langsung dengan 1–2 penyewa.',
    ],
  },
  {
    key: 'harga-tanah',
    label: 'Harga tanah sekitar per m²',
    usedIn: 'Harga wajar',
    now: 'Iklan 2026 (99.co, Rumah123, Lamudi): jalan Soekarno-Hatta Rp9,5–13,5 jt/m², jalan dalam Mojolangu ±Rp7 jt/m², sekitar Jatimulyo Rp5–9,3 jt/m². Harga penawaran, bukan transaksi',
    verify: 'Peta Zona Nilai Tanah BPN (bhumi.atrbpn.go.id), NJOP di SPPT PBB, harga transaksi tetangga',
    where: 'Properti → Harga wajar (harga tanah sekitar terendah & tertinggi)',
    how: [
      'Buka bhumi.atrbpn.go.id → buka peta → nyalakan lapisan “Zona Nilai Tanah” → klik lokasi properti. Catat kisaran nilai per m².',
      'Lihat NJOP tanah per m² di SPPT PBB (biasanya di bawah harga pasar — pakai sebagai batas bawah).',
      'Tanya RT/warga atau agen properti lokal: harga transaksi tanah di jalan yang sama 1–2 tahun terakhir.',
      'Isi harga terendah & tertinggi dari gabungan sumber di atas.',
    ],
    links: [
      { label: 'Peta Zona Nilai Tanah BPN (BHUMI)', url: 'https://bhumi.atrbpn.go.id' },
      { label: '99.co — tanah di Soekarno-Hatta', url: 'https://www.99.co/id/jual/tanah/area-malang/soekarno-hatta' },
    ],
  },
  {
    key: 'nilai-wajar',
    label: 'Nilai wajar properti',
    usedIn: 'Harga wajar & rapor',
    now: 'Hitungan aplikasi (nilai tanah + bangunan, dan dari uang sewa)',
    verify: 'Laporan penilaian KJPP (Kantor Jasa Penilai Publik berizin Kemenkeu) — satu-satunya yang resmi',
    where: 'Properti → Harga wajar (nilai bangunan + isi), dan Catatan',
    how: [
      'Cari KJPP yang terdaftar di Kemenkeu (daftar ada di situs PPPK Kemenkeu / MAPPI).',
      'Minta penawaran biaya penilaian untuk 1 properti — cukup untuk properti yang paling serius dikejar.',
      'Kalau beli dengan KPR, bank biasanya menilai sendiri; minta hasil nilai taksirannya.',
      'Pakai nilai dari laporan sebagai pembanding harga yang diminta penjual.',
    ],
    links: [
      { label: 'MAPPI — Masyarakat Profesi Penilai Indonesia', url: 'https://mappi.or.id' },
    ],
  },
  {
    key: 'sewa-pasar',
    label: 'Sewa pasar kos di sekitar',
    usedIn: 'Rencana renovasi & bangun',
    now: 'Iklan 99.co & Pinhome (Okt 2026): kos AC + kamar mandi dalam di Lowokwaru Rp1,3–1,9 jt/bulan. Sawojajar: belum ada data — wajib survei',
    verify: 'Survei langsung 5–10 kos sekitar: harga, fasilitas, jumlah kamar kosong',
    where: 'Rencana → Uang sewa (renovasi & bangun baru)',
    how: [
      'Lihat Mamikos/OLX/Google Maps untuk daftar kos dalam radius ±500 m.',
      'Datangi atau telepon 5–10 kos; catat harga, fasilitas (AC, kamar mandi dalam, parkir), dan berapa kamar kosong.',
      'Ambil harga kos yang fasilitasnya paling mirip dengan rencana kamu.',
      'Kamar terisi ≈ (kamar penuh ÷ total kamar) rata-rata dari kos yang disurvei.',
    ],
    links: [
      { label: '99.co — kos ber-AC di Lowokwaru', url: 'https://www.99.co/id/sewa/kost/malang/lowokwaru/fasilitas-ac' },
      { label: '99.co — kos kamar mandi dalam di Lowokwaru', url: 'https://www.99.co/id/sewa/kost/malang/lowokwaru/fasilitas-kamar-mandi-dalam' },
    ],
  },
  {
    key: 'biaya-bangun',
    label: 'Biaya bangun per m² (Ekonomis / Standar / Premium)',
    usedIn: 'Paket material',
    now: 'Rp4,0 / 4,8 / 6,0 jt/m². Sesuai kisaran kontraktor Malang (ekonomis Rp3–3,5 jt, standar Rp3,5–5 jt/m², 2025) dan perkiraan kos 2026 Rp5,5–6,5 jt/m² (Jakarta). Batas atas acuan pemerintah HSBGN Kota Malang (Pergub Jatim 34/2022): Rp6,48 jt/m² (≤2 lantai) dan Rp8,62 jt/m² (>2 lantai)',
    verify: 'HSPK Kota Malang tahun berjalan + 2–3 RAB tertulis dari kontraktor lokal',
    where: 'Banding Material → komponen tiap paket (total = biaya per m²)',
    how: [
      'Cari “HSPK Kota Malang” tahun berjalan (standar harga satuan Pemkot; biasanya di situs JDIH atau pengadaan Pemkot Malang).',
      'Siapkan gambar/denah sederhana + spesifikasi (lantai, dinding, atap, jumlah kamar mandi).',
      'Minta RAB tertulis dan rinci dari 2–3 kontraktor lokal dengan gambar & spesifikasi yang sama.',
      'Biaya per m² = total RAB (tanpa isi kamar) ÷ luas bangunan. Bandingkan dengan HSPK.',
    ],
    links: [
      { label: 'Pergub Jatim 34/2022 (HSBGN Kota Malang)', url: 'https://dokumjdih.jatimprov.go.id/upload/45172/2022PERGUBJATIM034.pdf' },
      { label: 'Perwali Kota Malang 14/2025 — Standar Harga Satuan', url: 'https://peraturan.bpk.go.id/Details/343269/perwali-kota-malang-no-14-tahun-2025' },
      { label: 'detikProperti — estimasi biaya bangun kos 2026', url: 'https://www.detik.com/properti/berita/d-8341751/mau-bangun-kos-kosan-segini-estimasi-biaya-bangunnya-di-2026' },
    ],
  },
  {
    key: 'komponen-material',
    label: 'Rincian harga per komponen material',
    usedIn: 'Banding Material',
    now: 'Perkiraan — pembagian dicocokkan ke rentang persentase pekerjaan standar PU (pondasi 5–10%, struktur 25–35%, lantai 5–10%, dinding 7–10%, plafon 6–8%, atap 8–10%). Belum dari RAB',
    verify: 'RAB kontraktor per pekerjaan (biaya ÷ luas bangunan); acuan AHSP Permen PUPR No. 1/2022',
    where: 'Banding Material → Daftar paket material → komponen',
    how: [
      'Dari RAB rinci, kelompokkan biaya per pekerjaan: pondasi & struktur, dinding, atap, lantai, plafon & cat, pintu & jendela, kamar mandi, listrik & air.',
      'Setiap kelompok ÷ luas bangunan = harga per m² komponen itu. Contoh: dinding Rp157 jt ÷ 350 m² = Rp450 rb/m².',
      'Untuk material pengganti (mis. hebel vs bata merah), minta kontraktor menghitung ulang baris itu saja.',
      'Acuan cara hitung resmi: AHSP Permen PUPR No. 1/2022.',
    ],
    links: [
      { label: 'Kepmen PUPR 943/2024 — komponen biaya bangunan gedung negara', url: 'https://jdih.pu.go.id/internal/assets/assets/produk/KepmenPUPR/2024/05/2024kmpupr943.pdf' },
    ],
  },
  {
    key: 'efek-material',
    label: 'Pengaruh material: sewa ±%, lama bangun, perawatan, peremajaan',
    usedIn: 'Banding Material',
    now: 'Asumsi',
    verify: 'Tanya kontraktor & pengelola kos; bandingkan sewa kos lain dengan finishing serupa',
    where: 'Banding Material → Pengaruh ke hasil',
    how: [
      'Tanya kontraktor: dengan material ini, lama bangun lebih cepat/lambat berapa bulan?',
      'Tanya pengelola kos atau pemilik kos lain: biaya perawatan per tahun & kapan perlu cat ulang/ganti atap.',
      'Bandingkan sewa kos dengan finishing serupa saat survei sewa → selisihnya jadi “Sewa ± %”.',
    ],
  },
  {
    key: 'biaya-rutin',
    label: 'Biaya rutin: air, listrik bersama, wifi, penjaga, perawatan, PBB',
    usedIn: 'Semua rencana',
    now: 'Asumsi di laporan (Rp1 jt + Rp0,21 jt/kamar/bulan, perawatan 6%). Inflasi Kota Malang Jan 2026: 3,33%/tahun (BPS) — bisa dipakai untuk “kenaikan biaya rutin”',
    verify: 'Tagihan 3–6 bulan terakhir & gaji penjaga dari penjual; SPPT PBB',
    where: 'Rencana → Biaya rutin & pengaturan lanjutan',
    how: [
      'Minta ke penjual tagihan 3–6 bulan terakhir: PLN (listrik bersama), PDAM, wifi, sampah/keamanan.',
      'Tanyakan gaji penjaga/kebersihan per bulan.',
      'Biaya tetap per bulan = penjaga + wifi + iuran; biaya per kamar = (air + listrik bersama) ÷ jumlah kamar.',
      'PBB per tahun ada di SPPT PBB.',
    ],
    links: [
      { label: 'BPS Kota Malang — inflasi Januari 2026', url: 'https://malangkota.bps.go.id/en/pressrelease/2026/02/02/409/on-january-2026--year-on-year-inflation-malang-municipality-is-3-33-percent.html' },
    ],
  },
  {
    key: 'surat-surat',
    label: 'Biaya surat-surat pembeli',
    usedIn: 'Semua rencana',
    now: 'Dihitung otomatis sesuai Kota/Kabupaten properti. Kota Malang: BPHTB 5% × (harga − Rp80 jt) (Perda No. 4/2023); Kab. Malang sama (Perda 7/2023); Kab. Blitar tarif 5% (Perda 8/2023); Kota Blitar memakai batas nasional. Ditambah honor PPAT maks. 1% (PP No. 24/2016) + balik nama BPN ± harga/1000 + Rp50 rb. Untuk Rp3,2 M ≈ 6,0%',
    verify: 'Hitungan BPHTB dari Bapenda Kota Malang + penawaran biaya notaris/PPAT',
    where: 'Rencana → Biaya surat-surat (%)',
    how: [
      'Tanyakan hitungan BPHTB ke Bapenda Kota Malang (tarif maks. 5% dari nilai transaksi dikurangi batas tidak kena pajak).',
      'Minta penawaran biaya akta jual beli & balik nama dari 1–2 notaris/PPAT.',
      'Biaya surat-surat % = (BPHTB + biaya notaris/PPAT + pengecekan) ÷ harga beli × 100.',
    ],
    links: [
      { label: 'Perda Kota Malang No. 4/2023 (pajak daerah)', url: 'https://pasal.id/peraturan/perda/perda-kota-malang-4-2023' },
      { label: 'Hukumonline — batas honor PPAT 1%', url: 'https://www.hukumonline.com/klinik/a/laporkan-ke-sini-jika-lurah-minta-komisi-lebih-untuk-ajb-lt610fee86e2c55' },
    ],
  },
  {
    key: 'pajak-sewa',
    label: 'Pajak usaha kos',
    usedIn: 'Pengaturan lanjutan rencana',
    now: 'Kos TIDAK kena PPh final sewa 10% (kos = jasa penginapan, ditegaskan DJP). Pemilik perorangan: PPh UMKM 0,5% hanya atas omzet di atas Rp500 jt/tahun, maks. 7 tahun (PP 55/2022) → ketiga kos di sini Rp0. Pajak daerah kos di Kota Malang sudah tidak dipungut sejak UU HKPD (Pemkot, Juni 2025), tapi Pemkot berharap bisa memungut lagi',
    verify: 'KPP Pratama Malang / konsultan pajak: berlaku bila omzet semua usaha pemilik digabung, dan setelah 7 tahun memakai tarif normal',
    where: 'Rencana → Biaya rutin & pengaturan lanjutan → Pajak penghasilan kos',
    how: [
      'Hitung omzet setahun semua usaha atas nama calon pemilik (sewa kos + usaha lain). Di bawah Rp500 jt → isi 0.',
      'Kalau di atas Rp500 jt: pajak = 0,5% × (omzet − Rp500 jt). Bagi dengan sewa setahun kos ini → isi persennya.',
      'Datang ke KPP Pratama Malang (konsultasi gratis): pastikan perlakuan kos atas nama pribadi vs badan usaha, dan tarif setelah 7 tahun.',
      'Pantau kabar Pemkot Malang soal pajak daerah kos — kalau dipungut lagi, masukkan sebagai persen sewa.',
    ],
    links: [
      { label: 'Pemkot Malang — rumah kos tak lagi kena pajak daerah', url: 'https://malangkota.go.id/2025/06/10/uu-hkpd-berlaku-rumah-kos-tak-lagi-kena-pajak-daerah/' },
      { label: 'DDTC — omzet Rp500 jt tidak kena pajak (PP 55/2022)', url: 'https://news.ddtc.co.id/pp-55-2022-pemerintah-atur-batas-omzet-rp500-juta-tidak-kena-pajak-44453' },
      { label: 'DDTC — Pemkot berharap kos kembali jadi objek pajak', url: 'https://news.ddtc.co.id/berita/daerah/1811361/potensi-besar-pemkot-harap-usaha-kos-kembali-jadi-objek-pajak' },
    ],
  },
  {
    key: 'asumsi-keluarga',
    label: 'Dana keluarga, target hasil, batas balik modal, keadaan pesimis/optimis',
    usedIn: 'Rapor & skenario',
    now: 'Asumsi. Pembanding resmi: bunga penjaminan LPS bank umum 3,75% (Okt 2026–Jan 2027); SBN ritel SR025 6,8–6,9% (Agustus 2026)',
    verify: 'Sepakati bersama keluarga; bandingkan target hasil dengan bunga deposito/SBN terbaru',
    where: 'Data & Asumsi',
    how: [
      'Sepakati bersama keluarga: dana yang siap dipakai (di luar dana darurat 6–12 bulan).',
      'Cek bunga deposito bank & imbal hasil SBN ritel (ORI/SR/ST) yang sedang berlaku → jadikan patokan hasil bersih minimal.',
      'Sepakati batas balik modal yang masih bisa diterima (mis. 18 tahun) dan seberapa pesimis skenario ujinya.',
    ],
    links: [
      { label: 'Kontan — LPS tahan bunga penjaminan 3,75%', url: 'https://keuangan.kontan.co.id/news/lps-pertahankan-tingkat-bunga-penjaminan-375-hingga-januari-2027' },
      { label: 'Bisnis — SR025 kupon 6,8–6,9%', url: 'https://market.bisnis.com/read/20260821/92/1997963/sbn-syariah-sr025-rilis-cek-imbal-hasil-jadwal-cara-belinya' },
    ],
  },
];

export const checkedCount = (sources = {}) => SOURCES.filter((s) => sources[s.key]?.status === 'dicek').length;

// Harga paket material dianggap "angka contoh" sampai biaya bangun & komponennya ditandai sudah dicek
export const materialPricesVerified = (sources = {}) =>
  ['biaya-bangun', 'komponen-material'].every((key) => sources[key]?.status === 'dicek');
