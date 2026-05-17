# Prompt: PlayerHQ Live Session — Sports Editorial × 3 enheter

> Lim inn `design.md` (Sports Editorial design system) FØRST som kontekst.
> Deretter denne prompten. Claude Design leverer én HTML-fil med iPad,
> iPhone og desktop stablet vertikalt — i den rekkefølgen, fordi iPad er
> primær for denne skjermen.

---

## Slik bruker du dette i Claude Design

1. Åpne https://claude.ai/new (Sonnet 4.6 eller Opus, design-mode/artifacts aktivert)
2. Lim inn HELE innholdet av `design.md` (Sports Editorial design system)
3. Trykk Enter to ganger
4. Lim inn prompten under (alt fra og med `---` til slutten)
5. Claude Design leverer komplett HTML
6. Lagre som `_outputs/05-playerhq-live.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-atleter.

Du har akkurat fått hele design-systemet (over). Denne skjermen er et
**unntak fra det meste av systemet**. Les spesielt:

- Italic Instrument Serif er **kun reservert for drill-tittelen** her — alt
  annet i live-modus er funksjonelt og umiddelbart lesbart
- Magasin-tonen STRIPPES bort til fordel for operativ klarhet
- Mørk gradient-bakgrunn (forest-deep → forest) — batterivennlig + lett på
  øynene i sollys på rangen
- Tapp-knapper er HOVEDPOENGET — STORE, åpenbare, umulig å bomme på
- Editorial-feel beholdes kun i: drill-tittel (italic), Tiny-eyebrows,
  JetBrains Mono-tall, og ÉN coach-marginalia
- Norsk locale (komma desimal, NBSP-tusenskille, +/− fortegn)

# SKJERM: PlayerHQ Live Session (3 enheter)

URL: `/portal/live/[id]`

## Demo-bruker (faktiske data)

**Øyvind Rohjan**
- Alder: 19 år
- HCP: **+3,5**
- Status: Elite-amateur, står på rangen NÅ med iPad i hånd
- Coach: Anders Kristiansen (har lagt inn instrukser i forveien)

Brukerspørsmål når Øyvind står på rangen midt i drillen:
*"Hvilket slag skal jeg gjøre nå, og var det godkjent?"*

Tonen er **maksimalt operativ**. Øyvind har hansker på, sol i ansiktet, og
kan ikke lese paragraf-tekst. Han trenger to ting umiddelbart:
1. Hva er neste slag (drill-tittel + parametre)
2. Hvordan registrerer jeg utfallet (GODKJENT / BOMMET — to gigant-tapp)

Alt annet er sekundært.

## Realistiske data å bruke

- **I dag:** Søndag 17. mai 2026, kl 16:42 (ettermiddag, golden hour starter snart)
- **Sted:** GFGK Range, posisjon 4
- **Økt:** TEK Approach 150-180m · planlagt 75 min · 8 drills totalt
- **Aktiv drill:** Nummer **4 av 8**
- **Tid forløpt:** 38 min av 75 min (50%)

### Aktiv drill (drill 4)

- **Navn:** *150m mot smal grønn*
- **Beskrivelse:** Slå 12 baller med 7-jern, mål en sone 12m bred. Mål: ≥9 godkjent.
- **Parametre (som tags):**
  - **CS70** — Challenge-skala 70 (high-pressure presisjon)
  - **M2** — Miljø 2 (Trackman-simulert vind)
  - **PR2** — Press-grad 2 (timer + counter synlig)
  - **L-AUTO** — Læringsfase: autonom (uten coach til stede)

### Slag-status (live)

- **5 av 12 slag fullført**
- **4 godkjent**, **1 bommet**
- **Suksess-rate: 80%** (over mål 75%)
- **Trail siste 5:** ✓ ✓ ✗ ✓ ✓

(Vis trail som 5 store sirkler — fylte forest med check-glyf hvis godkjent,
outline danger-rød med X hvis bommet. Siste slag er høyrest.)

### Drill-progress (alle 8 drills)

Mini-indikator nederst: 8 sirkler i en rad.
- Drill 1: ✓ fullført (forest fyll)
- Drill 2: ✓ fullført (forest fyll)
- Drill 3: ✓ fullført (forest fyll)
- Drill 4: ● aktiv (lime fyll, pulserende)
- Drill 5-8: ○ kommende (outline, muted-fg)

### Coach-marginalia (kun ÉN — ikke flere)

Anders har lagt inn en kort instruks som vises diskret under drill-tittelen:

*"Slow-motion på drill 3. Du svingte for hardt sist."*
*— Anders, 11:02*

(Italic 13-14px, max-width 320px, plassert som sidebar-margin på iPad/desktop,
under drill-info-blokken på iPhone. **Aldri** rop dette ut — det er en
hvisken, ikke en beskjed.)

### Sesjons-meta (alltid synlig, dempet)

- Økt-tittel: TEK Approach 150-180m
- Drill 4 av 8
- Slag 5/12 (80%)
- Tid: 38:14 / 75:00 (count-up)
- Sted: GFGK Range, pos 4

---

## STRUKTUR — operativ, ikke magasin

Dette er IKKE en spread-stacking. Det er en **single-purpose action-skjerm**.

Hierarkiet er:

1. **Topp:** Eyebrow med økt-progresjon (drill X av Y + progress-bar)
2. **Drill-hero:** drill-tittel (italic Instrument Serif) + tags + coach-marginalia
3. **HOVEDFLATEN:** to gigant-knapper GODKJENT (lime) + BOMMET (rød)
4. **Slag-meter:** counter X/Y + suksess-rate + trail av siste 5
5. **Bunn:** mini drill-progress (8 sirkler) + pause/avslutt + ⌘K
6. **Ingen kolofon, ingen pull-quote, ingen photo, ingen footer**

Editorial-feel finnes kun i typografien — strukturen er funksjonell.

---

## FARGER — mørk modus tvunget

Hele skjermen bruker mørk gradient. Ignorer cream-bakgrunn.

```
background: linear-gradient(180deg, #0A1F17 0%, #163027 100%);
```

- All tekst: var(--ak-bone) #F5F4EE eller var(--ak-cream) #FAFAF7
- Muted tekst: rgba(245, 244, 238, 0.6)
- Border: rgba(245, 244, 238, 0.12) (hairline)
- GODKJENT-knapp: bg #D1F843 (lime), tekst #0A1F18
- BOMMET-knapp: bg #A32D2D (destructive), tekst #FAFAF7
- Aktiv drill-indikator: lime pulserende
- Coach-marginalia: italic, color rgba(245, 244, 238, 0.7)
- Pyramide-tags i tag-pill-stil med pyramide-farge på 18% alpha bakgrunn,
  full farge på tekst

---

## TAPP-KNAPPER — kritisk spec (les nøye)

Disse to knappene er hovedinteraksjonen på skjermen. Spillet står på spill.

### Generelle krav (alle 3 enheter)

- **Minst 180px høyde** på iPad/iPhone (dette er minimum — gjerne 200-220px)
- **Minst 16px luft** mellom de to knappene
- **Pill-radius** (radius-pill = 999, eller radius-xl = 16 for rektangulær variant)
- **Touch-area** = visuell flate (ingen "skjult" hit-area utenfor)
- **Aktiv state:** scale(0.97) + lett indre skygge — føl haptic-feedback
- **Disabled state:** kun mens forrige slag registreres (200ms blokk for å
  unngå double-tap)

### GODKJENT-knapp (venstre på iPad landscape, øverst på iPhone)

```
┌───────────────────────────────────┐
│                                   │
│           ✓                       │
│        GODKJENT                   │
│        slag 6 av 12               │
│                                   │
└───────────────────────────────────┘
```

- Bakgrunn: var(--ak-lime) #D1F843
- Tekst: #0A1F18 (alltid mørk på lime)
- Stor check-ikon: Lucide `Check` 48-64px stroke 2px
- Hovedtekst: "GODKJENT" — Geist 500 28-32px uppercase tracking 0.05em
- Sub-tekst: "slag X av Y" — Geist 400 14px, color #0A1F18 70% alpha
- Hover (desktop): translateY(-2px) + shadow-2
- Active: scale(0.97)

### BOMMET-knapp (høyre på iPad landscape, nederst på iPhone)

```
┌───────────────────────────────────┐
│                                   │
│           ✗                       │
│         BOMMET                    │
│        prøv igjen                 │
│                                   │
└───────────────────────────────────┘
```

- Bakgrunn: var(--ak-destructive) #A32D2D
- Tekst: #FAFAF7
- Stor X-ikon: Lucide `X` 48-64px stroke 2px
- Hovedtekst: "BOMMET" — Geist 500 28-32px uppercase tracking 0.05em
- Sub-tekst: "prøv igjen" — Geist 400 14px, color #FAFAF7 70% alpha
- Hover (desktop): translateY(-2px) + shadow-2
- Active: scale(0.97)

---

## IPAD 1024×768 (landscape) — PRIMÆR

Dette er den viktigste viewporten. Øyvind står på rangen med iPad-en
hvilende i en kølle-bag-holder eller på en benk. Han har 1-2 sekunder
mellom slag til å registrere.

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ ● LIVE · TEK APPROACH · DRILL 4 AV 8 · 38:14 / 75:00    ⌘K  │ ← 44px topp
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │ ← Progress 4px
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DRILL 4                                                         │
│  *150m mot smal grønn.*                              ← 56px IS  │
│                                                                  │
│  [CS70] [M2] [PR2] [L-AUTO]                          ← tags    │
│                                                                  │
│  *Slow-motion på drill 3. Du svingte for hardt sist.*           │
│  — Anders, 11:02                                                 │
│                                                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐   ┌─────────────────────────┐    │
│  │                         │   │                         │    │
│  │          ✓              │   │          ✗              │    │
│  │       GODKJENT          │   │        BOMMET           │    │
│  │      slag 6 av 12       │   │       prøv igjen        │    │
│  │                         │   │                         │    │
│  └─────────────────────────┘   └─────────────────────────┘    │
│                                                                  │
├────────────────────────────────────────────────────────────────┤
│  5/12 · 80% suksess                                              │
│  ● ● ○ ● ●                            ← Trail (siste først?)   │
│                                                                  │
│  ● ● ● ◉ ○ ○ ○ ○                       ← Mini drill-progress    │
│  DRILL 1   2   3  [4]  5  6  7  8                               │
│                                                                  │
│  [⏸ Pause]                              [⏹ Avslutt økt]         │
└────────────────────────────────────────────────────────────────┘
```

### Spesifikt for iPad landscape

- **Topp-bar (44px):**
  - Pulserende lime live-prikk (8px)
  - Eyebrow: `LIVE · TEK APPROACH · DRILL 4 AV 8 · 38:14 / 75:00`
    - Tiny (10-11px Geist 500 caps tracking 0.1em)
    - Color: var(--ak-bone) 80% alpha
  - ⌘K-knapp høyre topp (kun essentielle handlinger — se nedenfor)
  - 4px lime progress-bar under (50% fyll — 38/75 min)

- **Drill-hero (vertikal padding 32-48px):**
  - Tiny eyebrow: `DRILL 4` (color: bone 60% alpha)
  - Drill-tittel: *150m mot smal grønn.* — Instrument Serif italic 56px
    (eneste italic-tittel på hele skjermen)
  - Tags-rad (8px gap mellom): CS70, M2, PR2, L-AUTO
    - Hver tag: pill-radius, padding 6px 14px, Geist 500 12px caps
      tracking 0.06em
    - Bakgrunn: pyramide-tek (#005840) 30% alpha
    - Tekst: lime #D1F843 (synlig på mørk)
  - Coach-marginalia: rett under tags, italic 14px, max-width 480px,
    color bone 70% alpha, ingen accent-strek (vi vil ikke at coach skal
    rope — han hvisker)

- **Action-rad (HOVEDFLATEN):**
  - To kolonner like store (50/50)
  - Padding venstre/høyre kant: 32px
  - Gap mellom knapper: 24px
  - Knapphøyde: **200px** (over minimum)
  - Ikon: Lucide Check eller X, 64px, stroke 2px
  - Tekst: Geist 500 32px uppercase tracking 0.05em
  - Sub-tekst: Geist 400 14px, 12px under hovedtekst

- **Meter-rad (bunn):**
  - Counter venstre: `5/12 · 80% suksess`
    - Tall: JetBrains Mono 500 24px tabular-nums
    - "80% suksess": Tiny 11px caps, color lime
  - Trail høyre (5 sirkler):
    - 24px sirkler, 12px gap
    - Godkjent: lime fyll med tiny Check inni (10px)
    - Bommet: outline destructive med X inni (10px)
    - Siste slag-sirkel har 2px lime ring (markerer "nyest")

- **Mini drill-progress (8 sirkler):**
  - Centered eller venstre-justert
  - 16px sirkler, 12px gap
  - Drill 1-3: forest fyll (#2A7D5A) + tiny Check
  - Drill 4 (aktiv): lime fyll, pulserende 2s loop, 2px lime glow
  - Drill 5-8: 1px outline bone 30%, fyll transparent
  - Under hver sirkel: liten label "1 2 3 [4] 5 6 7 8" i JBM 10px

- **Pause/Avslutt-rad:**
  - To tertiary pull-tabs:
    - "Pause" med Lucide `Pause` ikon
    - "Avslutt økt" med Lucide `Square` ikon
  - Plassert helt nederst, 24-32px fra bunn
  - Geist 500 13px caps, color bone 70% alpha
  - Hover: full opacity + forest underline

---

## IPHONE 393×852 — SEKUNDÆR (raskeste tilgang)

Brukes når Øyvind har telefonen i lomma og ikke iPad-en. Knapper må være
**enda mer dominerende** fordi skjermen er liten.

### Layout

```
┌─────────────────────────────┐
│ ● LIVE · DRILL 4/8     ⌘   │ ← 44px topp
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  │ ← 3px progress
├─────────────────────────────┤
│                              │
│ DRILL 4                      │
│                              │
│ *150m mot*                   │ ← 40px IS italic
│ *smal grønn.*                │
│                              │
│ [CS70] [M2]                  │
│ [PR2]  [L-AUTO]              │
│                              │
│ *Slow-motion på drill 3.*    │
│ — Anders, 11:02              │
│                              │
├─────────────────────────────┤
│                              │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │          ✓              │ │
│ │      GODKJENT           │ │ ← 180-200px
│ │      slag 6 av 12       │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                              │
│         (16px gap)           │
│                              │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │          ✗              │ │
│ │       BOMMET            │ │ ← 180-200px
│ │      prøv igjen         │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                              │
├─────────────────────────────┤
│ 5/12 · 80% suksess           │
│ ● ● ○ ● ●                    │
│                              │
│ ● ● ● ◉ ○ ○ ○ ○              │
│                              │
│ [⏸ Pause]    [⏹ Avslutt]    │
└─────────────────────────────┘
```

### Spesifikt for iPhone

- **Topp-bar (44px):**
  - Live-prikk + kompakt eyebrow `LIVE · DRILL 4/8`
  - Tid kuttes — for trangt. Tap på eyebrow viser detalj
  - ⌘-ikon høyre topp (åpner full-screen handlings-overlay)
  - 3px progress under

- **Drill-hero:**
  - Eyebrow `DRILL 4` (Tiny 10px caps)
  - Drill-tittel: *150m mot smal grønn.* — IS italic 40px, line-height 1.05
    (bryter på to linjer er OK — det er DEN editorialen)
  - Tags-rad: wrap til 2x2 (CS70, M2 / PR2, L-AUTO)
  - Coach-marginalia: 13px italic, max-width 100%, 70% alpha

- **Action-knapper:**
  - **Stablet vertikalt** (GODKJENT øverst, BOMMET nederst)
  - Hver knapp: full bredde minus 16px padding på siden
  - Høyde **180px minimum** (heller 200px hvis plass)
  - 16px gap mellom
  - Ikon: 56px Lucide Check/X
  - Hovedtekst: Geist 500 28px caps tracking 0.05em
  - Sub-tekst: 13px

- **Meter-rad:**
  - Counter + suksess-rate på én linje, JBM 18-20px
  - Trail (5 sirkler 20px) under counter
  - Mini drill-progress: 8 sirkler 14px, JBM 9px labels under
  - Pause + Avslutt: to små tertiary-knapper, 50/50 split

- **Sticky topp + bunn:** drill-hero scroller hvis nødvendig, men action-
  knappene er ALLTID synlige (de er det viktigste)
- **Ingen sidebar, ingen tab-bar** — dette er en fokus-modus, alt skjules

---

## DESKTOP 1440×900 — TERTIÆR (coach read-only)

Desktop brukes nesten utelukkende av **coach** som vil se "hva spilleren
ser akkurat nå" på en stor skjerm. Read-only mode. Knappene vises men er
disabled-styled.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ● COACH-VISNING · ØYVIND R · LIVE · DRILL 4 AV 8       ⌘K     │ ← 48px
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────┬─────────────────────────────┐  │
│  │                             │                             │  │
│  │  DRILL 4                    │  ØKT-STATUS                 │  │
│  │  *150m mot smal grønn.*     │                             │  │
│  │                             │  TEK Approach 150-180m      │  │
│  │  [CS70] [M2] [PR2] [L-AUTO] │  38:14 / 75:00              │  │
│  │                             │  GFGK Range · pos 4         │  │
│  │  *Slow-motion på drill 3.*  │                             │  │
│  │  — Anders, 11:02            │  Slag i drill 4:            │  │
│  │                             │  5/12 · 80%                 │  │
│  │  ┌─────────┐  ┌─────────┐   │  ● ● ○ ● ●                  │  │
│  │  │   ✓     │  │   ✗     │   │                             │  │
│  │  │ GODKJ.  │  │ BOMMET  │   │  Drill-progresjon:          │  │
│  │  │ (disabled│  │(disabled│   │  ● ● ● ◉ ○ ○ ○ ○            │  │
│  │  └─────────┘  └─────────┘   │  3/8 ferdig                 │  │
│  │  *Read-only — vis kun*      │                             │  │
│  │                             │  [Send melding til Øyvind →]│  │
│  └─────────────────────────────┴─────────────────────────────┘  │
│                                                                   │
│  COACH-NOTAT (kun for deg, ikke synlig for Øyvind):              │
│  [textarea: "Hvordan ser drill 4 ut sammenlignet med drill 1?"] │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Spesifikt for desktop (coach read-only)

- **Eyebrow:** `COACH-VISNING · ØYVIND R · LIVE · DRILL 4 AV 8`
  - "COACH-VISNING" i lime for å skille fra spiller-vis
- **To-kolonne layout (8+4):**
  - Venstre 8-col: drill-hero + knapper (disabled, 50% opacity, ingen hover)
  - Høyre 4-col: økt-status-panel (data live-streaming)
- **Knapper:**
  - Vises i fullt design, men 50% opacity
  - Tooltip på hover: *"Read-only — Øyvind registrerer selv"*
  - Cursor: not-allowed
- **Coach-notat-felt (nederst):**
  - Textarea hvor coach kan skrive private notater
  - Lagres mot drillen, men vises ikke for Øyvind
- **Send melding-CTA** høyre kolonne:
  - Eneste interaktive knapp på siden for coach
  - Forest pull-tab
  - Åpner modal med tekstfelt + send-knapp

---

## ⌘K COMMAND PALETTE — kun essentielle handlinger

Live-modus har et **strippet** palette med kun det Øyvind kan tenke seg
midt i en drill. Ikke 20 kommandoer — bare 8-10.

```
┌─────────────────────────────────────────────────┐
│  *Hva trenger du nå?*                       ⌘K │
├─────────────────────────────────────────────────┤
│  ESSENSIELT                                     │
│  ▸ Marker forrige slag som godkjent             │
│  ▸ Marker forrige slag som bommet               │
│  ▸ Pause økten                                  │
│  ▸ Hopp til neste drill                         │
│  ▸ Avslutt økten                                │
│                                                 │
│  COACH                                          │
│  ▸ Be Anders se på dette slaget                 │
│  ▸ Spør Anders om instruks                      │
│                                                 │
│  AVANSERT                                       │
│  ▸ Slå av timer (rolig modus)                   │
│  ▸ Vis Trackman-data live                       │
└─────────────────────────────────────────────────┘
```

- Bakgrunn: rgba(15, 42, 34, 0.95) + backdrop-blur(16px)
- Tekst: bone
- Hover: bg forest 30%
- ↑↓ navigation, Enter aktiver, Esc lukk
- Søk-placeholder: italic *"Hva trenger du nå?"*

På iPhone erstattes ⌘K med ⌘-ikon (Lucide `Command`) som åpner samme liste
som full-screen overlay.

---

## INTERAKTIVITET — operativ, ikke koreografi

Live-modus skipper page-load-koreografien. Skjermen MÅ være umiddelbar.

- **Page-load:** ÉN fade-in (200ms) på hele frame. Ingen sekvensiell stagger
- **Knapp-press:** scale(0.97) + 100ms haptic-feel (CSS-only ok)
- **Etter registrering:**
  - Slag-counter teller opp (5 → 6 over 200ms)
  - Trail får ny sirkel fra venstre, gamle skyves
  - Suksess-rate oppdateres
  - Hvis siste slag i drillen: 800ms feedback-overlay (lime fade) + "Drill
    fullført" + auto-advance til neste drill
- **Live-prikk:** pulserende lime 2s loop (eneste motion på skjermen)
- **Drill 4-indikator:** pulserende lime glow (2s loop)
- **Timer:** count-up hver 1s i topp-bar (MM:SS)
- **Progress-bar:** glir frem hvert minutt (200ms ease-out)
- **Ingen toast, ingen modal-popups, ingen lyd**

`prefers-reduced-motion` slår av pulse-animasjoner og timer-tick fortsatt OK.

---

## OUTPUT-FORMAT

Lever **ÉN HTML-fil** med tre viewport-seksjoner stablet vertikalt. **Rekkefølgen
er omvendt fra dashboard-prompten** — iPad først fordi det er primær:

```html
<section class="device device--ipad">
  <header class="device-label">iPad · 1024 × 768 (landscape) — PRIMÆR</header>
  <div class="frame" style="width:1024px; height:768px; overflow:hidden;">
    <!-- iPad-layout, mørk gradient -->
  </div>
</section>

<section class="device device--iphone">
  <header class="device-label">iPhone 15 · 393 × 852 — SEKUNDÆR</header>
  <div class="frame" style="width:393px; min-height:852px; overflow:hidden;">
    <!-- iPhone-layout, mørk gradient -->
  </div>
</section>

<section class="device device--desktop">
  <header class="device-label">Desktop · 1440 × 900 — COACH READ-ONLY</header>
  <div class="frame" style="width:1440px; height:900px; overflow:hidden;">
    <!-- Desktop coach-visning -->
  </div>
</section>
```

Hver `device-label` er Tiny (10px Geist caps tracking 0.1em).
Hver `frame` har subtil 1px border + 4px radius for å antyde device-mockup.

Mellom hver seksjon: 96px luft + en hairline-separator med italic label
"*— iPhone-utgave —*" / "*— Coach read-only —*" centered.

Inkluder:
- Tailwind CDN inline
- Google Fonts CDN (Instrument Serif italic, Geist variable, JetBrains Mono)
- Lucide inline SVG (Check, X, Pause, Square, Command, ChevronRight,
  MessageCircle — kun det som faktisk brukes)
- CSS-variabler øverst (design.md seksjon 29) + dark-mode-overrides for
  denne skjermen
- Norsk locale gjennomgående
- Working tap/click på GODKJENT (iPad/iPhone) — counter går opp, trail
  oppdateres. Vis dette i en liten JS-handler.

---

## SJEKKLISTE FØR DU LEVERER

### Operativ kvalitet
- [ ] GODKJENT-knapp minst 180px høy på iPad og iPhone
- [ ] BOMMET-knapp minst 180px høy på iPad og iPhone
- [ ] Minst 16px luft mellom de to knappene
- [ ] Begge knapper umulig å bomme på (full visuell flate = touch-flate)
- [ ] iPhone har stablede knapper (vertikalt), iPad har side-ved-side
- [ ] Tap-feedback fungerer (scale 0.97 på press)

### Editorial-disiplin
- [ ] Italic Instrument Serif KUN på drill-tittel ("*150m mot smal grønn.*")
- [ ] Coach-marginalia italic, max ÉN gang på skjermen
- [ ] Ingen pull-quote, ingen photo, ingen kolofon (skjermen er funksjonell)
- [ ] Tiny eyebrows og JBM-tall fortsatt editorial-format

### Mørk modus
- [ ] Bakgrunn: linear-gradient forest-deep → forest (#0A1F17 → #163027)
- [ ] All tekst lesbar (kontrast ≥4.5:1)
- [ ] Lime som GODKJENT-aksent (eneste lime-flate)
- [ ] Destructive-rød som BOMMET (eneste rødflate)
- [ ] Tags har 30% alpha bakgrunn med full-farge tekst

### Data-realisme
- [ ] Drill 4 av 8 vist tydelig i progress + mini-indikator
- [ ] Slag 5/12 med 80% suksess
- [ ] Trail: ✓ ✓ ✗ ✓ ✓ (siste slag markert)
- [ ] Tags: CS70, M2, PR2, L-AUTO
- [ ] Coach-marginalia: "*Slow-motion på drill 3. Du svingte for hardt sist.*"
- [ ] Tid: 38:14 / 75:00, ~50% progress-bar

### Coach read-only (desktop)
- [ ] Knapper vises men er disabled (50% opacity, not-allowed cursor)
- [ ] Eyebrow markerer "COACH-VISNING" i lime
- [ ] Coach-notat-felt nederst
- [ ] Send-melding-CTA i sidekolonnen

### A11y
- [ ] Kontrast min 4.5:1 på all tekst (sjekk lime-tekst mot mørk bg)
- [ ] Knapper har aria-label ("Marker slag som godkjent" / "Marker slag som
      bommet")
- [ ] Focus-ring på knapper: 2px lime offset 2px (mot mørk bakgrunn)
- [ ] Pulse-animasjoner respekterer prefers-reduced-motion

### Anti-AI
- [ ] Skjermen ser ikke ut som en magasin-side — den er en kommandobro
- [ ] Knappene dominerer visuelt (≥40% av iPad-skjermhøyde)
- [ ] Ingen seksjon er "dekorativ" — alt har funksjon
- [ ] Coach-marginalia er en hvisken, ikke en banner

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som gjør live-modus operativt** — hva som skiller dette
   fra dashboard-skjermen og hva som gjør det umulig å bomme på
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
3. **Hva du er usikker på** — særlig: er knappene store nok i sollys? Er
   coach-marginalia for diskret eller akkurat passe?
