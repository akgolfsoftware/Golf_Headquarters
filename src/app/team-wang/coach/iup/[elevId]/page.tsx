import { notFound } from "next/navigation";

import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medWangElevData } from "@/app/team-wang/_data/wang-tilgang";
import {
  IupSamtale,
  type IupPeriode,
  type IupMaaling,
} from "@/app/team-wang/coach/iup/[elevId]/iup-samtale";
import { TrenerforslagSkjema } from "@/components/workbench/Trenerforslag";
import { LeverteIupProfil } from "@/components/iup/LeverteIupProfil";
import { lesLeverteIupForProfil } from "@/lib/iup/trener-profil-lesing";

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

const FASE_NAVN: Record<string, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialperiode",
  TURNERING: "Turneringsperiode",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
  RESTITUSJON: "Restitusjon",
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
    redirectTo: `/team-wang/logg-inn?next=${encodeURIComponent(`/team-wang/coach/iup/${encodeURIComponent(elevId)}`)}`,
    kreverTilgang: "INGEN",
  });

  const visning = await medWangElevData(bruker, elevId, async (tx, gruppeId) => {

    const elev = await tx.user.findUnique({
      where: { id: elevId },
      select: { id: true, name: true, email: true },
    });
    if (!elev) return null;
    const leverteIup = await lesLeverteIupForProfil(tx, elevId);

    const blokker = await tx.groupPeriodBlock.findMany({
      where: { groupId: gruppeId },
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

    const maal = await tx.groupPeriodGoal.findMany({
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
          await tx.testResult.findMany({
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
              testId: true,
              details: true,
              takenAt: true,
              test: { select: { name: true, pyramidArea: true, protocol: true } },
            },
          })
        ).map((r) => {
          // Protokollen bærer enheten; uten den ble en PEI-brøk rendret som
          // «0.038» i IUP-samtalen, med punktum og uten enhet.
          return {
            id: r.id,
            navn: r.test.name,
            akse: r.test.pyramidArea,
            verdi: formaterLagretTestResultat({ ...r, protocol: r.test.protocol }),
            datoIso: osloDato(r.takenAt),
          };
        })
      : [];

    const trenerOkter = bruker.role === "COACH" ? await tx.workbenchSession.findMany({ where: {
      playerId: elevId, status: { in: ["DRAFT", "SCHEDULED", "PUBLISHED"] }, sourceGroupSessionId: null,
      date: { gte: new Date(`${osloIdag()}T00:00:00.000Z`) },
    }, orderBy: [{ date: "asc" }, { startMinute: "asc" }], take: 40, select: { id: true, date: true, startMinute: true, title: true } }) : [];

    return (
      <>
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
      <section className="wang-card" style={{ padding: "18px 20px" }}>
        <LeverteIupProfil rader={leverteIup} />
      </section>
      {bruker.role === "COACH" ? <TrenerforslagSkjema organisasjon="WANG" spillerId={elevId} sessions={trenerOkter.map(s => ({
        id: s.id, label: `${s.date.toISOString().slice(0, 10)} ${String(Math.floor(s.startMinute / 60)).padStart(2, "0")}:${String(s.startMinute % 60).padStart(2, "0")} · ${s.title}`,
      }))} /> : null}
      </>
    );
  });
  if (visning === null) notFound();
  return visning;
}
