// JSON-schema for AI-generert plan-forslag. Brukes både som tool_use-schema
// for Anthropic SDK og som runtime-validering av modell-respons.

export type OktDag = "MAN" | "TIR" | "ONS" | "TOR" | "FRE" | "LOR" | "SON";
export type OktType =
  | "RANGE"
  | "NARESPILL"
  | "PUTTING"
  | "SPILL"
  | "FYSISK"
  | "MENTAL";

export type SkillAreaTag =
  | "TEE_TOTAL"
  | "TILNAERMING"
  | "AROUND_GREEN"
  | "PUTTING"
  | "SPILL";

export type EnvironmentTag =
  | "RANGE"
  | "BANE"
  | "STUDIO"
  | "HJEM"
  | "SIMULATOR";

export type LPhaseTag = "KROPP" | "ARM" | "KOLLE" | "BALL" | "AUTO";

export const SKILL_AREAS: readonly SkillAreaTag[] = [
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
] as const;

export const ENVIRONMENTS: readonly EnvironmentTag[] = [
  "RANGE",
  "BANE",
  "STUDIO",
  "HJEM",
  "SIMULATOR",
] as const;

export const LPHASES: readonly LPhaseTag[] = [
  "KROPP",
  "ARM",
  "KOLLE",
  "BALL",
  "AUTO",
] as const;

export const OKT_DAGER: readonly OktDag[] = [
  "MAN",
  "TIR",
  "ONS",
  "TOR",
  "FRE",
  "LOR",
  "SON",
] as const;

export const OKT_TYPER: readonly OktType[] = [
  "RANGE",
  "NARESPILL",
  "PUTTING",
  "SPILL",
  "FYSISK",
  "MENTAL",
] as const;

export type PlanForslagDrill = {
  navn: string;
  /** Antall sett (foretrukket strukturert form). */
  sets?: number;
  /** Antall reps per sett. */
  reps?: number;
  /** CS-mål i prosent (0-100). */
  csTarget?: number;
  notes?: string;
  // Bakoverkompatibilitet
  antallRep?: number;
  antallSet?: number;
  varighetMin?: number;
  notat?: string;
};

export type PlanForslagOkt = {
  uke: number;
  dag: OktDag;
  type: OktType;
  varighetMin: number;
  fokus: string;
  /** SG-område økten jobber med. */
  skillArea: SkillAreaTag;
  /** Hvor økten foregår. */
  environment: EnvironmentTag;
  /** Mac O'Grady-læringsfase. */
  lPhase: LPhaseTag;
  drills: PlanForslagDrill[];
};

export type PlanForslag = {
  navn: string;
  beskrivelse: string;
  periodeUker: number;
  fokusOmrader: string[];
  okter: PlanForslagOkt[];
};

// Anthropic tool_use input_schema — matcher PlanForslag.
export const PLAN_FORSLAG_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    navn: { type: "string", description: "Kort, beskrivende plan-navn på norsk bokmål." },
    beskrivelse: { type: "string", description: "1-3 setninger om hva planen oppnår." },
    periodeUker: { type: "integer", minimum: 1, maximum: 12 },
    fokusOmrader: {
      type: "array",
      items: { type: "string" },
      description: "Hovedfokus, f.eks. ['Putting', 'Wedge 50-100m', 'Mental rutine'].",
    },
    okter: {
      type: "array",
      items: {
        type: "object",
        properties: {
          uke: { type: "integer", minimum: 1 },
          dag: { type: "string", enum: OKT_DAGER },
          type: { type: "string", enum: OKT_TYPER },
          varighetMin: { type: "integer", minimum: 15, maximum: 360 },
          fokus: { type: "string" },
          skillArea: { type: "string", enum: SKILL_AREAS },
          environment: { type: "string", enum: ENVIRONMENTS },
          lPhase: { type: "string", enum: LPHASES },
          drills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                navn: { type: "string" },
                sets: { type: "integer", minimum: 1, maximum: 20 },
                reps: { type: "integer", minimum: 1, maximum: 100 },
                csTarget: { type: "integer", minimum: 0, maximum: 100 },
                notes: { type: "string" },
              },
              required: ["navn"],
            },
          },
        },
        required: [
          "uke",
          "dag",
          "type",
          "varighetMin",
          "fokus",
          "skillArea",
          "environment",
          "lPhase",
          "drills",
        ],
      },
    },
  },
  required: ["navn", "beskrivelse", "periodeUker", "fokusOmrader", "okter"],
};

// Manuell validering (vi har ikke zod i prosjektet).
export function validerPlanForslag(input: unknown): {
  ok: true;
  data: PlanForslag;
} | { ok: false; feil: string } {
  if (!input || typeof input !== "object") return { ok: false, feil: "Ikke objekt." };
  const o = input as Record<string, unknown>;
  if (typeof o.navn !== "string" || o.navn.length < 1) return { ok: false, feil: "Mangler navn." };
  if (typeof o.beskrivelse !== "string") return { ok: false, feil: "Mangler beskrivelse." };
  if (typeof o.periodeUker !== "number" || o.periodeUker < 1 || o.periodeUker > 12) {
    return { ok: false, feil: "periodeUker må være 1-12." };
  }
  if (!Array.isArray(o.fokusOmrader) || o.fokusOmrader.some((s) => typeof s !== "string")) {
    return { ok: false, feil: "fokusOmrader må være string[]." };
  }
  if (!Array.isArray(o.okter)) return { ok: false, feil: "okter mangler." };

  const okter: PlanForslagOkt[] = [];
  for (let i = 0; i < o.okter.length; i++) {
    const raw = o.okter[i];
    if (!raw || typeof raw !== "object") return { ok: false, feil: `Økt ${i}: ikke objekt.` };
    const e = raw as Record<string, unknown>;
    if (typeof e.uke !== "number" || e.uke < 1) return { ok: false, feil: `Økt ${i}: ugyldig uke.` };
    if (typeof e.dag !== "string" || !OKT_DAGER.includes(e.dag as OktDag)) {
      return { ok: false, feil: `Økt ${i}: ugyldig dag.` };
    }
    if (typeof e.type !== "string" || !OKT_TYPER.includes(e.type as OktType)) {
      return { ok: false, feil: `Økt ${i}: ugyldig type.` };
    }
    if (typeof e.varighetMin !== "number" || e.varighetMin < 15) {
      return { ok: false, feil: `Økt ${i}: ugyldig varighetMin.` };
    }
    if (typeof e.fokus !== "string") return { ok: false, feil: `Økt ${i}: mangler fokus.` };
    const skillArea = typeof e.skillArea === "string" && SKILL_AREAS.includes(e.skillArea as SkillAreaTag)
      ? (e.skillArea as SkillAreaTag)
      : "TEE_TOTAL";
    const environment = typeof e.environment === "string" && ENVIRONMENTS.includes(e.environment as EnvironmentTag)
      ? (e.environment as EnvironmentTag)
      : "RANGE";
    const lPhase = typeof e.lPhase === "string" && LPHASES.includes(e.lPhase as LPhaseTag)
      ? (e.lPhase as LPhaseTag)
      : "AUTO";
    if (!Array.isArray(e.drills)) return { ok: false, feil: `Økt ${i}: drills mangler.` };
    const drills: PlanForslagDrill[] = [];
    for (let j = 0; j < e.drills.length; j++) {
      const dr = e.drills[j];
      if (!dr || typeof dr !== "object") return { ok: false, feil: `Økt ${i} drill ${j}: ikke objekt.` };
      const d = dr as Record<string, unknown>;
      if (typeof d.navn !== "string") return { ok: false, feil: `Økt ${i} drill ${j}: mangler navn.` };
      drills.push({
        navn: d.navn,
        sets: typeof d.sets === "number" ? d.sets : (typeof d.antallSet === "number" ? d.antallSet : undefined),
        reps: typeof d.reps === "number" ? d.reps : (typeof d.antallRep === "number" ? d.antallRep : undefined),
        csTarget: typeof d.csTarget === "number" ? d.csTarget : undefined,
        notes: typeof d.notes === "string" ? d.notes : (typeof d.notat === "string" ? d.notat : undefined),
        antallRep: typeof d.antallRep === "number" ? d.antallRep : undefined,
        antallSet: typeof d.antallSet === "number" ? d.antallSet : undefined,
        varighetMin: typeof d.varighetMin === "number" ? d.varighetMin : undefined,
        notat: typeof d.notat === "string" ? d.notat : undefined,
      });
    }
    okter.push({
      uke: e.uke,
      dag: e.dag as OktDag,
      type: e.type as OktType,
      varighetMin: e.varighetMin,
      fokus: e.fokus,
      skillArea,
      environment,
      lPhase,
      drills,
    });
  }

  return {
    ok: true,
    data: {
      navn: o.navn,
      beskrivelse: o.beskrivelse,
      periodeUker: o.periodeUker,
      fokusOmrader: o.fokusOmrader as string[],
      okter,
    },
  };
}
