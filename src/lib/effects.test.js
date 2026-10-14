// Efek React (useEffect) tidak boleh berbentuk `() => ekspresi`: nilai yang dikembalikan
// dianggap fungsi pembersih. Di Chrome terbaru window.scrollTo mengembalikan Promise,
// dan bentuk singkat itu membuat aplikasi crash ("l is not a function") saat pindah menu.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.jsx?$/.test(name) ? [path] : [];
  });
}

it('semua useEffect memakai kurung kurawal', () => {
  const offenders = files('src').filter((f) => /useEffect\(\(\)\s*=>\s*[^{\s]/.test(readFileSync(f, 'utf8')));
  expect(offenders).toEqual([]);
});
