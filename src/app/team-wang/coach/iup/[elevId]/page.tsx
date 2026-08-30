import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertBarnTilhorerForelder } from "@/lib/forelder";
import { kanSeIup } from "@/lib/auth/spiller-side-tilgang";
import { IupSamtale, type IupPeriode, type IupMaaling } from "./iup-samtale";

/**
 * IUP-samtalen for én elev. Åpnet uten rollesperre 15.08.2026 («pr nå»,
 * MIDLERTIDIG) og aldri satt tilbake — enhver innlogget bruker, også en
 * vanlig spiller, kunne fram til 30.08.2026 lese vurderinger om en navngitt
 * mindreårig. Rettet (arkitektur-kartlegging §To sikkerhetsfunn, Anders'
 * beslutning 30.08: rollesperre + elev og foresatt): ADMIN/COACH ser alle
 * elever, eleven selv ser egen IUP, og en foresatt ser IUP for barn koblet
 * via `ParentRelation`. Alle andre får notFound(). Skjermen er fortsatt delt
 * mellom elev og trener i samme rom, derfor står egenvurdering og
 * trenervurdering side om side i stedet for i hver sin visning.
 */
export const dynamic = "force-dynamic";

const GRUPPE_NAVN = "WANG Toppidrett Fredrikstad";

const FASE_NAVN: Record<string, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};

function osloIdag(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(
    new Date(),
  );
}
function osloDato(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(
    d,
  );
}

export default async function IupPage({
  params,
}: {
  params: Promise<{ elevId: string }>;
}) {
  const { elevId } = await params;

  const bruker = await requirePortalUser({
    allow: ["ADMIN", "COACH", "PLAYER", "PARENT"],
    redirectTo: "/team-wang/logg-inn",
    kreverTilgang: "INGEN",
  });

  const erForesattTilEleven =
    bruker.role === "PARENT" && (await assertBarnTilhorerForelder(bruker.id, elevId));
  if (!kanSeIup(bruker, elevId, erForesattTilEleven)) notFound();

  const elev = await prisma.user.findUnique({
    where: { id: elevId },
    select: { id: true, name: true, email: true },
  });
  if (!elev) notFound();

  const gruppe = await prisma.group.findFirst({
    where: { name: GRUPPE_NAVN },
    select: { id: true },
  });
  if (!gruppe) notFound();

  const blokker = await prisma.groupPeriodBlock.findMany({
    where: { groupId: gruppe.id },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      lPhase: true,
      startDate: true,
      endDate: true,
      focus: true,
    },
  });

  const idag = osloIdag();
  const perioder: IupPeriode[] = blokker.map((b) => ({
    id: b.id,
    navn: FASE_NAVN[b.lPhase] ?? b.lPhase,
    startIso: osloDato(b.startDate),
    sluttIso: osloDato(b.endDate),
    fokus: b.focus,
  }));

  // Perioden som avsluttes = den vi står i nå (eller den siste som er passert).
  const naaIdx = perioder.findIndex(
    (p) => idag >= p.startIso && idag <= p.sluttIso,
  );
  const avsluttendeIdx =
    naaIdx >= 0
      ? naaIdx
      : Math.max(0, perioder.filter((p) => p.sluttIso < idag).length - 1);
  const avsluttende = perioder[avsluttendeIdx] ?? null;
  const neste = perioder[avsluttendeIdx + 1] ?? null;

  const maal = await prisma.groupPeriodGoal.findMany({
    where: { userId: elevId, periodBlockId: { in: perioder.map((p) => p.id) } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      periodBlockId: true,
      akse: true,
      tittel: true,
      egentidMinUke: true,
      maalemetode: true,
      status: true,
      egenvurdering: true,
      trenervurdering: true,
      kommentar: true,
    },
  });

  // Målinger siden forrige samtale — ekte testresultater i periodens vindu.
  // Ingen resultater gir tom tilstand, aldri oppdiktede tall.
  const maalinger: IupMaaling[] = avsluttende
    ? (
        await prisma.testResult.findMany({
          where: {
            userId: elevId,
            takenAt: {
              gte: new Date(`${avsluttende.startIso}T00:00:00Z`),
              lte: new Date(`${avsluttende.sluttIso}T23:59:59Z`),
            },
          },
          orderBy: { takenAt: "desc" },
          take: 8,
          select: {
            id: true,
            score: true,
            takenAt: true,
            test: { select: { name: true, pyramidArea: true } },
          },
        })
      ).map((r) => ({
        id: r.id,
        navn: r.test.name,
        akse: r.test.pyramidArea,
        verdi: r.score,
        datoIso: osloDato(r.takenAt),
      }))
    : [];

  return (
    <IupSamtale
      elevId={elev.id}
      elevNavn={elev.name?.trim() || elev.email}
      avsluttende={avsluttende}
      neste={neste}
      evalueringer={
        avsluttende
          ? maal
              .filter((m) => m.periodBlockId === avsluttende.id)
              .map((m) => ({
                id: m.id,
                akse: m.akse,
                tittel: m.tittel,
                egentidMinUke: m.egentidMinUke,
                maalemetode: m.maalemetode,
                status: m.status,
                egenvurdering: m.egenvurdering,
                trenervurdering: m.trenervurdering,
                kommentar: m.kommentar,
              }))
          : []
      }
      nyeStart={
        neste
          ? maal
              .filter((m) => m.periodBlockId === neste.id)
              .map((m) => ({
                akse: m.akse,
                tittel: m.tittel,
                egentidMinUke: m.egentidMinUke,
                maalemetode: m.maalemetode,
              }))
          : []
      }
      maalinger={maalinger}
    />
  );
}
