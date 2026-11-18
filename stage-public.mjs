import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(rootDir, ".cloudflare", "public-stage");

const EXCLUDE_DIRS = new Set([".git", ".cloudflare", ".wrangler", "node_modules", "archive"]);
const EXCLUDE_ROOT_FILES = new Set([
  ".gitignore",
  ".nojekyll",
  ".assetsignore",
  "sync-labs.ps1",
  "package.json",
  "package-lock.json",
  "cloudflare.config.ts",
  "wrangler.config.ts",
  "stage-public.mjs",
]);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

let count = 0;
function copyDir(srcDir, destDir, isRoot = false) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      const nextDest = path.join(destDir, entry.name);
      fs.mkdirSync(nextDest, { recursive: true });
      copyDir(path.join(srcDir, entry.name), nextDest, false);
    } else if (entry.isFile()) {
      if (isRoot && (EXCLUDE_ROOT_FILES.has(entry.name) || entry.name.startsWith(".env") || entry.name.startsWith(".dev.vars"))) {
        continue;
      }
      fs.copyFileSync(path.join(srcDir, entry.name), path.join(destDir, entry.name));
      count++;
    }
  }
}

copyDir(rootDir, outDir, true);
console.log(`Staged ${count} public files to .cloudflare/public-stage`);
