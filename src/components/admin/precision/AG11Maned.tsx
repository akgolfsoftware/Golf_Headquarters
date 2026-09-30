"use client";

/**
 * AG-11-MND Workbench · måned i Precision Athletics (coach). Tegning: Claude
 * Design 7d7c2994, ui_kits/agencyos/screens/AG-11-wb3.jsx (AG-11-MND) og
 * ui_kits/_shared/WB3-ar.jsx (Mid, måned).
 *
 * Bygget på MonthViewModel (loadMonth). Planlagte timer per akse fordelt på
 * ukene, gjennomført, uker med økter, tester og turneringer og kalenderen.
 * Fokus hentes fra perioden som dekker måneden (PeriodBlock.focus og
 * weeklySessionBudget), målene fra hentMaalSpor, kildene fra loadSources.
 * Notat og evaluering per måned har ingen lagring i databasen i dag og vises
 * som «—». Månedsskjemaet (AG-11-MNDSKJEMA) er ikke bygget (forslag:
 * tabellen MonthPlan, se PR-en).
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarX, ChevronLeft, ChevronRight, ClipboardList, Dumbbell, LayoutTemplate, Search, StickyNote, Trophy } from "lucide-react";
import { Knapp, KnappLenke, TomTilstand } from "@/components/precision/pa";
import { PLAN_NIVAA_LABEL } from "@/lib/domain/maal-plannivaa";
import { IkonKnapp } from "@/components/precision/pa-a2";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { Caps, Fremdrift, Listerad, Valgpille, Velger, akseFra, akseStil } from "@/components/precision/pa-workbench";
import { osloIdag } from "@/components/workbench/WeekGrid";
import { addMonths } from "@/lib/domain/workbench/operations";
import { UI, formatHours } from "@/lib/domain/workbench/labels";
import type { MonthDayCell, MonthViewModel, PlanningGoalSummary, PyramidArea, SourceItem } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { hentHendelser, harSkjulteLinjer, timer } from "@/lib/workbench/maned-visning";
import type { ManedPeriode } from "@/lib/workbench/maned-periode";
import { VelgerArk } from "./AG11Ark";
import "@/styles/precision-a9.css";
import "@/styles/precision-a1130.css";

export type AG11ManedProps = {
  playerId: string;
  spillerNavn: string;
  maned: MonthViewModel;
  roster: readonly { id: string; navn: string }[];
  kilder: readonly SourceItem[];
  goals: readonly PlanningGoalSummary[];
  periode: ManedPeriode | null;
};

type Sidefelt = "bank" | "fys" | "maler" | "turn" | "tp" | "mal";
const SIDEFELT: [Sidefelt, string][] = [["bank", "Øvelsesbank"], ["fys", "Fysisk program"], ["maler", "Øktmaler"], ["turn", "Turneringer"], ["tp", "Ny teknisk plan"], ["mal", "Målsetninger"]];

/** Uke-sida med sidefelt valgt; workbenchUrl gir ingen «?» for standard uke uten uke-parameter. */
const medSide = (url: string, side: Sidefelt) => `${url}${url.includes("?") ? "&" : "?"}side=${side}`;
const uketimer = (min: number) => (min > 0 ? formatHours(min) : "—");

const AKSER: readonly PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const ddmm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

export function AG11Maned({ playerId, spillerNavn, maned, roster, kilder, goals, periode }: AG11ManedProps) {
  const router = useRouter();
  const idag = osloIdag();
  const [velger, setVelger] = useState(false);
  const [side, setSide] = useState<Sidefelt>("bank");
  const [aar, mnr] = maned.monthStart.split("-").map(Number);
  const navn = `${UI.monthNames[mnr - 1]} ${aar}`;
  const ym = maned.monthStart.slice(0, 7);
  const pct = maned.plannedToDateMinutes > 0 ? Math.min(100, Math.round((maned.completedMinutes / maned.plannedToDateMinutes) * 100)) : null;
  const gaTil = (delta: -1 | 1) => router.push(workbenchUrl(playerId, "maned", { maned: addMonths(maned.monthStart, delta).slice(0, 7) }));
  const hendelser = hentHendelser(maned);
  const forsteUke = maned.weeks.find((u) => u.days.some((d) => d.inMonth));
  const sumPlan = AKSER.reduce((a, k) => a + maned.budget.byPyramid[k], 0);
  const sumGjort = AKSER.reduce((a, k) => a + maned.completedByPyramid[k], 0);
  const uke = (weekStart?: string) => workbenchUrl(playerId, "uke", { uke: weekStart });

  const nivaer: [string, string][] = [
    ["År", workbenchUrl(playerId, "aar", { aar: String(aar) })],
    ["Periode", workbenchUrl(playerId, "periode", { aar: String(aar) })],
    ["Måned", workbenchUrl(playerId, "maned", { maned: ym })],
    ["Uke", uke(forsteUke?.weekStart)],
    ["Økt", workbenchUrl(playerId, "okt", { uke: forsteUke?.weekStart })],
    ["Målsetninger", `/admin/workbench/${playerId}?vis=mal`],
    ["Stall", workbenchUrl(playerId, "stall", { uke: forsteUke?.weekStart })],
    ["Live", workbenchUrl(playerId, "live", { uke: forsteUke?.weekStart })],
    ["Min kalender", workbenchUrl(playerId, "min", { uke: forsteUke?.weekStart })],
  ];
  const snarveier: [typeof Search, string, string][] = [
    [LayoutTemplate, "Bruk mal på spiller", medSide(uke(forsteUke?.weekStart), "maler")],
    [StickyNote, "Coachnotat", uke(forsteUke?.weekStart)],
    [Search, "Søk i tekniske oppgaver", medSide(uke(forsteUke?.weekStart), "tp")],
  ];
  const idx = Math.max(0, roster.findIndex((p) => p.id === playerId));
  const spillerHref = (id: string) => workbenchUrl(id, "maned", { maned: ym });
  const forrige = roster.length > 1 ? () => router.push(spillerHref(roster[(idx - 1 + roster.length) % roster.length].id)) : undefined;
  const neste = roster.length > 1 ? () => router.push(spillerHref(roster[(idx + 1) % roster.length].id)) : undefined;
  const budsjett = periode?.budsjett ? AKSER.filter((k) => periode.budsjett?.[k] != null).map((k) => `${k} ${periode.budsjett?.[k]}`).join(" · ") : "";

  const bank = kilder.filter((k) => k.kind === "DRILL");
  const maler = kilder.filter((k) => k.kind === "TEMPLATE");
  const forrigeUke = kilder.filter((k) => k.kind === "PREVIOUS_WEEK");
  const tek = kilder.filter((k) => k.kind === "TEK");
  const kildeRader = (liste: readonly SourceItem[]) => <div role="list" className="a9-liste">{liste.slice(0, 12).map((k, i) =>
    <Listerad key={k.id} forste={i === 0} akse={k.pyramid ? akseFra(k.pyramid) : null} tittel={k.title}
      under={[k.subtitle, k.durationMinutes ? `${k.durationMinutes} MIN` : null].filter(Boolean).join(" · ").toUpperCase() || undefined} />)}</div>;
  const sideInnhold = side === "bank" ? (bank.length === 0 ? <Caps>INGEN ØVELSER I BANKEN</Caps> : <>{kildeRader(bank)}<Caps>ÅPNE UKA FOR Å LEGGE ØVELSER INN I EN ØKT</Caps></>)
    : side === "fys" ? <KnappLenke variant="secondary" size="sm" icon={Dumbbell} iconRight={ChevronRight} href={`/admin/workbench/${playerId}?pille=fys`}>Åpne fysisk program</KnappLenke>
    : side === "maler" ? (maler.length === 0 && forrigeUke.length === 0 ? <Caps>INGEN MALER ELLER ØKTER FRA FORRIGE UKE</Caps> : <>
        {maler.length > 0 && <><Caps>ØKTMALER</Caps>{kildeRader(maler)}</>}
        {forrigeUke.length > 0 && <><Caps>FORRIGE UKE</Caps>{kildeRader(forrigeUke)}</>}</>)
    : side === "turn" ? <KnappLenke variant="secondary" size="sm" icon={Trophy} iconRight={ChevronRight} href={`/admin/workbench/${playerId}?pille=turn`}>Åpne turneringsmodulen</KnappLenke>
    : side === "tp" ? <>{tek.length === 0 ? <Caps>INGEN TEKNISKE OPPGAVER</Caps> : kildeRader(tek)}
        <KnappLenke variant="secondary" size="sm" icon={ClipboardList} href={`/admin/spillere/${playerId}/plan`}>Ny teknisk plan</KnappLenke></>
    : (goals.length === 0 ? <Caps>INGEN AKTIVE MÅLSETNINGER</Caps> : <div role="list" className="a9-liste">{goals.map((g, i) => <Listerad key={g.id} forste={i === 0} tittel={g.title}
        under={`${g.category === "OUTCOME" ? "RESULTATMÅL" : "PROSESSMÅL"} · ${PLAN_NIVAA_LABEL[g.planNivaa].toUpperCase()}`} verdi={g.fremdrift.hasData ? `${g.fremdrift.pct} %` : "—"} />)}</div>);

  const ukeKolonner = maned.weekSummaries;
  const tabellKolonner = { gridTemplateColumns: `44px repeat(${ukeKolonner.length + 1}, minmax(0, 1fr))` };

  return <Side max={1440}><div className="a9 am">
    <SideHode kicker="Workbench · Spiller" title="Workbench" />
    <div className="am-rad"><KnappLenke variant="ghost" size="sm" icon={ChevronLeft} href={workbenchUrl(playerId, "aar", { aar: String(aar) })}>Workbench · årsplan</KnappLenke></div>
    <Velger modus="spiller" navn={spillerNavn} onModus={(m) => { if (m === "gruppe") router.push("/admin/grupper"); }}
      onForrige={forrige} onNeste={neste} onSok={() => setVelger(true)}
      meta={`${roster.length} ${roster.length === 1 ? "SPILLER" : "SPILLERE"} I STALLEN`} />

    <nav role="tablist" aria-label="Planleggingsnivå" className="a9-faner">
      {nivaer.map(([n, href]) => <Valgpille key={n} rolle="tab" valgt={n === "Måned"} href={href}>{n}</Valgpille>)}
    </nav>
    <div className="am-rad" role="group" aria-label="Snarveier">
      {snarveier.map(([ic, l, href]) => <KnappLenke key={l} variant="secondary" size="sm" icon={ic} href={href}>{l}</KnappLenke>)}
    </div>

    <section className="pa-card a9-kort am-kort" aria-label="Måned">
      <div className="am-maned">
        <IkonKnapp icon={ChevronLeft} name="chevron-left" aria-label={UI.monthNavPrev} onClick={() => gaTil(-1)} />
        <div className="am-maned__tekst">
          <h2 className="am-maned__navn">{navn}</h2>
          <Caps>{maned.empty ? "INGEN ØKTER" : `${maned.sessionCount} ØKTER · ${timer(maned.budget.plannedMinutes)} PLANLAGT`}</Caps>
        </div>
        <Knapp variant="secondary" onClick={() => router.push(workbenchUrl(playerId, "maned", { maned: idag.slice(0, 7) }))}>{UI.today}</Knapp>
        <IkonKnapp icon={ChevronRight} name="chevron-right" aria-label={UI.monthNavNext} onClick={() => gaTil(1)} />
      </div>
      <Caps>{periode ? `${periode.type} · ${ddmm(periode.start)}–${ddmm(periode.slutt)}${periode.fokus ? ` · ${periode.fokus}` : ""}` : "INGEN PERIODE DEKKER MÅNEDEN"}</Caps>
    </section>

    {maned.empty ? <TomTilstand icon={CalendarX} title={UI.emptyMonthTitle} text={UI.emptyMonthBody}
      actions={<KnappLenke variant="secondary" href={uke(forsteUke?.weekStart)}>{UI.openWeek}</KnappLenke>} /> : null}

    <div className="a9-hoved am-hoved">
      <div className="am">
        <div className="am-to">
          <section className="pa-card a9-kort am-kort" aria-label="Fokus og mål">
            <span className="kicker">Fokus og mål</span>
            <p className="am-tekst">{periode?.fokus ?? "—"}</p>
            {budsjett && <Caps>{`UKEBUDSJETT · ØKTER PER UKE · ${budsjett}`}</Caps>}
            {goals.length === 0 ? <Caps>INGEN AKTIVE MÅLSETNINGER</Caps> : <div role="list">{goals.map((g) => <div role="listitem" key={g.id} className="a9-mal">
              <div className="a9-mal__topp"><span className="a9-mal__navn">{g.title}</span><span className="a9-mal__pct">{g.fremdrift.hasData ? `${g.fremdrift.pct} %` : "—"}</span></div>
              <Fremdrift pct={g.fremdrift.hasData ? g.fremdrift.pct : null} label={`Fremdrift ${g.title}`} />
              <Caps>{`${g.category === "OUTCOME" ? "Resultatmål" : "Prosessmål"} · ${g.typeLabel}${g.targetDate ? ` · frist ${ddmm(g.targetDate)}` : ""}`.toUpperCase()}</Caps>
            </div>)}</div>}
            <span className="kicker">Notat</span>
            <p className="am-tekst">—</p>
            <span className="kicker">Evaluering</span>
            <p className="am-tekst">—</p>
            <Caps>NOTAT OG EVALUERING PER MÅNED LAGRES IKKE ENNÅ</Caps>
          </section>

          <section className="pa-card a9-kort am-kort" aria-label="Fremdrift">
            <span className="kicker">{UI.periodProgress}</span>
            <span className="am-tall">{timer(maned.completedMinutes)} av {timer(maned.plannedToDateMinutes)}</span>
            <Fremdrift pct={pct} label="Gjennomført av planlagt til nå" />
            {pct != null && <Caps>{pct} % GJENNOMFØRT AV PLANLAGT TIL NÅ</Caps>}
          </section>
        </div>

        {!maned.empty && <>
          <section className="pa-card a9-kort am-kort" aria-label="Timer per akse">
            <span className="kicker">Timer per akse · planlagt per uke</span>
            <div role="table" aria-label={`Planlagte timer per akse per uke, ${navn}`}>
              <div role="row" className="am-akse am-akse--hode" style={tabellKolonner}><span role="columnheader">AKSE</span>
                {ukeKolonner.map((u) => <span role="columnheader" key={u.weekStart}>U{u.weekNumber}</span>)}<span role="columnheader">SUM</span></div>
              {AKSER.map((k) => <div role="row" className="am-akse" key={k} style={{ ...akseStil(akseFra(k)), ...tabellKolonner }}>
                <span role="rowheader" className="am-akse__navn">{k}</span>
                {ukeKolonner.map((u) => <span role="cell" className="am-tall" key={u.weekStart}>{uketimer(u.byPyramid[k])}</span>)}
                <span role="cell" className="am-tall">{uketimer(maned.budget.byPyramid[k])}</span>
              </div>)}
              <div role="row" className="am-akse am-akse--sum" style={tabellKolonner}><span role="rowheader" className="am-akse__navn">SUM</span>
                {ukeKolonner.map((u) => <span role="cell" className="am-tall" key={u.weekStart}>{uketimer(u.minutes)}</span>)}
                <span role="cell" className="am-tall">{uketimer(sumPlan)}</span></div>
            </div>
            <span className="kicker">Gjennomført hittil</span>
            <div role="table" aria-label={`Gjennomførte timer per akse, ${navn}`}>
              {AKSER.map((k) => <div role="row" className="am-akse" key={k} style={{ ...akseStil(akseFra(k)), gridTemplateColumns: "minmax(0, 1fr) auto" }}>
                <span role="rowheader" className="am-akse__navn">{k}</span><span role="cell" className="am-tall">{timer(maned.completedByPyramid[k])}</span>
              </div>)}
              <div role="row" className="am-akse am-akse--sum" style={{ gridTemplateColumns: "minmax(0, 1fr) auto" }}><span role="rowheader" className="am-akse__navn">SUM</span><span role="cell" className="am-tall">{timer(sumGjort)}</span></div>
            </div>
          </section>

          <section className="pa-card a9-kort am-kort" aria-label="Uker i måneden">
            <span className="kicker">Uker</span>
            <div role="list">
              {maned.weekSummaries.map((u, i) => <Link key={u.weekStart} href={uke(u.weekStart)} style={{ textDecoration: "none", color: "inherit" }}>
                <Listerad forste={i === 0} tittel={`Uke ${u.weekNumber}`} under={`${u.sessionCount} ØKTER`} verdi={<span className="am-tall">{timer(u.minutes)}</span>} />
              </Link>)}
            </div>
          </section>

          <section className="pa-card a9-kort am-kort" aria-label="Tester og turneringer">
            <span className="kicker">Tester og turneringer</span>
            {hendelser.length === 0 ? <Caps>INGEN TESTER ELLER TURNERINGER</Caps> : <div role="list">
              {hendelser.map((h, i) => <Listerad key={`${h.dato}:${h.tittel}`} forste={i === 0} akse={akseFra(h.pyramid)} tittel={h.tittel} under={ddmm(h.dato)} verdi={<Caps>{h.pyramid}</Caps>} />)}
            </div>}
            {harSkjulteLinjer(maned) && <Caps>NOEN DAGER HAR FLERE ØKTER ENN KALENDEREN VISER. ÅPNE UKA FOR ALT</Caps>}
          </section>

          <section className="pa-card a9-kort am-kort" aria-label={`Månedskalender ${navn}`}>
            <span className="kicker">Kalender</span>
            <Kalender playerId={playerId} maned={maned} idag={idag} />
            <Caps>{UI.monthHint.toUpperCase()}</Caps>
          </section>
        </>}
      </div>

      <section aria-label="Sidefelt" className="pa-card a9-sidefelt">
        <div role="tablist" aria-label="Sidefelt" className="a9-faner">{SIDEFELT.map(([k, l]) => <Valgpille key={k} rolle="tab" valgt={side === k} onClick={() => setSide(k)}>{l}</Valgpille>)}</div>
        {sideInnhold}
      </section>
    </div>

    {velger && <VelgerArk modus="spiller" liste={roster} valgtId={playerId} hrefFor={spillerHref} onLukk={() => setVelger(false)} />}
  </div></Side>;
}

function Kalender({ playerId, maned, idag }: { playerId: string; maned: MonthViewModel; idag: string }) {
  const dagerMedInnhold = maned.weeks.flatMap((u) => u.days.filter((d) => d.inMonth && (d.lines.length > 0 || d.restCount > 0)).map((d) => ({ d, uke: u.weekStart })));
  const linje = (dag: MonthDayCell, l: MonthDayCell["lines"][number], i: number) =>
    <span key={`${dag.date}:${i}`} className="am-linje" data-hairline={l.hairline} style={akseStil(akseFra(l.pyramid))}>{l.title}</span>;
  return <>
    <div className="am-dagliste" role="list" aria-label="Dager med økter">
      {dagerMedInnhold.length === 0 ? <Caps>INGEN DAGER MED ØKTER</Caps> : dagerMedInnhold.map(({ d, uke }) =>
        <Link key={d.date} role="listitem" className="am-dag" href={workbenchUrl(playerId, "uke", { uke })} aria-current={d.date === idag ? "date" : undefined}>
          <span className="am-dag__dato">{ddmm(d.date)}</span>
          <span className="am-dag__linjer">{d.lines.map((l, i) => linje(d, l, i))}{d.restCount > 0 && <Caps>{UI.moreCount(d.restCount)}</Caps>}</span>
        </Link>)}
    </div>
    <div className="am-kal" role="grid" aria-label="Månedskalender">
      <div className="am-kal__ukedager" role="row"><span aria-hidden />{UI.weekdayShort.map((dag) => <span key={dag} role="columnheader">{dag.toUpperCase()}</span>)}</div>
      {maned.weeks.map((u) => <div className="am-kal__uke" role="row" key={u.weekStart}>
        <Link className="am-kal__ukenr" href={workbenchUrl(playerId, "uke", { uke: u.weekStart })} aria-label={`Åpne uke ${u.weekNumber}`}>U{u.weekNumber}</Link>
        {u.days.map((d) => <Link key={d.date} role="gridcell" className="am-kal__celle" data-i-maned={d.inMonth} href={workbenchUrl(playerId, "uke", { uke: u.weekStart })} aria-current={d.date === idag ? "date" : undefined}>
          <span className="am-kal__dato">{d.dayOfMonth}.</span>
          {d.lines.map((l, i) => linje(d, l, i))}
          {d.restCount > 0 && <Caps>{UI.moreCount(d.restCount)}</Caps>}
        </Link>)}
      </div>)}
    </div>
  </>;
}
