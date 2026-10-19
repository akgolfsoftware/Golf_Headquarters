/**
 * PlayerHQ · SG-hub · Coach-modus utstyr
 * (/portal/mal/sg-hub/coach/[spillerId]/equipment).
 * Flyttet ut av (legacy) 17. juli 2026 (Team F3). Tynn wrapper: auth
 * (requirePortalUser + requireCoachForPlayer) er uendret og identisk med
 * naboruten [spillerId]/page.tsx. `EquipmentView` er flyttet hit fra spillerens
 * (legacy) equipment-side, som nå bare videresender til Meg › Utstyr. Visningen er ikke i nytt design ennå. V2Shell
 * gir chrome (naborute-mønsteret), siden ruten ikke lenger arver PortalShell
 * fra (legacy)-layouten.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { requireCoachForPlayer } from "@/lib/sg-hub/coach-access";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { prisma } from "@/lib/prisma";
import { extractClubs, extractShots } from "@/lib/sg-hub/extract-shots";
import { computeClubFit, type ClubFitReport } from "@/lib/sg-hub/equipment-fit";
import { UtstyrHelseV2 } from "@/components/portal/v2/UtstyrHelseV2";

export default async function CoachEquipmentPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const user = await requirePortalUser();
  const { spillerId } = await params;
  const { player } = await requireCoachForPlayer(user, spillerId);

  return (
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <EquipmentView
        userId={player.id}
        backHref={`/portal/mal/sg-hub/coach/${spillerId}`}
        spillerNavn={player.name}
      />
    </V2Shell>
  );
}

const CLUB_ORDER = [
  "Driver", "1W", "3W", "5W", "7W",
  "1i", "2i", "3i", "4i", "5i", "6i", "7i", "8i", "9i",
  "PW", "AW", "GW", "SW", "LW",
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

// Coachens visning av spillerens utstyr (TrackMan-baserte køllerapporter).
async function EquipmentView({
  userId,
  backHref,
  spillerNavn,
}: {
  userId: string;
  backHref: string;
  spillerNavn?: string;
}) {
  const sessions = await prisma.trackManSession.findMany({
    where: { userId },
    select: { rawJson: true },
  });

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }
  const clubs = sortClubs([...clubSet]);

  const reports: ClubFitReport[] = clubs
    .map((clubId) => {
      const shots = sessions.flatMap((s) => extractShots(s.rawJson, clubId));
      // Vi kjører fit-beregning mot første rawJson som inneholder denne køllen
      // for å lese launch/spin-felter (best-effort).
      const sourceRaw =
        sessions.find((s) => extractShots(s.rawJson, clubId).length > 0)
          ?.rawJson ?? null;
      return computeClubFit(clubId, shots, sourceRaw);
    })
    .filter((r) => r.shotCount > 0 && r.category !== "putter");

  return (
    <UtstyrHelseV2 backHref={backHref} spillerNavn={spillerNavn} reports={reports} />
  );
}
