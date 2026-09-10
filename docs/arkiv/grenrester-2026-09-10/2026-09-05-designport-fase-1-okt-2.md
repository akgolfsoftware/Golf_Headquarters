# Historisk grenrest – 10.09.2026

Bevart fra `park/2026-09-08-opprydding`, commit `e4356c368`. Main fjernet denne planrekken som fullført i PR #812. Dette er historikk, ikke aktive arbeidsordrer eller gjeldende designvalg.

---

# Fase 1 · Økt 2 — 19.7 TallHero slutter å telle + 19.6-regelen inn i dokumentene

**Mål:** `TallHero` (`src/components/v2/core.tsx`) viser målt tall fra første ramme uten
`useCountUp`-opptelling (STEG 19.7, Anders 03.09.2026). Vei A-regelen for signalfarger (STEG 19.6)
skrives inn i `.claude/rules/gotchas.md` og `designsystem/train-lock/README.md`. MASTERPLAN og
STATUS-NÅ slutter å si at 19.7 er «strandet». Ingen `--tl-*`-verdi endres, ingen nye tokens,
`KpiFlis`/`MegV2`/`WorkbenchV2` røres ikke.

**Forutsetninger:**
- Dagens dato 2026-09-06. `origin/main` = `c1c3396eb` (PR #787, #788 og #789 er alle MERGET —
  #789 06.09 09:24 UTC; verifisert med `gh pr view 789 --json state`). Ingen av dem leverer noe av
  det denne økta gjør (`gh pr view 787 --json files` osv.: rigg/skjermbilder + `feillogg.md` (#787),
  `WorkbenchV2*.tsx` (#788), Min kurve (#789)). Alle tre rører `docs/MASTERPLAN-GJENSTAAENDE.md` —
  det ligger allerede i `c1c3396eb`, så grenen som starter der har ingen konflikt.
- **Jobb aldri i hovedmappa `~/Developer/akgolf-hq`.** Den står på den lokale grenen
  `feat/steg-19-6-19-7-kontrast-tallhero` med 151 ukommitterte filer (beslutningskø 30, «Trenger
  Anders»). Et `git checkout` der ødelegger en annen økts arbeid. Bruk et worktree under
  `.claude/worktrees/` (Claude Codes `EnterWorktree`-verktøy, navn `fase1-okt-2`; hooken
  `.claude/hooks/env-lenke.mjs` lenker inn miljøet — den er en SessionStart-hook
  (`.claude/settings.json:30–35`), så ligger ingen `.env.local`-lenke i worktreet etter
  EnterWorktree, gjelder dummy-verdiene under. Kopier ALDRI `.env*` selv).
- I worktreet: `git fetch origin && git checkout -b fase1/okt-2-tallhero-direkte origin/main`
  (grennavnet er ledig — `git ls-remote --heads origin 'fase1/*'` gir tomt), deretter
  `npm ci > "${TMPDIR:-/tmp}/npmci.log" 2>&1 && npx prisma generate` (worktrees deler ikke
  `node_modules`; uten dette feiler `check-critical-imports.mjs` i verify med «BUNDLE FAIL»).
  Klager `prisma generate` på `DIRECT_URL`, mangler miljølenken: sett dummy-verdier KUN i skallet
  (`export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=$DIRECT_URL`),
  aldri i en fil (gotchas.md §Aldri kopier .env* inn i en worktree).
- Repoet er offentlig. Aldri `git add -A` — stage navngitte filer. Norsk bokmål i kode-kommentarer.
- Planen er skrevet og sjekket 06.09 (skeptiker-gjennomgang 06.–07.09). Kjøres økta en annen dag, bytt
  alle «06.09»-datoene i tekstene som skrives inn i 2.5 (MASTERPLAN, STATUS-NÅ, commit-melding) til den
  faktiske datoen — de er leveransedatoer, ikke sitater.

**Vurdering av den strandede commiten `58782d944`** (lest med `git show 58782d944`; objektlageret er
delt, så den er lesbar fra alle worktrees): 27 linjer i tre filer — `gotchas.md` (+19),
`core.tsx` (−3/+2: importerer ny `fmtTall` fra hooks og bruker den i TallHero), `hooks.ts` (+6: ny
`export function fmtTall`). **Mekanisk ville den gått rent inn** — `git diff --stat 335d5297b
origin/main -- src/components/v2/core.tsx src/lib/v2/hooks.ts .claude/rules/gotchas.md` er tom
(ingen av de tre filene er endret siden commitens forelder). **Men den skal IKKE cherry-pickes:**
`core.tsx:31` re-eksporterer allerede en ANNEN `fmtTall` fra `@/lib/v2/format` (`src/lib/v2/format.ts:20`
— returnerer `String(v)`, ingen komma/fortegn). Commiten ville gitt to funksjoner med samme navn i
samme fil (kompilerer, fordi re-eksport ikke lager lokal binding — men en felle for neste leser).
Derfor: **manuell reimplementering med nytt navn `fmtSluttverdi`**, samme innhold, og gotchas-teksten
hentes ordrett fra commiten. Ingen `git cherry-pick` i denne økta.

**Testoppsettet, verifisert 06.09:** repoet bruker IKKE vitest — `npm test` er
`tsx --conditions=react-server --experimental-test-module-mocks --test 'src/**/*.test.ts'`
(`package.json:30`, node:test). Ingen `@testing-library/react`, ingen jsdom. Under
`--conditions=react-server` er `react-dom/server` blokkert («react-dom/server is not supported in
React Server Components») og `useState` er `undefined`. Derfor: render-testen for TallHero legges
UTENFOR `src/` (`tests/komponenter/`) og kjøres med et eget npm-script uten den betingelsen.
`tests/komponenter/` fanges ikke av Playwright (`playwright.config.ts:8–9`: `testDir: "tests/e2e"`,
`testMatch: ["*.spec.ts"]`), lintes ikke (`eslint.config.mjs:36`: `files: ["src/**/*.{ts,tsx}"]`),
men typesjekkes av `tsc --noEmit` (tsconfig `include: ["**/*.ts", …]`). Målt i dag med
`renderToStaticMarkup(createElement(TallHero, { label: "Snitt", value: 42, unit: "slag" }))`:
`<span …>0</span>` — tellingen starter på 0 også ved server-render. Det er det testen skal fange.

---

### Oppgave 2.1: Gren, verktøy og nullpunkt

**Filer:** ingen endres.
**Grensesnitt:** grenen `fase1/okt-2-tallhero-direkte` fra `origin/main`; `node_modules` + Prisma-klient på plass.

- [ ] **Steg 1: Opprett worktree og gren.** `EnterWorktree` (navn `fase1-okt-2`), deretter i worktreet:
  ```bash
  git fetch origin && git checkout -b fase1/okt-2-tallhero-direkte origin/main
  git branch --show-current            # → fase1/okt-2-tallhero-direkte
  git rev-parse --short origin/main    # → c1c3396eb (eller nyere — da: les MASTERPLAN-radene på nytt i 2.5)
  ```
- [ ] **Steg 2: Installer.**
  ```bash
  npm ci > "${TMPDIR:-/tmp}/npmci.log" 2>&1; echo exit=$?     # → exit=0
  npx prisma generate | tail -2                                # → «Generated Prisma Client …»
  ```
- [ ] **Steg 3: Mål nullpunktet (skal stemme før du endrer noe).**
  ```bash
  grep -n "useCountUp(" src/components/v2/core.tsx
  # → 284:  const shown = useCountUp(tom ? 0 : (value as number | string));
  # → 332:  const animert = useCountUp(tom ? 0 : (value as number | string));
  grep -n "fmtTall\|fmtSluttverdi" src/lib/v2/hooks.ts; echo exit=$?    # → exit=1 (finnes ikke)
  grep -rl "TallHero" src --include='*.tsx' | wc -l                       # → 13 (beslutningens «13 bruksfiler»)
  npm test 2>&1 | tail -4                                                 # → alle grønne (nullpunkt før nye tester)
  ```
  Stemmer ikke tallene, stopp: da har `origin/main` beveget seg i disse filene — les diffen
  (`git log --oneline -3 origin/main -- src/components/v2/core.tsx src/lib/v2/hooks.ts`) før du fortsetter.

### Oppgave 2.2: Test først — render-test og formattest (rød)

**Filer:**
- Modify: `package.json:30` (scriptet `test`) + ny linje 31 (`test:komponenter`)
- Create: `tests/komponenter/tall-hero.test.ts`
- Create: `src/lib/__tests__/v2-hooks-fmt.test.ts`

**Grensesnitt:** `npm run test:komponenter` (render-tester uten react-server-betingelsen, kjedet inn i
`npm test` slik at CI-steget «Unit tests (node:test + tsx)» i `.github/workflows/ci.yml:55–56` kjører dem);
`fmtSluttverdi(value: number | string): string` fra `@/lib/v2/hooks` (implementeres i 2.3).

- [ ] **Steg 1: To linjer i `package.json`.** Linje 30 er i dag
  `    "test": "tsx --conditions=react-server --experimental-test-module-mocks --test 'src/**/*.test.ts'",`.
  Erstatt linje 30 og legg til linje 31 (dagens linje 31, `"test:e2e"`, skyves til 32):
  ```json
      "test": "tsx --conditions=react-server --experimental-test-module-mocks --test 'src/**/*.test.ts' && npm run test:komponenter",
      "test:komponenter": "tsx --test 'tests/komponenter/*.test.ts'",
  ```
  Verifiser: `node -e 'const s=require("./package.json").scripts;console.log(s.test);console.log(s["test:komponenter"])'`
  → begge linjene over.
- [ ] **Steg 2: Render-testen.** Opprett `tests/komponenter/tall-hero.test.ts` (mappen finnes ikke fra før —
  `ls tests` gir kun `e2e` og `visual`):
  ```ts
  /**
   * TallHero viser målt tall direkte — ingen opptelling fra 0 (STEG 19.7, Anders 03.09.2026,
   * `.claude/rules/beslutninger.md` §KONTRAST-REGEL I STEDET FOR NY FASIT + TALLHERO SLUTTER Å TELLE).
   *
   * Ligger utenfor `src/` med vilje: `npm test` kjører med `--conditions=react-server`, og der er
   * `react-dom/server` ikke tilgjengelig. Kjøres av `npm run test:komponenter` (uten den betingelsen).
   */
  import { test } from "node:test";
  import assert from "node:assert/strict";
  import { createElement } from "react";
  import { renderToStaticMarkup } from "react-dom/server";
  import { TallHero } from "@/components/v2/core";

  function render(value: number | string | null): string {
    return renderToStaticMarkup(createElement(TallHero, { label: "Snitt", value, unit: "slag" }));
  }

  test("TallHero viser 42 fra første ramme, ikke 0", () => {
    const html = render(42);
    assert.ok(html.includes(">42<"), `forventet >42< i: ${html}`);
    assert.ok(!html.includes(">0<"), `fant tellingens startverdi 0 i: ${html}`);
  });

  test("TallHero beholder komma-desimal og fortegn fra streng-verdi", () => {
    assert.ok(render("+2,1").includes(">+2,1<"));
    assert.ok(render("-1.5").includes(">−1,5<"));
  });

  test("TallHero viser em-dash for tom verdi", () => {
    assert.ok(render(null).includes(">—<"));
  });
  ```
  Kjør: `npm run test:komponenter 2>&1 | tail -12` → **rød**: første test feiler med
  `fant tellingens startverdi 0 i: <div>…<span …>0</span><span …>slag</span>…`, andre test feiler
  (tellingen starter på `>0,0<` for begge strengene), tredje er grønn (em-dash-veien er uendret).
  Summen skal være `fail 2`.
- [ ] **Steg 3: Formattesten (ren funksjon, kjører under `npm test`).** Opprett
  `src/lib/__tests__/v2-hooks-fmt.test.ts`:
  ```ts
  /**
   * fmtSluttverdi (src/lib/v2/hooks.ts) — samme sluttformat som useCountUp viser når tellingen
   * er ferdig: komma-desimal, unicode-minus, «+» kun når kilden har det. STEG 19.7.
   */
  import { test } from "node:test";
  import assert from "node:assert/strict";
  import { fmtSluttverdi } from "@/lib/v2/hooks";

  test("heltall og ikke-numeriske strenger passerer uendret", () => {
    assert.equal(fmtSluttverdi(42), "42");
    assert.equal(fmtSluttverdi("68%"), "68%");
    assert.equal(fmtSluttverdi("…"), "…");
  });

  test("desimaler beholder kildens antall og skrives med komma", () => {
    assert.equal(fmtSluttverdi("1.25"), "1,25");
    assert.equal(fmtSluttverdi("0,5"), "0,5");
  });

  test("fortegn: unicode-minus alltid, pluss kun når kilden har det", () => {
    assert.equal(fmtSluttverdi("-1.5"), "−1,5");
    assert.equal(fmtSluttverdi("+2,1"), "+2,1");
    assert.equal(fmtSluttverdi(-3), "−3");
  });
  ```
  Kjør: `npx tsx --conditions=react-server --test src/lib/__tests__/v2-hooks-fmt.test.ts 2>&1 | tail -8`
  → **rød**: `TypeError: … fmtSluttverdi is not a function` i alle tre (funksjonen finnes ikke ennå).
  (Forventede verdier er regnet ut 06.09 med `parseNum`/`fmtLike` kopiert ordrett fra `hooks.ts:28–46`.)
- [ ] **Ingen commit ennå** — verify skal være grønn før kode committes, og testene er røde med vilje.

### Oppgave 2.3: `fmtSluttverdi` + TallHero uten telling (grønn), commit

**Filer:**
- Modify: `src/lib/v2/hooks.ts` — ny eksportert funksjon etter linje 47 (tom linje etter `fmtLike`)
- Modify: `src/components/v2/core.tsx:24` (import) og `:283–285` (TallHero)
- Test: `tests/komponenter/tall-hero.test.ts`, `src/lib/__tests__/v2-hooks-fmt.test.ts`

**Grensesnitt:** `export function fmtSluttverdi(value: number | string): string` i `@/lib/v2/hooks`.
`useCountUp`, `useMount`, `EASE`, `reduced` uendret. `TallHeroProps` uendret — ingen av de 13 bruksfilene
trenger endring.

- [ ] **Steg 1: `hooks.ts`.** Linje 41–47 er i dag:
  ```ts
  /** Formaterer et tall som kilde-verdien (samme antall desimaler, komma, fortegn). */
  function fmtLike(n: number, m: Extract<NumMeta, { ok: true }>): string {
    const s = Math.abs(n).toFixed(m.dec).replace(".", ",");
    const sign = n < 0 ? "−" : m.signed && n > 0 ? "+" : "";
    return sign + s;
  }

  ```
  Sett inn rett etter linje 47 (den tomme linjen), FØR docblokken `/**\n * useCountUp: …` (i dag linje 48):
  ```ts
  /**
   * fmtSluttverdi: samme format som useCountUp viser NÅR tellingen er ferdig (komma-desimal,
   * unicode-minus, «+» kun når kilden har det) — men uten telling. Brukes der målte tall skal
   * stå som fakta fra første ramme (TallHero, STEG 19.7 — Anders 03.09.2026).
   */
  export function fmtSluttverdi(value: number | string): string {
    const m = parseNum(value);
    return m.ok ? fmtLike(m.n, m) : String(value);
  }

  ```
  Verifiser: `grep -n "^export function" src/lib/v2/hooks.ts` → `reduced`, `fmtSluttverdi`, `useCountUp`, `useMount`.
- [ ] **Steg 2: `core.tsx` import.** Linje 24 er
  `import { useCountUp, useMount, EASE, reduced } from "@/lib/v2/hooks";` → erstatt med
  ```ts
  import { useCountUp, useMount, EASE, reduced, fmtSluttverdi } from "@/lib/v2/hooks";
  ```
  (`useCountUp` beholdes i importen — `KpiFlis` på linje 332 bruker den fortsatt, og linje 32 re-eksporterer den.)
- [ ] **Steg 3: `core.tsx` TallHero.** Linje 283–285 er i dag:
  ```ts
    const tom = value === null || value === undefined || value === "";
    const shown = useCountUp(tom ? 0 : (value as number | string));
    const display = tom ? TOM_TALL : shown;
  ```
  Erstatt med (tre linjer → tre linjer, så `KpiFlis` blir stående på :332):
  ```ts
    const tom = value === null || value === undefined || value === "";
    // Målt tall er et faktum — vises fra første ramme, ingen opptelling (Anders 03.09.2026, STEG 19.7).
    const display = tom ? TOM_TALL : fmtSluttverdi(value as number | string);
  ```
  Verifiser:
  ```bash
  grep -n "useCountUp(" src/components/v2/core.tsx     # → KUN 332:  const animert = useCountUp(…)
  grep -c "useCountUp" src/components/v2/core.tsx      # → 4 (linje 7 kommentar, 24 import, 32 re-eksport, 332 KpiFlis)
  sed -n '330,333p' src/components/v2/core.tsx         # → KpiFlis uendret, useCountUp fortsatt der
  ```
- [ ] **Steg 4: Grønt.**
  ```bash
  npm run test:komponenter 2>&1 | tail -6     # → pass 3, fail 0
  npm test 2>&1 | tail -6                     # → alle grønne, inkl. v2-hooks-fmt (3 nye) og komponent-kjeden
  grep -rn "useCountUp(" src --include='*.tsx' | grep -v "athletic/golfdata/KpiTile"
  # → nøyaktig: core.tsx:332 (KpiFlis), portal/v2/MegV2.tsx:131, portal/v2/WorkbenchV2.tsx:890 og :2096
  ```
  (`KpiTile.tsx:86/:140` har sin EGEN lokale `useCountUp`, ikke hooken — urørt.)
- [ ] **Steg 5: Verify.**
  ```bash
  npm run verify > "${TMPDIR:-/tmp}/fase1-okt2-verify.log" 2>&1; echo exit=$?   # → exit=0
  grep -n "error\|Error\|FEIL" "${TMPDIR:-/tmp}/fase1-okt2-verify.log" | head    # → tomt
  ```
  Rødt? Fiks først (typisk: `tsc` på testfila — `tests/komponenter` typesjekkes). Aldri commit på rødt.
- [ ] **Steg 6: Commit** (navngitte filer, aldri `-A`):
  ```bash
  git add package.json tests/komponenter/tall-hero.test.ts src/lib/__tests__/v2-hooks-fmt.test.ts src/lib/v2/hooks.ts src/components/v2/core.tsx
  git status --short          # → nøyaktig de fem filene, alle staged (A/M), ingenting annet
  git commit -m "fix(ui): TallHero viser målt tall direkte, ingen opptelling (19.7)

TallHero (src/components/v2/core.tsx) bruker fmtSluttverdi(value) i stedet for useCountUp —
samme sluttformat som tellingen ga (komma, unicode-minus), men fra første ramme.
KpiFlis (core.tsx:332), MegV2 og WorkbenchV2 beholder useCountUp (beslutning 03.09.2026).
Nytt npm-script test:komponenter (render-tester uten react-server-betingelsen), kjedet inn i npm test.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

### Oppgave 2.4: Push og PR (PR-nummeret trengs i dokumentene i 2.5)

**Filer:** ingen endres.
**Grensesnitt:** PR-nummer `N` (fra `gh pr view --json number`), brukt ordrett i 2.5.

- [ ] **Steg 1: Push.** `git push -u origin fase1/okt-2-tallhero-direkte` → `branch … set up to track …`.
- [ ] **Steg 2: Åpne PR** (malen i `.claude/commands/pr.md`):
  ```bash
  gh pr create --base main --title "fix(ui): TallHero slutter å telle + 19.6-bruksregel i dokumentene (19.6/19.7, fase 1 økt 2)" --body "## Hva
TallHero (13 bruksfiler) viser målt tall direkte — useCountUp-kallet på core.tsx:284 er byttet mot fmtSluttverdi(value) (samme sluttformat, ingen 600 ms telling fra 0). KpiFlis, MegV2 og WorkbenchV2 beholder tellingen (beslutning 03.09). Vei A-regelen for signalfarger er skrevet inn i gotchas.md og Train-lock README (ingen --tl-*-verdi endret). MASTERPLAN 19.6/19.7 og STATUS-NÅ rettet. Nytt npm-script test:komponenter (render-tester med react-dom/server utenfor react-server-betingelsen).

## Hvorfor
Anders 03.09.2026 (§KONTRAST-REGEL I STEDET FOR NY FASIT + TALLHERO SLUTTER Å TELLE): «målt tall er et faktum, ikke dramatisert». Fase 1 økt 2 i komplett designport. Erstatter TallHero-delen av den strandede lokale commiten 58782d944 (kø 30) — den commiten er nå overflødig; sweepen (150 filer) er uendret og fortsatt Anders' avgjørelse.

## Testet
- [x] npm run verify grønt
- [x] npm test grønt (nye: tests/komponenter/tall-hero.test.ts, src/lib/__tests__/v2-hooks-fmt.test.ts)
- [ ] Sjekket lys OG mørk modus (hvis UI) — ikke relevant: ingen farge/layout endres
- [ ] Sjekket mobil 390px OG desktop (hvis UI) — ikke relevant: samme ramme, tallet står fra første ramme

## Skjermbilder
Ingen: et stillbilde kan ikke vise forskjellen (før: 0 → 42 over 600 ms; nå: 42 fra første ramme). Endringen er atferd, ikke utseende."
  gh pr view --json number,url --jq '"\(.number) \(.url)"'    # → N og lenken — noter N
  ```
- [ ] **Steg 3: Ikke merge.** `.claude/commands/pr.md` pkt. 11: merge og push til main krever Anders'
  eksplisitte «ja» i samtalen (håndheves av `.claude/hooks/beskytt.mjs`). Lenken sendes i samtalen.

### Oppgave 2.5: 19.6-regelen inn i dokumentene + status-rettelser (docs-only), commit, push

**Filer:**
- Modify: `.claude/rules/gotchas.md` — ny seksjon etter linje 6 (før `### Prismas _count …` på linje 7)
- Modify: `designsystem/train-lock/README.md` — nytt kulepunkt under `## Regler` (linje 45), etter linje 48
- Modify: `docs/MASTERPLAN-GJENSTAAENDE.md` — radene `| 19.6 |`, `| 19.7 |`, 2.13-raden «C · Designkvalitet», kø 30 (+ `| 20.1 |` hvis den finnes)
- Modify: `docs/STATUS-NÅ.md` — linje 31–35, 52, 176, 177, 203
- Modify (kun ved behov): `docs/feillogg.md`

Linjenumrene under er målt på `origin/main @ c1c3396eb`. Har docs-commiten fra 05.09 (`ae73b1658`: STEG 20,
kø 31–32 — per 06.09 kun i worktreet `design-implementation-status-14d2ce`, ikke på `origin/main`) kommet
inn før deg, flytter MASTERPLAN-radene seg: 2.13-raden 241 → 245, 19.6/19.7 724/725 → 728/729, kø 30
758 → 781, og rad 20.1 finnes (742). STATUS-NÅ er uendret av den. **Finn alltid raden med grep**, ikke med
linjenummer. Teksten i radene er verifisert identisk i begge versjoner (06.09).

**Grensesnitt:** ingen kode. Alle henvisninger til `docs/**.md` må finnes (`check-doc-lenker.mjs` sjekker
`gotchas.md`, `STATUS-NÅ.md`, `MASTERPLAN` og `feillogg.md`).

- [ ] **Steg 1: gotchas.md.** Linje 5–7 er i dag:
  ```
  Designfasit er Train-lock (låst 25.08.2026, CLAUDE.md invariant 2) — se `designsystem/train-lock/`. Open Design-sporet fra 2026-07-25 er forlatt.

  ### Prismas `_count` på en relasjon skanner HELE relasjonstabellen — hver gang (oppdaget 2026-08-30)
  ```
  Sett inn mellom linje 6 (tom) og linje 7 (ordrett fra commit `58782d944`, med tom linje etter):
  ```markdown
  ### Signalfarger som ren tekst på lys `scene`/`elev`/`dock` — bruksregel, ikke tokenendring (03.09.2026)
  - **Kilde:** `.claude/rules/beslutninger.md` §KONTRAST-REGEL I STEDET FOR NY FASIT (Vei A), målt av
    `scripts/check-tl-kontrast.mjs` → `docs/design-audit/train-lock-kontrast.md` (12 brudd, 11 i lys
    modus + 1 felles for begge). **Ingen `--tl-*`-verdi endres** — dette er en bruksregel oppå
    Train-lock, ikke en ny fasit (CLAUDE.md invariant 2 står).
  - **Regel:** `danger`, `ok`, `warn`, `viz-target` skal ALDRI være `color:` på ren `scene`/`elev`-bunn
    i lys modus (2,0–3,6:1, krav 4,5:1/3,0:1). Bruk dem i stedet som: hvit tekst PÅ en fylt flate i
    samme farge (`on-fill`-mønsteret), eller ikon/grafikk med egen farget bakgrunnsflate rundt seg —
    aldri løs tekstfarge på appens nøytrale bunn.
  - **`mute` på `dock`** (4,2:1, krav 4,5:1) er eneste `mute`-brudd — `mute` på `scene`/`elev` holder
    fint (5,1:1/4,5:1) og er fortsatt normal sekundærtekst der. Unngå kun paret `mute`-tekst direkte
    på `dock`-bunn i lys modus.
  - **`dim`** er kun spor/skjelett (loading-state) — skal aldri bære lesbar tekst, uansett modus.
  - **`on-danger` på `danger`** (3,5:1 lys / 3,4:1 mørk, krav 4,5:1) er hvit tekst i selve
    Kø-badge-fyllet — under kravet i BEGGE moduser. Bruk kun for kort tallmerking (badge-count), aldri
    for løpende tekst i det fyllet.
  - Se full tabell i `docs/design-audit/train-lock-kontrast.md` (generert av scriptet — ikke rediger
    filen for hånd, kjør `node scripts/check-tl-kontrast.mjs` på nytt om tokens endres).

  ```
  Tallene er kontrollert mot `docs/design-audit/train-lock-kontrast.md` 06.09 (lys: 11 BRUDD-rader,
  mørk: 1 — `on-danger` på `danger` 3,4:1). Verifiser: `grep -n "^### Signalfarger" .claude/rules/gotchas.md` → 7.
- [ ] **Steg 2: Train-lock README.** `## Regler` står på linje 45; linje 48 er kulepunktet som begynner
  `- Skjermbilde-gaten gjelder: …`, linje 49 begynner `- ` + `uploads/`-kildematerialet. Sett inn som ny
  linje 49 (mellom dem):
  ```markdown
  - **Signalfarger er aldri ren tekst på nøytral bunn i lys modus** (Anders 03.09.2026, Vei A — bruksregel, ingen `--tl-*`-verdi endres): `danger`, `ok`, `warn` og `viz-target` bærer ikke `color:` på `scene`/`elev`; `mute` ikke på `dock`; `dim` bærer aldri tekst. Bruk paret som består — hvit tekst på fylt flate i samme farge, eller ikon/grafikk med egen farget bakgrunnsflate. Målt: `docs/design-audit/train-lock-kontrast.md` (`node scripts/check-tl-kontrast.mjs`). Full regel: `.claude/rules/gotchas.md` §Signalfarger som ren tekst.
  ```
  Verifiser: `sed -n '45,50p' designsystem/train-lock/README.md` → fire kulepunkter under `## Regler`.
- [ ] **Steg 3: MASTERPLAN — rad 19.7.** Finn: `grep -n "^| 19\.7 |" docs/MASTERPLAN-GJENSTAAENDE.md` (725 på c1c3396eb).
  Status-cellen (tredje kolonne) er i dag:
  ```
  **STRANDET — samme lokale commit som 19.6** (`58782d944`, ikke pushet). `useCountUp` står fortsatt i `core.tsx:284` og `:332` i main per 05.09 — STATUS-NÅ 03.09 påsto feilaktig at dette var levert. Redning tir 09.09 (2.13) |
  ```
  Erstatt hele status-cellen med (bytt `N` med PR-nummeret fra 2.4):
  ```
  **LEVERT 06.09.2026 (PR #N, fase 1 økt 2).** `useCountUp` er ute av `TallHero` — `core.tsx` viser `fmtSluttverdi(value)` direkte (samme sluttformat som tellingen ga: komma, unicode-minus). `KpiFlis` (`core.tsx:332`), `MegV2.tsx` og `WorkbenchV2.tsx` urørt. Tester: `tests/komponenter/tall-hero.test.ts` (`npm run test:komponenter`) + `src/lib/__tests__/v2-hooks-fmt.test.ts`. Den lokale commiten `58782d944` i hovedmappa er overflødig for 19.7 |
  ```
- [ ] **Steg 4: MASTERPLAN — rad 19.6.** Finn: `grep -n "^| 19\.6 |" docs/MASTERPLAN-GJENSTAAENDE.md` (724).
  Status-cellen begynner i dag med `**STRANDET — verifisert 05.09.** Grenen …`. Sett inn FORAN den
  (behold resten av cellen ordrett):
  ```
  **Regelen LEVERT 06.09.2026 (PR #N, fase 1 økt 2):** skrevet inn i `.claude/rules/gotchas.md` §Signalfarger som ren tekst og `designsystem/train-lock/README.md` §Regler. **Sweepen (de 12 parene / 300 forekomster) gjenstår — kø 30.**
  ```
- [ ] **Steg 5: MASTERPLAN — 2.13-raden «C · Designkvalitet».** Finn:
  `grep -n "19.6/19.7-redning tir 09.09" docs/MASTERPLAN-GJENSTAAENDE.md` (241). To bytter på den linjen:
  - `**19.6/19.7-redning tir 09.09** (hovedmappa: gjennomgå 150 filer mot Vei A, commit, push, PR)`
    → `**19.6-sweep-redning tir 09.09** (hovedmappa: gjennomgå 150 filer mot Vei A, commit, push, PR — 19.7 og 19.6-regelen levert 06.09, PR #N)`
  - `| 19.6/19.7 tir 09.09; resten fra tor 24.09 (som 19 sier) |`
    → `| 19.6-sweep tir 09.09; resten fra tor 24.09 (som 19 sier) |`
- [ ] **Steg 6: MASTERPLAN — kø 30.** Finn: `grep -n "^30\. \*\*19.6/19.7-arbeidet" docs/MASTERPLAN-GJENSTAAENDE.md` (758).
  Linjen slutter i dag med `**Trenger Anders** (det er en annen økts arbeid).` — legg til etter det, på samme linje:
  ```
   **Presisert 06.09 (fase 1 økt 2, PR #N):** 19.7 og 19.6-regelen er levert fra fersk gren; commiten `58782d944` trengs ikke lenger — det er kun de 150 ukommitterte sweep-filene som skal avgjøres.
  ```
- [ ] **Steg 7: MASTERPLAN — rad 20.1 (kun hvis den finnes).** `grep -n "^| 20\.1 |" docs/MASTERPLAN-GJENSTAAENDE.md`.
  Treff: bytt `TallHero 19.7,` → `~~TallHero 19.7~~ (levert #N),` i den raden (samme mønster som
  `~~PH-21~~ (levert #789)` i 20.4). Ingen treff (docs-commiten 05.09 er ikke inne ennå): hopp over.
- [ ] **Steg 8: STATUS-NÅ.** Fem steder (linjer på c1c3396eb FØR redigering — pkt. 1 er én linje lengre
  enn det gamle kulepunktet, så 52/176/177/203 blir 53/177/178/204 etter den; bekreft med grep før du redigerer):
  1. Linje 31–35 (`grep -n "STRANDET ARBEID — STEG 19.6/19.7" docs/STATUS-NÅ.md`) — erstatt hele kulepunktet med:
     ```
     - **STRANDET ARBEID — STEG 19.6-SWEEPEN (19.7 er levert 06.09, PR #N):** grenen
       `feat/steg-19-6-19-7-kontrast-tallhero` finnes kun lokalt i hovedmappa (`~/Developer/akgolf-hq`):
       én upushet commit (03.09) + **150 ukommitterte filer**. Ingen PR. TallHero-delen (19.7) og
       gotchas-regelen (19.6) er levert på nytt fra fersk gren i PR #N — commiten der er overflødig.
       Sweepen bytter signalfarge til `TL.text` i stedet for til et par som består — må gjennomgås
       før PR (beslutningskø 30).
     ```
  2. Linje 52 (302 tegn; `grep -n "RETTET 05.09: dette ble aldri merget" docs/STATUS-NÅ.md`) — bytt denne delen av linjen:
     ```
     ~~`TallHero` slutter å telle opp (`useCountUp` fjernet der, urørt tre andre steder).~~ **RETTET 05.09: dette ble aldri merget** — arbeidet ligger upushet i hovedmappa (se 05.09 over); kun beslutningen (#765, docs) er i main.
     ```
     med:
     ```
     `TallHero` slutter å telle opp (`useCountUp` fjernet der, urørt tre andre steder) — **levert 06.09 i PR #N** (påstått levert 03.09, rettet 05.09, faktisk merget 06.09).
     ```
  3. Linje 176: `med 19.6/19.7-arbeidet i hovedmappa (beslutningskø 30)` → `med 19.6-sweepen i hovedmappa (beslutningskø 30)`.
  4. Linje 177: `19.6/19.7-redning fra hovedmappa` → `19.6-sweep-redning fra hovedmappa (19.7 levert 06.09, PR #N)`.
  5. Linje 203: `1b. **Strandet 19.6/19.7-arbeid i hovedmappa** (150 ukommitterte filer + én upushet commit)`
     → `1b. **Strandet 19.6-sweep i hovedmappa** (150 ukommitterte filer + én upushet commit; 19.7 levert 06.09, PR #N)`.
  Verifiser: `grep -n "19.6/19.7" docs/STATUS-NÅ.md` → kun to treff igjen, begge i revisjonshistorikken 05.09
  (linje 265 og 271 før redigering, 266 og 272 etterpå) — la dem stå.
- [ ] **Steg 9: feillogg.** Format står i `docs/feillogg.md:3–4`
  (`<dato> | <hva gikk galt/kostet tid> | <rotårsak> | <regel som hindrer gjentakelse>`). `.claude/commands/pr.md`
  pkt. 10: legg til én linje nederst KUN hvis noe i økta kostet ekstra tid — ellers rør ikke fila.
- [ ] **Steg 10: Lenkevakt + commit + push.**
  ```bash
  node scripts/check-doc-lenker.mjs      # → OK: ingen døde doc-lenker i levende styringsdokumenter.
  grep -rnE "PR #N([^0-9]|$)" .claude/rules/gotchas.md designsystem/train-lock/README.md docs/MASTERPLAN-GJENSTAAENDE.md "docs/STATUS-NÅ.md"; echo exit=$?
  # → exit=1 (ingen bokstavelig «N» igjen — alle er byttet med nummeret)
  git add .claude/rules/gotchas.md designsystem/train-lock/README.md docs/MASTERPLAN-GJENSTAAENDE.md "docs/STATUS-NÅ.md"
  # + docs/feillogg.md hvis du skrev der
  git status --short                     # → kun de fire (fem) docs-filene
  git commit -m "docs(steg19): 19.6-bruksregel i gotchas + Train-lock README, 19.7 levert (PR #N)

Vei A-regelen (signalfarger aldri ren tekst på scene/elev/dock i lys) inn i gotchas.md og
designsystem/train-lock/README.md — ingen --tl-*-verdi endret. MASTERPLAN 19.6/19.7, 2.13 og kø 30
+ STATUS-NÅ sier nå at 19.7 er levert og at kun 19.6-sweepen (150 filer) gjenstår i hovedmappa.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  git push                               # → ny commit på PR #N
  gh pr checks N --watch                 # → alle sjekker grønne (CI: tsc, lint, gates, npm test, build)
  ```
  Er `check-doc-lenker` rød på lenker du IKKE har skrevet (se Åpne funn 3), stopp og si ifra i samtalen — ikke rett andres lenker i denne PR-en.

### Ferdig når (målbart, med kommando)

- `git diff --stat origin/main..HEAD` viser nøyaktig: `package.json`, `tests/komponenter/tall-hero.test.ts`,
  `src/lib/__tests__/v2-hooks-fmt.test.ts`, `src/lib/v2/hooks.ts`, `src/components/v2/core.tsx`,
  `.claude/rules/gotchas.md`, `designsystem/train-lock/README.md`, `docs/MASTERPLAN-GJENSTAAENDE.md`,
  `docs/STATUS-NÅ.md` (+ `docs/feillogg.md` hvis brukt). Ingen fil under `src/styles/`, ingen `--tl-*` endret:
  `git diff origin/main..HEAD -- src/styles/train-lock-tokens.css src/lib/v2/train-lock.ts | wc -l` → 0.
- `grep -n "useCountUp(" src/components/v2/core.tsx` → kun `332:` (KpiFlis). Planens ferdig-punkt
  «`grep useCountUp core.tsx` gir 0 på :284» holder: `sed -n '284p' src/components/v2/core.tsx` er kommentaren.
- `npm run test:komponenter` → `pass 3`; `npm test` → grønt inkl. `v2-hooks-fmt` (3) og komponent-kjeden.
- `npm run verify` → exit 0. `node scripts/check-doc-lenker.mjs` → OK.
- `grep -n "^### Signalfarger som ren tekst" .claude/rules/gotchas.md` → 7;
  `grep -c "Signalfarger er aldri ren tekst" designsystem/train-lock/README.md` → 1.
- `grep -c "LEVERT 06.09.2026 (PR #" docs/MASTERPLAN-GJENSTAAENDE.md` → 2 (19.6-raden og 19.7-raden).
- `gh pr view N --json state,mergeStateStatus` → `OPEN`/`CLEAN`, CI grønn, lenken sendt i samtalen.
  Merge (`gh pr merge N --squash --delete-branch`) skjer først etter Anders' «ja» — fra et worktree
  gir kommandoen «'main' is already used by worktree» etter at merge er utført; sjekk
  `gh pr view N --json state` (→ `MERGED`) i stedet for å kjøre merge på nytt.

### Åpne funn (ikke løs dem i denne økta)

1. **To `fmtTall` i samme fil.** `core.tsx:31` re-eksporterer `fmtTall` fra `src/lib/v2/format.ts:20`
   (kun em-dash for tom verdi, ellers `String(v)`); den strandede commiten `58782d944` legger en annen
   `fmtTall` (komma/fortegn) i `hooks.ts`. Denne planen unngår kollisjonen med navnet `fmtSluttverdi`,
   men når hovedmappa-grenen (kø 30) skal reddes, må dens `core.tsx`/`hooks.ts`-del forkastes til fordel
   for denne PR-en — ellers kommer kollisjonen inn via den.
2. **Tall med desimaler rundes til heltall** når `value` er et JS-tall: `parseNum` setter `dec: 0` for
   `number`, så `useCountUp(3.5)` har alltid endt på «4», og `fmtSluttverdi(3.5)` gir også «4»
   (paritet med vilje). Kallere som sender desimaltall som `number` (kandidater: `StallV2.tsx:222`
   `value={s.sg}`, `AnalysereV2.tsx:141` `value={sgStatus.verdi}`) viser dermed avrundet — det var slik
   før også. Egen vurdering: skal TallHero få `desimaler`-prop, eller skal kallerne sende ferdig
   formatert streng (`komma(...)`), slik `AnalysereV2.tsx:553/847` allerede gjør?
3. **Docs-commiten 05.09 i worktreet `design-implementation-status-14d2ce`** (`ae73b1658`, ikke på
   `origin/main` per 06.09) legger inn to lenker til `docs/superpowers/plans/2026-09-05-designport-fase-1.md`
   (`beslutninger.md:36` og MASTERPLAN rad 20.1). Fila finnes nå — men kun som UTRACKET fil i det
   worktreet (sammen med økt-filene `…-okt-1/2/4/5/6/7/8.md`), så `node scripts/check-doc-lenker.mjs` er
   grønn DER (målt 06.09) og ville blitt rød på `main` hvis `ae73b1658` pushes uten planfilene
   (`existsSync` mot filsystemet). Tilhører økten som skrev den: committ planfilene i samme PR som
   `ae73b1658`. Økt 2 starter fra `origin/main` og er ikke berørt.
4. **`npm run verify` kjører ikke `npm test`** — enhetstestene (også de nye) håndheves kun av CI
   (`ci.yml:55–56`). Kunne vært et funn for økt 1 (vakter), men er ikke i dens liste.
5. **`KpiFlis` sin `instant`-vei** (`core.tsx:333`: `instant ? String(value) : animert`) bruker `String(value)`,
   ikke komma/fortegn-formatet — en `instant`-KpiFlis med `"-1.5"` viser «-1.5» der TallHero nå viser «−1,5».
   Utenfor beslutningen (KpiFlis røres ikke), men verdt en rad når KpiFlis vurderes.
6. **`hooks.ts:3–7`-hodet** sier fortsatt «count-up på hero-tall» — etter denne økta er det KpiFlis,
   MegV2 og WorkbenchV2 som teller, ikke hero. Én kommentarlinje; ikke rørt for å holde diffen kirurgisk.
7. **Prosjektregel vs. global regel om merge.** `.claude/commands/pr.md` pkt. 11 sier «ikke merge selv»
   uten Anders' ja; den globale CLAUDE.md sier Claude fullfører merge. Planen følger prosjektregelen
   (prosjekt vinner ved konflikt), derfor stopper økta ved åpen PR + lenke.
