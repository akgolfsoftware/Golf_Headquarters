# AK Golf Web — Hjemmeside (akgolf.no)

## Identitet

- **Produkt:** Web (akgolf.no)
- **URL:** `/`
- **Arketype:** Web — landing med mørk hero
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/web/index.html`
- **Audit:** `wireframe/audit/web-index.md`
- **Tilhørende komponenter:** Top-nav, mega-footer, newsletter-modul

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** + **`web/_shared.css`**.

## Spec — hva siden er for

Forsiden er Norges golfere sin første kontakt med AK Golf Academy. Den må
overbevise om at AK Golf er Norges ledende coaching-merkevare, vise spennet
fra junior til touring pro, og lede til Kom-i-gang-CTA. Forventet trafikk:
60% organisk Google, 25% sosiale, 15% direct.

## Layout — UNIKT for denne siden

### 1. Top-nav (sticky, 64px hvit)

Logo "AK Golf" venstre. Nav: Om · Tjenester · Coaches · Anlegg · Priser · Blogg · Kontakt.
Høyre: "Logg inn" (text) + "Kom i gang →" (primary mørkegrønn pill).

### 2. Mørk hero (#0A0A0A, 120px+140px padding)

- **Eyebrow** (mono lime): `AK GOLF ACADEMY · NORGES LEDENDE`
- **Title** (Inter Tight 84px display): `Tren *smartere*.<br>Spill bedre.`
  (italic lime på "smartere")
- **Sub** (rgba white 70%): `Personlig coaching, data-drevne treningsplaner og verdens beste teknologi — for spillere som vil utvikle seg på ekte.`
- **CTAs:** `Kom i gang →` (lime pill) + `Se tjenester` (outline white)
- **Bakgrunn:** subtilt golf-bane-mønster i 5% opacity, eller dempet TrackMan-data-grafikk

### 3. Sosial bevis-strip (lys, 64px)

Logo-rad: TrackMan · Mizuno · Sbanken · WANG Toppidrett · Bossum · Drobak GK
(grå dempet, ingen farger)

### 4. Hvorfor AK Golf (lys, 96px)

- Eyebrow: `HVORFOR AK GOLF`
- Title: `Coaching som *faktisk* flytter deg fremover.`
- Lede: `Vi kombinerer 20+ år coaching-erfaring med TrackMan, Foresight og Stats-data. Hver økt har et målbart mål.`
- 3 feature-cards (numrert 01/02/03):
  - **01 Data-drevet** — Hver økt logges. Du ser progresjon i carry, spinrate, smash-faktor og strokes gained over tid.
  - **02 Personlig plan** — Treningsplan tilpasset ditt nivå, mål og tilgjengelig tid. Justeres månedlig basert på faktiske resultater.
  - **03 Norges fremste coaches** — Hovedcoach Anders Kristiansen + 4 spesialister på alt fra junior til touring pro.

### 5. Tjeneste-grid (lys, 96px, alternerende bg)

4 store cards (2x2 grid):
- **1:1 coaching** — 1 600 kr/time · TrackMan + analyse
- **Junior Academy** — 1 200 kr/mnd · alle inkludert
- **Talent-program** — Gratis for utvalgte · NGF-rangering
- **Bedriftsavtaler** — Fra 8 000 kr/mnd · 5+ ansatte

Hver card: ikon (Lucide) + h3 + 2-linje-beskrivelse + `Les mer →`

### 6. Testimonial (lys-sand #F5F4EE, 64px)

3 testimonial-cards i grid:
- *"HCP fra 14 til 6 på 14 måneder. Anders ser det jeg ikke ser."* — Markus R. Pedersen, talent
- *"Datteren min gleder seg til hver onsdag på Bossum. Det sier alt."* — Linda Solberg, junior-mor
- *"Vi har tatt 4 NGF-poeng som lag siden vi startet med AK."* — Per Bossum, GFGK

### 7. Anlegg-teaser (lys, 96px)

`Tren der du er.` Kart-illustrasjon + 3 anlegg-tags:
- Mulligan Indoor (Fredrikstad sentrum)
- GFGK Range (Onsoy)
- Bossum (Drobak)

CTA: `Se alle anlegg →`

### 8. Mørkt CTA-band (#0A1F18, 96px sentrert)

- Eyebrow: `KOMMER I GANG`
- Title (italic): `Det starter med en samtale.`
- Sub: `7 dager gratis prøvetid. Ingen binding. Vi ringer deg innen 24 timer.`
- CTAs: `Book intro-samtale →` (lime) + `+47 482 35 700` (outline)

### 9. Mega-footer (#0A1F18)

Se `28-web-footer-mega.md`.

## Klikkbare elementer

| Element | States |
|---|---|
| Top-nav link | default, hover (lime underline), active page |
| Hero CTA "Kom i gang" | default, hover (scale 1.02 + lift), active, focus-ring |
| Hero CTA "Se tjenester" | default, hover (fill rgba(255,255,255,0.1)) |
| Feature-card | default, hover (lift 2px + border accent) |
| Tjeneste-card | default, hover, klikk -> tjeneste-detalj |
| Anlegg-tag | default, hover, klikk -> anlegg-detalj |
| Testimonial-card | static |
| Footer-link | default, hover (white) |
| Mobile-burger | closed, open (drawer fra hoyre) |

## Empty / loading / error

- **Loading:** Hero rendres umiddelbart (SSR). Sosial-bevis-rad lazy-loader logoer.
- **Cookie-banner:** vises forste gang nederst, dismisses persistent.

## Onsket output fra Claude Design

1. **Lyst tema (default web)** — full hjemmeside med alle 9 seksjoner
2. **Mobil <=640px** — hero stables, grid blir 1-kolonne, footer collapser
3. **Hover-states:** hero-CTA + feature-card + tjeneste-card
4. **Mørkt brukermodus** (sjeldent på web, men vis hero-variant)
5. **Cookie-banner synlig** (forste besok)

## Ikke-mål

- Ikke designe under-sider (egne pakker 02-30)
- Ikke designe app-sidebar — dette er offentlig web
- Ikke include booking-kalender (egen `akgolf-booking`)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
