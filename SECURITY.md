# Sikkerhet — AK Golf HQ

## Rapportering

Sårbarheter rapporteres til **security@akgolf.no**. Vi svarer innen 48 timer.
Ikke åpne offentlige issues for sårbarheter.

## Arkitektur-prinsipper

- **Row-Level Security (RLS)** — alle bruker-tabeller har RLS aktivert. Bruker
  ser kun egne rader; COACH/ADMIN ser alt.
- **Server-side auth** — alle privatnesensitive ruter beskyttes via
  `requirePortalUser()` i hver server component, ikke kun i proxy.
- **Server actions** — Next 16 har innebygd CSRF-beskyttelse.
- **Stripe webhook** — signatur verifiseres med `STRIPE_WEBHOOK_SECRET`.
- **Cron-endpoints** — beskyttes med `CRON_SECRET` Bearer-header.
- **AI-chat** — rate-limited til 10 meldinger/minutt/bruker via
  `src/lib/rate-limit.ts`.

## Manuelle RLS-tester

Før produksjonsdeploy: kjør disse SQL-queries med to forskjellige
testbrukere for å verifisere isolasjon.

```sql
-- Sett RLS-context som user A, prøv å lese user B sine rader
SET LOCAL "request.jwt.claims" = '{"sub":"<user-A-auth-id>"}';
SELECT * FROM rounds WHERE "userId" = '<user-B-id>';
-- Forventet: 0 rader (RLS blokkerer)
```

Tabeller som krever RLS-test:
- `users`, `parent_relations`, `service_types`, `bookings`
- `training_plans`, `training_plan_sessions`, `session_drills`,
  `training_plan_session_logs`
- `rounds`, `test_results`, `trackman_sessions`
- `subscriptions`, `coaching_sessions`
- `signals`, `plan_actions`, `agent_runs`
- `goals`, `achievements`, `friendships`
- `documents`, `session_requests`

## Secrets-håndtering

- `.env.local` er git-ignorert
- Vercel Production: alle secrets satt via `vercel env`
- Stripe LIVE-keys brukes — refunder testkjøp manuelt via Dashboard

## Avhengigheter

`npm audit` kjøres i CI. High/critical sårbarheter blokkerer merge til main.

## Kontaktpunkter

- Anders Kristiansen — CEO/teknisk ansvarlig
- support@akgolf.no — generell support

## Endringslogg

- 2026-05-13 — initial sikkerhetspolicy
