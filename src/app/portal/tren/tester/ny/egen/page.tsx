/**
 * PlayerHQ · Tester · Egen test (/portal/tren/tester/ny/egen). PH-14 Egen test i nytt design (pakke 13, Stats resten).
 * Design og avvik: se PH14EgenTest.
 * Auth (PLAYER/COACH/ADMIN) er uendret; server action `opprettCustomTest` ligger i ./actions.ts.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aktivtMedlemskapWhere } from "@/lib/domain/grupper";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14EgenTest } from "@/components/portal/precision/PH14EgenTest";

export const dynamic = "force-dynamic";

export default async function NyEgenTestPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const [enrollment, medlemskap] = await Promise.all([
    prisma.playerEnrollment.findFirst({
      where: { userId: user.id, endedAt: null, coachId: { not: null } },
      orderBy: { enrolledAt: "desc" },
      select: { coach: { select: { name: true } } },
    }),
    prisma.groupMember.findFirst({
      where: { userId: user.id, ...aktivtMedlemskapWhere() },
      orderBy: { joinedAt: "desc" },
      select: { group: { select: { name: true } } },
    }),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH14EgenTest
        rolle={user.role}
        coachNavn={enrollment?.coach?.name?.split(" ")[0] ?? null}
        gruppeNavn={medlemskap?.group.name ?? null}
      />
    </PlayerHQSkall>
  );
}
