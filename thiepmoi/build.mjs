import { mkdir, cp, copyFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const dist = new URL('./dist/', root);
await mkdir(dist, { recursive: true });
for (const name of ['index.html', 'styles.css', 'main.js', 'config.js', '.nojekyll']) {
  await copyFile(new URL(name, root), new URL(name, dist));
}
await cp(new URL('assets/', root), new URL('assets/', dist), { recursive: true });
console.log('Built static site in dist/');
