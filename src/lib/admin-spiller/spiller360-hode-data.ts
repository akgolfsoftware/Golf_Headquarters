import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { medAkProfiler, type AkProfilGrunnlag } from "@/lib/deling/ak-profil-lesing";
import { hentStallEtterlevelseITransaksjon } from "@/lib/portal/etterlevelse-data";
import { osloDagSomDbDato } from "@/lib/portal/ph01-data";
import { dato, erWangEllerTn, hcp, snittscore, tellendeRunder } from "./spiller360-visning";
import type { S360Hode, S360RailSpiller } from "./spiller360-typer";

type Viewer = { id: string; role: string };
const DAG = 86_400_000;

/** Hovedfelt og rail har egen delingskontroll for hvert kall. De andre
 * fanene har egne lesekjeder; et godkjent hode er aldri deres tilgangsbevis. */
function alderAar(d: Date | null): number | null {
  return d ? d.getUTCFullYear() : null;
}

/** Hullantall fra hullkortet; 0 = bare totalscore. */
function hullFra(n: number): number {
  return n;
}

/* ───────────────────────── Hode (alltid) ───────────────────────── */

export async function lastSpiller360Hode(viewer: Viewer, id: string): Promise<S360Hode | null> {
  return medAkProfiler(viewer, (tx, scope, grunnlag) => hentDeltHode(tx, scope, grunnlag, viewer, id), "les", { medGrunnlag: true });
}

async function hentDeltHode(
  tx: Prisma.TransactionClient, scope: Prisma.UserWhereInput,
  grunnlag: readonly AkProfilGrunnlag[], viewer: Viewer, id: string,
): Promise<S360Hode | null> {
  const naa = new Date();
  const gruppeIder = grunnlag.filter(g => g.spillerId === id).map(g => g.gruppeId);
  const spiller = await tx.user.findFirst({
    where: { AND: [scope, { id, role: "PLAYER" }] },
    select: {
      id: true, name: true, avatarUrl: true, hcp: true, dateOfBirth: true,
      groupMemberships: { where: { role: "PLAYER", endedAt: null, groupId: { in: gruppeIder } }, orderBy: { joinedAt: "asc" }, select: { group: { select: { name: true, program: true } } } },
    },
  });
  if (!spiller) return null;

  const idag = osloDagSomDbDato(naa);
  const [runder, okter, avtale, nesteTurnering, sisteBooking, forslag, sgRunder, kommendeOkter, aktivPlan] = await Promise.all([
    tx.round.findMany({
      where: { userId: id, sharedWithCoach: true },
      orderBy: { playedAt: "desc" },
      take: 20,
      select: { score: true, playedAt: true, _count: { select: { holeScores: true } } },
    }),
    hentStallEtterlevelseITransaksjon(tx, [id], naa).then(r => r.get(id)!),
    tx.subscription.findFirst({
      where: { userId: id, kind: "COACHING", status: { in: ["ACTIVE", "TRIALING"] } },
      select: { plan: true, monthlyCredits: true, creditsRemaining: true, currentPeriodEnd: true },
    }),
    tx.tournamentEntry.findFirst({
      where: { userId: id, withdrawnAt: null, OR: [{ tournament: { startDate: { gte: naa } } }, { manualDate: { gte: naa } }] },
      orderBy: [{ tournament: { startDate: "asc" } }, { manualDate: "asc" }],
      select: { manualName: true, manualDate: true, tournament: { select: { name: true, startDate: true } } },
    }),
    tx.booking.findFirst({
      where: { userId: id, startAt: { lt: naa } },
      orderBy: { startAt: "desc" },
      select: { startAt: true, serviceType: { select: { name: true } } },
    }),
    tx.planAction.findMany({
      where: { userId: id, status: "PENDING", OR: [{ coachId: viewer.id }, { coachId: null }] },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, actionType: true, agentName: true, createdAt: true },
    }),
    // SG siste 30 dager: snitt av sgTotal på runder spilleren har delt med coach.
    tx.round.findMany({
      where: { userId: id, sharedWithCoach: true, sgTotal: { not: null }, playedAt: { gte: new Date(naa.getTime() - 30 * DAG) } },
      select: { sgTotal: true },
    }),
    tx.workbenchSession.findMany({
      where: { playerId: id, date: { gte: idag }, status: { in: ["SCHEDULED", "PUBLISHED", "CHANGED_AFTER_PUBLISH"] }, isTemplate: false, hiddenByPlayer: false },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      take: 8,
      select: { date: true, startMinute: true, title: true, durationMinutes: true },
    }),
    tx.trainingPlan.findFirst({
      where: { userId: id, isActive: true },
      orderBy: { updatedAt: "desc" },
      select: { name: true, endDate: true },
    }),
  ]);

  const naaMin = osloMinutt(naa);
  const nesteOkt = kommendeOkter.find((o) => o.date.getTime() > idag.getTime() || o.startMinute >= naaMin) ?? null;
  const sgVerdier = sgRunder.map((r) => r.sgTotal).filter((v): v is number => v != null);

  const rundeInn = runder.map((r) => ({ score: r.score, playedAt: r.playedAt, hull: hullFra(r._count.holeScores) }));
  const snitt = snittscore(rundeInn);
  const kurve = tellendeRunder(rundeInn).slice(0, 10).map((r) => r.score).reverse();
  const grupper = spiller.groupMemberships.map((m) => m.group.name);
  const wangTn = erWangEllerTn(spiller.groupMemberships.map((m) => m.group.program), grupper);
  const pct = okter.pct;
  const turnDato = nesteTurnering?.tournament?.startDate ?? nesteTurnering?.manualDate ?? null;

  return {
    id: spiller.id,
    navn: spiller.name ?? "Spiller",
    avatarUrl: spiller.avatarUrl,
    grupper,
    kategori: snitt.kategori,
    hcp: hcp(spiller.hcp),
    fodtAar: alderAar(spiller.dateOfBirth),
    tilhorighet: wangTn ? "WANG · TEAM NORWAY" : "AK GOLF",
    etterlevelse: { pct, kilde: `SYNLIGE ØKTER · 4 UKER · ${dato(naa)}` },
    avtale: avtale
      ? {
          verdi: `${avtale.creditsRemaining} av ${avtale.monthlyCredits} klipp`,
          hint: [avtale.plan, avtale.currentPeriodEnd ? `FORNYES ${dato(avtale.currentPeriodEnd)}` : null].filter(Boolean).join(" · ").toUpperCase(),
        }
      : null,
    nesteTurnering: nesteTurnering
      ? { navn: nesteTurnering.tournament?.name ?? nesteTurnering.manualName ?? "Turnering", dato: dato(turnDato) }
      : null,
    sisteBooking: sisteBooking ? { dato: dato(sisteBooking.startAt), tjeneste: sisteBooking.serviceType?.name ?? "—" } : null,
    kreverDeg: forslag.map((f) => ({
      id: f.id,
      tittel: `Forslag til godkjenning · ${f.actionType.toLowerCase().replace(/_/g, " ")}`,
      sub: `${f.agentName} · ${dato(f.createdAt)}`.toUpperCase(),
    })),
    snitt: { siste10: snitt.siste10, forrige10: snitt.forrige10, antall: snitt.antall, kurve },
    turneringOmDager: turnDato ? dagerMellom(naa, turnDato) : null,
    iup: wangTn,
    sg30: { verdi: sgVerdier.length ? sgVerdier.reduce((a, v) => a + v, 0) / sgVerdier.length : null, runder: sgVerdier.length },
    nesteOkt: nesteOkt
      ? { tittel: nesteOkt.title, dato: dato(nesteOkt.date), klokke: klokke(nesteOkt.startMinute), minutter: nesteOkt.durationMinutes, omDager: dagerMellom(naa, nesteOkt.date) }
      : null,
    planSlutt: aktivPlan?.endDate
      ? { navn: aktivPlan.name, dato: dato(aktivPlan.endDate), omDager: dagerMellom(naa, aktivPlan.endDate) }
      : null,
  };
}

/** Minutter etter midnatt nå, i Oslo-tid. */
function osloMinutt(d: Date): number {
  const [t, m] = d.toLocaleTimeString("sv-SE", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).split(":").map(Number);
  return (t ?? 0) * 60 + (m ?? 0);
}

function klokke(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** Hele dager fra i dag til datoen, i Oslo-tid. */
function dagerMellom(fra: Date, til: Date): number {
  const dag = (d: Date) => Date.parse(`${d.toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" })}T00:00:00Z`);
  return Math.round((dag(til) - dag(fra)) / DAG);
}

/** Bare feltene railen viser. Ikke last profil, tester, video og notater
 * gjennom den eldre komplette arbeidsvisningen for å hente en spillerliste. */
export async function lastSpiller360Rail(viewer: Viewer, id: string): Promise<S360RailSpiller[]> {
  return await medAkProfiler(viewer, async (tx, scope) => {
    const aktiv = await tx.user.findFirst({ where: { AND: [scope, { id }] }, select: { id: true } });
    if (!aktiv) return [];
    const spillere = await tx.user.findMany({
      where: scope, select: { id: true, name: true, hcp: true, homeClub: true },
      orderBy: { name: "asc" }, take: 60,
    });
    return spillere.map(r => ({
      id: r.id, navn: r.name,
      sub: [r.hcp != null ? `HCP ${railHcp(r.hcp)}` : null, r.homeClub ?? "—"].filter(Boolean).join(" · "),
    }));
  }) ?? [];
}

/** Bevarer den eksisterende railens null-/plusshandicap-visning. */
function railHcp(value: number): string {
  return `${value <= 0 ? "+" : ""}${Math.abs(value).toFixed(1).replace(".", ",")}`;
}
