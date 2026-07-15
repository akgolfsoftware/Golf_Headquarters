/**
 * AgencyOS — Tildel test v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/spillere/[id]/tildel-test (`TildelTestModalScreen`,
 * `test-modul-v2/` — nå slettet). Samme loader (User + TestDefinition) og
 * samme server action `tildelTest` (uendret i
 * (legacy)/tester/tildel/[spillerId]/actions.ts).
 *
 * Server component.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminTildelTestV2,
  type AdminTildelTestData,
} from "@/components/admin/v2/AdminTildelTestV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tildel test · AgencyOS" };

function formatHcp(v: number | null | undefined): string | null {
  if (v == null) return null;
  return v.toString().replace(".", ",");
}

export default async function AdminTildelTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [player, tester] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.testDefinition
      .findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true, pyramidArea: true },
      })
      .catch(() => []),
  ]);
  if (!player) notFound();

  const omradeAntall = tester.reduce<Record<string, number>>((acc, t) => {
    acc[t.pyramidArea] = (acc[t.pyramidArea] ?? 0) + 1;
    return acc;
  }, {});

  const data: AdminTildelTestData = {
    spillerId: player.id,
    spillerNavn: player.name ?? "Spiller",
    hcpTekst: formatHcp(player.hcp),
    tester: tester.map((t) => ({
      id: t.id,
      navn: t.name,
      beskrivelse: t.description ?? "",
      omrade: t.pyramidArea,
    })),
    omradeAntall,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href={`/admin/spillere/${id}/tester`}>{player.name ?? "Spiller"}</TilbakeLenke>
      <AdminTildelTestV2 data={data} />
    </V2Shell>
  );
}
