/**
 * Stats › Resultater i nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «resultater».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH16Resultater.tsx.
 * Turneringer: spillerens egne offentlige resultater (hentTurneringshistorikk, uten Data Golf).
 * Runder: rundene spilleren har registrert i appen. Bare brutto.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { byggResultater } from "@/lib/portal-analyse/resultater-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16Resultater } from "@/components/portal/precision/PH16Resultater";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resultater · PlayerHQ" };

export default async function ResultaterPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [runder, historikk, ulest, kobling] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 200,
      select: { id: true, playedAt: true, score: true, roundType: true, course: { select: { name: true } }, holeScores: { select: { par: true } } },
    }),
    // Spilleren ser aldri Data Golf (§KODEGJENNOMGANGEN 06.10): standardvalget medDataGolf = false.
    hentTurneringshistorikk(user.id),
    getUnreadNotifications(user.id, 1),
    prisma.user.findUnique({ where: { id: user.id }, select: { publicPlayerId: true } }),
  ]);

  const data = byggResultater(
    runder.map(({ course, ...r }) => ({ ...r, courseName: course?.name ?? null })),
    historikk.aar.flatMap((a) => a.turneringer),
  );

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH16Resultater data={data} koblet={!!kobling?.publicPlayerId || historikk.harHistorikk} />
    </PlayerHQSkall>
  );
}
