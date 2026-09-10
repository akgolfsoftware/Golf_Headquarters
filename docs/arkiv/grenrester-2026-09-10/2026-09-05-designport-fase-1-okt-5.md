# Historisk grenrest – 10.09.2026

Bevart fra `park/2026-09-08-opprydding`, commit `e4356c368`. Main fjernet denne planrekken som fullført i PR #812. Dette er historikk, ikke aktive arbeidsordrer eller gjeldende designvalg.

---

# Fase 1 · Økt 5 — Filhode-konvensjon + vakt mot fasit-drift

**Mål:** Hver skjermfil som siterer en Train-lock-tegning gjør det på én form (` * Fasit:` + ` * Rigg:` eller ` * Avvik:`), og `npm run verify` + CI stopper (a) siteringer av tegninger som ikke finnes, (b) siteringer av tegninger som står som utgått i SCREEN-INDEX §Kjente hull, (c) endrede skjermfiler med Fasit uten Rigg/Avvik. Skriptet rapporterer i tillegg hvor mange filer som fortsatt mangler Rigg/Avvik og hvor mange som siterer Paper.

**Målt på nytt 07.09.2026 mot origin/main `8ca1d66ae` (PR #787–#789 og #771 alle merget — kjørt skriptets faktiske `kjoer()` fra 5.4 mot repoet, ikke en prototype):**
- `grep -rlE "^\s*\*?\s*Fasit:" src --include='*.tsx' --include='*.ts' | wc -l` → **187** filer (denne grep-en mangler `// Fasit:`-linjer og «Fasit (kanon …):»-formen i `WorkbenchUke.tsx`).
- Skriptets parser finner **183 Train-lock-siteringer** (`.dc.html`), **174 `.tsx`-filer med Fasit-linje**, **174 uten Rigg/Avvik** (ingen fil har Rigg/Avvik i dag: `grep -rlE "^\s*\*?\s*(Rigg|Avvik):" src` → 0), og **83 filer som siterer `designsystem/paper/`** (slettet 30.08.2026) — 0 feil. (Opp fra 179/173/173 målt 06.09: PR #771 «Spiller 360» la til S3-01/S3-02-siteringer.)
- Utgått-lista lest fra SCREEN-INDEX: kun `P-05 iPhone Agenda.dc.html`. PR #788 har fjernet siteringen fra `WorkbenchV2.tsx` og `WorkbenchV2Mobil.tsx` (bekreftet: ingen `Fasit:`-sitering av P-05 igjen noe sted i `src/`). **Etter pilot-oppgaven 5.6 er tallet 167 filer uten Rigg/Avvik** (174 − 7; alle sju pilotfiler er bekreftet med i dagens 174).
- Tallene flytter seg hver gang en annen økt legger til en `Fasit:`-linje. Mål selv med `node scripts/check-fasit-sitering.mjs` (5.4 steg 3) og bruk DINE tall i commit-melding, MASTERPLAN og PR-tekst — ikke planens.

**Forutsetninger:**
- Node 24 (lokalt v24.14.0; CI `node-version: "24"`). Ingen nye avhengigheter — tester kjøres med `node:test` via `npm test` (repoet har ikke vitest; `package.json` → `"test": "tsx --conditions=react-server --experimental-test-module-mocks --test 'src/**/*.test.ts'"`). Oppgaven ba om vitest — det ville vært en ny avhengighet, så `node:test` brukes.
- PR #787, #788 og #789 er alle merget inn i main (bekreftet 07.09.2026 i git-loggen: `059f6e7d0` (#787), `43c00c499` (#788) og `c1c3396eb` (#789) er forfedre til `origin/main` `8ca1d66ae`). Ingen stopp-betingelse igjen her — skulle skriptet i 5.4 likevel feile på en P-05-sitering, har noen gjeninnført den etter #788: stopp og si fra, ikke rør `WorkbenchV2*.tsx` i denne økten.
- **Økt 1 (`…-okt-1.md`) har IKKE landet per 07.09.2026** (`ci.yml` har 9 steg, `verify` mangler `check-v2shell-bredde.mjs`). Økt 1 rører de samme to stedene som 5.5 (verify-strengen rett bak `check-ingen-paper.mjs`, og CI-stegene mellom `Critical imports gate` og `Unit tests`) og legger selv inn et «Hent origin/main»-steg. 5.5 er skrevet så den virker begge veier — les betingelsen der før du redigerer.
- Fersk gren:
  ```bash
  cd /Users/anderskristiansen/Developer/akgolf-hq
  git fetch origin main
  git checkout -b claude/fase1-okt5-fasit-sitering origin/main
  git branch --show-current   # → claude/fase1-okt5-fasit-sitering
  ```
- Kjør `npm run verify` fra hovedutsjekken, ikke fra en nøstet worktree uten egen `node_modules` (`docs/feillogg.md` 2026-08-29: `npm run build` og `check-critical-imports` feiler der).
- Aldri `git add -A`. Aldri kopier `.env*`. Ingen nye tokens.

---

### Oppgave 5.1: Konvensjonen inn i PORTING.md

**Filer:** Modify `designsystem/train-lock/PORTING.md:14–27` (mellom §0 og §1)
**Grensesnitt:** Overskriften `## 0b · Filhode — Fasit, Rigg, Avvik` er det skriptet i 5.4 peker på i feilmeldingene (`PORTING.md §0b`).

- [ ] **Steg 1: Sett inn §0b etter §0.** Bruk Edit med denne eksakte `old_string` (linje 23–27 i dag):
  ```
  4. Sjekk om komponenten finnes i repoet fra før. Hvis ja: gjenbruk, ikke lag ny.

  ---

  ## 1 · Tokenlaget først — alltid
  ```
  `new_string`:
  ````
  4. Sjekk om komponenten finnes i repoet fra før. Hvis ja: gjenbruk, ikke lag ny.

  ---

  ## 0b · Filhode — Fasit, Rigg, Avvik

  Innført 05.09.2026 (designport fase 1, økt 5). Håndheves av `scripts/check-fasit-sitering.mjs`
  i `npm run verify` og CI. Bakgrunn: «sitert er ikke bygget» (planens regel 1) — et filhode
  som bare sier `Fasit:` beviser ingenting. Filhodet skal si HVA som er fasit og HVORDAN det er
  bevist (målt i riggen) eller HVA som bevisst avviker.

  Hver `.tsx`-fil som porterer en Train-lock-skjerm har i sin første blokkommentar:

  ```ts
  /**
   * <Én linje om hva fila er.>
   * Fasit: designsystem/train-lock/PH-01 I dag.dc.html
   * Fasit: designsystem/train-lock/PH-02 I dag hvile.dc.html (hvile-tilstanden)
   * Rigg: PH-01 I dag
   */
  ```

  eller, når skjermen ikke har en riggrad ennå:

  ```ts
  /**
   * <Én linje om hva fila er.>
   * Fasit: designsystem/train-lock/A-06 Mac Arsplan.dc.html
   * Avvik:
   *   - Ingen riggrad: årsplan-rutenettet er dataavhengig og har ingen fixture ennå.
   *   - Fasiten tegner Balanse-kolonnen (A-07); koden har den ikke (D2 02.09.2026).
   */
  ```

  Reglene, slik skriptet leser dem:

  1. **`Fasit:`** — ett eksakt filnavn per linje, alltid som `designsystem/train-lock/<filnavn>.dc.html`
     (full sti) eller `` `<filnavn>.dc.html` `` i backticks. Filnavnet er nøyaktig slik det ligger i
     `designsystem/train-lock/` (æ/ø/å/é normaliseres til NFC, ellers ingen slingring). Tekst i
     parentes etter filnavnet er fritt. Kortkoder uten `.dc.html` (`(+ FO-01L lys)`, `A-13/WB-01c`)
     valideres ikke — skriv full fil hvis den skal telle. Linjeformene `* Fasit:`, `// Fasit:` og
     `Fasit (kanon …):` gjenkjennes alle som Fasit-linje.
  2. **Filen må finnes** i `designsystem/train-lock/`, og må ikke stå som utgått i
     `SCREEN-INDEX.md` §Kjente hull (der teller `.dc.html`-navn i backticks som står FØR ordet
     «utgått» på kulepunktet). Begge deler er blokkerende.
  3. **`Rigg:`** — én `label` fra `tests/visual/skjerm-mapping.ts`, ordrett. Flere rader = flere
     `Rigg:`-linjer. Ukjent label er blokkerende. Riggraden er beviset; se `tests/visual/README.md`
     for hva «kalibrert» krever.
  4. **`Avvik:`** — linjen står alene, og neste linje er første punkt på formen ` *   - …`. Minst ett
     punkt. Punktene sier hva som bevisst avviker fra tegningen, eller hvorfor det ikke finnes rigg.
     `Avvik:` uten punkt er blokkerende.
  5. **Baseline-vakt:** en `.tsx`-fil med Fasit uten Rigg/Avvik rapporteres (tall i verify-loggen),
     men blokkerer bare når fila er ENDRET mot `origin/main`. Rører du en skjermfil, legger du til
     Rigg eller Avvik samtidig — det er hele prisen. `.ts`-filer (domene/loader) får siteringene
     validert (regel 1–2), men trenger ikke Rigg/Avvik.
  6. **Paper-siteringer** (`designsystem/paper/…`) telles og rapporteres. De blokkeres ikke ennå:
     filene er ikke portert, og porten er fase 2–7 i planen. En endret Paper-fil trenger likevel en
     `Avvik:`-blokk («fasiten er Paper, slettet 30.08.2026 — ikke portert til Train-lock»).

  Kjør selv: `node scripts/check-fasit-sitering.mjs` (rapport + feil), `--liste` for å se filene
  uten Rigg/Avvik, `--endret <sti …>` for å simulere baseline-vakten på navngitte filer.

  ---

  ## 1 · Tokenlaget først — alltid
  ````
- [ ] **Steg 2: Bekreft at seksjonen ligger mellom §0 og §1.**
  ```bash
  grep -n "^## " designsystem/train-lock/PORTING.md
  ```
  Forventet: `14:## 0 · Regel nummer én`, deretter `## 0b · Filhode — Fasit, Rigg, Avvik`, deretter `## 1 · Tokenlaget først — alltid`, og resten som før (2, 3, 4, 5, 6, 7).
- [ ] **Steg 3: Ikke commit ennå** — commit sammen med 5.2.

### Oppgave 5.2: SCREEN-INDEX §Kjente hull — si hvordan utgått-lista leses

**Filer:** Modify `designsystem/train-lock/SCREEN-INDEX.md:283–284` (siste to kulepunkter i fila)
**Grensesnitt:** `lesUtgaatte()` i skriptet leser nøyaktig denne seksjonen. Den nye linjen dokumenterer parseregelen slik at neste utgått-fil legges inn på et format skriptet forstår.

- [ ] **Steg 1: Legg til ett kulepunkt sist i fila.** Edit, `old_string` (linje 284, hele linjen):
  ```
  - Workbench har to serier: **WB-01–WB-10 er kanon for struktur og brekkpunkter**, A-01–A-18 er Mac-pikselfasit der WB mangler detalj (Anders 02.09.2026, D2).
  ```
  `new_string`:
  ```
  - Workbench har to serier: **WB-01–WB-10 er kanon for struktur og brekkpunkter**, A-01–A-18 er Mac-pikselfasit der WB mangler detalj (Anders 02.09.2026, D2).
  - **Utgått-lista leses maskinelt** (`scripts/check-fasit-sitering.mjs`, 05.09.2026): på et kulepunkt i denne seksjonen teller hvert `` `<fil>.dc.html` ``-navn som står FØR ordet «utgått» som utgått fasit — koden får ikke sitere den. Skal en ny tegning ut: skriv `` - `<fil>.dc.html` er **utgått** … `` på samme mønster som P-05-linjen over. I dag: kun P-05.
  ```
- [ ] **Steg 2: Bekreft at parseren fortsatt bare ser P-05** (den nye linjen har ingen `.dc.html` foran «utgått»):
  ```bash
  node -e '
  const s=require("fs").readFileSync("designsystem/train-lock/SCREEN-INDEX.md","utf8");
  const sek=s.slice(s.indexOf("## Kjente hull"));const ut=[];
  for(const l of sek.split("\n")){if(!l.startsWith("- "))continue;const i=l.search(/utgått/i);if(i<0)continue;
  for(const m of l.slice(0,i).matchAll(/`([^`]+?\.dc\.html)`/g))ut.push(m[1]);}
  console.log(ut)'
  ```
  Forventet: `[ 'P-05 iPhone Agenda.dc.html' ]`.
- [ ] **Steg 3: Commit (docs-only, docs-lenke-vakt først).**
  ```bash
  node scripts/check-doc-lenker.mjs      # → OK: ingen døde doc-lenker i levende styringsdokumenter.
  git add designsystem/train-lock/PORTING.md designsystem/train-lock/SCREEN-INDEX.md
  git commit -m "docs(train-lock): filhode-konvensjon Fasit/Rigg/Avvik i PORTING §0b + maskinlesbar utgått-liste

  Fase 1 økt 5 i docs/superpowers/plans/2026-09-05-komplett-designport.md.

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

### Oppgave 5.3: Test først — kjernelogikken

**Filer:** Create `src/lib/__tests__/check-fasit-sitering.test.ts`
**Grensesnitt:** Testen importerer fra `../../../scripts/check-fasit-sitering.mjs` (rot = tre nivåer opp fra `src/lib/__tests__/`): `finnTrainLockSiteringer(kilde)`, `finnPaperSiteringer(kilde)`, `finnRiggLabels(kilde)`, `finnAvvik(kilde)`, `lesUtgaatte(screenIndexTekst)`, `lesRiggLabels(mappingTekst)`, `vurderFil({ sti, kilde, fasitFiler, utgaatte, riggLabels, endret })`, `FASIT_LINJE`. Verifisert 05.09 og på nytt 07.09.2026: `eslint --quiet` er grønn på fila mot repoets config (kjørt via `--stdin-filename`), `tsc` er grønn på en speilet kopi med repoets `allowJs`/`strict`/`bundler`, og alle 12 tester passerer mot skriptet i 5.4 (`tests 12 · pass 12 · fail 0`).

- [ ] **Steg 1: Skriv testfila** med nøyaktig dette innholdet:
  ```ts
  /**
   * Kjernelogikken i scripts/check-fasit-sitering.mjs (fase 1 økt 5, 05.09.2026):
   * siteringsparser, utgått-liste fra SCREEN-INDEX, Rigg/Avvik-lesing og
   * vurderingen som avgjør feil vs. rapport. Filsystem og git er holdt utenfor —
   * det er vurderFil/kjoer som gjør I/O, og de får alt som argumenter her.
   */
  import { test } from "node:test";
  import assert from "node:assert/strict";
  import {
    finnTrainLockSiteringer,
    finnPaperSiteringer,
    finnRiggLabels,
    finnAvvik,
    lesUtgaatte,
    lesRiggLabels,
    vurderFil,
    FASIT_LINJE,
  } from "../../../scripts/check-fasit-sitering.mjs";

  const FASIT = new Set([
    "PH-01 I dag.dc.html",
    "PH-12 Analyse én runde.dc.html",
    "AG-04 Stall.dc.html",
    "P-05 iPhone Agenda.dc.html",
  ]);
  const UTGAATT = new Set(["P-05 iPhone Agenda.dc.html"]);
  const RIGG = new Set(["PH-01 I dag"]);

  test("finner sitering med full sti og bare filnavn i backticks", () => {
    const kilde = [
      "/**",
      " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html (tilstandene)",
      " * Fasit: `AG-04 Stall.dc.html` (mobil), `AG-16 iPad Stall split.dc.html`",
      " */",
    ].join("\n");
    assert.deepEqual(finnTrainLockSiteringer(kilde).sort(), [
      "AG-04 Stall.dc.html",
      "AG-16 iPad Stall split.dc.html",
      "PH-01 I dag.dc.html",
    ]);
  });

  test("normaliserer æ/ø/å/é til NFC så filnavn matcher uansett tastatur/filsystem", () => {
    const nfd = "PH-12 Analyse én runde.dc.html";
    const kilde = ` * Fasit: designsystem/train-lock/${nfd}`;
    const [funn] = finnTrainLockSiteringer(kilde);
    assert.equal(funn, "PH-12 Analyse én runde.dc.html".normalize("NFC"));
    assert.ok(FASIT.has(funn));
  });

  test("(+ FO-01L lys)-notasjon uten .dc.html valideres ikke, feiler ikke", () => {
    const kilde = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html (+ PH-01L lys).";
    assert.deepEqual(finnTrainLockSiteringer(kilde), ["PH-01 I dag.dc.html"]);
  });

  test("bare filnavn i backticks krever Train-lock-kode — canvas-navn som `Analyse.dc.html` telles ikke", () => {
    const kilde = " * «Tester»-pillen i `Analyse.dc.html` er IKKE bygget. Fasit: `S3-03 Spiller profil bento.dc.html`";
    assert.deepEqual(finnTrainLockSiteringer(kilde), ["S3-03 Spiller profil bento.dc.html"]);
  });

  test("Fasit-linje gjenkjennes i blokk-, linje- og «Fasit (kanon …):»-form", () => {
    assert.ok(FASIT_LINJE.test(" * Fasit: x"));
    assert.ok(FASIT_LINJE.test("    // Fasit: x"));
    assert.ok(FASIT_LINJE.test(" * Fasit (kanon for struktur, D2):\n * x"));
    assert.ok(!FASIT_LINJE.test(" * Fasiten viser noe"));
  });

  test("Paper-siteringer telles, ikke som Train-lock", () => {
    const kilde = " * Fasit: designsystem/paper/fase2/playerhq/playerhq-drills.html.";
    assert.deepEqual(finnPaperSiteringer(kilde), ["designsystem/paper/fase2/playerhq/playerhq-drills.html"]);
    assert.deepEqual(finnTrainLockSiteringer(kilde), []);
  });

  test("lesUtgaatte tar bare navn som står FØR ordet «utgått» på kulepunktet", () => {
    const index = [
      "## PH · Player HQ",
      "| `PH-07 Plan.dc.html` | 1 | 390 | PH-07 Plan |",
      "## Kjente hull",
      "- `GAP-00 Kart.dc.html` mangler `data-screen-label` — referansebrett.",
      "- `P-05 iPhone Agenda.dc.html` er **utgått som fasit for `/portal/planlegge`** — Plan porter mot `PH-07 Plan.dc.html` + `PH-08 Plan tom uke.dc.html`.",
    ].join("\n");
    assert.deepEqual(lesUtgaatte(index), ["P-05 iPhone Agenda.dc.html"]);
  });

  test("lesRiggLabels leser label-feltene i skjerm-mapping", () => {
    const mapping =
      'export const X = [\n  {\n    label: "PH-01 I dag",\n    rute: "/portal",\n  },\n  {\n    label: "TE-01 Tester hub",\n  },\n];';
    assert.deepEqual(lesRiggLabels(mapping), ["PH-01 I dag", "TE-01 Tester hub"]);
  });

  test("Rigg og Avvik leses fra filhodet", () => {
    assert.deepEqual(finnRiggLabels(" * Rigg: PH-01 I dag\n * Rigg: PH-01 I dag Dynamic Type XL"), [
      "PH-01 I dag",
      "PH-01 I dag Dynamic Type XL",
    ]);
    assert.deepEqual(finnAvvik(" * Avvik:\n *   - Kilder-panelet grupperer annerledes"), {
      finnes: true,
      harPunkter: true,
    });
    assert.deepEqual(finnAvvik(" * Avvik:\n * Neste avsnitt uten punkt"), { finnes: true, harPunkter: false });
    assert.deepEqual(finnAvvik(" * Avviket er kjent"), { finnes: false, harPunkter: false });
  });

  test("vurderFil: ukjent fil, utgått fil og ukjent Rigg-label er feil", () => {
    const kilde = [
      " * Fasit: designsystem/train-lock/PH-99 Finnes ikke.dc.html",
      " * Fasit: designsystem/train-lock/P-05 iPhone Agenda.dc.html",
      " * Rigg: PH-99 Finnes ikke",
    ].join("\n");
    const v = vurderFil({ sti: "src/x.tsx", kilde, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: false });
    assert.equal(v.feil.length, 3);
    assert.match(v.feil[0], /ikke finnes/);
    assert.match(v.feil[1], /utgått/);
    assert.match(v.feil[2], /Rigg: «PH-99 Finnes ikke» finnes ikke/);
  });

  test("vurderFil: .tsx med Fasit uten Rigg/Avvik rapporteres — og feiler kun når fila er endret", () => {
    const kilde = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html";
    const uendret = vurderFil({ sti: "src/x.tsx", kilde, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: false });
    assert.deepEqual(uendret.feil, []);
    assert.deepEqual(uendret.rapport, ["src/x.tsx"]);
    const endret = vurderFil({ sti: "src/x.tsx", kilde, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: true });
    assert.equal(endret.feil.length, 1);
    assert.match(endret.feil[0], /endret mot origin\/main/);
  });

  test("vurderFil: Rigg med gyldig label eller Avvik med punkt gjør endret fil grønn; .ts-filer krever ikke Rigg/Avvik", () => {
    const medRigg = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html\n * Rigg: PH-01 I dag";
    assert.deepEqual(
      vurderFil({ sti: "src/x.tsx", kilde: medRigg, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: true }).feil,
      [],
    );
    const medAvvik = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html\n * Avvik:\n *   - ingen lys-variant tegnet";
    assert.deepEqual(
      vurderFil({ sti: "src/x.tsx", kilde: medAvvik, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: true }).feil,
      [],
    );
    const libFil = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html";
    const v = vurderFil({ sti: "src/lib/x.ts", kilde: libFil, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: true });
    assert.deepEqual(v.feil, []);
    assert.deepEqual(v.rapport, []);
  });
  ```
- [ ] **Steg 2: Kjør testen — den SKAL feile nå** (modulen finnes ikke):
  ```bash
  npx tsx --test src/lib/__tests__/check-fasit-sitering.test.ts 2>&1 | tail -5
  ```
  Forventet: `Cannot find module '…/scripts/check-fasit-sitering.mjs'` og `fail 1` (hele fila feiler ved import). Ikke commit ennå — commit sammen med skriptet i 5.4.

### Oppgave 5.4: Skriptet `scripts/check-fasit-sitering.mjs`

**Filer:** Create `scripts/check-fasit-sitering.mjs`; Test `src/lib/__tests__/check-fasit-sitering.test.ts` (fra 5.3)
**Grensesnitt:** CLI: `node scripts/check-fasit-sitering.mjs [--liste] [--endret <sti …>]`. Exit 1 ved feil, 0 ellers. Rot = mappen over `scripts/` (`import.meta.dirname`, samme mønster som `scripts/check-ingen-paper.mjs:17`). Baseline: `git diff --name-only origin/main -- src`; finnes ikke `origin/main`, skrives en ADVARSEL og vakten er av for den kjøringen.

- [ ] **Steg 1: Skriv skriptet** med nøyaktig dette innholdet:
  ```js
  #!/usr/bin/env node
  /**
   * Vakt mot fasit-drift (designport fase 1, økt 5 — 05.09.2026).
   *
   * Hver «Fasit:»-sitering i src/ skal peke på en tegning som faktisk finnes i
   * designsystem/train-lock/, som ikke står som utgått i SCREEN-INDEX.md
   * §Kjente hull, og hver skjermfil (.tsx) med Fasit skal enten ha en riggrad
   * (` * Rigg: <label>`) eller en avviksliste (` * Avvik:` + punkter).
   * Konvensjonen: designsystem/train-lock/PORTING.md §0b.
   *
   * Feiler (exit 1) på:
   *   - sitert .dc.html som ikke finnes i designsystem/train-lock/
   *   - sitert .dc.html som står som utgått i SCREEN-INDEX «Kjente hull»
   *   - ` * Rigg:`-label som ikke finnes i tests/visual/skjerm-mapping.ts
   *   - ` * Avvik:` uten minst ett «- »-punkt på linjen under
   *   - .tsx-fil ENDRET mot origin/main (eller oppgitt med --endret) som har
   *     Fasit uten Rigg/Avvik (baseline-vakt)
   * Rapporterer (exit 0):
   *   - antall .tsx-filer med Fasit uten Rigg/Avvik (--liste viser dem)
   *   - antall filer som fortsatt siterer Paper (slettet 30.08.2026)
   *
   * Bruk: node scripts/check-fasit-sitering.mjs [--liste] [--endret <sti …>]
   */
  import fs from "node:fs";
  import path from "node:path";
  import { execFileSync } from "node:child_process";
  import { fileURLToPath } from "node:url";

  const FASIT_MAPPE = "designsystem/train-lock";
  const SCREEN_INDEX = `${FASIT_MAPPE}/SCREEN-INDEX.md`;
  const RIGG_MAPPING = "tests/visual/skjerm-mapping.ts";

  const nfc = (s) => s.normalize("NFC");

  /** Linje som åpner en fasit-sitering: ` * Fasit:`, `// Fasit:`, `Fasit (kanon …):`. */
  export const FASIT_LINJE = /^\s*(?:\*|\/\/|\/\*)?\s*Fasit(?:\s*\([^)]*\))?:/m;

  /**
   * Alle Train-lock-siteringer i en fil: full sti (designsystem/train-lock/…)
   * eller bare filnavn i backticks når navnet starter med en Train-lock-kode
   * (AG-04, S3-03, GAP-1, B3 …). Bare-navn uten kode (`Analyse.dc.html` fra
   * canvas-mappen) telles ikke.
   */
  export function finnTrainLockSiteringer(kilde) {
    const funn = new Set();
    const medSti = /designsystem\/train-lock\/([^\n`'"«»()]+?\.dc\.html)/g;
    for (const m of kilde.matchAll(medSti)) funn.add(nfc(m[1].trim()));
    const bare = /`((?:[A-Z]{1,4}\d?-\d[^`\n/]*?|B[1-5] [^`\n/]*?)\.dc\.html)`/g;
    for (const m of kilde.matchAll(bare)) funn.add(nfc(m[1].trim()));
    return [...funn];
  }

  /** Siteringer av Paper-filer (designsystem/paper/…, slettet 30.08.2026). */
  export function finnPaperSiteringer(kilde) {
    const funn = new Set();
    for (const m of kilde.matchAll(/designsystem\/paper\/[^\s`'"«»()]+\.(?:html|css)/g)) funn.add(m[0]);
    return [...funn];
  }

  /** ` * Rigg: <label>` — én label per linje. */
  export function finnRiggLabels(kilde) {
    const funn = [];
    for (const m of kilde.matchAll(/^\s*(?:\*|\/\/)\s*Rigg:\s*(.+?)\s*$/gm)) funn.push(m[1]);
    return funn;
  }

  /** ` * Avvik:` alene på linjen, med minst ett ` *   - …`-punkt på neste linje. */
  export function finnAvvik(kilde) {
    const linjer = kilde.split("\n");
    for (let i = 0; i < linjer.length; i++) {
      if (/^\s*(?:\*|\/\/)\s*Avvik:\s*$/.test(linjer[i])) {
        const neste = linjer[i + 1] ?? "";
        return { finnes: true, harPunkter: /^\s*(?:\*|\/\/)\s+-\s+\S/.test(neste) };
      }
    }
    return { finnes: false, harPunkter: false };
  }

  /**
   * Utgåtte tegninger fra SCREEN-INDEX §Kjente hull: på hvert kulepunkt teller
   * de `.dc.html`-navnene som står FØR ordet «utgått».
   */
  export function lesUtgaatte(screenIndexTekst) {
    const start = screenIndexTekst.indexOf("## Kjente hull");
    if (start < 0) return [];
    const seksjon = screenIndexTekst.slice(start);
    const utgaatte = [];
    for (const linje of seksjon.split("\n")) {
      if (!linje.startsWith("- ")) continue;
      const idx = linje.search(/utgått/i);
      if (idx < 0) continue;
      for (const m of linje.slice(0, idx).matchAll(/`([^`]+?\.dc\.html)`/g)) utgaatte.push(nfc(m[1]));
    }
    return utgaatte;
  }

  /** Labels i tests/visual/skjerm-mapping.ts (`label: "…"`). */
  export function lesRiggLabels(mappingTekst) {
    return [...mappingTekst.matchAll(/^\s*label:\s*"([^"]+)"/gm)].map((m) => m[1]);
  }

  export function vurderFil({ sti, kilde, fasitFiler, utgaatte, riggLabels, endret }) {
    const feil = [];
    const rapport = [];
    const siteringer = finnTrainLockSiteringer(kilde);
    for (const s of siteringer) {
      if (!fasitFiler.has(s)) feil.push(`${sti} — siterer «${s}», som ikke finnes i ${FASIT_MAPPE}/`);
      else if (utgaatte.has(s)) feil.push(`${sti} — siterer «${s}», som står som utgått i SCREEN-INDEX §Kjente hull`);
    }
    const paper = finnPaperSiteringer(kilde);
    const harFasit = FASIT_LINJE.test(kilde);
    const rigg = finnRiggLabels(kilde);
    for (const r of rigg) {
      if (!riggLabels.has(r)) feil.push(`${sti} — Rigg: «${r}» finnes ikke som label i ${RIGG_MAPPING}`);
    }
    const avvik = finnAvvik(kilde);
    if (avvik.finnes && !avvik.harPunkter) feil.push(`${sti} — Avvik:-blokk uten «- »-punkt på linjen under`);
    const erSkjermfil = sti.endsWith(".tsx");
    const manglerRiggAvvik = erSkjermfil && harFasit && rigg.length === 0 && !avvik.finnes;
    if (manglerRiggAvvik) {
      if (endret) feil.push(`${sti} — endret mot origin/main og har Fasit uten Rigg/Avvik (PORTING.md §0b)`);
      else rapport.push(sti);
    }
    return { feil, rapport, paper: paper.length > 0, harFasit, siteringer };
  }

  function walk(dir, acc = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, acc);
      else if (/\.(tsx|ts)$/.test(e.name)) acc.push(p);
    }
    return acc;
  }

  /** Filer under src/ endret mot origin/main, eller null hvis git/origin/main ikke er tilgjengelig. */
  export function endredeMotOriginMain(rot) {
    try {
      const ut = execFileSync("git", ["diff", "--name-only", "origin/main", "--", "src"], {
        cwd: rot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return new Set(ut.split("\n").filter(Boolean));
    } catch {
      return null;
    }
  }

  export function kjoer({ rot, endredeFiler }) {
    const fasitFiler = new Set(
      fs.readdirSync(path.join(rot, FASIT_MAPPE)).filter((f) => f.endsWith(".dc.html")).map(nfc),
    );
    const utgaatte = new Set(lesUtgaatte(fs.readFileSync(path.join(rot, SCREEN_INDEX), "utf8")));
    const riggLabels = new Set(lesRiggLabels(fs.readFileSync(path.join(rot, RIGG_MAPPING), "utf8")));
    const feil = [];
    const utenRiggAvvik = [];
    let paperFiler = 0;
    let fasitFilerTsx = 0;
    let siteringerTotalt = 0;
    for (const abs of walk(path.join(rot, "src"))) {
      const sti = path.relative(rot, abs);
      const kilde = fs.readFileSync(abs, "utf8");
      const v = vurderFil({ sti, kilde, fasitFiler, utgaatte, riggLabels, endret: endredeFiler.has(sti) });
      feil.push(...v.feil);
      utenRiggAvvik.push(...v.rapport);
      if (v.paper) paperFiler++;
      if (v.harFasit && sti.endsWith(".tsx")) fasitFilerTsx++;
      siteringerTotalt += v.siteringer.length;
    }
    return { feil, utenRiggAvvik, paperFiler, fasitFilerTsx, siteringerTotalt, utgaatte: [...utgaatte] };
  }

  const erHovedmodul = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  if (erHovedmodul) {
    const rot = path.resolve(import.meta.dirname, "..");
    const arg = process.argv.indexOf("--endret");
    let endrede;
    if (arg >= 0) {
      endrede = new Set(process.argv.slice(arg + 1).filter((a) => !a.startsWith("--")));
    } else {
      endrede = endredeMotOriginMain(rot);
      if (endrede === null) {
        console.warn("ADVARSEL: fant ikke origin/main — baseline-vakten er av i denne kjøringen (git fetch origin main).");
        endrede = new Set();
      }
    }
    const r = kjoer({ rot, endredeFiler: endrede });
    console.log(
      `Fasit-sitering: ${r.siteringerTotalt} Train-lock-siteringer · utgått-liste: ${r.utgaatte.join(", ") || "(tom)"}`,
    );
    console.log(
      `  .tsx med Fasit: ${r.fasitFilerTsx} · uten Rigg/Avvik: ${r.utenRiggAvvik.length} · siterer Paper: ${r.paperFiler}`,
    );
    if (process.argv.includes("--liste")) for (const f of r.utenRiggAvvik) console.log(`    ${f}`);
    if (r.feil.length) {
      console.error("\nFEIL — fasit-drift:\n");
      for (const f of r.feil) console.error(`  ${f}`);
      console.error(`\n${r.feil.length} feil. Se designsystem/train-lock/PORTING.md §0b.`);
      process.exit(1);
    }
    console.log("OK: alle Train-lock-siteringer finnes og er gyldige.");
  }
  ```
- [ ] **Steg 2: Testen er grønn.**
  ```bash
  npx tsx --test src/lib/__tests__/check-fasit-sitering.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"
  ```
  Forventet: `ℹ tests 12` · `ℹ pass 12` · `ℹ fail 0`.
- [ ] **Steg 3: Kjør skriptet mot repoet.**
  ```bash
  node scripts/check-fasit-sitering.mjs
  ```
  Forventet (målt 07.09.2026 mot origin/main `8ca1d66ae`):
  ```
  Fasit-sitering: 183 Train-lock-siteringer · utgått-liste: P-05 iPhone Agenda.dc.html
    .tsx med Fasit: 174 · uten Rigg/Avvik: 174 · siterer Paper: 83
  OK: alle Train-lock-siteringer finnes og er gyldige.
  ```
  (Bekreftet ved faktisk kjøring av `kjoer()` mot repoet. Høyere tall er greit hvis en annen økt la til Fasit-linjer før du kommer hit — noter DINE tall, de skal inn i 5.4 steg 6, 5.6 steg 8, 5.7 steg 2 og PR-teksten. Alt annet enn `OK` på siste linje er ikke greit: `FEIL` betyr at noen har sitert en tegning som ikke finnes eller er utgått etter 07.09 — stopp og si fra, ikke rett andres filer i denne økten.)
- [ ] **Steg 4: Bevis at baseline-vakten biter** (simulert, uten å endre fila):
  ```bash
  node scripts/check-fasit-sitering.mjs --endret src/components/portal/v2/MegV2.tsx; echo "exit=$?"
  ```
  Forventet siste linjer:
  ```
    src/components/portal/v2/MegV2.tsx — endret mot origin/main og har Fasit uten Rigg/Avvik (PORTING.md §0b)

  1 feil. Se designsystem/train-lock/PORTING.md §0b.
  exit=1
  ```
- [ ] **Steg 5: tsc og eslint på de nye filene.**
  ```bash
  npx tsc --noEmit && npx eslint --quiet src/lib/__tests__/check-fasit-sitering.test.ts && echo GRONT
  ```
  Forventet: `GRONT`.
- [ ] **Steg 6: Commit.**
  ```bash
  git add scripts/check-fasit-sitering.mjs src/lib/__tests__/check-fasit-sitering.test.ts
  git commit -m "feat(vakt): check-fasit-sitering — Train-lock-siteringer må finnes, ikke være utgått, og endrede skjermfiler må ha Rigg/Avvik

  Kjernelogikk eksportert og dekket av node:test (12 tester). Rapporterer
  antall .tsx med Fasit uten Rigg/Avvik (174 målt 07.09) og Paper-rester (83).

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

### Oppgave 5.5: Inn i `npm run verify` og CI

**Filer:** Modify `package.json` (scripts.verify + nytt `check:fasit-sitering`), Modify `.github/workflows/ci.yml:52–53`
**Grensesnitt:** `npm run check:fasit-sitering`. CI-steget heter `Fasit-sitering gate (designport fase 1 økt 5 — Fasit må finnes, Rigg/Avvik på endrede skjermfiler)`.

- [ ] **Steg 1: package.json — nytt script + inn i verify rett etter Paper-vakten.** Edit, `old_string`:
  ```
    "check:doc-lenker": "node scripts/check-doc-lenker.mjs",
  ```
  `new_string`:
  ```
    "check:doc-lenker": "node scripts/check-doc-lenker.mjs",
    "check:fasit-sitering": "node scripts/check-fasit-sitering.mjs",
  ```
  Deretter Edit i `verify`-strengen. Ankeret er KUN Paper-vakten pluss `&&` — det treffer likt enten økt 1 har lagt `check-v2shell-bredde.mjs` rett bak den eller ikke (`ak-golf-tokens.mjs` står ikke lenger rett bak når økt 1 er inne). `old_string`:
  ```
  node scripts/check-ingen-paper.mjs &&
  ```
  `new_string`:
  ```
  node scripts/check-ingen-paper.mjs && node scripts/check-fasit-sitering.mjs &&
  ```
  Bekreft: `node -e "console.log(require('./package.json').scripts.verify)" | grep -c check-fasit-sitering` → `1`.
- [ ] **Steg 2: ci.yml — hent origin/main og kjør vakten.** Baseline-vakten trenger `origin/main`; `actions/checkout@v4` henter bare PR-commiten (`fetch-depth` 1). Sjekk først om økt 1 har landet: `grep -n "refs/remotes/origin/main" .github/workflows/ci.yml`.
  **A — ingen treff** (økt 1 ikke inne; slik er origin/main `8ca1d66ae` 07.09.2026: 9 steg, `Critical imports gate` på linje 52–53). Edit, `old_string` (linje 52–53):
  ```
        - name: Critical imports gate (bundle + offline-queue export contract)
          run: npm run check:critical-imports
  ```
  `new_string`:
  ```
        - name: Critical imports gate (bundle + offline-queue export contract)
          run: npm run check:critical-imports

        # Baseline-vakten i check-fasit-sitering sammenligner mot origin/main.
        # checkout@v4 henter kun PR-commiten (fetch-depth 1) — hent main grunt.
        - name: Hent origin/main for baseline-vakter
          run: git fetch --no-tags --depth=1 origin +refs/heads/main:refs/remotes/origin/main

        - name: Fasit-sitering gate (designport fase 1 økt 5 — Fasit må finnes, Rigg/Avvik på endrede skjermfiler)
          run: npm run check:fasit-sitering
  ```
  **B — treff** (økt 1 er inne og har allerede steget `Hent origin/main (baseline for signalfarge-vakten i oppgave 1.4)`). IKKE legg inn et nytt fetch-steg. Legg KUN gate-steget inn som siste steg før `- name: Unit tests (node:test + tsx)`, altså etter økt 1s siste vakt-steg (`Fasitdekning-vakt …`), med samme innrykk og én blank linje foran:
  ```
        - name: Fasit-sitering gate (designport fase 1 økt 5 — Fasit må finnes, Rigg/Avvik på endrede skjermfiler)
          run: npm run check:fasit-sitering
  ```
  Gate-steget må stå ETTER fetch-steget i begge varianter — ellers er baseline-vakten av i CI (skriptet skriver bare en ADVARSEL og går grønt).
  (Grunt `git diff` mellom to commits uten felles historikk er et tre-diff og virker; på en PR er utsjekken merge-commiten mot main, så diffen er nøyaktig PR-ens endringer.)
- [ ] **Steg 3: YAML-syntaks.**
  ```bash
  node -e "const y=require('fs').readFileSync('.github/workflows/ci.yml','utf8');console.log((y.match(/^      - name: /gm)||[]).length,'steg')"
  ```
  Forventet: variant A — to flere steg enn før (`9 steg` på origin/main `8ca1d66ae` → `11 steg`); variant B — ett flere. Ingen tabulatorer: `grep -c $'\t' .github/workflows/ci.yml` → `0`.
- [ ] **Steg 4: Commit.**
  ```bash
  git add package.json .github/workflows/ci.yml
  git commit -m "ci(vakt): check-fasit-sitering i npm run verify og i CI (henter origin/main for baseline)

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

### Oppgave 5.6: Pilot — Rigg-linje i de sju filene som allerede har riggrad

**Filer:** Modify `src/components/portal/v2/idag/IDagTrainLock.tsx:10`, `src/app/portal/tren/tester/page.tsx:4`, `src/components/portal/v2/AnalyseHubTrainLock.tsx:5`, `src/components/portal/v2/TrackManListeTrainLock.tsx:6`, `src/components/portal/v2/PlanV2.tsx:6`, `src/components/admin/v2/TrainLockStall.tsx:8`, `src/components/admin/v2/innboks/InnboksSakerTrainLock.tsx:9`
**Grensesnitt:** Labels er ordrett fra `tests/visual/skjerm-mapping.ts:30,41,51,61,71,125,136`. Kun kommentarlinjer — ingen kodeendring, ingen skjermbilde-gate. Disse filene blir «endret mot origin/main» og er dermed de første baseline-vakten faktisk prøver.

- [ ] **Steg 1: IDagTrainLock.tsx.** Edit, `old_string`:
  ```
   * Fasit: designsystem/train-lock/PH-03 I dag tom uke.dc.html
   */
  ```
  `new_string`:
  ```
   * Fasit: designsystem/train-lock/PH-03 I dag tom uke.dc.html
   * Rigg: PH-01 I dag
   */
  ```
- [ ] **Steg 2: tester/page.tsx.** `old_string`:
  ```
   * Fasit: designsystem/train-lock/TE-01L Tester hub lys.dc.html
   *
  ```
  `new_string`:
  ```
   * Fasit: designsystem/train-lock/TE-01L Tester hub lys.dc.html
   * Rigg: TE-01 Tester hub
   *
  ```
- [ ] **Steg 3: AnalyseHubTrainLock.tsx.** `old_string`:
  ```
   * Fasit: designsystem/train-lock/TM-04 Analyse-hub TrackMan.dc.html
   * Fasit: designsystem/train-lock/PH-10 Analyse.dc.html (én flate, innganger under fold)
  ```
  `new_string`:
  ```
   * Fasit: designsystem/train-lock/TM-04 Analyse-hub TrackMan.dc.html
   * Rigg: TM-04a Analyse-hub iPhone
   * Fasit: designsystem/train-lock/PH-10 Analyse.dc.html (én flate, innganger under fold)
  ```
- [ ] **Steg 4: TrackManListeTrainLock.tsx.** `old_string`:
  ```
   * Fasit: designsystem/train-lock/PH-13 TrackMan liste.dc.html
   * Én hvit primær: Last opp. Tom tilstand uten fabrikkerte tall.
  ```
  `new_string`:
  ```
   * Fasit: designsystem/train-lock/PH-13 TrackMan liste.dc.html
   * Rigg: TM-01a Liste iPhone
   * Én hvit primær: Last opp. Tom tilstand uten fabrikkerte tall.
  ```
- [ ] **Steg 5: PlanV2.tsx.** `old_string`:
  ```
   * Fasit: designsystem/train-lock/PH-08 Plan tom uke.dc.html
   *
   * Caps «Uke N · måned»
  ```
  `new_string`:
  ```
   * Fasit: designsystem/train-lock/PH-08 Plan tom uke.dc.html
   * Rigg: PH-07 Plan
   *
   * Caps «Uke N · måned»
  ```
- [ ] **Steg 6: TrainLockStall.tsx.** `old_string`:
  ```
   * ingen egne literal-farger her, TL.* løser lys/mørk via CSS-variablene).
   *
  ```
  `new_string`:
  ```
   * ingen egne literal-farger her, TL.* løser lys/mørk via CSS-variablene).
   * Rigg: AG-04 Stall
   *
  ```
- [ ] **Steg 7: InnboksSakerTrainLock.tsx.** `old_string`:
  ```
   * designport, ikke funksjonsendring.
   *
  ```
  `new_string`:
  ```
   * designport, ikke funksjonsendring.
   * Rigg: AG-03 Innboks
   *
  ```
- [ ] **Steg 8: Vakten er grønn med de sju endrede filene, og tallet har gått ned med sju.**
  ```bash
  git diff --name-only origin/main -- src | wc -l      # → 8 (7 pilotfiler + testfila)
  node scripts/check-fasit-sitering.mjs
  ```
  Forventet nest siste linje: `uten Rigg/Avvik: 167` (174 − 7 — eller ditt tall fra 5.4 steg 3 minus 7) og siste linje `OK: …`. Får du `Rigg: «…» finnes ikke som label`: labelen er skrevet feil — kopier fra `skjerm-mapping.ts`, ikke fra hukommelsen.
- [ ] **Steg 9: Commit.**
  ```bash
  git add src/components/portal/v2/idag/IDagTrainLock.tsx src/app/portal/tren/tester/page.tsx src/components/portal/v2/AnalyseHubTrainLock.tsx src/components/portal/v2/TrackManListeTrainLock.tsx src/components/portal/v2/PlanV2.tsx src/components/admin/v2/TrainLockStall.tsx src/components/admin/v2/innboks/InnboksSakerTrainLock.tsx
  git commit -m "docs(filhode): Rigg-linje i de sju skjermfilene som har riggrad (PORTING §0b pilot)

  Kun kommentarer. PH-01, TE-01, TM-04a, TM-01a, PH-07, AG-04, AG-03.

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

### Oppgave 5.7: Verify, plan-rad, retro, PR og merge

**Filer:** Modify `docs/MASTERPLAN-GJENSTAAENDE.md:742` (rad 20.1), Modify `docs/feillogg.md` (kun hvis noe kostet tid — én linje SIST i fila)
**Grensesnitt:** Ingen.

- [ ] **Steg 1: Full kvalitetsgate.**
  ```bash
  npm run verify > /tmp/verify-okt5.log 2>&1; echo "exit=$?"; grep -n "Fasit-sitering\|FEIL\|error" /tmp/verify-okt5.log | head
  ```
  Forventet: `exit=0` og én linje `Fasit-sitering: … OK` i loggen. (Fra en nøstet worktree uten `node_modules` feiler `npm run build`-delen — da: `npx tsc --noEmit && npx eslint --quiet src && npm test && node scripts/check-fasit-sitering.mjs` lokalt, og CI tar build.)
- [ ] **Steg 2: MASTERPLAN rad 20.1.** Les raden på `origin/main` først (`git show origin/main:docs/MASTERPLAN-GJENSTAAENDE.md | grep -n "^| 20.1 "`) — parallelle økter i fase 1 kan ha rørt den. Edit i raden, `old_string`:
  ```
  filhode-konvensjon + `check-fasit-sitering.mjs`,
  ```
  `new_string`:
  ```
  filhode-konvensjon + `check-fasit-sitering.mjs` (**økt 5 levert 07.09:** PORTING §0b, vakt i verify + CI, 12 tester, 7 pilotfiler med `Rigg:` — 167 skjermfiler gjenstår uten Rigg/Avvik, 83 siterer Paper),
  ```
  (Dato = dagen du merger; 167/83 = tallene fra 5.6 steg 8, ikke planens hvis de avviker.)
- [ ] **Steg 3: Retro i feillogg — kun hvis noe kostet tid.** Praksis i fila (linje 48–73, sist #787) og `/pr` steg 10: nye linjer legges SIST i fila, på samme form som linje 73 (`- ` + dato + `(fase 1 økt 5): …`), datert i dag. Ingen skriver «ren økt»-linjer (0 forekomster). Kostet ingenting tid: ikke rør fila, og ta den ut av `git add` i steg 4.
- [ ] **Steg 4: Commit docs, push, PR, vent på CI, merge, slett gren.**
  ```bash
  node scripts/check-doc-lenker.mjs
  git add docs/MASTERPLAN-GJENSTAAENDE.md      # + docs/feillogg.md BARE hvis steg 3 skrev en linje
  git commit -m "docs(masterplan): marker fase 1 økt 5 levert (filhode-konvensjon + check-fasit-sitering)

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  git push -u origin claude/fase1-okt5-fasit-sitering
  gh pr create --title "feat(vakt): filhode-konvensjon Fasit/Rigg/Avvik + check-fasit-sitering i verify og CI (fase 1 økt 5)" --body "$(cat <<'EOF'
  Designport fase 1, økt 5 (docs/superpowers/plans/2026-09-05-komplett-designport.md §4).

  - PORTING.md §0b: filhodet SKAL ha `Fasit:` + `Rigg:` eller `Avvik:`
  - scripts/check-fasit-sitering.mjs: feiler på ukjent/utgått tegning, ukjent Rigg-label, tom Avvik-blokk, og endrede .tsx med Fasit uten Rigg/Avvik; rapporterer 167 filer uten Rigg/Avvik og 83 Paper-rester (tallene fra 5.6 steg 8)
  - 12 node:test-tester, inn i npm run verify og ci.yml (med grunt fetch av origin/main)
  - Pilot: Rigg-linje i de sju filene som har riggrad
  - Kun kommentarer i src — ingen skjermendring, ingen skjermbilder

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  gh pr checks --watch          # alle grønne, inkl. «Fasit-sitering gate»
  gh pr merge --squash --delete-branch
  ```

### Ferdig når (målbart, med kommando)

1. `node scripts/check-fasit-sitering.mjs; echo $?` på main → siste linje `OK: alle Train-lock-siteringer finnes og er gyldige.` og `0`; nest siste linje viser `uten Rigg/Avvik: 167` (174 målt 07.09 − 7; høyere hvis andre økter la til Fasit-linjer i mellomtiden) og `siterer Paper: 83`.
2. `node scripts/check-fasit-sitering.mjs --endret src/components/portal/v2/MegV2.tsx; echo $?` → `1` med teksten `endret mot origin/main og har Fasit uten Rigg/Avvik`.
3. `npx tsx --test src/lib/__tests__/check-fasit-sitering.test.ts 2>&1 | grep "^ℹ fail"` → `ℹ fail 0` (12 tester).
4. `grep -c "check-fasit-sitering" package.json` → `2` (script + verify) og `grep -c "check:fasit-sitering" .github/workflows/ci.yml` → `1`; `gh run list --workflow=ci.yml --limit 1 --json conclusion --jq '.[0].conclusion'` → `success` etter merge.
5. `grep -n "^## 0b" designsystem/train-lock/PORTING.md` → én linje; `grep -c "Utgått-lista leses maskinelt" designsystem/train-lock/SCREEN-INDEX.md` → `1`.
6. `grep -rlE "^\s*\*\s*Rigg:" src | wc -l` → `7`.
7. `git branch --show-current` → `main`, `git status --short` tom, grenen slettet på GitHub.

### Åpne funn (ting sett underveis — ikke løs dem her)

- **83 filer siterer Paper** (`designsystem/paper/…`, slettet 30.08). Vakten rapporterer dem uten å blokkere, siden alternativet var rød verify fra dag én. Porten deres er fase 2–7; når en familie er portert, kan `finnPaperSiteringer` gjøres blokkerende for den mappen.
- **SCREEN-INDEX sier P-05 «gjelder kun telefon-Workbench (agenda)»**, mens planen, #788 og denne vakten behandler P-05 som utgått fullt ut. Etter #788 er den ikke sitert noe sted, så konflikten er sovende — men teksten på linje 283 bør rettes når neste utgått-fil legges inn.
- **Siteringer utenfor Train-lock valideres ikke:** `designsystem/canvas/agencyos-ia/*.dc.html` (TrainLockCockpit, `admin/agencyos/page.tsx`, `admin/analyse/page.tsx`, JarvisHode), `designsystem/team-norway/…` (team-norway/core.tsx), `designsystem/ak-golf/…` (MarkedFot/MarkedNav) og «showroom»/`jarvis/*.html` (struktur.tsx, tilbakemelding.tsx, SakArtefakt, KalendervaktArtefakt). Kort å legge til en eksistenssjekk på `designsystem/`-stier generelt; ikke gjort fordi canvas-fasiter er egen beslutning (7, skallsvaret).
- **`WorkbenchUke.tsx:6` bruker «Fasit (kanon …):» + tekstprosa om avvik («Kjente avvik mot WB-01», linje 18)** — ikke `Avvik:`-formen. Den rapporteres nå som «uten Rigg/Avvik» og blir blokkert første gang den endres; retting er 3 linjer, men hører til Workbench-økten (fase 3), ikke her.
- **`AdminProfilTrainLock.tsx` (siterer AG-05, skal være AG-18) og `AdminComplianceV2.tsx` (EC-02-sitatet skal bort)** er fase 1 økt 8 sin jobb (planens punkt 8) — vakten fanger dem ikke, fordi begge filene finnes. Etter økt 8 kan AG-05 vurderes ført på utgått-lista (designbeslutning, planens «Ikke i fase 1»).
- **`docs/superpowers/plans/2026-09-05-designport-fase-1.md`** (MASTERPLAN 20.1 peker dit) finnes nå i repoet (bekreftet 06.09.2026 — orkestratoren lenker riktig til denne øktplanen som rad 5, og `check-doc-lenker.mjs` er grønt). Punktet over var åpent ved skriving av denne planen 05.09; en annen økt har siden løst det.
- **Riggradene for PH-21a/b/c (#789) og S3-03a/b (#787)** har filer (`MinKurveTrainLock.tsx`, `SpillerOversiktV2.tsx`) uten `Rigg:`-linje. Bevisst utelatt fra piloten, som er avgrenset til de sju filene i 5.6 — #787 og #789 er nå begge merget (06.09.2026), så dette er ikke lenger en pågående-PR-hensyn, bare et scope-valg. Rigg-linjen blir tvunget inn ved neste endring av filene.
- **Økt 1 og økt 5 rører de samme to stedene** (verify-strengen rett bak `check-ingen-paper.mjs`; CI-stegene mellom `Critical imports gate` og `Unit tests`), og økt 1 legger selv inn et «Hent origin/main»-steg. 5.5 er skrevet betinget (A/B). Lander økt 5 FØRST, må økt 1 gjenbruke «Hent origin/main for baseline-vakter» i stedet for å legge inn sitt eget — det er økt 1s skeptiker sin jobb, ikke denne planens.
- **Økt 7 (7.6) redigerer `PORTING.md:140–142` og `:152–153` etter linjenummer.** §0b i 5.1 skyver alt under §0 ned med ~60 linjer. Lander økt 5 først, må økt 7 finne radene med grep, ikke etter tall.
- **Testfila importerer `.mjs` fra `scripts/`** — første test i repoet som gjør det (`admin-capability-kontrakt.test.ts` nevner bare skriptet i prosa). `tsc` og `eslint` er verifisert grønne på mønsteret 05.09, men `scripts/` er utenfor `eslint --quiet src` — selve skriptet lintes ikke.
