# AK Golf Platform — CoachHQ — Agent-konfig

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/agenter`
- **Arketype:** F — Settings + profile (agent-konfig + monitoring)
- **Tier-gating:** Pro+ (Free får 1 agent default, Pro får alle 5, Elite får custom-agenter)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/agenter.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `EditAgentModal`, `AgentLogModal`, `NewAgentModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Agent-konfig er hvor Anders styrer Signal→Skill→Agent-pipelinen. Hver agent (Periodisering, Deload, Escalation, Approval-helper, Plan-suggester) kan slås av/på, ha justerte terskler (f.eks. "anbefal deload når søvn <6t i 5 dager"), og logges for audit. Skjermen brukes når Anders føler agentene gir for mange falske positiver eller for stille — han justerer parametre til de matcher hans coaching-stil.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. Kort-grid for agenter, klikk åpner detalj-side eller side-panel.

### KPI-strip (4 kort)

1. Aktive agenter: 5 av 5 (Pro)
2. Anbefalinger siste 7d: 28
3. Akseptert-rate: 78% (22 av 28)
4. Snitt-presisjon: 84% (basert på Anders sin aksept)

### Agent-grid (5 kort)

Hver agent vises som kort med:

| Felt | Innhold |
|---|---|
| Ikon | Agent-spesifikt (Lucide: `Activity`, `Moon`, `AlertTriangle`, `CheckSquare`, `Lightbulb`) |
| Navn | Geist 18px |
| Status | Toggle "Aktiv" |
| Beskrivelse | Muted 14px, 1–2 setninger |
| Stats (mini) | "12 anbefalinger siste 7d, 83% akseptert" |
| Sist trigget | "for 2 timer siden" |
| Knapp | "Konfigurer →" |

#### Agentene:

1. **Periodisering-agent** — Foreslår fase-overganger og pyramide-justeringer basert på spillerens utvikling og kalender.
2. **Deload-agent** — Anbefaler pauseuker når søvn/energi viser overload.
3. **Escalation-agent** — Eskalerer skader, no-shows, og uvanlige avvik til hovedcoach.
4. **Approval-helper** — Foreslår godkjent/avslå basert på historikk (Anders avgjør).
5. **Plan-suggester** — Foreslår nye plan-templates basert på spillertype + sesong.

### Detalj-side per agent (klikk "Konfigurer →")

#### Header
- Agent-navn + status-toggle
- Versjon: `v2.4.1` + "Endrings-logg →"

#### Tab: Konfig
Form-felt (varierer per agent). Eksempel for Deload:
- Søvn-terskel: slider 4–8 timer (default: 6)
- Antall påfølgende dager før trigger: input (default: 5)
- Kombiner med energi <X: slider 1–10 (default: 4)
- Maks anbefalinger per uke: input (default: 3)
- Coach som varsles: dropdown (default: "Spillerens hovedcoach")
- Auto-aksept-terskel: slider (default: av — alltid coach-godkjenning)

#### Tab: Logg (siste 100 anbefalinger)
Tabell:
| Tid | Spiller | Anbefaling | Coach-respons | Outcome |
|---|---|---|---|---|
| for 2t | Markus R | "Pauseuke 13.–19. mai" | Akseptert | Implementert |
| i går | Emma S | "Reduser TEK 40%→28%" | Avslått ("for tidlig") | – |
| 8. mai | Joachim T | "Eskaler skade håndledd" | Akseptert | Sendt |

#### Tab: Treningsdata (Pro)
Viser hvilke datakilder agenten bruker (med toggles):
- Helse-logger (på)
- TrackMan-data (på)
- Plan-progresjon (på)
- Kalender-konflikter (av)

### Farezone

- "Tilbakestill agent til default" — destructive (mister custom-konfig)
- "Slett alle logger >90 dager" — destructive

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Agent-kort | default, hover (lift), klikk → konfigurer |
| Agent-toggle | av (muted), på (accent) |
| Slider | default, drag-thumb, value-tooltip |
| Logg-rad | default, hover, klikk → `AgentLogModal` (full payload + reasoning) |
| Outcome-pill | Implementert (accent), Avvist (muted), Pending (warning) |
| "Tilbakestill" | default, hover destructive, confirm |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Empty (alle av):** Banner "Alle agenter er av. Du får ingen anbefalinger →" med "Skru på alle"-CTA
- **Tier-gate Free:** 4 av 5 agent-kort er locked med "Pro"-pille + blur
- **Agent feilet:** Status-pill blir destructive "Feilet — sjekk logg"
- **Lite data (<7 dager):** "Agenten trenger 7 dager med data før den anbefaler →"

## Ønsket output fra Claude Design

1. Lyst tema, agent-grid (5 kort, alle aktive)
2. Mørkt tema, samme
3. Detalj-side Deload-agent (Konfig-tab) med sliders
4. Tab Logg åpen med 5 rader (mix av outcomes)
5. Tier-gate Free (4 agent-kort locked)
6. Mobil ≤640px — kort-grid 1 kolonne, tabs blir scroll-bar

## Ikke-mål

- Ikke designe `EditAgentModal`, `AgentLogModal`, `NewAgentModal` (egen batch)
- Ikke designe selve agent-koden (det er Foundation + andre prosjekter)
- Ikke designe agent-marketplace (Elite-feature, framtidig)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
