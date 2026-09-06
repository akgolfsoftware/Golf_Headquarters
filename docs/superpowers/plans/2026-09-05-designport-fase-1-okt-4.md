# Fase 1 · Økt 4 — Riggen får felt og panel-modus; AO-radene rettes

**Mål:** `tests/visual/skjerm-mapping.ts` får feltene `fasitDato` / `minutter` / `aarsak` / `viewport` / `selector` (med vakt-test), alle rader får `fasitDato`, README får gyldighetssjekken og avviksliste-regelen, `scripts/train-lock-pixel-diff.mjs` kan måle et innebygd panel (panel-modus), de tre AO-radene peker på de ekte adressene, og AO-03/AO-08 er målt mot prod med tall i raden.

**Forutsetninger:**
- Hovedsjekkuten `~/Developer/akgolf-hq` sto 05.09 på grenen `feat/steg-19-6-19-7-kontrast-tallhero` med ucommittede endringer (en parallell økt). Ikke rør den. Jobb i en egen worktree:
  ```bash
  cd /Users/anderskristiansen/Developer/akgolf-hq && git fetch origin
  git worktree add /Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt4 -b claude/fase1-okt4-rigg-panelmodus origin/main
  cd /Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt4 && git branch --show-current
  ```
  Forventet: `claude/fase1-okt4-rigg-panelmodus`. Sett `WT=/Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt4` i hver kommando under (absolutte stier, jf. gotchas §Shell-cwd).
- Sjekk at de tre parallelle PR-ene er merget: `gh pr view 787 --json state -q .state; gh pr view 788 --json state -q .state; gh pr view 789 --json state -q .state` → tre ganger `MERGED`. Er #787 eller #789 fortsatt `OPEN`, har mapping-fila 12 rader i stedet for 17 — planen under dekker begge tilfeller (radene fra #787/#789 ligger etter linje 145 og flytter ikke AO-radene på linje 97–123). Vent med å merge din PR til de er inne, ellers ryker `npm test` på main når deres rader kommer uten `fasitDato`.
- **Kjør økt 3 (`docs/superpowers/plans/2026-09-05-designport-fase-1-okt-3.md`) FØR denne — eller sjekk at PR-en derfra allerede er inne på `origin/main`.** Økt 3 sin oppgave 3.3 legger et eget `testDato?: string;`-felt i `SkjermMapping`-typen RETT ETTER `notat: string;` — samme anker som oppgave 4.1 steg 2 under bruker. Økt 3 sitt eget dokument sier dette eksplisitt («VIKTIG merknad om rekkefølge» i dens oppgave 3.3): denne øktas type-utvidelse (`fasitDato`/`minutter`/`aarsak`/`viewport`/`selector`) bygger videre på økt 3 sin, ikke omvendt. Er `testDato?: string;` allerede i typen når du gjør oppgave 4.1 steg 2: sjekk innholdet på nytt med `sed -n '14,30p' tests/visual/skjerm-mapping.ts` FØR du erstatter — «erstatter linje 24–26»-blokken der forutsetter typen slik den så ut 06.09 (ingen `testDato`); finnes feltet allerede, sett de fem nye feltene rett ETTER `testDato?: string;` i stedet, med samme innhold ellers uendret.
- **Riggen kjører mot PROD (`https://akgolf-hq.vercel.app`) med ekte innlogging** (`coachtest@akgolf.test`, passord `SCREENTEST_PASSWORD` i hovedsjekkutens `.env.local`). Worktreen har ingen `.env.local`, og den skal ALDRI kopieres (gotchas). Kjør derfor målingene med hovedsjekkuten som arbeidskatalog og worktreens script i subshell — mønsteret står i oppgave 4.5. Fasitfilene i hovedsjekkuten er identiske med origin/main (verifisert 05.09: `git -C /Users/anderskristiansen/Developer/akgolf-hq diff --stat origin/main -- designsystem/train-lock tests/visual` er tom).
- `npm run verify` i en nøstet worktree: `prisma generate` trenger `export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy` (kun i skallet, aldri i fil), og `npm run build` kan feile med «Could not find the Next.js package» (feillogg 29.08). Feiler bare build slik, kjør delportene `npx tsc --noEmit && npx eslint --quiet src && npm test && node scripts/check-doc-lenker.mjs` og la CI ta build. Alt annet rødt = fiks før commit.
- Aldri `git add -A`. Stage navngitte filer.

---

### Oppgave 4.1: Rad-typen får feltene, med vakt-test og `fasitDato` på alle rader

**Filer:**
- Create: `src/lib/__tests__/visual/skjerm-mapping.test.ts`
- Modify: `tests/visual/skjerm-mapping.ts:14-26` (typen) og hver rad i `SKJERM_MAPPING` (linje 28→)

**Grensesnitt:** `SkjermMapping` får `fasitDato?: string`, `minutter?: number`, `aarsak?: "fasit-utdatert" | "innebygd-panel" | "kjent-layoutavvik"`, `viewport?: { bredde: number; hoyde: number }`, `selector?: string`. Oppgave 4.4 leser `viewport`/`selector` (via CLI-flagg), 4.5 fyller `minutter`.

- [ ] **Steg 1: Skriv testen først.** Opprett `src/lib/__tests__/visual/skjerm-mapping.test.ts`:
  ```ts
  import test from "node:test";
  import assert from "node:assert/strict";
  import { SKJERM_MAPPING } from "../../../../tests/visual/skjerm-mapping";

  // Vakt for sign-off-riggen (fase 1, økt 4 — docs/superpowers/plans/2026-09-05-komplett-designport.md §3 regel 2):
  // ingen måling mot en tegning uten dato, ingen «ukalibrert» uten årsak, panel-modus alltid komplett.

  const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

  test("hver riggrad har fasitDato (git-dato for fasitfila, YYYY-MM-DD)", () => {
    for (const rad of SKJERM_MAPPING) {
      assert.match(rad.fasitDato ?? "", ISO_DATO, `${rad.label}: mangler fasitDato`);
    }
  });

  test("ukalibrert krever aarsak", () => {
    for (const rad of SKJERM_MAPPING) {
      if (rad.status === "ukalibrert") assert.ok(rad.aarsak, `${rad.label}: ukalibrert uten aarsak`);
    }
  });

  test("panel-modus: selector og viewport settes sammen, cropTop er 0", () => {
    for (const rad of SKJERM_MAPPING) {
      assert.equal(Boolean(rad.selector), Boolean(rad.viewport), `${rad.label}: selector og viewport hører sammen`);
      if (rad.viewport) {
        assert.ok(rad.viewport.bredde > 0 && rad.viewport.hoyde > 0, `${rad.label}: viewport må være positiv`);
        assert.equal(rad.cropTop, 0, `${rad.label}: et panel har ingen bakt statuslinje`);
      }
    }
  });
  ```
  Kjør: `cd "$WT" && npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/visual/skjerm-mapping.test.ts`
  Forventet: TypeScript-feil (`fasitDato` finnes ikke på typen) eller «hver riggrad har fasitDato» feiler for alle rader. Rødt er riktig nå.

- [ ] **Steg 2: Utvid typen.** I `tests/visual/skjerm-mapping.ts` erstattes linje 24–26
  ```ts
    status: "kalibrert" | "ukalibrert";
    notat: string;
  };
  ```
  med
  ```ts
    status: "kalibrert" | "ukalibrert";
    notat: string;
    /**
     * Siste endring av fasitfila i repoet (YYYY-MM-DD):
     * `git log -1 --format=%ad --date=short -- "designsystem/train-lock/<fil>"`.
     * Grunnlag for gyldighetssjekken i README.md. NB: 2026-08-25 er
     * bulk-importdatoen (PR #581) — en fil med den datoen kan være tegnet
     * 23.–24.08. Datoen betyr «ikke nyere enn», aldri «tegnet den dagen».
     */
    fasitDato?: string;
    /** Målt tid brukt på raden (seed + måling + notat), i minutter. Måles, anslås aldri. */
    minutter?: number;
    /** Påkrevd når status er "ukalibrert": hvorfor pixel-diff ikke er et signal ennå. */
    aarsak?: "fasit-utdatert" | "innebygd-panel" | "kjent-layoutavvik";
    /**
     * Panel-modus (README.md §Panel-modus). Fasitrammen er et innebygd panel,
     * ikke en skjerm: appen rendres i `viewport`, og utsnittet klippes fra
     * `selector`-elementets øvre venstre hjørne med fasitrammens bredde/høyde.
     * Begge eller ingen.
     */
    viewport?: { bredde: number; hoyde: number };
    selector?: string;
  };
  ```

- [ ] **Steg 3: Hent datoene for alle fasitfiler i mapping.** Kjør fra `$WT`:
  ```bash
  grep -o 'label: "[^"]*"' tests/visual/skjerm-mapping.ts | sed 's/label: "\(.*\)"/\1/' | while IFS= read -r lbl; do
    f=$(grep -l "data-screen-label=\"$lbl\"" designsystem/train-lock/*.dc.html | head -1)
    printf '%s | %s | %s\n' "$lbl" "${f#designsystem/train-lock/}" "$(git log -1 --format=%ad --date=short -- "$f")"
  done
  ```
  Forventet (verifisert 05.09 mot origin/main):
  ```
  PH-01 I dag | PH-01 I dag.dc.html | 2026-08-28
  TE-01 Tester hub | TE-01 Tester hub iPhone.dc.html | 2026-08-25
  TM-04a Analyse-hub iPhone | TM-04 Analyse-hub TrackMan.dc.html | 2026-08-25
  TM-01a Liste iPhone | TM-01 TrackMan liste.dc.html | 2026-08-25
  PH-07 Plan | PH-07 Plan.dc.html | 2026-08-28
  RU-04 Etterregistrering | RU-04 Player Etterregistrering ark.dc.html | 2026-08-25
  ME-03 Abonnement | ME-03 Abonnement.dc.html | 2026-08-25
  AO-01 Cockpit 1440 | AO-01 Cockpit ko godkjenning.dc.html | 2026-08-25
  AO-03 Ko 1440 | AO-01 Cockpit ko godkjenning.dc.html | 2026-08-25
  AO-08 Godkjenn 1440 | AO-01 Cockpit ko godkjenning.dc.html | 2026-08-25
  AG-04 Stall | AG-04 Stall.dc.html | 2026-08-25
  AG-03 Innboks | AG-03 Innboks.dc.html | 2026-08-28
  S3-03a Spiller profil Mac | S3-03 Spiller profil bento.dc.html | 2026-08-28      (kun hvis #787 er merget)
  S3-03b Spiller profil iPhone | S3-03 Spiller profil bento.dc.html | 2026-08-28   (kun hvis #787 er merget)
  PH-21a Min kurve iPhone | PH-21 Min kurve.dc.html | 2026-09-01                   (kun hvis #789 er merget)
  PH-21b Min kurve desktop 1280 | PH-21 Min kurve.dc.html | 2026-09-01             (kun hvis #789 er merget)
  PH-21c Min kurve tom iPhone | PH-21 Min kurve.dc.html | 2026-09-01               (kun hvis #789 er merget)
  ```
  Avviker en dato fra tabellen, gjelder kommandoens svar — ikke tabellen.

- [ ] **Steg 4: Legg `fasitDato` og `aarsak` inn i hver rad.** Sett linjen `fasitDato: "<dato fra steg 3>",` rett etter `bruker:`/`seedScript:`-linjene (før `kalibrertAvvikPst`/`status`) i hver rad. I de ukalibrerte radene legges `aarsak:` rett etter `status: "ukalibrert",`:

  | Rad | `aarsak` |
  |---|---|
  | RU-04 Etterregistrering (linje 80–87) | `"kjent-layoutavvik"` |
  | ME-03 Abonnement (88–96) | `"fasit-utdatert"` |
  | AO-01 Cockpit 1440 (97–105) | `"fasit-utdatert"` |
  | AO-03 Ko 1440 (106–114) | `"innebygd-panel"` |
  | AO-08 Godkjenn 1440 (115–123) | `"innebygd-panel"` |
  | AG-04 Stall (124–134) | `"fasit-utdatert"` |
  | AG-03 Innboks (135–144) | `"fasit-utdatert"` |

  `minutter` settes IKKE på eksisterende rader — tiden ble ikke målt da, og et anslag er et brudd på «måles, anslås aldri».

- [ ] **Steg 5: Grønt.** `npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/visual/skjerm-mapping.test.ts` → `# pass 3`, `# fail 0`. Deretter `npx tsc --noEmit` → ingen utskrift.

- [ ] **Steg 6: Commit**
  ```bash
  git add tests/visual/skjerm-mapping.ts src/lib/__tests__/visual/skjerm-mapping.test.ts
  git commit -m "test(rigg): riggrad-felt fasitDato/minutter/aarsak/viewport/selector + vakt-test (fase 1, økt 4)

  Alle rader får fasitDato fra git log på fasitfila; ukalibrerte rader får aarsak.
  Testen låser at ingen rad måles uten dato og at panel-modus alltid er komplett.

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 4.2: De tre AO-radene peker på de ekte adressene, ikke redirectene

**Filer:**
- Modify: `tests/visual/skjerm-mapping.ts:97-123` (AO-01, AO-03, AO-08 — linjenumrene er de samme etter 4.1 pluss antall linjer du la til over)
- Modify: `scripts/design-audit.mjs:135-138` (`fasitStatus` må forstå `?fane=`-adresser)
- Test: `src/lib/__tests__/visual/skjerm-mapping.test.ts`

Redirect-målene er verifisert 05.09 i `src/app/admin/agenticos/page.tsx:11` (`redirect("/admin/jarvis")`), `src/app/admin/agenticos/ko/page.tsx:10` (`redirect("/admin/ko?fane=agentko")`) og `src/app/admin/agenticos/godkjenn/page.tsx:10` (`redirect("/admin/ko?fane=agentgodkjenn")`). Fane-id-ene `agentko`/`agentgodkjenn` står i `src/lib/admin/ko/faner.ts:43-53` og krever `USE_AGENTS` — `coachtest` er ADMIN (`scripts/seed-screentest-coach.ts:183`).

- [ ] **Steg 1: Test først.** Legg til nederst i `src/lib/__tests__/visual/skjerm-mapping.test.ts`:
  ```ts
  test("ingen rad peker på en redirect-adresse under /admin/agenticos (MASTERPLAN 15.1/15.5)", () => {
    for (const rad of SKJERM_MAPPING) {
      assert.ok(!rad.rute.startsWith("/admin/agenticos"), `${rad.label}: ${rad.rute} er en redirect`);
    }
  });
  ```
  Kjør testfila → den nye testen feiler med tre rader (AO-01, AO-03, AO-08).

- [ ] **Steg 2: Bytt radene.** Erstatt de tre AO-objektene (som etter 4.1 har `fasitDato`/`aarsak`) med nøyaktig:
  ```ts
    {
      label: "AO-01 Cockpit 1440",
      rute: "/admin/jarvis",
      tema: "dark",
      cropTop: 0,
      bruker: "coachtest",
      fasitDato: "2026-08-25",
      status: "ukalibrert",
      aarsak: "fasit-utdatert",
      notat: "Rute byttet 05.09 (fase 1, økt 4) fra redirect-adressen /admin/agenticos til /admin/jarvis (MASTERPLAN 15.5, PR #701; Kø er standardfanen). Fasiten viser en utdatert AgenticOS-spesifikk rail (Cockpit/Kø/Godkjenn/Projects/Runtimes/Skills). Appen har allerede AX-01s fem-destinasjoners rail (Stall/Workbench/Kø/Jarvis/Meg — dagens kanon, se beslutninger.md). Fasiten må tegnes om mot AX-01 før dette er en meningsfull sjekk.",
    },
    {
      label: "AO-03 Ko 1440",
      rute: "/admin/ko?fane=agentko",
      tema: "dark",
      cropTop: 0,
      bruker: "coachtest",
      seedScript: "scripts/seed-screentest-coach.ts",
      fasitDato: "2026-08-25",
      status: "ukalibrert",
      aarsak: "innebygd-panel",
      viewport: { bredde: 1440, hoyde: 900 },
      selector: '[data-screen-label="AO-03 Ko"]',
      notat: "Rute byttet 05.09 (fase 1, økt 4) fra redirect-adressen /admin/agenticos/ko til /admin/ko?fane=agentko (MASTERPLAN 15.1). Fasit-rammen er 760×640 — et INNEBYGD panel tegnet for visning inni en større 1440-canvas. Måles i panel-modus (README §Panel-modus): app ved 1440×900, utsnitt fra AdminAgenticosKo-elementet. Tall kommer i oppgave 4.5.",
    },
    {
      label: "AO-08 Godkjenn 1440",
      rute: "/admin/ko?fane=agentgodkjenn",
      tema: "dark",
      cropTop: 0,
      bruker: "coachtest",
      seedScript: "scripts/seed-screentest-coach.ts (gir 3 PENDING PlanAction — uten dem viser appen AO-12f tom, og selectoren finnes ikke)",
      fasitDato: "2026-08-25",
      status: "ukalibrert",
      aarsak: "innebygd-panel",
      viewport: { bredde: 1440, hoyde: 900 },
      selector: '[data-screen-label="AO-08 Godkjenn"]',
      notat: "Rute byttet 05.09 (fase 1, økt 4) fra redirect-adressen /admin/agenticos/godkjenn til /admin/ko?fane=agentgodkjenn (MASTERPLAN 15.1). Fasit-rammen er 620 px bred uten fast høyde (måles fra elementet). Panel-modus som AO-03. Tall kommer i oppgave 4.5.",
    },
  ```
  Selectorene finnes i koden: `src/components/admin/v2/agenticos/AdminAgenticosKo.tsx:39` (`data-screen-label="AO-03 Ko"`) og `src/components/admin/v2/agenticos/AdminAgenticosGodkjenn.tsx:56` (`data-screen-label="AO-08 Godkjenn"`).

- [ ] **Steg 3: `design-audit.mjs` må telle `?fane=`-adresser for familien.** Kjør først `node scripts/design-audit.mjs --familie admin/ko --uten-detektor | grep 'admin/ko'` → kolonnen `fasit` viser `ingen` (den krever `"/admin/ko"` med lukkende anførselstegn, linje 137). Erstatt linje 135–138
  ```js
    /* Lukkende anførselstegn er viktig: uten det treffer «/admin/ko» også
       «/admin/kommunikasjon» (funnet i review 03.09). */
    if (!k.includes(`"${rute}"`)) return "ingen";
    return new RegExp(`"${rute.replace(/[/]/g, "\\/")}"[^}]*status:\\s*"kalibrert"`, "s").test(k) ? "kalibrert" : "ukalibrert";
  ```
  med
  ```js
    /* Lukkende anførselstegn (eller «?» for fane-adresser som «/admin/ko?fane=agentko»,
       økt 4 05.09) er viktig: uten det treffer «/admin/ko» også «/admin/kommunikasjon»
       (funnet i review 03.09). */
    const ruteRe = `"${rute.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(\\?[^"]*)?"`;
    if (!new RegExp(ruteRe).test(k)) return "ingen";
    /* Første status-felt ETTER ruten, non-greedy — et nøstet objekt (viewport)
       mellom rute og status stoppet det gamle [^}]*-søket. */
    const m = new RegExp(`${ruteRe}[\\s\\S]*?status:\\s*"(kalibrert|ukalibrert)"`).exec(k);
    return m?.[2] === "kalibrert" ? "kalibrert" : "ukalibrert";
  ```
  Kjør igjen: `node scripts/design-audit.mjs --familie admin/ko --uten-detektor | grep 'admin/ko'` → `fasit` = `ukalibrert`. Og `node scripts/design-audit.mjs --familie "portal/(rot)" --uten-detektor | grep 'portal'` → fortsatt `kalibrert` (PH-01, uendret). (Verifisert 06.09: `--familie portal` alene treffer 0 familier — familie-id-en for PH-01s rute `/portal` er `portal/(rot)`, se `familier()` i `design-audit.mjs`, ikke bare flatenavnet.)

- [ ] **Steg 4: Grønt.** Testfila → `# pass 4`. `npx tsc --noEmit` stille.

- [ ] **Steg 5: Commit**
  ```bash
  git add tests/visual/skjerm-mapping.ts src/lib/__tests__/visual/skjerm-mapping.test.ts scripts/design-audit.mjs
  git commit -m "fix(rigg): AO-radene peker på /admin/jarvis og /admin/ko?fane=…, ikke redirect-adressene

  design-audit teller nå fane-adresser for familien og leser status non-greedy
  (viewport-objektet i raden brøt det gamle [^}]*-søket).

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 4.3: README får gyldighetssjekk og avviksliste-regel

**Filer:**
- Modify: `tests/visual/README.md` — ny seksjon etter linje 23 (før `## Kjøre en kalibrert skjerm` på linje 25), og oppdatert kjøre-blokk linje 27–30

- [ ] **Steg 1: Sett inn seksjonen** mellom linje 23 og 25:
  ```markdown
  ## Gyldighetssjekk før måling

  Fire av sju mislykkede målinger (01.–02.09.2026) skyldtes tegningen, ikke koden.
  Derfor: sjekk at fasiten er dagens kanon FØR du måler. Hver rad har `fasitDato`
  (git-dato for fasitfila; 25.08.2026 er bulk-importdatoen fra PR #581, så en fil med
  den datoen kan være tegnet 23.–24.08 — datoen betyr «ikke nyere enn»). Datoen alene
  avgjør ikke; se på innholdet med kommandoen i tabellen.

  | Gjelder | Regel | Sjekk | Kilde |
  |---|---|---|---|
  | Rail/tabbar i en AgencyOS-fasit | Tegnet før 25.08.2026 = utdatert. AX-01 har fem destinasjoner: Stall · Workbench · Kø · Jarvis · Meg | `grep -L "Jarvis" "designsystem/train-lock/<fil>"` skriver filnavnet hvis railen mangler Jarvis (69 av AgencyOS-filene gjør det per 05.09) | `.claude/rules/beslutninger.md` §A1, overstyrt 25.08 |
  | Pris/tier (ME-03, oppgrader, abonnement) | Tegnet før 16.08.2026 = utdatert. Kun TALENT (gratis) og FULL (299 kr/mnd, 2 690 kr/år). «Elite» og «PRO» finnes ikke | `grep -c "Elite\|PRO" "designsystem/train-lock/<fil>"` skal gi 0 | `docs/platform/BUSINESS-RULES.md` §Abonnement |
  | Stall-rad (AG-04 og alt som lister spillere) | Tegnet før 30.08.2026 (beslutning 6.5) = utdatert: raden er navn · neste økt · siste aktivitet · én prikk — ikke HCP/SG | `grep -c "HCP\|SG" "designsystem/train-lock/<fil>"` > 0 i en spillerliste = utdatert | `.claude/rules/beslutninger.md` §GRILLINGEN RUNDE 6 pkt 5 |

  Treffer en regel: raden får `status: "ukalibrert"` og `aarsak: "fasit-utdatert"`. Mål
  gjerne likevel — tallet er dokumentasjon, ikke signal — og bestill omtegning. Tilpass
  aldri koden til en utdatert tegning.

  **Ingen rad får `status: "kalibrert"` uten eksplisitt avviksliste i filhodet til
  komponenten raden måler:** ` * Avvik: …`-linjer rett under ` * Fasit: …` i
  komponentens JSDoc-hode, én linje per kjent avvik. Prosenttallet sier ikke HVA som
  avviker; lista gjør. Mangler lista, står raden som ukalibrert til den er skrevet.
  Eksempel: `src/components/admin/v2/agenticos/AdminAgenticosKo.tsx` (økt 4).

  ## Panel-modus — innebygde paneler (AO-03, AO-08 m.fl.)

  Noen fasitrammer er tegnet som paneler (AO-03: 760×640, AO-08: 620 px bred) ment å
  stå inni en større canvas, ikke som hel skjerm. Satt som viewport trigger de appens
  mobil-brekkpunkt (bredde < 700). Raden setter derfor `viewport` (appens ekte visning)
  og `selector` (elementet som tilsvarer rammen); riggen rendrer appen i den
  viewporten og klipper et utsnitt fra elementets øvre venstre hjørne med
  fasitrammens bredde og høyde:

  ```bash
  node scripts/train-lock-pixel-diff.mjs "AO-03 Ko 1440" "/admin/ko?fane=agentko" dark 0 \
    --viewport=1440x900 --selector='[data-screen-label="AO-03 Ko"]'
  ```

  `cropTop` er alltid 0 i panel-modus (ingen bakt statuslinje). Er appens element
  bredere enn fasitrammen (AO-03: 1144 px i V2Shell ved 1440 mot 760 i fasiten), faller
  høyre del utenfor utsnittet — det er et avvik som skal stå i notatet og avvikslista,
  ikke en feil i riggen. Finnes ikke selectoren (appen viser f.eks. tom tilstand med
  en annen `data-screen-label`), stopper riggen og sier det: seed først.
  ```

- [ ] **Steg 2: Oppdater kjøre-blokken** linje 27–30 (nå lenger ned) — legg til én linje etter `node scripts/train-lock-pixel-diff.mjs "PH-01 I dag" "/portal" dark 54`:
  ```bash
  SHOT_BRUKER=coachtest@akgolf.test node scripts/train-lock-pixel-diff.mjs "AO-03 Ko 1440" "/admin/ko?fane=agentko" dark 0 --viewport=1440x900 --selector='[data-screen-label="AO-03 Ko"]'   # panel-modus, AgencyOS
  ```

- [ ] **Steg 3: Sjekk.** `grep -c "Gyldighetssjekk før måling\|Panel-modus — innebygde" tests/visual/README.md` → `2`. `node scripts/check-doc-lenker.mjs` → `OK: ingen døde doc-lenker …` (README-en er ikke i listen dens, men kjør den likevel — gaten for docs-commits).

- [ ] **Steg 4: Commit**
  ```bash
  git add tests/visual/README.md
  git commit -m "docs(rigg): gyldighetssjekk før måling + avviksliste-regel + panel-modus i tests/visual/README.md

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 4.4: Panel-modus i `train-lock-pixel-diff.mjs`

**Filer:**
- Modify: `scripts/train-lock-pixel-diff.mjs:9`, `:23-24`, `:31`, `:71-74`, `:111-112`

**Grensesnitt:** flaggene `--viewport=<bredde>x<hoyde>` og `--selector='<css>'` (begge eller ingen). Posisjonelle argumenter er uendret, så alle eksisterende kall virker. Avvik fra bestillingen «`page.locator(selector).screenshot`»: elementet i appen er ofte bredere enn fasitrammen (AO-03: 1144 mot 760 px), og et elementskjermbilde ville feile på størrelsessjekken (linje 143–150). Derfor `page.screenshot({ clip })` med elementets hjørne og fasitrammens mål.

- [ ] **Steg 1: Header.** Etter linje 9 (`// Kjør:  node scripts/train-lock-pixel-diff.mjs <label> <rute> [tema] [cropTop] [BASE_URL]`) legg til:
  ```js
  //        … [--viewport=<bredde>x<hoyde> --selector='<css>']   panel-modus, se tests/visual/README.md
  ```

- [ ] **Steg 2: Argumentparsing.** Erstatt linje 23–24
  ```js
  const [label, rute, tema = "dark", cropTopArg = "0", BASE = process.env.SHOT_BASE || "https://akgolf-hq.vercel.app"] = process.argv.slice(2);
  const cropTop = Number(cropTopArg);
  ```
  med
  ```js
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
  // Panel-modus (tests/visual/README.md §Panel-modus): appen rendres i --viewport,
  // og utsnittet klippes fra --selector-elementets øvre venstre hjørne med
  // fasit-rammens bredde/høyde. Begge eller ingen.
  const selector = flagg.selector ?? null;
  const viewportFlagg = flagg.viewport ? flagg.viewport.split("x").map(Number) : null;
  if (Boolean(selector) !== Boolean(viewportFlagg) || (viewportFlagg && (viewportFlagg.length !== 2 || viewportFlagg.some((n) => !Number.isInteger(n) || n <= 0)))) {
    console.error("Panel-modus krever BÅDE --viewport=<bredde>x<hoyde> (heltall) OG --selector='<css>'.");
    process.exit(1);
  }
  ```
  Og linje 31 (`console.error("Bruk: …")`) blir:
  ```js
    console.error("Bruk: node scripts/train-lock-pixel-diff.mjs <label> <rute> [tema=dark] [cropTop=0] [BASE_URL] [--viewport=BxH --selector='css']");
  ```

- [ ] **Steg 3: Viewport fra raden.** Erstatt linje 71–74
  ```js
  // 2) App-skjermbilde, samme bredde/høyde som fasit-rammen, innlogget.
  const width = Math.round(box.width);
  const height = Math.round(box.height);
  const isMobile = width < 700;
  ```
  med
  ```js
  // 2) App-skjermbilde, innlogget. Uten panel-modus: samme bredde/høyde som
  // fasit-rammen. Med panel-modus: radens viewport — fasit-rammen er et panel,
  // ikke en skjerm, og satt som viewport ville den truffet feil brekkpunkt.
  const width = viewportFlagg ? viewportFlagg[0] : Math.round(box.width);
  const height = viewportFlagg ? viewportFlagg[1] : Math.round(box.height);
  const isMobile = width < 700;
  ```

- [ ] **Steg 4: Utsnittet.** Erstatt linje 111–112
  ```js
  const appFilSti = `${OUT_DIR}/${slug(label)}-app.png`;
  await appPage.screenshot({ path: appFilSti, fullPage: false });
  ```
  med
  ```js
  const appFilSti = `${OUT_DIR}/${slug(label)}-app.png`;
  if (selector) {
    const el = appPage.locator(selector).first();
    const synlig = await el.waitFor({ state: "visible", timeout: 30000 }).then(() => true, () => false);
    if (!synlig) {
      console.error(`Fant ikke ${selector} på ${rute}. Viser appen en annen tilstand (f.eks. tom) enn fasiten? Seed først (se raden i skjerm-mapping.ts).`);
      await browser.close();
      process.exit(1);
    }
    const elBox = await el.boundingBox();
    // Utsnitt = fasit-rammens mål fra elementets øvre venstre hjørne. Ikke
    // el.screenshot(): elementet er ofte bredere enn rammen (AO-03: 1144 vs
    // 760 px), og da ville størrelsessjekken under feile.
    const clip = { x: Math.round(elBox.x), y: Math.round(elBox.y), width: Math.round(box.width), height: Math.round(box.height) };
    if (clip.x + clip.width > width || clip.y + clip.height > height) {
      console.error(`Panelet (${clip.x},${clip.y} ${clip.width}×${clip.height}) stikker utenfor viewporten ${width}×${height} — øk --viewport.`);
      await browser.close();
      process.exit(1);
    }
    await appPage.screenshot({ path: appFilSti, clip });
  } else {
    await appPage.screenshot({ path: appFilSti, fullPage: false });
  }
  ```
  (`clip` og `boundingBox()` er begge viewport-relative i Playwright 1.59.1 når `fullPage` er av; siden er nylastet, så scroll er 0.)

- [ ] **Steg 5: Verifiser uten credentials** (worktreen har ingen `.env.local`, så passordsjekken på linje 34 skal være det som stopper — og den kommer ETTER flaggsjekken):
  ```bash
  node scripts/train-lock-pixel-diff.mjs "X" "/y" dark 0 --selector=a; echo "exit=$?"
  ```
  Forventet: `Panel-modus krever BÅDE …` og `exit=1`.
  ```bash
  node scripts/train-lock-pixel-diff.mjs "X" "/y" dark 0 --viewport=1440x900 --selector=a; echo "exit=$?"
  ```
  Forventet: `SCREENTEST_PASSWORD mangler i .env.local (eller sett SHOT_PASSWORD)` og `exit=1` — flaggene gikk gjennom.
  ```bash
  node scripts/train-lock-pixel-diff.mjs; echo "exit=$?"
  ```
  Forventet: `Bruk: … [--viewport=BxH --selector='css']`, `exit=1`.
  `node --check scripts/train-lock-pixel-diff.mjs` → stille.

- [ ] **Steg 6: Commit**
  ```bash
  git add scripts/train-lock-pixel-diff.mjs
  git commit -m "feat(rigg): panel-modus i train-lock-pixel-diff (--viewport/--selector)

  Innebygde fasitpaneler (AO-03 760x640, AO-08 620 bred) måles nå ved appens ekte
  viewport med utsnitt fra det tilsvarende elementet, i stedet for å sette
  panelmålet som viewport og treffe mobil-brekkpunktet.

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 4.5: Mål AO-03 og AO-08 i panel-modus mot prod

**Filer:**
- Modify: `tests/visual/skjerm-mapping.ts` (AO-03- og AO-08-radene: `kalibrertAvvikPst`, `minutter`, `status`/`aarsak`, `notat`)
- Modify: `src/components/admin/v2/agenticos/AdminAgenticosKo.tsx:6-7` og `src/components/admin/v2/agenticos/AdminAgenticosGodkjenn.tsx:7-8` (avviksliste i filhodet)
- Create: `docs/design-audit/$(date +%F)/rigg-panelmodus-ao/README.md` + seks jpg
- Modify: `tests/visual/README.md` (resultatseksjon nederst)

Fasitrammene (lest 05.09 i `designsystem/train-lock/AO-01 Cockpit ko godkjenning.dc.html`): `data-screen-label="AO-03 Ko 1440"` er `width: 760px; height: 640px; background: #000000; box-shadow: inset 0 0 0 1px #FFFFFF14; border-radius: 18px` med hode «Kø · Alle · 11 / Akademi / Produkt / Drift … Ny oppgave» og seksjonene Klar · 6 / Pågår · 2 / Venter godkjenning · 4. `data-screen-label="AO-08 Godkjenn 1440"` er `width: 620px` uten fast høyde, `padding: 20px`, hode «Godkjenn — Kun oppgaver med sideeffekt. Research lander i Cockpit.», én uthevet sak + tre kort + «Godkjent i dag: 2». **Kjøringen går mot prod med `coachtest@akgolf.test`.** Start klokka når du begynner steg 1 — `minutter` skal være målt.

- [ ] **Steg 1: Seed demo-coachen** (idempotent; kjøres fra hovedsjekkuten som har `.env.local`, med worktreens script):
  ```bash
  ( cd /Users/anderskristiansen/Developer/akgolf-hq && npx tsx "$WT/scripts/seed-screentest-coach.ts" 2>&1 | tail -12 )
  ```
  Forventet i «Verifikasjon»-blokken: `Godkjenninger PENDING:    3  (mål: 3)` og `Aktive enrolleringer:     37 …`. Uten de 3 PENDING viser AO-08-fanen tom tilstand (`AO-12f`), og selectoren finnes ikke.

- [ ] **Steg 2: Mål AO-03**
  ```bash
  ( cd /Users/anderskristiansen/Developer/akgolf-hq && SHOT_BRUKER=coachtest@akgolf.test node "$WT/scripts/train-lock-pixel-diff.mjs" "AO-03 Ko 1440" "/admin/ko?fane=agentko" dark 0 --viewport=1440x900 --selector='[data-screen-label="AO-03 Ko"]' )
  ```
  Forventet: fire linjer `fasit:/app:/diff:` under `tests/visual/ut/ao-03-ko-1440-*.png` (i hovedsjekkuten, gitignorert) og `avvik: N/486400 px = X.XX%` (760×640 = 486 400 piksler). Åpne `tests/visual/ut/ao-03-ko-1440-diff.png` og `-app.png` med `Read` og se: hodet «Kø» + filterpiller skal ligge øverst, radene under.

- [ ] **Steg 3: Mål AO-08**
  ```bash
  ( cd /Users/anderskristiansen/Developer/akgolf-hq && SHOT_BRUKER=coachtest@akgolf.test node "$WT/scripts/train-lock-pixel-diff.mjs" "AO-08 Godkjenn 1440" "/admin/ko?fane=agentgodkjenn" dark 0 --viewport=1440x900 --selector='[data-screen-label="AO-08 Godkjenn"]' )
  ```
  Forventet: `avvik: N/(620×H) px = X.XX%` der H er fasitrammens målte høyde. Stopper riggen med «Fant ikke [data-screen-label="AO-08 Godkjenn"]», er PENDING-radene borte — kjør steg 1 igjen.

- [ ] **Steg 4: Avviksliste i filhodene** (kravet fra 4.3 — uten den kan raden ikke bli kalibrert). Disse fem avvikene er sikre fra koden; legg til det diff-bildet viser i tillegg, én linje hver.
  I `AdminAgenticosKo.tsx` etter linje 7 (` * (§AO-03 Ko).`):
  ```ts
   * Rigg: AO-03 Ko 1440 (tests/visual/skjerm-mapping.ts, panel-modus).
   * Avvik: panelet er 1144 px bredt i V2Shell ved 1440 (rail 232 + px-8) mot fasitens
   *   760 — «Ny oppgave» (flex-end) ligger utenfor riggens utsnitt.
   * Avvik: fasitrammens 1px inset-hairline og radius 18 tegnes ikke — panelet ligger
   *   rett i skallets innhold, uten egen ramme.
   * Avvik: Klar-listen er MANUELLE_AGENTER fra agent-registry (antall og navn styres av
   *   registeret), fasiten viser seks eksempelrader; Pågår/Venter er PlanAction/AgentRun-
   *   data for coachtest (seed gir 0 pågår), fasiten viser 2/4.
  ```
  I `AdminAgenticosGodkjenn.tsx` etter linje 8 (` * (AO-08 kø + AO-12f tom). …` — sett inn etter hele setningen som slutter på linje 12):
  ```ts
   * Rigg: AO-08 Godkjenn 1440 (tests/visual/skjerm-mapping.ts, panel-modus; rammen ligger i
   *   AO-01 Cockpit ko godkjenning.dc.html, ikke i AO-12-fila).
   * Avvik: fasitrammen har padding 20 px innenfor en 620 px ramme — appens panel starter på
   *   x=0 i skallets innhold, så alt innhold ligger 20 px lenger opp og til venstre.
   * Avvik: seed gir 3 PENDING PlanAction (1 uthevet + 2 kort), fasiten viser 1 + 3; tittel/
   *   meta bygges fra suggestion-feltet og har annen tekst enn fasitens eksempler.
  ```

- [ ] **Steg 5: Oppdater de to radene** i `skjerm-mapping.ts` med målte tall. Regel: `status: "kalibrert"` (og fjern `aarsak`) hvis diff-bildet viser at hode og radstruktur ligger på samme sted (avvik i data, bredde og ramme er forventet og står i avvikslista); ellers `status: "ukalibrert"` med `aarsak: "kjent-layoutavvik"`. Skriv inn `kalibrertAvvikPst: <tallet fra steg 2/3 med to desimaler>`, `minutter: <målt fra steg 1 til og med steg 5>`, og et `notat` som starter med «Målt <dato> mot prod i panel-modus (fase 1, økt 4): X,XX %.» etterfulgt av de kjente avvikene fra steg 4 og det diff-bildet viste.

- [ ] **Steg 6: Arkiver bildene** (som PR #787 gjorde for S3-03):
  ```bash
  UT="$WT/docs/design-audit/$(date +%F)/rigg-panelmodus-ao"; mkdir -p "$UT"
  for f in ao-03-ko-1440 ao-08-godkjenn-1440; do for s in fasit app diff; do sips -s format jpeg -s formatOptions 80 "/Users/anderskristiansen/Developer/akgolf-hq/tests/visual/ut/$f-$s.png" --out "$UT/$f-$s.jpg" >/dev/null; done; done; ls "$UT"
  ```
  Forventet: seks jpg-filer. Skriv `"$UT/README.md"` med tre linjer per skjerm: label, kommando (fra steg 2/3), målt prosent. Legg samme to prosenttall inn nederst i `tests/visual/README.md` under overskriften `## AO-03 / AO-08 — panel-modus, målt <dato> (fase 1, økt 4)` med lenke til mappen.

- [ ] **Steg 7: Grønt.** `npx tsc --noEmit && npx eslint --quiet src && npm test 2>&1 | tail -4` → `# fail 0`.

- [ ] **Steg 8: Commit**
  ```bash
  git add tests/visual/skjerm-mapping.ts tests/visual/README.md src/components/admin/v2/agenticos/AdminAgenticosKo.tsx src/components/admin/v2/agenticos/AdminAgenticosGodkjenn.tsx "docs/design-audit/$(date +%F)/rigg-panelmodus-ao"
  git commit -m "docs(rigg): AO-03/AO-08 målt i panel-modus mot prod + avviksliste i filhodene

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 4.6: Verify, PR, MASTERPLAN og merge

**Filer:**
- Modify: `docs/MASTERPLAN-GJENSTAAENDE.md:742` (rad 20.1)
- Modify: `docs/feillogg.md` (én linje, øktslutt-regelen i CLAUDE.md)

- [ ] **Steg 1: Full port.** `export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy; npm run verify > "$WT/verify.log" 2>&1; tail -30 "$WT/verify.log"`. Grønt, eller kun build-feilen «Could not find the Next.js package» (worktree-begrensning, feillogg 29.08) — da holder delportene fra 4.5 steg 7 pluss `node scripts/check-doc-lenker.mjs && node scripts/check-ingen-paper.mjs && node scripts/check-token-gap.mjs`. `verify.log` committes ikke.

- [ ] **Steg 2: Push og PR**
  ```bash
  git push -u origin claude/fase1-okt4-rigg-panelmodus
  gh pr create --title "feat(rigg): fase 1 økt 4 — riggfelt, panel-modus, AO-radene til ekte adresser" --body "$(cat <<'EOF'
  Fase 1 (docs/superpowers/plans/2026-09-05-komplett-designport.md §4, økt 4).

  - skjerm-mapping.ts: fasitDato/minutter/aarsak/viewport/selector + vakt-test
  - AO-01/AO-03/AO-08 peker på /admin/jarvis og /admin/ko?fane=… (ikke redirectene)
  - README: gyldighetssjekk før måling, avviksliste-regel, panel-modus
  - train-lock-pixel-diff.mjs: --viewport/--selector (panel-modus)
  - AO-03/AO-08 målt mot prod i panel-modus, bilder i docs/design-audit/<dato>/rigg-panelmodus-ao/

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  PRNR=$(gh pr view --json number -q .number); echo "$PRNR"
  ```

- [ ] **Steg 3: MASTERPLAN 20.1.** I `docs/MASTERPLAN-GJENSTAAENDE.md` linje 742 erstattes teksten `riggfelt (fasitDato/minutter/aarsak/viewport/selector) + AO-radene,` med `~~riggfelt (fasitDato/minutter/aarsak/viewport/selector) + AO-radene~~ (økt 4 levert, PR #$PRNR — AO-03/AO-08 målt i panel-modus),` (skriv PR-nummeret inn som tall). Legg én linje i `docs/feillogg.md` etter formatlinjen: `<dato> | ren økt` eller det som faktisk kostet tid. `node scripts/check-doc-lenker.mjs` → OK.
  ```bash
  git add docs/MASTERPLAN-GJENSTAAENDE.md docs/feillogg.md
  git commit -m "docs(masterplan): marker økt 4 (riggfelt + AO-rader + panel-modus) levert (PR #$PRNR)

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  git push
  ```

- [ ] **Steg 4: Review og merge.** Kjør `pr-review-toolkit:review-pr` på PR-en; rett funn i samme gren. Vent på grønn CI (`gh pr checks $PRNR --watch`), så `gh pr merge $PRNR --squash --delete-branch`. Rydd worktreen: `cd /Users/anderskristiansen/Developer/akgolf-hq && git worktree remove "$WT"`.

---

### Ferdig når

- `npm test` på grenen inkluderer `src/lib/__tests__/visual/skjerm-mapping.test.ts` med 4 tester grønne: `npm test 2>&1 | grep -E "^# (pass|fail)"` → `# fail 0`.
- `grep -c 'fasitDato: "' tests/visual/skjerm-mapping.ts` = antall rader (`grep -c 'label: "' tests/visual/skjerm-mapping.ts`).
- `grep -c '/admin/agenticos' tests/visual/skjerm-mapping.ts` → `0`; `grep -c '"/admin/jarvis"\|"/admin/ko?fane=agentko"\|"/admin/ko?fane=agentgodkjenn"' tests/visual/skjerm-mapping.ts` → `3`.
- `node scripts/design-audit.mjs --familie admin/ko --uten-detektor | grep 'admin/ko'` viser `ukalibrert` eller `kalibrert` i fasit-kolonnen, ikke `ingen`.
- `grep -c "Gyldighetssjekk før måling\|Panel-modus — innebygde\|AO-03 / AO-08 — panel-modus" tests/visual/README.md` → `3`.
- `node scripts/train-lock-pixel-diff.mjs "X" "/y" dark 0 --selector=a; echo $?` → `1` med panel-modus-feilmeldingen.
- AO-03- og AO-08-radene har `kalibrertAvvikPst` og `minutter` med tall, og begge komponentfilhodene har ` * Avvik:`-linjer: `grep -c " \* Avvik:" src/components/admin/v2/agenticos/AdminAgenticosKo.tsx src/components/admin/v2/agenticos/AdminAgenticosGodkjenn.tsx` → minst 3 og 2.
- Seks jpg i `docs/design-audit/<dato>/rigg-panelmodus-ao/`; PR merget til main; MASTERPLAN 20.1 viser økt 4 som levert.

### Åpne funn (ikke løst i denne økta)

1. `src/components/admin/v2/agenticos/AdminAgenticosGodkjenn.tsx:42` og `:71` lenker fortsatt til redirect-adressene `/admin/agenticos/ko` og `/admin/agenticos/godkjenn?sak=<id>`. Redirect-siden (`src/app/admin/agenticos/godkjenn/page.tsx`) leser ikke `searchParams`, så `?sak=` mistes underveis — «Se resultat» uthever aldri riktig sak. Bør bli `/admin/ko?fane=agentko` og `/admin/ko?fane=agentgodkjenn&sak=<id>` (fase 3, AgencyOS-kjeden).
2. `scripts/train-lock-pixel-diff.mjs:7` siterer `tests/visual/train-lock-pixelnaerhet.spec.ts` som ikke finnes — den bygges i fase 1 økt 6 (nattlig måling). Økt 6 bør lese `viewport`/`selector` fra raden i stedet for CLI-flagg.
3. AO-08-fasiten har `padding: 20px` inni rammen, appens panel ikke — hele innholdet ligger forskjøvet 20 px og gir høy diff uansett. Et valgfritt `innrykk`-felt på raden (forskyv utsnittet) ville gitt et ærligere tall. Ikke lagt til: ingen bestilling.
4. `fasitDato` er git-dato: 25.08.2026 er bulk-importen (PR #581), så AG-04/AO-01 (tegnet 23.–24.08 per HANDOFF) og AX-01 (avgjort 25.08) får samme dato. Gyldighetssjekken bruker derfor innholds-grep i tillegg. En «tegnet»-dato per skjerm finnes bare som prosa i HANDOFF.md.
5. Økt 3 (datofrys) legger også et felt (`testDato?: string;` per rad — `TEST_NAA` er kun scriptets egen konstant i `train-lock-pixel-diff.mjs`, ikke feltnavnet i typen) rett etter `notat: string;` i samme type — se Forutsetninger over for rekkefølgen (økt 3 FØRST). Rettet 06.09: feltnavnet var feilsitert her.
6. `tests/visual/README.md:78` («Alle ni skjermer») og `:118` («tiende skjerm») er utdaterte tellinger etter #787/#789 (17 rader). Ikke rettet — ingen del av bestillingen.
7. Hovedsjekkuten står på `feat/steg-19-6-19-7-kontrast-tallhero` med ucommittede filer (`src/app/admin/grupper/ny-gruppe-modal.tsx` m.fl.) — en annen økt. Riggen kjøres derfra kun fordi `.env.local` bor der; scriptet og mapping kommer fra worktreen.
8. `design-audit.mjs` hadde en latent feil uavhengig av denne økta: `[playerId]`-familier (`admin/workbench/[playerId]`) gikk rett inn i `new RegExp` uten escaping. Rettet i forbifarten i 4.2 steg 3 (escaping av regex-tegn), siden samme linje uansett ble skrevet om.
