"use client";

/**
 * PH-11-AR Årsplan — nytt design (pakke 3, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan.html, mal «ar». Stil: src/styles/playerhq-ny.css.
 *
 * Bare spilleren (PlayerHQ). Coachens årsplan (AG-11-AR) bruker fortsatt WorkbenchAar.
 *
 * Avvik:
 *   - Året er kalenderåret, ikke skoleåret: årsplanen lagres per kalenderår i dag
 *     (beslutninger.md §Workbench over uka, punkt 2, er ikke bygget).
 *   - Kilden på perioden er «Fra gruppa» eller «Egen». Appen lagrer ikke hvem i
 *     teamet som la inn en periode, så «Fra Anders» vises ikke.
 *   - «Ny periode» og «Ny årsplan» åpner dagens skjema. De får nytt design med
 *     PH-11-PERSKJEMA og PH-11-NY.
 *   - Piler for forrige og neste år er beholdt fra dagens Workbench.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { UI } from "@/lib/domain/workbench/labels";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { PyramidArea, YearPeriodBand, YearViewModel, YearWeekRow } from "@/lib/domain/workbench/types";
import { workbenchUrl, type WbVisning } from "@/lib/workbench/visning-url";
import type { PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { formaterVarighet } from "@/lib/format-tall";
import { AarsplanOppretter } from "@/components/workbench/WorkbenchAar";
import { PeriodeSkjema } from "@/components/workbench/WorkbenchPeriode";
import "@/styles/playerhq-ny.css";

const AKSER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const AKSE_FARGE: Record<PyramidArea, string> = { FYS: "var(--phn-fys)", TEK: "var(--phn-tek)", SLAG: "var(--phn-slag)", SPILL: "var(--phn-spill)", TURN: "var(--phn-turn)" };
const PERIODE_NAVN: Record<YearPeriodBand["type"], string> = {
  GRUNN: "Grunnperiode", SPESIAL: "Spesialperiode", TURNERING: "Turneringsperiode", EVALUERING: "Evaluering",
  TESTUKE: "Testuke", FERIE: "Ferie", TRENINGSSAMLING: "Treningssamling", HELDAGSSAMLING: "Heldagssamling", RESTITUSJON: "Restitusjon",
};
/** Hendelser i årsplanen, ikke treningsperioder (beslutninger.md, 28.09). */
const HENDELSE_TYPER = new Set<YearPeriodBand["type"]>(["TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"]);
const NIVAER: { id: WbVisning; navn: string }[] = [
  { id: "aar", navn: "År" }, { id: "periode", navn: "Periode" }, { id: "maned", navn: "Måned" }, { id: "uke", navn: "Uke" }, { id: "mal", navn: "Målsetninger" },
];
const kortDato = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" });
const langDato = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
const dato = (iso: string, f = kortDato) => f.format(new Date(`${iso}T00:00:00Z`));
const timer = (min: number) => (min > 0 ? formaterVarighet(min) : "—");
const ukeSpenn = (p: { startDate: string; endDate: string }) => {
  const a = isoWeekNumber(p.startDate), b = isoWeekNumber(p.endDate);
  return a === b ? `uke ${a}` : `uke ${a}–${b}`;
};

function StortTall({ minutter }: { minutter: number }) {
  const t = Math.floor(minutter / 60), m = minutter % 60;
  if (!t) return <strong>{m}<small>min</small></strong>;
  return <strong>{t}<small>t{m ? ` ${m} min` : ""}</small></strong>;
}

type Hendelse = { dato: string; slutt?: string; navn: string; klasse: "" | "test" | "konk"; tekst: string };

export type PH11AarsplanProps = {
  playerId: string;
  aar: YearViewModel;
  referanse: PlanReferanse;
  /** YYYY-MM-DD i Oslo. */
  idag: string;
};

export function PH11Aarsplan({ playerId, aar, referanse, idag }: PH11AarsplanProps) {
  const router = useRouter();
  const [skjema, setSkjema] = useState<"periode" | "aarsplan" | null>(null);
  const url = (visning: WbVisning, ref: PlanReferanse = {}) => workbenchUrl(playerId, visning, { ...referanse, aar: String(aar.year), ...ref }, "player");

  const uker = aar.weeks ?? [];
  const perioder = aar.periods.filter((p) => !HENDELSE_TYPER.has(p.type));
  const hendelser: Hendelse[] = [
    ...aar.periods.filter((p) => HENDELSE_TYPER.has(p.type)).map((p): Hendelse => ({
      dato: p.startDate, slutt: p.endDate, navn: p.focus ? `${PERIODE_NAVN[p.type]} · ${p.focus}` : PERIODE_NAVN[p.type],
      klasse: p.type === "TESTUKE" ? "test" : "", tekst: `${ukeSpenn(p)} · ${p.startDate === p.endDate ? dato(p.startDate) : `${dato(p.startDate)}–${dato(p.endDate)}`}`,
    })),
    ...aar.periods.flatMap((p) => p.turneringer).map((t): Hendelse => ({
      dato: t.dato, navn: t.navn, klasse: "konk", tekst: `uke ${isoWeekNumber(t.dato)} · ${dato(t.dato)} · konkurransedag`,
    })),
  ].sort((a, b) => (a.dato < b.dato ? -1 : 1));
  const planlagtTotalt = uker.reduce((s, u) => s + AKSER.reduce((t, a) => t + u.plannedByPyramid[a], 0), 0);
  const pst = aar.plannedToDateMinutes > 0 ? Math.round((aar.completedMinutes / aar.plannedToDateMinutes) * 100) : null;
  const aktivManed = idag.startsWith(`${aar.year}-`) ? Number(idag.slice(5, 7)) : null;
  const idagUke = uker.findIndex((u) => u.weekStart <= idag && idag <= addDager(u.weekStart, 6));

  return <div className="phn">
    <header className="phn-topp">
      <div className="phn-topp-rad">
        <div>
          <div className="phn-dato">Workbench · {aar.year}</div>
          <h1 className="phn-tittel">Årsplan</h1>
          <p className="phn-forklar">{dato(`${aar.year}-01-01`, langDato).replace(` ${aar.year}`, "")}–{dato(`${aar.year}-12-31`, langDato)} · {uker.length} uker{planlagtTotalt > 0 ? ` · ${timer(planlagtTotalt)} lagt inn` : ""}</p>
        </div>
        <div className="phn-knapper">
          <span className="phn-pil">
            <Link href={url("aar", { aar: String(aar.year - 1), periode: undefined })} aria-label={UI.yearNavPrev}><ChevronLeft className="phn-ikon" aria-hidden /></Link>
            <Link href={url("aar", { aar: String(aar.year + 1), periode: undefined })} aria-label={UI.yearNavNext}><ChevronRight className="phn-ikon" aria-hidden /></Link>
          </span>
          {aar.periods.length > 0 && <button type="button" className="phn-knapp pri" onClick={() => setSkjema("periode")}><Plus className="phn-ikon" aria-hidden />Ny periode</button>}
          <button type="button" className="phn-knapp sek" onClick={() => setSkjema("aarsplan")}>Ny årsplan</button>
        </div>
      </div>
      <nav className="phn-valg" aria-label="Nivå">
        {NIVAER.map((n) => <Link key={n.id} href={url(n.id)} aria-current={n.id === "aar" ? "page" : undefined}>{n.navn}</Link>)}
      </nav>
    </header>

    {aar.periods.length === 0 && uker.every((u) => AKSER.every((a) => !u.plannedByPyramid[a]))
      ? <section className="phn-kort" aria-label="Ingen årsplan">
          <div className="phn-sek-topp"><h2>Ingen årsplan for {aar.year}</h2></div>
          <p className="phn-forklar">Lag en årsplan med perioder. Ukene får timene sine fra perioden, og øktene du legger inn teller i året.</p>
          <div className="phn-knapper"><button type="button" className="phn-knapp pri" onClick={() => setSkjema("aarsplan")}>Opprett årsplan</button></div>
        </section>
      : <div className="phn-ar-grid">
          <section className="phn-kort" aria-label="Året uke for uke">
            <div className="phn-hoved"><StortTall minutter={aar.completedMinutes} />{pst !== null && <span className="phn-trend">{pst} % av plan</span>}</div>
            <p className="phn-forklar">{aar.plannedToDateMinutes > 0 ? `Gjennomført i ${aar.year}, av ${timer(aar.plannedToDateMinutes)} lagt inn til nå.` : `Ingen økter lagt inn i ${aar.year} til nå.`}</p>
            <div>
              <Aarsgraf uker={uker} idagUke={idagUke} idag={idag} />
              <div className="phn-band">
                {periodeBand(perioder, uker).map((b, i) => b.periode
                  ? <span key={b.periode.id} style={{ flexGrow: b.uker }} className={b.periode.aktiv ? "na" : undefined} title={`${PERIODE_NAVN[b.periode.type]}, ${ukeSpenn(b.periode)}`}>{b.uker >= 4 ? PERIODE_NAVN[b.periode.type] : ""}</span>
                  : <span key={`tom${i}`} style={{ flexGrow: b.uker }} aria-hidden />)}
              </div>
              <div className="phn-hendelser" aria-hidden>
                {hendelser.map((h, i) => {
                  const u = uker.findIndex((x) => x.weekStart <= h.dato && h.dato <= addDager(x.weekStart, 6));
                  return u < 0 ? null : <i key={i} className={h.klasse || undefined} style={{ left: `${((u + 0.5) / uker.length) * 100}%` }} />;
                })}
              </div>
            </div>
            <div className="phn-tegnforklaring"><span><i />Treningssamling</span><span><i className="test" />Testuke</span><span><i className="konk" />Konkurransedag</span></div>
            <div className="phn-lg-rad">{AKSER.map((a) => <span key={a} className="phn-lg"><i style={{ background: AKSE_FARGE[a] }} />{a}</span>)}</div>
            <div className="phn-seksjon" style={{ gap: 8 }}>
              <span className="phn-undertittel">Gå til måned</span>
              <div className="phn-mnd-knapper">
                {UI.monthNames.map((m, i) => <Link key={m} href={url("maned", { maned: `${aar.year}-${String(i + 1).padStart(2, "0")}` })} className={aktivManed === i + 1 ? "na" : undefined} aria-current={aktivManed === i + 1 ? "date" : undefined}>{m.slice(0, 3).toLowerCase()}</Link>)}
              </div>
            </div>
            <p className="phn-kilde">Gjennomført fra økter registrert i PlayerHQ · {aar.year}</p>
          </section>

          <section className="phn-seksjon" aria-label="Periodene">
            <div className="phn-sek-topp"><h2>Perioder</h2></div>
            <div className="phn-liste">
              {perioder.length === 0 && <p className="phn-forklar phn-prad">Ingen perioder ennå.</p>}
              {perioder.map((p) => <Link key={p.id} className={`phn-prad${p.aktiv ? " na" : ""}`} href={url("periode", { periode: p.id })}>
                <b>{PERIODE_NAVN[p.type]}</b>
                <small>{ukeSpenn(p)} · {dato(p.startDate)}–{dato(p.endDate)}</small>
                <span className={`phn-pille ${p.fraGruppe ? "vent" : "noy"}`}>{p.fraGruppe ? "Fra gruppa" : "Egen"}</span>
              </Link>)}
            </div>
            <div className="phn-seksjon" style={{ gap: 8, marginTop: 12 }}>
              <span className="phn-undertittel">Samlinger, tester og konkurranser</span>
              <div className="phn-liste">
                {hendelser.length === 0 && <p className="phn-forklar phn-prad">Ingen samlinger, tester eller turneringer i {aar.year}.</p>}
                {hendelser.map((h, i) => <div key={i} className="phn-prad"><b>{h.navn}</b><small>{h.tekst}</small></div>)}
              </div>
            </div>
          </section>
        </div>}

    {skjema === "periode" && <PeriodeSkjema playerId={playerId} year={aar.year} period={null} onClose={() => setSkjema(null)} onSaved={() => { setSkjema(null); router.refresh(); }} />}
    {skjema === "aarsplan" && <AarsplanOppretter playerId={playerId} year={aar.year} onClose={() => setSkjema(null)} />}
  </div>;
}

/** Lagt inn per uke i aksefargene. Gjennomførte uker skaleres til gjennomført tid og er mørke; kommende uker er lyse. */
function Aarsgraf({ uker, idagUke, idag }: { uker: YearWeekRow[]; idagUke: number; idag: string }) {
  const W = 360 / Math.max(1, uker.length), H = 100, TOPP = 14;
  const sum = (u: YearWeekRow) => AKSER.reduce((s, a) => s + u.plannedByPyramid[a], 0);
  const maks = Math.max(60, ...uker.map(sum));
  const forbi = (i: number) => addDager(uker[i].weekStart, 6) < idag;
  return <svg className="phn-aarsgraf" viewBox="0 0 360 110" role="img" aria-label="Lagt inn per uke i aksefargene. Gjennomførte uker er mørke, kommende uker lyse.">
    {uker.map((u, i) => {
      const total = sum(u);
      const skala = forbi(i) ? (total ? u.completedMinutes / total : 0) : 1;
      let y = H;
      return AKSER.map((a) => {
        const h = (u.plannedByPyramid[a] * skala / maks) * (H - TOPP);
        if (!h) return null;
        y -= h;
        return <rect key={`${i}${a}`} x={i * W + 0.8} y={y} width={Math.max(0.5, W - 1.6)} height={h} fill={AKSE_FARGE[a]} opacity={forbi(i) ? 1 : 0.38} />;
      });
    })}
    {idagUke >= 0 && <>
      <line x1={(idagUke + 0.5) * W} x2={(idagUke + 0.5) * W} y1={0} y2={H} stroke="var(--phn-g900)" strokeWidth={1.5} />
      <text x={(idagUke + 0.5) * W + (idagUke > uker.length * 0.75 ? -4 : 4)} y={9} textAnchor={idagUke > uker.length * 0.75 ? "end" : "start"} className="phn-gt">Nå · uke {uker[idagUke].weekNumber}</text>
    </>}
  </svg>;
}

/** Perioder og tomrom langs årets uker, så båndet står under riktig uke i grafen. */
function periodeBand(perioder: YearPeriodBand[], uker: YearWeekRow[]): { periode?: YearPeriodBand; uker: number }[] {
  const ukeFor = (iso: string) => uker.findIndex((u) => u.weekStart <= iso && iso <= addDager(u.weekStart, 6));
  const ut: { periode?: YearPeriodBand; uker: number }[] = [];
  let neste = 0;
  for (const p of perioder) {
    const fra = Math.max(neste, ukeFor(p.startDate) < 0 ? (p.startDate < (uker[0]?.weekStart ?? "") ? 0 : uker.length) : ukeFor(p.startDate));
    const tilRaw = ukeFor(p.endDate);
    const til = tilRaw < 0 ? (p.endDate > (uker.at(-1)?.weekStart ?? "") ? uker.length - 1 : -1) : tilRaw;
    if (til < fra) continue;
    if (fra > neste) ut.push({ uker: fra - neste });
    ut.push({ periode: p, uker: til - fra + 1 });
    neste = til + 1;
  }
  if (neste < uker.length) ut.push({ uker: uker.length - neste });
  return ut;
}

function addDager(iso: string, n: number) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}
