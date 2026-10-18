// PlayerHQ Ny målsetning — Precision Athletics, pakke 17b. Erstatter /portal/ai/mal-bygger, som sender hit.
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHNyMalsetning } from "@/components/portal/precision/PHNyMalsetning";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny målsetning · PlayerHQ" };

export default async function NyMalsetningPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const [testOptions, uleste] = await Promise.all([
    // Bare offisielle eller coach-godkjente tester kan kobles til en målsetning, som i målbyggeren.
    prisma.testDefinition.findMany({
      where: { OR: [{ isCustom: false }, { isCoachApproved: true }] },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHNyMalsetning testOptions={testOptions} />
    </PlayerHQSkall>
  );
}
