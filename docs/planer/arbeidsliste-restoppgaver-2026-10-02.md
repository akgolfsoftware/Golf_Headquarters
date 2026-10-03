# Aktiv arbeidsliste — resterende oppgaver

Sist oppdatert: 2026-10-02 på grenen `grok/ph06-slagteller`. Utgangspunkt er `main` `ad5761e`.
Statusgrunnlag: direkte avlesning av aktive Codex-økter, GitHub-PR-er, lokale
arbeidskopier, fersk ruteinventar, [lanseringsplanen](lanseringsplan-2026-10-01.md),
[fullføringsplanen](codex-fullforing-claude-design-2026-09-30.md),
[designautoriteten](../design-system/design-autoritet.md) og relevante kontrollrapporter.

Dette er en utføringsliste, ikke en ny produkt- eller designfasit. Produktregler, beslutninger og valgt designversjon vinner ved konflikt. En oppgave kan først markeres ferdig når funksjon, lagring, tilgang, relevante feiltilstander, testbevis og visuell vurdering er dokumentert hver for seg.

Dette er den avsluttende statuskontrollen etter at de pågående leveransene i denne samlingen er merget. Nye resultater fra videre revisjoner skal føres inn som en ny, kildekontrollert oppdatering.

Detaljert gjennomføringsplan: [portering av alle skjermer](portering-alle-skjermer-2026-10-02.md).

## Statusnøkler

- **PÅGÅR** — aktiv økt arbeider med oppgaven.
- **VENTER KONTROLL** — kode eller dokumentasjon finnes, men kontrollen er ikke ferdig.
- **ÅPEN** — ikke startet eller ikke tildelt.
- **BLOKKERT** — krever en konkret ekstern avklaring før videre arbeid.
- **FERDIG DEL** — avgrenset del er levert; større leveranse gjenstår.

## Samlet status fra de andre øktene

| ID | Prioritet | Status | Resterende arbeid | Eier / ferdigbevis |
|---|---|---|---|---|
| C01 | P0 | FERDIG DEL | **Player App V1 SG:** PR #1088 og indeksoppfølging #1097 er merget. Seks additive tabeller har RLS, appen leser det publiserte settet med 333 SG-punkter, og lokal kontroll, CI, Vercel og produksjonsrøyk er grønne. Gjenstår: komplett mobil/statistikkreise, korrekte kildedata for flere kategorier og dokumentert DataGolf-lisens før sammenligninger vises. | Statistikkøkten. Handover: `~/Documents/Claude/akgolf-hq/codex-handover/statistikk-sg.md`. |
| C02 | P0 | FERDIG DEL | **Workbench:** PR #1099 er merget som `8d74ae1d` med kollisjonskart, samtidighetsvern, gruppeøkter og private samlingsinvitasjoner. Lokal fullkontroll, PR-CI, hoved-CI, Vercel-produksjon, helse og produksjonsrøyktest bestod. | Workbench-arbeidskopien er ryddet. Gjenstår som større leveranse: visuell appkontroll mot godkjent Precision-design, komplett Excel-paritet og de øvrige skjerm-/reiseoppgavene i D01–D04. |
| C03 | P0 | PÅGÅR | **Testbatteri:** PR #1111 er merget (`7cab6313e1`), regresjonsdekningen for flerskole-testdag ble merget i PR #1113 (`c4f28a3c`), og visuell godkjenning er registrert i PR #1120 (`a747a3f1`). Samlet leveranse har grønn lokal/GitHub/Vercel-kontroll, 4 372 kildetester, 103 komponenttester og produksjonsbygg. | Gjenstår før sluttgodkjenning: faktisk privat Storage-objekt, innlogget visuell kontroll på 390 px/desktop mot Precision-fasiten og kontroll av liveoppdatering mellom enheter. |
| C04 | P0 | FERDIG DEL | **Portering av alle skjermer:** registeret er merget i PR #1125 (527 sidefiler). PH-10, PH-02, PH-03, PH-04 brief, PH-05 aktiv Live og PH-06 slagteller er portet til Precision. Oppsummering ligger i egen PR. Ingen rad er kontrollert i appen. | Åpne Precision-PR-er bulk-merges ikke. Neste familie er oppsummering (PH-07). |
| C05 | P0 | PÅGÅR | **WANG/TN og IUP/Excel:** PR #1109, #1112, #1115 og revisjonen av offentlige spillerkoblinger i #1118 er merget (`49dcc5459`, `4cba5bec0`, `30ee79fac`, `57b67bf8`). PR #1121 (`ad5d8c2f`) forklarer automatisk WANG-testdeling med Team Norway separat fra frivillig deling; kontrollmatrisen ble dokumentert i #1123 (`1e927622d`). Den separate IUP-feltparitetsrevisjonen har fortsatt ingen egen diff eller PR. | Gjenstår: fullføre IUP-feltparitetsrevisjonen, komplett felt- og beregningsparitet fra app til trener, visuell sluttkontroll av trener-/spillerreisene og dokumentert DataGolf-bruksrett. |

## Ferdig og allerede på `main`

- PR #1039: e-postmalredigering og kontrollert testsending.
- PR #1088 og #1097: Player App V1 SG og indeksoppfølging.
- PR #1098: trenerforslag med spillergodkjenning.
- PR #1099: Workbench-planlegging, gruppeøkter og private samlingsinvitasjoner
  (`8d74ae1d`).
- PR #1100: samling/Workbench-status og dokumentert restomfang.
- PR #1101: stopp automatisk spillerkobling basert bare på navn.
- PR #1102: WANG-turneringshistorikk innenfor delingskontrollert transaksjon
  (`1e4c2f919`).
- PR #1104: leverte IUP-svar i WANG- og Team Norway-trenerprofilene
  (`63242f9e3`).
- PR #1105: verifisert leveransestatus og gjennomføringsjournal for WANG/Team Norway
  (`2df6e137b`).
- PR #1107: IUP 2027-felt- og formelregister uten spillerdata
  (`7413ce739`).
- PR #1108: korrigert siste statuskutt for arbeidslisten
  (`6a5a1b13b`).
- PR #1109: IUP-fokusområder krever elevgodkjenning
  (`49dcc5459`).
- PR #1111: Team Norway-testbatteri med scorekort, felles testdag og tilgangskontroller
  (`7cab6313e1`).
- PR #1112: dokumentert sluttstatus for WANG IUP-godkjenningsflyt
  (`4cba5bec0`).
- PR #1113: regresjonsdekning for flerskole-testdag
  (`c4f28a3c`).
- PR #1115: verifisert at turneringsresultater når koblede profiler
  (`30ee79fac`).
- PR #1116: siste korrigering av restarbeidslisten etter regresjonsmergen
  (`86d07c7ab`).
- PR #1118: dokumentert opphav og identitetsgrense for offentlige spillerkoblinger
  (`57b67bf8`).
- PR #1120: registrert visuell godkjenning av testbatteriet
  (`a747a3f1`).
- PR #1121: forklart automatisk WANG-testdeling separat fra frivillig deling
  (`ad5d8c2fb`).
- PR #1123: dokumentert WANG/TN-kontroll etter #1121
  (`1e927622d`).
- PR #1110: tidsstemplet restarbeidsliste og kontrollert arbeidskopioversikt
  (`cf257bb78e`).

Disse skal ikke åpnes som restoppgaver igjen. Nytt arbeid skal bygge på dagens `main` og
beholde begrensningene som er dokumentert i de respektive PR-ene.

## Designportering som fortsatt mangler

| ID | Prioritet | Status | Resterende arbeid | Ferdigkriterium |
|---|---|---|---|---|
| D01 | P0 | FERDIG DEL | **Skjermregister:** merget i PR #1125. 527 sidefiler har rad, forklaring og eier. PH-01, PH-02, PH-03, PH-04 brief, PH-05 aktiv Live, PH-06 slagteller og PH-10 er merket `precision-visning` der siden monterer komponenten. Oppsummering og Workbench-listene er fortsatt `ikke-verifisert` i denne grenen. Ingen rad er `kontrollert-i-app`. | Gjenstår før D01 kan lukkes: resten av rutevis portering, ekte data og handlinger, kontroll på 390 px og desktop, og avvik mot appen. Overlegg er krav, ikke funn. |
| D02 | P0 | ÅPEN | **Precision-reiser:** portér I dag → Plan → økt → Live → oppsummering/analyse, samt coachens plan → publisering → spiller. Bevar alle eksisterende modeller, eierskap og lagring. | Samme økt-ID, status, tall og eier gjennom hele reisen; kontroll på 390 px og desktop, lyst tema og natt der avtalt. |
| D03 | P1 | ÅPEN | **WANG-skjermene:** bruk WANGs egne 59-skjermsregister som kilde. Koble hver skjerm til rute, rolle, deling, tom/lastende/feil/fullført og mobil/desktop. | Ingen WANG-skjerm står kun som prototype; hver rad har appreferanse, kontrollbevis og visuelt avvik. |
| D04 | P1 | ÅPEN | **Team Norway-skjermene:** bruk TN-00–TN-27 og de 34 dyp-lenkene som funksjonsinventar, med Team Norway-profilen separat fra Precision og WANG. | Rolle-/gruppe-/samtykkegrense er prøvd per reise, og hver skjerm er vurdert i riktig TN-designspråk. |
| D05 | P0 | FERDIG DEL | **Designoverlevering og visuell godkjenning:** Anders har bekreftet at alle Precision-skjermer er visuelt godkjent. Gjenstående er å holde eksport, manifest, ressurser, skjermregister og teknisk avviksregister samordnet med porteringen. | Anders' visuelle godkjenning er registrert; designstatus, teknisk status og vurdering holdes som separate felter. |

## Funksjon, sikkerhet og integrasjoner

| ID | Prioritet | Status | Resterende arbeid | Ferdigkriterium |
|---|---|---|---|---|
| F01 | P0 | ÅPEN | **Sammenhengende treningskjede:** teknisk resultat, FYS-dose, gruppepublisering, offline/gjenopptakelse, samtidige redigeringer og detaljanalyse per øvelse. | Trener → publisering → spiller → Live → oppsummering → Analyse fungerer med korrekt kilde, revisjon, enhet og tilgang. |
| F02 | P0 | ÅPEN | **Booking, betaling og abonnement:** abonnementsfornyelse, mislykket betaling, oppsigelse, delvis/ekstern refusjon, gjentatte webhooker, e-postleveranse og kollisjonsreiser. | Syntetisk end-to-end-kontroll i testmodus, med idempotens, varig kø og korrekt saldo/status. Ingen ekte kunde eller betaling. |
| F03 | P0 | ÅPEN | **Konto og personvern:** ekte innlogging/gjenopprettingslenke, foresattgodkjenning, deling/tilbaketrekking, komplett eksport og ekstern sletting i Auth, Storage, Stripe og profilkoblinger. | Tillatte og avviste eiere er prøvd på serveren; mindreårige stoppes riktig; sletting og gjenforsøk er sporbare. |
| F04 | P0 | ÅPEN | **Tilgang og RLS:** fil-for-fil-kontroll av coach-/gruppeomfang, ekstern leser, WANG/TN og alle serverhandlinger som tar spiller-ID. | Ingen fremmed lesing/skriving i syntetisk lokal DB- og nettlesertest; RLS og faktisk DB-tilkobling er dokumentert. |
| F05 | P1 | ÅPEN | **Filer og eksterne integrasjoner:** Storage/video/lyd, kalender, e-post, varsler, resultatimport, separat ME-database og offentlig bookinginngang. | Format, størrelse, utløp, gjentakelse, feil og tilgang er prøvd uten PII i logger, AI eller Git. |
| F06 | P1 | ÅPEN | **DataGolf og WANG/NGF:** WANG- og NGF-rettighetene er avklart av Anders. Gjenstående arbeid er å dokumentere beslutningen, koble den til testdeling og avklare eventuelle DataGolf-begrensninger før sammenligninger aktiveres. | Rettighetsgrunnlag og produktregel er lagret; WANG/NGF-reglene er prøvd i relevante roller; DataGolf-visning følger avklart lisens og kildebegrensning. |

## Kvalitetsport og lansering

| ID | Prioritet | Status | Resterende arbeid | Ferdigkriterium |
|---|---|---|---|---|
| Q01 | P0 | ÅPEN | **Samlet kvalitetskontroll:** full npm run verify, innloggede nettleserreiser, tastatur, kontrast, mobil, ytelse, avhengighetsvarsler og kritiske nettfeil på samme kodeversjon. | Ingen kritiske feil eller ubegrunnede utelatelser; kontrollrapporten peker til eksakt commit. |
| Q02 | P0 | ÅPEN | **Drift og gjenoppretting:** produksjonsrøyktest, backup/restore i separat miljø, overvåking, feilvarsler, deploy og tilbakeføring. | Publiseringsvei og tilbakeføring er prøvd og dokumentert; ingen hemmeligheter eller produksjonsdata i kontrollfiler. |
| Q03 | P0 | ÅPEN | **Pilot:** aktiver syntetiske/pilotkontoer, e-post, coach-/spiller-/foreldrerolle og samtykke. | Avtalte pilotreiser fungerer uten at ekte invitasjon, betaling eller persondata brukes uautorisert. |
| Q04 | P0 | ÅPEN | **Lanseringspakke:** samle kodeversjon, designversjoner, datasteg, tilgangsregler, driftsansvar, kjente avvik og tilbakeføringsplan. | Anders kan ta et informert lanseringsvedtak; ingen P0-punkt står uklart. |
| Q05 | P1 | PÅGÅR | **Worktree- og PR-rydding:** nyere merget arbeid er skilt fra aktive arbeidskopier. Rene, integrerte kopier fjernes; kopier med umergede commits, ucommittede filer eller aktiv økt beholdes. De eldre åpne Precision-PR-ene må samordnes/avsluttes enkeltvis mot dagens design og `main`; grønn gammel CI er ikke mergebevis. | Ingen arbeidskopi slettes før diff, private ressurser og neste steg er dokumentert. Ingen gammel PR bulk-merges. |

## Arbeidskopier som skal beholdes

| Arbeidskopi | Hvorfor den ikke kan slettes nå |
|---|---|
| hovedkopien `main` | Inneholder denne arbeidslisten, porteringsplanen og separate lokale `.claude`-endringer som skal bevares. |
| `akgolf-hq-teknisk-fys-resultat` | Har umerget commit `010cc0053` for tekniske og fysiske resultater. |
| `codex-ak-sg-runtime` | Har åpen utkast-PR #1083 og omfattende staged/unstaged arbeid; må først deles og samordnes. |
| `codex-lokal-brukertest` | Koden fra #1039 er merget, men arbeidskopien har usporede kontrollfiler og en plan som må vurderes før sletting. |
| `codex-workbench-ux-plan` | Har fire usporede plan-/designleveranser som ikke er lagret i Git. |
| `precision-athletics-konsolidering` | Har et stort, ucommittet design- og kontrollarkiv; sletting uten separat arkivering vil gi datatap. |

Rene arbeidskopier for ferdigmergede leveranser kan fjernes etter kontroll av at PR-en er på
`main`. Denne listen skal oppdateres med faktisk slettet sti og merge-commit etter ryddingen.

Ryddet 02.10.2026:

- `wang-tn-profiltilgang` ble fjernet etter merge av PR #1102.
- `wang-tn-samling-workbench` ble kontrollert ren og fjernet etter merge av PR #1100.
- `workbench-restfullforing` ble fjernet etter merge og produksjonskontroll av PR #1099.
- `wang-tn-iup-profile` ble fjernet etter merge og produksjonskontroll av PR #1104.
- `wang-tn-merge-report` ble fjernet etter merge av journaloppfølgingen i PR #1105.
- `codex-wang-tn-profiltilgang-continue` ble fjernet automatisk etter merge av PR #1107.
- `codex-wang-iup-approval-proposal-2026-10-02` ble fjernet etter merge av PR #1109.
- `wang-iup-outcome-docs` ble fjernet etter merge av PR #1112.
- `wang-test-share-disclosure-ui` ble fjernet etter merge av PR #1121.
- `testbatteri-visual-approval` ble fjernet etter merge av PR #1120.
- `wang-iup-parity-followup` ble fjernet etter merge av PR #1123.
- `iup-field-parity-audit` ble fjernet da økten ble arkivert uten egen diff eller PR.
- `git worktree prune` ble kjørt. De seks arbeidskopiene i tabellen over er bevisst beholdt.

## Rekkefølge

1. Fullfør C03 og C05 uten å starte konkurrerende varianter; bruk C01, C02 og C04 som ferdig grunnlag.
2. Lukk D01–D05 reisevis, med Precision som autoritet og egne WANG/TN-profiler.
3. Lukk F01–F06, særlig booking/personvern/tilgang før bred pilot.
4. Kjør Q01–Q05 på én fast kodeversjon.
5. Anders vurderer pilot og lansering.

## Bevisgrenser

- En prototype er ikke appkode.
- En grønn enhetstest er ikke en visuell godkjenning.
- En rute i inventaret er ikke en ferdig brukerreise.
- En lokal betalings- eller e-posttest er ikke produksjonsleveranse.
- En plan eller handover er ikke ferdig funksjon.

Alle oppgaver skal oppdateres med faktisk kodeversjon, designversjon, eier, testbevis, åpne avvik og neste konkrete kommando.
