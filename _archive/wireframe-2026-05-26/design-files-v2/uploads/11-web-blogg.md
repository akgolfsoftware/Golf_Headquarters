# AK Golf Web — Blogg-liste

## Identitet

- **Produkt:** Web
- **URL:** `/blogg`
- **Arketype:** Web — magazine-grid
- **HTML-referanse:** `wireframe/screen-deck/web/blogg.html`
- **Audit:** `wireframe/audit/web-blogg.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Bloggen er SEO-motoren. 2 nye artikler i maneden. Long-form coaching-innhold,
TrackMan-analyser, intervju med spillere. Bygger autoritet i Google og gir
ammunisjon til nyhetsbrev og SoMe.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `BLOGG`
- H1: `Tanker fra *baneside*.`
- Sub: `Coaching, data, analyse, og av-og-til en fortelling fra livet pa range.`

### 2. Featured-artikkel (lys, 64px, full bredde)

Stor card med bilde 16:9 venstre + tekst hoyre:
- Eyebrow (mono): `KATEGORI · 12. MAI 2026`
- H2 (italic): `Hvorfor AoA er viktigere enn klubbhastighet for amatorer.`
- Lede (3 linjer): `Vi har analysert 1 200 amatorer pa TrackMan...`
- Forfatter: Anders Kristiansen + lestid: `8 min lesning`
- CTA: `Les artikkel →`

### 3. Filter-bar (lys, sticky, 64px)

- Chip: Alle / Coaching / TrackMan / Spiller-portrett / Trening / Mental
- Sok: `Sok artikler`
- Sort: Nyeste / Mest leste

### 4. Artikkel-grid (lys, 96px, grid-3)

12 artikkel-cards (3x4 grid). Hver card:
- Bilde 16:9 (rounded-xl)
- Eyebrow (mono): `KATEGORI · DATO`
- H3: Tittel (Inter Tight, 20px)
- 2-linje-utdrag
- Forfatter-rad: Avatar (24px) + navn + lestid

Eksempler:
- `Slik bygger du en repeterbar sving` — Anders K
- `Markus' vei fra HCP 14 til +0.4` — Spiller-portrett
- `5 oevelser for bedre putting under press` — Markus R
- `Hva TrackMan-data sier om norsk amatorgolf` — Sara Lien
- `Mental coaching: hvordan slutte aa tenke pa scoren` — Anders K
- ... + 7 til

### 5. Pagination (lys, 32px)

`< Forrige | 1 [2] 3 4 ... 12 | Neste >` (mono tall)

### 6. Newsletter-CTA (mørkt band)

`Vil du ha disse i innboksen?` -> Email-input + `Abonner →` (lime)
Sub: `2 artikler i maneden. Aldri spam.`

### 7. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Filter-chip | default, hover, selected (lime bg) |
| Sok-felt | default, focus, with-text, clear-button |
| Featured-card | default, hover (lift), klikk -> artikkel |
| Artikkel-card | default, hover (image zoom subtle + tittel lime), klikk -> artikkel |
| Pagination-tall | default, hover, active page (lime bg) |
| Newsletter-input | default, focus, valid, error |

## Empty / loading / error

- **Empty filter:** "Ingen artikler matcher filteret. Tilbakestill →"
- **Empty sok:** "Ingen treff for {sok}. Proev andre nokkelord."
- **Loading:** 6 skeleton-cards (16:9 + tekst-bars)

## Ønsket output fra Claude Design

1. Full side med 12 artikler i lyst tema
2. Filter aktivt: TrackMan (viser 3 av 12)
3. Mobil <=640px — featured stables, grid blir 1-kol
4. Hover pa Markus-portrett-card

## Ikke-mål

- Ikke designe artikkel-detalj (egen 12)
- Ikke include kommentarer

## Når du er ferdig

Lim design-link tilbake.
