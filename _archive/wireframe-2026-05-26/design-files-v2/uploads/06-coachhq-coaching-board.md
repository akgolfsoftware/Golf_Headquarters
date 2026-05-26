# AK Golf Platform — CoachHQ — Coaching Board

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/board`
- **Arketype:** E — Fullscreen / Live (kanban-board)
- **Tier-gating:** Pro coach-tier
- **HTML-referanse:** `wireframe/screen-deck/coachhq/coaching-board.html`
- **Audit:** `wireframe/audit/coachhq-coaching-board.md`
- **Tilhørende modaler:** `PlanActionDetailModal`, `AgentFeedbackModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coaching Board er CoachHQs fullscreen-kanban hvor alle aktive plan-aksjoner og agent-anbefalinger lever som kort. Forskjellen fra Treningsplaner-kanban (batch-2) er at dette er en **live operasjonell tavle** — coach drar kort gjennom 4 kolonner (Innkommende → Vurderer → I gang → Ferdig) for å manage hele dagen sin på ett blikk. Skjermen tar over hele viewport for å gi coach 100% fokus uten andre distraksjoner.

## Layout — UNIKT for denne skjermen

Bruker arketype-E-felles-spec. **Fullscreen, ingen sidebar.** Bakgrunn `#0A1F18`, kolonner `#163027`.

### Topp-bar (56px)

- **Venstre:** "Coaching Board" Geist 14px + dato "Onsdag 10. mai" muted
- **Senter:** "23 aktive kort" muted 12px
- **Høyre:** Filter-chip "Alle spillere ▾" + Lukk-X 40×40px

### Senter — 4 kanban-kolonner

Full bredde, lik bredde per kolonne (25% hver), gap 16px:

| Kolonne | Header-farge | Antall (eksempel) |
|---|---|---|
| Innkommende | `#1B3B30` med info-prikk | 7 |
| Vurderer | `#1B3B30` med warning-amber-prikk | 4 |
| I gang | `#1B3B30` med lime-accent-prikk | 8 |
| Ferdig | `#1B3B30` med success-green-prikk + collapsed by default | 47 |

### Kort-design (drag-target)

- Bakgrunn `#1B3B30`, `rounded-lg`, padding 16px
- Spiller-avatar 24px + navn Geist 13px
- Aksjon-tittel italic Instrument Serif 16px (f.eks. "Pauseuke anbefalt", "Endre periodisering")
- Agent-badge nederst-venstre (`Periodisering`, `Deload`, `Escalation`)
- Tidsstempel høyre "for 2t siden" JetBrains Mono 11px
- 3 vertikale prikker høyre-hjørne (RowActionsMenu)
- Hover: lime ring + lift -2px
- Drag: rotert 2deg + skygge under

### Bunn-bar (88px)

- Venstre: "Filter aktivt: Alle spillere · Alle agenter" muted
- Høyre: `Send agent-feedback →` (ghost lime, åpner `AgentFeedbackModal`)

## Drag-drop

- Kort kan dras mellom kolonner
- Drop-zone: hele kolonnen får lime border + bg-tint på hover
- Slipp → kort animerer på plass + toast "Kort flyttet til I gang"
- Optimistisk UI — feiler API, ruller tilbake med error-toast

## States å designe

| State | Beskrivelse |
|---|---|
| Default (alle kolonner med kort) | 7 / 4 / 8 / 47-collapsed |
| Hover på kort | Lime ring + lift |
| Drag i gang | Kort rotert 2deg + drop-zone highlighted |
| Empty kolonne | "Ingen kort her ennå" muted + dotted-line-border |
| Tom hele board | Sentrert "Alt er ryddig. Bra jobba." + lucide `CheckCircle2` accent |
| Tier-gate (Free) | Hele board blurred + upgrade-overlay |

## Klikkbare elementer

| Element | States |
|---|---|
| Kort | default, hover (ring), klikk → `PlanActionDetailModal` |
| Kort drag-handle (hele kortet) | drag-start (rotert), drop |
| Kolonne-header (count) | klikk → collapse/expand kolonne |
| 3-prikk-meny per kort | default, hover, popover med "Aksepter / Avslå / Detaljer" |
| Filter-chip "Alle spillere" | klikk → dropdown med spillerliste |
| Send agent-feedback | klikk → `AgentFeedbackModal` |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading:** 5 skeleton-kort per kolonne med pulserende ring
- **Empty kolonne:** "Ingen kort her ennå. Dra fra venstre →" muted
- **Tom hele board:** "Alt er ryddig. Bra jobba." sentrert
- **Drag-feil:** Toast "Kunne ikke flytte kort. Prøv igjen."

## Ønsket output fra Claude Design

1. Default — 4 kolonner med blandet kort-fordeling, Ferdig collapsed
2. Hover-state på et kort
3. Drag i gang — kort flyttes fra Vurderer til I gang, drop-zone highlighted
4. Empty kolonne (Vurderer er tom)
5. Tom hele board ("Alt er ryddig.")
6. Mobil — 1 kolonne synlig, horisontal swipe for å bla mellom kolonner

## Ikke-mål

- Ikke designe `PlanActionDetailModal`, `AgentFeedbackModal` (egne pakker)
- Ikke designe konfig av kolonner
- Ikke designe historikk over flyttede kort

## Når du er ferdig

Lim design-link tilbake til Claude Code.
