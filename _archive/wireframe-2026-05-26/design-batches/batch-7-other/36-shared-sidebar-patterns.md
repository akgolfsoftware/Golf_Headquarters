# AK Golf Platform — Shared — Sidebar-mønstre

## Identitet

- **Produkt:** Shared / cross-cutting (designer-referanse)
- **URL:** `/admin/design/sidebars`
- **Arketype:** G — Other (katalog-grid med live demos)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/sidebar-patterns.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Ingen

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Sidebar-mønstre dokumenterer alle navigations- og context-sidebars i plattformen. CoachHQ har sin to-lags rail+nav (56px rail + 200px nav). PlayerHQ har venstre-sidebar (desktop) + tab-bar (mobil). Settings har sub-nav (vertikal). Master-detail har list-rail venstre. Denne katalogen viser alle 6 mønstre med spec.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hvor man navigerer."*
- Subtitle: `6 sidebar-mønstre · 2 produkt-stiler`

### Demo-grid (2-kolonne, brede cards med live snapshots)

Hvert kort:
- **Live demo** av sidebar (faktisk komponent renderet, ikke screenshot)
- **Tittel** (Geist 14px medium): "CoachHQ to-lags rail+nav"
- **Bruks-kontekst**: "Alle CoachHQ-skjermer"
- **Spec**:
  - Rail-bredde: 56px
  - Nav-bredde: 200px
  - Rail-bg: #061210
  - Nav-bg: #FAFAF7
  - Active item: rgba(209,248,67,0.30) bg + #0A1F18 text

6 mønstre:

1. **CoachHQ to-lags rail+nav** (smal mørk rail + lys nav-kolonne)
2. **PlayerHQ venstre-sidebar (desktop)** (240px, lys, ikoner + labels)
3. **PlayerHQ bottom-tab-bar (mobil)** (56px høyde, 4 tabs: Hjem/Tren/Mål/Meg)
4. **Settings sub-nav** (vertikal, 200px, sticky)
5. **Master-detail list-rail** (320px liste til venstre, detail til høyre)
6. **Collapsible context-sidebar** (slide-out 320px fra høyre, brukt i kalender og live-session)

### Right-rail: Regler
- "CoachHQ-rail er ALLTID synlig (ikke collapsible)"
- "PlayerHQ-tab-bar (mobil) ALLTID synlig (sticky bottom)"
- "Sub-nav er sticky til skjermhøyde"
- "Active state må være tydelig — ikke bare bold tekst, men også bakgrunn"

## KPI-strip — IKKE for denne

## Klikkbare elementer

| Element | States |
|---|---|
| Demo-card | hover (lift) |
| Live demo nav-items | klikkbare for å vise active-state-bytte |
| Collapse-knapp på pattern 6 | klikk for collapse/expand demo |

## Empty / loading / error

- N/A

## Ønsket output fra Claude Design

1. Lyst tema, full katalog
2. Mørkt tema, samme
3. CoachHQ to-lags vist med en active item highlightet
4. PlayerHQ tab-bar med "Tren" active
5. Mobil ≤640px — 1-kolonne grid

## Ikke-mål

- Ikke implementere routing (det er kode)
- Ikke designe sidebar-personalisering (egen settings-flate)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
