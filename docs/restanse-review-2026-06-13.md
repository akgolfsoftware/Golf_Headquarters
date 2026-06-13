# Restanse-review — alt UTENOM skjermer (13. juni 2026)

> Komplett gjennomgang av gjenstående arbeid på AK Golf HQ som IKKE er skjerm-design/porting.
> 6 områder (data, sikkerhet, betaling, infra, juridisk, testing/integrasjoner) reviewet mot faktisk kode.
> Komplementerer `docs/go-live-sjekkliste.md` (E1–E11) som dekker de manuelle panel-handlingene.

Prioritet: **[P0]** blokkerer reelle/betalende brukere eller er juridisk eksponering · **[P1]** viktig før eller rett etter lansering · **[P2]** rydd/hardening.

---

## P0 — Må løses før ekte brukere slippes inn

1. **Abonnements-/gratis-logikken matcher IKKE løftene (kjernefunn).** FAQ lover offentlig «gratis prøvemåned», «gratis med coaching-pakke», «gratis i gruppe». Men koden har ingen `trialEndsAt`, og ingen kode setter PRO-tilgang fra prøveperiode, coaching-pakke (Performance/Pro) eller gruppemedlemskap. Tilgang er i praksis kun `GRATIS` (DB) eller `PRO` (Stripe-betaling). Kvalifiserte gratis-brukere får `GRATIS`-tier og låses ute av gratis-gatene. *Kode.* (`src/lib/feature-flags.ts`, `Subscription`-modell, tilgangssjekker i `/portal/*`)
2. **PRO-for-alle-kampanjen utløp 1. juni — gatene er nå «kalde» og live for første gang.** `feature-flags.ts` ga alle PRO frem til 2026-06-01; etter den datoen faller tilgang tilbake til rå DB-tier. ~15 `tier === "GRATIS"`-gater i `/portal/coach`, `ny-okt`, `kalender`, `tren/*` er nettopp aktivert i prod uten at noen tildeler PRO til de som skal ha gratis (punkt 1). Betalende/kvalifiserte spillere kan møte «oppgrader»-vegg NÅ. *Kode + beslutning.*
3. **Live Stripe-nøkler ligger i `.env.local`.** `sk_live_…`, `pk_live_…`, `whsec_…`, price-IDer med ekte live-verdier. Risiko: ekte trekk ved lokal testing + live-secrets hvis fila lekker. Verifiser at lokal dev bruker TEST-nøkler og at live KUN finnes i Vercel. *Panel + kode.*
4. **Soft-slettet konto kan fortsatt logge inn.** `deleteUserAccount()` setter `deletedAt`, men verken `getCurrentUser()` eller `requirePortalUser()` sjekker feltet. UI/e-post sier «kontoen deaktiveres umiddelbart» — usant. GDPR-eksponering. *Kode (liten fiks).* (`src/lib/auth/*`)
5. **To dataeksport-flater — én er placeholder.** `/innstillinger/personvern` har ekte `exportUserData()`. `/innstillinger/eksport` viser «kommer Q2 2026». Hvis menyen lenker til placeholder-en, tror brukeren GDPR-eksport mangler. *Kode (liten fiks).*
6. **E-post-leveranse ikke verifisert (Resend SPF/DKIM for akgolf.no).** Signup-bekreftelse + passord-reset sendes fra `post@akgolf.no`. Uten DNS-verifisering → spam → nye brukere kommer ikke inn. Go-live E9. *Panel/DNS.*
7. **`NEXT_PUBLIC_APP_URL` feil i prod** (peker på Vercel-URL, ikke akgolf.no) → feil host i e-postlenker/sitemap/robots. Go-live E2. *Panel.*
8. **Deploy-rutinen er uavklart: push til main = IKKE live.** Ingen auto-deploy konfigurert; kun manuell `vercel deploy --prod`. Risiko for å tro noe er live når prod står stille. Go-live E6. *Beslutning: skru på auto-deploy ELLER fast rutine.*

---

## P1 — Viktig

**Betaling/booking**
- **«Årlig» betaling er en UI-løgn:** wizard viser «3 060 kr/år» men poster alltid månedlig `pro` → kunde faktureres 300 kr/mnd. Fjern årlig-valg eller legg egen årlig price-ID. (`oppgrader-flyt-wizard.tsx`)
- **Forlatt oppgraderings-stub:** `requestProUpgrade` redirecter til `?ok=1` UTEN Stripe-session → falsk «du er oppgradert» uten betaling. Slett eller koble til ekte checkout.
- **Credit-booking beskyttes ikke av dobbeltbooking-indeksen:** `createCreditBooking` setter ikke `coachId` i data → den partielle unique-indeksen (`WHERE coachId IS NOT NULL`) treffer ikke → race-vindu for dobbel credit-booking. (`src/lib/booking/credit-booking.ts`)
- **Ingen webhook-event-idempotens på abonnement-sync** (Payment-rader dedupliseres, men `syncSubscription` ikke). Vurder `ProcessedWebhookEvent`-tabell.

**Sikkerhet**
- **Cross-coach IDOR i `/admin/plans`-actions (latent):** `krevCoach()` sjekker bare rolle, ikke at planen tilhører coachen. Ufarlig i dag (Anders eneste coach), men MÅ scopes før coach nr. 2. (`src/app/admin/plans/[planId]/actions.ts`)
- **Kontaktskjema uten rate-limit/honeypot:** `(marketing)/kontakt/actions.ts` sender Resend på hver submit → bot kan tømme kvoten. `rate-limit` + `same-origin`-helpers finnes allerede.
- **Migrasjons-bokførings-mismatch (booking-constraint):** DB har `20260531100000_booking_unique_slot`, lokalt `20260531000001_booking_add_unique_slot_constraint`. Bør forsones (`prisma migrate resolve --applied`) før neste `migrate deploy`, ellers risiko for «index already exists»-feil. (Eneste reelle drift-deploy-blokker.)

**Infra/cron**
- **22 Vercel-crons krever Pro-tier** (5/10/15-min-intervaller) — bekreft at prosjektet er på Pro, ellers kjører de fleste aldri. 19 av dem lever på en dynamisk `[agent]`-rute — verifiser at alle vises registrert i Vercel etter deploy.
- **Cron-tider er i UTC, ikke Europe/Oslo:** «mandager 08:00»-jobber kjører faktisk 06:00 UTC. ±1t sommer/vinter-drift. Juster cron-uttrykk eller aksepter drift.
- **Meg-assistent-crons feiler stille uten `MEG_*`-env** (ikke i env-valideringen). Avklar om Meg skal kjøre i prod nå.

**Juridisk/GDPR**
- **Behandlingsregisteret feilbeskriver faktiske data:** `HealthEntry` lagrer hvilepuls/søvn/vekt (særlige kategorier art. 9); Apple Health-kilde + Sentry-databehandler mangler i registeret.
- **DPA-status motsier seg selv:** publisert personvernerklæring sier «alle DPA på plass», registeret sier «under etablering». Juridisk eksponering — signer eller juster ordlyd.
- **Samtykke lagres uten tidsstempel/versjon** (i `preferences`-JSON, ikke dedikerte `termsAcceptedAt`/`-version`-felt) → kan ikke bevises ved tvist.
- **Tre ulike personvern-e-poster** brukes om hverandre (`personvern@`/`post@`/`support@`) — verifiser at den i erklæringen faktisk mottar e-post (GDPR: svar innen 30 dager).

**Testing**
- **Caddie (coach-AI) kjører en ANNEN, utestet stack enn testene dekker** — prod bruker Vercel AI Gateway (`api/caddie/chat`), testene dekker en parallell Anthropic-implementasjon. Verifiser at live-caddie faktisk svarer.
- **Mistenkelig modell-streng:** `api/caddie/chat/route.ts` bruker `"anthropic/claude-sonnet-4.6"` (punktum) mens resten bruker `claude-sonnet-4-6` (bindestrek) — kan gi 404. MÅ verifiseres mot ekte kall.
- **Betaling/booking/tilgang har ~null grønn test-dekning** (E2E er `test.skip` + `continue-on-error` i CI). Forretningskritisk pengelogikk er utestet.

---

## P2 — Rydd / hardening

- **Demo-data vises som ekte når DB er tom:** innsikt-faner, `AnalyseKrysstabell`, admin/analyse bruker `data.length ? data : DEMO_*` → ny ekte spiller ser fabrikkerte SG/runde-tall uten «demo»-merking. Beslutning: empty-state vs demo-fallback. (Statistikk + turnering gjør dette riktig allerede.)
- **Seed-scripts har ingen prod-guard** → risiko for at demo-spiller (Øyvind Rohjan) lekker til prod-DB ved feilkjøring. Legg URL-guard.
- **AgencyOS Workspace + Caddie-shell + drill-mal-bibliotek kjører på `SAMPLE_*`/`MOCK_*`** (ingen datamodell). Bygg modell eller feature-flagg bort.
- **Shot-koordinater + `mentalScore` er halv-koblet:** felt lagres, men shot-map-komponenten har ingen konsument og datafangst mangler. Hull-for-hull `HoleScore` skrives/leses i analysere, men IKKE i turnerings-scorecard ennå.
- **Supabase WARN:** leaked-password-protection er av (toggle på); `pg_trgm`-extension i public schema (flytt — test søk etterpå).
- **Helse-ingest:** plain string-compare på secret (ikke konstant-tid), fail-open ved manglende secret. Lav risiko (kun Anders' data).
- **Drift-dokumenter lover infrastruktur som ikke finnes:** `status.akgolf.no`, uptime-monitor, fil-storage-backup, «Pro/Elite-månedsrapport» (ELITE finnes ikke). Juster SLA/runbook til virkeligheten.
- **Skjøre uoffisielle integrasjoner uten test:** GolfBox + GJGT scraper udokumenterte endepunkter (kan knekke uten forvarsel); TrackMan CSV-parser + Whisper-transkribering uten test.

---

## Hvem gjør hva

**Kan fikses i kode (jeg, etter din OK):** gratis-/abonnementslogikk (P0-1/2), `deletedAt`-innloggingssjekk (P0-4), eksport-placeholder-redirect (P0-5), årlig-billing (P1), oppgraderings-stub (P1), credit-booking coachId (P1), kontaktskjema rate-limit (P1), caddie-modellstreng (P1), seed prod-guard (P2), demo-fallback empty-states (P2), behandlingsregister + e-post-konsolidering (P1, tekst). Booking-migrasjons-drift forsones med én kommando.

**Bare du / i panelene:** Stripe live-nøkler i Vercel + test lokalt (P0-3), Resend DNS (P0-6), `NEXT_PUBLIC_APP_URL` + domene-beslutning (P0-7), deploy-rutine av/på (P0-8), Vercel Pro-tier-bekreftelse + env-vars (`MEG_*`, `UPSTASH_*`, `STRIPE_*`) (P1), Supabase leaked-password-toggle (P2), signer DPA-er (P1).

---

## Allerede solid (ikke bekymre deg)
- De 3 kritiske kodegjennomgang-funnene (gjennomføre-rute, IDOR ×3 i coach-live, brief/summary-kollisjon) er reelt lukket og verifisert.
- Auth-arkitektur konsistent (proxy + rolle-gating + eier-sjekk gjennomgående). Ingen hardkodede secrets. Stripe-webhook signaturverifiseres; betalinger idempotente.
- RLS deny-all på alle tabeller (inkl. dagens to nye). FYS-formel korrekt holdt som plassholder.
- Foreldresamtykke (16-årsgrense), cookie-gating, 30-dagers sletting med kaskade — alt ende-til-ende.
- 168/168 unit-tester grønne (SG/HCP/CS/pyramide/Meg). AI-modell-IDer gyldige. Cron-auth korrekt. Sikkerhetsheadere/CSP solide.
