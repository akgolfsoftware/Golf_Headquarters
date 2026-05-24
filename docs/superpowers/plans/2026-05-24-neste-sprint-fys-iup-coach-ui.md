# Neste Sprint: FYS Coach-UI + IUP-spec + ExerciseMetadata + Test→Plan-kobling

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fire uavhengige leveranser som fullfører FYS-programmet og legger grunnlaget for spillerprogresjons-dashboardet.

**Architecture:** Tre kode-oppgaver (CoachHQ-side, script-oppdatering, schema+UI) og én dokumentasjonsoppgave (IUP-spec). Alle kan kjøres parallelt — ingen avhengigheter mellom dem. Anbefalt rekkefølge: Oppgave 1 (enklest, størst verdi) → 2 → 3 → 4.

**Tech Stack:** Next.js 16 App Router, Prisma 7 + Supabase, Tailwind CSS v4, shadcn/ui, TypeScript strict, `npx tsx` for scripts.

**Viktig gotcha:** Shadow DB er broken — bruk ALLTID manuell SQL via Supabase MCP + `prisma migrate resolve --applied`. Aldri `prisma migrate dev`.

---

## Oppgave 1: Coach-UI for FYS-mal-bibliotek i CoachHQ

**Mål:** Ny side `/admin/fys-maler` som lister alle 12 periodiserte FYS-maler (4 faser × 3 aldersgrupper) med filter, detalj-modal og «Tildel til spiller»-knapp.

**Filer:**
- Opprett: `src/app/admin/fys-maler/page.tsx`
- Opprett: `src/app/admin/fys-maler/actions.ts`
- Opprett: `src/app/admin/fys-maler/fys-mal-card.tsx`
- Endre: `src/components/admin/admin-sidebar.tsx` (legg til lenke i menyen)

---

- [ ] **Steg 1.1: Verifiser at FYS-maler finnes i databasen**

```bash
cd ~/Developer/akgolf-hq
npx tsx -e "
import { prisma } from './src/lib/prisma'
const plans = await prisma.trainingPlan.findMany({
  where: { name: { contains: 'FYS' } },
  select: { id: true, name: true, status: true },
  take: 15
})
console.log(plans)
process.exit(0)
"
```

Forventet output: 12 rader med navn som «FYS Fase 1 U12-14», «FYS Fase 2 U15-17» osv.
Hvis 0 rader: kjør `npx tsx scripts/seed-physical-templates.ts` først.

- [ ] **Steg 1.2: Les eksisterende drill-bibliotek-side for å forstå mønsteret**

Fil å lese: `src/app/admin/drills/page.tsx` (hele fila — mønster for SSR-liste med filter).
Merk: `requirePortalUser({ allow: ["COACH", "ADMIN"] })` brukes på alle admin-sider.
Merk: `AdminHero` importeres fra `@/components/admin/admin-hero`.

- [ ] **Steg 1.3: Opprett Server Action for å hente FYS-maler**

Opprett `src/app/admin/fys-maler/actions.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import type { LPhase } from "@/generated/prisma/enums";

export type FysMal = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  sessionCount: number;
  lPhase: LPhase | null;
};

export async function getFysMaler(fase?: string): Promise<FysMal[]> {
  const plans = await prisma.trainingPlan.findMany({
    where: {
      name: { contains: "FYS" },
      ...(fase ? { sessions: { some: { lPhase: fase as LPhase } } } : {}),
    },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      sessions: {
        select: { lPhase: true },
        take: 1,
      },
      _count: { select: { sessions: true } },
    },
    orderBy: { name: "asc" },
  });

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    createdAt: p.createdAt,
    sessionCount: p._count.sessions,
    lPhase: p.sessions[0]?.lPhase ?? null,
  }));
}
```

- [ ] **Steg 1.4: Opprett FysMalCard-komponent**

Opprett `src/app/admin/fys-maler/fys-mal-card.tsx`:

```typescript
import { Calendar, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FysMal } from "./actions";

const FASE_LABEL: Record<string, string> = {
  GRUNNPERIODE: "Grunnperiode",
  SPESIALISERING: "Spesialisering",
  KONKURRANSE: "Konkurranse",
  EVALUERING: "Evaluering",
};

const FASE_STYLE: Record<string, string> = {
  GRUNNPERIODE: "bg-primary/15 text-primary",
  SPESIALISERING: "bg-accent/30 text-accent-foreground",
  KONKURRANSE: "bg-destructive/15 text-destructive",
  EVALUERING: "bg-muted text-muted-foreground",
};

export function FysMalCard({ mal }: { mal: FysMal }) {
  const faseKey = mal.lPhase ?? "";
  return (
    <Card className="rounded-lg border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-semibold leading-snug">
            {mal.name}
          </CardTitle>
          {faseKey && (
            <Badge className={`shrink-0 rounded-full text-xs ${FASE_STYLE[faseKey] ?? "bg-muted text-muted-foreground"}`}>
              {FASE_LABEL[faseKey] ?? faseKey}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Dumbbell className="h-4 w-4" />
          {mal.sessionCount} økter
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {new Date(mal.createdAt).toLocaleDateString("nb-NO")}
        </span>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Steg 1.5: Opprett hovud-siden**

Opprett `src/app/admin/fys-maler/page.tsx`:

```typescript
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero } from "@/components/admin/admin-hero";
import { getFysMaler } from "./actions";
import { FysMalCard } from "./fys-mal-card";
import { Dumbbell } from "lucide-react";

export const dynamic = "force-dynamic";

const FASER = ["GRUNNPERIODE", "SPESIALISERING", "KONKURRANSE", "EVALUERING"] as const;
const FASE_LABEL = {
  GRUNNPERIODE: "Grunnperiode",
  SPESIALISERING: "Spesialisering",
  KONKURRANSE: "Konkurranse",
  EVALUERING: "Evaluering",
} as const;

export default async function FysMalerPage({
  searchParams,
}: {
  searchParams: Promise<{ fase?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { fase } = await searchParams;
  const maler = await getFysMaler(fase);

  return (
    <div className="flex flex-col gap-8">
      <AdminHero
        icon={<Dumbbell className="h-6 w-6" />}
        title="FYS-mal-bibliotek"
        subtitle={`${maler.length} periodiserte programmer`}
      />

      {/* Filter-tabs */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/fys-maler"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !fase
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Alle
        </a>
        {FASER.map((f) => (
          <a
            key={f}
            href={`/admin/fys-maler?fase=${f}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              fase === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {FASE_LABEL[f]}
          </a>
        ))}
      </div>

      {/* Mal-grid */}
      {maler.length === 0 ? (
        <p className="text-muted-foreground">Ingen maler funnet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maler.map((mal) => (
            <FysMalCard key={mal.id} mal={mal} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Steg 1.6: Legg til lenke i admin-sidebar**

Finn `src/components/admin/admin-sidebar.tsx` (eller tilsvarende nav-fil). Legg til etter drill-lenken:

```typescript
{ href: "/admin/fys-maler", label: "FYS-maler", icon: Dumbbell }
```

Sjekk eksisterende lenke-format i fila og følg nøyaktig samme mønster (ikke lag nytt mønster).

- [ ] **Steg 1.7: Typesjekk og verifikasjon**

```bash
cd ~/Developer/akgolf-hq && npx tsc --noEmit
```

Forventet: 0 feil. Start deretter dev-server og naviger til `http://localhost:3000/admin/fys-maler` — sjekk at 12 kort vises og filter fungerer.

- [ ] **Steg 1.8: Commit**

```bash
git add src/app/admin/fys-maler/ src/components/admin/admin-sidebar.tsx
git commit -m "feat: add /admin/fys-maler CoachHQ library page for FYS templates"
```

---

## Oppgave 2: Forbedre ExerciseDefinition-metadata (TPI/RFD-funn)

**Mål:** Oppdater de 20 FYS-ExerciseDefinition-ene med TPI-nøkkelnummer, RFD-prioritet, og koachnoter basert på styrke-forskning-rapporten.

**Filer:**
- Endre: `scripts/seed-physical-exercises.ts` — legg til `coachNotes`, `tags`, `kilde` per øvelse
- Ny: `scripts/update-exercise-metadata.ts` — kjørbart oppdaterings-script (bruker `upsert`)

---

- [ ] **Steg 2.1: Les forskningsrapporten for nøkkelfunn**

```bash
cat ~/Documents/Claude/ak-golf-academy/fysisktrening/styrke-forskning-2026.md
```

Nøkkelfunn å hente ut:
- TPI Big 12 øvelsesnummer (TPI-1 til TPI-12) per øvelse
- RFD-prioritet (høy = eksplosive bevegelser, lav = mobilitet/stabilitet)
- Kilde-referanse per øvelse (TPI, NSCA, McGill etc.)

- [ ] **Steg 2.2: Opprett oppdaterings-script**

Opprett `scripts/update-exercise-metadata.ts`:

```typescript
import { prisma } from "../src/lib/prisma";

// Metadata-oppdateringer basert på TPI Big 12 og RFD-forskning (2026-05-23)
const METADATA: Array<{
  nameContains: string;
  coachNotes: string;
  tags: string[];
  kilde: string;
}> = [
  {
    nameContains: "Trapbar Markløft",
    coachNotes:
      "TPI-5 (Hip Hinge). RFD-prioritet: HØY. Primær kraftoverføring i svingen. Fokus: nøytral rygg, hoftedominant bevegelse. Mål: 1,5× kroppsvekt for elitespillere.",
    tags: ["tpi-big12", "rfd-hoy", "hip-hinge", "kraft"],
    kilde: "TPI Golf Fitness Level 1 / NSCA",
  },
  {
    nameContains: "Benkpress",
    coachNotes:
      "TPI-3 (Push). RFD-prioritet: MIDDELS. Overkroppsstyrke for slag-akselerasjon. Mål: kroppsvekt for elitespillere.",
    tags: ["tpi-big12", "rfd-middels", "push", "overkropp"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Medisinball",
    coachNotes:
      "Rotasjonskraft direkte overførbar til svingen. RFD-prioritet: HØY. Forskning viser 3× bedre return enn isolert styrke. Gjør MOT VEG, ikke i gulvet.",
    tags: ["rfd-hoy", "rotasjon", "kraft-overfor", "golf-spesifikk"],
    kilde: "Styrke-forskning-2026 / Lephart & Fu",
  },
  {
    nameContains: "Standing Long Jump",
    coachNotes:
      "Eksplosiv hoftekraft. RFD-prioritet: HØY. Korrelerer med driver-distanse. Mål: 2,0m+ for D-E kategori.",
    tags: ["rfd-hoy", "eksplosiv", "hofte", "plyometri"],
    kilde: "TPI Athletic Tests",
  },
  {
    nameContains: "3000m",
    coachNotes:
      "Aerob base for turneringstoleranseprofil. RFD-prioritet: LAV. Kjøres kun i GRUNNPERIODE (uke 47–12). Ikke i konkurranseperiode.",
    tags: ["rfd-lav", "aerob", "utholdenhet", "grunnperiode"],
    kilde: "NGF Testbatteri",
  },
  {
    nameContains: "Hip 90/90",
    coachNotes:
      "TPI-1 (Hip Mobility). Hoftemobilitet er #1 begrensning for klubbhastighetsgenerering. Mål: 45° intern/ekstern rotasjon begge hofter.",
    tags: ["tpi-big12", "mobilitet", "hofte", "screening"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Thorax Rotasjon",
    coachNotes:
      "TPI-2 (Thoracic Mobility). Kritisk for ryggvinduet. Mål: 45° begge veier. Begrensning gir kompensasjon med C-postural kollaps.",
    tags: ["tpi-big12", "mobilitet", "thorax", "screening"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Pallof Press",
    coachNotes:
      "Anti-rotasjons-stabilitet. Kjernestabilitet uten kompresjon. Viktigere enn crunch for golf. Progresjoner: stående → knestående → med rotasjon.",
    tags: ["kjerne", "anti-rotasjon", "stabilitet"],
    kilde: "McGill / TPI",
  },
  {
    nameContains: "Kettlebell Swing",
    coachNotes:
      "RFD-prioritet: HØY. Hip hinge med eksplosiv extensjon — direkte transfer til driver. Starter med 16 kg, progresjon til 24 kg for D-E.",
    tags: ["rfd-hoy", "hip-hinge", "eksplosiv", "golf-spesifikk"],
    kilde: "TPI Golf Fitness Level 2",
  },
  {
    nameContains: "Romanian Deadlift",
    coachNotes:
      "TPI-5 variasjon. Eccentric control i baksvingen. Enkelt bein: avdekker side-til-side ubalanse som forårsaker S-postural kompensasjon.",
    tags: ["tpi-big12", "hip-hinge", "eccentric", "ubalanse"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Goblet Squat",
    coachNotes:
      "Hoftemobilitet + kjerneaktivering kombinert. God inngangsøvelse for K-I kategorier. Progreder til Goblet Box Squat ved behov.",
    tags: ["mobilitet", "styrke", "inngang", "kjerneaktivering"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Landmine Press",
    coachNotes:
      "TPI-3 variasjon. Roterende pressing-mønster — mer golf-spesifikt enn flatt benkpress. Skulderstabilitets-test integrert.",
    tags: ["tpi-big12", "push", "rotasjon", "skulder"],
    kilde: "TPI Golf Fitness Level 2",
  },
  {
    nameContains: "Band Pull-Apart",
    coachNotes:
      "Skulderblad-retraksjon og rotator cuff-aktivering. Forebygger impingement. Kjøres som daglig oppvarming, ikke treningsøvelse. 3×20.",
    tags: ["skulder", "forebygging", "oppvarming", "rotator-cuff"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Single Leg Balance",
    coakchNotes: "dummy — se under",
    coachNotes:
      "TPI-7 (Balance/Proprioception). Enkeltbein-balanse er tidlig prediktor for skaderisiko. Mål: 30s stabilt begge bein. Lukk øyne for progresjon.",
    tags: ["tpi-big12", "balanse", "propriosepsjon", "skadeforebygging"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Dead Bug",
    coachNotes:
      "McGill-protokoll. Anti-ekstensjon kjernestabilitet. Grunnmur for all kraftoverføring. Brukes i alle faser. Fokus: lenden i kontakt med gulv hele tiden.",
    tags: ["mcgill", "kjerne", "anti-ekstensjon", "grunnmur"],
    kilde: "McGill Spine Laboratory",
  },
  {
    nameContains: "Lateral Band Walk",
    coachNotes:
      "Glute med og abduktor-aktivering. Forhindrer knee valgus i power-positionen. Brukes i oppvarming og G-I kategorier.",
    tags: ["glute", "abduktor", "knee-valgus", "oppvarming"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Box Jump",
    coachNotes:
      "RFD-prioritet: HØY. Beineksplosivitet — direkte transfer til slag-akselerasjon. Kun for D-E (ikke under 15 år). Kasser: 40–60 cm.",
    tags: ["rfd-hoy", "plyometri", "eksplosiv", "bein"],
    kilde: "NSCA / TPI Athletic",
  },
  {
    nameContains: "Medicine Ball Slam",
    coachNotes:
      "RFD-prioritet: HØY. Eksplosiv hip flexion + trunk flexion. Spesifikt for nedsvingsfasen. 3–5 kg ball, maksimal intensitet.",
    tags: ["rfd-hoy", "eksplosiv", "nedsvingen", "golf-spesifikk"],
    kilde: "TPI Golf Fitness Level 2",
  },
  {
    nameContains: "Face Pull",
    coachNotes:
      "Skulderblad-helse og ryggmuskler. Motvirker overtrening av press-muskulatur. Kjøres 2:1 ratio mot press-øvelser.",
    tags: ["skulder", "forebygging", "rygg", "balanse"],
    kilde: "TPI Golf Fitness Level 1",
  },
  {
    nameContains: "Hip Flexor Stretch",
    coachNotes:
      "TPI-4 (Hip Flexibility). Forkortet psoas forårsaker S-posturale svingesvakheter. Statisk: 30s hold. Dynamisk: lunges med rotasjon i oppvarming.",
    tags: ["tpi-big12", "fleksibilitet", "psoas", "s-postur"],
    kilde: "TPI Golf Fitness Level 1",
  },
];

async function main() {
  console.log("Oppdaterer ExerciseDefinition-metadata...\n");
  let oppdatert = 0;
  let ikkeFulltreff = 0;

  for (const m of METADATA) {
    const treff = await prisma.exerciseDefinition.findFirst({
      where: { name: { contains: m.nameContains } },
      select: { id: true, name: true },
    });

    if (!treff) {
      console.warn(`  INGEN TREFF: "${m.nameContains}"`);
      ikkeFulltreff++;
      continue;
    }

    await prisma.exerciseDefinition.update({
      where: { id: treff.id },
      data: {
        coachNotes: m.coachNotes,
        tags: m.tags,
        kilde: m.kilde,
      },
    });

    console.log(`  Oppdatert: ${treff.name}`);
    oppdatert++;
  }

  console.log(`\nFerdig: ${oppdatert} oppdatert, ${ikkeFulltreff} ingen treff.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Steg 2.3: Kjør scriptet**

```bash
cd ~/Developer/akgolf-hq && npx tsx scripts/update-exercise-metadata.ts
```

Forventet: «Ferdig: 20 oppdatert, 0 ingen treff.»
Hvis noen ikke treffer: sjekk nøyaktig navn i DB med `npx tsx -e "import { prisma } from './src/lib/prisma'; console.log(await prisma.exerciseDefinition.findMany({ where: { pyramidArea: 'FYS' }, select: { name: true } })); process.exit(0)"`.

- [ ] **Steg 2.4: Commit**

```bash
git add scripts/update-exercise-metadata.ts
git commit -m "feat: add TPI/RFD coach notes and tags to FYS ExerciseDefinitions"
```

---

## Oppgave 3: Auto-link TestResult → TrainingPlan (schema + UI)

**Mål:** Spiller og coach kan se hvilke testresultater som er tatt under et spesifikt treningsprogram, og treningsplanen viser fremgang på testmetrikker.

**Filer:**
- Endre: `prisma/schema.prisma` — legg til `trainingPlanId String?` på `TestResult`
- Ny: `prisma/migrations/<ts>_test_result_plan_link/` — manuell migrasjon
- Endre: `src/app/admin/tester/[id]/page.tsx` — vis tilknyttet plan
- Endre: `src/app/portal/tren/teknisk-plan/[planId]/page.tsx` (eller tilsvarende plan-detalj) — vis test-progresjon

---

- [ ] **Steg 3.1: Legg til relasjon i schema.prisma**

Åpne `prisma/schema.prisma`. Finn `model TestResult` og legg til:

```prisma
model TestResult {
  id             String   @id @default(cuid())
  userId         String
  testId         String
  takenAt        DateTime
  score          Float
  notes          String?
  details        Json?
  createdAt      DateTime @default(now())
  // Valgfri kobling til treningsprogram (satt når test tas som del av plan-evaluering)
  trainingPlanId String?

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  test         TestDefinition @relation(fields: [testId], references: [id])
  trainingPlan TrainingPlan?  @relation(fields: [trainingPlanId], references: [id])

  @@index([userId, takenAt])
  @@map("test_results")
}
```

Og på `model TrainingPlan`, legg til i relasjoner:

```prisma
  testResults  TestResult[]
```

- [ ] **Steg 3.2: Kjør SQL-migrasjon manuelt via Supabase MCP**

Bruk Supabase MCP (`execute_sql`) til å kjøre:

```sql
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS training_plan_id TEXT;
ALTER TABLE test_results
  ADD CONSTRAINT fk_test_result_training_plan
  FOREIGN KEY (training_plan_id) REFERENCES training_plans(id)
  ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_test_results_training_plan_id
  ON test_results(training_plan_id);
```

- [ ] **Steg 3.3: Marker migrasjon som applied**

```bash
cd ~/Developer/akgolf-hq
# Finn siste migrasjon-timestamp:
ls prisma/migrations/ | tail -5
# Registrer manuelt:
npx prisma migrate resolve --applied 20260524_test_result_plan_link
```

Hvis det feiler med manglende mappe: opprett `prisma/migrations/20260524000000_test_result_plan_link/migration.sql` med SQL-en fra steg 3.2, deretter:
```bash
npx prisma migrate resolve --applied 20260524000000_test_result_plan_link
```

- [ ] **Steg 3.4: Regenerer Prisma-klient**

```bash
cd ~/Developer/akgolf-hq && npx prisma generate
```

Forventet: ingen feil. `src/generated/prisma/` oppdateres.

- [ ] **Steg 3.5: Typesjekk**

```bash
npx tsc --noEmit
```

Forventet: 0 feil.

- [ ] **Steg 3.6: Commit schema + migrasjon**

```bash
git add prisma/schema.prisma prisma/migrations/ src/generated/
git commit -m "feat: add optional trainingPlanId FK to TestResult for plan-linked testing"
```

---

## Oppgave 4: IUP A-K klassifiseringssystem — spec-v2 dokument

**Mål:** Komplett spec-dokument `ak-golf-iup-kategorisystem-v1.md` i `~/Documents/Claude/ak-golf-academy/spec-v2/` som formaliserer IUP A-K for AK Golf Academy (ikke GFGK-versjon).

**Filer:**
- Opprett: `~/Documents/Claude/ak-golf-academy/spec-v2/ak-golf-iup-kategorisystem-v1.md`
- Endre: `~/Documents/Claude/ak-golf-academy/spec-v2/INDEX.md` — legg til ny fil

---

- [ ] **Steg 4.1: Les kildedokument**

Les `/Users/anderskristiansen/Documents/Claude/ak-golf-academy/untitled folder/IUP_Kategori_System.md` (kildedokument med A-K tabell, 52-ukers periodisering, kravprofiler).

Les også `~/Documents/Claude/ak-golf-academy/spec-v2/ak-golf-testbatteri-mapping-v1.md` for å forstå scoring-konvensjoner (PEI som %, putting i fot, meter/yards-toggle).

- [ ] **Steg 4.2: Skriv spec-dokumentet**

Opprett `~/Documents/Claude/ak-golf-academy/spec-v2/ak-golf-iup-kategorisystem-v1.md` med disse seksjonene:

```markdown
# AK Golf IUP — Kategori-system v1

> **Status:** GJELDENDE
> **Versjon:** 1.0 · 2026-05-24
> **Kilde:** IUP_Master_V1 × AK Golf Academy-metodikk

## 1. Kategori-matrise (A-K)

[Tabell med alle 11 kategorier: Kategori | Nivå | Snittscore | Typisk alder | Driver CS-range | Beskrivelse]

Følg nøyaktig tabell fra kildedokumentet, men tilpass med AK Golf Academy-kontekst (ikke GFGK).

## 2. Testbatteri per kategori

[Hvilke av de 25 testene (20 golf + 5 FYS) som er relevante per kategori]

Koblet mot ak-golf-testbatteri-mapping-v1.md.

## 3. Treningsvolum og intensitet per kategori

[Antall økter per uke, forholdet FYS/TEK/SLAG per fase og kategori]

## 4. 52-ukers periodisering

[De 4 fasene fra kildedokumentet, men med AK Golf-terminologi: GRUNNPERIODE/SPESIALISERING/KONKURRANSE/EVALUERING]

## 5. Kravprofiler (driver CS, carry, putting, PEI)

[Utvalgte benchmark-tall for kategori D, E, F, G — disse er mest relevante for AK Golf Academy spillere]

## 6. Progresjonskrav (kategori-opprykk)

[Hvilke testresultater kreves for å rykke opp fra G→F, F→E, E→D]

## 7. Koding i plattformen

[Mapping til NgfKategori-enum i Prisma: A, B, C, D, E, F, G, H, I, J, K, L]
[minKategori/maxKategori på ExerciseDefinition]
[IUP-kategori på User-modellen (fremtidig felt)]
```

- [ ] **Steg 4.3: Oppdater INDEX.md**

Åpne `~/Documents/Claude/ak-golf-academy/spec-v2/INDEX.md` og legg til:

```markdown
| [ak-golf-iup-kategorisystem-v1.md](./ak-golf-iup-kategorisystem-v1.md) | IUP A-K kategorisystem | GJELDENDE |
```

- [ ] **Steg 4.4: Slett ruvector.db**

```bash
rm ~/Documents/Claude/ak-golf-academy/spec-v2/ruvector.db
```

Verifiser: `ls ~/Documents/Claude/ak-golf-academy/spec-v2/` — fila skal ikke lenger vises.

---

## Opprydding: Ordliste-redirect

- [ ] **Steg 5.1: Oppdater gammel ordliste med pekepinn**

Åpne `~/Developer/akgolf-hq/docs/ordliste-ak-golf.md`. Legg til øverst:

```markdown
> **UTDATERT** — Denne fila er erstattet av spec-v2-ordlisten.
> Gjeldende versjon: `~/Documents/Claude/ak-golf-academy/spec-v2/ak-golf-ordliste-full-v2.md`
> Viktig endring: putting er i FOT (ikke meter) — se spec-v2.
```

- [ ] **Steg 5.2: Commit**

```bash
cd ~/Developer/akgolf-hq
git add docs/ordliste-ak-golf.md
git commit -m "docs: deprecate ordliste-ak-golf.md, redirect to spec-v2"
```

---

## Verifikasjon (kjør etter alle oppgaver)

```bash
cd ~/Developer/akgolf-hq
npx tsc --noEmit          # 0 type-feil
npx prisma validate       # Schema er gyldig
npm run build             # Produksjons-build OK
```

Naviger og sjekk:
- `http://localhost:3000/admin/fys-maler` — viser 12 kort, filter fungerer
- `http://localhost:3000/admin/tester` — eksisterende test-sider uendret
- `http://localhost:3000/admin/drills` — FYS-drills viser nå coachNotes og tags

---

## Hva er IKKE i denne planen (bevisst utelatt)

- **Sprint 1** (Deepgram + TrackMan): blokkert på API-nøkler fra leverandørene
- **Sprint 4** (Multi-club): eksplisitt ekskludert av Anders
- **Push notifications**: PushSubscription-tabell mangler — eget steg
- **P2 polish** (~270 items): lav prioritet, eget sprint

---

*Plan skrevet: 2026-05-24 · akgolf-hq Sprint "FYS komplett"*
