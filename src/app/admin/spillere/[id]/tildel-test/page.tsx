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
  const player = await prisma.user.findUnique({ where: { id } });
  if (!player) notFound();
  const initials =
    player.name
      ?.split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "??";
  return <TildelTestModalScreen playerName={player.name ?? "Spiller"} playerInitials={initials} />;
}
