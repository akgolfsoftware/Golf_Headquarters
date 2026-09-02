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

export type TnViewerRolle = "TRENER" | "SPILLER" | "FORESATT" | null;

/**
 * Viewerens rolle i gruppen — styrer om siden viser komponer-feltet (kun
 * TRENER) og om posten skal auto-kvitteres ved visning (SPILLER/FORESATT,
 * aldri TRENER for egen post). Returnerer null hvis viewer verken er
 * medlem eller godkjent foresatt for et medlem — samme grense som
 * `kanSeGruppepost`, men med rollen synlig for UI-et.
 */
export async function hentViewerRolleIGruppe(groupId: string, viewerId: string): Promise<TnViewerRolle> {
  const medlemskap = await prisma.groupMember.findFirst({
    where: { groupId, userId: viewerId, ...aktivtMedlemskapWhere() },
    select: { role: true },
  });
  if (medlemskap?.role === "COACH" || medlemskap?.role === "ASSISTANT") return "TRENER";
  if (medlemskap?.role === "PLAYER") return "SPILLER";

  const spillerIder = await gruppensSpillerIder(groupId);
  if (spillerIder.length === 0) return null;
  const foresattFor = await prisma.parentRelation.findFirst({
    where: { parentId: viewerId, childId: { in: spillerIder }, approved: true },
    select: { id: true },
  });
  return foresattFor ? "FORESATT" : null;
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

/**
 * Frittstående opplasting til gruppens dokumentbibliotek (TN-11 «Last opp
 * fil») — en DOKUMENT-post uten tekst, kun bærer av ett vedlegg. Filen MÅ
 * være lastet opp til bucket-en FØR dette kalles (path peker dit).
 */
export async function opprettGruppeDokument(input: {
  forfatterId: string;
  groupId: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  path: string;
}): Promise<{ id: string }> {
  const lovlig = await erAktivtMedlem(input.groupId, input.forfatterId);
  if (!lovlig) throw new Error("Du er ikke trener i denne gruppen");
  const rolle = await prisma.groupMember.findFirst({
    where: { groupId: input.groupId, userId: input.forfatterId, ...aktivtMedlemskapWhere() },
    select: { role: true },
  });
  if (rolle?.role !== "COACH" && rolle?.role !== "ASSISTANT") {
    throw new Error("Kun trenere kan laste opp dokumenter til gruppen");
  }
  return prisma.tnPost.create({
    data: {
      groupId: input.groupId,
      authorUserId: input.forfatterId,
      tekst: "",
      kind: "DOKUMENT",
      vedlegg: {
        create: { fileName: input.fileName, fileType: input.fileType, fileSize: input.fileSize, path: input.path },
      },
    },
    select: { id: true },
  });
}

export type TnDokumentRad = {
  postId: string;
  attachmentId: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  path: string;
  opplasterNavn: string;
  oppdatert: Date;
  /** «FRA POST» hvis vedlegget lå på en tekstpost, «LASTET OPP» ved frittstående opplasting. */
  kilde: "FRA_POST" | "LASTET_OPP";
  kvittering: { totalt: number; apnet: number; manglerIder: string[] };
};

/** Dokumentbiblioteket for TN-11 — alle vedlegg i gruppen, uansett kilde. */
export async function hentGruppeDokumenter(groupId: string, viewerId: string): Promise<TnDokumentRad[] | null> {
  const tidslinje = await hentGruppetidslinje(groupId, viewerId);
  if (!tidslinje) return null;

  const rader: TnDokumentRad[] = [];
  for (const post of tidslinje) {
    for (const vedlegg of post.vedlegg) {
      rader.push({
        postId: post.id,
        attachmentId: vedlegg.id,
        fileName: vedlegg.fileName,
        fileType: vedlegg.fileType,
        fileSize: vedlegg.fileSize,
        path: vedlegg.path,
        opplasterNavn: post.authorNavn,
        oppdatert: post.createdAt,
        kilde: post.kind === "DOKUMENT" ? "LASTET_OPP" : "FRA_POST",
        kvittering: post.kvittering ?? { totalt: 0, apnet: 0, manglerIder: [] },
      });
    }
  }
  return rader.sort((a, b) => b.oppdatert.getTime() - a.oppdatert.getTime());
}

export type TnPostMedKvittering = {
  id: string;
  authorUserId: string;
  authorNavn: string;
  tekst: string;
  kind: string;
  createdAt: Date;
  vedlegg: { id: string; fileName: string; fileType: string | null; fileSize: number | null; path: string }[];
  kvittering: { totalt: number; apnet: number; manglerIder: string[] } | null;
};

async function forfatterNavnPerId(authorUserIds: readonly string[]): Promise<Map<string, string>> {
  const unike = [...new Set(authorUserIds)];
  if (unike.length === 0) return new Map();
  const brukere = await prisma.user.findMany({ where: { id: { in: unike } }, select: { id: true, name: true } });
  return new Map(brukere.map((b) => [b.id, b.name ?? "Ukjent"]));
}

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
  const navn = await forfatterNavnPerId(poster.map((p) => p.authorUserId));

  return poster.map((p) => ({
    id: p.id,
    authorUserId: p.authorUserId,
    authorNavn: navn.get(p.authorUserId) ?? "Ukjent",
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

/**
 * 1:1-tidslinjen til en spiller — null hvis viewer verken er spilleren selv,
 * en godkjent foresatt, eller en trener med tilknytning til spilleren
 * (TN-10 er primært en trener-flate for å POSTE — treneren må derfor også
 * kunne se tidslinjen hen selv skriver til).
 */
export async function hentSpillerpostTidslinje(spillerId: string, viewerId: string): Promise<TnPostMedKvittering[] | null> {
  const erForesatt = viewerId === spillerId ? false : await erGodkjentForesattFor(viewerId, spillerId);
  const erTrener = viewerId === spillerId ? false : await erAktivTrenerIGruppeMedSpiller(viewerId, spillerId);
  if (
    !kanSeSpillerpost({
      viewerId,
      spillerId,
      viewerErGodkjentForesattForSpilleren: erForesatt,
      viewerErTrenerForSpilleren: erTrener,
    })
  )
    return null;

  const poster = await prisma.tnPost.findMany({
    where: { mottakerUserId: spillerId },
    orderBy: { createdAt: "desc" },
    include: { vedlegg: true, lesekvittert: { select: { userId: true } } },
  });
  const navn = await forfatterNavnPerId(poster.map((p) => p.authorUserId));

  return poster.map((p) => ({
    id: p.id,
    authorUserId: p.authorUserId,
    authorNavn: navn.get(p.authorUserId) ?? "Ukjent",
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

/**
 * IDOR-sikker inngang for «Se hvem» — slår opp posten selv, sjekker at
 * viewer har lov til å se den, og regner ut riktig mottakerliste (gruppens
 * spillere, eller den ene spilleren for 1:1-poster) FØR navn hentes.
 * Returnerer null hvis posten ikke finnes eller viewer mangler tilgang.
 */
export async function hentPostLesekvitteringNavnForViewer(
  postId: string,
  viewerId: string,
): Promise<{ apnet: { userId: string; navn: string; readAt: Date }[]; mangler: { userId: string; navn: string }[] } | null> {
  const post = await prisma.tnPost.findUnique({
    where: { id: postId },
    select: { groupId: true, mottakerUserId: true },
  });
  if (!post) return null;

  if (post.groupId) {
    const erMedlem = await erAktivtMedlem(post.groupId, viewerId);
    if (!kanSeGruppepost(erMedlem)) return null;
    const mottakerIder = await gruppensSpillerIder(post.groupId);
    return hentLesekvitteringNavn(postId, mottakerIder);
  }

  if (post.mottakerUserId) {
    const spillerId = post.mottakerUserId;
    const erForesatt = viewerId === spillerId ? false : await erGodkjentForesattFor(viewerId, spillerId);
    const erTrener = viewerId === spillerId ? false : await erAktivTrenerIGruppeMedSpiller(viewerId, spillerId);
    if (
      !kanSeSpillerpost({
        viewerId,
        spillerId,
        viewerErGodkjentForesattForSpilleren: erForesatt,
        viewerErTrenerForSpilleren: erTrener,
      })
    ) {
      return null;
    }
    return hentLesekvitteringNavn(postId, [spillerId]);
  }

  return null;
}
