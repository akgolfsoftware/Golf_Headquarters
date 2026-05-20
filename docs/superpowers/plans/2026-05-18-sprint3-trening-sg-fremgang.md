# Sprint 3: Treningsdata × SG-fremgang Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Koble hva spillere trener til SG-fremgang — TrainingLog-modell, ukentlig volum-analyse per SG-kategori, korrelasjon trening→SG, coach-fremgang-dashboard og AI-kontekst-berikelse.

**Architecture:** Ny `TrainingLog`-tabell (lett daglig logg per SG-område) → aggregeringsfunksjoner i `src/lib/training/` → `SpillerKontekst` berikes med volum + korrelasjon → coach-dashboard viser SG-sparklines og treningsvolum side om side → plan-monitor agenten flagger misforhold mellom SG-svakheter og treningsfokus.

**Tech Stack:** Next.js App Router, Prisma (PostgreSQL), Tailwind CSS v4, shadcn/ui, TypeScript (strict, aldri `any`), `tsx --test src/lib/__tests__/**/*.test.ts` for enhetstester.

---

## Fil-oversikt

| Sti | Ansvar | Operasjon |
|---|---|---|
| `prisma/schema.prisma` | TrainingLog-modell | Modify |
| `prisma/migrations/*/` | DB-migrering | Create (auto) |
| `src/lib/training/volum.ts` | `hentTreningsVolum()` | Create |
| `src/lib/training/korrelasjon.ts` | `beregnKorrelasjon()` | Create |
| `src/lib/__tests__/training/volum.test.ts` | Tester for volum | Create |
| `src/lib/__tests__/training/korrelasjon.test.ts` | Tester for korrelasjon | Create |
| `src/lib/ai-plan/context.ts` | Berik SpillerKontekst | Modify |
| `src/app/admin/spillere/[id]/fremgang/page.tsx` | Coach-dashboard | Create |
| `src/components/fremgang/SgSparkline.tsx` | Sparkline-komponent | Create |
| `src/components/fremgang/TreningsvolumBar.tsx` | Volum-bar-komponent | Create |
| `src/app/portal/trening/logg/page.tsx` | Spiller quick-log | Create |
| `src/app/api/portal/trening/logg/route.ts` | API: lagre TrainingLog | Create |
| `src/app/api/cron/[agent]/route.ts` | Legg til training-gap agent | Modify |

---

## Task 1: TrainingLog Prisma-modell og migrering

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_training_log/`

- [ ] **Steg 1: Legg til TrainingLog-modell i schema.prisma**

Finn `model Signal` i schema og legg til ETTER den:

```prisma
model TrainingLog {
  id        String      @id @default(cuid())
  userId    String
  date      DateTime    @db.Date
  sgArea    SgCategory
  minutes   Int
  drillName String?
  quality   Int?        @db.SmallInt // 1-5
  notes     String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([userId, sgArea])
}
```

Legg også til relasjonsfeltet i `User`-modellen:

```prisma
// I model User, etter eksisterende relasjoner:
trainingLogs    TrainingLog[]
```

- [ ] **Steg 2: Kjør migrering**

```bash
cd /Users/anderskristiansen/Developer/akgolf-hq
npx prisma migrate dev --name add_training_log
```

Forventet output: `✓ Generated Prisma Client` og ny migreringsfil opprettet.

- [ ] **Steg 3: Verifiser at Prisma Client er generert**

```bash
npx prisma generate
grep -n "TrainingLog" node_modules/.prisma/client/index.d.ts | head -5
```

Forventet: `TrainingLog` vises i type-definisjonene.

- [ ] **Steg 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): add TrainingLog model with SgCategory, minutes, quality"
```

---

## Task 2: `hentTreningsVolum()` — ukentlig volum per SG-kategori

**Files:**
- Create: `src/lib/training/volum.ts`
- Create: `src/lib/__tests__/training/volum.test.ts`

- [ ] **Steg 1: Skriv failing test**

Opprett `src/lib/__tests__/training/volum.test.ts`:

```typescript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { aggregerVolumPerUke } from '../../training/volum'

describe('aggregerVolumPerUke', () => {
  it('returnerer tom array hvis ingen logger', () => {
    const result = aggregerVolumPerUke([], 4)
    assert.deepEqual(result, [])
  })

  it('summerer minutter per uke per SgCategory', () => {
    const now = new Date('2026-05-18')
    const logs = [
      { date: new Date('2026-05-12'), sgArea: 'OTT' as const, minutes: 30 },
      { date: new Date('2026-05-13'), sgArea: 'OTT' as const, minutes: 20 },
      { date: new Date('2026-05-14'), sgArea: 'PUTT' as const, minutes: 45 },
    ]
    const result = aggregerVolumPerUke(logs, 4, now)
    const ottUke = result.find(r => r.sgArea === 'OTT' && r.uke === '2026-W20')
    assert.ok(ottUke, 'OTT uke 20 skal finnes')
    assert.equal(ottUke?.minutter, 50)
    const puttUke = result.find(r => r.sgArea === 'PUTT' && r.uke === '2026-W20')
    assert.equal(puttUke?.minutter, 45)
  })
})
```

- [ ] **Steg 2: Kjør test — verifiser at den feiler**

```bash
cd /Users/anderskristiansen/Developer/akgolf-hq
npx tsx --test src/lib/__tests__/training/volum.test.ts 2>&1 | tail -10
```

Forventet: `Error: Cannot find module '../../training/volum'`

- [ ] **Steg 3: Implementer `src/lib/training/volum.ts`**

```typescript
import { SgCategory } from '@prisma/client'

export interface TrainingLogInput {
  date: Date
  sgArea: SgCategory
  minutes: number
}

export interface UkeVolum {
  uke: string          // ISO-ukenummer: "2026-W20"
  sgArea: SgCategory
  minutter: number
}

/** Formater dato til ISO-ukenummer (ISO 8601). */
function isoUkeNummer(dato: Date): string {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()))
  const dag = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dag)
  const year = d.getUTCFullYear()
  const startOfYear = new Date(Date.UTC(year, 0, 1))
  const uke = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7)
  return `${year}-W${String(uke).padStart(2, '0')}`
}

/**
 * Aggregerer treningslogger til ukentlig volum per SG-kategori.
 * @param logger  - Liste av logg-innslag (rå Prisma-rader eller subset)
 * @param uker    - Antall uker bakover fra `fraDato` å inkludere
 * @param fraDato - Referansedato (default: i dag)
 */
export function aggregerVolumPerUke(
  logger: TrainingLogInput[],
  uker: number,
  fraDato: Date = new Date()
): UkeVolum[] {
  if (logger.length === 0) return []

  const grense = new Date(fraDato)
  grense.setDate(grense.getDate() - uker * 7)

  const map = new Map<string, number>()

  for (const log of logger) {
    if (log.date < grense) continue
    const key = `${isoUkeNummer(log.date)}::${log.sgArea}`
    map.set(key, (map.get(key) ?? 0) + log.minutes)
  }

  return Array.from(map.entries()).map(([key, minutter]) => {
    const [uke, sgArea] = key.split('::')
    return { uke, sgArea: sgArea as SgCategory, minutter }
  }).sort((a, b) => a.uke.localeCompare(b.uke))
}

/** Henter treningsvolum for en bruker fra databasen og aggregerer per uke. */
export async function hentTreningsVolum(
  userId: string,
  uker: number = 8
): Promise<UkeVolum[]> {
  const { default: prisma } = await import('../prisma')
  const grense = new Date()
  grense.setDate(grense.getDate() - uker * 7)

  const logger = await prisma.trainingLog.findMany({
    where: { userId, date: { gte: grense } },
    select: { date: true, sgArea: true, minutes: true },
    orderBy: { date: 'asc' },
  })

  return aggregerVolumPerUke(logger, uker)
}
```

- [ ] **Steg 4: Kjør test — verifiser at den passerer**

```bash
npx tsx --test src/lib/__tests__/training/volum.test.ts 2>&1 | tail -10
```

Forventet: `✓ returnerer tom array hvis ingen logger`, `✓ summerer minutter per uke per SgCategory`

- [ ] **Steg 5: Commit**

```bash
git add src/lib/training/volum.ts src/lib/__tests__/training/volum.test.ts
git commit -m "feat(training): hentTreningsVolum aggregates weekly minutes per SgCategory"
```

---

## Task 3: `beregnKorrelasjon()` — trening vs SG-fremgang per område

**Files:**
- Create: `src/lib/training/korrelasjon.ts`
- Create: `src/lib/__tests__/training/korrelasjon.test.ts`

Logikk: For hvert SG-område — sammenlign uker med høyt treningsvolum mot SG-endring uken etter. Pearson r mellom `[minutter_uke_N]` og `[sg_endring_uke_N+1]` per kategori.

- [ ] **Steg 1: Skriv failing test**

Opprett `src/lib/__tests__/training/korrelasjon.test.ts`:

```typescript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { beregnPearson, koblTreningOgSg } from '../../training/korrelasjon'

describe('beregnPearson', () => {
  it('returnerer null ved for få datapunkter', () => {
    assert.equal(beregnPearson([1], [2]), null)
    assert.equal(beregnPearson([], []), null)
  })

  it('returnerer 1.0 for perfekt positiv korrelasjon', () => {
    const r = beregnPearson([1, 2, 3, 4], [2, 4, 6, 8])
    assert.ok(r !== null)
    assert.ok(Math.abs(r - 1.0) < 0.001)
  })

  it('returnerer -1.0 for perfekt negativ korrelasjon', () => {
    const r = beregnPearson([1, 2, 3, 4], [8, 6, 4, 2])
    assert.ok(r !== null)
    assert.ok(Math.abs(r + 1.0) < 0.001)
  })
})

describe('koblTreningOgSg', () => {
  it('kobler treningsuke til SG-endring neste uke', () => {
    const treningUker = [
      { uke: '2026-W10', sgArea: 'OTT' as const, minutter: 60 },
      { uke: '2026-W11', sgArea: 'OTT' as const, minutter: 90 },
    ]
    const sgUker = [
      { uke: '2026-W11', sgArea: 'OTT' as const, snittSg: -0.2 },
      { uke: '2026-W12', sgArea: 'OTT' as const, snittSg: 0.1 },
    ]
    const par = koblTreningOgSg(treningUker, sgUker)
    assert.equal(par.length, 2)
    assert.equal(par[0].minutterTreningsuke, 60)
    assert.equal(par[0].sgEndringNesteUke, -0.2) // W10 trening → W11 SG
    assert.equal(par[1].minutterTreningsuke, 90)
    assert.equal(par[1].sgEndringNesteUke, 0.1)  // W11 trening → W12 SG
  })
})
```

- [ ] **Steg 2: Kjør test — verifiser at den feiler**

```bash
npx tsx --test src/lib/__tests__/training/korrelasjon.test.ts 2>&1 | tail -5
```

Forventet: `Error: Cannot find module '../../training/korrelasjon'`

- [ ] **Steg 3: Implementer `src/lib/training/korrelasjon.ts`**

```typescript
import { SgCategory } from '@prisma/client'
import { UkeVolum } from './volum'

export interface SgUke {
  uke: string
  sgArea: SgCategory
  snittSg: number
}

export interface TreningOgSgPar {
  uke: string
  sgArea: SgCategory
  minutterTreningsuke: number
  sgEndringNesteUke: number
}

export interface KorrelasjonsResultat {
  sgArea: SgCategory
  r: number | null           // Pearson r: -1 til 1
  datapunkter: number
  tolkning: 'positiv' | 'negativ' | 'ingen' | 'for_lite_data'
}

/** Pearson r mellom to serier av samme lengde. Returnerer null ved < 2 par. */
export function beregnPearson(x: number[], y: number[]): number | null {
  const n = x.length
  if (n < 2 || n !== y.length) return null

  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = y.reduce((a, b) => a + b, 0) / n

  let teller = 0, ssX = 0, ssY = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    teller += dx * dy
    ssX += dx * dx
    ssY += dy * dy
  }

  if (ssX === 0 || ssY === 0) return null
  return teller / Math.sqrt(ssX * ssY)
}

/**
 * Kobler treningsuke (N) til SG-snitt neste uke (N+1) per SG-område.
 * Brukes til å finne om trening én uke henger sammen med bedre SG neste.
 */
export function koblTreningOgSg(
  treningUker: UkeVolum[],
  sgUker: SgUke[]
): TreningOgSgPar[] {
  const sgMap = new Map<string, number>()
  for (const s of sgUker) {
    sgMap.set(`${s.uke}::${s.sgArea}`, s.snittSg)
  }

  // Finn neste ISO-uke
  function nesteUke(uke: string): string {
    const [year, w] = uke.split('-W').map(Number)
    const ukeNum = w + 1
    if (ukeNum > 52) return `${year + 1}-W01`
    return `${year}-W${String(ukeNum).padStart(2, '0')}`
  }

  const par: TreningOgSgPar[] = []
  for (const t of treningUker) {
    const neste = nesteUke(t.uke)
    const sgNeste = sgMap.get(`${neste}::${t.sgArea}`)
    if (sgNeste !== undefined) {
      par.push({
        uke: t.uke,
        sgArea: t.sgArea,
        minutterTreningsuke: t.minutter,
        sgEndringNesteUke: sgNeste,
      })
    }
  }
  return par
}

/**
 * Beregner Pearson-korrelasjon mellom ukentlig treningsvolum og SG neste uke,
 * per SG-kategori, for en gitt bruker.
 */
export async function beregnKorrelasjon(
  userId: string,
  uker: number = 16
): Promise<KorrelasjonsResultat[]> {
  const { default: prisma } = await import('../prisma')
  const { aggregerVolumPerUke } = await import('./volum')

  const grense = new Date()
  grense.setDate(grense.getDate() - (uker + 1) * 7)

  // Hent treningslogger
  const treningLogger = await prisma.trainingLog.findMany({
    where: { userId, date: { gte: grense } },
    select: { date: true, sgArea: true, minutes: true },
  })
  const treningUker = aggregerVolumPerUke(treningLogger, uker + 1)

  // Hent runder med SG-data
  const runder = await prisma.round.findMany({
    where: {
      userId,
      date: { gte: grense },
      sgTotal: { not: null },
    },
    select: { date: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    orderBy: { date: 'asc' },
  })

  // Bygg SgUke-serier (gjennomsnitt av SG per uke per kategori)
  const omraader: SgCategory[] = ['OTT', 'APP', 'ARG', 'PUTT']
  const sgUker: SgUke[] = []

  function isoUkeNummer(dato: Date): string {
    const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()))
    const dag = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dag)
    const year = d.getUTCFullYear()
    const startOfYear = new Date(Date.UTC(year, 0, 1))
    const uke = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7)
    return `${year}-W${String(uke).padStart(2, '0')}`
  }

  const ukeMap = new Map<string, { sum: number; count: number }>()
  for (const r of runder) {
    const uke = isoUkeNummer(r.date)
    const sgPerOmraade: Record<SgCategory, number | null> = {
      OTT: r.sgOtt,
      APP: r.sgApp,
      ARG: r.sgArg,
      PUTT: r.sgPutt,
    }
    for (const omraade of omraader) {
      const sg = sgPerOmraade[omraade]
      if (sg == null) continue
      const key = `${uke}::${omraade}`
      const prev = ukeMap.get(key) ?? { sum: 0, count: 0 }
      ukeMap.set(key, { sum: prev.sum + sg, count: prev.count + 1 })
    }
  }

  for (const [key, { sum, count }] of ukeMap.entries()) {
    const [uke, sgArea] = key.split('::')
    sgUker.push({ uke, sgArea: sgArea as SgCategory, snittSg: sum / count })
  }

  // Beregn korrelasjon per område
  return omraader.map(omraade => {
    const treningOmraade = treningUker.filter(t => t.sgArea === omraade)
    const sgOmraade = sgUker.filter(s => s.sgArea === omraade)
    const par = koblTreningOgSg(treningOmraade, sgOmraade)

    const r = beregnPearson(
      par.map(p => p.minutterTreningsuke),
      par.map(p => p.sgEndringNesteUke)
    )

    let tolkning: KorrelasjonsResultat['tolkning']
    if (r === null || par.length < 4) {
      tolkning = 'for_lite_data'
    } else if (r > 0.3) {
      tolkning = 'positiv'
    } else if (r < -0.3) {
      tolkning = 'negativ'
    } else {
      tolkning = 'ingen'
    }

    return { sgArea: omraade, r, datapunkter: par.length, tolkning }
  })
}
```

- [ ] **Steg 4: Kjør tester — verifiser at begge passerer**

```bash
npx tsx --test src/lib/__tests__/training/korrelasjon.test.ts 2>&1 | tail -10
```

Forventet: `✓ returnerer null ved for få datapunkter`, `✓ returnerer 1.0 for perfekt positiv`, `✓ returnerer -1.0 for perfekt negativ`, `✓ kobler treningsuke til SG-endring neste uke`

- [ ] **Steg 5: Kjør alle tester**

```bash
npx tsx --test src/lib/__tests__/**/*.test.ts 2>&1 | tail -15
```

Forventet: Alle tester passerer, inkludert eksisterende fra Sprint 1 og 2.

- [ ] **Steg 6: Commit**

```bash
git add src/lib/training/korrelasjon.ts src/lib/__tests__/training/korrelasjon.test.ts
git commit -m "feat(training): beregnKorrelasjon Pearson r mellom treningsvolum og SG neste uke"
```

---

## Task 4: Berik `SpillerKontekst` med treningsdata

**Files:**
- Modify: `src/lib/ai-plan/context.ts`

`byggSpillerKontekst()` returnerer allerede `spiller`, `wagr`, `aktiveMal`, `sistePlaner`, `sisteOkter`, `signaler`. Vi legger til `treningsVolum` og `korrelasjon`.

- [ ] **Steg 1: Les gjeldende SpillerKontekst-type i context.ts**

```bash
grep -n "SpillerKontekst\|treningsVolum\|korrelasjon" /Users/anderskristiansen/Developer/akgolf-hq/src/lib/ai-plan/context.ts | head -20
```

- [ ] **Steg 2: Utvid `SpillerKontekst`-typen og `byggSpillerKontekst()`**

Finn `export interface SpillerKontekst` i `src/lib/ai-plan/context.ts` og legg til felter:

```typescript
// Legg til import øverst i filen:
import { hentTreningsVolum, UkeVolum } from '../training/volum'
import { beregnKorrelasjon, KorrelasjonsResultat } from '../training/korrelasjon'

// I SpillerKontekst-interfacet, legg til:
treningsVolum: UkeVolum[]
korrelasjon: KorrelasjonsResultat[]
```

Finn `async function byggSpillerKontekst(userId: string)` og legg til parallell-henting (med `Promise.all`, samme mønster som eksisterende kode):

```typescript
// Legg til i Promise.all-blokken (eller separat if den ikke bruker Promise.all):
const [treningsVolum, korrelasjon] = await Promise.all([
  hentTreningsVolum(userId, 8),
  beregnKorrelasjon(userId, 16),
])
```

Legg til i return-objektet:

```typescript
treningsVolum,
korrelasjon,
```

- [ ] **Steg 3: Finn riktige linjenummer og gjør edits**

```bash
grep -n "return {" /Users/anderskristiansen/Developer/akgolf-hq/src/lib/ai-plan/context.ts
grep -n "interface SpillerKontekst" /Users/anderskristiansen/Developer/akgolf-hq/src/lib/ai-plan/context.ts
```

Bruk Read-verktøyet til å se de relevante linjene, deretter Edit for presise endringer.

- [ ] **Steg 4: Kjør typecheck**

```bash
cd /Users/anderskristiansen/Developer/akgolf-hq
npx tsc --noEmit 2>&1 | head -20
```

Forventet: Ingen TypeScript-feil.

- [ ] **Steg 5: Commit**

```bash
git add src/lib/ai-plan/context.ts
git commit -m "feat(ai-plan): berik SpillerKontekst med treningsVolum og korrelasjon"
```

---

## Task 5: Coach fremgang-dashboard `/admin/spillere/[id]/fremgang`

**Files:**
- Create: `src/components/fremgang/SgSparkline.tsx`
- Create: `src/components/fremgang/TreningsvolumBar.tsx`
- Create: `src/app/admin/spillere/[id]/fremgang/page.tsx`

- [ ] **Steg 1: Opprett `SgSparkline.tsx`**

Opprett `src/components/fremgang/SgSparkline.tsx`:

```typescript
'use client'

import { SgCategory } from '@prisma/client'

interface SgDatapunkt {
  uke: string
  snittSg: number
}

interface Props {
  sgArea: SgCategory
  data: SgDatapunkt[]
}

const AREA_LABEL: Record<SgCategory, string> = {
  OTT: 'Off the tee',
  APP: 'Approach',
  ARG: 'Around green',
  PUTT: 'Putting',
}

export function SgSparkline({ sgArea, data }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {AREA_LABEL[sgArea]}: ingen data
      </div>
    )
  }

  const min = Math.min(...data.map(d => d.snittSg))
  const max = Math.max(...data.map(d => d.snittSg))
  const range = max - min || 1
  const width = 120
  const height = 32

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * width
      const y = height - ((d.snittSg - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  const latest = data[data.length - 1]
  const trend = data.length > 1
    ? latest.snittSg - data[data.length - 2].snittSg
    : 0

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28">{AREA_LABEL[sgArea]}</span>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={latest.snittSg >= 0 ? 'hsl(142 71% 45%)' : 'hsl(0 72% 51%)'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`text-xs font-medium tabular-nums ${latest.snittSg >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {latest.snittSg.toFixed(2)}
      </span>
      <span className={`text-xs ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
        {trend > 0 ? '+' : ''}{trend.toFixed(2)}
      </span>
    </div>
  )
}
```

- [ ] **Steg 2: Opprett `TreningsvolumBar.tsx`**

Opprett `src/components/fremgang/TreningsvolumBar.tsx`:

```typescript
'use client'

import { SgCategory } from '@prisma/client'
import { UkeVolum } from '@/lib/training/volum'

interface Props {
  treningsVolum: UkeVolum[]
  uker: string[] // sortert liste av ISO-uke-strenger
}

const AREA_LABEL: Record<SgCategory, string> = {
  OTT: 'OTT',
  APP: 'APP',
  ARG: 'ARG',
  PUTT: 'PUTT',
}

const AREA_COLOR: Record<SgCategory, string> = {
  OTT: 'bg-blue-500',
  APP: 'bg-emerald-500',
  ARG: 'bg-amber-500',
  PUTT: 'bg-violet-500',
}

export function TreningsvolumBar({ treningsVolum, uker }: Props) {
  if (treningsVolum.length === 0) {
    return <p className="text-sm text-muted-foreground">Ingen treningslogg registrert.</p>
  }

  const omraader: SgCategory[] = ['OTT', 'APP', 'ARG', 'PUTT']
  const maxTotal = Math.max(
    ...uker.map(u =>
      omraader.reduce((sum, a) => {
        const v = treningsVolum.find(t => t.uke === u && t.sgArea === a)
        return sum + (v?.minutter ?? 0)
      }, 0)
    ),
    1
  )

  return (
    <div className="space-y-1">
      <div className="flex gap-3 text-xs text-muted-foreground mb-2">
        {omraader.map(a => (
          <span key={a} className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-sm ${AREA_COLOR[a]}`} />
            {AREA_LABEL[a]}
          </span>
        ))}
      </div>
      <div className="flex gap-1 items-end h-16">
        {uker.map(uke => {
          const total = omraader.reduce((sum, a) => {
            const v = treningsVolum.find(t => t.uke === uke && t.sgArea === a)
            return sum + (v?.minutter ?? 0)
          }, 0)
          const height = `${(total / maxTotal) * 100}%`
          return (
            <div key={uke} className="flex-1 flex flex-col justify-end" title={`${uke}: ${total} min`}>
              <div className="w-full flex flex-col-reverse" style={{ height }}>
                {omraader.map(a => {
                  const v = treningsVolum.find(t => t.uke === uke && t.sgArea === a)
                  if (!v) return null
                  const share = `${(v.minutter / total) * 100}%`
                  return (
                    <div
                      key={a}
                      className={`w-full ${AREA_COLOR[a]}`}
                      style={{ height: share }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 text-xs text-muted-foreground">
        {uker.map(u => (
          <div key={u} className="flex-1 text-center truncate">
            {u.replace(/^\d{4}-/, '')}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Steg 3: Opprett fremgang-page**

Opprett `src/app/admin/spillere/[id]/fremgang/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { SgCategory } from '@prisma/client'
import prisma from '@/lib/prisma'
import { hentTreningsVolum } from '@/lib/training/volum'
import { beregnKorrelasjon } from '@/lib/training/korrelasjon'
import { SgSparkline } from '@/components/fremgang/SgSparkline'
import { TreningsvolumBar } from '@/components/fremgang/TreningsvolumBar'

interface Props {
  params: Promise<{ id: string }>
}

const AREA_LABEL: Record<SgCategory, string> = {
  OTT: 'Off the tee',
  APP: 'Approach',
  ARG: 'Around green',
  PUTT: 'Putting',
}

function isoUkeNummer(dato: Date): string {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()))
  const dag = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dag)
  const year = d.getUTCFullYear()
  const startOfYear = new Date(Date.UTC(year, 0, 1))
  const uke = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7)
  return `${year}-W${String(uke).padStart(2, '0')}`
}

export default async function FremgangPage({ params }: Props) {
  const { id } = await params

  const spiller = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true },
  })
  if (!spiller) notFound()

  const UKER = 8
  const grense = new Date()
  grense.setDate(grense.getDate() - UKER * 7)

  const [runder, treningsVolum, korrelasjon] = await Promise.all([
    prisma.round.findMany({
      where: { userId: id, date: { gte: grense }, sgTotal: { not: null } },
      select: { date: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      orderBy: { date: 'asc' },
    }),
    hentTreningsVolum(id, UKER),
    beregnKorrelasjon(id, 16),
  ])

  // Bygg SG-per-uke-serier
  const omraader: SgCategory[] = ['OTT', 'APP', 'ARG', 'PUTT']
  const ukeMap = new Map<string, Record<SgCategory, { sum: number; count: number }>>()

  for (const r of runder) {
    const uke = isoUkeNummer(r.date)
    if (!ukeMap.has(uke)) {
      ukeMap.set(uke, { OTT: { sum: 0, count: 0 }, APP: { sum: 0, count: 0 }, ARG: { sum: 0, count: 0 }, PUTT: { sum: 0, count: 0 } })
    }
    const entry = ukeMap.get(uke)!
    const sgVerdier: Record<SgCategory, number | null> = {
      OTT: r.sgOtt, APP: r.sgApp, ARG: r.sgArg, PUTT: r.sgPutt,
    }
    for (const a of omraader) {
      const sg = sgVerdier[a]
      if (sg != null) {
        entry[a].sum += sg
        entry[a].count += 1
      }
    }
  }

  const sorterteUker = Array.from(ukeMap.keys()).sort()
  const sgSerier: Record<SgCategory, { uke: string; snittSg: number }[]> = {
    OTT: [], APP: [], ARG: [], PUTT: [],
  }
  for (const uke of sorterteUker) {
    const entry = ukeMap.get(uke)!
    for (const a of omraader) {
      if (entry[a].count > 0) {
        sgSerier[a].push({ uke, snittSg: entry[a].sum / entry[a].count })
      }
    }
  }

  const treningUker = [...new Set(treningsVolum.map(t => t.uke))].sort()

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{spiller.name}</h1>
        <p className="text-muted-foreground">Fremgang — siste {UKER} uker</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SG-trender */}
        <div className="border rounded-lg p-5 space-y-3">
          <h2 className="font-medium">SG per område</h2>
          {omraader.map(a => (
            <SgSparkline key={a} sgArea={a} data={sgSerier[a]} />
          ))}
          {runder.length === 0 && (
            <p className="text-sm text-muted-foreground">Ingen runder registrert.</p>
          )}
        </div>

        {/* Treningsvolum */}
        <div className="border rounded-lg p-5 space-y-3">
          <h2 className="font-medium">Treningsvolum per uke</h2>
          <TreningsvolumBar treningsVolum={treningsVolum} uker={treningUker} />
        </div>
      </div>

      {/* Korrelasjonstabell */}
      <div className="border rounded-lg p-5">
        <h2 className="font-medium mb-4">Trening → SG-fremgang (korrelasjon)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="pb-2 font-medium">Område</th>
              <th className="pb-2 font-medium">Pearson r</th>
              <th className="pb-2 font-medium">Datapunkter</th>
              <th className="pb-2 font-medium">Tolkning</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {korrelasjon.map(k => (
              <tr key={k.sgArea} className="py-2">
                <td className="py-2">{AREA_LABEL[k.sgArea]}</td>
                <td className="py-2 tabular-nums">
                  {k.r !== null ? k.r.toFixed(2) : '—'}
                </td>
                <td className="py-2">{k.datapunkter}</td>
                <td className={`py-2 ${
                  k.tolkning === 'positiv' ? 'text-green-600' :
                  k.tolkning === 'negativ' ? 'text-red-500' :
                  'text-muted-foreground'
                }`}>
                  {k.tolkning === 'positiv' ? 'Trening hjelper' :
                   k.tolkning === 'negativ' ? 'Sjekk metode' :
                   k.tolkning === 'for_lite_data' ? 'For lite data' :
                   'Ingen klar sammenheng'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Steg 4: Kjør typecheck**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Forventet: Ingen feil.

- [ ] **Steg 5: Commit**

```bash
git add src/components/fremgang/ src/app/admin/spillere/
git commit -m "feat(admin): coach fremgang-dashboard med SG-sparklines, treningsvolum og korrelajson"
```

---

## Task 6: Spiller quick-log — `/portal/trening/logg`

**Files:**
- Create: `src/app/api/portal/trening/logg/route.ts`
- Create: `src/app/portal/trening/logg/page.tsx`

- [ ] **Steg 1: Opprett API-route**

Opprett `src/app/api/portal/trening/logg/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SgCategory } from '@prisma/client'

const LoggSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sgArea: z.enum(['OTT', 'APP', 'ARG', 'PUTT'] as [SgCategory, ...SgCategory[]]),
  minutes: z.number().int().min(1).max(480),
  drillName: z.string().max(100).optional(),
  quality: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = LoggSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { date, sgArea, minutes, drillName, quality, notes } = parsed.data

  const logg = await prisma.trainingLog.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      sgArea,
      minutes,
      drillName,
      quality,
      notes,
    },
  })

  return NextResponse.json({ id: logg.id }, { status: 201 })
}
```

- [ ] **Steg 2: Opprett portal quick-log page**

Opprett `src/app/portal/trening/logg/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SgCategory } from '@prisma/client'

const OMRAADER: { value: SgCategory; label: string }[] = [
  { value: 'OTT', label: 'Off the tee' },
  { value: 'APP', label: 'Approach' },
  { value: 'ARG', label: 'Around green' },
  { value: 'PUTT', label: 'Putting' },
]

export default function TreningLoggPage() {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    date: today,
    sgArea: 'OTT' as SgCategory,
    minutes: 30,
    drillName: '',
    quality: 3,
    notes: '',
  })
  const [lagrer, setLagrer] = useState(false)
  const [feil, setFeil] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLagrer(true)
    setFeil(null)
    try {
      const res = await fetch('/api/portal/trening/logg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          drillName: form.drillName || undefined,
          notes: form.notes || undefined,
        }),
      })
      if (!res.ok) throw new Error('Kunne ikke lagre')
      router.push('/portal/trening')
    } catch {
      setFeil('Noe gikk galt. Prøv igjen.')
    } finally {
      setLagrer(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-xl font-semibold mb-6">Logg treningsøkt</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dato</label>
          <input
            type="date"
            value={form.date}
            max={today}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Område</label>
          <div className="grid grid-cols-2 gap-2">
            {OMRAADER.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, sgArea: o.value }))}
                className={`border rounded px-3 py-2 text-sm font-medium transition-colors ${
                  form.sgArea === o.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Varighet: {form.minutes} min
          </label>
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={form.minutes}
            onChange={e => setForm(f => ({ ...f, minutes: Number(e.target.value) }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 min</span>
            <span>180 min</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Drill / øvelse (valgfritt)</label>
          <input
            type="text"
            value={form.drillName}
            onChange={e => setForm(f => ({ ...f, drillName: e.target.value }))}
            placeholder="F.eks. Clock drill, Gate drill"
            className="w-full border rounded px-3 py-2 text-sm"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Kvalitet: {form.quality}/5
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setForm(f => ({ ...f, quality: n }))}
                className={`flex-1 border rounded py-2 text-sm font-medium transition-colors ${
                  form.quality === n
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notater (valgfritt)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            maxLength={500}
            placeholder="Hva jobbet du med? Hva gikk bra?"
          />
        </div>

        {feil && <p className="text-sm text-red-500">{feil}</p>}

        <button
          type="submit"
          disabled={lagrer}
          className="w-full bg-primary text-primary-foreground rounded px-4 py-2 font-medium disabled:opacity-50"
        >
          {lagrer ? 'Lagrer...' : 'Lagre økt'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Steg 3: Kjør typecheck**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Forventet: Ingen feil.

- [ ] **Steg 4: Commit**

```bash
git add src/app/api/portal/trening/logg/route.ts src/app/portal/trening/logg/page.tsx
git commit -m "feat(portal): spiller quick-log for treningsøkt med sgArea, varighet og kvalitet"
```

---

## Task 7: Plan-monitor alert — treningsgap vs SG-svakhet

**Files:**
- Modify: `src/app/api/cron/[agent]/route.ts`

Legg til `training-gap`-agent i AGENTS-registeret. Den sjekker om spillerens SG-svakheste område har tilsvarende treningsfokus siste 4 uker. Hvis ikke → oppretter `PlanAction` med type `TRAINING_GAP`.

- [ ] **Steg 1: Les gjeldende AGENTS-register**

```bash
grep -n "AGENTS\|sg-insights\|plan-watcher" /Users/anderskristiansen/Developer/akgolf-hq/src/app/api/cron/\[agent\]/route.ts | head -20
```

- [ ] **Steg 2: Legg til PlanAction-type i Prisma schema**

I `prisma/schema.prisma`, finn `enum PlanActionType` og legg til:

```prisma
TRAINING_GAP
```

Kjør:

```bash
npx prisma migrate dev --name add_training_gap_action_type
```

- [ ] **Steg 3: Implementer training-gap agent**

Finn AGENTS-objektet i `src/app/api/cron/[agent]/route.ts`. Legg til:

```typescript
'training-gap': async () => {
  const { hentTreningsVolum } = await import('@/lib/training/volum')
  const UKER = 4

  const spillere = await prisma.user.findMany({
    where: { role: 'PLAYER' },
    select: { id: true, name: true },
  })

  let varsler = 0

  for (const spiller of spillere) {
    // Finn SG-svakeste område siste 8 uker
    const grense = new Date()
    grense.setDate(grense.getDate() - 8 * 7)
    const runder = await prisma.round.findMany({
      where: { userId: spiller.id, date: { gte: grense }, sgTotal: { not: null } },
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    })
    if (runder.length < 3) continue

    const snitt: Record<SgCategory, number> = { OTT: 0, APP: 0, ARG: 0, PUTT: 0 }
    const teller: Record<SgCategory, number> = { OTT: 0, APP: 0, ARG: 0, PUTT: 0 }
    const omraader: SgCategory[] = ['OTT', 'APP', 'ARG', 'PUTT']

    for (const r of runder) {
      const vals: Record<SgCategory, number | null> = {
        OTT: r.sgOtt, APP: r.sgApp, ARG: r.sgArg, PUTT: r.sgPutt,
      }
      for (const a of omraader) {
        const v = vals[a]
        if (v != null) { snitt[a] += v; teller[a]++ }
      }
    }
    for (const a of omraader) {
      if (teller[a] > 0) snitt[a] = snitt[a] / teller[a]
    }

    const svakest = omraader.reduce((best, curr) =>
      snitt[curr] < snitt[best] ? curr : best
    )

    // Sjekk treningsvolum siste 4 uker
    const volum = await hentTreningsVolum(spiller.id, UKER)
    const totalMinutter = volum.reduce((s, v) => s + v.minutter, 0)
    const svakestMinutter = volum
      .filter(v => v.sgArea === svakest)
      .reduce((s, v) => s + v.minutter, 0)

    // Flagg hvis < 20% av treningstid går på svakeste område
    const andel = totalMinutter > 0 ? svakestMinutter / totalMinutter : 0
    if (totalMinutter > 0 && andel < 0.2) {
      // Ikke opprett duplikat hvis en aktiv TRAINING_GAP allerede finnes
      const eksisterende = await prisma.planAction.findFirst({
        where: {
          userId: spiller.id,
          type: 'TRAINING_GAP',
          status: 'PENDING',
        },
      })
      if (!eksisterende) {
        await prisma.planAction.create({
          data: {
            userId: spiller.id,
            type: 'TRAINING_GAP',
            priority: 'MEDIUM',
            title: `Treningsgap: ${svakest} er svakeste SG-område men får kun ${Math.round(andel * 100)}% av treningstid`,
            details: JSON.stringify({
              svakestOmraade: svakest,
              snittSg: snitt[svakest].toFixed(2),
              andelTrening: andel,
              totalMinutter,
              svakestMinutter,
            }),
          },
        })
        varsler++
      }
    }
  }

  return { varsler }
},
```

**Merk:** Importer `SgCategory` fra `@prisma/client` øverst i filen hvis ikke allerede importert.

- [ ] **Steg 4: Kjør typecheck**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Forventet: Ingen feil.

- [ ] **Steg 5: Kjør alle tester**

```bash
npx tsx --test src/lib/__tests__/**/*.test.ts 2>&1 | tail -15
```

Forventet: Alle tester passerer.

- [ ] **Steg 6: Commit og push**

```bash
git add src/app/api/cron/ prisma/schema.prisma prisma/migrations/
git commit -m "feat(cron): training-gap agent varsler coach når SG-svakhet ikke matches av treningsfokus"
git push origin main
```

---

## Verifikasjon etter fullføring

1. `npx tsc --noEmit` — ingen TypeScript-feil
2. `npx tsx --test src/lib/__tests__/**/*.test.ts` — alle tester grønne
3. Naviger til `/admin/spillere/[id]/fremgang` — SG-sparklines og volum-bars vises (evt. "ingen data" hvis ingen runder/logger)
4. POST til `/api/portal/trening/logg` med gyldig JSON — returnerer 201 og lagrer rad i DB
5. Kjør cron-agent `training-gap` manuelt: `curl -X POST /api/cron/training-gap` — returnerer `{ varsler: N }`
6. Sjekk at `SpillerKontekst` fra `byggSpillerKontekst()` inneholder `treningsVolum` og `korrelasjon`

---

## Self-review — spec vs plan

| Krav | Task |
|---|---|
| TrainingLog-modell med SgCategory, minutes, quality | Task 1 |
| Ukentlig volum per SG-kategori | Task 2 |
| Korrelasjon trening→SG neste uke | Task 3 |
| SpillerKontekst berikes | Task 4 |
| Coach fremgang-dashboard | Task 5 |
| Spiller quick-log | Task 6 |
| Plan-monitor treningsgap | Task 7 |
| Ingen `any` i TypeScript | Alle tasks — strict typer gjennomgående |
| TDD — failing test før implementering | Task 2 og 3 |
| Migrering | Task 1 og Task 7 steg 2 |
