
# Fase 1 · Økt 7 — Slett døde Paper-verktøy, rett vaktene som peker på Paper

**Mål:** Etter økta finnes ingen fil i repoet som leser, importerer eller siterer `designsystem/paper/` som verktøykjede. De døde galleri-/typografi-skriptene og de 108 `paper-visual`-spec-ene er borte, `check-token-gap.mjs` snakker om `--tl-*`/`TL`, `kvalitet.mjs` varsler ikke lenger mot Paper-skalaen, og MASTERPLAN 2.1 peker på Train-lock-riggen. `npm run verify` og `npx playwright test --list` er grønne.

**Forutsetninger:**
- Alt målt 05.09.2026 mot `origin/main` = `b0595b304`, **re-verifisert 06.09.2026 mot `origin/main` = `c1c3396eb`** — alle linjenumre, tellinger og forventede utskrifter under gjelder den. PR #787, #788 og #789 er MERGET og ligger i `c1c3396eb` (`gh pr view 787 --json state -q .state` → `MERGED`, samme for 788/789). Ingen av dem rører filene i denne økta (787: `tests/visual/skjerm-mapping.ts` + docs/design-audit + `docs/feillogg.md` + MASTERPLAN-rader under STEG 15; 788: `WorkbenchV2*.tsx`; 789: `MinKurve*`, `min-kurve*`, `seed-ph21-*`, `skjerm-mapping.ts`). Grenen lages fra `origin/main` ETTER at de er inne, så det er ingen rebase å ta. NB: #787/#789 la fem nye rader i `skjerm-mapping.ts` (S3-03a/b, PH-21a/b/c) — tallene i 2.1-teksten i 7.6 er oppdatert til 10 av 17 (målt 06.09).
- Fersk gren: `git fetch origin && git checkout -b claude/fase1-okt7-slett-paper-verktoy origin/main`
- Kjør fra repo-roten med absolutte stier. Jobber du i en worktree uten `.env.local`: kopier ALDRI `.env*` inn — sett `export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=$DIRECT_URL` i skallet før `npm run verify` (gotchas.md §Aldri kopier .env*). `$SCRATCH` = scratchpad-mappa fra systemprompten (loggfiler i 7.2, 7.4 og 7.7): `export SCRATCH=<sti>` først.
- Stage alltid navngitte filer. Aldri `git add -A`.
- Kodeblokkene under er innrykket to mellomrom fordi de står i lister — fjern innrykket før kjøring (heredoc-terminatoren `EOF` må stå i kolonne 0). Plandokumentet `docs/superpowers/plans/2026-09-05-komplett-designport.md` kommer inn på `main` med PR #790 (OPEN per 06.09, kun de to `komplett-designport*`-filene; `gh pr view 790 --json state -q .state`). Denne planen lenker uansett ikke til det med `docs/`-sti i MASTERPLAN (`check-doc-lenker.mjs` feiler på lenker til filer som ikke finnes) — planen nevnes i klartekst.

---

### Oppgave 7.1: Slett galleri-skriptene, typografi-vakten og paper-visual

**Filer:**
- Delete: `scripts/signoff-gallery.mjs` (308 linjer, `FASIT_DIR = "designsystem/paper/fase1"` på linje 24)
- Delete: `scripts/signoff-gallery-bolger.mjs` (297 linjer, samme `FASIT_DIR` på linje 25)
- Delete: `scripts/signoff-side.mjs` (315 linjer, leser `scripts/signoff-gallery.mjs` — kommentar linje 1, `const GALLERI` linje 32)
- Delete: `scripts/paper-diff-maal.mjs` (leser `scripts/signoff-gallery.mjs` på linje 24 og `designsystem/paper/fase1` på linje 17 — dør sammen med galleriet; ingen andre filer refererer den)
- Delete: `scripts/check-typografi.mjs` (62 linjer, importerer `./typografi-skala.mjs`, siterer slettede `docs/port/typografi-skala-paper.md`)
- Delete: `scripts/typografi-skala.mjs` (51 linjer, «utledet fra Paper-fasiten»; eneste andre leser er `.claude/hooks/kvalitet.mjs`, som rettes i 7.3)
- Delete: `tests/e2e/_paper-fasit-helpers.ts` (82 linjer; eneste importører er de 108 spec-ene under — pluss to kommentar-omtaler i `signoff-gallery.mjs:190/194`, som slettes samtidig)
- Delete: `tests/e2e/paper-visual/` (109 filer: 108 `*.visual.spec.ts` + `README.md`)

**Grensesnitt:** Ingen — alt er ferdig dødt. Ingen `package.json`-script peker på noen av filene (verifisert: `grep -n "signoff-gallery\|signoff-side\|typografi\|paper-diff\|paper-visual" package.json` → 0 treff; `verify`-kjeden på linje 15 nevner ingen av dem).

- [ ] **Steg 1: Bevis at ingenting levende peker på filene før sletting**
  ```bash
  grep -rln "signoff-gallery\|signoff-side\|paper-diff-maal\|check-typografi\|typografi-skala\|_paper-fasit-helpers\|paper-visual" \
    --include='*.md' --include='*.json' --include='*.mjs' --include='*.ts' --include='*.tsx' --include='*.yml' . \
    | sed 's#^\./##' | grep -v "node_modules\|^\.next/\|^tests/e2e/paper-visual/\|^docs/superpowers/plans/" | sort
  ```
  Forventet nøyaktig disse 17 linjene (målt 06.09 på `c1c3396eb`; alle håndteres i 7.1–7.6. `sed` fjerner `./`-prefikset, som vanlig grep skriver men Claude Codes grep-wrapper (ugrep) ikke gjør — derfor ingen `^./`-anker i filtrene):
  ```
  .claude/hooks/kvalitet.mjs
  designsystem/train-lock/PORTING.md
  docs/MASTERPLAN-GJENSTAAENDE.md
  docs/feillogg.md
  docs/platform/DO-NOT-USE-PAPER.md
  playwright.config.ts
  scripts/check-typografi.mjs
  scripts/paper-diff-maal.mjs
  scripts/shot-drift-2026-08-13.mjs
  scripts/signoff-gallery-bolger.mjs
  scripts/signoff-gallery.mjs
  scripts/signoff-side.mjs
  scripts/signoff-trainlock.mjs
  scripts/stikkprove-trainlock.mjs
  scripts/typografi-skala.mjs
  tests/e2e/_paper-fasit-helpers.ts
  tests/visual/README.md
  ```
  (`docs/feillogg.md:16` nevner `portal-analysere.visual.spec.ts` som historikk i en datert logglinje — rettes ikke, se Åpne funn. `.github/workflows/*.yml` har ingen treff: `grep -n -i "paper\|signoff\|typografi" .github/workflows/*.yml` → tom.)

- [ ] **Steg 2: Slett med git rm**
  ```bash
  git rm -q scripts/signoff-gallery.mjs scripts/signoff-gallery-bolger.mjs scripts/signoff-side.mjs \
    scripts/paper-diff-maal.mjs scripts/check-typografi.mjs scripts/typografi-skala.mjs \
    tests/e2e/_paper-fasit-helpers.ts
  git rm -rq tests/e2e/paper-visual
  git status --short | grep -c "^D "
  ```
  Forventet: `116` (7 enkeltfiler + 109 i mappa). Lokale, gitignorerte `*-snapshots/`-mapper finnes ikke (`find tests/e2e/paper-visual -type d -name "*-snapshots" | wc -l` ga `0` 05.09) — men kjør `rm -rf tests/e2e/paper-visual` etterpå uansett, så mappa er borte fra disk selv om noen har generert bilder lokalt.

- [ ] **Steg 3: Bekreft at ingen kode-fil importerer det som er slettet**
  ```bash
  grep -rn "_paper-fasit-helpers\|typografi-skala" --include='*.ts' --include='*.tsx' --include='*.mjs' src tests scripts .claude
  ```
  Forventet: fire linjer, alle i `.claude/hooks/kvalitet.mjs` — 10, 11 og 46 er kommentar/varseltekst, 34 er `const skalaSti = join(rot, "scripts", "typografi-skala.mjs");` (alt rettes i 7.3). Ingen andre filer.

- [ ] **Steg 4: Commit**
  ```bash
  git commit -m "chore(design): slett døde Paper-verktøy — galleri, paper-diff, typografi-vakt, paper-visual (fase 1 økt 7)

  signoff-gallery(-bolger).mjs, signoff-side.mjs og paper-diff-maal.mjs leste
  designsystem/paper/fase1, som er slettet 30.08.2026. check-typografi.mjs og
  typografi-skala.mjs målte mot Paper-skalaen (historikk siden 25.08).
  tests/e2e/paper-visual/ (108 spec-er) + _paper-fasit-helpers.ts åpnet
  designsystem/paper/*.html fra disk. Sign-off måles nå med
  scripts/train-lock-pixel-diff.mjs + tests/visual/skjerm-mapping.ts.

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 7.2: Fjern paper-visual-unntaket i playwright.config.ts

**Filer:**
- Modify: `playwright.config.ts:10–23` (`testIgnore`-blokken; linje 15–22 er en kommentar + `...(isCI ? ["**/paper-visual/**"] : [])`)

**Grensesnitt:** `isCI` brukes fortsatt på linje 26, 27, 28 og 49 — skal IKKE fjernes.

- [ ] **Steg 1: Baseline før endring**
  ```bash
  npx playwright test --list --project=chromium 2>&1 | tail -1
  ```
  Forventet (etter 7.1): `Total: 142 tests in 38 files` (05.09 på `b0595b304`: 574 tester i 146 filer, hvorav paper-visual sto for 432 i 108). Er andre `tests/e2e/*.spec.ts` merget i mellomtiden er tallet høyere — kravet er at kommandoen ikke feiler og at `... | grep -c paper-visual` gir `0`.

- [ ] **Steg 2: Bytt ut blokken**
  Gammel tekst (linje 10–23, ordrett):
  ```ts
    testIgnore: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.vercel/**",
      "**/_arkiv/**",
      // Paper-visuelle tester er et LOKALT verktøy for designporten: de
      // sammenligner mot referansebilder som er gitignorert (og bare finnes for
      // -darwin), og flere av dem krever innlogget spiller. I CI finnes verken
      // bildene eller credentials. 06.–15.08.2026 sto prod-røyktesten rød i 195
      // kjøringer på rad fordi ÉN slik spec manglet skip-vakten sin — signalet
      // «produksjon er ødelagt» ble dermed verdiløst. Denne linja gjør det
      // strukturelt umulig å gjenta, uavhengig av vakter i den enkelte fila.
      ...(isCI ? ["**/paper-visual/**"] : []),
    ],
  ```
  Ny tekst:
  ```ts
    testIgnore: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.vercel/**",
      "**/_arkiv/**",
      // Lærdom 06.–15.08.2026: prod-røyktesten sto rød i 195 kjøringer fordi én
      // lokal snapshot-spec (paper-visual, slettet 05.09.2026) manglet skip-vakt.
      // Regel: tester som trenger credentials eller gitignorerte referansebilder
      // hører ALDRI hjemme under tests/e2e/ — de ligger i tests/visual/ og
      // kjører ikke i CI.
    ],
  ```

- [ ] **Steg 3: Verifiser**
  ```bash
  npx tsc --noEmit -p tsconfig.json > "$SCRATCH/tsc.log" 2>&1; echo "tsc exit=$?"; tail -1 "$SCRATCH/tsc.log"
  npx playwright test --list --project=chromium 2>&1 | tail -1
  grep -c "paper-visual" playwright.config.ts
  ```
  Forventet: `tsc exit=0`, samme `Total:`-linje som steg 1, og `1` (kun den historiske kommentaren — ingen glob).

- [ ] **Steg 4: Commit**
  ```bash
  git add playwright.config.ts
  git commit -m "chore(e2e): fjern paper-visual-unntaket i playwright.config — mappa er slettet

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 7.3: Fjern typografi-delen av kvalitet.mjs, behold eslint-gaten

**Filer:**
- Modify: `.claude/hooks/kvalitet.mjs` (89 linjer). Typografi-delen er linje 9–11 (doc-kommentar), 16–17 (`dirname/join`, `fileURLToPath/pathToFileURL` — brukes kun av vakten), 29–55 (hele `typografiVarsel`-blokken med `await import` av `typografi-skala.mjs`), 72 (`varsel`-tillegget i feilmeldingen) og 79–88 (`hookSpecificOutput`-utskriften). Eslint-delen (linje 57–70) og stdin-parsingen (19–27) er uendret.
- Hook-registreringen i `.claude/settings.json:66` (`node "$CLAUDE_PROJECT_DIR/.claude/hooks/kvalitet.mjs"`) røres ikke.

**Grensesnitt:** Hooken leser fortsatt `{"tool_input":{"file_path":…}}` på stdin, exit 2 ved eslint-feil, exit 0 ellers.

- [ ] **Steg 1: Test først — vis at vakten er aktiv i dag (baseline)**
  ```bash
  echo '{"tool_input":{"file_path":"src/app/inviter/forelder/[token]/page.tsx"}}' | node .claude/hooks/kvalitet.mjs; echo; echo "exit=$?"
  ```
  Forventet i dag (målt 05.09): JSON `{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"Typografi-advarsel (blokkerer ikke) for src/app/inviter/forelder/[token]/page.tsx — 1 fontSize utenfor den målte skalaen: linje 107: fontSize 30px. OBS: skalaen er fra Paper-porten …"}}` og `exit=0`. Etter 7.1 feiler `await import` av den slettede skalaen stille (try/catch) — utskriften er da tom, men koden er fortsatt død vekt som peker på en slettet fil.

- [ ] **Steg 2: Skriv hele fila på nytt**
  ```bash
  cat > .claude/hooks/kvalitet.mjs <<'EOF'
  #!/usr/bin/env node
  /**
   * PostToolUse-hook — kvalitetsgate nivå 3 (Agentic OS Steg 6).
   * Etter hver Edit/Write på .ts/.tsx: kjør eslint på filen.
   * Feil rapporteres tilbake til Claude (exit 2) så de fikses umiddelbart —
   * samme gate som lint-staged/CI, bare tidligere i loopen.
   * Mangler node_modules (f.eks. fersk container): hopp stille over eslint.
   * (2026-07-25: hex-gaten er fjernet — gammel designkanon avviklet.)
   * (2026-09-05: typografi-vakten er fjernet — den målte inline fontSize mot
   * Paper-skalaen, som er historikk siden 25.08.2026. Train-lock (--tl-* / TL)
   * er designfasit; denne hooken vokter ikke typografi lenger.)
   */

  import { execFileSync } from "node:child_process";
  import { existsSync, readFileSync } from "node:fs";

  let input;
  try {
    input = JSON.parse(readFileSync(0, "utf-8"));
  } catch {
    process.exit(0);
  }

  const sti = String(input.tool_input?.file_path ?? "");
  if (!/\.(ts|tsx)$/.test(sti) || !/(^|\/)src\//.test(sti)) process.exit(0);

  const feil = [];

  if (existsSync("node_modules/.bin/eslint")) {
    try {
      execFileSync("node_modules/.bin/eslint", ["--quiet", "--no-warn-ignored", sti], {
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 60_000,
      });
    } catch (err) {
      const ut = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
      if (ut) feil.push(`eslint:\n${ut}`);
    }
  }

  if (feil.length > 0) {
    process.stderr.write(
      `Kvalitetsgate (nivå 3) feilet for ${sti} — fiks FØR du går videre:\n\n${feil.join("\n\n")}\n`,
    );
    process.exit(2);
  }

  process.exit(0);
  EOF
  wc -l .claude/hooks/kvalitet.mjs
  ```
  Forventet: `48 .claude/hooks/kvalitet.mjs`.

- [ ] **Steg 3: Test etter — tre tilfeller**
  ```bash
  # (a) fil utenfor src/: stille exit 0
  echo '{"tool_input":{"file_path":"scripts/check-token-gap.mjs"}}' | node .claude/hooks/kvalitet.mjs; echo "a exit=$?"
  # (b) lint-ren src-fil med fontSize 30 (før: typografi-JSON): nå ingen utskrift, exit 0
  echo '{"tool_input":{"file_path":"src/app/inviter/forelder/[token]/page.tsx"}}' | node .claude/hooks/kvalitet.mjs; echo "b exit=$?"
  # (c) eslint-feil gir fortsatt exit 2
  printf 'export const x: any = 1;\n' > src/_probe-kvalitet.ts
  echo '{"tool_input":{"file_path":"src/_probe-kvalitet.ts"}}' | node .claude/hooks/kvalitet.mjs; echo "c exit=$?"
  rm src/_probe-kvalitet.ts
  grep -c "typografi\|pathToFileURL\|hookSpecificOutput" .claude/hooks/kvalitet.mjs
  ```
  Forventet: `a exit=0` (tom), `b exit=0` (tom — ingen JSON lenger), `c exit=2` med `Kvalitetsgate (nivå 3) feilet for src/_probe-kvalitet.ts` + eslint-utskrift om `no-explicit-any` på stderr, og `2` fra grep (ordet «typografi» på to linjer i den daterte doc-kommentaren, ingen kode). `git status --short src/` skal være tom etter `rm`.

- [ ] **Steg 4: Commit**
  ```bash
  git add .claude/hooks/kvalitet.mjs
  git commit -m "chore(hooks): kvalitet.mjs slutter å varsle mot Paper-skalaen — kun eslint igjen

  Typografi-vakten importerte scripts/typografi-skala.mjs (slettet) og siterte
  docs/port/typografi-skala-paper.md (slettet 27.08). Train-lock er fasit.

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 7.4: check-token-gap.mjs mister Paper-unntakene og sier TL/--tl-*

**Filer:**
- Modify: `scripts/check-token-gap.mjs` — seks blokker: linje 1–8 (hode), 17–26 (`ALLOW_FILES`), 39–43 (PORT 2-kommentar), 95–97 (`ALLOW_MARKUP`-kommentar for del-runde-modal), 170–178 (Presis-melding), 180–188 (style-melding). Logikken (regex, `walk`, `extractStyleBlocks`) er uendret.

**Grensesnitt:** `npm run check:token-gap` / `node scripts/check-token-gap.mjs` — exit 0 + linjen `check-token-gap: ingen Presis-farger, ingen hex i style={{}}, className eller SVG.`; exit 1 med melding ved funn. Kjøres i `npm run verify` (package.json:15) og `ci.yml:50`.

- [ ] **Steg 1: Baseline**
  ```bash
  node scripts/check-token-gap.mjs; echo "exit=$?"
  ```
  Forventet: `check-token-gap: ingen Presis-farger, ingen hex i style={{}}, className eller SVG.` og `exit=0` (målt 05.09).

- [ ] **Steg 2: Hodet (linje 1–8)** — bytt ordrett:
  Gammel:
  ```js
  #!/usr/bin/env node
  // Designport steg 10 — lint-porten mot nye hardkodede farger.
  // Steg 6 (PR #274) sentraliserte alle 419 daværende fargeliteraler i
  // style={{}} til T.farge.* (src/lib/v2/tokens.ts). Denne gaten hindrer at
  // nye rå fargeverdier siger inn igjen og overstyrer Paper-paletten.
  // Metode fra docs/port/fase4-token-gap-analyse.md §6-8 (tmp-gap-3-match.mjs,
  // aldri committet — dette er den permanente varianten).
  // Kjør: node scripts/check-token-gap.mjs
  ```
  Ny:
  ```js
  #!/usr/bin/env node
  // Lint-porten mot nye hardkodede farger (designport steg 10, PR #274).
  // All farge i src/ går via Train-lock-tokenene: `--tl-*` i CSS/className
  // (src/styles/train-lock-tokens.css) og `TL` i TS (src/lib/v2/train-lock.ts),
  // pluss domeneverdiene i `AK` (src/lib/v2/ak-palett.ts). Denne gaten hindrer
  // at rå fargeverdier siger inn igjen og overstyrer Train-lock-paletten.
  // (Det gamle tokensettet fra før 30.08.2026 er slettet — scripts/check-ingen-paper.mjs
  // vokter at det ikke kommer tilbake.)
  // Kjør: node scripts/check-token-gap.mjs
  ```

- [ ] **Steg 3: `ALLOW_FILES` (linje 17–26)** — de to første oppføringene peker på filer som ikke finnes (`ls src/lib/v2/tokens.ts src/styles/paper-tokens.css` → `No such file`). Bytt ordrett:
  Gammel:
  ```js
  /** Filer/mønstre der rå farger er legitime (tokendefinisjonen selv, ikke bruk av den). */
  const ALLOW_FILES = new Set([
    "src/lib/v2/tokens.ts",
    "src/styles/paper-tokens.css", // ikke .tsx, men listet for lesbarhet
    // global-error rendrer sin egen <html> UTEN root-layout — globals.css/
    // paper-tokens.css lastes ikke garantert der, så var(--p-*) kan være
    // udefinert. Fila MÅ bære Paper-paletten som rå verdier (samme hex som
    // tokenfila). Gaten skal ikke tvinge en feilside som mister fargene sine.
    "src/app/global-error.tsx",
  ]);
  ```
  Ny:
  ```js
  /**
   * Filer der rå farger i style={{}} er legitime. Tokendefinisjonene selv trenger
   * ikke unntak: gaten leser bare style={{}}-blokker (og className/SVG under
   * src/components + src/app), og src/lib/v2/train-lock.ts / ak-palett.ts har
   * ingen slike. src/styles/train-lock-tokens.css er .css, utenfor vandringen.
   */
  const ALLOW_FILES = new Set([
    // global-error rendrer sin egen <html> UTEN root-layout — globals.css og
    // train-lock-tokens.css lastes ikke garantert der, så var(--tl-*) kan være
    // udefinert. Fila MÅ bære fargene sine som rå verdier. Gaten skal ikke
    // tvinge en feilside som mister fargene sine.
    "src/app/global-error.tsx",
  ]);
  ```

- [ ] **Steg 4: PORT 2-kommentaren (linje 39–40)** — bytt de to linjene ordrett:
  Gammel:
  ```
   * Forest #005840 og lime #D1F843 er den gamle Presis-paletten. Paper er
   * eneste designfasit (CLAUDE.md invariant 2), så disse to skal ikke finnes
  ```
  Ny:
  ```
   * Forest #005840 og lime #D1F843 er den gamle Presis-paletten. Train-lock er
   * eneste designfasit (CLAUDE.md invariant 2), så disse to skal ikke finnes
  ```

- [ ] **Steg 5: `ALLOW_MARKUP`-kommentaren for del-runde-modal (linje 95–96)** — fila bruker `from-[#141413] to-[#26241f]` på linje 379. Bytt ordrett:
  Gammel:
  ```js
    // Delekortet eksporteres som bilde og fanges utenfor tema-konteksten;
    // gradienten må derfor være faste Paper-verdier (= T.wrapped.bgForest).
  ```
  Ny:
  ```js
    // Delekortet eksporteres som bilde og fanges utenfor tema-konteksten;
    // gradienten må derfor være faste hex-verdier (#141413 → #26241f), ikke
    // tema-tokens som kan være udefinert i eksportkonteksten.
  ```

- [ ] **Steg 6: Feilmeldingene (linje 172–176 og 182–186)** — bytt ordrett:
  Gammel (Presis):
  ```js
      "check-token-gap: avviklede Presis-farger funnet (hex, rgb() eller hsl-triplett).\n" +
        "Paper er eneste designfasit — bruk et semantisk --p-*-token valgt etter\n" +
        "FUNKSJON (opp/ned/info/kategori), ikke etter fargelikhet.\n"
  ```
  Ny:
  ```js
      "check-token-gap: avviklede Presis-farger funnet (hex, rgb() eller hsl-triplett).\n" +
        "Train-lock er eneste designfasit — bruk et semantisk --tl-*-token (CSS) eller\n" +
        "TL.* (TS) valgt etter FUNKSJON (opp/ned/info/kategori), ikke etter fargelikhet.\n"
  ```
  Gammel (style):
  ```js
      "check-token-gap: nye hardkodede fargeliteraler i style={{}} funnet.\n" +
        "Bruk T.farge.* (src/lib/v2/tokens.ts) i stedet — legg til en navngitt\n" +
        "konstant der om verdien mangler. Se docs/port/steg6-farge-literaler.md.\n"
  ```
  Ny:
  ```js
      "check-token-gap: nye hardkodede fargeliteraler i style={{}} funnet.\n" +
        "Bruk TL.* (src/lib/v2/train-lock.ts) eller var(--tl-*) i stedet; domeneverdier\n" +
        "(pyramideakser, tee-farger, merkefarger) ligger i AK (src/lib/v2/ak-palett.ts).\n" +
        "Ingen nye tokens uten Anders' ja (CLAUDE.md invariant 2).\n"
  ```

- [ ] **Steg 7: Test — grønn kjøring, negativ prøve, og null Paper-rester**
  ```bash
  node scripts/check-token-gap.mjs; echo "exit=$?"
  printf 'export function P() { return <div style={{ color: "#123456" }} />; }\n' > src/_probe-token-gap.tsx
  node scripts/check-token-gap.mjs > "$SCRATCH/gap.log" 2>&1; echo "exit=$?"; head -4 "$SCRATCH/gap.log"
  rm src/_probe-token-gap.tsx
  grep -n "T\.farge\|src/lib/v2/tokens\.ts\|paper-tokens\|--p-\|docs/port\|Paper" scripts/check-token-gap.mjs | wc -l
  ```
  Forventet: første kjøring `check-token-gap: ingen Presis-farger, ingen hex i style={{}}, className eller SVG.` + `exit=0`; andre kjøring gir `exit=1` (skrives før loggen — `PIPESTATUS` finnes ikke i zsh, derfor loggfil) og loggen starter med `check-token-gap: nye hardkodede fargeliteraler i style={{}} funnet.` fulgt av `Bruk TL.* (src/lib/v2/train-lock.ts) eller var(--tl-*) i stedet; …` og `  src/_probe-token-gap.tsx: #123456`; grep-tellingen `0`. `git status --short src/` tom etter `rm`.

- [ ] **Steg 8: Commit**
  ```bash
  git add scripts/check-token-gap.mjs
  git commit -m "chore(vakt): check-token-gap peker på TL/--tl-*, mister døde Paper-unntak

  ALLOW_FILES listet src/lib/v2/tokens.ts og src/styles/paper-tokens.css
  (begge slettet 30.08). Meldingene ba om T.farge.* og --p-*.

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 7.5: Rett kommentarene i tre gjenlevende skript som siterer signoff-gallery.mjs

**Filer:**
- Modify: `scripts/signoff-trainlock.mjs:1–5` (hodekommentar sier «signoff-gallery.mjs sammenligner mot designsystem/paper/fase1/ … Dette skriptet er samme motor»)
- Modify: `scripts/stikkprove-trainlock.mjs:3` («Basert på login-/shot-mønsteret i signoff-gallery.mjs»)
- Modify: `scripts/shot-drift-2026-08-13.mjs:3` («Gjenbruker innloggingsmønsteret fra signoff-gallery.mjs») og `:12` (`OUT = "screenshots/paper/drift-2026-08-13"`)

**Grensesnitt:** Ingen kodeendring — kun kommentarer og én utkatalog-streng i et datert engangsskript. `screenshots/` er gitignorert (`.gitignore:123`).

- [ ] **Steg 1: signoff-trainlock.mjs** — bytt linje 1–5 ordrett:
  Gammel:
  ```js
  // Sign-off-galleri mot TRAIN-LOCK-fasiten (ikke Paper).
  //
  // signoff-gallery.mjs sammenligner mot designsystem/paper/fase1/, som er arkiv
  // siden 25.08.2026. PX-portene måles mot designsystem/train-lock/*.dc.html.
  // Dette skriptet er samme motor med riktig fasitkatalog.
  ```
  Ny:
  ```js
  // Sign-off-galleri mot Train-lock-fasiten: rask VISUELL oversikt (app + fasit,
  // m390/d1280, lys/mørk) — måler ingenting. Tallet per skjerm kommer fra
  // scripts/train-lock-pixel-diff.mjs + tests/visual/skjerm-mapping.ts.
  //
  // Fasit er designsystem/train-lock/*.dc.html. (Det gamle Paper-galleriet
  // signoff-gallery.mjs er slettet 05.09.2026 — dette er eneste galleri igjen.)
  ```

- [ ] **Steg 2: stikkprove-trainlock.mjs** — bytt linje 3 ordrett:
  Gammel: `// mot prod, 390+1280, lys+mørk. Basert på login-/shot-mønsteret i signoff-gallery.mjs.`
  Ny: `// mot prod, 390+1280, lys+mørk. Samme login-/shot-mønster som signoff-trainlock.mjs.`

- [ ] **Steg 3: shot-drift-2026-08-13.mjs** — bytt linje 3 og 12 ordrett:
  Gammel linje 3: `// Gjenbruker innloggingsmønsteret fra signoff-gallery.mjs.`
  Ny linje 3: `// Samme innloggingsmønster som signoff-trainlock.mjs. Engangsskript, datert.`
  Gammel linje 12: `const OUT = "screenshots/paper/drift-2026-08-13";`
  Ny linje 12: `const OUT = "screenshots/drift-2026-08-13";`

- [ ] **Steg 4: Verifiser**
  ```bash
  node --check scripts/signoff-trainlock.mjs && node --check scripts/stikkprove-trainlock.mjs && node --check scripts/shot-drift-2026-08-13.mjs && echo SYNTAKS-OK
  grep -rn "signoff-gallery\|signoff-side\|paper-diff-maal\|typografi-skala\|_paper-fasit-helpers\|screenshots/paper" scripts src tests .claude playwright.config.ts | wc -l
  ```
  Forventet: `SYNTAKS-OK` og `1` — det ene treffet er den daterte «slettet 05.09.2026»-kommentaren i `signoff-trainlock.mjs` (steg 1). Ingen kode-sti.

- [ ] **Steg 5: Commit**
  ```bash
  git add scripts/signoff-trainlock.mjs scripts/stikkprove-trainlock.mjs scripts/shot-drift-2026-08-13.mjs
  git commit -m "chore(scripts): kommentarer peker ikke lenger på slettet signoff-gallery.mjs

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 7.6: Dokumenter — MASTERPLAN 2.1 og 0.2, DO-NOT-USE-PAPER, PORTING.md, tests/visual/README.md

**Filer:**
- Modify: `docs/MASTERPLAN-GJENSTAAENDE.md:164` (rad 2.1, én lang linje) og `:39` (rad 0.2)
- Modify: `docs/platform/DO-NOT-USE-PAPER.md:17–18` (blokksitat) og `:28` (tabellrad «Paper visuell-e2e»)
- Modify: `designsystem/train-lock/PORTING.md:140–142` og `:152–153`
- Modify: `tests/visual/README.md:8`, `:19–21`, `:38–40`

**Grensesnitt:** `scripts/check-doc-lenker.mjs` sjekker at MASTERPLAN og feillogg ikke lenker til `docs/**.md` som ikke finnes. Ingen av tekstene under introduserer en `docs/`-sti (kun `scripts/`, `tests/`, `designsystem/`, som vakten ikke leser).

- [ ] **Steg 1: MASTERPLAN rad 2.1 (linje 164)** — erstatt HELE linjen (starter `| 2.1 | **Sign-off-fabrikken: UBLOKKERT 17.08.2026**` og slutter `mangler fortsatt denne kalibreringen | Ingen |`) med:
  ```
  | 2.1 | **Sign-off-verktøyet er Train-lock-riggen (01.09.2026, PR #731/#732):** `scripts/train-lock-pixel-diff.mjs` (`npm run signoff:train-lock -- <label> <rute> [tema] [cropTop]`) + `scripts/train-lock-fasit-ramme.mjs` + `tests/visual/skjerm-mapping.ts` måler faktisk pikselavvik mot `designsystem/train-lock/*.dc.html`; `scripts/signoff-trainlock.mjs` gir rask visuell oversikt (app + fasit, m390/d1280, lys/mørk) uten å måle. Bruksanvisning: `tests/visual/README.md`. **Status (målt 06.09.2026 i `skjerm-mapping.ts`):** 10 av 17 rutekartlagte skjermer kalibrert med målt restavvik (PH-01 11,07 % · TE-01 14,38 % · TM-04a 5,56 % · TM-01a 10,88 % · PH-07 17,26 % · PH-21a/b/c 12,32/13,12/18,39 % · S3-03a/b 14,34/15,15 %); 7 dokumentert ukalibrerbare med kjent årsak i `skjerm-mapping.ts` (RU-04, ME-03, AG-03, AG-04, AO-03/AO-08 som innebygde paneler, og AO-01 mot pensjonert AgenticOS-rail). Riggen kjører ikke i CI. De øvrige ~140 skjermene i porteringen mangler fortsatt kalibrering. **Historikk (slettet 05.09.2026, fase 1 økt 7):** Paper-galleriet `signoff-gallery.mjs` → `signoff-side.mjs` (48 skjermer fotografert 17.08, fire verktøyfeil rettet 18.08 — fullside mot én skjermflate, fasit uten `data-theme`, mørk uten fasit, tilstandsvelger i bildet), `signoff-gallery-bolger.mjs`, `paper-diff-maal.mjs`, `tests/e2e/paper-visual/` (108 spec-er) og `_paper-fasit-helpers.ts` målte alle mot `designsystem/paper/fase1`, slettet 30.08. Funnene (5)–(8) fra 18.08 — AgencyOS-rader uten fase2-motstykke, `B4-live` på feil flate, tom testbruker (`scripts/seed-screentest-komplett.ts`), admin-fasiter uten mobilvisning — hører nå hjemme som årsak per riggrad (fase 1 økt 4), ikke i dette punktet. Rail-retningen fra 18.08 står: A1-beslutningen (16.08, nå overstyrt av AX-01 25.08) gjorde fase1-fasitene utgått — appen var riktig, fasiten gammel | Ingen |
  ```
  Setningen `Riggen kjører ikke i CI.` skal stå ORDRETT mellom «… AgenticOS-rail).» og «De øvrige ~140 …» — økt 6 (6.5 steg 5) bytter nøyaktig den setningen når den nattlige jobben er på. Kjøres økt 7 likevel ETTER økt 6: behold økt 6 sin setning (`Riggen kjører nattlig mot prod fra …`) i stedet for å skrive «kjører ikke» tilbake.

- [ ] **Steg 2: MASTERPLAN rad 0.2 (linje 39)** — bytt delstrengen ordrett:
  Gammel: `Verifisert samme dag: \`signoff-gallery.mjs\` logger inn og fotograferer igjen (96 av 98 bilder OK).`
  Ny: `Verifisert samme dag med \`signoff-gallery.mjs\` (slettet 05.09.2026): logget inn og fotograferte igjen (96 av 98 bilder OK).`

- [ ] **Steg 3: DO-NOT-USE-PAPER.md** — to endringer:
  Linje 17–18, gammel: `> tabellen under beskrev dem som «lever i runtime», noe som ikke lenger stemmer. Kun de to` / `> siste radene (arkiv/tester) finnes fortsatt, med vilje.`
  Ny: `> tabellen under beskrev dem som «lever i runtime», noe som ikke lenger stemmer. Kun den` / `> siste raden (arkiv) finnes fortsatt, med vilje.`
  Linje 28, gammel: hele raden `| Paper visuell-e2e | \`tests/e2e/paper-visual/\` | **Finnes fortsatt, med vilje** — … (spør Anders — utenfor scope for denne revisjonen). |`
  Ny:
  ```
  | Paper visuell-e2e | `tests/e2e/paper-visual/` + `tests/e2e/_paper-fasit-helpers.ts` | **Slettet 05.09.2026** (fase 1 økt 7 i designporten), sammen med galleri-skriptene `scripts/signoff-gallery.mjs`, `signoff-gallery-bolger.mjs`, `signoff-side.mjs`, `paper-diff-maal.mjs` og typografi-vakten `check-typografi.mjs`/`typografi-skala.mjs`. Sign-off måles nå med `scripts/train-lock-pixel-diff.mjs` + `tests/visual/skjerm-mapping.ts` (se `tests/visual/README.md`). |
  ```

- [ ] **Steg 4: PORTING.md** — to endringer:
  Linje 140–142, gammel:
  ```
  5. **Terskel er PER SKJERM, kalibrert, ikke en universell 0,1 %.** Følg
     `paper-visual`s presedens (4 % — «fonter/anti-aliasing varierer selv når
     layout er identisk») og legg til dataavhengig varians der det gjelder.
  ```
  Ny:
  ```
  5. **Terskel er PER SKJERM, kalibrert, ikke en universell 0,1 %.** Lærdommen fra
     den slettede `paper-visual`-riggen står (4 % — «fonter/anti-aliasing varierer
     selv når layout er identisk»); legg til dataavhengig varians der det gjelder.
  ```
  Linje 152–153, gammel:
  ```
  Riggen kjører IKKE i CI (samme begrunnelse som `paper-visual`: lokalt verktøy
  for designporten, ikke en automatisk gate) — se `tests/visual/README.md`.
  ```
  Ny:
  ```
  Riggen kjører ikke i CI per 05.09.2026 (lokalt verktøy for designporten, ikke en
  automatisk gate; nattlig kjøring er planlagt som fase 1 økt 6) — se `tests/visual/README.md`.
  ```

- [ ] **Steg 5: tests/visual/README.md** — tre endringer:
  Linje 8, gammel: `## Hvorfor ikke Playwright \`toHaveScreenshot()\` (som \`tests/e2e/paper-visual/\`)?`
  Ny: `## Hvorfor ikke Playwright \`toHaveScreenshot()\` (som den slettede \`tests/e2e/paper-visual/\` gjorde)?`
  Linje 19–21, gammel:
  ```
     snapshot-fil. `paper-visual/README.md` dokumenterer at delte
     snapshot-PNG-er ikke er bærbare mellom maskiner (font-rendering varierer) —
     derfor er de gitignorerte og lokale. Å rendre `.dc.html`-fasiten FERSK i
  ```
  Ny:
  ```
     snapshot-fil. Paper-riggen (slettet 05.09.2026) lærte oss at delte
     snapshot-PNG-er ikke er bærbare mellom maskiner (font-rendering varierer) —
     derfor var de gitignorerte og lokale. Å rendre `.dc.html`-fasiten FERSK i
  ```
  Linje 38–40, gammel:
  ```
  holder ikke i praksis, av samme grunn som `paper-visual` selv satte sin
  terskel til 4 % («fonter/anti-aliasing varierer selv når layout er
  identisk»): PH-01 er i tillegg en DATAAVHENGIG skjerm — SG-verdi, antall
  ```
  Ny:
  ```
  holder ikke i praksis, av samme grunn som den gamle Paper-riggen satte sin
  terskel til 4 % («fonter/anti-aliasing varierer selv når layout er
  identisk»): PH-01 er i tillegg en DATAAVHENGIG skjerm — SG-verdi, antall
  ```

- [ ] **Steg 6: Verifiser**
  ```bash
  node scripts/check-doc-lenker.mjs
  grep -c "signoff-side.mjs\` → artifact\|Verktøykjeden er nå \`signoff-gallery" docs/MASTERPLAN-GJENSTAAENDE.md
  grep -n "Finnes fortsatt, med vilje" docs/platform/DO-NOT-USE-PAPER.md | wc -l
  ```
  Forventet: `OK: ingen døde doc-lenker i levende styringsdokumenter.`, `0`, og `1` (kun arkiv-raden `docs/arkiv/paper-port/`).

- [ ] **Steg 7: Commit**
  ```bash
  git add docs/MASTERPLAN-GJENSTAAENDE.md docs/platform/DO-NOT-USE-PAPER.md designsystem/train-lock/PORTING.md tests/visual/README.md
  git commit -m "docs(design): MASTERPLAN 2.1 peker på Train-lock-riggen; DO-NOT-USE-PAPER/PORTING/README uten paper-visual

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 7.7: Full verifikasjon, feillogg, PR

**Filer:**
- Modify: `docs/feillogg.md` (én linje nederst, format på linje 3–4)
- Test: `npm run verify`, `npx playwright test --list`

- [ ] **Steg 1: Verify (grønt kreves før PR)**
  ```bash
  npm run verify > "$SCRATCH/verify.log" 2>&1; echo "exit=$?"; tail -15 "$SCRATCH/verify.log"; grep -n "error\|Error\|FEIL" "$SCRATCH/verify.log" | head
  ```
  (`$SCRATCH` = scratchpad-mappa fra systemprompten.) Forventet `exit=0`; i loggen skal disse linjene stå: `check-token-gap: ingen Presis-farger, ingen hex i style={{}}, className eller SVG.`, `OK: ingen Paper-rester i src/.`, `OK: ingen døde doc-lenker i levende styringsdokumenter.`, og til slutt Next-byggets ruteliste. Ingen slettet fil står i `verify`-kjeden (package.json:15 lister `check-action-auth`, `check-token-gap`, `check-critical-imports`, `check-ingen-paper`, `ak-golf-tokens`, `check-ak-golf-kits --rask`, `check-doc-lenker`, `check-tl-kontrast`, `build`).

- [ ] **Steg 2: Playwright lister uten feil**
  ```bash
  npx playwright test --list 2>&1 | tail -1
  npx playwright test --list 2>&1 | grep -ci "paper-visual\|_paper-fasit-helpers\|Cannot find module"
  ```
  Forventet: `Total: 284 tests in 38 files` (142 × 2 prosjekter chromium+webkit; høyere hvis nye spec-er er merget) og `0`.

- [ ] **Steg 3: Sluttsjekk for spøkelsesreferanser i hele repoet**
  ```bash
  grep -rn "signoff-gallery\|signoff-side\|paper-diff-maal\|check-typografi\|typografi-skala\|_paper-fasit-helpers" \
    --include='*.md' --include='*.json' --include='*.mjs' --include='*.ts' --include='*.tsx' --include='*.yml' . \
    | sed 's#^\./##' | grep -v "node_modules\|^\.next/\|^docs/superpowers/plans/\|^docs/feillogg.md" | cut -c1-120
  ```
  Forventet: kun linjer som eksplisitt sier «slettet 05.09.2026» (MASTERPLAN 0.2 og 2.1, DO-NOT-USE-PAPER rad, signoff-trainlock.mjs hodekommentar). Ingen kode-import, ingen script-sti som skal kjøres.

- [ ] **Steg 4: Feillogg-retro** — legg til én linje nederst i `docs/feillogg.md`. Gikk alt glatt: `2026-09-05 | ren økt (fase 1 økt 7 — slettet Paper-verktøy)`. Kostet noe tid (f.eks. verify-miljø i worktree): bruk formatet på linje 3 med rotårsak og regel.
  ```bash
  git add docs/feillogg.md
  git commit -m "docs(feillogg): retro fase 1 økt 7

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

- [ ] **Steg 5: Push + PR + merge (Claude tar hele git-jobben)**
  ```bash
  git push -u origin claude/fase1-okt7-slett-paper-verktoy
  gh pr create --base main --title "chore(design): fase 1 økt 7 — slett døde Paper-verktøy, rett vakter til TL/--tl-*" --body "$(cat <<'EOF'
  ## Hva
  - Slettet: `scripts/signoff-gallery.mjs`, `signoff-gallery-bolger.mjs`, `signoff-side.mjs`, `paper-diff-maal.mjs`, `check-typografi.mjs`, `typografi-skala.mjs`, `tests/e2e/_paper-fasit-helpers.ts`, `tests/e2e/paper-visual/` (108 spec-er + README). Alle leste `designsystem/paper/`, slettet 30.08.
  - `playwright.config.ts`: paper-visual-unntaket i `testIgnore` fjernet.
  - `.claude/hooks/kvalitet.mjs`: typografi-vakten (Paper-skalaen) fjernet, eslint-gaten uendret.
  - `scripts/check-token-gap.mjs`: døde `ALLOW_FILES`-oppføringer (`tokens.ts`, `paper-tokens.css`) borte; meldingene sier `TL`/`--tl-*`/`AK`.
  - Kommentarer i `signoff-trainlock.mjs`, `stikkprove-trainlock.mjs`, `shot-drift-2026-08-13.mjs`.
  - MASTERPLAN 2.1 peker på `train-lock-pixel-diff.mjs` + `skjerm-mapping.ts`; DO-NOT-USE-PAPER, PORTING.md, tests/visual/README.md rettet.

  ## Verifisert
  - `npm run verify` grønn (tsc, eslint, alle vakter, build)
  - `npx playwright test --list` uten feil, 0 treff på paper-visual
  - `check-token-gap` negativ prøve gir exit 1 med ny TL-melding
  - kvalitet.mjs: exit 0 på ren fil, exit 2 på eslint-feil

  Plan: «Komplett designport» fase 1, punkt 7. Ingen skjermendring, ingen nye avhengigheter, ingen nye tokens.

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```
  Kjør deretter `pr-review-toolkit:review-pr` på PR-en, vent på grønn CI (`gh pr checks --watch`), så `gh pr merge --squash --delete-branch`. Ved rødt: fiks først, aldri merge rødt.

---

### Ferdig når (målbart, med kommando)

1. `git ls-files scripts/signoff-gallery.mjs scripts/signoff-gallery-bolger.mjs scripts/signoff-side.mjs scripts/paper-diff-maal.mjs scripts/check-typografi.mjs scripts/typografi-skala.mjs tests/e2e/_paper-fasit-helpers.ts | wc -l` → `0`, og `git ls-files tests/e2e/paper-visual | wc -l` → `0`, og `ls tests/e2e/paper-visual` → `No such file or directory`.
2. `grep -c "paper-visual" playwright.config.ts` → `1` (kun historisk kommentar); `grep -c "typografi-skala\|hookSpecificOutput" .claude/hooks/kvalitet.mjs` → `0`.
3. `grep -n "T\.farge\|src/lib/v2/tokens\.ts\|paper-tokens\|--p-\|docs/port\|Paper" scripts/check-token-gap.mjs | wc -l` → `0`, og `node scripts/check-token-gap.mjs; echo $?` → OK-linje + `0`.
4. `grep -n "signoff-gallery\|signoff-side" docs/MASTERPLAN-GJENSTAAENDE.md | grep -vc "slettet 05.09.2026"` → `0`.
5. `npm run verify` → exit 0. `npx playwright test --list 2>&1 | grep -ci "paper-visual\|Cannot find module"` → `0`.
6. PR merget til `main`, grenen slettet, `git status --short` tom.

### Åpne funn (ting sett underveis — ikke løs dem i denne økta)

- `src/app/global-error.tsx:5–6` sier fortsatt «bruker samme `--p-*`-fallback-stack som paper-tokens.css … Paper-fasit: system-tilstander.html» og rendrer Paper-krem `#faf9f5`/ink `#141413` som rå hex (9 `style={{}}`-blokker). `check-ingen-paper.mjs` fanger det ikke (`--p-*` med stjerne matcher ikke regexen `--p-[a-z0-9-]+`). Feilsiden er i praksis siste Paper-skjerm i produktet — trenger canvas + Train-lock-port (skjermendring, ikke rydding).
- `scripts/paper-port-triage.mjs` (steg 7–9-kartlegging) siterer slettede `docs/port/plan-designport-alle-skjermer.md` og sorterer etter «arver Paper-paletten». Ingen refererer den (`grep -rn paper-port-triage` → 0 treff utenfor fila). Kandidat for sletting i en ryddeøkt; ikke i denne planens punkt 7.
- `scripts/speil-designsystem.mjs` (`npm run speil:paper`) speiler Claude Paper-prosjektet ned til `designsystem/paper/` — mappa finnes ikke lenger. Scriptet og `speil:paper` i `package.json:19` er døde.
- `docs/superpowers/plans/2026-09-04-marked-ak-golf-port.md:1288` påstår at `check-token-gap.mjs` «vokter Poppins/Lora/Mono som eneste fonter». Det gjør den ikke — den sjekker kun farger. Fontvakt finnes ikke i repoet.
- `docs/feillogg.md:16` nevner `portal-analysere.visual.spec.ts` i en datert logglinje (15.08). Historikk — bør stå.
- `docs/natt/D2-UNDERLAG-2026-08-25.md:7` og `:341` omtaler `src/lib/v2/tokens.ts` og `check-token-gap` som det var 25.08. `docs/natt/` er arkiv per CLAUDE.md — røres ikke.
- `tests/visual/train-lock-pixelnaerhet.spec.ts` finnes ikke ennå (nevnes som «selve CI-testen» i `scripts/train-lock-pixel-diff.mjs:7`). Det er fase 1 økt 6 sin leveranse — 2.1-teksten over sier bare «Riggen kjører ikke i CI.», og økt 6 (6.5 steg 5) bytter nøyaktig den setningen når spec-en og jobben finnes.
- 48 `.tsx`-filer i `src/` har inline `fontSize` utenfor den gamle Paper-skalaen (målt 05.09 med den nå slettede `typografi-skala.mjs`, f.eks. `src/app/inviter/forelder/[token]/page.tsx:107` = 30px). Ingen Train-lock-typografiskala er definert som vakt. Om det skal finnes en TL-skala-vakt er en egen beslutning (invariant 2: ingen nye tokens uten Anders' ja).
