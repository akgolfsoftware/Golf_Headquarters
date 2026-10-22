import "server-only";

import { lesNavngitteProfiler } from "@/lib/deling/profil-lesing";
import { prisma } from "@/lib/prisma";
import { hentTnArbeidskontekst, type TnArbeidskontekst, type TnBruker } from "./tn-arbeidsflate";

/** Statusordene for et trenerforslag, sett fra treneren. */
export const FORSLAG_STATUS: Record<string, string> = {
  PENDING: "Venter på spilleren",
  ACCEPTED: "Godtatt",
  PUBLISHED: "Godtatt",
  REJECTED: "Avvist",
  CONFLICT: "Planen var endret",
  CANCELLED: "Trukket tilbake",
};

export type TnTrenerprofil = {
  kontekst: TnArbeidskontekst;
  navn: string;
  epost: string | null;
  telefon: string | null;
  gruppeRolle: string | null;
  medlemSiden: Date | null;
  spillereIGruppa: number;
  delte: { id: string; navn: string }[];
  forslag: { id: string; spillerNavn: string; status: string; opprettet: Date }[];
};

/**
 * Min profil for den innloggede Team Norway-treneren (beslutninger.md §TEAM NORWAY-TRENERFLATEN
 * BYGGES I HQ). Spillerne som deler med treneren leses gjennom den navngitte delingen, som resten
 * av personlige data; gruppemedlemskap alene gir ikke innsyn. Forslag vises bare for spillere som
 * fortsatt deler. Null for spillere og for brukere uten Team Norway-tilgang.
 */
export async function hentTnTrenerprofil(bruker: TnBruker): Promise<TnTrenerprofil | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) return null;
  const gruppeId = kontekst.gruppe.id;

  const [bruk, medlem, spillereIGruppa, delte] = await Promise.all([
    prisma.user.findUnique({ where: { id: bruker.id }, select: { name: true, email: true, phone: true } }),
    prisma.groupMember.findFirst({ where: { groupId: gruppeId, userId: bruker.id, endedAt: null }, select: { role: true, joinedAt: true } }),
    prisma.groupMember.count({ where: { groupId: gruppeId, role: "PLAYER", endedAt: null } }),
    lesNavngitteProfiler(bruker.id, gruppeId, async (tx, spillerId) => {
      const spiller = await tx.user.findFirst({ where: { id: spillerId, deletedAt: null, anonymisertAt: null }, select: { name: true } });
      return spiller ? { id: spillerId, navn: spiller.name ?? "Navn mangler" } : null;
    }),
  ]);

  const navn = new Map(delte.map((d) => [d.id, d.navn]));
  const rader = navn.size === 0 ? [] : await prisma.planAction.findMany({
    where: { coachId: bruker.id, agentName: "TEAM_NORWAY_COACH", userId: { in: [...navn.keys()] } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, userId: true, status: true, createdAt: true },
  });

  return {
    kontekst,
    navn: bruk?.name ?? bruker.name ?? "Ukjent",
    epost: bruk?.email ?? null,
    telefon: bruk?.phone ?? null,
    gruppeRolle: medlem?.role ?? null,
    medlemSiden: medlem?.joinedAt ?? null,
    spillereIGruppa,
    delte: [...delte].sort((a, b) => a.navn.localeCompare(b.navn, "nb")),
    forslag: rader.map((r) => ({ id: r.id, spillerNavn: navn.get(r.userId) ?? "Ukjent", status: FORSLAG_STATUS[r.status] ?? r.status, opprettet: r.createdAt })),
  };
}
