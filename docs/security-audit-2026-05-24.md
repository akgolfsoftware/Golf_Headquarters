# Datasikkerhets-audit — akgolf-hq

**Dato:** 2026-05-24
**Reviewer:** Claude Opus 4.7 + 7 spesialiserte agenter (parallell)
**Scope:** Full review før produksjons-launch
**Status:** **NO-GO inntil 5 kritisk-blokkere er lukket (~17 t arbeid)**

---

## 1. Sammendrag — Go/No-Go

| Område | Status | Eier-steg |
|---|---|---|
| Auth-middleware (proxy + layouts) | Betinget GO — skjult vakt via `AdminShell` | P1/P16 |
| `import "server-only"`-coverage | NO-GO — 4 filer mangler | P18 |
| CSRF + origin-validering | NO-GO — 3 POST-routes ubeskyttet | P18 |
| Filopplasting + MIME | NO-GO — spoofbar avatar, ingen chunk-grense | P19 |
| Supabase RLS-coverage | NO-GO — 5 tabeller uten RLS, 55 deny-all | L2 |
| GDPR mindreårig + cookie-banner | NO-GO — Datatilsyn-eksponering dag 1 | P17 + K3 |
| Security headers + CSP | NO-GO — CSP mangler helt | P15 |
| Rate-limiting | NO-GO — 34 av 38 routes ubeskyttet | P20 |
| Stripe webhook retry (P3) | Delvis — cron mangler | — |
| Audit logging (P8) | Delvis — 3 admin-områder logger ikke | — |
| Observability (L1) | GO | — |
| Launch-checklist (L3) | GO | — |

**Estimat full lukking:** ~30 t arbeid, ~5 kalenderdager med Anders-review.

---

## 2. Kritisk-blokkerende (må fikses før `BOOKING_ACTIVE=true`)

### K-1. GDPR art. 8 — mindreårig-flyt ikke koblet til UI

**Estimat: 5 t** · Kilde: agent 5

- `setDateOfBirthAndCheckMinor()` finnes som backend-action, men onboarding-wizard (7 steg) har **ingen DOB-input**.
- `completeOnboarding()` sjekker IKKE `requiresGuardianConsent && !guardianConsentGivenAt` — junior under 16 får full tilgang før forelder bekrefter.
- Filer: `src/app/auth/onboarding/onboarding-wizard.tsx`, `src/app/auth/onboarding/actions.ts`, `src/lib/auth/requirePortalUser.ts`

**Fix:**
1. Legg DOB-steg inn i wizard mellom steg 2 og 3
2. Hard-gate i `requirePortalUser`: hvis junior uten samtykke → redirect til `/auth/awaiting-guardian-consent`
3. Vis pågående invitasjons-status + resend-knapp

### K-2. RLS deny-all på 55 tabeller + 5 helt uten RLS

**Estimat: 6-8 t** · Kilde: agent 4

**Helt uten RLS (KRITISK):**
- `error_logs` — lekker stack traces med PII
- `webhook_failures` — lekker rå Stripe-payloads
- `test_sessions` — live scoring-data
- `leaderboard_snapshots`, `public_players`, `public_player_entries` — OK som public read, men trenger eksplisitte policies

**Deny-all (55 tabeller) — 10 mest sensitive prioriteres:**
`payments`, `health_entries`, `notifications`, `session_videos`, `technical_plans`, `talent_tracking`, `caddie_messages`, `google_calendar_connections`, `parent_invitations`, `leaves`

**4 INSERT-policies uten `qual`/WITH CHECK:**
`coaching_sessions_insert`, `parent_relations_insert`, `service_types_admin_insert`, `training_plans_insert`

**Fix:** SQL-migrasjon i `supabase/migrations/<ts>_rls_critical_tables.sql`. Resterende 45 deny-all kan stå hvis kun service-role aksesserer dem (men dokumenter hvorfor).

### K-3. `import "server-only"` mangler i 4 filer

**Estimat: 15 min** · Kilde: agent 1 + 2 (samme funn)

- `src/lib/supabase/admin.ts` — service-role-klient
- `src/lib/storage/avatar.ts` — bruker `supabaseAdmin()`, importeres fra 2 `"use client"`-komponenter
- `src/lib/storage/video.ts` — samme
- `src/lib/email/booking-emails.ts` + `src/lib/email/send-booking-email.ts` — bruker Resend-API-key

**Fix:** Legg `import "server-only";` som første linje i alle 5 filer.

### K-4. Content-Security-Policy mangler helt

**Estimat: 2 t** · Kilde: meg (verifisert i `next.config.ts:95-115`)

5 av 6 anbefalte headers finnes (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS), men **CSP mangler**. Uten CSP er XSS-beskyttelse minimal.

**Fix:** Legg til CSP med nonce + strict-dynamic i `next.config.ts headers()`:

```ts
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'strict-dynamic' https://js.stripe.com https://*.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.vercel.app wss://*.supabase.co https://api.resend.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join("; ")
}
```

### K-5. Cookie-banner mangler

**Estimat: 2 t** · Kilde: agent 5

ePrivacy-direktivet krever samtykke FØR Stripe/Supabase auth-cookies settes. Ingen `CookieBanner`-komponent finnes.

**Fix:** Bygg `src/components/cookie-banner.tsx` med "kun strengt nødvendige" som default. Analytics + Stripe-Elements lastes først etter samtykke.

---

## 3. Høy-prioritet (uke 1-2)

### H-1. CSRF origin-validering på 3 POST-routes

**Estimat: 1 t** · Kilde: agent 2

- `/api/lead/route.ts`
- `/api/view-mode/route.ts`
- `/api/notifications/mark-all-read/route.ts`

**Fix:** Sjekk `request.headers.get("origin")` mot `process.env.NEXT_PUBLIC_APP_URL` → 403 ved mismatch.

### H-2. Rate-limit-hardening

**Estimat: 3 t** · Kilde: agent 6

- `src/app/api/lead/route.ts:19-20` bruker `x-forwarded-for[0]` (spoofable) → bytt til `x-vercel-forwarded-for`
- `src/lib/rate-limit.ts` — throw i prod hvis Upstash-env mangler (ikke stille no-op)
- Legg rate-limit på 7 høyrisiko-routes:
  - `/api/recording/transcribe` (dyr OpenAI-kall)
  - `/api/recording/analyze` (dyr AI)
  - `/api/caddie/chat` (eksponert mot spillere)
  - `/api/stripe/checkout` (betalingsflyt)
  - `/api/auth/oauth-callback` (replay)
  - `/api/notion/oauth/callback` (replay)
  - `/api/admin/ai-plan` (dyr AI)

### H-3. MIME-spoofing + chunk-size

**Estimat: 2 t** · Kilde: agent 3

- `src/lib/storage/avatar.ts:35` — sjekk magic bytes på buffer, ikke bare `fil.type` fra klient
- `src/app/api/recording/upload-chunk/route.ts:58-84` — sett `MAX_CHUNK_BYTES = 10 * 1024 * 1024`, returner 413 ved overskridelse
- `src/app/portal/meg/profil/rediger/profil-rediger-form.tsx:131` — UI-tekst "maks 5 MB" feil (server håndhever 2 MB)

### H-4. AdminShell skjult rolle-vakt

**Estimat: 1 t** · Kilde: agent 1

- `src/proxy.ts:56-58` har misvisende kommentar — sier sjekk skjer i `page.tsx` (gjør den IKKE). Faktisk vakt er `AdminShell`.
- `src/app/admin/agencyos/layout.tsx` mangler eksplisitt `requirePortalUser` — stoler implisitt på root.

**Fix:** Flytt `requirePortalUser({ allow: ["COACH", "ADMIN"] })` direkte inn i `src/app/admin/layout.tsx`. Korriger proxy-kommentar.

### H-5. Personvernerklæring + behandlingsregister

**Estimat: 3 t + 1 advokat-time** · Kilde: agent 5

- Fjern "Utkast"-banner på `/personvern`
- Utnevn DPO formelt (Anders eller ekstern), publiser kontakt i § 1
- Opprett `docs/gdpr-behandlingsregister.md` (art. 30 — påkrevd pga `HealthEntry`-data)
- Junior-klausul-tekst klar (se agent 5-rapport)

### H-6. server-action error-leak

**Estimat: 30 min** · Kilde: agent 2

- `src/app/admin/messages/actions.ts:98` re-kaster `throw err` (raw error med potensielt DB-detaljer)
- **Fix:** `throw new Error("intern feil")` + log original via `logError()`
- Langsiktig: migrer alle actions til `{ ok, error }`-format (Q10 i master-plan)

---

## 4. Medium (innen 4 uker)

| # | Område | Estimat |
|---|---|---|
| M-1 | RLS-policies på resterende 45 deny-all tabeller med dokumentasjon | 6 t |
| M-2 | Cron for `processPendingFailures()` (P3) — `/api/cron/process-webhook-failures` | 30 min |
| M-3 | Utvid `auditLog()` til `admin/spillere`, `admin/coaching`, `admin/okonomi` (P8) | 2 t |
| M-4 | Sentry-integrasjon for error-grouping (J4 i launch-checklist) | 2 t |
| M-5 | DPIA-dokument for AI-coaching-modul (Mac O'Grady video-analyse = profilering) | 4 t |
| M-6 | Penetrasjonstest av betalt flyt (Stripe webhook replay, race conditions) | ekstern |
| M-7 | Vipps Login + Signering for foreldresamtykke (P17 Fase 2) | 12-16 t |

---

## 5. Post-launch sikkerhets-prosess

| Frekvens | Oppgave | Ansvar | Verktøy |
|---|---|---|---|
| Hver PR | `npx tsc --noEmit`, `npm run build`, ingen `any` uten kommentar | CI | Vercel preview |
| Hver PR | `scripts/security-lint.sh` — grep for `SUPABASE_SERVICE_ROLE_KEY` utenfor `lib/supabase/admin.ts` | CI | Custom script |
| Hver PR | Verifiser `import "server-only"` på alle `src/lib/{supabase,storage,email,payments}/*` | CI | Samme script |
| Ukentlig (man 09:00) | Supabase Advisors-sjekk for nye RLS-warnings | Claude | `mcp__supabase__get_advisors` |
| Ukentlig | Sjekk `WebhookFailure`-tabell for stuck retries > 7 dager | Claude | SQL via admin |
| Månedlig (1. hver mnd) | Roter Supabase service-role-key + Stripe webhook-secret | Anders | Dashboard |
| Månedlig | Gjennomgå `AuditLog` for unormal admin-aktivitet | Anders + Claude | `/admin/audit` |
| Kvartalsvis | Full RLS-audit av nye tabeller siste kvartal | Claude | Genererer rapport |
| Kvartalsvis | DPIA-oppdatering hvis nye AI-features | Anders | `docs/dpia.md` |
| Årlig | Penetrasjonstest (NorSIS eller Watchcom) | Anders kjøper inn | Ekstern |
| Årlig | Cookie-banner + personvernerklæring-review | Anders + advokat | — |

**CI-prioritet (sett opp først):** `scripts/security-lint.sh` på hver PR + Vercel Preview, fail-on-error. 2 t å sette opp, fanger 80 % av regresjoner.

---

## 6. Sprint S — Konsolidert tiltaks-liste (kronologisk)

### Dag 1 (kvikke fixes, ~3 t):
- [ ] **S-1** (15 min) `import "server-only"` i 5 filer (K-3)
- [ ] **S-2** (30 min) Fiks `throw err` i `admin/messages/actions.ts:98` (H-6)
- [ ] **S-3** (30 min) Slå på RLS på `error_logs`, `webhook_failures`, `test_sessions` (deler av K-2)
- [ ] **S-4** (1 t) CSRF origin-validering på 3 POST-routes (H-1)
- [ ] **S-5** (1 t) AdminShell — eksplisitt `requirePortalUser` i admin/layout.tsx (H-4)

### Dag 2 (security headers + rate-limit, ~5 t):
- [ ] **S-6** (2 t) CSP-header i `next.config.ts` med nonce (K-4)
- [ ] **S-7** (3 t) Rate-limit på 7 høyrisiko-routes + `x-vercel-forwarded-for` (H-2)

### Dag 3 (RLS deep-dive, ~8 t):
- [ ] **S-8** (6-8 t) RLS-policies på 10 mest sensitive deny-all tabeller (K-2)
- [ ] **S-9** (30 min) Fiks 4 INSERT-policies uten WITH CHECK (K-2)

### Dag 4 (GDPR + cookie-banner, ~9 t):
- [ ] **S-10** (5 t) DOB-steg i onboarding-wizard + guardian-consent-gate (K-1)
- [ ] **S-11** (2 t) Cookie-banner v1 med strengt nødvendige som default (K-5)
- [ ] **S-12** (2 t) MIME magic-bytes + chunk-grense (H-3)

### Dag 5 (dokumentasjon + verifisering, ~5 t):
- [ ] **S-13** (3 t) Behandlingsregister + fjern Utkast-banner + DPO-publisering (H-5)
- [ ] **S-14** (2 t) `scripts/security-lint.sh` + CI-integrasjon
- [ ] **S-15** Re-kjør hele audit-pipelinen (de 7 agentene) for å verifisere
- [ ] **S-16** Cron for webhook-failures (M-2)

**Sum: ~30 t intern + 1 advokat-time.**

---

## 7. Vedlegg — Filsti-indeks

**Auth:**
- `src/proxy.ts:56-58` — misvisende kommentar
- `src/app/admin/layout.tsx` — bør ha eksplisitt `requireAdmin()`
- `src/app/admin/agencyos/layout.tsx` — mangler rolle-sjekk

**server-only:**
- `src/lib/supabase/admin.ts`
- `src/lib/storage/avatar.ts`
- `src/lib/storage/video.ts`
- `src/lib/email/booking-emails.ts`
- `src/lib/email/send-booking-email.ts`

**CSRF:**
- `src/app/api/lead/route.ts`
- `src/app/api/view-mode/route.ts`
- `src/app/api/notifications/mark-all-read/route.ts`

**Filopplasting:**
- `src/lib/storage/avatar.ts:35` — magic bytes
- `src/app/api/recording/upload-chunk/route.ts:58-84` — chunk-grense
- `src/app/portal/meg/profil/rediger/profil-rediger-form.tsx:131` — UI-tekst

**Rate-limit:**
- `src/lib/rate-limit.ts` — fail-loud i prod
- `src/app/api/lead/route.ts:19-20` — IP-ekstraksjon
- 7 routes som mangler rate-limit (se H-2)

**RLS:**
- `supabase/migrations/<ts>_rls_critical_tables.sql` — NY
- `prisma/schema.prisma` — 101 tabeller, 55 deny-all

**GDPR:**
- `src/app/auth/onboarding/onboarding-wizard.tsx` — DOB-steg mangler
- `src/app/auth/onboarding/actions.ts` — har action, ikke koblet
- `src/lib/auth/requirePortalUser.ts` — guardian-consent-gate mangler
- `src/app/(marketing)/personvern/page.tsx` — fjern Utkast
- `src/components/cookie-banner.tsx` — NY
- `docs/gdpr-behandlingsregister.md` — NY

**Security headers:**
- `next.config.ts:95-115` — CSP mangler

**Audit + observability:**
- `src/lib/webhook-retry.ts` — eksisterer, mangler cron
- `src/lib/audit.ts` — eksisterer, ikke brukt i 3 admin-områder
- `src/lib/error-tracking.ts` — OK
- `docs/launch-checklist.md` — OK
