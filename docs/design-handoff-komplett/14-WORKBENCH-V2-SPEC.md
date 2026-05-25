# 14 — Workbench v2 (PlayerHQ-hjem) — kanonisk eksempel

**Live på:** `https://akgolf.no/portal`
**Kildekode:** `src/app/portal/page.tsx` + `src/components/portal/workbench/*`

Dette er **den autoritative implementeringen** av athletic editorial. Alle nye skjermer skal kunne sammenlignes mot denne for konsistens-sjekk.

---

## Skjerm-anatomi (top-down)

### 1. Hero — PlayerHeroImage

```
┌──────────────────────────────────────────────────────────────┐
│  [AK Golf Academy-foto som bakgrunn, dark gradient overlay]   │
│                                                                │
│  ▣ PRO  ◦ PLAYERHQ · SESONG 2026                  ⬤ avatar    │
│                                                                │
│                                                                │
│                                                                │
│  Hei, Øyvind.                                                 │
│       ^italic lime                                            │
│                                                                │
│  A1 · HCP -2.1 ↑+0.3 · 21 dager til Sørlandsåpent             │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                            340px mobile / 440px desktop
```

**Spec:**
- `imageId={1}` (lavt-vinkel swing) som default
- `rounded-2xl shadow-xl`
- Top-rad høyrejustert: avatar 56/64px, lime border-2
- Hilsen: `font-display text-4xl md:text-6xl font-bold` + italic på fornavn med `text-accent`
- Meta-rad: `font-mono text-[11px] md:text-xs uppercase tracking-[0.10em] text-white/80`
- Tall: `font-mono text-base md:text-lg font-bold tabular-nums text-white`
- Tournament-countdown: `text-accent` på tall
- HCP-trend: ChevronUp/Down/Minus med fargekode (accent positiv / destructive negativ)

### 2. Section: I dag (Calendar)

```
─ PROGRAMMET I DAG ──────────────────────────────────  [Full kalender →]
I dag
5 økter planlagt — tidslinje fra 05:00 til 24:00.

┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│05│06│07│08│09│10│11│12│13│14│15│16│17│18│19│20│21│22│23│
├──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┤
│   ▌07:00            NÅ 09:42                              │
│   ▌FYS-økt          ▌                                     │
│       ▌08:30        ▌                                     │
│       ▌TEK-trening  ▌    ▌11:00  Putting-fokus            │
└────────────────────────────────────────────────────────────┘
```

**Spec:** Se `src/components/portal/workbench/calendar-widget.tsx`
- Pyramide-fargede øktblokker med 4px venstre-stripe
- "NÅ"-markør med destructive (rød) farge
- Hover-popover med detaljer + actions

### 3. Section: AI-Innsikt (3-grid)

```
─ FRA CADDIE ─────────────────────────────────────────────────
AI-innsikt
Tre observasjoner basert på siste 30 dager.

┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ ⬜lime         HANDLING│ │ ⬜blå        OBSERVASJON│ │ ⬜forest          MÅL│
│                     │ │                     │ │                     │
│ PUTTING-FOKUS       │ │ SVING-TEMPO         │ │ MÅL Q2              │
│                     │ │                     │ │                     │
│ Du har ikke trent   │ │ TrackMan viser at   │ │ Du ligger 60% mot   │
│ putting siste 10    │ │ tempo har gått fra  │ │ målet HCP -2.5 før  │
│ dager. Plan sier... │ │ 3.0 til 2.7...      │ │ sesongstart...      │
│                     │ │                     │ │                     │
│ Bestill økt →       │ │ Se detaljer →       │ │ Se mål →            │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

**Spec:** Se `src/components/portal/workbench/ai-insights-row.tsx`
- HANDLING-card kan ha `border-foreground/15 shadow-md` (subtil løft)
- Type-badge på topp-høyre
- Body: `font-display text-[17px] font-medium leading-[1.45]`

### 4. Section: Ukas progresjon

```
─ STATUS SISTE 7 DAGER ───────────────────────────  [Se analyse →]
Ukas progresjon
Hvordan tida er fordelt mellom pyramide-aksene + summering.

┌────────────────────────────────────┬───────────────────┐
│  PYRAMIDE-BALANSE                  │  SAMMENDRAG       │
│                                    │                   │
│  FYS  18%   mål 20% [ok]           │  ┌─────┬─────┐   │
│  ━━━━━━━━━━━━━━━━━━━━━┊━━━━━━━     │  │  4  │  2  │   │
│                                    │  │ÆKTER│RUNDR│   │
│  TEK  35%   mål 30% [over]         │  └─────┴─────┘   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━┊━    │                   │
│                                    │  ┌─────┬─────┐   │
│  SLAG 12%   mål 20% [under]        │  │ 12  │  3  │   │
│  ━━━━━━━━━━━━━┊━━━━━━━━━━━━━       │  │DRLLS│TESTR│   │
│                                    │  └─────┴─────┘   │
│  SPILL ...  TURN ...               │                   │
│                                    │                   │
│  ┌─────────────────────────────┐   │                   │
│  │ ANBEFALING FRA CADDIE       │   │                   │
│  │ Du bør prioritere SLAG...   │   │                   │
│  └─────────────────────────────┘   │                   │
└────────────────────────────────────┴───────────────────┘
```

**Spec:** Se `src/components/portal/workbench/week-progress-card.tsx`
- 5/3 grid på desktop
- Pyramide-bar: 6px høyde, forest/amber/blå/lime/red
- Status-pills (ok/over/under) inline med tall
- Stat-tiles 32px display-tall
- Anbefaling i italic editorial-stil

### 5. Section: Snarveier (8-grid)

```
─ KOM RASKT I GANG ───────────────────────────────────────────
Snarveier
Hyppigste handlinger ett klikk unna.

┌─────────┬─────────┬─────────┬─────────┐
│   ⬜    │   ⬜    │ ███ DARK│   ⬜    │
│  ⊙     │   ▶     │   ⊕     │   ☑     │
│ Logg    │ Start   │ NY      │ Ny test │
│ runde   │ økt     │ BOOKING │         │
└─────────┴─────────┴─────────┴─────────┘
┌─────────┬─────────┬─────────┬─────────┐
│   ⬜    │   ⬜    │   ⬜    │   ⬜    │
│  ▣     │   💬    │   ⏱     │   ⚙     │
│ Video   │ Spør    │ Kalender│ Innst.  │
│ opp     │ coach   │         │         │
└─────────┴─────────┴─────────┴─────────┘
```

**Spec:** Se `src/components/portal/workbench/quick-actions.tsx`
- 100px tiles, 4-col desktop, 2-col mobile
- Highlight-tile (Ny booking) = dark moment: `bg-foreground text-background` + lime accent-ikon
- Ikon-sirkel skalerer 110% på hover

### 6. Section: Tren sammen (kompiser)

(Skjult når 0 — empty state hvis aktivert)

### 7. Section: Turnering + Velvære (2-grid)

```
─ HVA SOM TELLER MEST ────────────────────────────────────────
Turnering + velvære

┌──── DARK MOMENT ────────────┐ ┌─── LYS CARD ─────────────┐
│ NESTE TURNERING              │ │ VELVÆRE                   │
│                              │ │ Dagens kropp              │
│ Sørlandsåpent               │ │                           │
│ 28 – 30. mai · GFGK · 54-hul │ │ ENERGI    │ SØVN          │
│                              │ │ 7/10      │ 7.4 t         │
│ ━━━━━━━━━━━━━━━━━━━━         │ │ ━━━━━━━━━━│               │
│                              │ │                           │
│ 120px LIME                   │ │ HRV       │ STRESS        │
│  21                          │ │ 65 ms +3  │ Lav           │
│ dager igjen                  │ │                           │
│ ━━━━━━━━━━━━━━━━━━━━         │ │                           │
│                              │ │ Sync nå →                 │
│ FORBEREDELSE                 │ └───────────────────────────┘
│ ✓ Plan oppdatert             │
│ ○ Reise booket               │
│ ○ Bane-recon (1 uke før)     │
│ ○ Mental forberedelse        │
│                              │
│ ┃SE TURNERING →┃ (lime pill) │
└──────────────────────────────┘
```

**Spec:**
- Tournament-card: `bg-foreground text-background rounded-2xl shadow-xl`
- 120px countdown: `font-display text-[80px] sm:text-[120px] leading-[0.85] tabular-nums text-accent`
- CTA: `bg-accent text-accent-foreground rounded-full px-6 py-2.5 uppercase tracking-[0.08em]`
- Wellness empty state: hero-ikon + "Koble enhet"-pill

### 8. FAB (kun mobil)

```
                                                    ┌───┐
                                                    │ + │
                                                    └───┘
                                                       primary bg
                                                       expands to 5 actions
```

**Spec:** `src/components/portal/workbench/fab-button.tsx`
- `fixed bottom-20 right-4 z-30 md:hidden`
- bottom-20 = over bottom-nav (h-16)

---

## Spacing-rytme

```
hero
  ↓ space-y-10 (mobile) / lg:space-y-12 (desktop) = 40-48px
section I dag
  ↓
section AI-innsikt
  ↓
section Ukas progresjon
  ↓
section Snarveier
  ↓
section Tren sammen
  ↓
section Turnering + Velvære
  ↓
(FAB — fixed)
```

**Page-wrapper:**
```tsx
<div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:py-8 md:px-6 lg:space-y-12 lg:px-8">
```

---

## Komponent-fil-mapping

| Komponent | Filplassering |
|---|---|
| PlayerHeroImage | `src/components/portal/workbench/player-hero-image.tsx` |
| CalendarWidget | `src/components/portal/workbench/calendar-widget.tsx` |
| AiInsightsRow | `src/components/portal/workbench/ai-insights-row.tsx` |
| WeekProgressCard | `src/components/portal/workbench/week-progress-card.tsx` |
| QuickActions | `src/components/portal/workbench/quick-actions.tsx` |
| TrainingPartnersRow | `src/components/portal/workbench/training-partners-row.tsx` |
| NextTournamentCountdown | `src/components/portal/workbench/next-tournament-countdown.tsx` |
| WellnessIndicators | `src/components/portal/workbench/wellness-indicators.tsx` |
| FabButton | `src/components/portal/workbench/fab-button.tsx` |
| **SectionHeader** | `src/components/portal/workbench/section-header.tsx` |

---

## Data-bindinger (Prisma + AI)

```ts
// Dagens økter
prisma.trainingSessionV2.findMany({
  where: { studentId: user.id, startTime: { gte: startOfDay, lt: endOfDay } },
  orderBy: { startTime: "asc" },
})

// Neste turnering
prisma.tournamentEntry.findFirst({
  where: { userId: user.id, entryStatus: { in: ["PLANNED", "CONFIRMED"] } },
  include: { tournament: true },
})

// HCP-trend (last 20 rounds)
prisma.round.findMany({
  where: { userId: user.id },
  orderBy: { playedAt: "desc" },
  take: 20,
})

// Ukens progresjon
import { getWeekProgress } from "@/components/portal/workbench/get-week-progress"

// AI-innsikt (3 caddie-insights)
import { getCaddieInsights } from "@/lib/ai/get-workbench-insights"
```

---

## Mobile-spesifikt

- Hero: min-h-340 (vs 440 desktop), p-6 (vs p-12)
- Hero hilsen: text-4xl (vs text-6xl)
- Quick Actions: 2-col grid (vs 4-col)
- Wellness: 2x2 grid (uforandret)
- Turnering + Velvære: stacker til 1-col (vs 2-col)
- FAB synlig (md:hidden er false på mobile)
- Calendar: horisontal scroll
- SectionHeader CTA: flytter under tittel (flex-col)

---

## Hvordan replikere i nye skjermer

Hver gang du designer en ny PlayerHQ-skjerm:

1. **Start med hero** — kan være photo-hero (PlayerHeroImage-mønster) eller lys hero med eyebrow+tittel
2. **Bruk SectionHeader mellom alle seksjoner** — aldri direkte sektion→section uten rytme
3. **Plasser 1-2 dark moments** for dramatisk kontrast
4. **Bruk display-tall der det matter** — countdown, KPI, HCP, SG
5. **Hold cards lys og luftig** — `rounded-2xl border border-border bg-card p-6 sm:p-7`
6. **Følg page-wrapper-spacing** — `space-y-10 lg:space-y-12`

For CoachHQ: samme prinsipper. Dark moment kan være "I dag"-banner med spillerliste. Hero kan være coach-foto (eks. AK-Golf-Academy-2.webp eller -7.webp).

---

## Sjekkliste før ny skjerm regnes som "athletic editorial"

- [ ] Har minst én SectionHeader med lime accent-strek
- [ ] Bruker display-tall (Inter Tight bold + tabular-nums) for KPI
- [ ] Har minst ett dark moment ELLER photo-hero
- [ ] Cards er `rounded-2xl` (ikke `rounded-lg`)
- [ ] Bruker pyramide-pills med funksjonsbaserte farger (primary/warning/info/accent/destructive)
- [ ] Mono uppercase eyebrows overalt
- [ ] CTAs er pill-form med uppercase tracking-[0.08em-0.10em]
- [ ] Mobile-versjon stacker korrekt + FAB der relevant
- [ ] Ingen "AK GOLF"-tekst (bruk SidebarBrand)
- [ ] Ingen emojier
