/**
 * PH16Skillkart — Skill Map i PlayerHQSkall.
 * Samme runder, treningsøkter og kart som før.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { SkillMapView } from "@/components/portal/skill-map/SkillMapView";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { buildSkillMapData } from "@/lib/domain/skill-map";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skill Map · PlayerHQ" };

export default async function SkillMapPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const [rounds, training, ulest] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 20,
      select: {
        playedAt: true,
        sgTee: true,
        sgApp200: true,
        sgApp150: true,
        sgApp100: true,
        sgApp50: true,
        sgChip: true,
        sgPitch: true,
        sgLob: true,
        sgBunker: true,
        sgPutt0_3: true,
        sgPutt3_5: true,
        sgPutt5_10: true,
        sgPutt10_15: true,
        sgPutt15_25: true,
        sgPutt25_40: true,
        sgPutt40plus: true,
      },
    }),
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId: user.id }, scheduledAt: { gte: tretti } },
      select: { skillArea: true, durationMin: true },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <div className="ph-flate">
          <Link href="/portal/analysere" className="ph-tilbake">Analyse</Link>
          <SkillMapView data={buildSkillMapData(rounds, training)} />
        </div>
      </div>
    </PlayerHQSkall>
  );
}
