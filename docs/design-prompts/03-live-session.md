# Claude Design-prompter: LIVE SESSION-SKJERMER

> Lim inn felles designspec fra `00-shared-spec.md` øverst.
> Disse skjermene er KRITISK for AK Golf — spilleren bruker dem under live trening på range/simulator.

---

## Prompt 3.1 — Live session (aktiv)

```
[LIM INN 00-shared-spec.md]

## Skjerm: Live session aktiv
URL: /portal/live/[sessionId]
Bruker: Spilleren Markus (16 år) på treningsfelt. Tablet eller mobil.

### Layout — fullscreen, ingen sidebar
Hele viewport-bredden brukes. Optimalisert for tablet (horisontalt) og mobil (vertikalt).

### Tablet-versjon (1024×768)

#### Topp-bar (60px)
- Venstre: Spiller-avatar + navn "Markus R"
- Senter: Økt-tittel "TEK Approach 150m"
- Høyre: Live-indikator (pulserende lime prikk + "LIVE · 47:23")
- Lukk-knapp (×)

#### Hoved-grid (split 70/30)

**VENSTRE — Drill-progress (full høyde)**

Hero-blokk:
- Drill nr: "Drill 4 av 8" (JetBrains Mono 14px uppercase)
- Drill-navn: Inter Tight 40px italic Instrument Serif: "*Gate-test 150m*"
- Parametere-chips: TEK · L-BALL · CS80 · M2 · PR3
- Komponentfokus: "Strike-konsistens"

**Tapp-knapp (DEN STORE)** — full bredde, min 200px høyde:
```
┌──────────────────────────────────────┐
│                                      │
│         GODKJENT  ✓                  │  ← grønn #005840 bg
│                                      │
│         Trykk for å logge            │
│                                      │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│                                      │
│         BOMMET  ✕                    │  ← rød #8B1A1A bg
│                                      │
│         Trykk for å logge            │
│                                      │
└──────────────────────────────────────┘
```
Begge må være min 44px touch-target (faktisk 200px her for stor knapp).
**ALDRI overflow-hidden** på disse — tekst må aldri kuttes.

**Rep-counter:**
- "Slag denne drill: **5 / 12**"
- "Suksess: **4 / 5 (80%)**"
- Mini-progress-bar i lime

**HØYRE — Drill-liste (kompakt)**

Drill 1: ✓ Set-up sjekk (10 min · 100%)
Drill 2: ✓ Range-warm-up (8 min · 90%)
Drill 3: ✓ Distanse-grupper (15 min · 75%)
**Drill 4: → Gate-test 150m (pågår)** ← lime bg, lime venstre-stripe
Drill 5: ○ Variant-runde (30 min)
Drill 6: ○ Mental-recovery (5 min)
Drill 7: ○ Score-prøve (15 min)
Drill 8: ○ Cool-down (5 min)

**Bunn-strip:**
- "Neste drill om: 8 min"
- [Pause] [Hopp over drill] [Avbryt økt]

### Mobil-versjon (375px)
Single column. Tapp-knappene fortsatt store (180px hver). Drill-liste collapser til chip-rad nederst.

### Editorial moment
Hele følelsen: rolig, fokusert. Tittel italic på drill-navn. Ingen distraksjoner.

Lever én HTML-fil med BÅDE tablet (1024px) og mobil (375px) varianter — vis dem side-om-side i samme HTML.
```

---

## Prompt 3.2 — Live session pause/avbryt

```
[LIM INN 00-shared-spec.md]

## Skjerm: Live session pause-modal
Vises som overlay når Markus trykker "Pause" eller "Avbryt".

### Modal (450px bredde, sentrert)

#### Tilstand 1 — Pause
Header: "Pauser *gate-test*"
Sub: "Drill 4 av 8 · 5/12 slag fullført"

Tre alternativer (radio-kort):
- ◉ **Kort pause (≤5 min)** — "Fortsetter drill 4"
- ○ **Lang pause (>5 min)** — "Logges som avbrutt + ny økt i morgen"
- ○ **Avbryt økten** — "Logges som abandoned. Caddie får varsel."

Notat-textarea: "Hvorfor pause? (valgfritt — Caddie bruker dette for tilpasning)"

Footer: [Tilbake] [Pause] [Bekreft]

#### Tilstand 2 — Hopp over drill
Header: "Hopp over *gate-test*?"
Sub: "Du har gjort 5 av 12 slag"

Advarsel: "Hvis du hopper over, fortsetter du til drill 5 (Variant-runde). Caddie justerer plan."

Notat: "Grunn (valgfritt)"

[Tilbake] [Hopp over]

### Editorial moment
Modal er ikke editorial — direkte, beslutnings-orientert.

Lever én HTML-fil med begge tilstander side-om-side.
```

---

## Prompt 3.3 — Live session ferdig (oppsummering)

```
[LIM INN 00-shared-spec.md]

## Skjerm: Live session ferdig
URL: /portal/live/[sessionId]/oppsummering
Vises etter siste drill er fullført eller "Avslutt"-knapp trykket.

### Layout
Full skjerm, ikke modal — denne fortjener sin egen plass.

### Hero (full bredde, 200px høyde)
- Stort tall: "**Drill 8 av 8 ✓**"
- Sub italic: "*Helt ferdig. 1t 32min godt brukt.*"
- "Suksess-rate: 78% (76/97 slag)"
- "Vis full debrief →"

### Resultat-grid (4 kort)

**1. Pyramide-fordeling i økten**
PyramideBar 240px:
- 75% TEK / 25% SLAG / 0% andre
- "Match med planlagt (80/20)": ✓ Nær perfekt

**2. Drill-performance**
Liste:
- ✓ Drill 1 — 100% (set-up sjekk)
- ✓ Drill 2 — 90% (warm-up)
- ✓ Drill 3 — 75% (distanse-grupper)
- ✓ Drill 4 — 67% (gate-test, ⚠ under target 80%)
- ✓ Drill 5 — 83% (variant-runde)
- ✓ Drill 6 — 100% (mental)
- ✓ Drill 7 — 60% (score-prøve)
- ✓ Drill 8 — 100% (cool-down)

**3. Snitt-tall**
- Slag totalt: 97
- Suksess-rate: 78%
- Tid per slag: 56 sek
- Konsistens (std.dev): 12%
- CS-belastning: 78/100

**4. Caddie-funn**
3 punkter:
- "Distansekontroll på 150m: 67% (under 80% target). Anbefal mer M0/M1-trening."
- "Strike-konsistens 92% — over forventet. Hold på."
- "Mental-økt (drill 6) ga 100% — godt brukt midt-økt."

### Coach-tilbakemelding (textarea)
"Notat til coach Anders (valgfritt):"
[Tekstfelt med placeholder "Føltes tungt på distanse i dag..."]

### Footer
- [Lagre og avslutt] (primær, lime)
- [Se full graf-analyse →] (sekundær, lenke til /portal/mal/statistikk)

### Editorial moment
Sub-italic "*Helt ferdig. 1t 32min godt brukt.*" — eneste italic.

Lever én HTML-fil.
```

---

## Prompt 3.4 — Live session godkjent/bommet animasjon

```
[LIM INN 00-shared-spec.md]

## Skjerm: Tilbakemelding etter tapp (mikro-interaksjon)
Vises som overlay-flash i 1.2 sekund etter spilleren tappet GODKJENT eller BOMMET.

### Tilstand 1 — GODKJENT

Full skjerm-overlay (semi-transparent #005840 bg, opacity 0.95):

- Stort ikon: Lucide check-circle, 240px, #D1F843 (lime)
- Tekst under: "**GODKJENT**" — Inter Tight 64px, hvit
- Sub: "Slag 5 av 12 · 80% suksess"

Animasjon (CSS):
- Ikon: scale 0 → 1 over 0.3s (ease-out)
- Bakgrunn: fade in 0.15s, hold 0.6s, fade out 0.3s
- Tekst: slide-up 16px → 0, 0.4s

### Tilstand 2 — BOMMET

Tilsvarende men:
- bg: #8B1A1A (mørk rød) 0.95
- ikon: Lucide x-circle, 240px, hvit
- tekst: "**BOMMET**", hvit
- sub: "Slag 5 av 12 · 67% suksess"

### Disse er INNE i live-session-skjermen — bygges som CSS-animasjon

Lever som én HTML-fil med både tilstander vist (separat overlay-eksempler). Inkluder full CSS-animasjon-kode.
```

---

## Prompt 3.5 — Live session for coach (overvåkning)

```
[LIM INN 00-shared-spec.md]

## Skjerm: Coach overvåker LIVE økter
URL: /admin/live
Coach Anders ser alle pågående økter i porteføljen sin.

### Layout
Full bredde, ingen sidebar (eller sticky CoachHQ-sidebar).

### Header
- Eyebrow: "COACHHQ · LIVE-OVERVÅKNING"
- Tittel: "*3 spillere* trener nå."
- Sub: "Sanntid · oppdatert hver 5. sek"

### Grid (3 kolonner)

Hver kort = én pågående live-økt:

```
┌────────────────────────────────────┐
│ ● LIVE · MARKUS R · 47:23          │  ← Pulserende lime
│                                    │
│ TEK Approach 150m                  │
│ Drill 4 av 8 · 81% suksess         │
│                                    │
│ [Progress-bar 50%]                 │
│                                    │
│ Neste drill: Variant-runde         │
│                                    │
│ [Se detaljert →]                   │
└────────────────────────────────────┘
```

**3 spillere-eksempler:**
1. Markus R · TEK Approach (47:23) · 81%
2. Emma S · SLAG Wedge-trening (12:09) · 88%
3. Joachim T · FYS Styrke (33:45) · — (FYS logges ikke per-rep)

### Coach-interaksjon
- Klikk en kort → åpner full live-detail (spilleren ser, men coach kan ikke styre)
- Send melding-CTA: "Sende kommentar til Markus underveis?"

### Statistikk-strip nederst
- 3 LIVE nå · 47 økter i dag · 6.2t total live-tid · Snitt 78% suksess

Lever én HTML-fil.
```
