/**
 * AgencyOS — Tester · Tildel test-modal (`/admin/tester/tildel/
 * [spillerId]`), v2. Port av `(legacy)/tester/tildel/[spillerId]/page.tsx`
 * + `tildel-modal.tsx` (2026-07-14, AgencyOS Bølge 3.27) — samme
 * `tildelTest`-server-action-kontrakt. `(legacy)/tester/tildel/
 * [spillerId]/actions.ts` bor fortsatt der — delt, uendret.
 *
 * MERK: legacy-modalen hadde ingen matchende CSS noe sted i kodebasen
 * (egendefinerte `tester-modal`/`te-*`-klasser uten stilark) — rendret
 * altså helt ustylet i prod. v2-porten (`BunnArk`) er en reell
 * funksjonell forbedring, ikke bare et redesign.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTildelTestModalV2 } from "@/components/admin/v2/AdminTesterTildelV2";

export const dynamic = "force-dynamic";

export default async function TildelTestPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { spillerId } = await params;

  const [spiller, tester] = await Promise.all([
    prisma.user.findUnique({ where: { id: spillerId }, select: { id: true, name: true, hcp: true } }),
    prisma.testDefinition
      .findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, description: true, pyramidArea: true } })
      .catch(() => []),
  ]);

  if (!spiller) notFound();

  const initials = spiller.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  const pyrCounts = tester.reduce(
    (acc, t) => {
      acc[t.pyramidArea] = (acc[t.pyramidArea] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTildelTestModalV2
        spiller={{ id: spiller.id, name: spiller.name, initials, hcp: spiller.hcp != null ? String(spiller.hcp) : "—" }}
        tester={tester.map((t) => ({ id: t.id, name: t.name, description: t.description ?? "", pyramidArea: t.pyramidArea }))}
        pyrCounts={pyrCounts}
      />
    </V2Shell>
  );
}
