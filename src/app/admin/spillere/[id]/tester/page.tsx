/**
 * /admin/spillere/[id]/tester — pixel-perfekt Claude Design-port
 * docs/design-handoff/test-modul/coach-spiller-tester-tab.html
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CoachSpillerTesterTabScreen } from "@/components/test-modul-v2/coach-spiller-tester-tab-screen";

export const dynamic = "force-dynamic";

export default async function SpillerTesterTabPage({ params }: { params: Promise<{ id: string }> }) {
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
  return <CoachSpillerTesterTabScreen playerName={player.name ?? "Spiller"} playerInitials={initials} />;
}
