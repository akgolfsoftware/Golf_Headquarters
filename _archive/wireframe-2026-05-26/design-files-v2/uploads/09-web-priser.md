# AK Golf Web — Priser (tier-sammenligning)

## Identitet

- **Produkt:** Web
- **URL:** `/priser`
- **Arketype:** Web — pricing-side med tier-tabell
- **HTML-referanse:** `wireframe/screen-deck/web/priser.html`
- **Audit:** `wireframe/audit/web-priser.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Priser-siden konverterer. Viser 3 tiers + 1:1 standalone + B2B. Designet
skal gjøre det lett å velge — ikke overvelde med valg. "Pro" markeres
som anbefalt med lime-ring.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `PRISER`
- H1: `Klar pris, *uten triks*.`
- Sub: `Velg planen som passer. Avbryt nar som helst. 7 dager gratis.`

### 2. Toggle (lys, 32px)

Segmentert kontroll: `Manedlig / Arlig (-2 mnd gratis)`. Default: arlig.

### 3. Tier-grid (lys, 96px, grid-3, sentrert)

3 tier-cards. Pro har lime-ring + "ANBEFALT" badge.

**Free**
- Pris: `0 kr/mnd`
- Sub: `For å bli kjent`
- 5 features (Lucide CheckCircle2):
  - Spillerprofil
  - Logg dine runder manuelt
  - Tilgang til oevelsesbibliotek
  - HCP-tracking
  - Web-tilgang
- CTA: `Kom i gang gratis →` (outline)

**Pro (ANBEFALT)**
- Badge: `MEST POPULAERE` (lime pill toppen)
- Pris: `299 kr/mnd` (eller `2 990 kr/aar`)
- Sub: `For seriose amatorer`
- 8 features (Free + nye):
  - Alt i Free, pluss:
  - Personlig treningsplan
  - Ukentlig 1:1-okt eller TrackMan-analyse
  - AI-generert progresjon
  - Coach-feedback pa video
  - Maaned-rapport
  - PlayerHQ app
- CTA: `Start Pro →` (lime pill)

**Elite**
- Pris: `799 kr/mnd` (eller `7 990 kr/aar`)
- Sub: `For konkurranse-spillere`
- 12 features (Pro + nye):
  - Alt i Pro, pluss:
  - 4 1:1-okter/maned
  - Tilgang til Anders direkte
  - Tournament-prep
  - Mental coaching
  - Foreldre-portal
  - Prioritert booking
  - Mulligan-aarskort inkludert
- CTA: `Kontakt oss →` (outline)

### 4. 1:1 stand-alone (lys-sand, 64px)

`Vil du ikke binde deg?`
1 1:1-card sentrert: 1 600 kr/time · TrackMan + analyse · Book nar du vil
CTA: `Book intro →`

### 5. Junior + bedrift teaser (lys, 64px, grid-2)

2 cards:
- **Junior Academy** — 1 200 kr/mnd · alle inkludert · 7-17 ar
- **Bedriftsavtaler** — Fra 8 000 kr/mnd · 5+ ansatte

### 6. Sammenlign-tabell (lys, 96px)

Stor sammenlign-tabell med alle features pa rad-aksen, tiers pa kolonne-aksen.
~20 rader med checkmarks (lime CheckCircle2 hvis included, gra dot hvis ikke).
Eksempel-rader: Spillerprofil, Treningsplan, 1:1-okter/mnd, Trackman-analyse,
AI-progresjon, Tournament-prep, Mulligan-aarskort, Mental coaching, etc.

### 7. FAQ (lys-sand, 64px)

6 vanligste pris-sporsmal:
- Hva inkluderer 7-dagers trial?
- Kan jeg endre tier?
- Refunderes resterende maned?
- Kan jeg pause abonnement?
- Hvordan betaler jeg?
- Hva er forskjellen pa Pro og Elite egentlig?

### 8. Mørkt CTA-band

`Usikker?` -> `Snakk med oss →` (lime) + `Se sammenligning →` (outline)

### 9. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Toggle Maanedlig/Aarlig | default, hover, selected |
| Tier-card | default, hover (lift), selected (lime ring + bg-tint) |
| Tier CTA | default, hover, active, focus, loading |
| Sammenlign-tabell-rad | default, hover (bg-shift) |
| FAQ-rad | collapsed, hover, expanded |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full side, arlig-toggle aktiv (default), Pro-anbefalt synlig
2. Maanedlig-toggle aktiv (priser endres til maanedlig)
3. Mobil <=640px — tier-grid blir 1-kol, Pro blir forst
4. Hover pa Pro-card
5. Sammenlign-tabell scrollbar pa mobil

## Ikke-mål

- Ikke include online checkout / Stripe-flyt
- Ikke vise alle B2B-detaljer (egen /for-bedrifter)

## Når du er ferdig

Lim design-link tilbake.
