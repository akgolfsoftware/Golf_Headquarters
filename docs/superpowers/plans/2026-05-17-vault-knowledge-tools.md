# Vault Knowledge Tools — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Koble ak-second-brain vault (MORAD-kunnskap, drills, Mac O'Grady-sitater) inn i AI plan-generatoren slik at genererte treningsplaner er forankret i faktisk coaching-metodikk — ikke generisk golf-AI.

**Architecture:** Server-side fillesing av vault markdown-filer via Node.js `fs`. Vault-tools eksponeres som rene funksjoner som kalles inne i `byggSpillerKontekst()`. System-prompten oppdateres med dynamisk MORAD-innhold per spiller. Ingen ny database — vaulten er kilden.

**Tech Stack:** Next.js 16 (App Router, server-only), Node.js `fs/promises`, TypeScript strict, eksisterende `src/lib/ai-plan/`-struktur

---

## Filstruktur

| Fil | Handling | Ansvar |
|---|---|---|
| `src/lib/ai-plan/vault-tools.ts` | CREATE | Les vault, eksponer MORAD-drills, faults, sitater, taksonomi |
| `src/lib/ai-plan/facility-context.ts` | CREATE | Les facility/timer fra User.preferences, return sesong-kontekst |
| `src/lib/ai-plan/context.ts` | MODIFY | Kall vault-tools og facility-context i `byggSpillerKontekst()` |
| `src/lib/ai-plan/system-prompt.ts` | MODIFY | Bytt hardkodet drills-katalog med dynamisk vault-innhold |
| `src/lib/preferences.ts` | MODIFY | Legg til `SpillerFasiliteter`-type og `lesFasiliteter()` |
| `src/lib/ai-plan/vault-tools.test.ts` | CREATE | Unit-tester for vault-lesing og parsing |

**Vault-sti (hardkodet konstant):**
```ts
const VAULT = "/Users/anderskristiansen/Developer/ak-second-brain"
```
Eller via env: `process.env.VAULT_PATH ?? "/Users/anderskristiansen/Developer/ak-second-brain"`

---

## Task 1: Facility preferences-type

**Files:**
- Modify: `src/lib/preferences.ts`

- [ ] **Steg 1: Legg til `SpillerFasiliteter`-type**

```ts
// Legg til i src/lib/preferences.ts etter UserPreferences-typen

export type SpillerFasiliteter = {
  treningtimerPerUke: number;          // 1–20
  hjemmeklubbFasiliteter: {
    drivingRange: boolean;
    puttingGreen: boolean;
    chippingGreen: boolean;
    bunkergrop: boolean;
    simulator: boolean;
  };
  trackmanTilgang: "ingen" | "vinter" | "helaar";
  treningsDager: ("man" | "tir" | "ons" | "tor" | "fre" | "lor" | "son")[];
  treningsTidspunkt: "morgen" | "ettermiddag" | "kveld" | "fleksibel";
  sesongMaal: {
    naesteHcp: number | null;
    naesteTurnering: string | null;   // ISO date
    prioritertOmraade: "teknikk" | "scoring" | "mental" | "fysisk" | null;
  };
};

export const DEFAULT_FASILITETER: SpillerFasiliteter = {
  treningtimerPerUke: 4,
  hjemmeklubbFasiliteter: {
    drivingRange: true,
    puttingGreen: true,
    chippingGreen: false,
    bunkergrop: false,
    simulator: false,
  },
  trackmanTilgang: "ingen",
  treningsDager: ["lor", "son"],
  treningsTidspunkt: "fleksibel",
  sesongMaal: {
    naesteHcp: null,
    naesteTurnering: null,
    prioritertOmraade: null,
  },
};

export function lesFasiliteter(
  preferences: Record<string, unknown> | null | undefined
): SpillerFasiliteter {
  if (!preferences || typeof preferences !== "object") return DEFAULT_FASILITETER;
  const raw = (preferences as Record<string, unknown>).fasiliteter;
  if (!raw || typeof raw !== "object") return DEFAULT_FASILITETER;
  // Deep merge med defaults
  return { ...DEFAULT_FASILITETER, ...(raw as Partial<SpillerFasiliteter>) };
}
```

- [ ] **Steg 2: Commit**

```bash
git add src/lib/preferences.ts
git commit -m "feat(ai-plan): add SpillerFasiliteter type to preferences"
```

---

## Task 2: Vault-tools — kjerne

**Files:**
- Create: `src/lib/ai-plan/vault-tools.ts`
- Create: `src/lib/ai-plan/vault-tools.test.ts`

- [ ] **Steg 1: Skriv failing test**

```ts
// src/lib/ai-plan/vault-tools.test.ts
import { describe, it, expect } from "vitest";
import {
  getDrillsForFocus,
  getFaultDiagnosis,
  getAKGolfTaxonomi,
} from "./vault-tools";

describe("vault-tools", () => {
  it("getDrillsForFocus returnerer array med title og beskrivelse", async () => {
    const result = await getDrillsForFocus("putting");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("tittel");
    expect(result[0]).toHaveProperty("beskrivelse");
  });

  it("getFaultDiagnosis returnerer relevante feil for left knee", async () => {
    const result = await getFaultDiagnosis("left knee");
    expect(Array.isArray(result)).toBe(true);
  });

  it("getAKGolfTaxonomi returnerer streng med innhold", async () => {
    const result = await getAKGolfTaxonomi();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(100);
  });
});
```

- [ ] **Steg 2: Kjør test — verifiser at den feiler**

```bash
cd ~/Developer/akgolf-hq && npx vitest run src/lib/ai-plan/vault-tools.test.ts
```

Forventet: FAIL — "Cannot find module './vault-tools'"

- [ ] **Steg 3: Implementer vault-tools.ts**

```ts
// src/lib/ai-plan/vault-tools.ts
// Server-only — bruker Node.js fs. Aldri importer fra client-kode.

import { readFile } from "fs/promises";
import { join } from "path";

const VAULT = process.env.VAULT_PATH ?? "/Users/anderskristiansen/Developer/ak-second-brain";

async function lesVaultFil(relPath: string): Promise<string> {
  try {
    return await readFile(join(VAULT, relPath), "utf-8");
  } catch {
    return "";
  }
}

export type VaultDrill = {
  tittel: string;
  beskrivelse: string;
  fokusomraade: string[];
};

export type VaultFault = {
  feil: string;
  symptom: string;
  korreksjon: string;
};

/**
 * Hent drills fra MORAD drill-biblioteket filtrert på fokusområde.
 * Leser concepts/morad-drill-bibliotek.md og parser seksjoner.
 */
export async function getDrillsForFocus(fokus: string): Promise<VaultDrill[]> {
  const innhold = await lesVaultFil("wiki/concepts/morad-drill-bibliotek.md");
  if (!innhold) return [];

  const fokusLower = fokus.toLowerCase();
  const drills: VaultDrill[] = [];

  // Parse seksjoner: ### Drill-navn
  const seksjoner = innhold.split(/^###\s+/m).slice(1);
  for (const seksjon of seksjoner) {
    const linjer = seksjon.split("\n");
    const tittel = linjer[0]?.trim() ?? "";
    const resten = linjer.slice(1).join("\n").trim();

    // Inkluder hvis fokus nevnes i tittel eller innhold
    if (
      tittel.toLowerCase().includes(fokusLower) ||
      resten.toLowerCase().includes(fokusLower)
    ) {
      drills.push({
        tittel,
        beskrivelse: resten.slice(0, 300),
        fokusomraade: [fokus],
      });
    }
  }

  // Fallback: les putting-metodikk og short game separat
  if (drills.length === 0 && (fokusLower.includes("putt") || fokusLower.includes("short"))) {
    const putting = await lesVaultFil("wiki/concepts/putting-1-300ft-metodikk.md");
    if (putting) {
      drills.push({
        tittel: "Mac O'Grady Putting 1–300ft Program",
        beskrivelse: putting.slice(0, 500),
        fokusomraade: ["putting"],
      });
    }
  }

  return drills.slice(0, 8); // Maks 8 drills
}

/**
 * Hent MORAD fault-diagnoser for observert symptom.
 */
export async function getFaultDiagnosis(observasjon: string): Promise<VaultFault[]> {
  const faults = await lesVaultFil("wiki/concepts/morad-common-faults.md");
  const regler = await lesVaultFil("wiki/concepts/morad-diagnostiske-regler.md");
  const combined = faults + "\n" + regler;
  if (!combined.trim()) return [];

  const obs = observasjon.toLowerCase();
  const resultater: VaultFault[] = [];

  // Parse ### Feil-seksjoner
  const seksjoner = combined.split(/^###\s+/m).slice(1);
  for (const seksjon of seksjoner) {
    const linjer = seksjon.split("\n");
    const feil = linjer[0]?.trim() ?? "";
    const innhold = linjer.slice(1).join("\n");

    if (innhold.toLowerCase().includes(obs) || feil.toLowerCase().includes(obs)) {
      // Finn symptom og korreksjon
      const symptomMatch = innhold.match(/\*\*Symptom[^*]*\*\*[:\s]+([^\n]+)/i);
      const korreksjonMatch = innhold.match(/\*\*Korreksjon[^*]*\*\*[:\s]+([^\n]+)/i);
      resultater.push({
        feil,
        symptom: symptomMatch?.[1]?.trim() ?? innhold.slice(0, 150),
        korreksjon: korreksjonMatch?.[1]?.trim() ?? "",
      });
    }
  }

  return resultater.slice(0, 4);
}

/**
 * Hent Mac O'Grady-sitat relevant for tema.
 * Grep-basert søk i vault concept-sider som allerede har sitater fra transkripsjonene.
 */
export async function getMacSitat(tema: string): Promise<string[]> {
  const konseptFiler = [
    `wiki/concepts/${tema}.md`,
    "wiki/concepts/morad-konseptkatalog.md",
  ];

  const sitater: string[] = [];
  for (const fil of konseptFiler) {
    const innhold = await lesVaultFil(fil);
    if (!innhold) continue;

    // Finn blockquote-sitater (> tekst)
    const matches = innhold.match(/^>\s+\.\.\.(.+?)\.\.\.$/gm) ?? [];
    sitater.push(...matches.map((m) => m.replace(/^>\s+/, "").trim()));
    if (sitater.length >= 3) break;
  }

  return sitater.slice(0, 3);
}

/**
 * Hent AK Golf-taksonomi og pyramide-struktur fra vault.
 */
export async function getAKGolfTaxonomi(): Promise<string> {
  const taksonomi = await lesVaultFil("wiki/concepts/ak-golf-taksonomi.md");
  const kanon = await lesVaultFil("wiki/concepts/ak-golf-canon.md");
  const combined = [taksonomi, kanon].filter(Boolean).join("\n\n---\n\n");
  return combined.slice(0, 2000); // Maks 2000 chars i prompt
}

/**
 * Hent sesong-tilpasset kontekst basert på dato.
 */
export function getSesongKontekst(): {
  sesong: "vinter" | "sommer";
  maaned: number;
  anbefaling: string;
} {
  const maaned = new Date().getMonth() + 1; // 1–12
  const erVinter = maaned >= 11 || maaned <= 3;

  return {
    sesong: erVinter ? "vinter" : "sommer",
    maaned,
    anbefaling: erVinter
      ? "Vinter (nov–mar): Prioriter Trackman-simulator, indoor putting, videokartlegging og teknikk-drills. Banetrening ikke mulig i Norge."
      : "Sommer (apr–okt): Full pyramide tilgjengelig. Prioriter banetrening, turneringsform og scoring-strategi.",
  };
}
```

- [ ] **Steg 4: Kjør test — verifiser grønn**

```bash
npx vitest run src/lib/ai-plan/vault-tools.test.ts
```

Forventet: PASS (3 tester)

- [ ] **Steg 5: Commit**

```bash
git add src/lib/ai-plan/vault-tools.ts src/lib/ai-plan/vault-tools.test.ts
git commit -m "feat(ai-plan): add vault-tools for MORAD knowledge injection"
```

---

## Task 3: Facility context-builder

**Files:**
- Create: `src/lib/ai-plan/facility-context.ts`

- [ ] **Steg 1: Implementer**

```ts
// src/lib/ai-plan/facility-context.ts

import { type SpillerFasiliteter } from "@/lib/preferences";
import { getSesongKontekst } from "./vault-tools";

export type FasilitetKontekst = {
  sesong: string;
  sesongAnbefaling: string;
  timerPerUke: number;
  tilgjengeligeOmraader: string[];
  begrensninger: string[];
  ukentligKapasitetMinutter: number;
};

export function byggFasilitetKontekst(
  fasiliteter: SpillerFasiliteter
): FasilitetKontekst {
  const sesong = getSesongKontekst();
  const tilgjengelige: string[] = [];
  const begrensninger: string[] = [];

  const f = fasiliteter.hjemmeklubbFasiliteter;
  if (f.drivingRange) tilgjengelige.push("Driving range (fullswing-trening)");
  if (f.puttingGreen) tilgjengelige.push("Putting green");
  if (f.chippingGreen) tilgjengelige.push("Chipping green (nærspill)");
  if (f.bunkergrop) tilgjengelige.push("Bunkergrop");
  if (f.simulator) tilgjengelige.push("Simulator (innendørs)");

  if (fasiliteter.trackmanTilgang === "helaar") {
    tilgjengelige.push("Trackman-simulator (helår)");
  } else if (fasiliteter.trackmanTilgang === "vinter" && sesong.sesong === "vinter") {
    tilgjengelige.push("Trackman-simulator (tilgjengelig nå — vinter)");
  } else if (fasiliteter.trackmanTilgang === "vinter" && sesong.sesong === "sommer") {
    begrensninger.push("Trackman kun tilgjengelig vinter — ikke nå");
  }

  if (sesong.sesong === "vinter") {
    if (!f.simulator && fasiliteter.trackmanTilgang === "ingen") {
      begrensninger.push("Ingen simulator tilgjengelig — banetrening umulig om vinteren i Norge");
    }
  }

  const antallDager = fasiliteter.treningsDager.length;
  const minutterPerDag = (fasiliteter.treningtimerPerUke * 60) / Math.max(antallDager, 1);
  const ukentligKapasitet = fasiliteter.treningtimerPerUke * 60;

  return {
    sesong: sesong.sesong,
    sesongAnbefaling: sesong.anbefaling,
    timerPerUke: fasiliteter.treningtimerPerUke,
    tilgjengeligeOmraader: tilgjengelige,
    begrensninger,
    ukentligKapasitetMinutter: ukentligKapasitet,
  };
}

export function fasilitetKontekstSomTekst(ctx: FasilitetKontekst): string {
  const linjer = [
    `SESONG: ${ctx.sesong.toUpperCase()} — ${ctx.sesongAnbefaling}`,
    `TRENINGSTIMER PER UKE: ${ctx.timerPerUke} timer (${ctx.ukentligKapasitetMinutter} min)`,
    `TILGJENGELIGE TRENINGSOMRAADER:`,
    ...ctx.tilgjengeligeOmraader.map((t) => `  - ${t}`),
  ];
  if (ctx.begrensninger.length > 0) {
    linjer.push(`BEGRENSNINGER:`);
    linjer.push(...ctx.begrensninger.map((b) => `  - ${b}`));
  }
  return linjer.join("\n");
}
```

- [ ] **Steg 2: Commit**

```bash
git add src/lib/ai-plan/facility-context.ts
git commit -m "feat(ai-plan): add facility context builder with seasonal logic"
```

---

## Task 4: Utvid byggSpillerKontekst med vault + fasiliteter

**Files:**
- Modify: `src/lib/ai-plan/context.ts`

- [ ] **Steg 1: Legg til nye felter i `SpillerKontekst`-typen**

Åpne `src/lib/ai-plan/context.ts`. Legg til i `SpillerKontekst`-typen:

```ts
// Legg til etter eksisterende felter i SpillerKontekst-typen:
  vaultKontekst: {
    relevanteDrills: { tittel: string; beskrivelse: string }[];
    faultDiagnoser: { feil: string; symptom: string; korreksjon: string }[];
    macSitater: string[];
    taksonomi: string;
  };
  fasilitetKontekst: string; // serialisert FasilitetKontekst
```

- [ ] **Steg 2: Importer og kall vault-tools i `byggSpillerKontekst()`**

Legg til imports øverst i `context.ts`:

```ts
import {
  getDrillsForFocus,
  getFaultDiagnosis,
  getMacSitat,
  getAKGolfTaxonomi,
} from "./vault-tools";
import { lesFasiliteter } from "@/lib/preferences";
import { byggFasilitetKontekst, fasilitetKontekstSomTekst } from "./facility-context";
```

Legg til i `byggSpillerKontekst()` etter at `user` er hentet:

```ts
  // Vault-kontekst: MORAD-kunnskap tilpasset spillerens utfordringer
  const preferences = (user as unknown as { preferences: Record<string, unknown> | null }).preferences;
  const fasiliteter = lesFasiliteter(preferences);
  const fasilitetCtx = byggFasilitetKontekst(fasiliteter);

  // Hent fokus fra ambisjon/mål for å velge relevante drills
  const fokus = user.ambition ?? "fullswing teknikk";
  const [drills, faults, sitater, taksonomi] = await Promise.all([
    getDrillsForFocus(fokus),
    getFaultDiagnosis(fokus),
    getMacSitat(fokus.split(" ")[0] ?? "morad-posisjonssystem"),
    getAKGolfTaxonomi(),
  ]);
```

Legg til i return-objektet:

```ts
    vaultKontekst: {
      relevanteDrills: drills,
      faultDiagnoser: faults,
      macSitater: sitater,
      taksonomi,
    },
    fasilitetKontekst: fasilitetKontekstSomTekst(fasilitetCtx),
```

- [ ] **Steg 3: Legg til vault-kontekst i `kontekstSomBrukerMelding()`**

Finn `kontekstSomBrukerMelding()`-funksjonen i `context.ts`. Legg til etter eksisterende seksjoner:

```ts
  // Vault-kunnskap
  if (ctx.vaultKontekst.taksonomi) {
    deler.push(`\n=== AK GOLF METODIKK (VAULT) ===\n${ctx.vaultKontekst.taksonomi}`);
  }
  if (ctx.vaultKontekst.relevanteDrills.length > 0) {
    const drillTekst = ctx.vaultKontekst.relevanteDrills
      .map((d) => `- ${d.tittel}: ${d.beskrivelse}`)
      .join("\n");
    deler.push(`\n=== ANBEFALTE DRILLS (MORAD-KALIBRERT) ===\n${drillTekst}`);
  }
  if (ctx.vaultKontekst.macSitater.length > 0) {
    const sitatTekst = ctx.vaultKontekst.macSitater.map((s) => `"${s}"`).join("\n");
    deler.push(`\n=== MAC O'GRADY SITATER ===\n${sitatTekst}`);
  }

  // Fasiliteter og sesong
  deler.push(`\n=== TILGJENGELIGE FASILITETER ===\n${ctx.fasilitetKontekst}`);
```

- [ ] **Steg 4: Verifiser med TypeScript**

```bash
cd ~/Developer/akgolf-hq && npx tsc --noEmit
```

Forventet: 0 errors

- [ ] **Steg 5: Commit**

```bash
git add src/lib/ai-plan/context.ts
git commit -m "feat(ai-plan): inject vault knowledge and facility context into plan generator"
```

---

## Task 5: Oppdater system-prompt med MORAD-referanse

**Files:**
- Modify: `src/lib/ai-plan/system-prompt.ts`

- [ ] **Steg 1: Erstatt hardkodet drills-katalog med instruks om vault-data**

Finn seksjonen `DRILLS-KATALOG` i `AI_COACH_SYSTEM_PROMPT`. Erstatt med:

```ts
DRILLS-KATALOG:
Du mottar i bruker-meldingen en liste med ANBEFALTE DRILLS kalibrert mot spillerens profil fra AK Golf Academy sin MORAD-kunnskapsbase (Mac O'Grady Research and Development). Bruk disse drillene i planen. Du kan supplere med egne hvis de passer bedre — men prioriter alltid vault-drillene.

FASILITETER:
Du mottar i bruker-meldingen spillerens tilgjengelige fasiliteter og sesong. Generer ALDRI plan med banetrening i norsk vinter (nov–mar) hvis spiller ikke har simulator eller indoor-tilgang. Tilpass økt-formater til hva spilleren faktisk har tilgang til.

MAC O'GRADY-PRINSIPPER (MORAD):
Du mottar relevante sitater fra Mac O'Grady sine coaching-sesjoner. Bruk disse som faglig forankring — spesielt for fullswing-teknikk der MORAD er metodikk-grunnlaget for AK Golf Academy.
```

- [ ] **Steg 2: TypeScript-sjekk**

```bash
npx tsc --noEmit
```

- [ ] **Steg 3: Commit**

```bash
git add src/lib/ai-plan/system-prompt.ts
git commit -m "feat(ai-plan): update system prompt to reference vault knowledge"
```

---

## Task 6: Manuell integrasjonstest

- [ ] **Steg 1: Generer testplan via API**

```bash
curl -X POST http://localhost:3000/api/ai-plan/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: <din-session-cookie>" \
  -d '{
    "userId": "<mathias-sorby-id>",
    "brukerPrompt": "Lag 4-ukers plan for vinter, fokus på fullswing-teknikk, 3 timer per uke, kun Trackman-simulator tilgjengelig"
  }'
```

- [ ] **Steg 2: Verifiser output**

Sjekk at responsen inneholder:
- Drills fra MORAD (ikke bare generiske golf-drills)
- Sesong-tilpasset (ingen banetrening hvis vinter)
- Mac O'Grady-referanser i begrunnelse

- [ ] **Steg 3: Final commit + push**

```bash
git add -A && git commit -m "feat: vault knowledge tools integration complete" && git push origin main
```

---

## Selvsjekk

**Spec coverage:**
- [x] Vault-tools: `getDrillsForFocus`, `getFaultDiagnosis`, `getMacSitat`, `getAKGolfTaxonomi`
- [x] Facility context: timer, fasiliteter, sesong, Trackman-tilgang
- [x] Kontekst-builder: vault + fasiliteter injisert
- [x] System-prompt: oppdatert til å bruke vault-data
- [x] TypeScript-validering i alle steg

**Mangler (neste plan):**
- Selvbetjent plan-generering for spillere (egen plan: `2026-05-17-player-self-service.md`)
- Onboarding-UI for fasilitets-data
- Plan-watcher utvidelse med vault-matching
