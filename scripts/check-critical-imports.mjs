#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const CRITICAL_ENTRIES = [
  "src/components/portal/OfflineSyncBootstrap.tsx",
  "src/components/portal/portal-providers.tsx",
  "src/components/portal/v2/chat/PortalChatHjem.tsx",
  "src/app/api/auth/oauth-callback/route.ts",
  "src/lib/rate-limit.ts",
];
const REQUIRED_EXPORTS = [
  { file: "src/lib/offline-queue/tapper-queue.ts", names: ["listTapperKo", "tomKo", "leggIKo"] },
  { file: "src/lib/offline-queue/live-drill-queue.ts", names: ["listLiveDrillKo", "synkLiveDrillKo"] },
  { file: "src/lib/rate-limit.ts", names: ["rateLimit"] },
];
function hasExport(src, name) {
  return new RegExp(
    String.raw`export\s+(?:async\s+)?function\s+${name}\b|export\s+(?:const|let)\s+${name}\b|export\s*\{[^}]*\b${name}\b`,
  ).test(src);
}
let failed = 0;
for (const { file, names } of REQUIRED_EXPORTS) {
  const full = path.join(root, file);
  if (!existsSync(full)) { console.error("MISSING", file); failed++; continue; }
  const src = readFileSync(full, "utf8");
  for (const n of names) {
    if (!hasExport(src, n)) { console.error(`${file} mangler ${n}`); failed++; }
  }
}
const esbuildBin = path.join(root, "node_modules", "esbuild", "bin", "esbuild");
for (const entry of CRITICAL_ENTRIES) {
  const full = path.join(root, entry);
  if (!existsSync(full)) { console.error("MISSING ENTRY", entry); failed++; continue; }
  const r = spawnSync(esbuildBin, [full, "--bundle", "--outfile=/tmp/critical-check.js", "--format=esm", "--packages=external", "--log-level=error"], { encoding: "utf8", cwd: root });
  if (r.status !== 0) { console.error("BUNDLE FAIL", entry, r.stderr?.slice(0,400)); failed++; }
}
if (failed) { console.error(`check-critical-imports: ${failed} feil`); process.exit(1); }
console.log("check-critical-imports: OK.");
