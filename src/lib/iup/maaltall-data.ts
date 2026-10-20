import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { aktivIupTilknytningWhere, iupSynligForSpillerWhere } from "./tilknytning";
import { MAALTALL, byggMaaltall, sesongFor, type MaaltallRad, type MaaltallRunde, type Sesong } from "./maaltall";

export type IupMaaltallData = { sesong: Sesong; org: string; rader: MaaltallRad[] };

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Navnet på organisasjonen IUP-en hører til (WANG Toppidrett, WANG Ung eller Team Norway). */
function orgNavn(grupper: { program: string | null }[]): string {
  const p = new Set(grupper.map((g) => g.program));
  return p.has("WANG_TOPPIDRETT") ? "WANG Toppidrett" : p.has("WANG_UNG") ? "WANG Ung" : "Team Norway";
}

/**
 * IUP-måltallene for innlogget spiller. Null når spilleren ikke har IUP (bare aktive WANG-/TN-medlemmer,
 * Anders 04.10.2026). Bare egne runder og egne gjennomførte økter leses.
 */
export async function hentIupMaaltall(): Promise<IupMaaltallData | null> {
  const bruker = await requireSpillerActionUser();
  return hentIupMaaltallForSpiller(bruker.id);
}

/**
 * Samme måltall for en gitt spiller. Ingen innlogging sjekkes her: KALLEREN må ha kontrollert at
 * betrakteren har lov til å se spilleren (src/lib/profil-kobling/tilgang.ts). Send transaksjonen som
 * `db` når kalleren holder en delingslås, så lesingen skjer under låsen. Null uten aktiv IUP.
 * `kunDelteRunder`: for trenere. Runder merket «Bare deg» (sharedWithCoach = false) teller ikke.
 */
export async function hentIupMaaltallForSpiller(
  spillerId: string,
  db: Pick<Prisma.TransactionClient, "user" | "round" | "workbenchSession" | "iupMaaltallMal"> = prisma,
  { kunDelteRunder = false }: { kunDelteRunder?: boolean } = {},
): Promise<IupMaaltallData | null> {
  const eier = await db.user.findFirst({
    where: iupSynligForSpillerWhere(spillerId),
    select: { id: true, groupMemberships: { where: aktivIupTilknytningWhere(), select: { group: { select: { program: true } } } } },
  });
  if (!eier) return null;
  const idag = OSLO_YMD_FMT.format(new Date());
  const sesong = sesongFor(idag);
  const fra = new Date(`${sesong.start}T00:00:00Z`), til = new Date(`${sesong.slutt}T00:00:00Z`);
  const [runder, okter, mal] = await Promise.all([
    db.round.findMany({
      where: { userId: eier.id, playedAt: { gte: fra, lt: til }, playStatus: "COMPLETED", ...(kunDelteRunder ? { sharedWithCoach: true } : {}) },
      select: {
        playedAt: true, score: true, roundType: true, tournamentEntryId: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true,
        holeScores: { select: { par: true, strokes: true, firstPuttFt: true, putts: true, fairway: true, gir: true } },
      },
    }),
    db.workbenchSession.findMany({
      where: { playerId: eier.id, status: "COMPLETED", date: { gte: fra, lt: til } },
      select: { date: true, pyramid: true, actualMinutes: true, durationMinutes: true },
    }),
    db.iupMaaltallMal.findMany({ where: { userId: eier.id, sesong: sesong.navn }, select: { maaltall: true, verdi: true } }),
  ]);
  const runderUt: MaaltallRunde[] = runder.map((r) => ({
    dato: OSLO_YMD_FMT.format(r.playedAt), score: r.score, turnering: r.roundType === "turnering", konkurranseId: r.tournamentEntryId,
    sgTotal: r.sgTotal, sgOtt: r.sgOtt, sgApp: r.sgApp, sgArg: r.sgArg, sgPutt: r.sgPutt, hull: r.holeScores,
  }));
  return {
    sesong,
    org: orgNavn(eier.groupMemberships.map((m) => m.group)),
    rader: byggMaaltall({
      sesong, idag, runder: runderUt,
      okter: okter.map((o) => ({ dato: iso(o.date), fys: o.pyramid === "FYS", minutter: o.actualMinutes ?? o.durationMinutes })),
      mal: new Map(mal.map((m) => [m.maaltall, m.verdi])),
    }),
  };
}

export type IupMaaltallSammendrag = { sesong: string; medMal: number; antall: number; org: string };

/** Raden «IUP-måltall 2026/27 · 7 av 37 med mål · WANG Toppidrett» i Målsetninger. Null uten IUP. */
export async function hentIupMaaltallSammendrag(): Promise<IupMaaltallSammendrag | null> {
  const bruker = await requireSpillerActionUser();
  const eier = await prisma.user.findFirst({
    where: iupSynligForSpillerWhere(bruker.id),
    select: { id: true, groupMemberships: { where: aktivIupTilknytningWhere(), select: { group: { select: { program: true } } } } },
  });
  if (!eier) return null;
  const sesong = sesongFor(OSLO_YMD_FMT.format(new Date())).navn;
  const medMal = await prisma.iupMaaltallMal.count({ where: { userId: eier.id, sesong, maaltall: { in: MAALTALL.map((m) => m.id) } } });
  return { sesong, medMal, antall: MAALTALL.length, org: orgNavn(eier.groupMemberships.map((m) => m.group)) };
}
