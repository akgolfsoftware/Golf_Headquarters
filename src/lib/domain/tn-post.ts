/**
 * Team Norway-poster — data-tilgang (Claw batch 3, TN-09/TN-10/TN-11).
 * Reglene i seg selv (synlighet, lesekvittering-brøk) ligger i
 * `tn-post-regler.ts` og testes uten database. Mønster: src/lib/deling/samtykke.ts.
 *
 * IDOR-sikkerhet: enhver henting her tar `viewerId` og returnerer null/[]
 * hvis viewer ikke er i mottakerlista — sidene skal aldri stole på klient-
 * filtrering alene.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { aktivtMedlemskapWhere, aktivtSpillerMedlemskapWhere, aktivtTrenerMedlemskapWhere } from "@/lib/domain/grupper";
import { beregnLesekvittering, kanSeGruppepost, kanSeSpillerpost, type TnPostKind } from "@/lib/domain/tn-post-regler";

async function erAktivtMedlem(groupId: string, userId: string): Promise<boolean> {
  const rad = await prisma.groupMember.findFirst({
    where: { groupId, userId, ...aktivtMedlemskapWhere() },
    select: { id: true },
  });
  return rad !== null;
}

async function erAktivTrenerIGruppeMedSpiller(trenerId: string, spillerId: string): Promise<boolean> {
  const rad = await prisma.groupMember.findFirst({
    where: {
      ...aktivtTrenerMedlemskapWhere(trenerId),
      group: {
        members: { some: { userId: spillerId, ...aktivtSpillerMedlemskapWhere() } },
      },
    },
    select: { id: true },
  });
  return rad !== null;
}

async function erGodkjentForesattFor(viewerId: string, spillerId: string): Promise<boolean> {
  const rad = await prisma.parentRelation.findFirst({
    where: { parentId: viewerId, childId: spillerId, approved: true },
    select: { id: true },
  });
  return rad !== null;
}

/** Aktive spiller-medlemmer i gruppen — mottakerlista lesekvitteringen måles mot. */
async function gruppensSpillerIder(groupId: string): Promise<string[]> {
  const rader = await prisma.groupMember.findMany({
    where: { groupId, ...aktivtSpillerMedlemskapWhere() },
    select: { userId: true },
  });
  return rader.map((r) => r.userId);
}

export async function opprettGruppepost(input: {
  forfatterId: string;
  groupId: string;
  tekst: string;
  kind: TnPostKind;
}): Promise<{ id: string }> {
  const lovlig = await erAktivtMedlem(input.groupId, input.forfatterId);
  if (!lovlig) throw new Error("Du er ikke trener i denne gruppen");
  const rolle = await prisma.groupMember.findFirst({
    where: { groupId: input.groupId, userId: input.forfatterId, ...aktivtMedlemskapWhere() },
    select: { role: true },
  });
  if (rolle?.role !== "COACH" && rolle?.role !== "ASSISTANT") {
    throw new Error("Kun trenere kan poste til gruppen");
  }
  return prisma.tnPost.create({
    data: { groupId: input.groupId, authorUserId: input.forfatterId, tekst: input.tekst, kind: input.kind },
    select: { id: true },
  });
}

export async function opprettSpillerpost(input: {
  forfatterId: string;
  spillerId: string;
  tekst: string;
  kind: TnPostKind;
}): Promise<{ id: string }> {
  const lovlig = await erAktivTrenerIGruppeMedSpiller(input.forfatterId, input.spillerId);
  if (!lovlig) throw new Error("Du er ikke trener for denne spilleren");
  return prisma.tnPost.create({
    data: { mottakerUserId: input.spillerId, authorUserId: input.forfatterId, tekst: input.tekst, kind: input.kind },
    select: { id: true },
  });
}

export type TnPostMedKvittering = {
  id: string;
  authorUserId: string;
  tekst: string;
  kind: string;
  createdAt: Date;
  vedlegg: { id: string; fileName: string; fileType: string | null; fileSize: number | null; path: string }[];
  kvittering: { totalt: number; apnet: number; manglerIder: string[] } | null;
};

/** Gruppens tidslinje — null hvis viewer ikke er aktivt medlem (IDOR-port). */
export async function hentGruppetidslinje(groupId: string, viewerId: string): Promise<TnPostMedKvittering[] | null> {
  const erMedlem = await erAktivtMedlem(groupId, viewerId);
  if (!kanSeGruppepost(erMedlem)) return null;

  const [poster, spillerIder] = await Promise.all([
    prisma.tnPost.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
      include: { vedlegg: true, lesekvittert: { select: { userId: true } } },
    }),
    gruppensSpillerIder(groupId),
  ]);

  return poster.map((p) => ({
    id: p.id,
    authorUserId: p.authorUserId,
    tekst: p.tekst,
    kind: p.kind,
    createdAt: p.createdAt,
    vedlegg: p.vedlegg,
    kvittering: beregnLesekvittering(
      spillerIder,
      p.lesekvittert.map((k) => k.userId),
    ),
  }));
}

/** 1:1-tidslinjen til en spiller — null hvis viewer verken er spilleren selv eller godkjent foresatt. */
export async function hentSpillerpostTidslinje(spillerId: string, viewerId: string): Promise<TnPostMedKvittering[] | null> {
  const erForesatt = viewerId === spillerId ? false : await erGodkjentForesattFor(viewerId, spillerId);
  if (!kanSeSpillerpost({ viewerId, spillerId, viewerErGodkjentForesattForSpilleren: erForesatt })) return null;

  const poster = await prisma.tnPost.findMany({
    where: { mottakerUserId: spillerId },
    orderBy: { createdAt: "desc" },
    include: { vedlegg: true, lesekvittert: { select: { userId: true } } },
  });

  return poster.map((p) => ({
    id: p.id,
    authorUserId: p.authorUserId,
    tekst: p.tekst,
    kind: p.kind,
    createdAt: p.createdAt,
    vedlegg: p.vedlegg,
    kvittering: beregnLesekvittering([spillerId], p.lesekvittert.map((k) => k.userId)),
  }));
}

/** Marker en post som lest av viewer — idempotent (unique-indeks på postId+userId). */
export async function merkPostLest(postId: string, userId: string): Promise<void> {
  await prisma.tnPostLesekvittering.upsert({
    where: { postId_userId: { postId, userId } },
    create: { postId, userId },
    update: {},
  });
}

/** Navnelisten bak brøken — «Se hvem» i TN-09/TN-11. */
export async function hentLesekvitteringNavn(
  postId: string,
  mottakerIder: readonly string[],
): Promise<{ apnet: { userId: string; navn: string; readAt: Date }[]; mangler: { userId: string; navn: string }[] }> {
  const [kvitteringer, brukere] = await Promise.all([
    prisma.tnPostLesekvittering.findMany({ where: { postId }, select: { userId: true, readAt: true } }),
    prisma.user.findMany({ where: { id: { in: [...mottakerIder] } }, select: { id: true, name: true } }),
  ]);
  const navnPerId = new Map(brukere.map((b) => [b.id, b.name ?? "Ukjent"]));
  const lestPerId = new Map(kvitteringer.map((k) => [k.userId, k.readAt]));

  const apnet = [...lestPerId.entries()]
    .filter(([userId]) => mottakerIder.includes(userId))
    .map(([userId, readAt]) => ({ userId, navn: navnPerId.get(userId) ?? "Ukjent", readAt }))
    .sort((a, b) => a.readAt.getTime() - b.readAt.getTime());

  const mangler = mottakerIder
    .filter((id) => !lestPerId.has(id))
    .map((userId) => ({ userId, navn: navnPerId.get(userId) ?? "Ukjent" }));

  return { apnet, mangler };
}
