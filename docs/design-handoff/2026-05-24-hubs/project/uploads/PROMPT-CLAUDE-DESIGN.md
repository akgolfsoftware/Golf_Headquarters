# Claude.ai Design-prompt — Teknisk Utviklingsplan for AK Golf HQ

> **Slik bruker du:** Åpne Claude.ai (Sonnet 4.6 eller Opus 4.7) og lim inn hele prompten under linjen. Claude vil lage en interaktiv Artifact du kan se og iterere på direkte.
>
> **Mac-tips:** Cmd+A i denne fila, Cmd+C, gå til claude.ai, Cmd+V i melding-feltet, Enter.

---

# PROMPT (kopier alt under denne linjen)

Du skal designe en serie React-skjermer for **AK Golf HQ — Teknisk Utviklingsplan**. Lever som **Artifact** (React single-file) som jeg kan se og iterere på live.

## Kontekst

AK Golf Academy er en norsk coaching-bedrift som driver utvikling av elite-amatører og toppjuniorer (WANG Toppidrett, GFGK Junior). Vi bygger en plattform der **coach + spiller sammen redigerer en langsiktig teknisk utviklingsplan**. Planen brytes ned i **10 P-posisjoner** (P1.0 til P10.0) som dekker hele golf-svingen:

- **P1.0** Oppstilling
- **P2.0** Kølleskaft parallelt med bakken (baksving)
- **P3.0** Venstre arm parallell (baksving)
- **P4.0** Topp-posisjon
- **P5.0** Venstre arm parallell (nedsving)
- **P6.0** Kølleskaft parallelt (nedsving)
- **P7.0** Impact
- **P8.0** Kølleskaft parallelt (etter impact)
- **P9.0** Høyre arm parallell
- **P10.0** Finish

For hver P-posisjon kan coach/spiller legge til **arbeidsoppgaver** i prioritert rekkefølge (drag-and-drop). Eksempel-oppgaver på P4.0:
1. Venstre håndledd flat
2. Skuldre 90° rotert
3. Vekt 70/30 høyre

Hver oppgave har **rep-mål** delt i 3 hastigheter:
- **Dry-swing** (uten ball, fokus på posisjon)
- **Lav** (CS50-CS70, halv-tempo med ball)
- **Full** (CS80-CS100, full hastighet)

Typisk: 1000 dry + 500 lav + 200 full per oppgave.

## Designsystem — AK Golf-tokens

**Farger:**
- `--brand-primary: #005840` (forest green) — primær merkevare, CTA-handlinger
- `--brand-accent: #D1F843` (lime) — accent, "active", positive deltas
- `--brand-primary-soft: #E8F0EC` — soft tint for bakgrunner
- `--surface: #FAFAF7` (cream) — app-bakgrunn
- `--surface-card: #FFFFFF` — kort
- `--ink: #0A1F18` — primær tekst
- `--ink-muted: #5E5C57` — sekundær tekst
- `--ink-subtle: #9C9990` — meta/labels
- `--line: #E5E3DD` — borders

**Pyramide-farger (5 treningsområder):**
- FYS: #005840 (forest)
- TEK: #1A7D56 (medium green)
- SLAG: #D1F843 (lime)
- SPILL: #B8852A (ochre/gold)
- TURN: #5E5C57 (grey)

**Typografi:**
- **Display/hero**: Inter Tight italic (`font-serif italic` i Tailwind hvis du ikke har Inter Tight)
- **UI/body**: Inter (default sans-serif)
- **Tabular/code**: JetBrains Mono (`font-mono` med `tabular-nums`)

**Spacing:** 8pt-grid — bruk `p-2, p-4, p-6, p-8, p-12, p-16` etc.

**Border-radius:**
- Cards: 16-20px (`rounded-2xl`)
- Buttons: pill (`rounded-full`)
- Tags/pills: 4-6px (`rounded` til `rounded-md`)

**Ingen emojis** — bruk Lucide-ikoner (du har `lucide-react` tilgjengelig i Artifact).

## Kategoriserings-felter på hver oppgave

Hver arbeidsoppgave skal kategoriseres med:

1. **Pyramide-område** (én av FYS/TEK/SLAG/SPILL/TURN)
2. **Område** (Strokes Gained-bucket — hierarkisk):
   - **Tee**: Tee Total
   - **Approach**: 200+, 150-200, 100-150, 50-100 (meter)
   - **Around Green**: Chip, Pitch, Lob, Bunker
   - **Putt**: 0-3m, 3-5m, 5-10m, 10-15m, 15-25m, 25-40m, 40m+
3. **Køllevalg** (multi-select): Driver, 3-tre, Hybrid, 5-jern, 6-jern, 7-jern, 8-jern, 9-jern, PW, SW/LW, Putter, Alle køller
4. **L-fase** (Mac O'Grady lærefase): L_KROPP, L_ARM, L_KOLLE, L_BALL, L_AUTO
5. **CS-nivå** (ferdighet): CS50, CS60, CS70, CS80, CS90, CS100
6. **M** (miljø): M0, M1, M2, M3, M4, M5
7. **PR** (press-nivå): PR1, PR2, PR3, PR4, PR5

Disse vises som tag-pills på hver oppgave-kort. Bruk fargekode:
- Pyramide: matching pyramide-farge
- Område: stone/grå med kantlinje
- Kølle: stone fill
- L-fase: purple (#7C52B0 soft)
- CS: emerald gradient (lavere = lysere)
- M: sky blue
- PR: red

## TrackMan-mål per kølle (viktig ny dimensjon)

Planen har også **TrackMan-mål per kølle** — kølle-spesifikke benchmark-tall spilleren skal oppnå:

**Eksempel — 7-jern:**
- Primær: Smash Factor ≥1.42 (status: oppnådd ✓)
- Spin Rate: 6500-7500 rpm
- Carry: 145-155m
- Dispersion (std): < 8m

**Eksempel — Driver:**
- Primær: Ball Speed ≥165 mph (status: på vei, 163.4 nå)
- Spin: 2200-2700 rpm
- Smash: ≥1.45
- Launch Angle: 10-12°

Vises som egen sidebar-seksjon i plan-builder + dedikert detail-side.

## Skjermene som skal designes (i prioritert rekkefølge)

### 1. Plan-builder (HOVEDFLYTEN — start her)
Coach/spiller redigerer planen sammen. **2-nivå drag-and-drop:**
- **Ytre**: P-rader i prioritert rekkefølge (P4 først hvis det er hovedfokus)
- **Indre**: Oppgaver innen hver P (prio 1, 2, 3)

P-er med høyest prioritet får **lime venstre-stripe** (border-l-4 border-l-lime-400).

**Layout:** 2-kolonne, hovedinnhold venstre + sidebar høyre.
- Venstre: P-listen
- Høyre: Plan-sammendrag + **TrackMan-mål per kølle** + Pyramide-fordeling + Coach + Aktivitet

**Demo-data — bruk denne:**
- Spiller: Markus R.P.
- Coach: Anders K.
- Periode: Spesialisering · 15. apr → 30. juni
- P4.0 åpen med 3 oppgaver:
  - 1. Venstre håndledd flat (TEK · App 150-200 · 7-jern · L_ARM · CS70 · M2 · PR2) — 750/260/70 reps
  - 2. Skuldre 90° rotert (TEK · Tee Total · Alle køller · L_KROPP · CS50 · M1 · PR1) — 270/60/0 reps
  - 3. Vekt 70/30 høyre (TEK · Tee Total · Driver · L_KROPP · CS50 · M0 · PR1) — 80/0/0 reps + "Ny denne uka"-merke

### 2. Oppgave-modal (legg til/rediger oppgave)
Modal med alle inputs:
- Tittel + beskrivelse
- Pyramide-velger (segmented control, 5 valg)
- **Område** med hierarkisk velger:
  - Hovedtabs: Tee / Approach / Around Green / Putt
  - Sub-valg basert på aktivt hovedvalg
  - Expand "Se alle 16 SG-buckets"
- **Køllevalg** (multi-select chips)
- L-fase (segmented)
- CS-nivå (segmented)
- M (segmented)
- PR (segmented)
- Bilde/video upload (placeholder med slot-design)
- Rep-mål (3 separate tall: dry / lav / full)
- Linkede drills fra øvelsesbank
- Forhåndsvisning av hvordan oppgaven ser ut i listen

### 3. Plan-liste (oversikt over flere planer per periode)
Planer gruppert per periodebar-fase:
- **Spesialisering** (aktiv) — 2 planer
- **Turnering** (kommer 1. juli) — empty state
- **Grunntrening** (avsluttet) — 2 arkiverte

Hver plan-kort viser: navn, status-pill, antall oppgaver/P, fremdrift-bar, coach-avatar.

### 4. Spiller-mobil-tracker
**Mobil-først** layout (375x812 viewport). Spilleren ser sin plan i lommen:
- Header med tilbake-knapp + plan-navn
- 3 KPI-kort: total fremdrift / reps denne uka / estimert ferdig
- Sticky lime "Logg reps"-CTA
- P4.0 oppgaver med:
  - Tag-rad (kompakt)
  - 3 progress-bars
  - **Counter-knapper +10 per hastighet** (3 grønne knapper)
  - Sparkline siste 7 dager
- Andre P-er som kollapsede rader

### 5. Live-økt med MATCH-banner
Spilleren i live-økt. Forest-grønn header med LIVE-pulse + timer.
- **Venstre kolonne**: Aktiv drill med video-thumbnail + beskrivelse
- **MATCH-banner** (lime): "Denne drillen er koblet til teknisk plan — reps teller automatisk mot din oppgave: P4.0 · 1. Venstre håndledd flat"
- **Høyre sidebar**: Aktiv teknisk oppgave med:
  - Live progress-bars (animert når +20 legges til)
  - **Counter-knapper +10/+20** per hastighet (Dry/Lav/Full)
  - Custom "+30 reps" lime-knapp
  - Andre matchende oppgaver under
  - Session-totals nederst

### 6. Coach-side med felles redigering
3-kolonne layout (CoachHQ):
- **Kolonne 1**: Plan-liste kompakt med endrings-flagg
- **Kolonne 2**: Aktivitet/audit-logg siste 24t — kronologisk timeline med avatar + handling + tid. Spiller-handlinger får "Godkjenn / Tilbake / Rediger"-knapper.
- **Kolonne 3**: Comment-tråd per oppgave (chat-stil, coach grønn, spiller gul)

**Live editing banner øverst:** lime stripe med "Markus redigerer akkurat nå" + begge avatarer side-ved-side med pulse-dot.

### 7. TrackMan-mål per kølle (drill-down side)
Dedikert skjerm med en kølle om gangen. For hver kølle:
- Status-pill (Oppnådd ✓ / På vei / Ikke begynt)
- Primær måling med stor progress-bar
- Sekundære målinger som tabell (verdi / mål)
- Trend-graf siste 30 dager
- "Sist målt: i dag · 14:22"

## Tekniske krav

- **Single-file React-komponent** per skjerm — `export default function`
- **Kun imports**: `react` og `lucide-react`
- **Tailwind CSS** for all styling (Artifact har det innebygd)
- **All dummy-data inline** i komponenten
- **TypeScript** med proper typing
- **Responsive** der det er logisk (spiller-mobil = mobile-first, coach-views = desktop-first)
- **Ingen emojis** i UI — bruk Lucide-ikoner

## Arbeidsflyt for denne sesjonen

1. **Start med Plan-builder (#1)**. Lag Artifact, vis meg.
2. Vi itererer på den til den ser bra ut.
3. Når den er godkjent, fortsett til Oppgave-modal (#2).
4. Slik gjennom alle 7.

**Når du leverer første Artifact, ikke spør om for mye — bare bygg basert på spec-en over.** Vis meg, og jeg gir feedback derfra.

Klar? Start med Plan-builder.
