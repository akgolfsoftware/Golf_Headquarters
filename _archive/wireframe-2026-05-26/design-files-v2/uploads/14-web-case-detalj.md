# AK Golf Web — Case-detalj (STAR-format)

## Identitet

- **Produkt:** Web
- **URL:** `/cases/[slug]` (eks. `/cases/markus-r-pedersen`)
- **Arketype:** Web — long-form case-study (STAR)
- **HTML-referanse:** `wireframe/screen-deck/web/case-detalj.html`
- **Audit:** `wireframe/audit/web-case-detalj.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Long-form case-side med STAR-format (Situasjon-Tiltak-Aksjoner-Resultat).
Markus R. Pedersen brukes som template. Skal selge AK Golf gjennom
detaljert proses-narrative — ikke bare "han fikk lavere HCP".

## Layout — UNIKT

### 1. Case-hero (mørk #0A0A0A, 96px, asymmetrisk)

Venstre (50%):
- Eyebrow (mono lime): `CASE STUDY · TALENT · 14 MND`
- H1 (Inter Tight 64px): `Markus *R. Pedersen*.`
- Sub: `Fra HCP 14 til +0.4 pa 14 maneder. NGF-rangert som 22-aring.`
- Metric-pills (mono store tall):
  - `HCP: 14 -> +0.4`
  - `NGF: 14 poeng`
  - `Score: -12 stroke/runde`

Hoyre (50%): Stort portrett (4:5 portrett-format, rounded-2xl)

### 2. STAR-narrative (lys, 96px, sentrert max 880px)

4 store seksjoner med h2:

**Situasjon (Sept 2024)**
- HCP 14, frustrert med plataet
- Hadde provd 3 forskjellige coaches, ingen progresjon
- Spilte 50 runder/aar uten struktur
- "Gikk pa range to ganger i uken og slo pa drivere"

**Tiltak (Okt 2024)**
- Forste TrackMan-okt med Anders avdekket: AoA -3.2 (skulle vaert -1)
- Plan: 3 maneder fokus pa AoA + bunn-kontakt
- Strukturert week-program: 2 PD/uke + 1 fritids-runde

**Aksjoner (Okt 2024 - Mai 2026)**
- Maned 1-3: AoA-fokus (+2.4 forbedring)
- Maned 4-8: Spillstrategi + putting (-2.1 strokes/runde)
- Maned 9-12: Mental + tournament-prep (forste NGF-poeng)
- Maned 13-14: Fine-tuning + fysisk (HCP +0.4)

**Resultat (Mai 2026)**
- HCP: +0.4 (fra 14)
- NGF-poeng: 14 (rangert 22-aring)
- Spilte sin forste pro-am
- Onkler skole pa stipend

### 3. Data-visualisering (lys, 96px)

HCP-progresjon-graf over 14 maneder (line chart, lime line + axes):
- X: maned (Okt 24 - Mai 26)
- Y: HCP (-2 til 16)
- Annotations pa nokkel-momenter (forste TrackMan, forste NGF-poeng, etc.)

### 4. Sitat-block (lys-sand, 64px sentrert)

Stort sitat (Instrument Serif italic 32px):
*"Anders ser det jeg ikke ser. Etter 3 ar med andre coaches uten resultat var dette som natt og dag."*
— Markus R. Pedersen

### 5. Coach-perspektiv (lys, 64px)

`Anders sin kommentar:`
Bio-card med Anders avatar + 4-paragraffer-tekst om hva han sa, hva han endret,
hva som fungerte og hva som overrasket.

### 6. Pa kort sikt + lang sikt (lys, 64px, grid-2)

2 cards:
- **Neste 12 mnd:** Sikte mot Challenge Tour-kvalifisering
- **5-ars maal:** Top-100 Order of Merit

### 7. Mørkt CTA-band

`Vil du ha samme oppfolging?` -> `Book intro →` (lime) + `Se vare tjenester →` (outline)

### 8. Relaterte cases (lys, 64px)

3 andre talent-cases: Lina, Mads, Anna.

### 9. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Metric-pill | static, info-popover pa hover |
| HCP-graf | hover -> tooltip med dato + HCP |
| Sitat | static |
| Anders-card CTA | default, hover, focus |
| Relatert-case-card | default, hover, klikk -> case |

## Empty / loading / error

- **404 ukjent slug:** redirect til /cases
- **Graph-loading:** Skeleton line-chart

## Ønsket output fra Claude Design

1. Markus' case full side i lyst tema
2. Mobil <=640px — STAR-seksjoner stables, hero stables
3. Graf med tooltip pa et punkt
4. Variant: Tor Erik (voksen-case) i samme template

## Ikke-mål

- Ikke include videointervju
- Ikke include "Snakk med Markus"-kontakt

## Når du er ferdig

Lim design-link tilbake.
