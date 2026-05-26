# AK Golf Web — Sponsorer / partnere

## Identitet

- **Produkt:** Web
- **URL:** `/sponsorer`
- **Arketype:** Web — partner-listing
- **HTML-referanse:** `wireframe/screen-deck/web/sponsorer.html`
- **Audit:** `wireframe/audit/web-sponsorer.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Sponsorer / partnere-siden viser hvem som stotter AK Golf — bygger
troverdighet og er sponsorenes bonus for samarbeidet (synlighet).
Sekundaert: pitch til nye sponsorer.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `PARTNERE & SPONSORER`
- H1: `Sammen *bygger vi* norsk golf.`
- Sub: `Vare partnere gjor det mulig for oss aa lopfte talent og bidra til klubber. Takk.`

### 2. Hovedpartnere (lys, 96px, grid-2)

4 store partner-cards. Hver card:
- Stort partner-logo (sentrert, max 200px)
- H3: Partner-navn
- 2-linje-beskrivelse av hva de gjor for oss
- "Siden 2024" eller lignende
- CTA: `Besok partner →` (lenker eksternt)

**Partnere:**
- **TrackMan** — Tech-partner. Alle vare anlegg har TrackMan. Siden 2022.
- **Mizuno** — Utstyrs-partner. Vare spillere fittes hos Mizuno. Siden 2023.
- **Sbanken** — Bank-partner. Stipend til 2 talenter/aar. Siden 2024.
- **WANG Toppidrett** — Skole-partner. Felles talent-utvikling. Siden 2018.

### 3. Klubb-partnere (lys-sand, 64px, grid-3)

4 logo-cards:
- GFGK (Gamle Fredrikstad GK)
- Bossum
- Drobak GK
- Mulligan Indoor

Mindre cards, bare logo + navn + "samarbeids-klubb siden YYYY".

### 4. Stotte-partnere (lys, 64px, logo-rad)

Logo-rad med 6-8 mindre partnere (dempet gra):
- Skarpnord Invest, Mulligan Cafe, Olympiatoppen Sor-Norge, etc.

### 5. Bli partner (mørkt CTA-band)

- Eyebrow: `BLI PARTNER`
- H2: `Vil du vaere med?`
- Sub: `Vi snakker gjerne om et partnerskap. Tech, utstyr, talent-stotte eller noe annet.`
- CTAs: `Snakk med oss →` (lime) + `Last ned partner-deck (PDF) →` (outline)

### 6. Sitater fra partnere (lys, 64px)

2 sitater:
- *"AK Golf har de beste talentene i regionen. Det er en aare aa vaere med."* — Tech-partner
- *"Klubb-samarbeidet med AK har lopfft hele junior-miljet vart."* — Klubb-partner

### 7. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Hovedpartner-card | default, hover (lift + lime border) |
| Partner CTA "Besok" | default, hover, klikk -> ekstern lenke |
| Klubb-card | default, hover, klikk -> /anlegg/[slug] |
| Bli-partner CTAs | default, hover, focus |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full partner-side i lyst tema
2. Mobil <=640px — grid stables
3. Hover pa TrackMan-card

## Ikke-mål

- Ikke include "donasjons-knapp"
- Ikke include alle ad-hoc-sponsorer (kun strategiske)

## Når du er ferdig

Lim design-link tilbake.
