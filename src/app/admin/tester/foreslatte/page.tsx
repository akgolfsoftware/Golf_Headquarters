/**
 * AgencyOS — Tester · Foreslåtte tester (`/admin/tester/foreslatte`), v2.
 * Port av `(legacy)/tester/foreslatte/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.26) — samme `TestDefinition`-filter (isCustom + COACH-visibility
 * + ikke godkjent). `(legacy)/tester/foreslatte/actions.ts` bor fortsatt
 * der — delt `godkjennForslag`/`avvisForslag`-server actions, uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTesterForeslatteV2, type ForeslattTestV2 } from "@/components/admin/v2/AdminTesterForeslatteV2";

export const dynamic = "force-dynamic";

export default async function ForeslatteTesterPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const foreslaatte = await prisma.testDefinition.findMany({
    where: { isCustom: true, visibility: "COACH", isCoachApproved: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      pyramidArea: true,
      scoringRule: true,
      protocol: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  const rader: ForeslattTestV2[] = foreslaatte.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    pyramidArea: t.pyramidArea,
    scoringRule: t.scoringRule,
    protocol: t.protocol,
    createdAt: t.createdAt.toISOString(),
    forfatter: t.createdBy?.name ?? t.createdBy?.email ?? "Ukjent",
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTesterForeslatteV2 foreslaatte={rader} />
    </V2Shell>
  );
}
