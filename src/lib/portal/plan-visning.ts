import type { TodaySession, WeekDay } from "@/app/portal/actions";
import type { KalenderHendelse } from "@/lib/domain/kalender-lag";
import { OSLO_YMD_FMT, osloInstant } from "@/lib/jarvis/dagen";
import { osloMinuttAvDogen } from "./idag-visning";
import { sumEtterlevelse } from "@/lib/domain/okt-status";
import { weekPlanProgress } from "./week-progress";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { liveHrefForStatus } from "@/lib/portal-live/live-route";

export type PlanForslag = { session: TodaySession; coachName: string | null };
export type PlanBlokk = KalenderHendelse & { session?: TodaySession; forslag?: PlanForslag };
export type PlanDag = { dato: string; datoTall: number; navn: string; idag: boolean; blokker: PlanBlokk[] };

/** Serverens bekreftede rad etter svar/flytting, uten å gjette lagrede verdier. */
export function planSessionFraSvar(s: WorkbenchSession): TodaySession {
  const [y, m, d] = s.date.split("-").map(Number);
  const startTime = osloInstant(y, m, d, Math.floor(s.startMinute / 60), s.startMinute % 60);
  return {
    id: s.id, model: "wb", title: s.title, startTime,
    endTime: new Date(startTime.getTime() + s.durationMinutes * 60_000),
    status: s.status === "COMPLETED" ? "COMPLETED" : s.status === "IN_PROGRESS" ? "IN_PROGRESS" : s.status === "CANCELLED" ? "CANCELLED" : s.status === "SKIPPED" ? "SKIPPED" : "PLANNED",
    pyramidArea: s.pyramid, practiceType: s.pyramid === "SLAG" ? "RANDOM" : s.pyramid === "SPILL" ? "SPILL_TEST" : s.pyramid === "TURN" ? "KONKURRANSE" : "BLOKK",
    durationMin: s.durationMinutes, sted: s.location ?? null, maalsetning: s.notes ?? null,
    drills: s.drills.map((d) => ({ id: d.id, name: d.title, durationMinutes: d.durationMinutes })),
    href: liveHrefForStatus("wb", s.status, s.id),
  };
}

function oktBlokk(session: TodaySession, forslag?: PlanForslag): PlanBlokk {
  return {
    id: `okt-${session.id}`, dato: OSLO_YMD_FMT.format(session.startTime),
    tittel: session.title, lag: "OEKTER", heldag: false,
    undertekst: [session.sted, `${session.durationMin} min`].filter(Boolean).join(" · "),
    startMin: osloMinuttAvDogen(session.startTime),
    sluttMin: OSLO_YMD_FMT.format(session.endTime) === OSLO_YMD_FMT.format(session.startTime)
      ? osloMinuttAvDogen(session.endTime) : 1440,
    session, forslag,
  };
}

/** Dagpiller, agenda og rutenett leser samme blokker; forslag teller først etter svar. */
export function byggPlanUke(week: readonly WeekDay[], kalender: readonly KalenderHendelse[], forslag: readonly PlanForslag[]) {
  const datoer = new Set(week.map((d) => OSLO_YMD_FMT.format(d.date)));
  const blokker = [
    ...kalender.filter((h) => h.lag !== "OEKTER" && datoer.has(h.dato)),
    ...week.flatMap((d) => d.sessions.map((s) => oktBlokk(s))),
    ...forslag.map((f) => oktBlokk(f.session, f)).filter((b) => datoer.has(b.dato)),
  ];
  const dager: PlanDag[] = week.map((d) => {
    const dato = OSLO_YMD_FMT.format(d.date);
    return {
      dato, datoTall: Number(dato.slice(-2)), navn: d.dayLabel, idag: d.isToday,
      blokker: blokker.filter((b) => b.dato === dato).sort((a, b) =>
        Number(b.heldag) - Number(a.heldag) || (a.startMin ?? 0) - (b.startMin ?? 0) || a.id.localeCompare(b.id)),
    };
  });
  return {
    dager,
    fremdrift: sumEtterlevelse(week.flatMap((d) => d.sessions.map((s) => ({ status: s.status, avbruddAarsak: s.avbruddAarsak ?? null })))),
    minutter: weekPlanProgress(week),
  };
}

export const PLAN_TIME_PX = 52;
export const PLAN_MIN_BLOCK_PX = 34;

/** Synlige kort har en minimumshøyde. Kollisjoner beregnes etter den høyden,
 * slik at også korte økter etter hverandre kan velges med tastatur/mus. */
export function plasserPlanBlokker(blokker: readonly PlanBlokk[]) {
  const timed = blokker.filter((b) => b.startMin !== null && !b.heldag)
    .map((blokk) => ({ blokk, fra: blokk.startMin!, til: Math.max(blokk.sluttMin ?? blokk.startMin!, blokk.startMin! + PLAN_MIN_BLOCK_PX / PLAN_TIME_PX * 60), spor: 0, antallSpor: 1 }))
    .sort((a, b) => a.fra - b.fra || b.til - a.til || a.blokk.id.localeCompare(b.blokk.id));
  let gruppe: typeof timed = [];
  let slutt = -1;
  function avsluttGruppe() {
    const antall = Math.max(1, ...gruppe.map((b) => b.spor + 1));
    for (const b of gruppe) b.antallSpor = antall;
    gruppe = [];
  }
  for (const b of timed) {
    if (b.fra >= slutt) { avsluttGruppe(); slutt = -1; }
    const opptatt = new Set(gruppe.filter((a) => a.til > b.fra).map((a) => a.spor));
    while (opptatt.has(b.spor)) b.spor++;
    gruppe.push(b);
    slutt = Math.max(slutt, b.til);
  }
  avsluttGruppe();
  return timed;
}

export function planTidsrom(dager: readonly PlanDag[]) {
  const blokker = dager.flatMap((d) => plasserPlanBlokker(d.blokker));
  const startHour = Math.max(0, Math.min(7, ...blokker.map((b) => Math.floor(b.fra / 60))));
  const endHour = Math.min(24, Math.max(startHour + 8, ...blokker.map((b) => Math.ceil(b.til / 60))));
  return { startHour, endHour };
}

export function nyPlanOktHref(dato: string, uke: number) {
  return `/portal/planlegge/workbench?${new URLSearchParams({ uke: String(uke), start: `${dato}T09:00` })}`;
}
