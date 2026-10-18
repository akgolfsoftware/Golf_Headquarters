/**
 * PlayerHQ · Én målsetning (/portal/mal/goal/[id]) i nytt design. Komponent: PHMalsetning.
 *
 * Eierskapssjekken (loadGoalForViewer: eier, admin eller tilknyttet coach) er uendret.
 * Handlingene (endre / nådd / avslutt) går via goals-actions.ts, som selv krever eier.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadGoalForViewer } from "@/lib/portal/goals/detail-data";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHMalsetning } from "@/components/portal/precision/PHMalsetning";
import { byggMaalEn } from "@/lib/portal-mal/maal-ny-last";

export const dynamic = "force-dynamic";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  const [detail, uleste] = await Promise.all([
    loadGoalForViewer(id, user),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  if (!detail) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
        <PHMalsetning data={null} />
      </PlayerHQSkall>
    );
  }

  const { goal, hcp } = detail;
  const erEget = goal.userId === user.id;

  const [data, testOptions] = await Promise.all([
    byggMaalEn(goal, hcp, erEget),
    erEget
      ? prisma.testDefinition.findMany({
          where: { OR: [{ isCustom: false }, { isCoachApproved: true }] },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PHMalsetning data={data} testOptions={testOptions} />
    </PlayerHQSkall>
  );
}
