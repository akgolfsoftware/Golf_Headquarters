/**
 * AgencyOS — Tildel test (/admin/spillere/[id]/tildel-test), v2-design
 * (retning C). Deler `AdminTildelTestV2` med `/admin/tester/tildel/[spillerId]`
 * (samme skjerm, to inngangspunkt) — mutasjonen `tildelTest` (TestAssignment +
 * varsel) gjenbrukes via legacy-stien i komponenten.
 *
 * Auth + datagrunnlag gjenbrukt 1:1 fra den forrige (legacy) siden: samme
 * requirePortalUser-guard (COACH/ADMIN), samme spørringer (testdefinisjoner,
 * tildelings-tall, AK-kategori). Spiller-oppslaget er i tillegg coach-scopet
 * (coachScopedPlayerWhere) som hovedsiden /admin/spillere/[id] — notFound()
 * hvis spilleren ikke finnes eller er utenfor coachens stall.
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTildelTestV2, type AdminTildelTestV2Data } from "@/components/admin/v2/AdminTildelTestV2";

export const dynamic = "force-dynamic";

export default async function TildelTestPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [spiller, tester, totalt, fullforte] = await Promise.all([
    prisma.user.findFirst({ where: { AND: [coachScopedPlayerWhere(user), { id }] } }),
    prisma.testDefinition
      .findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true, pyramidArea: true },
      })
      .catch(() => []),
    prisma.testAssignment.count({ where: { playerId: id } }),
    prisma.testAssignment.count({ where: { playerId: id, status: "COMPLETED" } }),
  ]);
  if (!spiller || spiller.role !== "PLAYER") notFound();

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

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminTildelTestV2 data={data} />
    </V2Shell>
  );
}
