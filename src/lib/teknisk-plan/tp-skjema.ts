/**
 * AG-TP-01 Oppgaveskjema: validering og omforming fra skjema til databasefelt.
 * Ren modul (ingen database) — testet i tp-skjema.test.ts. Server-handlingene i
 * src/app/admin/spillere/[id]/plan/[planId]/oppgave-actions.ts bruker den.
 *
 * Regler (tegningen og beslutning 27.09.2026):
 * - Akser som ikke gjelder området lagres ikke (vaskes mot relevansmatrisen).
 * - Teknisk fokus må høre til området, ellers lagres ingen (maks ett).
 * - Rep-mål per læringssteg bare på fullsving; ellers ett rep-mål.
 * - Ulik sum mellom steg og miljø lagres likevel. Ingenting sperrer.
 */

import { z } from "zod";
import {
  BELASTNING_KODER,
  DIMENSJON_KODER,
  MAALEUTSTYR_KODER,
  MOTORIKK_KODER,
  OMRAADE_KODER,
  PRESS_KODER,
  SAND_TRINN_KODER,
  omraadeDef,
  type BelastningKode,
  type MotorikkKode,
} from "@/lib/domain/ak-formel-v2";
import { erGyldigDimensjon, vaskMotRelevans } from "@/lib/domain/omrade-relevans";
import { pHovedNummer } from "@/components/teknisk-plan/constants";
import { familieFor, type TpSkjema } from "@/lib/teknisk-plan/tp-visning";

const Reps = z.number().int().min(0).max(10000);
const Grense = z.number().finite().min(-10000).max(10000);

export const TpSkjemaSchema = z.object({
  id: z.string().min(1).nullable(),
  pNummer: z
    .string()
    .regex(/^P\d{1,2}\.\d$/, "Velg posisjon")
    .refine((v) => pHovedNummer(v) !== null, "Posisjon må være P1 til P10"),
  tittel: z.string().trim().min(1, "Tittel mangler").max(500),
  slagNavn: z.string().trim().max(120),
  omraadeKode: z.enum(OMRAADE_KODER, { message: "Velg område" }),
  motorikk: z.enum(MOTORIKK_KODER).nullable(),
  sandTrinn: z.enum(SAND_TRINN_KODER).nullable(),
  dimensjon: z.enum(DIMENSJON_KODER).nullable(),
  kolle: z.string().trim().max(40).nullable(),
  belastning: z.enum(BELASTNING_KODER).nullable(),
  press: z.enum(PRESS_KODER).nullable(),
  maaleutstyr: z.enum(MAALEUTSTYR_KODER).nullable(),
  tm: z
    .array(z.object({ id: z.string().min(1).nullable(), metric: z.string().min(1).max(60), fra: Grense, til: Grense }))
    .max(8)
    .refine((rader) => rader.every((r) => r.fra <= r.til), "Nedre grense må være lavere enn øvre"),
  repSteg: z.object({ UTEN_BALL: Reps, LAV_HAST: Reps, AUTO: Reps }),
  rep: Reps,
  repMiljo: z.partialRecord(z.enum(BELASTNING_KODER), Reps),
  protokoll: z
    .object({
      type: z.enum(["ROLLING_WINDOW", "BEST_OF_N", "STREAK", "SESSION_GATE"]),
      antall: z.number().int().min(1).max(100),
      treff: z.number().int().min(1).max(100),
    })
    .refine((p) => p.type === "STREAK" || p.treff <= p.antall, "Treff kan ikke være flere enn antall")
    .nullable(),
});

export type GyldigSkjema = z.infer<typeof TpSkjemaSchema>;

/** Feltene på PositionTask. Posisjon, TrackMan-mål og målmatrise lagres hver for seg. */
export function oppgaveFelt(s: GyldigSkjema) {
  const vasket = vaskMotRelevans({
    omraade: s.omraadeKode,
    motorikk: s.motorikk,
    belastning: s.belastning,
    press: s.press,
    dimensjon: s.dimensjon && erGyldigDimensjon(s.omraadeKode, s.dimensjon) ? s.dimensjon : null,
    sandTrinn: s.sandTrinn,
  });
  const fullsving = familieFor(s.omraadeKode) === "FULLSVING";
  return {
    tittel: s.tittel,
    slagNavn: s.slagNavn || null,
    omraade: omraadeDef(s.omraadeKode).label,
    omraadeKode: s.omraadeKode,
    koller: s.kolle ? [s.kolle] : [],
    motorikk: vasket.motorikk,
    belastning: vasket.belastning,
    press: vasket.press,
    dimensjon: vasket.dimensjon,
    sandTrinn: vasket.sandTrinn,
    maaleutstyr: s.maaleutstyr,
    repsMaalDry: fullsving ? s.repSteg.UTEN_BALL : 0,
    repsMaalLav: fullsving ? s.repSteg.LAV_HAST : 0,
    repsMaalFull: fullsving ? s.repSteg.AUTO : s.rep,
  };
}

/**
 * Rep-mål per miljø → celler i målmatrisen. Cellen får oppgavens læringssteg
 * (fullsving) eller Automatikk (resten, som logges som full fart).
 */
export function miljoCeller(s: GyldigSkjema): { motorikk: MotorikkKode; belastning: BelastningKode; maalReps: number }[] {
  const motorikk: MotorikkKode = familieFor(s.omraadeKode) === "FULLSVING" ? (s.motorikk ?? "AUTO") : "AUTO";
  return BELASTNING_KODER.flatMap((b) => {
    const n = s.repMiljo[b] ?? 0;
    return n > 0 ? [{ motorikk, belastning: b, maalReps: n }] : [];
  });
}

/** Treffprotokollens felt. Målboksen hentes fra første TrackMan-mål, om det finnes. */
export function protokollFelt(s: GyldigSkjema, kolle: string) {
  if (!s.protokoll) return null;
  const boks = s.tm[0] ?? null;
  return {
    metric: boks?.metric ?? "",
    klubb: kolle,
    protocol: s.protokoll.type,
    windowSize: s.protokoll.type === "STREAK" ? null : s.protokoll.antall,
    requiredHits: s.protokoll.treff,
    targetValue: s.protokoll.treff,
    corridorMin: boks?.fra ?? null,
    corridorMax: boks?.til ?? null,
  };
}

export type { TpSkjema };
