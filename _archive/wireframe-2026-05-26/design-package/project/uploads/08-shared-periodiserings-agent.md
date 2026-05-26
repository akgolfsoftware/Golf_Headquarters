# AK Golf Platform — Shared — Periodiserings-Agent (4-lags decision-stack)

## Identitet

- **Produkt:** Tverrgående (CoachHQ primær, PlayerHQ read-only)
- **URL:** `/agents/periodisering`
- **Arketype:** E — Fullscreen / Live (decision-stack visualisering)
- **Tier-gating:** Pro+ for å se decision-stack; Free ser kun output
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/periodiserings-agent.html`
- **Audit:** `wireframe/audit/shared-periodiserings-agent.md`
- **Tilhørende modaler:** `PlanActionDetailModal`, `AgentFeedbackModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Periodiserings-agenten er den mest komplekse av plattformens agenter — den lager og justerer treningsplaner basert på en 4-lags decision-stack. Denne skjermen visualiserer stacken slik at coach (og avansert spiller) kan se **hvorfor** agenten foreslo det den foreslo. De fire lagene er: **L1 Mål** (sesong-mål, konkurransetopper) → **L2 Pyramide** (FYS/TEK/SLAG/SPILL/TURN-fordeling) → **L3 Volum** (timer per uke per fokus) → **L4 Periodisering** (oppbygning, peak, deload). Skjermen brukes for tillit-bygging og debugging — "kan jeg stole på denne anbefalingen?".

## Layout — UNIKT for denne skjermen

Bruker arketype-E-felles-spec. **Fullscreen, ingen sidebar.** Bakgrunn `#0A1F18`.

### Topp-bar (56px)

- **Venstre:** "Periodiserings-Agent" Geist 14px + spiller-avatar (Markus R) 24px + navn
- **Senter:** "Anbefaling generert 14:32 · Ikke godkjent ennå" muted
- **Høyre:** Lukk-X 40×40px

### Senter — 4-lags decision-stack (vertikal)

Stack vertikalt fra topp til bunn, hver lag er et fullbredde-kort med tydelig avgrensning:

```
┌─────────────────────────────────────────────┐
│ L1  MÅL                                  v  │  ← collapsed/expanded
│ Sørlandsåpent 14. juli — toppform uke 28   │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ L2  PYRAMIDE-FORDELING                  v  │
│ TEK 40% · SLAG 25% · FYS 15% · SPILL 12% · TURN 8% │
│ [pyramide-mini-chart, 64px høy]             │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ L3  VOLUM                                v  │
│ 14 timer/uke · oppbygning fra 11 t          │
│ [bar-chart 8 uker]                          │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ L4  PERIODISERING                        v  │
│ Mai: oppbygning · Juni: peak · Uke 28: peak │
│ [tidslinje-graf]                            │
└─────────────────────────────────────────────┘
```

Hvert lag har:
- **Header:** "L1 MÅL" Geist Mono 12px uppercase + lag-tittel italic Instrument Serif 18px + chevron-toggle
- **Sammendrag (collapsed):** 1 setning + nøkkel-tall
- **Expanded:** Detaljert visualisering (chart, tidslinje, eller liste)

Linje-konnektor mellom lagene: vertikal 2px stroke `#2B4F42` med liten "↓" arrow.

### Bunn-bar (88px)

- Venstre 33%: `Avslå med årsak` (secondary, 56px)
- Senter 34%: `Detaljer →` (ghost, 56px) — åpner `PlanActionDetailModal`
- Høyre 33%: `Aksepter anbefaling` (primary lime, 88px)

## States å designe

| State | Beskrivelse |
|---|---|
| Alle lag collapsed | 4 lag synlige som sammendrags-kort |
| L2 expanded | Pyramide-mini-chart synlig, andre collapsed |
| Alle expanded | Full decision-stack — scroll-y |
| Loading (agent jobber) | Stack tegnes inn lag for lag, 200ms forsinkelse mellom hver |
| Allerede godkjent | Bunn-bar erstattes med "✓ Godkjent for 14 min siden — Markus mottok ny plan" muted |
| Avslått | "Avslått med årsak: Skade i håndledd — venter på fysio-vurdering" + `Reaktiver →`-CTA |
| Tier-gate (Free) | L2/L3/L4 blurred + "Pro: se hele decision-stacken →" |

## L2-pyramide-mini-chart

Horisontal stacked bar, 64px høy, full bredde minus padding:
- TEK 40% — `#005840`
- SLAG 25% — `#D1F843`
- FYS 15% — `#16A34A`
- SPILL 12% — `#F4C430`
- TURN 8% — `#5E5C57`

Tooltip på hover viser nøyaktig %.

## L3-volum-bar-chart

8 vertikale bars (uke 18–25), hver 32px bred:
- Y-aksis: timer 0–16
- Bars går fra `#2B4F42` (oppbygning) til `#D1F843` (peak)
- Verdi over hver bar: JetBrains Mono 11px

## L4-periodiserings-tidslinje

Horisontal tidslinje fra mai til juli (12 uker):
- Bakgrunn-segmenter: oppbygning (grå) / peak (lime tint) / deload (gold tint)
- Markører for konkurranser (rød pin) og milepæler

## Klikkbare elementer

| Element | States |
|---|---|
| Lag-header | default, hover, klikk → toggle expand/collapse |
| Aksepter | default, hover, loading (spinner), success (lime flash + redirect) |
| Avslå | default, hover, klikk → inline-textarea "Hvorfor?" + send |
| Detaljer | default, hover, klikk → `PlanActionDetailModal` |
| Pyramide-segment | hover → tooltip med % og time-allokering |
| Volum-bar | hover → tooltip med uke + timer |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading:** Stack tegnes inn lag for lag (200ms per lag)
- **Allerede behandlet:** Bunn-bar erstattes med status-tekst
- **Error:** Sentrert kort "Kunne ikke laste anbefaling ↺"

## Ønsket output fra Claude Design

1. Default — alle 4 lag collapsed, oversikt
2. L2 expanded — pyramide-mini-chart synlig
3. Alle expanded — full scrolled view
4. Allerede godkjent (status-tekst i bunn)
5. Avslått-state med årsak
6. Mobil — lagene full bredde, swipe-down på header for collapse
7. Tier-gate (Free) — L2/L3/L4 blurred

## Ikke-mål

- Ikke designe `PlanActionDetailModal`, `AgentFeedbackModal` (egne pakker)
- Ikke designe agent-konfig (backend)
- Ikke designe historikk over alle anbefalinger

## Når du er ferdig

Lim design-link tilbake til Claude Code.
