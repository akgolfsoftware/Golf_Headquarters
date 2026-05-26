# AK Golf Platform — Modal — TemplateSelectorModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** «Bruk mal →» i `NewPlanModal` steg 2 (pakke 19) ELLER `Maler`-tab på `/admin/plans` (pakke 01)
- **Type:** Selector-modal med thumbnail-grid + søk
- **Tier-gating:** Ikke relevant (CoachHQ — coach-only)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/template-selector.html`
- **Audit:** `wireframe/audit/coachhq-plans.md` (modal-seksjon)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. CoachHQ-modal — `card`-bg lyst, `popover`-bg mørkt. Eksakte token-navn — ikke hardkode hex.

## Spec — hva modalen er for

TemplateSelectorModal lar coach (Anders K.) velge en av 9 ferdig-bygde plan-maler som starting-point for ny plan. Hver mal viser tittel, varighet, fokus-pyramide og antall økter. Coach kan filtrere etter kategori eller varighet. Valg lukker modal og pre-fyller tilbake til `NewPlanModal` steg 3.

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 880px, høyde auto, `rounded-xl`, bakdrop blur(4px)
- **Header (sticky, 88px):**
  - Tittel italic Instrument Serif 22px: «Velg plan-mal»
  - Sub: «9 maler tilgjengelige · Valg pre-fyller wizard»
  - Lukk-X øverst-høyre
  - **Søk + filter-rad:**
    - Søk-felt (full bredde): «Søk maler …»
    - Chip-rad: **Kategori** (Putte · Chip · Iron · Driver · Fullswing · Mental) · **Varighet** (4 uker · 6 uker · 8 uker · 12 uker) · **Vanskelighet** (Begynner · Middels · Avansert)
- **Body (max 60vh, scrollbar):**
  - **Mal-grid 3×3:** 9 mal-thumbnail-cards (260×280px)
  - **Card-spec:**
    - Topp-bånd (60px): pyramide-pie i miniatyr (5 kategorier som sektorer i kategori-fargene) + varighet-pill «6 uker» i hjørnet
    - Tittel (Inter Tight 16px semibold): f.eks. «Putte-mester 6-uker»
    - Sub (muted 12px): «Begynner-Middels · 18 økter»
    - Pyramide-fokus-rad: 5 mini-bars FYS/TEK/SLAG/SPILL/TURN — bar-høyde basert på vekt (eks Putte-mester = SLAG dominant)
    - Sub-meta (11px muted): «Brukt 47 ganger · 4,8★ snitt»
    - Footer-CTA: `Bruk →` (primary, accent-pill, full bredde nederst i card)
  - **9 maler (eksempler):**
    1. Putte-mester 6-uker (Begynner-Middels)
    2. Driver distance 8-uker (Middels-Avansert)
    3. Iron presisjon 4-uker (Middels)
    4. Wedge-touch 6-uker (Middels-Avansert)
    5. Mental fokus 8-uker (Alle)
    6. Komplett fundament 12-uker (Begynner)
    7. Konkurranse-prep 4-uker (Avansert)
    8. Off-season FYS 8-uker (Alle)
    9. Junior basics 6-uker (Begynner)
- **Footer (sticky, 64px):**
  - Venstre: «Tilbake» (sekundær, går til wizard steg 2)
  - Høyre: tom (valg skjer via card-CTA, ikke footer)

## Klikkbare elementer

| Element | States |
|---|---|
| Søk-felt | default, focus, with-text, clear-button, no-results |
| Filter-chip | default, hover, selected (accent-bg + count-badge), disabled |
| Mal-card | default, hover (lift 2px + accent-border), klikk hvor som helst → samme som CTA |
| `Bruk →`-CTA per card | default, hover, active, focus, loading (kort transition før modal lukker) |
| Pyramide-pie | tooltip ved hover viser eksakt fordeling «FYS 10% · TEK 30% · SLAG 50% · SPILL 5% · TURN 5%» |
| Pyramide-bar-rad | tooltip viser samme |
| Sub-meta-rating «4,8★» | tooltip «Basert på 47 bruk» |
| Lukk-X | default, hover, focus, klikk → returnerer til wizard uten valg |
| «Tilbake»-knapp | default, hover, focus |

## Empty / loading / error / state-varianter

- **Filter no-results:** «Ingen maler matcher filteret. Tilbakestill →»
- **Søk no-results:** «Ingen treff for «{søk}». Vis alle maler →»
- **Loading:** 6 grå skeleton-cards i grid
- **Error:** «Kunne ikke laste maler. Prøv igjen →» med retry
- **Hover-state:** 1 card løftet med accent-border + CTA fremhevet
- **Klikk-loading:** Valgte card viser kort spinner + dempes, modal lukker etter 400ms

## Mobile (≤640px)

Full-screen modal. Grid blir 1 kolonne × 9 cards. Søk + filter sticky. Footer sticky. Cards full bredde med samme info-tetthet.

## Ønsket output fra Claude Design

1. Default lyst tema (9 cards i 3×3 grid)
2. Filter aktivt (Putte + Begynner — viser 2 maler)
3. Hover på «Putte-mester 6-uker»-card
4. Mørkt tema
5. Søk aktivt med no-results
6. Loading
7. Mobile full-screen (cards 1 kolonne)
8. Klikk-loading (modal i ferd med å lukke)

## Ikke-mål

- Ikke designe `NewPlanModal` (pakke 19) — denne er trigger
- Ikke designe mal-redigering (egen pakke senere — `NewPlanTemplateModal`)
- Ikke implementere ekte mal-database — bruk de 9 eksempel-malene listet over
