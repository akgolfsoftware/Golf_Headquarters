# LOOP B3 — DONE (25.08.2026)

Agency-herding for Workbench (coach-siden). Gren `feat/wb-b3-agency-herding`, fra
`release/workbench-b1` (`83283118`). Del av `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`
§5, rad B3.

## Hva som ble bygget

### 1. `loading.tsx` + `error.tsx` for `/admin/workbench/[playerId]`
- `src/app/admin/workbench/[playerId]/loading.tsx` — server component,
  `<V2Laster variant="liste" />` (samme mønster som `src/app/admin/team/loading.tsx`).
- `src/app/admin/workbench/[playerId]/error.tsx` — `"use client"`, logger via
  `reportClientError` i `useEffect`, rendrer `<V2Feil reset={reset}
  tilbakeHref="/admin/spillere" tittel="Kunne ikke laste Workbench-uken" />`.
  `/admin/spillere` er Stall-ruten (samme rute `AGENCYOS_NAV`s `spillere`-punkt peker
  til) — naturlig retrettvei fra en spillers Workbench-uke.

### 2. Mobil-inspektør (bunn-ark under `lg`)
`src/components/workbench/WorkbenchUke.tsx`: `SessionInspector`-JSX-en er trukket ut
til en delt `inspectorNode`-variabel (samme props/handlinger som før — flytt, publiser,
trekk tilbake, slett, legg til/flytt/fjern øvelse). Den brukes nå to steder:
- Desktop (`lg` og oppover): uendret, fast høyrekolonne (`hidden lg:block`).
- Mobil (under `lg`): ny `<BunnArk>` (`src/components/v2/bunn-ark.tsx`, det delte
  produksjons-bottomsheet-mønsteret) som åpnes automatisk når `valgtId` settes
  (klikk på en økt i `WeekGrid` på mobil) og lukkes med `onSelectSession(null)`-ekvivalent
  (`setValgtId(null)`) via `onClose`. Tittel i arket er øktens navn, eller
  `UI.inspectorTitle` ("Økt") når ingenting er valgt (viser da `InspektorTom`).

**Kjent, ikke løst i denne oppgaven:** `BunnArk` selv har ikke `--ak-cookie-h` i sin
bunn-padding (kjent gap logget i `.claude/rules/gotchas.md` §Cookie-banneret, «Ikke
løst (samme klasse)» — gjelder alle 8 eksisterende `BunnArk`-bruk i repoet, ikke noe
nytt B3 introduserer). Å fikse selve `BunnArk`-primitiven er utenfor denne oppgavens
filområde (delt komponent, mange forbrukere) — flagges her i stedet for å endre en
delt komponent uten eksplisitt beslutning.

### 3. Hardkodet norsk copy → `labels.ts`
`src/lib/domain/workbench/labels.ts` fikk ~25 nye eksporterte strenger/funksjoner
(gruppert: Empty/tomme-tilstander, Publish flow, Ny økt-skjema, Feiltilstand, Toasts,
Inspektør tid/lagre-tilstand, Fallback-spillernavn). Alle er referert fra komponentene
under — ingen norsk streng skrevet direkte i JSX/logikk i disse filene lenger:

| Fil | Hva ble flyttet |
|---|---|
| `PublishConfirmDialog.tsx` | «i dag»-advarselen (entall/flertall), «Publiserer …» |
| `CreateSessionModal.tsx` | Beskrivelse, «Tittel»/«Dato»-feltlabels, placeholder, valideringsfeil (tittel/tid), «Oppretter …»/«Opprett» |
| `SessionInspector.tsx` | Tom-tilstandstekst, «Tid»/«Dato»/«Om økten»/«Varer»-labels, «Lagrer …» |
| `SourcesPanel.tsx` | Tom-tilstand («Ingen kilder lastet» + undertekst) |
| `WeekGrid.tsx` | Tom-uke-hint («Klikk i uka for å legge inn en økt.») |
| `WorkbenchFeil.tsx` | Feiltittel + «Prøv igjen» |
| `WorkbenchUke.tsx` | Ukjent-feil-fallback, inline «Prøv igjen», alle 7 toast-meldinger (flyttet/slettet/lagt til/fjernet/trukket tilbake/utkast opprettet/publisert entall+flertall) |
| `page.tsx` | Fallback-spillernavn «Spiller» |

Ikke flyttet (bevisst, for å ikke overgjøre oppgaven): `DAGKORT`
(dag-forkortelser i `WeekGrid.tsx`) og `OMRADE_GRUPPER`-etikettene
(«Full sving»/«Nærspill»/«Putt»/«Fysisk»/«Bane» i `DrillListEditor.tsx`) — begge er
statiske domene-/gruppekonfigurasjoner, ikke løse UI-setninger, og å bryte dem ut ville
lagt select-gruppestruktur inn i en ren streng-fil uten reell gevinst.

### 4. `validateWeek()`-VARSEL koblet til publish-flyten
`WorkbenchUke.tsx` beregner `valideringsnotater = validateWeek(alleOkter)`
(hele ukas økter, ikke bare utkastene — fanger også overlapp mot allerede publiserte
økter samme dag) og sender dem til `PublishConfirmDialog` som ny, valgfri
`notater`-prop. Dialogen viser dem i et eget varsel-banner (rødlig ramme, samme visuelle
språk som feilbanneret i `WorkbenchUke`) med tittelen `UI.publishOverlapWarnTitle`
("Overlapp i valgte økter") og én linje per notat (`n.message`, allerede norsk fra
`validateWeek` i `operations.ts`). **Sperrer aldri** — «Publiser»-knappen er uendret,
ingen `disabled`-kobling mot notatene (invariant 1: spilleren/coachen står fritt,
appen informerer, håndhever ikke).

### 5. Zod på `moveSession`/`reorderDrills`
`src/lib/domain/workbench/schemas.ts`: nye `MoveSessionInputSchema` (sessionId,
`IsoDateSchema`, `newStartMinute` 0–1439, `newDurationMinutes` 15–720 valgfri) og
`ReorderDrillsInputSchema` (sessionId, `orderedDrillIds: string[]` med
ikke-tomme id-er). `src/lib/workbench/wb-actions.ts`: begge funksjonene validerer nå
hele input-objektet mot sitt schema først (`safeParse` → `{ ok: false, error }` ved
feil, samme mønster som `addDrill`/`createSession` i samme fil) før noe Prisma-kall
skjer.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npm ci` (worktreets `node_modules` var forsvunnet midt i økten — se «Feil som kostet tid» under) | grønn, 1008 pakker |
| `npm run verify` (prisma validate/generate · tsc · eslint · action-auth · token-gap · critical-imports · build + serwist) | **grønn** |
| `npm test` | **1605/1605**, 0 feil |
| Nye/endrede filer typesjekket og lintet isolert (`npx eslint --quiet` på alle berørte filer) | grønn |

**Manuell klikk-test av mobil-bunn-arket er IKKE utført.** Samme begrensning som
`LOOP-3S-DONE.md` og `LOOP-B2-RELEASE-DONE.md` dokumenterer: en kjørende dev-server mot
ekte data krever `.env.local`, som aldri kopieres inn i en worktree
(`.claude/rules/gotchas.md` §«Aldri kopier .env* inn i en worktree»). Koden er
typesjekket, lintet, bygget (Next.js-buildet kompilerte ruten uten feil) og manuelt
lest opp mot `BunnArk`s eksisterende API (samme props som de 8 andre bruksstedene i
repoet) — men selve tap→åpne-ark→rediger→lukk-flyten på en fysisk mobilbredde er
ikke klikket i en nettleser fra denne økten. Anders bør klikke-teste før PR-en merges,
i tråd med skjermbilde-gaten i `CLAUDE.md`.

## Feil som kostet tid

Worktreets `node_modules` forsvant midt i økten (fra fullstendig, etter en grønn
`npm run verify`-kjøring, til helt fraværende — ikke bare stale). Årsak: en parallell
agent-økt (`feat/wb-b4-ekte-i-dag`, worktree `agent-ab1278bdc09326e8b`) kjørte
sannsynligvis sin egen `npm ci`/installasjon samtidig, og worktreets `node_modules`
var (som dokumentert i minnet `worktree-build-krever-npm-ci`) en symlink til en delt
ressurs som ble byttet ut under føttene. Symptomet var forvirrende: `check-critical-
imports.mjs` feilet med «BUNDLE FAIL … undefined» fordi `node_modules/esbuild/bin/esbuild`
plutselig ikke fantes. Fiks: `npm ci` i egen worktree ga en isolert kopi, og verify ble
grønn på nytt uendret. Ingen kodeendring var involvert — ren miljøkollisjon mellom to
parallelle worktree-agenter. Bekrefter det eksisterende minnet; ingen ny gotcha-linje
skrevet (mønsteret er allerede dokumentert).

## Anti-scope overholdt

- `prisma/schema.prisma` urørt, ingen `migrate`/`db push`.
- Ingen bølge 2-arbeid (kilder-panel/drag/serie) — `SourcesPanel` er fortsatt skallet
  fra Loop 2, urørt utover copy-flytting.
- `src/components/portal/**` og `PortalChatHjem` er ikke rørt (B4s filområde,
  bekreftet disjunkt — `git diff --stat` mot `release/workbench-b1` viser kun filer
  under `src/app/admin/workbench/`, `src/components/workbench/`,
  `src/lib/domain/workbench/`, `src/lib/workbench/`).
- Ingen visuell redesign utover selve bunn-ark-mekanikken (samme `Inspektorpanel`-
  innhold som før, kun ny ramme rundt på mobil).
- `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` §0 er ikke endret av denne økten.

## Push

Gren `feat/wb-b3-agency-herding` pushet til `origin`. PR åpnet mot
`release/workbench-b1` (ikke `main`) — se PR-lenken i sluttrapporten.
