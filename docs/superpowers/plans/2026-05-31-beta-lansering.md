# AK Golf HQ — Beta-lansering: Komplett plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gjøre akgolf-hq 100% produksjonsklar — lukke alle kjente kodebug, manuell go-live sjekkliste og Workbench Plan A Sprint 1.

**Architecture:** Tre uavhengige sprinter. Sprint A er kode (Claude gjør det). Sprint B er manuelle handlinger i dashboards (Anders gjør det). Sprint C er ny feature (Workbench). Kjøres i rekkefølge A → B → C.

**Tech Stack:** Next.js 16 App Router, Prisma 7, Supabase Postgres, Tailwind v4, TypeScript strict, Lucide React.

---

## Forutsetninger — verifisert allerede OK

Disse ble bekreftet i sikkerheitsaudit og go-live sjekkliste. **Ikke gjør noe her.**

- Next.js er `^16.2.6` (K-6 lukket)
- Open redirect bruker `safeRedirectPath` (K-7 lukket)
- `signOut({ scope: "global" })` brukes (H-7 lukket)
- Security headers (HSTS, CSP, X-Frame-Options etc.) er aktive i prod
- RLS er aktivert på alle 22 tabeller

---

## SPRINT A — Kode-fikser (Claude, ~2–3 timer)

### Task 1: Lukk 3 døde lenker

**Filer:**
- Modify: `src/components/portal/sidebar.tsx`
- Modify: `src/app/portal/reach/page.tsx`
- Modify: `src/app/portal/meg/help/artikkel/[slug]/page.tsx`

- [ ] **Steg 1: Fiks `/portal/profil` → `/portal/meg` i sidebar**

Åpne `src/components/portal/sidebar.tsx`. Finn:
```tsx
href="/portal/profil"
```
Bytt til:
```tsx
href="/portal/meg"
```

- [ ] **Steg 2: Fiks `/portal/innstillinger` → `/portal/meg/innstillinger` i reach/page.tsx**

Åpne `src/app/portal/reach/page.tsx`. Finn:
```tsx
href="/portal/innstillinger"
```
Bytt til:
```tsx
href="/portal/meg/innstillinger"
```

- [ ] **Steg 3: Fiks `/portal/meldinger/ny` → `/portal/coach/melding/ny` i help-artikkel**

Åpne `src/app/portal/meg/help/artikkel/[slug]/page.tsx`. Finn:
```tsx
href="/portal/meldinger/ny"
```
Bytt til:
```tsx
href="/portal/coach/melding/ny"
```

- [ ] **Steg 4: Verifiser med audit-script**
```bash
cd /Users/anderskristiansen/Developer/akgolf-hq
npx tsx scripts/audit-portal-links.ts 2>&1 | grep "Døde lenker:"
```
Forventet output: `Døde lenker: 0`

- [ ] **Steg 5: Commit**
```bash
git add src/components/portal/sidebar.tsx \
  src/app/portal/reach/page.tsx \
  "src/app/portal/meg/help/artikkel/[slug]/page.tsx"
git commit -m "fix(nav): lukk 3 døde lenker (profil→meg, innstillinger, meldinger/ny)"
```

---

### Task 2: Quick UI — Coach-lenke skjult + sentrert auth

**Filer:**
- Modify: `src/app/(marketing)/page.tsx` (Coach-seksjon)
- Modify: `src/app/auth/login/page.tsx` eller `login-form.tsx`

- [ ] **Steg 1: Sjekk hva Coach-knapp gjør i dag**
```bash
grep -n "coach\|Coach\|COACH" src/app/\(marketing\)/page.tsx | head -20
```

- [ ] **Steg 2: Skjul CoachHQ-tilgang på marketing-siden**

I `src/app/(marketing)/page.tsx`, finn seksjonen som lenker til `/admin`. Wrap den med en kommentar/skjul den for offentlig publikum ved å legge til `hidden`-attributt eller fjern lenken:
```tsx
{/* Coach-tilgang — skjult fra marketing inntil betaen åpner */}
{/* <Link href="/admin">For coacher →</Link> */}
```

- [ ] **Steg 3: Verifiser auth-sidesentrering**
```bash
grep -n "flex\|center\|justify" src/app/auth/login/login-form.tsx | head -10
```
Hvis login-skjema ikke er sentrert: wrapper skal ha `min-h-screen flex items-center justify-center`.

- [ ] **Steg 4: Commit**
```bash
git add src/app/\(marketing\)/page.tsx src/app/auth/login/login-form.tsx
git commit -m "fix(ui): skjul coach-lenke fra marketing, sentrert auth-skjema"
```

---

### Task 3: Sanitize dangerouslySetInnerHTML på AI-generert summary

**Fil:** `src/app/(marketing)/stats/sammenlign-spillere/resultat.tsx:842`

- [ ] **Steg 1: Installer DOMPurify**
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

- [ ] **Steg 2: Importer og bruk DOMPurify**

Øverst i `src/app/(marketing)/stats/sammenlign-spillere/resultat.tsx`:
```tsx
import DOMPurify from "dompurify";
```

Finn linje 842 med:
```tsx
dangerouslySetInnerHTML={{ __html: summary }}
```
Bytt til:
```tsx
dangerouslySetInnerHTML={{
  __html: typeof window !== "undefined"
    ? DOMPurify.sanitize(summary, { ALLOWED_TAGS: ["em", "strong", "br"] })
    : summary,
}}
```

- [ ] **Steg 3: Verifiser at tsc passerer**
```bash
npx tsc --noEmit 2>&1 | grep "resultat"
```
Forventet: ingen output (ingen feil).

- [ ] **Steg 4: Commit**
```bash
git add src/app/\(marketing\)/stats/sammenlign-spillere/resultat.tsx package.json package-lock.json
git commit -m "security: sanitize dangerouslySetInnerHTML med DOMPurify (XSS)"
```

---

### Task 4: Booking race condition — unique constraint på slot

**Kontekst:** To samtidige klikk kan booke samme slot. Løsning: unique index i Postgres + retry-guard i server action.

**Filer:**
- Create: `prisma/migrations/YYYYMMDD_booking_unique_slot/migration.sql`
- Modify: Server action for booking (finn med grep)

- [ ] **Steg 1: Finn booking server action**
```bash
grep -rn "status.*PENDING\|createBooking\|Booking.*create" src/ --include="*.ts" | grep "action\|server" | head -10
```

- [ ] **Steg 2: Lag migrasjon for unique constraint**
```bash
npx prisma migrate dev --name booking_unique_slot_user
```

Legg til i schema.prisma under `Booking`-modellen:
```prisma
@@unique([facilityId, startTime, userId], name: "booking_unique_slot_user")
```

- [ ] **Steg 3: Wrap server action i try/catch for P2002**

I booking server action, wrap `prisma.booking.create(...)`:
```ts
try {
  const booking = await prisma.booking.create({ ... });
  return { ok: true, booking };
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return { ok: false, error: "Denne timen er allerede booket. Velg en annen tid." };
  }
  throw e;
}
```

- [ ] **Steg 4: Verifiser migrasjon**
```bash
npx prisma migrate status
npx tsc --noEmit 2>&1 | tail -5
```

- [ ] **Steg 5: Commit**
```bash
git add prisma/ src/
git commit -m "fix(booking): unique constraint mot race condition ved dobbel-booking (P2002)"
```

---

### Task 5: Verifiser og commit design-system-status

- [ ] **Steg 1: Full verifikasjon**
```bash
npx prisma validate
npx tsc --noEmit
npm run lint 2>&1 | tail -3
```
Forventet: 0 errors, ≤ 723 warnings (alle no-restricted-syntax, ingen errors).

- [ ] **Steg 2: Push**
```bash
git push origin main
```

---

## SPRINT B — Manuelle handlinger (Anders, ~1.5 timer i nettleser)

**Disse gjøres av Anders direkte i dashboards. Ingen kode.**

### B1: www.akgolf.no-redirect (KRITISK — nå peker den til Acuity)

- [ ] Vercel → Project → Settings → Domains → legg til `www.akgolf.no`
- [ ] Sett `www.akgolf.no` til å redirecte til `akgolf.no` (301)
- [ ] Hos domeneleverandør (hyp.net): fjern gammel CNAME for `www` som peker til Acuity
- [ ] Test: `https://www.akgolf.no` → skal lande på `https://akgolf.no`

### B2: `NEXT_PUBLIC_APP_URL` i Vercel (KRITISK — robots/sitemap er feil)

- [ ] Vercel → Project → Settings → Environment Variables → Production
- [ ] Sett `NEXT_PUBLIC_APP_URL` = `https://akgolf.no`
- [ ] Redeploy (trigger ny deploy fra Vercel-dashboard eller `git commit --allow-empty && git push`)

### B3: Stripe LIVE-modus

- [ ] Stripe Dashboard → bytt til **Live mode**
- [ ] Developers → Webhooks → Add endpoint: `https://akgolf.no/api/stripe/webhook`
- [ ] Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
- [ ] Kopier Signing secret (whsec_…) → Vercel: `STRIPE_WEBHOOK_SECRET`
- [ ] Test: ett ekte kjøp (bruk en test-kupong eller 1 kr) → verifiser abonnement i appen

### B4: Supabase — leaked password protection

- [ ] Supabase Dashboard → Authentication → Password → skru på **"Leaked password protection"**

### B5: E-post DNS (Resend)

- [ ] Resend → Domains → Add domain `akgolf.no`
- [ ] Legg inn **SPF + DKIM** DNS-records hos domeneleverandør (hyp.net)
- [ ] Send test-signup → bekreft at e-post lander i innboks (ikke spam)

### B6: Backups

- [ ] Supabase → Database → Backups → verifiser at automatisk backup / PITR er aktivert

### B7: Smoke-test

- [ ] `bash /Users/anderskristiansen/Developer/akgolf-hq/scripts/smoke-test.sh` → alle PASS
- [ ] Manuell flyt:
  - [ ] Signup → e-postbekreftelse → onboarding (spiller)
  - [ ] Booking drop-in → betaling (test) → bekreftelse-e-post
  - [ ] PlayerHQ hjem laster med ekte data
  - [ ] CoachHQ dashboard + spillerliste laster
- [ ] Vercel → Observability: bekreft at Sentry-feil fanges

---

## SPRINT C — Workbench Plan A Sprint 1 (Claude, ~10–15 timer)

**Kontekst:** Workbench er det sentrale planleggingsverktøyet for spillere (`/portal/planlegge/workbench`). Fase 1-3 gir en demonterbar versjon med chrome, canvas og session-drawer. Fullstendig plan er allerede skrevet — dette er et sammendrag med de viktigste filene.

**Eksisterende plan:** `~/.claude/plans/prancy-wishing-sonnet.md`

### C1: Rute + layout

**Nye filer:**
- `src/app/portal/planlegge/workbench/page.tsx`
- `src/app/portal/planlegge/workbench/layout.tsx`
- `src/components/portal-planlegge/workbench/workbench-shell.tsx`

- [ ] **Steg 1: Opprett rute**

`src/app/portal/planlegge/workbench/page.tsx`:
```tsx
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import { WorkbenchShell } from "@/components/portal-planlegge/workbench/workbench-shell";

export const dynamic = "force-dynamic";

export default async function WorkbenchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return <WorkbenchShell userId={user.id} />;
}
```

- [ ] **Steg 2: Opprett layout (full-bredde, uten standard portal-sidebar)**

`src/app/portal/planlegge/workbench/layout.tsx`:
```tsx
export default function WorkbenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {children}
    </div>
  );
}
```

- [ ] **Steg 3: Commit**
```bash
git add src/app/portal/planlegge/workbench/
git commit -m "feat(workbench): rute + full-bredde layout"
```

### C2: PlanContext + typer

**Ny fil:** `src/components/portal-planlegge/workbench/types.ts`

- [ ] **Steg 1: Opprett types.ts med all state**

```ts
export type ZoomLevel = "year" | "period" | "month" | "week" | "day";
export type AxisKey = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type ModalType = "period" | "camp" | "freq" | "facilities" | "testpicker" | null;

export type WBP_Session = {
  id: string;
  weekNumber: number;
  dayOfWeek: number; // 0=man, 6=søn
  axis: AxisKey;
  title: string;
  durationMinutes: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  location?: string;
};

export type WBP_Period = {
  id: string;
  name: string;
  startWeek: number;
  endWeek: number;
  color: string;
};

export type PlanContextValue = {
  zoom: ZoomLevel;
  setZoom: (z: ZoomLevel) => void;
  activeWeek: number | null;
  setActiveWeek: (w: number | null) => void;
  activePeriod: string | null;
  setActivePeriod: (id: string | null) => void;
  openModal: ModalType;
  setOpenModal: (m: ModalType) => void;
  selectedSession: WBP_Session | null;
  setSelectedSession: (s: WBP_Session | null) => void;
  planVariant: "A" | "B";
  setPlanVariant: (v: "A" | "B") => void;
};
```

- [ ] **Steg 2: Opprett PlanContext**

`src/components/portal-planlegge/workbench/plan-context.tsx`:
```tsx
"use client";
import { createContext, useContext, useState } from "react";
import type { PlanContextValue, ZoomLevel, ModalType, WBP_Session } from "./types";

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [zoom, setZoom] = useState<ZoomLevel>("period");
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [selectedSession, setSelectedSession] = useState<WBP_Session | null>(null);
  const [planVariant, setPlanVariant] = useState<"A" | "B">("A");

  return (
    <PlanContext.Provider value={{
      zoom, setZoom, activeWeek, setActiveWeek, activePeriod, setActivePeriod,
      openModal, setOpenModal, selectedSession, setSelectedSession,
      planVariant, setPlanVariant,
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

- [ ] **Steg 3: Commit**
```bash
git add src/components/portal-planlegge/workbench/
git commit -m "feat(workbench): PlanContext + typer"
```

### C3: Topbar, Zoombar, AIBar, Sidebar (chrome)

**Nye filer:**
- `src/components/portal-planlegge/workbench/topbar.tsx`
- `src/components/portal-planlegge/workbench/zoombar.tsx`
- `src/components/portal-planlegge/workbench/aibar.tsx`
- `src/components/portal-planlegge/workbench/sidebar.tsx`

Bruk design-spec fra `public/design-handover/Workbench Plan A.html` som visuell referanse. Fargene er fra designsystem-tokens i `globals.css`.

- [ ] **Steg 1: Topbar**

`src/components/portal-planlegge/workbench/topbar.tsx`:
```tsx
"use client";
import { Settings, Bell, Share2, Users } from "lucide-react";
import Link from "next/link";
import { usePlan } from "./plan-context";

export function WBP_Topbar() {
  const { planVariant, setPlanVariant } = usePlan();
  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Planlegge
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="font-display text-sm font-semibold text-foreground">
          Workbench
        </span>
        <div className="ml-4 flex gap-1 rounded-md border border-border p-0.5">
          {(["A", "B"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setPlanVariant(v)}
              className={`rounded px-2 py-0.5 font-mono text-xs font-semibold transition-colors ${
                planVariant === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Plan {v}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/portal/varsler" className="rounded p-1.5 hover:bg-muted">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link href="/portal/meg/innstillinger" className="rounded p-1.5 hover:bg-muted">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Link>
        <button
          className="rounded p-1.5 hover:bg-muted"
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          title="Del plan"
        >
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Steg 2: Zoombar**

`src/components/portal-planlegge/workbench/zoombar.tsx`:
```tsx
"use client";
import { usePlan } from "./plan-context";
import type { ZoomLevel } from "./types";

const ZOOMS: { key: ZoomLevel; label: string }[] = [
  { key: "year", label: "År" },
  { key: "period", label: "Periode" },
  { key: "month", label: "Måned" },
  { key: "week", label: "Uke" },
  { key: "day", label: "Dag" },
];

export function WBP_Zoombar() {
  const { zoom, setZoom } = usePlan();
  return (
    <div className="flex h-10 items-center gap-1 border-b border-border bg-card px-4">
      {ZOOMS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setZoom(key)}
          className={`rounded px-3 py-1 font-mono text-xs font-medium transition-colors ${
            zoom === key
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Steg 3: AIBar**

`src/components/portal-planlegge/workbench/aibar.tsx`:
```tsx
"use client";
import { Sparkles } from "lucide-react";
import { usePlan } from "./plan-context";

export function WBP_AIBar() {
  const { setOpenModal } = usePlan();
  return (
    <div className="flex h-10 items-center gap-2 border-b border-border bg-accent/5 px-4">
      <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
      <span className="font-mono text-xs text-muted-foreground">Caddie:</span>
      <div className="flex gap-1">
        {[
          { label: "Generér uke", modal: "freq" as const },
          { label: "Balansér periode", modal: "freq" as const },
          { label: "Foreslå taper", modal: "freq" as const },
        ].map(({ label, modal }) => (
          <button
            key={label}
            onClick={() => setOpenModal(modal)}
            className="rounded-full border border-border bg-card px-3 py-0.5 font-mono text-xs text-foreground hover:bg-muted"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Steg 4: Sidebar (sesong-tre)**

`src/components/portal-planlegge/workbench/sidebar.tsx`:
```tsx
"use client";
import { ChevronRight, Plus } from "lucide-react";
import { usePlan } from "./plan-context";

const WEEKS = Array.from({ length: 52 }, (_, i) => i + 1);
const PERIODS = [
  { id: "p1", name: "Periode 1 — Grunntreningning", startWeek: 1, endWeek: 12 },
  { id: "p2", name: "Periode 2 — Konkurransebygging", startWeek: 13, endWeek: 24 },
  { id: "p3", name: "Periode 3 — Konkurransesesong", startWeek: 25, endWeek: 40 },
  { id: "p4", name: "Periode 4 — Nedtrapping", startWeek: 41, endWeek: 52 },
];

export function WBP_Sidebar() {
  const { activePeriod, setActivePeriod, setActiveWeek, setOpenModal } = usePlan();

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Sesong 2026
        </span>
        <button
          onClick={() => setOpenModal("period")}
          className="rounded p-1 hover:bg-muted"
          title="Ny periode"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 py-2">
        {PERIODS.map((p) => (
          <div key={p.id}>
            <button
              onClick={() => setActivePeriod(activePeriod === p.id ? null : p.id)}
              className={`flex w-full items-center gap-1 px-3 py-1.5 text-left text-xs font-medium hover:bg-muted ${
                activePeriod === p.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <ChevronRight
                className={`h-3 w-3 transition-transform ${activePeriod === p.id ? "rotate-90" : ""}`}
              />
              {p.name}
            </button>
            {activePeriod === p.id && (
              <div className="ml-6 py-1">
                {WEEKS.filter((w) => w >= p.startWeek && w <= p.endWeek).map((w) => (
                  <button
                    key={w}
                    onClick={() => setActiveWeek(w)}
                    className="block w-full px-2 py-0.5 text-left font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    Uke {w}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-border p-3">
        <button
          onClick={() => setOpenModal("camp")}
          className="flex w-full items-center gap-1 rounded py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" /> Ny samling
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Steg 5: WorkbenchShell — sett det hele sammen**

`src/components/portal-planlegge/workbench/workbench-shell.tsx`:
```tsx
"use client";
import { PlanProvider } from "./plan-context";
import { WBP_Topbar } from "./topbar";
import { WBP_Zoombar } from "./zoombar";
import { WBP_AIBar } from "./aibar";
import { WBP_Sidebar } from "./sidebar";

export function WorkbenchShell({ userId }: { userId: string }) {
  return (
    <PlanProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <WBP_Topbar />
        <WBP_Zoombar />
        <WBP_AIBar />
        <div className="flex flex-1 overflow-hidden">
          <WBP_Sidebar />
          <main className="flex-1 overflow-auto bg-background p-6">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p className="font-mono text-sm">Canvas kommer i Task C4</p>
            </div>
          </main>
        </div>
      </div>
    </PlanProvider>
  );
}
```

- [ ] **Steg 6: Verifiser TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep "workbench"
```
Forventet: ingen feil.

- [ ] **Steg 7: Commit**
```bash
git add src/components/portal-planlegge/workbench/ src/app/portal/planlegge/workbench/
git commit -m "feat(workbench): chrome — Topbar, Zoombar, AIBar, Sidebar, WorkbenchShell (C3)"
```

---

### C4: Periode-canvas med mock-data

**Nye filer:**
- `src/components/portal-planlegge/workbench/canvas-periode.tsx`
- `src/components/portal-planlegge/workbench/session-card.tsx`
- `src/components/portal-planlegge/workbench/mock-data.ts`

- [ ] **Steg 1: Mock-data**

`src/components/portal-planlegge/workbench/mock-data.ts`:
```ts
import type { WBP_Session, WBP_Period, AxisKey } from "./types";

export const MOCK_PERIODS: WBP_Period[] = [
  { id: "p1", name: "Grunntreningning", startWeek: 1, endWeek: 12, color: "hsl(var(--primary))" },
  { id: "p2", name: "Konkurransebygging", startWeek: 13, endWeek: 24, color: "hsl(var(--accent))" },
];

export const MOCK_SESSIONS: WBP_Session[] = [
  { id: "s1", weekNumber: 2, dayOfWeek: 1, axis: "FYS", title: "Styrke A", durationMinutes: 60, intensity: 3 },
  { id: "s2", weekNumber: 2, dayOfWeek: 3, axis: "TEK", title: "Putting 30 min", durationMinutes: 30, intensity: 2 },
  { id: "s3", weekNumber: 2, dayOfWeek: 5, axis: "SLAG", title: "Banespill 9 hull", durationMinutes: 120, intensity: 4 },
  { id: "s4", weekNumber: 3, dayOfWeek: 2, axis: "FYS", title: "Kondis", durationMinutes: 45, intensity: 3 },
  { id: "s5", weekNumber: 3, dayOfWeek: 4, axis: "SPILL", title: "Strategi + chip", durationMinutes: 90, intensity: 3 },
];

export const AXIS_COLORS: Record<AxisKey, string> = {
  FYS:  "hsl(var(--primary))",
  TEK:  "#B8852A",
  SLAG: "#2563EB",
  SPILL: "hsl(var(--accent-foreground))",
  TURN: "#A32D2D",
};

export const AXIS_LABELS: Record<AxisKey, string> = {
  FYS: "Fysisk", TEK: "Teknisk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering",
};
```

- [ ] **Steg 2: SessionCard**

`src/components/portal-planlegge/workbench/session-card.tsx`:
```tsx
"use client";
import { usePlan } from "./plan-context";
import { AXIS_COLORS } from "./mock-data";
import type { WBP_Session } from "./types";

export function SessionCard({ session }: { session: WBP_Session }) {
  const { setSelectedSession } = usePlan();
  const color = AXIS_COLORS[session.axis];

  return (
    <button
      onClick={() => setSelectedSession(session)}
      className="w-full rounded border border-border bg-card px-2 py-1 text-left hover:border-foreground/20 hover:bg-muted transition-colors"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <p className="truncate text-xs font-medium text-foreground">{session.title}</p>
      <p className="font-mono text-[10px] text-muted-foreground">
        {session.durationMinutes} min · Int {session.intensity}
      </p>
    </button>
  );
}
```

- [ ] **Steg 3: Canvas-Periode**

`src/components/portal-planlegge/workbench/canvas-periode.tsx`:
```tsx
"use client";
import { MOCK_SESSIONS, AXIS_LABELS, AXIS_COLORS } from "./mock-data";
import { SessionCard } from "./session-card";
import type { AxisKey } from "./types";

const AXES: AxisKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const VISIBLE_WEEKS = Array.from({ length: 8 }, (_, i) => i + 1);

export function WBP_CanvasPeriode() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="w-24 px-3 py-2 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Akse
            </th>
            {VISIBLE_WEEKS.map((w) => (
              <th key={w} className="w-32 px-2 py-2 text-left font-mono text-xs text-muted-foreground">
                Uke {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AXES.map((axis) => (
            <tr key={axis} className="border-t border-border">
              <td className="px-3 py-2">
                <span
                  className="font-mono text-xs font-semibold"
                  style={{ color: AXIS_COLORS[axis] }}
                >
                  {axis}
                </span>
                <p className="text-[10px] text-muted-foreground">{AXIS_LABELS[axis]}</p>
              </td>
              {VISIBLE_WEEKS.map((w) => {
                const sessions = MOCK_SESSIONS.filter(
                  (s) => s.weekNumber === w && s.axis === axis
                );
                return (
                  <td key={w} className="min-w-[128px] px-2 py-2 align-top">
                    <div className="flex flex-col gap-1">
                      {sessions.map((s) => (
                        <SessionCard key={s.id} session={s} />
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Steg 4: Koble canvas til WorkbenchShell**

I `workbench-shell.tsx`, importer og bytt ut placeholder:
```tsx
import { WBP_CanvasPeriode } from "./canvas-periode";

// erstatt <p>Canvas kommer...</p> med:
<WBP_CanvasPeriode />
```

- [ ] **Steg 5: Verifiser og commit**
```bash
npx tsc --noEmit 2>&1 | grep "workbench"
git add src/components/portal-planlegge/workbench/
git commit -m "feat(workbench): periode-canvas med mock-data og session-kort (C4)"
```

---

### C5: Session-detail drawer + Facilities-modal

**Nye filer:**
- `src/components/portal-planlegge/workbench/session-detail.tsx`
- `src/components/portal-planlegge/workbench/modal-facilities.tsx`

- [ ] **Steg 1: Session-detail drawer**

`src/components/portal-planlegge/workbench/session-detail.tsx`:
```tsx
"use client";
import { X, Clock, Dumbbell } from "lucide-react";
import { usePlan } from "./plan-context";
import { AXIS_COLORS, AXIS_LABELS } from "./mock-data";

export function WBP_SessionDetail() {
  const { selectedSession, setSelectedSession } = usePlan();

  if (!selectedSession) return null;

  const color = AXIS_COLORS[selectedSession.axis];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/20 z-40"
        onClick={() => setSelectedSession(null)}
      />
      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-screen w-96 z-50 bg-card border-l border-border overflow-y-auto shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <span
              className="font-mono text-xs font-semibold uppercase"
              style={{ color }}
            >
              {selectedSession.axis} · {AXIS_LABELS[selectedSession.axis]}
            </span>
            <h2 className="font-display text-lg font-semibold text-foreground mt-0.5">
              {selectedSession.title}
            </h2>
          </div>
          <button
            onClick={() => setSelectedSession(null)}
            className="rounded p-1.5 hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </header>

        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{selectedSession.durationMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Dumbbell className="h-4 w-4" />
              <span>Intensitet {selectedSession.intensity}/5</span>
            </div>
          </div>

          {selectedSession.axis === "SLAG" && (
            <div className="rounded-lg border border-border p-3">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Slag-data
              </p>
              <p className="text-sm text-muted-foreground">
                TrackMan-data for siste lignende økt vises her når data er tilkoblet.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-border p-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Uke {selectedSession.weekNumber} · Dag {selectedSession.dayOfWeek + 1}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Steg 2: Facilities-modal**

`src/components/portal-planlegge/workbench/modal-facilities.tsx`:
```tsx
"use client";
import { X } from "lucide-react";
import { useState } from "react";
import { usePlan } from "./plan-context";

const FACILITIES = [
  "Driving Range", "Putting Green", "Pitching Green",
  "Bunker", "Chipper-area", "Bane (9 hull)", "Bane (18 hull)",
  "Simulator (TrackMan)", "Gym/Styrke", "Pilates/Yoga", "Pool",
];

export function WBP_ModalFacilities() {
  const { openModal, setOpenModal } = usePlan();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (openModal !== "facilities") return null;

  const toggle = (f: string) => {
    const next = new Set(selected);
    next.has(f) ? next.delete(f) : next.add(f);
    setSelected(next);
  };

  return (
    <>
      <div className="fixed inset-0 bg-foreground/30 z-50" onClick={() => setOpenModal(null)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-display text-base font-semibold text-foreground">Tilgjengelige fasiliteter</h3>
          <button onClick={() => setOpenModal(null)} className="rounded p-1 hover:bg-muted">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {FACILITIES.map((f) => (
            <button
              key={f}
              onClick={() => toggle(f)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                selected.has(f)
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="border-t border-border px-4 py-3 flex justify-end gap-2">
          <button onClick={() => setOpenModal(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Avbryt
          </button>
          <button
            onClick={() => setOpenModal(null)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Lagre ({selected.size} valgt)
          </button>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Steg 3: Koble til WorkbenchShell**

I `workbench-shell.tsx`, legg til import og bruk:
```tsx
import { WBP_SessionDetail } from "./session-detail";
import { WBP_ModalFacilities } from "./modal-facilities";

// Etter </div> (close av layout), legg til:
<WBP_SessionDetail />
<WBP_ModalFacilities />
```

- [ ] **Steg 4: Koble Facilities-knapp i Topbar**

I `topbar.tsx`, finn Settings-lenken. Legg til Facilities-knapp ETTER Settings:
```tsx
import { Settings, Bell, Share2, LayoutGrid } from "lucide-react";
// ...
<button onClick={() => setOpenModal("facilities")} className="rounded p-1.5 hover:bg-muted" title="Fasiliteter">
  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
</button>
```

- [ ] **Steg 5: Verifiser full bygg**
```bash
npx tsc --noEmit
npm run build 2>&1 | tail -10
```
Forventet: `✓ Compiled` uten feil.

- [ ] **Steg 6: Commit**
```bash
git add src/components/portal-planlegge/workbench/
git commit -m "feat(workbench): session-detail drawer + facilities-modal (C5 — Sprint 1 ferdig)"
git push origin main
```

---

## Ferdig-tilstand

Etter alle tre sprinter er dette på plass:

| Komponent | Status |
|---|---|
| 3 døde lenker | Lukket |
| Coach-lenke skjult fra marketing | Lukket |
| XSS-risiko (summary) | Sanitert med DOMPurify |
| Booking race condition | Unique constraint i DB |
| www.akgolf.no redirect | Live |
| NEXT_PUBLIC_APP_URL | Satt til akgolf.no |
| Stripe LIVE | Aktiv |
| E-post DNS (SPF/DKIM) | Aktiv |
| Smoke-test | Grønt |
| Workbench `/portal/planlegge/workbench` | Demonterbar (chrome + canvas + session-drawer + modal) |

**Totalt estimat:**
- Sprint A (kode): ~2.5 timer
- Sprint B (manuelt): ~1.5 timer (Anders)
- Sprint C (Workbench): ~10-12 timer

---

*Lagret: 2026-05-31 | Prosjekt: akgolf-hq*
