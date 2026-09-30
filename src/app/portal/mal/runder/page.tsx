/**
 * PlayerHQ · Runder og statistikk (/portal/mal/runder) — Precision Athletics PH-18
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-18.jsx).
 * Auth og tilgang som før; data fra Round + HoleScore, aggregert i ph18-data.ts.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH18Runder } from "@/components/portal/precision/PH18Runder";
import { byggPH18, type PH18Model } from "@/lib/portal-runder/ph18-data";

/** Øvre grense for hvor mange runder siden regner på. Går spilleren over den, sier siden det. */
const MAKS_RUNDER = 500;

export const dynamic = "force-dynamic";
export const metadata = { title: "Runder og statistikk · PlayerHQ" };

export default async function RunderPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  let modell: PH18Model = { runder: [], hull: null, sesonger: [] };
  let feil = false;
  let uleste = 0;
  let avkortet = false;
  try {
    const [runder, dash] = await Promise.all([
      prisma.round.findMany({
        where: { userId: user.id },
        orderBy: { playedAt: "desc" },
        take: MAKS_RUNDER + 1,
        select: {
          id: true, playedAt: true, score: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, sgSource: true, roundType: true,
          status: true, partialSave: true, source: true, notes: true,
          course: { select: { name: true } },
          holeScores: { select: { holeNumber: true, par: true, strokes: true, putts: true, fairway: true, gir: true } },
        },
      }),
      getUnreadNotifications(user.id, 1).catch(() => null),
    ]);
    uleste = dash?.count ?? 0;
    avkortet = runder.length > MAKS_RUNDER;
    modell = byggPH18(runder.slice(0, MAKS_RUNDER).map((r) => ({
      id: r.id, playedAt: r.playedAt, score: r.score, courseName: r.course.name,
      sgTotal: r.sgTotal, sgOtt: r.sgOtt, sgApp: r.sgApp, sgArg: r.sgArg, sgPutt: r.sgPutt, sgSource: r.sgSource, roundType: r.roundType,
      status: r.status, partialSave: r.partialSave, source: r.source, notes: r.notes, holeScores: r.holeScores,
    })));
  } catch {
    feil = true;
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH18Runder
        tilstand={feil ? "feil" : modell.runder.length === 0 ? "tom" : "data"}
        modell={modell}
        avkortet={avkortet ? MAKS_RUNDER : undefined}
        registrerHref="/portal/mal/runder/ny"
        liveHref="/portal/runde/live"
        delHref={(id) => `/portal/statistikk/runder/${id}/del`}
        detaljHref={(id) => `/portal/mal/runder/${id}`}
      />
    </PlayerHQSkall>
  );
}
