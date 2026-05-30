# Go-live sjekkliste (Fase E) — AK Golf HQ

Steg-for-steg til lansering. Gjør ett punkt om gangen, hak av `[x]` når ferdig.
Verifisert prod-tilstand 2026-05-30 — det meste er allerede på plass.

## Allerede verifisert ✅ (ingenting å gjøre)
- `akgolf.no` (apex) er live på Vercel med gyldig SSL → HTTP 200
- Stripe-webhook-endepunkt svarer (`/api/stripe/webhook` → 405 på GET = riktig, POST virker)
- Alle offentlige ruter svarer 200 (/, /stats, /turneringer, /booking, /priser, /auth/login)
- `robots.txt` + `sitemap.xml` → 200
- Gating virker: `/portal` og `/admin` → 307 redirect til login
- Env-validering passerer (deploy lykkes = kritiske nøkler satt i Vercel)

---

## E1 — www-domenet (VIKTIG) 🔴
**Problem:** `www.akgolf.no` redirecter til den gamle Acuity-siden (`akgolfgroup.as.me`), ikke det nye sitet.

- [ ] **Vercel → Project → Settings → Domains:** legg til `www.akgolf.no` og sett den til å redirecte til `akgolf.no` (apex).
- [ ] **Hos domeneleverandør (hyp.net e.l.):** fjern/endre den gamle CNAME-en for `www` som peker til Acuity. Sett `www` → Vercel (eller la Vercel håndtere redirect).
- [ ] Verifiser: `https://www.akgolf.no` → havner på `https://akgolf.no` (ikke Acuity).

## E2 — Verifiser prod env-vars i Vercel
**Vercel → Project → Settings → Environment Variables (Production):** sjekk at disse er satt.

Kritiske (deploy feiler uten — er satt siden deploy virker):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`, `DIRECT_URL`

Betaling/e-post (verifiser at LIVE-nøkler, ikke test):
- [ ] `STRIPE_SECRET_KEY` (sk_live_…), `STRIPE_WEBHOOK_SECRET` (whsec_… fra LIVE-webhooken)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_…)
- [ ] `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_PERFORMANCE`, `STRIPE_PRICE_ID_PERFORMANCE_PRO`
- [ ] `RESEND_API_KEY`

Observability (anbefalt):
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` = `akgolf.no`

## E3 — Stripe LIVE
- [ ] Bytt fra test- til **live-modus** i Stripe Dashboard.
- [ ] **Developers → Webhooks → Add endpoint:** `https://akgolf.no/api/stripe/webhook`. Velg events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`.
- [ ] Kopier webhookens **Signing secret** (whsec_…) → sett som `STRIPE_WEBHOOK_SECRET` i Vercel (E2).
- [ ] **Test ett ekte kjøp** (lite beløp / kupong) → verifiser at abonnement opprettes i appen og i Stripe.

## E4 — Supabase sikkerhet (A3)
- [ ] **Supabase Dashboard → Authentication → Policies/Providers → Password:** skru på **"Leaked password protection"** (HaveIBeenPwned).
- [ ] (Valgfritt, lav prio) Flytt `pg_trgm` ut av `public`-schema — kun en WARN, ingen indekser bruker den.

## E5 — Smoke-test
- [ ] Kjør skriptet: `bash scripts/smoke-test.sh` → alle skal være PASS.
- [ ] Manuell brukerflyt (i nettleser):
  - [ ] Signup → e-postbekreftelse → onboarding (spiller)
  - [ ] Booking drop-in → betaling (test) → bekreftelse
  - [ ] Logg inn → PlayerHQ hjem laster med ekte data
  - [ ] Logg inn som coach → CoachHQ dashboard + spillerliste laster
  - [ ] Forelder-samtykke-flyt for mindreårig

## E6 — Deploy-rutine
- [ ] Bestem: behold manuell (`vercel --prod`) eller skru på **git auto-deploy til production** (Vercel → Settings → Git → Production Branch = `main`, auto-deploy på).
- [ ] Hvis auto-deploy på: verifiser at CI (lint/typecheck/test) er grønt før merge til `main`.

## E7 — Observability
- [ ] Trigger en testfeil → verifiser at den dukker opp i **Sentry**.
- [ ] Besøk en side → verifiser besøk i **Plausible** (krever cookie-samtykke).

## E8 — Go-live
- [ ] Annonser/åpne for brukere.
- [ ] Overvåk Sentry + Vercel-logger første 24t.
- [ ] Sjekk Stripe for første ekte betalinger.

---

## Eierskap
Alt over er **manuelle handlinger (Anders)** i Vercel/Supabase/Stripe/domene-panel.
Kode-siden er ferdig og deployet. `scripts/smoke-test.sh` kan kjøres når som helst.
