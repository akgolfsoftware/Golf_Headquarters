import "server-only";

import { prisma } from "@/lib/prisma";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { TEAM_NORWAY_SLUG } from "@/lib/domain/grupper";
import { resolveValgtCoachId } from "@/lib/domain/valgt-coach";
import { lesIupBesvarelse, type IupBesvarelse } from "./utviklingssjekk";
import { iupSynligForSpillerWhere } from "./tilknytning";
import { FIREUKER_VERSJON, fireukerNiva, fireukerRunde, isoUke, osloDag, serSvareneTekst, type FireukerRunde } from "./fireukerssjekk";

export type FireukerData = {
  runde: FireukerRunde;
  niva: "UNG" | "JUNIOR";
  prosessmal: Array<{ id: string; tittel: string }>;
  /** Gjeldende revisjon for runden (0 = ingenting lagret). Neste lagring må vise til denne. */
  revisjon: number;
  /** Siste lagrede svar i denne runden. null = ingen svar ennå. */
  lagret: { besvarelse: IupBesvarelse; levert: string | null } | null;
  /** Leverte svar forrige runde på samme nivå, til sammenligning. */
  forrige: { runde: FireukerRunde; besvarelse: IupBesvarelse } | null;
  /** Tidligere leverte runder, nyeste først. */
  historikk: Array<{ ukeFra: number; ukeTil: number; versjon: string; levert: string }>;
  /** «Anders, WANG og Team Norway ser svarene», bare de som faktisk har innsyn. */
  serSvarene: string | null;
};

const dag = (d: Date) => d.toISOString().slice(0, 10);

function siste(rader: Array<{ revisjon: number; status: string; payload: unknown; createdAt: Date }>) {
  const r = rader[0];
  if (!r) return null;
  const lest = lesIupBesvarelse(r.payload);
  return lest.ok ? { revisjon: r.revisjon, besvarelse: lest.data, createdAt: r.createdAt } : null;
}

/**
 * Alt PH-IUP-01 trenger for innlogget spiller. null = spilleren er ikke aktivt
 * medlem i WANG-/Team Norway-gruppe, og skal ikke se noe IUP (04.10.2026).
 */
export async function hentFireukerssjekk(now = new Date()): Promise<FireukerData | null> {
  const bruker = await requireSpillerActionUser();
  const spiller = await prisma.user.findFirst({ where: iupSynligForSpillerWhere(bruker.id), select: { id: true, dateOfBirth: true } });
  if (!spiller) return null;

  const idag = osloDag(now);
  const runde = fireukerRunde(idag);
  const forrigeRunde = fireukerRunde(idag, -1);
  const niva = fireukerNiva(spiller.dateOfBirth ? spiller.dateOfBirth.getUTCFullYear() : null);
  const nokkel = (r: FireukerRunde) => ({
    userId: spiller.id, type: "UTVIKLINGSSJEKK", versjon: FIREUKER_VERSJON, niva,
    periodeStart: new Date(`${r.periodeStart}T00:00:00.000Z`), periodeSlutt: new Date(`${r.periodeSlutt}T00:00:00.000Z`),
  });
  const revisjonUtvalg = { orderBy: { revisjon: "desc" as const }, take: 1, select: { revisjon: true, status: true, payload: true, createdAt: true } };

  const [mal, denne, forrige, leverte, coachId, delinger] = await Promise.all([
    prisma.goal.findMany({ where: { userId: spiller.id, category: "PROCESS", status: "ACTIVE" }, select: { id: true, title: true }, orderBy: { createdAt: "asc" }, take: 10 }),
    prisma.iupBesvarelse.findUnique({ where: { userId_type_versjon_niva_periodeStart_periodeSlutt: nokkel(runde) }, include: { revisjoner: revisjonUtvalg } }),
    prisma.iupBesvarelse.findUnique({ where: { userId_type_versjon_niva_periodeStart_periodeSlutt: nokkel(forrigeRunde) }, include: { revisjoner: { ...revisjonUtvalg, where: { status: "LEVERT" } } } }),
    prisma.iupBesvarelse.findMany({
      where: { userId: spiller.id, type: "UTVIKLINGSSJEKK", levertRevisjon: { not: null } },
      select: { versjon: true, periodeStart: true, periodeSlutt: true, updatedAt: true },
      orderBy: { periodeStart: "desc" }, take: 12,
    }),
    resolveValgtCoachId(spiller.id),
    prisma.trenerDelingsInvitasjon.findMany({ where: { userId: spiller.id, acceptedAt: { not: null }, revokedAt: null }, select: { mottakerGruppeId: true } }),
  ]);

  const [coach, grupper] = await Promise.all([
    coachId ? prisma.user.findUnique({ where: { id: coachId }, select: { name: true } }) : Promise.resolve(null),
    delinger.length
      ? prisma.group.findMany({ where: { id: { in: delinger.map((d) => d.mottakerGruppeId) }, arkivertAt: null }, select: { program: true, slug: true } })
      : Promise.resolve([]),
  ]);
  const seere = [
    coach?.name?.split(" ")[0] ?? "",
    grupper.some((g) => g.program === "WANG_UNG" || g.program === "WANG_TOPPIDRETT") ? "WANG" : "",
    grupper.some((g) => g.slug === TEAM_NORWAY_SLUG) ? "Team Norway" : "",
  ];

  const denneSiste = denne ? siste(denne.revisjoner) : null;
  const forrigeLevert = forrige ? siste(forrige.revisjoner) : null;
  return {
    runde, niva,
    prosessmal: mal.map((m) => ({ id: m.id, tittel: m.title })),
    revisjon: denne?.revisjon ?? 0,
    lagret: denneSiste ? {
      besvarelse: denneSiste.besvarelse,
      levert: denneSiste.besvarelse.status === "LEVERT" ? dag(denneSiste.createdAt) : null,
    } : null,
    forrige: forrigeLevert ? { runde: forrigeRunde, besvarelse: forrigeLevert.besvarelse } : null,
    historikk: leverte
      .filter((r) => dag(r.periodeStart) !== runde.periodeStart)
      .map((r) => ({ ukeFra: isoUke(r.periodeStart.getTime()), ukeTil: isoUke(r.periodeSlutt.getTime()), versjon: r.versjon, levert: dag(r.updatedAt) })),
    serSvarene: serSvareneTekst(seere),
  };
}
