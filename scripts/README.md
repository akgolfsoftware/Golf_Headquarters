# Scripts

Diverse engangs- og vedlikeholds-scripts for AK Golf HQ.

---

## Beta-import (`import-beta-users.ts`)

Importerer beta-spillere fra CSV — oppretter Supabase auth, Prisma User og sender velkomst-e-post.

### Bruk

```bash
# Dry-run (verifiserer CSV uten endringer)
npx tsx scripts/import-beta-users.ts data/beta-users-demo.csv --dry-run

# Faktisk import
npx tsx scripts/import-beta-users.ts data/beta-users-demo.csv
```

### CSV-format

Header obligatorisk. UTF-8. Komma, semikolon eller tab som skilletegn (auto-detekteres).

```csv
name,email
Markus Roinaas Pedersen,markus@example.com
Sofie Larsen,sofie@example.com
```

### Hva som skjer per spiller

1. Sjekker om bruker allerede finnes i Prisma — hvis ja, hoppes spiller over (idempotent)
2. Oppretter Supabase auth-record (auto-bekreftet e-post, midlertidig 12-tegns passord)
3. Oppretter Prisma User med `role=PLAYER`, `tier=PRO`, `homeClub=GFGK`
4. Sender velkomst-e-post via Resend med innloggings-detaljer og midlertidig passord

### Env-variabler kreves

Sett i `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (ikke anon-nokkel — service role kreves for `auth.admin.createUser`)
- `RESEND_API_KEY`
- `DATABASE_URL`
- `RESEND_FROM_EMAIL` (valgfri, default: `AK Golf <post@akgolf.no>`)

### Hvis noe gar galt

- Scriptet logger feil per spiller med detaljer (mismatched e-post, eksisterende auth-record, etc.)
- Re-kjor med samme CSV — eksisterende brukere hoppes over
- Hvis Supabase auth opprettes men Prisma User feiler: rens auth-record manuelt i Supabase Dashboard for å unngå "dangling" auth uten Prisma-tilknytning

### Begrensninger

- `tier=PRO` hardkodet (gratis under beta)
- `homeClub=GFGK` hardkodet
- Hvis du trenger andre tiers eller klubber, bruk `scripts/import-players.ts` istedenfor

---

## Norske turneringer (`import-norske-turneringer.ts`)

Importerer Srixon Tour, OLYO Tour (alle 6 regioner), Norges Cup og Østlandstour fra ferdige JSON-eksporter i `~/My Drive/AK Golf Group/Data/`.

Erstatter NGF-scraping stubben fra Stats Fase 1. Inntil `akgolf-pipelines`-repoet er klart bygges norsk turneringsdata via manuell kjøring av dette scriptet.

### Bruk

```bash
# Kjør lokalt — leser fra Google Drive-mounten
npx tsx scripts/import-norske-turneringer.ts
```

### Hva som importeres

| Kilde | Tabell | Volum (siste 3 år) |
|---|---|---|
| Srixon Tour | `Tournament` + `PublicPlayer` + `PublicPlayerEntry` (med rounds-JSON) | ~21 turneringer, ~1 800 deltaker-rader |
| OLYO Tour (alle regioner) | `Tournament` med JSON-meta (`krets`, `externalId`) | ~350 turneringer (kun schedules) |
| Norges Cup (Garmin) | `Tournament` + `PublicPlayerEntry` (med r1–r4) | ~12 turneringer, ~780 deltaker-rader |
| Østlandstour | `Tournament` + `PublicPlayerEntry` (med rounds-JSON) | ~28 turneringer, ~1 600 norske deltaker-rader |

### Idempotent

Kan kjøres flere ganger. Tournament-rader upsert-es på `slug`. PublicPlayer dedup-eres på `slug` (navn + fødselsår). PublicPlayerEntry upsert-es på `(playerId, tournamentId)`.

### Krav

- `~/My Drive/AK Golf Group/Data/` må være montert (Google Drive Mirror)
- `DATABASE_URL` i `.env.local` peker mot riktig Supabase
- Migrasjon `20260526000000_tournament_stats_fields` må være kjørt (`prisma migrate deploy`)

### Begrensninger

- Hardkodet `MIN_YEAR = 2024` for å unngå overload
- NGC-CSV (`norgescup_srixon_filtered.csv`) er filtrert til Srixon-spillere — ikke komplett NGC
- Østlandstour filtrerer bort ikke-norske spillere (de kommer fra andre tour-databaser)
- OLYO er kun schedules (ingen deltakerlister i `olyo_schedules.json`)
- Kjøring lokalt mot prod-DB — verifiser `.env.local` peker mot riktig miljø før kjøring
