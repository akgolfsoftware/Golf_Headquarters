import "server-only";
import { medAkProfiler } from "@/lib/deling/ak-profil-lesing";

/** Profilnøkkeltall og deres personrader leses under samme ferske delingslås. */
export async function hentCockpitProfilnokkel(viewer: { id: string; role: string }, naa: Date) {
  const tretti = new Date(naa);
  tretti.setDate(tretti.getDate() - 30);
  const fem = new Date(naa);
  fem.setDate(fem.getDate() - 5);
  const lest = await medAkProfiler(viewer, async (tx, scope) => {
    const [aktiveSpillereCount, nyeSpillereCount, inaktiveSpillere, stallSgAgg, planStatusGrupper] = await Promise.all([
      tx.user.count({ where: { AND: [scope, { lastLoginAt: { gte: tretti } }] } }),
      tx.user.count({ where: { AND: [scope, { createdAt: { gte: tretti } }] } }),
      tx.user.findMany({
        where: { AND: [scope, { lastLoginAt: { lt: fem } }] },
        select: { id: true, name: true, homeClub: true, lastLoginAt: true, phone: true },
        orderBy: { lastLoginAt: "asc" }, take: 4,
      }),
      tx.round.aggregate({
        _avg: { sgTotal: true },
        where: { playedAt: { gte: tretti }, sgTotal: { not: null }, user: scope },
      }),
      tx.trainingPlanSession.groupBy({
        by: ["status"],
        where: { scheduledAt: { gte: tretti, lte: naa }, plan: { user: scope } },
        _count: { _all: true },
      }),
    ]);
    return { aktiveSpillereCount, nyeSpillereCount, inaktiveSpillere, stallSgAgg, planStatusGrupper };
  });
  // Manglende tilgang er tomt. Database-/delingsfeil kastes videre, aldri cache/global reserve.
  return lest ?? {
    aktiveSpillereCount: 0, nyeSpillereCount: 0, inaktiveSpillere: [],
    stallSgAgg: { _avg: { sgTotal: null } }, planStatusGrupper: [],
  };
}
