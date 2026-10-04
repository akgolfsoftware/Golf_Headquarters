"use server";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { planTilgang, revaliderPlan } from "./plan-tilgang";
import { HendelseInputSchema, osloHendelseTid, type HendelseInput } from "./hendelser-kontrakt";
import { osloDatoOgMinutt } from "./min-calendar";
import { samletOsloMidnatt } from "./workbench-samlet-volum";
import { gyldigPlanDato } from "./plan-kontekst";

async function tilgangFor(playerId: string) {
  const actor = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const viewer = await planTilgang(playerId);
  return viewer?.id === actor.id ? viewer : null;
}

/** Personlige opptattblokker redigeres bare av eieren, i tråd med eksisterende kalender. */
export async function lagreWorkbenchHendelse(input: HendelseInput) {
  const parsed = HendelseInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Ugyldig hendelse." };
  const v = parsed.data, viewer = await tilgangFor(v.playerId);
  if (!viewer || viewer.id !== v.playerId) return { ok: false as const, error: "Bare spilleren kan endre egne personlige hendelser." };
  let startAt: Date, endAt: Date;
  try { startAt = osloHendelseTid(v.startDate, v.startMinute); endAt = osloHendelseTid(v.endDate, v.endMinute); }
  catch { return { ok: false as const, error: "Klokkeslettet er manglende eller tvetydig ved sommertid. Velg et annet klokkeslett." }; }
  if (endAt <= startAt) return { ok: false as const, error: "Slutt må være etter start." };
  const data = { title: v.title, kind: v.kind, startAt, endAt, recurring: v.recurring, isPrivate: v.isPrivate, note: v.note };
  if (!v.id) { const row = await prisma.playerBusyBlock.create({ data: { ...data, userId: v.playerId }, select: { id: true } }); revaliderPlan(v.playerId); return { ok: true as const, id: row.id }; }
  const row = await prisma.playerBusyBlock.updateMany({ where: { id: v.id, userId: v.playerId, updatedAt: new Date(v.expectedUpdatedAt!) }, data });
  if (row.count !== 1) return { ok: false as const, error: "Hendelsen er endret eller utilgjengelig. Last inn på nytt." };
  revaliderPlan(v.playerId); return { ok: true as const, id: v.id };
}
const SlettSchema = z.object({ playerId: z.string().min(1).max(200), id: z.string().min(1).max(200), expectedUpdatedAt: z.string().datetime() }).strict();
export async function slettWorkbenchHendelse(input: z.infer<typeof SlettSchema>) {
  const parsed = SlettSchema.safeParse(input); if (!parsed.success) return { ok: false as const, error: "Ugyldig hendelse." };
  const v = parsed.data, viewer = await tilgangFor(v.playerId);
  if (!viewer || viewer.id !== v.playerId) return { ok: false as const, error: "Bare eieren kan slette personlige hendelser." };
  const row = await prisma.playerBusyBlock.deleteMany({ where: { id: v.id, userId: v.playerId, updatedAt: new Date(v.expectedUpdatedAt) } });
  if (row.count !== 1) return { ok: false as const, error: "Hendelsen er endret eller utilgjengelig." };
  revaliderPlan(v.playerId); return { ok: true as const };
}
export async function lastWorkbenchHendelser(playerId: string, fra: string, til: string) {
  if (!gyldigPlanDato(fra) || !gyldigPlanDato(til) || fra >= til) return { ok: false as const, error: "Ugyldig datovindu." };
  const viewer = await tilgangFor(playerId); if (!viewer) return { ok: false as const, error: "Ingen tilgang til denne spilleren." };
  const rows = await prisma.playerBusyBlock.findMany({ where: { userId: playerId, startAt: { lt: samletOsloMidnatt(til) },
    OR: [{ endAt: { gt: samletOsloMidnatt(fra) } }, { recurring: "WEEKLY" }] }, orderBy: [{ startAt: "asc" }, { id: "asc" }] });
  return { ok: true as const, data: rows.map(r => {
    const privateOther = r.isPrivate && viewer.id !== playerId;
    return { id: r.id, title: privateOther ? "Opptatt" : r.title, kind: privateOther ? "ANNET" : r.kind,
      start: osloDatoOgMinutt(r.startAt), end: osloDatoOgMinutt(r.endAt), updatedAt: r.updatedAt.toISOString(),
      recurring: r.recurring, isPrivate: r.isPrivate, note: privateOther ? null : r.note, editable: viewer.id === playerId };
  }) };
}
