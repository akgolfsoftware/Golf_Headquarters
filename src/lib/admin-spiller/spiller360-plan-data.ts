import "server-only";
import { medAkProfiler } from "@/lib/deling/ak-profil-lesing";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import { innsynsNivaaFra, maskerLeave } from "@/lib/health/leave-innsyn";
import { visibleV2Where } from "@/lib/portal/visible-v2";
import { SPILLER_SYNLIGE_STATUSER } from "@/lib/workbench/wb-map";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { osloDagSomDbDato } from "@/lib/portal/ph01-data";
import { osloDagGrenser } from "@/lib/jarvis/dagen";
import { ukenummer } from "@/lib/uke-helpers";
import { akseFra, dato } from "./spiller360-visning";
import type { S360Plan } from "./spiller360-typer";

const DAG = 86_400_000;
const KLOKKE = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });
const DAG_LABEL = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "2-digit", month: "2-digit" });

/** Egen port ved hvert fanekall. Ingen bred dashboardleser eller cache.
 * Samtykkeskriveren låser brukerraden eksklusivt mot portens FOR SHARE. */
export async function lastSpiller360Plan(viewer: { id: string; role: string }, id: string): Promise<S360Plan | null> {
  return medAkProfiler(viewer, async (tx, scope) => {
    const spiller = await tx.user.findFirst({ where: { AND: [scope, { id }] }, select: { id: true } });
    if (!spiller) return null;
    const naa = new Date();
    const idag = osloDagSomDbDato(naa);
    const mandag = new Date(idag.getTime() - ((idag.getUTCDay() + 6) % 7) * DAG);
    const ukeSlutt = new Date(mandag.getTime() + 7 * DAG);
    const dag = osloDagGrenser(naa);
    const synligeV2 = await visibleV2Where(id, tx);
    const [okter, aktivPlan, forslag, samtykke, leaves, sesong, historikk, kommende, dagensOkter, aktivNaa] = await Promise.all([
      tx.workbenchSession.findMany({ where: { playerId: id, date: { gte: mandag, lt: ukeSlutt },
        status: { in: [...SPILLER_SYNLIGE_STATUSER] }, isTemplate: false, hiddenByPlayer: false, needsPlayerApproval: false,
        OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }] },
        orderBy: [{ date: "asc" }, { startMinute: "asc" }],
        select: { id: true, date: true, title: true, pyramid: true, durationMinutes: true, status: true } }),
      tx.trainingPlan.findFirst({
        where: { userId: id, isActive: true, status: { notIn: ["DRAFT", "REJECTED"] } },
        orderBy: { updatedAt: "desc" },
        select: { name: true, startDate: true, endDate: true, sessions: { select: { status: true } } },
      }),
      tx.planAction.findFirst({ where: { userId: id, status: "PENDING", OR: [{ coachId: viewer.id }, { coachId: null }] },
        orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
      hentSamtykkeStatus(id, tx),
      tx.leave.findMany({ where: { userId: id }, orderBy: { startAt: "desc" }, take: 10,
        select: { id: true, reason: true, startAt: true, endAt: true, isInjury: true, returnedAt: true, description: true } }),
      tx.seasonPlan.findFirst({ where: { userId: id }, orderBy: { year: "desc" },
        select: { year: true, name: true, periodBlocks: { orderBy: { startDate: "asc" },
          select: { lPhase: true, startDate: true, endDate: true, focus: true } } } }),
      hentTurneringshistorikk(id, tx),
      tx.tournamentEntry.findMany({ where: { userId: id, withdrawnAt: null,
        entryStatus: { in: ["PLANNED", "CLAIMED_REGISTERED", "CONFIRMED"] },
        OR: [{ tournament: { startDate: { gte: dag.start } } }, { tournamentId: null, manualDate: { gte: dag.start } }] },
        select: { manualName: true, manualDate: true, tournament: { select: { name: true, startDate: true } } },
        orderBy: { manualDate: "asc" }, take: 20 }),
      tx.trainingSessionV2.findMany({ where: { AND: [synligeV2, { startTime: { gte: dag.start, lt: dag.slutt }, status: { not: "CANCELLED" } }] },
        orderBy: { startTime: "asc" }, select: { id: true, title: true, startTime: true, practiceType: true, location: true } }),
      tx.trainingSessionV2.findFirst({ where: { AND: [synligeV2, { status: { in: ["IN_PROGRESS", "PLANNED"] },
        startTime: { lte: new Date(naa.getTime() + 6 * 3_600_000) }, endTime: { gte: naa } }] },
        orderBy: { startTime: "asc" }, select: { title: true, startTime: true, endTime: true, location: true } }),
    ]);
    const innsyn = innsynsNivaaFra(samtykke);
    const naaPeriode = sesong?.periodBlocks.find(p => p.startDate <= naa && p.endDate >= naa);
    const nestePeriode = sesong?.periodBlocks.find(p => p.startDate > naa);
    const resultater = historikk.aar.flatMap(a => a.turneringer).filter(t => t.plassering != null || t.brutto != null).slice(0, 5);
    return {
      ukeLabel: `Uke ${ukenummer(mandag)}`,
      uke: okter.map(o => ({ id: o.id, dag: DAG_LABEL.format(o.date), tittel: o.title,
        akse: akseFra(o.pyramid), minutter: o.durationMinutes, status: o.status })),
      iDag: dagensOkter.map(o => ({ id: o.id, tittel: o.title, klokke: KLOKKE.format(o.startTime), omrade: ({ BLOKK: "TEK", RANDOM: "SLAG", KONKURRANSE: "TURN", SPILL_TEST: "SPILL" })[o.practiceType], sted: o.location })),
      naa: aktivNaa ? { tittel: aktivNaa.title, tidspunkt: `${KLOKKE.format(aktivNaa.startTime)}–${KLOKKE.format(aktivNaa.endTime)}`, sted: aktivNaa.location } : null,
      aktivPlan: aktivPlan ? { navn: aktivPlan.name, periode: `${dato(aktivPlan.startDate)}–${aktivPlan.endDate ? dato(aktivPlan.endDate) : "åpen"}`,
        okter: `${aktivPlan.sessions.filter(s => s.status === "COMPLETED").length} av ${aktivPlan.sessions.length}`,
        venter: forslag ? `Forslag ${dato(forslag.createdAt)}` : null } : null,
      sesong: sesong ? { navn: `${sesong.year}${sesong.name ? ` · ${sesong.name}` : ""}`,
        naa: naaPeriode ? { navn: naaPeriode.focus ?? naaPeriode.lPhase, til: dato(naaPeriode.endDate) } : null,
        neste: nestePeriode ? { navn: nestePeriode.focus ?? nestePeriode.lPhase, fra: dato(nestePeriode.startDate) } : null } : null,
      kommende: kommende.map(t => ({ navn: t.tournament?.name ?? t.manualName ?? "Turnering", tidspunkt: t.tournament?.startDate ?? t.manualDate }))
        .filter((t): t is { navn: string; tidspunkt: Date } => t.tidspunkt != null)
        .sort((a, b) => a.tidspunkt.getTime() - b.tidspunkt.getTime()).slice(0, 3).map(t => ({ navn: t.navn, dato: dato(t.tidspunkt) })),
      resultater: resultater.map(t => ({ navn: t.navn, dato: dato(t.startDato), plassering: t.plassering, score: t.brutto ?? null })),
      permisjoner: leaves.map(rad => {
        const l = maskerLeave(rad, innsyn);
        return { id: rad.id, aarsak: l.reason, fra: dato(l.startAt), til: l.endAt ? dato(l.endAt) : "pågår",
          beskrivelse: l.description ?? (l.skjult ? "Ikke delt av spilleren" : "—"),
          status: l.returnedAt ? "Avsluttet" : l.endAt ? "Planlagt slutt" : "Pågående" };
      }),
    };
  });
}
