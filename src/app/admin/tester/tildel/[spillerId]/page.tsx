/**
 * /admin/tester/tildel/[spillerId] — Coach tildel-test-modal (T5). v2-port
 * 16. juli 2026: delt `AdminTildelTestV2` med `/admin/spillere/[id]/tildel-test`
 * (samme skjerm, to inngangspunkt). Ekte spillerkategori (A–K) og ekte
 * gjennomførte/tildelte test-tall — ingen fabrikerte tall.
 *
 * Flyttet ut av (legacy) og portert til Precision Athletics (AG-15 tildel):
 * en side i AgencyOSSkall, ikke lenger en modal. `AdminTildelTestV2` brukes
 * fortsatt av /admin/spillere/[id]/tildel-test.
 */

import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { withTnAssignments } from "@/lib/portal-tester/tn-integration";
import { prisma } from "@/lib/prisma";
import { hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import type { AdminTildelTestV2Data } from "@/components/admin/v2/AdminTildelTestV2";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG15Tildel } from "@/components/admin/precision/AG15Tildel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tildel test · AgencyOS" };

export default async function TildelTestPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const viewer = await requireCapability(Capability.MANAGE_TESTS);
  const { spillerId } = await params;

  const [spiller, tester, totalt, fullforte] = await Promise.all([
    // Coach-scoping: uten porten lakk skjermen navn, handicap og AK-kategori
    // for en vilkårlig bruker-id.
    prisma.user.findFirst({
      where: { AND: [coachScopedPlayerWhere(viewer), { id: spillerId }] },
      select: { id: true, name: true, hcp: true },
    }),
    prisma.testDefinition
      .findMany({
        where: viewer.role === "ADMIN" ? {} : { OR: [{ isCustom: false }, { createdById: viewer.id }, { visibility: { not: "PRIVATE" } }] },
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true, pyramidArea: true, isCustom: true },
      })
      .catch(() => []),
    prisma.testAssignment.count({ where: { playerId: spillerId } }),
    prisma.testAssignment.count({ where: { playerId: spillerId, status: "COMPLETED" } }),
  ]);

  if (!spiller) notFound();

  const kategori = await hentSpillerAkKategori(spiller.id, { hcp: spiller.hcp });

  const data: AdminTildelTestV2Data = {
    spillerId: spiller.id,
    spillerNavn: spiller.name,
    kategori,
    hcpLabel: spiller.hcp != null ? `HCP ${spiller.hcp}` : "HCP —",
    fullforte,
    totalt,
    tester: withTnAssignments(tester).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? "",
      pyramidArea: t.pyramidArea,
    })),
    tilbakeHref: "/admin/tester",
  };

  return (
    <AgencyOSSkall navn={viewer.name ?? "Coach"}>
      <AG15Tildel data={data} />
    </AgencyOSSkall>
  );
}
