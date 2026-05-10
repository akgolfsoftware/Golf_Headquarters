# AK Golf Platform — PlayerHQ — Mål-oversikt

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal`
- **Arketype:** A — Dashboard (sub-dashboard for Mål-tab)
- **Tier-gating:** Alle (HCP-projeksjon Pro-låst, leaderboard Pro/Elite-låst)
- **HTML-referanse:** `wireframe/screen-deck/playerhq/mal-oversikt.html` (lastet opp som vedlegg)
- **Inventory:** Sub-pages /portal/mal/{runder, trackman, baner, leaderboard} er separate skjermer

## Designsystem

Bruk `design-system-v2.md`. Spesielt:
- Pyramide-farger fra del 2 (FYS / TEK / SLAG / SPILL / TURN)
- JetBrains Mono for HCP-tall og scorecards
- Sidebar `--color-player-sidebar`

## Spec — hva skjermen er for

«Mål» er PlayerHQ-fanen for **"hvor står jeg, hvor skal jeg, hvordan kommer jeg dit?"**. Oversikt-skjermen aggregerer:

- HCP-trend over tid (12 mnd)
- Mål-grupper (HCP-mål, score-mål, ferdighetsmål) som klikkbare cards
- Pyramide-status (samme komponent som hjem, men større)
- Tournaments coming up
- Personlige rekorder (records)
- Quick-links til sub-skjermer: Runder, TrackMan, Baner

## Layout-anvisning

- **Sidebar (samme som /portal/hjem)** — Mål-tab er active

- **Hovedinnhold**
  - **Hero**
    - Italic Inter Tight 36px: «Mål — hvor du står, og hvor du skal»
    - Sub: «Sist oppdatert: {Dato}»
  - **HCP-trend-card (hero, full bredde)**
    - Stort tall: «12,4» (JetBrains Mono 56px) med trend-pil
    - Sub-tall: «Mål: 9,5 innen sesongslutt 2026»
    - Linje-graf (12 mnd, 1 datapunkt per uke), med projeksjon (Pro-låst — vis med lock-overlay for Free)
    - X-akse: månedsetiketter, Y-akse: HCP
  - **Mål-grupper-rad (3 cards, asymmetrisk)**
    - HCP-mål (stor): tittel + nåverdi + målverdi + progress-bar (lime ved nær mål)
    - Score-mål (medium): "Beat 85" — antall ganger oppnådd / mål
    - Ferdighetsmål (medium): f.eks. "70% putt < 2m" — pill-rad eller %
    - Hver card har "Detaljer →" CTA → åpner `EditGoalModal` (ikke designet her)
  - **Pyramide-card (full bredde, større enn på hjem)**
    - 5 store ringer i pyramide-farger med % i hver
    - "Forklaring →" CTA → åpner PyramidExplainerModal (ikke designet her)
  - **Tournaments coming up (rad med 2-3 mini-cards)**
    - Per turnering: navn, dato, lokasjon, "registrer →"-CTA
    - Hvis ingen: empty-state «Ingen turneringer planlagt»
  - **Personlige rekorder (rad, 4-6 mini-cards)**
    - Hver: kategori (Lengste drive / Beste runde / Mest birdier på en runde / etc.) + verdi + dato
  - **Quick-links (footer-rad, 3 store cards)**
    - "Alle runder →" → `/portal/mal/runder`
    - "TrackMan-økter →" → `/portal/mal/trackman` (Pro-låst-overlay for Free)
    - "Mine baner →" → `/portal/mal/baner`

## Klikkbare elementer som må designes (states)

| Element | States å designe |
|---|---|
| Sidebar-nav (Mål active) | default, hover, active |
| HCP-trend-card | default, hover på datapunkter (tooltip), zoom-toggle (12mnd/24mnd) |
| HCP-projeksjon-linje (Pro-låst) | overlay med 40% opacity + lock-ikon + CTA |
| Mål-card "Detaljer →" CTA | default, hover, focus |
| Pyramide-card | default, hover, klikk → drilldown |
| "Forklaring →" link | default, hover, focus |
| Turneringskort | default, hover, "Registrer →" CTA states |
| Rekord-card | default, hover (tooltip med kontekst), klikk → modal |
| Quick-link-cards | default, hover (lift), Pro-låst-overlay for TrackMan |
| Tier-badge (Pro) | static + hover-tooltip |

## Empty / loading / error-states

- **Empty (ny bruker uten data):** Hero + tom HCP-trend ("Registrer første runde for å se trend") + tom mål-grupper-rad ("Sett ditt første mål →")
- **Empty (få datapunkter):** Vis HCP-trend med "Trend tilgjengelig fra 5+ runder. Du har {N}." + estimat-zone
- **Loading:** Hero ok, alle cards som skeleton
- **Error:** Per-card error med retry

## Ønsket output fra Claude Design

1. Lyst tema (Pro-bruker — full visning)
2. Lyst tema (Free-bruker — HCP-projeksjon + TrackMan-link med lock-overlay)
3. Mørkt tema
4. Hover-states på HCP-graf (datapunkt-tooltip) og mål-card
5. Loading-state
6. Empty-state for ny bruker
7. Mobil-versjon (≤640px) — alle rader stables, mål-cards vertikalt

## Ikke-mål

- Ikke designe sub-skjermer (`/runder`, `/trackman`, `/baner`) — de har egne pakker
- Ikke designe modaler her (NewGoalModal, EditGoalModal, PyramidExplainerModal kommer i B2)

## Når du er ferdig

Lim **design-link** tilbake til Claude Code.
