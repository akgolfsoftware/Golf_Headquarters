/**
 * PH-24d Utfordringer — liste, Precision Athletics (Claude Design 7d7c2994).
 * Utfordringer der brukeren er eier eller deltaker. Utfordringer teller ikke som trening.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24dListe, type PH24dKort, type PH24dTilstand } from "@/components/portal/precision/PH24dUtfordringer";
import { datoKort, plassTekst } from "@/lib/portal/utfordring-visning";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utfordringer · PlayerHQ" };

export default async function UtfordringerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  let tilstand: PH24dTilstand = "data";
  let uleste = 0;
  let aktive: PH24dKort[] = [];
  let avsluttede: PH24dKort[] = [];
  try {
    const [utfordringer, antallUleste] = await Promise.all([
      prisma.drillChallenge.findMany({
        where: { OR: [{ ownerId: user.id }, { participants: { some: { userId: user.id } } }] },
        include: { participants: { select: { userId: true, rank: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);
    uleste = antallUleste;
    const tilKort = (u: (typeof utfordringer)[number]): PH24dKort => ({
      id: u.id,
      navn: u.name,
      antall: u.participants.length,
      avsluttet: u.status === "ENDED",
      slutter: datoKort(u.endAt),
      minPlass: plassTekst(u.participants.find((p) => p.userId === user.id)?.rank),
    });
    aktive = utfordringer.filter((u) => u.status === "ACTIVE").map(tilKort);
    avsluttede = utfordringer.filter((u) => u.status === "ENDED").map(tilKort);
  } catch {
    tilstand = "feil";
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH24dListe tilstand={tilstand} aktive={aktive} avsluttede={avsluttede} />
    </PlayerHQSkall>
  );
}
