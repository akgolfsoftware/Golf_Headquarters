# Launch-sjekkliste — AK Golf HQ

Sist oppdatert: 2026-05-14

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

- [ ] **Verifisert (feil mottatt i Sentry)**

---

## J5 — Plausible Analytics

**Hvor:** plausible.io

- [ ] Opprettet konto (30-dagers gratis prøve, 9 USD/mnd etter)
- [ ] Lagt til `akgolf.no` som ny side
- [ ] Kopiert `<script>`-snippet
- [ ] Sendt snippet til Claude

**Claude legger inn:** i `src/app/layout.tsx` `<head>` med Next.js Script-komponent.

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

- [ ] **Cron returnerer 200**

### L7 — Stripe webhook end-to-end

- [ ] Send test-payment (test-kort i live-mode)
- [ ] Webhook treffer `/api/stripe/webhook`
- [ ] Payment + Booking opprettet i DB
- [ ] Bekreftelses-e-post via Resend

### L8 — Backup + rollback

- [ ] Verifisert Supabase daily backups aktive
- [ ] `docs/rollback.md` skrevet (Claude lager)
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
