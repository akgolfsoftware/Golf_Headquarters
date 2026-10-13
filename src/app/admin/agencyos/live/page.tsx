/**
 * AgencyOS · Live-tavle — Precision Athletics (AG-13, bolk A3, 28.–29.09.2026).
 *
 * Flyttet ut av (fullscreen)-gruppa: den gruppa fantes bare for denne ruta
 * og ga et eget, navløst skall («Live-tavla er artefakt, aldri fane»,
 * Train-lock). Precision Athletics gir hver AgencyOS-side samme skall og
 * hurtigknapp (beslutninger.md §Hurtigknappen: «gjelder alle AgencyOS-
 * skjermer»), så Tavla får nå AgencyOSSkall som alle andre admin-sider.
 * Data, auth og eierskapsfilter (ADMIN ser alt, COACH ser eget) er urørt
 * fra hentLiveTavle() (T9, 27.08.2026) — bare visningen er byttet.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG13LiveTavle } from "@/components/admin/precision/AG13LiveTavle";
import { hentLiveTavle } from "@/lib/agencyos/live-tavle-data";
import { canAccessPlayer } from "@/lib/auth/own-or-coached";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live-tavle · AgencyOS" };

export default async function LiveTavlePage({ searchParams }: {
  searchParams: Promise<{ playerId?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { playerId } = await searchParams;
  if (playerId && !(await canAccessPlayer(user, playerId))) notFound();
  const selectedPlayer = playerId
    ? await prisma.user.findUnique({ where: { id: playerId }, select: { id: true, name: true } })
    : null;
  if (playerId && !selectedPlayer) notFound();
  const data = await hentLiveTavle(user.id, user.role === "ADMIN", playerId);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG13LiveTavle data={data} selectedPlayer={selectedPlayer} />
    </AgencyOSSkall>
  );
}
