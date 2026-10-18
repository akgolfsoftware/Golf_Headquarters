/**
 * PlayerHQ · Tester · Ny test (/portal/tren/tester/ny). PH-14 Ny test i nytt design (pakke 13, Stats resten).
 * Design og avvik: se PH14NyTest.
 * Testbatteriet er testene spilleren har tilgang til (testTilgangWhere), med siste og beste resultat per test.
 * Server action `logTest` ligger i ./actions.ts.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { byggNyTestValg } from "@/lib/portal-tester/ny-test-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14NyTest } from "@/components/portal/precision/PH14NyTest";

export const dynamic = "force-dynamic";

export default async function NyTestPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });

  const [defs, resultater, enrollment] = await Promise.all([
    prisma.testDefinition.findMany({
      where: testTilgangWhere(user.id),
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true, pyramidArea: true, scoringRule: true, protocol: true, isCustom: true },
    }),
    prisma.testResult.findMany({
      where: { userId: user.id },
      select: { testId: true, score: true, takenAt: true },
    }),
    prisma.playerEnrollment.findFirst({
      where: { userId: user.id, endedAt: null, coachId: { not: null } },
      orderBy: { enrolledAt: "desc" },
      select: { coach: { select: { name: true } } },
    }),
  ]);

  const coachNavn = enrollment?.coach?.name?.split(" ")[0] ?? null;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH14NyTest tester={byggNyTestValg(defs, resultater)} coachNavn={coachNavn} />
    </PlayerHQSkall>
  );
}
