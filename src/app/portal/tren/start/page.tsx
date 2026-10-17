/**
 * «Start økt» fra hurtigknappen i PlayerHQ (beslutninger.md §Hurtigknappen, 28.09).
 * Ingen egen visning: en pågående Workbench-økt fortsettes, ellers åpnes neste planlagte økt.
 * Uten planlagt økt sendes spilleren til Workbench for å lage en.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadNesteOkt } from "@/lib/portal/load-neste-okt";
import { liveHrefForStatus } from "@/lib/portal-live/live-route";

export const dynamic = "force-dynamic";

export default async function StartOktPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const pagar = await prisma.workbenchSession.findFirst({
    where: { playerId: user.id, status: "IN_PROGRESS", hiddenByPlayer: false, isTemplate: false },
    orderBy: { updatedAt: "desc" },
    select: { id: true, status: true },
  });
  if (pagar) redirect(liveHrefForStatus("wb", pagar.status, pagar.id));
  const neste = await loadNesteOkt(user.id, new Date());
  redirect(neste.href);
}
