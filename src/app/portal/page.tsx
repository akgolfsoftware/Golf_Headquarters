/**
 * PlayerHQ I dag — PH-01 i nytt design (designbrevet 13.10.2026, utkast-playerhq/idag.html utkast 4).
 * Tilgang, «nå»-overstyring og lastere beholdes; visningen er PH01IDag.
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData, type TodaySession } from "@/app/portal/actions";
import { loadPlayerDay, type PlayerDaySession } from "@/lib/workbench/wb-actions";
import { dagNavnLang, ukenummer } from "@/lib/uke-helpers";
import { byggIDagAgenda } from "@/lib/portal/idag-agenda";
import { idagNaaCta } from "@/lib/portal/idag-visning";
import { hentSpillerDagITiden } from "@/lib/kalender-lag/player-dag";
import { LAG_LABEL } from "@/lib/domain/kalender-lag";
import { hentEffektivNaa } from "@/lib/testing/dato-override";
import { getFysiskData } from "@/lib/portal-fysisk/fysisk-data";
import { hentDagsform, hentFullfortHistorikk, hentIDagPopup, hentSgRunder } from "@/lib/portal/ph01-data";
import { oktBilde } from "@/lib/portal/okt-bilde";
import { hentEtterlevelse } from "@/lib/portal/etterlevelse-data";
import { etterlevelseFra } from "@/lib/domain/etterlevelse";
import { hentUkePeriode } from "@/lib/portal-plan/uke-periode";
import { tellUke } from "@/lib/portal/ph01-fullfort";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { PH01IDagLaster } from "@/components/portal/precision/PH01IDagLaster";
import { PH01IDag, type PH01Okt, type PH01Props } from "@/components/portal/precision/PH01IDag";
import { harEgenIupInngang } from "@/lib/iup/oversikt";
import type { Akse, TidslinjePunkt } from "@/components/precision/pa";
import { PushOptInBanner } from "@/components/portal/push-opt-in-banner";
import { TrenerforslagInnboks, type SpillerTrenerforslag } from "@/components/workbench/Trenerforslag";
import { hentMineTrenerforslag } from "@/lib/workbench/trenerforslag";
import { hentWangTestdeling } from "@/lib/portal-tester/wang-resultat-tilgang";
import { WangTestforesporsel } from "@/components/portal/precision/WangTestforesporsel";
import { fysOktHref } from "@/lib/portal-plan/fysisk-okt";

export const dynamic = "force-dynamic";
export const metadata = { title: "I dag · PlayerHQ" };

const OSLO_ISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" });
const OSLO_TID = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const OSLO_DM = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit" });
const OSLO_DMA = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });
const OSLO_D_MND = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long" });
const OSLO_D_MND_KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const OSLO_D_MND_AAR = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long", year: "numeric" });

/** Designet skriver klokkeslett som «14:30». */
const tid = (d: Date) => OSLO_TID.format(d).replace(".", ":");
const minTilTid = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const AKSE: Record<string, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const akse = (p: string | null | undefined): Akse => AKSE[p ?? ""] ?? "tek";
const KORT_DAG = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"] as const;
const STATUS: Partial<Record<string, PH01Okt["status"]>> = { PLANNED: "Planlagt", IN_PROGRESS: "Pågår", COMPLETED: "Gjennomført" };

function varighet(min: number): string {
  const m = Math.max(0, Math.round(min)), t = Math.floor(m / 60), r = m % 60;
  if (t === 0) return `${r} min`;
  return r === 0 ? `${t} t` : `${t} t ${r} min`;
}

function tilOkt(s: TodaySession, naa: Date): PH01Okt | null {
  const status = STATUS[s.status];
  if (!status) return null;
  const tilStart = Math.round((s.startTime.getTime() - naa.getTime()) / 60_000);
  return {
    id: s.id, tid: tid(s.startTime), slutt: tid(s.endTime), tittel: s.title, akse: akse(s.pyramidArea),
    sted: s.sted, min: s.durationMin, antallOvelser: s.drills.length, fokus: s.maalsetning, status,
    href: idagNaaCta({ id: s.id, modell: s.model ?? "v2", status: s.status }).ctaHref,
    bilde: oktBilde(s.pyramidArea, `${s.title} ${s.sted ?? ""}`),
    om: status === "Planlagt" && tilStart > 0 ? `Om ${varighet(tilStart)}` : null,
    ovelser: s.drills.map((d) => ({ navn: d.name, min: d.durationMinutes })),
  };
}

/* I dag-skjelettet ligger her, ikke i portal/loading.tsx: den lastesiden gjelder alle undersider uten
   egen loading.tsx og kan ikke se adressen uten klientkode, som CSP stopper (gotchas §Bygg og drift). */
export default function PortalHjemPage() {
  return (
    <Suspense fallback={<PlayerHQSkallLaster sti="/portal"><PH01IDagLaster /></PlayerHQSkallLaster>}>
      <PortalHjemInnhold />
    </Suspense>
  );
}

async function PortalHjemInnhold() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const planLaast = user.role === "PLAYER" && user.tilgang.nivaa !== "FULL";

  const naa = await hentEffektivNaa(user.email);
  const iDag = OSLO_ISO.format(naa);

  const [data, dag, dagITiden, fysisk, dagsform, historikk, popup, visIup, trenerforslag, wangTestdeling, periode, sgRunder, etterlevelse, wangPlandeling] = await Promise.all([
    getDashboardData(user.id, naa),
    planLaast
      ? Promise.resolve({ ok: true as const, data: { date: iDag, sessions: [] as PlayerDaySession[], nextSessionId: null } })
      : loadPlayerDay({ playerId: user.id, date: iDag }),
    hentSpillerDagITiden(user.id, iDag),
    getFysiskData(user.id),
    hentDagsform(user.id, naa),
    hentFullfortHistorikk(user.id, naa),
    hentIDagPopup(user.id, naa),
    planLaast ? Promise.resolve(false) : harEgenIupInngang(),
    user.role === "PLAYER" ? hentMineTrenerforslag() : Promise.resolve([] as SpillerTrenerforslag[]),
    // D-55: WANG-elever som ikke har svart, får testsamtykket her.
    user.role === "PLAYER" ? hentWangTestdeling(user.id) : Promise.resolve([]),
    planLaast ? Promise.resolve(null) : hentUkePeriode(user.id, naa),
    hentSgRunder(user.id),
    planLaast ? Promise.resolve(null) : hentEtterlevelse(user.id, naa),
    // W1: og planen, som bare deles med WANG-skolen.
    user.role === "PLAYER" ? hentWangTestdeling(user.id, "TRENINGSPLAN") : Promise.resolve([]),
  ]);

  const uke = ukenummer(naa);
  const dagLabel = dagNavnLang(naa);
  const dato = `${dagLabel.charAt(0).toUpperCase()}${dagLabel.slice(1)} ${OSLO_D_MND.format(naa)} · ${periode ? `${periode.navn}, uke ${periode.uke} av ${periode.antallUker}` : `Uke ${uke}`}`;

  const okter = planLaast ? [] : data.todayAll.map((s) => tilOkt(s, naa)).filter((o): o is PH01Okt => o != null)
    .sort((a, b) => Number(a.status === "Gjennomført") - Number(b.status === "Gjennomført") || a.tid.localeCompare(b.tid));
  const neste = okter.find((o) => o.status === "Pågår") ?? okter.find((o) => o.status === "Planlagt") ?? null;
  const igjen = okter.filter((o) => o.status !== "Gjennomført").length;
  const totalMin = okter.reduce((a, o) => a + o.min, 0);

  const godkjenninger = !dag.ok ? [] : dag.data.sessions.filter((s) => s.needsPlayerApproval).map((s) => ({
    id: s.id, tittel: s.title, tid: minTilTid(s.startMinute), min: s.durationMinutes, akse: akse(s.pyramid),
    sted: s.location ?? null, fraGruppe: s.origin === "GROUP",
  }));

  const dagensOkter = data.week.find((d) => d.isToday)?.sessions ?? [];
  const pyramideFor = new Map(dagensOkter.map((s) => [`okt-${s.id}`, s.pyramidArea]));
  const agenda: TidslinjePunkt[] = planLaast ? [] : byggIDagAgenda(dagITiden, dagensOkter).map((h) => {
    const a = h.lag === "OEKTER" ? akse(pyramideFor.get(h.id)) : h.lag === "TURNERING" ? "turn" : null;
    return {
      id: h.id,
      time: h.startMin == null ? null : minTilTid(h.startMin),
      title: h.tittel,
      meta: [LAG_LABEL[h.lag], h.undertekst, h.fullfort ? "Gjennomført" : null].filter(Boolean).join(" · ").toUpperCase(),
      axis: a,
      hollow: a == null,
    };
  });

  const wp = data.weekProgress;
  const uka: PH01Props["uka"] = planLaast || wp.plannedMin === 0 ? null : {
    uke, gjortMin: wp.completedMin, planMin: wp.plannedMin,
    akser: (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((k) => ({ akse: AKSE[k]!, gjortMin: wp.completedByAxis[k] ?? 0, planMin: wp.plannedByAxis[k] ?? 0 })),
  };

  const telling = tellUke(data.week.flatMap((d) => d.sessions.map((s) => s.status)));
  const fullfort: PH01Props["fullfort"] = planLaast ? null : {
    uke, ...telling,
    total: historikk.total,
    totalKilde: historikk.forste ? `Øktlogg · ${historikk.total} økter siden ${OSLO_DMA.format(historikk.forste)}` : "Øktlogg · ingen gjennomførte økter ennå",
    milepaeler: historikk.milepaeler.map((m) => ({ antall: m.antall, naadd: m.naadd ? OSLO_DM.format(m.naadd) : null })),
  };

  const fo = fysisk.okt;
  const fys: PH01Props["fys"] = !fo ? null : {
    tittel: fo.navn,
    meta: [fo.planNavn, fo.ukeLabel, fo.varighetMin ? `${fo.varighetMin} min` : null].filter(Boolean).join(" · "),
    rader: fo.styrke.map((o) => {
      const reps = [...new Set(o.startSett.map((s) => s.reps))];
      const kg = [...new Set(o.startSett.map((s) => s.vekt))].filter((v) => v > 0);
      return [o.navn, o.startSett.length ? `${o.startSett.length} × ${reps.length === 1 ? reps[0] : reps.join("/")}` : "—", kg.length === 1 ? `${kg[0]} kg` : "—"];
    }),
    href: fysOktHref(fo.oktId),
  };

  const nt = data.nextTournament;
  const turn: PH01Props["turn"] = !nt ? null : {
    dager: nt.daysLeft, tittel: nt.name, sted: nt.location,
    meta: (nt.endDate && OSLO_ISO.format(nt.endDate) !== OSLO_ISO.format(nt.startDate) ? `${OSLO_DM.format(nt.startDate)}–${OSLO_DMA.format(nt.endDate)}` : OSLO_DMA.format(nt.startDate)),
    href: nt.href,
  };

  const maal: PH01Props["maal"] = data.goals.filter((g) => g.status !== "ABANDONED").slice(0, 2).map((g) => ({
    id: g.id, tittel: g.title, kategori: g.category === "PROCESS" ? "Prosessmål" : "Resultatmål",
    frist: g.deadline ? OSLO_D_MND_AAR.format(g.deadline) : null,
    pct: g.progress, status: g.progressStatus, href: g.href,
  }));

  const ett: PH01Props["etterlevelse"] = etterlevelse && etterlevelse.pct != null ? {
    pct: etterlevelse.pct, gjortMin: etterlevelse.gjennomfortMinutter, planMin: etterlevelse.planlagtMinutter,
    periode: `siste fire uker, ${OSLO_D_MND_KORT.format(etterlevelseFra(naa))}–${OSLO_D_MND_KORT.format(naa)}`,
  } : null;

  const kpi = data.kpiStats;
  const snitt: PH01Props["snitt"] = kpi.avgScore == null ? null : {
    verdi: kpi.avgScore,
    endring: kpi.avgScorePrev == null ? null : Math.round((kpi.avgScore - kpi.avgScorePrev) * 10) / 10,
    trend: kpi.scoreTrend,
    dato: kpi.lastRoundAt ? OSLO_DM.format(kpi.lastRoundAt) : null,
  };

  const dager: PH01Props["dager"] = planLaast ? [] : data.week.map((d, i) => ({
    kort: KORT_DAG[i] ?? d.dayLabel,
    iDag: d.isToday,
    segmenter: d.sessions.filter((s) => s.status !== "SKIPPED" && s.status !== "CANCELLED").map((s) => ({ akse: akse(s.pyramidArea), min: s.durationMin, gjort: s.status === "COMPLETED" })),
  }));

  const iDagIndeks = data.week.findIndex((d) => d.isToday);
  const nesteDag = iDagIndeks < 0 ? null : data.week.slice(iDagIndeks + 1).map((d) => ({ d, s: d.sessions.filter((x) => x.status === "PLANNED").sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0] })).find((x) => x.s);
  const nesteOkt: PH01Props["nesteOkt"] = planLaast || !nesteDag?.s ? null : {
    dag: `${KORT_DAG[data.week.indexOf(nesteDag.d)] ?? nesteDag.d.dayLabel} ${nesteDag.d.dayNumber}`,
    tid: tid(nesteDag.s.startTime), tittel: nesteDag.s.title, akse: akse(nesteDag.s.pyramidArea), min: nesteDag.s.durationMin,
    sted: nesteDag.s.sted, antallOvelser: nesteDag.s.drills.length, href: nesteDag.s.href,
  };

  const cm = data.coachMessage;
  const melding: PH01Props["melding"] = cm && cm.from === "coach" ? {
    fra: cm.coachName, tekst: cm.preview || cm.subject, tid: `${OSLO_DM.format(cm.createdAt)} ${tid(cm.createdAt)}`, href: cm.href,
  } : null;

  const sg: PH01Props["sg"] = {
    runder: sgRunder.length,
    dato: kpi.lastRoundAt ? OSLO_DM.format(kpi.lastRoundAt) : null,
    verdier: [
      { navn: "Utslag", verdi: kpi.sgBreakdown.ott },
      { navn: "Innspill", verdi: kpi.sgBreakdown.app },
      { navn: "Nærspill", verdi: kpi.sgBreakdown.arg },
      { navn: "Putting", verdi: kpi.sgBreakdown.putt },
    ],
  };

  const feil = !dag.ok;
  const tom = !feil && okter.length === 0 && godkjenninger.length === 0 && wp.plannedMin === 0 && historikk.total === 0;

  const props: PH01Props = {
    tilstand: feil ? "feil" : tom ? "tom" : "data",
    dato,
    fornavn: user.name?.trim().split(/\s+/)[0] ?? null,
    ingress: okter.length === 0 ? "Ingen økter i dag." : `${okter.length} ${okter.length === 1 ? "økt" : "økter"}, ${varighet(totalMin)} totalt.${igjen > 0 && igjen < okter.length ? ` ${igjen} igjen.` : ""}`,
    tomTekst: `Du har ingen økter ${dagLabel.toLowerCase()} ${OSLO_D_MND.format(naa)}${wp.plannedMin === 0 ? " og ingen treningsplan ennå" : ""}.`,
    feilKode: `Feil · I dag · ${tid(naa)}`,
    okter, nesteId: neste?.id ?? null, godkjenninger,
    uka, maal, sgRunder: sgRunder.length, etterlevelse: ett,
    snitt, dager, nesteOkt, melding, sg,
    fireukerssjekk: visIup ? { href: "/portal/mal/evaluering" } : null,
    dagsform, agenda, fys, turn, fullfort,
    popup: popup && { id: popup.id, kind: popup.kind, title: popup.title, body: popup.body, tid: `I dag · ${tid(popup.createdAt)}`, href: popup.href },
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={data.unreadCount}>
      <PH01IDag {...props}>
        {wangTestdeling.map((d) => <WangTestforesporsel key={d.gruppeId} {...d} modus={{ type: "spiller" }} bareNyForesporsel />)}
        {wangPlandeling.map((d) => (
          <WangTestforesporsel key={`plan-${d.gruppeId}`} {...d} modus={{ type: "spiller" }} bareNyForesporsel omfang="TRENINGSPLAN" />
        ))}
        <PushOptInBanner />
        <TrenerforslagInnboks forslag={trenerforslag} />
      </PH01IDag>
    </PlayerHQSkall>
  );
}
