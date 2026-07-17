/**
 * /admin/tester/tildel/[spillerId] — Coach tildel-test-modal (T5). v2-port
 * 16. juli 2026: delt `AdminTildelTestV2` med `/admin/spillere/[id]/tildel-test`
 * (samme skjerm, to inngangspunkt). Ekte spillerkategori (A–K) og ekte
 * gjennomførte/tildelte test-tall — ingen fabrikerte tall.
 *
 * Route-baserte modaler (åpnes fra "Tildel"-CTAene på /admin/tester).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import { AdminTildelTestV2, type AdminTildelTestV2Data } from "@/components/admin/v2/AdminTildelTestV2";

export const dynamic = "force-dynamic";

export default async function TildelTestPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { spillerId } = await params;

  const [spiller, tester, totalt, fullforte] = await Promise.all([
    prisma.user.findUnique({
      where: { id: spillerId },
      select: { id: true, name: true, hcp: true },
    }),
    prisma.testDefinition
      .findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true, pyramidArea: true },
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
    tester: tester.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? "",
      pyramidArea: t.pyramidArea,
    })),
    tilbakeHref: "/admin/tester",
  };

  return <AdminTildelTestV2 data={data} />;
}
