# AK Golf Web — Coach-liste

## Identitet

- **Produkt:** Web
- **URL:** `/coaches`
- **Arketype:** Web — subhero + filter + grid
- **HTML-referanse:** `wireframe/screen-deck/web/coaches.html`
- **Audit:** `wireframe/audit/web-coaches.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Coach-listen lar besøkende velge coach basert på spesialitet, anlegg og
nivå. Hver coach har en public profil-side. Siden er en konverteringsbro
fra "interessant" til "book intro-samtale med Anders".

## Layout — UNIKT

### 1. Subhero (#0A1F18 -> #143027)

- Eyebrow: `VÅRE COACHES`
- H1: `Norges *fremste* coaching-team.`
- Sub: `Fra junior til Challenge Tour. Velg coach basert på spesialitet eller la oss matche deg.`
- CTA: `La oss matche deg →` (lime pill) + `+ Bli coach hos oss` (outline)

### 2. Filter-bar (lys, sticky etter scroll, 80px)

- Chip: Spesialitet (Junior / Talent / Voksen / Touring pro)
- Chip: Anlegg (Mulligan Indoor / GFGK / Bossum / Drobak)
- Chip: Språk (Norsk / Engelsk)
- Sort: Mest erfaren / Alfabetisk

### 3. Coach-grid (lys, 96px, grid-3 desktop)

5 coach-cards (en stor for Anders, 4 vanlige for resten):

**Anders Kristiansen (featured-card, full bredde row 1)**
- Stort portrett venstre (320px sirkel)
- Eyebrow: `HEAD COACH · GRUNNLEGGER`
- H3: Anders Kristiansen
- Bio (3 linjer): PGA siden 2008. Spesialiserer på talent og touring pro.
  Hovedcoach for WANG Toppidrett.
- Specs-rad: 16 års erfaring · 200+ spillere · 4 NGF-poeng-spillere
- CTA: `Se profil →` + `Book intro →`

**Julie Solem** — Junior-spesialist · Drobak GK · 6 års erfaring
**Markus R. Pedersen** — Talent-coach · Mulligan Indoor · 4 års erfaring
**Emil Halvorsen** — Voksen-spesialist · GFGK Range · 8 års erfaring
**Sara Lien** — TrackMan-analytiker · Mulligan Indoor · 5 års erfaring

Hver vanlig coach-card: portrett (sirkel 120px) + navn + spesialitet + anlegg + erfaring + `Se profil →`.

### 4. Bli coach-CTA (mørkt band)

`Vi vokser. Vil du være med?` -> `Se ledige stillinger →`

### 5. Mega-footer

## Klikkbare elementer

| Element | States |
|---|---|
| Filter-chip | default, hover, selected (lime bg) |
| Coach-card | default, hover (lift + ring), klikk -> /coaches/[slug] |
| Featured-card CTA "Book intro" | default, hover, focus |

## Empty / loading / error

- **Empty filter:** "Ingen coaches matcher filteret. Tilbakestill →"
- **Loading:** 5 skeleton-cards med sirkel + tekst-bars

## Ønsket output fra Claude Design

1. Full side med 5 coaches i lyst tema
2. Filter aktivt: Junior + Drobak (viser bare Julie, "Viser 1 av 5")
3. Mobil <=640px — grid blir 1-kol, featured-card stables
4. Hover på Markus-card

## Ikke-mål

- Ikke designe coach-profil-detalj (egen 04-pakke)
- Ikke include CV-PDF-nedlastning

## Når du er ferdig

Lim design-link tilbake.
