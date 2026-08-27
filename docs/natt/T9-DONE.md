# T9 — Live + TrackMan-port til Train-lock — LEVERANSERAPPORT

27.08.2026. Gren: `claude/t9-live-trackman-port-127adc`. Ingen merge til main —
venter på Anders' skjermbilde-godkjenning (invariant 7).

## Levert

### 1. `/admin/trackman` → TM-06 Agency TrackMan
- Ny `AdminTrackmanTrainLock.tsx` (erstatter `AdminTrackmanV2.tsx`, Paper→TL).
- Header-metalinje «N økter denne uken · N spillere · simulator som bookbar
  ressurs: nei» (eksakt fasit-copy).
- Ett hero-DispersionMap-kort for siste økt med gyldig side+carry-data
  (gjenbruker `DispersionMap`/`computeTrackManDispersionMap` — ingen ny
  matte). Stall-tabell med kilde-tag (caps mute, ufarget).

### 2. `/admin/trackman/[sessionId]` → TM-10 Tom hullkart
- Gjenbruker `TrackManSessionDetail` (allerede TL-portet for PlayerHQ/TM-11)
  1:1 — samme dispersion-hero, samme «for få slag»-håndtering. Kun
  auth/chrome er Agency-spesifikt.

### 3. `/admin/recording` → TL-visuell port (ingen egen fasit)
- Ny `AdminRecordingTrainLock.tsx`. Samme funksjon, samme datakontrakt.
- **PII-vurdering:** samtykke-gate (`hentLydSamtykkeKart`, kun `GITT` tillater
  opptak-start), rollegate (COACH/ADMIN) og `retentionUntil`-feltet er
  UENDRET — denne porten rørte kun visningslag, aldri hvem som ser
  transkript/lyd eller hvem som kan starte opptak.
- Statusfarger fulgte design-reglene strengt: DONE→`TL.warm`, FAILED→
  `TL.danger` (tekst, aldri fylt flate), alt annet caps mute uten fargekoding.
  `TL.ok` brukes ikke (reservert «godkjent av coach»).

### 4. `/admin/agencyos/live` → AG-09b Live-tavle — **ekte data, ikke seed**
**Viktig funn (se docs/feillogg.md 27.08):** ruten viste IKKE pågående
treningsøkter — den viste «Mission Control», en statisk seed-mockup av
Anders' personlige innboks (e-poster/meldinger/kalender/Notion), et helt
annet konsept enn fasiten. Stoppet og spurte Anders (jf. task-brief §PII);
svar: bygg ekte Live-tavle her.

- Ny `src/lib/agencyos/live-tavle-data.ts` (`hentLiveTavle`): spør
  `trainingSessionV2` med `status=IN_PROGRESS` (+ `PLANNED` senere i dag),
  eierskap ADMIN=alle/COACH=egne (samme mønster som live-okt-actions).
- Ny `LiveTavleTrainLock.tsx`: kort-grid (3 side om side Mac, stack mobil),
  timer (`min igjen`, tabular-nums), fremdriftsbar (`TL.fill`). «Kommer i
  dag»-liste i stedet for fasitens Stille/I kø (mangler signal appen ikke
  logger ennå — se avvik under). Mono-caption fra fasiten sitert ordrett.
- **`AgencyLiveV2.tsx` + `live-data.ts` (Mission Control) er URØRT, men ikke
  lenger koblet til noen rute.** Anders avgjør ny hjemplass (Jarvis/Meg/
  Konsoll er kandidater per beslutninger.md) i en senere økt — ikke slettet
  her for å unngå å miste arbeid uten eksplisitt ja.

### 5. `/admin/agencyos/live/[sessionId]` → absorberer 3 pensjonerte ruter
- Ny `LiveOktCoachTrainLock.tsx`: samme informasjon som før (Økta, Løpet,
  Opptak, Siste analyse, Transkript) PLUSS tre nye seksjoner som overtar
  jobben fra de pensjonerte rutene:
  - **Send melding nå** ← `(legacy)/live/[id]/active` (`sendLiveMelding`)
  - **Fokuspunkt før økten** ← `(legacy)/live/[id]/brief` (`sendBriefTilSpiller`)
  - **Vurder økten** (1–5 stjerner + notat) ← `(legacy)/live/[id]/summary`
    (`lagreCoachVurdering`)
- Server actions flyttet 1:1 (samme zod-validering, samme rollesjekk,
  samme `completedSummary`-felt) til `src/lib/agencyos/live-okt-actions.ts`.
- `lastLiveOktData` utvidet med `coachBrief`/`coachRating`/`driller[].logget`.
- **Miljø-feltet (M0–M5) er fjernet fra visningen** — `MMiljo`-enumet er
  stale AK-formel v1-vokabular (CLAUDE.md invariant 1). Dette er et
  visningsvalg, IKKE en DB-migrasjon — enumet står urørt i schema.

### 6. Pensjonering (Anders' blankofullmakt 27.08, D-LYS-OG-5T-BESLUTNING §0)
- Slettet: `src/app/admin/(legacy)/live/[sessionId]/{active,brief,summary}`
  + `AdminLiveActiveV2.tsx`/`AdminLiveBriefV2.tsx`/`AdminLiveSummaryV2.tsx`
  (verifisert: ingen andre importer av disse tre komponentene).
- Redirects i `next.config.ts` (samme mønster som 14.08-opprydding,
  `permanent: false`): `/admin/live/:id/active|brief|summary` →
  `/admin/agencyos/live/:id`.
- Oppdatert de 2 reelle kodereferansene: `gjennomfore/okter/[id]/
  start-okt-knapp.tsx` (router.push) og `page.tsx` (2× Link).

## Dokumenterte avvik fra fasiten

1. **Kilde-tag** viser ekte `TrackManSession.source`-verdier (`csv-import`→
   `csv`, `api`→`api`, ukjent verdi vises rått, f.eks. `seed-gapping`) — IKKE
   fasitens `csv|pdf|foto|testdata`, som ikke finnes i datamodellen. Ingen
   skjema-endring gjort.
2. **TM-06 mini-dispersion per rad** (72px, TM-10d–f) er ikke bygget — ville
   krevd én ekstra slag-spørring per rad (opptil 50). Erstattet med ett
   hero-kort for siste økt med data, samme informasjonsmengde som TM-06s
   iPhone-visning.
3. **AG-09b «Rundt tavla»** (Stille/I kø/Ledige plasser) forenklet til
   «Kommer i dag» (planlagte økter senere samme dag) — appen logger ikke
   «sist coach-aktivitet per økt», som trengs for Stille/I kø-kategorisering.
4. **`InnsiktHubNav`** (Paper T.*-subnav, delt med Runder/Tester/Compliance)
   fjernet fra `/admin/trackman` — kan ikke sameksistere med TL.* på samme
   skjerm (invariant 2). Ingen TL-erstatning bygget her; gjeninnføres når
   AG-07 Innsikt-huben bygges (egen T-økt).
5. **`AgencyLiveV2`/`live-data.ts` (Mission Control)** — se punkt 4 over.
   Urørt kode uten rute. Trenger en beslutning fra Anders om ny hjemplass.

## Verifikasjon

- `npm run verify` — grønn (prisma validate/generate, tsc, eslint, alle
  interne gater, `next build` inkl. Serwist).
- `npm test` — 1702/1702 grønn.
- Manuell klikketest (dev, coachtest@akgolf.test): alle 5 ruter lastet uten
  krasj, ekte data vist, melding/brief/vurdering-seksjonene fungerte, lys og
  mørk modus verifisert på 390px og 1280/1400px for alle fem flater.
- Fant og fikset ett responsivt avvik underveis: KPI-flisene på
  `/admin/trackman` klippet på 390px (fast 4-kolonners grid) — rettet til
  `grid-cols-2 lg:grid-cols-4`.

## Gjenstår før merge

- **Anders' skjermbilde-godkjenning** (390px + 1280px, lys + mørk) — dette
  dokumentet er ikke en erstatning for den.
- Beslutning: hvor skal Mission Control (personlig innboks-dashboard) bo nå
  som `/admin/agencyos/live` er en ekte Live-tavle?
- PR-utkast klar, ikke opprettet ennå — se sesjonens neste steg.
