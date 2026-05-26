# AK Golf Web — Tjeneste-oversikt

## Identitet

- **Produkt:** Web
- **URL:** `/tjenester`
- **Arketype:** Web — subhero + tjeneste-grid
- **HTML-referanse:** `wireframe/screen-deck/web/tjenester.html`
- **Audit:** `wireframe/audit/web-tjenester.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Tjeneste-oversikten er konverteringsnav for nye besøkende. Hver tjeneste
har egen detalj-side (06). Siden lar dem rask sammenligne og velge.
Sammen med /priser er dette de to sterkeste konverterings-sidene.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `TJENESTER`
- H1: `Coaching for *hver* fase.`
- Sub: `Fra første-gangs golfer til touring pro. Velg tjenesten som passer der du er.`

### 2. Tjeneste-grid (lys, 96px, grid-2)

8 tjenester i 4 rader x 2 kolonner. Hver tjeneste-card:
- Stort ikon (Lucide, 48px, lime)
- H3 (24px)
- Pris-pill (mono): "Fra 1 600 kr/time"
- Beskrivelse (3 linjer)
- 3 bullets (Lucide CheckCircle2 lime)
- CTA: `Les mer →`

**Tjenestene:**
1. **1:1 coaching** — Fra 1 600 kr/time · TrackMan + analyse · 60-90 min · Tilpasset alle nivåer
2. **Junior Academy** — 1 200 kr/mnd · 7-17 år · 2 økter/uke · Skole/golf-balanse
3. **Talent-program** — Gratis (utvalgt) · 14-22 år · NGF-fokus · Mentor + coach
4. **Voksen-coaching** — 299/799 kr/mnd · Pro/Elite · Plan + ukentlig økt
5. **Bedriftsavtaler** — Fra 8 000 kr/mnd · 5+ ansatte · Quarterly events
6. **Klubb-samarbeid** — Skreddersydd · Sportsplan + coach-utvikling
7. **TrackMan-analyse** — 800 kr/økt · 30 min · Stand-alone uten plan
8. **Camps og events** — Fra 4 800 kr · Sommerleir, helg-camp, turneringer

### 3. Sammenlign-CTA (lys-sand, 64px)

`Usikker på hva som passer?` -> `Se sammenligning →` (lenker til `/sammenlign`)

### 4. FAQ-teaser (lys, 64px)

5 vanligste sporsmal med expand/collapse:
- Hva inkluderer 1:1-coaching?
- Kan jeg avbryte abonnement?
- Hvordan booker jeg?
- Tilbyr dere online coaching?
- Hva med begynnere?

`Se alle vanlige sporsmal →`

### 5. Mørkt CTA-band

`Ikke sikker? Snakk med Anders.` -> `Book intro-samtale →` + `+47 482 35 700`

### 6. Mega-footer

## Klikkbare elementer

| Element | States |
|---|---|
| Tjeneste-card | default, hover (lift + lime border), klikk -> /tjenester/[slug] |
| FAQ-rad | collapsed, hover, expanded |
| CTA-band knapp | default, hover, focus |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full side med 8 tjenester i grid
2. Mobil <=640px — grid-2 blir 1-kol
3. Hover på "Junior Academy"
4. FAQ med en åpen rad

## Ikke-mål

- Ikke designe tjeneste-detalj (egen 06)
- Ikke include online checkout — bruk kontakt/intro-samtale CTA

## Når du er ferdig

Lim design-link tilbake.
