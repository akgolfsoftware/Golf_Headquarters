# Plan: Funksjoner som ikke er 100% godkjent

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reparere og fullføre alle funksjoner som ble identifisert som ikke-fungerende, stub, eller delvis implementert i PlayerHQ-verifikasjon 2026-05-31.

**Architecture:** Tre prioritetsnivåer. P0 er produksjonsblokker (booking + treg forside). P1 er synlige stubs spillere treffer. P2 er Workbench-gaps som blokkerer daglig bruk. P3 er manuell handling for Anders.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind v4, Prisma 7, Lucide React.

---

## Oversikt over funn

| # | Funksjon | Problem | Prioritet |
|---|---|---|---|
| 1 | Forsiden 9,3 sekunder load | `BookingShortcuts` kaller Google Calendar som feiler/henger | P0 |
| 2 | Booking pauset | `BOOKING_ACTIVE=false` + Google Calendar `invalid_grant` og quota-feil | P0 (delvis manuelt) |
| 3 | "Ny plan"-knapp i `/portal/tren/teknisk-plan` | `type="button"` uten action — gjør ingenting | P1 |
| 4 | `/portal/ny-okt` wizard | Info-card stub — "wizard åpnes post-BETA" | P1 |
| 5 | Workbench AI-chips | Åpner modal, ingen AI-funksjon bak | P2 |
| 6 | Workbench "Auto-balansér"-knapp | Gjør ingenting | P2 |
| 7 | Workbench "Be coach godkjenne"-knapp | Gjør ingenting | P2 |
| 8 | Google Calendar re-autorisering | `invalid_grant` = utløpt OAuth-token | P3 (Anders manuelt) |

---

## P3 — Manuell handling (Anders, gjøres FØRST i Google Cloud Console)

**Dette er ikke kode — Anders gjør dette i Google Cloud Console:**

- [ ] Gå til [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- [ ] Finn OAuth 2.0-klient-ID for AK Golf Calendar-integrasjon
- [ ] Re-autorisér: Åpne `https://akgolf.no/api/google-calendar/connect` → logg inn på nytt
- [ ] Verifiser at tokenet er fornyet: sjekk at `invalid_grant`-feilene forsvinner i Vercel logs
- [ ] Sett `BOOKING_ACTIVE=true` i Vercel → Settings → Environment Variables (Production) → redeploy

**Kun etter at Anders har gjort P3 gir det mening å teste booking live.**

---

## Task 1: Forside-ytelse — timeout på BookingShortcuts

**Problem:** `BookingShortcuts` kaller `getAvailableSlots` for 3 tjenester × 14 dager = opptil 42 Google Calendar-kall. Når Calendar feiler, henger hvert kall i ~3 sekunder → 9+ sekunder total load.

**Fil:** `src/components/marketing/booking-shortcuts.tsx`

**Filer:**
- Modify: `src/components/marketing/booking-shortcuts.tsx`

- [ ] **Steg 1: Legg til timeout-wrapper i `hentNesteLedig`**

Finn funksjonen `hentNesteLedig` (rundt linje 33). Wrap loop-kallet i en `Promise.race` med 2 sekunder timeout:

```ts
async function hentNesteLedig(
  serviceId: string,
  coachUserId: string | null,
): Promise<{ dato: Date; coachNavn: string } | null> {
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 2000)  // max 2 sekunder total
  );

  const search = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < SOEK_DAGER_FREMOVER; i++) {
      const dag = new Date(start);
      dag.setDate(start.getDate() + i);
      const slots = await getAvailableSlots(serviceId, dag);
      const relevante = coachUserId
        ? slots.filter((s) => s.coachId === coachUserId)
        : slots;
      if (relevante.length > 0) {
        return { dato: relevante[0].start, coachNavn: relevante[0].coachName };
      }
    }
    return null;
  };

  return Promise.race([search(), timeout]);
}
```

- [ ] **Steg 2: Hvis `BOOKING_ACTIVE=false`, hopp over alle Calendar-kall**

Øverst i `hentData()`-funksjonen, legg til:

```ts
async function hentData(): Promise<ServiceMedNesteLedig[]> {
  // Hvis booking er pauset: hent tjeneste-info men ikke ledige tider
  const bookingAktiv = process.env.BOOKING_ACTIVE === "true";
  
  const slugs = SHORTCUTS.map((s) => s.slug);
  const services = await prisma.serviceType.findMany({
    where: { slug: { in: slugs }, active: true },
    include: { coach: { select: { id: true, name: true } } },
  });
  
  // ... resten av eksisterende kode, men:
  // For nesteLedig: kun kall hentNesteLedig hvis bookingAktiv === true
  const resultat = await Promise.all(
    SHORTCUTS.map(async (shortcut) => {
      const service = services.find((s) => s.slug === shortcut.slug);
      if (!service) return null;
      const nesteLedig = bookingAktiv
        ? await hentNesteLedig(service.id, service.coach?.id ?? null)
        : null;  // Hopp over Calendar-kall
      return {
        shortcut,
        navn: service.name,
        beskrivelse: service.description,
        prisOre: service.priceOre,
        varighetMin: service.durationMin,
        coachNavn: service.coach?.name ?? "Coach",
        nesteLedig,
      };
    }),
  );
  return resultat.filter(Boolean) as ServiceMedNesteLedig[];
}
```

- [ ] **Steg 3: Verifiser at forsiden laster under 2 sekunder**

```bash
time python3 -c "
import urllib.request
class NR(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a): return None
o = urllib.request.build_opener(NR)
r = o.open('http://localhost:51700/', timeout=10)
print('Status:', r.getcode())
"
```

Forventet: Under 2 sekunder.

- [ ] **Steg 4: Commit**

```bash
git add src/components/marketing/booking-shortcuts.tsx
git commit -m "perf(forsiden): timeout 2s på Calendar-kall, skip slot-søk når booking er pauset

Forsiden brukte 9.3s pga. Calendar quota-feil som hengte.
Promise.race(search(), 2s-timeout) setter hard grense.
Når BOOKING_ACTIVE=false: ingen Calendar-kall i det hele tatt.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: "Ny plan"-knapp i teknisk-plan

**Problem:** Knappen er `type="button"` uten `onClick` eller `action` — gjør ingenting.

**Løsning:** Redirect til `/portal/planlegge/workbench` som faktisk kan opprette plan. Dette er den korrekte løsningen — Workbench er primærverktøyet for planoppretting.

**Fil:** `src/app/portal/tren/teknisk-plan/page.tsx`

- [ ] **Steg 1: Les eksakt kode rundt linje 160**

```bash
sed -n '150,175p' src/app/portal/tren/teknisk-plan/page.tsx
```

- [ ] **Steg 2: Bytt stub-knapp med Link til Workbench**

Finn:
```tsx
<button className="tp-btn primary" type="button">
  <Plus size={13} aria-hidden /> Ny plan
</button>
```

Bytt til:
```tsx
<Link href="/portal/planlegge/workbench" className="tp-btn primary">
  <Plus size={13} aria-hidden /> Ny plan
</Link>
```

Sørg for at `Link` fra `next/link` er importert øverst i filen (sjekk at det allerede finnes — ellers legg til).

- [ ] **Steg 3: Gjør det samme for "Periodisering"-knappen** (som sannsynligvis er en tilsvarende stub):

```bash
grep -n "Periodisering\|periodisering" src/app/portal/tren/teknisk-plan/page.tsx
```

Hvis `type="button"` uten action: bytt til `<Link href="/portal/tren/aarsplan">`.

- [ ] **Steg 4: Verifiser tsc**

```bash
npx tsc --noEmit 2>&1 | grep "teknisk-plan"
```

- [ ] **Steg 5: Commit**

```bash
git add src/app/portal/tren/teknisk-plan/page.tsx
git commit -m "fix(teknisk-plan): 'Ny plan'-knapp peker nå til Workbench

Knappen var type=button uten action. Workbench er primærverktøy
for planoppretting og har fungerende createPeriod()-action.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: `/portal/ny-okt` — erstatt stub med funksjonell wizard-redirect

**Problem:** Siden viser bare en info-card med "wizard åpnes post-BETA". Spillere som vil logge en økt har ingen rask vei.

**Løsning:** Behold info-card, men legg til tre raske handlings-knapper: Logg runde, Workbench (ny plan-økt), og Ønsket økt.

**Fil:** `src/app/portal/ny-okt/wizard.tsx`

- [ ] **Steg 1: Les eksisterende komponent**

```bash
cat src/app/portal/ny-okt/wizard.tsx
```

- [ ] **Steg 2: Erstatt kun placeholder-teksten med handlingsknapper**

```tsx
import Link from "next/link";
import { ArrowRight, Calendar, Dumbbell, Star } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export function NyOktWizard() {
  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <AthleticEyebrow tone="lime">NY ØKT</AthleticEyebrow>
      <p className="font-display mt-4 text-xl font-semibold text-foreground">
        Hva vil du gjøre?
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Full økt-wizard kommer etter beta. Velg en rask handling under.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/portal/mal/runder/ny"
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Logg en runde</p>
              <p className="text-xs text-muted-foreground">Registrer score, bane og statistikk</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/portal/planlegge/workbench"
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Dumbbell className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Planlegg en økt i Workbench</p>
              <p className="text-xs text-muted-foreground">Legg til økt i treningsplan</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/portal/onskeligokt"
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Be om en spesifik økt fra coach</p>
              <p className="text-xs text-muted-foreground">Coach planlegger økt basert på ditt ønske</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Steg 3: Verifiser tsc**

```bash
npx tsc --noEmit 2>&1 | grep "ny-okt"
```

- [ ] **Steg 4: Commit**

```bash
git add src/app/portal/ny-okt/wizard.tsx
git commit -m "fix(ny-okt): erstatt tom info-card med 3 handlingsknapper (runde, workbench, ønske)

Fullstendig wizard utsettes post-beta. Mellomløsning gir spillere
konkrete handlingsmuligheter i stedet for dead end.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Workbench — "Auto-balansér" med enkel heuristikk

**Problem:** "Auto-balansér"-knappen i Inspector gjør ingenting.

**Løsning:** Implementer en enkel heuristikk (uten AI): fordel økt-intensitet jevnt over akser basert på pyramide-vekting. Ingen API-kall.

**Fil:** Finn Inspector-komponenten i Workbench:

```bash
grep -rn "Auto-balansér\|auto.*balan\|balansér" src/components/portal-planlegge/workbench/ | head -5
```

- [ ] **Steg 1: Les Inspector-komponenten**

```bash
cat src/components/portal-planlegge/workbench/inspector.tsx 2>/dev/null || \
grep -rn "Auto-balansér\|autoBalance" src/components/portal-planlegge/workbench/ -l
```

- [ ] **Steg 2: Implementer heuristikken**

Finn `onClick={() => {}}` eller stub-handler på "Auto-balansér"-knappen. Erstatt med en action som:

```ts
function autoBalanser(sessions: WBP_Session[]): WBP_Session[] {
  // Mål-fordeling per pyramide-akse (% av total tid)
  const MÅL_FORDELING: Record<AxisKey, number> = {
    FYS: 0.25,
    TEK: 0.30,
    SLAG: 0.20,
    SPILL: 0.15,
    TURN: 0.10,
  };

  const totalMinutter = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  
  // Tell nåværende fordeling
  const nåværende: Record<AxisKey, number> = {
    FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0,
  };
  for (const s of sessions) {
    nåværende[s.axis] += s.durationMinutes;
  }

  // Finn svakeste akse (størst avvik fra mål)
  const avvik = (Object.keys(MÅL_FORDELING) as AxisKey[]).map((axis) => ({
    axis,
    avvik: MÅL_FORDELING[axis] - nåværende[axis] / totalMinutter,
  })).sort((a, b) => b.avvik - a.avvik);

  // Returner sterkeste svakhet til toast
  return avvik;
}
```

Vis en `toast`-melding med resultatet: f.eks. "FYS er underrepresentert — vurder å legge til en FYS-økt i uke 3".

- [ ] **Steg 3: Commit**

```bash
git add src/components/portal-planlegge/workbench/
git commit -m "feat(workbench): auto-balansér heuristikk — anbefaler underrepresentert akse

Enkelt heuristisk system uten AI. Beregner avvik fra pyramide-mål
(FYS 25%, TEK 30%, SLAG 20%, SPILL 15%, TURN 10%) og viser toast.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Workbench — "Be coach godkjenne" → PlanSuggestion

**Problem:** "Be coach godkjenne"-knappen gjør ingenting.

**Løsning:** Opprett en `PlanSuggestion`-rad i databasen og send varsel til coach.

**Filer:**
- Modify: Server action (finn med grep)
- Ingen ny Prisma-modell nødvendig — bruk eksisterende `PlanSuggestion` eller `CoachNote`

- [ ] **Steg 1: Finn eksisterende modell**

```bash
grep -n "PlanSuggestion\|planSuggestion\|coach.*approve\|godkjenn" \
  prisma/schema.prisma | head -10
```

- [ ] **Steg 2: Finn knappen**

```bash
grep -rn "Be coach godkjenne\|coach.*godkjenn\|requestApproval" \
  src/components/portal-planlegge/workbench/ | head -5
```

- [ ] **Steg 3: Implementer action**

Finn knappens `onClick`-handler og koble til en server action:

```ts
// src/app/portal/planlegge/workbench/actions.ts
export async function requestCoachApproval(): Promise<{ ok: boolean }> {
  const user = await requirePortalUser();
  
  const activePlan = await prisma.technicalPlan.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });
  if (!activePlan) return { ok: false };

  // Finn brukerens coach
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: { serviceType: { include: { coach: true } } },
  });

  const coachId = subscription?.serviceType?.coach?.id;

  await prisma.planSuggestion.create({
    data: {
      planId: activePlan.id,
      requestedById: user.id,
      status: "PENDING",
      message: "Spiller ber om godkjenning av aktiv plan.",
    },
  });

  // Opprett varsling til coach hvis koachId finnes
  if (coachId) {
    await prisma.notification.create({
      data: {
        userId: coachId,
        type: "PLAN_APPROVAL_REQUEST",
        title: `${user.name ?? "En spiller"} ber om plan-godkjenning`,
        body: `Gå til PlayerHQ → Planer for å se og godkjenne.`,
        link: `/admin/spillere/${user.id}/plan`,
      },
    });
  }

  return { ok: true };
}
```

- [ ] **Steg 4: Koble action til knappen**

```tsx
// I workbench-komponenten
import { requestCoachApproval } from "./actions";

// onClick:
async function handleRequestApproval() {
  const result = await requestCoachApproval();
  if (result.ok) {
    toast("Forespørsel sendt til coach");
  } else {
    toast("Ingen aktiv plan å sende");
  }
}
```

- [ ] **Steg 5: tsc + commit**

```bash
npx tsc --noEmit 2>&1 | grep "workbench\|actions"
git add src/app/portal/planlegge/workbench/actions.ts \
  src/components/portal-planlegge/workbench/
git commit -m "feat(workbench): 'Be coach godkjenne' oppretter PlanSuggestion + varsler coach

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Final verifisering

- [ ] **Steg 1: Full typesjekk**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

- [ ] **Steg 2: Smoke-test**

```bash
BASE=http://localhost:51700 bash scripts/smoke-test.sh 2>/dev/null
```

- [ ] **Steg 3: Forside-hastighet**

```bash
time python3 -c "
import urllib.request
class NR(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a): return None
o = urllib.request.build_opener(NR)
r = o.open('http://localhost:51700/', timeout=10)
print('OK:', r.getcode())
"
```
Forventet: Under 2 sekunder.

- [ ] **Steg 4: Push**

```bash
git push origin main
```

---

## Tidsestimat

| Task | Tid | Prioritet |
|---|---|---|
| P3 Google Calendar re-auth (Anders manuelt) | 15 min | GJØRES FØRST |
| Task 1: Forside timeout | 30 min | P0 |
| Task 2: Ny plan-knapp → Workbench | 10 min | P1 |
| Task 3: Ny-økt stub → 3 handlingsknapper | 20 min | P1 |
| Task 4: Auto-balansér heuristikk | 45 min | P2 |
| Task 5: Be coach godkjenne | 60 min | P2 |
| Task 6: Verifisering | 10 min | — |
| **Total** | **~3 timer** | |

---

## Etter alle tasks

- Forsiden laster under 2 sekunder
- "Ny plan" sender spiller til Workbench
- `/portal/ny-okt` viser 3 handlingsknapper i stedet for dead end
- Auto-balansér viser heuristisk anbefaling
- "Be coach godkjenne" oppretter PlanSuggestion og varsler coach
- Booking gjenåpnes når Anders gjør P3 (Google Calendar re-auth + `BOOKING_ACTIVE=true`)

---

*Plan lagret: 2026-05-31 · Prosjekt: akgolf-hq*
