/**
 * AgencyOS · Caddie · Dashbord (v2). V2-port av
 * src/app/admin/(legacy)/agencyos/caddie/dashbord/page.tsx — proaktive
 * forslag (Fase 3: inaktive spillere → CaddieDraft) øverst, deretter
 * co-agent-rammeverket (utkast/fleet/audit). Samme dataloading
 * (loadCoAgent, uendret) og samme Prisma-spørring. ADMIN-only.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadCoAgent } from "@/lib/admin-caddie/co-agent-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { CaddieSubNavV2 } from "@/components/admin/v2/caddie/caddie-subnav-v2";
import { AdminCaddieProaktivV2, type ProaktivtForslag } from "@/components/admin/v2/AdminCaddieProaktivV2";
import { AdminCaddieDashbordV2 } from "@/components/admin/v2/AdminCaddieDashbordV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Caddie · Dashbord · AgencyOS (v2)" };

export default async function V2CaddieDashbordPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const [props, drafts] = await Promise.all([
    loadCoAgent({ id: user.id, name: user.name }),
    prisma.caddieDraft.findMany({
      where: { userId: user.id, status: "PENDING", toolName: "reengageInactivePlayer" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const forslag: ProaktivtForslag[] = drafts.map((d) => {
    const inp = (d.toolInput ?? {}) as { spillerName?: string; dagerInaktiv?: number };
    return {
      id: d.id,
      previewText: d.previewText,
      spillerName: inp.spillerName ?? "spilleren",
      dagerInaktiv: inp.dagerInaktiv ?? 0,
    };
  });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <CaddieSubNavV2 />
      <AdminCaddieProaktivV2 forslag={forslag} />
      <AdminCaddieDashbordV2 {...props} />
    </V2Shell>
  );
}
