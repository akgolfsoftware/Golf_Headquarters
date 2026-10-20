# Workbench fra tom plan

Designbestilling 30.09.2026: årsplan → periodisering → måned → uke → økt, fra en tom plan. Precision Athletics er valgt designsystem. Dette dokumentet og [JSON-kontrakten](workbench-fra-tom-plan.json) beskriver **bestilt kandidat**, ikke ferdig tegnet, implementert eller godkjent funksjon.

## Kilde og versjon

[Kildekontrollen](../design-audit/workbench-fra-tom-plan-2026-09-30.md) viser eksisterende kontroller og konkrete hull i eksporten 17:54, SHA-256 `2a09920ca168a5fd77fcfb58a5820b7c6fe1143a4a4f1356357dcf95f2b13f97`. Kontrakten følger hovedcheckout `4b553524585f6eec26037930800f355e78caba89` sin språk-/planleggingsmaster, kontrollsum `c11bac7e6b6f27e07107f667cd560aea32039308e71b393e7944d97bf3605850`. Arbeidskopiens eldre master er ikke brukt som ny produktregel.

Alle åtte periodetyper beholdes: **Grunnperiode, Spesialperiode, Turneringsperiode, Evalueringsperiode, Testuke, Ferie, Treningssamling og Heldagssamling**. Ikke innfør Restitusjon som ny periodetype. Historiske registreringer slettes ikke.

Nyere appkode har fjernet eldre koblingspunkter fra analysen på `110b4ec8`. Grok må kontrollere gjeldende monterte kode og handlinger før bygging; ikke gjeninnfør gamle funksjonsfiler automatisk. Appadresse og kodebinding står derfor eksplisitt tomme i JSON. Designbestillingen autoriserer ingen app-/database-/tilgangs-/produksjonsendring.

## Reisen Anders skal kunne prøve

1. Velg spiller/gruppe og årsplan, eller opprett en **Tom plan** med eget navn og tidsrom. Tidligere årsplan bevares.
2. Legg til perioder med type, datoer, fokus, mål og selvvalgte **antall økter FYS/TEK/SLAG/SPILL/TURN**. Tid oppgis separat.
3. Planlegg valgt måned: se arv, juster per uke, koble mål og kalenderhendelser. Ingen opprettede økter skjules som budsjett.
4. Åpne en hvilken som helst konkret uke i sesongen. Se budsjett, plassert, gjenstår og over budsjett. Opprett en økt på valgt dato/tid.
5. Rediger økta: navn, varighet, dominerende pyramide, sted, øvelser og notat. Velg bank, øktmal, tekniske oppgaver eller fysisk program. Golfslag og spill bruker sine relevante felt.
6. Velg turneringer fra kalender eller legg inn manuelt; behold deltakelses-ID, datoer, bane og valgte runder. Planlegg datert forberedelse, spill og reise rundt turneringen.
7. Lagre utkast, flytt/kopier/gjenta og kontroller konkrete forekomster. Publiser bare eksplisitt valgt omfang til riktig mottaker.

[Egen WB1-mellomkontroll](../design-audit/workbench-wb1-mellomkontroll-2026-09-30.json) dokumenterer 15 konkrete funn i eksporten før WB2. Senere rettinger må kilde- og UI-kontrolleres på nytt; kontrolltall alene lukker ingen av disse funnene.

## Identitet, antall og arv

Valgt planId + subjectType/subjectId gjennom hele reisen. Et navn er ikke en ID.
weekStartDate + isoWeekYear + isoWeek; ISO-uke alene er ikke unik. monthKey=YYYY-MM. Dato/tid følger prosjektets eksisterende tidssone.
Stabil sessionId; et nytt ulagret utkast har sessionDraftId/draftId frem til bekreftet oppretting.
Øvelsesinstans er drillInstanceId med sourceExerciseId/taskId/revisjon/programkilde etter faktisk modell; ingen kildefelt gis automatisk nytt databaseskjema.
Ekstern calendarTournamentId, spillerens tournamentEntryId og turneringsrunde roundId skilles. Fra/til og rundedatoer beholdes.
Utkast/revisjon, lagret innhold og valgt publiseringsrevisjon skilles. Andre utkast omfattes ikke av én knapp.

- Budsjett antall økter er ikke plasserte eller gjennomførte økter.
- Hver kalenderøkt telles én gang på sin dominerende pyramide, selv med flere øvelser/akser.
- Tid totalt summeres én gang per kalenderøkt. Planlagt aksetid fordeles på dominerende pyramide; øvelsesmengde må vises separat og aldri dobbelttelle økttiden.
- Vis budsjettert, plassert, gjenstår og eventuelt over budsjett. Ukjent budsjett=null/—; valgt0 er faktisk0. Manglende gjennomføring er ikke automatisk0.
- Øvelser, repetisjoner, slag/putter, hull, turneringer og runder er egne størrelser. Ingen timer/reps→antall-økter-konvertering.
- En turneringsdeltakelse uten kalenderøkt-ID gir ikke automatisk ny TURN-økt. Koble konkrete runder/forberedelser til kalenderobjekter før øktelling.
- Avvik fra budsjettet er veiledende, aldri automatisk sperre eller publiseringsordre.

Arv: Velg kildeperiode eksplisitt når nødvendig → månedens ukebudsjett → denne ukas egne endringer. Vis kilde og valgt overstyring på hvert nivå.

Uke over flere perioder viser alle aktuelle perioder/datoer samt Eget ukebudsjett. Navigasjon fra periodId viderefører valgt grunnlag med synlig bytte; direkte ukeåpning uten entydig kilde åpner BUDSJETTGRUNNLAG. Ingen automatisk prioritet eller proratering.

Bruk arvet budsjett igjen forhåndsviser kilde og fjerner bare den valgte overstyringen; kalenderøkter slettes/flyttes ikke.

## Skjerm- og overleggsregister

ID-ene reserveres i eksisterende PH-11/AG-11-familie. Nye ID-er er bestilte registreringer. En eksisterende registrering betyr at flaten finnes i 17:54-kilden; den nye komplette oppgaven er fortsatt uverifisert. JSON inneholder begge rollenes eksakte ID-er og obligatoriske tilstander.

| Suffiks i PH-11 / AG-11 | Oppgave | Utgangspunkt |
|---|---|---|
| (grunnflate) | Workbench | Eksisterende registrering, bestilt utvidelse |
| -AR | Årsplan | Eksisterende registrering, bestilt utvidelse |
| -NY | Opprett årsplan · tre trinn | Eksisterende registrering, bestilt utvidelse |
| -PER | Periode | Eksisterende registrering, bestilt utvidelse |
| -PERSKJEMA | Ny eller rediger periode | Eksisterende registrering, bestilt utvidelse |
| -MND | Månedsplan | Eksisterende registrering, bestilt utvidelse |
| -MNDSKJEMA | Rediger månedsplan | Eksisterende registrering, bestilt utvidelse |
| -MAL | Mål på planleggingsnivå | Eksisterende registrering, bestilt utvidelse |
| -VOL | Volum og belastning | Eksisterende registrering, bestilt utvidelse |
| -PLANVALG | Velg årsplan | Bestilt ny flate |
| -PLANREDIGER | Rediger årsplanramme | Bestilt ny flate |
| -UKE | Valgt kalenderuke | Bestilt ny flate |
| -UKESKJEMA | Ukebudsjett | Bestilt ny flate |
| -OKT | Valgt økt og øvelser | AG-11-OKT finnes; PH-ID og valgt-økt-kobling bestilt |
| -OKTSKJEMA | Ny eller rediger økt | Bestilt ny flate |
| -BANK | Velg øvelser | Bestilt ny flate |
| -OVELSE | Ny eller rediger øvelse · åtte trinn | Bestilt ny flate |
| -MALVALG | Velg øktmal | Bestilt ny flate |
| -TPVALG | Velg tekniske oppgaver | Bestilt ny flate |
| -FYSVALG | Velg fysisk program og økter | Bestilt ny flate |
| -TURNKAL | Turneringskalender | Bestilt ny flate |
| -TURNDET | Valgt turnering | Bestilt ny flate |
| -TURNMANUELL | Manuell turnering | Bestilt ny flate |
| -TURNPLAN | Runder og forberedelse | Bestilt ny flate |
| -HENDELSE | Kalenderhendelse | Bestilt ny flate |
| -GJENTA | Gjentakelsesregel og forekomster | Bestilt ny flate |
| -SERIEOMFANG | Omfang ved serieendring | Bestilt ny flate |
| -KOPI | Kopi av økt eller uke | Bestilt ny flate |
| -FLYTT | Flytt økt | Bestilt ny flate |
| -KONFLIKT | Kontroller kalenderkonflikt | Bestilt ny flate |
| -PUB | Publiser valgte økter eller planrevisjon | Bestilt ny flate |
| -TREKK | Trekk tilbake valgt publisering | Bestilt ny flate |
| -MALSKJEMA | Opprett eller koble mål | Bestilt ny flate |
| -BUDSJETTGRUNNLAG | Velg periodegrunnlag eller eget ukebudsjett | Bestilt ny flate |
| -ULAGRET | Ulagrede endringer | Bestilt ny flate |
| -SLETT | Bekreft fjerning | Bestilt ny flate |

Ark vises som bunnark på mobil og dialog når det er plass. Datert uke/økt og turneringsoversikt er arbeidsflater, ikke nye parallelle planmotorer. Det samme skal kunne gjøres på mobil390 og desktop. Data, tomt, lasting, feil og avvist tilgang tegnes; redigering har i tillegg utkast, endret, lagrer og lagringsfeil.

## Knappkart – bestilt oppførsel

Hver rad under er en kontrollregel som JSON utvider til eksakt `ph-wb-*` og `ag-wb-*` ID og fra-skjermene for sin rolle. `—` som mål betyr den **konkrete handlingsregelen i JSON**, ikke et ukjent mål. Samme etikett på flere objekter beholder objektets ID. JSON beskriver også resultat, retur/avbryt, tilgang og feil per kontroll.

| Kontroll | Fra (suffiks) | Mål / handling | Nødvendig objektkontekst | Kildestatus | Retur / avbryt |
| --- | --- | --- | --- | --- | --- |
| `niveau` · År · Periode · Måned · Uke · Økt · Volum · Mål | grunnflate, -AR, -PER, -MND, -UKE, -OKT, -VOL, -MAL | Handlingsregel i JSON | subjectType, subjectId, planId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `velg-subjekt` · Velg spiller eller gruppe | grunnflate | Handlingsregel i JSON | subjectType, subjectId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `planvelger` · Velg årsplan | grunnflate, -AR | -PLANVALG | subjectType, subjectId, planId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `planvelg` · Åpne valgt årsplan | -PLANVALG | -AR | subjectType, subjectId, planId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ny-plan` · Opprett årsplan | grunnflate, -AR, -PLANVALG | -NY | subjectType, subjectId, planId, draftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `planutgangspunkt` · Tom plan / fjorår / standardplan / gruppeplan | -NY | Handlingsregel i JSON | subjectType, subjectId, planId, draftId, sourcePlanId, templateId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `plan-neste` · Neste | -NY | Handlingsregel i JSON | subjectType, subjectId, planId, draftId, wizardStep, startDate, endDate | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `plan-tilbake` · Tilbake | -NY | Handlingsregel i JSON | subjectType, subjectId, planId, draftId, wizardStep | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `plan-opprett` · Opprett årsplan | -NY | -AR | subjectType, subjectId, planId, draftId, startDate, endDate | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `planrediger` · Rediger årsplan | -AR | -PLANREDIGER | subjectType, subjectId, planId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `planramme-lagre` · Lagre årsplan | -PLANREDIGER | -AR | subjectType, subjectId, planId, draftId, startDate, endDate | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ny-periode` · Ny periode | -AR, -PER | -PERSKJEMA | subjectType, subjectId, planId, draftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `aperiode` · Åpne periode | -AR | -PER | subjectType, subjectId, planId, periodId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `per-forrigeneste` · Forrige / neste periode | -PER | Handlingsregel i JSON | subjectType, subjectId, planId, periodId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `per-rediger` · Rediger periode | -PER, -AR | -PERSKJEMA | subjectType, subjectId, planId, periodId, draftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `per-type` · Periodetype | -PERSKJEMA | Handlingsregel i JSON | subjectType, subjectId, planId, periodId, draftId, periodType | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `per-budsjett` · FYS · TEK · SLAG · SPILL · TURN: antall økter og tid per uke | -PERSKJEMA | Handlingsregel i JSON | subjectType, subjectId, planId, periodId, draftId, weeklySessionBudget, weeklyMinutesByAxis | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `per-lagre` · Lagre periode | -PERSKJEMA | -PER | subjectType, subjectId, planId, periodId, draftId, startDate, endDate | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `per-slett` · Slett periode | -PER, -PERSKJEMA | -SLETT | subjectType, subjectId, planId, periodId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `amnd` · Åpne måned | -AR, -PER | -MND | subjectType, subjectId, planId, monthKey | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `mnd-forrigeneste` · Forrige / neste måned | -MND | Handlingsregel i JSON | subjectType, subjectId, planId, monthKey | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `mnd-rediger` · Planlegg / rediger måned | -MND | -MNDSKJEMA | subjectType, subjectId, planId, monthKey, draftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `mnd-budsjett` · Antall økter og tid per uke | -MNDSKJEMA | Handlingsregel i JSON | subjectType, subjectId, planId, monthKey, draftId, weekStartDate, sourcePeriodId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `mnd-arv` · Bruk periodens budsjett igjen | -MNDSKJEMA | Handlingsregel i JSON | subjectType, subjectId, planId, monthKey, draftId, weekStartDate, sourcePeriodId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `mnd-lagre` · Lagre måned | -MNDSKJEMA | -MND | subjectType, subjectId, planId, monthKey, draftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `auke` · Åpne uke / Planlegg øktene | -PER, -MND | -UKE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `uke-dato` · Forrige uke / neste uke / velg dato | -UKE | Handlingsregel i JSON | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `ukebudsjett` · Rediger ukebudsjett | -UKE | -UKESKJEMA | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, draftId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ukebudsjett-lagre` · Lagre ukebudsjett | -UKESKJEMA | -UKE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, draftId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ukebudsjett-arv` · Bruk arvet budsjett igjen | -UKESKJEMA | Handlingsregel i JSON | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, draftId, budgetSourceId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `nyokt` · Ny økt / ledig klokkeslett / velg pyramide | -UKE | -OKTSKJEMA | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, draftId, date, startTime, dominantAxis | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `valgtokt` · Åpne valgt økt | -UKE | -OKT | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `okt-rediger` · Rediger økt | -OKT | -OKTSKJEMA | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, draftId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `okt-lagre` · Lagre utkast | -OKTSKJEMA | -OKT | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, draftId, date, startTime, durationMinutes, dominantAxis | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `bank` · Legg til øvelse fra banken | -OKT, -OKTSKJEMA | -BANK | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, sessionDraftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `bank-legg` · Legg valgte øvelser i økta | -BANK | -OKT | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, sessionDraftId, sourceExerciseIds | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `egen-ovelse` · Ny øvelse | -OKT, -BANK | -OVELSE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, drillDraftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `ovelse-rediger` · Rediger øvelse | -OKT | -OVELSE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, drillInstanceId, drillDraftId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ovelse-lagre` · Lagre øvelse | -OVELSE | -OKT | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, drillInstanceId, drillDraftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `ovelse-rekkefolge` · Flytt øvelse opp/ned / dra | -OKT | Handlingsregel i JSON | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, orderedDrillInstanceIds | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ovelse-fjern` · Fjern øvelse | -OKT | -SLETT | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, drillInstanceId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `malvelg` · Bruk øktmal | -UKE, -OKT | -MALVALG | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, templateId, templateRevision | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `mal-anvend` · Bruk valgt mal | -MALVALG | -OKTSKJEMA | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, sessionDraftId, templateId, templateRevision | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `tpvelg` · Velg fra teknisk plan | -OKT, -UKE | -TPVALG | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, technicalPlanId, taskIds, taskRevisions | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `tp-legg` · Legg valgte oppgaver i økta | -TPVALG | -OKT | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, sessionDraftId, technicalPlanId, taskIds, taskRevisions | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `tp-apne` · Åpne teknisk oppgave | -OKT | Handlingsregel i JSON | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, drillInstanceId, taskId, taskRevision | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `tp-revisjon` · Sammenlign / oppdater til ny revisjon | -OKT | Handlingsregel i JSON | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, drillInstanceId, taskId, sourceRevision, currentRevision | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `fysvelg` · Legg til fysisk program | -UKE, -OKT | -FYSVALG | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, programId, programRevision, programSessionIds | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `fys-legg` · Legg valgte programøkter i planen | -FYSVALG | -UKE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, programId, programRevision, programSessionIds, selectedDates | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `spillvelg` · SPILL / golfslag / turnering | -OKT, -OVELSE | Handlingsregel i JSON | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, drillInstanceId, dominantAxis, area | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `turnkal` · Velg turneringer fra kalender | -AR, -MND, -UKE | -TURNKAL | subjectType, subjectId, planId, calendarTournamentId, tournamentEntryId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `turndetalj` · Åpne valgt turnering | -TURNKAL | -TURNDET | subjectType, subjectId, planId, tournamentEntryId, tournamentStartDate, tournamentEndDate, calendarTournamentId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `turn-legg` · Legg turneringen i årsplanen | -TURNDET | -TURNPLAN | subjectType, subjectId, planId, tournamentEntryId, tournamentStartDate, tournamentEndDate, calendarTournamentId, roundIds, roundDates | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `turnmanuell` · Manuell turnering | -TURNKAL | -TURNMANUELL | subjectType, subjectId, planId, tournamentDraftId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `turnmanuell-lagre` · Lagre turnering som utkast | -TURNMANUELL | -TURNPLAN | subjectType, subjectId, planId, tournamentEntryId, tournamentStartDate, tournamentEndDate, tournamentDraftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `turn-forberedelse` · Legg inn forberedelse / runde / reise | -TURNPLAN | -OKTSKJEMA | subjectType, subjectId, planId, tournamentEntryId, tournamentStartDate, tournamentEndDate, roundId, date, sessionDraftId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `turn-seuke` · Se i ukeplanen | -TURNPLAN | -UKE | subjectType, subjectId, planId, tournamentEntryId, tournamentStartDate, tournamentEndDate, weekStartDate, isoWeekYear, isoWeek | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `hendelse` · Legg inn kalenderhendelse | -AR, -MND, -UKE | -HENDELSE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, eventDraftId, calendarType | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `hendelse-lagre` · Lagre hendelse | -HENDELSE | -UKE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, eventDraftId, calendarEventId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `gjenta` · Gjenta økt | -OKT, -OKTSKJEMA | -GJENTA | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, seriesId, repeatRuleDraftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `gjenta-legg` · Legg inn valgte forekomster | -GJENTA | -UKE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, seriesId, repeatRule, occurrenceDates | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `serie-rediger` · Endre gjentatt økt | -OKT, -OKTSKJEMA | -SERIEOMFANG | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, seriesId, selectedOccurrenceDate | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `serie-bekreft` · Bekreft valgt omfang | -SERIEOMFANG | -OKTSKJEMA | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, seriesId, selectedOccurrenceDate, scope, affectedSessionIds | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `kopi` · Dupliser uke / økt | -UKE, -OKT | -KOPI | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sourceSessionIds, targetWeekStartDate, targetDate | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `kopi-bekreft` · Opprett kopi som utkast | -KOPI | -UKE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sourceSessionIds, targetWeekStartDate, targetDates | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `flytt` · Flytt / dra til ny dato | -UKE, -OKT | -FLYTT | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, targetDate, targetStartTime | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `flytt-bekreft` · Bekreft flytting | -FLYTT | -UKE | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, targetDate, targetStartTime, scope | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `konflikt` · Velg annet tidspunkt / planlegg likevel | -KONFLIKT | Handlingsregel i JSON | subjectType, subjectId, planId, weekStartDate, isoWeekYear, isoWeek, sessionId, pendingOperation, conflictingObjectIds | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `publiser` · Publiser valgte økter / valgt planrevisjon | -UKE, -OKT, -AR, -TURNPLAN | -PUB | subjectType, subjectId, planId, publicationKind, sessionIds, planRevision, tournamentEntryId, tournamentRevision | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `pub-bekreft` · Bekreft og publiser | -PUB | Handlingsregel i JSON | subjectType, subjectId, planId, publicationKind, selectedObjectIds, selectedRevisions, originScreen | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `trekk` · Trekk tilbake valgt publisering | -OKT, -TURNPLAN | -TREKK | subjectType, subjectId, planId, publicationId, selectedObjectIds, selectedRevisions | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `trekk-bekreft` · Bekreft tilbaketrekking | -TREKK | Handlingsregel i JSON | subjectType, subjectId, planId, publicationId, selectedObjectIds, originScreen | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `malny` · Opprett / koble mål | -AR, -PER, -MND, -UKE, -OKT, -MAL | -MALSKJEMA | subjectType, subjectId, planId, planLevel, targetObjectId, goalId, goalDraftId | Finnes, må rettes/presiseres | `originScreen`; endret utkast via `ULAGRET` |
| `mal-lagre` · Lagre / koble mål | -MALSKJEMA | Handlingsregel i JSON | subjectType, subjectId, planId, planLevel, targetObjectId, goalId, goalDraftId, originScreen | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `avbryt` · Avbryt / lukk / tilbake | -NY, -PLANREDIGER, -PERSKJEMA, -MNDSKJEMA, -UKESKJEMA, -OKTSKJEMA, -OVELSE, -MALVALG, -TPVALG, -FYSVALG, -TURNMANUELL, -TURNPLAN, -HENDELSE, -GJENTA, -SERIEOMFANG, -KOPI, -FLYTT, -MALSKJEMA | Handlingsregel i JSON | subjectType, subjectId, planId, originScreen, draftId, pendingNavigation | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ulagret-fortsett` · Fortsett å redigere | -ULAGRET | Handlingsregel i JSON | subjectType, subjectId, planId, originEditor, draftId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ulagret-forkast` · Forkast utkast og fortsett | -ULAGRET | Handlingsregel i JSON | subjectType, subjectId, planId, draftId, pendingNavigation, originScreen | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `ulagret-lagre` · Lagre utkast og fortsett | -ULAGRET | Handlingsregel i JSON | subjectType, subjectId, planId, draftId, originEditor, pendingNavigation | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `slett-bekreft` · Bekreft fjerning | -SLETT | Handlingsregel i JSON | subjectType, subjectId, planId, deleteKind, selectedObjectIds, originScreen | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `avbryt-bekreft` · Avbryt | -PUB, -TREKK, -SLETT, -KONFLIKT | Handlingsregel i JSON | subjectType, subjectId, planId, originScreen, draftId, selectedObjectIds | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `tilbake-oversikt` · Tilbake | -AR, -PER, -MND, -UKE, -OKT, -VOL, -MAL, -TURNDET, -TURNPLAN | Handlingsregel i JSON | subjectType, subjectId, planId, originScreen, navigationSnapshot, weekStartDate, sessionId | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |
| `provigjen` · Prøv igjen | -NY, -PLANREDIGER, -PERSKJEMA, -MNDSKJEMA, -UKESKJEMA, -OKTSKJEMA, -OVELSE, -MALVALG, -TPVALG, -FYSVALG, -TURNMANUELL, -TURNPLAN, -HENDELSE, -GJENTA, -SERIEOMFANG, -KOPI, -FLYTT, -MALSKJEMA, -AR, -PER, -MND, -UKE, -OKT, -TURNKAL | Handlingsregel i JSON | subjectType, subjectId, planId, failedOperation, draftId, selectedObjectIds, selectedRevisions | Bestilt ny kontroll | `originScreen`; endret utkast via `ULAGRET` |

Det opprinnelige bestillingskartet hadde **169 rollekoblede kontrollregler** og **72 skjerm-/overleggs-ID-er**; dette er historisk baseline før utvidelsene nedenfor. Dette er ikke telling av ferdig implementerte kontroller. Gjentatte dynamiske kort, knapper og forekomster krever egne instansbindinger fra den faktiske nye kildekoden. Det samlede Precision-knappkartet skal regenereres etter utvidelsen.

## Synlig valg av budsjettgrunnlag

`PH/AG-11-BUDSJETTGRUNNLAG` er bestilt overleggs-ID. Uke som berører flere perioder viser periodenes navn, faktiske datoer og kildeverdier, pluss **Eget ukebudsjett**. Når brukeren kommer fra en bestemt periode, beholdes den valgte `periodId` som synlig grunnlag; andre berørte perioder og mulighet for bytte vises samtidig. Direkte ukeåpning uten entydig valgt grunnlag krever et uttrykkelig valg. Ingen periode prioriteres i bakgrunnen, og øktantall prorateres ikke.

| Kontroll | Fra | Mål / handling | Objektkontekst |
|---|---|---|---|
| `budsjettgrunnlag` · Velg / bytt grunnlag | UKE / UKESKJEMA / MNDSKJEMA | BUDSJETTGRUNNLAG | weekStartDate, berørte periodId-er, valgt kilde, originScreen |
| `budsjettgrunnlag-periode` · Bruk valgt periodes budsjett | BUDSJETTGRUNNLAG | Samme originScreen/editor med synlig kilde | weekStartDate, selectedSourcePeriodId, draftId |
| `budsjettgrunnlag-egen` · Eget ukebudsjett | BUDSJETTGRUNNLAG | UKESKJEMA, ingen skjulte tall | weekStartDate, draftId, berørte perioder |

Dette er en ny kandidat som Anders kan velge ved skjermgjennomgangen. Den gjør manuell planlegging komplett uten å bestemme en automatisk algoritme. Avbryt bevarer opprinnelig grunnlag og utkast.

## Retur, avbryt og lagring

Alle innganger lagrer `originScreen` og hele objektutvalget. Tilbake bruker den faktiske historikken; uten historikk brukes de eksplisitte foreldremålene i kontrollen `tilbake-oversikt`. Editor med endringer åpner `PH/AG-11-ULAGRET`. **Fortsett å redigere** bevarer utkastet. **Forkast utkast og fortsett** forkaster bare valgt utkast. **Lagre utkast og fortsett** kaller samme konkrete lagring som editorens lagreknapp og navigerer først etter bekreftet svar.

Lagringsfeil beholder felt, kilde, valgt objekt og mål. Prøv igjen skal ikke skape en ny plan, økt eller turnering. Prototypens lokale simulering merkes som simulering; appen må ha faktisk lagringsbekreftelse. Konfliktmeldinger er veiledende, mens tilgang og ekte bookingkrav ikke kan overstyres med «Planlegg likevel».

Publisering viser konkret mottaker, objektliste, datoer, revisjoner og omfang før bekreftelse. Lagre utkast publiserer ikke. En teknisk oppgave i én økt publiserer ikke alle globale coachutkast. Tilbaketrekking fjerner ikke gjennomførings- eller målehistorikk.

Publiseringsbestillingen fryser forventet eier, plan, øktliste og innhold-/kilderevisjon. Identisk **Prøv igjen** returnerer samme faste publikasjon, selv om utkastet senere endres. Samme bestillingsnøkkel med en ny hensikt avvises. Feilet handling skal bevare både utkastlager, delt TP-/TEK-kilde, valgt kontekst og spillerens lesing. Nyeste gruppeomfang og medlemsunntak må også fjerne gammel gruppetilgang til samme økt; medlemmets egen versjon og gjennomføringshistorikk bevares. Dette er prototype-/byggekrav; eksport 22 har konkrete avvik og er ikke kontrollert sluttversjon.

## Produktavklaringer og grenser

- **Hvordan skal budsjett arves i uker som krysser flere perioder eller overlapper?** Vis aktuelle perioder og la brukeren velge kilde eller egne tall; ingen skjult norm eller automatisk omregning. Blokkerer: Kun automatisk valg/proratering, ikke manuell planlegging.
- **Ønskes en automatisk øktgenerator, og hvilket bekreftet grunnlag skal forslagene bruke?** Den bestilte manuelle reisen er komplett uten automatisk generator. Et eventuelt forslag kan forhåndsvises og redigeres før eksplisitt innsetting. Blokkerer: Automatisk fordelingsalgoritme; ingen eksisterende norm eller repskonvertering kan antas.
- **Hvilke konkrete planrevisjoner/omfang kan dagens kode publisere og trekke tilbake?** Vis bare verifiserte valg og konkrete objekt-ID-er; registrer manglende handling som byggegap. Blokkerer: Appkobling til ubekreftet publiserings-/tilbaketrekkingshandling, ikke designet av bekreftelsesark.

Dominerende pyramide, veiledende budsjett, åtte periodetyper, ett teknisk fokus per øvelse og flere øvelser per økt er allerede kildebestemt. Ikke spør om disse på nytt. En automatisk normfordeling, timer/reps-konvertering eller publisering er ikke bestilt av denne kontrakten.

## Kontroller før ferdigmelding

1. Opprett tom årsplan: ingen demoøkter, perioder, budsjett eller oppgaver; planId stabilt og forrige årsplan beholdt.
2. Åtte periodetyper matcher hovedcheckout4b55352s master; gamle Restitusjon-data bevares historisk uten ny standard.
3. Første standardplan indeks0 er gyldig; ulike maler bruker egne kilder og datoer, ikke samme skjulte eksempelplan.
4. Fem øktantall og fem tider: tom/null, valgt0, positive verdier og feltfeil bevares uten konvertering eller dobbelttelling.
5. Arv/egen endring og gjenoppretting fungerer per konkret uke/dato; overlappet kilde er synlig og valgt.
6. Alle uker og årsskifte/uke53 åpner riktig uke; måned/periode sender aldri ukene tilbake til en demomåned.
7. Ny økt, bank, mal, TP og program bevarer subjectId/planId/weekStartDate/sessionId; to økter har uavhengig innhold.
8. FYS/TEK/SLAG/SPILL/TURN har riktige områdefelt; flere øvelser per økt og ett teknisk fokus per øvelse.
9. Teknisk oppgave beholder taskId/revisjon, ingen ny replogg eller global publisering; stale revisjon synlig.
10. Turneringskalender og manuelt skjema beholder tournamentEntryId/fra/til/rundevalg; ingen én-runde-per-dag-antakelse eller dublett.
11. Gjentakelsesregel skaper faktiske datoer/ID-er; bare denne/denne-og-framover har dokumentert omfang.
12. Kopi gir nye øktinstanser, flytt bevarer sessionId; uke-/øktmål og datoer er brukerens faktiske valg.
13. Publisering/tilbaketrekking omfatter bare valgte objekter/revisjoner og rett mottaker; lagring alene publiserer ikke.
14. Avbryt/tilbake/lagringsfeil bevarer utkast og objektkontekst. Retry lager ingen dublett. Tilgang kan aldri overstyres av Planlegg likevel.
15. Mobil390/desktop og data/tom/laster/feil er visualisert og kontrollert; nye skjermvarianter er kandidater inntil Anders velger.
16. Knappkart regenereres fra effektiv implementert kilde etter utvidelsen; alle nye IDs/instanser/handlerkjeder kontrolleres, ikke bare dette bestillingskartet.

Registrer faktisk eksport/hash, nye kildefiler/linjer, reisebevis og konkrete skjermvalg etter utføring. Anders godkjenner de nye skjermvariantene separat. Et grønt kontrollregister er ikke visuell godkjenning og ikke en ferdig app.


## Tillegg: teknikkøktantall fra tekniskplan

Brukerens uttrykkelige krav trenger en ny planleggingskilde: tekniskplanen har oppgaver/reps, men ingen kilde for planlagte økter per uke. `PH/AG-11-TPANTALL` og `PH/AG-11-TEKHENT` reserverer fire ekstra overlegg og åtte kontrollregler. Samlet kontrakt er nå 76 skjerm-/overleggs-ID-er og 177 rollekontroller; de første 72/169 står som datert utgangspunkt. Nytt antall angis uttrykkelig med gyldighetsdatoer og kilde-/publiseringsrevisjon. Overføringen til valgt TEK-budsjett bekreftes, og tilbake beholder hele planleggingskonteksten. Andre akser, minutter og faktisk øktantall endres ikke. Null/0 og utkast/publisert skilles. Dette er bestilt design, ikke kontrollert implementasjon eller nytt godkjent databaseskjema.

### Teknisk plan fra tom Workbench

Kildekontroll av TEK-eksporten viste at «Ny teknisk plan» bare åpnet global demo eller varsel; ny oppgave var ikke en ny plan for valgt eier. Derfor er `AG-11-TPNY` og seks konkrete kontrollregler lagt til: coach oppretter teknisk plan, lagrer den, oppretter første oppgave og velger faktisk kilde. Spilleren får eksisterende `PH-21` for å be coach, uten nye coachrettigheter. Samme TP-kilde kan brukes i flere årsplaner uten duplikat. Nå **77 reserverte flater og 183 kontrollregler**. Dette er bestilt kandidat, ikke ferdig eller godkjent funksjon.
