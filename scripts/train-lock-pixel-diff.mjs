// Pilot/kalibrerings-skript for sign-off-riggen: fasit-ramme (isolert,
// element.screenshot()) vs app-skjermbilde (samme viewport-størrelse,
// innlogget) → pixelmatch-diff med prosenttall og diff-bilde.
//
// Brukes til å KALIBRERE mapping (rute, viewport, evt. cropTop for baked-in
// statuslinje) skjerm for skjerm, før den låses i tests/visual/skjerm-mapping.ts.
// Selve motoren bor i scripts/lib/train-lock-maal.mjs og deles med den nattlige
// testen tests/visual/train-lock-pixelnaerhet.spec.ts (fase 1, økt 6).
//
// Kjør:  node scripts/train-lock-pixel-diff.mjs <label> <rute> [tema] [cropTop] [BASE_URL]
//        … [--viewport=<bredde>x<hoyde> --selector='<css>']   panel-modus, se tests/visual/README.md
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { maalSkjerm, STANDARD_NAA } from "./lib/train-lock-maal.mjs";

loadEnv({ path: ".env.local" });

// Flagg (--navn=verdi) skilles fra posisjonelle argumenter — rekkefølgen på de
// posisjonelle er uendret, så eksisterende kall virker som før.
const flagg = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const i = a.indexOf("=");
    return i === -1 ? [a.slice(2), "true"] : [a.slice(2, i), a.slice(i + 1)];
  })
);
const posisjonelle = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const [label, rute, tema = "dark", cropTopArg = "0", BASE = process.env.SHOT_BASE || "https://akgolf-hq.vercel.app"] = posisjonelle;
const cropTop = Number(cropTopArg);
// Panel-modus (tests/visual/README.md §Panel-modus): begge flagg eller ingen.
const selector = flagg.selector ?? null;
const viewportFlagg = flagg.viewport ? flagg.viewport.split("x").map(Number) : null;
if (Boolean(selector) !== Boolean(viewportFlagg) || (viewportFlagg && (viewportFlagg.length !== 2 || viewportFlagg.some((n) => !Number.isInteger(n) || n <= 0)))) {
  console.error("Panel-modus krever BÅDE --viewport=<bredde>x<hoyde> (heltall) OG --selector='<css>'.");
  process.exit(1);
}
// Fryser "i dag" til fasitens dato (kun screentest, se src/lib/testing/dato-override.ts).
// Overstyres med SHOT_DATO=<ISO-datotid> for en rad med et testDato ulikt
// denne standarden (tests/visual/skjerm-mapping.ts, fase 1 økt 3).
const TEST_NAA = process.env.SHOT_DATO || STANDARD_NAA;
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
const BRUKER = process.env.SHOT_BRUKER || "screentest@akgolf.test";

if (!label || !rute) {
  console.error("Bruk: node scripts/train-lock-pixel-diff.mjs <label> <rute> [tema=dark] [cropTop=0] [BASE_URL] [--viewport=BxH --selector='css']");
  process.exit(1);
}
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local (eller sett SHOT_PASSWORD)");
  process.exit(1);
}

const browser = await chromium.launch();
try {
  const r = await maalSkjerm(
    browser,
    {
      label,
      rute,
      tema,
      cropTop,
      bruker: BRUKER,
      viewport: viewportFlagg ? { bredde: viewportFlagg[0], hoyde: viewportFlagg[1] } : undefined,
      selector: selector ?? undefined,
    },
    { base: BASE, passord: PASSWORD, naa: TEST_NAA }
  );
  console.log(`${label} (${rute}, ${tema}, cropTop=${cropTop})`);
  console.log(`  fasit: ${r.filer.fasit}`);
  console.log(`  app:   ${r.filer.app}`);
  console.log(`  diff:  ${r.filer.diff}`);
  console.log(`  avvik: ${r.avvikPiksler}/${r.totalPiksler} px = ${r.avvikPst.toFixed(2)}%`);
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
} finally {
  await browser.close();
}
