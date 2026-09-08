// Målemotoren i Train-lock sign-off-riggen — delt mellom CLI-en
// (scripts/train-lock-pixel-diff.mjs, kalibrering skjerm for skjerm) og den
// nattlige Playwright-spec-en (tests/visual/train-lock-pixelnaerhet.spec.ts).
//
// Ingen process.exit her: feil kastes som Error med samme tekst CLI-en alltid
// har skrevet, så begge kallerne velger selv hva de gjør med dem. Ikke bruk
// toppnivå-await i denne fila — spec-en laster den via require(esm).
//
// Metoden er uendret fra kalibreringsrunden 01.09.2026 (tests/visual/README.md):
// fasit-rammen skjermbildes ISOLERT (element.screenshot i ekte pikselstørrelse),
// appen skjermbildes innlogget i samme størrelse, og fasitens bakte-inn
// statuslinje (cropTop) kuttes fra TOPPEN av fasiten og BUNNEN av appen.
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const FASIT_DIR = "designsystem/train-lock";
export const UT_DIR = "tests/visual/ut";
// Riggens frosne «nå»: 09:10 Oslo 22.08.2026, midt i den seedede 09:00–09:50-
// økten. Virker kun for screentest-kontoen (src/lib/testing/dato-override.ts).
export const STANDARD_NAA = "2026-08-22T07:10:00Z";

const BRUKER_EPOST = {
  screentest: "screentest@akgolf.test",
  coachtest: "coachtest@akgolf.test",
};

export function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Finner .dc.html-fila som inneholder data-screen-label="<label>", eller null.
export async function finnFasitFil(label, fasitDir = FASIT_DIR) {
  const filer = (await readdir(fasitDir)).filter((f) => f.endsWith(".dc.html"));
  for (const fil of filer) {
    const innhold = await readFile(path.join(fasitDir, fil), "utf8");
    if (innhold.includes(`data-screen-label="${label}"`)) return fil;
  }
  return null;
}

// 1) Fasit-ramme, isolert, ekte pikselstørrelse. Returnerer rammens boundingBox.
export async function taFasitBilde(browser, { label, fasitFil, utFil, fasitDir = FASIT_DIR }) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  try {
    const side = await ctx.newPage();
    await side.goto(`file://${path.resolve(fasitDir, fasitFil)}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await side.waitForTimeout(800);
    const el = await side.$(`[data-screen-label="${label}"]`);
    if (!el) throw new Error(`"${fasitFil}" har ikke data-screen-label="${label}" i DOM-en (helmet/script-feil?).`);
    const box = await el.boundingBox();
    await el.screenshot({ path: utFil });
    return box;
  } finally {
    await ctx.close();
  }
}

// Innlogging med to forsøk (prod kan være treg på første kald start). true ved suksess.
export async function loggInn(ctx, { base, epost, passord }) {
  for (let i = 1; i <= 2; i++) {
    const p = await ctx.newPage();
    try {
      await p.goto(`${base}/auth/login`, { waitUntil: "domcontentloaded", timeout: 90000 });
      await p.waitForSelector('input[type="email"]', { timeout: 90000 });
      await p.fill('input[type="email"]', epost);
      await p.fill('input[type="password"]', passord);
      await Promise.all([
        p.waitForURL(/\/(portal|admin|forelder)/, { timeout: 45000 }).catch(() => {}),
        p.click('button[type="submit"]'),
      ]);
      await p.waitForTimeout(1500);
      const ok = /\/(portal|admin|forelder)/.test(p.url());
      await p.close();
      if (ok) return true;
    } catch {
      await p.close().catch(() => {});
    }
  }
  return false;
}

// 2) App-skjermbilde, innlogget. Uten panel-modus: viewport = fasit-rammens mål.
// Panel-modus (tests/visual/README.md §Panel-modus): fasit-rammen er et innebygd
// panel, ikke en skjerm — appen rendres i `viewport`, og utsnittet klippes fra
// `selector`-elementets øvre venstre hjørne med fasit-rammens bredde/høyde.
// Ikke el.screenshot(): elementet er ofte bredere enn rammen (AO-03: 1144 vs
// 760 px), og da ville størrelsessjekken i klippTilFelles feile.
export async function taAppBilde(browser, { rute, tema, base, epost, passord, naa, fasitBox, viewport, selector, utFil }) {
  if (Boolean(selector) !== Boolean(viewport)) {
    throw new Error("Panel-modus krever BÅDE --viewport=<bredde>x<hoyde> (heltall) OG --selector='<css>'.");
  }
  const width = viewport ? viewport.bredde : Math.round(fasitBox.width);
  const height = viewport ? viewport.hoyde : Math.round(fasitBox.height);
  const isMobile = width < 700;
  const ctx = await browser.newContext({
    viewport: { width, height },
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: 1,
  });
  try {
    const url = new URL(base);
    await ctx.addCookies([{ name: "ak-v2-tema", value: tema, domain: url.hostname, path: "/" }]);
    await ctx.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
    if (!(await loggInn(ctx, { base, epost, passord }))) throw new Error("Innlogging feilet.");
    // Fryser "i dag" (kun screentest, se src/lib/testing/dato-override.ts).
    await ctx.setExtraHTTPHeaders({ "x-screentest-naa": naa });
    const side = await ctx.newPage();
    await side.goto(`${base}${rute}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await side.waitForTimeout(3000);
    if (selector) {
      const el = side.locator(selector).first();
      const synlig = await el.waitFor({ state: "visible", timeout: 30000 }).then(() => true, () => false);
      if (!synlig) {
        throw new Error(`Fant ikke ${selector} på ${rute}. Viser appen en annen tilstand (f.eks. tom) enn fasiten? Seed først (se raden i skjerm-mapping.ts).`);
      }
      const elBox = await el.boundingBox();
      const clip = { x: Math.round(elBox.x), y: Math.round(elBox.y), width: Math.round(fasitBox.width), height: Math.round(fasitBox.height) };
      if (clip.x + clip.width > width || clip.y + clip.height > height) {
        throw new Error(`Panelet (${clip.x},${clip.y} ${clip.width}×${clip.height}) stikker utenfor viewporten ${width}×${height} — øk --viewport.`);
      }
      await side.screenshot({ path: utFil, clip });
    } else {
      await side.screenshot({ path: utFil, fullPage: false });
    }
  } finally {
    await ctx.close();
  }
}

// 3) Diff — fasiten har en bakt-inn statuslinje øverst (dynamic island, klokke)
// som appen ikke har (ekte enhets-statuslinje ligger UTENFOR siden, ikke i
// DOM-en). Kutt cropTop px fra TOPPEN av fasiten (hopp over den bakte linja),
// og cropTop px fra BUNNEN av appen (samme resulterende høyde, men innholdet
// starter på reelt y=0 i appen — kutter man toppen der i stedet, forskyver
// man alt appinnhold cropTop px og får falsk spøkelses-diff).
export function kuttTopp(png, top) {
  if (!top) return png;
  const ut = new PNG({ width: png.width, height: png.height - top });
  PNG.bitblt(png, ut, 0, top, png.width, png.height - top, 0, 0);
  return ut;
}
export function kuttBunn(png, bottom) {
  if (!bottom) return png;
  const ut = new PNG({ width: png.width, height: png.height - bottom });
  PNG.bitblt(png, ut, 0, 0, png.width, png.height - bottom, 0, 0);
  return ut;
}

// Sub-piksel avrundingsavvik (boundingBox() vs faktisk viewport-allokering,
// sett opptil 1-2px på enkelte fasit-rammer) — klipp til minste felles mål
// heller enn å feile. Større avvik enn det er en reell størrelsesfeil.
export function klippTilFelles(fasit, app, cropTop = 0) {
  const dW = Math.abs(fasit.width - app.width);
  const dH = Math.abs(fasit.height - app.height);
  if (dW > 2 || dH > 2) {
    throw new Error(
      `STØRRELSE MATCHER IKKE: fasit ${fasit.width}×${fasit.height} vs app ${app.width}×${app.height} (etter cropTop=${cropTop}).`
    );
  }
  if (!dW && !dH) return [fasit, app];
  const w = Math.min(fasit.width, app.width);
  const h = Math.min(fasit.height, app.height);
  const beskjaer = (png) => {
    const ut = new PNG({ width: w, height: h });
    PNG.bitblt(png, ut, 0, 0, w, h, 0, 0);
    return ut;
  };
  return [beskjaer(fasit), beskjaer(app)];
}

export function diffBilder(fasitPng, appPng, cropTop = 0) {
  const [fasit, app] = klippTilFelles(kuttTopp(fasitPng, cropTop), kuttBunn(appPng, cropTop), cropTop);
  const diff = new PNG({ width: fasit.width, height: fasit.height });
  const avvikPiksler = pixelmatch(fasit.data, app.data, diff.data, fasit.width, fasit.height, { threshold: 0.1 });
  const totalPiksler = fasit.width * fasit.height;
  return { avvikPiksler, totalPiksler, andel: avvikPiksler / totalPiksler, diff };
}

// Hele målingen for én riggrad (tests/visual/skjerm-mapping.ts). Skriver
// <utDir>/<slug>-fasit.png, -app.png og -diff.png. Kaster Error ved feil.
export async function maalSkjerm(browser, rad, { base, passord, naa = null, utDir = UT_DIR }) {
  const fasitFil = await finnFasitFil(rad.label);
  if (!fasitFil) throw new Error(`Fant ingen .dc.html med data-screen-label="${rad.label}"`);
  await mkdir(utDir, { recursive: true });
  const s = slug(rad.label);
  const filer = { fasit: `${utDir}/${s}-fasit.png`, app: `${utDir}/${s}-app.png`, diff: `${utDir}/${s}-diff.png` };
  const fasitBox = await taFasitBilde(browser, { label: rad.label, fasitFil, utFil: filer.fasit });
  const epost = BRUKER_EPOST[rad.bruker] ?? rad.bruker ?? BRUKER_EPOST.screentest;
  await taAppBilde(browser, {
    rute: rad.rute,
    tema: rad.tema ?? "dark",
    base,
    epost,
    passord,
    naa: naa ?? rad.testDato ?? STANDARD_NAA,
    fasitBox,
    viewport: rad.viewport ?? null,
    selector: rad.selector ?? null,
    utFil: filer.app,
  });
  const r = diffBilder(PNG.sync.read(await readFile(filer.fasit)), PNG.sync.read(await readFile(filer.app)), rad.cropTop ?? 0);
  await writeFile(filer.diff, PNG.sync.write(r.diff));
  return {
    label: rad.label,
    rute: rad.rute,
    fasitFil,
    avvikPst: r.andel * 100,
    avvikPiksler: r.avvikPiksler,
    totalPiksler: r.totalPiksler,
    filer,
  };
}
