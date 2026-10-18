import { z } from "zod";
import { addDays, mondayOf } from "@/lib/domain/workbench/operations";
import { gyldigPlanDato, osloPlanDato } from "./plan-kontekst";

const Id = z.string().min(1).max(200);
export const MalUtrullingSchema = z.object({
  mode: z.enum(["PERSONLIGE_FORSLAG", "GRUPPEUTKAST"]).default("PERSONLIGE_FORSLAG"),
  startWeekOffset: z.number().int().min(0).max(52).default(1),
  weekStart: z.string().optional().refine(v => !v || Boolean(gyldigPlanDato(v)), "Ugyldig startuke"),
  uker: z.number().int().min(1).max(52).default(1),
  startMinute: z.number().int().min(0).max(1439).default(540),
  recipientIds: z.array(Id).min(1).max(200).optional(),
  groupScheduleIds: z.array(Id).max(100).optional(),
  expectedFingerprint: z.string().regex(/^[a-f0-9]{64}$/).optional(),
}).strict();
export type MalUtrullingInput = z.input<typeof MalUtrullingSchema>;
export type MalUtrullingValg = z.output<typeof MalUtrullingSchema>;
export type MalUtrullingOkt = { sourceId: string; date: string; startMinute: number; durationMinutes: number; title: string; pyramid: string; location: string | null; notes: string | null; focus: string | null; drillCount: number };
export type MalUtrullingPreview = {
  fingerprint: string; mode: MalUtrullingValg["mode"]; weekStart: string;
  template: { id: string; name: string }; group: { id: string; name: string };
  recipients: { id: string; name: string; sessionCount: number }[];
  schedules: { id: string; title: string; startAt: string; endAt: string; recurring: string | null }[];
  sessions: MalUtrullingOkt[]; newCount: number; existingCount: number; personalWriteScope: boolean;
};

export function malStartuke(valg: MalUtrullingValg): string {
  return valg.weekStart ? mondayOf(valg.weekStart) : addDays(mondayOf(osloPlanDato()), valg.startWeekOffset * 7);
}

/** Oslo-veggklokke; ukentlig gruppetid følger også sommer-/vintertid. */
export function malVeggTid(instant: Date): { date: string; minute: number } {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(instant).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minute: Number(parts.hour) * 60 + Number(parts.minute) };
}

export function malGruppetid(date: string, schedules: { id: string; startAt: Date; endAt: Date; recurring: string | null; location: string | null; kind: string | null }[]) {
  return schedules.flatMap(s => {
    if (s.kind === "SAMLING" || s.kind === "HELDAGSSAMLING") return [];
    const start = malVeggTid(s.startAt), end = malVeggTid(s.endAt);
    if (start.date !== end.date || end.minute <= start.minute || date < start.date) return [];
    const days = (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${start.date}T12:00:00Z`)) / 86_400_000;
    if (days !== 0 && (s.recurring !== "WEEKLY" || days % 7 !== 0)) return [];
    return [{ id: s.id, startMinute: start.minute, endMinute: end.minute, location: s.location }];
  });
}
