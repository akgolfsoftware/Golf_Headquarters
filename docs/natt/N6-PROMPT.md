# N6 — Nordic League-pipeline PROMPT

**For ny Claude-session (Sonnet 5)**

Start ny chat fra `~/Developer/ak-golf-pipelines` working directory. Denne prompten er selvstedig.

---

## Oppgave: N6 — Nordic League-turneringspipeline

Bygg GitHub Actions-basert pipeline for Nordic League-turneringer. Output → `dashboard.tournaments` i akgolf-hq-DB.

**Avhenger av:** N1 ✅ (pipelines-repoet eksisterer, secrets kopiert)

**Resultat:** Nordic League turneringer synces daglig til `dashboard.tournaments`, leses av akgolf-hq-appen

---

## Kontekst

**Bølge N — TalentHQ-innfletting:** data-migrering fra talenthq-app til akgolf-hq. N6 er del av turneringsdatapipelinen:
- N1 ✅ DataGolf + GJGT + GolfBox + WAGR (allerede kjørende fra `ak-golf-pipelines`)
- N6 (DU) Nordic League (Norges eliteserie for juniorturier)
- Øvrig: Olyo, Østlandstour (allerede i pipelines)

Nordic League er ny kilde som mangler i akgolf-hq i dag.

---

## Omfang N6

### API-kilde
- **Navn:** Nordic League
- **Nettsted:** https://www.nordicleaguegolf.com (eller deres API hvis tilgjengelig)
- **Data:** Turneringer, deltakere, resultat
- **Oppdateringstakt:** Daglig (eller per turneringskjør)

### Output
- **Skjema:** `dashboard.tournaments` (samme som GolfBox/GJGT/WAGR)
- **Felt som må fylles:**
  - `tournament_date` (start)
  - `tournament_name`
  - `location` (kurs/by)
  - `flight` (klasse: Junior, Senior, etc.)
  - `source` (Nordic League)
  - `sync_status` (NEW|UPDATED|COMPLETED)
- **Duplikat-handtering:** samme turnering kan dukke opp i flere kilder → dedup via turnering-navn + dato

### Regler (fra BOLGE-N §0.3)
- Kjør som GitHub Actions cron-jobb
- Logg: `pipelines/datagolf/writers/public_db.py`-mønsteret (Python)
- Rate-limit: respekter deres terms of service
- Feil-håndtering: skriv `datagolf_sync_state` med last_sync_at/last_error

---

## Implementeringsplan (10 steg)

1. **Utforsk Nordic League API**
   - Finnes åpent API, eller må vi scrape nettstedet?
   - Autentisering? Rate-limit?
   - Dokumentasjon?

2. **Lag fetcher-modul** (`pipelines/nordic_league/fetcher.py`)
   - HTTP-klient (respekt rate-limit + backoff)
   - Parser for turneringer + resultat
   - Strukturer som dataclass

3. **Lag writer-modul** (`pipelines/nordic_league/writers/db.py`)
   - INSERT/UPDATE `dashboard.tournaments` via psycopg (DIRECT_URL)
   - Dedup-logikk: (tournament_name, tournament_date) → pk

4. **Lag sync-orchestrator** (`pipelines/nordic_league/sync.py`)
   - Hent turneringer fra API
   - Skriv til DB
   - Oppdater `datagolf_sync_state` med status

5. **Skriv tester** (`pipelines/nordic_league/sync.test.py`)
   - Enhet-tester for parser (mock API-data)
   - Integrasjonstest mot test-DB

6. **GitHub Actions-workflow** (`.github/workflows/nordic-league-sync.yml`)
   - Cron: `0 4 * * *` (daglig 04:00 UTC)
   - Secrets: `DIRECT_URL`, `DATABASE_URL`
   - Env: `PIPELINES_CACHE_DIR` (local testing)

7. **Env-konfigur**
   - `.env.local` lokalt: DATABASE_URL + DIRECT_URL
   - GitHub repo-secrets: samme

8. **Integrering i orkestrering** (`pipelines/common/source_registry.yaml`)
   - Legg til Nordic League med metadata (eierskapskontakt, rate-limit, behandlingsgrunnlag)

9. **Verifisering**
   - Kjør lokalt: `python -m pytest pipelines/nordic_league/`
   - Kjør workflow manuelt: GitHub Actions "Run workflow" button
   - Sjekk: `SELECT * FROM dashboard.tournaments WHERE source = 'Nordic League'`

10. **Dokumentasjon** (`pipelines/nordic_league/README.md`)
    - Hvordan kjøre lokalt
    - API-detaljer
    - Åpne problemer (hvis noen)

---

## Teknisk katalog

```
ak-golf-pipelines/
├── pipelines/
│   ├── nordic_league/           (NEW)
│   │   ├── __init__.py
│   │   ├── fetcher.py           (API-henting)
│   │   ├── sync.py              (orkestrering)
│   │   ├── writers/
│   │   │   ├── __init__.py
│   │   │   └── db.py            (DB-skrivning)
│   │   ├── README.md
│   │   └── sync.test.py         (tester)
│   ├── common/
│   │   ├── source_registry.yaml (OPPDATERT)
│   │   └── refresh_views.py
│   └── datagolf/
│       └── writers/
│           └── public_db.py      (referanse)
├── .github/workflows/
│   └── nordic-league-sync.yml    (NEW)
└── .env.local                    (eksisterer)
```

---

## Kjent kontekst

**Duplikat-håndtering:** `pipelines/datagolf/writers/public_db.py` deduperer turneringer via:
```python
def dedupe_by(source_id, tournament_name, tournament_date):
    # finne eksisterende turnering
    # om ny: INSERT
    # om eksistende, ny source: upsert
```

Samme mønster for Nordic League.

**Sync-status-tracking:** `datagolf_sync_state` tabell holder på siste kjøring per kilde.

---

## Åpne spørsmål → Anders

Før du starter: **Sjekk med Anders:**
1. Finnes et Nordic League API? (eller bare scraping?)
2. Rate-limit / auth-krav?
3. Behandlingsgrunnlag for Nordic League-data? (juridisk OK?)
4. Når skal den kjøre første gang? (kan være manuell test først)

---

## Leveranse

Når ferdig:
1. Commit på branch `claude/n6-nordic-league-pipeline`
2. Push
3. Skriv `pipelines/nordic_league/README.md` med kjøreinstrukser
4. Skriv `docs/natt/N6-DONE.md` (akgolf-hq-repoet) med status
5. Gi sign-off til Anders

---

## Ressurser

- **Eksisterende pipeline (mal):** `pipelines/datagolf/` — les koden for mønster
- **DB-schema:** `dashboard.tournaments` (eksisterer, se `datagolf_sync_state` for felt)
- **Akgolf-HQ DB:** `dcnxoztjtdqoidaekxry` (eu-west-2/London)
  - `DIRECT_URL`: `aws-0-eu-west-2.pooler.supabase.com:5432` (Supabase Shared Pooler)
  - Secrets kopieres fra N1-oppsettet
