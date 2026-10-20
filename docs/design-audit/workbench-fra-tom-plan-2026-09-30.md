# Workbench fra tom plan — kildekontroll 30.09.2026

Bestilling fra Anders: komplett planlegging fra scratch i Claude Design, parallelt med designkonsolideringen. Årsplan → periodisering → måned → uke → økt, med antall økter FYS/TEK/SLAG/SPILL/TURN, teknisk plan og turneringskalender. Undersøkelsen endrer ingen app eller database. Codex brukte to parallelle leseoppgaver etter Anders' uttrykkelige bestilling.

## Undersøkte versjoner

- Design: privat Precision-eksport 17:54, 574 filer, ZIP-SHA `2a09920ca168a5fd77fcfb58a5820b7c6fe1143a4a4f1356357dcf95f2b13f97`.
- Opprinnelig appanalyse: arbeidskopiens Git `110b4ec8f7d960fd1748b8f87babebde80cd764b`.
- Nyere hovedcheckout: observert `4b55352`, undersøkt separat. Andre jobber har endret appen under designøkten. Historiske kodebindinger er ikke påstand om dagens tilgjengelige handlinger.
- Gjeldende språk/planleggingsmaster ble kontrollert i hovedcheckout: `docs/treningsplanlegging.md`, særlig 5–10 og 14.3. Ny master har åtte periodetyper og ingen ny Restitusjon-periodetype. Bevar gamle registreringer som historikk; ikke slett data eller viderefør gammel type som ny standard.

## Designhull med konkrete kilder

| Område | Kilde i eksporten | Funn |
|---|---|---|
| Årsplan | `ui_kits/_shared/WB3-ar.jsx:204–228` | Veileder og Tom plan finnes. Standardplan indeks0 blir falsk; maler kopierer samme eksempelperioder; planvelger/multiple plan-ID-er mangler. |
| Periode | `ui_kits/_shared/WB3-ar.jsx:83,232–246` | Ingen antall økter; skjult 3/2/4/1/0-timersforslag; kalenderdato normaliseres; ingen kontroll av årsplanramme eller periodemål. |
| Måned | `ui_kits/_shared/WB3-ar.jsx:150–182,251–265` | Timer finnes, men ikke øktantall eller videre plassering. Turneringer er teksttupler og nye mål vises ikke i gammel statisk målvelger. |
| Uke | `ui_kits/_shared/WB3.jsx:28–58,125–145`; `WB3-ar.jsx:108` | Bare demouke40/41. Andre uker åpner måned. Ny økt med alle felt og budsjett/plassert/gjenstår mangler. |
| Økt | `ui_kits/_shared/WB3.jsx:20,62,146–150` | Ett globalt øvelsesarray og fast tittel/dato, uten valgt sessionId. |
| Mal/teknisk oppgave | `ui_kits/_shared/WB3.jsx:86,88` | Plusser viser bare melding. Teknisk plan/dato/måløkt må velges og taskId/revisjon bevares. |
| TURN | `ui_kits/_shared/WB3.jsx:87`; `agencyos/screens/AG-WB-TURN.jsx:82–85` | Statiske rader; ny turnering ignorerer skjemavalg. Kalender-ID/dato/runder mangler gjennom hele planleggingsrekken. |
| FYS | `ui_kits/_shared/WB3.jsx:85` | Meldingen sier tirsdag og torsdag, men én tirsdagsøkt opprettes. Program-/dagsvalg og kilde-ID mangler. |
| Serie/kopi/scoping | `ui_kits/_shared/WB3.jsx:26,30,96–98,141–142` | Spillerbytte endrer etikett, ikke datascope; gjentakelsesdager/slutt og endring framover virker ikke fullt; ukekopi og utrulling er meldinger/tomme handlinger. |

## Appgrunnlag og byggegap

| Felt/flyt | Kilde i 110b4ec8 | Begrensning |
|---|---|---|
| Årsplan | `src/lib/workbench/periode-core.ts:36–62` | SeasonPlan opprettes automatisk ved første periode, kalenderåret jan–des. Selvstendig navn/år/sesong-oppretting trenger konkret skrivehandling. |
| Periodebudsjett | `src/lib/workbench/perioder.ts:11–23`; `src/components/portal/v2/WorkbenchAarsplan.tsx:469–496` | weeklySessionBudget fem antallsmål finnes. 0 fjernes i editor, så valgt0 og ikke satt blandes. Budsjett skaper ingen økter automatisk. |
| Årsmodell | `src/lib/workbench/wb-actions.ts:784–791` | loadYear fører ikke weeklySessionBudget/weeklyVolMin/Max inn i modellen. |
| Ukeplan | `src/lib/workbench/wb-actions.ts:360–438` | Fem plannedHours-felt og repTarget, uten fem øktantall eller arv/overstyring fra periode. |
| Teknisk oppgave | `src/components/portal/v2/WorkbenchV2.tsx:2807–2841`; `src/lib/workbench/wb-actions.ts:1246–1285` | Oppgave-ID/restreps kan føres inn. Ingen bevist omregning fra reps til antall TEK-økter. |
| Turnering | `src/lib/workbench/load-workbench.ts:1030–1042`; `src/lib/workbench/fys-turnering-actions.ts:25–34,317–360` | Kalender mister TournamentEntry.id/sluttdato; dialog sender ikke tournamentEntryId. Tidligere action lager én runde per dag, ikke valgt antall runder. |
| Publisering | `src/lib/workbench/wb-actions.ts:1412`; `src/lib/workbench/fys-turnering-actions.ts:154,364` | Tre publiseringsomfang; ingen generell «publiseralt» kan antas. |

Kildelinjene angir den undersøkte versjonen. Før bygging skal Grok kontrollere filenes eksakte plassering, hash, montert flate og handling på valgt ny kodeversjon.

### Endringer i nyere 4b55352

Ny coachflate monterer WorkbenchShell/WorkbenchUke. AG11Workbench/AG11Moduler og useUkeMotor er fjernet; også egne fys-turnering-actions/data/kontrakt og wb-session-write/wb-drill-write er fjernet. De skal ikke gjeninnføres automatisk fordi denne historiske analysen nevner dem. Periodekjerne/weeklySessionBudget og portalens periodeeditor finnes fortsatt. Kalenderens tap av TournamentEntry.id består (`load-workbench.ts:932–944`). Ny master har fjernet Restitusjon som periodetype.

## Designkrav for ny kandidat

1. Behold én Workbench. Stabil valgt spiller/gruppe, planId, periodId, måned, uke med år/dato og sessionId gjennom alle nivåer.
2. Tom plan skal være tom. Opprett årsplan, periode og måned/uke med brukerens felter; merk alle forslag som forslag.
3. Antall økter, tid, repetisjoner, turneringer og runder vises separat. Budsjett er mål, ikke allerede plasserte eller gjennomførte økter. Ingen oppdiktet norm eller automatisk timer→økter/reps→økter.
4. Alle uker i sesongen kan åpnes. Ny økt og kalendertrykk åpner samme øktoppretting; bank, mal, teknisk oppgave og program legges i valgt sessionId.
5. Turnering fra kalender beholder tournamentEntryId, fra/til, bane og valgte runder. Manuell turnering bruker faktiske skjemavalg.
6. Reelle utkast, kopi, flytt, gjentakelse, feil, avbryt/angre og konkret publiseringsomfang. Coachutkast må ikke lekke til spillerens publiserte plan.
7. Samme funksjoner på mobil390 og desktop; eksakte kontroll-ID-er, mål og objektbindinger føres i knappkartet etter denne utvidelsen.

Dette er kildekontroll og designbestilling, ikke visuell godkjenning, fungerende app eller autorisasjon til app-/databaseendring.
