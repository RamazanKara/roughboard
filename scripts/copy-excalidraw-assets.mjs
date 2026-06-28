// Copies Excalidraw's font/wasm assets out of node_modules into public/ so the
// app can render fully offline inside the Android WebView (no CDN fetches).
//
// Excalidraw resolves assets from `window.EXCALIDRAW_ASSET_PATH` (set to "/" in
// index.html), looking for an `excalidraw-assets/` directory at that base.
import { existsSync, mkdirSync, cpSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const pkgDist = resolve(root, "node_modules/@excalidraw/excalidraw/dist");
const publicDir = resolve(root, "public");

if (!existsSync(pkgDist)) {
  console.error("[copy-assets] Cannot find", pkgDist);
  process.exit(1);
}

mkdirSync(publicDir, { recursive: true });

// Asset folders we care about. We only ship the production assets, since the
// Android APK always loads the production Excalidraw bundle (the "-dev" assets
// are ~12 MB of dead weight inside the app). Different package versions place
// them at the dist root or under dist/prod, so search recursively.
const wanted = ["excalidraw-assets"];

function findAssetDirs(base) {
  const found = {};
  const stack = [base];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const full = join(dir, e.name);
      if (wanted.includes(e.name) && !found[e.name]) {
        found[e.name] = full;
      } else {
        stack.push(full);
      }
    }
  }
  return found;
}

const dirs = findAssetDirs(pkgDist);
let copied = 0;
for (const name of wanted) {
  if (dirs[name]) {
    const dest = join(publicDir, name);
    cpSync(dirs[name], dest, { recursive: true });
    console.log(`[copy-assets] ${name} -> public/${name}`);
    copied++;
  }
}

if (copied === 0) {
  console.error(
    "[copy-assets] No excalidraw-assets folders found under",
    pkgDist
  );
  process.exit(1);
}
console.log(`[copy-assets] done (${copied} asset folder(s)).`);
