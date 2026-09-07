# Fase 1 · Økt 3 — Datofrys gjennom Plan/Analyse + PH-07 remåles i fylt uke

**Mål:** `hentEffektivNaa()` blir den ENESTE klokken i `src/app/portal/actions.ts` — de 11 rå
`new Date()`-forekomstene (verifisert 06.09 med `grep -n`) erstattes med en `naa`-parameter tredd
gjennom `getDashboardData()` og de ni underfunksjonene den kaller, uten å endre oppførsel for
ekte brukere (default `= new Date()` på hver funksjon; kun `screentest@akgolf.test` kan noensinne
få en annen verdi inn, se `src/lib/testing/dato-override.ts`). `src/app/portal/page.tsx` (PH-01)
og `src/app/portal/planlegge/page.tsx` (PH-07) kobles til. Seed-scriptene
`seed-screentest-komplett.ts` og `seed-screentest-coach.ts` får `--dato=YYYY-MM-DD` (default =
ekte kjøredato, bakoverkompatibelt) slik at "kjøredato" for demo-dataene kan fryses til samme dag
riggen fryser "i dag" til. `tests/visual/skjerm-mapping.ts` får et valgfritt `testDato`-felt
(dokumentasjon — riggen leser det ikke automatisk ennå) og `train-lock-pixel-diff.mjs` sin
`TEST_NAA`-konstant kan overstyres med `SHOT_DATO`. Til slutt: PH-07 sin uke seedes fylt
(22.–23.08.2026) og remåles — 17,26 % (målt i tom-uke-tilstand, se raden i dag) skal falle til
under 10 %.

**Hvorfor to PR-er i denne økta (avvik fra mønsteret i økt 1/4/7):** PH-07-remålingen krever at
KODEN denne økta skriver faktisk kjører i produksjon — riggen (`train-lock-pixel-diff.mjs`)
måler `https://akgolf-hq.vercel.app`, ikke lokal kode. Økt 1 og 4 målte ting som allerede var
live; denne økta måler EFFEKTEN av sin egen endring, som ikke finnes i prod før PR-en er merget
OG Vercel har bygget `main` på nytt. Derfor: PR A (oppgave 3.1–3.4) er selve kodeendringen og
merges normalt; oppgave 3.5 skjer ETTER at PR A er live i prod og lander som en liten PR B
(kun `tests/visual/skjerm-mapping.ts`-raden, README og docs — ingen ny produksjonskode).

**Forutsetninger:**
- De tre parallelle PR-ene er merget (bekreft likevel — kan ha endret seg): `gh pr view 787 --json state -q .state; gh pr view 788 --json state -q .state; gh pr view 789 --json state -q .state` → tre ganger `MERGED`.
- Hovedsjekkuten `/Users/anderskristiansen/Developer/akgolf-hq` kan stå på en annen gren med ucommittede endringer (en parallell økt) — ikke rør den. Jobb i et eget worktree, fersk fra `origin/main`:
  ```bash
  cd /Users/anderskristiansen/Developer/akgolf-hq && git fetch origin
  git worktree add /Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt3 -b claude/fase1-okt3-datofrys origin/main
  cd /Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt3 && git branch --show-current
  ```
  Forventet: `claude/fase1-okt3-datofrys`. Sett `WT=/Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt3` og bruk absolutte stier i alle kommandoer (gotchas §Shell-cwd — en `cd` i én kommando kan lekke inn i senere kommandoer i samme økt).
- **Aldri kopier `.env*` inn i worktreen** (gotchas §Aldri kopier .env*). Worktreen har ingen egen `node_modules` (feillogg 29.08.2026), men `npx tsc`, `npx eslint`, `npx tsx`, `npx prisma` og `node scripts/*.mjs` virker uansett — modulresolusjon vandrer opp til hovedsjekkutens `node_modules`. `npm run build` og `check-critical-imports.mjs` feiler i worktreen (esbuild leser `process.cwd()/node_modules`) — CI tar build, del­portene under erstatter det lokalt. Kjør FØRST, kun i skallet (aldri i en fil):
  ```bash
  cd "$WT" && export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy && npx prisma generate
  ```
- **Riggen (`scripts/train-lock-pixel-diff.mjs`) og seed-scriptene som skriver ekte demo-data kjører KUN mot produksjon, med `.env.local`-credentials som bare finnes i hovedsjekkuten** — nøyaktig samme forutsetning som `…-okt-4.md` bygger på (der `SHOT_BRUKER=coachtest@akgolf.test node "$WT/scripts/train-lock-pixel-diff.mjs" …` kjøres med hovedsjekkuten som arbeidskatalog og worktreens scriptfil som argument). Oppgave 3.1–3.3 er ren kode og trenger ingen av dette; oppgave 3.5 (etter merge) gjenbruker akkurat det mønsteret:
  ```bash
  ( cd /Users/anderskristiansen/Developer/akgolf-hq && npx tsx "$WT/scripts/<script>.ts" [--flagg] )
  ```
  `cd` til hovedsjekkuten er det som gjør at `import "./_env"` (kjørt fra scriptets EGEN mappe via `process.cwd()`) faktisk finner `.env.local` — se `scripts/_env.ts`.
- Aldri `git add -A`. Stage navngitte filer. Ingen nye avhengigheter. Ingen nye design-tokens (denne økta rører ingen `--tl-*`-verdi). Norsk bokmål i kommentarer og UI-tekst. Commit-meldinger avsluttes med `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Før du redigerer `docs/MASTERPLAN-GJENSTAAENDE.md` eller `docs/feillogg.md` i oppgave 3.4/3.5: sjekk raden på `origin/main` på nytt (`git fetch origin && git show origin/main:docs/MASTERPLAN-GJENSTAAENDE.md | grep "^| 20.1"`) — parallelle økter (1, 2, 4, 7) kan ha rukket å redigere samme rad først.
- **Rekkefølge økt 3 FØR økt 4 på `SkjermMapping`-typen i `tests/visual/skjerm-mapping.ts`.** Begge øktene legger et felt rett etter `notat: string;` (denne økta: `testDato?: string;`, oppgave 3.3; okt-4.md oppgave 4.1: `fasitDato?`/`minutter?`/`aarsak?`/`viewport?`/`selector?`) — ingen navnekollisjon, men samme anker-linje, så den som merges SIST får en konflikt der. Merges denne økta (3) først, må den som kjører økt 4 justere sitt "FØR"-anker til å stå etter `testDato?: string;` i stedet (okt-4.md sitt eget "Åpne funn" #5 varsler om dette). Merges økt 4 først, gjelder det motsatte for oppgave 3.3 steg 1 her. Sjekk med `grep -n "testDato\|fasitDato" tests/visual/skjerm-mapping.ts` på `origin/main` før du redigerer typen, uansett rekkefølge.

---

### Oppgave 3.1: Tre `naa` gjennom `src/app/portal/actions.ts` (de 11 rå `new Date()`)

**Filer:**
- Modify: `src/app/portal/actions.ts` (10 funksjonssignaturer, 11 kall-steder, `getDashboardData`s `Promise.all` og retur-objekt)
- Modify: `src/app/portal/page.tsx:59` (send `naa` inn i `getDashboardData`)
- Modify: `src/app/portal/planlegge/page.tsx` (hent `naa` med `hentEffektivNaa`, send inn)

**Grensesnitt:** `getDashboardData(userId: string, naa: Date = new Date())` — default bevarer dagens oppførsel for ALLE kallere som ikke sender `naa` (ingen finnes per 06.09 utover de to som oppdateres her). Økt 6 (nattlig måling) og enhver fremtidig skjerm som trenger frosset dato kaller `hentEffektivNaa(bruker.epost)` og sender resultatet inn på samme måte.

Verifisert 06.09 (grep, se prosess-loggen i denne planen): `getTodaysSession` er IKKE kalt fra noe sted i kodebasen (kun definert og eksportert) — den får likevel `naa`-parameteren, siden den er én av de 11 tellende forekomstene og skal ikke stå igjen som en aktiv klokke.

- [ ] **Steg 1: Signaturene.** Legg til `, naa: Date = new Date()` rett før den lukkende `)` i disse ni linjene (alle unike i fila — trygt som ni separate treff-og-erstatt):

  | Funksjon | Linje (nå) | Signatur før | Signatur etter |
  |---|---|---|---|
  | `getTodaysSession` | 192 | `export async function getTodaysSession(userId: string): Promise<TodaySession \| null> {` | `export async function getTodaysSession(userId: string, naa: Date = new Date()): Promise<TodaySession \| null> {` |
  | `getWeekOverview` | 233 | `export async function getWeekOverview(userId: string): Promise<WeekDay[]> {` | `export async function getWeekOverview(userId: string, naa: Date = new Date()): Promise<WeekDay[]> {` |
  | `getGoals` | 344 | `export async function getGoals(userId: string, limit = 3): Promise<GoalItem[]> {` | `export async function getGoals(userId: string, limit = 3, naa: Date = new Date()): Promise<GoalItem[]> {` |
  | `getStatsSnapshot` | 455 | `export async function getStatsSnapshot(userId: string): Promise<StatsSnapshot> {` | `export async function getStatsSnapshot(userId: string, naa: Date = new Date()): Promise<StatsSnapshot> {` |
  | `getNextTournament` | 492 | `export async function getNextTournament(userId: string): Promise<NextTournament \| null> {` | `export async function getNextTournament(userId: string, naa: Date = new Date()): Promise<NextTournament \| null> {` |
  | `getWeekPlanProgress` | 546 | `export async function getWeekPlanProgress(userId: string): Promise<WeekPlanProgress> {` | `export async function getWeekPlanProgress(userId: string, naa: Date = new Date()): Promise<WeekPlanProgress> {` |
  | `getKpiStats` | 602 | `export async function getKpiStats(userId: string): Promise<KpiStats> {` | `export async function getKpiStats(userId: string, naa: Date = new Date()): Promise<KpiStats> {` |
  | `getTrainingHeatmap` | 658 | `export async function getTrainingHeatmap(userId: string): Promise<TrainingHeatmap> {` | `export async function getTrainingHeatmap(userId: string, naa: Date = new Date()): Promise<TrainingHeatmap> {` |
  | `getAllTodaysSessions` | 691 | `export async function getAllTodaysSessions(userId: string): Promise<TodaySession[]> {` | `export async function getAllTodaysSessions(userId: string, naa: Date = new Date()): Promise<TodaySession[]> {` |

  Kontroll: `grep -c "naa: Date = new Date()" "$WT/src/app/portal/actions.ts"` → `9` (foreløpig — steg 4 legger til en tiende på `getDashboardData`).

- [ ] **Steg 2: Kroppene — ett samlet søk-og-erstatt.** Åtte av funksjonene har EKSAKT samme kropps-linje `  const now = new Date();` (verifisert: `grep -c "^  const now = new Date();$" "$WT/src/app/portal/actions.ts"` → `8`, på linjene 194/235/361/457/548/604/660/693). Siden erstatningen (`const now = naa;`) er identisk semantikk i alle åtte (les den lokale `naa`-parameteren steg 1 nettopp la til), er dette trygt som ÉN `replace_all`-operasjon:
  ```
  FØR (alle 8 forekomster):   const now = new Date();
  ETTER (alle 8 forekomster): const now = naa;
  ```
  Kontroll: `grep -c "^  const now = new Date();$" "$WT/src/app/portal/actions.ts"` → `0`; `grep -c "^  const now = naa;$" "$WT/src/app/portal/actions.ts"` → `8`.

- [ ] **Steg 3: Den niende — `getNextTournament` sin variant.** Linje 494 er den eneste som ikke matcher steg 2s mønster (den kaller `startOfDay` direkte):
  ```
  FØR:  const now = startOfDay(new Date());
  ETTER: const now = startOfDay(naa);
  ```
  Kontroll: `grep -c "startOfDay(new Date())" "$WT/src/app/portal/actions.ts"` → `0`; `grep -c "startOfDay(naa)" "$WT/src/app/portal/actions.ts"` → `1`.

- [ ] **Steg 4: `greeting()` — privat hjelpefunksjon, ingen default (alltid kalt med `naa` fra `getDashboardData`).** `greeting` er IKKE eksportert (og kan heller ikke bli det — fila har `"use server"` øverst, som krever at ALLE eksporterte bindinger er async-funksjoner; `greeting` er synkron, akkurat som de andre private hjelperne `startOfDay`/`fornavn`/`ukenummer` allerede er). Linje 178–179:
  ```ts
  function greeting(): string {
    const hour = new Date().getHours();
  ```
  blir
  ```ts
  function greeting(naa: Date): string {
    const hour = naa.getHours();
  ```
  (Merk: `naa.getHours()` leser servermaskinens lokale tidssone akkurat som `new Date().getHours()` gjorde — samme forhåndseksisterende UTC-vs-Oslo-usikkerhet som før. Ikke en del av denne økta å rette; se Åpne funn.)

- [ ] **Steg 5: `getDashboardData` — legg til parameteren, tre den inn i `Promise.all`, bruk den i retur-objektet.** Linje 749–788 (før):
  ```ts
  export async function getDashboardData(userId: string): Promise<DashboardData> {
    await assertCanViewPlayerData(userId);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, avatarUrl: true, hcp: true, tier: true },
    });

    const [todayAll, week, recentActivity, goals, { count: unreadCount, notifications }, coachMessage, stats, kpiStats, nextTournament, weekProgress, trainingHeatmap, optimalSession, harPlanTilGodkjenning] =
      await Promise.all([
        getAllTodaysSessions(userId),
        getWeekOverview(userId),
        getRecentActivity(userId, 5),
        getGoals(userId, 3),
        getUnreadNotifications(userId, 5),
        getLatestCoachMessage(userId),
        getStatsSnapshot(userId),
        getKpiStats(userId),
        getNextTournament(userId),
        getWeekPlanProgress(userId),
        getTrainingHeatmap(userId),
        hentOptimalOktHint(userId),
        prisma.trainingPlan
          .findFirst({ where: { userId, status: "PENDING_PLAYER" }, select: { id: true } })
          .then((p) => p != null),
      ]);
  ```
  etter:
  ```ts
  export async function getDashboardData(userId: string, naa: Date = new Date()): Promise<DashboardData> {
    await assertCanViewPlayerData(userId);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, avatarUrl: true, hcp: true, tier: true },
    });

    const [todayAll, week, recentActivity, goals, { count: unreadCount, notifications }, coachMessage, stats, kpiStats, nextTournament, weekProgress, trainingHeatmap, optimalSession, harPlanTilGodkjenning] =
      await Promise.all([
        getAllTodaysSessions(userId, naa),
        getWeekOverview(userId, naa),
        getRecentActivity(userId, 5),
        getGoals(userId, 3, naa),
        getUnreadNotifications(userId, 5),
        getLatestCoachMessage(userId),
        getStatsSnapshot(userId, naa),
        getKpiStats(userId, naa),
        getNextTournament(userId, naa),
        getWeekPlanProgress(userId, naa),
        getTrainingHeatmap(userId, naa),
        hentOptimalOktHint(userId),
        prisma.trainingPlan
          .findFirst({ where: { userId, status: "PENDING_PLAYER" }, select: { id: true } })
          .then((p) => p != null),
      ]);
  ```
  (`getRecentActivity`, `getUnreadNotifications`, `getLatestCoachMessage` og `hentOptimalOktHint` leser ikke dato og røres ikke — se Åpne funn for `hentOptimalOktHint`s EGEN, uavhengige `new Date()`.)

  Deretter, i retur-objektet (linje 787–788):
  ```
  FØR:  greeting: greeting(),
        weekNumber: ukenummer(new Date()),
  ETTER: greeting: greeting(naa),
        weekNumber: ukenummer(naa),
  ```
  Kontroll: `grep -c "naa: Date = new Date()" "$WT/src/app/portal/actions.ts"` → `10`. `grep -n "new Date()" "$WT/src/app/portal/actions.ts" | grep -v "naa: Date = new Date()"` → INGEN treff (alle gjenværende `new Date()`-forekomster er default-parameterverdier, ingen leser "nå" inni en funksjonskropp).

- [ ] **Steg 6: Koble inn i `src/app/portal/page.tsx` (PH-01).** Fila har allerede `const naa = await hentEffektivNaa(user.email);` (linje 50) — kun kall-stedet i `Promise.all` (linje 59) mangler å bruke den:
  ```
  FØR:  getDashboardData(user.id),
  ETTER: getDashboardData(user.id, naa),
  ```
  (`grep -c "getDashboardData(user.id)," "$WT/src/app/portal/page.tsx"` → `1` før; `0` etter. `grep -c "getDashboardData(user.id, naa)," "$WT/src/app/portal/page.tsx"` → `1` etter.)

- [ ] **Steg 7: Koble inn i `src/app/portal/planlegge/page.tsx` (PH-07) — dette er selve fikset PH-07-raden i `skjerm-mapping.ts` beskriver.** Fila har INGEN dato-overstyring i dag. Legg til importen og hent `naa` rett etter guard-sjekkene:
  ```ts
  import { redirect } from "next/navigation";
  import { requirePortalUser } from "@/lib/auth/requirePortalUser";
  import { getDashboardData } from "@/app/portal/actions";
  import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
  import { PlanV2 } from "@/components/portal/v2/PlanV2";
  import { getPlayerDepthMode } from "@/lib/player-depth-mode";
  import { hentUkePeriode } from "@/lib/portal-plan/uke-periode";
  import { hentEffektivNaa } from "@/lib/testing/dato-override";

  export const dynamic = "force-dynamic";
  export const metadata = { title: "Plan · PlayerHQ" };

  export default async function V2PlanPreviewPage() {
    const user = await requirePortalUser();
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "GUEST") redirect("/admin/kalender");

    const naa = await hentEffektivNaa(user.email);
    const [data, depthMode, periode] = await Promise.all([
      getDashboardData(user.id, naa),
      getPlayerDepthMode(),
      hentUkePeriode(user.id),
    ]);
  ```
  (`hentUkePeriode(user.id)` røres IKKE — se Åpne funn: `periode`-verdien er `void`-et i `PlanV2` i dag, altså død for visning, så det haster ikke å tre `naa` inn der også.)
  Kontroll: `grep -c "hentEffektivNaa" "$WT/src/app/portal/planlegge/page.tsx"` → `2` (import + kall). `grep -c "getDashboardData(user.id, naa)" "$WT/src/app/portal/planlegge/page.tsx"` → `1`.

- [ ] **Steg 8: Typesjekk.**
  ```bash
  cd "$WT" && npx tsc --noEmit
  ```
  Forventet: ingen utskrift. (DB-koblede funksjoner kan ikke node:test-dekkes uten en ekte database — jf. gotchas §Aldri kopier .env* — så `tsc --noEmit` + grep-verifiseringene over ER testdekningen for denne oppgaven. Den ekte funksjonelle testen er oppgave 3.5s remåling mot prod.)

- [ ] **Steg 9: Commit.**
  ```bash
  cd "$WT" && git add src/app/portal/actions.ts src/app/portal/page.tsx src/app/portal/planlegge/page.tsx
  git commit -m "fix(portal): tre naa/hentEffektivNaa gjennom actions.ts — hentEffektivNaa() blir eneste klokke

11 rå new Date() i actions.ts erstattet med en naa-parameter (default
new Date(), uendret oppførsel for ekte brukere) tredd fra getDashboardData
og ned i de ni underfunksjonene. page.tsx (PH-01) kobler inn den naa den
allerede beregnet; planlegge/page.tsx (PH-07) kobler inn hentEffektivNaa
for første gang — forberedelse for remåling i egen oppgave etter merge.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 3.2: `--dato=YYYY-MM-DD` i seed-scriptene

**Filer:**
- Create: `scripts/_dato-flagg.ts`
- Create: `src/lib/__tests__/scripts/dato-flagg.test.ts`
- Modify: `scripts/seed-screentest-komplett.ts:15-23`
- Modify: `scripts/seed-screentest-coach.ts:25-26`, `:45-48`, `:60-79`, `:453`

**Grensesnitt:** `losKjoredato(argv: string[]): Date` — ren funksjon, ingen sideeffekter, brukt av begge seed-scriptene. Uten `--dato=`: identisk med dagens oppførsel (`new Date()`). Med `--dato=2026-08-22`: alt scriptet regner "relativt til kjøredato" (jf. filhodet i `seed-screentest-komplett.ts`) regnes relativt til 22.08.2026 kl. 12:00 lokalt i stedet.

- [ ] **Steg 1: Testen først (rød).** Opprett `src/lib/__tests__/scripts/dato-flagg.test.ts`:
  ```ts
  import test from "node:test";
  import assert from "node:assert/strict";
  import { finnDatoFlagg, byggKjoredato, losKjoredato } from "../../../../scripts/_dato-flagg";

  test("finnDatoFlagg: finner --dato=, ignorerer andre flagg og fravær", () => {
    assert.equal(finnDatoFlagg(["node", "script.ts", "--dato=2026-08-22"]), "2026-08-22");
    assert.equal(finnDatoFlagg(["node", "script.ts", "--kun-enrollering"]), null);
    assert.equal(finnDatoFlagg(["node", "script.ts"]), null);
  });

  test("byggKjoredato: kl 12:00 lokalt, null ved ugyldig format", () => {
    const d = byggKjoredato("2026-08-22");
    assert.equal(d?.getFullYear(), 2026);
    assert.equal(d?.getMonth(), 7); // august = måned 7, 0-indeksert
    assert.equal(d?.getDate(), 22);
    assert.equal(d?.getHours(), 12);
    assert.equal(byggKjoredato("ikke-en-dato"), null);
  });

  test("losKjoredato: uten flagg = nær ekte 'nå'; med flagg = frosset dato; ugyldig kaster", () => {
    const utenFlagg = losKjoredato(["node", "script.ts"]);
    assert.ok(Math.abs(utenFlagg.getTime() - Date.now()) < 5000, "uten --dato skal 'nå' være ekte");
    const medFlagg = losKjoredato(["node", "script.ts", "--dato=2026-08-22"]);
    assert.equal(medFlagg.getDate(), 22);
    assert.throws(() => losKjoredato(["node", "script.ts", "--dato=ikke-en-dato"]), /Ugyldig --dato/);
  });
  ```
  ```bash
  cd "$WT" && npx tsx --test src/lib/__tests__/scripts/dato-flagg.test.ts 2>&1 | tail -8
  ```
  Forventet: `Cannot find module '…/scripts/_dato-flagg'`.

- [ ] **Steg 2: Modulen.** Opprett `scripts/_dato-flagg.ts` (samme `_`-prefiks-konvensjon som `scripts/_env.ts`):
  ```ts
  /**
   * Delt `--dato=YYYY-MM-DD`-tolkning for seed-scriptene
   * (seed-screentest-komplett.ts, seed-screentest-coach.ts) — fryser
   * "kjøredato" til en bestemt dag for sign-off-riggen (fase 1, økt 3;
   * tests/visual/skjerm-mapping.ts sitt testDato-felt dokumenterer hvilken
   * dato en rad forventer demo-dataene anchoret på). Uten flagget: uendret
   * oppførsel, ekte kjøredato.
   *
   * Rene funksjoner, ingen sideeffekter — trygt å importere fra en test.
   * IKKE importer seed-scriptene selv fra en test: de mangler en
   * import.meta.url-vakt og starter ekte database-seeding ved import.
   */

  /** Finner rå verdien etter "=" i `--dato=<verdi>`, eller null om flagget mangler. */
  export function finnDatoFlagg(argv: string[]): string | null {
    const flagg = argv.find((a) => a.startsWith("--dato="));
    return flagg ? flagg.slice("--dato=".length) : null;
  }

  /**
   * Bygger kl. 12:00 LOKALT fra en YYYY-MM-DD-streng — 12:00 unngår
   * midnatt-kanten mot UTC (samme kantsak som gotchas.md §Dato-strenger MÅ
   * bruke UTC-midnatt). Null ved ugyldig format.
   */
  export function byggKjoredato(verdi: string): Date | null {
    const dato = new Date(`${verdi}T12:00:00`);
    return Number.isNaN(dato.getTime()) ? null : dato;
  }

  /**
   * Leser `--dato=` fra argv; uten flagget: ekte kjøredato (`new Date()`).
   * Kaster ved ugyldig format — scriptet fanger dette selv og avslutter med
   * en lesbar feilmelding (se seed-screentest-komplett.ts / -coach.ts).
   */
  export function losKjoredato(argv: string[]): Date {
    const verdi = finnDatoFlagg(argv);
    if (!verdi) return new Date();
    const dato = byggKjoredato(verdi);
    if (!dato) throw new Error(`Ugyldig --dato: "${verdi}" — bruk YYYY-MM-DD.`);
    return dato;
  }
  ```

- [ ] **Steg 3: Testen grønn.**
  ```bash
  cd "$WT" && npx tsx --test src/lib/__tests__/scripts/dato-flagg.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"
  ```
  Forventet: `tests 3` / `pass 3` / `fail 0`.

- [ ] **Steg 4: `seed-screentest-komplett.ts` — bytt `NOW`.** Linje 15 (rett under `import "./_env";`) og linje 20–23:
  ```ts
  import "./_env";

  import { prisma } from "@/lib/prisma";
  import type { Prisma } from "@/generated/prisma/client";

  const OYVIND_EMAIL = "screentest@akgolf.test";
  const ANDERS_EMAIL = "coachtest@akgolf.test";

  const NOW = new Date();
  ```
  blir
  ```ts
  import "./_env";
  import { losKjoredato } from "./_dato-flagg";

  import { prisma } from "@/lib/prisma";
  import type { Prisma } from "@/generated/prisma/client";

  const OYVIND_EMAIL = "screentest@akgolf.test";
  const ANDERS_EMAIL = "coachtest@akgolf.test";

  /**
   * "Kjøredato" — `--dato=YYYY-MM-DD` fryser den til en bestemt dag (brukt
   * til å seede en fylt uke rundt sign-off-riggens frosne testdato, se
   * scripts/_dato-flagg.ts). Uten flagget: uendret oppførsel, ekte kjøredato.
   */
  const NOW: Date = (() => {
    try {
      return losKjoredato(process.argv);
    } catch (e) {
      console.error((e as Error).message);
      return process.exit(1);
    }
  })();
  ```
  Ingen andre linjer i fila endres — alt annet leser fra `NOW` allerede (filhodet sier "Datoer regnes RELATIVT til kjøredato").
  Kontroll: `npx tsc --noEmit` (fra `$WT`) → stille.

- [ ] **Steg 5: `seed-screentest-coach.ts` — samme mønster, men `NAA` (siden `at()`/`nextWeekday()`/`hoursAgo()` hver kaller sin egen `new Date()` i stedet for én delt konstant).** Import (etter linje 25 `import "./_env";`):
  ```
  FØR:  import "./_env";

        import { PrismaPg } from "@prisma/adapter-pg";
  ETTER: import "./_env";
        import { losKjoredato } from "./_dato-flagg";

        import { PrismaPg } from "@prisma/adapter-pg";
  ```
  Rett etter `const TARGET_PLAYERS = 38;` (linje 46), før `// ---------- Hjelpere ----------`:
  ```ts
  const STALL_DOMAIN = "stall.akgolf.test";
  const TARGET_PLAYERS = 38;

  /**
   * "Kjøredato" — `--dato=YYYY-MM-DD` fryser den (se scripts/_dato-flagg.ts).
   * Uten flagget: uendret oppførsel, ekte kjøredato.
   */
  const NAA: Date = (() => {
    try {
      return losKjoredato(process.argv);
    } catch (e) {
      console.error((e as Error).message);
      return process.exit(1);
    }
  })();

  // ---------- Hjelpere ----------
  ```
  Deretter linje 60–79 (de tre hjelperne som hver leser sin egen "nå"):
  ```ts
  /** Lokal dato i dag kl h:m (+ dayOffset dager). */
  function at(h: number, m: number, dayOffset = 0): Date {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d;
  }

  /** Neste forekomst av ukedag (JS getDay: søn=0 … lør=6). I dag teller hvis samme dag. */
  function nextWeekday(target: number, h = 12): Date {
    const d = new Date();
    const diff = (target - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    d.setHours(h, 0, 0, 0);
    return d;
  }

  function hoursAgo(n: number): Date {
    return new Date(Date.now() - n * 3_600_000);
  }
  ```
  blir
  ```ts
  /** "Kjøredato" (NAA) kl h:m (+ dayOffset dager). */
  function at(h: number, m: number, dayOffset = 0): Date {
    const d = new Date(NAA);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d;
  }

  /** Neste forekomst av ukedag fra NAA (JS getDay: søn=0 … lør=6). NAA teller hvis samme dag. */
  function nextWeekday(target: number, h = 12): Date {
    const d = new Date(NAA);
    const diff = (target - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    d.setHours(h, 0, 0, 0);
    return d;
  }

  function hoursAgo(n: number): Date {
    return new Date(NAA.getTime() - n * 3_600_000);
  }
  ```
  Og i verifikasjonsblokken, linje 453:
  ```
  FØR:  const now = new Date();
  ETTER: const now = NAA;
  ```
  Kontroll: kjør presist `grep -n "new Date()" "$WT/scripts/seed-screentest-coach.ts"` → INGEN treff (alle er nå enten `NAA` eller `new Date(NAA)`/`new Date(NAA.getTime() - …)`). `npx tsc --noEmit` → stille.

- [ ] **Steg 6: Røyktest av flagget uten ekte database** (bekrefter parsing/exit-koden — scriptene feiler naturlig nok på manglende `.env.local`/DB i worktreen, FØR de når `main()`; det er nok til å bevise at flagg-parsingen kjører):
  ```bash
  cd "$WT" && npx tsx scripts/seed-screentest-komplett.ts --dato=ikke-en-dato; echo "exit=$?"
  ```
  Forventet: `Ugyldig --dato: "ikke-en-dato" — bruk YYYY-MM-DD.` og `exit=1` (feiler FØR noe Prisma-kall, siden `NOW` bygges synkront ved modul-init).

- [ ] **Steg 7: Commit.**
  ```bash
  cd "$WT" && git add scripts/_dato-flagg.ts src/lib/__tests__/scripts/dato-flagg.test.ts scripts/seed-screentest-komplett.ts scripts/seed-screentest-coach.ts
  git commit -m "feat(scripts): --dato=YYYY-MM-DD i seed-screentest-komplett/-coach — fryser kjøredato for rigg-fixtures

Delt, ren tolker (scripts/_dato-flagg.ts, 3 node:test). Uten flagget:
uendret oppførsel (ekte kjøredato). seed-screentest-coach.ts sine tre
'nå'-lesende hjelpere (at/nextWeekday/hoursAgo) samles bak én NAA-konstant.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 3.3: `testDato`-felt i riggen (dokumentasjon) + `SHOT_DATO`-overstyring

**Filer:**
- Modify: `tests/visual/skjerm-mapping.ts` (typen — IKKE opprett `skjerm-mapping.test.ts`, se merknad)
- Modify: `scripts/train-lock-pixel-diff.mjs:25-26`
- Modify: `tests/visual/README.md` (seksjonen `## Test-dato-overstyring`)

**Grensesnitt:** `SkjermMapping.testDato?: string` — ISO-datotid i SAMME format som `TEST_NAA`
(f.eks. `"2026-08-22T07:10:00Z"`). Rent dokumentasjonsfelt per nå: riggen leser det IKKE
automatisk (samme manuelle mønster som `viewport`/`selector` i økt 4 — operatøren kopierer
verdien inn selv). `train-lock-pixel-diff.mjs` sin `TEST_NAA` kan overstyres med miljøvariabelen
`SHOT_DATO`, som `SHOT_BRUKER`/`SHOT_BASE` allerede gjør for bruker/URL.

**VIKTIG merknad om rekkefølge:** `…-okt-4.md` oppgave 4.1 OPPRETTER
`src/lib/__tests__/visual/skjerm-mapping.test.ts` og legger til feltene
`fasitDato`/`minutter`/`aarsak`/`viewport`/`selector` RETT ETTER `notat: string;` i typen — økt 4
sitt eget "Åpne funn" #5 sier eksplisitt at økt 3 (denne fila) også legger et felt i typen, og at
det gir "en enkel, men sikker, konflikt" når begge er merget. IKKE opprett testfila her — det er
økt 4 sin jobb, og et duplikat-forsøk på å opprette samme fil ville kollidert med git. Denne
oppgaven rører KUN selve typen, med `tsc --noEmit` som verifisering (ingen egen node:test mulig
her uten samtidig å skrive økt 4 sin testfil på forskudd).

- [ ] **Steg 1: Legg til feltet i typen.** `tests/visual/skjerm-mapping.ts` linje 24–26:
  ```ts
    status: "kalibrert" | "ukalibrert";
    notat: string;
  };
  ```
  blir
  ```ts
    status: "kalibrert" | "ukalibrert";
    notat: string;
    /**
     * "Nå"-tidspunktet raden er MÅLT/SKAL måles med, som ISO-datotid i samme
     * format som TEST_NAA i scripts/train-lock-pixel-diff.mjs (f.eks.
     * "2026-08-22T07:10:00Z"). Dokumentasjon, ikke automatikk: riggen leser
     * IKKE dette feltet selv ennå — sett miljøvariabelen SHOT_DATO til samme
     * verdi manuelt før du kjører pixel-diff for raden (mønster: SHOT_BRUKER).
     * Mangler feltet: raden måles med riggens egen TEST_NAA-standard
     * (22.08.2026) — de fleste rader trenger derfor ALDRI dette eksplisitt.
     */
    testDato?: string;
  };
  ```

- [ ] **Steg 2: Typesjekk.**
  ```bash
  cd "$WT" && npx tsc --noEmit
  ```
  Forventet: stille (feltet er valgfritt — ingen eksisterende rad trenger å endres for at typen skal kompilere).

- [ ] **Steg 3: `SHOT_DATO` i riggen.** `scripts/train-lock-pixel-diff.mjs` linje 25–26:
  ```js
  // Fryser "i dag" til fasitens dato (kun screentest, se src/lib/testing/dato-override.ts).
  const TEST_NAA = "2026-08-22T07:10:00Z"; // 09:10 Oslo, midt i den seedede 09:00-09:50-økten
  ```
  blir
  ```js
  // Fryser "i dag" til fasitens dato (kun screentest, se src/lib/testing/dato-override.ts).
  // Overstyres med SHOT_DATO=<ISO-datotid> for en rad med et testDato ulikt
  // denne standarden (tests/visual/skjerm-mapping.ts, fase 1 økt 3).
  const TEST_NAA = process.env.SHOT_DATO || "2026-08-22T07:10:00Z"; // 09:10 Oslo, midt i den seedede 09:00-09:50-økten
  ```
  (Rører linje 25–26 — IKKE linje 9, 23–24, 31, 71–74 eller 111–112, som er nøyaktig de linjene `…-okt-4.md` oppgave 4.4 skriver om for `--viewport`/`--selector`. Ingen filkonflikt mellom øktene i denne fila.)
  Kontroll: `node --check "$WT/scripts/train-lock-pixel-diff.mjs"` → stille. `node "$WT/scripts/train-lock-pixel-diff.mjs"; echo "exit=$?"` (ingen argumenter, ingen credentials i worktreen) → `Bruk: node scripts/train-lock-pixel-diff.mjs …` og `exit=1` — uendret feilmelding, beviser at endringen ikke rørte argumentparsingen.

- [ ] **Steg 4: Oppdater README — feltet OG en utdatert setning fra samme seksjon.** `tests/visual/README.md`, seksjonen `## Test-dato-overstyring` (nest siste avsnitt sier i dag "Foreløpig koblet inn kun i `src/app/portal/page.tsx` (PH-01)" — utdatert etter oppgave 3.1, som også kobler inn `planlegge/page.tsx`):
  ```markdown
  ## Test-dato-overstyring

  Appen viser alltid ekte `Date.now()` server-side — en fasit tegnet for en
  fastdatert eksempeldag («22. august») kan aldri matches uten å fryse «i dag»
  for testkjøringen. Løst i `src/lib/testing/dato-override.ts`: header
  `x-screentest-naa` overstyrer KUN for `screentest@akgolf.test`-kontoen — ekte
  brukere kan aldri sette sin egen dato. Foreløpig koblet inn kun i
  `src/app/portal/page.tsx` (PH-01) — koble inn per skjerm etter behov, ikke
  forhåndsinnfør på skjermer som ikke trenger det.
  ```
  blir
  ```markdown
  ## Test-dato-overstyring

  Appen viser alltid ekte `Date.now()` server-side — en fasit tegnet for en
  fastdatert eksempeldag («22. august») kan aldri matches uten å fryse «i dag»
  for testkjøringen. Løst i `src/lib/testing/dato-override.ts`: header
  `x-screentest-naa` overstyrer KUN for `screentest@akgolf.test`-kontoen — ekte
  brukere kan aldri sette sin egen dato. Koblet inn i `src/app/portal/page.tsx`
  (PH-01) og, via `getDashboardData()`s `naa`-parameter (fase 1, økt 3),
  `src/app/portal/planlegge/page.tsx` (PH-07) — koble inn per skjerm etter
  behov, ikke forhåndsinnfør på skjermer som ikke trenger det. Kjent, IKKE
  koblet unntak: `/portal/analysere/actions.ts` har sine egne tre `new Date()`
  og påvirker TM-04a-radens restavvik (se raden i `skjerm-mapping.ts`).

  `train-lock-pixel-diff.mjs` sin `TEST_NAA`-konstant kan overstyres med
  miljøvariabelen `SHOT_DATO=<ISO-datotid>` for en rad med et `testDato` ulikt
  standarden 22.08.2026 (`tests/visual/skjerm-mapping.ts`, fase 1 økt 3) — de
  fleste rader trenger den aldri (mønster: `SHOT_BRUKER`/`SHOT_BASE`).
  ```
  Kontroll: `grep -c "SHOT_DATO" "$WT/tests/visual/README.md"` → `2`. `node scripts/check-doc-lenker.mjs` (fra `$WT`) → `OK: …`.

- [ ] **Steg 5: Commit.**
  ```bash
  cd "$WT" && git add tests/visual/skjerm-mapping.ts scripts/train-lock-pixel-diff.mjs tests/visual/README.md
  git commit -m "feat(rigg): testDato-felt (dokumentasjon) + SHOT_DATO-overstyring i train-lock-pixel-diff

testDato er valgfritt og udokumentert-lest av riggen ennå — samme manuelle
mønster som viewport/selector (økt 4). Retter samtidig README-setningen om
at dato-overstyringen kun er koblet inn i PH-01 (den er nå to steder).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

---

### Oppgave 3.4: Verify, PR A, review og merge

**Filer:**
- Ingen nye — sluttkontroll av 3.1–3.3.

- [ ] **Steg 1: Delportene i worktreen** (erstatter `npm run verify`, som feiler på build/critical-imports uten egen `node_modules` — feillogg 29.08):
  ```bash
  cd "$WT" && export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy && npx prisma validate && npx prisma generate && npx tsc --noEmit && npx eslint --quiet src && npx eslint --max-warnings 0 scripts/_dato-flagg.ts scripts/seed-screentest-komplett.ts scripts/seed-screentest-coach.ts scripts/train-lock-pixel-diff.mjs && node scripts/check-action-auth.mjs && node scripts/check-token-gap.mjs && node scripts/check-ingen-paper.mjs && node scripts/ak-golf-tokens.mjs && node scripts/check-ak-golf-kits.mjs --rask && node scripts/check-doc-lenker.mjs && node scripts/check-tl-kontrast.mjs && npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"; git status --porcelain
  ```
  Forventet: alt uten feil, `fail 0` (inkluderer de 3 nye node:testene fra oppgave 3.2), og `git status --porcelain` tom (kontrastfila regenereres identisk). Rødt = fiks i samme gren før push.

- [ ] **Steg 2: Push og PR.**
  ```bash
  cd "$WT" && git push -u origin claude/fase1-okt3-datofrys
  gh pr create --title "fix(portal): fase 1 økt 3 — datofrys gjennom actions.ts (Plan/I dag), --dato i seed-scriptene" --body "$(cat <<'EOF'
  Designport fase 1, økt 3 (docs/superpowers/plans/2026-09-05-komplett-designport.md §4 pkt. 3).

  - `hentEffektivNaa()` er nå eneste klokke i `src/app/portal/actions.ts` — 11 rå `new Date()` erstattet med en `naa`-parameter (default `new Date()`, uendret oppførsel for ekte brukere).
  - `src/app/portal/planlegge/page.tsx` (PH-07) kobler inn `hentEffektivNaa` for første gang.
  - `seed-screentest-komplett.ts` / `seed-screentest-coach.ts` tar `--dato=YYYY-MM-DD` (default = ekte kjøredato).
  - `tests/visual/skjerm-mapping.ts` får et valgfritt `testDato`-felt (dokumentasjon); `train-lock-pixel-diff.mjs` kan overstyres med `SHOT_DATO`.

  PH-07 remåles i egen, liten oppfølgings-PR ETTER at denne er live i prod (riggen måler `https://akgolf-hq.vercel.app` — kan ikke observere denne endringen før den er deployert).

  ## Testet
  - [x] tsc, eslint, alle check-skript og `npm test` grønt lokalt (worktree uten build — CI tar build)
  - [x] 3 nye node:test for `--dato`-tolkeren (`src/lib/__tests__/scripts/dato-flagg.test.ts`)
  - [ ] Ingen UI-endring i denne PR-en — skjermbilde ikke aktuelt (PH-07 sitt utseende endres ikke, kun hvilken uke den REGNER som "nå")

  Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  PRNR=$(gh pr view --json number -q .number); echo "$PRNR"
  ```

- [ ] **Steg 3: Review, grønn CI, merge.** Kjør `pr-review-toolkit:review-pr`; rett funn i samme gren. Vent på grønn CI: `gh pr checks $PRNR --watch`. Så: `gh pr merge $PRNR --squash --delete-branch`. IKKE fjern worktreen ennå — oppgave 3.5 gjenbruker `$WT` for å kjøre seed-scriptet mot prod med worktreens filversjon.

---

### Oppgave 3.5: Etter merge — vent på deploy, seed fylt uke, remål PH-07, liten docs-PR

**Filer:**
- Modify: `tests/visual/skjerm-mapping.ts` (kun PH-07-raden: `testDato`, `kalibrertAvvikPst`, `notat`)
- Modify: `tests/visual/README.md` (én ny, datert seksjon nederst — mønster: `## ME-03 Abonnement (Ø3, 02.09.2026)`)
- Modify: `docs/MASTERPLAN-GJENSTAAENDE.md` rad `20.1`
- Modify: `docs/feillogg.md`

Kjøres fra en NY gren, fersk fra `origin/main` (som nå har PR A), men bruker `$WT` sitt
scriptinnhold der det trengs (identisk med `origin/main` etter merge):
```bash
cd /Users/anderskristiansen/Developer/akgolf-hq && git fetch origin
git worktree add /Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt3-remaling -b claude/fase1-okt3-ph07-remaling origin/main
WT2=/Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/fase1-okt3-remaling
grep -c "hentEffektivNaa" "$WT2/src/app/portal/planlegge/page.tsx"   # → 2, bekrefter PR A er inne
```

- [ ] **Steg 1: Vent til produksjons-deploy av merge-commiten er `READY`.** Bruk `vercel`-pluginets verktøy (`get_git_deployment_context` eller `list_deployments`/`get_deployment` for prosjektet, filtrert på merge-commit-SHA-en fra `gh pr view $PRNR --json mergeCommit -q .mergeCommit.oid`) — jf. CLAUDE.md §Skill-bruk pkt. 9 («les faktiske deploy-/runtime-logger via pluginets verktøy FØR du endrer kode»). IKKE gjett at et par minutter er nok — bekreft status. Uten tilgang til Vercel-verktøyet: spør Anders om deployen er ferdig før du går videre (riggen ville ellers måle GAMMEL kode og gi et falskt "ingen endring"-resultat).

- [ ] **Steg 2: Seed fylt uke for screentest, fra hovedsjekkuten (har `.env.local`), med `$WT2` sitt script:**
  ```bash
  ( cd /Users/anderskristiansen/Developer/akgolf-hq && npx tsx "$WT2/scripts/seed-screentest-komplett.ts" --dato=2026-08-22 2>&1 | tail -25 )
  ```
  Forventet, blant utskriften: `TrainingSessionV2: toppet opp dagens økt med N drills · morgendagens økt opprettet` (eller `fantes allerede` — begge er OK). "Kjøredato" er nå lørdag 22.08.2026 (matcher `TEST_NAA`/PH-01-fixturens dato), så "morgendagens økt" (`Fullsving-blokk · P4-P6`, søndag 23.08 09:00–10:30) havner i ISO-uken mandag 17.08–søndag 23.08.2026 — SAMME uke riggens frosne "i dag" (22.08.2026) leser via `getWeekOverview`.
  **Merk (se Åpne funn):** dette skriptet reseeder ALLE 13 datadomenene relativt til 22.08.2026, ikke kun treningsøkter — det er ønsket (gjør hele screentest-datasettet internt konsistent med riggens frosne dato), men kan forskyve tidligere målte prosenttall for PH-01/TE-01/TM-04a/TM-01a marginalt. Ikke re-kalibrer dem i denne oppgaven.

- [ ] **Steg 3: Bekreft uken faktisk er fylt** (uavhengig av loggteksten over — direkte mot databasen, samme mønster som andre ad hoc-verifiseringer i denne kodebasen):
  ```bash
  ( cd /Users/anderskristiansen/Developer/akgolf-hq && npx tsx <<'EOF' 2>&1 | tail -10
  import "./scripts/_env";
  import { prisma } from "@/lib/prisma";
  const spiller = await prisma.user.findUniqueOrThrow({ where: { email: "screentest@akgolf.test" } });
  const rader = await prisma.trainingSessionV2.findMany({
    where: { studentId: spiller.id, startTime: { gte: new Date("2026-08-17T00:00:00+02:00"), lt: new Date("2026-08-24T00:00:00+02:00") } },
    select: { title: true, startTime: true },
    orderBy: { startTime: "asc" },
  });
  console.log(`TrainingSessionV2 i uke 17.-23.08.2026: ${rader.length}`);
  for (const r of rader) console.log(` - ${r.startTime.toISOString()} ${r.title}`);
  await prisma.$disconnect();
  EOF
  )
  ```
  Forventet: minst `1` rad (`Fullsving-blokk · P4-P6`, `2026-08-23T07:00:00.000Z` = 09:00 Oslo). `0` rader betyr enten at steg 1/2 ikke faktisk traff prod, eller at en session allerede fantes for "i morgen" FØR denne kjøringen med en annen tittel/tid — undersøk før du går videre, ikke anta at riggen vil vise noe uansett.

- [ ] **Steg 4: Mål PH-07 — eksakt kommando fra `tests/visual/README.md`/`package.json`.** `SHOT_DATO` trengs IKKE her: `2026-08-22T07:10:00Z` er allerede riggens `TEST_NAA`-standard.
  ```bash
  ( cd /Users/anderskristiansen/Developer/akgolf-hq && npm run signoff:train-lock -- "PH-07 Plan" "/portal/planlegge" dark 54 )
  ```
  (Ekvivalent med README sin rå form: `node scripts/train-lock-pixel-diff.mjs "PH-07 Plan" "/portal/planlegge" dark 54`.) Forventet: fire linjer `fasit:/app:/diff:` under `tests/visual/ut/` (hovedsjekkuten, gitignorert) og `avvik: N/M px = X.XX%`. Åpne `-diff.png` og `-app.png` med `Read`: uke-stripen og minst én dag-seksjon med en økt-rad skal nå vises — IKKE PH-08s tomme-uke-kort.
  - Under 10 %: gå til steg 5 med det MÅLTE tallet.
  - 10 % eller mer: ikke rund ned eller gjett videre tiltak i denne planen — skriv det ekte tallet inn i steg 5 sammen med et ærlig notat om hva diff-bildet viser at avviker (samme disiplin som alle andre rader i fila), og legg en linje i Åpne funn om at målet ikke ble nådd og hvorfor (diff-bildet vil vise om det er strukturelt eller bare datavolum).

- [ ] **Steg 5: Oppdater PH-07-raden i `tests/visual/skjerm-mapping.ts`.** Sett `testDato: "2026-08-22T07:10:00Z",` rett etter `bruker: "screentest",`, oppdater `kalibrertAvvikPst` til det målte tallet, og skriv om `notat` til å beskrive fikset (behold historikken kort — hva var galt, hva er rettet, hva gjenstår om noe):
  ```ts
  {
    label: "PH-07 Plan",
    rute: "/portal/planlegge",
    tema: "dark",
    cropTop: 54,
    bruker: "screentest",
    testDato: "2026-08-22T07:10:00Z",
    kalibrertAvvikPst: <MÅLT TALL>,
    status: "kalibrert",
    notat: "Fase 1, økt 3 (<dato>): hentEffektivNaa() er nå koblet inn i planlegge/page.tsx via getDashboardData()s naa-parameter, og screentest sin uke 17.-23.08.2026 er seedet fylt (seed-screentest-komplett.ts --dato=2026-08-22). Restavvik: <beskriv det diff-bildet faktisk viser — f.eks. antall dager med økter i fasiten vs. appen, øktantall/tittel-tekst>.",
  },
  ```

- [ ] **Steg 6: README — kort, datert notat** (mønster: den eksisterende `## ME-03 Abonnement (Ø3, 02.09.2026)`-seksjonen nederst i fila). Legg til øverst under en ny overskrift:
  ```markdown
  ## PH-07 Plan remålt i fylt uke (fase 1, økt 3, <dato>)

  Tidligere 17,26 % var målt i TOM uke — hentEffektivNaa() var ikke koblet inn
  i planlegge/page.tsx, og riggens frosne 22.08.2026 traff en ekte, tom uke i
  databasen. Nå koblet inn (getDashboardData()s naa-parameter) og screentest
  sin uke 17.-23.08.2026 seedet fylt. Nytt tall: <MÅLT>%, se raden i
  skjerm-mapping.ts.
  ```
  Kontroll: `node scripts/check-doc-lenker.mjs` (fra `$WT2`) → OK.

- [ ] **Steg 7: Grønt.**
  ```bash
  cd "$WT2" && export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy && npx prisma generate && npx tsc --noEmit && npx eslint --quiet tests/visual/skjerm-mapping.ts && node scripts/check-doc-lenker.mjs
  ```

- [ ] **Steg 8: MASTERPLAN 20.1 og feillogg** (sjekk raden på `origin/main` FØR du redigerer — se Forutsetninger). I rad 20.1 erstattes `datofrys gjennom Plan/Analyse,` med `~~datofrys gjennom Plan/Analyse~~ (økt 3 levert, PR #$PRNR kode + PR #<PRNR2> remåling),` (begge PR-numre som tall). Legg én linje i `docs/feillogg.md`: `- <dato> (fase 1 økt 3): ren økt` eller det som faktisk kostet tid (f.eks. hvis steg 4 ikke traff under 10 % på første forsøk).
  ```bash
  cd "$WT2" && git add tests/visual/skjerm-mapping.ts tests/visual/README.md docs/MASTERPLAN-GJENSTAAENDE.md docs/feillogg.md
  git commit -m "docs(rigg): PH-07 remålt i fylt uke (fase 1, økt 3) — <MÅLT>% (var 17,26% i tom uke)

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
  ```

- [ ] **Steg 9: Push, PR B, review, merge.**
  ```bash
  cd "$WT2" && git push -u origin claude/fase1-okt3-ph07-remaling
  gh pr create --title "docs(rigg): fase 1 økt 3 — PH-07 remålt i fylt uke (var 17,26 % tom uke)" --body "Oppfølging av PR #$PRNR (kode, allerede merget og live). Seedet screentest sin uke 17.-23.08.2026 (seed-screentest-komplett.ts --dato=2026-08-22) og remålt PH-07: <MÅLT>%. Ingen produksjonskode i denne PR-en.

  Generated with [Claude Code](https://claude.com/claude-code)"
  PRNR2=$(gh pr view --json number -q .number); echo "$PRNR2"
  gh pr checks $PRNR2 --watch && gh pr merge $PRNR2 --squash --delete-branch
  cd /Users/anderskristiansen/Developer/akgolf-hq && git worktree remove "$WT" 2>/dev/null; git worktree remove "$WT2" 2>/dev/null
  ```

---

### Ferdig når

- `grep -n "new Date()" src/app/portal/actions.ts | grep -v "naa: Date = new Date()"` → INGEN treff; `grep -c "naa: Date = new Date()" src/app/portal/actions.ts` → `10`.
- `grep -c "hentEffektivNaa" src/app/portal/planlegge/page.tsx` → `2`.
- `npx tsx --test src/lib/__tests__/scripts/dato-flagg.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"` → `tests 3` / `pass 3` / `fail 0`.
- `npx tsx scripts/seed-screentest-komplett.ts --dato=ikke-en-dato; echo $?` → feilmelding om ugyldig `--dato` og `1` (feiler før DB-kall).
- `grep -n "new Date()" scripts/seed-screentest-coach.ts` → INGEN treff (kun `_dato-flagg.ts` har det, som fallback).
- `grep -c "testDato" tests/visual/skjerm-mapping.ts` → minst `2` (typen + PH-07-raden).
- `node --check scripts/train-lock-pixel-diff.mjs` → stille; `grep -c "SHOT_DATO" scripts/train-lock-pixel-diff.mjs tests/visual/README.md` summert → minst `3`.
- Begge PR-er (`$PRNR`, `$PRNR2`) viser `MERGED`: `gh pr view $PRNR --json state -q .state` og `gh pr view $PRNR2 --json state -q .state`.
- PH-07-raden i `tests/visual/skjerm-mapping.ts` har `status: "kalibrert"`, `testDato` satt, og `kalibrertAvvikPst` under `10` (eller — hvis ikke oppnådd — et ærlig, målt tall med forklarende `notat`, se oppgave 3.5 steg 4).
- `docs/MASTERPLAN-GJENSTAAENDE.md` rad `20.1` viser `datofrys gjennom Plan/Analyse` som gjennomstreket med begge PR-numrene.
- `git -C /Users/anderskristiansen/Developer/akgolf-hq worktree list` viser verken `fase1-okt3` eller `fase1-okt3-remaling`.

### Åpne funn (ikke løst i denne økta)

1. `/portal/analysere/actions.ts` har tre EGNE rå `new Date()` (linje 33, 199, 681) og er IKKE koblet til `hentEffektivNaa` — dette er PRESIS gapet TM-04a-radens notat i `skjerm-mapping.ts` allerede beskriver ("Samme datoavhengighet som PH-01 … ikke koblet inn her ennå"). Utenfor denne øktas fil-scope (kriterium 3 sier eksplisitt `src/app/portal/actions.ts`, entall).
2. `src/lib/portal/optimal-session.ts:37` (`const tretti = new Date();`) mater `getDashboardData()`s `optimalSession`-felt (vist på PH-01 når `todayAll.length === 0`) og er heller ikke koblet — samme klasse gap, annen fil.
3. `src/lib/portal-plan/uke-periode.ts:28` har ALLEREDE nøyaktig samme mønster (`naa: Date = new Date()`) som denne økta innfører i `actions.ts` — trolig skrevet av en tidligere økt som forberedte akkurat dette. Den er likevel ikke koblet til `hentEffektivNaa` fra `planlegge/page.tsx`, fordi `PlanV2.tsx` linje 131–132 eksplisitt `void`-er både `depthMode`- og `periode`-propen (død for visning i dag). Kobles inn den dagen `periode` faktisk vises — ikke før, jf. "ikke forhåndsinnfør på skjermer som ikke trenger det".
4. Å reseede `seed-screentest-komplett.ts` med `--dato=2026-08-22` (oppgave 3.5) re-ankrer ALLE 13 datadomenene (bookinger, TrackMan, runder, tester, mål …) til 22.08.2026 i stedet for hvilken som helst reell dato scriptet sist ble kjørt på. Dette er ønsket for at det frosne rigg-datasettet skal henge sammen, men betyr at de tidligere målte `kalibrertAvvikPst`-tallene for PH-01 (11,07 %), TE-01 (14,38 %), TM-04a (5,56 %) og TM-01a (10,88 %) kan ha driftet marginalt siden de ble målt mot data seedet på en annen reell dato. Ingen av dem re-kalibreres i denne økta.
5. Økt 4 sin egen type-utvidelse (`fasitDato`/`minutter`/`aarsak`/`viewport`/`selector`) rett etter `notat: string;` i `SkjermMapping` vil, etter at denne økta er merget, IKKE lenger matche økt 4-planens ordrette "FØR"-tekst (som mangler `testDato`) — økt 4 sitt eget "Åpne funn" #5 varsler om nøyaktig dette. Den som kjører økt 4 må justere ankeret (sette sitt tillegg etter `testDato?: string;` i stedet), ikke løst her.
6. `testDato` er ren dokumentasjon: ingen kode leser feltet automatisk fra `skjerm-mapping.ts` og setter `SHOT_DATO`/headeren selv. En fremtidig rigg-automatisering (nattlig test, økt 6, eller en `.mjs`-vakt i samme stil som `design-audit.mjs` sin regex-lesing av filen som tekst) kunne koble dette sammen — ikke bestilt her.
