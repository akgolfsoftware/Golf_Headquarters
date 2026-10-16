# Data Golf for coach: datakart og skjermliste (15.10.2026)

Grunnlag for utkastene til AgencyOS, WANG og Team Norway. Data Golf vises bare for coach-rollen og ADMIN
(`src/lib/auth/datagolf-regel.ts`, beslutning 06.10/09.10). Spilleren ser aldri disse skjermene.

Status før dette dokumentet: DG-01–DG-17 var tegnet i alle tre Claude Design-prosjektene og kontrollert 02.10
(`docs/design-audit/datagolf-precision-wang-team-norway-2026-10-02.md`), men ingen er sett av Anders, ingen er i koden,
og de ble tegnet før designbrevet 13.10 og før «bare coach». Denne lista erstatter dem som byggeunderlag.

## 1. Det vi faktisk har i basen

Lest fra `prisma/schema.prisma`, `src/lib/datagolf/`, `src/lib/stats/pga-sync.ts`, `src/lib/turneringer/sync.ts` og `vercel.json`.

| Hva | Tabell | Innhold | Hentes | Brukes i dag |
|---|---|---|---|---|
| Ferdighetsprofil per proff | `DatagolfTak` | SG total/utslag/innspill/nærspill/putting, driver lengde og treff, DG-rang, OWGR, tour, kildedato. Alle spillere i Data Golfs skill-ratings, seks navn først (`tak-roster.ts`) | ukentlig, cron `datagolf-tak` og `datagolf-sync` | PlayerHQ `/portal/analysere/datagolf`, stasjonen |
| Innspill per avstand | `DatagolfTakBand` | per proff: fire intervaller (50–100, 100–150, 150–200, 200+ yards) × fairway/rough: nærhet i meter, SG per slag, greentreff, gode slag, antall slag | samme synk | stasjonen (tak-pakke) |
| Sesongtall per proff | `PgaPlayerSeason` | per tour og år: runder, snittscore, driver, fairway %, GIR %, putt per runde, scrambling, SG fem felt | ukentlig, cron `pga-skill-ratings` | `/stats/pga` topplister, PGA-profil |
| Tour-snitt innspill | `PgaApproachDistance` | per år og yard-bøtte: snitt nærhet i meter og GIR % | ukentlig, cron `pga-approach` | `/stats/pga` |
| Putt per avstand | `PgaPuttDistance` | per avstand: senket % tour og topp 10 | Broadie-estimat, ikke Data Golf | `/stats/pga/putt-explorer` |
| Norske proffer | `PublicPlayer.dataGolfId` | kobling norsk spillerprofil ↔ Data Golf-ID (`syncNorwegianPlayers`) | manuelt/ved synk | stats-profil, PlayerHQ |
| Resultater norske proffer | `PublicPlayerEntry` + `PublicPlayerRound` (`source = DATAGOLF`) | plassering, score, til par, per runde SG fem felt, driver, GIR | mandag, pipelines | stats-profil, TN-rangliste (filtrert bort for ikke-coach) |
| Turneringskalender | `Tournament` (`sourceOrigin = DATAGOLF`) | tourens kalender med dato, bane, tour | `syncDataGolfSchedules`, Vercel-cron | `/stats`, `/turneringer` |
| Live leaderboard | `LeaderboardSnapshot` (`source = DATAGOLF`) | hele API-svaret per turnering, med hentet-tidspunkt. Bare tour `pga` og `opp` har live | `syncLiveLeaderboards` under aktiv turnering | `/stats` live-snapshot |
| Synkstatus | `DatagolfSyncState` | per endepunkt: sist synket, rader, status, feil | skrives av pipelines | ingen skjerm |
| Spillerens egne tall | `Round` (SG fem felt + per avstand, `sgSource`), `BrukerSgInput` | egne runder slag for slag, SG beregnet med Broadie-grunnlag | spilleren registrerer | PlayerHQ Stats, Spiller 360 |
| Normer for tester | `benchmarks_pending` på testprotokoll | foreslåtte Data Golf-justeringer coach godkjenner | `runBenchmarkSync` | `/admin/tester/benchmarks` |

Det vi **ikke** har lagret, og derfor ikke tegner som ekte skjerm: banestatistikk og feltstyrke, modellprognoser og odds (24 felt, skal
uansett ikke vises), hull-for-hull-data, spesialistregister, «trend og utvalgsbygger» på tvers av endepunkter. Klienten kan hente
`getTournamentField` og `getDgRankings`, men ingen skjerm leser dem.

**Lisens:** kundedistribusjon av Data Golf-tall er ikke dokumentert (kontroll 02.10, krav 1). Skjermene kan tegnes og bygges for
Anders' egen bruk i AgencyOS. WANG- og TN-trenere får dem først når bruksretten er avklart.

## 2. Hva coachen skal få ut av dataene

Tre spørsmål coachen stiller, og hvilke data som svarer:

1. **Hvor langt unna er spilleren, og hvor?** Spillerens egne SG (Broadie, merket estimat) mot proffens målte SG per område
   gir gap per område. Innspill per avstand gir gapet i meter. Svar: DG-05 og DG-06.
2. **Hva skal vi trene på?** Gapet blir en øvelse med proffens nærhet som sirkel (stasjonen finnes), og et planforslag i
   Workbench som spilleren får. Svar: DG-06 og DG-07.
3. **Hvordan går det med våre?** Norske proffers resultater og live-stilling, med kildedato. Svar: DG-08.

## 3. Coach-skjermliste (felles for AgencyOS, WANG og Team Norway)

Ni skjermer. Samme ID og innhold på alle tre flatene; bare skallet og tokens er ulike. Aksen er SLAG (`--slag`).

| ID | Skjerm | Innhold | Data | Erstatter (02.10) |
|---|---|---|---|---|
| DG-01 | Oversikt | Datadekning (antall proffer, kildedato, siste synk), norske proffer denne uka, inngang til katalog, topplister, sammenligning, resultater. «Powered by Data Golf» | `DatagolfTak`, `DatagolfSyncState`, `LeaderboardSnapshot` | DG-01 |
| DG-02 | Proffkatalog | Søk og filter (tour, land, norske først, sortering på SG). Rad: navn, land, SG total, DG-rang | `DatagolfTak`, `PgaPlayerSeason` | DG-02 |
| DG-03 | Proffprofil | SG fem felt med kildedato, driver, rangering, innspill per avstand (fairway/rough), sesongtall per tour, siste resultater (bare norske) | `DatagolfTak`, `DatagolfTakBand`, `PgaPlayerSeason`, `PublicPlayerRound` | DG-03 |
| DG-04 | Topplister | Seks kategorier (SG total, snittscore, driver, fairway %, GIR %, putt per runde), filter tour og år, minst N runder | `PgaPlayerSeason` | DG-04 |
| DG-05 | Spiller mot proff | Velg spiller i stallen og proff. Per område: spillerens SG (estimat) mot proffens, gap i slag. Snittscore, fairway, GIR med hver sin kilde og antall runder. «—» når det mangler. Aldri justert nivågap fra ulike baner | `Round`, `BrukerSgInput`, `DatagolfTak`, `PgaPlayerSeason` | DG-05 |
| DG-06 | Innspill-tak | Per avstand × leie: proffens nærhet i meter mot spillerens (når slagdata finnes). Knapp: «Lag øvelse» med sirkel fra proffens tall (stasjonen) | `DatagolfTakBand`, `Round` per avstand, `stasjon.ts` | DG-06 |
| DG-07 | Fra funn til forslag | Funnet (område, gap), målsetning, planforslag (økter per uke, antall uker) som sendes til spillerens Workbench. Spilleren godtar; anvendes én gang; konflikt ved nyere plan | `WorkbenchSession`, forslag (`lagTrenerforslag`) | DG-16 |
| DG-08 | Norske proffer | Live (hentet kl., stilling, runde) under turnering; resultater per turnering med per runde SG; kommende turneringer | `LeaderboardSnapshot`, `PublicPlayerEntry/Round`, `Tournament` | DG-07, DG-08, DG-10 |
| DG-09 | Kilde og dekning | Per endepunkt: sist synket, rader, feil. Hva som ikke hentes. Lisensstatus. Ingen eksport | `DatagolfSyncState`, `vercel.json` | DG-14, DG-15 |

Utgår uten erstatning: DG-09 turneringsanalyse, DG-11 modellanalyse, DG-12 bane og felt, DG-13 trend og utvalg, DG-17 spesialistregister.
Grunn: ingen lagring, og odds/modell skal ikke vises. Tas opp igjen bare med ny lagring og avklart lisens.

## 4. Plassering per flate

| Flate | Inngang | Skall |
|---|---|---|
| AgencyOS | Mer › Data Golf (sjette punkt, se Åpent) · Spiller 360 › Stats «Mot PGA Tour» → DG-05 for spilleren · Workbench-øvelse «Fra Data Golf» → DG-06 | `utkast-agencyos/felles` |
| WANG | Konkurranse › DataGolf (WANG-50 i `wang-data.ts`, underpunktene kuttes til DG-01–09) | WANG-tokens |
| Team Norway | Analyse › Data Golf (lenken ble fjernet 09.10; kommer tilbake bare for trenere med COACH-rolle) | TN-tokens |

## 5. Tilstander som må tegnes

Normal · tom (ingen synk ennå) · laster · feil (siste synk feilet, viser forrige data med dato) · delvis (proff uten innspillsdata,
spiller uten egne runder) · ingen tilgang (ikke coach: siden finnes ikke) · forsinket (synk eldre enn 14 dager, gul pille).

## 6. Regler som gjelder

- Alle tall har kilde og dato. Målte tall (resultater) skilles fra modelltall (skill ratings) og estimater (Broadie).
- Null vises som «—». 0 er målt null. Ingen tall gjettes.
- Proffnavn er ekte (offentlige proffspillere, beslutning 27.09). Tallene i utkastene er eksempeltall, merket.
- Spilleren ser aldri sammenligning med andre. Spillernavn i utkastene er stallen i `felles/demo.js`.
- Rust bare som signal (feilet synk). Primærknapp grafitt. Aksefarge SLAG på fylte flater og valgte filtre.
- Ingen sidelengs rulling i 390 og 1280.

## Åpent hos Anders

1. **Mer får et sjette punkt «Data Golf».** Beslutningen 28.09 sier fem punkter. Alternativet er bare inngang via Spiller 360 › Stats.
2. **Lisens** for WANG og TN. Uten den tegnes WANG/TN-utkastene, men bygges ikke.
3. **Tour-snitt innspill** (`PgaApproachDistance`) er ikke per proff. DG-06 bruker proffens egne band; tour-snittet vises som referanse.
