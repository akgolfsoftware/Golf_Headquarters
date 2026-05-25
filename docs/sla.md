# AK Golf HQ — Service Level Agreement

> Forpliktet oppetid, responstider og refusjons-vilkår for AK Golf Group sin
> plattform (akgolf.no, booking.akgolf.no, PlayerHQ, CoachHQ).
> Sist revidert: 2026-05-25.

## Oppetid-mål

- **Mål:** 99.5 % per måned
- **Maks nedetid:** 4 timer per måned
- **Definisjon nedetid:** brukere kan ikke logge inn eller laste hovedsider
  (PlayerHQ-dashboard, CoachHQ-dashboard, booking-flyt)

Planlagt vedlikehold (annonsert minst 48 timer i forveien) regnes ikke som
nedetid, men summen av planlagt vedlikehold skal ikke overstige 2 timer per
måned.

## Måling

- Vercel Analytics (uptime + ytelse)
- Plausible uptime-monitoring (ekstern verifisering)
- Status.akgolf.no (TODO: sett opp ekstern statusside, mål: Q3-2026)

Månedsrapport tilgjengelig på forespørsel for Pro/Elite-kunder.

## Incident-respons

| Severity | Response time | Resolution target |
|---|---|---|
| Critical (alle brukere blokkert) | < 30 min | < 4 timer |
| High (delvis funksjon nede) | < 2 timer | < 24 timer |
| Medium (ikke-kritisk feil) | < 12 timer | < 7 dager |
| Low (kosmetisk/edge case) | < 7 dager | < 30 dager |

**Severity-definisjoner:**

- **Critical** — pålogging brutt, betaling brutt, total nedetid, datatap, sikkerhetsbrudd
- **High** — viktig funksjon nede (booking, plan-visning), men workarounds finnes
- **Medium** — ikke-kritisk feil som påvirker noen brukere, ingen datatap
- **Low** — kosmetiske feil, edge cases, små tekstfeil

## Kunde-kommunikasjon

| Situasjon | Kanal |
|---|---|
| > 30 min nedetid | E-post til berørte brukere |
| > 4 timer nedetid | Status.akgolf.no-update + e-post |
| Sikkerhetsbrudd med personopplysninger | E-post innen 72 timer (GDPR-krav) |
| Planlagt vedlikehold | E-post + banner i app minst 48 timer i forveien |

## Refusjons-rutiner (Pro/Elite-kunder)

| Sammenhengende nedetid | Refusjon |
|---|---|
| > 24t | 10 % rabatt for berørt måned |
| > 48t | 25 % rabatt for berørt måned |
| > 72t | Full refusjon for berørt måned |

**Unntak (force majeure):**
- Supabase-outage utenfor vår kontroll (men dokumentert)
- Vercel-outage utenfor vår kontroll
- Stripe/Resend-tredjepartsavbrudd
- Naturkatastrofer, krig, nettverks-blackouts hos ISP

Refusjon krever skriftlig forespørsel innen 30 dager etter berørt periode.
Send til akgolfgroup@gmail.com med emnefelt "SLA-refusjon — <måned>".

## Datasikkerhet

- Daglige backups (7 dager retention på Pro-tier)
- Point-In-Time Recovery (PIT) for siste 7 dager
- Krypterte forbindelser (TLS 1.3) til alle endepunkter
- Personopplysninger behandles iht. GDPR-behandlingsregister
  (se `docs/gdpr-behandlingsregister.md`)

## Endringer i SLA

Anders Kristiansen / AK Golf Group AS forbeholder seg retten til å oppdatere
denne SLA-en med 30 dagers varsel via e-post til registrerte brukere.

Gjeldende versjon: **2026-05-25**.
