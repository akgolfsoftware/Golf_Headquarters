# AK Golf HQ — Backup & Disaster Recovery Runbook

> Operativ håndbok for produksjons-incidents og gjenoppretting. Hold denne
> oppdatert når infrastruktur eller integrasjoner endres. Sist revidert: 2026-05-25.

---

## 1. Backup-strategi

### Database (Supabase Postgres)

| Faktor | Status |
|---|---|
| Backup-frekvens | Daglig (automatisk på Supabase Pro) |
| Backup retention | 7 dager (standard) |
| Point-In-Time Recovery (PIT) | Tilgjengelig på Supabase Pro |
| Maks RPO (Recovery Point Objective) | 24 timer (kan reduseres til ~2 min med PIT) |
| Maks RTO (Recovery Time Objective) | 1–2 timer ved full restore |

**Anbefaling for produksjon:** Vurder oppgradering til Team-tier (30 dagers
backup retention + utvidet PIT-vindu) når omsetningen passerer 100k NOK/mnd.

### Fil-storage (Supabase Storage / Vercel Blob)

- Klubblogoer, profilbilder, drill-videoer ligger i Supabase Storage-buckets
- Buckets har egne RLS-policies — verifiser ved hver schema-endring
- Storage-objekter er IKKE inkludert i Postgres-backups — må sikres separat hvis kritisk

### Kode

- All kildekode i GitHub (privat repo: `AndersKristiansen/akgolf-hq`)
- Vercel beholder siste 100 deployments — instant rollback tilgjengelig
- `.env.local`-secrets sikret i `_backup/`-mappe utenfor repo

### Test-rutine (manuell — månedlig)

Hver første mandag i måneden:

1. Logg inn på Supabase Dashboard
2. Gå til **Database → Backups**
3. Verifiser at siste backup er innenfor 24 timer
4. Test minst én restore-operasjon til staging-prosjekt (kvartalsvis)
5. Dokumenter test-resultat i `docs/audit/backup-test-YYYY-MM.md`

---

## 2. Incident-prosedyrer

### 2.1 "Supabase nede"

**Symptomer:** 5xx fra API, brukere kan ikke logge inn, database-feil i logger.

**Trinn:**
1. Sjekk [status.supabase.com](https://status.supabase.com) for kjente issues
2. Hvis service degradert: vent + informer brukere via banner på frontpage
3. Hvis nede lenger enn 30 min: vurder failover (krever standby-setup)
4. Kommunikasjon: status.akgolf.no (TODO: sett opp) + e-post til berørte brukere
5. Etter recovery: kjør smoke-tester på kritiske flows (login, booking, plan-lasting)

### 2.2 "Vercel deployment broken"

**Symptomer:** Build feiler, ny deployment serverer feil, eller siden er nede etter deploy.

**Trinn:**
1. Kjør `vercel ls` for å se siste deployments
2. Identifiser siste fungerende deployment
3. `vercel rollback <deployment-url>` for tidligere build
4. Verifiser at gammel deploy fungerer via smoke-tester
5. Debug feilen på `staging`/lokalt før ny deploy

### 2.3 "Database korrupsjon"

**Symptomer:** Inkonsistent data, foreign key-feil, manglende rader, dupliserte ID-er.

**Trinn:**
1. Identifiser scope: hvilke tabeller, hvilke rader, fra når?
2. Frys skriverettigheter for berørte tabeller (RLS-policy temporær lock)
3. **Hvis ikke kritisk:** rull frem fra `AuditLog`-tabellen (kjør reverse-script)
4. **Hvis kritisk:** PIT-restore via Supabase Dashboard → Database → Backups
5. Etter restore: kjør integritets-sjekker (`prisma db pull` + diff mot schema)
6. Informer berørte brukere innen 24t (GDPR-krav)

### 2.4 "DDoS-angrep"

**Symptomer:** Plutselig høy trafikk, Vercel rate-limit-warnings, sider laster sakte.

**Trinn:**
1. Aktivér Vercel Edge-rate-limiting via dashboard
2. Vurder Cloudflare-proxy foran (krever DNS-endring — 15 min nedetid)
3. Identifiser angrep-mønster i Vercel Analytics
4. Blokker IP-ranges via Vercel Firewall
5. Informer brukere via status-side hvis berørt

### 2.5 "Kompromittert secret" (KRITISK)

**Symptomer:** Uvanlig API-bruk, uventede transaksjoner, secret eksponert i git/log.

**Trinn (umiddelbart):**
1. **Roter ALLE keys umiddelbart:**
   - Stripe API-keys (Dashboard → Developers → API keys)
   - Resend API-keys (Resend Dashboard → API keys)
   - Supabase service-role-key (Project Settings → API)
   - Supabase anon-key (samme sted — krever frontend-deploy)
   - DataGolf API-key
   - Anthropic API-key
   - Notion OAuth client secret
   - Google OAuth client secret
   - NEXTAUTH_SECRET / NOTION_WEBHOOK_SECRET
2. Oppdater alle env-vars i Vercel Project Settings
3. Force-logout alle brukere via Supabase Auth → Users → "Sign out all"
4. Sjekk `AuditLog` for misbruk i berørt tidsrom
5. Informer brukere via e-post hvis personopplysninger lekket (GDPR — 72t-frist)
6. Etter recovery: dokumenter i `docs/audit/security-incident-YYYY-MM-DD.md`

### 2.6 "Datatap"

**Symptomer:** Brukere rapporterer manglende rader, transaksjoner forsvunnet.

**Trinn:**
1. Identifiser hvilke brukere og hvor mye data
2. PIT-restore til før datatap (Supabase Dashboard)
3. Diff restore mot prod for å finne nøyaktig delta
4. Lag write-back-script for å re-applikere transaksjoner skjedd etter restore-punktet
5. Informer berørte brukere innen 24t (GDPR-krav for personopplysninger)
6. Post-mortem innen 7 dager

### 2.7 "Stripe-webhook-tap"

**Symptomer:** Betalinger gjennomført på Stripe, men ikke registrert i vår DB.

**Trinn:**
1. Sjekk Stripe Dashboard → Developers → Webhooks → siste leveranser
2. Filtrér på "Failed" events
3. Re-send manuelt via "Resend" på hver feilet event
4. Verifiser at idempotency-keys forhindrer dupliserte rader
5. Hvis vedvarende: bytt webhook endpoint URL og oppdater Stripe-konfig

---

## 3. Kontaktinfo

| Tjeneste | Support | Eskalering |
|---|---|---|
| Supabase | support@supabase.com | Dashboard → Support ticket |
| Vercel | support@vercel.com | Dashboard → Help |
| Stripe | support@stripe.com | Dashboard → Help |
| Resend | support@resend.com | Dashboard → Support |
| Anthropic | support@anthropic.com | Console → Support |
| Notion | dev@makenotion.com | Notion Developer Slack |

**Internt:**
- Anders Kristiansen (eier): akgolfgroup@gmail.com / +47 (privat)
- DPO/Personvern: akgolfgroup@gmail.com

---

## 4. Verifisering etter recovery

Etter enhver incident, kjør disse smoke-testene:

```bash
# Lokalt
npx tsc --noEmit
npm run build

# Produksjon (via Playwright E2E)
npx playwright test tests/smoke
```

Manuelle sjekker:
- [ ] Login fungerer (begge roller: SPILLER, ADMIN/COACH)
- [ ] Booking-flyt går gjennom (test-spiller)
- [ ] Stripe-checkout starter (test-modus)
- [ ] Coach kan opprette plan + spiller kan lese den
- [ ] AuditLog mottar nye events

---

## 5. Post-mortem-mal

Hver Severity-Critical-incident skal ha post-mortem innen 7 dager:

```
# Post-mortem: <kort tittel>

**Dato:** YYYY-MM-DD
**Varighet:** HH:MM – HH:MM (UTC)
**Severity:** Critical | High | Medium | Low
**Berørte brukere:** N

## Sammendrag

[1–2 setninger]

## Tidslinje

- HH:MM — første symptom
- HH:MM — alarmen gikk
- HH:MM — root cause identifisert
- HH:MM — fix deployed
- HH:MM — full recovery

## Root cause

[Hva som faktisk skjedde]

## Det som gikk bra

- ...

## Det som gikk dårlig

- ...

## Aksjonspunkter

- [ ] Tiltak 1 — ansvarlig: X — frist: YYYY-MM-DD
- [ ] Tiltak 2 — ansvarlig: X — frist: YYYY-MM-DD
```
