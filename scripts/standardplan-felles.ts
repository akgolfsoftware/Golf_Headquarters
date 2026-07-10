// Felles kjerne for standardplan-generering — brukes av BÅDE
// generate-standardplan-drafts-2026-07.ts (API-vei) og
// import-standardplan-drafts.ts (abonnements-vei: innhold forfattet i
// Claude Code-økt, validert her før skriving). Én valideringskilde
// uansett hvor innholdet kommer fra.

import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import type { NgfKategori, LPhase, PyramidArea } from "../src/generated/prisma/client";
import {
  STANDARD_PYRAMIDE,
  STANDARD_OKT_ANTALL,
  FASE_BESKRIVELSE,
  type SkjelettOkt,
} from "../src/lib/plan-engine/standard-fordeling";

export const KATEGORIER: NgfKategori[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
export const FASER: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];
export const SKILL_AREAS = ["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"] as const;
export const ENVIRONMENTS = ["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"] as const;

export function lagPrisma(): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }) });
}

// ---------- Zod-kontrakt for plan-innhold (uansett kilde) ----------

export const DrillValgSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1).max(20).optional(),
  reps: z.number().int().min(1).max(200).optional(),
  // CANON v3.5: CS-skalaen går 20–100 (nybegynner-drills har mål ned mot 22).
  csTarget: z.number().min(20).max(110).optional(),
  notes: z.string().max(200).optional(),
});

export const OktSvarSchema = z.object({
  ukeNr: z.number().int().min(1).max(4),
  dagNr: z.number().int().min(1).max(7),
  title: z.string().min(3).max(120),
  focus: z.string().min(3).max(240),
  skillArea: z.enum(SKILL_AREAS).nullable(),
  environment: z.enum(ENVIRONMENTS),
  drills: z.array(DrillValgSchema).min(1).max(4),
});

export const PlanSvarSchema = z.object({
  okter: z.array(OktSvarSchema).min(1),
});

export type PlanSvar = z.infer<typeof PlanSvarSchema>;

// Fagkoder som ALDRI skal ut til spillere (klarspråk-regelen), + ordbok-regelen.
export const FAGKODE_REGEX = /\b(PR[1-5]|CS\d{2,3}|M[0-5]|P([1-9]|10)|L_[A-ZÆØÅ]+)\b/;
export const FORBUDT_TEKST = /kort spill/i;

// ---------- Drill-katalog ----------

export interface DrillRad {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  skillArea: string | null;
  environment: string[];
  durationMin: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
  csTargetByKategori: unknown;
  treningstype: string | null;
}

export async function hentDrillKatalog(
  prisma: PrismaClient,
  kategori: NgfKategori,
  fase: LPhase,
  omrader: PyramidArea[],
): Promise<DrillRad[]> {
  const kIdx = KATEGORIER.indexOf(kategori);
  const alle = await prisma.exerciseDefinition.findMany({
    where: { pyramidArea: { in: omrader } },
    select: {
      id: true, name: true, pyramidArea: true, skillArea: true,
      environment: true, durationMin: true, defaultSets: true, defaultReps: true,
      csTargetByKategori: true, treningstype: true,
      minKategori: true, maxKategori: true, lPhases: true,
    },
    orderBy: { name: "asc" },
  });
  const passerNivaa = alle.filter((d) => {
    const min = d.minKategori ? KATEGORIER.indexOf(d.minKategori) : 0;
    const max = d.maxKategori ? KATEGORIER.indexOf(d.maxKategori) : KATEGORIER.length - 1;
    return kIdx >= min && kIdx <= max;
  });
  // Foretrekk drills tagget med riktig periode-fase (tom liste = universell).
  const prioritert = [
    ...passerNivaa.filter((d) => d.lPhases.includes(fase)),
    ...passerNivaa.filter((d) => d.lPhases.length === 0),
    ...passerNivaa.filter((d) => d.lPhases.length > 0 && !d.lPhases.includes(fase)),
  ];
  // Maks 25 per pyramideområde — holder grunnlaget kompakt og deterministisk.
  const perOmrade = new Map<string, number>();
  const ut: DrillRad[] = [];
  for (const d of prioritert) {
    const n = perOmrade.get(d.pyramidArea) ?? 0;
    if (n >= 25) continue;
    perOmrade.set(d.pyramidArea, n + 1);
    ut.push(d);
  }
  return ut;
}

// ---------- Validering (identisk uansett kilde) ----------

/** Valider plan-innhold mot skjelett + katalog. Returnerer feil-liste (tom = OK). */
export function validerSvar(svar: PlanSvar, skjelett: SkjelettOkt[], katalog: DrillRad[]): string[] {
  const feil: string[] = [];
  const gyldigeIder = new Set(katalog.map((d) => d.id));
  const slotNokkel = (u: number, d: number) => `${u}:${d}`;
  const forventet = new Set(skjelett.map((s) => slotNokkel(s.ukeNr, s.dagNr)));
  const levert = new Set(svar.okter.map((o) => slotNokkel(o.ukeNr, o.dagNr)));

  for (const n of forventet) if (!levert.has(n)) feil.push(`Mangler økt for slot uke:dag ${n}`);
  for (const n of levert) if (!forventet.has(n)) feil.push(`Ukjent slot uke:dag ${n} (ikke i skjelettet)`);
  if (svar.okter.length !== skjelett.length)
    feil.push(`Antall økter ${svar.okter.length} ≠ skjelett ${skjelett.length}`);

  for (const o of svar.okter) {
    for (const d of o.drills) {
      if (!gyldigeIder.has(d.exerciseId)) feil.push(`Ukjent drill-id ${d.exerciseId} i uke ${o.ukeNr} dag ${o.dagNr}`);
    }
    const tekst = `${o.title} ${o.focus}`;
    if (FAGKODE_REGEX.test(tekst)) feil.push(`Fagkode i tekst («${tekst.match(FAGKODE_REGEX)?.[0]}») uke ${o.ukeNr} dag ${o.dagNr}`);
    if (FORBUDT_TEKST.test(tekst)) feil.push(`«kort spill» brukt (skal være «nærspill») uke ${o.ukeNr} dag ${o.dagNr}`);
  }

  // Fast metodikk-regel: minst én putting-økt per uke (skillArea PUTTING på
  // økta, eller minst én drill med skillArea PUTTING).
  const puttingDrillIder = new Set(katalog.filter((d) => d.skillArea === "PUTTING").map((d) => d.id));
  const uker = new Set(skjelett.map((s) => s.ukeNr));
  for (const uke of uker) {
    const ukensOkter = svar.okter.filter((o) => o.ukeNr === uke);
    const harPutting = ukensOkter.some(
      (o) => o.skillArea === "PUTTING" || o.drills.some((d) => puttingDrillIder.has(d.exerciseId)),
    );
    if (!harPutting) feil.push(`Uke ${uke} mangler putting-økt (minst én per uke, uansett nivå)`);
  }
  return feil;
}

// ---------- Skriving ----------

export async function skrivUtkast(
  prisma: PrismaClient,
  kategori: NgfKategori,
  fase: LPhase,
  skjelett: SkjelettOkt[],
  svar: PlanSvar,
  kilde: string,
): Promise<void> {
  const pyr = STANDARD_PYRAMIDE[kategori];
  const skjelettVedSlot = new Map(skjelett.map((s) => [`${s.ukeNr}:${s.dagNr}`, s]));

  await prisma.planTemplate.create({
    data: {
      name: `Standardplan ${kategori} · ${fase}`,
      description: `${FASE_BESKRIVELSE[fase]} AI-generert utkast (${kilde}) over deterministisk skjelett — krever godkjenning før bruk.`,
      kategori,
      lPhase: fase,
      varighetUker: 4,
      ukentligOktAntall: STANDARD_OKT_ANTALL[kategori][fase],
      disciplinFordeling: {
        FYS: pyr.FYS / 100,
        TEK: pyr.TEK / 100,
        SLAG: pyr.SLAG / 100,
        SPILL: pyr.SPILL / 100,
        TURN: pyr.TURN / 100,
      },
      approved: false,
      sessions: {
        create: svar.okter.map((o) => {
          const slot = skjelettVedSlot.get(`${o.ukeNr}:${o.dagNr}`);
          if (!slot) throw new Error(`Slot ${o.ukeNr}:${o.dagNr} mangler i skjelett`);
          return {
            ukeNr: o.ukeNr,
            dagNr: o.dagNr,
            title: o.title,
            varighetMin: slot.varighetMin,
            pyramidArea: slot.pyramidArea,
            skillArea: o.skillArea,
            environment: o.environment,
            focus: o.focus,
            drillsJson: o.drills as unknown as Prisma.InputJsonValue,
          };
        }),
      },
    },
  });
}
