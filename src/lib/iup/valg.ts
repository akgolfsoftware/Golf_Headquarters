import { z } from "zod";
import { IUP_NIVAAER, IUP_VERSJONER } from "./utviklingssjekk";

const periode = { versjon: z.enum(IUP_VERSJONER), periodeStart: z.iso.date(), periodeSlutt: z.iso.date() };
export const IupValgSchema = z.discriminatedUnion("type", [
  z.object({ ...periode, type: z.literal("UTVIKLINGSSJEKK"), niva: z.enum(IUP_NIVAAER) }).strict(),
  z.object({ ...periode, type: z.literal("SESONGEVALUERING"), niva: z.literal("ALLE") }).strict(),
]).refine((v) => v.periodeStart <= v.periodeSlutt, { message: "Sluttdato kan ikke komme før startdato." });
export type IupValg = z.infer<typeof IupValgSchema>;
