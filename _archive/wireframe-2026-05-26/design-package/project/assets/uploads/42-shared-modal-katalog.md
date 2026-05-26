# AK Golf Platform — Shared — Modal-katalog (referanse-indeks)

## Identitet

- **Produkt:** Shared / cross-cutting (designer/dev-referanse)
- **URL:** `/admin/design/modals/index`
- **Arketype:** G — Other (komplett indeks-tabell over alle modaler)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/modal-katalog.html` (variant 2 — full indeks)
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Alle vises som indeks-rader

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Mens pakke 20 (`20-shared-modal-katalog.md`) er en visuell katalog med thumbnails, er denne pakken en **flat indeks-tabell** — sorterbar, søkbar, eksportbar. Brukes av PM/dev for å se status (`Designet / Implementert / Avskaffet`), git-link, og som en QA-sjekk: "har vi designet alle modaler vi har planlagt?"

Forskjellig fra pakke 20 (visuell, kategoriserings-fokus) — denne er **rådata + status-tracking**.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Modal-indeks."*
- Subtitle: `42 modaler totalt · 28 designet · 14 stubs · 3 avskaffet`

### Filter-bar
- Søk: "Søk modal-navn"
- Chip: Status (Designet / Stub / Avskaffet)
- Chip: Produkt (Both / CoachHQ / PlayerHQ / Web / Booking)
- Chip: Kategori (Form / Confirm / Info / Wizard / Picker / Detail)
- Sort: Navn / Sist endret / Status / Kategori

### Indeks-tabell

Kolonner:
| Kolonne | Innhold |
|---|---|
| Navn | Mono: `NewPlanModal` |
| Kategori | Pill |
| Produkt | Pill (Both/CoachHQ/PlayerHQ/Web) |
| Status | Pill: Designet (accent) / Stub (gold) / Avskaffet (muted) |
| Brukt i | Lenker til skjermer (kompakt, "+3 til" hvis >3) |
| Sist endret | Relativ tid (Mono): "for 2 dager siden" |
| Designer | Avatar |
| Git-link | Ikon `Github` → kode-fil |

42 rader, paginert (25 per side).

### Right-rail: Stats
- "Designet: 28 av 42 (67%)"
- "Største kategori: Form (15)"
- "Sist endret: `BulkApproveModal` for 4 timer siden"
- "Tomme spor: 3 modaler i kode som ikke brukes"

## KPI-strip (4 kort)

1. Modaler totalt: 42
2. Designet: 28 (67%)
3. Stubs som mangler design: 14
4. Avskaffet (skal slettes): 3

## Klikkbare elementer

| Element | States |
|---|---|
| Tabell-rad | hover, klikk → modal-detail-side |
| Navn-link | klikk → preview-overlay (faktisk modal) |
| Brukt i-lenke | klikk → den skjermen i screen-deck |
| Git-link | klikk → ekstern (åpne i ny fane) |
| Eksporter-CTA | default, hover, klikk → CSV-download av hele tabellen |

## Empty / loading / error

- **Empty (filter null):** "Ingen modaler matcher. Tilbakestill →"
- **Loading:** Skeleton-tabell-rader

## Ønsket output fra Claude Design

1. Lyst tema, full indeks-tabell 42 rader
2. Mørkt tema, samme
3. Filter aktivt: Status=Stub (kun de som mangler design)
4. Hover på en rad
5. Mobil ≤640px — kort-layout per modal med essensielle felter

## Ikke-mål

- Ikke designe selve modalene (det er deres egne batches)
- Ikke implementere git-fil-link-genereringen
- Ikke designe ekstern modal-preview-overlay (egen modal-spec)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
