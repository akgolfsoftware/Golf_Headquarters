# Plan — verifiser at databasen er synket og fungerende

> Mål: bevise at Prisma-skjemaet = den faktiske prod-databasen (ingen drift), og at tilkobling, sikkerhet (RLS), data og alle cron-syncer faktisk virker. Dato: 2026-06-14.

## Hva «synket og fungerende» betyr
Plattformen har **én** database: Supabase Postgres, aksessert via Prisma 7. «Synket» = Prisma-skjemaet matcher prod-DB-en (alle migrasjoner anvendt, ingen drift). «Fungerende» = tilkobling, RLS-sikkerhet, dataintegritet og de eksterne syncene virker.

## Kjente risikopunkter (sjekkes spesielt)
- **Booking-migrasjons-drift (P1):** DB har `20260531100000_booking_unique_slot`, lokalt `20260531000001_booking_add_unique_slot_constraint` — kan gi «index already exists» ved neste `migrate deploy`. (`docs/db-drift-ryddeplan.md`)
- **KimiCode db-pushet skjema direkte til prod** → migrasjons-bokføring kan avvike fra faktisk DB-state (kolonner/tabeller fantes før migrasjon).
- **~22 cron-syncer** skriver ekstern data (DataGolf, PGA, turneringer, Notion, benchmark, Meg-briefs).

---

## Analysen — 6 sjekker

### 1. Skjema ↔ prod-DB (drift) — viktigst
- `npx prisma migrate status` → forventer «Database schema is up to date».
- `npx prisma migrate diff --from-url $DIRECT_URL --to-schema-datamodel prisma/schema.prisma --script` → forventer **tom** diff.
- Supabase: list migrations + sammenlign mot `prisma/migrations/`-mappa.
- **Frisk:** ingen ventende/feilede migrasjoner, tom diff. **Rødt flagg:** pending/failed, ikke-tom diff, booking-constraint-navnemismatch.

### 2. Tilkobling (pooled + direct)
- Verifiser at både `DATABASE_URL` (pgbouncer-pooler, port 6543) og `DIRECT_URL` (direkte, 5432) kobler.
- Kjør en enkel spørring via runtime-klienten (`@prisma/adapter-pg`) — f.eks. `scripts/check-services.ts`.
- **Frisk:** begge kobler, runtime svarer. **Rødt:** timeout, feil pooler-host, manglende env.

### 3. RLS / sikkerhet
- Supabase **advisor (security)** → forventer **0 ERROR**.
- Bekreft at HVER tabell har RLS aktivert (deny-all + Prisma service-role-mønsteret). Ingen tabell eksponert via PostgREST uten policy.
- **Frisk:** advisor 0 ERROR, RLS på alle tabeller. **Rødt:** «RLS disabled»-funn (lekkasje).

### 4. Dataintegritet
- Rad-tellinger på kjernetabeller (User, TrainingPlan, Round, Booking, Subscription, Tournament, TestResult, SgBaseline).
- FK-integritet: ingen foreldreløse rader (f.eks. Round uten User, SessionDrill uten Session).
- Seed/demo-data til stede: demo-spiller **Øyvind Rohjan**, 38-spiller-stall, coach Anders.
- **Frisk:** forventede tall, ingen orphans. **Rødt:** 0-tellinger der det skal være data, brutte FK-er.

### 5. Cron-sync-helse (de ~22 jobbene)
For hver sync: kjørte den nylig + skrev den data + feil i logg?
- **DataGolf/PGA** → `SgBaseline`, `PgaPlayerSeason`, `PgaPuttDistance` har fersk `lastUpdated` (mandager).
- **Turneringer** → `Tournament`, `LeaderboardSnapshot` oppdatert (live hver 10. min, schedule daglig).
- **Benchmark-sync** → godkjent på `/admin/tester/benchmarks`.
- **Notion-sync** (hvert 5. min), **Meg-briefs** (daglig).
- Sjekk Supabase/Vercel-logger + `AgentRun`/`WebhookFailure`-tabeller for feil.
- **Frisk:** hver jobb har ferskt skrive-tidsstempel, ingen feil-logg. **Rødt:** stale `lastUpdated`, feil i logg.

### 6. Prod ↔ lokal parity
- Bekreft at skjemaet er likt lokalt og i prod (KimiCode-kolonnene `hole_scores`, `plan_change_requests` m.fl. reflektert i migrasjoner).
- **Frisk:** `prisma db pull` mot prod gir samme skjema som `schema.prisma`.

---

## Verktøy & hvem
**Claude Code kjører** alt: Prisma CLI (`migrate status/diff`, `db pull`, `validate`), Supabase MCP (`list_tables`, `list_migrations`, `get_advisors`, `execute_sql`), og logg-gjennomgang. **Anders:** trigger + godkjenn funn. Kjøres mot prod via `DIRECT_URL` (les-tungt; ingen skriving uten godkjenning).

## Hva vi gjør med funn (rettetiltak)
- **Drift** → `prisma migrate resolve --applied <navn>` for booking-constraint; ev. baseline mot faktisk DB-state.
- **RLS-hull** → `ALTER TABLE … ENABLE ROW LEVEL SECURITY` i ny migrasjon.
- **Cron-feil** → fiks + re-trigger; sjekk `CRON_SECRET` + env i Vercel.
- **Orphans** → ryddescript (med backup).

## Definisjon av «synket og fungerende»
Alle 6 sjekker grønne: ingen drift, begge tilkoblinger virker, advisor 0 ERROR, data konsistent, alle cron-syncer ferske, prod = lokal.
