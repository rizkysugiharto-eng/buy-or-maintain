// Pelindung dari ekstensi browser & Google Translate.
// Keduanya kadang memindah/mengganti potongan halaman diam-diam. Saat React lalu
// menghapus atau menyisipkan potongan itu, browser melempar error dan seluruh
// aplikasi berhenti (layar putih / harus refresh). Di sini kasus itu ditangani:
// potongan yang sudah dipindah tetap dihapus dari tempat barunya, dan sisipan
// dengan patokan yang sudah hilang ditaruh di akhir.
// Lihat: https://github.com/facebook/react/issues/11538

export function installDomGuard() {
  if (typeof Node !== 'function' || Node.prototype.__domGuard) return;
  const { removeChild, insertBefore } = Node.prototype;

  Node.prototype.removeChild = function guardedRemoveChild(child) {
    if (child && child.parentNode !== this) {
      // Sudah dipindah ke tempat lain → hapus dari sana; sudah tidak ada → abaikan
      if (child.parentNode) removeChild.call(child.parentNode, child);
      return child;
    }
    return removeChild.call(this, child);
  };

  Node.prototype.insertBefore = function guardedInsertBefore(node, reference) {
    if (reference && reference.parentNode !== this) return insertBefore.call(this, node, null);
    return insertBefore.call(this, node, reference);
  };

  Node.prototype.__domGuard = true;
}
