# Team Norway-trenerflaten: funksjonsregister (21.10.2026)

Etappe 1 i [prompt-tn-trenerflate-2026-10-21.md](prompt-tn-trenerflate-2026-10-21.md). Beslutning:
`.claude/rules/beslutninger.md` §TEAM NORWAY-TRENERFLATEN BYGGES I HQ ETTER TEAMNORWAYREF (alternativ A, PR #1587).

Én rad per side under `src/app/team-norway` (39 `page.tsx`) og én rad per del av teamnorwayref
(`ak-golf-pipelines`, `origin/main`, `scripts/referansespillere_html.py`). Ingen funksjon forsvinner uten at
raden sier hvor den går. Kartlagt ved lesing av sidene, skjermene de delegerer til, `tn-shell.tsx` og
tilgangsfunksjonene; ingenting er målt i nettleser i denne etappen.

**Utfall:** beholdes (samme adresse, ny plass i menyen) · flyttes (ny adresse, gammel sender videre) ·
slås sammen (funksjonen lever videre inne i en annen side, gammel adresse sender videre) · blir videresending
(siden har ingen egen funksjon i ny struktur) · ny (finnes ikke i dag).

**Ny meny (forslag til etappe 2, seks hovedpunkter):** Hjem · Spillere · Samlinger og testing · Turneringer ·
Referanse · Fag og administrasjon. Min profil fra navnet nederst. Begrunnelse og sidekart:
[docs/design-system/utkast-tn/trenerflate/README.md](../design-system/utkast-tn/trenerflate/README.md).

## Felles for alle sidene i dag

- `src/proxy.ts` sender uinnloggede til `/teamnorway?next=…` (`erSperretTeamNorwaySti`).
- Sidene kaller `requirePortalUser` (ofte via `hentSkjermbruker`, `kreverTilgang: "INGEN"`) og deretter
  `hentTnArbeidskontekst` → `hentTnOversiktForBruker` (`src/lib/domain/tn-tilgang.ts`): krever aktivt medlemskap
  i TN-gruppa (slug `team-norway`, demo `team-norway-demo`) eller `role === "ADMIN"`, ellers `notFound()`.
- Persondata om enkeltspillere leses gjennom `medTnSpillerData` / `lesTnProfiler` (`src/lib/domain/tn-arbeidsflate.ts`):
  `erTnPersonligDataLeser` (ADMIN, eller plattform-COACH med gruppe-rolle COACH/ASSISTANT) **og**
  `medNavngittProfil` (navngitt deling `NAVNGITT_KOMPLETT_PROFIL`, `src/lib/deling/navngitt.ts`). Gruppemedlemskap
  alene gir ikke innsyn.
- Data Golf: `DATAGOLF_ROLLER = ["ADMIN"]` (`src/lib/auth/datagolf-regel.ts`). Bare `/team-norway/datagolf` viser
  tallene.
- I dag kan også spillere (gruppe-rolle PLAYER) åpne deler av `/team-norway`. Den nye flaten er for trenere;
  se «Uavklart» nederst.

## A. Dagens sider under /team-norway (39)

| # | Adresse | Hva den gjør | Data den leser | Hvem ser den | Ny plass | Utfall |
|---|---|---|---|---|---|---|
| 1 | `/team-norway` | TN-01 oversikt: neste samling med nedtelling, testdag, «Trenger deg», siste gruppeposter, turneringer | `hentTnSamlinger`, `hentTnTestdager`, `hentTnTestdag`, `hentTnGruppetrening`, `hentGruppepostSide`, `hentTnTurneringer` | Alle i TN-gruppa; trenerdelene bare for `!erSpiller` | Hjem › I dag | beholdes |
| 2 | `/team-norway/[groupId]` | TN-13 gruppeposter: tidslinje, lesekvittering, påminnelse, opprett/endre/slett | `hentGruppepostSide`, `hentPaaminnelser` (`tn-post.ts`), `opprettGruppepostAction` | `hentViewerRolleIGruppe` ≠ null (trener, spiller, godkjent foresatt) | Hjem › Gruppeposter | beholdes |
| 3 | `/team-norway/[groupId]/dokumenter` | Gruppens filer, kategorifilter, opplasting og sletting | `hentGruppeDokumenter`, `hentViewerRolleIGruppe`, `prisma.group` | Som #2 | Hjem › Dokumenter | beholdes |
| 4 | `/team-norway/analyse` | TN-09 gruppeanalyse: velg protokoll eller testdag, rangert liste | `hentTnGruppeanalyseValg`, `hentTnGruppeanalyseResultat` (`testDay`, `testResult`, `TN_CATALOG`) | `erTnGruppeanalyseLeser` (ADMIN, gruppe-COACH/ASSISTANT) | Samlinger og testing › Gruppeanalyse | beholdes |
| 5 | `/team-norway/apparatet` | `permanentRedirect` til `/fagapparat` | — | Ingen vakt | Fag og administrasjon › Fagapparat | blir videresending (er det allerede) |
| 6 | `/team-norway/college` | TN-06 College og USA: skole, status, start, brutto snitt, kommende samlinger | `hentTnCollege` (`tnCollege`), `hentTnRangliste`, `hentTnSamlinger` | Spillere (seg selv), trenere via `erTnPersonligDataLeser` | Spillere › College og USA | beholdes |
| 7 | `/team-norway/datagolf` | Data Golf: proffer, topplister, norske spillere, spiller mot proff | `hentWangDataGolf`, `hentDgSpillerVisning`, `hentTnSpillere` | `krevDataGolfBruker` (bare ADMIN) | Fag og administrasjon › Data Golf (vises bare for ADMIN) | beholdes |
| 8 | `/team-norway/fagapparat` | Fagteam: aktive trenere med rolle, e-post for administratorer | `hentTnTrenere` (`groupMember` COACH/ASSISTANT) | Alle ikke-spillere i TN-gruppa | Fag og administrasjon › Fagapparat | beholdes |
| 9 | `/team-norway/fellestesting` | TN-03 testdager, minstekrav per klasse, testoversikt per skole (skoler under 3 slås sammen) | `hentTnTestdager`, `hentTnTestdag`, `hentTnFellesTestdagGrupper`, `hentTnGruppeanalyseResultat`, `TESTBATTERI`, `trenerKanFore` | Ikke-spillere | Samlinger og testing › Fellestesting | beholdes |
| 10 | `/team-norway/fellestesting/[deltakerId]` | Trenerføring av én deltaker på scorekort | `hentTnTestdagDeltaker`, `tnProtocol`, `TnTestdagScorecard` | `erTnTestdagLeser`; skriving `kanAdministrere` og testdag ACTIVE | Samlinger og testing › Fellestesting (underside) | beholdes |
| 11 | `/team-norway/inviter` | TN-19 inviter spillere til TN-gruppa, følg status | `inviterSpillereTilGruppe` (`app/admin/grupper/[id]/actions`) | `kanAdministrere` (TN-COACH eller ADMIN) | Fag og administrasjon › Inviter spiller | beholdes |
| 12 | `/team-norway/lisens-okonomi` | TN-10 lisens, helseattest, antidoping per spiller i år | `hentTnSpillere`, `hentTnSpillerstatuser` (`tnSpillerstatus`) | Trenere; spillere ser egen rad | Fag og administrasjon › Lisens og status | beholdes (menynavnet blir «Lisens og status», siden har ingen økonomidata) |
| 13 | `/team-norway/live-watch` | TN-08 Live Watch over turneringer med TN-spillere | `hentTnTurneringer`, `hentTnSpillere` | Alle i TN-gruppa | Turneringer › Live Watch | beholdes |
| 14 | `/team-norway/manedsplan` | TN-11 månedskalender eller liste: gruppeøkter, perioder, samlinger, turneringer | `hentTnManedsplan` (`groupSchedule`, `groupPeriodBlock`), `hentTnTurneringer`, `hentTnSamlinger` | Alle i TN-gruppa | Samlinger og testing › Månedsplan | beholdes |
| 15 | `/team-norway/protokoller` | TN-15 bibliotek over testprotokoller, filter klar/utkast | `hentTnProtokollbibliotek` (statisk `TN_CATALOG`) | Ikke-spillere | Fag og administrasjon › Testprotokoller | beholdes |
| 16 | `/team-norway/protokoller/[id]` | Én protokoll på egen side | `hentTnProtokolldetalj` | Ikke-spillere | Fag og administrasjon › Testprotokoller (underside) | beholdes |
| 17 | `/team-norway/rangliste` | TN-16 rangliste i år: starter, snittplass, brutto snitt | `hentTnRangliste` (`public_player_entries`/`rounds` via profilkobling) | Ikke-spillere | Turneringer › Rangliste | beholdes |
| 18 | `/team-norway/referansenivaer` | TN-18 per test: median, beste, antall | `hentTnGruppeanalyseResultat`, `TESTBATTERI` | Ikke-spillere | Referanse › Tester | slås sammen (med teamnorwayref «Referansenivåer»; se B13 — «beste» og celler under 5 vises ikke) |
| 19 | `/team-norway/samlinger` | TN-04 årshjul og terminliste over samlinger og turneringer | `hentTnSamlinger`, `hentTnTurneringer` | Alle i TN-gruppa | Samlinger og testing › Samlinger | beholdes |
| 20 | `/team-norway/samlinger/[id]` | Én samling med økter; publisering | `hentTnSamlinger`, `hentTnManedsplan`, `Capability.EDIT_GROUP_PLANS` | Alle i TN-gruppa; publisering med capability | Samlinger og testing › Samlinger (underside) | beholdes |
| 21 | `/team-norway/skoler` | TN-17 spillere gruppert på skole og trinn | `hentTnSkoler` (`user.skole`, `skolear`) | Ikke-spillere | Spillere › Skoler | beholdes |
| 22 | `/team-norway/spiller/[spillerId]` | TN-10 fanen «Post»: poster til spiller og foresatte, lesekvittering | `medTnSpillerpostData`, `hentSpillerpostTidslinje` | `requirePortalUser` COACH/ADMIN/PLAYER/PARENT + `medTnSpillerpostData` | Spillerprofil (IUP) › Oversikt, seksjonen «Poster» | slås sammen (adressen blir IUP-ens Oversikt; postene står i Oversikt) |
| 23 | `/team-norway/spiller/[spillerId]/oversikt` | TN-02 IUP-oversikt med hovedtall, tester, lisens, IUP, aksefordeling | `hentTnSpillerProfil`, `hentTnSpillerTester`, `hentTnSpillerLisens`, `hentTnSpillerIup`, `hentTnSpillerAksefordeling` | `hentTnSpillerTilgang` (navngitt deling), ellers 404 | Spillerprofil (IUP) › Oversikt (`/team-norway/spiller/[id]`) | flyttes (til `/spiller/[id]`) |
| 24 | `/team-norway/spiller/[spillerId]/profil` | Komplett profil: identitet, offisielle resultater, tester, IUP | `byggKomplettProfil`, `byggProfilVisning` via `medTnSpillerData` | Navngitt deling; Golf-ID bare for trener | Spillerprofil (IUP) › Oversikt (identitet) og › Turneringer (offisielle resultater) | slås sammen |
| 25 | `/team-norway/spiller/[spillerId]/analyse` | Utvikling per protokoll, Strokes Gained/TrackMan-sammendrag | `hentTnSpillerTester`, `hentTnSpillerAnalyseHub` | Navngitt deling | Spillerprofil (IUP) › Tester, visningen «Utvikling» | slås sammen |
| 26 | `/team-norway/spiller/[spillerId]/evaluering` | Fireukerssjekk: levert IUP, nyeste tester, teknisk plan, neste tiltak | `hentTnEvalueringGrunnlag`, `hentTnSpillerIup` | Roster-port + `medTnSpillerData` | Spillerprofil (IUP) › Fireukerssjekk | beholdes (adressen står; fanen heter Fireukerssjekk) |
| 27 | `/team-norway/spiller/[spillerId]/teknisk-plan` | TN-23 tekniske planer for én spiller | `hentTnTekniskPlaner` | Roster-port + `medTnSpillerData` | Spillerprofil (IUP) › Teknisk plan | beholdes |
| 28 | `/team-norway/spiller/[spillerId]/teknisk-plan/[planId]` | Plandetalj, logg reps, oppgaver | `hentTnTekniskPlanDetalj`, `tnLoggRep`, `tnOpprettOppgave` m.fl. | Som #27; full validering i actionene | Spillerprofil (IUP) › Teknisk plan (underside) | beholdes |
| 29 | `/team-norway/spiller/[spillerId]/tester` | T4: alle 19 testene i tre deler, pluss tester utenfor batteriet | `hentTnSpillerTester`, `hentTnSpillerOvrigeTester`, `TESTBATTERI` | Navngitt deling | Spillerprofil (IUP) › Tester | beholdes |
| 30 | `/team-norway/spiller/[spillerId]/tester/[testId]` | Historikk og siste forsøk for én protokoll | `hentTnSpillerTestDetalj`, `hentTnSpillerOvrigTestDetalj` | Navngitt deling | Spillerprofil (IUP) › Tester (underside) | beholdes |
| 31 | `/team-norway/spiller/[spillerId]/turneringsplan` | Turneringsplanleggeren; treneren foreslår, spilleren godtar | `byggPlanvisning` (`src/lib/turneringsplan/data`), `Turneringsplanlegger rolle="tn"` | Navngitt deling | Spillerprofil (IUP) › Turneringsplan | beholdes |
| 32 | `/team-norway/spillere` | TN-12 spillerutvikling: bånd «Trenger deg · Følger planen · Ikke delt · Uten plan», søk `?q=` | `hentTnSpillere`, `hentTnGruppetrening`, `hentTnSamlinger` | Ikke-spillere; ikke-delte bare som antall | Spillere › Spillere (liste med søk og filter) | beholdes (får filter gruppe, klasse, kjønn, delingsstatus; ikke-delte vises med navn og offentlig ranking, se C5) |
| 33 | `/team-norway/tilgang` | TN-19 trenere og tilgang: legg til, avslutt, rolle, perioder | `hentTeamNorwayTilganger`, `tn-tilgang-actions.ts` | `erSportssjef` (ADMIN eller aktiv TN-COACH) | Fag og administrasjon › Trenere og tilgang | beholdes |
| 34 | `/team-norway/turneringer` | TN-07 kommende eller fullførte turneringer | `hentTnTurneringer`, `hentTnSpillere` | Alle i TN-gruppa | Turneringer › Turneringer | beholdes |
| 35 | `/team-norway/turneringer/[id]` | Én turnering med resultater og påmeldinger | `hentTnTurneringer`, `hentTnSpillere` | Alle i TN-gruppa | Turneringer › Turneringer (underside) | beholdes |
| 36 | `/team-norway/turneringer/ny` | Spilleren legger inn turnering i egen plan | `hentTnArbeidskontekst`, `TnTurneringNyVisning` | Bare spillere (trenere får 404) | PlayerHQ `/portal/tren/turneringer` | blir videresending (spilleren planlegger i PlayerHQ, §ÉN IUP; venter på svar, se Uavklart 1) |
| 37 | `/team-norway/uttak` | TN-05 tre uttakskriterier, uttak per arrangement med frist og plasser | `hentTnRangliste`, `hentTnUttak`, `hentTnUttaksrunder` | Ikke-spillere | Turneringer › Uttak | beholdes |
| 38 | `/team-norway/wang-resultater` | WANG-elevers testresultater, 50 per side | `hentWangTestresultatSkolerForTeamNorway`, `prisma.testResult` | Ikke-spillere med gyldig WANG-testsamtykke; ellers «Ingen tilgang» | Samlinger og testing › WANG-tester | beholdes (får menyplass; i dag bare lenket fra Skoler) |
| 39 | `/team-norway/workbench` | TN-22 gruppens årsplan; med `?spiller=` en spillers plan | `tn-workbench.ts`, `wb-actions`, `medNavngittProfil` | Aktiv TN-rolle; spillere sendes til PlayerHQ; personlig plan krever deling | Fag og administrasjon › Årsplan (gruppa) · Spillerprofil (IUP) › Trening (`?spiller=`) | beholdes (`?spiller=` sender videre til `/spiller/[id]/trening`) |

## B. Delene av teamnorwayref

Kilde: `origin/main` i `ak-golf-pipelines`. Menyen der: Spillere · Turneringer · Planlegger · Norsk golf · Tester ·
Målestokk · I HQ. Alt ligger i dag bak ett felles passord (`scripts/maler/teamnorwayref/middleware.js`).

| # | Del | Hva den gjør | Data den leser | Hvem ser den i dag | Ny plass | Utfall |
|---|---|---|---|---|---|---|
| B1 | Spillere › Leaderboard | WAGR-rangering for gruppene Junior (to beste juniorer per nordisk land), Amatør (én per nivå) og Norge (35 herrer); spillerprofil med turneringer og WAGR-plass år for år | `pipelines.wagr_profiler` (`profiler8.json`, `nivaa7.json`, `norske.json`) bygget inn i siden; kilde «World Amateur Golf Ranking (WAGR), The R&A», datagrunnlag-dato | Alle med felles passord; navn i alle aldre | Referanse › WAGR (leaderboard og graf) | flyttes |
| B2 | Spillere › Sammenlign | To spillere side om side: WAGR, score, poeng, felles turneringer | Som B1 | Som B1 | Referanse › Sammenlign | flyttes |
| B3 | Spillere › Søk alle norske | Søk på navn, klubb, fødselsår, tour; maks 50 treff, profil | HQ-RPC `alle_norske_sok`, `alle_norske_profil` (`prisma/migrations/20261020180000_alle_norske_sok`); bare født 2005 eller tidligere, bare brutto | Som B1 | Referanse › Søk | flyttes |
| B4 | Spillere › Søk HCP-juniorer | Snarvei til HCP Norge › Søk | Se B11 | Som B1 | Referanse › HCP Norge › Søk | slås sammen (med B11) |
| B5 | Turneringer › Turneringer | Alle WAGR-turneringer spillerne har spilt: runder, Power, poeng, plass før og etter | Som B1 | Som B1 | Referanse › WAGR, visningen «Turneringer» | flyttes |
| B6 | Turneringer › Sesong | Én prikk per turnering per spiller; farge Power, størrelse poeng, rød ring seier | Som B1 | Som B1 | Referanse › WAGR, visningen «Sesong» | flyttes |
| B7 | Planlegger | Turneringsplan 2027 per norsk herre: topp 10-sjanse, forventet plass, poeng; forslag og samlinger | `planlegger.json`, WAGR-cache, `power_historikk.json`; lagres i HQ-tabellen `wagr_reference_plans` (`WagrReferencePlan`) | Som B1; skriving krever HQ-innlogging og `wagr_reference_plans_editor` | Referanse › Planlegger (WAGR-spillere uten HQ-konto). For spillere med HQ-konto: IUP › Turneringsplan (#31) | flyttes |
| B8 | Norsk golf › Spillere | Hele registeret med filter (tour, år, kjønn, alder, region, klubb), snitt, justert snitt, A–K, HCP | `norsk/register.json` fra `pipelines/norsk_golf/register.py` (`dashboard.tournament_results`, `persons`, `v_runde`, `person_niva`, `wagr_players`); brutto, `class_code !~ 'N$'` | Som B1; navn i alle aldre, med fødselsår | Referanse › Norsk golf › Spillere | flyttes (barnevern: se Uavklart 3) |
| B9 | Norsk golf › Klubber | Spillere per klubb, aktive og nivå | Som B8 | Som B1 | Referanse › Norsk golf › Klubber | flyttes |
| B10 | Norsk golf › Regioner og Tourer | Per NGF-region; feltstyrke og typisk score per tour | Som B8, `dashboard.turnering_feltstyrke` | Som B1 | Referanse › Norsk golf › Regioner · Tourer | flyttes |
| B11 | Målestokk › HCP Norge (Oversikt, Klubber, Regioner, Søk) | Normkurve og forventet fremgang for juniorer 8–18 år, klubbeffekt, søk med profil | Excel-uttaket «Grunndata for Utviklingskurven» via `pipelines.hcp_utvikling.bygg` (`hcp/statistikk.json`, `hcp/spillere.json`), ikke databasen | Som B1; navngitte juniorer fra 8 år | Referanse › HCP Norge | flyttes (barnevern: se Uavklart 3; datakilden må inn i basen eller som fil fra pipelines) |
| B12 | Tester › Testbatteriet og Protokoller | De 19 testene i tre deler; oppsett, slag og poeng per protokoll | `eksport_tn_testfag.mts` leser `TESTBATTERI` og `TN_CATALOG` fra HQ | Som B1; ingen persondata | Fag og administrasjon › Testprotokoller (#15) | slås sammen (HQ har dette fra før) |
| B13 | Tester › Referansenivåer | Median og antall per protokoll uten navn; aldri «beste»; ingen celle under 5 | `les_tn_testresultater.mts` (`test_results`, `users`, `group_members`, `delings_samtykker`), `pipelines.tn_tester.samle` | Som B1 | Referanse › Tester | flyttes (slås sammen med #18) |
| B14 | Målestokk › DataGolf | Fjernet fra bygget (`--uten-datagolf`), lisensen tillater ikke visning for trenere | — | Ingen | Fag og administrasjon › Data Golf (bare ADMIN, #7) | slås sammen (finnes bare i HQ for ADMIN) |
| B15 | I HQ › Team Norway i HQ | Lenkekort til 11 HQ-flater og «Logg inn i HQ» | Ingen | Som B1 | Erstattes av selve menyen | blir videresending (lenkesiden trengs ikke når flaten er i HQ) |
| B16 | Innlogging (felles passord, `middleware.js`) | Ett brukernavn og passord, cookie `tnr_sesjon` i 14 dager | Vercel-miljøvariabler | Alle med passordet | HQ-innloggingen `/teamnorway` | blir videresending (når Anders sier fra, punkt 9 i beslutningen) |

## C. Nye funksjoner (finnes ikke i dag)

| # | Adresse | Hva den gjør | Data | Hvem ser den | Ny plass | Utfall |
|---|---|---|---|---|---|---|
| C1 | `/team-norway/profil` | Min profil: navn, rolle, e-post og telefon, gruppene og spillerne treneren har tilgang til, egne saker | `hentTnTrenere`/`hentTeamNorwayTilganger` (navn, e-post, rolle, `joinedAt`), `hentTrenerensDelteSpillere` (`src/lib/deling/treneroversikt.ts`), uttak og forslag treneren eier | Den innloggede treneren selv | Navnet nederst i menyen | ny |
| C2 | `/team-norway/spiller/[id]/ranking` | WAGR-plass og NGF-juniorranking over tid | `public_players."wagrId"` + WAGR-tabellene fra pipelines; NGF-juniorranking finnes ikke i appen (`src/lib/iup/maaltall.ts:25`, kilde IKKE) og vises «—» | Navngitt deling; WAGR-plass også uten deling (offentlig) | IUP › Ranking | ny |
| C3 | `/team-norway/spiller/[id]/turneringer` | Progresjon i turneringer over tid: til-par per runde, plassering, brutto snitt per sesong | `public_player_entries.scoreToPar`, `public_player_rounds` via profilkobling (som #24 og #17) | Navngitt deling | IUP › Turneringer | ny (offisielle resultater fra #24 flytter hit) |
| C4 | `/team-norway/spiller/[id]/trening` | Spillerens plan og gjennomført trening, aksefordeling | Workbench personlig plan (#39 `?spiller=`), `hentTnSpillerAksefordeling` | Navngitt deling (Komplett profil) | IUP › Trening | ny (bygger på #39) |
| C5 | Spiller uten deling (tilstand i `/spiller/[id]`) | Navn, klubb og offentlig ranking (WAGR); forklaring på hvordan spilleren deler | `public_players` (WAGR), gruppemedlemskap | Trenere i TN-gruppa; barnevern: født 2008 eller senere vises bare innenfor innloggingen | IUP (alle faner viser samme tilstand) | ny (i dag gir alle IUP-faner 404) |
| C6 | `/team-norway/referanse/*` | Referanse-delen (B1–B13) | Se B | Trenere i TN-gruppa (innlogget) | Referanse | ny |

## D. Kontroll

- Rader i A: 39, lik `find src/app/team-norway -name page.tsx | wc -l` på `origin/main` 21.10 (5c7bc1508).
- Hver rad i A, B og C har ett utfall. Ingen rad sier «fjernes».
- Gamle adresser som må sende videre (pakke g): #5 (gjort), #18, #22 (blir Oversikt), #23, #24, #25, #36, #39 med
  `?spiller=`, og teamnorwayref B15–B16 når Anders sier fra.

## Uavklart (spørsmål til Anders sammen med wireframes)

1. **Spillere i `/team-norway`.** I dag åpner spillere i TN-gruppa en egen spillervisning (Oversikt, Samlinger,
   Turneringer, Lisens, «Ny turnering»). Ny flate er for trenere. Anbefaling: spillere sendes til PlayerHQ
   (`/portal`), og samlinger og månedsplan vises der. Krever et ja før pakke (a).
2. **Lenken fra PlayerHQ** (etappe 4): spilleren kan ikke åpne trenerdelen. Anbefaling: «Se hva Team Norway ser»
   (`/portal/meg/deling/innsyn`, i dag en trenerside, må få en spillervisning) og Referanse-delen.
3. **Barnevern i Referanse.** teamnorwayref viser navngitte juniorer fra 8 år (HCP Norge) og alle aldre (Norsk golf)
   fordi siden er bak passord. §Data i beslutningene sier at spillere født 2008 eller senere uten samtykke aldri vises
   åpent. Bak trenerinnloggingen er ikke åpent, men det er flere personer enn i dag (alle TN-trenere med HQ-konto).
   Anbefaling: navn bak innlogging som i dag på teamnorwayref, men WAGR-delen først, HCP Norge og Norsk golf etter
   et eget ja.
4. **Referansenivåer:** HQ viser «beste» per test; teamnorwayref viser aldri «beste» og ingen celle under 5.
   Anbefaling: teamnorwayrefs regel gjelder i den sammenslåtte siden.
