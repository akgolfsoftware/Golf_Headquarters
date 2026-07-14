# AK-formel ferdigstilling — P-posisjon + drill-nivå fordeling (plan)

> **Fase 0b** — følge-jobbene fra AK-formel-datakontrakten (Fase 0). Passer veikartets motor/data-lag.
> Grunnet i skjema (verifisert 2026-06-30). **Ingen kode før ja.** Norsk bokmål.

## Nåtilstand (verifisert i kode)

- **Fase 0 (levert):** `TrainingPlanSession` (kanon) har alle 6 AK-akser på **session-nivå**. Workbench skriver 5 av 6 fra UI; `pPosisjoner`-feltet + skrive-stien er klare, men **ingen P-posisjon-chip** i inspektøren.
- **Taksonomi** (`src/components/workbench-hybrid/taxonomy.ts`, låst): dims = `cat/omr/m/pr/cs/lfase/praksis/fysType/sone/periode`. **Ingen P-posisjon.** `omr` = slag-sone (TEE/INN200…/PUTT…/SPILL), ikke P-posisjon.
- **Drill-modeller:**
  - `SessionDrill` (drills på kanon-økta): **tynn** — `csTarget Int?` + ref til `ExerciseDefinition`. Ingen per-drill `lFase`/`miljo`/`prPress`/`pPosisjoner`.
  - `TrainingDrillV2`: **full** per-drill AK-formel (pyramide/lFase/csNivaa/miljo/prPress/pPosisjoner + FYS-felt). Men **ikke koblet til Workbench**.
  - `ExerciseDefinition` (bibliotek): pyramidArea/lPhase/csMin-csMax (mal-nivå).
- **Workbench drag-drop lager TOMME økter** (ingen drills). Drills legges via `OktDetailTab` «Legg til øvelse».

**Kjernen i «drill-nivå fordeling»:** AK-formelen hører metodisk hjemme **per drill** — en økt er en *fordeling* av drill-koder (f.eks. 2 driller på L_BALL/CS80, 1 på L_AUTO/CS100), ikke én kode. I dag bærer kun `TrainingDrillV2` dette, og det er ikke i Workbench-flyten.

---

## DEL A — P-posisjon (fullfør 6. session-akse) · LITEN

**Mål:** gjør P-posisjon redigerbar i inspektøren, så alle 6 akser mates fra UI (feltet + skrive-stien finnes alt).

**Steg:**
1. **Taksonomi:** ny `DimField "ppos"` + `DIM_OPTS.ppos = ["P1"…"P10"]` + titler/labels. *(Fila er låst — krever din beslutning, derav A1.)*
2. **Klient-typer:** `WbSession`/`PaletteItem` får `ppos?: string[]` (multi, som `omr`).
3. **buildDimensions** (`helpers.ts`): legg `ppos` som multi-dimensjon (chips).
4. **Reducer + onDimPick:** håndter `ppos` som multi (gjenbruk `omr`-mønsteret).
5. **Payload:** trad `ppos` → `akFormel.pPosisjoner` i `persistDrop` (WorkbenchHybrid).
6. **Role-gate:** arver `readOnly` automatisk (spiller lese-visning).

**Beslutning A1:** P-posisjon **multi-select** (en drill kan treffe flere P) — bekreft. Er **P1–P10** riktig sett (MORAD)?
**Effort:** S/M. Selvstendig, kan gjøres nå.

---

## DEL B — Drill-nivå AK-formel + fordeling · STØRRE

**Mål:** AK-formelen bor per drill; en økt viser *fordelingen* av drill-koder; «hva-jobbe-med»-matching (Fase 2) blir presis på drill-nivå.

**Gap:** kanon `SessionDrill` mangler per-drill AK-formel · Workbench lager ikke drills · ingen fordelings-visning.

**Beslutninger (flagget — velges ikke av meg):**

- **B1 — drill-modell:**
  - *(a, anbefalt)* Utvid kanon **`SessionDrill`** additivt med `lFase/miljo/csNivaa/prPress/pPosisjoner` (+ behold `csTarget`). Blir på kanon, additivt (db execute), konsistent med Fase 0.
  - *(b)* Adopter **`TrainingDrillV2`** (har feltene alt). Men binder Workbench til V2-modellen vi bevisst **ikke** konsoliderer (Fase 0-constraint) — frarådes nå.

- **B2 — forhold session ↔ drill:**
  - *(a, anbefalt)* Session-nivå AK-formel = **default** som drills **arver + kan overstyre** per drill. Enkelt å kode mot, og «kjapp-kode en hel økt» beholdes.
  - *(b)* Session-nivå = **avledet sammendrag** (read-only) av drill-fordelingen. Mer «rent», men fjerner hurtig-koding på session-nivå.

- **B3 — fordelings-visning:** hva viser «fordelingen»? Forslag: **mini-stablet-bar per akse** (L-fase · CS · miljø · press) som viser andel av øktas drill-tid/-antall per verdi, i `OktDetailTab` + Spiller 360. (Design-detalj — kan låses etter B1/B2.)

**Steg (etter B1–B3):**
1. **DB** (additiv, db execute): AK-felt på `SessionDrill` (hvis B1=a).
2. **Drill-CRUD i Workbench:** `OktDetailTab` «Legg til øvelse» persisterer `SessionDrill` m/ per-drill AK-formel (i dag lager Workbench tomme økter — dette er net-new flyt).
3. **Per-drill AK-chips** i drill-raden (gjenbruk `DimensionRows`, role-gated).
4. **Arve-logikk** (B2): drill arver session-default, kan overstyre.
5. **Fordelings-viz** (B3): ny komponent (`DrillFordeling`) i OktDetailTab + Spiller 360.
6. **Session-nivå** = avledet fra fordelingen (B2=b) eller beholdt som default (B2=a).
7. **V2-speil** (valgfritt): `TrainingDrillV2` har feltene — speil drill-AK dit hvis V2-drill leses nedstrøms.

**Effort:** L (DB + net-new drill-CRUD + arve-logikk + viz).

---

## Hvordan det passer veikartet

Dette er **motor/data-kontrakt-laget** (Fase 0b) — fundament, ikke en skjerm-polish. Drill-koder mater **Fase 1–2**: `focus.ts` matcher svakhet → drill på kategori/avstand; med per-drill **L-fase/CS/miljø/press** blir matchingen langt mer presis («du taper på innspill 150–175 m → driller på L_BALL/CS80/M2 som trener akkurat det»). Så drill-nivå AK-formel er fundament for «hva-jobbe-med» og for drill-discovery (#12).

**Anbefalt rekkefølge:**
- **Del A nå** (liten, fullfører Fase 0 sin 6. akse) — etter A1.
- **Del B som del av Fase 1-fundamentet** (når benchmark/focus-motoren bygges), etter B1–B3. Da bygges drill-granulariteten samtidig som motoren som skal lese den.

## Beslutninger (LÅST 2026-06-30)
- **A1:** P-posisjon **multi-select**, verdier **P1–P10**.
- **B1:** **Utvid `SessionDrill`** additivt (kanon, db execute) — ikke adoptere TrainingDrillV2.
- **B2:** Session-nivå AK-formel = **default som drills arver + kan overstyre** per drill.
- **B3:** *(åpen — design-detalj)* fordelings-visning = mini-stablet-bar per akse. Låses når Del B bygges.

## Byggeplan (låst)

**Del A — P-posisjon (kjøres nå):**
1. `taxonomy.ts`: ny `DimField "ppos"` + `DIM_OPTS.ppos = ["P1"…"P10"]` + DIM_TITLES/labels (multi).
2. `types.ts`: `WbSession`/`PaletteItem` får `ppos?: string[]`.
3. `helpers.ts buildDimensions`: legg `ppos` som multi-dimensjon (chips, som `omr`).
4. Reducer/`onDimPick` (WorkbenchHybrid): håndter `ppos` multi (gjenbruk omr-mønster).
5. `persistDrop`: trad `ppos` → `akFormel.pPosisjoner`.
6. Verifikasjon: tsc/eslint/build + DB-test (opprett m/ P-pos → les tilbake).

**Del B — drill-nivå fordeling (med Fase 1-fundamentet):**
1. DB (db execute): `lFase/miljo/csNivaa/prPress/pPosisjoner` additivt på `SessionDrill` (+ behold `csTarget`).
2. Drill-CRUD i `OktDetailTab`: «Legg til øvelse» persisterer `SessionDrill` m/ per-drill AK-formel (net-new flyt).
3. Per-drill AK-chips i drill-raden (gjenbruk `DimensionRows`, role-gated).
4. Arve-logikk: drill arver session-default (B2=a), kan overstyre per drill.
5. `DrillFordeling`-komponent (B3) i OktDetailTab + Spiller 360.
6. V2-speil (valgfritt): speil drill-AK til `TrainingDrillV2` hvis V2-drill leses nedstrøms.
