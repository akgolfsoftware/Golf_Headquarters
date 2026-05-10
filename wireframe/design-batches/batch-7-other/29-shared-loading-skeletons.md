# AK Golf Platform — Shared — Loading-skeletons-katalog

## Identitet

- **Produkt:** Shared / cross-cutting (designer/dev-referanse)
- **URL:** `/admin/design/skeletons`
- **Arketype:** G — Other (katalog-grid med live skeletons)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/loading-skeletons.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Ingen

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Skeletons-katalogen viser alle skeleton-loader-mønstre i plattformen — hver skjermtype har sin matchende skeleton (table-row, card, kanban-card, chart, hero, etc). Animasjon: pulse 1.4s ease-in-out infinite. Brukes for å sikre at skeleton ALWAYS matcher faktisk innhold, så bytte fra loading→loaded er sømløst.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Mens vi venter."*
- Subtitle: `14 skeleton-mønstre · alle med pulse-animasjon`

### Filter-bar
- Chip: Type (Table / Card / Kanban / Chart / Hero / List / Avatar / Form)
- Toggle: "Animer" (pulse av/på)

### Katalog-grid (2-kolonne, brede cards)

Hvert kort:
- **Live skeleton-rendering** (faktisk pulserende skeleton i 16:10 ratio)
- **Tittel** (Geist 14px medium): "Table-row skeleton"
- **Bruks-kontekst**: "Brukt i alle list-skjermer (arketype B)"
- **Spec**: "5 grå rader, 60px hver, gap 8px, pulse 1.4s"
- **Kode-snippet** (kollapset, klikk for expand):
  ```tsx
  <SkeletonRow count={5} />
  ```

14 mønstre:
1. Table-row (5 rader)
2. KPI-card (4-grid)
3. Kanban-card (3 kolonner × 3 cards)
4. Hero (italic-fragment + subtitle)
5. Chart line/area
6. Chart bar
7. Chart donut
8. Avatar + label
9. Form-field
10. Sidebar-list-item
11. Notification-row
12. Tab-bar
13. Map-pin (for kart-views)
14. Calendar-grid (for kalender-views)

### Right-rail: Regler
- "Skeleton skal alltid matche faktisk innhold (samme antall rader, samme bredder)"
- "Animer alltid (uten animasjon = død skjerm)"
- "Maks 1.5s før vi går til empty-state hvis ingen data"

## KPI-strip — IKKE for denne

## Klikkbare elementer

| Element | States |
|---|---|
| Card | hover (lift) |
| Animer-toggle | default, klikk → pause/resume alle skeletons |
| Kode-snippet | kollapset, klikk → expand |
| Filter-chip | default, hover, selected |

## Empty / loading / error (meta!)

- Selve skeleton-katalogen kan ikke ha empty-state — den er alltid full

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 14 mønstre med pulse
2. Mørkt tema, samme
3. Animer-toggle av (statiske skeletons)
4. Filter aktivt: Type=Chart (kun chart-skeletons)
5. Mobil ≤640px — 1-kolonne grid

## Ikke-mål

- Ikke designe alle skjerm-skeletons fra scratch (det skjer per skjerm i andre batches)
- Ikke implementere animasjon-systemet

## Når du er ferdig

Lim design-link tilbake til Claude Code.
