// PH13OvelserCoach — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * v2-forhåndsvisning — PlayerHQ Coach-øvelser (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — V2Shell leverer chrome-en,
 * CoachOvelserV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/coach/ovelser/page.tsx): requirePortalUser + hele
 * ExerciseDefinition-biblioteket. Filtrering skjer klientside i komponenten.
 */

import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CoachOvelserV2, type CoachOvelserData } from "@/components/portal/v2/CoachOvelserV2";

export const dynamic = "force-dynamic";

export default async function V2CoachOvelserPreviewPage() {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

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
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <TilbakeLenke href="/portal/coach">Coach</TilbakeLenke>
      <CoachOvelserV2 data={data} />
    </div>
    </PlayerHQSkall>
  );
}
