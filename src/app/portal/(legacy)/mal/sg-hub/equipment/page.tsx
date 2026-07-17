import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { extractClubs, extractShots } from "@/lib/sg-hub/extract-shots";
import { computeClubFit, type ClubFitReport } from "@/lib/sg-hub/equipment-fit";
import { UtstyrHelseV2 } from "@/components/portal/v2/UtstyrHelseV2";

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

export default async function EquipmentPage() {
  const user = await requirePortalUser();
  return <EquipmentView userId={user.id} backHref="/portal/mal/sg-hub" />;
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
