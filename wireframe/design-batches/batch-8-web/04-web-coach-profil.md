# AK Golf Web — Coach-profil (public)

## Identitet

- **Produkt:** Web
- **URL:** `/coaches/[slug]` (eks. `/coaches/anders-kristiansen`)
- **Arketype:** Web — long-form profil + booking-CTA
- **HTML-referanse:** `wireframe/screen-deck/web/coach-profil.html`
- **Audit:** `wireframe/audit/web-coach-profil.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Public coach-profil er konverteringsside. Besøkende kommer hit fra
`/coaches` eller direkte søk ("Anders Kristiansen golf coach"). Må vise
nok kompetanse og personlighet til at de booker intro. Bruker Anders som
referanse, men template gjelder alle coaches.

## Layout — UNIKT

### 1. Hero (mørk #0A0A0A, 96px, asymmetrisk)

Venstre (50%):
- Eyebrow (mono lime): `HEAD COACH · GRUNNLEGGER`
- H1 (Inter Tight 64px): `Anders *Kristiansen*.`
- Sub: `PGA-coach siden 2008. Spesialiserer på talent og touring pro.`
- Specs-rad (mono): `16 ÅR · 200+ SPILLERE · 4 NGF-POENG`
- CTAs: `Book intro-samtale →` (lime) + `+47 482 35 700` (outline white)

Høyre (50%): Stort portrett (full høyde, 480px sirkel eller portrett-format med rounded-2xl)

### 2. Bio long-form (lys, 96px, narrow 720px sentrert)

Editorial long-form (4-6 paragraffer):
- Bakgrunn — vokste opp på GFGK, satte HCP fra 24 til +1 på 5 år
- Coaching-filosofi — "Data avslører, men det er hjertet som beveger spilleren"
- Hva som skiller Anders — kombinerer biomekanikk + sportspsykologi + statistikk
- Drømmen — bygge Norges sterkeste coaching-merkevare

Stor sitat-block midt i: *"Coaching er ikke å fortelle folk hva de skal gjøre. Det er å hjelpe dem se hva de allerede vet."*

### 3. Spesialiteter (lys-sand, 64px)

3 cards:
- **Talent-utvikling** — 14-22 år, sikter mot NGF-rangering eller utenlandsk college
- **Touring pro** — Challenge Tour, Nordic Tour, Tour-skole forberedelse
- **Strategi-coaching** — Course management, mentaltrening, tournament prep

### 4. Kunde-resultater (lys, 96px)

`Det er spillerne som teller.`
3 mini-cases med foto + sitat + statistikk:
- Markus R. Pedersen: HCP +0.4 · 14 NGF-poeng · 14 mnd
- Lina Hellesund: HCP 4.1 · WANG-elev · 8 mnd
- Tor Erik Kjelby: HCP 16 -> 8 · 24 mnd

`Se alle suksesshistorier →`

### 5. Tilgjengelighet (lys, 64px)

`Hvor og når jobber jeg?`

| Anlegg | Dager | Tider |
|---|---|---|
| Mulligan Indoor | Man-Fre | 09:00-21:00 |
| GFGK Range | Tir, Tor | 13:00-19:00 |
| Bossum (sommer) | Lor-Son | 09:00-17:00 |

CTA: `Book intro-samtale →`

### 6. Mørkt CTA-band

- H2 italic: `Klar for å starte?`
- `7 dager gratis prøvetid. Ingen binding.`
- CTAs: `Book intro →` (lime) + `Send melding →` (outline)

### 7. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Hero CTA "Book intro" | default, hover, active, focus |
| Hero CTA telefonnr | default, hover, klikk -> tel: |
| Sitat | static |
| Mini-case-card | default, hover, klikk -> case-detalj |
| Anlegg-rad | default, hover (subtle bg-shift) |

## Empty / loading / error

- **404 for ukjent slug:** redirect til /coaches
- **Loading:** SSR — lite loading-state nodvendig

## Ønsket output fra Claude Design

1. Anders' profil i lyst tema (full side)
2. Mobil <=640px — hero stables (portrett over tekst), bio-narrow blir full bredde
3. Hover på Mini-case "Markus"
4. Variant: Julie Solem-profil i samme template (vis at template skalerer)

## Ikke-mål

- Ikke include online booking-kalender (lenker til `/kontakt`)
- Ikke vise pris-tabell (egen `/priser`)

## Når du er ferdig

Lim design-link tilbake.
