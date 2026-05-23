# Launch-sjekkliste — AK Golf HQ

Sist oppdatert: 2026-05-17

Kryss av i `[ ]` etterhvert som du fullfører.
Si fra til Claude (`/fortsett-sesjon` + "verifiser launch-status") så kjører han verifikasjon programmatisk og oppdaterer denne fila.

---

## Status-oversikt

| Fase | Status | Estimat |
|---|---|---|
| J1 — DNS akgolf.no | ⬜ | 5 min + propagering |
| J2 — Resend domeneverifisering | ⬜ | 10 min + propagering |
| J3 — E-postinbokser | ⬜ | 20 min |
| J4 — Sentry-prosjekt | ⬜ | 10 min |
| J5 — Plausible Analytics | ⬜ | 5 min |
| J6 — Stripe live-mode | ⬜ | 15 min + 1–3 dager venting |
| J7 — Google OAuth verifisering | ⬜ | 10 min |
| L — Final QA | ⬜ | 1 dag (etter J ferdig) |

---

## J1 — DNS akgolf.no

**Hvor:** hyp.net (din DNS-leverandør)

- [ ] Logget inn på hyp.net
- [ ] Slettet eksisterende A/AAAA-records for `@` og `www`
- [ ] Lagt til `A @ 76.76.21.21` TTL 3600
- [ ] Lagt til `CNAME www cname.vercel-dns.com` TTL 3600
- [ ] Lagret

**Propagering:** 0–24 timer

**Verifikasjon (Claude kjører):**
```bash
dig akgolf.no A +short
# Skal returnere: 76.76.21.21

dig www.akgolf.no CNAME +short
# Skal returnere: cname.vercel-dns.com.
```

- [ ] **Verifisert grønt**

---

## J2 — Resend domeneverifisering (DKIM + SPF + DMARC)

**Hvor:** resend.com + hyp.net

### På Resend
- [ ] Logget inn på resend.com
- [ ] Opprettet domene `akgolf.no` under Domains
- [ ] Kopiert DKIM, SPF og DMARC-records

### På hyp.net
- [ ] Lagt til DKIM-TXT på `resend._domainkey.akgolf.no`
- [ ] Lagt til SPF-TXT på `@` (eller merge med eksisterende: `v=spf1 include:_spf.resend.com ~all`)
- [ ] Lagt til DMARC-TXT på `_dmarc.akgolf.no`: `v=DMARC1; p=none; rua=mailto:post@akgolf.no`

### Tilbake på Resend
- [ ] Klikket "Verify"
- [ ] Grønn hake mottatt

**Verifikasjon:**
```bash
dig resend._domainkey.akgolf.no TXT +short
dig _dmarc.akgolf.no TXT +short
```

- [ ] **Verifisert grønt**

---

## J3 — E-postinbokser

**Hvor:** hyp.net e-postpanel

### post@akgolf.no (hovedinbox)
- [ ] Opprettet
- [ ] Passord lagret i 1Password (eller bitwarden/sikker note)
- [ ] Konfigurert videresending til `akgolfgroup@gmail.com`

### support@akgolf.no
- [ ] Opprettet
- [ ] Videresend til Gmail

### personvern@akgolf.no
- [ ] Opprettet
- [ ] Videresend til Gmail

### noreply@akgolf.no
- [ ] Opprettet (brukes av Resend som "fra"-adresse)
- [ ] Trenger ikke videresending

**Verifikasjon:** send test-e-post til hver inbox fra eksternt → kommer frem.

- [ ] **Verifisert**

---

## J4 — Sentry feilrapportering

**Hvor:** sentry.io

- [ ] Opprettet konto på sentry.io (gratis-tier OK)
- [ ] Opprettet prosjekt `akgolf-hq` (Platform: Next.js)
- [ ] Kopiert `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Lagt inn i Vercel som env-variabel (alle 3 miljøer)
- [ ] Lagt til `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- [ ] Trigget ny deploy fra Vercel-UI

**Test-DSN:** når Sentry-prosjektet er opprettet, gi DSN til Claude → han legger inn en test-feilknapp i `/admin/settings` → klikk → sjekk Sentry-dashboard innen 30 s.

> **[x] Kode klar** — `src/lib/sentry.ts` stub opprettet. Aktiver med `npm install @sentry/nextjs` + DSN i Vercel-env.

- [ ] **Verifisert (feil mottatt i Sentry)**

---

## J5 — Plausible Analytics

**Hvor:** plausible.io

- [ ] Opprettet konto (30-dagers gratis prøve, 9 USD/mnd etter)
- [ ] Lagt til `akgolf.no` som ny side
- [ ] Kopiert `<script>`-snippet
- [ ] Sendt snippet til Claude

**Claude legger inn:** i `src/app/layout.tsx` `<head>` med Next.js Script-komponent.

> **[x] Kode klar** — `Script`-komponent med `data-domain` lagt inn i `layout.tsx`. Aktiveres så snart `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` er satt i Vercel.

**Verifikasjon:** besøk `akgolf.no` → dukker opp som "online visitor" i Plausible-dashboard innen 1 min.

- [ ] **Verifisert**

---

## J6 — Stripe live-mode bedriftsverifisering

**Hvor:** dashboard.stripe.com

- [ ] Toggle "Test" → "Live"
- [ ] Fylt inn org.nr **927 248 581**
- [ ] Lagt inn bankkontonummer (for utbetalinger)
- [ ] BankID-verifisering gjennomført
- [ ] Forretningsbeskrivelse: "Golf coaching og treningstjenester"
- [ ] Sendt inn til godkjenning

**Behandlingstid:** 1–3 dager hos Stripe.

- [ ] **Godkjent av Stripe (mottar e-post)**

**Etter godkjenning — Claude verifiserer:**
```bash
npx tsx scripts/audit-stripe.ts
# Skal liste alle live-produkter og matche env-variabler
```

- [ ] **Live-produkter matcher env**

---

## J7 — Google OAuth verifisering

**Hvor:** console.cloud.google.com

- [ ] Logget inn med `akgolfgroup@gmail.com`
- [ ] APIs & Services → OAuth consent screen
- [ ] Sjekket status er "In production" (ikke "Testing")
- [ ] `akgolf.no` verifisert som eier-domene
- [ ] Authorized redirect URIs inkluderer:
  - [ ] `https://akgolf.no/api/google-calendar/callback`
  - [ ] `https://akgolf.no/api/auth/callback/google`

**Verifikasjon:** logg inn på akgolf.no med "Logg inn med Google" → ingen "Unverified"-advarsel.

- [ ] **Verifisert**

---

## L — Final QA før launch (etter J ferdig)

### L1 — Smoke-tester (Claude kjører Playwright-testene)

- [ ] `npm run e2e` returnerer 18/18 grønt mot prod
- [ ] Signup → onboarding → portal manuelt OK
- [ ] Drop-in booking → Stripe-kvittering + e-post mottatt
- [ ] Pro-subscribe → credit-booking + avbestill > 24t → credit returneres
- [ ] Foreldre-onboarding → ruter til `/forelder`
- [ ] Coach AI-chat sender + lagrer

### L2 — Cross-browser/device

- [ ] iPhone Safari (375×667) — hele løype OK
- [ ] iPad Safari (768×1024) — sidebar synlig
- [ ] Mac Chrome 1440×900 — alle sider rendrer
- [ ] Mac Safari — webfonts laster

### L3 — Tilgjengelighet

- [ ] Tab-navigasjon — focus-ring synlig overalt
- [ ] VoiceOver-test på portal og admin
- [ ] Lighthouse-kontrast = 100

### L4 — Performance

Lighthouse-score (mål 95+):
- [ ] `/` — performance score
- [ ] `/booking` — performance score
- [ ] `/portal` — performance score
- [ ] `/admin` — performance score

### L5 — Verifikasjon

- [ ] Dummy-error trigget → vises i Sentry innen 30 s
- [ ] akgolf.no-besøk → vises i Plausible

### L6 — Cron-jobs

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://akgolf.no/api/cron/plan-watcher
# 200 OK
```

> **[x] Kode klar** — alle cron-agenter har auth-sjekk (`Authorization: Bearer CRON_SECRET`), returnerer `{ ok: true }` ved suksess og `{ error: "..." }` med status 500 ved feil.

- [ ] **Cron returnerer 200**

### L7 — Stripe webhook end-to-end

- [ ] Send test-payment (test-kort i live-mode)
- [ ] Webhook treffer `/api/stripe/webhook`
- [ ] Payment + Booking opprettet i DB
- [ ] Bekreftelses-e-post via Resend

### L8 — Backup + rollback

- [ ] Verifisert Supabase daily backups aktive
- [x] `docs/rollback.md` skrevet (Claude lager) — ferdig 2026-05-17
- [ ] Test-rollback gjennomført på preview-deploy

### L9 — Final review

- [ ] Alle 102 prod-ruter åpnet manuelt, visuelt OK
- [ ] Avvik logget i `docs/final-qa-2026-05.md`
- [ ] **Go/no-go-beslutning: GO**

---

## LAUNCH

- [ ] DNS verifisert + propagert
- [ ] Resend verifisert
- [ ] Stripe live aktiv
- [ ] Sentry mottar feil
- [ ] Plausible mottar besøk
- [ ] L1–L9 alle grønne
- [ ] **🚀 Live på akgolf.no**

---

*Slutt på sjekkliste. Etter launch: monitorer Sentry + Plausible første uke. Daglig sjekk av cron-jobs og Stripe-event-køen.*

---

# 🚀 GO/NO-GO PÅ LANSERINGSDAGEN (L3 fra master-plan)

**Lansering: ikke flipp BOOKING_ACTIVE før alle ✓ nedenfor.** 37 punkter på 6 områder.

## 1. TEKNISK (11 punkter)

```
[ ] Vercel Observability mottar test-error (trigger via /api/test-error) + ErrorLog-tabell får entry
[ ] Stripe webhook test-event mottatt + booking oppdatert til CONFIRMED
[ ] Stripe refund testet ende-til-ende (test-bruker → refund i Stripe-dashboard → CANCELLED + e-post)
[ ] Resend e-post mottatt på akgolfgroup@gmail.com (booking-confirmation.tsx)
[ ] Google Cal-event opprettet ved test-booking + slettet ved refund
[ ] Auth-middleware blokkerer uautentisert tilgang til /portal og /admin (verifiser 307→/auth/login)
[ ] RLS-policies aktive på alle 55+ tabeller (verifisert via Supabase Advisor 2026-05-23 ✅)
[ ] Cron-jobs har kjørt minst én gang (check-stuck-bookings, plan-watcher, booking-reminders)
[ ] Sitemap.xml inneholder alle 25 marketing-ruter + ingen broken links
[ ] 404-side rendres på ikke-eksisterende rute (test: /portal/foobar)
[ ] Cookie-banner vises på første besøk + lagrer samtykke
```

## 2. BRUKERFLYT (7 punkter — manuell ende-til-ende)

```
[ ] Ny bruker: /auth/registrer → onboarding → /portal lander under 3 min
[ ] Eksisterende bruker: /auth/login → /portal viser dashboard med data
[ ] Public booking: /booking → velg tjeneste → Stripe test-betaling → mottar e-post
[ ] Portal booking: innlogget medlem booker via credits → ser bekreftelse
[ ] Coach login: /admin viser stall + dagens økter
[ ] Forelder login: /forelder viser barnets fremgang
[ ] Logout → kan ikke åpne /portal eller /admin (redirect til login)
```

## 3. PERFORMANCE (2 punkter)

```
[ ] Lighthouse > 90 på 5 nøkkelsider: /, /priser, /booking, /portal, /admin
    (Performance + Accessibility + Best Practices + SEO)
[ ] Mobile (iPhone 15 viewport 375px): bottom-nav synlig, ingen horisontal scroll, touch-targets > 44px
```

## 4. SIKKERHET (10 punkter)

```
[ ] securityheaders.com test gir A+ rating (CSP/HSTS/X-Frame/Permissions-Policy)
[ ] Test-bruker PLAYER prøver /admin/* → redirectes til /portal
[ ] Test-bruker COACH prøver /forelder → redirectes til /admin
[ ] Test-bruker PARENT prøver /portal → redirectes til /forelder
[ ] Service-role-key fraværende fra client-bundle (Vercel build analyze)
[ ] Filopplasting blokkerer .exe/.sh/.php + 50 MB+ filer
[ ] Rate-limit returnerer 429 ved > 10 req/min på /api/lead
[ ] Slack-alert mottatt ved test-error (SLACK_ALERTS_WEBHOOK satt)
[ ] Leaked password protection PÅ i Supabase Auth-settings
[ ] CRON_SECRET satt i Vercel env (cron-endpoints krever Authorization)
```

## 5. JURIDISK + GDPR (4 punkter)

```
[ ] /vilkar, /personvern, /cookies oppdatert + lenket fra footer
[ ] Cookie-banner krever eksplisitt samtykke før analytics lastes
[ ] (Etterslep E6) deleteUserAccount() implementert + testet
[ ] (Etterslep E6) Data-export-knapp returnerer ZIP med all bruker-data
```

## 6. ROLLBACK (3 punkter)

```
[ ] Rollback-prosedyre dokumentert i docs/rollback.md + testet én gang på staging
[ ] Database snapshot tatt < 1 t før launch (Supabase auto-backup)
[ ] Forrige Vercel-deployment markert som "stabil" (kan rolles tilbake via dashboard)
```

---

## Launch-rekkefølge på dagen

```
08:00 — Kjør go/no-go-sjekklisten (1 t, helst med 2 personer for QA)
        Hvis NOE feiler → utsett launch, fiks, kjør checklist igjen

09:00 — Flipp BOOKING_ACTIVE=true i Vercel env (Production + Preview)
        Vercel auto-deploy ~1-2 min

09:05 — Verifiser live booking via test-bruker (book + betal + motta e-post)

09:15 — Anders annonserer på Instagram + e-post + LinkedIn

09:15-17:00 — MONITOR
              - Slack-alerts kanal
              - Vercel Observability (5xx-rate)
              - /admin/organisasjon?tab=audit (ErrorLog)
              - Stripe-dashboard (failed payments)

17:00 — Dagens metrics:
        - Antall nye registreringer
        - Antall bookinger
        - Antall e-poster sendt
        - Error-rate
        - Slack-alerts mottatt
```

## Hvis NOE går galt på lanseringsdagen

**KRITISK feil (alle bookinger faller):**
1. Flipp `BOOKING_ACTIVE=false` i Vercel env → midlertidig stoppe nye bookinger
2. Sjekk Stripe-dashboard for webhook-feil
3. Kjør cron manuelt: `curl -H "Authorization: Bearer $CRON_SECRET" https://akgolf-hq.vercel.app/api/cron/check-stuck-bookings`
4. Følg `docs/rollback.md` for full rollback

**Mindre feil (én side gir 500):**
1. Sjekk Vercel Logs (`vercel logs --follow`)
2. Sjekk ErrorLog-tabell via Supabase SQL Editor
3. Hotfix → push til main → Vercel auto-deploy

**Database-feil:**
1. Sjekk Supabase Status: https://status.supabase.com
2. Hvis migrate-deploy feilet: `vercel logs` → finn feil → patch schema
