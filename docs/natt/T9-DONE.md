# T9-DONE — Live + TrackMan Agency → Train-lock

27.08.2026. Gren `claude/t9-live-trackman-port-q8shj0` fra `origin/main`. Ingen merge til
`main` — venter skjermbilde-gaten (Anders ser 390px + 1280px, lys og mørk, via
Vercel PR-preview).

## Hva som er portet

### AG-09 / AG-09b Live-tavle — `/admin/agencyos/live`

- **Byttet datakilde helt om.** Ruten viste tidligere «Mission Control» — en statisk
  seed av e-post/meldinger/Notion (`src/lib/agencyos/live-data.ts`,
  `AgencyLiveV2.tsx`) uten noen Train-lock-fasit og uten sammenheng med
  «hvem trener nå». Det er slettet. Ruten viser nå den faktiske AG-09-tavla:
  `TrainingSessionV2`-rader med `status = IN_PROGRESS` — samme statusovergang
  spilleren selv trigger via `Start` i `/portal/(fullscreen)/live/[sessionId]`
  (CLAUDE.md-smoketesten «Spiller: Start → IN_PROGRESS → Ferdig»). Ny fil:
  `src/lib/agencyos/live-tavle-data.ts`.
- 3 kort side om side på Mac/iPad (`repeat(auto-fit, minmax(220px,1fr))`), stack på
  telefon — matcher AG-09/AG-09b. Kort viser tag (økt-`location`, med fallback til
  `practiceType` når `location` ikke er satt — ofte tilfelle, se under), spiller,
  øktnavn, «N min igjen» (tabular) og fremdriftslinje — alt regnet fra ekte
  `startTime`/`endTime`.
- Tom tilstand («Ingen økter i gang nå») når ingen rader — ingen fabrikert kort.
- Mac får et «Rundt tavla»-inspektørpanel (A2-mønsteret, `MasterDetalj`) med
  **kun ekte felt**: neste planlagte økt i dag. Fasitens «Stille», «I kø» og
  «Ledige plasser» er **IKKE bygget** — ingen av de tre finnes som ekte data i
  domenet i dag (ingen kapasitetsmodell for simulator-/range-plasser, ingen
  godkjenningskø koblet mot live-økter). Å vise dem ville vært fabrikerte tall,
  som CLAUDE.md forbyr. Flagg for en fremtidig økt hvis Anders vil ha de tallene.
- **`location`-feltet er ofte tomt** — verken `startOkt`
  (`/admin/gjennomfore/okter/[id]/actions.ts`) eller den nye TrainingSessionV2-
  raden noen andre steder setter det. Kortets tag faller da tilbake til
  praksistype (Blokk/Random/Konkurranse/Spill·test). Fasitens «Sim 2»/«Range»-
  bay-navn er derfor IKKE garantert å vises — det ville krevd å dikte opp et
  navn appen ikke faktisk vet.

### `/admin/agencyos/live/[sessionId]` — per-økt coach-visning

- Mekanisk TL-port av `LiveOktCoachV2`/`lastLiveOktData` (uendret datalogikk).
- **Fjernet de utgåtte M0–M5-etikettene** (`MMiljo`-enumet) fra visningen —
  disse er nøyaktig det pensjonerte AK-formel-vokabularet (`.claude/rules/
  beslutninger.md`, 18.08.2026-beslutningen). Viser `practiceType`
  (Blokk/Random/Konkurranse/Spill·test) i stedet, som er reelt og ikke utgått.
- Samme rute tar nå imot trafikk fra alle tre pensjonerte legacy-sidene (se under).

### TM-06 Agency TrackMan — `/admin/trackman`

- Full rebuild (`src/lib/trackman/agency-stall-data.ts` +
  `AdminTrackmanTrainLock.tsx`). Gjenbruker **`computeTrackManDispersionMap`**
  1:1 fra B7/TM-11 per økt — median/smash/side/1σ-spredning på denne listen er
  derfor nøyaktig de samme tallene spilleren ser på sin egen øktdetalj, ingen
  egen regning duplisert.
- Featured-kort (opptil 4, nyeste økt per spiller) med `DispersionThumb`
  (ny, enkel — «kun prikker + line», TM-10s egen beskrivelse av den kompakte
  varianten) + caddie-setningen fra samme funksjon.
- Stall-liste med kart-thumbnail + spiller/kølle/slag/median/smash/side +
  kilde-tag, alle rader lenker til øktdetalj.
- Tom tilstand (TM-10-mønsteret) når ingen TrackMan-økter finnes.
- **Forenkling mot fasit:** TM-06c sin fulle Mac-tabell (ni kolonner,
  desktop-only layout) er ikke gjenskapt kolonne for kolonne — samme
  informasjon vises i ett radformat på alle bredder. «Port oppførsel, ikke
  1:1» (CLAUDE.md §Design).
- **Kilde-tag-forenkling:** fasiten viser `testdata/csv/pdf/foto` som
  illustrasjon av variasjon. `TrackManSession.source` har i dag kun to reelle
  verdier i skjemaet (`csv-import`, `api`) — kun disse vises.

### `/admin/trackman/[sessionId]` — én økt (coach)

- Gjenbruker **TM-11 rett av** (`TrackManSessionDetail` + `DispersionMap` +
  `computeTrackManDispersionMap`) fra `src/app/portal/analysere/trackman/[id]/
  page.tsx` (B7) — samme hero-komponent, samme domeneregning. Kun AgencyOS-
  skall (V2Shell) og en coach-tilpasset topptekst (spillernavn, siden coachen
  ser andres økter) er nytt. Ingen ny fasit-ID trengtes for denne
  detaljvisningen — hub-mønsteret §5T godkjente dekker gjenbruket.

### `recording` — `/admin/recording` (PII-tung, §0 punkt 6)

- Ytre skall (`AdminRecordingV2.tsx`: topptekst, varsler, sammendragskort,
  KPI-rad, historikk) er TL-portet.
- **`RecordingControls`/`RecordingAnalyzeButton` (773 + 139 linjer,
  MediaRecorder/wake-lock/batteri-styring) er IKKE TL-portet i denne økten.**
  De er hardware-nær kode jeg ikke kan verifisere uten en ekte nettleser med
  mikrofontilgang, og de bruker i dag en TREDJE tokenfamilie (Tailwinds
  semantiske `bg-card`/`border-border`/`bg-primary`-klasser fra `globals.css`
  — verken Paper `T.*` eller Train-lock `TL.*`). Blindt reskinne 900+ linjer
  maskinvarekode i denne allerede store økten var en unødvendig regresjonsrisiko.
  Flagget som egen, mindre oppfølgingsøkt.
- **PII-håndtering er uendret** — `hentLydSamtykkeKart` gater fortsatt
  Start-knappen per spiller uten GITT lydsamtykke, serveren avviser uansett.
  Ingen forretningslogikk rørt.

### Pensjonering (§5T, D-LYS-OG-5T-BESLUTNING.md rad 11/12/32 — «JA» 27.08.2026)

`(legacy)/live/[sessionId]/active`, `/brief` og `/summary` er nå tynne
`redirect()`-sider til `/admin/agencyos/live/[sessionId]`. Slettet:
`AdminLiveActiveV2.tsx`, `AdminLiveBriefV2.tsx`, `AdminLiveSummaryV2.tsx`,
tilhørende `actions.ts`-filer, og `_live-melding.tsx` (coach-melding-i-
sanntid). Verifisert før sletting: ingen aktive lenker i koden pekte inn på
disse tre rutene (`grep` mot `href`/`router.push`/`redirect` — treff fantes
kun i `OktArkV2.tsx`, men de peker på `/admin/live/...` uten `agencyos`-
prefiks, en rute som **aldri har eksistert** i dette repoet — allerede
dødt før denne økten, urørt her, ikke T9-scope).

**Funksjonalitet som IKKE er videreført** (var reell, unik funksjonalitet på de
pensjonerte sidene — ikke bare duplikat):
- `brief`: coach kunne legge til et fokuspunkt spilleren så før økt.
- `summary`: coach kunne vurdere øktkvalitet og lagre observasjoner til
  spillerprofilen.
- `active`: coach kunne sende en rask melding til spilleren mens økta pågikk
  (`sendLiveMelding`).

Ingen av disse har erstatning i den nye AG-09-flaten ennå — fasiten
(AG-09/AG-09b) har ingen av dem heller, så det er ikke et avvik mot Train-lock,
men det ER et tap av reell coach-funksjonalitet fra før. Flagg for Anders om
noen av de tre skal bygges inn igjen et sted.

## Verifikasjon

`npm run verify` (prisma validate + generate, `tsc --noEmit`, eslint, interne
sjekk-script, `next build`) kjørt grønt mot dummy DB-env i skallet (cloud-økt,
ingen ekte DB tilgjengelig her — jf. gotchas §«Aldri kopier .env inn i en
worktree»). Ikke browser-verifisert i dette miljøet (ingen kjørende dev-server
mot ekte data) — skjermbilder må tas via Vercel PR-preview, se gate under.

## Ikke i scope / bevisst utelatt

- `RecordingControls`/`RecordingAnalyzeButton` — se over.
- AG-09s «Stille»/«I kø»/«Ledige plasser» — ingen ekte data.
- Pre-/post-økt coach-notater (fokuspunkt, vurdering, sanntidsmelding) fra de
  pensjonerte legacy-sidene.
- TM-06s desktop-only ni-kolonners tabell (forenklet til ett radformat).
- Booking, Google-synk, C-radene og player-flatene — urørt, som instruert.

## Skjermbilde-gate (ufravikelig — CLAUDE.md §Skjermarbeid)

Ingen av disse rutene merges før Anders har SETT dem: 390px + 1280px, lys OG
mørk, via Vercel PR-preview.
- `/admin/agencyos/live` (tom + med økter i gang)
- `/admin/agencyos/live/[sessionId]`
- `/admin/trackman` (tom + med data)
- `/admin/trackman/[sessionId]`
- `/admin/recording`
