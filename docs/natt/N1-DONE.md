# N1 — Sikre DataGolf-tilførselen · VERIFISERT GRØNN

Utført 26.08.2026. Se `BOLGE-N-TALENTHQ-INN-2026-08-26.md` for planen.

**Status: koden er flyttet, secrets satt, og det nye repoet skriver beviselig til
produksjonsdatabasen.** Gjenstår: deaktiver cron i talenthq (så bare ett repo skriver),
og la det gå en uke før arkivering (N14).

## Verifisering mot prod — 26.08.2026 kl. 10:49 UTC

Kjøring [32960171249](https://github.com/akgolfsoftware/ak-golf-pipelines/actions/runs/32960171249),
`datagolf-sync.yml` (inkrementell, ingen inputs). Alle steg før backfill grønne, inkludert
pytest i CI. Radtall målt direkte mot `dcnxoztjtdqoidaekxry`:

| Tabell | Før | Under kjøring | Endring |
|---|---:|---:|---:|
| `dashboard.dg_rounds` | 630 764 | 632 024 | **+1 260** |
| `dashboard.dg_round_sg` | 630 764 | 632 024 | **+1 260** |
| `dashboard.dg_events` | 1 664 | 1 668 | +4 |
| `dashboard.dg_players` | 3 548 | 3 569 | +21 |
| `dashboard.dg_sync_state` | 1 511 | 1 515 | +4 |

Dette beviser hele kjeden fra det nye hjemmet: GitHub-secrets løses, DataGolf-API-et
svarer innenfor rate-limit, og Shared Pooler nås fra runneren (IPv6-fella unngått).

Merk: tallene i planens §0.2 (630 767) var estimater fra `pg_stat_user_tables`, ikke
opptelling. Eksakt `count(*)` ga 630 764 før kjøringen. Bruk `count(*)` når differanser
skal måles.

---

## Levert

Nytt repo: **`akgolfsoftware/ak-golf-pipelines`** (privat)
→ https://github.com/akgolfsoftware/ak-golf-pipelines
Lokalt: `~/Developer/ak-golf-pipelines`

| Innhold | Antall |
|---|---|
| Python-filer i 11 pipelines | 96 |
| GitHub Actions-workflows | 8 + egen `ci.yml` |
| Testfiler | 27 |
| Juridisk dokumentasjon | 5 docs + `source_registry.yaml` |
| Totalt committet | 129 filer, 23 420 linjer |

**Verifisert:** `pytest pipelines/tests/ -q` → **379 passed, 2 skipped**, lokalt og i CI
på GitHub (kjøring 32959444600, grønn).

Nye filer skrevet for repoet: `README.md` (pipeline-tabell, juridiske krav, kjente hull),
`CLAUDE.md` (seks harde regler), `.gitignore`, `ci.yml`.

## Utelatt bevisst

`pipelines/olyo/`, `pipelines/ostlands_tour/`, `pipelines/legacy_scrapers/` — alle tre
hadde **null** gjenværende `.py`-filer (kun `__pycache__`). GolfBox-pipelinen erstattet
dem, og akgolf-hq dekker de samme turneringene via `golfbox-customers.ts`.

## Avhengigheter utenfor `pipelines/` som testene avslørte

Kartleggingen min sa at `pipelines/` var selvstendig. Det stemte ikke — testkjøringen
fant tre filer som måtte følge med:

1. `scripts/import_golfbox_csv.py` — lastes av `test_golfbox_csv_import.py`
2. `drizzle/_archive_pre_baseline/0009_materialized_views.sql` — definerer de åtte
   materialiserte viewene; åtte tester validerer at `refresh_views.py` bruker samme navn
   og at ingen view slipper inn nettoscore
3. `drizzle/_archive_pre_baseline/meta_old/_journal.json` — samme testsett

Lærdom: kjør testene i det nye hjemmet før du tror en flytting er komplett.

## Funn: et workflow-steg som aldri har kunnet kjøre

Steget «Mirror WAGR events into tournaments» i `junior-tours-sync.yml` kjører
`node scripts/mirror-wagr-to-tournaments.mjs`. Jobbet har **verken `setup-node` eller
`npm install`**, mens skriptet importerer `postgres` og `dotenv`. På en ren
GitHub-runner finnes de ikke — så steget har feilet hver eneste kjøring, skjult av `|| true`.

Dette er sannsynlig årsak til det kjente hullet **«WAGR: 55 spillere, 0 events»**.

Beholdt uendret for å holde flyttingen 1:1, men markert med en advarsel i workflowen.
Skal fikses bevisst som egen oppgave — helst omskrevet til Python, siden repoet ellers
er rent Python.

---

## Utført av Anders

### 1. Fem secrets satt — 26.08.2026 kl. 10:48 UTC ✓

`DATAGOLF_API_KEY`, `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`. Hentet fra `~/Developer/ak-golf-talenthq/.env` og sendt rett
til GitHub med `gh secret set` — verdiene passerte aldri en AI-kontekst eller et
nettleserskjema.

Begge database-URL-ene pekte allerede på Shared Pooler
(`aws-1-eu-west-2.pooler.supabase.com`, port 6543/5432), så IPv6-fella var unngått.

`SUPABASE_STORAGE_BUCKET` er ikke satt — default `dashboard` gjelder.

### 2. Ekte kjøring verifisert ✓ — se tabellen øverst

---

## Gjenstår

### 3. Deaktiver cron i talenthq

Rekkefølgen er viktig — to repoer skal ikke skrive til samme database samtidig, men
talenthq må heller ikke stoppes før det nye hjemmet beviselig virker.

Når N1 er bekreftet grønn: deaktiver de fem cron-workflowene i talenthq (behold filene,
sett `on:` til kun `workflow_dispatch`), slik at bare ett repo skriver.

**Arkivering av talenthq (N14) krever at dette har kjørt grønt i minst en uke.**

---

## Rettelse til planen

Planen formulerte N1 som at «DataGolf-tilførselen stopper» ved arkivering. Det var litt
for dramatisk, og bør leses presist:

- **Fem cron-jobber** skriver til `dashboard.*` — de stopper ved arkivering.
- Veien til `public.*` (akgolf-hq sitt Prisma-skjema) går kun gjennom
  `datagolf-public-sync.yml`, som er **manuell** (`workflow_dispatch`, default
  `max_events: 1`). Det er et kontrollert innlastingsverktøy, ikke en løpende strøm.

Begge deler går tapt ved arkivering, så N1 er fortsatt riktig og nødvendig først — men
det var ikke en aktiv datastrøm som stod i fare for å brytes i går.
