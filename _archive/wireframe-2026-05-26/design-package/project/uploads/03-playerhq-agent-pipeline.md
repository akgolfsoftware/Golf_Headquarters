# AK Golf Platform — PlayerHQ — Agent Pipeline

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/agents/pipeline`
- **Arketype:** E — Fullscreen / Live (visualisering)
- **Tier-gating:** Pro+Elite (Free ser blurred preview med upgrade-CTA)
- **HTML-referanse:** `wireframe/screen-deck/playerhq/agent-pipeline.html`
- **Audit:** `wireframe/audit/playerhq-agent-pipeline.md`
- **Tilhørende modaler:** `AgentFeedbackModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Agent-pipelinen viser spilleren visuelt hvordan plattformens AI-agenter jobber for dem. Tre lag fra venstre til høyre: **Signal** (data-input fra trening, runder, søvn) → **Skill** (analyse-modul som tolker signalet) → **Agent** (anbefaler en handling). Hver node er klikkbar og viser detalj-popover. Linjer mellom noder pulserer når det er aktivitet (en signal-strøm flyter gjennom). Brukes som "trust-builder" for å vise at AI-en faktisk jobber.

## Layout — UNIKT for denne skjermen

Bruker arketype-E-felles-spec. **Fullscreen, ingen sidebar.** Bakgrunn `#0A1F18` med subtil noise-grain.

### Topp-bar (56px)

- **Venstre:** "Agent Pipeline" Geist 14px + tier-badge "Pro" (lime)
- **Senter:** "Sist oppdatert: 14:32" JetBrains Mono 12px muted
- **Høyre:** Lukk-X 40×40px

### Senter — node-graf (tre kolonner)

```
SIGNAL                SKILL                  AGENT
  o ── search ── ──→  [ ] ── analysis ─→ [ ] ── action ─→ [✓]
  | hcp-data         |                  |
  | søvn              |                  |
  | trackman          |                  |
  o ── ── ── ── ──→  [ ] ── ── ── ──→ [ ] ── ── ── ──→ [✓]
```

- **Signal-noder (venstre):** små sirkler 32px, bakgrunn `#163027`, ikon (lucide `Activity`, `Moon`, `Target`)
- **Skill-noder (senter):** kort 200×120px, bakgrunn `#1B3B30`, navn + 1-linje beskrivelse
- **Agent-noder (høyre):** 88×88px sirkler med agent-emoji-ikon, lime border når aktiv, glow-effekt
- **Linjer mellom:** 2px stroke `#2B4F42`, animert dash når aktiv (signal flyter), glow `#D1F843` når output produseres

### Bunn-bar (88px)

- Venstre: "12 anbefalinger siste 7 dager" muted
- Høyre: `Send agent-feedback →` (primary lime, åpner `AgentFeedbackModal`)

## Agent-typer som vises

| Agent | Ikon | Beskrivelse |
|---|---|---|
| Periodisering-agent | `Calendar` | Foreslår justering av plan basert på utvikling |
| Deload-agent | `Battery` | Anbefaler pauseuke ved overload |
| Drill-agent | `Target` | Foreslår nye øvelser basert på svake områder |
| Score-agent | `TrendingUp` | Tolker rundedata og finner mønstre |

## States å designe

| State | Beskrivelse |
|---|---|
| Statisk (ingen aktivitet) | Alle noder grå-dempet, linjer statiske |
| Aktiv pipeline | En signal-strøm flyter (animert dash), skill-node lyser opp, agent-node glower |
| Klikk på agent-node | Popover slider inn fra høyre med agent-detaljer + siste 3 anbefalinger |
| Free tier (gated) | Hele node-grafen blurred 8px + sentrert overlay "Pro: se hvordan AI-en jobber for deg →" |

## Klikkbare elementer

| Element | States |
|---|---|
| Signal-node | default, hover (ring), klikk → tooltip med data-source |
| Skill-node | default, hover (lift), klikk → popover med modul-beskrivelse |
| Agent-node | default, hover (lime glow), klikk → høyre-popover med detaljer |
| Send agent-feedback | default, hover, klikk → `AgentFeedbackModal` |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading (initial):** Pipeline tegnes inn lag for lag (signal → skill → agent), 600ms total
- **Ingen aktivitet:** "Pipelinen kjører i bakgrunnen — sjekk tilbake senere"
- **Error:** "Kunne ikke laste pipeline-data ↺"

## Ønsket output fra Claude Design

1. Statisk view — alle noder synlige, ingen aktivitet
2. Aktiv pipeline — signal flyter fra `trackman` → `Drill-agent`
3. Agent-node klikket — popover åpen med detaljer
4. Free tier — blurred + upgrade-overlay
5. Mobil — node-graf vertikalt stacket (Signal øverst, Agent nederst), swipe ned for å se alle
6. Mørkt tema er default; lyst tema-variant ikke nødvendig (denne skjermen er kun mørk)

## Ikke-mål

- Ikke designe `AgentFeedbackModal` (egen pakke i annen batch)
- Ikke designe agent-konfig (gjøres av coach i CoachHQ)
- Ikke designe historikk over alle pipeline-kjøringer

## Når du er ferdig

Lim design-link tilbake til Claude Code.
