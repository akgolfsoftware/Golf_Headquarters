import "server-only";

import { prisma } from "@/lib/prisma";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { erTnPersonligDataLeser, hentTnArbeidskontekst, medTnSpillerData, type TnArbeidskontekst, type TnBruker } from "./tn-arbeidsflate";
import { tilWagrId } from "./tn-iup-oversikt-regler";

export * from "./tn-iup-oversikt-regler";

export type TnWagrPlass = { plass: number | null; dato: Date };

/**
 * Offentlig WAGR-plass for en HQ-spiller: `users.publicPlayerId` → `public_players."wagrId"` →
 * `wagr_ref_players` (#1594). WAGR er offentlig (beslutninger.md §SPILLERLISTEN I TEAM NORWAY
 * VISER DE ÅPNE TALLENE), men kalles bare etter at kalleren har sjekket at treneren hører til gruppa.
 * Null når spilleren ikke er koblet, eller pipelines ikke har skrevet spilleren ennå.
 */
async function hentWagrPlass(spillerId: string): Promise<TnWagrPlass | null> {
  const u = await prisma.user.findUnique({ where: { id: spillerId }, select: { publicPlayer: { select: { wagrId: true } } } });
  const wagrId = tilWagrId(u?.publicPlayer?.wagrId);
  if (wagrId === null) return null;
  const rad = await prisma.wagrRefPlayer.findUnique({ where: { wagrPlayerId: wagrId }, select: { rank: true, wagrDate: true } });
  return rad ? { plass: rad.rank, dato: rad.wagrDate } : null;
}

export type TnIupLaast = { kontekst: TnArbeidskontekst; navn: string; klubb: string | null; fodselsaar: number | null; wagr: TnWagrPlass | null };

/**
 * Låst IUP: treneren er i Team Norway-gruppa, spilleren er aktivt medlem der, men har ikke delt.
 * Gir bare navn, klubb, fødselsår og offentlig WAGR-plass (beslutningene 22.10), aldri noe annet fra PlayerHQ.
 * Null når treneren ikke er trener i gruppa eller spilleren ikke er medlem (da blir det 404).
 */
export async function hentTnIupLaast(bruker: TnBruker, spillerId: string): Promise<TnIupLaast | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller || !erTnPersonligDataLeser(kontekst, bruker)) return null;
  const medlem = await prisma.groupMember.findFirst({
    where: { groupId: kontekst.gruppe.id, userId: spillerId, ...aktivtSpillerMedlemskapWhere(), user: { deletedAt: null, anonymisertAt: null } },
    select: { user: { select: { name: true, homeClub: true, dateOfBirth: true } } },
  });
  if (!medlem) return null;
  return {
    kontekst,
    navn: medlem.user.name ?? "Ukjent",
    klubb: medlem.user.homeClub,
    fodselsaar: medlem.user.dateOfBirth ? medlem.user.dateOfBirth.getUTCFullYear() : null,
    wagr: await hentWagrPlass(spillerId),
  };
}

export type TnIupTurnering = { navn: string; dato: Date; merke: string };

export type TnIupDelt = {
  wagr: TnWagrPlass | null;
  nesteTurneringer: TnIupTurnering[];
  avslatteForslag: { avslatt: Date }[];
};

const STATUS: Record<string, string> = { PLANNED: "Planlagt", CLAIMED_REGISTERED: "Meldt på", CONFIRMED: "Bekreftet" };

/**
 * Det Oversikt trenger utover TN-02-dataene: neste tre turneringer i planen, forslag spilleren
 * har avslått siste 14 dager, og WAGR-plassen. Leses innenfor delingslåsen.
 */
export async function hentTnIupDelt(bruker: TnBruker, spillerId: string, naa = new Date()): Promise<TnIupDelt | null> {
  const iDag = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth(), naa.getUTCDate()));
  const data = await medTnSpillerData(bruker, spillerId, async (tx, tilgang) => {
    const [paameldinger, avslatt] = await Promise.all([
      tx.tournamentEntry.findMany({
        where: {
          userId: tilgang.spillerId,
          entryStatus: { in: ["PLANNED", "CLAIMED_REGISTERED", "CONFIRMED"] },
          OR: [{ tournament: { startDate: { gte: iDag } } }, { wagrPlanEvent: { startDate: { gte: iDag } } }, { tournamentId: null, wagrPlanEventId: null, manualDate: { gte: iDag } }],
        },
        select: { entryStatus: true, manualName: true, manualDate: true, tournament: { select: { name: true, startDate: true } }, wagrPlanEvent: { select: { name: true, startDate: true } } },
      }),
      tx.planAction.findMany({
        where: { userId: tilgang.spillerId, actionType: "WORKBENCH_COACH_PROPOSAL", status: "REJECTED", decidedAt: { gte: new Date(naa.getTime() - 14 * 864e5) } },
        orderBy: { decidedAt: "desc" },
        select: { decidedAt: true },
      }),
    ]);
    const nesteTurneringer = paameldinger
      .flatMap((p) => {
        const navn = p.tournament?.name ?? p.wagrPlanEvent?.name ?? p.manualName;
        const dato = p.tournament?.startDate ?? p.wagrPlanEvent?.startDate ?? p.manualDate;
        return navn && dato ? [{ navn, dato, merke: STATUS[p.entryStatus] ?? p.entryStatus }] : [];
      })
      .sort((a, b) => a.dato.getTime() - b.dato.getTime())
      .slice(0, 3);
    return { nesteTurneringer, avslatteForslag: avslatt.flatMap((a) => (a.decidedAt ? [{ avslatt: a.decidedAt }] : [])) };
  });
  if (!data) return null;
  return { ...data, wagr: await hentWagrPlass(spillerId) };
}
