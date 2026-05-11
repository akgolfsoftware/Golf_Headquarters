# Redesign: PlayerHQ Live Tapper (range-mode)

**Last opp før prompten:** `wireframe/screen-deck/playerhq/live-tapper.html` (IA-referanse)

---

## ANTI-MØNSTER

Forrige levering var 6 captioned mini-mockups på samme side. **ÉN fullbleed produksjons-skjerm.**

---

## MÅL

Implementerbar React-komponent for `/portal/live/:sessionId/tapper`. Range-mode tap-counter for free-form trening — spilleren tapper for hver ball, kan bytte køllе via bottom-sheet. Mobile-first, men også desktop.

**Canvas: 1440×900 minimum.** Fullbleed. Mørk bg `#0A1F18`.

---

## LAYOUT (eksakte mål)

### Topp-bar (56px høy)

- **Venstre:** "RANGE-MODE"-pill + clock-ikon + "Time-stop: 14:30 → 14:48" (forløpt tid)
- **Senter:** "Range, Mulligan Indoor" muted
- **Høyre:** Lukk-X

### Senter — Tap-zone (650px tall, hele bredde)

1. **Aktiv kølle-pill** (40px gap fra topp-bar, sentrert):
   - Lime border 2px, padding 8px 20px
   - Ikon (lucide `golf`) + "Driver" + "↓ bytt"
   - Klikkbar → åpner bottom-sheet (vis i `02-live-tapper-bytte.html`)

2. **Counter** (sentrert):
   - "12" i JetBrains Mono 200px medium tabular-nums, lime `#D1F843`
   - Sub: "ball med driver" Inter 18px opacity 0.65

3. **Mini-statistikk-rad** (8px gap under sub, 4 mini-stats inline):
   - "Driver: 12" — "7-jern: 8" — "Wedge: 4" — "Totalt: 24"
   - Hver i JetBrains Mono 14px, opacity 0.7

### Bunn-bar (120px høy, full bredde — er TAP-AREALET)

Dette ER hele bunn-bar — én STOR knapp som tar opp 120px høyde og full bredde minus 24px padding på hver side. Spilleren tapper denne for hver ball.

- Bg: lime `#D1F843`
- Tekst: "TAP" i Inter 32px bold uppercase, farge `#0A1F18`
- Sub: "for å logge én ball" 14px under
- Hele knappen er pressbar — visuelt feedback ved tap (scale 0.98)

### Floating-actions (høyre-side, vertikalt stablet)

I høyre kant midt på siden, 3 sirkulære knapper (56×56px):
1. Avslutt-knapp (lucide `square`)
2. Pause-knapp (lucide `pause`)
3. Stats-knapp (lucide `bar-chart`)

Border 1px rgba(255,255,255,0.20), bg transparent.

---

## DEFAULT-STATE

Konkret innhold:

- **Spiller:** Markus (kun fornavn i header-context)
- **Tid startet:** 14:30 (nå 14:48, dvs 18 min forløpt)
- **Lokasjon:** Range, Mulligan Indoor
- **Aktiv kølle:** Driver
- **Reps med driver:** 12
- **Reps med andre køller:** 7-jern 8, wedge 4
- **Total:** 24 ball

---

## STATES SOM SEPARATE FILER (hvis spec ber om)

- `02-live-tapper-default.html` — DENNE
- `02-live-tapper-bytte.html` — Bottom-sheet åpen for kølle-bytte (lucide-ikon-grid 4×3)
- `02-live-tapper-tier-gate.html` — Free-bruker som har nådd 50/dag-grense (lime overlay med upgrade-CTA)
- `02-live-tapper-avslutt.html` — Bekreftelse-popover øverst-sentrert

---

## ANTI-MØNSTER-LISTE

❌ Captioned mini-states
❌ Tap-knapp som ikke fyller hele bunn-bar (skal være 120×full-bredde for tap-target)
❌ Manglende kølle-pill øverst
❌ Sidebar synlig
❌ Decimal som punktum (12.4 → 12,4)

---

## OUTPUT

Ett HTML-dokument 1440×900+. Lim design-link tilbake.
