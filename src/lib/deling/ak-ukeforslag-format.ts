import "server-only";
import { z } from "zod";
import { akProfilBevisSchema } from "./ak-profil-mellomlagring";
import { akUkeDatabevisSchema } from "./ak-ukegrunnlag";
import { akUkeradSchema } from "./ak-ukeforslag-rad";

const id = z.string().trim().min(1).max(200);
const omrade = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const okt = z.object({ title: z.string().trim().min(3).max(80), pyramidArea: omrade,
  scheduledAt: z.iso.datetime(), durationMin: z.number().int().min(15).max(360),
  drills: z.array(z.object({ exerciseId: id, exerciseRevisjon: z.string().regex(/^\d{1,20}$/),
    minutter: z.number().int().min(1).max(360) }).strict()).min(1).max(12),
}).strict().refine(s => s.drills.reduce((sum, d) => sum + d.minutter, 0) === s.durationMin,
  "Øvelsenes varighet må stemme med økten");
export const akUkeforslagSchema = z.object({ versjon: z.literal(1),
  deling: akProfilBevisSchema, databevis: akUkeDatabevisSchema,
  tittel: z.string().trim().min(3).max(120), forklaring: z.string().trim().min(3).max(2000),
  sessions: z.array(okt).min(1).max(21),
  // Server-authored observations. Optional only for existing captured rows;
  // missing/changed advice is never silently upgraded at approval.
  fagligeRad: akUkeradSchema.optional(),
}).strict();

export const akUkeutkastSchema = akUkeforslagSchema.omit({ versjon: true, deling: true, databevis: true, fagligeRad: true });
export type AkUkeforslag = z.infer<typeof akUkeforslagSchema>;
