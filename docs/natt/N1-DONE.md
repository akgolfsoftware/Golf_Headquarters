# N1 — Sikre DataGolf-tilførselen · DELVIS FERDIG

Utført 26.08.2026. Se `BOLGE-N-TALENTHQ-INN-2026-08-26.md` for planen.

**Status: koden er flyttet og verifisert. Ett steg gjenstår som bare Anders kan gjøre —
sette GitHub-secrets. Talenthq skal IKKE arkiveres eller deaktiveres før det er gjort.**

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

## Gjenstår — krever Anders

### 1. Sett fem secrets i det nye repoet

GitHub lar ingen lese ut eksisterende secret-verdier, heller ikke eieren. De må hentes
fra kildene (`.env.local`, Supabase-dashbordet, DataGolf-kontoen) og settes på nytt.

De fem navnene er identiske med dem talenthq har i dag:

```
DATAGOLF_API_KEY
DATABASE_URL
DIRECT_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Settes her: https://github.com/akgolfsoftware/ak-golf-pipelines/settings/secrets/actions

I tillegg én variabel (ikke secret), valgfri — default er `dashboard`:
`SUPABASE_STORAGE_BUCKET`

**Merk om `DATABASE_URL`/`DIRECT_URL`:** bruk Shared Pooler
(`aws-1-eu-west-2.pooler.supabase.com`, bruker `postgres.<project-ref>`), aldri
`db.<ref>.supabase.co` — den er IPv6-only og nås ikke fra GitHub-runnere.
`DATABASE_URL` = port 6543, `DIRECT_URL` = port 5432.

### 2. Verifiser én ekte kjøring

Når secretsene står, kjør `datagolf-sync` manuelt med liten scope og sjekk radtall før/etter:

```bash
gh workflow run datagolf-sync.yml --repo akgolfsoftware/ak-golf-pipelines
```

### 3. Først DA: deaktiver cron i talenthq

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
