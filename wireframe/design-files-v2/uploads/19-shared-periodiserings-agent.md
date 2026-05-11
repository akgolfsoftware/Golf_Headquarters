# AK Golf Platform — Shared — Periodiserings-agent (dyp-dykk)

## Identitet

- **Produkt:** Shared / cross-cutting (intern dokumentasjon + admin-konfig)
- **URL:** `/admin/agents/periodisering`
- **Arketype:** G — Other (single-agent dyp-dykk)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/periodiserings-agent.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `AgentRuleEditModal`, `RetrainAgentModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Periodiserings-agenten er den viktigste agenten — overvåker alle planer, foreslår fase-endringer (peaking, deload, base, sharpening) basert på spillerens kommende konkurranser, treningsvolum og prestasjons-trend. Denne siden viser agentens **hjerne**: regler, beslutningstre, treningsdata, og siste anbefalinger.

## Layout — UNIKT for denne skjermen

Vertikalt stablede seksjoner:

### Header
- Hero italic: *"Periodiserings-agent."*
- Subtitle: `Aktiv siden 2025-01-12 · Versjon v3.4 · 47 anbefalinger siste 7d (84% godkjent)`
- Status-pill: Aktiv (accent)
- Aksjons-rad: `Pause`, `Retrain →`, `Eksporter regler`

### Seksjon 1: Hva agenten gjør
- 3 bullet-cards med ikon + 1-setning:
  1. "Identifiserer kommende konkurranser i kalenderen"
  2. "Beregner peaking-vindu basert på erfarings-baserte regler"
  3. "Foreslår fase-endringer 4-2 uker før konkurranse"

### Seksjon 2: Beslutningstre (visualisert)

- Tre-graf med noder (yes/no-grener)
- Hver node er en regel: "Er konkurranse innen 14 dager?" → yes → "Er volum >120% av baseline siste uka?" → yes → "Foreslå deload"
- Hover-node → vis kode-snippet og dokumentasjon

### Seksjon 3: Trenings-data input

Tabell med signal-kilder agenten bruker:
| Signal | Kilde | Hyppighet |
|---|---|---|
| Treningsvolum (timer) | session-log | Per økt |
| Konkurranser | GolfBox + manuell | Daglig |
| HRM-restitusjon | Wearable | Daglig |
| Subjektiv form | Spiller-input | Per uke |

### Seksjon 4: Siste anbefalinger (10 stk)

Kompakt liste:
- Tidsstempel + spiller + anbefaling + status (godkjent / avslått / venter)

### Seksjon 5: Performance-stats

- Godkjenningsrate over tid (linje-chart 90d)
- Top-3 mest godkjente regel-typer
- Top-3 mest avslåtte regel-typer (med årsak)

## Filter-bar — IKKE for denne (single-agent fokus)

## Klikkbare elementer

| Element | States |
|---|---|
| Pause | default, hover, klikk → confirm "Agenten vil ikke gi anbefalinger før reaktivert" |
| Retrain | default, hover, klikk → `RetrainAgentModal` (Admin-only) |
| Beslutningstre-node | hover (highlight), klikk → `AgentRuleEditModal` |
| Anbefaling-rad | hover, klikk → relevant approval |
| Performance-chart | hover (tooltip per dato) |

## Empty / loading / error

- **Empty (ny agent):** "Agent samler data — første anbefaling om noen dager"
- **Loading:** Skeleton-seksjoner
- **Pause-state:** Banner øverst gold "Agent er pauset — ingen nye anbefalinger" + reaktiver-CTA

## Ønsket output fra Claude Design

1. Lyst tema, full dyp-dykk
2. Mørkt tema, samme
3. Beslutningstre med en node hover-highlightet
4. Pause-state (banner + alle aksjoner disabled)
5. Mobil ≤640px — beslutningstre roteres vertikalt, alle seksjoner full bredde

## Ikke-mål

- Ikke designe `AgentRuleEditModal`, `RetrainAgentModal` (egen batch)
- Ikke designe ML-pipeline-monitoring (egen sub-flow)
- Ikke implementere live regel-redigering (kun read-only her, edit i modal)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
