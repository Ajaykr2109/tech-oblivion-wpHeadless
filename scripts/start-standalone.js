/*
  Robust starter for Next.js standalone build:
  - Loads env from .env.production (preferred), then .env.local, then .env if present
  - Works whether current working directory is project root or .next/standalone
*/
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const root = path.resolve(__dirname, '..');
  const candidates = [
    path.join(root, '.env.production'),
    path.join(root, '.env.local'),
    path.join(root, '.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        require('dotenv').config({ path: p });
        // eslint-disable-next-line no-console
        console.log(`Loaded env: ${path.basename(p)}`);
        return;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Failed loading ${p}:`, e && e.message ? e.message : e);
      }
    }
  }
}

function resolveServerPath() {
  const root = path.resolve(__dirname, '..');
  const fromRoot = path.join(root, '.next', 'standalone', 'server.js');
  const fromCwd = path.join(process.cwd(), 'server.js');
  if (fs.existsSync(fromRoot)) return fromRoot;
  if (fs.existsSync(fromCwd)) return fromCwd;
  throw new Error('Could not locate Next standalone server.js');
}

async function main() {
  loadEnv();
  const serverPath = resolveServerPath();
  // eslint-disable-next-line no-console
  console.log(`Starting Next standalone server: ${serverPath}`);
  require(serverPath);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
