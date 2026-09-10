# Historisk grenrest – 10.09.2026

Bevart fra `park/2026-09-08-opprydding`, commit `e4356c368`. Main fjernet denne planrekken som fullført i PR #812. Dette er historikk, ikke aktive arbeidsordrer eller gjeldende designvalg.

---

# Fase 1 · Økt 6 — Nattlig måling + lys/mørk-røyktest

**Mål:** Riggen slutter å være et lokalt verktøy på én Mac. Hver natt kjører GitHub Actions
(1) `tests/visual/train-lock-pixelnaerhet.spec.ts` — alle kalibrerte riggrader i
`tests/visual/skjerm-mapping.ts` måles mot Train-lock-fasiten med samme motor som CLI-en, og
feiler ved avvik over `kalibrertAvvikPst` + toleranse — og (2)
`tests/visual/lys-morkt-royk.spec.ts` — hver rute under `/portal`, `/admin` og `/forelder` i lys
og mørk på 390 og 1280: tema faktisk satt, 0 konsollfeil, ingen horisontal overflyt, ingen tekst
i et blokkerende kontrastpar. Begge henges på `.github/workflows/playwright.yml` som schedule-jobb.

**Verifisert 06.09.2026 mot `origin/main` = `c1c3396eb`** (`git fetch origin && git rev-parse --short origin/main`).
Alle tre parallelle PR-er er inne: `gh pr view 787 --json state -q .state` → `MERGED` (samme for 788 og 789).
Ingen av dem overlapper denne økten — #787/#789 la rader i `skjerm-mapping.ts` (S3-03a/b, PH-21a/b/c), #788
byttet fasit-siteringer i WorkbenchV2. Økten leser radene, rører dem ikke.
**Skeptikerrunde 06.09 (kveld), alt målt mot `c1c3396eb`:** filstier, linjenumre, rutetall (88/61/12), kontrastpar,
secrets, npm-scripts og YAML-en er kontrollert; rettet: JSDoc på `maalSkjerm` (ellers TS2345 i spec-en), `process.exit`-
tellingen (6, ikke 9), grenbyttet worktree → hovedmappe i 6.4, YAML-sjekkens forventede output, secret-omtalen
(§4 pkt. 6 sier alt «finnes allerede»), `gh pr checks --watch` før merge (main er ubeskyttet), `git fetch --prune` i
Ferdig-når 8.

**Forutsetninger:**
- `git fetch origin && git checkout -b claude/fase1-okt6-nattlig-maaling origin/main`
- Node 24 (`node --version` → `v24.14.0` lokalt; CI `node-version: "24"`). Ingen nye avhengigheter:
  `@playwright/test` 1.59.1, `pixelmatch` ^7.2.0, `pngjs` ^7.0.0, `dotenv` ^17.4.2 og `tsx` ^4.21.0 finnes alt
  (`node -e 'const p=require("./package.json");console.log(p.devDependencies.pixelmatch,p.devDependencies.pngjs,p.dependencies.dotenv)'`).
- Repoet bruker IKKE vitest (`grep -c vitest package.json` → `0`). Enhetstester er `node:test` via
  `npm test` = `tsx --conditions=react-server --experimental-test-module-mocks --test 'src/**/*.test.ts'` —
  nye tester MÅ ligge under `src/` for å bli plukket opp. Økt 4 bruker `src/lib/__tests__/visual/`; vi gjør det samme.
- Tre ting er bevist mulig i denne øktens forberedelse (kjørt med repoets egne binærer): en `.spec.ts` under
  Playwright 1.59.1 kan importere en `.mjs`-modul (Node 24 `require(esm)`), `tsc --noEmit` med repoets
  `tsconfig.json` (`allowJs: true`, `moduleResolution: bundler`) godtar det samme, og `tsx --test` likeså.
  Modulen må derfor ikke ha toppnivå-`await` (det bryter `require(esm)`).
- **Oppgave 6.4 og 6.6 må kjøres fra hovedmappa/maskinen med `.env.local`** (`SCREENTEST_PASSWORD`).
  Aldri kopier `.env*` inn i en worktree (gotchas.md). En nøstet worktree under `.claude/worktrees/` har ingen
  egen `node_modules` — Node løser opp til hovedrepoets, så `npm ci` er ikke nødvendig der; `npx playwright test`
  finner likevel binæren (verifisert 06.09: `npx playwright --version` → `1.59.1` fra worktreen uten `node_modules`).
  **Lag grenen helst i hovedmappa.** Lager du den i en worktree, kan hovedmappa IKKE sjekke den ut mens worktreen
  holder den (`fatal: … is already checked out`) — byttet står i 6.4 steg 1 (`git switch --detach` i worktreen
  frigjør grennavnet; `.git` er delt, så ingen push trengs for at hovedmappa skal se grenen).
- GitHub-secreten finnes allerede — ingen `gh secret set`: `gh secret list | grep SCREENTEST` →
  `SCREENTEST_PASSWORD 2026-08-26T20:01:54Z` (verifisert 06.09; «Komplett designport» §4 pkt. 6 sier det samme:
  «finnes allerede siden 26.08.2026»). `scripts/roter-screentest-passord.ts` setter den ved hver rotasjon.
  **Ingen workflow REFERERER den i dag** — `grep -rn SCREENTEST .github/workflows/` → tomt — så jobben `nattlig`
  (6.5 steg 3, `${{ secrets.SCREENTEST_PASSWORD }}`) blir første bruker: secreten er der, referansen er ny. Alle tre
  testbrukerne deler passordet (`roter-screentest-passord.ts:22–29`): `screentest@akgolf.test` (PLAYER), `coachtest@akgolf.test`
  (ADMIN), `screentest-parent@akgolf.test` (PARENT, `scripts/seed-screentest-parent.ts:32–33`).
- Økt 3 (felt `testDato` per rad) og økt 4 (felt `viewport`/`selector`/`fasitDato`, CLI-flagg `--viewport`/`--selector`)
  kan være merget eller ikke når du starter. Sjekk: `grep -c "selector?: string" tests/visual/skjerm-mapping.ts`
  (1 = økt 4 inne) og `grep -c "testDato?: string" tests/visual/skjerm-mapping.ts` (1 = økt 3 inne). Planen virker i
  begge tilfeller: spec-ene bruker en lokalt utvidet type (`RadUtvidet`), og CLI-en skrives om i sin helhet med
  økt 4 sine flagg og feiltekster ordrett — så den er lik uansett rekkefølge.

---

### Oppgave 6.1: Målemotoren ut av CLI-en — `scripts/lib/train-lock-maal.mjs`

`scripts/train-lock-pixel-diff.mjs` (186 linjer, sist endret `dd0180884` 01.09.2026) er ren CLI: toppnivå-`await`,
`process.exit()` seks steder, ingen `export`. Spec-en kan ikke importere den. Motoren flyttes ut i en modul uten
`process.exit`; CLI-en blir et tynt skall med identisk kommandolinje, identisk utskrift og identiske feiltekster.

**Filer:**
- Create: `scripts/lib/train-lock-maal.mjs`
- Create: `src/lib/__tests__/visual/train-lock-maal.test.ts`
- Modify: `scripts/train-lock-pixel-diff.mjs` (hele fila erstattes)

**Grensesnitt** (brukes av 6.2, 6.3 og CLI-en):
- `finnFasitFil(label, fasitDir = "designsystem/train-lock") → Promise<string | null>`
- `loggInn(ctx, { base, epost, passord }) → Promise<boolean>` (to forsøk, som CLI-en har i dag)
- `maalSkjerm(browser, rad, { base, passord, naa?, utDir? }) → Promise<{ label, rute, fasitFil, avvikPst, avvikPiksler, totalPiksler, filer: { fasit, app, diff } }>`
  der `rad` er en riggrad (`label`, `rute`, `tema`, `cropTop`, `bruker?`, `viewport?`, `selector?`, `testDato?`).
  `bruker` godtar både radens korte navn (`"screentest"`/`"coachtest"`) og en e-post (CLI-ens `SHOT_BRUKER`).
- Rene funksjoner for test: `slug`, `kuttTopp`, `kuttBunn`, `klippTilFelles`, `diffBilder`
- Konstanter: `FASIT_DIR`, `UT_DIR`, `STANDARD_NAA` (= dagens `TEST_NAA` `"2026-08-22T07:10:00Z"`, pixel-diff.mjs:26)
- **Typene TS ser fra `.mjs`-en kommer fra JSDoc-blokken over `maalSkjerm` (steg 2) — behold den.** Uten JSDoc leser
  tsc (`allowJs`) destruktureringen `{ base, passord, naa, utDir = UT_DIR }` som `naa: any` **påkrevd**, og spec-en i
  6.2 — som ikke sender `naa` — feiler med `TS2345: Property 'naa' is missing`. Målt 06.09 med repoets `tsconfig.json`:
  uten JSDoc rød, med JSDoc `tsc --noEmit` stille.

- [ ] **Steg 1: Testen først.** Opprett `src/lib/__tests__/visual/train-lock-maal.test.ts`:
  ```ts
  /**
   * Rene deler av målemotoren i Train-lock sign-off-riggen
   * (scripts/lib/train-lock-maal.mjs) — beskjæring, størrelsesvakt, diff og
   * fasit-oppslag. Nettleserdelene (fasit-/app-skjermbilde) kjøres av
   * tests/visual/train-lock-pixelnaerhet.spec.ts, ikke her.
   */
  import { test } from "node:test";
  import assert from "node:assert/strict";
  import { PNG } from "pngjs";
  import {
    slug,
    kuttTopp,
    kuttBunn,
    klippTilFelles,
    diffBilder,
    finnFasitFil,
    STANDARD_NAA,
  } from "../../../../scripts/lib/train-lock-maal.mjs";

  /** Ensfarget PNG. */
  function bilde(bredde: number, hoyde: number, rgba: [number, number, number, number]): PNG {
    const png = new PNG({ width: bredde, height: hoyde });
    for (let i = 0; i < bredde * hoyde; i++) png.data.set(rgba, i * 4);
    return png;
  }
  const HVIT: [number, number, number, number] = [255, 255, 255, 255];
  const SVART: [number, number, number, number] = [0, 0, 0, 255];

  test("slug: label → filnavn-trygg streng", () => {
    assert.equal(slug("PH-01 I dag"), "ph-01-i-dag");
    assert.equal(slug("S3-03a Spiller profil Mac"), "s3-03a-spiller-profil-mac");
  });

  test("kuttTopp/kuttBunn: cropTop 0 gir samme objekt, ellers riktig høyde", () => {
    const p = bilde(4, 10, HVIT);
    assert.equal(kuttTopp(p, 0), p);
    assert.equal(kuttBunn(p, 0), p);
    assert.equal(kuttTopp(p, 3).height, 7);
    assert.equal(kuttBunn(p, 3).height, 7);
    assert.equal(kuttTopp(p, 3).width, 4);
  });

  test("klippTilFelles: inntil 2 px avvik klippes til minste felles mål", () => {
    const [a, b] = klippTilFelles(bilde(100, 100, HVIT), bilde(101, 102, HVIT));
    assert.deepEqual([a.width, a.height, b.width, b.height], [100, 100, 100, 100]);
  });

  test("klippTilFelles: mer enn 2 px er en reell størrelsesfeil", () => {
    assert.throws(
      () => klippTilFelles(bilde(100, 100, HVIT), bilde(104, 100, HVIT), 54),
      /STØRRELSE MATCHER IKKE: fasit 100×100 vs app 104×100 \(etter cropTop=54\)/,
    );
  });

  test("diffBilder: identiske bilder gir 0, motsatte gir 100 %, cropTop teller fra riktig ende", () => {
    const likt = diffBilder(bilde(4, 10, HVIT), bilde(4, 10, HVIT), 0);
    assert.equal(likt.avvikPiksler, 0);
    assert.equal(likt.totalPiksler, 40);
    const ulikt = diffBilder(bilde(4, 10, HVIT), bilde(4, 10, SVART), 2);
    assert.equal(ulikt.totalPiksler, 32);
    assert.equal(ulikt.andel, 1);
    assert.equal(ulikt.diff.height, 8);
  });

  test("finnFasitFil: finner fila på data-screen-label, null når ingen har den", async () => {
    assert.equal(await finnFasitFil("PH-01 I dag"), "PH-01 I dag.dc.html");
    assert.equal(await finnFasitFil("Finnes ikke 0000"), null);
  });

  test("STANDARD_NAA er riggens frosne testdato (09:10 Oslo 22.08.2026)", () => {
    assert.equal(STANDARD_NAA, "2026-08-22T07:10:00Z");
  });
  ```
  Kjør: `npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/visual/train-lock-maal.test.ts`
  Forventet: feiler med `Cannot find module '…/scripts/lib/train-lock-maal.mjs'`. Rødt er riktig nå.

- [ ] **Steg 2: Modulen.** Opprett `scripts/lib/train-lock-maal.mjs` med nøyaktig dette innholdet (metoden er
  linje 39–176 i dagens `train-lock-pixel-diff.mjs`, flyttet — ikke endret; panel-modusen er økt 4 sin, med samme
  feiltekster):
  ```js
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
  //
  // JSDoc-en under er ikke pynt: uten den leser tsc (allowJs) destruktureringen
  // som `naa: any` PÅKREVD, og spec-en — som ikke sender naa — feiler med TS2345.
  /**
   * @param {import("@playwright/test").Browser} browser
   * @param {{ label: string, rute: string, tema?: "dark" | "light", cropTop?: number, bruker?: string, viewport?: { bredde: number, hoyde: number } | null, selector?: string | null, dato?: string }} rad
   * @param {{ base: string, passord: string, naa?: string, utDir?: string }} valg
   */
  export async function maalSkjerm(browser, rad, { base, passord, naa, utDir = UT_DIR }) {
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
  ```
  Kjør testen igjen (samme kommando som steg 1). Forventet: `ℹ pass 7`, `ℹ fail 0`. `node --check scripts/lib/train-lock-maal.mjs` → stille.

- [ ] **Steg 3: CLI-en blir et tynt skall.** Erstatt HELE innholdet i `scripts/train-lock-pixel-diff.mjs` med:
  ```js
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
      { base: BASE, passord: PASSWORD, naa: STANDARD_NAA }
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
  ```
  Hvis økt 4 er merget først (`git log -1 --format=%h -- scripts/train-lock-pixel-diff.mjs` er ikke `dd0180884`):
  les fila før du erstatter, og sammenlign flaggparsingen og de tre feiltekstene (`Panel-modus krever BÅDE …`,
  `Fant ikke … Seed først …`, `Panelet … stikker utenfor …`) med økt 4 sin versjon — de skal være ordrett like.
  Innholdet over er skrevet mot økt 4 sin plan (oppgave 4.4), så avvik skal ikke finnes; finnes de, vinner det som
  ligger i `origin/main`.

- [ ] **Steg 4: Verifiser uten credentials** (worktreen har ingen `.env.local`, så passordsjekken skal stoppe):
  ```bash
  node --check scripts/train-lock-pixel-diff.mjs; echo "check=$?"
  node scripts/train-lock-pixel-diff.mjs; echo "exit=$?"
  node scripts/train-lock-pixel-diff.mjs "X" "/y" dark 0 --selector=a; echo "exit=$?"
  node scripts/train-lock-pixel-diff.mjs "X" "/y" dark 0 --viewport=1440x900 --selector=a; echo "exit=$?"
  ```
  Forventet, i rekkefølge: `check=0` · `Bruk: … [--viewport=BxH --selector='css']` + `exit=1` ·
  `Panel-modus krever BÅDE …` + `exit=1` · `SCREENTEST_PASSWORD mangler i .env.local (eller sett SHOT_PASSWORD)` + `exit=1`.
  Deretter `npx tsc --noEmit` → ingen utskrift (tsc leser nå `train-lock-maal.mjs` via testen, `allowJs`).

- [ ] **Steg 5: Commit**
  ```bash
  git add scripts/lib/train-lock-maal.mjs scripts/train-lock-pixel-diff.mjs src/lib/__tests__/visual/train-lock-maal.test.ts
  git commit -m "refactor(rigg): målemotoren ut i scripts/lib/train-lock-maal.mjs, CLI-en er et tynt skall (fase 1, økt 6)

  Samme metode, samme utskrift, samme feiltekster (inkl. økt 4 sin panel-modus).
  Ingen process.exit i modulen, så den nattlige spec-en kan importere den.
  Rene deler (beskjæring, størrelsesvakt, diff, fasit-oppslag) har node:test.

  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
  ```

---

### Oppgave 6.2: `tests/visual/train-lock-pixelnaerhet.spec.ts` + egen Playwright-konfig

`playwright.config.ts:8` har `testDir: "tests/e2e"` — spec-er i `tests/visual/` plukkes ikke opp av
`npx playwright test`, og det er riktig: prod-røyktesten (`playwright.yml:44`) skal ikke dra med seg 20+ minutter
måling etter hver push. Den nattlige kjøringen får derfor EGEN konfigfil i stedet for et prosjekt i den
eksisterende (økt 7 rører `playwright.config.ts:10–23`; vi rører den ikke).

**Filer:**
- Create: `playwright.nattlig.config.ts`
- Create: `tests/visual/train-lock-pixelnaerhet.spec.ts` (siteres alt i `scripts/train-lock-pixel-diff.mjs:7` — fantes aldri: `ls tests/visual/` → `README.md skjerm-mapping.ts`)
- Modify: `package.json:36` (nytt script `nattlig` etter `signoff:train-lock`)

**Grensesnitt:** `npm run nattlig` = `playwright test -c playwright.nattlig.config.ts`; miljø `PLAYWRIGHT_BASE_URL`
(default prod), `SCREENTEST_PASSWORD`, `PIXEL_TOLERANSE_PP` (default `2`).

- [ ] **Steg 1: Konfigen.** Opprett `playwright.nattlig.config.ts`:
  ```ts
  import { defineConfig } from "@playwright/test";

  /**
   * Nattlig måling mot PROD (tests/visual/README.md §Nattlig kjøring) — fase 1,
   * økt 6 i «Komplett designport» (05.09.2026).
   *
   * Egen konfig, ikke et prosjekt i playwright.config.ts: `testDir` der er
   * tests/e2e, og `npx playwright test` er prod-røyktesten som kjører etter hver
   * push til main (playwright.yml). Den skal ikke dra med seg 20+ minutter måling.
   *
   * Kjør: npm run nattlig            (krever SCREENTEST_PASSWORD i .env.local)
   */
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "https://akgolf-hq.vercel.app";

  export default defineConfig({
    testDir: "tests/visual",
    testMatch: ["*.spec.ts"],
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    // Ingen automatiske omkjøringer: en test her tar minutter, og en rød natt
    // skal vises som rød — ikke maskeres av et grønt andreforsøk.
    retries: 0,
    workers: 3,
    timeout: 25 * 60_000,
    expect: { timeout: 10_000 },
    reporter: [["html", { open: "never" }], ["line"]],
    use: { baseURL, trace: "off", screenshot: "off" },
    projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  });
  ```

- [ ] **Steg 2: package.json.** Sett inn én linje etter linje 36 (`"signoff:train-lock": "node scripts/train-lock-pixel-diff.mjs",`):
  ```json
      "nattlig": "playwright test -c playwright.nattlig.config.ts",
  ```
  Bekreft: `node -e "console.log(require('./package.json').scripts.nattlig)"` → `playwright test -c playwright.nattlig.config.ts`.

- [ ] **Steg 3: Spec-en.** Opprett `tests/visual/train-lock-pixelnaerhet.spec.ts`:
  ```ts
  /**
   * Nattlig pixelnærhet mot Train-lock-fasiten (fase 1, økt 6 i «Komplett
   * designport», 05.09.2026). Kjøres av jobben `nattlig` i
   * .github/workflows/playwright.yml mot PROD — den er IKKE en PR-gate
   * (tests/visual/README.md: fasiten rendres fersk i samme Chromium, og
   * baseline-tallene er målt, ikke antatt).
   *
   * Én test per rad med status "kalibrert" i skjerm-mapping.ts, samme motor som
   * CLI-en (scripts/lib/train-lock-maal.mjs). Feiler når målt avvik overstiger
   * radens kalibrertAvvikPst + PIXEL_TOLERANSE_PP (default 2 prosentpoeng;
   * playwright.yml setter 5 første uke — se README §Nattlig kjøring).
   *
   * Datatilstand: CI seeder ingenting. Radenes seedScript kjøres fra
   * hovedmaskinen (idempotente), og "i dag" fryses med x-screentest-naa som i
   * CLI-en. Rader som ikke kan måles om natten står i HOPP_OVER med grunn.
   */
  import { test, expect, type Browser } from "@playwright/test";
  import { config as loadEnv } from "dotenv";
  import { SKJERM_MAPPING, type SkjermMapping } from "./skjerm-mapping";
  import { loggInn, maalSkjerm } from "../../scripts/lib/train-lock-maal.mjs";

  loadEnv({ path: ".env.local" });

  const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://akgolf-hq.vercel.app";
  const PASSORD = process.env.SCREENTEST_PASSWORD?.trim() ?? "";
  const TOLERANSE_PP = Number(process.env.PIXEL_TOLERANSE_PP ?? "2");
  const UT_DIR = "tests/visual/ut/nattlig";

  /**
   * Felt økt 3 (`testDato`) og økt 4 (`viewport`, `selector`) legger til i rad-typen.
   * Deklarert lokalt så spec-en kompilerer uansett om de er merget ennå.
   */
  type RadUtvidet = SkjermMapping & {
    testDato?: string;
    viewport?: { bredde: number; hoyde: number };
    selector?: string;
  };

  /**
   * KJENTE rader som IKKE kan måles i den nattlige jobben — label → hvorfor.
   * Lista skal krympe, aldri vokse uten grunn i teksten.
   */
  const HOPP_OVER: Record<string, string> = {
    "PH-21c Min kurve tom iPhone":
      "Samme rute som PH-21a/b i en ANNEN datatilstand (seed-ph21-signoff-fixture.ts --tom). CI kan ikke seede om mellom radene — måles lokalt.",
  };

  const KALIBRERTE = (SKJERM_MAPPING as RadUtvidet[]).filter((r) => r.status === "kalibrert");

  /**
   * S3-03a/b har «/admin/spillere/<spillerId>» som rute (målt 05.09 mot «første
   * rad i /admin/spillere», PR #787). Løses på samme måte: første spillerlenke i
   * stallen, innlogget som coachtest.
   */
  async function loesRute(browser: Browser, rad: RadUtvidet): Promise<string> {
    if (!rad.rute.includes("<")) return rad.rute;
    if (!rad.rute.includes("<spillerId>")) {
      throw new Error(`${rad.label}: ukjent plassholder i rute «${rad.rute}» — bare <spillerId> løses her.`);
    }
    const ctx = await browser.newContext();
    try {
      const ok = await loggInn(ctx, { base: BASE, epost: "coachtest@akgolf.test", passord: PASSORD });
      expect(ok, "Innlogging som coachtest@akgolf.test feilet (for å finne spillerId)").toBe(true);
      const side = await ctx.newPage();
      await side.goto(`${BASE}/admin/spillere`, { waitUntil: "domcontentloaded", timeout: 90_000 });
      const href = await side
        .locator('a[href^="/admin/spillere/"]:not([href$="/ny"])')
        .first()
        .getAttribute("href", { timeout: 30_000 });
      if (!href) {
        throw new Error("Fant ingen spillerlenke på /admin/spillere — er demo-stallen seedet? (npx tsx scripts/seed-screentest-coach.ts)");
      }
      return rad.rute.replace("<spillerId>", href.split("/").pop() ?? "");
    } finally {
      await ctx.close();
    }
  }

  test.describe("Nattlig pixelnærhet — kalibrerte riggrader", () => {
    for (const rad of KALIBRERTE) {
      test(`${rad.label} (${rad.rute}) ≤ ${rad.kalibrertAvvikPst ?? "?"} + ${TOLERANSE_PP} pp`, async ({ browser }) => {
        test.skip(!PASSORD, "SCREENTEST_PASSWORD mangler (.env.local lokalt, secret i CI)");
        test.skip(Boolean(HOPP_OVER[rad.label]), HOPP_OVER[rad.label]);
        expect(rad.kalibrertAvvikPst, `${rad.label} står som kalibrert uten kalibrertAvvikPst`).toBeDefined();

        const rute = await loesRute(browser, rad);
        const r = await maalSkjerm(browser, { ...rad, rute }, { base: BASE, passord: PASSORD, utDir: UT_DIR });
        test.info().annotations.push({
          type: "avvik",
          description: `${r.avvikPst.toFixed(2)} % (baseline ${rad.kalibrertAvvikPst} %, toleranse +${TOLERANSE_PP} pp) — ${r.filer.diff}`,
        });
        expect(
          r.avvikPst,
          `${rad.label}: ${r.avvikPst.toFixed(2)} % > ${rad.kalibrertAvvikPst} + ${TOLERANSE_PP}. Se ${r.filer.diff}. Notat i raden: ${rad.notat}`,
        ).toBeLessThanOrEqual((rad.kalibrertAvvikPst ?? 0) + TOLERANSE_PP);
      });
    }
  });
  ```

- [ ] **Steg 4: Sjekk at riggen lister riktig.**
  ```bash
  npx playwright test -c playwright.nattlig.config.ts --list 2>&1 | grep -c "train-lock-pixelnaerhet.spec.ts"
  ```
  Forventet: `10` — én per kalibrert rad (`grep -c '^    status: "kalibrert",' tests/visual/skjerm-mapping.ts` → `10`
  på `c1c3396eb`: PH-01, TE-01, TM-04a, TM-01a, PH-07, PH-21a, PH-21b, PH-21c, S3-03a, S3-03b).
  `npx tsc --noEmit` → ingen utskrift.

- [ ] **Steg 5: Commit**
  ```bash
  git add playwright.nattlig.config.ts tests/visual/train-lock-pixelnaerhet.spec.ts package.json
  git commit -m "test(visual): nattlig pixelnærhet — én test per kalibrert riggrad, feiler over baseline + toleranse

  Egen konfig playwright.nattlig.config.ts (testDir tests/visual) så prod-
  røyktesten er uendret. npm run nattlig. PH-21c hoppes over med grunn
  (annen datatilstand enn PH-21a/b på samme rute).

  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
  ```

---

### Oppgave 6.3: `tests/visual/lys-morkt-royk.spec.ts` — alle produktruter, lys og mørk

**Filer:**
- Create: `tests/visual/produkt-ruter.ts` (rutelista, utledet fra `src/app` ved kjøring)
- Create: `src/lib/__tests__/visual/produkt-ruter.test.ts`
- Create: `tests/visual/lys-morkt-royk.spec.ts`

**Grensesnitt:** `finnProduktRuter(flate: "portal" | "admin" | "forelder") → string[]`, `erRedirectSide(kilde) → boolean`,
`tilRute(relativSti) → string | null`.

**Hvorfor utledet, ikke statisk liste:** `src/app/{portal,admin,forelder}` har 253 `page.tsx` uten `[param]` i dag
(`git ls-tree -r --name-only origin/main -- src/app/portal src/app/admin src/app/forelder | grep '/page\.tsx$' | grep -vc '\['` → `253`),
hvorav 92 er rene redirect-sider (bare `redirect(…)`, ingen JSX) og dekkes av målsiden. En statisk liste på 161 ruter
ville vært utdatert ved neste side. Heuristikken er den samme som en shell-pipeline ville brukt, bare i TS så den
kan testes: hopp over `[param]`-segmenter, strip rutegrupper `(legacy)`/`(fullscreen)`, hopp over filer som
inneholder `redirect(` men ikke `return (`. Målt 06.09 på `c1c3396eb`: **portal 88, admin 61, forelder 12 = 161 ruter.**

**Kontrastparene — konkret.** `scripts/check-tl-kontrast.mjs:50–62` måler 40 par; `docs/design-audit/train-lock-kontrast.md`
(generert) viser **12 brudd**: 11 i lys, 1 i mørk. Sortert etter hva beslutningen 03.09 («Vei A», beslutninger.md
§KONTRAST-REGEL) sier om dem:
- **Blokkerende (8, alle lys):** `danger`/`ok`/`warn`/`viz-target` som tekst på `scene` eller `elev` — «skal aldri
  brukes som ren tekst på hvit/nøytral bunn».
- **Rapporteres, feiler ikke (2, lys):** `mute` på `dock` (4,2:1) og `dim` på `scene` (1,4:1). `mute` på `dock` er
  fasitens egne inaktive faneetiketter — `src/components/v2/shell.tsx:1151` (`background: TL.dock`) + `:396`
  (`color: … TL.mute`) på hver eneste mobilside. En blokkerende sjekk her ville vært permanent rød uten at noen
  har bestemt at fasiten er feil. Rapporteres som annotasjon; beslutning ligger i «Åpne funn».
- **Utenfor (2, lys + mørk):** `on-danger` på `danger` (Kø-badgen) — hvit tekst på fylt flate, som beslutningen
  eksplisitt tillater.
Verdiene leses fra `src/styles/train-lock-tokens.css` med samme regex som `check-tl-kontrast.mjs:24–35`, aldri
hardkodet, og oversettes til Chromiums `rgb(r, g, b)`-form for sammenligning med `getComputedStyle`.

- [ ] **Steg 1: Test for rutelista først.** Opprett `src/lib/__tests__/visual/produkt-ruter.test.ts`:
  ```ts
  /**
   * Rutelista for den nattlige lys/mørk-røyktesten (tests/visual/produkt-ruter.ts).
   */
  import { test } from "node:test";
  import assert from "node:assert/strict";
  import { erRedirectSide, tilRute, finnProduktRuter } from "../../../../tests/visual/produkt-ruter";

  test("erRedirectSide: bare redirect() uten JSX er en redirect-side", () => {
    assert.equal(
      erRedirectSide('import { redirect } from "next/navigation";\nexport default function Side() {\n  redirect("/admin/ko?fane=agentko");\n}\n'),
      true,
    );
    assert.equal(
      erRedirectSide('import { redirect } from "next/navigation";\nexport default function Side({ ok }: { ok: boolean }) {\n  if (!ok) redirect("/portal");\n  return (\n    <div />\n  );\n}\n'),
      false,
    );
  });

  test("tilRute: rutegrupper strippes, [param] gir null", () => {
    assert.equal(tilRute("/admin/(legacy)/stall/page.tsx"), "/admin/stall");
    assert.equal(tilRute("/portal/(fullscreen)/tren/page.tsx"), "/portal/tren");
    assert.equal(tilRute("/forelder/page.tsx"), "/forelder");
    assert.equal(tilRute("/admin/spillere/[id]/page.tsx"), null);
    assert.equal(tilRute("/forelder/barn/[childId]/page.tsx"), null);
  });

  test("finnProduktRuter: besøkbare ruter, sortert, uten grupper/param/redirect-sider", () => {
    const forelder = finnProduktRuter("forelder");
    assert.ok(forelder.includes("/forelder"));
    assert.ok(forelder.includes("/forelder/barn"));
    assert.deepEqual(forelder, [...forelder].sort());
    for (const r of forelder) assert.doesNotMatch(r, /[[(]/, `${r} har gruppe- eller param-segment`);

    const admin = finnProduktRuter("admin");
    assert.ok(admin.includes("/admin/spillere"));
    // /admin/agenticos er en ren redirect til /admin/jarvis (MASTERPLAN 15.1) — dekkes av målsiden.
    assert.ok(!admin.includes("/admin/agenticos"));
    assert.ok(finnProduktRuter("portal").includes("/portal"));
  });
  ```
  Kjør: `npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/visual/produkt-ruter.test.ts`
  Forventet: feiler med `Cannot find module '…/tests/visual/produkt-ruter'`.

- [ ] **Steg 2: Rutelista.** Opprett `tests/visual/produkt-ruter.ts`:
  ```ts
  /**
   * Besøkbare produktruter for den nattlige lys/mørk-røyktesten
   * (tests/visual/lys-morkt-royk.spec.ts) — utledet fra src/app ved kjøring,
   * ikke en statisk liste som ruster.
   *
   * Regler (samme som en shell-pipeline over `find src/app -name page.tsx`):
   *  - et «[param]»-segment kan ikke besøkes uten data → hoppes over
   *  - rutegrupper «(legacy)», «(fullscreen)» er usynlige i URL-en → strippes
   *  - en page.tsx som bare kaller redirect() (ingen JSX) dekkes av målsiden
   */
  import { readdirSync, readFileSync } from "node:fs";
  import { join } from "node:path";

  export type Flate = "portal" | "admin" | "forelder";
  export const FLATER: readonly Flate[] = ["portal", "admin", "forelder"];

  /** En page.tsx uten JSX som bare kaller redirect() — målsiden dekker den. */
  export function erRedirectSide(kilde: string): boolean {
    return kilde.includes("redirect(") && !kilde.includes("return (");
  }

  /** «/admin/(legacy)/stall/page.tsx» → «/admin/stall»; et [param]-segment → null. */
  export function tilRute(relativSti: string): string | null {
    const seg = relativSti.replace(/\/page\.tsx$/, "").split("/").filter(Boolean);
    if (seg.some((s) => s.startsWith("["))) return null;
    return "/" + seg.filter((s) => !s.startsWith("(")).join("/");
  }

  function* pageFiler(mappe: string): Generator<string> {
    for (const e of readdirSync(mappe, { withFileTypes: true })) {
      const sti = join(mappe, e.name);
      if (e.isDirectory()) yield* pageFiler(sti);
      else if (e.name === "page.tsx") yield sti;
    }
  }

  /** Besøkbare ruter under src/app/<flate>, sortert. */
  export function finnProduktRuter(flate: Flate, appRot = "src/app"): string[] {
    const ut = new Set<string>();
    for (const fil of pageFiler(join(appRot, flate))) {
      const rute = tilRute(fil.slice(appRot.length));
      if (!rute) continue;
      if (erRedirectSide(readFileSync(fil, "utf8"))) continue;
      ut.add(rute);
    }
    return [...ut].sort();
  }
  ```
  Kjør testen igjen. Forventet: `ℹ pass 3`, `ℹ fail 0`. Tell rutene:
  ```bash
  npx tsx -e 'import { finnProduktRuter } from "./tests/visual/produkt-ruter"; for (const f of ["portal","admin","forelder"] as const) console.log(f, finnProduktRuter(f).length)'
  ```
  Forventet på `c1c3396eb`: `portal 88`, `admin 61`, `forelder 12`.

- [ ] **Steg 3: Spec-en.** Opprett `tests/visual/lys-morkt-royk.spec.ts`:
  ```ts
  /**
   * Nattlig lys/mørk-røyktest over alle produktruter (fase 1, økt 6 i «Komplett
   * designport», 05.09.2026). Kjøres av jobben `nattlig` i
   * .github/workflows/playwright.yml mot PROD — ikke i PR-CI.
   *
   * Per flate (portal/admin/forelder) × tema (lys, mørk) × bredde (390, 1280),
   * innlogget som flatens testbruker, for hver rute fra produkt-ruter.ts:
   *  1. temaet er faktisk satt — html[data-v2-tema="dark"] finnes KUN i mørk
   *     (src/app/layout.tsx setter attributtet, src/lib/v2/tema-default.ts velger)
   *  2. 0 konsollfeil / pageerror (samme støyfilter som kjerne-klikk.spec.ts)
   *  3. ingen horisontal overflyt: scrollWidth <= innerWidth + 1 (som bredde-gate.spec.ts)
   *  4. ingen tekst under 21 px i et kontrastpar som ikke holder i lys modus
   *     (scripts/check-tl-kontrast.mjs → docs/design-audit/train-lock-kontrast.md,
   *     12 brudd 03.09.2026). Åtte blokkerer: signalfarge som tekst på scene/elev
   *     (beslutningen 03.09, «Vei A»). To rapporteres: mute på dock (fasitens
   *     inaktive faner) og dim på scene (skjelett). To er utenfor: on-danger på
   *     danger er hvit tekst på fylt flate, som beslutningen tillater.
   *
   * Alle avvik for én (flate, tema, bredde) samles og rapporteres i ett — testen
   * stopper ikke ved første rute. Krever SCREENTEST_PASSWORD.
   */
  import { test, expect, type Page } from "@playwright/test";
  import { readFileSync } from "node:fs";
  import { config as loadEnv } from "dotenv";
  import { FLATER, finnProduktRuter, type Flate } from "./produkt-ruter";
  import { loggInn } from "../../scripts/lib/train-lock-maal.mjs";

  loadEnv({ path: ".env.local" });

  const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://akgolf-hq.vercel.app";
  const PASSORD = process.env.SCREENTEST_PASSWORD?.trim() ?? "";

  /** Flatens testbruker — alle tre deler SCREENTEST_PASSWORD (scripts/roter-screentest-passord.ts). */
  const BRUKER: Record<Flate, { epost: string; seed: string }> = {
    portal: { epost: "screentest@akgolf.test", seed: "npx tsx scripts/seed-screentest-komplett.ts" },
    admin: { epost: "coachtest@akgolf.test", seed: "npx tsx scripts/seed-screentest-coach.ts" },
    forelder: { epost: "screentest-parent@akgolf.test", seed: "npx tsx scripts/seed-screentest-parent.ts" },
  };
  const TEMAER = ["light", "dark"] as const;
  const BREDDER = [
    { navn: "390", width: 390, height: 844 },
    { navn: "1280", width: 1280, height: 900 },
  ] as const;

  /** Støy som ikke er ekte sidefeil (kjerne-klikk.spec.ts:26–32 + _helpers.ts:36–40). */
  const IGNORERT_KONSOLL = [
    /Content Security Policy.*eval/i,
    /Download the React DevTools/i,
    /\[Fast Refresh\]/i,
    /favicon/i,
    /plausible|vercel insights|speed-insights/i,
    /Failed to load resource/i,
    /manifest/i,
  ];

  /**
   * KJENTE, ÅPNE AVVIK — rute → grunn. Ruten hoppes over i sin helhet. Lista
   * skal krympe, aldri vokse; fjern linjen når ruten er fikset. Fylles fra
   * tørrkjøringen i fase 1 økt 6 (oppgave 6.4).
   */
  const KJENTE_AVVIK: Record<string, string> = {};

  /* Kontrastparene, lest fra tokenfila med samme regex som check-tl-kontrast.mjs:24–35. */
  function lysTokens(): Record<string, string> {
    const css = readFileSync("src/styles/train-lock-tokens.css", "utf8");
    let sisteStart = -1;
    for (const m of css.matchAll(/html\[data-v2-tema="dark"\]\s*\{/g)) sisteStart = m.index;
    const lysDel = sisteStart >= 0 ? css.slice(0, sisteStart) : css;
    const ut: Record<string, string> = {};
    for (const m of lysDel.matchAll(/--tl-([a-z-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) ut[m[1]] ??= m[2];
    return ut;
  }
  function rgb(hex: string): string {
    const n = hex.slice(1);
    return `rgb(${parseInt(n.slice(0, 2), 16)}, ${parseInt(n.slice(2, 4), 16)}, ${parseInt(n.slice(4, 6), 16)})`;
  }
  type Par = { navn: string; tekst: string; flate: string };
  function lagPar(par: readonly (readonly [string, string])[]): Par[] {
    const t = lysTokens();
    return par.map(([tekst, flate]) => ({ navn: `${tekst} på ${flate}`, tekst: rgb(t[tekst]), flate: rgb(t[flate]) }));
  }
  const BLOKKERENDE = lagPar([
    ["danger", "scene"], ["danger", "elev"],
    ["ok", "scene"], ["ok", "elev"],
    ["warn", "scene"], ["warn", "elev"],
    ["viz-target", "scene"], ["viz-target", "elev"],
  ]);
  const RAPPORT = lagPar([["mute", "dock"], ["dim", "scene"]]);

  type Maal = {
    tema: string | null;
    scrollW: number;
    innerW: number;
    treff: { navn: string; tag: string; tekst: string }[];
  };

  /** Kjøres i nettleseren — må være selvstendig (ingen ytre variabler). */
  function maalISiden(par: Par[]): Maal {
    const treff: Maal["treff"] = [];
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      const egenTekst = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? "")
        .join("")
        .trim();
      if (!egenTekst || !el.getClientRects().length) continue;
      const st = getComputedStyle(el);
      if (parseFloat(st.fontSize) >= 21) continue; // stor tekst er unntatt (kontrast.md)
      let bunn = "";
      for (let n: Element | null = el; n; n = n.parentElement) {
        const bg = getComputedStyle(n).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") { bunn = bg; break; }
      }
      const p = par.find((x) => x.tekst === st.color && x.flate === bunn);
      if (p) treff.push({ navn: p.navn, tag: el.tagName.toLowerCase(), tekst: egenTekst.slice(0, 40) });
    }
    return {
      tema: document.documentElement.getAttribute("data-v2-tema"),
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      treff,
    };
  }

  async function laLayoutSetteSeg(page: Page): Promise<void> {
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  }

  for (const flate of FLATER) {
    for (const tema of TEMAER) {
      for (const bredde of BREDDER) {
        test(`${flate} · ${tema} · ${bredde.navn}`, async ({ browser }) => {
          test.skip(!PASSORD, "SCREENTEST_PASSWORD mangler (.env.local lokalt, secret i CI)");
          const ruter = finnProduktRuter(flate).filter((r) => !KJENTE_AVVIK[r]);
          expect(ruter.length, `${flate}: fant ingen page.tsx under src/app/${flate}`).toBeGreaterThan(0);
          const mobil = bredde.width < 700;
          const ctx = await browser.newContext({
            viewport: { width: bredde.width, height: bredde.height },
            isMobile: mobil,
            hasTouch: mobil,
            deviceScaleFactor: 1,
          });
          try {
            await ctx.addCookies([{ name: "ak-v2-tema", value: tema, domain: new URL(BASE).hostname, path: "/" }]);
            await ctx.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
            const ok = await loggInn(ctx, { base: BASE, epost: BRUKER[flate].epost, passord: PASSORD });
            expect(ok, `Innlogging feilet for ${BRUKER[flate].epost} — finnes kontoen i prod? Seed: ${BRUKER[flate].seed}`).toBe(true);

            const page = await ctx.newPage();
            let konsoll: string[] = [];
            page.on("console", (m) => {
              if (m.type() === "error" && !IGNORERT_KONSOLL.some((r) => r.test(m.text()))) konsoll.push(m.text());
            });
            page.on("pageerror", (e) => konsoll.push(`pageerror: ${e.message}`));

            const feil: string[] = [];
            const rapport: string[] = [];
            const par = tema === "light" ? [...BLOKKERENDE, ...RAPPORT] : []; // bruddene er i lys
            const blokkerende = new Set(BLOKKERENDE.map((p) => p.navn));
            for (const rute of ruter) {
              konsoll = [];
              let status = 0;
              try {
                const res = await page.goto(rute, { waitUntil: "load", timeout: 60_000 });
                status = res?.status() ?? 0;
              } catch (e) {
                feil.push(`${rute}: navigasjon feilet — ${(e as Error).message.slice(0, 120)}`);
                continue;
              }
              if (status >= 400) { feil.push(`${rute}: HTTP ${status}`); continue; }
              const landet = new URL(page.url()).pathname;
              if (!landet.startsWith(`/${flate}`)) { feil.push(`${rute}: landet utenfor flaten (${landet})`); continue; }
              await laLayoutSetteSeg(page);
              const m = await page.evaluate(maalISiden, par);
              if ((m.tema === "dark") !== (tema === "dark")) {
                feil.push(`${rute}: tema ikke satt (data-v2-tema=${m.tema ?? "mangler"}, ventet ${tema})`);
              }
              if (m.scrollW > m.innerW + 1) feil.push(`${rute}: horisontal overflyt ${m.scrollW} > ${m.innerW}`);
              for (const t of m.treff) {
                (blokkerende.has(t.navn) ? feil : rapport).push(`${rute}: «${t.tekst}» (${t.tag}) i paret ${t.navn}`);
              }
              if (konsoll.length) feil.push(`${rute}: ${konsoll.length} konsollfeil — ${konsoll[0].slice(0, 160)}`);
            }
            for (const r of rapport) test.info().annotations.push({ type: "kontrast-rapport", description: r });
            test.info().annotations.push({ type: "ruter", description: `${ruter.length} ruter målt` });
            expect(feil, `${flate} · ${tema} · ${bredde.navn} — ${feil.length} avvik:\n${feil.join("\n")}`).toEqual([]);
          } finally {
            await ctx.close();
          }
        });
      }
    }
  }
  ```

- [ ] **Steg 4: Typer og liste.**
  ```bash
  npx tsc --noEmit; echo "tsc=$?"
  npx playwright test -c playwright.nattlig.config.ts --list 2>&1 | grep -c "lys-morkt-royk.spec.ts"
  npm test 2>&1 | grep -E "^ℹ (pass|fail)"
  ```
  Forventet: `tsc=0` uten utskrift · `12` (3 flater × 2 temaer × 2 bredder) · `ℹ fail 0` (pass-tallet er repoets
  totale, ti høyere enn før økten: 7 + 3 nye).

- [ ] **Steg 5: Commit**
  ```bash
  git add tests/visual/produkt-ruter.ts src/lib/__tests__/visual/produkt-ruter.test.ts tests/visual/lys-morkt-royk.spec.ts
  git commit -m "test(visual): lys/mørk-røyktest over alle produktruter — tema, konsoll, overflyt, kontrastpar

  Rutelista utledes fra src/app (161 ruter 06.09: portal 88, admin 61,
  forelder 12; [param]- og rene redirect-sider hoppes over). Åtte kontrastpar
  blokkerer (signalfarge som tekst på scene/elev, beslutning 03.09), mute/dock
  og dim/scene rapporteres, on-danger/danger er tillatt fylt flate.

  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
  ```

---

### Oppgave 6.4: Tørrkjøring mot prod — fra hovedmaskinen — og kjente avvik inn

Den første natten skal ikke være et lotteri. Kjør begge spec-ene lokalt mot prod FØR jobben skrus på, og legg det
som er rødt i dag inn som kjente avvik med grunn (samme mønster som `KJENT_OVERFLYT` i `bredde-gate.spec.ts:33` og
`KJENTE_FEIL` i `kjerne-klikk.spec.ts:41`) — så viser den første natten drift fra i dag, ikke gammel gjeld.

**Filer:**
- Modify: `tests/visual/lys-morkt-royk.spec.ts` (`KJENTE_AVVIK`), evt. `tests/visual/train-lock-pixelnaerhet.spec.ts` (`HOPP_OVER`)

- [ ] **Steg 1: Stå riktig.** `cd ~/Developer/akgolf-hq && git checkout claude/fase1-okt6-nattlig-maaling` (hovedmappa har
  `.env.local`; `grep -c SCREENTEST_PASSWORD .env.local` → `1` — les aldri verdien). Er grenen utsjekket i en worktree,
  nekter git (`fatal: 'claude/fase1-okt6-nattlig-maaling' is already checked out at …`), og `git checkout -t origin/…`
  hjelper ikke — lokalgrenen finnes alt i det delte `.git` (`fatal: a branch named … already exists`). Frigjør den i
  stedet: fra worktreen `git switch --detach` (HEAD blir stående på siste commit, ingenting går tapt), deretter
  `git checkout claude/fase1-okt6-nattlig-maaling` i hovedmappa. `git branch --show-current` →
  `claude/fase1-okt6-nattlig-maaling`. Resten av økten (6.4–6.6) gjøres i hovedmappa.

- [ ] **Steg 2: Datatilstanden radene forutsetter** (alle idempotente, alle kjørt før av samme rigg):
  ```bash
  npx tsx scripts/seed-screentest-coach.ts          # demo-stall for coachtest (S3-03a/b, AG-04)
  npx tsx scripts/seed-ph01-signoff-fixture.ts      # PH-01: økt 09:00–09:50 22.08.2026
  npx tsx scripts/seed-ph21-signoff-fixture.ts      # PH-21a/b: fylt tilstand (IKKE --tom — PH-21c hoppes over om natten)
  npx tsx scripts/seed-screentest-parent.ts         # forelder-testbrukeren (kan mangle etter nullstillingen 30.08)
  ```

- [ ] **Steg 3: Pixelnærhet lokalt.**
  ```bash
  npx playwright test -c playwright.nattlig.config.ts tests/visual/train-lock-pixelnaerhet.spec.ts 2>&1 | tee /tmp/nattlig-pixel.log | tail -30
  ```
  Forventet: 9 passert, 1 hoppet over (PH-21c). Annotasjonen `avvik` per test står i `playwright-report/`
  (`npx playwright show-report`). Skulle en rad ligge over baseline + 2 her — på samme maskin og font som den ble
  kalibrert — er det ekte drift siden kalibreringsdatoen, ikke riggstøy: les diff-bildet i `tests/visual/ut/nattlig/`
  og legg raden i `HOPP_OVER` med hva bildet viser, ikke med «flaky». (PH-07 kan gi 17,26 % i tom uke som i dag;
  økt 3 remåler den i fylt uke.)

- [ ] **Steg 4: Røyktesten lokalt.**
  ```bash
  npx playwright test -c playwright.nattlig.config.ts tests/visual/lys-morkt-royk.spec.ts 2>&1 | tee /tmp/nattlig-royk.log | tail -60
  grep -E "^\s+/(portal|admin|forelder)" /tmp/nattlig-royk.log | sort | uniq -c | sort -rn | head -40
  ```
  Hver feillinje er `rute: hva`. Sorter dem i to bunker:
  1. **Riggfeil** (samme melding på ALLE ruter i en flate — f.eks. «tema ikke satt» overalt, «landet utenfor flaten»
     for hele forelder): rett spec-en, ikke lista. Typisk: forelder-brukeren mangler i prod (→ steg 2), eller
     `page.goto` med `waitUntil: "load"` treffer 60 s på en tung side (→ øk til 90 s i spec-en, commit som egen linje).
  2. **Ekte avvik på enkeltruter** (konsollfeil, overflyt, signalfarge som tekst): legg ruten i `KJENTE_AVVIK` med
     grunnen ordrett fra loggen, f.eks.
     ```ts
     const KJENTE_AVVIK: Record<string, string> = {
       "/portal/meg/abonnement": "Tørrkjøring 06.09: 1 konsollfeil (Hydration mismatch i abonnement-kortet) — egen fiks, ikke riggens jobb.",
     };
     ```
     Ett innslag per rute, aldri en generell unntaksregel. Kjør steg 4 på nytt til `12 passed`.
  Rapport-annotasjonene (`kontrast-rapport`: mute/dock, dim/scene) teller du opp og noterer i PR-teksten — de er
  ikke feil i dag, men Anders skal se tallet (se «Åpne funn»).

- [ ] **Steg 5: Commit**
  ```bash
  git add tests/visual/lys-morkt-royk.spec.ts tests/visual/train-lock-pixelnaerhet.spec.ts
  git commit -m "test(visual): kjente avvik fra første tørrkjøring mot prod (06.09)

  <N> ruter i KJENTE_AVVIK med grunn fra loggen; lista skal krympe. Pixelnærhet:
  9 passert, PH-21c hoppet over.

  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
  ```
  (Bytt `<N>` med tallet. Er lista tom, si det i meldingen — det er også et funn.)

---

### Oppgave 6.5: Schedule-jobben i `playwright.yml` + README + MASTERPLAN

**Filer:**
- Modify: `.github/workflows/playwright.yml:9–17` (`on:`), `:20` (`e2e:` får `if:`), slutten (ny jobb etter linje 76)
- Modify: `tests/visual/README.md` (ny seksjon etter linje 132, slutten av fila)
- Modify: `docs/MASTERPLAN-GJENSTAAENDE.md:164` (setningen «Riggen kjører ikke i CI.»)

- [ ] **Steg 1: `on:`-blokken.** Erstatt linje 9–17 i `.github/workflows/playwright.yml`
  ```yaml
  on:
    push:
      branches: [main]
    workflow_dispatch:
      inputs:
        base_url:
          description: "Base URL å teste mot (default = Vercel prod)"
          required: false
          default: "https://akgolf-hq.vercel.app"
  ```
  med
  ```yaml
  on:
    push:
      branches: [main]
    # Nattlig måling (jobben `nattlig` under, fase 1 økt 6 i designporten 05.09.2026).
    # GitHub cron er alltid UTC: 01:00 UTC = 03:00 Oslo om sommeren (CEST), 02:00 om
    # vinteren (CET). Det er greit — poenget er «etter midnatt, før arbeidsdagen».
    schedule:
      - cron: "0 1 * * *"
    workflow_dispatch:
      inputs:
        base_url:
          description: "Base URL å teste mot (default = Vercel prod)"
          required: false
          default: "https://akgolf-hq.vercel.app"
        nattlig:
          description: "Kjør den nattlige målingen (pixelnærhet + lys/mørk-røyk) i stedet for prod-røyktesten"
          required: false
          type: boolean
          default: false
  ```

- [ ] **Steg 2: `e2e` kjører ikke på schedule.** Etter linje `  e2e:` (nå linje 30) og FØR `    runs-on: ubuntu-latest`, sett inn:
  ```yaml
      # Prod-røyktesten kjører etter push til main og ved manuell kjøring uten
      # `nattlig`-haken. På schedule kjører bare den nattlige jobben under.
      if: github.event_name != 'schedule' && github.event.inputs.nattlig != 'true'
  ```
  (`github.event.inputs` er tom ved push → uttrykket er sant; ved `workflow_dispatch` er haken strengen `'true'`/`'false'`.)

- [ ] **Steg 3: Den nye jobben.** Legg til på slutten av fila (etter linje `          echo "Telegram-varsel sendt."`, siste linje), med ett tomt skille:
  ```yaml

    # Nattlig måling mot prod (tests/visual/README.md §Nattlig kjøring):
    #  - train-lock-pixelnaerhet.spec.ts: alle kalibrerte riggrader mot Train-lock-fasiten
    #  - lys-morkt-royk.spec.ts: hver produktrute i lys+mørk på 390/1280
    # Ikke en PR-gate — den måler den deployede prod-en, som prod-røyktesten over.
    nattlig:
      if: github.event_name == 'schedule' || github.event.inputs.nattlig == 'true'
      runs-on: ubuntu-latest
      timeout-minutes: 60
      env:
        # Dummy DB-URLer så `postinstall: prisma generate` (kjøres av `npm ci`) har dem.
        DATABASE_URL: postgresql://dummy:dummy@localhost:5432/dummy?pgbouncer=true
        DIRECT_URL: postgresql://dummy:dummy@localhost:5432/dummy

      steps:
        - uses: actions/checkout@v4

        - uses: actions/setup-node@v4
          with:
            node-version: "24"
            cache: "npm"

        - name: Install dependencies
          run: npm ci

        - name: Install Playwright browser
          run: npx playwright install chromium --with-deps

        - name: Nattlig måling mot prod (pixelnærhet + lys/mørk-røyk)
          run: npx playwright test -c playwright.nattlig.config.ts
          env:
            CI: "true"
            PLAYWRIGHT_BASE_URL: ${{ github.event.inputs.base_url || 'https://akgolf-hq.vercel.app' }}
            # Samme secret som scripts/roter-screentest-passord.ts setter (finnes siden 26.08.2026).
            SCREENTEST_PASSWORD: ${{ secrets.SCREENTEST_PASSWORD }}
            # Første uke +5 prosentpoeng: fasitene bruker SF Pro, som ikke finnes på
            # Ubuntu-runneren — fasit-rammen rendres med fallbackfont, appen laster
            # Poppins likt begge steder, så baseline fra macOS treffer ikke eksakt.
            # Senkes til "2" etter sju netter med tall (README §Nattlig kjøring).
            PIXEL_TOLERANSE_PP: "5"

        - name: Last opp bilder og rapport
          if: always()
          uses: actions/upload-artifact@v4
          with:
            name: nattlig-maaling
            path: |
              tests/visual/ut/nattlig/
              playwright-report/
            retention-days: 14

        # Samme varsel som prod-røyktesten — en rød natt skal ikke stå uoppdaget.
        - name: Varsle Telegram ved rød nattlig måling
          if: failure()
          continue-on-error: true
          env:
            TELEGRAM_BOT_TOKEN: ${{ secrets.MEG_TELEGRAM_BOT_TOKEN }}
            TELEGRAM_CHAT_ID: ${{ secrets.MEG_TELEGRAM_ALLOWED_CHAT_ID }}
            RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
          run: |
            if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
              echo "::warning::Telegram-secrets mangler (MEG_TELEGRAM_BOT_TOKEN / MEG_TELEGRAM_ALLOWED_CHAT_ID) — ingen varsel sendt."
              exit 0
            fi
            curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
              --data-urlencode chat_id="${TELEGRAM_CHAT_ID}" \
              --data-urlencode text="Den nattlige designmålingen er RØD (akgolf-hq): pixelnærhet eller lys/mørk-røyk. Bilder og rapport ligger som artifact. Kjøring: ${RUN_URL}" \
              > /dev/null
            echo "Telegram-varsel sendt."
  ```
  Sjekk YAML-en uten å kjøre den:
  ```bash
  node -e "const y=require('fs').readFileSync('.github/workflows/playwright.yml','utf8');console.log((y.match(/^  [a-z0-9_-]+:$/gm)||[]).join(' '), '|', (y.match(/^      - name: /gm)||[]).length,'navngitte steg');"
  grep -c $'\t' .github/workflows/playwright.yml
  grep -n "cron:\|nattlig ==\|nattlig !=" .github/workflows/playwright.yml
  ```
  Forventet: `  push:   schedule:   workflow_dispatch:   e2e:   nattlig: | 10 navngitte steg` (regexen treffer
  også `on:`-blokkens barn `push`/`schedule`/`workflow_dispatch`, ikke bare jobbnavnene — 5 gamle navngitte steg +
  5 nye) · `0` tabulatorer · tre treff: `cron: "0 1 * * *"`,
  `if: github.event_name != 'schedule' && github.event.inputs.nattlig != 'true'`, `if: github.event_name == 'schedule' || github.event.inputs.nattlig == 'true'`.
  Har du `actionlint` (`which actionlint` — ikke installert på hovedmaskinen 06.09): kjør
  `actionlint .github/workflows/playwright.yml` → stille. PyYAML finnes (`python3 -c 'import yaml'`), så parse fila:
  ```bash
  python3 -c 'import yaml; d=yaml.safe_load(open(".github/workflows/playwright.yml")); print(list(d["jobs"]), [len(j["steps"]) for j in d["jobs"].values()])'
  ```
  Forventet: `['e2e', 'nattlig'] [7, 7]`. (Blokkene over ble satt sammen til hele fila og parset slik 06.09 —
  gyldig YAML, `e2e.if`/`nattlig.if` og cron som ventet.) `gh workflow run` i 6.6 er den ekte sjekken.

- [ ] **Steg 4: README.** Legg til på slutten av `tests/visual/README.md` (etter linje 132, ett tomt skille). Er økt 4 merget
  først, ligger «Gyldighetssjekk før måling» og «Panel-modus» der alt — legg denne ETTER dem, som siste seksjon:
  ```md

  ## Nattlig kjøring (fase 1, økt 6 — 06.09.2026)

  Riggen kjører hver natt mot prod fra `.github/workflows/playwright.yml`, jobben
  `nattlig` (cron `0 1 * * *` UTC = 03:00 Oslo om sommeren, 02:00 om vinteren).
  Den er IKKE en PR-gate — den måler den deployede prod-en, ikke koden i en PR
  (samme grunn som prod-røyktesten, se toppen av `playwright.yml`). Manuelt:
  Actions → «Playwright E2E (prod-røyktest)» → Run workflow → huk av `nattlig`.

  To spec-er, egen konfig `playwright.nattlig.config.ts` (ikke et prosjekt i
  `playwright.config.ts`, ellers hadde `npx playwright test` etter hver push dratt
  med seg 20+ minutter måling):

  - `train-lock-pixelnaerhet.spec.ts` — én test per rad med `status: "kalibrert"`
    i `skjerm-mapping.ts`, samme motor som CLI-en (`scripts/lib/train-lock-maal.mjs`).
    Feiler når målt avvik > `kalibrertAvvikPst` + `PIXEL_TOLERANSE_PP` (default 2;
    jobben setter 5 første uke, se under). Rader som ikke kan måles om natten står
    i `HOPP_OVER` i spec-en med grunn (i dag PH-21c: samme rute som PH-21a/b i en
    annen datatilstand, `--tom`). CI seeder ingenting — datatilstanden er radenes
    `seedScript`, kjørt fra hovedmaskinen.
  - `lys-morkt-royk.spec.ts` — hver rute under `/portal`, `/admin`, `/forelder`
    (utledet fra `src/app` ved kjøring, `produkt-ruter.ts`; `[param]`- og rene
    redirect-sider hoppes over), lys og mørk, 390 og 1280, innlogget som
    screentest / coachtest / screentest-parent: tema faktisk satt, 0 konsollfeil,
    ingen horisontal overflyt, ingen tekst under 21 px i et blokkerende kontrastpar.
    Kontrastparene er de 12 bruddene i `docs/design-audit/train-lock-kontrast.md`:
    åtte blokkerer (`danger`/`ok`/`warn`/`viz-target` på `scene`/`elev` — Vei A,
    03.09), to rapporteres uten å feile (`mute` på `dock` er fasitens inaktive
    faner, `dim` på `scene` er skjelett), to er utenfor (`on-danger` på `danger`
    er hvit tekst på fylt flate, tillatt). Kjente avvik per rute står i
    `KJENTE_AVVIK` med grunn — lista skal krympe.

  Kjøre lokalt (krever `.env.local` med `SCREENTEST_PASSWORD` — hovedmaskinen,
  aldri kopiert inn i en worktree):

  ```bash
  npm run nattlig                                                                   # begge spec-ene mot prod
  npx playwright test -c playwright.nattlig.config.ts tests/visual/lys-morkt-royk.spec.ts -g "portal · light · 390"
  PIXEL_TOLERANSE_PP=5 npx playwright test -c playwright.nattlig.config.ts tests/visual/train-lock-pixelnaerhet.spec.ts
  ```

  Bildene havner i `tests/visual/ut/nattlig/` (gitignorert); i CI lastes de opp
  som artifact `nattlig-maaling` sammen med `playwright-report/`.

  **Terskelen er +5 pp første uke, deretter +2.** Fasitene bruker
  `-apple-system … "SF Pro Display"` — på Ubuntu-runneren finnes ingen av dem, så
  fasit-rammen rendres med Linux-fallbackfont, mens appen laster Poppins likt
  begge steder. Baseline-tallene i `skjerm-mapping.ts` er målt på macOS og
  treffer derfor ikke eksakt i CI. Etter sju netter (annotasjonen `avvik` per rad
  i rapporten) senkes `PIXEL_TOLERANSE_PP` til 2 i `playwright.yml` — eller raden
  får egen CI-baseline hvis gapet er systematisk. Ikke stram før tallene finnes.
  ```
  `node scripts/check-doc-lenker.mjs` → `OK` (README-en er ikke i `LEVENDE_KILDER`, men MASTERPLAN under er).

- [ ] **Steg 5: MASTERPLAN 2.1.** På linje 164 i `docs/MASTERPLAN-GJENSTAAENDE.md` står setningen
  `Riggen kjører ikke i CI.` (mellom «… mot pensjonert AgenticOS-rail).» og «De øvrige ~140 skjermene …»). Erstatt
  nøyaktig den setningen med:
  ```
  Riggen kjører nattlig mot prod fra 06.09.2026 (`playwright.yml`, jobb `nattlig`: `tests/visual/train-lock-pixelnaerhet.spec.ts` + `lys-morkt-royk.spec.ts`, fase 1 økt 6).
  ```
  (Bytt datoen til dagen jobben faktisk skrus på.) Bekreft: `grep -c "Riggen kjører ikke i CI" docs/MASTERPLAN-GJENSTAAENDE.md` → `0`,
  `grep -c "jobb \`nattlig\`" docs/MASTERPLAN-GJENSTAAENDE.md` → `1`. `node scripts/check-doc-lenker.mjs` → `OK`.

- [ ] **Steg 6: Commit**
  ```bash
  git add .github/workflows/playwright.yml tests/visual/README.md docs/MASTERPLAN-GJENSTAAENDE.md
  git commit -m "ci(playwright): nattlig jobb — pixelnærhet + lys/mørk-røyk mot prod kl. 01:00 UTC

  Egen jobb på schedule (og manuelt med nattlig-haken); prod-røyktesten e2e er
  uendret og hopper over schedule. SCREENTEST_PASSWORD-secreten finnes fra før.
  Toleranse +5 pp første uke (SF Pro finnes ikke på runneren), deretter +2.
  Artifact med bilder + rapport, Telegram ved rødt. README og MASTERPLAN 2.1.

  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
  ```

---

### Oppgave 6.6: Verify, PR, første kjøring i CI, merge

**Filer:** ingen nye. Modify: `docs/feillogg.md` (én linje, øktslutt).

- [ ] **Steg 1: Full gate** (fra hovedmappa, der `.env.local` finnes — `verify` kjører `prisma generate` og `next build`):
  ```bash
  npm run verify > /tmp/verify-okt6.log 2>&1; echo "verify=$?"; tail -15 /tmp/verify-okt6.log
  npm test 2>&1 | grep -E "^ℹ (pass|fail)"
  ```
  Forventet: `verify=0` · `ℹ fail 0`. Rødt? Fiks først — aldri push noe rødt.

- [ ] **Steg 2: Push, PR.**
  ```bash
  git push -u origin claude/fase1-okt6-nattlig-maaling
  gh pr create --base main --title "ci(designport): nattlig måling + lys/mørk-røyktest mot prod (fase 1, økt 6)" --body "$(cat <<'PRTEKST'
  ## Hva
  - `scripts/lib/train-lock-maal.mjs`: målemotoren ut av CLI-en (samme metode, samme utskrift, økt 4 sin panel-modus). CLI-en er et tynt skall.
  - `tests/visual/train-lock-pixelnaerhet.spec.ts`: én test per kalibrert riggrad, feiler over `kalibrertAvvikPst` + `PIXEL_TOLERANSE_PP`.
  - `tests/visual/lys-morkt-royk.spec.ts` + `produkt-ruter.ts`: 161 produktruter × lys/mørk × 390/1280 — tema, konsoll, overflyt, 8 blokkerende kontrastpar (2 rapporteres, 2 tillatt).
  - `playwright.nattlig.config.ts` + `npm run nattlig`; `playwright.yml` får jobben `nattlig` på cron `0 1 * * *` (+ manuell hake). Prod-røyktesten er uendret.
  - README §Nattlig kjøring, MASTERPLAN 2.1.

  ## Tørrkjøring mot prod (06.09, hovedmaskin)
  - Pixelnærhet: 9 passert, PH-21c hoppet over (annen datatilstand).
  - Røyktest: 12/12 grønne etter <N> ruter i `KJENTE_AVVIK` (listet i spec-en med grunn). Rapport-par (mute/dock, dim/scene): <M> treff — ikke feil, se Åpne funn i økt-planen.

  ## Sjekkliste
  - [x] `npm run verify` grønn, `npm test` grønn, ingen nye avhengigheter, ingen nye tokens
  - [x] `SCREENTEST_PASSWORD` finnes som secret (26.08.2026) — ingen ny secret
  - [ ] Første CI-kjøring grønn (manuell `nattlig=true`, lenke under)

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  PRTEKST
  )"
  ```
  (Bytt `<N>`/`<M>` med tallene fra 6.4.)

- [ ] **Steg 3: Første kjøring i CI — fra grenen, før merge.** `workflow_dispatch` kan kjøre workflow-fila slik den ligger på grenen:
  ```bash
  gh workflow run playwright.yml --ref claude/fase1-okt6-nattlig-maaling -f nattlig=true
  sleep 60; gh run list --workflow=playwright.yml --branch claude/fase1-okt6-nattlig-maaling -L 1
  ```
  Følg med: `gh run watch <run-id> --exit-status` (kan ta 20–40 min). Forventet: jobben `e2e` `skipped`, jobben `nattlig`
  `success`, artifact `nattlig-maaling` lastet opp (`gh run view <run-id>` viser den).
  **Rød på pixelnærhet i CI men grønn lokalt = font-gapet** (README-avsnittet over): les annotasjonene `avvik` i
  rapport-artifacten, noter tallene per rad i PR-teksten. Ligger en rad over +5 pp, hev IKKE toleransen mer — legg raden
  i `HOPP_OVER` med det målte CI-tallet som grunn («CI-baseline 19,4 % mot macOS 11,07 % — egen CI-baseline avgjøres etter
  sju netter»), commit, push, kjør steg 3 på nytt. Rød på røyktesten i CI men grønn lokalt = nesten alltid nettverk/timeout
  (60 s på `goto`): les hvilken rute, og behandle som i 6.4 steg 4.
  Status: `gh pr checks <pr-nr>` eller `gh run view <run-id>`. Har økten GitHub-MCP, bruk `pull_request_read` med
  `get_status` — aldri `actions_list` (gotchas.md §GitHub PR-overvåking).

- [ ] **Steg 4: Merge og rydd.** `main` har ingen branch protection (`gh api …/branches/main/protection` → 404 06.09),
  så `gh pr merge` går gjennom selv om `verify` i `ci.yml` er rød — vent på grønt først:
  ```bash
  gh pr checks --watch --fail-fast
  gh pr merge --squash --delete-branch
  git checkout main && git pull --ff-only origin main
  git log --oneline -1
  ```
  Forventet: toppen av `main` er squash-commiten med tittelen fra steg 2.

- [ ] **Steg 5: Øktslutt.** Legg én linje NEDERST i `docs/feillogg.md` (fila har to formater: pipe-rader øverst fra
  før 20.08, og siden 20.08 punktlinjer `- <dato> (<økt>): …` som legges til sist), f.eks.
  `- 2026-09-06 (fase 1 økt 6): ren økt` — eller hva som kostet tid (typisk: forelder-brukeren manglet i prod; CI-font-gapet var større enn +5 for én rad).
  ```bash
  git checkout -b claude/fase1-okt6-feillogg origin/main
  git add docs/feillogg.md && git commit -m "docs(feillogg): retro fase 1 økt 6" && git push -u origin HEAD
  gh pr create --fill --base main && gh pr checks --watch --fail-fast && gh pr merge --squash --delete-branch
  ```

---

### Ferdig når (målbart, med kommando)

1. `ls tests/visual/` → `README.md lys-morkt-royk.spec.ts produkt-ruter.ts skjerm-mapping.ts train-lock-pixelnaerhet.spec.ts`
   (+ `ut/` lokalt), `ls scripts/lib/train-lock-maal.mjs playwright.nattlig.config.ts` → begge finnes.
2. `npx playwright test -c playwright.nattlig.config.ts --list 2>&1 | grep -cE "(pixelnaerhet|lys-morkt-royk)\.spec\.ts"` → `22` (10 + 12).
3. `npm test 2>&1 | grep -E "^ℹ fail"` → `ℹ fail 0`, og `npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/visual/train-lock-maal.test.ts src/lib/__tests__/visual/produkt-ruter.test.ts 2>&1 | grep -E "^ℹ pass"` → `ℹ pass 10`.
4. CLI-en virker som før (hovedmaskin): `npm run signoff:train-lock -- "PH-01 I dag" "/portal" dark 54` skriver `avvik: …/… px = N.NN%`
   og fire linjer i samme format som før (`fasit:`/`app:`/`diff:`/`avvik:`).
5. `npm run nattlig` mot prod fra hovedmaskinen: `9 passed, 1 skipped` for pixelnærhet og `12 passed` for røyktesten.
6. `gh run list --workflow=playwright.yml -L 3` viser én `workflow_dispatch`-kjøring med `nattlig` `success` og `e2e` `skipped`;
   morgenen etter merge: én kjøring med event `schedule` (`gh run list --workflow=playwright.yml --event schedule -L 1`).
7. `grep -c "Riggen kjører ikke i CI" docs/MASTERPLAN-GJENSTAAENDE.md` → `0`; `grep -c "Nattlig kjøring" tests/visual/README.md` → `1`.
8. `git log origin/main --oneline -1` viser PR-en merget; `git fetch --prune origin && git branch -r | grep -c okt6-nattlig` → `0`.
9. `npm run verify` grønn på `main` etter merge (CI-jobben `verify` i `ci.yml` på merge-commiten er grønn).

### Åpne funn (ting økten så, men ikke løser)

1. **S3-03a/b har plassholder i ruten** (`tests/visual/skjerm-mapping.ts:180`/`:191`: `/admin/spillere/<spillerId>`).
   Spec-en løser den som «første spillerlenke i stallen» — samme som målingen 05.09 (#787), men stallen er sortert etter
   tilstand (bolkene «Trenger deg nå»/«Følger planen»), så første rad kan bytte spiller mellom netter. Raden trenger et
   stabilt oppslag (demo-spillerens e-post fra `seed-screentest-coach.ts`) — et felt økt 4 sine (`fasitDato`/`viewport`/`selector`) ikke dekker.
2. **PH-21c og PH-21a/b utelukker hverandre** på samme rute (seed med/uten `--tom`). Løst midlertidig med `HOPP_OVER` i spec-en;
   ordentlig løsning er et rad-felt (`nattlig: false` eller `tilstand`) i `skjerm-mapping.ts`. Samme klasse som funn 1.
3. **Fasitene rendres med feil font i CI.** `designsystem/train-lock/*.dc.html` bruker `-apple-system … "SF Pro Display"`
   (`grep -o "font-family:[^;]*" "designsystem/train-lock/PH-01 I dag.dc.html"`); Ubuntu har ingen av dem. Baseline i
   `kalibrertAvvikPst` er macOS-tall. Etter sju netter: enten senk toleransen til 2 (hvis gapet er lite) eller legg en
   `ciAvvikPst`-kolonne per rad. Ikke bestem nå.
4. **`mute` på `dock` er fasitens egne inaktive faneetiketter** (`shell.tsx:1151` + `:396`, 4,2:1 mot krav 4,5:1) og står i
   de 12 bruddene. Beslutningen 03.09 sier «aldri som ren tekst på hvit/nøytral bunn» — tatt bokstavelig gjør det hver
   mobilside i lys modus til et brudd. Røyktesten rapporterer, feiler ikke. Anders må si om inaktive faneetiketter er unntak
   (→ beslutningskøen), eller om fasiten skal endres (→ ikke uten hans ja, invariant 2).
5. **MASTERPLAN 2.1 og økt 7:** økt 7 sin plan (`docs/superpowers/plans/2026-09-05-designport-fase-1-okt-7.md:461`) skriver
   2.1 på nytt med setningen «Riggen kjører ikke i CI (nattlig kjøring er fase 1 økt 6 …)». Kjøres økt 7 ETTER økt 6, må den
   setningen byttes med teksten fra 6.5 steg 5 — ellers lyver 2.1 igjen samme dag.
6. **`screentest-parent@akgolf.test` kan mangle i prod** etter nullstillingen 30.08 (kun Anders, Markus og screentest ble
   beholdt; coachtest er seedet på nytt siden — 05.09 målte S3-03 med den). 6.4 steg 2 seeder forelderen; verifiser at
   `/forelder` faktisk rendrer som PARENT før første natt.
7. **Datoavhengighet uten frys:** TM-04a («i vindu i dag») og PH-07 (`getDashboardData`/`getWeekOverview` leser rå
   `new Date()`) driver med kalenderen. Økt 3 kobler `hentEffektivNaa()` gjennom `actions.ts`; til det er inne kan
   TM-04a krype over baseline + 2 om noen uker. Ikke løst her — det er økt 3 sin leveranse.
8. **`scripts/train-lock-fasit-ramme.mjs`** (linje 13–20) gjør det samme som `taFasitBilde` i den nye modulen. Kunne importert
   fra modulen; ikke rørt (kirurgisk endring — den er ikke i denne øktens kjede).
9. **`tests/e2e/README.md:88–92` §CI** sier fortsatt «Kjøres på push + PR til main» — feil siden 26.07 (`playwright.yml:3–8`),
   og nevner ikke den nattlige jobben. Docs-rettelse, hører til økt 8 (dokumenter) eller en egen linje.
10. **Cron-tidspunktet driver med sommertid** (03:00 Oslo sommer, 02:00 vinter). Bestillingen sa «03:00 Oslo = 0 1 * * * UTC»;
    det stemmer bare april–oktober. Harmløst, men sagt i kommentaren i YAML-en.
11. **Secreten `SCREENTEST_PASSWORD` finnes (26.08.2026), men ingen workflow refererer den før denne økten.**
    «Komplett designport» §4 pkt. 6 sier allerede «finnes allerede siden 26.08.2026» — plandokumentet trenger ingen
    rettelse. Første ekte test av at secret-VERDIEN stemmer med prod-brukerne er 6.6 steg 3: roteres passordet uten
    at `roter-screentest-passord.ts` kjøres, blir natten rød på innlogging, ikke på design.
