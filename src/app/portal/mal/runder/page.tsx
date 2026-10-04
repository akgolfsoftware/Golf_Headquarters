/**
 * PH18RunderPage — PlayerHQ Runder og statistikk (PH-18) i PlayerHQSkall (Precision Athletics).
 *
 * Claude Design 7d7c2994 (ui_kits/playerhq/screens/PH-18.jsx).
 * Brutto score, Strokes Gained og streng par-beregning.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH18Runder } from "@/components/portal/precision/PH18Runder";
import { byggPH18, type PH18RundeInn } from "@/lib/portal-runder/ph18-data";

export const dynamic = "force-dynamic";

export default async function PH18RunderPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [rounds, ulest] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      include: {
        course: { select: { name: true, par: true } },
        holeScores: {
          select: { holeNumber: true, par: true, strokes: true, putts: true, fairway: true, gir: true },
          orderBy: { holeNumber: "asc" },
        },
      },
    }),
    getUnreadNotifications(user.id, 1).catch(() => ({ count: 0 })),
  ]);

  const runderInn: PH18RundeInn[] = rounds.map((r) => ({
    id: r.id,
    playedAt: r.playedAt,
    score: r.score,
    courseName: r.course.name,
    coursePar: r.course.par,
    notes: r.notes,
    status: r.status,
    partialSave: r.partialSave,
    source: r.source,
    sourceDate: r.sourceDate,
    sgTotal: r.sgTotal,
    sgOtt: r.sgOtt,
    sgApp: r.sgApp,
    sgArg: r.sgArg,
    sgPutt: r.sgPutt,
    sgSource: r.sgSource,
    roundType: r.roundType,
    holeScores: r.holeScores,
  }));

  const modell = byggPH18(runderInn);
  const tilstand = modell.runder.length === 0 ? "tom" : "data";

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH18Runder
        tilstand={tilstand}
        modell={modell}
        registrerHref="/portal/mal/runder/ny"
        liveHref="/portal/runde-live"
      />
    </PlayerHQSkall>
  );
}
