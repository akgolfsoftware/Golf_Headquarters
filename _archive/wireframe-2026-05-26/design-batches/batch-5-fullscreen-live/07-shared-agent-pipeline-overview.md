# AK Golf Platform — Shared — Agent Pipeline Overview

## Identitet

- **Produkt:** Tverrgående (PlayerHQ + CoachHQ)
- **URL:** `/agents/overview`
- **Arketype:** E — Fullscreen / Live (full-system kart)
- **Tier-gating:** Synlig for alle, men interaktive node-detaljer krever Pro+
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/agent-pipeline-overview.html`
- **Audit:** `wireframe/audit/shared-agent-pipeline-overview.md`
- **Tilhørende modaler:** `AgentFeedbackModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Mens Pakke 3 (PlayerHQ Agent Pipeline) viser én spillers pipeline, er denne skjermen full-system-kartet over **alle** agenter, signaler og skills i hele plattformen. Brukes både av spillere (forståelse) og coacher (debugging og tillit). Viser hvordan data flyter fra TrackMan, GolfBox, Deepgram-opptak, søvn-tracker, etc., gjennom skills (analyse-moduler) til agenter som tar avgjørelser. Skjermen er en levende infografikk — noder pulserer når de er aktive, glow når de produserer output.

## Layout — UNIKT for denne skjermen

Bruker arketype-E-felles-spec. **Fullscreen, ingen sidebar.** Bakgrunn `#0A1F18` med svak grid-pattern (8px raster, 4% opacity).

### Topp-bar (56px)

- **Venstre:** "Agent Pipeline — System Overview" Geist 14px
- **Senter:** Tabs: `Live aktivitet` / `Statisk kart` (segmentert kontroll)
- **Høyre:** Lukk-X 40×40px

### Senter — node-graf (3 kolonner, full bredde)

```
SIGNAL-LAG                  SKILL-LAG                       AGENT-LAG
(8 noder venstre)           (5 noder senter)               (4 noder høyre)

o TrackMan                  ┌──────────────────┐           ┌──────────┐
o GolfBox HCP    ────→      │ Tech-analyse     │   ────→   │ Drill    │
o Deepgram                  └──────────────────┘           │ Agent    │
o Søvn-tracker              ┌──────────────────┐           └──────────┘
o ScoreCard       ────→     │ Volum-analyse    │   ────→   ┌──────────┐
o Live Session              └──────────────────┘           │ Period.  │
o Helse-input               ┌──────────────────┐           │ Agent    │
o Manual coach              │ Mønster-analyse  │   ────→   └──────────┘
                            └──────────────────┘
```

- **Signal-noder:** 24px sirkler, ikon (lucide), bakgrunn `#163027`, label til høyre
- **Skill-noder:** 240×80px kort, ikon + navn + 1-linje beskrivelse
- **Agent-noder:** 96×96px sirkler med agent-emoji, lime border når aktiv, glow når aktiv
- **Linjer:** 2px stroke `#2B4F42`, animert dash når data flyter, glow `#D1F843` ved output

### Live aktivitet-tab

Linjer pulserer når en signal-strøm faktisk flyter (real-time). Sub-text under hver agent: "Sist anbefalt: for 14 min siden".

### Statisk kart-tab

Alt frosset — designdokumentasjons-modus. Hover på node → tooltip med detaljert beskrivelse. Brukes av nye coacher for opplæring.

### Bunn-bar (88px)

- Venstre: "8 signaler · 5 skills · 4 agenter — sist oppdatert 14:32" muted
- Høyre: `Send agent-feedback →` (primary lime ghost)

## Agent-typer (4)

| Agent | Ikon | Rolle |
|---|---|---|
| Drill-agent | `Target` | Foreslår øvelser basert på svake områder |
| Periodisering-agent | `Calendar` | Justerer planer mot konkurranse-toppform |
| Deload-agent | `Battery` | Anbefaler pauseuker ved overload |
| Escalation-agent | `AlertTriangle` | Eskalerer skader/risiko til hovedcoach |

## Klikkbare elementer

| Element | States |
|---|---|
| Tabs (Live/Statisk) | default, hover, active per side |
| Signal-node | hover (ring), klikk → tooltip med data-source-info |
| Skill-node | hover (lift), klikk → popover med modul-detaljer |
| Agent-node | hover (lime glow), klikk → høyre-popover med detaljer + siste 5 anbefalinger |
| Linje (når aktiv) | hover → tooltip "Signal X → Skill Y → Agent Z" |
| Send agent-feedback | klikk → `AgentFeedbackModal` |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading initial:** Pipelinen tegnes inn lag for lag (signal → skill → agent), 800ms total
- **Ingen aktivitet siste 24h:** "Ingen agent-anbefalinger siste 24t — pipeline er passiv naa"
- **Error:** "Kunne ikke laste pipeline-data ↺"

## Ønsket output fra Claude Design

1. Live aktivitet — flere noder aktive samtidig, linjer pulserer
2. Statisk kart — alle frosset, hover-tooltip vises
3. Agent-node klikket — popover åpen med detaljer
4. Empty (ingen aktivitet)
5. Mobil — vertikalt stacket: Signal-lag øverst, Skill i midten, Agent nederst, swipe ned for å bla
6. Mørkt tema er default (denne skjermen er kun mørk)

## Ikke-mål

- Ikke designe `AgentFeedbackModal` (egen pakke)
- Ikke designe agent-konfig (gjøres backend)
- Ikke designe historikk-graf over agent-aktivitet

## Når du er ferdig

Lim design-link tilbake til Claude Code.
