# Sprint 2 — Adaptiv Plan-monitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygg et system som automatisk oppdager at en spiller taper slag i et SG-område, oppretter et plan-endringsforslag og lar coach godkjenne + generere ny plan med ett klikk.

**Architecture:** `signal-analysis.ts` beregner SG-trend per kategori fra `Round`-tabellen. `plan-monitor.ts`-agent itererer over alle aktive spillere, oppretter `PlanAction` (type `SG_ALERT`) i eksisterende tabell ved negativ trend. Nytt admin-panel viser ventende varsler med approve/reject — godkjenning trigger `genererPlan()` automatisk. Ingen nye DB-tabeller: `PlanAction` og `Round` er allerede i schema.

**Tech Stack:** Next.js 16 App Router, Prisma 7, eksisterende `runAgent()`-wrapper, eksisterende cron-arkitektur (`/api/cron/[agent]`), eksisterende `acceptPlanAction`/`rejectPlanAction` server-actions, Tailwind v4

---

## Filstruktur

| Fil | Handling | Ansvar |
|---|---|---|
| `src/lib/ai-plan/signal-analysis.ts` | CREATE | Beregn SG-trend for en spiller: siste 4 uker vs. forrige 4 uker per kategori |
| `src/lib/ai-plan/signal-analysis.test.ts` | CREATE | Unit-tester for trend-beregning |
| `src/lib/agents/plan-monitor.ts` | CREATE | Agent: iterer aktive spillere, opprett SG_ALERT PlanActions |
| `src/app/api/cron/[agent]/route.ts` | MODIFY | Legg til `"plan-monitor": runPlanMonitor` i AGENTS-map |
| `src/lib/agents/plan-monitor-actions.ts` | CREATE | Server action: godkjenn SG_ALERT + kall genererPlan() |
| `src/app/admin/varsler/page.tsx` | CREATE | Admin-side: vis ventende SG_ALERT-varsler per spiller |
| `src/app/admin/varsler/VarselKort.tsx` | CREATE | Client-komponent: enkelt varsel med godkjenn/avvis-knapper |

---

## Task 1: Signal-analyse — SG-trend per kategori

**Files:**
- Create: `src/lib/ai-plan/signal-analysis.ts`
- Create: `src/lib/ai-plan/signal-analysis.test.ts`

- [ ] **Steg 1: Skriv failing test**

```ts
// src/lib/ai-plan/signal-analysis.test.ts
import { describe, it, expect } from "vitest";
import { beregnSgTrend, type SgTrendResultat } from "./signal-analysis";

// Hjelpefunksjon: lag en simulert Round
function lagRunde(dagerSiden: number, sgPutt: number, sgApp: number) {
  const dato = new Date();
  dato.setDate(dato.getDate() - dagerSiden);
  return { playedAt: dato, sgPutt, sgApp, sgArg: null, sgOtt: null };
}

describe("beregnSgTrend", () => {
  it("returnerer tom array hvis ingen runder", async () => {
    const res = await beregnSgTrend("user-1", []);
    expect(res).toEqual([]);
  });

  it("returnerer SG_PUTT-varsel ved negativ trend > terskel", async () => {
    // Siste 4 uker: dårlig putting (snitt -0.8)
    // Forrige 4 uker: OK putting (snitt -0.2)
    const runder = [
      // Siste 4 uker (0-28 dager siden)
      lagRunde(5, -0.8, 0.1),
      lagRunde(10, -0.9, 0.1),
      lagRunde(15, -0.7, 0.1),
      // Forrige 4 uker (28-56 dager siden)
      lagRunde(35, -0.2, 0.1),
      lagRunde(42, -0.1, 0.1),
      lagRunde(50, -0.3, 0.1),
    ];
    const res = await beregnSgTrend("user-1", runder);
    const puttVarsel = res.find((r) => r.sgKategori === "sgPutt");
    expect(puttVarsel).toBeDefined();
    expect(puttVarsel!.trend).toBeLessThan(-0.25); // terskel
    expect(puttVarsel!.erNegativ).toBe(true);
  });

  it("returnerer ikke varsel ved positiv trend", async () => {
    const runder = [
      lagRunde(5, 0.4, 0.0),
      lagRunde(15, 0.3, 0.0),
      lagRunde(35, -0.1, 0.0),
      lagRunde(45, 0.0, 0.0),
    ];
    const res = await beregnSgTrend("user-1", runder);
    const puttVarsel = res.find((r) => r.sgKategori === "sgPutt");
    expect(puttVarsel).toBeUndefined(); // positiv trend → ingen varsel
  });

  it("returnerer ikke varsel ved for få runder i en periode", async () => {
    // Bare runder i siste 4 uker, ingen i forrige
    const runder = [
      lagRunde(5, -0.8, 0.0),
      lagRunde(10, -0.9, 0.0),
    ];
    const res = await beregnSgTrend("user-1", runder);
    expect(res).toEqual([]); // trenger minst 2 runder per periode
  });
});
```

- [ ] **Steg 2: Kjør test — verifiser FAIL**

```bash
cd /Users/anderskristiansen/Developer/akgolf-hq/.worktrees/feat-sprint2-plan-monitor && npx vitest run src/lib/ai-plan/signal-analysis.test.ts 2>&1 | tail -8
```

Forventet: FAIL — "Cannot find module './signal-analysis'"

- [ ] **Steg 3: Implementer signal-analysis.ts**

```ts
// src/lib/ai-plan/signal-analysis.ts
// Beregner SG-trend per kategori basert på runde-historikk.
// Sammenligner siste 4 uker vs. forrige 4 uker.
// Returnerer kun kategorier med negativ trend over TERSKEL.

export type SgKategori = "sgPutt" | "sgArg" | "sgApp" | "sgOtt";

export const SG_KATEGORIER: SgKategori[] = ["sgPutt", "sgArg", "sgApp", "sgOtt"];

export const SG_KATEGORI_NAVN: Record<SgKategori, string> = {
  sgPutt: "Putting (SG:PUTT)",
  sgArg: "Rundt green (SG:ARG)",
  sgApp: "Tilnærming (SG:APP)",
  sgOtt: "Fra tee (SG:OTT)",
};

// Negativ trend strengere enn dette → opprett varsel
const NEGATIV_TERSKEL = -0.25;

// Minimum runder per periode for å beregne troverdig trend
const MIN_RUNDER_PER_PERIODE = 2;

export type SgTrendResultat = {
  sgKategori: SgKategori;
  kategoriNavn: string;
  snittSiste4Uker: number;
  snittForrige4Uker: number;
  trend: number; // snittSiste4 - snittForrige4 (negativt = verre)
  erNegativ: boolean;
};

type RundeMedSg = {
  playedAt: Date;
  sgPutt: number | null;
  sgArg: number | null;
  sgApp: number | null;
  sgOtt: number | null;
};

function snitt(verdier: number[]): number {
  if (verdier.length === 0) return 0;
  return verdier.reduce((a, b) => a + b, 0) / verdier.length;
}

export async function beregnSgTrend(
  _userId: string,
  runder: RundeMedSg[]
): Promise<SgTrendResultat[]> {
  if (runder.length === 0) return [];

  const now = new Date();
  const fireUkerSiden = new Date(now);
  fireUkerSiden.setDate(fireUkerSiden.getDate() - 28);
  const atteUkerSiden = new Date(now);
  atteUkerSiden.setDate(atteUkerSiden.getDate() - 56);

  const siste4 = runder.filter(
    (r) => r.playedAt >= fireUkerSiden && r.playedAt <= now
  );
  const forrige4 = runder.filter(
    (r) => r.playedAt >= atteUkerSiden && r.playedAt < fireUkerSiden
  );

  const resultater: SgTrendResultat[] = [];

  for (const kat of SG_KATEGORIER) {
    const siste4Verdier = siste4
      .map((r) => r[kat])
      .filter((v): v is number => v !== null);
    const forrige4Verdier = forrige4
      .map((r) => r[kat])
      .filter((v): v is number => v !== null);

    if (
      siste4Verdier.length < MIN_RUNDER_PER_PERIODE ||
      forrige4Verdier.length < MIN_RUNDER_PER_PERIODE
    ) {
      continue;
    }

    const snittSiste = snitt(siste4Verdier);
    const snittForrige = snitt(forrige4Verdier);
    const trend = snittSiste - snittForrige;

    if (trend < NEGATIV_TERSKEL) {
      resultater.push({
        sgKategori: kat,
        kategoriNavn: SG_KATEGORI_NAVN[kat],
        snittSiste4Uker: snittSiste,
        snittForrige4Uker: snittForrige,
        trend,
        erNegativ: true,
      });
    }
  }

  // Sorter etter verst trend først
  return resultater.sort((a, b) => a.trend - b.trend);
}
```

- [ ] **Steg 4: Kjør test — verifiser PASS**

```bash
npx vitest run src/lib/ai-plan/signal-analysis.test.ts 2>&1 | tail -8
```

Forventet: PASS (4 tester)

- [ ] **Steg 5: Commit**

```bash
git add src/lib/ai-plan/signal-analysis.ts src/lib/ai-plan/signal-analysis.test.ts
git commit -m "feat(ai-plan): add SG trend signal analysis"
```

---

## Task 2: Plan-monitor agent

**Files:**
- Create: `src/lib/agents/plan-monitor.ts`
- Modify: `src/app/api/cron/[agent]/route.ts` (legg til i AGENTS-map)

- [ ] **Steg 1: Implementer plan-monitor.ts**

```ts
// src/lib/agents/plan-monitor.ts
// Cron-agent som kjøres ukentlig (mandag 07:00).
// Sjekker SG-trend for alle spillere med nok runde-data.
// Oppretter PlanAction (type SG_ALERT) ved negativ trend.
// Deduplicerer: maks 1 SG_ALERT per spiller+kategori per 14 dager.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { beregnSgTrend, type SgKategori } from "@/lib/ai-plan/signal-analysis";

export const AGENT_NAME = "plan-monitor";

// Antall dager mellom gjentatte varsler for samme spiller+kategori
const DEDUP_DAGER = 14;

export async function runPlanMonitor(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // Hent alle aktive spillere med aktiv plan
    const spillere = await prisma.user.findMany({
      where: {
        role: "PLAYER",
        trainingPlans: { some: { isActive: true } },
      },
      select: { id: true, name: true },
    });

    let opprettet = 0;

    for (const spiller of spillere) {
      // Hent siste 56 dager med runder (8 uker)
      const atteUkerSiden = new Date();
      atteUkerSiden.setDate(atteUkerSiden.getDate() - 56);

      const runder = await prisma.round.findMany({
        where: {
          userId: spiller.id,
          playedAt: { gte: atteUkerSiden },
        },
        select: {
          playedAt: true,
          sgPutt: true,
          sgArg: true,
          sgApp: true,
          sgOtt: true,
        },
        orderBy: { playedAt: "desc" },
      });

      if (runder.length < 4) continue; // for lite data

      const trendsomBorVarsles = await beregnSgTrend(spiller.id, runder);

      for (const trend of trendsomBorVarsles) {
        // Dedup: finnes det allerede en ventende SG_ALERT for denne kategorien?
        const dedupDato = new Date();
        dedupDato.setDate(dedupDato.getDate() - DEDUP_DAGER);

        const eksisterende = await prisma.planAction.findFirst({
          where: {
            userId: spiller.id,
            actionType: "SG_ALERT",
            status: "PENDING",
            createdAt: { gte: dedupDato },
            suggestion: {
              path: ["sgKategori"],
              equals: trend.sgKategori,
            },
          },
        });
        if (eksisterende) continue;

        await prisma.planAction.create({
          data: {
            userId: spiller.id,
            actionType: "SG_ALERT",
            agentName: AGENT_NAME,
            suggestion: {
              sgKategori: trend.sgKategori,
              kategoriNavn: trend.kategoriNavn,
              snittSiste4Uker: Math.round(trend.snittSiste4Uker * 100) / 100,
              snittForrige4Uker: Math.round(trend.snittForrige4Uker * 100) / 100,
              trend: Math.round(trend.trend * 100) / 100,
              spillerNavn: spiller.name,
              foreslattPrompt: `SG-analyse: ${trend.kategoriNavn} har hatt negativ trend på ${trend.trend.toFixed(2)} slag/runde siste 4 uker. Juster treningsplanen til å øke fokus på dette området med ${Math.round(Math.abs(trend.trend) * 30)}% mer tid de neste 4 ukene.`,
            },
          },
        });
        opprettet++;
      }
    }

    return { planActionsWritten: opprettet };
  });
}
```

- [ ] **Steg 2: Legg til i cron-ruten**

Åpne `src/app/api/cron/[agent]/route.ts`. Legg til import og registrering:

```ts
// Legg til import øverst (med de andre importene):
import { runPlanMonitor } from "@/lib/agents/plan-monitor";

// Legg til i AGENTS-objektet:
const AGENTS: Record<string, () => Promise<unknown>> = {
  "plan-watcher": runPlanWatcher,
  "booking-reminders": runBookingReminders,
  "cleanup-recordings": runCleanupRecordings,
  "refresh-calendar-watches": runRefreshCalendarWatches,
  "sg-insights": runSgInsights,
  "datagolf-sync": syncDataGolf,
  "club-trends": runClubTrends,
  "plan-monitor": runPlanMonitor,  // ← legg til denne linjen
};
```

- [ ] **Steg 3: TypeScript-sjekk**

```bash
cd /Users/anderskristiansen/Developer/akgolf-hq/.worktrees/feat-sprint2-plan-monitor && npx tsc --noEmit 2>&1 | grep -v node_modules
```

Forventet: 0 feil

- [ ] **Steg 4: Commit**

```bash
git add src/lib/agents/plan-monitor.ts src/app/api/cron/\[agent\]/route.ts
git commit -m "feat(agents): add plan-monitor SG alert agent + cron registration"
```

---

## Task 3: Server action — godkjenn og generer plan

**Files:**
- Create: `src/lib/agents/plan-monitor-actions.ts`

Når coach godkjenner et SG_ALERT, skal `genererPlan()` kalles automatisk med en prompt som fokuserer på det svake SG-området.

- [ ] **Steg 1: Implementer plan-monitor-actions.ts**

```ts
// src/lib/agents/plan-monitor-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { genererPlan } from "@/lib/ai-plan/generate";

type SgAlertSuggestion = {
  sgKategori: string;
  kategoriNavn: string;
  trend: number;
  spillerNavn: string;
  foreslattPrompt: string;
};

export async function godkjennSgAlertOgGenererPlan(actionId: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
    include: { user: { select: { id: true } } },
  });
  if (!action || action.actionType !== "SG_ALERT") {
    throw new Error("not-found-or-wrong-type");
  }
  if (action.status !== "PENDING") return;

  const suggestion = action.suggestion as SgAlertSuggestion;

  // Marker som godkjent
  await prisma.planAction.update({
    where: { id: actionId },
    data: { status: "ACCEPTED" },
  });

  // Finn første coach (Anders er default)
  const coach = await prisma.user.findFirst({
    where: { role: "COACH" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!coach) throw new Error("ingen-coach");

  // Generer ny plan med fokus på det svake SG-området
  await genererPlan({
    userId: action.userId,
    coachId: coach.id,
    brukerPrompt: suggestion.foreslattPrompt,
  });

  revalidatePath("/admin/varsler");
}

export async function avvisSgAlert(actionId: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");

  await prisma.planAction.update({
    where: { id: actionId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin/varsler");
}
```

- [ ] **Steg 2: TypeScript-sjekk**

```bash
npx tsc --noEmit 2>&1 | grep -v node_modules
```

Forventet: 0 feil

- [ ] **Steg 3: Commit**

```bash
git add src/lib/agents/plan-monitor-actions.ts
git commit -m "feat(agents): add SG alert approval + auto plan generation server action"
```

---

## Task 4: Coach admin-side — SG-varsler

**Files:**
- Create: `src/app/admin/varsler/page.tsx`
- Create: `src/app/admin/varsler/VarselKort.tsx`

- [ ] **Steg 1: Implementer VarselKort.tsx (client-komponent)**

```tsx
// src/app/admin/varsler/VarselKort.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { TrendingDown, Check, X } from "lucide-react";
import { godkjennSgAlertOgGenererPlan, avvisSgAlert } from "@/lib/agents/plan-monitor-actions";

type SgAlertSuggestion = {
  sgKategori: string;
  kategoriNavn: string;
  snittSiste4Uker: number;
  snittForrige4Uker: number;
  trend: number;
  spillerNavn: string;
  foreslattPrompt: string;
};

type Props = {
  actionId: string;
  spillerNavn: string;
  spillerHcp: number | null;
  suggestion: SgAlertSuggestion;
  opprettetDato: Date;
};

export function VarselKort({ actionId, spillerNavn, spillerHcp, suggestion, opprettetDato }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleGodkjenn() {
    startTransition(async () => {
      await godkjennSgAlertOgGenererPlan(actionId);
      router.refresh();
    });
  }

  function handleAvvis() {
    startTransition(async () => {
      await avvisSgAlert(actionId);
      router.refresh();
    });
  }

  const trendFmt = suggestion.trend >= 0 ? `+${suggestion.trend.toFixed(2)}` : suggestion.trend.toFixed(2);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
            <TrendingDown className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">{spillerNavn}</span>
              {spillerHcp !== null && (
                <span className="font-mono text-xs text-muted-foreground">
                  HCP {spillerHcp.toFixed(1)}
                </span>
              )}
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-destructive">
                {suggestion.kategoriNavn}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-3 text-sm text-muted-foreground">
              <span>
                Siste 4 uker:{" "}
                <span className="font-mono font-semibold text-destructive">
                  {suggestion.snittSiste4Uker >= 0
                    ? `+${suggestion.snittSiste4Uker.toFixed(2)}`
                    : suggestion.snittSiste4Uker.toFixed(2)}
                </span>
              </span>
              <span>
                Forrige 4 uker:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {suggestion.snittForrige4Uker >= 0
                    ? `+${suggestion.snittForrige4Uker.toFixed(2)}`
                    : suggestion.snittForrige4Uker.toFixed(2)}
                </span>
              </span>
              <span className="font-mono font-bold text-destructive">
                Trend: {trendFmt} SG/runde
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {opprettetDato.toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleGodkjenn}
            disabled={pending}
            title="Godkjenn — generer ny plan automatisk"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Godkjenn + generer plan
          </button>
          <button
            type="button"
            onClick={handleAvvis}
            disabled={pending}
            title="Avvis varsel"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            Avvis
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Steg 2: Implementer admin varsler-side**

```tsx
// src/app/admin/varsler/page.tsx
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { AlertTriangle } from "lucide-react";
import { VarselKort } from "./VarselKort";

export const dynamic = "force-dynamic";

type SgAlertSuggestion = {
  sgKategori: string;
  kategoriNavn: string;
  snittSiste4Uker: number;
  snittForrige4Uker: number;
  trend: number;
  spillerNavn: string;
  foreslattPrompt: string;
};

export default async function VarslerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const varsler = await prisma.planAction.findMany({
    where: {
      actionType: "SG_ALERT",
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, hcp: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin · Spilleroppfølging"
        titleLead="SG-"
        titleItalic="varsler"
        sub="Spillere med negativ SG-trend siste 4 uker. Godkjenn for å generere ny plan automatisk."
      />

      {varsler.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <AlertTriangle
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-sm font-medium text-foreground">Ingen aktive varsler</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Plan-monitor kjøres ukentlig og oppretter varsler når spillere taper slag.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {varsler.length} ventende varsel{varsler.length !== 1 ? "er" : ""}
          </p>
          {varsler.map((v) => (
            <VarselKort
              key={v.id}
              actionId={v.id}
              spillerNavn={v.user.name}
              spillerHcp={v.user.hcp}
              suggestion={v.suggestion as SgAlertSuggestion}
              opprettetDato={v.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Steg 3: TypeScript-sjekk**

```bash
npx tsc --noEmit 2>&1 | grep -v node_modules
```

Forventet: 0 feil

- [ ] **Steg 4: Commit**

```bash
git add src/app/admin/varsler/page.tsx src/app/admin/varsler/VarselKort.tsx
git commit -m "feat(admin): add SG alert monitoring panel with approve/reject flow"
```

---

## Task 5: Push og verifikasjon

- [ ] **Steg 1: Kjør alle tester**

```bash
npx vitest run src/lib/ai-plan/signal-analysis.test.ts
```

Forventet: 4 tester, alle PASS

- [ ] **Steg 2: TypeScript totalsjekk**

```bash
npx tsc --noEmit 2>&1 | grep -v node_modules
```

Forventet: 0 feil

- [ ] **Steg 3: Push branch**

```bash
git push origin feat/sprint2-plan-monitor
```

---

## Selvsjekk

**Spec coverage:**
- [x] SG-trend per kategori (sgPutt, sgArg, sgApp, sgOtt) — `signal-analysis.ts`
- [x] Terskel: -0.25 SG/runde → varsel
- [x] Minimumskrav: 2 runder per 4-ukers periode
- [x] Dedup: maks 1 aktiv SG_ALERT per spiller+kategori per 14 dager
- [x] Cron-trigger: `plan-monitor` i eksisterende AGENTS-map
- [x] Coach-visning: admin-side med alle PENDING SG_ALERT
- [x] Godkjenn → generer plan automatisk med fokusert prompt
- [x] Avvis → marker REJECTED

**Placeholder-scan:** Ingen TBD, ingen TODO — alle funksjoner er fullstendig implementert.

**Type-konsistens:** `SgAlertSuggestion` brukes konsistent i `plan-monitor.ts`, `plan-monitor-actions.ts` og `VarselKort.tsx`. `SgKategori`-typen er eneste kilde fra `signal-analysis.ts`.

**Ingen nye DB-tabeller:** Bruker eksisterende `PlanAction` (`actionType: "SG_ALERT"`), `Round`, `AgentRun`.

**Begrensning å vite om:** `beregnSgTrend()` tar runder som parameter (ikke userId) for enkel testing uten DB. `runPlanMonitor()` henter runder fra DB og kaller `beregnSgTrend()`.
