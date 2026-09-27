import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import {
  OpprettUtfordringV2,
  type UtfordringDeltakerValg,
  type UtfordringOvelseValg,
} from "@/components/portal/v2/OpprettUtfordringV2";

export const dynamic = "force-dynamic";

function sorterDeltakere(a: UtfordringDeltakerValg, b: UtfordringDeltakerValg): number {
  return a.navn.localeCompare(b.navn, "nb");
}

export default async function NyUtfordringPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"], kreverTilgang: "FULL" });

  const [vennskap, egneMedlemskap, ovelser] = await Promise.all([
    prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ userAId: user.id }, { userBId: user.id }] },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } },
      },
    }),
    prisma.groupMember.findMany({
      where: { userId: user.id, endedAt: null },
      select: { groupId: true, group: { select: { name: true } } },
    }),
    prisma.exerciseDefinition.findMany({
      select: { id: true, name: true, higherIsBetter: true },
      orderBy: { name: "asc" },
      take: 80,
    }),
  ]);

  const kandidater = new Map<string, UtfordringDeltakerValg>();
  for (const vennskapRad of vennskap) {
    const annen = vennskapRad.userAId === user.id ? vennskapRad.userB : vennskapRad.userA;
    kandidater.set(annen.id, {
      id: annen.id,
      navn: annen.name ?? "(uten navn)",
      kilde: "Venn",
      detaljer: "Venn",
    });
  }

  const gruppeIder = egneMedlemskap.map((medlemskap) => medlemskap.groupId);
  if (gruppeIder.length > 0) {
    const medlemmer = await prisma.groupMember.findMany({
      where: { groupId: { in: gruppeIder }, endedAt: null, userId: { not: user.id } },
      select: {
        userId: true,
        user: { select: { id: true, name: true } },
        group: { select: { name: true } },
      },
    });
    for (const medlem of medlemmer) {
      const eksisterende = kandidater.get(medlem.userId);
      const gruppenavn = medlem.group.name;
      kandidater.set(medlem.userId, {
        id: medlem.userId,
        navn: medlem.user.name ?? "(uten navn)",
        kilde: eksisterende?.kilde === "Venn" ? "Venn" : "Gruppe",
        detaljer: eksisterende ? `${eksisterende.detaljer} · ${gruppenavn}` : gruppenavn,
      });
    }
  }

  const deltakere = [...kandidater.values()].sort(sorterDeltakere);
  const ovelseValg: UtfordringOvelseValg[] = ovelser.map((ovelse) => ({
    id: ovelse.id,
    navn: ovelse.name,
    higherIsBetter: ovelse.higherIsBetter,
  }));

  return (
    <V2Shell bredde="kolonne" aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <OpprettUtfordringV2 deltakere={deltakere} ovelser={ovelseValg} />
    </V2Shell>
  );
}
