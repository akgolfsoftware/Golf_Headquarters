#!/usr/bin/env node
// Speiler Claude Design-masteren «AK Golf Designsystem» (3e5c851c) ned til
// designsystem/ak-golf/. Masteren er fasit; repoet er speilet koden leser.
// Kjøres når masteren har endret seg — etterpå er kjeden offline.
//
// Bruk:  AKHQ_SERVE_BASE=<fil> node scripts/speil-ak-golf.mjs
//        Fila har to linjer: URL-prefiks (…/serve/) og ?query med token.
//        Hent den med claude-design render_preview. Den er kortlevd og
//        prosjekt-scopet — skal ALDRI committes eller skrives i logg/dok.
//
// Fillisten utledes av _ds_manifest.json (komponenter, kort, tokens, maler)
// pluss det manifestet ikke lister: kapitlene, tokens.json, ikonene, kitenes
// hjelpefiler. Filer som er GENERERT i repoet (tokens/*.css m.fl.) hentes
// også, og `node scripts/ak-golf-tokens.mjs` etterpå bekrefter at masteren og
// generatoren er enige.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const baseFil = process.env.AKHQ_SERVE_BASE;
if (!baseFil) { console.error("Sett AKHQ_SERVE_BASE til fila med serve-URL."); process.exit(1); }
const [base, query] = readFileSync(baseFil, "utf8").trim().split("\n");
const rot = resolve("designsystem/ak-golf");
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
const kapitler = ["01-merket", "02-arkitektur", "03-logo", "04-farge", "05-typografi", "06-rom-og-geometri", "07-foto", "08-sprak", "09-varianter", "10-forbudt", "11-instrumentet", "12-bevegelse", "13-ikoner", "14-fotobrief", "merkeplattform", "tekstkonsept"].map((k) => `guidelines/${k}.md`);
const ikoner = ["meny", "lukk", "pil-ned", "pil-hoyre", "pil-venstre", "videre", "ut", "pluss", "minus", "hake", "sok", "kalender", "klokke", "sted", "epost", "telefon", "last-ned", "ekstern", "info", "advarsel", "kryss", "maal", "person", "dokument"].map((n) => `assets/ikon/${n}.svg`);

const obligatorisk = [
  "_ds_bundle.js", "_adherence.oxlintrc.json", "readme.md", "SKILL.md", "styles.css", "tokens.json", "ak-golf-tokens.ts",
  "tokens/tailwind-theme.css", "tokens/kontrast.md", "assets/foto/katalog.md",
  ...manifest.globalCssPaths,
  ...kilder,
  ...manifest.cards.map((k) => k.path),
  ...manifest.templates.flatMap((t) => [t.entryPath, `${t.folder}/ds-base.js`, `${t.folder}/support.js`]),
  ...kapitler, ...ikoner,
];
const valgfrie = [
  "CHANGELOG.md", "thumbnail.html",
  ...kilder.flatMap((k) => [k.replace(/\.jsx$/, ".d.ts"), k.replace(/\.jsx$/, ".prompt.md")]),
  // Kitenes hjelpefiler og README-er — manifestet lister bare inngangssidene.
  ...["markedsside/Deler.jsx", "markedsside/JuniorDeler.jsx", "foreldrerapport/Rapport.jsx", "kampanje/Kampanje.jsx",
    "dokument/README.md", "epost/README.md", "foreldrerapport/README.md", "fysisk/README.md", "kampanje/README.md",
    "markedsside/README.md", "presentasjon/README.md", "sosialt/README.md", "varianter/README.md"].map((s) => `ui_kits/${s}`),
];
// Logo og foto ligger allerede kanonisk i public/logos og public/brand/foto — speiles ikke.

const feil = [];
let ok = 1, ekstra = 0;
async function kjor(liste, fn, samtidige = 12) {
  const k = [...liste];
  await Promise.all(Array.from({ length: samtidige }, async () => {
    for (let s = k.shift(); s !== undefined; s = k.shift()) await fn(s);
  }));
}
await kjor([...new Set(obligatorisk)], async (sti) => { try { await hent(sti); ok++; } catch (e) { feil.push(e.message); } });
await kjor([...new Set(valgfrie)], async (sti) => { if (await hent(sti, { valgfri: true })) ekstra++; });

console.log(`speilet ${ok} kjedefiler + ${ekstra} sidefiler til designsystem/ak-golf`);
console.log(`  ${kilder.length} komponentkilder · ${manifest.cards.length} kort · ${manifest.templates.length} maler`);
for (const f of feil) console.log("  FEIL " + f);
if (!existsSync(resolve(rot, "tokens.json"))) feil.push("tokens.json mangler");
process.exit(feil.length ? 1 : 0);
