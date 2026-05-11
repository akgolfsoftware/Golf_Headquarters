# AK Golf HQ — Launch-sjekkliste

Gå gjennom denne før domenet pekes mot Vercel-produksjon.

## 0. Forutsetninger (Anders må ha klart)

- [ ] Vercel-prosjekt linket til `akgolf-hq` repo
- [ ] Supabase-prosjekt med samme `DATABASE_URL`/`DIRECT_URL` som i `.env.local`
- [ ] Stripe live-keys i Vercel (sk_live_…, whsec_…, STRIPE_PRO_PRICE_ID)
- [ ] Resend API-key + verifisert domene (akgolf.no)
- [ ] Anthropic API-key
- [ ] Sentry-prosjekt + DSN
- [ ] Plausible-konto for akgolf.no (eller selfhost)
- [ ] DNS for akgolf.no peker mot Vercel
- [ ] support@akgolf.no + personvern@akgolf.no inbox

## 1. Environment-variabler (Vercel)

Verifiser at alle disse er satt i Vercel-produksjon:

- [ ] `DATABASE_URL` (pooler, port 6543, `?pgbouncer=true`)
- [ ] `DIRECT_URL` (session pooler, port 5432)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `STRIPE_SECRET_KEY` (sk_live_…)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_…)
- [ ] `STRIPE_PRICE_ID_PRO`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `CRON_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL=https://akgolf.no`
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `SENTRY_AUTH_TOKEN`
- [ ] `SENTRY_ORG`
- [ ] `SENTRY_PROJECT`
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=akgolf.no`

## 2. Database-state

- [ ] `npx prisma migrate status` viser opp-til-dato
- [ ] `npm run db:seed` kjørt minst én gang
- [ ] Sjekk via psql at:
  - [ ] `SELECT COUNT(*) FROM locations;` → minst 2 (GFGK + Mulligan)
  - [ ] `SELECT COUNT(*) FROM facilities;` → minst 10
  - [ ] `SELECT COUNT(*) FROM service_types WHERE active = true;` → minst 5
  - [ ] `SELECT COUNT(*) FROM email_templates WHERE active = true;` → minst 6
- [ ] `npx tsx scripts/audit-rls.ts --with-fixtures` viser 0 FAIL

## 3. Landingssider

- [ ] `https://akgolf.no/` rendrer
- [ ] `/priser` viser 300 kr/mnd
- [ ] `/funksjoner` rendrer
- [ ] `/om-oss` rendrer
- [ ] `/forsta` rendrer
- [ ] `/for-klubber` rendrer
- [ ] `/blog` lister poster
- [ ] `/blog/[slug]` virker på minst én post
- [ ] `/last-ned-guide` rendrer + lead-form virker
- [ ] `/book-demo` rendrer + form virker → e-post mottatt
- [ ] `/vilkar` rendrer (utkast-banner synlig)
- [ ] `/personvern` rendrer (utkast-banner synlig)
- [ ] Footer-lenker alle 200
- [ ] OG-bilder vises i Slack/LinkedIn preview
- [ ] `https://akgolf.no/sitemap.xml` returnerer korrekt XML
- [ ] `https://akgolf.no/robots.txt` returnerer korrekt regler
- [ ] Lighthouse: Performance > 90, SEO > 95, A11y > 95

## 4. Booking customer-flow

- [ ] `/booking` viser minst 4 service-kort (Pro-time 30, 60, Trackman, Gruppe)
- [ ] Klikk Pro-time 60 → `/booking/pro-time-60-min` viser kalender
- [ ] Velg dag → ledige tider rendrer per coach
- [ ] Velg tid → `/booking/pro-time-60-min/bekreft` viser oppsummering
- [ ] Fyll inn navn + e-post + telefon → Betal-knapp
- [ ] Stripe Checkout med 4242 4242 4242 4242 fullfører
- [ ] Redirect til `/booking/kvittering/[bookingId]` viser "Bekreftet"
- [ ] Bekreftelses-e-post mottatt i innboks
- [ ] Database: `bookings`-rad har `status='CONFIRMED'`, `stripePaymentIntentId` satt
- [ ] `/portal/meg/bookinger` viser bookingen (logget inn)
- [ ] Avbestilling > 24t gir refund i Stripe
- [ ] Avbestilling < 24t gir ingen refund men status CANCELLED
- [ ] Coach ser bookingen i `/admin/bookings`

## 5. PlayerHQ

- [ ] Signup ny bruker → onboarding 4-step → `/portal`
- [ ] Hjem-dashboard viser pyramide + uke-stripe
- [ ] Ny runde-modal: registrer 18 hull → SG-spider oppdateres
- [ ] Ny test → opprette TestResult → Signal opprettet
- [ ] AI-coach: `/portal/coach/ai` → send melding → streamed svar
- [ ] Live Session: start økt → 4 faser → logg per drill
- [ ] Stripe-oppgrade: gratis → klikk Oppgrader → Stripe Checkout → tier=PRO
- [ ] Stripe Customer Portal åpner og virker
- [ ] PWA: iPhone Safari → "Add to Home Screen" fungerer
- [ ] Meg/Bookinger, Meg/Dokumenter, Meg/Helse, Meg/Help rendrer

## 6. CoachHQ

- [ ] Logg inn som COACH/ADMIN → `/admin` hub viser brukeren
- [ ] `/admin/elever` list spillere, filter virker
- [ ] `/admin/elever/[id]` viser 360-profil
- [ ] `/admin/plans` opprett ny plan → publiser
- [ ] `/admin/calendar` viser bookinger
- [ ] `/admin/bookings` viser alle bookinger
- [ ] `/admin/finance` viser MRR + abonnementer
- [ ] `/admin/analytics` rendrer SG-aggregater
- [ ] CRUD: `/admin/services`, `/admin/locations`, `/admin/availability`,
      `/admin/email-templates`, `/admin/tournaments`, `/admin/groups`
- [ ] AI-coach for coach (`/admin/coach-ai`) virker

## 7. Cron-jobber

- [ ] `vercel.json` cron-jobber registrert: `plan-watcher`, `booking-reminders`
- [ ] Test plan-watcher manuelt: `curl -H "Authorization: Bearer $CRON_SECRET" https://akgolf.no/api/cron/plan-watcher`
- [ ] Test booking-reminders manuelt — sjekk Resend-loggen

## 8. Stripe webhook

- [ ] Webhook-URL i Stripe Dashboard: `https://akgolf.no/api/stripe/webhook`
- [ ] Events: `checkout.session.completed`, `checkout.session.expired`,
      `customer.subscription.created`, `customer.subscription.updated`,
      `customer.subscription.deleted`
- [ ] Test event fra Stripe Dashboard → 200 OK
- [ ] Lyttelogg i Vercel viser webhook-treff

## 9. Sentry

- [ ] Sentry-prosjekt mottar dummy-error fra dev
- [ ] Source-maps lastes opp ved Vercel-deploy
- [ ] PII-filter aktivt (test: dummy-error med e-post i melding → e-post er
      maskert i Sentry-event)

## 10. Auth

- [ ] Supabase Auth redirect-URLs inkluderer:
  - [ ] `https://akgolf.no/auth/oauth-callback`
  - [ ] `https://akgolf.no/auth/reset-password`
- [ ] Google OAuth (hvis aktivert): klikk → Google-popup → tilbake i `/portal`
- [ ] Forgot-password: send lenke → e-post mottatt → reset virker

## 11. Etter launch (første 48 timer)

- [ ] Monitor Sentry for nye feil
- [ ] Sjekk Plausible for trafikk-mønster
- [ ] Sjekk Stripe for vellykkede + feilede betalinger
- [ ] Sjekk Resend-loggen for failed e-post-sendinger
- [ ] Test signup som ny bruker fra mobil
- [ ] Test booking fra mobil
- [ ] Sjekk database for orphan PENDING-bookinger (>30 min gamle)

---

**Avvik fra denne sjekklisten må logges og fikses før formell launch.**
