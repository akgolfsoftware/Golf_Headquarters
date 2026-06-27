# AK Golf Intelligence — konsolidering (kartlegging + oppgavebeskrivelse)

> **Dato:** 2026-06-27
> **Mål (Anders):** All stats, SG, DataGolf, testresultater osv. skal samles i ÉN kilde —
> **AK Golf Intelligence** — og **AK Golf HQ skal lenke til** den kilden, ikke ha sin egen duplikat-kopi.
> **Status:** Kartlegging ferdig. Delbar Intelligence-API (v1) bygget + pushet (2026-06-27). Datakobling fra HQ gjenstår.

---

## ✅ TO-DO — gjenstående oppgaver (oppdatert 2026-06-27)

**Ferdig:**
- [x] Kartlegge overlapp mellom akgolf-hq og ak-golf-intelligence (denne planen)
- [x] Bygge delbar lese-API i Intelligence (`/api/v1`, API-nøkkel-auth, 16 endepunkter) — committet + pushet (`7753b4e`)

**Gjenstår (Anders / manuelt):**
- [ ] **Sett `INTELLIGENCE_API_KEY` tre steder:** Vercel (ak-golf-intelligence) + HQ `.env.local` + 1Password. Verdi: `grep '^INTELLIGENCE_API_KEY=' ~/Developer/ak-golf-intelligence/.env`
- [x] **Avklar hvilken Supabase `DATABASE_URL` som er prod/delt.** ✅ **Funn 2026-06-27:** HQ og Intelligence deler SAMME Supabase-prosjekt (`postgres.eljkjqvggsmnbbszzbpj`), men bruker hver sin **Postgres-schema**: HQ = `public` (140 tabeller), Intelligence = `dashboard` (49 tabeller). **All ekte golf-data ligger i HQ sin `public`-schema** (`pga_player_seasons`=1332, `tournaments`=2111, `wagr_snapshots`=14). **Intelligence sin `dashboard`-schema er tom** (dg_/wagr_/tournaments = 0, kun `dg_tours`=26). Duplikatet er altså to parallelle schema i én DB, der bare HQ-siden er fylt.
- [ ] **🚨 NY BESLUTNING (blokkerer datakobling):** Intelligence skal være master, men `dashboard`-schemaet er tomt. Hvordan fyller vi det? (a) Kjør Intelligence sine Python-pipelines mot delt prod-DB, (b) engangs-migrer HQ sin `public`-golf-data inn i `dashboard`, eller (c) snu retning — HQ sin `public` er master og Intelligence leser derfra. Se §6.6.
- [ ] **Beslutning:** `/stats/*`-eierskap — bekreftet «bli i HQ, hent data fra Intel» (§6.2). Ingen flytting av ruter.

**Gjenstår (kode — egne runder, når nøkkel + prod-DB er på plass):**
- [ ] Bygg tynn HQ-klient (`src/lib/intelligence/client.ts`) som henter fra `/api/v1/*` med nøkkel
- [ ] Bytt HQ-leserne over til Intel-API, ett domene om gangen: WAGR → DataGolf-benchmarks → turnering/proff → kohort → college
- [ ] Fjern HQ sin egen DataGolf/WAGR-synk + arkiver de duplikate Prisma-modellene (se §4) når de ikke lenger leses/skrives
- [ ] Konsolider SG-benchmark-kalibrering til én kilde (HQ «Team Norway IUP» vs Intel «Broadie HCP» — §6.4)

> Kontrakt for API-et: `ak-golf-intelligence/docs/public-api.md`.

---

## 1. Oppgaven, i klartekst

I dag finnes golf-«intelligence»-data (proff-statistikk, SG-benchmarks, WAGR, turneringer, kohort,
college) **to steder samtidig**, i to ulike kodebaser med ulik teknologi. Det betyr dobbelt vedlikehold,
to sannheter og fare for at tallene spriker.

Oppgaven er å gjøre **AK Golf Intelligence** til den ene eieren av all slik referanse-/analysedata, og
la **AK Golf HQ** (coaching-appen) **hente** dataene derfra i stedet for å synke og lagre sine egne.
Det som er ekte coaching-data (en spillers egne runder, økter, tester, TrackMan) blir værende i HQ —
men HQ leser benchmarks/kohort/WAGR fra Intelligence.

---

## 2. De to prosjektene

| | **AK Golf HQ** (`akgolf-hq`) | **AK Golf Intelligence** (`ak-golf-intelligence`) |
|---|---|---|
| Hva | Coaching-plattform: spiller-app + coach-admin + booking + marketing | Talent-/analyse-dashboard: scouting, proff-data, kohort |
| Stack | Next.js 16 · Prisma · Supabase · npm | Vite + Express + tRPC · Drizzle · Supabase · Python-pipelines · pnpm |
| Repo | `akgolfgroup-netizen/akgolf-hq` | `akgolfgroup-netizen/ak-golf-intelligence` |
| Datatyngde | Spillernes egne runder/økter/tester | **295k DataGolf-runder, 3 458 spillere, 59 WAGR-spillere + 9 025 events, 66k norske turneringsrunder × 902 turneringer, kohort-baselines, 60 college-spillere** |

**Kort:** Intelligence er allerede det datatunge «hjernekontoret». HQ er produktet spillere/coacher bruker.

---

## 3. Overlapp-matrise (hvor bor hvert domene + dom)

| Domene | I AK Golf HQ | I AK Golf Intelligence | Modenhet HQ / Intel | Dom |
|---|---|---|---|---|
| **DataGolf (proff)** | Lett: ukentlig synk av PgaPlayerSeason + SgBaseline (kun benchmark-feed) | Dyp: 16 Python-pipelines, full backfill, 295k runder | mellom / **90%** | **Intel kanonisk.** HQ skal slutte å synke selv. |
| **WAGR** | WagrSnapshot + manuell import, ingen cron (svak) | 59 NO-spillere, ukentlig CI-synk, pipelines | stub / **95%** | **Intel kanonisk.** HQ-versjon er duplikat. |
| **Turnering/proff-spillere** | Tournament, TournamentResult, PublicPlayer, LeaderboardSnapshot + hele `/stats/*` | tournaments + tournamentResults (66k runder), cohort-views | live / **90%** | **Delt sannhet i dag → Intel bør eie rå-dataene.** (se §6 om `/stats`) |
| **Kohort** | Stub (kun admin-visning, ingen percentiler) | Materialiserte views p10–p90, 7 segmenter × 12 år | stub / **90%** | **Intel kanonisk.** |
| **College** | Ikke implementert | 60 NO-spillere scrapet (clippd) | – / **40%** | **Kun Intel.** |
| **SG-benchmarks** | SgBaseline (Broadie + Team Norway-kalibrert) | sgBenchmarks (HCP-stratifisert Broadie) | live / 50% | **Konsolider til én benchmark-kilde i Intel.** |
| **PGA-stats-visning** | Stor offentlig `/stats/pga/*`, verktøy, wrapped | Intern `DataGolfTerminal` / `DataGolfProfil` | live / 90% | Samme rådata, ulikt publikum (se §6). |
| **SG (spillerens egen)** | Live-motor på spillerens egne runder (coaching) | Live-beregning fra proff-runder (scouting) | live / 50% | **Ulikt formål — ikke ekte duplikat.** HQ beholder, leser benchmark fra Intel. |
| **Tester / test-batteri** | Full + **ekte resultater**, integrert i coaching (TestResult/Session/Assignment) | 20 protokoller klare, **0 reelle resultater** | **live** / 85% | **HQ er den ekte bruks-kilden.** Protokoll-definisjoner kan deles. |
| **TrackMan** | Full (Session/Shot/ClubMetricTrend), CSV-import, coaching | Finnes ikke | live / – | **Kun HQ.** Blir værende. |
| **Talent (spiller)** | TalentTracking radar + roadmap (spillerens egen reise) | Talent-scoring/matching/sammenligning (scouting på tvers) | live / 70% | **Ulikt formål** — HQ = min reise, Intel = scouting. |
| **Multi-brand AK/WANG/TN** | (halvferdig, parkert i stash) | brandTheme + org-tilknytning (80%) | stash / 80% | Intel lengst — vurder å arve mønsteret. |

**Hovedfunn:** Ekte duplikat (som bør samles i Intel) er **DataGolf, WAGR, turnerings-/proff-data,
kohort, college og SG-benchmarks**. Det som bare _ser_ likt ut, men har ulikt formål, er **spillerens
egen SG, tester (faktisk brukt i HQ), TrackMan og spiller-talent** — de blir i HQ.

---

## 4. Prisma-modeller i HQ som er «referanse/intelligence» (flytte-kandidater)

Disse i `akgolf-hq/prisma/schema.prisma` er rene referansedata HQ ikke trenger å eie selv:

```
SgBaseline                 → benchmark, finnes bedre i Intel (sgBenchmarks)
PgaPlayerSeason            → DataGolf-aggregat, Intel har 295k runder
PgaPuttDistance            → DataGolf, Intel (dgApproachSkill m.fl.)
PgaApproachDistance        → DataGolf, Intel
WagrSnapshot               → WAGR, Intel (wagrPlayers/wagrEvents) er kanonisk
Tournament / TournamentResult / PublicPlayer / PublicPlayerEntry / LeaderboardSnapshot
                           → turnerings-/proff-data, Intel eier rå-laget
Bane (delvis)              → bane-master kan deles
```

**Blir i HQ (ekte coaching-eierskap):** `Round`, `Shot`, `HoleScore`, `CourseDefinition`,
`BrukerSgInput`, `SgInsight`, `BrukerSammenligning`, `BestSessionReference`, `ClubMetricTrend`,
`ShotAnnotation`, `TrackManSession/Shot`, `TestDefinition/Result/Session/Assignment`,
`TalentTracking`, `TalentRessurs`, `TrainingLog`.

---

## 5. Hvordan «lenke» — tre arkitektur-alternativer

| Alt | Hvordan | Fordel | Ulempe |
|---|---|---|---|
| **A. API (anbefalt)** | Intelligence eksponerer et lese-API (tRPC/REST). HQ kaller det for benchmarks, WAGR, kohort, proff-data. HQ slutter å synke selv. | Ren grense, én sannhet, Intel eier pipelines | Krever at Intel-API bygges/hostes stabilt |
| **B. Delt database (read-only)** | Begge peker på samme Supabase. Intel skriver referanse-tabellene, HQ leser dem. | Minst nytt å bygge | To ORM-er mot samme schema = skjør; må avklare eierskap |
| **C. Snapshot-eksport** | Intel publiserer datasett (JSON/Parquet) HQ importerer på kadens. | Helt frakoblet | Ferskhet/lag; mest rør |

**Anbefaling:** Sikt mot **A**. Pragmatisk mellomsteg kan være **B for de rene lese-tabellene**
(benchmarks, WAGR, kohort) hvis de to allerede deler Supabase-prosjekt — se åpent spørsmål under.

---

## 6. Åpne spørsmål (må avklares før flytting)

1. **Deler de to prosjektene samme Supabase-database, eller hver sin?** Avgjør om «duplikat» er to
   kopier av samme data, eller samme data lest to veier. (Sjekkes i `.env` på begge — jeg rørte dem ikke.)
2. **Hva skjer med det offentlige `/stats/*`-nettstedet i HQ?** Det er en stor markedsflate (PGA,
   turneringer, verktøy, wrapped) bygget på proff-data. Skal den (a) bli i HQ men hente data fra Intel,
   eller (b) flyttes til Intel og eksponeres derfra? Stort valg med SEO-/URL-konsekvenser.
3. **Test-protokoller:** definisjonene finnes begge steder; resultatene kun i HQ. Skal protokoll-
   definisjonene eies av Intel (delt katalog) og resultatene bli i HQ?
4. **SG-benchmark-kalibrering:** HQ har «Team Norway IUP»-kalibrering, Intel har Broadie HCP-stratifisert.
   Hvilken er fasit? Må samles til én.
5. **Multi-brand:** HQ har en halvferdig WANG/TN-variant i stash. Intel har et modent brandTheme-system.
   Skal HQ arve Intel sitt mønster?

6. **🚨 Master-schemaet er tomt (avklart 2026-06-27 — krever beslutning).** De to appene deler én
   Supabase-DB, men hver sin schema: HQ `public` (har dataen), Intelligence `dashboard` (tom). For at
   «Intelligence = master, HQ henter via API» skal gi ekte data, må `dashboard` fylles. Tre veier:
   - **(a) Kjør Intelligence-pipelinene mot delt prod-DB** — Python-pipelines (DataGolf 16 stk, WAGR CI)
     skriver til `dashboard.*`. Matcher opprinnelig mål, men krever API-nøkler + kjøretid + at pipelinene
     peker på riktig DB. Da blir Intel-API-et fylt og HQ kan konsumere.
   - **(b) Engangs-migrer HQ sin `public`-golf-data → `dashboard`** (SQL `INSERT INTO dashboard… SELECT … FROM public…`).
     Rask, men HQ sine tabeller har annen form enn Intelligence sine (mapping kreves), og bare HQ-delen finnes (ikke 295k DataGolf-runder).
   - **(c) Snu retningen:** HQ sin `public` er allerede den fylte kilden + serverer `/stats` offentlig.
     La HQ være master for det HQ allerede har, og Intelligence-API-et leser fra `public` (eller Intel
     beholder kun det unike: kohort/college/295k-DataGolf når de lastes). Minst flytting nå.

   **Inntil dette er valgt: ikke koble HQ-lesere til Intel-API-et — det ville hentet tomme svar.**

---

## 7. Foreslått rekkefølge (når retning er bekreftet)

1. Avklar §6.1 (delt DB?) + §6.2 (`/stats`-eierskap) + §5 (A vs B). *(beslutning, ikke kode)*
2. Frys videre dobbel-synk i HQ: ikke bygg mer DataGolf/WAGR-synk i HQ.
3. Definer Intelligence-lese-API (eller delt lese-schema) for: benchmarks, WAGR, kohort, proff-spiller/turnering.
4. Bytt HQ-lesere til å hente fra Intel, ett domene om gangen (WAGR → DataGolf-benchmarks → turnering → kohort), verifiser per domene.
5. Når en HQ-tabell ikke lenger skrives/leses lokalt: arkiver/fjern den (kirurgisk, egen commit).
6. Konsolider SG-benchmark-kalibrering til én kilde.

Hver flytting = egen verifisering (`prisma validate && tsc && build && test`) + commit.

---

## 8. Hva dette IKKE er

- Ikke en sammenslåing av de to appene til én. HQ forblir coaching-produktet; Intel forblir data-/scout-hjernen.
- Ikke flytting av spillernes egne runder/økter/tester/TrackMan ut av HQ.
- Ikke en destruktiv operasjon nå — dette dokumentet er grunnlaget; ingenting flyttes før du bekrefter retning.
