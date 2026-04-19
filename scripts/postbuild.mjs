import { copyFile, access, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const from = resolve(distDir, 'index.vite.html');
const to = resolve(distDir, 'index.html');

try {
  await access(from);
} catch {
  console.error(`[postbuild] Missing: ${from}`);
  process.exit(1);
}

await mkdir(dirname(to), { recursive: true });
await copyFile(from, to);
console.log(`[postbuild] Copied: ${from} -> ${to}`);

