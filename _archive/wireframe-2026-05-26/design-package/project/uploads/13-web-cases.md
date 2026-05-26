# AK Golf Web — Cases (suksesshistorier)

## Identitet

- **Produkt:** Web
- **URL:** `/cases`
- **Arketype:** Web — case-grid med social proof
- **HTML-referanse:** `wireframe/screen-deck/web/cases.html`
- **Audit:** `wireframe/audit/web-cases.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Cases-siden er den sterkeste social-proof-flatene. Hver case er en spiller
med konkret data: HCP-endring, NGF-poeng, spesielle resultater. Skiller AK
Golf fra konkurrenter som bare snakker om "kvalitet".

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `SUKSESSHISTORIER`
- H1: `Det er *spillerne* som teller.`
- Sub: `Ekte data, ekte navn, ekte resultater. Klikk en historie for hele forklaringen.`

### 2. Filter-bar (lys, 64px)

- Chip: Alle / Junior / Talent / Voksen / Touring pro
- Chip: Tidsperiode (< 6 mnd / 6-12 mnd / 1-2 ar / 2+ ar)
- Sort: Storste HCP-endring / Nyeste / Lengst samarbeid

### 3. Featured-case (lys, 64px, asymmetrisk)

**Markus R. Pedersen — Talent**
Stort foto venstre (40%), tekst hoyre (60%):
- Eyebrow: `TALENT · 14 MND`
- H2 (italic): `Fra *HCP 14* til *+0.4*. Pa 14 maneder.`
- 3 metric-pills (mono):
  - HCP: `14 -> +0.4` (delta -14.4 lime)
  - NGF-poeng: `0 -> 14` (lime)
  - Snitt-runde: `82 -> 70` (-12 lime)
- Sitat: *"Anders ser det jeg ikke ser. Det har endret alt."*
- CTA: `Les hele historien →`

### 4. Case-grid (lys, 96px, grid-3)

9 case-cards. Hver card:
- Foto (4:5 portrett)
- Eyebrow (mono): `KATEGORI · MND-PERIODE`
- H3 (italic accent): `HCP X -> Y`
- Spillernavn
- 2-linje-resultat
- CTA: `Les →`

Eksempler:
- Lina Hellesund — Talent — HCP 8.2 -> 4.1 — `WANG-elev, 8 mnd`
- Joachim Tangen — Voksen — HCP 18 -> 12 — `2 ar`
- Tor Erik Kjelby — Voksen — HCP 16 -> 8 — `24 mnd`
- Hanne Solberg — Junior — HCP 24 -> 14 — `12 mnd`
- Per Bossum — Klubbgolfer — HCP 11 -> 6 — `18 mnd`
- Emma Solberg — Voksen — HCP 14 -> 8.7 — `9 mnd`
- Anna Karlsen — Junior — HCP 32 -> 18 — `14 mnd`
- Mads Roenning — Talent — HCP 6 -> +1 — `2 ar`

### 5. Aggregert statistikk (lys-sand, 96px)

`Pa tvers av alle vare spillere:`
4 stats-cards (mono store tall):
- `1 200+` spillere coachet siden 2008
- `-4.2` snitt HCP-reduksjon forste 12 mnd
- `94%` fornoyd / svaert fornoyd (NPS-lignende)
- `4` spillere pa NGF-rangering

### 6. Mørkt CTA-band

`Vil du bli neste case?` -> `Book intro →` + `Se tjenester →`

### 7. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Filter-chip | default, hover, selected |
| Featured-case | default, hover (lift), klikk -> case-detalj |
| Case-card | default, hover (foto subtle zoom + lime border), klikk -> case-detalj |
| Stats-card | static |

## Empty / loading / error

- **Empty filter:** "Ingen cases matcher. Tilbakestill →"
- **Loading:** Skeleton-cards med 4:5-bilde-placeholder

## Ønsket output fra Claude Design

1. Full side i lyst tema, alle 9 cases synlige
2. Filter aktivt: Talent (viser bare Markus, Lina, Mads = 3 av 9)
3. Mobil <=640px — grid-3 blir 1-kol
4. Hover pa Lina-card

## Ikke-mål

- Ikke designe case-detalj (egen 14)
- Ikke include videointervju (linker til YouTube)

## Når du er ferdig

Lim design-link tilbake.
