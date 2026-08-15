/**
 * Genererer hjemskjerm-appens ikoner OG iOS-splash fra den ekte AK Golf-logoen
 * i Paper-drakt. Ingenting her tegner et eget merke — begge deler plasserer den
 * offisielle logofilen, så logo og farger alltid følger fasiten.
 *
 * Ikoner: public/logos/paper/ak-golf-logo-on-ink.svg (merke #FAF9F5, prikk
 * #D97757) på rail-flaten #141413 — samme lockup som rail-en i fasiten.
 *
 * Splash: public/logos/paper/ak-golf-logo-on-paper.svg (merke #141413, prikk
 * #B85C3D) på #FAF9F5. Splashen skal matche appens FØRSTE maling, og /portal er
 * lys — derfor paper, ikke blekk. Samme verdi som `background_color` i
 * src/app/manifest.ts.
 *
 * Krever rsvg-convert (brew install librsvg). Kjøres sjelden — kun når logoen
 * eller flatefargen endres.
 *
 *   node scripts/generer-app-ikoner.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Rail-flaten fra designsystem/paper/fase1/ — samme blekk som logoen er laget for.
const RAIL = "#141413";
const PAPER = "#faf9f5";

/** Leser en logofil og gir viewBox + banene uten kildens egen rot-tagg. */
function lesLogo(sti) {
  const kilde = readFileSync(sti, "utf8");
  const viewBox = kilde.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`Fant ingen viewBox i ${sti}`);
  const [, , b, h] = viewBox.split(/\s+/).map(Number);
  const innhold = kilde.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { viewBox, b, h, innhold };
}

const LOGO_INK = "public/logos/paper/ak-golf-logo-on-ink.svg";
const LOGO_PAPER = "public/logos/paper/ak-golf-logo-on-paper.svg";
const logoInk = lesLogo(LOGO_INK);
const logoPaper = lesLogo(LOGO_PAPER);

/** Logofilen sentrert på en flate. `bredde` er andel av flatens BREDDE. */
function flate(bredde_px, hoyde_px, radius, flatefarge, logo, bredde) {
  const b = bredde_px * bredde;
  const h = (b * logo.h) / logo.b;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${bredde_px}" height="${hoyde_px}" viewBox="0 0 ${bredde_px} ${hoyde_px}">
  <rect width="${bredde_px}" height="${hoyde_px}" rx="${radius}" ry="${radius}" fill="${flatefarge}"/>
  <svg x="${(bredde_px - b) / 2}" y="${(hoyde_px - h) / 2}" width="${b}" height="${h}" viewBox="${logo.viewBox}">
${logo.innhold}
  </svg>
</svg>`;
}

/**
 * @param {number} px kantlengde
 * @param {number} radius hjørneradius (0 = helflate)
 * @param {number} bredde logoens bredde som andel av flaten
 */
function svg(px, radius, bredde) {
  return flate(px, px, radius, RAIL, logoInk, bredde);
}

const FILER = [
  // Vanlige ikoner — avrundet som app-ikon-konvensjonen tilsier.
  { fil: "public/icon-512.png", px: 512, radius: 114, bredde: 0.66 },
  { fil: "public/icon-192.png", px: 192, radius: 43, bredde: 0.66 },
  // Maskable — helflate. Androids sikkersone er midtsirkelen på 80 %, så
  // logoens diagonal må holdes innenfor den (derfor smalere enn over).
  { fil: "public/icon-512-maskable.png", px: 512, radius: 0, bredde: 0.56 },
  { fil: "public/icon-192-maskable.png", px: 192, radius: 0, bredde: 0.56 },
  // iOS legger på egen maske — leveres helflate.
  { fil: "public/apple-touch-icon.png", px: 180, radius: 0, bredde: 0.66 },
  { fil: "public/favicon-32.png", px: 32, radius: 6, bredde: 0.78 },
  { fil: "public/favicon-16.png", px: 16, radius: 0, bredde: 0.86 },
];

// iOS-splash. Størrelsene MÅ matche <link media>-reglene i src/app/layout.tsx —
// iOS bruker bildet kun hvis oppløsningen treffer eksakt.
const SPLASH = [
  [1290, 2796],
  [1179, 2556],
  [1170, 2532],
  [828, 1792],
  [1668, 2388],
];
// Logoen er liten på splash — den skal hviske, ikke rope, mens appen laster.
const SPLASH_LOGO_BREDDE = 0.33;

const midlertidig = join(tmpdir(), `ak-ikon-${process.pid}.svg`);

function bygg(fil, b, h, svgTekst) {
  writeFileSync(midlertidig, svgTekst);
  execFileSync("rsvg-convert", ["-w", String(b), "-h", String(h), midlertidig, "-o", fil]);
  console.log(`${fil} — ${b}×${h}`);
}

for (const { fil, px, radius, bredde } of FILER) {
  bygg(fil, px, px, svg(px, radius, bredde));
}

for (const [b, h] of SPLASH) {
  bygg(
    `public/splash/apple-splash-${b}-${h}.png`,
    b,
    h,
    flate(b, h, 0, PAPER, logoPaper, SPLASH_LOGO_BREDDE),
  );
}

unlinkSync(midlertidig);
console.log(`\nFerdig. Ikoner fra ${LOGO_INK}, splash fra ${LOGO_PAPER}.`);
