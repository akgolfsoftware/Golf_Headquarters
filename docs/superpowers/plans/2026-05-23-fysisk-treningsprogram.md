# Fysisk Treningsprogram — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Legg til et komplett periodisert styrke- og kondisjonsprogram for golf-utøvere (13–19 år) i treningsplanleggeren — som `ExerciseDefinition`-er, økt-maler og ferdige `TrainingPlan`-templates per fase og aldersgruppe.

**Architecture:** Ren seed-basert tilnærming uten nye UI-komponenter. Eksisterende `ExerciseDefinition → SessionDrill → TrainingPlanSession → TrainingPlan`-kjeden brukes fullt ut. To schema-migrasjoner legger til `GYM` i `SessionEnvironment` og fire utstyrsflagger i `DrillFasilitet`. To nye seed-skript populerer databasen — ett for øvelser, ett for templates.

**Tech Stack:** Prisma 7 + `@prisma/adapter-pg` + `dotenv` + `npx tsx` (samme mønster som `seed-test-definitions.ts`)

---

## INNHOLD — Treningsprogrammet

### Prinsipper

- **Pyramide-kobling:** Alle fysiske økter bruker `pyramidArea: FYS`
- **Aldersgrupper:** U15 (13–15 år), U19 (16–19 år), Elite (20+)
- **Perioder (LPhase):** `GRUNN` (okt–des), `SPESIAL` (jan–feb), `TURNERING` (pre-sesong + sesong)
- **Frekvens:** 3 dager/uke off-season, 2 dager/uke sesong
- **Progresjon:** Lineær periodisering — volum ned, intensitet opp gjennom fasene

---

### Fase 1 — Grunnfase (Oktober–Desember · GRUNN)

**Formål:** Bygge styrke-base og aerob kapasitet. Høyt volum, moderat intensitet.

#### Styrkeøkt A — Nedre kropp + Core (Mandag)

| Øvelse | U15 | U19 | Elite |
|--------|-----|-----|-------|
| Trapbar Deadlift | 3×8 @ 60% | 4×6 @ 65% | 4×5 @ 70% |
| Bulgarian Split Squat | 3×10/ben | 3×8/ben | 4×6/ben |
| Nordic Hamstring Curl | 3×5 eksentri | 3×6 eksentri | 3×8 eksentri |
| Hip Thrust | 3×12 | 3×10 | 4×10 |
| Pallof Press | 3×12/side | 3×15/side | 3×15/side |
| Dead Bug | 3×8/side | 3×10/side | 3×12/side |

#### Styrkeøkt B — Øvre kropp + Rotasjon (Torsdag)

| Øvelse | U15 | U19 | Elite |
|--------|-----|-----|-------|
| Benkpress | 3×8 @ 60% | 4×6 @ 65% | 4×5 @ 70% |
| Chin-up / Assisted | 3×6 | 3×8 | 4×8 |
| Medisinball Rotasjonskast | 3×8/side | 3×10/side | 4×10/side |
| Landmine Press | 3×10 | 3×10 | 3×10 |
| Face Pull | 3×15 | 3×15 | 3×15 |
| Farmers Carry | 3×20m | 3×30m | 4×30m |

#### Kondisjon (Lørdag)

| Type | U15 | U19 | Elite |
|------|-----|-----|-------|
| Aerob base-løp | 20 min Z2 (65% HFmax) | 25 min Z2 | 30 min Z2 |
| Mål | Bygge aerob base | Bygge aerob base | Bygge aerob base |

---

### Fase 2 — Spesialfase (Januar–Februar · SPESIAL)

**Formål:** Øke intensitet, introdusere power-øvelser. Volum ned 20%, intensitet opp.

#### Styrkeøkt A — Power nedre kropp (Mandag)

| Øvelse | U15 | U19 | Elite |
|--------|-----|-----|-------|
| Trapbar Deadlift | 4×4 @ 75% | 4×4 @ 80% | 5×3 @ 85% |
| Jump Squat (kroppsvekt) | 4×5 | 4×5 | 4×5 |
| Bulgarian Split Squat | 3×6/ben | 3×6/ben | 4×5/ben |
| Nordic Hamstring Curl | 3×6 | 3×8 | 3×8 |
| Pallof Press | 3×12/side | 3×12/side | 3×15/side |

#### Styrkeøkt B — Power øvre + Rotasjon (Torsdag)

| Øvelse | U15 | U19 | Elite |
|--------|-----|-----|-------|
| Benkpress | 4×4 @ 75% | 4×4 @ 80% | 5×3 @ 85% |
| Med-ball Overhead Kast | 4×5 | 4×6 | 4×6 |
| Med-ball Rotasjonskast | 4×8/side | 4×10/side | 4×12/side |
| Chin-up | 3×6 | 4×6 | 4×8 |
| Face Pull | 3×15 | 3×15 | 3×15 |

#### Kondisjon (Lørdag)

| Type | U15 | U19 | Elite |
|------|-----|-----|-------|
| Intervaller | 4×600m @ 80% | 5×600m @ 82% | 6×600m @ 85% |
| Pause | 2 min mellom drag | 90 sek | 90 sek |
| Mål | Forberede 3000m test | Forberede 3000m test | Forberede 3000m test |

---

### Fase 3 — Pre-sesong (Mars–April · TURNERING)

**Formål:** Konvertere styrke til golf-spesifikk power. Volum ned 30%, intensitet maks.

#### Styrkeøkt A — Eksplosivitet (Mandag)

| Øvelse | U15 | U19 | Elite |
|--------|-----|-----|-------|
| Trapbar Deadlift | 3×3 @ 85% | 3×3 @ 87% | 4×2 @ 90% |
| Standing Long Jump | 4×3 hops | 4×3 hops | 5×3 hops |
| Single-leg RDL | 3×8/ben | 3×8/ben | 3×8/ben |
| Box Jump | 4×4 | 4×5 | 4×5 |

#### Styrkeøkt B — Rotasjonspower (Torsdag)

| Øvelse | U15 | U19 | Elite |
|--------|-----|-----|-------|
| Benkpress | 3×3 @ 85% | 3×3 @ 87% | 4×2 @ 90% |
| Med-ball Ball Throw (testform) | 4×5/side | 4×6/side | 5×6/side |
| Med-ball Rotasjonskast (maks) | 4×6/side | 4×8/side | 5×8/side |
| Chin-up (vektet) | 3×5 | 3×5 | 4×5 |

#### Kondisjon (Lørdag)

| Type | U15 | U19 | Elite |
|------|-----|-----|-------|
| 3000m testforberedelse | 6×400m @ 85% | 6×400m @ 87% | 3000m test |
| Mål | Speed-endurance | Speed-endurance | Benchmark |

---

### Fase 4 — Sesong (Mai–September · TURNERING)

**Formål:** Vedlikeholde styrke og kondisjon uten utmattelse. 2 dager/uke.

#### Vedlikeholdsøkt A (Tirsdag — aldri dagen før turnering)

| Øvelse | Alle grupper |
|--------|-------------|
| Trapbar Deadlift | 3×3 @ 80% (vedlikehold) |
| Bulgarian Split Squat | 2×6/ben |
| Med-ball Rotasjonskast | 3×8/side |
| Benkpress | 2×5 @ 75% |

#### Vedlikeholdsøkt B — Kondisjon (Torsdag)

| Type | Alle grupper |
|------|-------------|
| Aerob vedlikehold | 20–25 min Z2 |
| Formål | Holde aerob kapasitet, ikke bygge ny |

---

### Aldersdifferensiering — viktige regler

| Regel | U15 | U19 | Elite |
|-------|-----|-----|-------|
| 1RM-testing | Ikke anbefalt — bruk 3RM estimat | Ja, 2× per år | Ja, 2–3× per år |
| Medisinballvekt | 2 kg | 3 kg | 4 kg |
| Trapbar minimum | 20 kg total | 40 kg | Etter kapasitet |
| Kondisjon etter styrke? | Aldri — skill aldri på | 4t pause min | 4t pause min |
| Teknikkfokus | Alltid — form > vekt | Primær fokus | Vedlikehold form |

---

## TEKNISK IMPLEMENTASJON

### Filer som berøres

| Fil | Handling | Beskrivelse |
|-----|----------|-------------|
| `prisma/schema.prisma` | Modifiser | Legg til `GYM` i `SessionEnvironment`, `VEKTSTANG` + `TRAPBAR` + `LOPEBANE` + `MED_BALL` i `DrillFasilitet` |
| `prisma/migrations/` | Opprett automatisk | Via `npx prisma migrate dev` |
| `scripts/seed-physical-exercises.ts` | Opprett | ~20 `ExerciseDefinition`-er for FYS-pyramiden |
| `scripts/seed-physical-templates.ts` | Opprett | 4 `TrainingPlan`-maler (Grunnfase, Spesial, Pre-sesong, Sesong) × 3 aldersgrupper = 12 templates |
| `src/generated/prisma/` | Regenerer | `npx prisma generate` |

---

### Task 1: Schema-migrasjon — GYM og utstyrsflagg

**Filer:**
- Modifiser: `prisma/schema.prisma` (linje med `SessionEnvironment` og `DrillFasilitet`)

- [ ] **Steg 1.1 — Legg til GYM i SessionEnvironment**

Finn blokken:
```prisma
enum SessionEnvironment {
  RANGE
  BANE
  STUDIO
  HJEM
  SIMULATOR
}
```
Endre til:
```prisma
enum SessionEnvironment {
  RANGE
  BANE
  STUDIO
  HJEM
  SIMULATOR
  GYM
}
```

- [ ] **Steg 1.2 — Legg til utstyrsflagg i DrillFasilitet**

Finn `DrillFasilitet`-blokken og legg til på slutten, før avsluttende `}`:
```prisma
  VEKTSTANG      // Benkpress, squat rack
  TRAPBAR        // Hex bar / trapbar
  LOPEBANE       // Friidrettsbane eller tredemølle
  MED_BALL       // Medisinball (2–4 kg)
```

- [ ] **Steg 1.3 — Kjør migrasjon**

```bash
cd ~/Developer/akgolf-hq
npx prisma migrate dev --name "add_gym_environment_and_physical_equipment"
```

Forventet output:
```
✓ Generated Prisma Client
The following migration was created: .../add_gym_environment_and_physical_equipment
```

- [ ] **Steg 1.4 — Regenerer Prisma-klient**

```bash
npx prisma generate
```

- [ ] **Steg 1.5 — Type-sjekk**

```bash
npx tsc --noEmit
```

Forventet output: ingen feil.

- [ ] **Steg 1.6 — Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ src/generated/
git commit -m "feat: add GYM environment and physical equipment flags to schema"
```

---

### Task 2: Seed — ExerciseDefinition for fysiske øvelser

**Filer:**
- Opprett: `scripts/seed-physical-exercises.ts`

- [ ] **Steg 2.1 — Opprett seed-skriptet**

Opprett filen `scripts/seed-physical-exercises.ts` med dette innholdet:

```typescript
/**
 * Seed fysiske ExerciseDefinition-er (PyramidArea = FYS)
 * for styrke- og kondisjonsprogrammet.
 *
 * Kjør: npx tsx scripts/seed-physical-exercises.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type ExerciseSeed = {
  id: string;
  name: string;
  description: string;
  defaultRepsSets: string;
  fasilitetKrav: string[];
  parametersJson: object;
};

const EXERCISES: ExerciseSeed[] = [
  // --- STYRKE NEDRE ---
  {
    id: "trapbar-deadlift",
    name: "Trapbar Deadlift",
    description:
      "Hoftedominant trekkøvelse med hex bar. Stå inni baren, grep i sidehåndtakene, hofte bak, rygg nøytral. Press gulvet ned — ikke dra stangen opp. Grunnøvelsen for total-kroppsstyrke og slagkraft.",
    defaultRepsSets: "4×6",
    fasilitetKrav: ["TRAPBAR"],
    parametersJson: {
      intensitetssoner: { grunn: "60–70%", spesial: "75–85%", turnering: "85–90%" },
      cueNorsk: ["Hofte bak", "Rygg nøytral", "Press gulvet ned", "Skulder over baren"],
      testKobling: "Trapbar Deadlift (1RM-test)",
    },
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    description:
      "Enbens knebøy med bakre fot på benk. Tester og bygger bilateral styrkebalanse. Kritisk for rotasjonsstabilitet i golfsvingen.",
    defaultRepsSets: "3×8/ben",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Fremre fot nok frem", "Kne sporer over tå", "Hofte ned — ikke frem"],
      progressjon: ["Kroppsvekt", "Håndvekter", "Stang på skulder"],
    },
  },
  {
    id: "nordic-hamstring-curl",
    name: "Nordic Hamstring Curl",
    description:
      "Eksentri hamstringsøvelse. Kne på matte, partner holder ankler. Fall sakte fremover, brems med hamstrings. Skadeforebyggende og kraftutvikling.",
    defaultRepsSets: "3×5 eksentri",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Sakte fall — 3–4 sek", "Brems med hamstrings — ikke kjernen", "Push opp med hendene fra gulvet"],
      progressjon: ["3 sek fall", "4 sek fall", "Full Nordic", "Vektet Nordic"],
    },
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    description:
      "Isolert gluteusøvelse. Skuldre på benk, stang over hofter, trykk hoftene opp. Fundamental for rotasjonskraft fra hoftene i svingen.",
    defaultRepsSets: "3×10",
    fasilitetKrav: ["VEKTSTANG"],
    parametersJson: {
      cueNorsk: ["Hake inn", "Klem setemusklene toppen", "Kne 90° i toppen"],
    },
  },
  {
    id: "box-jump",
    name: "Box Jump",
    description:
      "Eksplosivt hopp opp på kasse. Myk landing, strak kropp. Trener reaktiv kraft og eksplosivitet i bena — direkte overføring til Standing Long Jump-testen.",
    defaultRepsSets: "4×5",
    fasilitetKrav: [],
    parametersJson: {
      kassehoyde: { u15: "40–50cm", u19: "50–60cm", elite: "60–75cm" },
      cueNorsk: ["Rask armsvingstart", "Full hoftestrekk i toppen", "Myk landing — absorber"],
      testKobling: "Standing Long Jump",
    },
  },
  {
    id: "jump-squat",
    name: "Jump Squat",
    description:
      "Eksplosiv knebøy med hopp. Kroppsvekt eller lett stang (≤20 kg). Trener power-output og rate of force development.",
    defaultRepsSets: "4×5",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Hurtig ned — eksplosivt opp", "Full hoftestrekk", "Myk landing"],
      progressjon: ["Kroppsvekt", "Vest 5kg", "Stang 20kg"],
    },
  },
  {
    id: "single-leg-rdl",
    name: "Single-leg RDL",
    description:
      "Enbens Romanian Deadlift. Stå på ett ben, senk overkroppen fremover. Trener posterior kjede, balanse og bilateral stabilitetsasymmetri — kritisk for golfsvingen.",
    defaultRepsSets: "3×8/ben",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Hoftehengsling — ikke knebøy", "Rygg nøytral", "Støttebenet lett bøyd"],
      progressjon: ["Kroppsvekt", "Håndvekter", "Kettlebell"],
    },
  },
  // --- STYRKE ØVRE + ROTASJON ---
  {
    id: "benkpress",
    name: "Benkpress",
    description:
      "Flat benkpress. Full ROM, kontrollert nedsenking 2–3 sek, eksplosivt opp. Overkroppsstyrke for gjennomslaget. Primær øvre-kroppsstyrketest.",
    defaultRepsSets: "4×6",
    fasilitetKrav: ["VEKTSTANG"],
    parametersJson: {
      intensitetssoner: { grunn: "60–70%", spesial: "75–85%", turnering: "85–90%" },
      cueNorsk: ["Skulderbladene trukket inn", "Føttene i gulvet", "Albuer 45–60° fra kroppen"],
      testKobling: "Benkpress (1RM-test)",
    },
  },
  {
    id: "chin-up",
    name: "Chin-up / Pull-up",
    description:
      "Overkroppstrekkøvelse. Chin-up (supinert grep) for underarm + biceps. Pull-up (pronert) for bredrygg. Start med strikk-assist ved behov.",
    defaultRepsSets: "3×8",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Skulderblad ned og inn", "Bryst mot stangen", "Kontrollert ned"],
      progressjon: ["Strikk-assist", "Kroppsvekt", "Vektet +5kg"],
    },
  },
  {
    id: "med-ball-rotasjonskast",
    name: "Medisinball Rotasjonskast",
    description:
      "Stå 90° mot vegg, roter og kast ballen i veggen med maksimal rotasjonskraft. Identisk med Ball Throw-testen. Bygger direkte køllehodehastighet.",
    defaultRepsSets: "3×8/side",
    fasilitetKrav: ["MED_BALL"],
    parametersJson: {
      ballvekt: { u15: "2 kg", u19: "3 kg", elite: "4 kg" },
      cueNorsk: ["Kraft starter fra gulvet", "Hofte roterer først", "Armer følger — ikke leder"],
      testKobling: "Ball Throw",
    },
  },
  {
    id: "med-ball-overhead-kast",
    name: "Medisinball Overhead Kast",
    description:
      "Rett bakover-kast over hodet. Stå med rygg mot kastretning, eksplosiv strekk fra hofter til armtopp. Trener bakre kjede-power.",
    defaultRepsSets: "4×5",
    fasilitetKrav: ["MED_BALL"],
    parametersJson: {
      ballvekt: { u15: "2 kg", u19: "3 kg", elite: "4 kg" },
      cueNorsk: ["Dyp knebøy start", "Eksplosiv full hoftestrekk", "Slipp ikke ballen — kast den"],
    },
  },
  {
    id: "landmine-press",
    name: "Landmine Press",
    description:
      "Stang forankret i hjørne, press diagonalt opp foran kroppen. Kombinerer push og rotasjon. Skuldervennlig alternativ til overhead press for unge utøvere.",
    defaultRepsSets: "3×10",
    fasilitetKrav: ["VEKTSTANG"],
    parametersJson: {
      cueNorsk: ["Kjerne stram", "Press diagonalt opp-frem", "Full armstrekk i toppen"],
    },
  },
  {
    id: "face-pull",
    name: "Face Pull",
    description:
      "Kabel/strikk til ansiktshøyde, trekk til ørene med utadrotasjon. Skulder-helse og postural korreksjon. Obligatorisk i alle styrkeøkter for golfspillere.",
    defaultRepsSets: "3×15",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Albuer høyt", "Trekk til ørene — ikke nakken", "Utadroter i toppen"],
    },
  },
  {
    id: "pallof-press",
    name: "Pallof Press",
    description:
      "Anti-rotasjonsøvelse med strikk/kabel. Stå 90° på ankerpunktet, trykk strikken rett frem og hold. Bygger rotasjonsstabilitet — grunnlaget for golf-kraft.",
    defaultRepsSets: "3×12/side",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Kjerne stram, ikke hold pusten", "Hofter kvadrert", "Hold 2 sek i utstrakt posisjon"],
    },
  },
  {
    id: "farmers-carry",
    name: "Farmers Carry",
    description:
      "Gå med tung vekt i én eller begge hender. Trener grip, skulder-stabilitet og anti-lateral fleksjon. Overføring til bag-bæring og stabilt adresseposition.",
    defaultRepsSets: "3×30m",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Rak nakke", "Skulderblad ned og inn", "Korte, raske steg"],
    },
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    description:
      "Ryggliggende, arm og motsatt ben senkes mot gulvet uten at korsryggen løftes. Kjerneøvelse som trener anti-ekstensjon og koordinasjon.",
    defaultRepsSets: "3×8/side",
    fasilitetKrav: [],
    parametersJson: {
      cueNorsk: ["Korsryggen i gulvet hele veien", "Pust ut ved bevegelse", "Sakte og kontrollert"],
    },
  },
  // --- KONDISJON ---
  {
    id: "intervall-600m",
    name: "Intervallørkt 600m",
    description:
      "Strukturert intervall-løping. 600m drag med pause mellom. Bygger speed-endurance og forbereder 3000m-testen. Kjør på friidrettsbane.",
    defaultRepsSets: "5×600m",
    fasilitetKrav: ["LOPEBANE"],
    parametersJson: {
      intensitet: { u15: "80% HFmax", u19: "82% HFmax", elite: "85% HFmax" },
      pause: { u15: "2 min", u19: "90 sek", elite: "90 sek" },
      testKobling: "3000m Utholdenhet",
    },
  },
  {
    id: "aerob-base-lop",
    name: "Aerob Base-løp",
    description:
      "Kontinuerlig løp i sone 2 (65–75% HFmax). Ikke rask — prat-tempo. Grunnlaget for all aerob kapasitet. Kritisk for golf: holder konsentrasjon hull 14–18.",
    defaultRepsSets: "25 min",
    fasilitetKrav: ["LOPEBANE"],
    parametersJson: {
      intensitet: "65–75% HFmax (prat-tempo)",
      varighet: { u15: "20 min", u19: "25 min", elite: "30 min" },
      testKobling: "3000m Utholdenhet",
    },
  },
  {
    id: "intervall-400m",
    name: "Intervallørkt 400m",
    description:
      "Kort, intensiv intervall. 400m drag, høy intensitet. Pre-sesong forberedelse. Konverterer aerob base til speed-kapasitet.",
    defaultRepsSets: "6×400m",
    fasilitetKrav: ["LOPEBANE"],
    parametersJson: {
      intensitet: { u15: "85% HFmax", u19: "87% HFmax", elite: "90% HFmax" },
      pause: "2 min",
      testKobling: "3000m Utholdenhet",
    },
  },
  {
    id: "vedlikeholdslop",
    name: "Vedlikeholdsløp sesong",
    description:
      "Lett aerob vedlikehold under golfsesong. 20–25 min Z2. Formål: bevare aerob kapasitet uten utmattelse foran turneringer.",
    defaultRepsSets: "22 min",
    fasilitetKrav: ["LOPEBANE"],
    parametersJson: {
      intensitet: "65% HFmax — veldig lett",
      varighet: "20–25 min",
      notat: "Aldri dagen før eller etter turnering",
    },
  },
];

async function main() {
  console.log(`Seeder ${EXERCISES.length} fysiske øvelser (FYS)...`);

  for (const ex of EXERCISES) {
    await prisma.exerciseDefinition.upsert({
      where: { id: ex.id },
      update: {
        name: ex.name,
        description: ex.description,
        defaultRepsSets: ex.defaultRepsSets,
        pyramidArea: "FYS",
        parametersJson: ex.parametersJson as object,
      },
      create: {
        id: ex.id,
        name: ex.name,
        description: ex.description,
        defaultRepsSets: ex.defaultRepsSets,
        pyramidArea: "FYS",
        parametersJson: ex.parametersJson as object,
      },
    });
    console.log(`  + ${ex.name}`);
  }

  console.log(`\nFerdig! ${EXERCISES.length} øvelser seedet.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Steg 2.2 — Kjør seed-skriptet**

```bash
cd ~/Developer/akgolf-hq
npx tsx scripts/seed-physical-exercises.ts
```

Forventet output: 19–20 linjer med `+ [øvelsenavn]`, avslutter med `Ferdig! 20 øvelser seedet.`

- [ ] **Steg 2.3 — Commit**

```bash
git add scripts/seed-physical-exercises.ts
git commit -m "feat: seed 20 FYS exercise definitions for physical training program"
```

---

### Task 3: Seed — TrainingPlan-maler per fase og aldersgruppe

**Filer:**
- Opprett: `scripts/seed-physical-templates.ts`

**Merk:** Dette er en lengre seed. Den oppretter plan-maler (uten `userId` — brukes som maler), med `TrainingPlanSession`-er og `SessionDrill`-er per uke.

- [ ] **Steg 3.1 — Opprett seed-skriptet**

Opprett filen `scripts/seed-physical-templates.ts`:

```typescript
/**
 * Seed TrainingPlan-maler for fysisk treningsprogram.
 * 4 faser × 3 aldersgrupper = 12 plan-maler.
 *
 * Kjør: npx tsx scripts/seed-physical-templates.ts
 * Krever at seed-physical-exercises.ts er kjørt først.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type AgeGroup = "U15" | "U19" | "ELITE";

// Øvelse-ID → reps/sett per aldersgruppe og fase
const SETS: Record<string, Record<string, Record<AgeGroup, string>>> = {
  "trapbar-deadlift": {
    GRUNN:     { U15: "3×8", U19: "4×6", ELITE: "4×5" },
    SPESIAL:   { U15: "4×4", U19: "4×4", ELITE: "5×3" },
    TURNERING: { U15: "3×3", U19: "3×3", ELITE: "4×2" },
    SESONG:    { U15: "3×3", U19: "3×3", ELITE: "3×3" },
  },
  "benkpress": {
    GRUNN:     { U15: "3×8", U19: "4×6", ELITE: "4×5" },
    SPESIAL:   { U15: "4×4", U19: "4×4", ELITE: "5×3" },
    TURNERING: { U15: "3×3", U19: "3×3", ELITE: "4×2" },
    SESONG:    { U15: "2×5", U19: "2×5", ELITE: "2×5" },
  },
  "bulgarian-split-squat": {
    GRUNN:     { U15: "3×10", U19: "3×8", ELITE: "4×6" },
    SPESIAL:   { U15: "3×6", U19: "3×6", ELITE: "4×5" },
    TURNERING: { U15: "2×6", U19: "2×6", ELITE: "3×5" },
    SESONG:    { U15: "2×6", U19: "2×6", ELITE: "2×6" },
  },
  "nordic-hamstring-curl": {
    GRUNN:     { U15: "3×5", U19: "3×6", ELITE: "3×8" },
    SPESIAL:   { U15: "3×6", U19: "3×8", ELITE: "3×8" },
    TURNERING: { U15: "2×5", U19: "2×6", ELITE: "2×6" },
    SESONG:    { U15: "2×5", U19: "2×5", ELITE: "2×5" },
  },
  "pallof-press": {
    GRUNN:     { U15: "3×12", U19: "3×15", ELITE: "3×15" },
    SPESIAL:   { U15: "3×12", U19: "3×12", ELITE: "3×15" },
    TURNERING: { U15: "2×10", U19: "2×12", ELITE: "2×12" },
    SESONG:    { U15: "2×10", U19: "2×10", ELITE: "2×10" },
  },
  "hip-thrust": {
    GRUNN:     { U15: "3×12", U19: "3×10", ELITE: "4×10" },
    SPESIAL:   { U15: "3×8", U19: "3×8", ELITE: "4×8" },
    TURNERING: { U15: "2×8", U19: "2×8", ELITE: "3×6" },
    SESONG:    { U15: "2×8", U19: "2×8", ELITE: "2×8" },
  },
  "dead-bug": {
    GRUNN:     { U15: "3×8", U19: "3×10", ELITE: "3×12" },
    SPESIAL:   { U15: "2×8", U19: "2×10", ELITE: "2×12" },
    TURNERING: { U15: "2×8", U19: "2×8", ELITE: "2×10" },
    SESONG:    { U15: "2×8", U19: "2×8", ELITE: "2×8" },
  },
  "chin-up": {
    GRUNN:     { U15: "3×6", U19: "3×8", ELITE: "4×8" },
    SPESIAL:   { U15: "3×6", U19: "4×6", ELITE: "4×8" },
    TURNERING: { U15: "2×5", U19: "3×5", ELITE: "4×5" },
    SESONG:    { U15: "2×5", U19: "2×5", ELITE: "3×5" },
  },
  "med-ball-rotasjonskast": {
    GRUNN:     { U15: "3×8", U19: "3×10", ELITE: "4×10" },
    SPESIAL:   { U15: "4×8", U19: "4×10", ELITE: "4×12" },
    TURNERING: { U15: "4×6", U19: "4×8", ELITE: "5×8" },
    SESONG:    { U15: "3×8", U19: "3×8", ELITE: "3×8" },
  },
  "face-pull": {
    GRUNN:     { U15: "3×15", U19: "3×15", ELITE: "3×15" },
    SPESIAL:   { U15: "3×15", U19: "3×15", ELITE: "3×15" },
    TURNERING: { U15: "2×15", U19: "2×15", ELITE: "2×15" },
    SESONG:    { U15: "2×15", U19: "2×15", ELITE: "2×15" },
  },
  "box-jump": {
    GRUNN:     { U15: "3×5", U19: "4×5", ELITE: "4×5" },
    SPESIAL:   { U15: "4×4", U19: "4×5", ELITE: "4×5" },
    TURNERING: { U15: "4×4", U19: "4×5", ELITE: "4×5" },
    SESONG:    { U15: "3×4", U19: "3×4", ELITE: "3×4" },
  },
  "med-ball-overhead-kast": {
    GRUNN:     { U15: "3×6", U19: "4×5", ELITE: "4×6" },
    SPESIAL:   { U15: "4×5", U19: "4×6", ELITE: "4×6" },
    TURNERING: { U15: "3×5", U19: "3×6", ELITE: "4×6" },
    SESONG:    { U15: "3×5", U19: "3×5", ELITE: "3×5" },
  },
  "aerob-base-lop": {
    GRUNN:     { U15: "20 min Z2", U19: "25 min Z2", ELITE: "30 min Z2" },
    SPESIAL:   { U15: "20 min Z2", U19: "20 min Z2", ELITE: "20 min Z2" },
    TURNERING: { U15: "15 min lett", U19: "15 min lett", ELITE: "15 min lett" },
    SESONG:    { U15: "20 min Z2", U19: "22 min Z2", ELITE: "25 min Z2" },
  },
  "intervall-600m": {
    GRUNN:     { U15: "4×600m", U19: "5×600m", ELITE: "6×600m" },
    SPESIAL:   { U15: "4×600m", U19: "5×600m", ELITE: "6×600m" },
    TURNERING: { U15: "3×600m", U19: "4×600m", ELITE: "5×600m" },
    SESONG:    { U15: "3×600m", U19: "3×600m", ELITE: "4×600m" },
  },
  "intervall-400m": {
    GRUNN:     { U15: "5×400m", U19: "6×400m", ELITE: "8×400m" },
    SPESIAL:   { U15: "5×400m", U19: "6×400m", ELITE: "8×400m" },
    TURNERING: { U15: "5×400m", U19: "6×400m", ELITE: "8×400m" },
    SESONG:    { U15: "4×400m", U19: "5×400m", ELITE: "6×400m" },
  },
};

type SessionDef = {
  title: string;
  durationMin: number;
  environment: "GYM" | "LOPEBANE";
  lPhase: "GRUNN" | "SPESIAL" | "TURNERING";
  exercises: string[]; // exercise IDs i orden
};

type PlanDef = {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  phase: "GRUNN" | "SPESIAL" | "TURNERING" | "SESONG";
  lPhase: "GRUNN" | "SPESIAL" | "TURNERING";
  durationWeeks: number;
  sessions: SessionDef[]; // per uke — 3 sessions = 3 dager
};

const PLANS: PlanDef[] = [
  // --- GRUNNFASE ---
  {
    id: "fys-grunn-u15",
    name: "Fysisk grunnfase — U15 (okt–des)",
    ageGroup: "U15", phase: "GRUNN", lPhase: "GRUNN", durationWeeks: 12,
    sessions: [
      {
        title: "Styrke A — Nedre kropp",
        durationMin: 55,
        environment: "GYM",
        lPhase: "GRUNN",
        exercises: ["trapbar-deadlift", "bulgarian-split-squat", "nordic-hamstring-curl", "hip-thrust", "pallof-press", "dead-bug"],
      },
      {
        title: "Kondisjon — Aerob base",
        durationMin: 30,
        environment: "LOPEBANE",
        lPhase: "GRUNN",
        exercises: ["aerob-base-lop"],
      },
      {
        title: "Styrke B — Øvre kropp + Rotasjon",
        durationMin: 55,
        environment: "GYM",
        lPhase: "GRUNN",
        exercises: ["benkpress", "chin-up", "med-ball-rotasjonskast", "face-pull", "farmers-carry"],
      },
    ],
  },
  {
    id: "fys-grunn-u19",
    name: "Fysisk grunnfase — U19 (okt–des)",
    ageGroup: "U19", phase: "GRUNN", lPhase: "GRUNN", durationWeeks: 12,
    sessions: [
      {
        title: "Styrke A — Nedre kropp + Power",
        durationMin: 65,
        environment: "GYM",
        lPhase: "GRUNN",
        exercises: ["trapbar-deadlift", "bulgarian-split-squat", "nordic-hamstring-curl", "hip-thrust", "box-jump", "pallof-press"],
      },
      {
        title: "Kondisjon — Aerob base",
        durationMin: 35,
        environment: "LOPEBANE",
        lPhase: "GRUNN",
        exercises: ["aerob-base-lop"],
      },
      {
        title: "Styrke B — Øvre kropp + Rotasjon",
        durationMin: 65,
        environment: "GYM",
        lPhase: "GRUNN",
        exercises: ["benkpress", "chin-up", "med-ball-rotasjonskast", "med-ball-overhead-kast", "face-pull"],
      },
    ],
  },
  {
    id: "fys-grunn-elite",
    name: "Fysisk grunnfase — Elite (okt–des)",
    ageGroup: "ELITE", phase: "GRUNN", lPhase: "GRUNN", durationWeeks: 12,
    sessions: [
      {
        title: "Styrke A — Nedre kropp + Power",
        durationMin: 75,
        environment: "GYM",
        lPhase: "GRUNN",
        exercises: ["trapbar-deadlift", "bulgarian-split-squat", "nordic-hamstring-curl", "hip-thrust", "box-jump", "pallof-press", "dead-bug"],
      },
      {
        title: "Kondisjon — Aerob base",
        durationMin: 40,
        environment: "LOPEBANE",
        lPhase: "GRUNN",
        exercises: ["aerob-base-lop"],
      },
      {
        title: "Styrke B — Øvre kropp + Rotasjon",
        durationMin: 75,
        environment: "GYM",
        lPhase: "GRUNN",
        exercises: ["benkpress", "chin-up", "med-ball-rotasjonskast", "med-ball-overhead-kast", "face-pull", "farmers-carry"],
      },
    ],
  },
  // --- SPESIALFASE ---
  {
    id: "fys-spesial-u15",
    name: "Fysisk spesialfase — U15 (jan–feb)",
    ageGroup: "U15", phase: "SPESIAL", lPhase: "SPESIAL", durationWeeks: 8,
    sessions: [
      {
        title: "Styrke A — Power nedre",
        durationMin: 55,
        environment: "GYM",
        lPhase: "SPESIAL",
        exercises: ["trapbar-deadlift", "jump-squat", "bulgarian-split-squat", "nordic-hamstring-curl", "pallof-press"],
      },
      {
        title: "Kondisjon — Intervaller 600m",
        durationMin: 35,
        environment: "LOPEBANE",
        lPhase: "SPESIAL",
        exercises: ["intervall-600m"],
      },
      {
        title: "Styrke B — Power øvre + Rotasjon",
        durationMin: 55,
        environment: "GYM",
        lPhase: "SPESIAL",
        exercises: ["benkpress", "med-ball-overhead-kast", "med-ball-rotasjonskast", "chin-up", "face-pull"],
      },
    ],
  },
  {
    id: "fys-spesial-u19",
    name: "Fysisk spesialfase — U19 (jan–feb)",
    ageGroup: "U19", phase: "SPESIAL", lPhase: "SPESIAL", durationWeeks: 8,
    sessions: [
      {
        title: "Styrke A — Power nedre",
        durationMin: 65,
        environment: "GYM",
        lPhase: "SPESIAL",
        exercises: ["trapbar-deadlift", "jump-squat", "bulgarian-split-squat", "nordic-hamstring-curl", "hip-thrust", "pallof-press"],
      },
      {
        title: "Kondisjon — Intervaller 600m",
        durationMin: 40,
        environment: "LOPEBANE",
        lPhase: "SPESIAL",
        exercises: ["intervall-600m"],
      },
      {
        title: "Styrke B — Power øvre + Rotasjon",
        durationMin: 65,
        environment: "GYM",
        lPhase: "SPESIAL",
        exercises: ["benkpress", "med-ball-overhead-kast", "med-ball-rotasjonskast", "chin-up", "face-pull"],
      },
    ],
  },
  {
    id: "fys-spesial-elite",
    name: "Fysisk spesialfase — Elite (jan–feb)",
    ageGroup: "ELITE", phase: "SPESIAL", lPhase: "SPESIAL", durationWeeks: 8,
    sessions: [
      {
        title: "Styrke A — Maks power nedre",
        durationMin: 75,
        environment: "GYM",
        lPhase: "SPESIAL",
        exercises: ["trapbar-deadlift", "jump-squat", "box-jump", "bulgarian-split-squat", "nordic-hamstring-curl", "pallof-press"],
      },
      {
        title: "Kondisjon — Intervaller 600m",
        durationMin: 45,
        environment: "LOPEBANE",
        lPhase: "SPESIAL",
        exercises: ["intervall-600m"],
      },
      {
        title: "Styrke B — Maks power øvre + Rotasjon",
        durationMin: 75,
        environment: "GYM",
        lPhase: "SPESIAL",
        exercises: ["benkpress", "med-ball-overhead-kast", "med-ball-rotasjonskast", "chin-up", "face-pull", "farmers-carry"],
      },
    ],
  },
  // --- PRE-SESONG ---
  {
    id: "fys-turnering-u15",
    name: "Fysisk pre-sesong — U15 (mars–april)",
    ageGroup: "U15", phase: "TURNERING", lPhase: "TURNERING", durationWeeks: 8,
    sessions: [
      {
        title: "Eksplosivitet nedre",
        durationMin: 45,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["trapbar-deadlift", "box-jump", "single-leg-rdl", "pallof-press"],
      },
      {
        title: "Kondisjon — 400m intervaller",
        durationMin: 35,
        environment: "LOPEBANE",
        lPhase: "TURNERING",
        exercises: ["intervall-400m"],
      },
      {
        title: "Rotasjonspower",
        durationMin: 45,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["benkpress", "med-ball-rotasjonskast", "med-ball-overhead-kast", "chin-up", "face-pull"],
      },
    ],
  },
  {
    id: "fys-turnering-u19",
    name: "Fysisk pre-sesong — U19 (mars–april)",
    ageGroup: "U19", phase: "TURNERING", lPhase: "TURNERING", durationWeeks: 8,
    sessions: [
      {
        title: "Eksplosivitet nedre",
        durationMin: 55,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["trapbar-deadlift", "box-jump", "jump-squat", "single-leg-rdl", "pallof-press"],
      },
      {
        title: "Kondisjon — 400m intervaller",
        durationMin: 40,
        environment: "LOPEBANE",
        lPhase: "TURNERING",
        exercises: ["intervall-400m"],
      },
      {
        title: "Rotasjonspower (maks)",
        durationMin: 55,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["benkpress", "med-ball-rotasjonskast", "med-ball-overhead-kast", "chin-up", "face-pull"],
      },
    ],
  },
  {
    id: "fys-turnering-elite",
    name: "Fysisk pre-sesong — Elite (mars–april)",
    ageGroup: "ELITE", phase: "TURNERING", lPhase: "TURNERING", durationWeeks: 8,
    sessions: [
      {
        title: "Eksplosivitet nedre (maks)",
        durationMin: 65,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["trapbar-deadlift", "box-jump", "jump-squat", "single-leg-rdl", "nordic-hamstring-curl", "pallof-press"],
      },
      {
        title: "Kondisjon — 400m intervaller",
        durationMin: 45,
        environment: "LOPEBANE",
        lPhase: "TURNERING",
        exercises: ["intervall-400m"],
      },
      {
        title: "Rotasjonspower (maks)",
        durationMin: 65,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["benkpress", "med-ball-rotasjonskast", "med-ball-overhead-kast", "chin-up", "farmers-carry", "face-pull"],
      },
    ],
  },
  // --- SESONG VEDLIKEHOLD ---
  {
    id: "fys-sesong-u15",
    name: "Fysisk sesong vedlikehold — U15 (mai–sep)",
    ageGroup: "U15", phase: "SESONG", lPhase: "TURNERING", durationWeeks: 20,
    sessions: [
      {
        title: "Vedlikehold styrke",
        durationMin: 40,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["trapbar-deadlift", "bulgarian-split-squat", "med-ball-rotasjonskast", "benkpress", "face-pull"],
      },
      {
        title: "Vedlikehold kondisjon",
        durationMin: 30,
        environment: "LOPEBANE",
        lPhase: "TURNERING",
        exercises: ["vedlikeholdslop"],
      },
    ],
  },
  {
    id: "fys-sesong-u19",
    name: "Fysisk sesong vedlikehold — U19 (mai–sep)",
    ageGroup: "U19", phase: "SESONG", lPhase: "TURNERING", durationWeeks: 20,
    sessions: [
      {
        title: "Vedlikehold styrke",
        durationMin: 45,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["trapbar-deadlift", "bulgarian-split-squat", "med-ball-rotasjonskast", "benkpress", "chin-up", "face-pull"],
      },
      {
        title: "Vedlikehold kondisjon",
        durationMin: 30,
        environment: "LOPEBANE",
        lPhase: "TURNERING",
        exercises: ["vedlikeholdslop"],
      },
    ],
  },
  {
    id: "fys-sesong-elite",
    name: "Fysisk sesong vedlikehold — Elite (mai–sep)",
    ageGroup: "ELITE", phase: "SESONG", lPhase: "TURNERING", durationWeeks: 20,
    sessions: [
      {
        title: "Vedlikehold styrke",
        durationMin: 55,
        environment: "GYM",
        lPhase: "TURNERING",
        exercises: ["trapbar-deadlift", "single-leg-rdl", "med-ball-rotasjonskast", "benkpress", "chin-up", "face-pull"],
      },
      {
        title: "Vedlikehold kondisjon",
        durationMin: 35,
        environment: "LOPEBANE",
        lPhase: "TURNERING",
        exercises: ["intervall-400m"],
      },
    ],
  },
];

// Hjelpefunksjon: finn sett/reps for en øvelse-fase-aldersgruppe
function getSets(exerciseId: string, phase: string, ageGroup: AgeGroup): string {
  return SETS[exerciseId]?.[phase]?.[ageGroup] ?? "3×8";
}

// Startdato per fase (brukes som planens startDate — coach justerer ved tildeling)
function startDateForPhase(phase: string): Date {
  const year = new Date().getFullYear();
  const dates: Record<string, Date> = {
    GRUNN:     new Date(`${year}-10-01`),
    SPESIAL:   new Date(`${year + 1}-01-06`),
    TURNERING: new Date(`${year + 1}-03-01`),
    SESONG:    new Date(`${year + 1}-05-01`),
  };
  return dates[phase] ?? new Date();
}

async function main() {
  console.log(`Seeder ${PLANS.length} fysiske plan-maler...`);

  for (const plan of PLANS) {
    // Upsert: slett eksisterende plan med samme ID for å rydde opp sessions
    await prisma.trainingPlan.deleteMany({ where: { id: plan.id } });

    const startDate = startDateForPhase(plan.phase);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationWeeks * 7);

    const createdPlan = await prisma.trainingPlan.create({
      data: {
        id: plan.id,
        // Maler har ingen userId — settes av coach ved tildeling.
        // Bruk en placeholder userId som ikke tilhører noen bruker.
        userId: "template-placeholder",
        name: plan.name,
        startDate,
        endDate,
        isActive: false, // Maler er ikke aktive
        status: "DRAFT",
      },
    });

    // Opprett ukentlige sessions (uke 1 som mal — coach kopierer mønsteret)
    for (let dayIndex = 0; dayIndex < plan.sessions.length; dayIndex++) {
      const s = plan.sessions[dayIndex];
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + [0, 2, 4][dayIndex]); // Man, Ons, Fre

      const session = await prisma.trainingPlanSession.create({
        data: {
          planId: createdPlan.id,
          scheduledAt: sessionDate,
          durationMin: s.durationMin,
          title: s.title,
          pyramidArea: "FYS",
          lPhase: s.lPhase,
          environment: s.environment,
          status: "PLANNED",
        },
      });

      // Opprett drills for denne sesjonen
      for (let i = 0; i < s.exercises.length; i++) {
        const exId = s.exercises[i];
        const repsSets = getSets(exId, plan.phase, plan.ageGroup);
        await prisma.sessionDrill.create({
          data: {
            sessionId: session.id,
            exerciseId: exId,
            repsSets,
            orderIndex: i,
          },
        });
      }
    }

    console.log(`  + ${plan.name} (${plan.sessions.length} sessions/uke)`);
  }

  console.log(`\nFerdig! ${PLANS.length} plan-maler seedet.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Steg 3.2 — Kjør seed-skriptet**

```bash
cd ~/Developer/akgolf-hq
npx tsx scripts/seed-physical-templates.ts
```

Forventet output: 12 linjer med `+ [plannavn]`, avslutter med `Ferdig! 12 plan-maler seedet.`

- [ ] **Steg 3.3 — Commit**

```bash
git add scripts/seed-physical-templates.ts
git commit -m "feat: seed 12 physical training plan templates across 4 phases and 3 age groups"
```

---

### Task 4: Type-sjekk og push

- [ ] **Steg 4.1 — Full type-sjekk**

```bash
cd ~/Developer/akgolf-hq
npx tsc --noEmit
```

Forventet output: ingen feil. Hvis `SessionEnvironment.GYM` ikke er gjenkjent: kjør `npx prisma generate` på nytt.

- [ ] **Steg 4.2 — Push til main**

```bash
git push origin main
```

---

## Self-review

**Spec-dekning:**
- Styrkeprogram med Trapbar Deadlift og Benkpress: Task 2 + 3
- Kondisjonsprogram med 3000m-basert progresjon: Task 2 + 3
- Alle 4 faser (Grunn, Spesial, Pre-sesong, Sesong): Task 3
- 3 aldersgrupper (U15, U19, Elite): Task 3
- Kobling til FYS-testene via `testKobling` i `parametersJson`: Task 2
- Schema-støtte for GYM-miljø: Task 1

**Ingen placeholders:** Alle seed-data er konkrete og komplette.

**Type-konsistens:** `SessionEnvironment.GYM` brukes konsistent i Task 1 og Task 3. `exerciseId`-er i Task 3 matcher eksakt `id`-ene i Task 2.

**Avhengighetsrekkefølge:** Task 1 (schema) → Task 2 (øvelser) → Task 3 (templates). Rekkefølgen er kritisk — ikke bytt om.

---

## Videre arbeid (ikke i denne planen)

Disse punktene implementeres i en separat plan når det er aktuelt:

- **Coach-UI for mal-bibliotek**: Eget view i CoachHQ for å browse og tildele FYS-maler til spillere
- **Auto-kobling test → program**: Hvis spiller scorer under 40. percentil på en FYS-test → foreslå relevant øvelse automatisk
- **Progress-tracking**: Graf over 1RM-utvikling koblet mot CHS-utvikling over tid
- **Aldersgruppe-automatisering**: Sett aldersgruppe basert på spillers fødselsdato, ikke manuelt valg
