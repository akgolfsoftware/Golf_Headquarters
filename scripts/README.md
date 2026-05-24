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
