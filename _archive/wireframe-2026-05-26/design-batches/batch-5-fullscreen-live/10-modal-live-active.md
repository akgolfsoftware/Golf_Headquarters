# AK Golf Platform — Modal — LiveActiveModal (Screen 2 — rep-logging)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** Modal — `LiveActiveModal`
- **Arketype:** E — Fullscreen / Live (rep-logging i gang)
- **Tier-gating:** Ingen ekstra (gating allerede i intro)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/live-active.html`
- **Audit:** `wireframe/audit/modal-live-active.md`
- **Tilhørende skjermer:** Åpnes fra `LiveIntroModal`; leder til `LiveBetweenModal` mellom øvelser

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

LiveActiveModal er Screen 2 i Live Session-flyten — selve rep-logging-flaten. Spilleren tapper midten av skjermen for hver rep, eller bruker long-press for "ikke godkjent". Skiller seg fra Pakke 1 (Live Session standalone-skjerm) ved at denne er **modal som er del av en flyt** — den har transitions inn fra intro og ut til between-screen mellom øvelser. Counter-kjernen er identisk, men context-info i topp-bar viser øvelses-nummer (3 av 6) i stedet for økt-nummer.

## Layout — UNIKT for denne modalen

Bruker arketype-E-felles-spec. **Fullscreen-modal, ingen sidebar.** Bakgrunn `#0A1F18`.

### Topp-bar (56px)

- **Venstre:** Live-pill (lime pulserende) + "Øvelse 3 av 6 · TEK · DRIVER" Geist 12px
- **Senter:** Mini-progress-bar 4px (lime fyller seg opp gjennom hele økta) — viser totalt rep-tall i økta
- **Høyre:** Lukk-X 40×40px (åpner avslutt-bekreftelse)

### Senter — counter-zone

- Pyramide-fokus-pill: `TEK · DRIVER` (primary border)
- Counter: **JetBrains Mono 120px** lime accent — `12`
- Sub: "av 25 reps" Geist 14px muted
- Mini-ring rundt counter (4px stroke, lime fyller seg opp)
- Tap-instruks (kun første rep): "Tap for å logge ↓" pulserer

### Bunn-bar (88px)

- Venstre 40%: `Pause` (secondary, 56px, `rounded-full`)
- Høyre 60%: `Logg rep` (primary lime, 88px, `rounded-full`)
- Long-press på Logg rep = "Markér som mislykket"

## States å designe

| State | Beskrivelse |
|---|---|
| Idle (0 reps) | Counter 0/25, instruks pulserer |
| Aktiv mid-rep (12/25) | Counter 12, ring 48% fylt |
| Long-press feedback | Destructive ring rundt counter, "Mislykket rep" toast |
| Pause | Counter dempes 40% opasitet, "PAUSE" overlay i italic Instrument Serif 96px |
| Connection lost | Toast øverst "Tilkobling tapt — reps lagres lokalt", lime ring rundt counter |
| Ferdig (25/25) | Counter glows lime, transition til `LiveBetweenModal` etter 800ms |

## Pyramide-fokus-fargekoding

Samme som Pakke 1 (Live Session standalone):
- FYS `#16A34A`, TEK `#005840`, SLAG `#D1F843`, SPILL `#F4C430`, TURN `#5E5C57`

## Klikkbare elementer

| Element | States |
|---|---|
| Logg rep-knapp | default, tap (lime flash), long-press (destructive flash) |
| Pause | default, hover, klikk → pause-overlay |
| Lukk-X | klikk → avslutt-bekreftelse |
| Mini-progress-bar | static, ingen interaksjon |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading (mellom øvelser):** Spinner + "Laster neste øvelse ..."
- **Connection lost:** Toast + lokal-lagring
- **Ferdig-transition:** Lime flash + transition til between-modal

## Ønsket output fra Claude Design

1. Idle (0/25, instruks pulserer)
2. Aktiv (12/25, ring 48% fylt)
3. Long-press feedback (destructive ring)
4. Pause med "PAUSE"-overlay
5. Ferdig (25/25, glows lime, transition mot between)
6. Mobil — identisk (mobile-first)

## Ikke-mål

- Ikke designe `LiveBetweenModal`, `LiveSummaryModal` (egne pakker 11, 12)
- Ikke designe Pakke 1 (Live Session standalone)
- Ikke designe ny-økt-wizard

## Når du er ferdig

Lim design-link tilbake til Claude Code.
