# AK Golf Platform — Designsystem v2 (Sprint 0 Foundation)

**Sannhetskilde-hierarki (ved konflikt vinner høyeste):**
1. `wireframe/brain/desktop-import/branding-style-guide.html` — visuell rendering av alle tokens
2. `wireframe/brain/desktop-import/design-system.md` — tekstuell tokens-spec (Sprint 0)
3. `src/app/globals.css` — implementert i kode
4. Dette dokumentet — kondensert for Claude Code-bruk

> **Heritage Grid (M3) er DEPRECATED.** Forbudte legacy tokens listet nederst skal IKKE brukes i nye design.

---

## For claude.ai/design

**Last opp DENNE filen i Claude Design som visuell systemreferanse:**

```
wireframe/brain/desktop-import/branding-style-guide.html
```

Den er en interaktiv 61 KB HTML med ALLE tokens visuelt rendret: farge-swatches, typografi-spesimener, knapp-varianter, kort-hierarki, sidebar-mockups, motion-eksempler. Dette er den BESTE referansen for Claude Design — bedre enn ren tekst.

Denne `.md`-fila brukes som tekstlig backup-spec hvis HTML ikke leses skikkelig.

---

## 1. Identitet — designretning per overflate

| Overflate | Bakgrunn | Accent | Feel |
|---|---|---|---|
| **PlayerHQ** | Lys (`#FAFAF7`) | Lime bold (`#D1F843`) | Premium fitness |
| **CoachHQ** | Lys (`#FAFAF7`) | Strukturert (sjelden lime) | Profesjonell |
| **Landing** | Mørk hero (`#0A0A0A`) | Lime CTA | Editorial |

---

## 2. Fargesystem — komplett tokens-liste

### Brand

| Token | Verdi | Bruk |
|---|---|---|
| `--color-primary` | `#005840` | Skogsgrønn, primær brand. CTA-bg, sidebar-stripe (PlayerHQ active) |
| `--color-primary-hover` | `#00472f` | Hover på primary |
| `--color-primary-soft` | `#E8F0EC` | Subtil primary-bg (tinted surface) |
| `--color-primary-deep` | `#003B2A` | Deeper primary (rare emphasis) |

### Accent (lime)

| Token | Verdi | Bruk |
|---|---|---|
| `--color-accent` | `#D1F843` | High-energy lime. CTA-knapper, active pills, streak-prikk i dag |
| `--color-accent-hover` | `#C2EE2F` | Hover på accent |
| `--color-accent-on` | `#0A1F18` | Tekst PÅ lime-bg (mørk grønn, IKKE svart) |
| `--color-accent-bg` | `rgba(209,248,67,0.12)` | Featured kort-bakgrunn |
| `--color-accent-fill` | `rgba(209,248,67,0.25)` | Progress-bar-fill, gradient |
| `--color-accent-soft` | `#ECFCC0` | Subtile accent-bokser, accent-pill-bg |

### Surface (varm krem)

| Token | Verdi | Bruk |
|---|---|---|
| `--color-surface` | `#FAFAF7` | Hovedflate (varm off-white) |
| `--color-surface-alt` | `#F5F2EA` | Differensierte seksjoner (sand) |
| `--color-card` | `#FFFFFF` | Card-bakgrunn |

### Tekst (Ink — varmere grå-toner)

| Token | Verdi | Bruk |
|---|---|---|
| `--color-ink` | `#0A1F18` | Primærtekst (grønn-svart) |
| `--color-ink-muted` | `#5E5C57` | Sekundærtekst |
| `--color-ink-subtle` | `#9C9990` | Tertiærtekst (labels, captions) |
| `--color-ink-disabled` | `#C4C0B8` | Disabled state |

### Borders (varmere)

| Token | Verdi | Bruk |
|---|---|---|
| `--color-line` | `#E5E3DD` | Standard borders |
| `--color-line-soft` | `#EFEDE6` | Subtile dividere |

### Status (raffinert)

| Token | Verdi | Bruk |
|---|---|---|
| `--color-success` | `#1A7D56` | Suksess-tekst |
| `--color-success-bg` | `#E5F1EA` | Suksess-pill-bg |
| `--color-warning` | `#B8852A` | Advarsel-tekst |
| `--color-warning-bg` | `#FFF0D6` | Advarsel-pill-bg |
| `--color-danger` | `#A32D2D` | Feil-tekst |
| `--color-danger-bg` | `#FAE3E3` | Feil-pill-bg |

### Sidebar-spesifikke

| Token | Verdi | Bruk |
|---|---|---|
| `--player-sidebar-bg` | `#FFFFFF` | PlayerHQ sidebar (LYS, ikke mørk) |
| `--player-sidebar-border` | `#F0EDE5` | PlayerHQ sidebar høyre-border |
| `--player-sidebar-active` | `rgba(0,88,64,0.08)` | PlayerHQ active item-bg |
| `--coach-rail-bg` | `#061210` | CoachHQ smal venstre-rail (mørk) |
| `--coach-nav-bg` | `#FAFAF7` | CoachHQ nav-kolonne (lys) |
| `--coach-nav-active` | `rgba(209,248,67,0.30)` | CoachHQ active item-bg (lime tint) |

> **VIKTIG KORREKSJON:** PlayerHQ sidebar er LYS (#FFFFFF), ikke mørk (#0A1F18) som tidligere antatt. CoachHQ har TO-LAGS struktur: smal mørk rail (56px) + lys nav-kolonne (200px).

### Landing

| Token | Verdi | Bruk |
|---|---|---|
| `--landing-hero-bg` | `#0A0A0A` | Mørk landing hero |
| `--landing-hero-text` | `#FFFFFF` | Hvit tekst på hero |

### Pyramide-farger (offisielle AK Golf)

Brukes i pyramide-ringer og pyramide-progress-bars (FYS / TEK / SLAG / SPILL / TURN).

| Token | Verdi | Lag |
|---|---|---|
| `--color-pyr-fys` | `#005840` | FYS (fysisk fundament) |
| `--color-pyr-tek` | `#1A7D56` | TEK (teknikk) |
| `--color-pyr-slag` | `#D1F843` | SLAG (slagprogresjon) |
| `--color-pyr-spill` | `#B8852A` | SPILL (banespill) |
| `--color-pyr-turn` | `#5E5C57` | TURN (turnering) |

---

## 3. Typografi

| Bruk | Font | CSS-variabel | Størrelse | Tracking |
|---|---|---|---|---|
| **Hero-greeting** | Inter Tight italic | `--font-inter-tight` | 36px | -0.02em |
| **Seksjonstittler** | Inter Tight bold | `--font-inter-tight` | 24px | -0.01em |
| **Subhead** | Inter Tight semibold | `--font-inter-tight` | 18px | -0.01em |
| **KPI-tall** | JetBrains Mono medium | `--font-jetbrains-mono` | 32–48px | tabular-nums |
| **Body** | Inter regular | `--font-inter` | 15px | 0 |
| **Caption** | Inter regular | `--font-inter` | 13px | 0 |
| **Labels** | Inter medium uppercase | `--font-inter` | 12px | 0.04em |

**Regler:**
- Italic Inter Tight er editorial luxury-feel — **maks 1 italic-element per skjerm**
- JetBrains Mono har `font-variant-numeric: tabular-nums`
- Body line-height: 1.6. Headings line-height: 1.2.

---

## 4. Spacing — 8pt-grid

Alle spacing skal være multipler av 8px.

**Tillatt (Tailwind v4):** `p-2 (8), p-4 (16), p-6 (24), p-8 (32), p-10 (40), p-12 (48), p-16 (64)`

**Unngå:** `p-1 (4), p-3 (12), p-5 (20), p-7 (28), p-9 (36)` (med mindre tett ikon-gruppe — 4px og 12px tillates da)

Generøs spacing mellom seksjoner (48–64px). Stram spacing inni kort (16–20px).

---

## 5. Border radius

| Token | Verdi | Bruk |
|---|---|---|
| `--radius-card` | **20px** | Standard kort (NB: 20px, ikke 16px) |
| `--radius-sidebar-pill` | 12px | Sidebar nav pills |
| `--radius-button` | 12px | Knapper |
| `--radius-input` | 10px | Inputfelter |
| `rounded-full` | 9999px | Pills, avatars, prikker, status-badges |

---

## 6. Shadows

| Token | Verdi | Bruk |
|---|---|---|
| `shadow-card` | `0 1px 2px rgba(15,31,24,0.04), 0 4px 12px rgba(15,31,24,0.04)` | Standard kort |
| `shadow-card-hover` | `0 1px 2px rgba(15,31,24,0.06), 0 14px 32px rgba(15,31,24,0.08)` | Kort hover |
| `shadow-rim` | `inset 0 0 0 1px rgba(15,31,24,0.06)` | Subtil indre kant (alternativ til border) |
| `shadow-accent-glow` | `0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)` | Accent CTA-fokus |

---

## 7. Ikoner

**Kun `lucide-react`.** Ingen Heroicons, Phosphor, FontAwesome.

| Størrelse | Tailwind | Bruk |
|---|---|---|
| 18px | `w-4.5 h-4.5` | Standard |
| 20px | `w-5 h-5` | Headers |
| 24px | `w-6 h-6` | Hero / empty-states |

**Stroke-bredde:** `1.75` (lettere enn default 2). Linje-caps: round. Farge: `currentColor`.

---

## 8. Kort-hierarki (3 nivåer)

| Nivå | Bg | Border | Radius | Shadow |
|---|---|---|---|---|
| **Flush** | transparent | ingen | — | ingen |
| **Standard** | hvit | 1px `--color-line` | 20px | `shadow-card` |
| **Featured** | `--color-accent-bg` | 1px `--color-line` | 20px | `shadow-card-hover` |

**Maks 1 Featured kort per seksjon.**

---

## 9. Lime-bruk (kritisk)

**JA:** CTA-knapper, active pills, streak-prikker dagens dag, progress-fill, positive delta-verdier (+2,3)
**NEI:** Store bakgrunnsflater, tekst-farge, alle badges, gradienter med lime, ikoner i lime
**Maks 3 lime-elementer synlige samtidig per skjerm.**

---

## 10. Motion

| Type | Verdi |
|---|---|
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out) |
| Mikro | 120ms (hover, micro) |
| Kort | 200ms (state change) |
| Stor | 320ms (entrance, layout) |

**Aldri bounce/spring.** Respekter `prefers-reduced-motion`.

---

## 11. Fotografi

- Golfbane i **desaturert varm tone** (ikke fargemettet)
- Glassmorfisk overlay over foto, **aldri frittstående**
- Landing hero: foto + mørk overlay 0.65 opacity

---

## 12. UX-konvensjoner (norsk-spesifikt)

- **Språk:** Norsk bokmål med æ, ø, å overalt
- **Desimaltegn:** komma — `78,5`
- **Dato:** «7. mai 2026» (lang) eller `07.05.26` (kort)
- **Tidsformat:** 24-timer — `14:00`
- **Brøker over prosent:** «12/16 økter» heller enn «75 %»
- **Ingen emojier** — bruk lucide-ikoner

---

## 13. Anti-AI-regler (skal følges av Claude Design)

1. Flat avatar-farger (ingen gradienter)
2. Asymmetriske grid-layouts (ikke uniform 3×1 / 4×1)
3. Ingen `translateY(-3px)` hover på alt
4. Maks 1–2 eyebrows per skjerm
5. Variert seksjonslayout på landing
6. Redusert pill-tetthet (ikke pille-spam)
7. Ingen ambient-glow dekorasjoner
8. Sterkere typografisk kontrast mellom nivåer
9. ALDRI "Welcome back, [Name]!" — bruk italic editorial greeting

---

## 14. Komponenter — eksisterende vs manglende

### Allerede implementert (Sprint 0)
- `HcpTrendChart` (SVG linjegraf)
- `SgRadarChart` (4-akset radar)
- `PyramideRinger` (5 treningsbuer FYS/TEK/SLAG/SPILL/TURN)
- `MetricCard` (KPI med delta)
- `SessionCard` (økt med pyramide-stripe)
- `WeekPills` (W1–W6 navigasjon)
- `StreakGrid` (14/30-dagers prikker)

### Mangler (planlagt — se `desktop-import/2026-05-10-component-library.md`)

**Kalender (5):** AkCalendar, MonthView, WeekView, DayView, YearView
**Statistikk (5):** SgBarChart, ScoreDistribution, ComparisonBar, PercentilDial, RoundSummaryCard
**Treningsdata (4):** ComplianceChart, PeriodizationTimeline, DrillProgressCard, TrainingVolumeChart
**Coaching (2):** PlayerTimeline, SignalBadge

Når en design-pakke trenger en av disse manglende komponentene, peker pakken til komponent-spec i `desktop-import/`.

---

## 15. Tier-system (PlayerHQ)

| Tier | Farge-aksent | Bruk |
|---|---|---|
| **Gratis** | Nøytral grå (`#9C9990`) | Default. Kun grunnleggende features |
| **Pro** | Primary grønn (`#005840`) | Mest vanlige betalende |
| **Elite** | Accent lime (`#D1F843`) | Topp-tier |

**Tier-gating-mønster:** Locked features vises som dempet (40% opacity) med lucide `Lock` og CTA "Oppgrader til {Pro/Elite}".

---

## 16. Forbudte legacy tokens (Heritage Grid M3 — DEPRECATED)

| Forbudt | Erstatning |
|---|---|
| `#154212` (Heritage primary) | `#005840` |
| `#d2f000` (Heritage accent) | `#D1F843` |
| `#fdf9f0` (Heritage surface) | `#FAFAF7` |
| `#1c1c16` (Heritage on-surface) | `#0A1F18` |
| DM Sans | Inter / Inter Tight |
| Material Symbols | lucide-react |
| `--hg-*` tokens | (fjernet) |
| `--color-portal-*` tokens | (fjernet) |

Hvis Claude Design forsøker å bruke noen av disse, AVVIS og bruk erstatningen.

---

## Bruksanvisning for Claude Design

Per session:
1. **Last opp `branding-style-guide.html`** som primær systemreferanse
2. **Last opp denne fila** som tekstlig backup
3. Bekreft at Claude har lest begge før du sender første skjerm-pakke
4. Per skjerm-pakke: følg `wireframe/design-prompt-template.md`
