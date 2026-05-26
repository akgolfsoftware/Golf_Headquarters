# AK Golf Platform — Modal — TemplateSelectorModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** "Bruk mal →"-knapp i NewPlanModal steg 2 (pakke 13), Plan-builder steg 4 (pakke 7), Plan-templates list (batch 2)
- **Type:** Single-step velger-modal (ikke wizard — én skjerm med søk + grid)
- **Tier-gating:** Free får 5 maler. Pro+ ubegrenset.
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/template-selector.html`
- **Audit:** `wireframe/audit/coachhq-templates.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. CoachHQ-modal. Maks 3 lime per modal. **Single-step** men inkludert i batch-4 fordi den lever i form-flyt-konteksten.

## Spec — hva modalen er for

TemplateSelectorModal lar Anders velge en eksisterende plan-mal som basis. Maler kan være system-leverte (eks. "Sommer-toppform 8 uker"), egne-lagrede ("Markus' Sørlandsåpent-prep"), eller delt fra fellesskapet (Pro+ feature). Etter valg lukker modal og pre-fyller parent-wizard med malens data — coach kan så justere.

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 960px (bredere enn standard for grid-display), `rounded-xl` (12px), bakdrop standard
- **Header (sticky, 80px):**
  - Tittel italic: «Velg mal»
  - Sub: "78 maler tilgjengelig"
  - Lukk-X
- **Filter-bar (sticky under header, 56px):**
  - Søkefelt: "Søk mal …"
  - Chip: Kategori (multi: Forberedelse / Sesong / Junior / Voksen / Komme-tilbake / Vintertrening)
  - Chip: Lengde (multi: 4 uker / 8 uker / 12 uker / 16+ uker)
  - Chip: Kilde (System / Mine / Fellesskap)
  - Sort: Mest brukt / Nyeste / A–Å
- **Body (grid 3-kolonner desktop, 70vh max + scroll):**
  - Mal-kort (300×220px hver):
    - Header: tittel italic + kategori-pill
    - Pyramide-mini-donut (40px) + "8 uker · 32 økter"
    - Beskrivelse (2 linjer, ellipsis)
    - Footer: "Brukt {N} ganger · ⭐ 4.8" + "Forhåndsvis →"-link
  - Grid-empty-tilstand: "Ingen maler matcher filteret"
- **Footer (sticky, 64px):**
  - Venstre: "Avbryt"
  - Høyre: "Forhåndsvis valgt mal →" (ghost) + "Bruk valgt mal →" (primary, accent — disabled til en mal er valgt)

### Forhåndsvis-state (in-modal overlay)

Klikk på "Forhåndsvis →" i kort eller footer åpner side-panel-overlay (50% bredde, slides in fra høyre):
- Hele malens innhold: pyramide, alle 32 økter med dag/tid/varighet/øvelser
- "← Tilbake til liste" + "Bruk denne malen →" i panel-footer

## Klikkbare elementer

| Element | States |
|---|---|
| Søkefelt | default, focus, with-text, clear-X |
| Filter-chip | default, hover, valgt (count-badge), focus |
| Sort-dropdown | default, open, valgt |
| Mal-kort | default, hover (lift + accent ring), valgt (accent border + ✓ hjørne) |
| "Forhåndsvis →"-link i kort | default, hover, klikk → forhåndsvis-overlay |
| Forhåndsvis-overlay | open, "← Tilbake" lukker overlay |
| Pyramide-donut | static (mini visualisering) |
| "Avbryt" | default, hover |
| "Forhåndsvis valgt mal →" | default, hover, disabled (ingen valgt) |
| "Bruk valgt mal →" | default, hover, active, disabled (ingen valgt), loading ("Laster mal …") → lukker modal |
| Lukk-X | default, hover |

## Empty / loading / error / success-states

- **Initial loading:** Skeleton 9 mal-kort i grid
- **Empty (alle):** "Ingen maler ennå. [Bygg din første →]" CTA → lukker modal og redirecter til Plan-builder blank
- **Empty (filter):** "Ingen treff. Tilbakestill filter →"
- **Tier-gating Free:** 6. mal og videre dempet med lås-ikon + tooltip "Krever Pro" — klikk → upgrade-toast
- **Forhåndsvis loading:** Side-panel viser skeleton-økter
- **Bruk-loading:** CTA-spinner, "Laster mal …" → modal lukker, parent-wizard pre-fylles
- **Bruk-error:** Toast: "Kunne ikke laste mal. Prøv igjen."

## Mobile (≤640px)

Full-screen modal. Filter-bar collapser til "Filter (3) ↓"-knapp som åpner bottom-sheet. Grid blir 1-kolonne. Forhåndsvis-overlay tar hele skjermen.

## Ønsket output fra Claude Design

1. Lyst tema, default (78 maler i grid, ingen filter)
2. Lyst tema, søkt + filtrert ("Sommer" + Junior + 8 uker → 4 treff)
3. Lyst tema, mal valgt (accent border + ✓), CTA aktiv
4. Lyst tema, forhåndsvis-overlay åpen (mal-detalj med 32 økter)
5. Lyst tema, empty-filter ("Ingen treff")
6. Lyst tema, tier-gating Free (lås-ikoner på maler 6+)
7. Mørkt tema
8. Mobil ≤640px (1-kolonne grid)

## Ikke-mål

- Ikke designe Plan-templates list-skjerm (batch 2 — separat)
- Ikke designe "Lag ny mal"-flyten (egen pakke senere)
- Ikke designe community-maler-modereringsverktøy (egen pakke)
- Ikke designe parent-wizardene som åpner denne (pakke 7, 13)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
