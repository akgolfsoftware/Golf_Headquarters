/**
 * Profil-flatens ekstra data (W3).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-profil.html
 *
 * hentProfil() i /portal/meg/actions eier User-feltene — denne fila henter
 * kun det fasiten trenger i tillegg: medlemsskap (stall-tag), runder i år,
 * NGF/Golfbox-ID via PublicPlayer-koblingen og aktivt handicap-mål.
 *
 * Vedtak (manifest-w3-komplett.md): HCP er LESEFELT — eies av forbundet.
 * Ingen Golfbox-sync finnes i appen i dag, så flaten viser aldri «hentet
 * fra Golfbox» som påstand: tallet er det som står på User, lesefeltet
 * håndhever bare at det ikke redigeres her.
 */

import { prisma } from "@/lib/prisma";

export type ProfilEkstra = {
  /** «Spiller siden mars 2024» — måned + år fra User.createdAt (Oslo). */
  spillerSiden: string;
  /** Navn på stallen/gruppa spilleren er medlem av, eller null. */
  stallNavn: string | null;
  /** Runder logget i appen i inneværende år. */
  runderIAar: number;
  /** NGF/Golfbox-ID fra PublicPlayer-koblingen, eller null (ikke koblet). */
  ngfId: string | null;
  /** Aktivt handicap-mål (Goal type HCP_TARGET) — vises, redigeres i Workbench. */
  hcpMaal: { verdi: number | null; tittel: string; innen: string | null } | null;
};

const MND_FMT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  month: "long",
  year: "numeric",
});

export async function hentProfilEkstra(
  userId: string,
  now = new Date(),
): Promise<ProfilEkstra> {
  const aar = Number(
    new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", year: "numeric" }).format(now),
  );

  const [bruker, medlem, runderIAar, hcpGoal] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, publicPlayerId: true },
    }),
    prisma.groupMember.findFirst({
      where: { userId },
      orderBy: { joinedAt: "desc" },
      select: { group: { select: { name: true } } },
    }),
    prisma.round.count({
      where: { userId, playedAt: { gte: new Date(Date.UTC(aar, 0, 1)) } },
    }),
    prisma.goal.findFirst({
      where: { userId, type: "HCP_TARGET", status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: { title: true, targetValue: true, targetDate: true },
    }),
  ]);

  const publicPlayer = bruker?.publicPlayerId
    ? await prisma.publicPlayer.findUnique({
        where: { id: bruker.publicPlayerId },
        select: { ngfId: true },
      })
    : null;

  return {
    spillerSiden: bruker ? MND_FMT.format(bruker.createdAt) : "",
    stallNavn: medlem?.group.name ?? null,
    runderIAar,
    ngfId: publicPlayer?.ngfId ?? null,
    hcpMaal: hcpGoal
      ? {
          verdi: hcpGoal.targetValue,
          tittel: hcpGoal.title,
          innen: hcpGoal.targetDate ? MND_FMT.format(hcpGoal.targetDate) : null,
        }
      : null,
  };
}

/**
 * Ufullstendig-tilstanden (fasit): profilen fungerer uten disse, men coachen
 * mangler noe. Ren funksjon — samme tre felter som fasitens banner nevner.
 */
export function manglendeProfilFelter(input: {
  dateOfBirth: Date | null;
  homeClub: string | null;
  ambition: string | null;
}): string[] {
  const mangler: string[] = [];
  if (!input.dateOfBirth) mangler.push("fødselsdato");
  if (!input.homeClub?.trim()) mangler.push("klubb");
  if (!input.ambition?.trim()) mangler.push("målsetting");
  return mangler;
}
