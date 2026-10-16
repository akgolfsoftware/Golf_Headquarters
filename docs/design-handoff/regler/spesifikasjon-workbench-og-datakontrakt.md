# Overlevering til Claude Code · 01.10.2026 (eier byttet 04.10.2026)

Claude Code eier implementeringen fra 04.10.2026 (tidligere Claude Code). Claude Design er designkilde og klikkbar prototype. Grok skal ikke brukes til kode eller som implementeringsautoritet. Porteringskø: `overlevering/claude-code.md`.

## Autoritet og godkjenning

- Aktiv visuell retning: **AK Golf Precision Athletics**.
- Training Motor, Train-lock, Paper og den gamle Grok-overleveringen er historikk og funksjonsinventar.
- Anders har visuelt godkjent **PH-01 original, mobil 390 px, lyst tema, Data, med dialogen «Endring i dagens plan» åpen**.
- Alle andre skjermer er kandidater fram til Anders har sett og godkjent dem.

## Workbench som Claude Code skal kode

Workbench skal starte fra tom tilstand og henge sammen gjennom:

1. Eier: spiller eller gruppe.
2. Årsplan: navn, gyldig fra/til, tom plan eller valgt mal.
3. Perioder: type, datoer, fokus, notat, antall økter og minutter per FYS, TEK, SLAG, SPILL og TURN.
4. Måned: arvet budsjett eller eksplisitt overstyring.
5. Uke: alle ISO-uker i årsplanen, arvet/overstyrt budsjett, kalender og totaler.
6. Økt: tid, varighet, dominerende område, sted/bane/hull, øvelser, kilde, serie, kopi, flytting og sletting.
7. Kilder: Pyramiden, teknisk plan, fysisk program, golfslag/spill, turneringskalender og målsetninger.
8. Publisering: utkast hos coach → valgt økt/revisjon → publisert øyeblikksbilde → spillerens PH-03/PH-04. Nyere utkast skal aldri lekke automatisk.

Skjermhierarkiet er stabilt for både AgencyOS og PlayerHQ: År → Periode → Måned → Uke → Økt. Volum og Målsetninger er egne nivåer i samme Workbench.

## Navigasjon

Den autoritative tabellen ligger nedenfor. Den lokale Claude Code-eksporten inneholder i tillegg `codex-knapp-skjerm-kart-2026-10-01.md` og den maskinlesbare JSON-versjonen.

Hovedkoblinger:

- Fysisk program → `AG-WB-FYS` / `PH-WB-FYS`.
- Teknisk plan → `AG-10`; oppgave → `AG-TP-01` / `PH-TP-01`.
- Turneringer → `AG-WB-TURN` / `PH-WB-TURN`.
- Publisert økt → `PH-03`; start → `PH-04`.
- Spiller som trenger endring eller ny teknisk plan → `PH-21` til coach.

## Datakontrakt

Claude Code skal bruke stabile ID-er og revisjoner, ikke skjermtekst eller array-posisjon:

`ownerType`, `ownerId`, `annualPlanId`, `periodId`, `monthKey`, `isoWeekKey`, `sessionId`, `technicalPlanId`, `taskId`, `sourceTaskRev`, `publicationId`, `publishedRevision`, `physicalProgramId`, `programRevision`, `tournamentEntryId`.

TEK-budsjettet er et eksplisitt antall planlagte teknikkøkter. Det skal ikke beregnes fra oppgaver eller repetisjoner. Bare P1.0–P10.0 er aktive tekniske posisjoner.

## Tilstander og kvalitet

Alle skjermer skal ha Data, Tom, Laster og Feil. Mobil 390 px og desktop skal kontrolleres; relevant natt-tema i tillegg. Knapper skal ha minst 44 px treffflate. Primærknapp er grafitt; rust brukes kun som signal eller destruktiv handling. Manglende verdi vises som «—».

Prototypebevis dokumenterer designadferd. Claude Code må selv bevise lagring, tilgang, feilhåndtering, opplasting, revisjonshistorikk og publisering i appkoden før en funksjon kan kalles ferdig.

## Åpent produktvalg

Det er ikke besluttet hva som skal skje med perioder, budsjetter og mål som havner utenfor en årsplan når årsplanens sluttdato forkortes. Claude Code skal ikke gjette eller implementere denne grenen før Anders har bestemt utfallet.

---

# Claude Code · knapp–skjerm-kart for Workbench

Generert 01.10.2026. Implementeringseier er **Claude Code**. Claude Design er visuell kilde og prototype.

## Fast skjermhierarki

| Knapp | AgencyOS | PlayerHQ |
|---|---|---|
| År | `AG-11-AR` · `/admin/workbench/[playerId]?niva=ar` | `PH-11-AR` · `/portal/planlegge/workbench?niva=ar` |
| Periode | `AG-11-PER` · `/admin/workbench/[playerId]?niva=periode` | `PH-11-PER` · `/portal/planlegge/workbench?niva=periode` |
| Måned | `AG-11-MND` · `/admin/workbench/[playerId]?niva=maned` | `PH-11-MND` · `/portal/planlegge/workbench?niva=maned` |
| Uke | `AG-11-UKE` · `/admin/workbench/[playerId]?niva=uke` | `PH-11-UKE` · `/portal/planlegge/workbench?niva=uke` |
| Økt | `AG-11-OKT` · `/admin/workbench/[playerId]?niva=okt` | `PH-11-OKT` · `/portal/planlegge/workbench?niva=okt` |
| Volum | `AG-11-VOL` · `/admin/workbench/[playerId]?niva=volum` | `PH-11-VOL` · `/portal/planlegge/workbench?niva=volum` |
| Målsetninger | `AG-11-MAL` · `/admin/workbench/[playerId]?niva=malsetninger` | `PH-11-MAL` · `/portal/planlegge/workbench?niva=malsetninger` |

## Alle kartlagte Workbench-handlinger

| Kontroll-ID | Tekst | Type | Mål |
|---|---|---|---|
| `niva-ar` | År | screen | agency: AG-11-AR · /admin/workbench/[playerId]?niva=ar · player: PH-11-AR · /portal/planlegge/workbench?niva=ar |
| `niva-periode` | Periode | screen | agency: AG-11-PER · /admin/workbench/[playerId]?niva=periode · player: PH-11-PER · /portal/planlegge/workbench?niva=periode |
| `niva-mnd` | Måned | screen | agency: AG-11-MND · /admin/workbench/[playerId]?niva=maned · player: PH-11-MND · /portal/planlegge/workbench?niva=maned |
| `niva-uke` | Uke | screen | agency: AG-11-UKE · /admin/workbench/[playerId]?niva=uke · player: PH-11-UKE · /portal/planlegge/workbench?niva=uke |
| `niva-okt` | Økt | screen | agency: AG-11-OKT · /admin/workbench/[playerId]?niva=okt · player: PH-11-OKT · /portal/planlegge/workbench?niva=okt |
| `niva-vol` | Volum | screen | agency: AG-11-VOL · /admin/workbench/[playerId]?niva=volum · player: PH-11-VOL · /portal/planlegge/workbench?niva=volum |
| `niva-mal` | Målsetninger | screen | agency: AG-11-MAL · /admin/workbench/[playerId]?niva=malsetninger · player: PH-11-MAL · /portal/planlegge/workbench?niva=malsetninger |
| `tom-opprett` | Opprett årsplan | screen | agency: AG-11-NY · player: PH-11-NY |
| `lagre-plan` | Lagre årsplan | action | success: AG-11-AR / PH-11-AR · error: årsplan-skjema med feltfeil |
| `ny-periode` | Ny periode | form | agency: AG-11-PERSKJEMA · player: PH-11-PERSKJEMA |
| `rediger-periode` | Rediger periode | form | agency: AG-11-PERSKJEMA · player: PH-11-PERSKJEMA |
| `lagre-periode` | Lagre periode | action | success: AG-11-PER / PH-11-PER · error: periodeskjema med feltfeil |
| `periode-fjern` | Fjern periode | dialog | periode-fjern-panel |
| `mnd-velger` | Velg måned | state | AG-11-MND / PH-11-MND |
| `uke-velger` | Velg uke | state | AG-11-UKE / PH-11-UKE |
| `side-tab-bank` | Øvelsesbank | panel | side-bank |
| `side-tab-fys` | Fysisk program | panel | side-fys-program |
| `side-fys-program` | Åpne hele fysisk program | screen | agency: AG-WB-FYS · player: PH-WB-FYS |
| `side-tab-maler` | Øktmaler | panel | side-mal |
| `side-tab-turn` | Turneringer | panel | side-turnering |
| `side-turnering` | Åpne turneringsmodulen | screen | agency: AG-WB-TURN · player: PH-WB-TURN |
| `side-tab-tp` | Ny teknisk plan | panel | side-tpn |
| `side-ny-tp` | Ny teknisk plan | form | agency: WB3_TPN → AG-10 · player: forespørsel via PH-21 |
| `side-tab-mal` | Målsetninger | panel | AG-11-MAL / PH-11-MAL |
| `side-ny-okt` | Ny økt | form | okt-skjema |
| `okt-lagre` | Lagre økt | action | success: AG-11-OKT / PH-11-OKT · error: okt-skjema med feltfeil |
| `rediger-okt` | Rediger økt | form | okt-skjema |
| `dupliser-okt` | Dupliser økt | dialog | kopi-panel |
| `gjenta-okt` | Gjenta økt | dialog | serie-panel |
| `flytt-okt` | Flytt økt | dialog | flytt-panel |
| `slett-okt` | Slett økt | dialog | omfang-panel |
| `legg-til-ovelse` | Legg til fra øvelsesbank | panel | bank |
| `ny-ovelse` | Ny egen øvelse | form | ex-skjema |
| `legg-til-tp` | Legg til fra teknisk plan | panel | tp-kilde-velg |
| `tp-oppgave` | Åpne teknisk oppgave | screen | agency: AG-TP-01 · player: PH-TP-01 |
| `tp-legg-til` | Legg teknisk oppgave i økt | action | success: AG-11-OKT / PH-11-OKT · error: tp-feil |
| `prog-apne` | Åpne fysisk program | screen | agency: AG-WB-FYS · player: PH-WB-FYS |
| `turnering` | Legg til turnering | screen | agency: AG-WB-TURN · player: PH-WB-TURN |
| `pub-panel` | Publiser økter | dialog | pub-panel |
| `pub-start-okt` | Start publisert økt | screen | PH-04 |
| `ph03-pub` | Åpne publisert økt | screen | PH-03 |
| `a3-dupliser-uke` | Dupliser uke | dialog | kopiuke-panel |
| `a3-dupliser-okt` | Dupliser økt | dialog | kopi-panel |
| `a3-bruk-mal` | Bruk mal på spiller | panel | side-tab-maler |
| `a3-coachnotat` | Coachnotat | form | note-skjema |
| `a3-sok-tp` | Søk i tekniske oppgaver | panel | side-tab-tp |
| `side-pyramide` | Hent antall fra Pyramiden | action | periode-/ukebudsjett |
| `side-tp` | Hent planlagt antall teknikkøkter | action | TEK-budsjett |
| `lagre-ovr` | Lagre måneds-/ukeoverstyring | action | success: valgt måned/uke · error: feil-ovr |
| `tilbakestill` | Tilbakestill til arvet budsjett | dialog | nullstill-konsekvens |
| `vol-tiltak-lag-utkast` | Lag utkast | action | success: AG-11-VOL · coachens utkast · error: AG-11-VOL · analyse beholdes |
| `vol-tiltak-legg-wb` | Legg i Workbench (uke 40) | action | success: AG-11-OKT · utkast i valgt uke · error: AG-11-VOL · tiltak beholdes |
| `vol-tiltak-publiser` | Publiser til spiller | dialog | agency: AG-11-VOL · publiseringsbekreftelse |
| `vol-tiltak-bekreft-publiser` | Bekreft og publiser | action | success: PH-03 · publisert økt · error: AG-11-VOL · publiseringsfeil |
| `vol-tiltak-avbryt` | Avbryt publisering | state | agency: AG-11-VOL · tiltak i Workbench |
| `vol-tiltak-forkast` | Forkast utkast | dialog | agency: AG-11-VOL · bekreft forkasting |

## Kontekst Claude Code skal bære med

Hver reise bruker eier, årsplan, periode, måned, ISO-uke, økt og eventuell kildeidentitet. Teknisk oppgave må bære `technicalPlanId`, `taskId`, `sourceTaskRev` og senere `publicationId`. Fysisk program og turnering bruker egne stabile kilder og revisjoner.

Den eneste visuelt godkjente skjermen er fortsatt PH-01-varianten Anders godkjente. Kartet beskriver funksjon og navigasjon; det gjør ikke øvrige skjermkandidater godkjent.
