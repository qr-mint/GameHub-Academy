import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const musicsDir = path.join(projectRoot, 'public', 'assets', 'music', 'game');
const manifestPath = path.join(musicsDir, 'manifest.json');

const exts = new Set(['.mp3', '.m4a', '.wav', '.ogg']);

function isMusicFile(name) {
  const ext = path.extname(name).toLowerCase();
  if (!exts.has(ext)) return false;
  if (name.toLowerCase() === 'manifest.json') return false;
  return true;
}

async function main() {
  const entries = await readdir(musicsDir);
  const files = entries.filter(isMusicFile).sort();
  const urls = files.map((f) => `/assets/music/game/${f}`);

  const payload = {
    generatedAt: new Date().toISOString(),
    files: urls,
  };

  await writeFile(manifestPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  process.stdout.write(`Generated ${path.relative(projectRoot, manifestPath)} (${urls.length} files)\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

