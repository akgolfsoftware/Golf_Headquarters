"use server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { LesSyklusSchema, LagreSyklusSchema, KopierSyklusSchema, OpplosSyklusSchema, type TreukerssyklusData } from "./treukerssyklus";
import { SyklusFeil, lesSyklusCore, offentligSyklus, lagreSyklusCore, kopierSyklusCore, laasSyklus } from "./treukerssyklus-core";
import { isoUkeIdentitet } from "./ukeplan-schema";
import type { WbResultat } from "./wb-actions";
async function tilgang(playerId: string) {
  const user = await requirePortalUser();
  if (user.role === "PLAYER" && user.id === playerId) return user;
  if ((user.role === "COACH" || user.role === "ADMIN") && await harCoachTilgangTilSpiller(user, playerId)) return user;
  throw new SyklusFeil("Du har ikke tilgang til denne spillerens syklus.");
}
function revalider(playerId: string) { revalidatePath(`/admin/workbench/${playerId}`); revalidatePath("/portal/planlegge/workbench"); }
function feil(error: unknown): WbResultat<never> {
  // Bare egne fagmeldinger. Prisma-/nettverksdetaljer sendes aldri til klienten.
  const known = error instanceof SyklusFeil;
  return { ok: false, error: known ? error.message : "Syklusen kunne ikke fullføres. Last inn på nytt; ingen delvis lagring er tillatt." };
}
export async function lastTreukerssyklus(input: unknown): Promise<WbResultat<TreukerssyklusData>> {
  const parsed = LesSyklusSchema.safeParse(input); if (!parsed.success) return { ok: false, error: "Velg en gyldig spiller og mandag." };
  try { await tilgang(parsed.data.playerId); return await prisma.$transaction(async db => ({ ok: true as const, data: { weeks: offentligSyklus(await lesSyklusCore(db, parsed.data.playerId, parsed.data.anchorWeek)), ...(parsed.data.targetWeek ? { targets: offentligSyklus(await lesSyklusCore(db, parsed.data.playerId, parsed.data.targetWeek)) } : {}) } }), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); } catch (error) { return feil(error); }
}
export async function lagreTreukerssyklus(input: unknown): Promise<WbResultat<TreukerssyklusData>> {
  const parsed = LagreSyklusSchema.safeParse(input); if (!parsed.success) return { ok: false, error: "Treukerssyklusen har ugyldige felt." };
  try { await tilgang(parsed.data.playerId); const weeks = await prisma.$transaction(db => lagreSyklusCore(db, parsed.data), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 }); revalider(parsed.data.playerId); return { ok: true, data: { weeks } }; } catch (error) { return feil(error); }
}
export async function kopierTreukerssyklus(input: unknown): Promise<WbResultat<TreukerssyklusData>> {
  const parsed = KopierSyklusSchema.safeParse(input); if (!parsed.success) return { ok: false, error: "Velg tre målmandager uten overlapp med kilden." };
  try { const actor = await tilgang(parsed.data.playerId); const weeks = await prisma.$transaction(db => kopierSyklusCore(db, parsed.data, actor), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 }); revalider(parsed.data.playerId); return { ok: true, data: { weeks } }; } catch (error) { return feil(error); }
}
export async function opplosTreukerssyklus(input: unknown): Promise<WbResultat<TreukerssyklusData>> {
  const parsed = OpplosSyklusSchema.safeParse(input); if (!parsed.success) return { ok: false, error: "Ugyldig syklus." };
  try { await tilgang(parsed.data.playerId); const weeks = await prisma.$transaction(async db => {
    await laasSyklus(db, parsed.data.playerId); const current = await lesSyklusCore(db, parsed.data.playerId, parsed.data.anchorWeek);
    if (current.some((w, i) => w.expected !== parsed.data.expected[i])) throw new SyklusFeil("Ukeplanen er endret. Last inn på nytt før oppløsning.");
    const links = current.map(w => w.plan?.planningDetails?.cycle);
    if (!links.every((c, i) => c && c.anchorWeek === parsed.data.anchorWeek && c.position === i && c.id === links[0]?.id)) throw new SyklusFeil("Ingen komplett treukerssyklus på disse datoene.");
    for (const week of current) {
      const details = week.plan?.planningDetails; if (!details) throw new SyklusFeil("Mangler ukeplan.");
      const { cycle: _cycle, ...behold } = details;
      await db.weekPlan.update({ where: { playerId_isoYear_weekNumber: { playerId: parsed.data.playerId, ...isoUkeIdentitet(week.weekStart) } }, data: { planningDetails: behold } });
    }
    return offentligSyklus(await lesSyklusCore(db, parsed.data.playerId, parsed.data.anchorWeek));
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); revalider(parsed.data.playerId); return { ok: true, data: { weeks } }; } catch (error) { return feil(error); }
}
