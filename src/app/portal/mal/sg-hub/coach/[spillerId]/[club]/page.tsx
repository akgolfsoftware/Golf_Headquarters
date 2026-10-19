/**
 * PlayerHQ · SG-hub · Coach-modus per-kølle analyse
 * (/portal/mal/sg-hub/coach/[spillerId]/[club]) — Precision Athletics (PHSgHubCoach, 19.10.2026; før v2).
 * v2-port 17. juli 2026 (Team D3): `CoachSgHubKolleV2` erstatter hybrid-
 * designet, ruten flyttet ut av (legacy). Auth (requireCoachForPlayer),
 * TrackMan-queries, extractShots og hele analyse-kjeden (computeDPlane/
 * computeStrikePattern/computeSmashCurve) er uendret — kun presentasjons-
 * laget er nytt. Enkel/Avansert-preferansen (lesPreferences) leses som før;
 * veksleren (tidligere i sg-hub-layouten) rendres nå i skjermen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { extractShots } from "@/lib/sg-hub/extract-shots";
import { computeDPlane, DPLANE_LABELS } from "@/lib/sg-hub/d-plane";
import { computeStrikePattern } from "@/lib/sg-hub/strike-pattern";
import { computeSmashCurve } from "@/lib/sg-hub/smash-curve";
import { requireCoachForPlayer } from "@/lib/sg-hub/coach-access";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHSgHubCoachKolle, type PHSgHubCoachKolleData } from "@/components/portal/precision/PHSgHubCoach";

function grader(v: number): string {
  return `${v.toFixed(1).replace(".", ",")}°`;
}

export default async function CoachClubDetailPage({
  params,
}: {
  params: Promise<{ spillerId: string; club: string }>;
}) {
  const user = await requirePortalUser();
  const { sgHubMode } = lesPreferences(user);
  const { spillerId, club } = await params;
  const { player } = await requireCoachForPlayer(user, spillerId);
  const decoded = decodeURIComponent(club);
  const advanced = sgHubMode === "advanced";

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: player.id },
    select: { id: true, rawJson: true, recordedAt: true },
    orderBy: { recordedAt: "desc" },
  });

  const allShots = sessions.flatMap((s) => extractShots(s.rawJson, decoded));
  const backHref = `/portal/mal/sg-hub/coach/${spillerId}`;

  if (allShots.length === 0) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
        <PHSgHubCoachKolle backHref={backHref} data={{ tom: true, spillerNavn: player.name, kolle: decoded }} />
      </PlayerHQSkall>
    );
  }

  const dPlane = computeDPlane(allShots);
  const strike = computeStrikePattern(allShots);
  const smash = computeSmashCurve(allShots);

  const data: PHSgHubCoachKolleData = {
    spillerNavn: player.name,
    kolle: decoded,
    antallSlag: allShots.length,
    antallOkter: sessions.length,
    advanced,
    dplaneLabel: DPLANE_LABELS[dPlane.dominantClass],
    dplaneKonsistensPct: dPlane.consistencyPct,
    sweetPct: strike.sweetPct,
    avgSmash: strike.avgSmash,
    optimumSpeed: smash.optimumSpeed,
    aboveOptimumPct: smash.aboveOptimumPct,
    dplane: dPlane,
    strike,
    smash,
    skudd: allShots.map((s) => ({
      nr: s.shotNumber,
      face: grader(s.faceAngle),
      path: grader(s.clubPath),
      smash: s.smashFactor.toFixed(2).replace(".", ","),
      clubSpeed: `${s.clubSpeed.toFixed(1).replace(".", ",")} mph`,
      ballSpeed: `${s.ballSpeed.toFixed(1).replace(".", ",")} mph`,
      lengde: String(Math.round(s.totalDistance)),
    })),
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PHSgHubCoachKolle backHref={backHref} data={data} />
    </PlayerHQSkall>
  );
}
