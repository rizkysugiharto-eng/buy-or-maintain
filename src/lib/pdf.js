// Unduh Ringkasan sebagai PDF langsung di browser (tanpa server): halaman difoto dengan html2canvas
// dalam tata letak lebar & tema terang, lalu dipotong per bagian ke halaman A4 dengan jsPDF.
// Kedua pustaka baru dimuat saat tombol ditekan supaya aplikasi tetap ringan.

const PAGE_W = 210; // A4, mm
const PAGE_H = 297;
const MARGIN = 12;
const FOOTER = 6;
const LAYOUT_WIDTH = 900; // lebar tata letak saat difoto (px), seperti di laptop

const ATOMIC_MAX = 420; // bagian setinggi ini atau kurang (baris, kartu, judul) tidak boleh terpotong

/**
 * Bagi tinggi isi (px) ke halaman. Halaman dipotong di garis yang tidak melewati bagian kecil mana pun
 * (baris tabel, kartu, paragraf); kalau tidak ada, dipotong tepat di batas halaman.
 * intervals = [[atas, bawah], …] bagian yang sebaiknya utuh.
 */
export function pageBreaks(height, intervals, pageHeight) {
  const H = Math.ceil(height);
  const cover = new Int32Array(H + 2);
  for (const [top, bottom] of intervals) {
    const a = Math.floor(top) + 1;
    const z = Math.ceil(bottom);
    if (z > a && bottom - top <= ATOMIC_MAX) {
      cover[Math.max(0, a)] += 1;
      cover[Math.min(H + 1, z)] -= 1;
    }
  }
  for (let y = 1; y <= H + 1; y += 1) cover[y] += cover[y - 1];
  const pages = [];
  let start = 0;
  while (start < H) {
    const limit = start + pageHeight;
    if (limit >= H) {
      pages.push([start, H]);
      break;
    }
    let y = Math.floor(limit);
    const min = start + pageHeight * 0.3;
    while (y > min && cover[y] > 0) y -= 1;
    if (y <= min) y = Math.floor(limit);
    pages.push([start, y]);
    start = y;
  }
  return pages;
}

export async function downloadPdf(container, fileName, footerText = '') {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  // Batasi ukuran gambar (Safari iPhone menolak kanvas yang terlalu besar)
  const estimatedHeight = Math.max(container.scrollHeight, 1000);
  const scale = Math.min(2, Math.max(1, Math.sqrt(14_000_000 / (LAYOUT_WIDTH * estimatedHeight))));
  let intervals = [];
  let contentHeight = 0;
  const canvas = await html2canvas(container, {
    scale,
    backgroundColor: '#ffffff',
    windowWidth: LAYOUT_WIDTH,
    logging: false,
    onclone: (doc, el) => {
      doc.documentElement.dataset.theme = 'light';
      doc.documentElement.classList.add('pdf-mode');
      doc.querySelectorAll('details').forEach((d) => {
        d.open = true;
      });
      const box = el.getBoundingClientRect();
      contentHeight = box.height;
      intervals = [...el.querySelectorAll('*')]
        .map((c) => {
          const r = c.getBoundingClientRect();
          return [r.top - box.top, r.bottom - box.top];
        })
        .filter(([t, b]) => b > t);
      // Judul jangan tertinggal sendirian di bawah halaman: ikat dengan ±120 px isi sesudahnya
      for (const h of el.querySelectorAll('h1, h2, h3, summary, .chart-card > p.muted')) {
        const r = h.getBoundingClientRect();
        intervals.push([r.top - box.top, r.bottom - box.top + 120]);
      }
    },
  });

  const cssWidth = canvas.width / scale;
  const contentW = PAGE_W - 2 * MARGIN;
  const mmPerPx = contentW / cssWidth;
  const pageHeightPx = (PAGE_H - 2 * MARGIN - FOOTER) / mmPerPx;
  const pages = pageBreaks(Math.min(contentHeight, canvas.height / scale), intervals, pageHeightPx);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  pages.forEach(([s, e], i) => {
    if (i > 0) pdf.addPage();
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = Math.ceil((e - s) * scale);
    const ctx = slice.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, Math.floor(s * scale), slice.width, slice.height, 0, 0, slice.width, slice.height);
    pdf.addImage(slice.toDataURL('image/jpeg', 0.9), 'JPEG', MARGIN, MARGIN, contentW, (e - s) * mmPerPx);
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    pdf.text(footerText, MARGIN, PAGE_H - MARGIN + 2);
    pdf.text(`Halaman ${i + 1} dari ${pages.length}`, PAGE_W - MARGIN, PAGE_H - MARGIN + 2, { align: 'right' });
  });
  pdf.save(fileName);
}
