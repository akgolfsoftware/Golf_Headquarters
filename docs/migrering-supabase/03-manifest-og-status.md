# Fase 0–1 status + manifest (2026-07-18)

## Radtall-manifest — BEHOLD-tabeller (eksakte tellinger, verifiseres i Fase 4)

| Tabell | Eksakt antall |
|---|---|
| baner | 38 |
| coach_availability | 13 |
| competence_goals | 26 |
| course_definitions | 9 |
| course_holes | 71 |
| design_koblinger | 47 |
| email_templates | 9 |
| exercise_definitions | 931 |
| facilities | 18 |
| group_period_blocks | 1 |
| group_schedules | 14 |
| groups | 9 |
| locations | 4 |
| plan_template_sessions | 874 |
| plan_templates | 92 |
| position_task_tm_goals | 16 |
| position_tasks | 15 |
| service_types | 20 |
| test_definitions | 36 |
| training_drills_v2 | 42 |
| **SUM** | **2 285** |

## Filer i denne mappa
- `00-klassifisering.md` — BEHOLD/KAST for alle 160 tabeller + buckets + auth-innstillinger
- `01-kanonisk-ddl.sql` — komplett skjema fra schema.prisma (156 tabeller, 63 enums,
  293 indekser, 168 FK-er). Generert med `prisma migrate diff --from-empty`.
- `02-rls-policyer.sql` — alle 99 public- + 2 storage-policyer fra live DB
- `kanonisk-tabeller.txt` / `kanonisk-enums.txt` / `live-tabeller.txt` / `live-enums.txt`
- `repo-policy-navn.txt` — 68 policy-navn fra repo-migrasjoner (31 fantes KUN i live)

## Drift-beslutninger (endelige)
- `coach_fokus_pins` — foreldreløs (0 rader, ingen kodereferanser, erstattet av
  coach_pinned_players) → **DROPPES** (gjenskapes ikke)
- `periode_fordelinger` — foreldreløs (0 rader, ingen kodereferanser) → **DROPPES**
- `LacFase`-enum — ubrukt → **DROPPES**
- `datagolf_sync_state` — ingen refs i DETTE repoet, men kan brukes av
  ak-golf-intelligence-tjenesten → **BEHOLDES** (tom) + inn i schema.prisma (Fase 5)
- `ELITE` i Tier-enum — død verdi → fjernes i ny DDL + schema.prisma (Fase 5)
- Ny DB = eksakt schema.prisma (minus ELITE) + datagolf_sync_state + RLS + buckets. Null drift.

## Datastrategi (endelig)
- **Innholdsdata (2 285 rader):** kopieres server-til-server via **dblink** fra ny DB
  → gammel DB i Fase 4 (gammel DIRECT_URL hentes fra Vercel-env). Verifiseres mot
  manifestet over. Ingen data gjennom chat-kontekst.
- **Forsikring (Anders, 5 min, gjøres NÅ):** lokal pg_dump — se under.
- Storage: 1 fil (avatar for slettet testbruker) → ingenting å flytte.
- Auth-brukere: gjenopprettes ferskt (besluttet) → ingen uttrekk nødvendig.

## pg_dump-kommando til Anders (forsikringskopi — kjør i dag)
1. Vercel → akgolf-hq → Settings → Environment Variables → kopier verdien av
   `DIRECT_URL` (Production).
2. På Mac med Docker (ingen installasjon nødvendig):
   ```bash
   docker run --rm -v "$PWD":/backup postgres:17 \
     pg_dump "<LIM INN DIRECT_URL HER>" -Fc -f /backup/akgolfhq-full-2026-07-18.dump
   ```
   (Alternativt med Homebrew: `brew install libpq` → `pg_dump "<DIRECT_URL>" -Fc -f akgolfhq-full-2026-07-18.dump`)
3. Fila (~50–100 MB) inneholder ALT (skjema + alle data). Oppbevar trygt lokalt.

## Gjenstår i Fase 1 (Port 1)
- [x] Kanonisk DDL på disk
- [x] RLS på disk
- [x] Bucket-konfig + auth-innstillinger dokumentert
- [x] Radtall-manifest
- [ ] Anders' pg_dump-forsikring (5 min — kommando over)
- Deretter: Fase 2 (ny konto) → konnektor-bytte er trygt

## Flagget for Fase 3-QA
- storage-policy `coach_full_access_recordings` ser buggy ut (bruker `u.name` i
  storage.foldername i stedet for objects.name) — gjenskapes som-den-er, vurderes fikset.
