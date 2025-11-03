import { promises as fs } from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';

const rootDir = path.resolve(new URL('.', import.meta.url).pathname, '..');
const projectDir = path.resolve(rootDir, '..');
const distDir = path.join(projectDir, 'dist');
const releasesDir = path.join(projectDir, 'releases');

const readPackage = async () => {
  const pkgPath = path.join(projectDir, 'package.json');
  const raw = await fs.readFile(pkgPath, 'utf8');
  return JSON.parse(raw);
};

const ensureDistExists = async () => {
  try {
    const stats = await fs.stat(distDir);
    if (!stats.isDirectory()) {
      throw new Error('dist is not a directory');
    }
  } catch (error) {
    throw new Error('Build output not found. Run `npm run build` before packing.');
  }
};

const main = async () => {
  const pkg = await readPackage();
  await ensureDistExists();
  await fs.mkdir(releasesDir, { recursive: true });

  const zip = new AdmZip();
  zip.addLocalFolder(distDir);

  const archiveName = `chatgpt-ui-personalizer-v${pkg.version}.zip`;
  const archivePath = path.join(releasesDir, archiveName);

  zip.writeZip(archivePath);

  console.log(`Packed extension to ${archivePath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
