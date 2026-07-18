"use server";

/**
 * Server actions for Venner (B39, Strava-mønsteret).
 *
 * Friendship-modellen er ikke ordnet (userAId/userBId har ingen kanonisk
 * rekkefølge) — konvensjonen her er: userA = den som SENDTE forespørselen,
 * userB = mottaker. status er PENDING | ACCEPTED (fri-tekst i skjema).
 *
 * Personvern (B39/B29): venner ser KUN at en økt skjedde (se
 * hentVennFeed/hentVennProfil) — aldri plan, fagkoder eller coach-notater.
 * Økt-synlighet er opt-in per spiller (preferences.venneOktSynlig).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import { translateMiljo, translatePraksistype } from "@/lib/portal/translate-taxonomy";

const VENN_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  hcp: true,
} as const;

type VennBasis = { id: string; name: string; avatarUrl: string | null; hcp: number | null };

async function medKategori<T extends { id: string; hcp: number | null }>(
  brukere: T[],
): Promise<Array<T & { kategori: string | null }>> {
  return Promise.all(
    brukere.map(async (b) => ({
      ...b,
      kategori: await hentSpillerAkKategori(b.id, { hcp: b.hcp }),
    })),
  );
}

export type VennRad = {
  id: string;
  name: string;
  avatarUrl: string | null;
  hcp: number | null;
  kategori: string | null;
};

export type VenneforesporselRad = {
  friendshipId: string;
  bruker: VennRad;
};

export type VennerData = {
  venner: VennRad[];
  innkommende: VenneforesporselRad[];
  utgaende: VenneforesporselRad[];
};

export async function hentVennerData(): Promise<VennerData> {
  const me = await requirePortalUser();

  const rader = await prisma.friendship.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: {
      userA: { select: VENN_SELECT },
      userB: { select: VENN_SELECT },
    },
    orderBy: { createdAt: "desc" },
  });

  const venner: VennBasis[] = [];
  const innkommendeRaa: { friendshipId: string; bruker: VennBasis }[] = [];
  const utgaendeRaa: { friendshipId: string; bruker: VennBasis }[] = [];

  for (const rad of rader) {
    const erA = rad.userAId === me.id;
    const motpart = erA ? rad.userB : rad.userA;
    if (rad.status === "ACCEPTED") {
      venner.push(motpart);
    } else if (rad.status === "PENDING") {
      if (erA) {
        utgaendeRaa.push({ friendshipId: rad.id, bruker: motpart });
      } else {
        innkommendeRaa.push({ friendshipId: rad.id, bruker: motpart });
      }
    }
  }

  const vennerMedKategori = await medKategori(venner);
  const innkommendeMedKategori = await Promise.all(
    innkommendeRaa.map(async (r) => ({
      friendshipId: r.friendshipId,
      bruker: (await medKategori([r.bruker]))[0],
    })),
  );
  const utgaendeMedKategori = await Promise.all(
    utgaendeRaa.map(async (r) => ({
      friendshipId: r.friendshipId,
      bruker: (await medKategori([r.bruker]))[0],
    })),
  );

  return {
    venner: vennerMedKategori,
    innkommende: innkommendeMedKategori,
    utgaende: utgaendeMedKategori,
  };
}

export type SokResultat = VennRad;

export async function sokSpillere(query: string): Promise<SokResultat[]> {
  const me = await requirePortalUser();
  const q = query.trim();
  if (q.length < 2) return [];

  const eksisterende = await prisma.friendship.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    select: { userAId: true, userBId: true },
  });
  const kjenteIder = new Set<string>([me.id]);
  for (const r of eksisterende) {
    kjenteIder.add(r.userAId);
    kjenteIder.add(r.userBId);
  }

  const treff = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      deletedAt: null,
      id: { notIn: Array.from(kjenteIder) },
      name: { contains: q, mode: "insensitive" },
    },
    select: VENN_SELECT,
    take: 8,
    orderBy: { name: "asc" },
  });

  return medKategori(treff);
}

export type SendVenneforesporselResult =
  | { ok: true }
  | { ok: false; error: "ugyldig" | "seg-selv" | "finnes-allerede" };

export async function sendVenneforesporsel(
  targetUserId: string,
): Promise<SendVenneforesporselResult> {
  const me = await requirePortalUser();
  if (!targetUserId) return { ok: false, error: "ugyldig" };
  if (targetUserId === me.id) return { ok: false, error: "seg-selv" };

  const eksisterende = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: me.id, userBId: targetUserId },
        { userAId: targetUserId, userBId: me.id },
      ],
    },
    select: { id: true },
  });
  if (eksisterende) return { ok: false, error: "finnes-allerede" };

  await prisma.friendship.create({
    data: { userAId: me.id, userBId: targetUserId, status: "PENDING" },
  });

  revalidatePath("/portal/venner");
  return { ok: true };
}

export type SvarPaVenneforesporselResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not-found" };

export async function svarPaVenneforesporsel(
  friendshipId: string,
  svar: "godkjenn" | "avslaa",
): Promise<SvarPaVenneforesporselResult> {
  const me = await requirePortalUser();

  const rad = await prisma.friendship.findUnique({
    where: { id: friendshipId },
    select: { userAId: true, userBId: true, status: true },
  });
  if (!rad) return { ok: false, error: "not-found" };
  // Kun mottakeren (userB) kan svare på en innkommende forespørsel.
  if (rad.userBId !== me.id || rad.status !== "PENDING") {
    return { ok: false, error: "unauthorized" };
  }

  if (svar === "godkjenn") {
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });
  } else {
    await prisma.friendship.delete({ where: { id: friendshipId } });
  }

  revalidatePath("/portal/venner");
  return { ok: true };
}

export type FjernVennResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not-found" };

/** Fjerner en venn (ACCEPTED) eller trekker tilbake en utgående forespørsel (PENDING). */
export async function fjernVenn(friendshipId: string): Promise<FjernVennResult> {
  const me = await requirePortalUser();

  const rad = await prisma.friendship.findUnique({
    where: { id: friendshipId },
    select: { userAId: true, userBId: true },
  });
  if (!rad) return { ok: false, error: "not-found" };
  if (rad.userAId !== me.id && rad.userBId !== me.id) {
    return { ok: false, error: "unauthorized" };
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });

  revalidatePath("/portal/venner");
  revalidatePath(`/portal/venner/${rad.userAId === me.id ? rad.userBId : rad.userAId}`);
  return { ok: true };
}

/** Samme som fjernVenn, men slår opp friendshipId via den andre brukerens id — for venn-profilsiden, som ikke har friendshipId tilgjengelig. */
export async function fjernVennViaBrukerId(vennUserId: string): Promise<FjernVennResult> {
  const me = await requirePortalUser();

  const rad = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: me.id, userBId: vennUserId },
        { userAId: vennUserId, userBId: me.id },
      ],
    },
    select: { id: true },
  });
  if (!rad) return { ok: false, error: "not-found" };

  await prisma.friendship.delete({ where: { id: rad.id } });

  revalidatePath("/portal/venner");
  revalidatePath(`/portal/venner/${vennUserId}`);
  return { ok: true };
}

/* ── Venn-profil: hero + privacy-safe økt-feed ──────────────────────── */

export type VennFeedElement = {
  id: string;
  slag: "runde" | "okt";
  tittel: string;
  detalj: string;
  dato: string; // ISO
};

export type VennProfilData = {
  venn: VennRad;
  erVenn: boolean;
  synligAv: boolean;
  feed: VennFeedElement[];
};

/**
 * Henter en venns profil + aktivitetsfeed. Returnerer null hvis det ikke
 * finnes noe ACCEPTED venneforhold mellom innlogget bruker og vennUserId —
 * ruten skal da 404, ikke lekke at brukeren finnes.
 */
export async function hentVennProfil(vennUserId: string): Promise<VennProfilData | null> {
  const me = await requirePortalUser();
  if (vennUserId === me.id) return null;

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { userAId: me.id, userBId: vennUserId },
        { userAId: vennUserId, userBId: me.id },
      ],
    },
    select: { id: true },
  });
  if (!friendship) return null;

  const vennBruker = await prisma.user.findUnique({
    where: { id: vennUserId },
    select: { ...VENN_SELECT, preferences: true },
  });
  if (!vennBruker) return null;

  const kategori = await hentSpillerAkKategori(vennBruker.id, { hcp: vennBruker.hcp });
  const venn: VennRad = {
    id: vennBruker.id,
    name: vennBruker.name,
    avatarUrl: vennBruker.avatarUrl,
    hcp: vennBruker.hcp,
    kategori,
  };

  const synligAv = lesPreferences(vennBruker).venneOktSynlig;
  if (!synligAv) {
    return { venn, erVenn: true, synligAv: false, feed: [] };
  }

  const [runder, okter] = await Promise.all([
    prisma.round.findMany({
      where: { userId: vennUserId },
      select: {
        id: true,
        playedAt: true,
        roundType: true,
        course: { select: { name: true } },
      },
      orderBy: { playedAt: "desc" },
      take: 10,
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: vennUserId, status: "COMPLETED" },
      select: {
        id: true,
        startTime: true,
        practiceType: true,
        miljo: true,
      },
      orderBy: { startTime: "desc" },
      take: 10,
    }),
  ]);

  const feed: VennFeedElement[] = [
    ...runder.map((r) => ({
      id: `runde-${r.id}`,
      slag: "runde" as const,
      tittel: r.roundType === "turnering" ? "Spilte en turneringsrunde" : "Spilte en runde",
      detalj: r.course.name,
      dato: r.playedAt.toISOString(),
    })),
    ...okter.map((o) => ({
      id: `okt-${o.id}`,
      slag: "okt" as const,
      tittel: `Fullførte ${translatePraksistype(o.practiceType).toLowerCase()}-økt`,
      detalj: translateMiljo(o.miljo),
      dato: o.startTime.toISOString(),
    })),
  ].sort((a, b) => new Date(b.dato).getTime() - new Date(a.dato).getTime());

  return { venn, erVenn: true, synligAv: true, feed };
}
