/**
 * AgencyOS · Caddie · Dashbord (/admin/agencyos/caddie/dashbord)
 *
 * Proaktive forslag (Fase 3: inaktive spillere → CaddieDraft) øverst, deretter
 * co-agent-rammeverket (utkast/fleet/audit fra PlanAction/AgentRun/AuditLog).
 * ADMIN-only.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CoAgent } from "@/components/admin/caddie/co-agent";
import { loadCoAgent } from "@/lib/admin-caddie/co-agent-data";
import { CaddieProactive, type ProaktivtForslag } from "./caddie-proactive";

export const dynamic = "force-dynamic";

export default async function CaddieDashbordPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const [props, drafts] = await Promise.all([
    loadCoAgent({ id: user.id, name: user.name }),
    prisma.caddieDraft.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
        toolName: "reengageInactivePlayer",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const forslag: ProaktivtForslag[] = drafts.map((d) => {
    const inp = (d.toolInput ?? {}) as {
      spillerName?: string;
      dagerInaktiv?: number;
    };
    return {
      id: d.id,
      previewText: d.previewText,
      spillerName: inp.spillerName ?? "spilleren",
      dagerInaktiv: inp.dagerInaktiv ?? 0,
    };
  });

  return (
    <>
      <CaddieProactive forslag={forslag} />
      <CoAgent {...props} />
    </>
  );
}
