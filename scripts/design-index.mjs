// Genererer public/design-handover/index.html — én klikkbar oversikt over
// alle skjermene: lenke til Claude Design-prototypen + den ekte ruta i appen
// + statusmerke. Kilde: docs/MASTER-SKJERMPLAN.md (den ene levende sannheten).
//
// Kjør: node scripts/design-index.mjs   (regenererer fra skjermplanen)

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = join(ROOT, "docs/MASTER-SKJERMPLAN.md");
const DH_REL = "AK Golf HQ Design System";
const DH_DIR = join(ROOT, "public/design-handover", DH_REL);
const OUT = join(ROOT, "public/design-handover/index.html");

// --- 1. Parse skjermplanens tabeller -> grupper > seksjoner > skjermer ---
const lines = readFileSync(PLAN, "utf8").split("\n");
const groups = [];
let group = null;
let section = null;

for (const raw of lines) {
  const line = raw.trimEnd();
  const gm = line.match(/^## Skjermene\s*[—–-]\s*(.+)$/);
  if (gm) {
    group = { name: gm[1].trim(), sections: [] };
    groups.push(group);
    section = null;
    continue;
  }
  if (/^## /.test(line)) { group = null; section = null; continue; } // ut av Skjermene-blokk
  if (!group) continue;
  const sm = line.match(/^###\s+(.+)$/);
  if (sm) { section = { name: sm[1].trim(), screens: [] }; group.sections.push(section); continue; }
  if (!line.startsWith("|")) continue;
  const cells = line.split("|").slice(1, -1).map((c) => c.trim());
  if (cells.length < 8) continue;
  if (cells[0] === "Skjerm" || /^-+$/.test(cells[0].replace(/[\s:|-]/g, "-"))) continue; // header/separator
  if (!section) { section = { name: "Skjermer", screens: [] }; group.sections.push(section); }
  const [navn, adresse, design, mdi, adresseOk, flyt, data, funker] = cells;
  section.screens.push({
    navn: navn.replace(/`/g, ""),
    adresse: adresse.replace(/`/g, "").trim(),
    design, mdi, adresseOk, flyt, data, funker,
  });
}

// --- 2. Statusmerke per skjerm ---
const ok = (v) => v === "✓";
function status(s) {
  if (ok(s.design) && ok(s.adresseOk) && ok(s.flyt) && ok(s.data) && ok(s.funker)) return ["ferdig", "Ferdig"];
  if (ok(s.design) && ok(s.adresseOk)) return ["portet", "Portet"];
  if (ok(s.design)) return ["designet", "Designet"];
  if (s.design === "~") return ["delvis", "Delvis"];
  return ["mangler", "Gammelt/mangler"];
}
const linkable = (a) => a.startsWith("/") && !a.includes("[");

// --- 3. Finn prototyp-HTML-er å lenke til ---
function htmlIn(rel) {
  const dir = join(DH_DIR, rel);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => (rel ? `${rel}/${f}` : f));
}
const prototypes = [
  ...htmlIn("playerhq-app"),
  ...htmlIn("agencyos-app"),
  ...htmlIn("coach-flows"),
  ...htmlIn("").filter((f) => !f.startsWith("preview/")), // frittstående verktøy-prototyper i rota
].sort();
const protoHref = (rel) => `${encodeURI(DH_REL + "/" + rel)}`;

// --- 4. Render HTML ---
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const counts = { ferdig: 0, portet: 0, designet: 0, delvis: 0, mangler: 0 };
let total = 0;

const groupHtml = groups.map((g) => {
  const sections = g.sections.map((sec) => {
    const rows = sec.screens.map((s) => {
      const [cls, label] = status(s);
      counts[cls]++; total++;
      const liveCell = linkable(s.adresse)
        ? `<a href="${esc(s.adresse)}" target="_blank" rel="noopener">${esc(s.adresse)}</a>`
        : `<span class="addr">${esc(s.adresse || "—")}</span>`;
      return `<tr>
        <td class="navn">${esc(s.navn)}</td>
        <td>${liveCell}</td>
        <td><span class="badge ${cls}">${label}</span></td>
        <td class="checks">${esc(s.design)} ${esc(s.mdi)} ${esc(s.adresseOk)} ${esc(s.flyt)} ${esc(s.data)} ${esc(s.funker)}</td>
      </tr>`;
    }).join("\n");
    return `<h3>${esc(sec.name)}</h3>
      <table>
        <thead><tr><th>Skjerm</th><th>Ekte rute</th><th>Status</th><th class="checks">Des · MDI · Adr · Flyt · Data · Funk</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }).join("\n");
  return `<section class="group"><h2>${esc(g.name)}</h2>${sections}</section>`;
}).join("\n");

const protoHtml = prototypes.map((rel) => {
  const label = rel.replace(/\.html$/, "").replace(/^.*\//, "").replace(/-/g, " ");
  return `<a class="proto" href="${protoHref(rel)}" target="_blank" rel="noopener">${esc(label)} <span>↗</span></a>`;
}).join("\n");

const html = `<!doctype html>
<html lang="nb"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>AK Golf HQ — Design-oversikt</title>
<style>
:root{--bg:#FAFAF7;--fg:#0A1F17;--card:#fff;--forest:#005840;--lime:#D1F843;--sand:#F1EEE5;--muted:#5E5C57;--border:#E5E3DD;}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:1100px;margin:0 auto;padding:32px 20px 80px}
header h1{font-size:26px;margin:0 0 4px}header p{color:var(--muted);margin:0 0 4px}
.regen{font:12px/1.4 ui-monospace,Menlo,monospace;color:var(--muted);background:var(--sand);padding:6px 10px;border-radius:8px;display:inline-block;margin-top:8px}
.summary{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}
.summary .badge{font-size:13px}
h2{font-size:20px;margin:36px 0 8px;padding-bottom:6px;border-bottom:2px solid var(--forest)}
h3{font-size:15px;color:var(--forest);margin:20px 0 6px;text-transform:uppercase;letter-spacing:.05em;font-size:12px}
.protos{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 8px}
a.proto{background:var(--forest);color:var(--lime);text-decoration:none;padding:8px 14px;border-radius:999px;font-weight:600;font-size:13px;text-transform:capitalize}
a.proto span{opacity:.7}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:top}
th{background:var(--sand);font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
tr:last-child td{border-bottom:none}
td.navn{font-weight:600}
td a{color:var(--forest)}
.addr{color:var(--muted);font:12px ui-monospace,Menlo,monospace}
.checks{font:12px ui-monospace,Menlo,monospace;color:var(--muted);white-space:nowrap}
.badge{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.badge.ferdig{background:#1A7D56;color:#fff}.badge.portet{background:#2563EB;color:#fff}
.badge.designet{background:var(--lime);color:var(--forest)}.badge.delvis{background:#B8852A;color:#fff}
.badge.mangler{background:#E5E3DD;color:#5E5C57}
</style></head><body><div class="wrap">
<header>
  <h1>AK Golf HQ — Design-oversikt</h1>
  <p>Hver skjerm: åpne Claude Design-prototypen (knappene) eller hopp til den ekte ruta i appen. Status fra MASTER-SKJERMPLAN.</p>
  <span class="regen">Regenerer: node scripts/design-index.mjs · ${total} skjermer sporet</span>
</header>
<div class="summary">
  <span class="badge ferdig">Ferdig ${counts.ferdig}</span>
  <span class="badge portet">Portet ${counts.portet}</span>
  <span class="badge designet">Designet ${counts.designet}</span>
  <span class="badge delvis">Delvis ${counts.delvis}</span>
  <span class="badge mangler">Gammelt/mangler ${counts.mangler}</span>
</div>
<h2>Prototyper (klikk for å se designet)</h2>
<div class="protos">${protoHtml}</div>
${groupHtml}
</div></body></html>`;

writeFileSync(OUT, html);
console.log(`Skrev ${OUT}`);
console.log(`Skjermer: ${total} (ferdig ${counts.ferdig}, portet ${counts.portet}, designet ${counts.designet}, delvis ${counts.delvis}, gammelt/mangler ${counts.mangler})`);
console.log(`Prototyper lenket: ${prototypes.length}`);
