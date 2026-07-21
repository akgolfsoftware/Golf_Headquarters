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
- **Sikkerhets-headere**: HSTS (preload), CSP, X-Frame-Options, X-Content-Type, Referrer-Policy, Permissions-Policy ✓
- **Prod-DB har ekte innhold**: 30 brukere, 30 baner, 1821 turneringer, 2637 off. spillere
- **Migrasjons-historikk reconciled** (2026-05-31) — `migrate status` = "up to date"
- **robots.ts** disallower nå alle gated/demo-ruter (kode)

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

SEO/URL (🔴 må fikses):
- [ ] `NEXT_PUBLIC_APP_URL` = `https://akgolf.no` — er nå satt til vercel-URL → gir feil robots/sitemap-host.
- [ ] `RESEND_FROM_EMAIL` = `AK Golf <post@akgolf.no>` (eller ønsket avsender)

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
  - [ ] Logg inn som coach → AgencyOS dashboard + spillerliste laster
  - [ ] Forelder-samtykke-flyt for mindreårig

## E6 — Deploy-rutine
- [ ] Bestem: behold manuell (`vercel --prod`) eller skru på **git auto-deploy til production** (Vercel → Settings → Git → Production Branch = `main`, auto-deploy på).
- [ ] Hvis auto-deploy på: verifiser at CI (lint/typecheck/test) er grønt før merge til `main`.

## E7 — Observability
- [ ] Trigger en testfeil → verifiser at den dukker opp i **Sentry**.
- [ ] Besøk en side → verifiser besøk i **Plausible** (krever cookie-samtykke).

## E9 — E-post-deliverability (🔴 P0)
Appen sender fra `post@akgolf.no` via Resend. Uten domeneverifisering havner
signup-bekreftelse + passord-reset i spam → brukere kommer ikke inn.
- [ ] **Resend → Domains → Add domain** `akgolf.no`. Legg inn **SPF + DKIM** DNS-records hos domeneleverandør.
- [ ] (Anbefalt) Sett opp **DMARC**-record.
- [ ] Send en test-signup → bekreft at e-posten lander i innboks (ikke spam).

## E10 — Datavern
- [ ] **Supabase → Database → Backups:** verifiser at automatisk backup / PITR er på.
- [ ] Noter rollback-plan: `vercel rollback` eller promotér forrige deploy i Vercel-dashboard.

## E11 — Hardening / kvalitet (P1–P2)
- [ ] **Rate-limiting** på auth-endepunkter (brute-force/abuse) — vurder Vercel BotID eller middleware.
- [ ] **Databehandleravtaler (DPA)** med Supabase, Stripe, Vercel, Resend, Plausible, Anthropic. Personvern-siden lister disse (GDPR).
- [ ] **Lighthouse / Core Web Vitals** på forsiden + booking (perf, a11y).
- [ ] Verifiser at **cookie-banneret faktisk blokkerer scripts** før samtykke.
- [ ] **OG-bilde** rendres ved deling (test i Slack/LinkedIn-preview).
- [ ] **Mobil-QA** på ekte enhet (PlayerHQ + booking).
- [ ] **Uptime-monitor** (f.eks. en cron-ping) + Sentry-alerts konfigurert.

## E8 — Go-live
- [ ] Annonser/åpne for brukere.
- [ ] Overvåk Sentry + Vercel-logger første 24t.
- [ ] Sjekk Stripe for første ekte betalinger.

---

## Eierskap
Alt over er **manuelle handlinger (Anders)** i Vercel/Supabase/Stripe/domene-panel.
Kode-siden er ferdig og deployet. `scripts/smoke-test.sh` kan kjøres når som helst.
