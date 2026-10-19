/**
 * PlayerHQ · SG-hub · Coach-modus spilleroversikt
 * (/portal/mal/sg-hub/coach/[spillerId]) — Precision Athletics (PHSgHubCoach, 19.10.2026; før v2).
 * v2-port 17. juli 2026 (Team D3): `CoachSgHubSpillerV2` erstatter hybrid-
 * designet, ruten flyttet ut av (legacy). Auth (requireCoachForPlayer),
 * TrackMan-queries, extractClubs og kølle-sorteringen er uendret — kun
 * presentasjonslaget er nytt. ELITE vises fortsatt aldri (mappes til PRO).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { extractClubs } from "@/lib/sg-hub/extract-shots";
import { requireCoachForPlayer } from "@/lib/sg-hub/coach-access";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHSgHubCoachSpiller, type PHSgHubCoachSpillerData } from "@/components/portal/precision/PHSgHubCoach";

const CLUB_ORDER = [
  "Driver", "1W", "3W", "5W", "7W",
  "1i", "2i", "3i", "4i", "5i", "6i", "7i", "8i", "9i",
  "PW", "AW", "GW", "SW", "LW", "PT",
];

function sortClubs(clubs: string[]): string[] {
  return [...clubs].sort((a, b) => {
    const ai = CLUB_ORDER.indexOf(a);
    const bi = CLUB_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default async function CoachHubPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const user = await requirePortalUser();
  const { spillerId } = await params;
  const { player } = await requireCoachForPlayer(user, spillerId);

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: player.id },
    select: { rawJson: true },
  });

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }
  const clubs = sortClubs([...clubSet]);

  const data: PHSgHubCoachSpillerData = {
    spillerNavn: player.name,
    antallOkter: sessions.length,
    // ELITE er et dødt enum — vises aldri i UI (mappes til PRO som før).
    tierLabel: player.tier === "ELITE" ? "PRO" : player.tier,
    klubber: clubs,
    baseHref: `/portal/mal/sg-hub/coach/${spillerId}`,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PHSgHubCoachSpiller data={data} />
    </PlayerHQSkall>
  );
}
