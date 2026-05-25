# 02 — Design System

Komplett spec for tokens, fonter, spacing, radius, ikoner. Implementeres i `src/app/globals.css` + `tailwind.config.ts`.

---

## 1. Farger (24 semantic tokens)

### Hovedpalette (lys)

| Token | HEX | HSL | Bruk |
|---|---|---|---|
| `background` | `#FAFAF7` | `60 19% 97%` | Side-bakgrunn (varm cream) |
| `foreground` | `#0A1F17` | `157 47% 8%` | Primær tekst |
| `card` | `#FFFFFF` | `0 0% 100%` | Card-bakgrunn |
| `card-foreground` | `#0A1F17` | `157 47% 8%` | Tekst på card |
| `popover` | `#FFFFFF` | `0 0% 100%` | Popover, dropdown |
| `popover-foreground` | `#0A1F17` | `157 47% 8%` | Tekst i popover |
| `primary` | `#005840` | `157 100% 17%` | CTA-bakgrunn, primær handling |
| `primary-foreground` | `#D1F843` | `75 90% 63%` | Tekst på primary (lime accent) |
| `secondary` | `#F1EEE5` | `40 25% 92%` | Secondary buttons, chips |
| `secondary-foreground` | `#0A1F17` | `157 47% 8%` | Tekst på secondary |
| `muted` | `#F1EEE5` | `40 25% 92%` | Disabled, dempet bakgrunn |
| `muted-foreground` | `#5E5C57` | `40 5% 36%` | Sekundær tekst |
| `accent` | `#D1F843` | `75 90% 63%` | Highlight, badges |
| `accent-foreground` | `#005840` | `157 100% 17%` | Tekst på accent |
| `destructive` | `#A32D2D` | `0 57% 41%` | Slett, feil |
| `destructive-foreground` | `#FAFAF7` | `60 19% 97%` | Tekst på destructive |
| `border` | `#E5E3DD` | `40 13% 88%` | Borders |
| `input` | `#E0DDD6` | `40 11% 85%` | Form-input borders |
| `ring` | `#005840` | `157 100% 17%` | Focus ring |

### Status-farger

| Token | HEX | Bruk |
|---|---|---|
| `success` | `#1A7D56` | Suksess (grønn) |
| `success-foreground` | `#FAFAF7` | Tekst på success |
| `warning` | `#B8852A` | Advarsel (amber) |
| `warning-foreground` | `#0A1F17` | Tekst på warning |
| `info` | `#2563EB` | Informasjon (blå) |
| `info-foreground` | `#FAFAF7` | Tekst på info |

### Pyramide-akser (golf-spesifikk)

Plattformens 5-akse modell for treningskategorisering:

| Token | HEX | Akse | Beskrivelse |
|---|---|---|---|
| `pyr-fys` | `#005840` | FYS | Fysisk fundament (styrke, kondisjon, mobilitet) |
| `pyr-tek` | `#B8852A` | TEK | Teknikk (sving, kontakt, plane) |
| `pyr-slag` | `#2563EB` | SLAG | Slagspesifikk trening (pitch, putt, bunker) |
| `pyr-spill` | `#D1F843` | SPILL | Banespill (scoring, situasjoner) |
| `pyr-turn` | `#A32D2D` | TURN | Turnering (forberedelse, mental) |

### Chart-farger (data-viz)

| Token | HEX | Bruk |
|---|---|---|
| `chart-1` | `#005840` | Primær serie |
| `chart-2` | `#B8852A` | Sekundær serie |
| `chart-3` | `#2563EB` | Tertiær serie |
| `chart-4` | `#D1F843` | Highlight serie |
| `chart-5` | `#A32D2D` | Negativ serie |
| `chart-6` | `#5E5C57` | Benchmark serie |

### Dark mode (definert i kode, IKKE aktivert i første runde)

```css
.dark {
  --background: 157 47% 11%;    /* #0F2A22 — løftet forest */
  --card: 157 39% 14%;          /* #163027 — surface-lag */
  --foreground: 60 8% 96%;      /* #F5F4EE — varm hvit */
  --primary: 75 90% 63%;        /* #D1F843 — lime som primary */
  --primary-foreground: 157 47% 8%;  /* #0A1F17 */
  --accent: 75 90% 63%;
  --accent-foreground: 157 47% 8%;
  --border: 157 25% 22%;        /* #2B4F42 */
  /* ... resten av tokens */
}
```

**Note:** Dark mode bygges i kode (tokens finnes) men toggle er deaktivert i første runde. Aktiveres når light er stabilt.

---

## 2. Typografi (3 fonter — kun disse, ingen flere)

### Fonter

| Font | Vekt | Bruk | Lasting |
|---|---|---|---|
| **Inter** | 400-700 variable | UI, body (14-16px) | `next/font/google` |
| **Inter Tight** | 400-700 (+ italic) | Headings, display, hero | `next/font/google` |
| **JetBrains Mono** | 400-700 | Tall, eyebrows, kode | `next/font/google` |

**CSS-variabler:**
```css
--font-inter: 'Inter', system-ui, sans-serif
--font-inter-tight: 'Inter Tight', system-ui, sans-serif
--font-jetbrains-mono: 'JetBrains Mono', ui-monospace, monospace
```

**Tailwind-klasser:**
```css
font-sans (default → Inter)
font-display (Inter Tight)
font-mono (JetBrains Mono)
```

### Typografi-skala

| Klasse | Størrelse | Bruk |
|---|---|---|
| `text-xs` | 12px | Helper-tekst, micro-eyebrows |
| `text-sm` | 14px | Body small, table-tekst |
| `text-base` | 16px | Default body |
| `text-lg` | 18px | Card-titler |
| `text-xl` | 20px | Section-titler |
| `text-2xl` | 24px | Hero på mobile |
| `text-3xl` | 30px | Section-headers |
| `text-4xl` | 36px | Hero på desktop |
| `text-5xl` | 48px | Display 1 |
| `text-6xl` | 60px | Display 2 (editorial luxury) |
| `text-7xl` | 72px | Display 3 (countdown-tall) |

### Eyebrow-stil (UPPERCASE mono)

```css
font-family: var(--font-jetbrains-mono);
font-size: 10px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.10em;
color: var(--color-muted-foreground);
```

Brukes som "etikett over tittel" på alle dashboards.

### Italic accent (luxury editorial)

For hero-titler:
```css
font-family: var(--font-inter-tight);
font-style: italic;
font-weight: 700;
color: var(--color-primary);
```

Eksempel: `Hei, **Markus**.` med "Markus" i italic primary.

### Tabular numbers

For alle tall (HCP, SG, distanse, score):
```css
font-family: var(--font-jetbrains-mono);
font-variant-numeric: tabular-nums;
```

---

## 3. Border radius

| Verdi | Klasse | Bruk |
|---|---|---|
| 8px | `rounded-sm` | Badges, tags, små pills |
| 12px | `rounded-md` | Buttons, inputs |
| 16px | `rounded-lg` | Cards, panels |
| 20px | `rounded-xl` | Modaler, hero-cards |
| 24px | `rounded-2xl` | Fullscreen-elementer |
| 999px | `rounded-full` | Pills, CTAs, avatarer |

---

## 4. Spacing (8pt-grid)

**Tillatt:**
```
0   →  p-0
8px →  p-2
16px → p-4
24px → p-6
32px → p-8
40px → p-10
48px → p-12
64px → p-16
80px → p-20
96px → p-24
128px → p-32
```

**Forbudt (ikke 8pt-aligned):**
```
4px, 12px, 20px, 28px, 36px, 44px, 52px ...
→ p-1, p-3, p-5, p-7, p-9, p-11, p-13 ...
```

Samme regel for `m-`, `gap-`, `space-y-`, `w-`, `h-`.

---

## 5. Ikoner

**Bibliotek:** `lucide-react` (eneste tillatte)

**Standard-størrelser:**
- 16px (i tekst inline)
- 20px (button-ikoner)
- 24px (page-ikoner)
- 32px (hero-ikoner)
- 40px (feature-ikoner i empty-state)

**Stroke-width:** 1.5 (default) eller 1.75 (for tyngre vekt)

**Farge:** alltid `currentColor` — aldri hardkodet

**Forbudt:**
- Emojier 🚀⛳🏌️ → bruk Lucide-ikoner i stedet
- Heroicons
- Phosphor Icons
- Egne SVG-ikoner (bare hvis Lucide ikke har det vi trenger)

---

## 6. Shadows

```css
shadow-sm: 0 1px 2px rgba(10, 31, 23, 0.05)
shadow:    0 1px 3px rgba(10, 31, 23, 0.08), 0 1px 2px rgba(10, 31, 23, 0.04)
shadow-md: 0 4px 12px -2px rgba(10, 31, 23, 0.08), 0 2px 4px -1px rgba(10, 31, 23, 0.05)
shadow-lg: 0 12px 28px -8px rgba(10, 31, 23, 0.10), 0 2px 4px rgba(10, 31, 23, 0.05)
```

**Bruk subtilt** — vi er ikke en sport-app med fete drop-shadows.

---

## 7. Z-index lag

| Lag | Z-index | Bruk |
|---|---|---|
| Background | 0 | Default content |
| Floating | 10 | Tooltips, popovers |
| Sticky | 20 | Sticky headers, sticky CTAs |
| Sidebar | 30 | Sidebar (mobile sheet) |
| Topbar | 40 | Sticky topbar |
| Modal-backdrop | 50 | Modal overlay |
| Modal | 60 | Modal content |
| Toast | 70 | Toast-notifikasjoner |
| Tooltip | 80 | Tooltips på toppen av modaler |

---

## 8. Breakpoints

```css
sm: 640px   (small tablets, large phones)
md: 768px   (tablets portrait)
lg: 1024px  (tablets landscape, small laptops)
xl: 1280px  (desktop)
2xl: 1536px (large desktop)
```

**Mobile-first** approach. Default styles for mobile (393px), `md:` for tablet, `lg:` + `xl:` for desktop.

---

## 9. Container-bredder

| Tilstand | Max-width | Bruk |
|---|---|---|
| Forms | 768px (max-w-2xl) | Skjemaer, wizards |
| Detail-sider | 1024px (max-w-5xl) | Spiller-detalj, plan-detalj |
| Hub-sider | 1280px (max-w-7xl) | Dashboards |
| Marketing | 1440px | Forside, om-oss |
| Full | none | Fullscreen modus |

---

## 10. Mønstre (athletic editorial)

### Photo-hero (PlayerHeroImage-mønster)

```tsx
<div className="relative overflow-hidden rounded-2xl shadow-xl min-h-[340px] md:min-h-[440px]">
  <Image
    src="/images/akgolf/AK-Golf-Academy-1.webp"
    alt=""
    fill
    priority
    sizes="(max-width: 768px) 100vw, 1280px"
    className="object-cover"
  />
  {/* To gradients gir best tekst-lesbarhet uten å overskygge fotoet */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/20" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

  <div className="relative flex h-full min-h-[340px] flex-col justify-between p-6 md:min-h-[440px] md:p-12">
    {/* Top-rad: tier-pill + avatar */}
    {/* Bunn: italic hilsen + meta-rad */}
  </div>
</div>
```

**Fotoer:** `/public/images/akgolf/AK-Golf-Academy-{1-44}.webp` (manglende: 36, 37, 41)
- Bilde 1: lavt-vinkel swing (default for PlayerHQ-hjem)
- Bilde 2, 7: coach-profil-egnede
- Bilde 44: drill-bibliotek hero

### Dark moment (NextTournamentCountdown-mønster)

Selektivt mørke cards som gir dramatisk kontrast mot lys cream-bg.

```tsx
<section className="rounded-2xl bg-foreground p-6 text-background shadow-xl sm:p-8">
  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
    NESTE TURNERING
  </p>
  <h3 className="font-display text-2xl font-bold sm:text-3xl">Sørlandsåpent</h3>
  <p className="mt-2 text-sm text-background/70">
    28 – 30. mai · GFGK · 54-hull
  </p>

  {/* 120px countdown */}
  <div className="my-6 border-y border-background/15 py-6">
    <span className="font-display text-[80px] sm:text-[120px] font-bold leading-[0.85] tabular-nums text-accent">
      21
    </span>
    <span className="font-mono text-xs uppercase tracking-[0.12em] text-background/60">
      dager igjen
    </span>
  </div>

  {/* CTA-pill med lime accent */}
  <Link className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.08em] text-accent-foreground sm:w-auto">
    Se turnering →
  </Link>
</section>
```

**Regel:** Max 2 dark moments per skjerm. Mer tipper balansen.

### Editorial section divider (SectionHeader)

```tsx
<header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
  <div className="space-y-2">
    {/* Lime accent-strek + eyebrow */}
    <div className="flex items-center gap-2.5">
      <span className="h-px w-8 bg-accent" />
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        Programmet i dag
      </p>
    </div>
    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      I dag
    </h2>
    <p className="max-w-prose text-sm text-muted-foreground">
      5 økter planlagt — tidslinje fra 05:00 til 24:00.
    </p>
  </div>
  <Link className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.10em]">
    Full kalender →
  </Link>
</header>
```

### Stat-tile (KPI-grid)

```tsx
<div className="flex flex-col gap-2 rounded-xl border border-border bg-background/50 p-4">
  <div className="flex items-center justify-between gap-2">
    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      Økter
    </span>
    <Activity className="size-4 text-muted-foreground" />
  </div>
  <div className="flex items-baseline gap-1.5">
    <span className="font-display text-3xl font-bold tabular-nums">4</span>
    <span className="font-mono text-xs text-muted-foreground">/6t</span>
  </div>
</div>
```

---

## 11. Pyramide-pills — funksjonsbaserte farger (oppdatert)

For pills som indikerer pyramide-akse (Calendar, TrainingPartners, AI-Insights), bruk **funksjonsbaserte tokens** (ikke pyr-*-tokens), fordi pyr-slag (lime) feiler WCAG AA-kontrast som tekst på hvit:

| Akse | Pill-styling | Hvorfor |
|---|---|---|
| FYS | `bg-primary/10 text-primary` | Forest grønn = fysisk fundament |
| TEK | `bg-warning/10 text-warning` | Amber = teknikk (nøyaktighet) |
| SLAG | `bg-info/10 text-info` | Blå = slag (analytisk) |
| SPILL | `bg-accent/30 text-accent-foreground` | Lime tint + forest tekst |
| TURN | `bg-destructive/10 text-destructive` | Rød = konkurranse-intensitet |

**pyr-*-tokens beholdes** men brukes kun til bg-fill (progress-bars, charts, calendar-blokker), aldri som tekst-color.

---

## 12. Reglene som ALDRI brytes

1. ❌ Ingen hardkodede hex-farger i kode (alltid token)
2. ❌ Ingen emojier i UI
3. ❌ Ingen "AK GOLF"-tekst i sidebar (bruk `<SidebarBrand>`)
4. ❌ Ingen 4. font (kun Inter/Inter Tight/JetBrains Mono)
5. ❌ Ingen `p-3`, `p-5`, `p-7` (8pt-grid only)
6. ❌ Ingen Heroicons/Phosphor (bare Lucide)
7. ❌ Ingen blå-rød kontrast som spiller fargevarsel (vi har semantiske status-tokens)
8. ❌ Ingen utropstegn i UI-tekst
9. ❌ Ingen all-caps-ord lengre enn 20 tegn
10. ❌ Ingen "ae", "oe", "aa" — bruk æ, ø, å
