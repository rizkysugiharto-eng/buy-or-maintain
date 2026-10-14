# Beli atau Rawat? — Perbandingan Properti Kos Keluarga

Alat bantu keluarga untuk menimbang **beli jadi, renovasi, atau bangun baru** sebuah properti kos:
berapa modal yang harus disiapkan, berapa uang bersih per bulan, dan kapan modal kembali.
Termasuk **Banding Material**: kalau bangun pakai material A habis berapa dan kapan balik modal,
dibanding material B.

Website: **https://rizkysugiharto-eng.github.io/buy-or-maintain/**

## Cara pakai (untuk keluarga)

1. **Ringkasan** — kesimpulan tiap properti (Layak / Pertimbangkan / Tidak disarankan), rapor
   Baik–Cukup–Kurang, dan grafik perbandingan dengan penjelasan “Artinya”.
2. **Properti** — isi data properti, lalu tambahkan satu atau beberapa rencana
   (beli jadi / renovasi / bangun baru). Rencana bertanda ★ yang dipakai di Ringkasan.
3. **Banding Material** — pilih rencana bangun, centang paket material yang mau dibandingkan.
   Isi dan harga tiap paket (dinding, atap, lantai, dst.) bisa diubah.
4. **Bagikan** — tombol biru di kanan atas membuat link berisi seluruh data. Kirim lewat
   WhatsApp; yang membuka akan melihat angka yang sama persis.
5. **Cara Pakai** — panduan lengkap di dalam website: alur pengisian, contoh banding
   material, dan cara membaca setiap angka.

Uang boleh ditulis bebas: `3,2 M`, `450 jt`, `1,7jt`, `450rb`, atau `3.200.000.000`.

## Privasi

- Tidak ada server atau database. Data tersimpan di browser perangkat masing-masing
  (localStorage).
- Link bagikan menyimpan data di bagian `#` alamat (dalam bentuk ringkas: isian kosong,
  paket material bawaan, dan asumsi bawaan tidak ikut, jadi link ±45% lebih pendek), yang **tidak pernah dikirim ke server**
  (termasuk GitHub Pages). Siapa pun yang memegang link bisa melihat isinya, jadi bagikan
  hanya ke orang yang berhak.
- Repo ini hanya berisi kode dan data contoh tanpa nama/alamat asli. Data keluarga disimpan
  sebagai file `.json` (menu **Data & Asumsi → Simpan ke file**) dan jangan di-commit ke sini.

## Rumus

Sama dengan laporan analisis kos (Oktober 2026) dan diuji di `src/lib/calc.test.js`:

| Istilah | Rumus |
|---|---|
| Total modal | harga beli + surat-surat + biaya bangun/renovasi. Surat-surat otomatis: BPHTB 5% × (harga − Rp80 jt) (Perda Kota Malang 4/2023) + honor PPAT maks. 1% (PP 24/2016) + balik nama BPN ± harga/1000 + Rp50 rb |
| Biaya bangun | luas × biaya/m² (jumlah komponen paket material) + isi kamar + desain/PBG % + cadangan % + biaya lain |
| Uang bersih (NOI) | sewa × kamar × 12 × keterisian − biaya tetap − biaya per kamar − perawatan % − PBB (− fee pengelola − pajak) |
| Hasil bersih | uang bersih setahun ÷ total modal |
| Balik modal | bulan saat arus kas kumulatif kembali ≥ 0, termasuk masa bangun dan biaya peremajaan berkala |
| Harga wajar | (a) luas tanah × harga tanah sekitar + nilai bangunan; (b) harga beli yang masih memberi hasil 5,5–6% |
| Pembanding | hasil per Rp100 jt dibanding SBN ritel (SR025 6,9%) & deposito (bunga penjaminan LPS 3,75%) |
| Pajak kos | 0 bawaan: kos tidak kena PPh final sewa 10%; pemilik perorangan kena PPh UMKM 0,5% hanya atas omzet > Rp500 jt/tahun (PP 55/2022) |
| Skenario pesimis | sewa −10%, keterisian −12 poin, biaya rutin +15%, biaya bangun +15% |

Paket material dapat mengubah: biaya per m², isi kamar, desain %, lama bangun (± bulan),
sewa (± %), keterisian (± poin), perawatan %, dan peremajaan berkala (tiap N tahun, Rp/m²).

Semua angka adalah perkiraan, bukan jaminan hasil dan bukan nasihat keuangan profesional.

## Pengembangan

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # tes rumus
npm run build   # hasil di dist/
```

Dibangun dengan React, Vite, dan Recharts. Setiap push ke `main` otomatis dites lalu
dipublikasikan ke GitHub Pages (`.github/workflows/deploy.yml`).
