# Komponentbibliotek — Implementasjonsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygge komplett komponentbibliotek for kalender (dag/uke/maaned/aar), statistikk/analyse, og treningsdata-visning.

**Architecture:** 21st.dev FullScreenCalendar som base for kalendervisning, tilpasset med AK Golf design tokens. Recharts (allerede installert) for komplekse grafer. Custom SVG for spesialiserte golf-visualiseringer. Alle komponenter i `components/shared/` med konsistente props og Sprint 0 tokens.

**Tech Stack:** React 19, Tailwind CSS v4, date-fns, recharts, lucide-react, shadcn/ui primitiver

---

## Dataoversikt — Hva trenger custom komponenter

### Allerede dekket (Sprint 0)
- HcpTrendChart (SVG linjegraf)
- SgRadarChart (4-akset radar)
- PyramideRinger (5 treningsbuer)
- MetricCard (KPI med delta)
- SessionCard (okt med pyramide-stripe)
- WeekPills (U1-U6 navigasjon)
- StreakGrid (14/30-dagers prikker)

### Mangler — Kalender
1. **AkCalendar** — Fullscreen kalender med dag/uke/maaned/aar-visning (booking, treningsplan, coaching-okter)
2. **DayView** — Timeplan for en dag (08-20, fargekodede blokker)
3. **WeekView** — 7-dagers grid med tidsblokker
4. **YearView** — 12 mini-maaneder med aktivitetsprikker

### Mangler — Statistikk og analyse
5. **SgBarChart** — Strokes Gained horisontale barer (+/- rundt 0)
6. **ScoreDistribution** — Score-fordeling histogram
7. **RoundSummaryCard** — Kompakt runde-sammendrag (score, SG, FIR/GIR/putts)
8. **ComparisonBar** — Sammenligning spillerverdi vs peer vs benchmark
9. **PercentilDial** — Halvsirkel-dial som viser percentil (0-100)

### Mangler — Treningsdata
10. **ComplianceChart** — Ukentlig gjennomforing (planlagt vs fullfort)
11. **PeriodizationTimeline** — Aarsplan med fargekodede perioder (forberedelse/konkurranse/restitusjon)
12. **DrillProgressCard** — Drill-fremgang med score-trend og benchmark-linje
13. **TrainingVolumeChart** — Treningsvolum per uke/maaned stablet per pyramide-omrade

### Mangler — Coaching/CRM
14. **PlayerTimeline** — Vertikal tidslinje med okter, tester, milepaler
15. **SignalBadge** — Coaching-signal med severity-farge og ikon

---

## Task 1: AkCalendar — Fullscreen kalender med visningsskifter

**Files:**
- Create: `components/shared/calendar/AkCalendar.tsx`
- Create: `components/shared/calendar/MonthView.tsx`
- Create: `components/shared/calendar/DayView.tsx`
- Create: `components/shared/calendar/WeekView.tsx`
- Create: `components/shared/calendar/YearView.tsx`
- Create: `components/shared/calendar/calendar-types.ts`
- Create: `components/shared/calendar/index.ts`

- [ ] **Step 1: Opprett typer**

```typescript
// components/shared/calendar/calendar-types.ts
export type CalendarView = "day" | "week" | "month" | "year";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  /** Fargekode for blokken */
  color?: string;
  /** Kategori for filtrering */
  category?: "booking" | "training" | "session" | "tournament" | "rest";
  /** Valgfri metadata */
  metadata?: Record<string, unknown>;
}

export interface CalendarProps {
  events: CalendarEvent[];
  defaultView?: CalendarView;
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  onAddEvent?: (date: Date) => void;
  className?: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  booking: "#005840",
  training: "#D1F843",
  session: "#1A7D56",
  tournament: "#B8852A",
  rest: "#9C9990",
};

export const WEEKDAYS_NO = ["Man", "Tir", "Ons", "Tor", "Fre", "Lor", "Son"];
export const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08-20
```

- [ ] **Step 2: Bygg MonthView basert pa 21st.dev FullScreenCalendar**

Bruk 21st.dev `FullScreenCalendar` som inspirasjon, men tilpass til AK Golf tokens:
- Bakgrunn: #FAFAF7 (surface)
- Kort: #FFFFFF med 1px border #E5E3DD
- Aktiv dag: rgba(0,88,64,0.08) med tekst #005840
- I dag: lime prikk under dato
- Events: fargekodede pills per kategori
- Header: Inter Tight bold, navigasjon med ChevronLeft/ChevronRight
- Ukedager: Man-Son (norsk), Inter 12px uppercase #9C9990

```typescript
// components/shared/calendar/MonthView.tsx
"use client";

import { useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
} from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CalendarEvent, CalendarProps } from "./calendar-types";
import { CATEGORY_COLORS, WEEKDAYS_NO } from "./calendar-types";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}
```

Implementer fullstendig maanedsvisning med 7-kolonne grid, event-pills, og dags-highlight.

- [ ] **Step 3: Bygg DayView (timeplan 08-20)**

```typescript
// components/shared/calendar/DayView.tsx
"use client";
// 13 rader (08:00-20:00), event-blokker plassert basert pa startTime/endTime
// Fargekodede blokker med CATEGORY_COLORS
// Klikk pa tom celle -> onAddEvent(date)
```

- [ ] **Step 4: Bygg WeekView (7 dager x timeslots)**

```typescript
// components/shared/calendar/WeekView.tsx
"use client";
// 7 kolonner (Man-Son) x 13 rader (08-20)
// Responsiv: pa mobil viser kun 3 dager med swipe
```

- [ ] **Step 5: Bygg YearView (12 mini-maaneder)**

```typescript
// components/shared/calendar/YearView.tsx
"use client";
// 4x3 grid med 12 mini-maaneder
// Hver dag er en liten prikk: farge = antall events (gra=0, lime=1+, gronn=3+)
// Klikk pa maaned -> switcher til MonthView for den maaneden
```

- [ ] **Step 6: Bygg AkCalendar wrapper med visningsskifter**

```typescript
// components/shared/calendar/AkCalendar.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarView, CalendarProps } from "./calendar-types";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { YearView } from "./YearView";

// Header med:
// - Tittel (maaned/aar i Inter Tight bold)
// - Navigasjonsknapper (forrige/neste)
// - Visningsskifter pills: Dag | Uke | Maaned | Aar
// - "I dag"-knapp
```

- [ ] **Step 7: Eksporter og verifiser**

```typescript
// components/shared/calendar/index.ts
export { AkCalendar } from "./AkCalendar";
export { MonthView } from "./MonthView";
export { WeekView } from "./WeekView";
export { DayView } from "./DayView";
export { YearView } from "./YearView";
export type { CalendarEvent, CalendarView, CalendarProps } from "./calendar-types";
export { CATEGORY_COLORS } from "./calendar-types";
```

Run: `npx tsc --noEmit`

- [ ] **Step 8: Commit**

```bash
git add components/shared/calendar/
git commit -m "feat: AkCalendar med dag/uke/maaned/aar-visning"
```

---

## Task 2: Statistikk-komponenter (SG, score, sammenligning)

**Files:**
- Create: `components/shared/charts/SgBarChart.tsx`
- Create: `components/shared/charts/ScoreDistribution.tsx`
- Create: `components/shared/charts/ComparisonBar.tsx`
- Create: `components/shared/charts/PercentilDial.tsx`
- Create: `components/shared/RoundSummaryCard.tsx`
- Create: `components/shared/charts/index.ts`

- [ ] **Step 1: SgBarChart — horisontale SG-barer**

```typescript
// components/shared/charts/SgBarChart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Cell } from "recharts";

interface SgBarChartProps {
  data: Array<{
    area: string; // "Tee" | "Approach" | "Around Green" | "Putting"
    value: number; // Positiv = bra, negativ = dårlig
  }>;
  height?: number;
  className?: string;
}

// Horisontale barer rundt 0-linje
// Positiv: #D1F843 (lime)
// Negativ: #A32D2D (danger)
// Labels i Inter 12px
// Verdier i JetBrains Mono
```

- [ ] **Step 2: ScoreDistribution — histogram**

```typescript
// components/shared/charts/ScoreDistribution.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface ScoreDistributionProps {
  scores: number[]; // Array med scores (f.eks. 72, 75, 78, 80...)
  highlightScore?: number; // Markerer en spesifikk score
  className?: string;
}

// Bins: under par, par, +1-3, +4-6, +7-10, +11+
// Highlight-bar i lime
// Normal barer i #E5E3DD
```

- [ ] **Step 3: ComparisonBar — spillerverdi vs peer vs benchmark**

```typescript
// components/shared/charts/ComparisonBar.tsx

interface ComparisonBarProps {
  label: string;
  playerValue: number;
  peerValue: number;
  benchmarkValue: number;
  unit?: string;
  higherIsBetter?: boolean;
  className?: string;
}

// Tre stablete barer:
// Spiller: #005840 (primary)
// Peer: #9C9990 (subtle)
// Benchmark: #D1F843 (lime)
// Verdier i JetBrains Mono 12px
```

- [ ] **Step 4: PercentilDial — halvsirkel gauge**

```typescript
// components/shared/charts/PercentilDial.tsx
"use client";

interface PercentilDialProps {
  value: number; // 0-100
  label?: string;
  size?: number; // default 120
  className?: string;
}

// SVG halvsirkel med:
// Bakgrunn: #EFEDE6
// Fyll: gradient #005840 -> #D1F843 basert pa verdi
// Verdi i midten: JetBrains Mono 32px
// Label under: Inter 12px uppercase #9C9990
```

- [ ] **Step 5: RoundSummaryCard**

```typescript
// components/shared/RoundSummaryCard.tsx

interface RoundSummaryCardProps {
  date: string;
  courseName: string;
  score: number;
  par: number;
  sgTotal: number;
  fairwaysHit: string; // "9/14"
  greensInReg: string; // "11/18"
  putts: number;
  onClick?: () => void;
  className?: string;
}

// Hvit kort, 20px radius, 1px border
// Score i JetBrains Mono 32px
// SG med lime/rod delta-pil
// FIR/GIR/Putts i kompakte kolonner
```

- [ ] **Step 6: Index-eksport og verifiser**

```typescript
// components/shared/charts/index.ts
export { SgBarChart } from "./SgBarChart";
export { ScoreDistribution } from "./ScoreDistribution";
export { ComparisonBar } from "./ComparisonBar";
export { PercentilDial } from "./PercentilDial";
```

Run: `npx tsc --noEmit`

- [ ] **Step 7: Commit**

```bash
git add components/shared/charts/ components/shared/RoundSummaryCard.tsx
git commit -m "feat: statistikk-komponenter (SG, score, sammenligning, percentil)"
```

---

## Task 3: Treningsdata-komponenter

**Files:**
- Create: `components/shared/ComplianceChart.tsx`
- Create: `components/shared/PeriodizationTimeline.tsx`
- Create: `components/shared/DrillProgressCard.tsx`
- Create: `components/shared/TrainingVolumeChart.tsx`

- [ ] **Step 1: ComplianceChart — planlagt vs fullfort**

```typescript
// components/shared/ComplianceChart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface ComplianceChartProps {
  data: Array<{
    week: string; // "U1", "U2", etc.
    planned: number;
    completed: number;
  }>;
  height?: number;
  className?: string;
}

// Doble barer per uke:
// Planlagt: #EFEDE6 (line-soft)
// Fullfort: #D1F843 (lime)
// Prosent over hver bar i JetBrains Mono 10px
```

- [ ] **Step 2: PeriodizationTimeline — aarsplan**

```typescript
// components/shared/PeriodizationTimeline.tsx
"use client";

interface PeriodBlock {
  id: string;
  label: string;
  type: "preparation" | "competition" | "rest" | "transition";
  startDate: string;
  endDate: string;
}

interface PeriodizationTimelineProps {
  periods: PeriodBlock[];
  year: number;
  currentDate?: Date;
  className?: string;
}

// Horisontalt tidslinje med 12 maaneder
// Fargekodede blokker:
// preparation: #005840 (primary)
// competition: #D1F843 (lime)
// rest: #EFEDE6 (line-soft)
// transition: #B8852A (warning)
// Naaltidslinje (rod vertikal linje pa i dag)
// Maanedsetiketter i Inter 10px uppercase
```

- [ ] **Step 3: DrillProgressCard**

```typescript
// components/shared/DrillProgressCard.tsx

interface DrillProgressCardProps {
  drillName: string;
  scores: Array<{ date: string; score: number }>;
  benchmarkScore?: number;
  currentScore: number;
  bestScore: number;
  totalAttempts: number;
  className?: string;
}

// Hvit kort, 20px radius
// Mini sparkline (SVG) med score-trend
// Benchmark som stiplet horisontal linje
// Navarende score i JetBrains Mono 24px
// Beste score i lime
```

- [ ] **Step 4: TrainingVolumeChart — stablet per pyramide**

```typescript
// components/shared/TrainingVolumeChart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

interface TrainingVolumeChartProps {
  data: Array<{
    period: string; // "U1", "Jan", etc.
    fys: number;    // Timer
    tek: number;
    slag: number;
    spill: number;
    turn: number;
  }>;
  height?: number;
  className?: string;
}

// Stablet barer per periode
// Farger per pyramide:
// FYS: #005840, TEK: #1A7D56, SLAG: #D1F843, SPILL: #B8852A, TURN: #5E5C57
// Legend under med fargesirkler
```

- [ ] **Step 5: Verifiser og commit**

Run: `npx tsc --noEmit`

```bash
git add components/shared/ComplianceChart.tsx components/shared/PeriodizationTimeline.tsx components/shared/DrillProgressCard.tsx components/shared/TrainingVolumeChart.tsx
git commit -m "feat: treningsdata-komponenter (compliance, periodisering, drill, volum)"
```

---

## Task 4: Coaching/CRM-komponenter

**Files:**
- Create: `components/shared/PlayerTimeline.tsx`
- Create: `components/shared/SignalBadge.tsx`

- [ ] **Step 1: PlayerTimeline — vertikal tidslinje**

```typescript
// components/shared/PlayerTimeline.tsx

interface TimelineEntry {
  id: string;
  type: "session" | "test" | "milestone" | "note" | "round" | "video";
  title: string;
  description?: string;
  date: string;
  metadata?: Record<string, unknown>;
}

interface PlayerTimelineProps {
  entries: TimelineEntry[];
  maxEntries?: number;
  className?: string;
}

// Vertikal linje i #EFEDE6
// Prikker pa linjen: farge per type
// session: #005840, test: #B8852A, milestone: #D1F843
// note: #5E5C57, round: #1A7D56, video: #9C9990
// Dato i JetBrains Mono 10px
// Tittel i Inter 14px semibold
// Beskrivelse i Inter 13px #5E5C57
```

- [ ] **Step 2: SignalBadge**

```typescript
// components/shared/SignalBadge.tsx

interface SignalBadgeProps {
  type: string;
  severity: "info" | "warning" | "urgent" | "critical";
  label: string;
  className?: string;
}

// Pill med venstre ikon og farge per severity:
// info: #005840 bg rgba(0,88,64,0.08)
// warning: #B8852A bg #FFF0D6
// urgent: #D1F843 bg rgba(209,248,67,0.12)
// critical: #A32D2D bg #FAE3E3
// Ikon: lucide (AlertCircle, AlertTriangle, Zap, XCircle)
```

- [ ] **Step 3: Verifiser og commit**

Run: `npx tsc --noEmit`

```bash
git add components/shared/PlayerTimeline.tsx components/shared/SignalBadge.tsx
git commit -m "feat: coaching-komponenter (tidslinje, signal-badge)"
```

---

## Task 5: Oppdater component-library.md og verifiser alt

**Files:**
- Modify: `.claude/rules/component-library.md`

- [ ] **Step 1: Oppdater komponentkatalog**

Legg til alle nye komponenter i `.claude/rules/component-library.md` under nye seksjoner:
- "Kalender-komponenter" (AkCalendar, MonthView, WeekView, DayView, YearView)
- "Statistikk-komponenter" (SgBarChart, ScoreDistribution, ComparisonBar, PercentilDial, RoundSummaryCard)
- "Treningsdata-komponenter" (ComplianceChart, PeriodizationTimeline, DrillProgressCard, TrainingVolumeChart)
- "Coaching-komponenter" (PlayerTimeline, SignalBadge)

- [ ] **Step 2: Kjor full typesjekk**

Run: `npx tsc --noEmit`
Forventet: Ingen nye feil

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/component-library.md
git commit -m "docs: oppdater komponentkatalog med 15 nye komponenter"
```
