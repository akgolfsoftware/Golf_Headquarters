/**
 * Jarvis' lese-hook mot Agentic OS: uløste godkjenninger (samme filter som
 * /admin/godkjenninger) + siste agentkjøring. Brukes av Maskinrommet via
 * innsamler-rader — ingen ny skjerm.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { koTelling } from "@/lib/admin/ko-telling";
import type { AgenticosBroStatus } from "@/lib/jarvis/types";

export { byggAgenticosInnsamlere } from "@/lib/jarvis/agenticos-visning";

export const TOM_AGENTICOS_BRO: AgenticosBroStatus = {
  ulosteGodkjenninger: 0,
  planActions: 0,
  caddieDrafts: 0,
  sessionRequests: 0,
  sisteAgentKjoring: null,
  feiledeSisteDognet: 0,
};

export async function hentAgenticosBro(): Promise<AgenticosBroStatus> {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN", deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!admin) return TOM_AGENTICOS_BRO;

    const siden = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ikkeJarvis = { NOT: { agentName: { startsWith: "jarvis" } } };

    const [ko, siste, feilet] = await Promise.all([
      koTelling(admin.id, "ADMIN"),
      prisma.agentRun.findFirst({
        where: ikkeJarvis,
        orderBy: { createdAt: "desc" },
        select: { agentName: true, status: true, createdAt: true, error: true },
      }),
      prisma.agentRun.count({
        where: { status: "ERROR", createdAt: { gte: siden }, ...ikkeJarvis },
      }),
    ]);

    return {
      ulosteGodkjenninger: ko.totalt,
      planActions: ko.planActions,
      caddieDrafts: ko.caddieDrafts,
      sessionRequests: ko.sessionRequests,
      sisteAgentKjoring: siste
        ? {
            agentName: siste.agentName,
            status: siste.status,
            createdAt: siste.createdAt.toISOString(),
            error: siste.error,
          }
        : null,
      feiledeSisteDognet: feilet,
    };
  } catch {
    return TOM_AGENTICOS_BRO;
  }
}

