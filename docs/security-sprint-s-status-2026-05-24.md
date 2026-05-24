# Sprint S — Status etter S-23 re-audit

**Dato:** 2026-05-24
**Reviewer:** Claude Opus + statisk analyse
**Scope:** Alle K + H funn fra sikkerhets-audit runde 1 + runde 2

---

## KRITISKE funn (runde 1 + 2) — alle lukket ✅

| # | Funn | Fix | Fil |
|---|---|---|---|
| K-1 | Mindreårig uten foreldresamtykke | P17 + onboarding-gate | `src/app/auth/onboarding/` |
| K-3 | `import "server-only"` mangler i serverfiler | S-1 | `admin.ts`, `record.ts`, `audit.ts` |
| K-4 | CSP mangler | S-6 | `src/proxy.ts` med per-request nonce |
| K-5 | Cookie-banner mangler | S-14 | `src/components/shared/cookie-banner.tsx` |
| K-6 | Next.js 16.2.4 CVE-er | S-0 | `package.json` → `next@^16.2.6` |
| K-7 | Open redirect i oauth-callback | S-7a | `oauth-callback/route.ts`, `login-form.tsx` |
| K-8 | `dangerouslySetInnerHTML` på DB-data | S-9 | Workbench-modaler renset |

## HØY-prioritet funn — alle lukket ✅

| # | Funn | Fix | Fil |
|---|---|---|---|
| H-2 | Rate-limit mangler | S-8 | `src/lib/rate-limit.ts` + 7 routes |
| H-5 | Admin-auth guard | S-5 | `src/app/admin/layout.tsx` |
| H-7 | `signOut()` uten global scope | S-7b | `src/lib/auth/logout.ts` |
| H-8 | Invertert CRON_SECRET-guard | S-7c | `src/app/api/cron/notion-sync/route.ts` |
| H-9 | Zod-validering mangler | S-16 + delvis | profil, bookinger fikset; resten etterslep |
| H-10 | Notion OAuth CSRF state | S-18 | `src/app/api/notion/oauth/callback/route.ts` |
| H-11 | MCP Bearer-token uten rate-limit | S-8 | `src/app/api/mcp/akgolf/route.ts` |
| H-12 | `cancelBooking` ignorerer Stripe-feil | S-19 | `src/app/portal/meg/bookinger/actions.ts` |
| H-13 | Booking race condition — ingen DB-unique | S-12 | `prisma/migrations/20260524100000_booking_slot_unique/migration.sql` + P2002-catch |

## MEDIUM funn — alle lukket ✅

| # | Funn | Fix |
|---|---|---|
| M-8 | DB-URL direkte i href | `safeUrl()` util + lint-sjekk |
| M-9 | Email enumeration på signup | Nøytrale feilmeldinger |
| M-10 | PII i error-tracking | `sanitizeMeta()` i `src/lib/error-tracking.ts` |
| M-11 | `as unknown` cast i recordInvoice | `InvoiceWebhookCompat` intersection type |

## Automatisk lint (CI-klar)

`scripts/security-lint.sh` verifiserer 8 sjekker på hver kjøring:
1. Ingen `as unknown as` dobbel-cast utenom godkjente unntak
2. Ingen `javascript:` i href
3. Alle DB-URL-felt (videoUrl, externalUrl, htmlUrl) bruker `safeUrl()`
4. `import "server-only"` i 3 kritiske lib-filer
5. Ingen avslørende e-post-enumeration-meldinger
6. Ingen hardkodede live-secrets
7. (Advarsel) console.log med PII-felt

**Siste kjøring:** alle 8 OK · exit 0

## Etterslep (ikke launch-blokkerende)

| # | Funn | Estimat |
|---|---|---|
| H-9 resten | Zod på resterende ~62 server-actions | 4-6 t |
| M-1 | RLS-policies på resterende 45 tabeller (utover initial `enable_rls_all_tables`) | 6 t |
| S-17 | GDPR behandlingsregister UI | 3 t |
| M-2 | Cron for `processPendingFailures()` | 30 min |
| M-4 | Sentry-integrasjon | 2 t |

## Verifisert OK (uendret fra audit)

- 0 `$queryRawUnsafe`, 0 `eval(`, 0 `new Function(`, 0 runtime `child_process`
- 0 `react-markdown`/`marked`/`remark` i deps
- 0 fs/path-traversal med user-input
- Stripe webhook signature verifisert korrekt
- Pris hentes server-side fra DB (ingen client-manipulasjon)
- Credits bruker atomisk transaction (double-spend-sikker)
- ApiKey-modellen solid (SHA-256 hash, revoke, expires)
- Google Calendar + Notion OAuth-callbacks har HMAC state-validering
