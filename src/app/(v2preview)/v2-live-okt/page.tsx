/**
 * v2-forhåndsvisning — PlayerHQ Live-økt (aktiv, retning C). FULLSKJERM-flyt
 * uten V2Shell: LiveOktV2 setter sin egen mørke scope, siden en spiller midt i
 * en økt ikke skal ha app-navigasjon rundt seg.
 *
 * Auth + datakontrakt gjenbrukt 1:1 fra den ekte aktiv-siden
 * (src/app/portal/(fullscreen)/live/[sessionId]/active/page.tsx). Til preview
 * plukkes en EKTE live-økt for testbrukeren (pågående før planlagt). Finnes
 * ingen → ærlig tom-tilstand (LiveOktV2 med data=null).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadLiveSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { LiveOktV2 } from "@/components/portal/v2/LiveOktV2";
import type { LiveV2Session } from "@/components/portal/live/types";

export const dynamic = "force-dynamic";

/** Finn en ekte live-økt for spilleren: pågående før neste planlagte. */
async function finnEksempelOktId(userId: string): Promise<string | null> {
  const igang = await prisma.trainingSessionV2.findFirst({
    where: {
      status: "IN_PROGRESS",
      OR: [
        { studentId: userId },
        { participants: { some: { userId, status: { in: ["ACCEPTED", "ATTENDED"] } } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (igang) return igang.id;

  const planlagt = await prisma.trainingSessionV2.findFirst({
    where: {
      status: "PLANNED",
      OR: [
        { studentId: userId },
        { participants: { some: { userId, status: { in: ["ACCEPTED", "ATTENDED"] } } } },
      ],
    },
    orderBy: { startTime: "asc" },
    select: { id: true },
  });
  return planlagt?.id ?? null;
}

export default async function V2LiveOktPreviewPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const isCoach = user.role === "COACH" || user.role === "ADMIN";

  const sessionId = await finnEksempelOktId(user.id);
  let data: LiveV2Session | null = null;
  if (sessionId) {
    const result = await loadLiveSession(sessionId, user.id, isCoach);
    if (result.ok) data = result.data;
  }

  return <LiveOktV2 data={data} />;
}
