/**
 * Logg økt i etterkant (PlayerHQ pakke 13, vedtak 16.10.2026 §STATS-RESTEN punkt 2).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «logg».
 * Ren modul: områdene per akse, SG-område for SLAG, og lesing av lagrede logger som LoggetOkt.
 * En logget økt teller i total treningstid (Stats › Trening), aldri mot planen.
 */
import { z } from "zod";
import type { LoggetOkt, TreningAkse } from "./trening-stats";

export const LOGG_OMRADER: Record<TreningAkse, readonly string[]> = {
  FYS: ["Styrke", "Kondisjon", "Bevegelighet", "Spenst"],
  TEK: ["Sving", "Kortsving", "Putting-teknikk"],
  SLAG: ["Utslag", "Innspill", "Nærspill", "Bunker", "Putting"],
  SPILL: ["Banespill", "Spill på simulator", "Strategi"],
  TURN: ["Turneringsrunde", "Treningsrunde med score"],
};

export const LOGG_STEDER = ["Range", "Simulator", "Chippinggreen", "Puttegreen", "Bane", "Styrkerom", "Hjemme"] as const;

const SG_FOR_OMRADE: Record<string, "OTT" | "APP" | "ARG" | "PUTT"> = {
  Utslag: "OTT", Innspill: "APP", Nærspill: "ARG", Bunker: "ARG", Putting: "PUTT",
};

/** SG-område for et SLAG-område. Andre akser har ikke SG-område. */
export function sgOmradeFor(akse: TreningAkse, omrade: string): "OTT" | "APP" | "ARG" | "PUTT" | null {
  return akse === "SLAG" ? SG_FOR_OMRADE[omrade] ?? null : null;
}

const Skala = z.number().int().min(1).max(10);
export const LoggOktSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pyramid: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  area: z.string().min(1).max(60),
  location: z.string().max(60).optional(),
  minutes: z.number().int().min(5).max(240),
  drillName: z.string().max(100).optional(),
  effort: Skala,
  focus: Skala.optional(),
  notes: z.string().max(500).optional(),
}).refine((v) => LOGG_OMRADER[v.pyramid].includes(v.area), { message: "Området passer ikke til pyramiden", path: ["area"] })
  .refine((v) => v.pyramid === "FYS" ? v.focus === undefined : v.focus !== undefined, { message: "Fokus føres for golføkter, ikke fysiske", path: ["focus"] });
export type LoggOktInn = z.infer<typeof LoggOktSchema>;

/** Dato er gyldig når den ikke ligger fram i tid (Oslo). */
export function datoIkkeFramITid(dato: string, naa: Date): boolean {
  const iDag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" }).format(naa);
  return dato <= iDag;
}

/**
 * Lagret logg som LoggetOkt. Eldre logger (Quick-log før pakke 13) har bare SG-område:
 * de er golfslag og telles som SLAG.
 */
export function tilLoggetOkt(r: { date: Date; minutes: number; pyramid: string | null; sgArea: string | null; location: string | null }): LoggetOkt | null {
  const akse = (r.pyramid ?? (r.sgArea ? "SLAG" : null)) as TreningAkse | null;
  if (!akse || !(akse in LOGG_OMRADER) || r.minutes <= 0) return null;
  return { dato: r.date.toISOString().slice(0, 10), min: r.minutes, akse, sted: r.location };
}
