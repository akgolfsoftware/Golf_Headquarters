# AK Golf — Design System for Claude Design

> **Anvendelse:** Lim inn HELE denne filen i Claude Design **FØRST**, før du lager noen skjermer. Den etablerer brand, farger, fonter, komponenter og regler som ALLE påfølgende skjermer skal følge.

---

## 1. Produkt

**AK Golf** er en norsk golf-coaching-plattform med to produkter:

- **PlayerHQ** — for spillere som planlegger egen trening, ser fremgang, logger økter, kommuniserer med coach
- **CoachHQ** — for coacher som planlegger trening for spillere, ser stallen, godkjenner planer, analyserer fremgang

Begge produktene deler designsystem og samme komponenter. Hovedbrukerne er norske elite-junior-golfere (alder 13–20, HCP +5 til 15) og deres coacher.

**Tone:** Editorial, premium, sporty. Italic for empati. Mono for tall. Aldri "kult" eller "leken" — alltid målbevisst.

---

## 2. Brand-farger (semantic tokens)

Bruk ALLTID disse tokens, aldri hardkode hex.

```css
--bg: #FAFAF7;            /* cream paper — primary background */
--fg: #0A1F17;            /* deep forest — primary text */
--primary: #005840;       /* forest green — CTAs, sidebar, active states */
--accent: #D1F843;        /* lime — primary highlight, active state, lime CTA */
--card: #FFFFFF;          /* card background */
--border: #E5E3DD;        /* card borders, dividers */
--muted: #5E5C57;         /* secondary text, captions */
--danger: #A32D2D;        /* today-pin, warnings, errors */
--success: #2C7D52;       /* completed states, positive deltas */
--warning: #B8852A;       /* attention needed */
```

### Disciplin-farger (pyramide-balanse)

Disse 5 fargene er fundamentet i AK Golf — alle treningsøkter er kategorisert i én av disse:

```css
--fys: #1A4D2E;     /* FYS — fysisk trening */
--tek: #005840;     /* TEK — teknisk trening */
--slag: #2C7D52;    /* SLAG — slag-spesifikk trening */
--spill: #88B45A;   /* SPILL — spill-simulering */
--turn: #D1F843;    /* TURN — turnerings-spesifikk */
```

**Bruksregel:** Når du viser en treningsøkt, drill, eller statistikk knyttet til en disipplin, bruk discipline-fargen som accent (pill, ring, bar). Aldri som primary tekst.

---

## 3. Typografi

**4 Google Fonts** — last via `<link rel="stylesheet">`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Inter+Tight:wght@500;700&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

### Font-bruk

| Font | Bruk | Eksempler |
|---|---|---|
| **Inter Tight** | Display, hero, section headings | `"Min workbench"`, `"God morgen, Markus"`, `"Aktiv periode"` |
| **Inter** | UI body text, knapp-labels, beskrivelser | Body-tekst, button-tekst |
| **JetBrains Mono** | **ALLE tall**, eyebrows, timestamps, data-labels, mono-pills | `"+3,5"`, `"UKE 21"`, `"09:00"`, `"247 reps"` |
| **Instrument Serif** italic | **SPARSOMT** — kun på 1–2 utvalgte ord i hero for editorial accent | `Min *workbench*`, `Planlegg for *Markus R.P.*` |

**Regler:**
- Inter Tight er IKKE Inter. Inter Tight har strammere bokstavpassasje.
- Instrument Serif brukes KUN i hero-titler, ikke i body. Maks 1–2 ord per hero.
- ALLE tall (poenger, reps, dato, klokke) er JetBrains Mono.
- Norsk tallformat: `+3,5` (komma, ikke punktum). `47 250 kr` (mellomrom som tusenseparator).

---

## 4. Layout-tokens

### Border-radius

```css
--radius-card: 16px;     /* cards, panels */
--radius-button: 12px;   /* buttons, inputs */
--radius-pill: 999px;    /* pills, CTAs, status-chips */
--radius-tag: 6px;       /* small tags */
```

### Spacing (8-pt grid)

Bruk multipler av 8: `8px, 16px, 24px, 32px, 48px, 64px`.

- Padding i cards: 24px (medium), 32px (large)
- Gap mellom subkomponenter: 16px
- Gap mellom seksjoner: 32px
- Sidemargins på desktop: 32–48px

### Box-shadow

Subtilt, kun ved hover:

```css
box-shadow: 0 4px 12px rgba(10, 31, 23, 0.06);
```

Aldri tunge skygger.

---

## 5. Ikoner

**Bare inline SVG, ingen ikon-biblioteker, INGEN EMOJIER.**

- Stil: Lucide (https://lucide.dev)
- Stroke-width: `1.75` (ikke 2)
- Fill: `none`
- Stroke: `currentColor`
- Linecap/linejoin: `round`
- Default-størrelse: 16px (i tekst), 20px (knapper), 24px (cards), 40px (hero)

Eksempel:

```html
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
</svg>
```

**Forbudt:** ❌ 🏌️ 🎯 ⚡ — bruk SVG i stedet.

---

## 6. Komponenter (gjenbrukbare primitiver)

### 6.1 PageHeader (hero)

```html
<header>
  <!-- Eyebrow (JetBrains Mono, 11px, uppercase, letter-spacing 0.08em) -->
  <span class="eyebrow">MIN WORKBENCH · UKE 21 · 19—25 MAI</span>
  
  <!-- Title med italic accent på 1 ord -->
  <h1>Min <em>workbench</em> — bygg, juster, be om hjelp</h1>
  <!-- 
    h1 = Inter Tight 32px, weight 700, letter-spacing -0.02em
    em = Instrument Serif italic, same size, weight 400, color forest 
  -->
  
  <!-- Actions right -->
  <div class="actions">
    <button class="btn-primary">+ Ny økt</button>      <!-- lime fyll, dark text -->
    <button class="btn-forest">AI-foreslå</button>      <!-- forest bg, lime text -->
    <button class="btn-outline">Kalender</button>       <!-- white bg, border -->
  </div>
</header>
```

### 6.2 Discipline pill

```html
<span class="pill pill-slag">SLAG</span>
```

```css
.pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.pill-fys { background: rgba(26, 77, 46, 0.15); color: #1A4D2E; }
.pill-tek { background: rgba(0, 88, 64, 0.15); color: #005840; }
.pill-slag { background: rgba(44, 125, 82, 0.15); color: #2C7D52; }
.pill-spill { background: rgba(136, 180, 90, 0.15); color: #88B45A; }
.pill-turn { background: rgba(209, 248, 67, 0.30); color: #0A1F18; }
```

### 6.3 KpiCard

```html
<div class="kpi-card">
  <span class="kpi-label">HCP</span>      <!-- mono, uppercase, muted -->
  <div class="kpi-val">+3,5</div>          <!-- mono 28-42px, fg -->
  <div class="kpi-delta">↓ 0,4 / 90d</div> <!-- mono small, success or danger -->
</div>
```

### 6.4 Pyramide-bars (5 disipliner horizontal)

```html
<div class="pyramide-row">
  <span class="label">TUR</span>
  <div class="bar"><div class="fill" style="width:5%;background:var(--turn)"></div></div>
  <span class="value">5%</span>
</div>
<!-- ...repeat for SPILL, SLAG, TEK, FYS -->
```

### 6.5 Ring-progress (SVG)

```html
<svg width="80" height="80" viewBox="0 0 80 80">
  <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E3DD" stroke-width="6"/>
  <circle cx="40" cy="40" r="34" fill="none" stroke="#D1F843" stroke-width="6" 
          stroke-dasharray="160 213" stroke-dashoffset="0" 
          transform="rotate(-90 40 40)" stroke-linecap="round"/>
  <text x="40" y="46" text-anchor="middle" font-family="JetBrains Mono" font-size="20" font-weight="600" fill="#0A1F17">75%</text>
</svg>
```

### 6.6 Countdown-card

```html
<div class="countdown">
  <span class="label">SØRLANDSÅPENT</span>
  <div class="days">21<small> dager</small></div>
</div>
```

### 6.7 Goal-trackers

**Resultatmål (Outcome):**
```html
<div class="goal-card outcome">
  <span class="type-label">RESULTATMÅL</span>
  <h3>Top 10 NM Slag</h3>
  <!-- Ring-progress med sannsynlighet -->
  <div class="ring-with-text">
    <svg>...</svg>  <!-- 38% lime ring -->
    <p>50 dager · 38% sannsynlig</p>
  </div>
  <p class="italic">Du må forbedre approach +0,4 SG</p>
</div>
```

**Prosessmål (Process):**
```html
<div class="goal-card process">
  <span class="type-label">PROSESSMÅL</span>
  <h3>Snitt under 72 på Srixon</h3>
  <!-- Trend-graf -->
  <svg>...</svg>  <!-- linje-graf 12 punkter -->
  <div class="status">⬇ 71,4 · 5 av 7 under 72</div>
</div>
```

---

## 7. Knapper

```html
<button class="btn-primary">+ Ny økt</button>
<button class="btn-forest">AI-foreslå</button>
<button class="btn-outline">Kalender</button>
<button class="btn-ghost">Avbryt</button>
```

```css
.btn-primary {
  background: #D1F843;       /* lime */
  color: #0A1F17;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  border: 0;
}
.btn-forest {
  background: #005840;       /* forest */
  color: #D1F843;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  border: 0;
}
.btn-outline {
  background: #FFFFFF;
  color: #0A1F17;
  border: 1px solid #E5E3DD;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 500;
  font-size: 13px;
}
```

---

## 8. Sidebar (Linear-stil)

220px bred, forest bg `#005840`, lime accent på aktiv item:

```
┌──────────────────┐
│ AK GOLF          │ ← Inter Tight 13px, lime
│ PLAYERHQ · PRO   │ ← mono 10px, lime/0.6
├──────────────────┤
│ [MR] Markus R.P. │ ← profile-card med avatar
│ HCP +3,5 · A1    │
├──────────────────┤
│ HJEM             │ ← section label mono uppercase
│ Hjem             │
│ Varsler · 3      │
│                  │
│ TRENING          │
│ ▶ Planlegger     │ ← active: lime fyll, dark text
│ Kalender         │
│ Årsplan          │
│ Tester           │
│                  │
│ INNSIKT          │
│ Statistikk       │
│ Mål              │
│ Coach            │
└──────────────────┘
```

CoachHQ-versjonen har forest bg + samme struktur men nav-grupper: DAGLIG / OPERASJON / INNSIKT.

---

## 9. Topbar (56px)

```
┌─────────────────────────────────────────────────────────────┐
│   [⌘K Søk drill, plan eller mål...]    Trening / Workbench  │
└─────────────────────────────────────────────────────────────┘
```

- ⌘K søkefelt center-left (med kbd-tag for shortcut)
- Breadcrumb mono small høyre-side

---

## 10. Sticky footer (64px)

Workbench har sticky bunn-bar med:

- **Venstre:** "Min pyramide denne uka:" + 5 mini horisontale bars (FYS/TEK/SLAG/SPILL/TURN) med mono prosenter under
- **Senter:** Mono summary: `5 PLANLAGT · 1 FULLFØRT · 195 MIN · 67% PYRAMIDE`
- **Høyre:** 2 buttons — outline + primary lime

---

## 11. Norsk-konvensjoner

- All UI på norsk bokmål — æ, ø, å
- Tallformat: `+3,5` (komma desimal), `47 250 kr` (mellomrom tusen)
- Datoformat: `19. mai 2026` (eller kort `19/5`)
- Tid: 24h med kolon: `09:00`, `14:30`
- "Min" / "mine" for spiller-perspektiv
- "Spillere" / "send" for coach-perspektiv
- Diskipliner alltid uppercase: `FYS`, `TEK`, `SLAG`, `SPILL`, `TURN`

---

## 12. Personas og eksempel-data

Bruk **Markus Røinås Pedersen** som default-spiller:
- Navn: Markus Røinås Pedersen (kort: Markus R.P.)
- HCP: +3,5
- Kategori: A1 (elite junior)
- Klubb: GFGK (Gamle Fredrikstad Golfklubb)
- Alder: 16 år
- Hovedmål: Sørlandsåpent (10. juni, 21 dager unna), NM Slag (8. juli)

Coach: **Anders Kristiansen** — head coach AK Golf, 38 aktive spillere.

Andre eksempel-spillere: Joachim T. (+1,2), Emma S. (4,8), Øyvind R. (+3,5), Sigrid B. (8,2), Nora L. (12,4), Henrik V. (+0,4), Ida M. (3,1).

Eksempel-drills:
- Pitch 50-100m, lav trajectory (SLAG, 60 min, 184 reps)
- Iron-progresjon CS70→CS80 (TEK, 90 min, 240 reps)
- Putting 0-3m blokk (SLAG, 30 min, 100 reps)
- Bunker-eskalering (SLAG, 45 min, 80 reps)
- Driver grunntrening (TEK, 60 min, 120 reps)
- Beinbøy + core (FYS, 30 min)
- 9-hulls spillsimulering (SPILL, 90 min)
- Mental visualisering (TURN, 15 min)

---

## 13. Forbudt-liste (gjør IKKE)

- ❌ Emojier (alltid SVG i stedet)
- ❌ Engelsk i UI (alltid norsk bokmål)
- ❌ Hardkodede hex-farger (alltid tokens)
- ❌ Andre fonter enn de 4 angitte
- ❌ Tunge box-shadows
- ❌ Border-radius som ikke matcher 12/16/999/6
- ❌ Tall i Inter eller Inter Tight (alltid JetBrains Mono)
- ❌ Instrument Serif på mer enn 2 ord i samme hero
- ❌ "Kult" eller leken tone — alltid målbevisst

---

## 14. Standardstruktur for skjermer

Hver desktop-skjerm (1600×variable) skal ha:

1. **Sidebar 220px** venstre (Linear-stil, forest bg)
2. **Topbar 56px** øverst (⌘K + breadcrumb)
3. **Main content** (cream bg) — strukturert i seksjoner
4. **Sticky footer 64px** (hvit bg, top-border)

Hver mobil-skjerm (390×variable):
1. **Top bar 56px** (tilbake-pil + tittel + actions)
2. **Hovedinnhold** scrollable
3. **Bunn-nav eller sticky footer**

---

## Etter at du har lest dette: 

Når jeg sender en prompt for en skjerm, skal du:
1. Bruke **alle** tokens fra denne filen
2. Bruke `<link>` til Google Fonts som angitt
3. Inline alle SVG-ikoner (Lucide-stil)
4. Bruke eksempel-data fra seksjon 12
5. Følge Norsk-konvensjoner fra seksjon 11
6. Aldri bryte forbudt-listen i seksjon 13

Bekreft at du har lest dette ved å svare "AK Golf design system loaded. Klar for skjerm-prompt." — og vent på neste melding.
