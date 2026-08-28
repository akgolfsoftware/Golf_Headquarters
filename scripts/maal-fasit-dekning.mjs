// Måler PIKSEL-dekning mot Train-lock-fasiten: hvilke .dc.html-filer i
// designsystem/train-lock/ er sitert fra kode (konvensjon: en «Fasit: …»-
// kommentar eller ren filbane i komponent-/sidefilen), og hvilke mangler.
// Kjør: node scripts/maal-fasit-dekning.mjs   (fra utsjekken du vil måle)
// NB: process.cwd(), ikke hardkodet rot (lærdom fra maal-trainlock-status).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FASIT = path.join(ROOT, "designsystem/train-lock");
const SRC = path.join(ROOT, "src");

const fasitFiler = fs
  .readdirSync(FASIT)
  .filter((f) => f.endsWith(".dc.html"))
  .sort();

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const sitert = new Set();
for (const f of walk(SRC)) {
  const src = fs.readFileSync(f, "utf8");
  for (const fil of fasitFiler) {
    // Match på basenavnet uten .dc.html — kommentarer bruker ofte kortform.
    const kort = fil.replace(".dc.html", "");
    if (src.includes(fil) || src.includes(kort)) sitert.add(fil);
  }
}

const familie = (f) => {
  const m = f.match(/^([A-ZÆØÅ]+[0-9]?)-/) || f.match(/^(TRAIN|Analyse|B[0-9])/);
  return m ? m[1] : "ANNET";
};

const mangler = fasitFiler.filter((f) => !sitert.has(f));
const perFam = {};
for (const f of mangler) perFam[familie(f)] = (perFam[familie(f)] || 0) + 1;

console.log(
  JSON.stringify(
    {
      totalt: fasitFiler.length,
      sitert: sitert.size,
      mangler: mangler.length,
      manglerPerFamilie: Object.fromEntries(Object.entries(perFam).sort((a, b) => b[1] - a[1])),
      manglerFiler: mangler,
    },
    null,
    1,
  ),
);
