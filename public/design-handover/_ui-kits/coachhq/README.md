# CoachHQ — UI Kit

Intern admin på `/admin`. Desktop-first. Bloomberg-tetthet — bedre tre paneler i samme view enn én luftig kolonne.

## Layout

- **Sidebar 240px** — logo, primær nav (Dagens · Spillere · Plan · Faktura), profil nederst.
- **Topbar 56px** — søk, snarvei-knapp, varslinger, coach-avatar.
- **Innhold** — tre-kolonne dashboard (dagens timeline · innboks · player-snapshot) eller spillerliste full-bredde.

## Skjermer (interaktivt i `index.html`)

1. **Dashboard / Dagens** — timeline til høyre, innboks/varsler i midten, fokus-spiller-snapshot til venstre.
2. **Spillerliste** — tabell med sortbare kolonner, hcp-trend-sparklines, status-badges.

## Komponenter

- `Sidebar`, `Topbar`, `SearchBar`
- `DayTimeline` (samme mønster som `<DayCal>` i athletic)
- `InboxList` (samme mønster som `<QueueList>`)
- `PlayerSnapshot` (avatar + KPI-strip + pyramide)
- `PlayerTable` (tabell med sparkline-kolonne)
- `StatusBadge`
