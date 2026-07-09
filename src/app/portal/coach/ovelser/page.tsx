/**
 * v2-forhåndsvisning — PlayerHQ Coach-øvelser (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — V2Shell leverer chrome-en,
 * CoachOvelserV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/coach/ovelser/page.tsx): requirePortalUser + hele
 * ExerciseDefinition-biblioteket. Filtrering skjer klientside i komponenten.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachOvelserV2, type CoachOvelserData } from "@/components/portal/v2/CoachOvelserV2";

export const dynamic = "force-dynamic";

export default async function V2CoachOvelserPreviewPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const exercises = await prisma.exerciseDefinition.findMany({
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });

  const data: CoachOvelserData = {
    coachNavn: "Anders",
    ovelser: exercises.map((e) => ({
      id: e.id,
      navn: e.name,
      omrade: e.pyramidArea,
      varighetMin: e.durationMin,
      repsSets: e.defaultRepsSets,
      lFase: e.lPhase,
      csMin: e.csMin,
      csMax: e.csMax,
    })),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <CoachOvelserV2 data={data} />
    </V2Shell>
  );
}
