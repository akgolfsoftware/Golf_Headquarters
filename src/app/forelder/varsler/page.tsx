/**
 * v2-forhåndsvisning — Foreldreportal · Varsler (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver forelder-layouten — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV), ForelderVarslerV2
 * rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/forelder/varsler/page.tsx): kun PARENT slippes inn, koblede barn hentes
 * via hentBarnForForelder, og barnas 8 nyeste varsler hentes fra Notification-feeden.
 * Datoene formateres på server (nb-NO) slik at klientkomponenten holdes ren.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderVarslerV2,
  type ForelderVarslerData,
} from "@/components/portal/v2/ForelderVarslerV2";

export const dynamic = "force-dynamic";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function V2ForelderVarslerPreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  const sisteVarsler = childIds.length
    ? await prisma.notification.findMany({
        where: { userId: { in: childIds } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { id: true, name: true } } },
      })
    : [];

  const data: ForelderVarslerData = {
    email: user.email,
    barn: barn.map((b) => ({
      id: b.child.id,
      name: b.child.name,
      relationship: b.relationship,
    })),
    varsler: sisteVarsler.map((v) => ({
      id: v.id,
      type: v.type,
      title: v.title,
      body: v.body,
      childFirstName: v.user?.name?.split(" ")[0] ?? "—",
      dato: NB_DATO.format(v.createdAt),
    })),
  };

  return (
    <V2Shell aktiv="oversikt" nav={FORELDER_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <ForelderVarslerV2 data={data} />
    </V2Shell>
  );
}
