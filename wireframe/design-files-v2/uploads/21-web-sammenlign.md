# AK Golf Web — Sammenlign tjenester

## Identitet

- **Produkt:** Web
- **URL:** `/sammenlign`
- **Arketype:** Web — feature-comparison-table
- **HTML-referanse:** `wireframe/screen-deck/web/sammenlign.html`
- **Audit:** `wireframe/audit/web-sammenlign.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Hjelp-side for besøkende som er usikre på hvilken tjeneste de skal velge.
Sammenlikner alle 8 tjenester pa relevante akser. Reduserer beslutningsfriksjon
og kan direkte konvertere ved aa lede til riktig tjeneste-detalj-side.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `SAMMENLIGN`
- H1: `Hvilken tjeneste *passer deg*?`
- Sub: `Sammenlign tjenestene side-ved-side. Eller bruk tre-stegs-velgeren under.`

### 2. Wizard-velger (lys, 96px, sentrert max 720px)

3 stegs visuell wizard som leder til anbefalt tjeneste:

**Steg 1: Hvor er du i golf-livet?**
- Begynner (< 1 ar)
- Voksen-amatør (HCP 10-25)
- Konkurranse-spiller (HCP < 10)
- Junior (foreldre paa vegne av barn)

**Steg 2: Hva er hovedmaalet?**
- Lavere HCP
- Mer goey
- Konkurranse-prep
- Lederutvikling (bedrift)

**Steg 3: Hvor mye tid?**
- 1 okt nar jeg vil
- 1 okt/uke
- 2-3 okter/uke
- Daglig

Under wizard: Anbefalt-card med "Vi anbefaler: 1:1 coaching" + CTA `Les mer →`

### 3. Sammenlign-tabell (lys, 96px)

Stor tabell med 8 tjenester pa kolonne-aksen, ~12 features pa rad-aksen.

| Feature | 1:1 | Junior | Talent | Voksen Pro | Voksen Elite | Bedrift | Klubb | TrackMan |
|---|---|---|---|---|---|---|---|---|
| Pris (fra) | 1 600 kr/time | 1 200/mnd | Gratis | 299/mnd | 799/mnd | 8 000/mnd | Skreddersydd | 800/30 min |
| Coach | Anders/spes | Sara/Julie | Anders | Coach | Anders | Coach | Coach + plan | Sara |
| Frekvens | nar du vil | 2/uke | 6/uke | plan + 1/mnd | 4/mnd | events + abo | lopende | 30 min |
| TrackMan | ✓ | ✓ | ✓ | ✓ | ✓ | event | ✓ | ✓ |
| Plan | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| App | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Coach-feedback | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| ... |  |  |  |  |  |  |  |  |

Lime CheckCircle2 hvis ja, dempet gra dot hvis nei.
Hover pa rad: subtle bg-shift.
Sticky kolonne-header etter scroll.

### 4. CTA-rad (lys-sand, 64px)

`Fant du noe interessant?` -> 8 mini-CTAs (en per tjeneste) som linker til detalj.

### 5. FAQ (lys, 64px)

5 vanligste sammenlign-sporsmal:
- Kan jeg kombinere flere tjenester?
- Hva hvis jeg vil bytte tier?
- Hvordan bestemmer jeg hva som passer barnet mitt?
- Hva er forskjellen 1:1 og Pro/Elite?
- Refunderes ubrukte timer?

### 6. Mørkt CTA-band

`Fortsatt usikker?` -> `Snakk med Anders →` (lime) + `Se priser →` (outline)

### 7. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Wizard-knapp | default, hover, selected (lime bg) |
| Wizard-anbefaling | default, hover, klikk -> tjeneste-detalj |
| Sammenlign-tabell-rad | default, hover (bg-shift) |
| Sammenlign-celle (CheckCircle2) | static |
| Sticky kolonne-header | default, scrolled-state (skygge) |
| FAQ-rad | collapsed, hover, expanded |

## Empty / loading / error

Statisk innhold.

## Ønsket output fra Claude Design

1. Full sammenlign-side i lyst tema, wizard ikke startet
2. Wizard fullfort: viser anbefalt "1:1 coaching" for HCP 12 voksen
3. Mobil <=640px — sammenlign-tabell scrollbar horisontalt, wizard stables
4. Hover paa Talent-kolonne i tabellen

## Ikke-mål

- Ikke include avanserte filter (denne ER filteret)
- Ikke designe checkout

## Når du er ferdig

Lim design-link tilbake.
