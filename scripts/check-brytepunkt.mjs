#!/usr/bin/env node
/**
 * Vakt: nye PC-brytepunkter i de nye stilarkene skal være 600, 900 eller 1024 px.
 *
 * Analysen 20.10.2026 (docs/design-system/analyse-frontend-playerhq-agencyos-2026-10-20.md,
 * forslag 2) fant 14 ulike brytepunkter på tvers av skjermene, så en iPad i 1024 px
 * viste mobil på én side og PC på den neste. Låst: PC fra 900 px containerbredde
 * (skjerm inni skall) og 1024 px vindusbredde (skallet). 600 px er mellomtrinnet
 * for to kolonner på stor mobil. Tallene står som --ak-bryt-* i src/styles/ak-tokens.css.
 *
 * Vakten leser `@media (min-width: N px)` i src/styles/*-ny*.css. Andre verdier
 * feiler, bortsett fra forekomstene som fantes 20.10.2026 (HVITELISTE under, med antall
 * per fil, så en ny kopi i samme fil også feiler). Eksisterende skjermer endres ikke
 * av denne vakten; de rettes når skjermen uansett åpnes.
 *
 * Kjør fra repo-roten: node scripts/check-brytepunkt.mjs
 * Exit 0 = OK · 1 = nytt avvikende brytepunkt.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const TILLATT = new Set([600, 900, 1024]);

/** Dagens forekomster av andre verdier: fil → { px → antall }. Ikke legg til her. */
export const HVITELISTE = {
  "agencyos-ny-workbench.css": { 1280: 1 },
};

const MEDIA_RE = /@media[^{]*?\(\s*min-width\s*:\s*(\d+(?:\.\d+)?)\s*px\s*\)/g;

/**
 * Finner `@media (min-width: Npx)` i én fil og returnerer bruddene mot
 * tillatt-lista og hvitelista. Ren funksjon.
 * @param {string} filnavn  bare navnet (f.eks. "playerhq-ny-idag.css")
 * @param {string} kilde    CSS-innholdet
 * @returns {string[]} meldinger, tom liste = OK
 */
export function finnBrudd(filnavn, kilde) {
  const antall = new Map();
  for (const m of kilde.matchAll(MEDIA_RE)) {
    const px = Number(m[1]);
    if (TILLATT.has(px)) continue;
    antall.set(px, (antall.get(px) ?? 0) + 1);
  }
  const brudd = [];
  for (const [px, n] of antall) {
    const lov = HVITELISTE[filnavn]?.[px] ?? 0;
    if (n > lov) {
      brudd.push(
        `${filnavn}: @media (min-width: ${px}px) finnes ${n} gang(er), tillatt ${lov}. ` +
          `Bruk 600, 900 eller 1024 px (src/styles/ak-tokens.css §Låste mål).`,
      );
    }
  }
  return brudd;
}

export function kjor(rot = path.resolve(import.meta.dirname, "..")) {
  const mappe = path.join(rot, "src", "styles");
  const filer = readdirSync(mappe).filter((f) => /-ny.*\.css$/.test(f));
  const brudd = [];
  for (const f of filer) brudd.push(...finnBrudd(f, readFileSync(path.join(mappe, f), "utf8")));
  return { filer: filer.length, brudd };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { filer, brudd } = kjor();
  if (brudd.length) {
    console.error("check-brytepunkt: nye PC-brytepunkter utenfor 600/900/1024 px:");
    for (const b of brudd) console.error("  - " + b);
    process.exit(1);
  }
  console.log(`check-brytepunkt: OK (${filer} stilark, bare 600/900/1024 px og hvitelistet 1280).`);
}
