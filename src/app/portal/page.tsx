/**
 * PlayerHQ I dag — Precision Athletics PH-01, runde 20 (Claude Design 7d7c2994).
 * Tilgang, «nå»-overstyring og lastere beholdes; visningen er PH01IDag.
 */

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
import { hentDagsform, hentFullfortHistorikk, hentIDagPopup } from "@/lib/portal/ph01-data";
import { tellUke } from "@/lib/portal/ph01-fullfort";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH01IDag, type PH01Okt, type PH01Props } from "@/components/portal/precision/PH01IDag";
import { harEgenIupInngang } from "@/lib/iup/oversikt";
import { KnappLenke } from "@/components/precision/pa";
import type { Akse, TidslinjePunkt } from "@/components/precision/pa";
import { PushOptInBanner } from "@/components/portal/push-opt-in-banner";
import { TrenerforslagInnboks, type SpillerTrenerforslag } from "@/components/workbench/Trenerforslag";
import { hentMineTrenerforslag } from "@/lib/workbench/trenerforslag";
import { hentWangTnTestdeling } from "@/lib/portal-tester/wang-resultat-tilgang";
import { WangTnTestforesporsel } from "@/components/portal/precision/WangTnTestforesporsel";

export const dynamic = "force-dynamic";
export const metadata = { title: "I dag · PlayerHQ" };

const OSLO_ISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" });
const OSLO_TID = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const OSLO_DM = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit" });
const OSLO_DMA = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });

/** Designet skriver klokkeslett som «14:30». */
const tid = (d: Date) => OSLO_TID.format(d).replace(".", ":");
const minTilTid = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const AKSE: Record<string, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const akse = (p: string | null | undefined): Akse => AKSE[p ?? ""] ?? "tek";
const STATUS: Partial<Record<string, PH01Okt["status"]>> = { PLANNED: "Planlagt", IN_PROGRESS: "Pågår", COMPLETED: "Gjennomført" };

function tilOkt(s: TodaySession): PH01Okt | null {
  const status = STATUS[s.status];
  if (!status) return null;
  return {
    id: s.id, tid: tid(s.startTime), slutt: tid(s.endTime), tittel: s.title, akse: akse(s.pyramidArea),
    sted: s.sted, min: s.durationMin, antallOvelser: s.drills.length, fokus: s.maalsetning, status,
    href: idagNaaCta({ id: s.id, modell: s.model ?? "v2", status: s.status }).ctaHref,
  };
}

export default async function PortalHjemPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const planLaast = user.role === "PLAYER" && user.tilgang.nivaa !== "FULL";

  const naa = await hentEffektivNaa(user.email);
  const iDag = OSLO_ISO.format(naa);

  const [data, dag, dagITiden, fysisk, dagsform, historikk, popup, visIup, trenerforslag, wangTnTestdeling] = await Promise.all([
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
    // D-13: WANG-elever som ikke har svart, får forespørselen her.
    user.role === "PLAYER" ? hentWangTnTestdeling(user.id) : Promise.resolve(null),
  ]);

  const uke = ukenummer(naa);
  const dagLabel = dagNavnLang(naa);
  const kicker = `${dagLabel.charAt(0).toUpperCase()}${dagLabel.slice(1)} ${OSLO_DM.format(naa)} · Uke ${uke}`;

  const okter = planLaast ? [] : data.todayAll.map(tilOkt).filter((o): o is PH01Okt => o != null)
    .sort((a, b) => Number(a.status === "Gjennomført") - Number(b.status === "Gjennomført") || a.tid.localeCompare(b.tid));
  const neste = okter.find((o) => o.status === "Pågår") ?? okter.find((o) => o.status === "Planlagt") ?? null;
  const igjen = okter.filter((o) => o.status !== "Gjennomført").length;

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
  const trening: PH01Props["trening"] = planLaast || wp.plannedMin === 0 ? null : {
    uke,
    akser: (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((k) => {
      const plan = wp.plannedByAxis[k] ?? 0, gjort = wp.completedByAxis[k] ?? 0;
      return [AKSE[k]!, plan === 0 && gjort === 0 ? null : gjort / 60, plan / 60];
    }),
    kilde: `ØKTLOGG · UKE ${uke} · ${OSLO_DMA.format(naa)} ${tid(naa)}`,
    planKilde: `PLAN · ØKTENE I UKE ${uke}`,
  };

  const telling = tellUke(data.week.flatMap((d) => d.sessions.map((s) => s.status)));
  const fullfort: PH01Props["fullfort"] = planLaast ? null : {
    uke, ...telling,
    rekke: historikk.rekke,
    rekkeKilde: [historikk.rekkeUker ? `UKE ${historikk.rekkeUker.fra}–${historikk.rekkeUker.til} OVER 70 %` : null, `UKE ${uke} PÅGÅR`].filter(Boolean).join(" · "),
    total: historikk.total,
    totalKilde: historikk.forste ? `ØKTLOGG · SIDEN ${OSLO_DMA.format(historikk.forste)}` : "ØKTLOGG · INGEN GJENNOMFØRTE ØKTER ENNÅ",
    milepaeler: historikk.milepaeler.map((m) => ({ antall: m.antall, naadd: m.naadd ? OSLO_DM.format(m.naadd) : null })),
  };

  const fo = fysisk.okt;
  const fys: PH01Props["fys"] = !fo ? null : {
    tittel: fo.navn,
    meta: [fo.planNavn, fo.ukeLabel, fo.varighetMin ? `${fo.varighetMin} MIN` : null].filter(Boolean).join(" · ").toUpperCase(),
    rader: fo.styrke.map((o) => {
      const reps = [...new Set(o.startSett.map((s) => s.reps))];
      const kg = [...new Set(o.startSett.map((s) => s.vekt))].filter((v) => v > 0);
      return [o.navn, o.startSett.length ? `${o.startSett.length} × ${reps.length === 1 ? reps[0] : reps.join("/")}` : "—", kg.length === 1 ? `${kg[0]} kg` : "—"];
    }),
    href: "/portal/fysisk",
  };

  const nt = data.nextTournament;
  const turn: PH01Props["turn"] = !nt ? null : {
    dager: nt.daysLeft, tittel: nt.name, sted: nt.location,
    meta: (nt.endDate && OSLO_ISO.format(nt.endDate) !== OSLO_ISO.format(nt.startDate) ? `${OSLO_DM.format(nt.startDate)}–${OSLO_DMA.format(nt.endDate)}` : OSLO_DMA.format(nt.startDate)),
    href: nt.href,
  };

  const feil = !dag.ok;
  const tom = !feil && okter.length === 0 && godkjenninger.length === 0 && wp.plannedMin === 0 && historikk.total === 0;

  const props: PH01Props = {
    tilstand: feil ? "feil" : tom ? "tom" : "data",
    kicker,
    tittel: `${data.greeting}, ${data.user.fornavn}`,
    sub: okter.length === 0 ? "Ingen økter i dag." : `${okter.length} ${okter.length === 1 ? "økt" : "økter"} i dag · ${igjen} igjen${neste ? ` · neste ${neste.tid}` : ""}`,
    tomTekst: `Du har ingen økter ${dagLabel} ${OSLO_DM.format(naa)}${wp.plannedMin === 0 ? " og ingen treningsplan ennå" : ""}.`,
    feilKode: `FEIL · I DAG · ${tid(naa)}`,
    okter, nesteId: neste?.id ?? null, godkjenninger,
    dagsform, agenda, fys, turn, trening, fullfort,
    popup: popup && { id: popup.id, kind: popup.kind, title: popup.title, body: popup.body, tid: `I DAG · ${tid(popup.createdAt)}`, href: popup.href },
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={data.unreadCount}>
      <PH01IDag {...props}>
        {wangTnTestdeling && <WangTnTestforesporsel status={wangTnTestdeling.status} kreverForesatt={wangTnTestdeling.kreverForesatt} modus={{ type: "spiller" }} bareNyForesporsel />}
        <PushOptInBanner />
        <TrenerforslagInnboks forslag={trenerforslag} />
        {visIup && <section className="pa-card" style={{ padding: 16, gap: 12 }} aria-label="Evaluering">
          <h2>Evaluering</h2>
          <p>Utviklingssjekk, sesongevaluering og dine tidligere besvarelser.</p>
          <KnappLenke variant="secondary" href="/portal/mal/evaluering">Åpne evaluering</KnappLenke>
        </section>}
      </PH01IDag>
    </PlayerHQSkall>
  );
}
