# AK Golf Platform — PlayerHQ — Live Tapper (Range-mode)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/live/tapper`
- **Arketype:** E — Fullscreen / Live (range-mode)
- **Tier-gating:** Free 50 reps/dag, Pro/Elite ubegrenset
- **HTML-referanse:** `wireframe/screen-deck/playerhq/live-tapper.html`
- **Audit:** `wireframe/audit/playerhq-live-tapper.md`
- **Tilhørende modaler:** `LiveSummaryModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Live Tapper er en frittstående range-modus uten økt-kontekst — spilleren står på rangen og vil bare telle reps med valgfri kølle. Skiller seg fra Live Session ved at den ikke er bundet til en pyramide-økt; den brukes for ad-hoc trening (f.eks. "i dag bare 80 driver-slag"). Helt sort bakgrunn for maksimalt fokus i sterkt sollys på rangen.

## Layout — UNIKT for denne skjermen

Bruker arketype-E-felles-spec. **Fullscreen, ingen sidebar.** Bakgrunn `#000000` (helt sort) for sollys-kontrast.

### Topp-bar (56px)

- **Venstre:** Kølle-velger som chip — "DRIVER" Geist 14px med chevron-ned (klikk → bottom-sheet med alle køller)
- **Senter:** Klokke teller opp: "12:34" JetBrains Mono 14px muted
- **Høyre:** Lukk-X 40×40px

### Senter (counter-zone)

- Pyramide-fokus-pill over counter: `RANGE · DRIVER` (subtil grå border, ikke pyramide-farget)
- Counter: **JetBrains Mono 144px** (større enn Live Session — 0 distraksjoner), lime accent, tabular-nums
- Sub: "reps" Geist 14px muted
- Sub-2: gjennomsnittlig tid mellom reps "snitt 14 sek" JetBrains Mono 12px

### Bunn-bar (88px)

- Venstre: Mini-knapp "Angre siste" (ghost, 56px) med lucide `Undo2`
- Senter (60% bredde): `+1 rep` (primary lime, 88px høy, `rounded-full`)
- Høyre: Mini-knapp "Avslutt" (secondary, 56px)

## States å designe

| State | Beskrivelse |
|---|---|
| Idle (0 reps) | Counter 0, instruks "Tap +1 for hver rep" pulserer |
| Aktiv (12 reps) | Counter 12, snitt-tid 14 sek synlig |
| Køllebytte (bottom-sheet åpen) | Liste over køller: Driver, 3W, 5W, Hybrid, 4i–PW, 50, 54, 58, Putter — currentvalg har lime ring |
| Etter "Angre siste" | Counter teller ned med kort lime flash |
| Avslutt-bekreftelse | Sentrert popover "Avslutt og lagre 80 reps?" med `Avslutt` (primary) / `Fortsett` (ghost) |

## Køllebytte-bottom-sheet

Når kølle-chip klikkes, slider bottom-sheet opp med 9 køller som store tap-targets (88px høye, full bredde). Currentvalg har lime ring + lime check-ikon høyre. Tap → counter resettes til 0 + ny kølle vises i topp-bar.

## Klikkbare elementer

| Element | States |
|---|---|
| +1 rep-knapp | default, tap (lime flash + counter ticks opp), long-press (legger til 5 reps) |
| Angre siste | default, hover, tap (counter ticks ned med flash) |
| Kølle-chip | default, hover, klikk → bottom-sheet |
| Bottom-sheet kølle-rad | default, hover, selected (lime ring + check) |
| Avslutt | default, klikk → bekreftelse-popover |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Empty (0 reps, ingen aktivitet på 30 sek):** "Klar når du er — tap +1 for å begynne"
- **Tier-gate (Free, etter 50 reps):** Sentrert overlay "Free-grense nådd: 50 reps i dag" + `Oppgrader til Pro →` (primary lime)
- **Loading bottom-sheet:** Skeleton 9 kølle-rader

## Ønsket output fra Claude Design

1. Idle-state — counter 0, instruks pulserer
2. Aktiv 12 reps med driver, snitt-tid synlig
3. Bottom-sheet åpen med kølle-velger (driver currently selected)
4. Tier-gate overlay (Free, 50 reps nådd)
5. Avslutt-bekreftelse popover
6. Mobil — identisk (mobile-first by design)

## Ikke-mål

- Ikke designe `LiveSummaryModal` (egen pakke 12)
- Ikke designe rep-historikk eller analyse-skjerm
- Ikke designe TrackMan-integrasjon (egen flate)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
