// Panduan singkat untuk keluarga: alur pakai, cara membaca angka, dan contoh banding material.

import { Link } from 'react-router-dom';

function Step({ number, title, to, linkLabel, children }) {
  return (
    <section className="card guide-step">
      <h2>
        <span className="step">{number}</span> {title}
      </h2>
      {children}
      {to && (
        <Link className="btn small" to={to}>
          {linkLabel} →
        </Link>
      )}
    </section>
  );
}

export default function GuidePage() {
  return (
    <div className="page guide">
      <div className="page-head">
        <div>
          <h1>Cara Pakai</h1>
          <p className="muted">Baca sekali dari atas ke bawah. Alurnya: Properti → Rencana → (Paket material) → lihat hasilnya di Ringkasan.</p>
        </div>
      </div>

      <section className="card intinya">
        <h2>Alurnya dalam satu gambar</h2>
        <ol className="flow">
          <li>
            <b>Properti</b>
            <span>tanah/kos yang ditawarkan</span>
          </li>
          <li>
            <b>Rencana</b>
            <span>beli jadi, renovasi, atau bangun baru</span>
          </li>
          <li>
            <b>Paket material</b>
            <span>khusus rencana bangun: material A vs B</span>
          </li>
          <li>
            <b>Ringkasan</b>
            <span>kesimpulan & grafik untuk keluarga</span>
          </li>
        </ol>
      </section>

      <Step number={1} title="Pertama kali buka" to="/pengaturan" linkLabel="Buka Data & Asumsi">
        <ul>
          <li>
            Kalau punya file data (mis. <code>Data-Properti-Keluarga-Oktober-2026.json</code>): buka <b>Data & Asumsi → Buka file</b>.
          </li>
          <li>Kalau dapat link dari keluarga: cukup buka link-nya, data langsung masuk.</li>
          <li>
            Dapat file berisi properti baru (mis. kiriman keluarga)? Pakai <b>Data & Asumsi → Tambah dari file</b> — properti di file itu
            ditambahkan, data yang sudah ada tidak berubah.
          </li>
          <li>Setelah itu data tersimpan otomatis di HP/laptop ini — besok tidak perlu buka file lagi.</li>
          <li>
            <b>Ringkasan</b> tampil ringkas dulu (kesimpulan, kartu, rapor, 2 grafik). Tekan <b>Lihat detail lengkap</b> untuk semua pilihan
            dan grafik lainnya. Saat dicetak, detail lengkap selalu ikut.
          </li>
        </ul>
      </Step>

      <Step number={2} title="Tambah properti yang sedang ditawarkan" to="/properti" linkLabel="Buka menu Properti">
        <p>
          Menu <b>Properti → + Tambah properti</b>, lalu isi dari atas:
        </p>
        <ol>
          <li>
            <b>Data properti</b> — harga yang diminta, luas tanah, luas bangunan, jumlah kamar. Uang boleh ditulis <code>2,8 M</code>,{' '}
            <code>450 jt</code>, <code>1,5 jt</code>, atau <code>450rb</code>.
          </li>
          <li>
            <b>Kota / Kabupaten</b> — pilih daerahnya (Kota/Kab. Malang, Kota/Kab. Blitar, atau Daerah lain). Aturan pajak beli (BPHTB),
            pajak daerah kos, dan penyesuaian harga bangun ikut daerah itu. Setiap angka bisa ditimpa kalau sudah dapat angka pasti dari Bapenda.
          </li>
          <li>
            <b>Rencana</b> — lihat langkah 3.
          </li>
          <li>
            <b>Penilaian keluarga</b> — pilih Baik / Cukup / Kurang untuk lokasi dan risiko setelah survei.
          </li>
          <li>
            <b>Harga wajar</b> — isi harga tanah per m² dari iklan di sekitar (terendah & tertinggi). Hasilnya: harga penjual wajar atau
            kemahalan berapa persen, plus harga beli maksimal yang masih layak.
          </li>
          <li>
            <b>Cek sebelum bayar DP</b> — centang satu per satu setelah dicek.
          </li>
        </ol>
      </Step>

      <Step number={3} title="Buat rencana: beli, renovasi, atau bangun">
        <p>Satu properti boleh punya beberapa rencana supaya bisa dibandingkan. Tekan salah satu tombol “+ Tambah rencana”:</p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Jenis</th>
                <th>Kapan dipakai</th>
                <th>Yang diisi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Beli jadi</th>
                <td>Kos sudah jalan, langsung disewakan</td>
                <td>Sewa per kamar, jumlah kamar, biaya perbaikan kecil</td>
              </tr>
              <tr>
                <th scope="row">Renovasi</th>
                <td>Bangunan lama diperbaiki / ditambah kamar</td>
                <td>Rincian biaya renovasi (satu baris per pekerjaan), lama renovasi</td>
              </tr>
              <tr>
                <th scope="row">Bangun baru</th>
                <td>Tanah kosong, atau bangunan lama dibongkar</td>
                <td>Luas bangunan baru, paket material, lama pembangunan</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            Tekan <b>Ubah angka</b>: isian ada di kiri, <b>hasilnya di kanan langsung berubah</b> setiap angka diganti.
          </li>
          <li>
            <b>Simulasi tawar-menawar:</b> isi <b>Harga beli</b> dengan harga tawaran (mis. <code>2,8 M</code>) lalu lihat lama balik
            modalnya. Kalau dikosongkan, yang dipakai harga yang diminta penjual.
          </li>
          <li>
            Tanda <b>★</b> = rencana utama yang dipakai di Ringkasan. Ketuk bintang di rencana lain untuk menggantinya.
          </li>
          <li>
            <b>Biaya surat-surat</b> dihitung otomatis sesuai aturan Kota Malang: BPHTB 5% × (harga − Rp80 jt) + honor PPAT maks. 1% + balik
            nama BPN. Matikan centangnya kalau sudah dapat angka pasti dari notaris.
          </li>
          <li>Biaya rutin (air, wifi, penjaga, PBB, fee pengelola, pajak) ada di “Biaya rutin & pengaturan lanjutan”.</li>
        </ul>
      </Step>

      <Step number={4} title="Banding material: kalau pakai A habis berapa, kalau pakai B?" to="/material" linkLabel="Buka Banding Material">
        <ol>
          <li>Pilih rencana bangunnya, lalu centang paket material yang mau dibandingkan.</li>
          <li>
            Setiap paket punya kartu yang menjawab: <b>Habis berapa? Mulai dapat uang kapan? Modal kembali kapan?</b> Kotak “Intinya”
            menjelaskan selisihnya.
          </li>
        </ol>
        <div className="example">
          <h3>Contoh: hebel vs bata merah</h3>
          <ol>
            <li>
              Di <b>Daftar paket material</b> (paling bawah), ketuk paket <b>Standar</b> → <b>Salin paket ini</b>.
            </li>
            <li>Ketuk paket salinannya, ganti nama jadi “Standar + Hebel”.</li>
            <li>
              Ubah baris <b>Dinding</b>: material “Bata ringan (hebel)”, harga per m² sesuai penawaran.
            </li>
            <li>
              Di <b>Pengaruh ke hasil</b>: lama bangun <code>-1</code> bulan kalau memang lebih cepat; perawatan lebih tinggi kalau perlu.
            </li>
            <li>Centang paket baru di bagian atas — bedanya langsung terlihat.</li>
          </ol>
          <p className="small muted">
            Harga per komponen bawaan masih perkiraan. Kalau sudah ada RAB kontraktor: biaya borongan tiap bagian ÷ luas bangunan = harga
            per m².
          </p>
        </div>
      </Step>

      <Step number={5} title="Bagikan ke keluarga" to="/pengaturan" linkLabel="Buka Data & Asumsi">
        <ul>
          <li>
            Tombol biru <b>Bagikan → Kirim lewat WhatsApp</b>. Yang membuka link melihat angka yang sama, tanpa login.
          </li>
          <li>
            Kalau ada angka yang diubah, <b>kirim link baru</b> — link lama berisi angka lama.
          </li>
          <li>
            Sesekali <b>Simpan ke file</b> sebagai cadangan.
          </li>
        </ul>
      </Step>

      <section className="card">
        <h2>Cara membaca hasil</h2>
        <div className="table-wrap">
          <table className="table">
            <tbody>
              <tr>
                <th scope="row">Total modal</th>
                <td>Semua uang yang keluar: harga beli + surat-surat (±6,5%) + bangun/renovasi.</td>
              </tr>
              <tr>
                <th scope="row">Uang bersih / bulan</th>
                <td>Sewa yang benar-benar masuk kantong setelah kamar kosong & semua biaya rutin.</td>
              </tr>
              <tr>
                <th scope="row">Hasil / tahun</th>
                <td>Uang bersih setahun ÷ modal. Bandingkan dengan bunga deposito — kalau selisihnya kecil, risikonya tidak sebanding.</td>
              </tr>
              <tr>
                <th scope="row">Modal kembali</th>
                <td>Kapan uang bersih yang terkumpul menutup modal (sudah termasuk masa bangun). Ideal ±18 tahun atau kurang.</td>
              </tr>
              <tr>
                <th scope="row">Mulai dapat uang</th>
                <td>“Langsung” untuk kos jadi; untuk bangun/renovasi = setelah pekerjaan selesai.</td>
              </tr>
              <tr>
                <th scope="row">Keadaan pesimis</th>
                <td>
                  Sewa turun, kamar lebih sering kosong, biaya naik. Pakai sebagai batas aman. Isiannya dibanding keadaan normal: minus = turun,
                  plus = naik (mis. sewa −10% → Rp1,7 jt jadi Rp1,53 jt; kamar terisi −12 poin → 92% jadi 80%).
                </td>
              </tr>
              <tr>
                <th scope="row">Grafik perjalanan uang</th>
                <td>Mulai minus sebesar modal, naik saat sewa masuk. Garis menyentuh Rp0 = modal kembali.</td>
              </tr>
              <tr>
                <th scope="row">Dibanding SBN / deposito</th>
                <td>
                  Di Ringkasan ada batang abu-abu: hasil kalau uang yang sama ditaruh di SBN ritel atau deposito. Kalau batang kos lebih pendek dari
                  SBN, secara uang bulanan kos kalah — keuntungannya tinggal dari kenaikan harga tanah (belum dihitung).
                </td>
              </tr>
              <tr>
                <th scope="row">Rapor</th>
                <td>
                  Baik / Cukup / Kurang per aspek. Kesimpulan otomatis: <b>Layak</b>, <b>Pertimbangkan</b>, atau <b>Tidak disarankan</b>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Pertanyaan yang sering muncul</h2>
        <details className="faq">
          <summary>Datanya tersimpan di mana? Aman?</summary>
          <p>
            Hanya di HP/laptop masing-masing, tidak ada server. Link bagikan membawa datanya sendiri, jadi siapa pun yang memegang link bisa
            melihat isinya — bagikan hanya ke keluarga.
          </p>
        </details>
        <details className="faq">
          <summary>Kenapa link bagikannya panjang?</summary>
          <p>Karena seluruh angka ikut di dalam link (itulah yang membuatnya tidak perlu server). Panjangnya tidak masalah untuk WhatsApp.</p>
        </details>
        <details className="faq">
          <summary>Tanah/rumah sudah milik keluarga — dijual atau disewakan?</summary>
          <p>
            Di halaman properti pilih Status <b>Sudah milik keluarga</b> dan isi <b>Perkiraan harga kalau dijual</b>. Muncul kotak “Kalau dijual”
            (uang bersih setelah PPh final 2,5%, dan hasilnya kalau ditaruh di SBN/deposito). Lalu tambahkan rencana: <b>Sewakan apa adanya</b>,{' '}
            <b>Renovasi lalu sewakan</b>, atau <b>Bangun lalu sewakan</b> (bisa membandingkan paket material). Setiap rencana menunjukkan uang baru
            yang harus dikeluarkan dan selisihnya per bulan dibanding menjual. Kalau disewakan utuh (satu rumah atau lahan), isi jumlah kamar 1 dan
            sewa per kamar = sewa per bulan.
          </p>
        </details>
        <details className="faq">
          <summary>Ganti HP / laptop, datanya ikut?</summary>
          <p>Tidak otomatis. Kirim link bagikan ke diri sendiri, atau pakai Simpan ke file lalu Buka file di perangkat baru.</p>
        </details>
        <details className="faq">
          <summary>Salah hapus / tidak sengaja menimpa data?</summary>
          <p>Setelah membuka file atau link, muncul tombol “Kembalikan data sebelumnya” di bagian atas halaman.</p>
        </details>
        <details className="faq">
          <summary>Angkanya bisa dipegang?</summary>
          <p>
            Belum semuanya. Buka <b>Data & Asumsi → Sumber angka</b>: di sana tertulis asal setiap angka dan sumber resmi untuk
            memastikannya (ZNT BPN, KJPP, HSPK Kota Malang, RAB kontraktor, mutasi rekening). Tandai “Sudah dicek” satu per satu; Ringkasan
            menampilkan berapa yang sudah dicek. Sebelum DP: cek surat-surat lewat notaris/PPAT dan minta tukang/insinyur memeriksa bangunan.
          </p>
        </details>
      </section>
    </div>
  );
}
