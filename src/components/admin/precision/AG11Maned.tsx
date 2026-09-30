"use client";

/**
 * AG-11-MND Workbench · måned i Precision Athletics (coach). Tegning: Claude
 * Design 7d7c2994, ui_kits/agencyos/screens/AG-11-wb3.jsx (AG-11-MND) og
 * ui_kits/_shared/WB3-ar.jsx (Mid, måned).
 *
 * Bygget på MonthViewModel (loadMonth), uendret. Planlagt og gjennomført per
 * akse for måneden, uker med økter og timer, tester og turneringer fra
 * månedskalenderen, og selve kalenderen. Fokus, mål, notat og evaluering har
 * ingen lagring i databasen i dag: de vises som «—». Månedsskjemaet
 * (AG-11-MNDSKJEMA) er ikke bygget fordi det ikke har noe sted å lagre
 * (forslag: tabellen MonthPlan, se PR-en).
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarX, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Knapp, KnappLenke, TomTilstand } from "@/components/precision/pa";
import { IkonKnapp } from "@/components/precision/pa-a2";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { Caps, Fremdrift, Listerad, Valgpille, akseFra, akseStil } from "@/components/precision/pa-workbench";
import { osloIdag } from "@/components/workbench/WeekGrid";
import { addMonths } from "@/lib/domain/workbench/operations";
import { UI } from "@/lib/domain/workbench/labels";
import type { MonthDayCell, MonthViewModel, PyramidArea } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { hentHendelser, harSkjulteLinjer, timer } from "@/lib/workbench/maned-visning";
import { VelgerArk } from "./AG11Ark";
import "@/styles/precision-a9.css";
import "@/styles/precision-a1130.css";

export type AG11ManedProps = {
  playerId: string;
  spillerNavn: string;
  maned: MonthViewModel;
  roster: readonly { id: string; navn: string }[];
};

const AKSER: readonly PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const ddmm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

export function AG11Maned({ playerId, spillerNavn, maned, roster }: AG11ManedProps) {
  const router = useRouter();
  const idag = osloIdag();
  const [velger, setVelger] = useState(false);
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
    ["Stall", workbenchUrl(playerId, "stall", { uke: forsteUke?.weekStart })],
    ["Live", workbenchUrl(playerId, "live", { uke: forsteUke?.weekStart })],
    ["Min kalender", workbenchUrl(playerId, "min", { uke: forsteUke?.weekStart })],
  ];

  return <Side max={1440}><div className="am">
    <SideHode kicker={`Workbench · Måned · ${spillerNavn}`} title={navn}
      sub={maned.empty ? undefined : `${maned.sessionCount} økter · ${timer(maned.budget.plannedMinutes)} planlagt`}
      actions={<>
        <Knapp variant="secondary" icon={Users} onClick={() => setVelger(true)}>Bytt spiller</Knapp>
        <IkonKnapp icon={ChevronLeft} name="chevron-left" aria-label={UI.monthNavPrev} onClick={() => gaTil(-1)} />
        <Knapp variant="secondary" size="sm" onClick={() => router.push(workbenchUrl(playerId, "maned", { maned: idag.slice(0, 7) }))}>{UI.today}</Knapp>
        <IkonKnapp icon={ChevronRight} name="chevron-right" aria-label={UI.monthNavNext} onClick={() => gaTil(1)} />
      </>} />

    <nav role="tablist" aria-label="Planleggingsnivå" className="am-rad">
      {nivaer.map(([n, href]) => <Valgpille key={n} rolle="tab" valgt={n === "Måned"} href={href}>{n}</Valgpille>)}
    </nav>

    {maned.empty ? <TomTilstand icon={CalendarX} title={UI.emptyMonthTitle} text={UI.emptyMonthBody}
      actions={<KnappLenke variant="secondary" href={uke(forsteUke?.weekStart)}>{UI.openWeek}</KnappLenke>} /> : <>
      <div className="am-to">
        <section className="pa-card a9-kort am-kort" aria-label="Fokus og mål">
          <span className="kicker">Fokus og mål</span>
          <p className="am-tekst">—</p>
          <Caps>FOKUS, MÅL, NOTAT OG EVALUERING LAGRES IKKE ENNÅ</Caps>
          <span className="kicker">Notat</span>
          <p className="am-tekst">—</p>
          <span className="kicker">Evaluering</span>
          <p className="am-tekst">—</p>
        </section>

        <section className="pa-card a9-kort am-kort" aria-label="Fremdrift">
          <span className="kicker">{UI.periodProgress}</span>
          <span className="am-tall">{timer(maned.completedMinutes)} av {timer(maned.plannedToDateMinutes)}</span>
          <Fremdrift pct={pct} label="Gjennomført av planlagt til nå" />
          {pct != null && <Caps>{pct} % GJENNOMFØRT AV PLANLAGT TIL NÅ</Caps>}
        </section>
      </div>

      <div className="am-to">
        <section className="pa-card a9-kort am-kort" aria-label="Timer per akse">
          <span className="kicker">Timer per akse · måneden</span>
          <div role="table" aria-label={`Timer per akse, ${navn}`}>
            <div role="row" className="am-akse am-akse--hode"><span role="columnheader">AKSE</span><span role="columnheader">PLANLAGT</span><span role="columnheader">GJENNOMFØRT</span></div>
            {AKSER.map((k) => <div role="row" className="am-akse" key={k} style={akseStil(akseFra(k))}>
              <span role="rowheader" className="am-akse__navn">{k}</span>
              <span role="cell" className="am-tall">{timer(maned.budget.byPyramid[k])}</span>
              <span role="cell" className="am-tall">{timer(maned.completedByPyramid[k])}</span>
            </div>)}
            <div role="row" className="am-akse am-akse--sum"><span role="rowheader" className="am-akse__navn">SUM</span><span role="cell" className="am-tall">{timer(sumPlan)}</span><span role="cell" className="am-tall">{timer(sumGjort)}</span></div>
          </div>
          <Caps>FORDELING PÅ UKENE ER IKKE LAGRET PER AKSE ENNÅ</Caps>
        </section>

        <section className="pa-card a9-kort am-kort" aria-label="Uker i måneden">
          <span className="kicker">Uker</span>
          <div role="list">
            {maned.weekSummaries.map((u, i) => <Link key={u.weekStart} href={uke(u.weekStart)} style={{ textDecoration: "none", color: "inherit" }}>
              <Listerad forste={i === 0} tittel={`Uke ${u.weekNumber}`} under={`${u.sessionCount} ØKTER`} verdi={<span className="am-tall">{timer(u.minutes)}</span>} />
            </Link>)}
          </div>
        </section>
      </div>

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

    {velger && <VelgerArk modus="spiller" liste={roster} valgtId={playerId} hrefFor={(id) => workbenchUrl(id, "maned", { maned: ym })} onLukk={() => setVelger(false)} />}
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
