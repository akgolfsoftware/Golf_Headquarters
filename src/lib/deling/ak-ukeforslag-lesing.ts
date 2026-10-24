import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { akProfilGruppeWhere } from "./ak-profil-lesing";
import { medAkGruppeoppdrag } from "./ak-gruppeoppdrag";
import { AK_PROFIL_SCOPE, AK_PROFIL_VERSJON } from "./ak-profil-regler";
import { akUkeforslagSchema } from "./ak-ukeforslag";
import type { hentAkTreningsobservasjoner } from "./ak-treningsobservasjon";
import { forklaringMedAkUkerad } from "./ak-ukeforslag-rad";

type Leser = typeof hentAkTreningsobservasjoner;
export type ForslagsLesevalg = NonNullable<Parameters<Leser>[1]>;
export type DelteForslag = Awaited<ReturnType<Leser>>;
export function tommeDelteForslag(): DelteForslag {
  return { planActions: [], pendingCount: 0, acceptedCount: 0, rejectedCount: 0,
    accepted7d: 0, rejected7d: 0, godkjentAvViewer: 0, eldstePending: null };
}
export function begrensDelteForslag(rader: DelteForslag["planActions"], valg: ForslagsLesevalg) {
  const maks = Math.min(60, Math.max(0, valg.maksRader ?? 10));
  return rader.sort((a, b) => valg.rekkefolge === "endret"
    ? b.updatedAt.getTime() - a.updatedAt.getTime() || b.id.localeCompare(a.id)
    : (valg.rekkefolge === "eldst" ? 1 : -1) * (a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id))).slice(0, maks);
}

/** Read only under the same current sharing evidence. No mutation or data-proof
 * refresh: approved history is readable after its own training writes. Pending
 * plan/exercise freshness is checked by the atomic decision handler, not here.
 * Only the display payload leaves this boundary; never internal proof/revisions.
 */
export async function hentAkUkeforslag(viewer: Parameters<Leser>[0], valg: ForslagsLesevalg = {}): Promise<DelteForslag> {
  const resultat = tommeDelteForslag();
  if (!["COACH", "ADMIN"].includes(viewer.role)) return resultat;
  const grupper = await prisma.group.findMany({ where: { ...akProfilGruppeWhere(), coachId: viewer.id },
    select: { id: true }, orderBy: { id: "asc" } });
  const syvDagerSiden = new Date(Date.now() - 7 * 86_400_000);
  for (const gruppe of grupper) {
    await medAkGruppeoppdrag({ gruppeId: gruppe.id, coachId: viewer.id }, async (tx, scope, grunnlag) => {
      // The equality predicates reject old/interrupted grants before reading
      // bodies or names. They do not upgrade any stored suggestion.
      const tilganger: Prisma.PlanActionWhereInput[] = grunnlag.filter(g => g.gruppeId === gruppe.id).map(g => ({
        userId: g.spillerId, plan: { is: { userId: g.spillerId, createdById: viewer.id } },
        suggestion: { path: ["deling"], equals: { versjon: 1, scope: AK_PROFIL_SCOPE,
          tekstVersjon: AK_PROFIL_VERSJON, spillerId: g.spillerId, gruppeId: gruppe.id,
          coachId: viewer.id, fingeravtrykk: g.fingeravtrykk } },
      }));
      // Bounded pages, but no arbitrary truncation of valid totals or oldest.
      for (let start = 0; start < tilganger.length; start += 100) {
        let etterId: string | undefined;
        while (true) {
          const rader = await tx.planAction.findMany({ where: { coachId: viewer.id,
            actionType: "WEEKLY_PROPOSAL", agentName: "weekly-plan-proposals", user: scope,
            OR: tilganger.slice(start, start + 100), ...(etterId ? { id: { gt: etterId } } : {}),
          }, orderBy: { id: "asc" }, take: 100,
          select: { id: true, userId: true, planId: true, actionType: true, status: true, createdAt: true,
            updatedAt: true, agentName: true, sjekkpunkt: true, suggestion: true,
            decidedAt: true, decidedById: true, user: { select: { id: true, name: true } } } });
          for (const r of rader) {
            const parsed = akUkeforslagSchema.safeParse(r.suggestion);
            if (!parsed.success || parsed.data.databevis.planId !== r.planId) continue;
            if (r.status === "PENDING") {
              resultat.pendingCount++;
              if (!resultat.eldstePending || r.createdAt < resultat.eldstePending.createdAt) {
                resultat.eldstePending = { createdAt: r.createdAt, user: { name: r.user.name } };
              }
            }
            if (r.status === "ACCEPTED") {
              resultat.acceptedCount++;
              if (r.decidedAt && r.decidedAt >= syvDagerSiden) resultat.accepted7d++;
              if (valg.godkjentAvViewerSiden && r.decidedById === viewer.id && r.decidedAt && r.decidedAt >= valg.godkjentAvViewerSiden) resultat.godkjentAvViewer++;
            }
            if (r.status === "REJECTED") {
              resultat.rejectedCount++;
              if (r.decidedAt && r.decidedAt >= syvDagerSiden) resultat.rejected7d++;
            }
            if (valg.status && (typeof valg.status === "string" ? r.status !== valg.status : !valg.status.some(s => s === r.status))) continue;
            if (valg.endretSiden && r.updatedAt < valg.endretSiden) continue;
            const { tittel, forklaring, sessions } = parsed.data;
            resultat.planActions.push({ id: r.id, userId: r.userId, planId: r.planId, actionType: r.actionType,
              status: r.status, createdAt: r.createdAt, updatedAt: r.updatedAt, agentName: r.agentName,
              sjekkpunkt: r.sjekkpunkt, user: r.user, provenance: null,
              suggestion: { tittel, forklaring: forklaringMedAkUkerad(forklaring, parsed.data.fagligeRad), sessions: sessions.map(s => ({ title: s.title, pyramidArea: s.pyramidArea,
                scheduledAt: s.scheduledAt, durationMin: s.durationMin,
                drills: s.drills.map(d => ({ exerciseId: d.exerciseId, minutter: d.minutter })) })) } });
          }
          resultat.planActions = begrensDelteForslag(resultat.planActions, valg);
          if (rader.length < 100) break;
          etterId = rader[rader.length - 1].id;
        }
      }
    }, true);
  }
  return resultat;
}
