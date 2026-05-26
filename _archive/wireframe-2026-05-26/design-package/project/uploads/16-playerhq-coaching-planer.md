# AK Golf Platform — PlayerHQ — Coaching-planer

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/plans`
- **Arketype:** B — List + filter (kanban-variant)
- **Tier-gating:** **Pro/Elite.** Free ser hele siden med lock-overlay + CTA til `UpgradeToProModal`.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coaching-planer.html`
- **Audit:** `wireframe/audit/playerhq-coaching-planer.md`
- **Tilhørende modaler:** `PlanProposalDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Maks 3 lime per skjerm. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren, Anders K. er coach.

## Spec — hva skjermen er for

Coaching-planer er Markus' utsikt over alle treningsplaner Anders K. har laget for ham — fra forslag som venter på godkjenning, til aktive planer han følger nå, til ferdige planer han kan se tilbake på. Skjermen er ukentlig destinasjon for å akseptere/avvise nye planer og sjekke fremdrift.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`. I tillegg:

- **Hero italic Instrument Serif 36px:** *«1 aktiv plan, Markus. 2 forslag venter.»* Sub: «Anders K. har sendt 2 nye forslag for juni-juli»
- **Ingen KPI-strip** — direkte til kanban
- **Kanban-kolonner (3):**
  - **Foreslått** (2) — accent-prikk i header, må handles på
  - **Aktiv** (1) — primary-prikk, breddest
  - **Ferdig** (5) — collapsed by default, klikk for å vise
- **Plan-kort-spec (full kolonne-bredde, ~280px):**
  - Coach-avatar 24px (Anders K.) øverst-venstre
  - Plan-tittel italic Instrument Serif 18px (eks «Putte-fokus mai»)
  - Periode-pill (JetBrains Mono 11px): «6. mai – 31. mai 2026»
  - Status-pill (kategori-farge): «Foreslått» (accent) / «Aktiv» (primary) / «Ferdig» (muted)
  - Pyramide-fokus-rad: 5 mini-prikker FYS/TEK/SLAG/SPILL/TURN — fylt prikker = vekt
  - Progress-bar (kun Aktiv): 4px, accent-fyll, «64% gjennomført»
  - Footer-CTA: «Detaljer →» → `PlanProposalDetailModal`
- **Foreslått-kort har ekstra:** to pill-knapper «Godta» (accent) + «Avvis» (muted) under «Detaljer →»

## Filter-bar — UNIKT

- Søk: «Søk planer …»
- Chip: **Coach** (Anders K · Sara · Tom — hvis flere coaches)
- Chip: **Periode** — Inneværende · Sesongen · Alt
- Chip: **Pyramide-fokus** — FYS · TEK · SLAG · SPILL · TURN
- Sort: Sist endret (default) · Periode-start · A–Å
- Ingen primary CTA («Ny plan» kommer fra coach, ikke spiller)

## Klikkbare elementer

Se `wireframe/audit/playerhq-coaching-planer.md`. UNIKT:

| Element | States |
|---|---|
| Plan-kort | default, hover (lift + accent-border), klikk → `PlanProposalDetailModal` |
| «Godta»-pill (Foreslått-kort) | default, hover, active, focus, loading (under godkjenning) |
| «Avvis»-pill | default, hover (subtil destructive-tint), klikk → confirm-popover |
| Kanban-kolonne-header | default, hover, count-badge |
| Ferdig-kolonne | collapsed (default), expanded |
| Coach-avatar | default, hover (tooltip «Anders Kristiansen — din coach») |
| Pyramide-fokus-prikk | default, hover (tooltip «TEK 40%») |
| Progress-bar | 0%, 25%, 50%, 75%, 100% (accent når fullført) |
| Lock-overlay (Free) | full skjerm-overlay + lucide `Lock` + CTA «Oppgrader til Pro for personlig coaching →» |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Empty (Pro, ingen plan):** «Anders K. har ikke sendt deg en plan ennå. Be om plan →» CTA-link
- **Empty per kolonne:** «Ingen planer i {kolonne}» + dempet ikon `ClipboardList`
- **Tier-låst (Free):** Hele siden bak full lock-overlay-card:
  - Lucide `Lock` 48px
  - «Coaching-planer er en Pro-feature»
  - 3 fordeler (personlig plan fra coach, ukentlig progresjon, AI-tilpasset)
  - CTA «Oppgrader til Pro →»
- **Loading:** Skeleton plan-kort (2 i Foreslått, 1 i Aktiv)

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema (Pro — alle 3 kolonner med data)
2. Hovedskjerm lyst tema (Free — full lock-overlay)
3. Mørkt tema (Pro)
4. Hover på Foreslått-kort med Godta/Avvis-knapper synlige
5. Empty (Pro, ingen plan)
6. Loading
7. Mobil ≤640px — kanban scrollbar horisontalt, kort 280px

## Ikke-mål

- Ikke designe `PlanProposalDetailModal` (egen pakke senere)
- Ikke designe plan-detalj-skjerm (`/portal/coach/plans/:id` — egen batch)
- Ikke endre kolonne-rekkefølge (Foreslått → Aktiv → Ferdig er fast)
