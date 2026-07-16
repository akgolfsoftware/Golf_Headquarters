/**
 * /admin/spillere/[id]/tildel-test — v2-port 16. juli 2026: delt
 * `AdminTildelTestV2` med `/admin/tester/tildel/[spillerId]` (samme skjerm,
 * to inngangspunkt). Erstatter `TildelTestModalScreen`
 * (`test-modul-v2/`) som viste fabrikerte tall («HCP 4.8 · 12/36 tester
 * gjennomført · A1») uansett hvem spilleren faktisk var.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import { AdminTildelTestV2, type AdminTildelTestV2Data } from "@/components/admin/v2/AdminTildelTestV2";

export const dynamic = "force-dynamic";

export default async function TildelTestPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [spiller, tester, totalt, fullforte] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.testDefinition
      .findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true, pyramidArea: true },
      })
      .catch(() => []),
    prisma.testAssignment.count({ where: { playerId: id } }),
    prisma.testAssignment.count({ where: { playerId: id, status: "COMPLETED" } }),
  ]);
  if (!spiller) notFound();

  const kategori = await hentSpillerAkKategori(spiller.id, { hcp: spiller.hcp });

  const data: AdminTildelTestV2Data = {
    spillerId: spiller.id,
    spillerNavn: spiller.name ?? "Spiller",
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
    tilbakeHref: `/admin/spillere/${spiller.id}/tester`,
  };

  return <AdminTildelTestV2 data={data} />;
}
