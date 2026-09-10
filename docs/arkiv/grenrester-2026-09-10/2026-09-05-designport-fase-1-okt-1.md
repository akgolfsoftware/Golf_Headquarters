# Historisk grenrest – 10.09.2026

Bevart fra `park/2026-09-08-opprydding`, commit `e4356c368`. Main fjernet denne planrekken som fullført i PR #812. Dette er historikk, ikke aktive arbeidsordrer eller gjeldende designvalg.

---

# Fase 1 · Økt 1 — Vakter inn i verify og CI

**Mål:** Fem vakter holder designporten én vei, lokalt og i CI: `check-ingen-paper.mjs` (blokkerende), `check-v2shell-bredde.mjs` (blokkerende — den ene fila som feiler rettes først), `check-tl-kontrast.mjs` (rapport, ikke `--streng`), ny `check-fasitdekning-baseline.mjs` (HEAD siterer aldri færre tegninger enn den committede baselinen i `tests/visual/fasitdekning-baseline.json`) og ny `check-signalfarge-tekst.mjs` (`color: TL.<signal>` øker aldri per fil). Alle fem står i `npm run verify` og som steg i `.github/workflows/ci.yml`. De to nye skriptene har node:test-tester. Ingen opprydding av eksisterende forekomster — kun vakter.

**Forutsetninger:**
- Alle tre parallelle PR-er er merget (verifisert 06.09.2026, den siste kl. 09:24Z): `gh pr view 787 --json state -q .state; gh pr view 788 --json state -q .state; gh pr view 789 --json state -q .state` → tre ganger `MERGED`. origin/main = `c1c3396eb` (`git rev-parse --short origin/main`). Ingen av dem rørte filene i denne økta — bekreft med `git diff --stat b0595b304 origin/main -- .github package.json scripts src/app/admin/workbench` → kun `scripts/seed-ph21-signoff-fixture.ts`.
- Hovedsjekkuten `/Users/anderskristiansen/Developer/akgolf-hq` sto 06.09 på grenen `feat/steg-19-6-19-7-kontrast-tallhero` med 151 ucommittede filer (kø 30 — en annen økts arbeid). Ikke rør den. Jobb i en egen worktree, fersk fra origin/main:
  ```bash
  cd /Users/anderskristiansen/Developer/akgolf-hq && git fetch origin
  git worktree add /Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt1 -b claude/fase1-okt1-ci-vakter origin/main
  cd /Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt1 && git branch --show-current && git rev-parse --short HEAD
  ```
  Forventet: `claude/fase1-okt1-ci-vakter` og `c1c3396eb` (eller nyere hvis main har fått flere commits — da gjelder det tallet). Sett `WT=/Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt1` og bruk absolutte stier i alle kommandoer (gotchas §Shell-cwd). Alle `node scripts/…`-kommandoer under kjøres med `$WT` som arbeidskatalog (`cd "$WT"` først).
- Worktreen har ingen egen `node_modules` (feillogg 29.08.2026): `npx tsc`, `npx eslint`, `npx tsx`, `npx prisma` og `node scripts/*.mjs` virker (modulresolusjon vandrer opp til hovedsjekkuten), men `npm run build` og `check-critical-imports.mjs` feiler («Could not find the Next.js package» / esbuild-sti). Målt 06.09: `npm test` uten generert Prisma-klient gir 75 feil (`Cannot find module '@/generated/prisma/client'`). Kjør derfor FØRST, én gang, kun i skallet (aldri i en fil, aldri kopier `.env*`):
  ```bash
  cd "$WT" && export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy && npx prisma generate && npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
  ```
  Forventet: `fail 0`. `src/generated/` er gitignored. Delportene i oppgave 1.5 erstatter `npm run build`; CI (kjører i hoved-repoet) tar build.
- Designport-planen (`docs/superpowers/plans/2026-09-05-komplett-designport.md` §4 Fase 1 pkt. 1) ligger ikke på origin/main ennå: den kommer inn med PR #790 (ÅPEN per 06.09, gren `claude/design-implementation-status-14d2ce`, remote `2d9ee6e08` — kun hovedplanen og vedlegget). MASTERPLAN STEG 20 og beslutningen ligger i lokal commit `ae73b1658` på samme gren (ikke pushet), og økt-planene (`…-fase-1.md`, `…-fase-1-okt-N.md`, inkl. denne) er untracked i den worktreen. Denne økta trenger ingen av dem — alt som skal gjøres står her.
- Aldri `git add -A`. Stage navngitte filer. Ingen nye avhengigheter (`git` og Node-innebygde moduler holder — dekningsvakten bruker ikke engang `git`). Ingen nye tokens. Aldri emoji. Norsk bokmål i kommentarer.
- Måletall 06.09.2026 på origin/main `c1c3396eb`, brukt som forventede verdier under: `node scripts/maal-fasit-dekning.mjs` → `"totalt": 210, "sitert": 150, "mangler": 60`. `grep -rnoE "color: *TL\.(danger|ok|warn|viz\.target)\b" src --include='*.tsx' | wc -l` → `305` i `168` filer (bestillingens regex med `vizTarget` gir 300 i 166 — men `TL.vizTarget` finnes ikke; nøkkelen heter `TL.viz.target`, `src/lib/v2/train-lock.ts:199`, så vakten bruker `viz\.target`). `node scripts/check-v2shell-bredde.mjs` → exit 1, én fil. `node scripts/check-ingen-paper.mjs` → exit 0. `node scripts/check-tl-kontrast.mjs` → exit 0, 40 par, 12 brudd; med `--streng` exit 1. `node scripts/check-doc-lenker.mjs` → OK.

---

### Oppgave 1.1: Bredde-gaten går grønn, og inn i verify

**Filer:**
- Modify: `src/app/admin/workbench/[playerId]/page.tsx:60`, `:82`, `:108`
- Modify: `scripts/check-v2shell-bredde.mjs:7–8`
- Modify: `package.json:15` (`"verify"`)

**Grensesnitt:** `V2Shell` sin prop `bredde?: "kolonne" | "full"` (`src/components/v2/shell.tsx:253`), default `"full"` (`:1414`). Å skrive `bredde="full"` eksplisitt endrer ingen oppførsel — Workbench eier sin egen flerkolonne-layout, samme valg som spillerens Workbench (`src/app/portal/planlegge/workbench/page.tsx:69`).

- [ ] **Steg 1: Se gaten feile (rødt først).**
  ```bash
  cd "$WT" && node scripts/check-v2shell-bredde.mjs; echo "exit=$?"
  ```
  Forventet: `Funnet 3 åpning(er) i 1 fil(er):` med `src/app/admin/workbench/[playerId]/page.tsx:60`, `:82`, `:108`, `Oppsummering: 1 fil(er) mangler bredde-prop.` og `exit=1`.

- [ ] **Steg 2: Rett de tre åpningene.** I `src/app/admin/workbench/[playerId]/page.tsx` er linje 60, 82 og 108 like (linje 60 og 82 med 8 mellomrom innrykk, linje 108 med 6):
  ```tsx
        <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
  ```
  Erstatt alle tre (behold innrykket) med:
  ```tsx
        <V2Shell bredde="full" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
  ```
  Kontroll: `grep -c 'bredde="full" aktiv="planlegge"' "$WT/src/app/admin/workbench/[playerId]/page.tsx"` → `3`.

- [ ] **Steg 3: Se gaten gå grønn.**
  ```bash
  cd "$WT" && node scripts/check-v2shell-bredde.mjs; echo "exit=$?"
  ```
  Forventet: `check-v2shell-bredde: OK — alle <V2Shell> har eksplisitt bredde-prop.` og `exit=0`.

- [ ] **Steg 4: Filhodet i skriptet slutter å si at det ikke er i verify.** `scripts/check-v2shell-bredde.mjs` linje 7–8 lyder i dag:
  ```js
  // Merk: kobles inn i `npm run verify` FØRST når antall feilende filer er lavt
  // (~≤20). Ellers blir main rød. Se docs/port/GROK-NATTORDRE-2026-08-06.md §4b B.
  ```
  (`docs/port/` finnes ikke lenger.) Erstatt de to linjene med:
  ```js
  // I `npm run verify` og CI fra 06.09.2026 (designport fase 1, økt 1) — null filer
  // feilet da den ble koblet inn. Rødt her betyr en ny <V2Shell> uten bredde-prop.
  ```

- [ ] **Steg 5: Inn i verify.** `package.json:15` inneholder i dag `… && node scripts/check-ingen-paper.mjs && node scripts/ak-golf-tokens.mjs && …`. Sett inn `node scripts/check-v2shell-bredde.mjs` rett etter ingen-paper, slik at delen lyder:
  ```
  && node scripts/check-ingen-paper.mjs && node scripts/check-v2shell-bredde.mjs && node scripts/ak-golf-tokens.mjs &&
  ```
  Kontroll: `cd "$WT" && node -e "console.log(require('./package.json').scripts.verify.split(' && ').indexOf('node scripts/check-v2shell-bredde.mjs'))"` → `8` (posisjon i kjeden, 0-indeksert; ingen-paper står på 7).

- [ ] **Steg 6: Delport og commit.**
  ```bash
  cd "$WT" && npx tsc --noEmit && npx eslint --quiet src && node scripts/check-v2shell-bredde.mjs && node scripts/check-ingen-paper.mjs && echo GRONT
  git add "src/app/admin/workbench/[playerId]/page.tsx" scripts/check-v2shell-bredde.mjs package.json
  git commit -m "fix(admin): bredde=\"full\" på coach-Workbench — bredde-gaten går grønn og inn i verify

Eneste fila uten eksplisitt bredde-prop (3 åpninger). Default var allerede
\"full\", så ingen skjerm endrer seg. check-v2shell-bredde.mjs står nå i
npm run verify (designport fase 1, økt 1).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 1.2: Tre eksisterende vakter som steg i ci.yml

**Filer:**
- Modify: `.github/workflows/ci.yml` (nytt innhold mellom linje 53 og 55)

**Grensesnitt:** Ingen. Stegene kjører skriptene med `node` direkte, slik `verify` gjør — ingen nye npm-scripts. `check-tl-kontrast.mjs` skriver `docs/design-audit/train-lock-kontrast.md` (tracked, genereres identisk — `git status` forblir ren, verifisert 06.09) og gir exit 0 uten `--streng`.

- [ ] **Steg 1: Sett inn tre steg.** `ci.yml` linje 52–56 lyder i dag:
  ```yaml
        - name: Critical imports gate (bundle + offline-queue export contract)
          run: npm run check:critical-imports

        - name: Unit tests (node:test + tsx)
          run: npm test
  ```
  Sett inn etter linje 53 (`run: npm run check:critical-imports`), med samme innrykk (6 mellomrom foran `-`):
  ```yaml

        - name: Ingen-Paper gate (Anders 30.08.2026 — Paper kommer aldri tilbake i src/)
          run: node scripts/check-ingen-paper.mjs

        - name: "V2Shell-bredde gate (alle <V2Shell> har eksplisitt bredde-prop)"
          run: node scripts/check-v2shell-bredde.mjs

        - name: Train-lock kontrast (rapport — blokkerer ikke, Train-lock er fasit)
          run: node scripts/check-tl-kontrast.mjs
  ```
  Resultat: `Unit tests` flytter fra linje 55 til linje 64. (Anførselstegn rundt bredde-navnet fordi `<`/`>` ellers kan forvirre YAML-parseren — hele den ferdige fila er parset med ruby/yaml 06.09 med nøyaktig denne teksten.)

- [ ] **Steg 2: Parse YAML-en og tell stegene.**
  ```bash
  cd "$WT" && ruby -ryaml -e 'y=YAML.load_file(".github/workflows/ci.yml"); s=y["jobs"]["verify"]["steps"]; puts s.size; puts s.map{|x| x["name"]||x["uses"]}'
  ```
  Forventet: `14` og en liste der `Ingen-Paper gate …`, `V2Shell-bredde gate …`, `Train-lock kontrast …` står mellom `Critical imports gate …` og `Unit tests …`. (`ruby` følger macOS; alternativ: `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/ci.yml','utf8'))"` — `yaml` er en transitiv avhengighet som allerede finnes.)

- [ ] **Steg 3: Commit.**
  ```bash
  cd "$WT" && git add .github/workflows/ci.yml
  git commit -m "ci: ingen-paper, V2Shell-bredde og kontrast-rapport som steg i ci.yml

Ingen-paper og bredde blokkerer; kontrast rapporterer (Train-lock er fasit,
--streng først etter beslutning). Samme skript som i npm run verify.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 1.3: `check-fasitdekning-baseline.mjs` — dekningen går aldri under baselinen

**Filer:**
- Create: `src/lib/__tests__/scripts/check-fasitdekning-baseline.test.ts` (ny mappe)
- Create: `scripts/check-fasitdekning-baseline.mjs`
- Create: `tests/visual/fasitdekning-baseline.json`
- Modify: `package.json:15` (`"verify"`)
- Modify: `.github/workflows/ci.yml` (etter kontrast-steget, linje 62 etter 1.2)

**Grensesnitt:** `export function vurderDekning(head, baseline): { ok: boolean, melding: string }` — ren funksjon som testene importerer. `head` er `{ sitert, totalt, … }`, målt på HEAD med `scripts/maal-fasit-dekning.mjs`. `baseline` er `{ sitert, av, sistEndret, grunn }`, lest fra den committede fila `tests/visual/fasitdekning-baseline.json`. Skriptet kjøres fra repo-roten (`process.cwd()`, samme konvensjon som `maal-fasit-dekning.mjs:9`). **Ingen git-oppslag** — vakten sammenligner aldri HEAD mot `origin/main`, kun mot den committede baseline-fila.

**Metode:** grunnlinjen er en vanlig, committet fil i repoet — ikke en annen gren. Regel: `head.sitert >= baseline.sitert`, ellers rødt. Er `head.sitert` høyere enn baselinen, er det OK, men meldingen sier at baselinen kan heves til det nye tallet (ingen automatisk oppdatering). Vil noen bevisst SENKE dekningen (fjerne en feilaktig sitering, som i fase 1 økt 8), endrer de `tests/visual/fasitdekning-baseline.json` i SAMME PR med ny `grunn` — synlig i diffen, ingen unntaksflagg, ingen sammenligning mot en annen commit eller gren.

- [ ] **Steg 1: Testen først (rød).** Opprett `src/lib/__tests__/scripts/check-fasitdekning-baseline.test.ts`:
  ```ts
  import test from "node:test";
  import assert from "node:assert/strict";
  import { vurderDekning } from "../../../../scripts/check-fasitdekning-baseline.mjs";

  test("feiler når HEAD siterer færre enn baselinen", () => {
    const r = vurderDekning({ sitert: 148, totalt: 210 }, { sitert: 150, av: 210 });
    assert.equal(r.ok, false);
    assert.match(r.melding, /148\/210/);
    assert.match(r.melding, /150\/210/);
  });

  test("likt eller flere er OK, og forslag om å heve baselinen ved flere", () => {
    assert.equal(vurderDekning({ sitert: 150, totalt: 210 }, { sitert: 150, av: 210 }).ok, true);
    const flere = vurderDekning({ sitert: 151, totalt: 211 }, { sitert: 150, av: 210 });
    assert.equal(flere.ok, true);
    assert.match(flere.melding, /baseline kan heves til 151/);
  });
  ```
  ```bash
  cd "$WT" && npx tsx --test src/lib/__tests__/scripts/check-fasitdekning-baseline.test.ts 2>&1 | tail -6
  ```
  Forventet: feil med `Cannot find module '…/scripts/check-fasitdekning-baseline.mjs'`. (Importen av en `.mjs` fra `.test.ts` går gjennom `tsc --noEmit` — `allowJs: true` i `tsconfig.json`. Sti-regning: fila ligger fire nivåer under roten, derfor `../../../../scripts/`.)

- [ ] **Steg 2: Baseline-fila.** Mål dagens tall (etter #789, se Forutsetninger) og opprett `tests/visual/fasitdekning-baseline.json`:
  ```bash
  cd "$WT" && node scripts/maal-fasit-dekning.mjs | head -4
  ```
  Forventet: `"totalt": 210, "sitert": 150`. Er tallet et annet enn 150 (main har fått en ny sitering siden 06.09): bruk DET tallet — det ferske tallet er riktig baseline, ikke 150. Opprett fila:
  ```json
  {
    "sitert": 150,
    "av": 210,
    "sistEndret": "2026-09-06",
    "grunn": "første baseline (fase 1 økt 1)"
  }
  ```
  Kontroll:
  ```bash
  node -e "console.log(JSON.parse(require('fs').readFileSync('tests/visual/fasitdekning-baseline.json','utf8')).sitert)"   # forventet: 150 (eller det ferske tallet)
  ```

- [ ] **Steg 3: Skriptet.** Opprett `scripts/check-fasitdekning-baseline.mjs` (kjørt og verifisert 06.09 mot repoet: exit 0 ved likt tall, exit 0 med «baseline kan heves»-melding når HEAD er høyere, exit 1 når baselinen er satt kunstig høyt, exit 2 når fila mangler, er ugyldig JSON eller mangler tallfeltene; `node --check` og `eslint --max-warnings 0` grønne, ingen `git`-kall):
  ```js
  #!/usr/bin/env node
  /**
   * Vakt: fasitdekningen går aldri under den committede baselinen.
   *
   * `scripts/maal-fasit-dekning.mjs` teller hvor mange av tegningene i
   * designsystem/train-lock/ som er sitert fra src/. Tallet er IKKE bevis på at en
   * skjerm er portert (designport-planen 05.09 §3: «sitert er ikke bygget»), men det
   * skal aldri synke uten at noen har ment det: vakten måler tallet i arbeidstreet
   * (HEAD) og sammenligner mot den committede baselinen i
   * tests/visual/fasitdekning-baseline.json.
   *
   * Vil noen senke baselinen bevisst (fjerne en feilaktig sitering), endrer de
   * baseline-fila i SAMME PR med ny "grunn" — synlig i diffen, ingen unntaksflagg.
   * Ingen git-oppslag (ingen sammenligning mot origin/main eller andre grener).
   *
   * Kjør fra repo-roten: node scripts/check-fasitdekning-baseline.mjs
   * Exit 0 = OK (HEAD >= baseline) · 1 = HEAD under baseline · 2 = baseline-fil mangler/ugyldig.
   */
  import { readFileSync } from "node:fs";
  import { spawnSync } from "node:child_process";
  import { join } from "node:path";
  import { pathToFileURL } from "node:url";

  const BASELINE_STI = "tests/visual/fasitdekning-baseline.json";

  /**
   * Ren sammenligning — testes i src/lib/__tests__/scripts/check-fasitdekning-baseline.test.ts.
   * @param {{ sitert: number, totalt: number }} head
   * @param {{ sitert: number, av: number }} baseline
   * @returns {{ ok: boolean, melding: string }}
   */
  export function vurderDekning(head, baseline) {
    const tall = `HEAD ${head.sitert}/${head.totalt} · baseline ${baseline.sitert}/${baseline.av}`;
    if (head.sitert < baseline.sitert) {
      return {
        ok: false,
        melding:
          `fasitdekningen har gått UNDER baselinen (${tall}). En sitering er fjernet uten at en annen ` +
          `tegning er sitert i stedet. Er det med vilje (f.eks. en feilaktig sitering fjernet), senk ` +
          `baselinen i ${BASELINE_STI} i SAMME PR med ny "grunn".`,
      };
    }
    if (head.sitert > baseline.sitert) {
      return { ok: true, melding: `OK — fasitdekning ${tall} (baseline kan heves til ${head.sitert}).` };
    }
    return { ok: true, melding: `OK — fasitdekning ${tall}.` };
  }

  /** Kjører maal-fasit-dekning.mjs fra repo-roten `rot` og leser JSON-en. */
  function maal(rot) {
    const r = spawnSync(process.execPath, [join(rot, "scripts/maal-fasit-dekning.mjs")], {
      cwd: rot,
      encoding: "utf8",
    });
    if (r.status !== 0) throw new Error(`maal-fasit-dekning.mjs feilet:\n${r.stderr ?? r.error?.message ?? ""}`);
    return JSON.parse(r.stdout);
  }

  function lesBaseline(rot) {
    let json;
    try {
      json = JSON.parse(readFileSync(join(rot, BASELINE_STI), "utf8"));
    } catch (e) {
      console.error(`check-fasitdekning-baseline: kunne ikke lese ${BASELINE_STI} (${e.message}). Opprett eller rett den (se oppgave 1.3).`);
      process.exit(2);
    }
    if (typeof json.sitert !== "number" || typeof json.av !== "number") {
      console.error(`check-fasitdekning-baseline: ${BASELINE_STI} mangler tallfeltene "sitert"/"av".`);
      process.exit(2);
    }
    return json;
  }

  function main() {
    const rot = process.cwd();
    const baseline = lesBaseline(rot);
    const head = maal(rot);
    const res = vurderDekning(head, baseline);
    if (res.ok) console.log(`check-fasitdekning-baseline: ${res.melding}`);
    else console.error(`check-fasitdekning-baseline: ${res.melding}`);
    process.exit(res.ok ? 0 : 1);
  }

  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
  ```
  Merk: `main()` kjører bare når fila startes direkte, ikke når testen importerer den. `lesBaseline` kaller `process.exit(2)` direkte (ikke kastet feil) fordi en manglende/ugyldig baseline-fil er en oppsettsfeil, ikke et dekningsbrudd — `JSON.parse` står inne i `try` med vilje, ellers hadde ødelagt JSON gitt stack trace og exit 1 og sett ut som et dekningsbrudd — samme skille som exit 1 vs. 2 hadde i den forrige (git-baserte) varianten.

- [ ] **Steg 4: Testen grønn, skriptet kjørt.**
  ```bash
  cd "$WT" && npx tsx --test src/lib/__tests__/scripts/check-fasitdekning-baseline.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"
  node scripts/check-fasitdekning-baseline.mjs; echo "exit=$?"
  ```
  Forventet: `tests 2` / `pass 2` / `fail 0`, og `check-fasitdekning-baseline: OK — fasitdekning HEAD 150/210 · baseline 150/210.` med `exit=0` (1.1 rørte ingen sitering, og baseline-fila fra steg 2 har samme tall).

- [ ] **Steg 5: Lint av skriptet og fila.**
  ```bash
  cd "$WT" && npx eslint --max-warnings 0 scripts/check-fasitdekning-baseline.mjs && node -e "JSON.parse(require('fs').readFileSync('tests/visual/fasitdekning-baseline.json','utf8'))" && echo LINT-OK
  ```

- [ ] **Steg 6: Inn i verify og CI.** `package.json:15` inneholder etter 1.2 `… && node scripts/check-tl-kontrast.mjs && npm run build",`. Sett inn `node scripts/check-fasitdekning-baseline.mjs` rett etter kontrast, slik at slutten av kjeden lyder:
  ```
  && node scripts/check-tl-kontrast.mjs && node scripts/check-fasitdekning-baseline.mjs && npm run build",
  ```
  `ci.yml`: sett inn etter linje 62 (`run: node scripts/check-tl-kontrast.mjs`, etter 1.2):
  ```yaml

        - name: Hent origin/main (baseline for signalfarge-vakten i oppgave 1.4)
          run: git fetch --no-tags --depth=1 origin +refs/heads/main:refs/remotes/origin/main

        - name: Fasitdekning-vakt (aldri færre siterte tegninger enn den committede baselinen)
          run: node scripts/check-fasitdekning-baseline.mjs
  ```
  Denne vakten (`check-fasitdekning-baseline.mjs`) trenger ikke selv `origin/main` — den leser kun den committede `tests/visual/fasitdekning-baseline.json`. Fetch-steget står likevel her, fordi `actions/checkout@v4` uten `fetch-depth` (`ci.yml:27`) henter kun PR-ens merge-commit med dybde 1, og NESTE oppgave (1.4, `check-signalfarge-tekst.mjs`) fortsatt sammenligner per fil mot `origin/main` og trenger treet hentet med dybde 1 — den vakten sammenligner trær, ikke historikk. På PR er HEAD merge-commiten «PR inn i main», så diffen mot origin/main er nøyaktig PR-ens endring; på push til main er HEAD = origin/main og den vakten er trivielt grønn. `Unit tests` flytter til linje 70.
  Kontroll: `cd "$WT" && ruby -ryaml -e 'puts YAML.load_file(".github/workflows/ci.yml")["jobs"]["verify"]["steps"].size'` → `16`.

- [ ] **Steg 7: Commit.**
  ```bash
  cd "$WT" && git add scripts/check-fasitdekning-baseline.mjs src/lib/__tests__/scripts/check-fasitdekning-baseline.test.ts tests/visual/fasitdekning-baseline.json package.json .github/workflows/ci.yml
  git commit -m "feat(scripts): check-fasitdekning-baseline — HEAD siterer aldri færre tegninger enn den committede baselinen

Sammenligner maal-fasit-dekning.mjs i arbeidstreet mot en committet
grunnlinje (tests/visual/fasitdekning-baseline.json), ikke mot origin/main
— ingen git-oppslag i skriptet selv. Feiler når tallet synker under
baselinen; er det med vilje (feilaktig sitering fjernet), senkes baselinen
i samme PR med ny \"grunn\", synlig i diffen, uten unntaksflagg. Tallet er
ikke bevis på port (sitert er ikke bygget). I verify og ci.yml (fetch av
origin/main beholdt i CI kun for signalfarge-vakten i neste oppgave).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 1.4: `check-signalfarge-tekst.mjs` — signalfarge som tekst øker aldri per fil

**Filer:**
- Create: `src/lib/__tests__/scripts/check-signalfarge-tekst.test.ts`
- Create: `scripts/check-signalfarge-tekst.mjs`
- Modify: `package.json:15` (`"verify"`)
- Modify: `.github/workflows/ci.yml` (etter fasitdekning-steget, linje 68 etter 1.3)

**Grensesnitt:** `export const SIGNAL_RE`, `export function tellSignalfarge(kilde: string): number`, `export function parseNameStatus(ut: string): { status, gammel, ny }[]`, `export function finnBrudd(par: { sti, head, base }[])` — rene funksjoner. Regexen er `/color:\s*TL\.(danger|ok|warn|viz\.target)\b/g`: property-navnet `color` med små bokstaver, så `borderColor:`/`backgroundColor:` (kant og flate — lov etter Vei A) telles ikke; `\b` holder `TL.warnHair` utenfor. Baseline er per fil: bare filer som er endret mot origin/main (`git diff --name-status -z -M`) pluss untracked filer sammenlignes — uendrede filer har per definisjon samme tall. Rename (`R`) sammenlignes mot den gamle stien, ny fil mot 0.

- [ ] **Steg 1: Testen først (rød).** Opprett `src/lib/__tests__/scripts/check-signalfarge-tekst.test.ts`:
  ```ts
  import test from "node:test";
  import assert from "node:assert/strict";
  import { tellSignalfarge, finnBrudd, parseNameStatus } from "../../../../scripts/check-signalfarge-tekst.mjs";

  test("teller color: TL.<signal> i alle skrivemåter, men ikke kant/flate", () => {
    assert.equal(tellSignalfarge("style={{ color: TL.danger }}"), 1);
    assert.equal(tellSignalfarge("color:TL.ok"), 1);
    assert.equal(tellSignalfarge("color:   TL.warn"), 1);
    assert.equal(tellSignalfarge("color: TL.viz.target"), 1);
    assert.equal(tellSignalfarge("borderColor: TL.danger, backgroundColor: TL.ok"), 0);
    assert.equal(tellSignalfarge("color: TL.warnHair"), 0);
    assert.equal(tellSignalfarge("color: TL.text, color: TL.mute"), 0);
    assert.equal(tellSignalfarge("color: TL.danger\ncolor: TL.ok\ncolor: TL.warn"), 3);
  });

  test("brudd = fila har fått flere enn på origin/main", () => {
    const par = [
      { sti: "a.tsx", head: 2, base: 1 },
      { sti: "b.tsx", head: 1, base: 1 },
      { sti: "c.tsx", head: 0, base: 3 },
      { sti: "ny.tsx", head: 1, base: 0 },
    ];
    assert.deepEqual(finnBrudd(par).map((b) => b.sti), ["a.tsx", "ny.tsx"]);
  });

  test("parseNameStatus: én sti per rad, to for rename", () => {
    const ut = "M\0src/a.tsx\0R100\0src/gammel.tsx\0src/ny.tsx\0D\0src/borte.tsx\0";
    assert.deepEqual(parseNameStatus(ut), [
      { status: "M", gammel: null, ny: "src/a.tsx" },
      { status: "R", gammel: "src/gammel.tsx", ny: "src/ny.tsx" },
      { status: "D", gammel: null, ny: "src/borte.tsx" },
    ]);
    assert.deepEqual(parseNameStatus(""), []);
  });
  ```
  ```bash
  cd "$WT" && npx tsx --test src/lib/__tests__/scripts/check-signalfarge-tekst.test.ts 2>&1 | tail -6
  ```
  Forventet: `Cannot find module '…/scripts/check-signalfarge-tekst.mjs'`.

- [ ] **Steg 2: Skriptet.** Opprett `scripts/check-signalfarge-tekst.mjs` (kjørt 06.09 mot repoet: `305 forekomster i 168 filer`, exit 0; eslint grønn):
  ```js
  #!/usr/bin/env node
  /**
   * Vakt: signalfarge som TEKSTFARGE skal aldri øke per fil.
   *
   * Vei A (Anders 03.09.2026, beslutninger.md §KONTRAST-REGEL I STEDET FOR NY FASIT):
   * danger / ok / warn / viz-target er signalfarger, ikke tekstfarger. Som ren tekst
   * på scene/elev i lys modus bryter de kontrastkravet (check-tl-kontrast.mjs måler
   * ok 2,2:1 og warn 1,4:1 mot krav 4,5:1 / 3,0:1). Forekomstene som finnes (06.09.2026:
   * 305 i 168 filer) ryddes i en egen sweep — vakten passer bare på at tallet aldri
   * VOKSER: en fil i HEAD får ikke ha flere `color: TL.<signal>` enn samme fil har på
   * origin/main. Nye filer sammenlignes mot 0, flyttede filer mot den gamle stien.
   *
   * Kjør fra repo-roten: node scripts/check-signalfarge-tekst.mjs
   * Krever at origin/main finnes lokalt (`git fetch origin`).
   * Exit 0 = OK · 1 = en fil har fått flere · 2 = origin/main mangler.
   */
  import { spawnSync } from "node:child_process";
  import { readdirSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { pathToFileURL } from "node:url";

  const BASE = "origin/main";

  /**
   * `color: TL.danger` / `color:TL.ok` / `color: TL.viz.target` — property-navnet
   * `color` med små bokstaver, så `borderColor: TL.danger` og `backgroundColor: TL.ok`
   * (kant og flate — lov) telles ikke. `\b` holder `TL.warnHair` utenfor.
   */
  export const SIGNAL_RE = /color:\s*TL\.(danger|ok|warn|viz\.target)\b/g;

  /** Antall forekomster i én fils kildekode. Ren funksjon. */
  export function tellSignalfarge(kilde) {
    return (kilde.match(SIGNAL_RE) ?? []).length;
  }

  /**
   * Leser `git diff --name-status -z` til rader. `R`/`C` har to stier (gammel, ny);
   * alt annet én. Ren funksjon.
   * @param {string} ut  rå stdout med NUL som skilletegn
   * @returns {{ status: string, gammel: string | null, ny: string }[]}
   */
  export function parseNameStatus(ut) {
    const t = ut.split("\0");
    const rader = [];
    for (let i = 0; i < t.length && t[i] !== ""; ) {
      const status = t[i][0];
      if (status === "R" || status === "C") {
        rader.push({ status, gammel: t[i + 1], ny: t[i + 2] });
        i += 3;
      } else {
        rader.push({ status, gammel: null, ny: t[i + 1] });
        i += 2;
      }
    }
    return rader;
  }

  /**
   * Filene som har fått flere. `par` = [{ sti, head, base }] — antall i HEAD og på
   * origin/main (0 når fila ikke finnes der). Ren funksjon.
   * @param {{ sti: string, head: number, base: number }[]} par
   */
  export function finnBrudd(par) {
    return par.filter((p) => p.head > p.base);
  }

  function* tsxFiler(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) yield* tsxFiler(p);
      else if (e.name.endsWith(".tsx")) yield p;
    }
  }

  function git(args, rot) {
    const r = spawnSync("git", args, { cwd: rot, encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")} feilet:\n${r.stderr}`);
    return r.stdout;
  }

  /** Innholdet av en fil på origin/main, eller null hvis den ikke finnes der. */
  function baseInnhold(sti, rot) {
    const r = spawnSync("git", ["show", `${BASE}:${sti}`], { cwd: rot, encoding: "utf8" });
    return r.status === 0 ? r.stdout : null;
  }

  function main() {
    const rot = process.cwd();
    if (spawnSync("git", ["rev-parse", "--verify", "--quiet", BASE], { cwd: rot }).status !== 0) {
      console.error(`check-signalfarge-tekst: fant ikke ${BASE} lokalt. Kjør \`git fetch origin\` først.`);
      process.exit(2);
    }

    // Summen i HEAD — kun til rapportlinjen.
    let sum = 0;
    let filer = 0;
    for (const f of tsxFiler(join(rot, "src"))) {
      const n = tellSignalfarge(readFileSync(f, "utf8"));
      if (n) {
        sum += n;
        filer++;
      }
    }

    // Bare filer som er endret mot origin/main kan ha fått flere — uendrede filer har
    // per definisjon samme tall. Untracked filer tas med (git diff ser dem ikke).
    const endret = parseNameStatus(git(["diff", "--name-status", "-z", "-M", BASE, "--", "src"], rot)).filter(
      (r) => r.status !== "D" && r.ny.endsWith(".tsx"),
    );
    const nye = git(["ls-files", "--others", "--exclude-standard", "-z", "--", "src"], rot)
      .split("\0")
      .filter((s) => s.endsWith(".tsx"))
      .map((s) => ({ status: "A", gammel: null, ny: s }));

    const par = [...endret, ...nye].map((r) => {
      const head = tellSignalfarge(readFileSync(join(rot, r.ny), "utf8"));
      const b = baseInnhold(r.gammel ?? r.ny, rot);
      return { sti: r.ny, head, base: b === null ? 0 : tellSignalfarge(b) };
    });
    const brudd = finnBrudd(par);

    if (brudd.length) {
      console.error(`check-signalfarge-tekst: signalfarge som tekstfarge har ØKT i ${brudd.length} fil(er) (Vei A, 03.09.2026):`);
      for (const b of brudd) console.error(`  ${b.sti}: ${b.base} → ${b.head} (${BASE} → HEAD)`);
      console.error(
        "\nBruk fargen som fylt flate med on-*-tekst, som ikon/grafikk, eller bytt tekstfargen til " +
          "TL.text / TL.mute. Målingene står i docs/design-audit/train-lock-kontrast.md.",
      );
      process.exit(1);
    }
    console.log(
      `check-signalfarge-tekst: OK — ${sum} forekomster i ${filer} filer i HEAD; ` +
        `${par.length} endret(e) fil(er) sammenlignet mot ${BASE}, ingen har fått flere.`,
    );
  }

  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
  ```

- [ ] **Steg 3: Testen grønn, skriptet kjørt, og vakten bevist rød på en fil som får flere.**
  ```bash
  cd "$WT" && npx tsx --test src/lib/__tests__/scripts/check-signalfarge-tekst.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"
  node scripts/check-signalfarge-tekst.mjs; echo "exit=$?"
  ```
  Forventet: `tests 3` / `pass 3` / `fail 0`, og `check-signalfarge-tekst: OK — 305 forekomster i 168 filer i HEAD; 1 endret(e) fil(er) sammenlignet mot origin/main, ingen har fått flere.` med `exit=0` (den ene endrede er `page.tsx` fra 1.1, som har 0 forekomster). Har 19.6-sweepen (kø 30) gått inn i main i mellomtiden, er tallene lavere — det er riktig.
  Rød vei, med en untracked probe-fil som slettes rett etterpå (aldri committes):
  ```bash
  cd "$WT" && printf 'const a = { color: TL.danger };\n' > src/zz-vakt-probe.tsx && node scripts/check-signalfarge-tekst.mjs; echo "exit=$?"; rm src/zz-vakt-probe.tsx; git status --porcelain src
  ```
  Forventet: `signalfarge som tekstfarge har ØKT i 1 fil(er)`, `  src/zz-vakt-probe.tsx: 0 → 1 (origin/main → HEAD)`, `exit=1`, og `git status --porcelain src` tom (1.1 er allerede committet).

- [ ] **Steg 4: Lint.**
  ```bash
  cd "$WT" && npx eslint --max-warnings 0 scripts/check-signalfarge-tekst.mjs && echo LINT-OK
  ```

- [ ] **Steg 5: Inn i verify og CI.** `package.json:15`: sett inn etter fasitdekning, slik at slutten lyder:
  ```
  && node scripts/check-tl-kontrast.mjs && node scripts/check-fasitdekning-baseline.mjs && node scripts/check-signalfarge-tekst.mjs && npm run build",
  ```
  `ci.yml`: sett inn etter linje 68 (`run: node scripts/check-fasitdekning-baseline.mjs`, etter 1.3):
  ```yaml

        - name: "Signalfarge-vakt (color: TL.<signal> som tekst øker aldri per fil)"
          run: node scripts/check-signalfarge-tekst.mjs
  ```
  (Anførselstegn er nødvendige: `color: TL` inneholder kolon-mellomrom, som ellers leses som en ny YAML-nøkkel.) `Unit tests` ender på linje 73. Kontroll: `cd "$WT" && ruby -ryaml -e 'puts YAML.load_file(".github/workflows/ci.yml")["jobs"]["verify"]["steps"].size'` → `17`, og `grep -c "run: node scripts/check-" .github/workflows/ci.yml` → `5`.

- [ ] **Steg 6: Commit.**
  ```bash
  cd "$WT" && git add scripts/check-signalfarge-tekst.mjs src/lib/__tests__/scripts/check-signalfarge-tekst.test.ts package.json .github/workflows/ci.yml
  git commit -m "feat(scripts): check-signalfarge-tekst — color: TL.<signal> som tekst øker aldri per fil

Vei A (03.09.2026): danger/ok/warn/viz-target er signalfarger, ikke tekst.
Baseline-vakt mot origin/main per fil (305 forekomster i 168 filer i dag —
ingen opprydding her). Rename sammenlignes mot gammel sti, ny fil mot 0,
untracked filer tas med. I verify og ci.yml.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 1.5: Sluttkontroll, PR, review og merge

**Filer:**
- Modify: `docs/feillogg.md` (én linje nederst, øktslutt-regelen i CLAUDE.md pkt. 10)
- Modify (kun hvis raden finnes): `docs/MASTERPLAN-GJENSTAAENDE.md` rad `20.1`

- [ ] **Steg 1: Delportene i worktreen** (erstatter `npm run verify`, som feiler på build og critical-imports uten egen `node_modules` — feillogg 29.08):
  ```bash
  cd "$WT" && export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy && npx prisma validate && npx prisma generate && npx tsc --noEmit && npx eslint --quiet src && npx eslint --max-warnings 0 scripts/check-fasitdekning-baseline.mjs scripts/check-signalfarge-tekst.mjs && node scripts/check-action-auth.mjs && node scripts/check-token-gap.mjs && node scripts/check-ingen-paper.mjs && node scripts/check-v2shell-bredde.mjs && node scripts/ak-golf-tokens.mjs && node scripts/check-ak-golf-kits.mjs --rask && node scripts/check-doc-lenker.mjs && node scripts/check-tl-kontrast.mjs && node scripts/check-fasitdekning-baseline.mjs && node scripts/check-signalfarge-tekst.mjs && npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"; git status --porcelain
  ```
  Forventet: alle steg uten feil, `fail 0`, og `git status --porcelain` tom (kontrast-fila regenereres identisk). Rødt = fiks i samme gren før neste steg. Kjører du i stedet i en utsjekk med egen `node_modules` (etter `npm ci` i worktreen), er `npm run verify > "$WT/verify.log" 2>&1; tail -30 "$WT/verify.log"` den fulle porten — `verify.log` committes ikke.

- [ ] **Steg 2: Push og PR** (malen i `.claude/commands/pr.md`):
  ```bash
  cd "$WT" && git push -u origin claude/fase1-okt1-ci-vakter
  gh pr create --title "feat(ci): fase 1 økt 1 — fem vakter i verify og CI (ingen-paper, bredde, kontrast, dekning, signalfarge)" --body "$(cat <<'EOF'
  ## Hva
  Designport fase 1, økt 1 (planen 05.09 §4 pkt. 1). Fem vakter i `npm run verify` og som steg i `ci.yml`:
  - `check-ingen-paper.mjs` (blokkerende) — sto kun i verify
  - `check-v2shell-bredde.mjs` (blokkerende) — den ene fila som feilet (`admin/workbench/[playerId]/page.tsx`, 3 åpninger) har fått `bredde="full"` (= defaulten, ingen visuell endring)
  - `check-tl-kontrast.mjs` (rapport, ikke `--streng`)
  - ny `check-fasitdekning-baseline.mjs` — HEAD siterer aldri færre Train-lock-tegninger enn den committede baselinen i `tests/visual/fasitdekning-baseline.json` (150/210 i dag)
  - ny `check-signalfarge-tekst.mjs` — `color: TL.(danger|ok|warn|viz.target)` øker aldri per fil (305 forekomster i 168 filer i dag; opprydding er 19.6-sweepen, ikke denne PR-en)

  ## Hvorfor
  Vaktene holder porten én vei (planen §5 pkt. 3) uten at noen må huske å kjøre dem. CI henter origin/main eksplisitt (dybde 1) fordi checkout er uten historikk.

  ## Testet
  - [x] tsc, eslint, alle check-skript og `npm test` grønt lokalt (worktree uten build — CI tar build)
  - [x] 5 nye node:test-tester (`src/lib/__tests__/scripts/`)
  - [x] Signalfarge-vakten bevist rød med en untracked probe-fil (0 → 1), deretter slettet
  - [ ] Ingen UI-endring — skjermbilde ikke aktuelt

  Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  PRNR=$(gh pr view --json number -q .number); echo "$PRNR"
  ```

- [ ] **Steg 3: feillogg og (betinget) MASTERPLAN.** Legg én linje NEDERST i `docs/feillogg.md` (fila har to formater: pipe-rader øverst fra før 20.08, og siden 20.08 punktlinjer `- <dato> (<økt>): …` som legges til sist — #787 la sin som siste linje 05.09): `- 2026-09-06 (fase 1 økt 1): ren økt` — eller det som faktisk kostet tid, med rotårsak og regel slik linje 3 krever. Sjekk så om STEG 20 er kommet inn i main: `grep -c "^| 20.1" "$WT/docs/MASTERPLAN-GJENSTAAENDE.md"`. Gir det `0` (slik det er på origin/main 06.09 — STEG 20 ligger i lokal commit `ae73b1658` på docs-grenen bak PR #790, ikke pushet): ikke rør fila, og skriv i PR-body «MASTERPLAN 20.1 finnes ikke på main ennå — markeres når PR #790 (designport-docs) er merget». Gir det `1`: i rad 20.1 erstattes teksten `vakter i verify/CI (ingen-paper, bredde, kontrast-rapport, dekningsvakt, signalfarge-tellevakt),` med `~~vakter i verify/CI (ingen-paper, bredde, kontrast-rapport, dekningsvakt, signalfarge-tellevakt)~~ (økt 1 levert, PR #$PRNR),` (PR-nummeret som tall).
  ```bash
  cd "$WT" && node scripts/check-doc-lenker.mjs && git add docs/feillogg.md
  git commit -m "docs(feillogg): fase 1 økt 1 — vakter i verify og CI (PR #$PRNR)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  git push
  ```
  (Ble MASTERPLAN endret: `git add docs/MASTERPLAN-GJENSTAAENDE.md` i samme commit, melding `docs(masterplan): marker økt 1 (vakter i verify/CI) levert (PR #$PRNR)`.)

- [ ] **Steg 4: Review, grønn CI, merge.** Kjør `pr-review-toolkit:review-pr` på PR-en; rett funn i samme gren (sjekklista i CLAUDE.md pkt. 8: ingen nye byggevarsler, tsc grønn, ingen nye avhengigheter — `git diff origin/main -- package.json` skal kun vise `verify`-linja, og `vercel.json` er urørt). Vent på grønn CI: `gh pr checks $PRNR --watch`. Bekreft at de nye stegene faktisk kjørte: åpne lenken fra `gh pr checks $PRNR` (jobben `verify`) og se at `Ingen-Paper gate`, `V2Shell-bredde gate`, `Train-lock kontrast`, `Hent origin/main`, `Fasitdekning-vakt` og `Signalfarge-vakt` står som grønne steg. Så: `gh pr merge $PRNR --squash --delete-branch`. Rydd: `cd /Users/anderskristiansen/Developer/akgolf-hq && git worktree remove "$WT"`.

---

### Ferdig når

- `cd "$WT" && node scripts/check-v2shell-bredde.mjs; echo $?` → `check-v2shell-bredde: OK — alle <V2Shell> har eksplisitt bredde-prop.` og `0`.
- `cd "$WT" && node -e "console.log(require('./package.json').scripts.verify.split(' && ').filter(s=>/check-(v2shell-bredde|fasitdekning-baseline|signalfarge-tekst)/.test(s)).length)"` → `3`.
- `grep -c "run: node scripts/check-" .github/workflows/ci.yml` → `5`; `grep -c "git fetch --no-tags --depth=1 origin" .github/workflows/ci.yml` → `1`; `ruby -ryaml -e 'puts YAML.load_file(".github/workflows/ci.yml")["jobs"]["verify"]["steps"].size'` → `17`.
- `node scripts/check-fasitdekning-baseline.mjs; echo $?` → `OK — fasitdekning HEAD N/210 · baseline N/210` (N = `sitert` i `tests/visual/fasitdekning-baseline.json`; 150 per 06.09) og `0`.
- `node scripts/check-signalfarge-tekst.mjs; echo $?` → `OK — … ingen har fått flere.` og `0`.
- `npx tsx --test src/lib/__tests__/scripts/*.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"` → `tests 5` / `pass 5` / `fail 0`; `npm test` → `fail 0`.
- `gh pr view $PRNR --json state -q .state` → `MERGED`; CI-kjøringen på main etter merge er grønn med alle 17 steg (`gh run list --branch main --limit 1`).
- `git -C /Users/anderskristiansen/Developer/akgolf-hq worktree list` viser ikke lenger `fase1-okt1`.

### Åpne funn (ikke løst i denne økta)

1. Bestillingens regex sier `vizTarget`; nøkkelen i `src/lib/v2/train-lock.ts:199` er `viz.target` (`TL.viz.target`). Med `vizTarget` teller vakten 300 i 166 filer og overser 5 forekomster i 5 filer; planen bruker `viz\.target` (305/168). Ingen annen `TL.viz*`-nøkkel brukes som `color:`.
2. Designport-planen og vedlegget ligger i PR #790 (ÅPEN 06.09, gren `claude/design-implementation-status-14d2ce`, remote `2d9ee6e08`). MASTERPLAN STEG 20 (rad 20.1 = denne økta) og beslutningen ligger i lokal commit `ae73b1658` på samme gren, ikke pushet — og indeksfila `docs/superpowers/plans/2026-09-05-designport-fase-1.md` pluss økt-planene (`…-fase-1-okt-N.md`) er untracked i den worktreen. `node scripts/check-doc-lenker.mjs` går grønt der 06.09 fordi indeksfila finnes i arbeidstreet, men `.claude/rules/beslutninger.md:36` og MASTERPLAN 20.1 lenker til den: pushes `ae73b1658` uten at fila committes samtidig, blir verify rød på main. Den som pusher docs-grenen må ta med `…-fase-1.md` og økt-planene i samme commit.
3. Lokal falsk-positiv i signalfarge-vakten (kun den — fasitdekning-vakten sammenligner mot en committet fil, ikke mot en gren): har main gått videre etter at grenen ble laget, sammenlignes arbeidstreet mot en nyere main (fjerner main en `color: TL.ok` i en fil du også har endret, ser din gren ut som «flere»). Løsningen er å flette origin/main inn i grenen først — i CI er HEAD alltid merge-commiten «PR inn i main», så der er tallet eksakt. Ikke bygd inn `merge-base`-logikk: bestillingen sier origin/main.
4. `check-tl-kontrast.mjs` skriver `docs/design-audit/train-lock-kontrast.md` også i CI, men ingen sjekker at den committede fila er lik den genererte. Et `git diff --exit-code docs/design-audit/train-lock-kontrast.md` rett etter steget ville fanget drift. Ikke bestilt.
5. `.claude/commands/pr.md` pkt. 2 lister bare `prisma validate`, `prisma generate`, `tsc`, `eslint`, `check-action-auth`, `check-token-gap` og `build` som innholdet i `npm run verify` — kjeden har 16 ledd etter denne økta. Dokumentdrift, ikke rørt.
6. `scripts/check-critical-imports.mjs:37` skriver til `/tmp/critical-check.js` og leser esbuild fra `process.cwd()/node_modules` — derfor kan verken den eller build kjøres i en nøstet worktree uten egen `node_modules`. Samme klasse som feillogg 29.08; ikke del av økta.
7. Hovedsjekkuten (`feat/steg-19-6-19-7-kontrast-tallhero`, 151 ucommittede filer, kø 30) er 19.6-sweepen som reduserer `color: TL.<signal>`. Signalfarge-vakten blokkerer bare økninger, så den sweepen går gjennom uansett rekkefølge — baseline-tallet i vaktens filhode (305/168) er datert 06.09.2026 og blir historisk når sweepen merges; det er datert, ikke feil.
