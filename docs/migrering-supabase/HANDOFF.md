# HANDOFF — Supabase-kontobytte AK Golf HQ (til ny økt)


## Oppdraget (godkjent plan 2026-07-18)

Anders' gamle GitHub-konto er flagget → Supabase-orgen «AK Golf» er utilgjengelig
via dashbord (men API/MCP-token virket fortsatt per 2026-07-18). Vi flytter
AK Golf HQ til en **ny Supabase-konto eid via e-post** med en **ren,
lanseringsklar database**: testrot kastes, håndbygd innhold bevares, struktur/RLS
gjenskapes eksakt, teknisk gjeld betales ned. Full plan: se PR #78-beskrivelsen +
`docs/migrering-supabase/03-manifest-og-status.md`.

**Opprinnelig utløsende sak (fortsatt del av målet):** Google-innlogging feiler i
prod («provider is not enabled») — fikses i Fase 6 på NYTT prosjekt. E-post/passord-
login virker og er verifisert mot `https://akgolf-hq.vercel.app/auth/login`.
(NB: preview-lenker `*-git-*.vercel.app` er bak Vercel Authentication — det var
Anders' «får ikke logget inn»-problem, ikke appen.)

## Status NÅ (hva som er GJORT)

**Fase 0–1 ferdig.** Alt committet på gren `claude/vercel-link-login-z0nvpx`,
draft-PR **#78** (ikke merge uten Anders' ja — main auto-deployer til prod).

Filer i `docs/migrering-supabase/` (på grenen):
- `00-klassifisering.md` — alle 160 tabeller BEHOLD/KAST, bucket-konfig (13 stk
  med limits/MIME), auth-innstillinger å gjenskape
- `01-kanonisk-ddl.sql` — komplett skjema fra `schema.prisma` via
  `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`
  (156 tabeller, 63 enums, 293 indekser, 168 FK-er). NB Prisma 7: flagget heter
  `--to-schema`, og kommandoen krever dummy `DIRECT_URL`/`DATABASE_URL` i env.
- `02-rls-policyer.sql` — ALLE 99 public- + 2 storage-policyer fra levende DB
  (31 fantes kun i DB, ikke i repo-migrasjonene). RLS er enabled på ALLE tabeller.
- `03-manifest-og-status.md` — radtall-manifest (20 BEHOLD-tabeller, 2 285 rader),
  pg_dump-instruks til Anders, drift-beslutninger

**Målt fasit gammel DB** (`eljkjqvggsmnbbszzbpj`, 212 MB): 68 users (test),
2205 payments (én testbruker), 60k+ rader eksternt synket (cron regenererer),
0 edge functions, 0 egne funksjoner/views/triggere, 6 extensions (pgcrypto,
uuid-ossp, pg_trgm, btree_gist, supabase_vault, pg_stat_statements),
Storage: 1 fil (avatar for testbruker — ingenting å flytte).

## Låste beslutninger

1. **Auth-brukere gjenopprettes ferskt** — ingen auth-migrering. Anders lager
   ~10 ekte kontoer på nytt via vanlig signup/invite.
2. **Innholdsbibliotek bevares** (2 285 rader / 20 tabeller — se manifest):
   exercise_definitions (931), plan_templates (92) + plan_template_sessions (874),
   test_definitions, training_drills_v2, baner+course_holes+course_definitions,
   facilities, locations, service_types, groups+group_schedules+group_period_blocks,
   coach_availability, competence_goals, position_tasks(+tm_goals),
   email_templates, design_koblinger.
3. **Drift ryddes:** `coach_fokus_pins` + `periode_fordelinger` DROPPES
   (foreldreløse, 0 rader, ingen kodereferanser); `LacFase`-enum DROPPES;
   `datagolf_sync_state` BEHOLDES tom (kan brukes av ak-golf-intelligence) og
   legges i schema.prisma; `ELITE` fjernes fra Tier-enum (DDL + schema.prisma).
4. **Datakopiering: dblink server-til-server** (ny DB → gammel DB med gammel
   DIRECT_URL fra Vercel-env) — ikke gjennom chat-kontekst. Verifiser mot manifest.
5. **Eierskap: e-post, aldri GitHub-login** for kritisk infra.
6. **Region: eu-west-1 (Ireland)** — MÅ matche vercel.json `"regions": ["dub1"]`.
7. Remap ved innlasting: `createdBy`/`byCoachId`/`coachUserId`/`createdById`/
   `coachId` → Anders' nye admin/coach-bruker-id-er.

## ⚠️ KRITISK SEKVENSERING

MCP-konnektoren peker på GAMMEL konto. Når den byttes til ny konto **mister vi
API-tilgang til gammel** — men det er nå TRYGT: skjema+RLS+manifest er på disk/
i repo. Fallback for data: dblink/pg_dump via connection-string fra Vercel-env
(uavhengig av konto-innlogging, virker så lenge gamle prosjektet lever).
**Ikke slett/pause gamle prosjektet** — det er fallback i 2–4 uker.

## Venter på Anders (Fase 2)

1. **pg_dump-forsikring** — SISTE STATUS: Anders kjørte kommandoen men med
   plassholderen `<LIM INN DIRECT_URL>` bokstavelig → socket-feil. Han har fått
   beskjed om å lime inn ekte DIRECT_URL fra Vercel-env. IKKE bekreftet fullført.
2. **Ny Supabase-konto** med e-post + nytt prosjekt i **West EU (Ireland)**.
3. **Bytte Supabase-konnektoren** i claude.ai til ny konto.

## Neste steg for ny økt (Fase 3–8)

**Fase 3 — bygg skjema på NYTT prosjekt (via Supabase MCP når konnektor er byttet):**
1. `CREATE EXTENSION` pg_trgm + btree_gist (public-schema; pgcrypto/uuid-ossp/vault
   finnes som default). 2. Kjør `01-kanonisk-ddl.sql` som migrasjoner
   (apply_migration, del opp i biter) MINUS `ELITE` i Tier-enum, PLUSS
   `datagolf_sync_state`-DDL (står i 00-klassifisering/03-manifest).
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` på alle tabeller + kjør
   `02-rls-policyer.sql`. NB: policy `coach_full_access_recordings` har trolig
   en bug (`u.name` i storage.foldername skal være `objects.name`) — flagget for QA.
4. Buckets: kjør `scripts/create-storage-buckets.ts` (10 stk) + manuelt
   `avatars`, `coaching-videos`, `coaching-recordings` (konfig i 00-klassifisering).
5. `get_advisors` (security+performance) → fiks røde funn FØR data.

**Fase 4 — innhold + kontoer:** Anders oppretter kontoer først → slå opp nye
user-id-er → dblink-kopi av de 20 tabellene i FK-rekkefølge (locations/facilities/
baner/course_definitions først, course_holes/plan_template_sessions/group_* sist)
med eier-remap → verifiser radtall mot manifest (2 285).

**Fase 5 — rewire (samme gren, PR #78):** Vercel-env: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
(pooler 6543 `?pgbouncer=true`), `DIRECT_URL` (5432). Kode: `next.config.ts:23`
+ `src/proxy.ts:47` (hardkodet `eljkjqvggsmnbbszzbpj.supabase.co` → ny ref),
schema.prisma (datagolf_sync_state inn, ELITE ut), NY baseline-migrasjon
(`prisma migrate diff` → én 0_baseline, arkiver de 82 gamle — fikser ødelagt
shadow-replay-gotcha), komplettér `.env.example` (~20 udokumenterte nøkler, liste
i tredjeparts-audit: OPENAI_API_KEY, INTELLIGENCE_API_*, MEG_TELEGRAM_*,
MEG_EMBEDDINGS_*, GEMINI/XAI/YOUTUBE, STRIPE_PRICE_ID_PERFORMANCE*,
MEG_SUPABASE_*, INBOX_WEBHOOK_SECRET m.fl.), oppdater gotchas.md + ak-brain.

**Fase 6 — auth:** Google-provider PÅ (Client ID/secret fra Anders' Google Cloud
— gjenbruk kalender-OAuth-klienten), callback `https://<ny-ref>.supabase.co/auth/v1/callback`
inn i Google Cloud, Site URL + redirect-allowlist (`akgolf-hq.vercel.app/**`,
`akgolf.no/**`, `localhost:3000/**`), e-postbekreftelse PÅKREVD, signup åpen.
Valgfritt: slå av Vercel Authentication for previews (Deployment Protection).

**Fase 7 — verifisering:** npm run verify + npm test + auth-guard e2e; manuelt:
e-post/passord-login, Google-login, signup+bekreftelse, avatar-opplast,
booking/plan-flyt, innholdsbibliotek synlig; advisors grønn; cron fyller
eksterndata (mandag-cron-er kan trigges manuelt med CRON_SECRET).

**Fase 8 — etterarbeid:** gammelt prosjekt urørt 2–4 uker (rollback = env
tilbake). Anders → support@supabase.com: gjenopprett konto til e-post ELLER
kanseller Pro-abonnementet (belaster kort på utilgjengelig konto!). GDPR:
slett gammel DB (56 personers e-post) etter fallback-vindu. Deretter
Meg-prosjektet (`ffaitjztfnelzwefbdhw`, `MEG_SUPABASE_*`) samme oppskrift.

## Nøkkelreferanser

- Gammel org: `qwzkwxkvwvsmyksdoybb` («AK Golf», Pro). Prosjekter: AK Golf HQ
  `eljkjqvggsmnbbszzbpj` · Meg `ffaitjztfnelzwefbdhw` · wang `jdyyfpedserjnnfngeve`
  (egen app, UTENFOR scope).
- Vercel: team `team_ikZSoVT73hGrmdxnM398RJbb`, prosjekt akgolf-hq
  `prj_SxfSmSHvciLSaha9jTfo6L7pmENs`. Prod: akgolf-hq.vercel.app (main
  auto-deployer — ALDRI merge uten Anders' ja).
- GitHub: `akgolfsoftware/Golf_Headquarters`, gren `claude/vercel-link-login-z0nvpx`,
  draft-PR #78 (abonnert på aktivitet).
- En send_later-trigger (`trig_01RswxKiohVbUJkkhjLZqfpY`) sjekker PR #78 hver
  time i GAMMEL økt — ny økt kan slette den (delete_trigger) og evt. lage egen.
- Oppgaveliste i gammel økt: Fase 0 ✅, Fase 1 pågår (venter kun Anders' pg_dump),
  Fase 2–8 pending.
