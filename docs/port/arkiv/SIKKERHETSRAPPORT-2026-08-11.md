> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Sikkerhetsrapport — nattkjøring 2026-08-10/11

Statisk sikkerhetsgjennomgang før lansering. Kun lesende sjekker — ingen kode endret.
Logger: scratchpad `natt/` (action-auth.log, rls-audit.log).

## P0 — må fikses før lansering

Ingen P0-funn.

## P1 — bør fikses

1. **RLS-audit gir i praksis null dekning.** `scripts/audit-rls.ts` kjørte mot prod-DB:
   **0 OK, 11 SKIP, 1 FAIL**. Alle 11 SKIP skyldes at test-bruker A mangler rader i
   tabellene (rounds, test_results, trackman_sessions, training_plans, goals, achievements,
   documents, session_requests, signals, plan_actions, subscriptions). RLS er altså IKKE
   verifisert for noen av de bruker-eide tabellene. Kjør på nytt med `--with-fixtures`
   (skriptet støtter det) eller mot en bruker med reelle data. `scripts/audit-rls.ts:1`
2. **Skript-bug i RLS-audit på `bookings`:** FAIL med «invalid input syntax for type uuid:
   \"pending-…\"» — bookings-id-er er ikke uuid, skriptet caster til uuid. Dette er en feil i
   skriptet, ikke bevis på RLS-hull — men RLS på `bookings` er dermed også uverifisert.
   `scripts/audit-rls.ts` (bookings-spørringen).
3. **Rotasjonslisten i runbook §2.5 er ufullstendig og delvis stale.** `docs/runbook.md:108-117`
   lister `NEXTAUTH_SECRET` — den brukes ingen steder i `src/` (NextAuth er ikke i bruk;
   Supabase Auth er). Samtidig MANGLER disse secretene som faktisk brukes i koden:
   `CRON_SECRET`, `STRIPE_WEBHOOK_SECRET` (lista sier bare «Stripe API-keys»),
   `INBOX_WEBHOOK_SECRET`, `MEG_TELEGRAM_BOT_TOKEN`, `VAPID_PRIVATE_KEY`,
   `UPSTASH_REDIS_REST_TOKEN`, `HEALTH_INGEST_TOKEN`, `GOOGLE_TOKEN_ENCRYPTION_KEY`,
   `GOOGLE_WEBHOOK_TOKEN_SECRET`, `NOTION_ENCRYPTION_KEY`, `OPENAI_API_KEY`,
   `GEMINI_API_KEY`, `XAI_API_KEY`, `INTELLIGENCE_API_KEY`. Ved en reell hendelse ville
   disse blitt glemt.

## P2 — senere

1. **Push-subscribe er uautentisert (bevisst?).** `src/app/api/push/subscribe/route.ts:25`
   tar imot subscriptions uten innlogget bruker — rate-limitet (30/min per IP) og
   zod-validert, så risikoen er begrenset til anonym oppsamling av subscription-rader.
   Vurder opprydding/kobling til bruker.

## Sjekket og OK

- **Server actions:** `node scripts/check-action-auth.mjs` → «OK» — ingen actions uten auth-sjekk.
- **Hardkodede secrets i `src/`:** grep etter `sk_live`, `sk_test`, `whsec_`, `re_…`,
  JWT (`eyJ`), postgres-URL-er med passord, literal `api_key`-verdier → kun bevisste
  dummy-verdier i `src/lib/__tests__/stripe-webhook.test.ts` (test-only). Ingen ekte nøkler.
- **Klientlekkasje:** ingen `"use client"`-filer bruker `process.env.*` utenom
  `NEXT_PUBLIC_*`/`NODE_ENV` (systematisk sjekk av alle filer med process.env).
- **Cron-ruter:** alle 8 under `src/app/api/cron/` refererer CRON_SECRET; `[agent]/route.ts:138-141`
  nekter også når `CRON_SECRET` er usatt (fail-closed) og har rate limit.
- **Webhooks:** Stripe verifiserer signatur (`constructEvent`,
  `src/app/api/stripe/webhook/route.ts:50`); Telegram sjekker
  `x-telegram-bot-api-secret-token` + chat-allowlist (`src/app/api/meg/telegram/route.ts:24-38`);
  inbox-inbound krever `x-inbox-secret` mot `INBOX_WEBHOOK_SECRET`
  (`src/app/api/inbox/inbound/route.ts:49-54`); Google Calendar-webhook verifiserer
  HMAC-signert channel-token (`src/app/api/google-calendar/webhook/route.ts:39-55`).
- **Privilegerte API-ruter (stikkprøve):** `admin/ai-plan` + `batch` bruker
  `requirePortalUser({ allow: ["COACH","ADMIN"] })` + rate limit + coach-tilgangssjekk;
  `kommando/chat` og `kommando/team` bruker `canAccessMissionControl()`; `view-as-player`,
  `upload`, `coach` har auth-kall. `health/ingest` krever `HEALTH_INGEST_TOKEN`.
- **Offentlige ruter:** `lead` (5/min per IP), `client-error` (egen rate limit),
  `parse-date` (auth + 60/min) er alle rate-limitet.

## BLOCKED / merknader

- RLS-audit krevde DB-tilkobling og KJØRTE (env fantes lokalt) — men ga ingen dekning,
  se P1-1/P1-2. Ingen fixtures ble skrevet (kjørt uten `--with-fixtures`).
- `.env.example` kunne ikke leses (beskytt-hook blokkerer alle `.env*`) — sammenligningen i
  P1-3 er gjort mot secrets faktisk referert i `src/`-koden, som er den relevante fasiten.
