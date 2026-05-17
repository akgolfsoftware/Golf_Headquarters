# AK Golf Web — Personvern (GDPR)

## Identitet

- **Produkt:** Web
- **URL:** `/personvern`
- **Arketype:** Web — legal long-form
- **HTML-referanse:** `wireframe/screen-deck/web/personvern.html`
- **Audit:** `wireframe/audit/web-personvern.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

GDPR-paatryket personvernerklaering. Maa daekke alt en GDPR-erklaering skal
ha (formal, behandlingsgrunnlag, rettigheter, kontaktinfo) — men i lesbart
sprak. Ikke advokat-koden.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 64px)

- Eyebrow: `PERSONVERN`
- H1: `Hvordan vi *behandler* dataene dine.`
- Sub: `Sist oppdatert: 10. mai 2026.`

### 2. Innholdsfortegnelse (lys, sticky venstre 280px, 64px)

Sticky TOC venstre med ankerlenker til hver h2:
1. Hvem er behandlingsansvarlig
2. Hvilke data vi samler
3. Hvorfor vi samler dem
4. Hvor lenge vi lagrer
5. Hvem vi deler med
6. Dine rettigheter
7. Cookies
8. Endringer
9. Kontakt

Aktiv seksjon highlights med lime venstre-border.

### 3. Long-form content (lys, 96px, narrow 720px)

Per seksjon:
- H2 (Inter Tight 28px italic accent)
- Body (Inter 16px, line-height 1.7)
- Sub-headers (h3) der nodvendig
- Tabeller for "data type / formal / oppbevaring" der relevant
- Lenker til relaterte dokumenter (vilkar, cookies)

**Hovedpunkter (forkortet):**

**1. Behandlingsansvarlig**
AK Golf Group AS, org. 920 117 824, Storgata 12, 1607 Fredrikstad.
Kontakt personvern@akgolf.no.

**2. Data vi samler**
Tabell med 6 kategorier:
- Kontaktinfo (navn, epost, telefon)
- Spillerprofil (HCP, runder, oekter)
- Betalingsinfo (Stripe-token)
- Cookies (se cookies-policy)
- Brukeratferd i appen (analytics)
- Video/foto fra coaching-okter (med samtykke)

**3-9: Standard GDPR-seksjoner**

### 4. Rettigheter-CTA (lys-sand, 64px)

`Vil du utøve rettighetene dine?`
4 cards (Lucide-ikon hver):
- **Innsyn** — Se hvilke data vi har om deg
- **Sletting** — Be om aa bli slettet
- **Korrigering** — Endre feilaktige data
- **Dataportabilitet** — Last ned dine data

CTA: `Send forespørsel →` (epost personvern@akgolf.no)

### 5. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| TOC-lenke | default, hover, active section (lime border) |
| Inline lenke | default, hover (lime underline) |
| Tabell-rad | static |
| Rettighet-card | default, hover (lift) |
| Send-forespørsel-CTA | default, hover, klikk -> mailto: |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full personvern-side i lyst tema, scroll i midten
2. Mobil <=640px — TOC blir collapsible toppen, innhold full bredde
3. TOC viser aktiv seksjon (seksjon 3)

## Ikke-mål

- Ikke include cookie-consent-banner (egen 25)
- Ikke designe egen "innsyn-form" (mailto holder)

## Når du er ferdig

Lim design-link tilbake.
