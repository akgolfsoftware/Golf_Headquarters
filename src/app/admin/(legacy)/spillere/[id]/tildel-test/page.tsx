/**
 * /admin/spillere/[id]/tildel-test — pixel-perfekt Claude Design-port.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TildelTestModalScreen } from "@/components/test-modul-v2/tildel-test-modal-screen";

export const dynamic = "force-dynamic";

export default async function TildelTestPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
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
  const initials =
    player.name
      ?.split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "??";

  const pyrCounts = tester.reduce(
    (acc, t) => {
      acc[t.pyramidArea] = (acc[t.pyramidArea] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <TildelTestModalScreen
      playerId={player.id}
      playerName={player.name ?? "Spiller"}
      playerInitials={initials}
      tester={tester.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? "",
        pyramidArea: t.pyramidArea,
      }))}
      pyrCounts={pyrCounts}
    />
  );
}
