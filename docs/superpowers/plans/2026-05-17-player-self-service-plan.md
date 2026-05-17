# Player Self-Service Plan Generation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La spillere generere sin egen AI-treningsplan uten at coach trenger å trigge det — forutsetning for å skalere til 1000+ brukere.

**Architecture:** Ny `POST /api/portal/plan/generate` route (kun PLAYER-rolle, rate-limited til 1 kall per 7 dager). Gjenbruker `genererPlan()` med spillerens egen id. Ny "Generer plan"-knapp i `/portal/tren`. Onboarding-skjema for fasiliteter i `/portal/meg`.

**Tech Stack:** Next.js 16 App Router, Server Actions, eksisterende `genererPlan()` og `SpillerFasiliteter`, shadcn/ui, Tailwind v4

---

## Filstruktur

| Fil | Handling | Ansvar |
|---|---|---|
| `src/app/api/portal/plan/generate/route.ts` | CREATE | Player-trigget plan-generering, rate-limit, validering |
| `src/app/portal/tren/GenererPlanKnapp.tsx` | CREATE | Client-komponent: knapp + prompt-input + rate-limit-visning |
| `src/app/portal/meg/FasilitetSkjema.tsx` | CREATE | Skjema for å oppdatere fasilitets-preferences |
| `src/app/api/portal/preferences/fasiliteter/route.ts` | CREATE | PUT-endpoint for å lagre fasiliteter |

---

## Task 1: Player plan-generate API route

**Files:**
- Create: `src/app/api/portal/plan/generate/route.ts`

- [ ] **Steg 1: Skriv failing test**

```ts
// src/app/api/portal/plan/generate/route.test.ts
import { describe, it, expect, vi } from "vitest";

// Mock auth og genererPlan
vi.mock("@/lib/auth/getCurrentUser", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/lib/ai-plan/generate", () => ({
  genererPlan: vi.fn().mockResolvedValue({
    forslag: { tittel: "Test-plan", periodeUker: 4, okter: [] },
    generationId: "gen-123",
  }),
}));

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { POST } from "./route";

describe("POST /api/portal/plan/generate", () => {
  it("returnerer 403 for ikke-PLAYER", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "coach-1", role: "COACH"
    } as never);
    const req = new Request("http://localhost/api/portal/plan/generate", {
      method: "POST",
      body: JSON.stringify({ brukerPrompt: "Lag plan for meg" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returnerer 400 for for kort prompt", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "player-1", role: "PLAYER"
    } as never);
    const req = new Request("http://localhost/api/portal/plan/generate", {
      method: "POST",
      body: JSON.stringify({ brukerPrompt: "ok" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Steg 2: Kjør test — verifiser at den feiler**

```bash
npx vitest run src/app/api/portal/plan/generate/route.test.ts
```

Forventet: FAIL — "Cannot find module './route'"

- [ ] **Steg 3: Implementer route**

```ts
// src/app/api/portal/plan/generate/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { rateLimit } from "@/lib/rate-limit";
import { genererPlan } from "@/lib/ai-plan/generate";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 90;

// Spiller kan trigge plan maks 1 gang per 7 dager
const RATE_LIMIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 1;

export async function POST(req: Request) {
  const bruker = await getCurrentUser();
  if (!bruker || bruker.role !== "PLAYER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rl = await rateLimit({
    key: `portal-plan-generate:${bruker.id}`,
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!rl.ok) {
    const dagerIgjen = Math.ceil((rl.resetAt - Date.now()) / (1000 * 60 * 60 * 24));
    return NextResponse.json(
      { error: "rate-limited", dagerIgjen },
      { status: 429 }
    );
  }

  let body: { brukerPrompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  if (typeof body.brukerPrompt !== "string" || body.brukerPrompt.trim().length < 10) {
    return NextResponse.json({ error: "for-kort-prompt" }, { status: 400 });
  }

  // Finn coach-id (Anders er default coach)
  const coach = await prisma.user.findFirst({
    where: { role: "COACH" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!coach) {
    return NextResponse.json({ error: "ingen-coach" }, { status: 500 });
  }

  try {
    const resultat = await genererPlan({
      userId: bruker.id,
      coachId: coach.id,
      brukerPrompt: body.brukerPrompt,
    });
    return NextResponse.json(resultat);
  } catch (err) {
    const melding = err instanceof Error ? err.message : "AI-feil";
    return NextResponse.json({ error: melding }, { status: 500 });
  }
}
```

- [ ] **Steg 4: Kjør test — verifiser grønn**

```bash
npx vitest run src/app/api/portal/plan/generate/route.test.ts
```

Forventet: PASS (2 tester)

- [ ] **Steg 5: Commit**

```bash
git add src/app/api/portal/plan/generate/route.ts src/app/api/portal/plan/generate/route.test.ts
git commit -m "feat(portal): add player self-service plan generation endpoint"
```

---

## Task 2: GenererPlanKnapp-komponent

**Files:**
- Create: `src/app/portal/tren/GenererPlanKnapp.tsx`

- [ ] **Steg 1: Implementer komponent**

```tsx
// src/app/portal/tren/GenererPlanKnapp.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";

type Props = {
  harAktivPlan: boolean;
  dagerTilNesteMulig?: number; // null = kan generere nå
};

export function GenererPlanKnapp({ harAktivPlan, dagerTilNesteMulig }: Props) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [suksess, setSuksess] = useState(false);

  const kanGenerere = !dagerTilNesteMulig || dagerTilNesteMulig <= 0;

  async function handleGenerer() {
    if (!prompt.trim() || prompt.length < 10) {
      setFeil("Beskriv hva du vil jobbe med (minst 10 tegn)");
      return;
    }
    setLoading(true);
    setFeil(null);

    const res = await fetch("/api/portal/plan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brukerPrompt: prompt }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setFeil(`Du kan generere ny plan om ${data.dagerIgjen ?? "noen"} dager.`);
      } else {
        setFeil("Noe gikk galt. Prøv igjen.");
      }
      return;
    }

    setSuksess(true);
    setTimeout(() => {
      setOpen(false);
      setSuksess(false);
      window.location.reload();
    }, 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={harAktivPlan ? "outline" : "default"}
          disabled={!kanGenerere}
          title={
            !kanGenerere
              ? `Du kan generere ny plan om ${dagerTilNesteMulig} dager`
              : "Generer AI-treningsplan"
          }
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {harAktivPlan ? "Ny plan" : "Generer plan"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generer AI-treningsplan</DialogTitle>
        </DialogHeader>

        {suksess ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Plan generert! Laster siden...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Beskriv hva du vil jobbe med, hvor mye tid du har og eventuelle
              begrensninger. AI-coachen bruker din profil og AK Golf sin
              MORAD-metodikk.
            </p>
            <Textarea
              placeholder="F.eks: Jeg vil jobbe med fullswing-teknikk og putting de neste 4 ukene. Har 3 timer per uke, kun Trackman om vinteren."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
            {feil && (
              <p className="text-sm text-destructive">{feil}</p>
            )}
            <Button
              onClick={handleGenerer}
              disabled={loading || prompt.length < 10}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Genererer...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generer plan
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Steg 2: Importer i `/portal/tren/page.tsx`**

Finn `src/app/portal/tren/page.tsx`. Legg til import og bruk komponenten:

```tsx
import { GenererPlanKnapp } from "./GenererPlanKnapp";

// I page-komponenten, etter eksisterende plan-card:
<GenererPlanKnapp
  harAktivPlan={!!aktivPlan}
  dagerTilNesteMulig={undefined} // TODO: hent fra rate-limit-status
/>
```

- [ ] **Steg 3: TypeScript-sjekk**

```bash
npx tsc --noEmit
```

- [ ] **Steg 4: Commit**

```bash
git add src/app/portal/tren/GenererPlanKnapp.tsx src/app/portal/tren/page.tsx
git commit -m "feat(portal): add self-service plan generation UI"
```

---

## Task 3: Fasilitets-skjema i Meg-siden

**Files:**
- Create: `src/app/portal/meg/FasilitetSkjema.tsx`
- Create: `src/app/api/portal/preferences/fasiliteter/route.ts`

- [ ] **Steg 1: Preferences-route**

```ts
// src/app/api/portal/preferences/fasiliteter/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { type SpillerFasiliteter } from "@/lib/preferences";

export async function PUT(req: Request) {
  const bruker = await getCurrentUser();
  if (!bruker) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let fasiliteter: SpillerFasiliteter;
  try {
    fasiliteter = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const eksisterende = await prisma.user.findUnique({
    where: { id: bruker.id },
    select: { preferences: true },
  });

  const gamlePrefs =
    eksisterende?.preferences && typeof eksisterende.preferences === "object"
      ? (eksisterende.preferences as Record<string, unknown>)
      : {};

  await prisma.user.update({
    where: { id: bruker.id },
    data: {
      preferences: {
        ...gamlePrefs,
        fasiliteter,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Steg 2: FasilitetSkjema-komponent**

```tsx
// src/app/portal/meg/FasilitetSkjema.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SpillerFasiliteter, DEFAULT_FASILITETER } from "@/lib/preferences";

type Props = {
  initial: SpillerFasiliteter;
};

export function FasilitetSkjema({ initial }: Props) {
  const [data, setData] = useState<SpillerFasiliteter>(initial);
  const [lagrer, setLagrer] = useState(false);
  const [lagret, setLagret] = useState(false);

  async function handleLagre() {
    setLagrer(true);
    await fetch("/api/portal/preferences/fasiliteter", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLagrer(false);
    setLagret(true);
    setTimeout(() => setLagret(false), 2000);
  }

  const fasilitetLabels: {
    key: keyof SpillerFasiliteter["hjemmeklubbFasiliteter"];
    label: string;
  }[] = [
    { key: "drivingRange", label: "Driving range" },
    { key: "puttingGreen", label: "Putting green" },
    { key: "chippingGreen", label: "Chipping green" },
    { key: "bunkergrop", label: "Bunkergrop" },
    { key: "simulator", label: "Simulator (innendørs)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium">
          Treningstimer per uke: {data.treningtimerPerUke} timer
        </Label>
        <Slider
          min={1}
          max={20}
          step={0.5}
          value={[data.treningtimerPerUke]}
          onValueChange={([v]) =>
            setData((d) => ({ ...d, treningtimerPerUke: v ?? d.treningtimerPerUke }))
          }
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">
          Fasiliteter på hjemmeklubb
        </Label>
        <div className="space-y-2">
          {fasilitetLabels.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={data.hjemmeklubbFasiliteter[key]}
                onCheckedChange={(v) =>
                  setData((d) => ({
                    ...d,
                    hjemmeklubbFasiliteter: {
                      ...d.hjemmeklubbFasiliteter,
                      [key]: !!v,
                    },
                  }))
                }
              />
              <label htmlFor={key} className="text-sm cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Trackman-tilgang</Label>
        <Select
          value={data.trackmanTilgang}
          onValueChange={(v) =>
            setData((d) => ({
              ...d,
              trackmanTilgang: v as SpillerFasiliteter["trackmanTilgang"],
            }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ingen">Ingen</SelectItem>
            <SelectItem value="vinter">Kun om vinteren</SelectItem>
            <SelectItem value="helaar">Helår</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleLagre} disabled={lagrer}>
        {lagrer ? "Lagrer..." : lagret ? "Lagret" : "Lagre fasiliteter"}
      </Button>
    </div>
  );
}
```

- [ ] **Steg 3: Importer i `/portal/meg/page.tsx`**

Legg til `<FasilitetSkjema initial={fasiliteter} />` i Meg-siden under "Min profil"-seksjonen. Hent `fasiliteter` via `lesFasiliteter(user.preferences)` server-side.

- [ ] **Steg 4: TypeScript-sjekk og commit**

```bash
npx tsc --noEmit
git add src/app/portal/meg/FasilitetSkjema.tsx src/app/api/portal/preferences/fasiliteter/route.ts src/app/portal/meg/page.tsx
git commit -m "feat(portal): add facility onboarding form in player profile"
```

---

## Selvsjekk

**Spec coverage:**
- [x] Player-trigget plan-generering (rate-limited)
- [x] UI-knapp i /portal/tren
- [x] Fasilitets-onboarding i /portal/meg
- [x] Preferences-API for lagring

**Avhengighet:** Kjør `2026-05-17-vault-knowledge-tools.md` først — `facility-context.ts` og `SpillerFasiliteter` må eksistere.
