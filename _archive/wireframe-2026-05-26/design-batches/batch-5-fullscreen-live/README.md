# Batch 5 — Fullscreen / Live (Arketype E)

**Antall pakker:** 12 (8 fullscreen-skjermer + 4 Live Session-modaler)
**Status:** Klar for claude.ai/design
**Estimert tid:** 4–6 timer

## Hvorfor denne batchen nå

Arketype E (Fullscreen / Live) er den mest visuelt avvikende mønsteret i hele plattformen. Disse skjermene tar over hele viewport, fjerner sidebar og top-bar, og bruker mørk bakgrunn med store tap-targets. Dette er hvor coach og spiller går "into the zone" — Live Session med rep-logging, AI-chat med coach-agent, sesjonsopptak med Deepgram-pipeline, og periodiserings-agentens 4-lags decision-stack.

Når dette mønsteret er stabilt etablert, kan resterende fullscreen-flater i framtidige batches (training-modus, video-review, fokus-tilstander) bygge på samme grunnmal.

## Arketype E — felles spec (gjelder alle 12 pakker)

Disse mønstrene skal være konsistente på tvers av alle fullscreen-skjermer. Vis variasjon i innhold og layout-detaljer, ikke i grunnstrukturen.

### Layout — fullscreen, ingen sidebar

```
┌─────────────────────────────────────────────┐
│  [Live · Markus R]              [Lukk ✕]    │  ← topp-bar 56px
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│         STORT SENTRERT INNHOLD              │
│         (counter, chat, board)              │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  [Pause]              [Neste rep →]         │  ← bunn-bar 88px (tap-targets)
└─────────────────────────────────────────────┘
```

**Sidebar er skjult helt.** Topp-bar er minimal (kun kontekst-label venstre + Lukk/Avslutt høyre). Bunn-bar inneholder primær handling (alltid 88px høy for tommel-rekkevidde).

### Bakgrunn og atmosfære

| Modus | Bakgrunn | Når |
|---|---|---|
| Live Session (PlayerHQ) | `#0A1F18` (deep-pyramide-green) | Tap-mode, rep-logging |
| Live Tapper (range) | `#000000` (helt sort) | Range-modus, full fokus |
| Sesjonsopptak (CoachHQ) | `#0A1F18` med subtil noise-grain | Deepgram pipeline kjører |
| AI-chat (Coach Agent) | `#0F1F1A` (litt lysere mørk) | Chat-modus med god lesbarhet |
| Coaching Board (kanban) | `#0A1F18` med kolonne-bg `#163027` | Board-modus, dra-funksjon |
| Agent-pipeline (visualisering) | `#0A1F18` med node-glow | Strategisk oversikt |
| Live-modaler (4 stk) | `#0A1F18` med backdrop-blur fra bakenforliggende side | Innenfor Live Session-flyt |

Tekst er alltid lys (`#F5F4EE` eller `#FAFAF7`) på mørk. Accent-lime (`#D1F843`) brukes sparsomt for primær handling og counter-tall.

### Tap-targets og interaksjon

- **Minimum 44 × 44px** for alle interaktive elementer
- **Primary CTA i bunn-bar:** 88px høy, full bredde minus 32px padding, `rounded-full`
- **Sekundær handling:** 56px høy, ved siden av primær eller stacked
- **Counter-tap-zone (Live):** hele midten av skjermen er tap-zone som logger rep — visuelt feedback med kort flash av accent
- **Lange-tap (long-press):** 600ms for å trigge sekundær handling (f.eks. "angre siste rep")
- **Swipe:** kun i Live-modaler (swipe-down for å pause, swipe-up for å fortsette)

### Counter-typografi

Live-counter alltid sentrert med **JetBrains Mono store tall**:

- **Rep-teller:** `120px` font-size, `font-weight: 500`, `tabular-nums`
- **Klokke / nedtelling:** `64px`, samme stil
- **Subtekst under counter:** Geist 14px muted (`#9D9C95`)
- **Pyramide-fokus-pill over counter:** Geist 12px uppercase letterspacing 0.08em

Eksempel:
```
        TEK · DRIVER
        ┌─────────┐
        │   24    │   ← 120px JetBrains Mono
        └─────────┘
        av 30 rep
```

### "Avslutt" / "Lukk"-knapp — alltid topp-høyre

Posisjon: `top: 16px, right: 16px`. Form: 40 × 40px sirkel, `rgba(245,244,238,0.08)` bg, lucide `X`-ikon (24px, `#F5F4EE`).

Klikk → bekreftelse-popover ("Er du sikker? Sesjonen lagres ikke") med to knapper: `Fortsett` (primary lime) / `Avslutt likevel` (destructive ghost).

### Statusindikatorer

- **REC-prikk (sesjonsopptak):** rød pulserende prikk øverst-venstre, "REC 12:34" JetBrains Mono
- **LIVE-pill (Live Session):** lime accent pulserende, "LIVE" Geist 12px uppercase
- **Agent-tenker-spinner:** 3 prikker som hopper (Geist Mono "..."), eller subtle ring-spinner

### Minimal UI — kun essensielle kontroller

Ingen sidebar. Ingen breadcrumbs. Ingen secondary navigation. Ingen filter-bar. Ingen KPI-kort.

Det som tillates på skjermen samtidig:
1. Kontekst-label (topp-venstre, hva pågår)
2. Lukk-knapp (topp-høyre)
3. Hovedinnhold (sentrert)
4. Primær handling (bunn)
5. Maks 1 sekundær handling (ved siden av primær)
6. Maks 1 statusindikator (REC, LIVE, AGENT)

Alt annet er opprettet for å distrahere — hold det ute.

### Empty / loading / error / pause-states

- **Loading (agent tenker):** Sentrert pulserende ring + "Periodiserings-agent vurderer dataene dine ..."
- **Pause (Live Session):** Counter dempes til 40% opasitet, "PAUSE" overlay i italic Instrument Serif 96px
- **Connection lost (live):** Toast øverst "Tilkobling tapt — reps lagres lokalt", lime ring rundt counter
- **Error (Deepgram fail):** Sentrert kort med `AlertCircle`-ikon + "Opptaket ble brutt. Prøv igjen ↺"
- **Tom historikk (board):** "Ingen kort her ennå. Dra fra venstre →"

### Mobil-versjon

Alle fullscreen-skjermer er **mobile-first by design**. Desktop = mobile layout sentrert i en 480px container med subtilt mørkere bakgrunn rundt. Ingen "responsive" omformatering — counter forblir 120px, bunn-bar forblir 88px.

Unntak:
- **Coaching Board (kanban):** Desktop viser 4 kolonner side-ved-side; mobil viser 1 kolonne med horisontal swipe
- **Agent-pipeline-overview:** Desktop viser hele pipelinen som node-graf; mobil viser den vertikalt stacket

### Responsive breakpoints

- Desktop: ≥1024px — sentrert 480px container (eller full-width for board/pipeline)
- Tablet: 768–1023px — full-width
- Mobil: ≤640px — full-width, native-app-feel

---

## Per-skjerm-pakker (12)

### PlayerHQ Live (3)

1. `01-playerhq-live-session.md` — Live Session (tap-mode rep-logging)
2. `02-playerhq-live-tapper.md` — Live Tapper (range-mode driver/wedge)
3. `03-playerhq-agent-pipeline.md` — Agent Pipeline (Signal→Skill→Agent visualisering)

### CoachHQ fullscreen (3)

4. `04-coachhq-coach-agent-chat.md` — Coach Agent Chat (AI-chat fullscreen)
5. `05-coachhq-sesjon-opptak.md` — Sesjon Opptak (Deepgram pipeline)
6. `06-coachhq-coaching-board.md` — Coaching Board (kanban-board fullscreen)

### Tverrgående fullscreen (2)

7. `07-shared-agent-pipeline-overview.md` — Agent Pipeline Overview (full-system kart)
8. `08-shared-periodiserings-agent.md` — Periodiserings-Agent (4-lags decision-stack)

### Live Session 4-modal-pakke (4)

9. `09-modal-live-intro.md` — LiveIntroModal (Screen 1, før start)
10. `10-modal-live-active.md` — LiveActiveModal (Screen 2, rep-logging i gang)
11. `11-modal-live-between.md` — LiveBetweenModal (Screen 3, mellom øvelser)
12. `12-modal-live-summary.md` — LiveSummaryModal (Screen 4, oppsummering etter ferdig)

## Mini-batches (2)

| Mini-batch | Antall | Innhold |
|---|---|---|
| **5-A** | 6 | Pakker 1–6 (PlayerHQ Live + CoachHQ fullscreen) |
| **5-B** | 6 | Pakker 7–12 (Tverrgående + 4 Live-modaler) |

Se `mini-batches/README.md` for kjørerekkefølge og oppskrift.

## Slik bruker du hver pakke

Samme oppskrift som batch 1 og 2:

1. Last opp `branding-style-guide.html` + `design-system-v2.md` som system-kontekst (engang per session)
2. Per pakke: åpne `0X-{navn}.md`, last opp tilhørende HTML-wireframe, kopier prompt, iterer
3. Lim design-link tilbake til Claude Code

## Gate

Alle 12 pakker må være `APPROVED` før vi går til batch 6 (Settings + profile). Live Session 4-modal-pakken må gjennomgås samlet — flyten må være konsistent fra intro til summary.
