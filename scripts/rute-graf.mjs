#!/usr/bin/env node
/**
 * rute-graf.mjs — bygger en faktisk navigasjonsgraf for PlayerHQ (/portal) og AgencyOS (/admin).
 *
 * Leser alle page.tsx under src/app/{portal,admin,forelder}, henter ut strenge-
 * literaler som ser ut som interne ruter (href=, redirect(), router.push(), Link),
 * og lager kanter mellom ruter. Output:
 *   - docs/platform/rute-graf-data.json   (noder + kanter, maskinlesbart)
 *   - stdout: mermaid-blokker + foreldreløse ruter (ingen innkommende kanter)
 *
 * Kjør: node scripts/rute-graf.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC_APP = join(ROOT, "src/app");
const SCAN_DIRS = [
  join(ROOT, "src/app"),
  join(ROOT, "src/components"),
  join(ROOT, "src/lib/portal"),
  join(ROOT, "src/lib/admin"),
];
const AREA_PREFIXES = ["/portal", "/admin", "/forelder"];

// ---------- 1. Finn alle ruter ----------
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (entry === "page.tsx" || entry === "page.ts") acc.push(full);
  }
  return acc;
}

function fileToRoute(file) {
  let r = relative(SRC_APP, dirname(file));
  // Fjern rute-grupper: (legacy), (fullscreen) osv.
  r = r
    .split("/")
    .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")))
    .join("/");
  return "/" + r.replace(/\\/g, "/");
}

const pageFiles = walk(SRC_APP);
const routes = new Set();
for (const f of pageFiles) {
  const r = fileToRoute(f);
  if (AREA_PREFIXES.some((p) => r === p || r.startsWith(p + "/"))) routes.add(r);
}

// Route-pattern → regex (dynamiske segmenter [id] matcher ett segment)
const routePatterns = [...routes].map((r) => ({
  route: r,
  // Antall bokstaver utenfor [dynamiske] segmenter = spesifisitetspoeng.
  // "/portal/booking/ny" (18) slår "/portal/booking/[bookingId]" (16),
  // og "/admin/spillere/[id]" (16) slår "/admin/spillere" (15).
  literalLen: r.replace(/\[[^\]]*\]/g, "").length,
  re: new RegExp(
    "^" + r.replace(/\[+[^\]]*\]+/g, "[^/]+").replace(/\//g, "\\/") + "(?:/|$)"
  ),
}));

function matchRoute(link) {
  let best = null;
  for (const p of routePatterns) {
    if (p.re.test(link) && (!best || p.literalLen > best.literalLen)) best = p;
  }
  return best?.route ?? null;
}

// ---------- 2. Skann filer etter lenker ----------
function walkFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkFiles(full, acc);
    else if (/\.(tsx?|jsx?)$/.test(entry)) acc.push(full);
  }
  return acc;
}

const LINK_RE = /["'`](\/(?:portal|admin|forelder)\/[^"'`\s\\]*?)["'`]/g;

// Finn hvilken rute en fil "tilhører" (nærmeste ancestor med page.tsx), ellers "shared"
function ownerOf(file) {
  let dir = dirname(file);
  while (dir.startsWith(SRC_APP)) {
    const r = fileToRoute(join(dir, "page.tsx"));
    if (routes.has(r)) return r;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return "shared";
}

const edges = new Map(); // "from->to" -> {from,to,count}
const filesScanned = new Set();
for (const scanDir of SCAN_DIRS) {
  let files;
  try {
    files = walkFiles(scanDir);
  } catch {
    continue;
  }
  for (const file of files) {
    filesScanned.add(file);
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const from = ownerOf(file);
    LINK_RE.lastIndex = 0;
    let m;
    while ((m = LINK_RE.exec(src))) {
      let link = m[1].split("?")[0].replace(/\/$/, "");
      if (!link) continue;
      const to = matchRoute(link) ?? link.split("/").slice(0, 3).join("/");
      if (to === from) continue;
      const key = `${from}->${to}`;
      const cur = edges.get(key) ?? { from, to, count: 0 };
      cur.count++;
      edges.set(key, cur);
    }
  }
}

// ---------- 3. Analyse ----------
const edgeList = [...edges.values()];
const inbound = new Map();
for (const e of edgeList) {
  // "shared" (felleskomponenter som lister/kort) er reelle navigasjonskilder —
  // de fleste [id]-detaljsider nås kun derfra. Ren nav flommer likevel ikke inn
  // her fordi toppnivå-ruter filtreres bort i orphan-analysen uansett.
  inbound.set(e.to, (inbound.get(e.to) ?? 0) + 1);
}
const orphans = [...routes].filter(
  (r) => !inbound.has(r) && r.split("/").length > 3 // toppnivå-ruter er ofte kun nådd via nav
);

// Redirect-sider (for orphan-filtrering: rene redirects er ikke blindgater)
const redirectRoutes = new Set();
for (const f of pageFiles) {
  const r = fileToRoute(f);
  if (!routes.has(r)) continue;
  const src = readFileSync(f, "utf8");
  if (src.length < 600 && /redirect\(/.test(src)) redirectRoutes.add(r);
}
const realOrphans = orphans.filter((r) => !redirectRoutes.has(r));

// ---------- 4. Output ----------
function mermaidFor(prefix) {
  const relevant = edgeList.filter(
    (e) =>
      (e.from.startsWith(prefix) || e.from === "shared") && e.to.startsWith(prefix)
  );
  const usedNodes = new Set();
  for (const e of relevant) {
    usedNodes.add(e.from);
    usedNodes.add(e.to);
  }
  const id = (r) =>
    r === "shared" ? "NAV" : "n_" + r.replace(/[^a-zA-Z0-9]/g, "_");
  const label = (r) => (r === "shared" ? "Delt nav/komponenter" : r);
  const lines = ["flowchart LR"];
  for (const n of [...usedNodes].sort()) lines.push(`  ${id(n)}["${label(n)}"]`);
  for (const e of relevant.sort((a, b) => a.from.localeCompare(b.from)))
    lines.push(`  ${id(e.from)} --> ${id(e.to)}`);
  return lines.join("\n");
}

const out = {
  generatedAt: new Date().toISOString(),
  routeCount: routes.size,
  routes: [...routes].sort(),
  edges: edgeList.sort((a, b) => a.from.localeCompare(b.from)),
  redirectOnlyRoutes: [...redirectRoutes].sort(),
  orphanRoutes: realOrphans.sort(),
};
writeFileSync(
  join(ROOT, "docs/platform/rute-graf-data.json"),
  JSON.stringify(out, null, 2)
);

console.log(`Ruter funnet: ${routes.size} (${[...routes].filter((r) => r.startsWith("/portal")).length} portal, ${[...routes].filter((r) => r.startsWith("/admin")).length} admin, ${[...routes].filter((r) => r.startsWith("/forelder")).length} forelder)`);
console.log(`Kanter: ${edgeList.length} · Redirect-sider: ${redirectRoutes.size}`);
console.log(`\n=== FORELDRELØSE RUTER (ingen innkommende lenker, ikke redirects) ===`);
for (const r of realOrphans.sort()) console.log("  " + r);
console.log(`\n=== MERMAID: /portal ===\n${mermaidFor("/portal")}`);
console.log(`\n=== MERMAID: /admin ===\n${mermaidFor("/admin")}`);
