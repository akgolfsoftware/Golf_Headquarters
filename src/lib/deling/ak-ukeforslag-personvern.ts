import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { akUkeforslagSchema } from "./ak-ukeforslag-format";
import { akUkeradTekst } from "./ak-ukeforslag-rad";

const id = z.string().trim().min(1).max(200);
// Include malformed/legacy combinations too, not only the new valid format.
const familie = { OR: [{ actionType: "WEEKLY_PROPOSAL" }, { agentName: "weekly-plan-proposals" }] };

/** Internal account export. Caller supplies the authenticated account ID, never
 * a client-selected player. Own data rights do not depend on ongoing coach sharing.
 * Coach authorship grants only the actor's decision fields, not player content.
 */
export async function eksporterEgneAkUkeforslag(kontoId: string) {
  const userId = id.parse(kontoId);
  const [mottatt, beslutninger] = await Promise.all([
    prisma.planAction.findMany({ where: { userId, ...familie }, orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, userId: true, coachId: true, planId: true, actionType: true, agentName: true,
        status: true, createdAt: true, updatedAt: true, decidedAt: true, suggestion: true,
        decisionNote: true, rejectReason: true } }),
    prisma.planAction.findMany({ where: { decidedById: userId, ...familie }, orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, status: true, createdAt: true, decidedAt: true, decisionNote: true, rejectReason: true } }),
  ]);
  return {
    mottatt: mottatt.map(r => {
      const parsed = akUkeforslagSchema.safeParse(r.suggestion);
      const gyldig = parsed.success && r.actionType === "WEEKLY_PROPOSAL" && r.agentName === "weekly-plan-proposals" &&
        parsed.data.deling.spillerId === userId && parsed.data.deling.coachId === r.coachId && parsed.data.databevis.planId === r.planId;
      const data = gyldig && parsed.success ? parsed.data : null;
      return { id: r.id, status: r.status, opprettet: r.createdAt, endret: r.updatedAt, besluttet: r.decidedAt,
        innholdStatus: data ? "INKLUDERT" : "KREVER_MANUELL_GJENNOMGANG",
        // Never silently omit an unreadable row or export unvalidated historical JSON.
        forslag: data ? { uke: data.databevis.uke, tittel: data.tittel, forklaring: data.forklaring,
          fagligeRad: akUkeradTekst(data.fagligeRad ?? []),
          sessions: data.sessions.map(s => ({ title: s.title, pyramidArea: s.pyramidArea,
            scheduledAt: s.scheduledAt, durationMin: s.durationMin,
            drills: s.drills.map(d => ({ exerciseId: d.exerciseId, minutter: d.minutter })) })) } : null,
        beslutningskommentar: data ? r.decisionNote : null, avvisningsgrunn: data ? r.rejectReason : null,
      };
    }),
    egneHandlinger: beslutninger.map(r => ({ id: r.id, status: r.status, opprettet: r.createdAt,
      besluttet: r.decidedAt, beslutningskommentar: r.decisionNote, avvisningsgrunn: r.rejectReason })),
    merknad: "Interne delingsbevis, kontrollsummer og radversjoner er utelatt. Ukjent eller feilbundet innhold krever manuell gjennomgang. Egne beslutninger gir ikke innsyn i andre spilleres forslag.",
  };
}

/** Used only inside the existing account-anonymization transaction. No new route,
 * automatic cleanup, consent withdrawal cleanup or production invocation.
 */
export function akUkeforslagForAnonymisering(kontoId: string): Prisma.PlanActionWhereInput {
  const userId = id.parse(kontoId);
  return { AND: [familie, { OR: [{ userId }, { coachId: userId }] }] };
}

export function akUkebeslutningerForAnonymisering(kontoId: string): Prisma.PlanActionWhereInput {
  return { decidedById: id.parse(kontoId), ...familie };
}
