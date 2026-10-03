import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { extractClubs, extractShots } from "@/lib/sg-hub/extract-shots";
import { computeClubFit, type ClubFitReport } from "@/lib/sg-hub/equipment-fit";
import { UtstyrHelseV2 } from "@/components/portal/v2/UtstyrHelseV2";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17Ramme, PH17Utstyr } from "@/components/portal/precision/PH17TrackMan";

export const dynamic = "force-dynamic";

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

/**
 * Spillerens egen visning: Precision Athletics PH-17, fane Utstyr (Claude Design 7d7c2994).
 * Coach-visningen (EquipmentView under) beholder skallet sitt.
 */
export default async function EquipmentPage() {
  const user = await requirePortalUser();
  const [reports, uleste] = await Promise.all([
    hentReports(user.id).catch((): ClubFitReport[] | null => null),
    getUnreadNotifications(user.id, 1).then((d) => d?.count ?? 0).catch(() => 0),
  ]);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH17Ramme aktiv="utstyr" tilstand={reports ? "data" : "feil"}>
        {reports && <PH17Utstyr reports={reports} />}
      </PH17Ramme>
    </PlayerHQSkall>
  );
}

async function hentReports(userId: string): Promise<ClubFitReport[]> {
  const sessions = await prisma.trackManSession.findMany({
    where: { userId },
    select: { rawJson: true },
  });

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }
  const clubs = sortClubs([...clubSet]);

  return clubs
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
}

// Felles visning — gjenbrukt av coach-proxy-ruten.
export async function EquipmentView({
  userId,
  backHref,
  spillerNavn,
}: {
  userId: string;
  backHref: string;
  spillerNavn?: string;
}) {
  const reports = await hentReports(userId);
  return (
    <UtstyrHelseV2 backHref={backHref} spillerNavn={spillerNavn} reports={reports} />
  );
}
