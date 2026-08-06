// Speiler Claude Paper-prosjektet ned til designsystem/paper/.
// Kjøres kun når kildene i Claude Design har endret seg. Etterpå er kjeden offline.
//
// Bruk:  AKHQ_SERVE_BASE=<fil> node scripts/speil-designsystem.mjs
//        Fila har to linjer: URL-prefiks (…/serve/) og ?query med token.
//        Hent den med claude-design render_preview. Den er kortlevd og
//        prosjekt-scopet — skal ALDRI committes eller skrives i logg/dok.
//
// Fillisten utledes av _ds_manifest.json, ikke av en håndholdt liste, slik at
// speilet ikke blir foreldet når prosjektet får nye komponenter.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const baseFil = process.env.AKHQ_SERVE_BASE;
if (!baseFil) { console.error("Sett AKHQ_SERVE_BASE til fila med serve-URL."); process.exit(1); }
const [base, query] = readFileSync(baseFil, "utf8").trim().split("\n");
const rot = resolve("designsystem/paper");

const url = (sti) => base + sti.split("/").map(encodeURIComponent).join("/") + query;

async function hent(sti, { valgfri = false } = {}) {
  const r = await fetch(url(sti));
  if (!r.ok) return valgfri ? null : Promise.reject(new Error(`${r.status} ${sti}`));
  const ut = resolve(rot, sti);
  mkdirSync(dirname(ut), { recursive: true });
  writeFileSync(ut, Buffer.from(await r.arrayBuffer()));
  return sti;
}

const manifest = await (await fetch(url("_ds_manifest.json"))).json();
mkdirSync(rot, { recursive: true });
writeFileSync(resolve(rot, "_ds_manifest.json"), JSON.stringify(manifest, null, 2));

const kilder = [...new Set(manifest.components.map((c) => c.sourcePath))];
const obligatorisk = [
  "_ds_bundle.js",                       // serverens kompilat — kun til sammenligning
  ...manifest.globalCssPaths,
  ...kilder,
  ...manifest.cards.map((k) => k.path),
  ...manifest.templates.flatMap((t) => [t.entryPath, `${t.folder}/ds-base.js`, `${t.folder}/support.js`]),
];
// Sidekilder per komponent: typer og prompt. Ikke nødvendig for målingen,
// men det en annen modell trenger for å forstå kontrakten uten Claude Design.
const valgfrie = [
  "guidelines/card-support.css",
  "guidelines/klasseinventar.md",
  "guidelines/komponentskjelett.md",
  "guidelines/gulvregel.md",
  "readme.md",
  ...kilder.flatMap((k) => [k.replace(/\.jsx$/, ".d.ts"), k.replace(/\.jsx$/, ".prompt.md")]),
];

const feil = [];
let ok = 1, ekstra = 0;

// Parallell henting — sekvensielt tar 350 filer flere minutter.
async function kjor(liste, fn, samtidige = 12) {
  const k = [...liste];
  await Promise.all(Array.from({ length: samtidige }, async () => {
    for (let s = k.shift(); s !== undefined; s = k.shift()) await fn(s);
  }));
}

await kjor([...new Set(obligatorisk)], async (sti) => {
  try { await hent(sti); ok++; } catch (e) { feil.push(e.message); }
});
await kjor([...new Set(valgfrie)], async (sti) => {
  if (await hent(sti, { valgfri: true })) ekstra++;
});

console.log(`speilet ${ok} kjedefiler + ${ekstra} sidefiler til designsystem/paper`);
console.log(`  ${kilder.length} komponentkilder · ${manifest.cards.length} kort · ${manifest.templates.length} maler`);
for (const f of feil) console.log("  FEIL " + f);
process.exit(feil.length ? 1 : 0);
