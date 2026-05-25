# V2 Patterns — eksakt CSS per mønster

**Status:** Kanonisk referanse for migrasjon
**Live fasit:** `/design-system-v2` (intern rute)
**Komponent-kilde:** `src/components/v2/*`

Dette dokumentet definerer den nøyaktige CSS-utseendet til hvert V2-mønster.
Agenter under migrasjon MÅ sammenligne implementasjon mot dette dokumentet OG
mot live `/design-system-v2`-route.

---

## Spacing-regler (8pt-grid)

**TILLATT:** `p-2 (8px)`, `p-4 (16px)`, `p-6 (24px)`, `p-8 (32px)`, `p-10 (40px)`, `p-12 (48px)`, `p-16 (64px)`, `p-20 (80px)`, `p-24 (96px)`

**FORBUDT:** `p-3`, `p-5`, `p-7`, `p-9`, `p-11`, `p-13`...

Samme regel for `m-`, `gap-`, `space-y-`, `space-x-`, `gap-x-`, `gap-y-`.

For `w-` og `h-` på ikoner: bruk `size-X` der det er mulig (eks. `size-4` for 16px, `size-5` for 20px).

ESLint blokker bruk i `src/components/v2/**` + `src/app/(internal)/design-system-v2/**`.

---

## Farger — pyramide-pills (funksjonsbaserte)

For WCAG AA-kontrast (text-pyr-slag/lime feiler), bruker vi funksjonsbaserte tokens:

| Akse | Bakgrunn-class | Tekst-class | Pyramid-token (bare bg-fill) |
|---|---|---|---|
| FYS | `pill-fys` | inkludert | `--pyr-fys: #005840` |
| TEK | `pill-tek` | inkludert | `--pyr-tek: #B8852A` |
| SLAG | `pill-slag` | inkludert | `--pyr-slag: #2563EB` |
| SPILL | `pill-spill` | inkludert | `--pyr-spill: #D1F843` |
| TURN | `pill-turn` | inkludert | `--pyr-turn: #A32D2D` |

**Hvordan:** `<span className="pill pill-fys">FYS</span>`

**Tinted card-backgrounds:** Bruk `axis-FYS/axis-TEK/...` class. Disse bruker `color-mix(in oklab, ...)` for perseptuelt riktig farge.

```tsx
<div className="itin-card axis-FYS">FYS-økt</div>
```

---

## Typografi-mønstre

### Eyebrow (med lime accent-strek)
```tsx
<p className="v2-eyebrow v2-eyebrow-w-strek">
  PROGRAMMET I DAG
</p>
```

### Display-tall (KPI)
```tsx
<span className="font-display font-bold tabular-nums">
  {/* useCountUp-ref her */}
  47
</span>
```

**Størrelser:**
- Hero/countdown: `text-[120px]` md / `text-7xl` mobile
- KPI-hero-tile: `text-[64px]` md / `text-5xl` mobile
- Stats-compact: `text-3xl` (30px)
- HCP/SG inline: `text-base sm:text-lg`

### Section-tittel
```tsx
<h2 className="font-display text-3xl font-bold tracking-tight">
  Ukas progresjon
</h2>
```

---

## Animasjoner

| Klasse | Animasjon | Bruk |
|---|---|---|
| `.live-dot` | 1.4s pulse | LiveBar grønn prikk |
| `.itin-pulse` | 1.2s pulse | "Pågår nå"-pill prikk |
| `.now-dot` | 1.4s scale + box-shadow | Itinerary NÅ-markør |
| `.hcp-pulse` | 2s scale | HCP-trend-pil |
| `.grain` | static texture | Hero foto-overlay |
| `.lift` | 200ms hover-løft | Cards |
| `.pyr-bar-fill` | 1200ms width | Progress-bar fyll |

Alle respekterer `prefers-reduced-motion`.

---

## Card-mønstre

### Standard card (lys)
```tsx
<div className="card card-2xl lift bg-card border border-border p-6">
  ...
</div>
```

### Dark moment (countdown, highlight)
```tsx
<div className="card card-2xl bg-foreground text-background p-6 sm:p-8">
  <span className="text-accent">{/* 120px lime tall */}</span>
</div>
```

### Photo-hero
```tsx
<div ref={heroRef} className="relative overflow-hidden rounded-2xl shadow-xl min-h-[340px] md:min-h-[440px]">
  <Image src="/images/akgolf/AK-Golf-Academy-1.webp" fill priority className="object-cover" style={{ transform: "scale(var(--hero-scale, 1)) translateY(var(--hero-translate, 0))" }} />
  <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/20" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
  <div className="grain" />
  {/* Innhold */}
</div>
```

Parallax aktivert via `useHeroParallax(heroRef)`.

---

## Itinerary

### Layout
```
grid-template-columns: 76px 26px 1fr;
gap: 12px;
min-height: 96px (per row);
```

### Card med tinted bg
```tsx
<li className="itin-card axis-FYS lift rounded-2xl p-6">
  ...
</li>
```

### Active-state med accent ring
```tsx
<li className="itin-card axis-TEK is-active">
  {/* Får box-shadow ring */}
</li>
```

### NÅ-markør (stiplet rød linje)
```tsx
<NowLine label="Nå · 09:42" />
```

---

## Stat-tiles

### Hero variant
```tsx
<StatTile tile={{ label, value, unit, context, tone: "accent" }} hero />
```

Genererer:
- 64-80px tall
- 11px lime mono context-line
- Bredt format (col-span-2)

### Compact variant
```tsx
<StatTile tile={{ label, value, unit, context, tone: "default" }} compact />
```

Genererer:
- 30-40px tall
- Mindre context-line
- Smalt format (1 col)

### Tone-fargene
- `default` — muted-foreground
- `accent` — accent-foreground (lime tint)
- `warning` — warning (amber)
- `critical` — destructive (rød)

---

## Quick Actions

### Standard tile
```tsx
<QuickAction action={{ ..., tone: "default" }} />
```

Bg: `bg-card`, border: `border-border`, hover: `lift`

### Dark moment tile (highlight-action)
```tsx
<QuickAction action={{ ..., tone: "dark" }} />
```

Bg: `bg-foreground text-background`, accent-ikon: `bg-accent`

---

## AI Insights

3-type system med funksjonsbaserte farger:

| Type | Ikon-bg | Ikon-color | Type-badge | Bruk |
|---|---|---|---|---|
| HANDLING | `bg-accent` | `text-accent-foreground` | `bg-foreground text-background` | Mest aksjons-orientert |
| OBSERVASJON | `bg-info/15` | `text-info` | `bg-info/10 text-info` | Analytisk |
| MAAL | `bg-primary/10` | `text-primary` | `bg-primary/10 text-primary` | Langsiktig |

HANDLING får `lift` + `shadow-md` for visuell hierarki.

---

## Section-header (editorial divider)

```tsx
<SectionHeader
  eyebrow="Programmet i dag"
  title="I dag"
  description="5 økter planlagt — tidslinje fra 05:00 til 24:00."
  cta={{ label: "Full kalender", href: "/portal/kalender" }}
  ghostNum="01"  // Valgfri ghost-tall
/>
```

Anatomi:
- Lime accent-strek (h-px w-8 bg-accent) til venstre for eyebrow
- Ghost-tall (96px, opacity 0.05) bak headeren hvis `ghostNum` satt
- Spacing under: `mb-4` (mobile) / `mb-6` (desktop)

---

## LiveBar

```tsx
<LiveBar
  currentTime={9.7}
  nextSession={{ title: "TEK · Sving", startH: 11 }}
  weather={{ club: "GFGK", tempC: 14, summary: "sol", wind: "4 m/s ØNØ" }}
  critical={false}
/>
```

Layout:
- 32-40px høy, sticky topp
- bg-foreground, text-background
- Mono 11px tracking-[0.10em]
- Pulserende lime dot (`.live-dot`)
- Klokke ticker hvert sekund (via `useNowTime`)

Critical-state: bg-destructive + ekstra pulse hvis økt starter <30 min.

---

## Photo Divider (editorial mellomrom)

```tsx
<PhotoDivider
  image="/images/akgolf/AK-Golf-Academy-22.webp"
  stamp="Dag 147 · Uke 21 av 52"
  line="Sørlandsk vind. 14°C. Sol fra vest fram til 17:00."
/>
```

- 200-280px høy, full container-bredde
- Image object-cover + 30% dark overlay
- Stamp: mono uppercase 12px lime
- Line: Inter Tight italic 28-36px white

---

## Tournament Card (dark moment)

```tsx
<TournamentCard tournament={TOURNAMENT_NEXT} checklist={TOURNAMENT_CHECKLIST} />
```

- bg-foreground rounded-2xl shadow-xl
- Countdown: 220-280px desktop / 140-180px mobile, text-accent
- Tinted course-foto-bg (blurred opacity 0.15)
- CTA: bg-accent rounded-full pill

---

## Sjekkliste per V2-skjerm

Hver skjerm må verifiseres mot:

- [ ] Bruker `<ShellWrapper>` (ikke custom layout)
- [ ] `max-w-7xl space-y-10 lg:space-y-12` på page-wrapper
- [ ] `<SectionHeader>` mellom alle seksjoner
- [ ] Ingen `style={{...}}` med hardkodede hex (lint-blokert)
- [ ] Alle tokens fra `@/components/v2`
- [ ] Display-tall bruker `font-display tabular-nums`
- [ ] Eyebrows er mono 10px tracking-[0.14em]
- [ ] Pyramide-pills bruker funksjonsbaserte tokens
- [ ] Tinted bgs bruker `color-mix(in oklab, ...)` via `axis-*` class
- [ ] Dark moments er `bg-foreground text-background`
- [ ] Alle KPI-tall bruker `useCountUp`
- [ ] Progress-bars har stagger-fill animasjon
- [ ] Photo-heroer har parallax + grain
- [ ] Live-elementer har pulse-animasjon
- [ ] Itinerary-stil (ikke horizontal Gantt) der relevant
- [ ] Skjermen har minst 1 AK Golf Academy-foto
- [ ] Foto matcher tema (per PHOTO-ASSIGNMENT-MATRIX.md)
- [ ] Mobile (393px) + Desktop (1440px) verifisert
- [ ] `npx tsc --noEmit` passerer
- [ ] `npx eslint .` passerer

**20 punkter. Alle MÅ være ✓ før skjerm regnes som ferdig.**

---

## Versjonering

| Versjon | Dato | Endring |
|---|---|---|
| 1.0 | 2026-05-25 | Initial — Pre-Fase 1 dag 2 |

Endringer i dette dokumentet kreves Anders' godkjenning.
