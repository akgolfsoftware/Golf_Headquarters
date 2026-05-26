# AK Golf Platform — Shared — Agent-pipeline overview

## Identitet

- **Produkt:** Shared / cross-cutting (intern dokumentasjon)
- **URL:** `/admin/agents/pipeline`
- **Arketype:** G — Other (arkitektur-diagram + katalog)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/agent-pipeline-overview.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `AgentDetailModal`, `PipelineConfigModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Pipeline-overview er den visuelle dokumentasjonen av hele Signal→Skill→Agent-arkitekturen. Viser hvordan data flyter fra signal-kilder (GolfBox, Trackman, manuell input) gjennom skills (analyse-funksjoner) til agents (autonome anbefalere) til coach (godkjenning) til plan-aksjon. Brukes som referanse for utviklere og som forklaring til Anders/styret.

## Layout — UNIKT for denne skjermen

### Hero

- Italic: *"Hvordan AI-en jobber for deg."*
- Subtitle: `5 signal-kilder · 12 skills · 7 agents · 3 godkjenningstyper`

### Hovedseksjon: Sankey-style flow-diagram

Horisontal flow-diagram, 4 kolonner venstre→høyre:

#### Kolonne 1: Signal-kilder (rektangler)
- GolfBox runder
- Trackman-økter
- Manuell coach-input
- Foreldre-feedback
- Wearables (HRM, søvn)

#### Kolonne 2: Skills (rektangler, mer narrow)
- Round-analysis-skill
- SG-decomposition-skill
- Pattern-detection-skill
- Volume-aggregation-skill
- Fatigue-detection-skill
- ... (totalt 12)

#### Kolonne 3: Agents (sirkler, primary-bg)
- Periodiserings-agent
- Deload-agent
- Escalation-agent
- Insight-agent
- Plan-publisher-agent
- ... (totalt 7)

#### Kolonne 4: Output (rektangler)
- Plan-aksjon-anbefaling → coach-godkjenning
- Direkte spiller-varsel
- Foreldrerapport-trigger

Linjer mellom kolonnene viser data-flyt. Tykkelse = volum (count siste 7d).

### Right-rail: Agent-katalog

Liste over 7 agents:
- Hver med: navn + ikon + status-prikk (running/idle/error) + "Siste kjøring: 2 min siden"
- Klikk → `AgentDetailModal`

### Footer-seksjon: Pipeline-stats

3 kort:
- Signal-events siste 24t: 1 247
- Agent-anbefalinger siste 7d: 47
- Snitt-godkjenningsrate: 84%

## KPI-strip — IKKE for denne (statisk arkitektur)

## Filter-bar — IKKE for denne

## Klikkbare elementer

| Element | States |
|---|---|
| Signal-kilde-rektangel | hover (highlight + linje-trace), klikk → vis detaljer |
| Skill-rektangel | hover, klikk → vis kode-link + spec |
| Agent-sirkel | hover (pulse), klikk → `AgentDetailModal` |
| Flow-linje | hover (highlight + tooltip "1 234 events siste 24t") |
| Right-rail-rad | default, hover, klikk → `AgentDetailModal` |

## Empty / loading / error

- **Loading:** Skeleton flow-diagram med pulserende
- **Agent down:** Sirkel blir destructive med pulse + tooltip "Sist kjøring feilet"

## Ønsket output fra Claude Design

1. Lyst tema, full flow-diagram + right-rail + KPI
2. Mørkt tema, samme
3. Hover-state med en linje highlightet
4. Mobil ≤640px — diagrammet rotert til vertikal flow, eller "Last beskrivelse →" som fallback

## Ikke-mål

- Ikke designe `AgentDetailModal`, `PipelineConfigModal` (egen batch)
- Ikke designe agent-konfig-form (det er i settings)
- Ikke implementere live data-rendering (mock i wireframe)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
