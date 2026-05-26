# AK Golf Platform — PlayerHQ — Live Session

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/live/:sessionId`
- **Arketype:** E — Fullscreen / Live (tap-mode)
- **Tier-gating:** Free får 1 live-økt/uke, Pro/Elite ubegrenset
- **HTML-referanse:** `wireframe/screen-deck/playerhq/live-session.html`
- **Audit:** `wireframe/audit/playerhq-live-session.md`
- **Tilhørende modaler:** `LiveIntroModal`, `LiveActiveModal`, `LiveBetweenModal`, `LiveSummaryModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Live Session er kjernen i PlayerHQ. Spilleren går "into the zone" og logger rep én etter én under en aktiv treningsøkt. Skjermen tar over hele viewport — ingen sidebar, ingen distraksjoner. Spillerens oppgave er å tappe midten av skjermen for hver gjennomført rep, eller bruke long-press for "ikke godkjent". Pyramide-fokus vises som pill over counter (TEK · DRIVER, FYS · KJERNE, etc).

## Layout — UNIKT for denne skjermen

Bruker arketype-E-felles-spec. **Fullscreen, ingen sidebar.** Bakgrunn `#0A1F18`.

### Topp-bar (56px)

- **Venstre:** Live-pill (lime accent pulserende) + "TEK · DRIVER" Geist 12px uppercase
- **Senter:** "Økt 12 av 18 — Sommer-toppform" muted 12px
- **Høyre:** Lukk-X 40×40px sirkel

### Senter (counter-zone)

- Pyramide-fokus-pill over counter: `TEK · DRIVER` (lime border)
- Counter: **JetBrains Mono 120px**, lime accent, tabular-nums — `24`
- Sub: "av 30 rep" Geist 14px muted
- Mini-progress-ring rundt counter (4px, lime fyller seg opp)
- Sist-rep-feedback: liten subtil flash av lime ring ved tap

### Bunn-bar (88px)

- Venstre 50%: `Pause` (secondary, 56px høy)
- Høyre 50%: `Neste rep →` (primary lime, 88px høy, full bredde minus padding)
- Long-press på primær = "Ikke godkjent" (subtil destructive flash)

## States å designe

| State | Beskrivelse |
|---|---|
| Idle (før første tap) | Counter 0/30, pulserende "Tap for å logge rep ↓"-instruks |
| Aktiv tap-mode | Counter 24/30, ring 80% fylt |
| Pause | Counter dempes til 40% opasitet, "PAUSE" italic Instrument Serif 96px overlay |
| Long-press feedback | Destructive ring rundt counter, "Rep markert som mislykket ✗" |
| Connection lost | Toast øverst "Tilkobling tapt — reps lagres lokalt", lime ring rundt counter |
| Ferdig (siste rep) | Counter glows lime, "✓ 30 av 30 — neste øvelse →" |

## Pyramide-fokus-fargekoding på pill

- **FYS:** `#16A34A` border
- **TEK:** `#005840` border
- **SLAG:** `#D1F843` border (lime accent)
- **SPILL:** `#F4C430` border (gold)
- **TURN:** `#5E5C57` border (grå)

## Klikkbare elementer

| Element | States |
|---|---|
| Counter-tap-zone (hele midten) | default, tap (flash), long-press (destructive flash) |
| Pause-knapp | default, hover, active (pause-overlay vises) |
| Neste rep-knapp | default, hover, loading (spinner), success (lime flash) |
| Lukk-X | default, hover, klikk → bekreftelse-popover |
| Live-pill | static, pulserende animasjon |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading (start-up):** Sentrert "Laster øvelse ..." med pulserende ring
- **Connection lost:** Toast øverst, reps fortsetter å lagres lokalt
- **Error:** Sentrert kort "Kunne ikke laste øvelse — gå tilbake ↺"

## Ønsket output fra Claude Design

1. Idle-state — counter 0/30, instruks-tekst pulserer
2. Aktiv mid-økt — counter 24/30, ring 80% fylt, lime accent
3. Pause-state med "PAUSE"-overlay
4. Long-press (rep markert mislykket)
5. Ferdig-state — counter 30/30, glows lime, "Neste øvelse →"-CTA
6. Mobil — identisk layout (mobile-first), kun bakgrunn-padding endrer seg på desktop

## Ikke-mål

- Ikke designe Live-modalene (egen pakke 9–12)
- Ikke designe Live Tapper (range-mode — egen pakke 2)
- Ikke designe økt-konfig (gjøres i ny-økt-wizard — annen batch)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
