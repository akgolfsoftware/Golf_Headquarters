# C3 — Kalender-lag (uten Google) — DONE (27.08.2026)

Gren: `claude/c3-kalender-lag-workbench-42j1dv`. Loop 7 i
`OVERNIGHT-CODING-LOOP-BOLGE2.md`, rad C3 i `LAUNCH-PLAN-FULL-2026-08-25.md`.

## Levert

**Domain (rent, testet):**
- `src/lib/domain/kalender-lag.ts` — `KalenderLag`-typen (OEKTER/SKOLE/
  TURNERING/TESTER/BOOKING), `KalenderHendelse`, `synlige()`/`sorterDag()`/
  `grupperPerDato()`/`klokkeslett()`.
- `src/lib/domain/kalender-rom-kollisjon.ts` — KA-05: `romKollisjoner()`,
  samme mønster som `kalender-belegg.ts`s `kollisjoner()` (coachen der,
  fasiliteten her, er ressursen). Kun fasiliteter med kapasitet 1 sjekkes —
  delte flater (kapasitet > 1) er per definisjon overbookbare, ikke en
  kollisjon.
- 17 nye enhetstester (`*.test.ts` ved siden av hver fil), alle grønne.

**AgencyOS — ny egen flate `/admin/kalender/lag` (KA-01/AG-11/KA-05):**
- `src/app/admin/kalender/lag/data.ts` — leser WorkbenchSession (økter),
  SchoolScheduleEntry (skole), TournamentEntry+Tournament (turnering),
  TestAssignment (tester) og Booking (booking) for uka, slår sammen til
  `KalenderHendelse[]` og regner romkollisjoner fra bookinger med
  `facilityId`.
- `src/components/admin/v2/kalender/KalenderLagUkeV2.tsx` — lag-sidebar med
  øye-toggle (desktop) / lag-chips + dagvelger (mobil), 7-dagers liste-grid,
  inspektørpanel (hendelse-detalj ELLER KA-05-kollisjonsvisning: «× navn,
  tid · lag», «Bytt tid»-CTA). Kun `TL.*`.
- Ny «Lag»-fane i `KALENDER_HUB_TABS` (`agency-hub-subnav.tsx`), ved siden
  av eksisterende «Uke» (booking-kalenderen, urørt).

**PlayerHQ — KA-04 «I dag i tiden»:**
- `src/lib/kalender-lag/player-dag.ts` — `hentSpillerDagITiden()`: samme
  fem lag for én spiller én dag. Økter kun PUBLISHED/IN_PROGRESS/COMPLETED
  (invariant 3 — aldri DRAFT). Skole matches på spillerens `schoolYear`
  (VG1/VG2/VG3) eller `classYear: null` (gjelder alle trinn).
- `src/components/portal/v2/kalender/IDagITidenArk.tsx` — selvstendig
  TL-bunnark (scrim + fokus-felle + Escape + scroll-lås, egen implementasjon
  fordi delt `BunnArk` er bygget på `T`-tokens og invariant 2 forbyr å
  blande T/TL på samme flate — arket er en isolert overlay).
- Ny knapp (klokke-ikon) i `PortalChatHjem`-headeren åpner arket. Data
  forhåndslastes i `app/portal/page.tsx` sammen med resten av «I dag».
  Ingen ny kalender-fane — kun inngangen fasiten spesifiserer.

## Anti-scope overholdt

- **`google-calendar-*`-filene er IKKE rørt** (0 endringer i `git diff`).
  Ingen Google-API kalt noe sted i de nye filene. Google er bevisst utelatt
  som lag — dokumentert i filhodet til `kalender-lag.ts` og `data.ts`.
- **Stall-visningen er ikke rørt** (C2 bygger parallelt — ingen filer i
  `StallV2`/`stall`-området er endret).
- **`wb-actions.ts`, `operations.ts`, `WeekGrid.tsx`, `AgencyKalenderV2.tsx`
  er ikke rørt.** Kalender-lag er en helt ny, disjunkt flate med egne
  prisma-spørringer (les-only) — ikke en utvidelse av `loadWeek`s tomme
  `lockedBlocks`-parameter. Valgt bevisst for å holde diffen kirurgisk og
  unngå kollisjon med annet arbeid på samme filer.
- Booking-admin-flyten er kun LEST fra (ingen skriving, ingen endring av
  `booking-actions.ts`).

## Verifikasjon

- `npx tsc --noEmit` — grønn, 0 feil (hele repoet).
- `npx eslint --max-warnings 0` på alle nye/endrede filer — grønn.
- `npm test` — **1719/1719 grønn**, 0 feil (inkl. de 17 nye).
- `npm run build` — grønn, `/admin/kalender/lag` i rute-lista, ingen
  advarsler fra nye filer.
- Pre-commit hook (husky · lint-staged: eslint + tsc) — grønn.
- `npm run verify` sine øvrige steg (`prisma validate/generate`,
  `check-action-auth`, `check-token-gap`, `check-critical-imports`,
  `check-doc-lenker`) — alle grønne.

**Skjermbilde-gate: IKKE gjort i denne økten.** Denne cloud-sesjonen har
ingen ekte databasetilkobling (`DIRECT_URL`/`DATABASE_URL` var dummy-verdier
kun brukt for `prisma generate`, aldri skrevet til fil — jf. gotchas.md) og
dermed ingen mulighet til å starte dev-server mot ekte data eller ta
skjermbilder selv. Verifikasjonen over dekker typer/lint/tester/bygg — IKKE
layout, farger eller faktisk gjengitt UI. Gjenstår før merge (CLAUDE.md
§Skjermbilde-gate, fast regel): mobil 390px + desktop 1280px, lys og mørk,
av `/admin/kalender/lag` og av «I dag i tiden»-arket på `/portal`, via
Vercel PR-preview med innlogget testbruker — Anders må ha SETT skjermene
før merge.

## Dokumenterte avvik / forenklinger

1. **Ukegrid er en kronologisk stablet dag-liste, ikke fasitens
   pikselnøyaktige tidsakse.** KA-01/KA-05-fasiten posisjonerer hendelser
   absolutt på en 07–21-tidsakse. Jeg porter oppførsel og hierarki (CLAUDE.md
   §Design: «Port HTML 1:1: nei»), ikke fasitens rå CSS — risikoen ved å
   gjenskape pikselmatte for et helt nytt datasett (variabel varighet,
   overlapp) var uforholdsmessig høy for denne loopen. Tid, lag, tittel og
   kollisjonsmerking er alle synlige og korrekte.
2. **Mobil dagvisning er en stablet agenda, ikke AG-11s side-om-side-
   overlapp.** Samme begrunnelse — enklere, samme informasjon.
3. **SKOLE vises som heldags-hendelse, ikke KA-01s «dimmet bakgrunnsvask»
   over et gjettet klokkeslett-spenn.** `SchoolScheduleEntry` har kun
   `date` (ingen start/slutt-tid) — å oppfinne et tidsspenn ville vært
   fabrikkert data. Samme for turnering og tester (ingen tidskomponent i
   `TournamentEntry`/`TestAssignment.dueDate` som er meningsfull å vise som
   klokkeslett).
4. **KA-05 romkollisjon er skopet til `Booking.facilityId`.**
   `WorkbenchSession.location` er fritekst, ikke koblet til `Facility` —
   å fuzzy-matche tekst mot fasilitetsnavn ble vurdert og forkastet (risiko
   for falske kollisjoner). Dokumentert i filhodet til
   `kalender-rom-kollisjon.ts`.
5. **KA-04 har ingen «ANNET»-kategori** (fasiten viser «Lunsj med laget» som
   eksempel). Ingen datakilde for frittstående personlige avtaler finnes i
   domenet — kun de fem lagene appen faktisk har.
6. **AgencyOS Kalender-lag er agency-bred** (alle coachers data), samme
   omfang som eksisterende `/admin/kalender` (`hentAgencyKalenderData`) —
   ikke filtrert til «coachens egne spillere». Konsistent med etablert
   mønster, ingen ny tilgangsmodell oppfunnet.

## Neste steg (ikke denne jobben)

- **T7 — Kalender + booking-lag** (per LAUNCH-PLAN-FULL rad-tabellen) er
  planlagt etter denne PR-en er merget: fullt Train-lock-skjermbilde-pass
  + eventuell pikselnøyaktig tidsakse hvis Anders vil ha det.
- Skjermbilde-gate (over) må gjøres av en økt med Vercel-preview-tilgang
  før merge.
