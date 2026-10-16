/**
 * PH-11-MAL Målsetninger i nytt design (PlayerHQSkall). Komponent: PHMalsetninger.
 *
 * «Mål» heter Målsetninger. Talentradar vises aldri for spilleren.
 */

import { harEgenIupInngang } from "@/lib/iup/oversikt";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHMalsetninger } from "@/components/portal/precision/PHMalsetninger";
import { byggMaalKort } from "@/lib/portal-mal/maal-ny-last";

export const dynamic = "force-dynamic";

const ACHIEVEMENT_TITLER: Record<string, string> = {
  STREAK_7: "7 dager på rad",
  STREAK_14: "14 dager på rad",
  STREAK_30: "30 dager på rad",
  FIRST_ROUND: "Første registrerte runde",
  FIRST_TEST: "Første gjennomførte test",
  SG_POSITIVE_30D: "SG positiv siste 30 dager",
  HCP_DOWN: "HCP gikk ned",
  ROUND_BEST: "Ny personlig rekord",
};

export default async function PH19MalPage() {
  const user = await requirePortalUser();

  const [goals, avsluttede, sisteMilepael, visIup, uleste] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.goal.findMany({
      where: { userId: user.id, status: { in: ["ACHIEVED", "ABANDONED"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.achievement.findFirst({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    }),
    ["PLAYER", "COACH", "ADMIN"].includes(user.role) ? harEgenIupInngang() : Promise.resolve(false),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  const [kort, avsluttetKort] = await Promise.all([
    byggMaalKort(goals, user.hcp),
    byggMaalKort(avsluttede, user.hcp),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PHMalsetninger
        visIup={visIup}
        avsluttede={avsluttetKort}
        data={{
          goals: kort,
          milepael: sisteMilepael
            ? {
                tittel: ACHIEVEMENT_TITLER[sisteMilepael.kind] ?? sisteMilepael.kind,
                dato: sisteMilepael.earnedAt.toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Europe/Oslo",
                }),
              }
            : null,
        }}
      />
    </PlayerHQSkall>
  );
}
