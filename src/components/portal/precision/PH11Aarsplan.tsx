"use client";

/**
 * PH-11-AR Årsplan — nytt design (pakke 3, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan-farge.html, mal «ar» (utkast 3 med farge og progresjon,
 * Anders 16.10). Stil: src/styles/playerhq-ny.css.
 *
 * Bare spilleren (PlayerHQ). Coachens årsplan (AG-11-AR) bruker fortsatt WorkbenchAar.
 *
 * Avvik:
 *   - Året er kalenderåret, ikke skoleåret: årsplanen lagres per kalenderår i dag
 *     (beslutninger.md §Workbench over uka, punkt 2, er ikke bygget).
 *   - Kilden på perioden er «Fra gruppa» eller «Egen». Appen lagrer ikke hvem i
 *     teamet som la inn en periode, så «Fra Anders» vises ikke.
 *   - «Ny årsplan» åpner dagens skjema til PH-11-NY er portert.
 *   - Piler for forrige og neste år er beholdt fra dagens Workbench.
 *   - Perioder og hendelser står fortsatt som lister under månedene, så ingen inngang forsvinner.
 *   - Månedsringen er grønn ved minst 90 % og gul under, for måneder som er gått; inneværende måned
 *     har hovedaksens farge. Måneder som kommer, står som «Kommer».
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { UI } from "@/lib/domain/workbench/labels";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { YearPeriodBand, YearViewModel, YearWeekRow } from "@/lib/domain/workbench/types";
import { workbenchUrl, type WbVisning } from "@/lib/workbench/visning-url";
import type { PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { AKSER, hovedakse, leggSammen, prosent, sum, tempo, ukeErNa, velgGrunnlag } from "@/lib/workbench/plan-progresjon";
import { AKSE_FARGE, HeltKort, HendelseListe, MiniRing, SoyleForklaring, tempoSetning } from "@/components/portal/precision/PlanProgresjon";
import { AarsplanOppretter } from "@/components/workbench/WorkbenchAar";
import { PH11PeriodeSkjema } from "@/components/portal/precision/PH11Periode";
import "@/styles/playerhq-ny.css";

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
const ukeSpenn = (p: { startDate: string; endDate: string }) => {
  const a = isoWeekNumber(p.startDate), b = isoWeekNumber(p.endDate);
  return a === b ? `uke ${a}` : `uke ${a}–${b}`;
};

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
      klasse: p.type === "TESTUKE" ? "test" : "", tekst: ukeSpenn(p),
    })),
    ...aar.periods.flatMap((p) => p.turneringer).map((t): Hendelse => ({
      dato: t.dato, navn: t.navn, klasse: "konk", tekst: `uke ${isoWeekNumber(t.dato)} · konkurransedag`,
    })),
  ].sort((a, b) => (a.dato < b.dato ? -1 : 1));
  const aktivManed = idag.startsWith(`${aar.year}-`) ? Number(idag.slice(5, 7)) : null;
  const gj = leggSammen(uker.map((u) => u.completedByPyramid));
  const { grunnlag, kilde } = velgGrunnlag(leggSammen(uker.map((u) => u.fordelt)), leggSammen(uker.map((u) => u.plannedByPyramid)));
  const aarStart = uker[0]?.weekStart ?? `${aar.year}-01-01`;
  const aarSlutt = uker.length ? addDager(uker[uker.length - 1].weekStart, 6) : `${aar.year}-12-31`;
  const t = tempo(uker.map((u) => ({ weekStart: u.weekStart, fordelt: u.fordelt, gjennomfort: u.completedMinutes })), idag);
  const tempoTekst = tempoSetning(t, { hva: "året", ferdig: aarSlutt < idag, startet: aarStart <= idag });
  const naUke = uker.find((u) => ukeErNa(u.weekStart, idag));
  const tom = aar.periods.length === 0 && uker.every((u) => sum(u.plannedByPyramid) === 0 && sum(u.fordelt) === 0);

  return <div className="phn">
    <header className="phn-topp">
      <div className="phn-topp-rad">
        <div>
          <div className="phn-dato">Workbench · {dato(`${aar.year}-01-01`, langDato).replace(` ${aar.year}`, "")}–{dato(`${aar.year}-12-31`, langDato)} · {uker.length} uker</div>
          <h1 className="phn-tittel">Årsplan {aar.year}</h1>
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

    {tom
      ? <section className="phn-kort" aria-label="Ingen årsplan">
          <div className="phn-sek-topp"><h2>Ingen årsplan for {aar.year}</h2></div>
          <p className="phn-forklar">Lag en årsplan med perioder. Ukene får timene sine fra perioden, og øktene du legger inn teller i året.</p>
          <div className="phn-knapper"><button type="button" className="phn-knapp pri" onClick={() => setSkjema("aarsplan")}>Opprett årsplan</button></div>
        </section>
      : <div className="phn-to-kol">
          <div className="phn-kol">
            <HeltKort label="Året i tall" tittel={aarSlutt < idag ? `Hele ${aar.year}` : "Året så langt"} gj={gj} grunnlag={grunnlag} kilde={kilde} under="av året" tempo={tempoTekst}
              fase={t.status !== "ukjent" || t.gatteUker > 0 ? <p className="phn-kilde">{t.gatteUker} av {uker.length} uker er gått.</p> : undefined} />

            <section className="phn-kort" aria-label="Uke for uke gjennom året">
              <div className="phn-sek-topp"><h2>Uke for uke</h2>{uker.length > 0 && <span className="phn-kilde">uke {uker[0].weekNumber}–{uker[uker.length - 1].weekNumber}{naUke ? ` · nå uke ${naUke.weekNumber}` : ""}</span>}</div>
              <div className="phn-aarsgraf">
                <Aarsuker uker={uker} idag={idag} />
                <div className="phn-periodebaand">
                  {periodeBand(perioder, uker).map((b, i) => b.periode
                    ? <span key={b.periode.id} className={`type-${b.periode.type}`} style={{ flex: `${b.uker} 1 0` }} title={`${PERIODE_NAVN[b.periode.type]}, ${ukeSpenn(b.periode)}`}>{PERIODE_NAVN[b.periode.type]}</span>
                    : <span key={`tom${i}`} className="tom" style={{ flex: `${b.uker} 1 0` }} aria-hidden />)}
                </div>
              </div>
              <SoyleForklaring lys="Fordelt" strek={false} />
              <p className="phn-kilde">Uker uten fordeling viser det som er lagt inn. Gjennomført fra økter registrert i PlayerHQ.</p>
            </section>
          </div>

          <div className="phn-kol">
            <section className="phn-kort" aria-label="Månedene">
              <div className="phn-sek-topp"><h2>Månedene</h2></div>
              <div className="phn-maneder">
                {UI.monthNames.map((m, i) => {
                  const nr = i + 1;
                  const mu = uker.filter((u) => Number(addDager(u.weekStart, 3).slice(5, 7)) === nr && addDager(u.weekStart, 3).startsWith(`${aar.year}-`));
                  const f = mu.reduce((s, u) => s + sum(u.fordelt), 0), lagt = mu.reduce((s, u) => s + sum(u.plannedByPyramid), 0);
                  const g = mu.reduce((s, u) => s + u.completedMinutes, 0);
                  const p = prosent(g, f > 0 ? f : lagt);
                  const sist = new Date(Date.UTC(aar.year, nr, 0)).toISOString().slice(0, 10);
                  const forbi = sist < idag, na = aktivManed === nr;
                  const akse = hovedakse(leggSammen(mu.map((u) => u.fordelt ?? u.plannedByPyramid)));
                  const farge = na ? (akse ? AKSE_FARGE[akse] : "var(--phn-g900)") : p !== null && p >= 90 ? "var(--phn-green-700)" : "var(--phn-amber-700)";
                  return <Link key={m} className={`phn-mnd${na ? " na" : ""}`} aria-current={na ? "date" : undefined} href={url("maned", { maned: `${aar.year}-${String(nr).padStart(2, "0")}` })}
                    aria-label={`${m}: ${forbi || na ? (p === null ? "ingen timer" : `${p} prosent gjennomført`) : "kommer"}`}>
                    <MiniRing pst={forbi || na ? p : null} farge={farge} />
                    <b>{m.length <= 4 ? m : `${m.slice(0, 3)}.`}</b>
                    <small>{forbi || na ? (p === null ? "—" : `${p} %`) : "Kommer"}</small>
                  </Link>;
                })}
              </div>
            </section>

            <section className="phn-kort" aria-label="Periodene">
              <div className="phn-sek-topp"><h2>Perioder</h2></div>
              <div className="phn-liste">
                {perioder.length === 0 && <p className="phn-forklar phn-prad">Ingen perioder ennå.</p>}
                {perioder.map((p) => <Link key={p.id} className={`phn-prad${p.aktiv ? " na" : ""}`} href={url("periode", { periode: p.id })}>
                  <b>{PERIODE_NAVN[p.type]}</b>
                  <small>{ukeSpenn(p)} · {dato(p.startDate)}–{dato(p.endDate)}</small>
                  <span className={`phn-pille ${p.fraGruppe ? "vent" : "noy"}`}>{p.fraGruppe ? "Fra gruppa" : "Egen"}</span>
                </Link>)}
              </div>
            </section>

            <section className="phn-kort" aria-label="Samlinger, tester og konkurranser">
              <div className="phn-sek-topp"><h2>Tester og samlinger</h2></div>
              <HendelseListe tom={`Ingen samlinger, tester eller turneringer i ${aar.year}.`} liste={hendelser.map((h) => ({
                type: h.klasse === "test" ? "test" : h.klasse === "konk" ? "turn" : "samling", navn: h.navn, tekst: h.tekst,
                dato: h.slutt && h.slutt !== h.dato ? `${dato(h.dato)}–${dato(h.slutt)}` : dato(h.dato),
              }))} />
            </section>
          </div>
        </div>}

    {skjema === "periode" && <PH11PeriodeSkjema playerId={playerId} year={aar.year} periode={null} onLukk={() => setSkjema(null)} onLagret={() => { setSkjema(null); router.refresh(); }} />}
    {skjema === "aarsplan" && <AarsplanOppretter playerId={playerId} year={aar.year} onClose={() => setSkjema(null)} />}
  </div>;
}

/** Hele året som søyler: mørk = gjennomført, lys = resten av det som er fordelt (eller lagt inn når uka ikke er fordelt). */
function Aarsuker({ uker, idag }: { uker: YearWeekRow[]; idag: string }) {
  const grunn = (u: YearWeekRow) => (sum(u.fordelt) > 0 ? u.fordelt ?? null : u.plannedByPyramid);
  const maks = Math.max(1, ...uker.map((u) => Math.max(sum(grunn(u)), u.completedMinutes)));
  return <div className="phn-aarsuker" role="img" aria-label="Uke for uke i aksefargene. Mørk er gjennomført, lys er fordelt.">
    {uker.map((u, k) => <div key={u.weekStart} className={ukeErNa(u.weekStart, idag) ? "na" : undefined} title={`Uke ${u.weekNumber}`}>
      {AKSER.flatMap((a) => {
        const g = u.completedByPyramid?.[a] ?? 0, l = Math.max(0, (grunn(u)?.[a] ?? 0) - g);
        return [
          g ? <i key={`${a}g`} style={{ height: `${(g / maks) * 100}%`, background: AKSE_FARGE[a], animationDelay: `${k * 10}ms` }} /> : null,
          l ? <i key={`${a}l`} className="lys" style={{ height: `${(l / maks) * 100}%`, background: AKSE_FARGE[a], animationDelay: `${k * 10}ms` }} /> : null,
        ];
      })}
    </div>)}
  </div>;
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
