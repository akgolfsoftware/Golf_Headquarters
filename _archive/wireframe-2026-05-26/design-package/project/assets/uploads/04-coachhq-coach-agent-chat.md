# AK Golf Platform — CoachHQ — Coach Agent Chat

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/agent/chat`
- **Arketype:** E — Fullscreen / Live (AI-chat)
- **Tier-gating:** Coach-tier (Standard/Pro) — Pro får ubegrenset, Standard 50 meldinger/mnd
- **HTML-referanse:** `wireframe/screen-deck/coachhq/coach-agent-chat.html`
- **Audit:** `wireframe/audit/coachhq-coach-agent-chat.md`
- **Tilhørende modaler:** `AgentFeedbackModal`, `PlanActionDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coach Agent Chat er et fullscreen AI-chat-grensesnitt hvor coach kan stille spørsmål om sine spillere ("Hvem trenger pauseuke?", "Vis Markus' utvikling siste 4 uker", "Foreslå plan for Lina i juli"). Agenten har tilgang til alle spiller-data, planer og historikk. Skiller seg fra vanlig chatbot ved at hvert svar kan inneholde **handlinger** (knapper som lager planer, sender meldinger, oppretter bookinger direkte). Coach skal kunne kjøre hele dagen sin gjennom denne chatten hvis han vil.

## Layout — UNIKT for denne skjermen

Bruker arketype-E-felles-spec. **Fullscreen, ingen sidebar.** Bakgrunn `#0F1F1A` (litt lysere mørk for chat-lesbarhet).

### Topp-bar (56px)

- **Venstre:** "Coach Agent" Geist 14px + lime AI-prikk pulserende
- **Senter:** "12 av 50 meldinger denne måneden" muted (Standard tier)
- **Høyre:** Lukk-X 40×40px

### Senter — chat-feed

Sentrert kolonne, max-width 720px. Meldinger stables vertikalt:

- **Coach-melding (din):** Høyrejustert, bg `#1B3B30`, tekst `#F5F4EE`, `rounded-2xl rounded-tr-sm`, max-width 70%
- **Agent-melding:** Venstrejustert, bg `#163027`, tekst `#F5F4EE`, `rounded-2xl rounded-tl-sm`, max-width 80%
- **Agent-melding med actions:** Samme bakgrunn + actions-strip nederst med inline-knapper:
  - `Lag plan →` (primary lime ghost)
  - `Send melding →` (secondary)
  - `Vis spillerprofil →` (ghost)
- **Tidsstempel:** Geist 11px muted, kun ved skifte av minutt
- **Avatar (agent):** 32px sirkel med agent-emoji-ikon, kun på første agent-melding i en sekvens

### Tenker-tilstand

Når agent prosesserer: "Coach Agent skriver ..." med tre prikker som hopper (Geist Mono ...) i en tom melding-bubble. 800ms minimum før første tegn vises.

### Bunn — input-felt (88px sticky)

- Tekstfelt: "Spør om dine spillere ..." Geist 14px, bg `#1B3B30`, `rounded-full`, padding 16px 24px
- Send-knapp: 56×56px sirkel lime, lucide `ArrowUp`, høyre i feltet
- Mikrofon-knapp: 40×40px ghost, venstre i feltet (voice input)

### Slash-commands

Skriv `/` i input → popover med:
- `/plan [spiller]` — lag treningsplan
- `/melding [spiller]` — send melding
- `/booking [spiller]` — opprett booking
- `/rapport` — generer ukentlig rapport

## States å designe

| State | Beskrivelse |
|---|---|
| Tom chat (første gang) | Sentrert "Hva vil du gjøre i dag, Anders?" + 4 forslag-chips |
| Aktiv chat (5+ meldinger) | Feed med blanding av coach/agent-meldinger |
| Agent tenker | "Coach Agent skriver ..." med hoppende prikker |
| Agent-melding med actions | Inline action-knapper under tekst |
| Slash-command popover åpen | Liste med 4 commands, første highlighted |
| Tier-gate (Standard, 50 nådd) | Sentrert overlay "Månedsgrense nådd → Oppgrader" |

## Forslag-chips (tom-state)

4 chips i 2×2 grid:
1. "Hvem trenger oppmerksomhet i dag?"
2. "Lag treningsplan for Markus i juni"
3. "Vis spillere som ikke har trent på 14 dager"
4. "Generer ukentlig rapport"

## Klikkbare elementer

| Element | States |
|---|---|
| Agent-melding med actions | default, hover på action-knapp, klikk → tilhørende modal eller skjerm |
| Forslag-chip | default, hover, klikk → fyller input + sender |
| Send-knapp | default, hover, disabled (tomt felt), loading (spinner) |
| Mikrofon | default, recording (rød pulse), klikk-igjen → stop |
| Slash-popover-item | default, hover, klikk → fyller `/command` i input |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading (agent tenker):** Hoppende prikker
- **Error:** Inline rød tekst i agent-bubble "Klarte ikke å hente data ↺"
- **Tier-gate:** Sentrert overlay med upgrade-CTA

## Ønsket output fra Claude Design

1. Tom-state med 4 forslag-chips sentrert
2. Aktiv chat — 6 meldinger, agent har sendt en med 3 actions
3. Agent tenker (hoppende prikker)
4. Slash-command popover åpen
5. Tier-gate overlay
6. Mobil — full-width chat, input-bar sticky bunn

## Ikke-mål

- Ikke designe `AgentFeedbackModal`, `PlanActionDetailModal` (egne pakker)
- Ikke designe agent-konfig eller modell-bytte
- Ikke designe chat-historikk-side

## Når du er ferdig

Lim design-link tilbake til Claude Code.
