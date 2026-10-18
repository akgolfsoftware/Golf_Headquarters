"use client";

/**
 * PH-11-PER Periode og PH-11-PERSKJEMA Periodeskjema — nytt design (pakke 3, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan-farge.html, mal «per» (utkast 3 med farge og progresjon,
 * Anders 16.10), og plan.html mal «perskjema» for skjemaet. Stil: src/styles/playerhq-ny.css.
 *
 * Bare spilleren (PlayerHQ, §SPILLERENS WORKBENCH FÅR NIVÅENE). Coachen bruker fortsatt WorkbenchPeriode.
 *
 * Avvik:
 *   - Fordelt per uke leses fra ukeplanen (WeekPlan.plannedHours*). «Lett»-merket på ukene finnes ikke,
 *     fordi appen ikke lagrer hvilke uker som er lette.
 *   - Målsetninger knyttet til perioden finnes ikke i appen. Når perioden er over, lenker siden til «Perioden er ferdig» (pakke 17b).
 *   - Kilden er «Fra gruppa» eller «Egen»; appen lagrer ikke hvem som la inn perioden.
 *   - Skjemaet beholder dagens felt som utkastet ikke viser (lett uke, øktbudsjett, min og maks per uke),
 *     under «Flere valg». Testuke og samlinger kan fortsatt velges som type.
 *   - «Publiser periode» er beholdt for utkast i perioden.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Plus, X } from "lucide-react";
import { UI } from "@/lib/domain/workbench/labels";
import { isoWeekNumber, validateWeek } from "@/lib/domain/workbench/operations";
import type { PeriodType, PeriodViewModel, PyramidArea, YearPeriodBand } from "@/lib/domain/workbench/types";
import { workbenchUrl, type WbVisning } from "@/lib/workbench/visning-url";
import type { PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { fordelingKvittering } from "@/lib/workbench/periode-ukefordeling-regler";
import { deleteSeasonPeriod, publishSessions, saveSeasonPeriod } from "@/lib/workbench/wb-actions";
import { formaterVarighet } from "@/lib/format-tall";
import { leggSammen, tempo, ukeErGatt, ukeErNa, velgGrunnlag } from "@/lib/workbench/plan-progresjon";
import { FordelingStolper, HeltKort, HendelseListe, SoyleForklaring, UkeSoyler, tempoSetning, varighet, type PlanHendelse, type SoyleUke } from "@/components/portal/precision/PlanProgresjon";
import { PublishConfirmDialog } from "@/components/workbench/PublishConfirmDialog";
import { periodeFerdigHref } from "@/lib/portal/plan-hjelpere-videresending";
import "@/styles/playerhq-ny.css";

const AKSER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const AKSE_KLASSE: Record<PyramidArea, string> = { FYS: "akse-fys", TEK: "akse-tek", SLAG: "akse-slag", SPILL: "akse-spill", TURN: "akse-turn" };
export const PERIODE_NAVN: Record<PeriodType, string> = {
  GRUNN: "Grunnperiode", SPESIAL: "Spesialperiode", TURNERING: "Turneringsperiode", EVALUERING: "Evaluering", FERIE: "Ferie", RESTITUSJON: "Restitusjon",
  TESTUKE: "Testuke", TRENINGSSAMLING: "Treningssamling", HELDAGSSAMLING: "Heldagssamling",
};
const TYPER = Object.keys(PERIODE_NAVN) as PeriodType[];
const HENDELSE_TYPER = new Set<PeriodType>(["TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"]);
const NIVAER: { id: WbVisning; navn: string }[] = [
  { id: "aar", navn: "År" }, { id: "periode", navn: "Periode" }, { id: "maned", navn: "Måned" }, { id: "uke", navn: "Uke" }, { id: "mal", navn: "Målsetninger" },
];
const kortDato = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" });
const langDato = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
const dato = (iso: string, f = kortDato) => f.format(new Date(`${iso}T00:00:00Z`));
const sum = (m: Partial<Record<PyramidArea, number>> | null | undefined) => AKSER.reduce((s, a) => s + (m?.[a] ?? 0), 0);
function addDager(iso: string, n: number) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}
const spenn = (x: { startDate: string; endDate: string }) => (x.startDate === x.endDate ? dato(x.startDate) : `${dato(x.startDate)}–${dato(x.endDate)}`);
function ukeSpenn(p: { startDate: string; endDate: string }) {
  const a = isoWeekNumber(p.startDate), b = isoWeekNumber(p.endDate);
  return a === b ? `uke ${a}` : `uke ${a}–${b}`;
}

export type PH11PeriodeProps = {
  playerId: string;
  periode: PeriodViewModel;
  referanse: PlanReferanse;
  /** YYYY-MM-DD i Oslo. */
  idag: string;
};

export function PH11Periode({ playerId, periode, referanse, idag }: PH11PeriodeProps) {
  const router = useRouter();
  const [skjema, setSkjema] = useState<"ny" | "rediger" | null>(null);
  const [publiserApen, setPubliserApen] = useState(false);
  const [valgte, setValgte] = useState<Set<string>>(new Set());
  const [publiserer, startPublisering] = useTransition();
  const p = periode.period;
  const url = (visning: WbVisning, ref: PlanReferanse = {}) => workbenchUrl(playerId, visning, { ...referanse, aar: String(periode.year), periode: p?.id, ...ref }, "player");

  const perioder = periode.periods.filter((x) => !HENDELSE_TYPER.has(x.type) || x.id === p?.id);
  const indeks = p ? perioder.findIndex((x) => x.id === p.id) : -1;
  const utkast = useMemo(() => periode.sessions.filter((s) => s.status === "DRAFT"), [periode.sessions]);
  const notater = useMemo(() => validateWeek(periode.sessions), [periode.sessions]);
  const opptatt = useMemo(() => new Set(notater.map((n) => n.sessionId).filter((id): id is string => Boolean(id))), [notater]);

  function publiser(ider: string[]) {
    if (!ider.length) return;
    startPublisering(async () => {
      const r = await publishSessions(ider);
      if (!r.ok) { toast.error(r.error); return; }
      setPubliserApen(false);
      toast.success(r.data.length === 1 ? UI.toastPublishedOne : UI.toastPublishedMany(r.data.length));
      router.refresh();
    });
  }

  const nivaer = <nav className="phn-valg" aria-label="Nivå">
    {NIVAER.map((n) => <Link key={n.id} href={url(n.id)} aria-current={n.id === "periode" ? "page" : undefined}>{n.navn}</Link>)}
  </nav>;

  if (!p) {
    return <div className="phn">
      <header className="phn-topp">
        <div className="phn-topp-rad"><div><div className="phn-dato">Workbench · {periode.year}</div><h1 className="phn-tittel">Periode</h1></div></div>
        {nivaer}
      </header>
      <section className="phn-kort" aria-label="Ingen perioder">
        <div className="phn-sek-topp"><h2>Ingen perioder i {periode.year}</h2></div>
        <p className="phn-forklar">En periode fordeler timer per akse på ukene. Lag den første, så får ukene timene sine herfra.</p>
        <div className="phn-knapper"><button type="button" className="phn-knapp pri" onClick={() => setSkjema("ny")}><Plus className="phn-ikon" aria-hidden />Ny periode</button></div>
      </section>
      {skjema && <PH11PeriodeSkjema playerId={playerId} year={periode.year} periode={null} onLukk={() => setSkjema(null)} onLagret={() => { setSkjema(null); router.refresh(); }} />}
    </div>;
  }

  const fase = p.endDate < idag ? "for" : p.startDate > idag ? "etter" : "na";
  const omUker = Math.max(1, Math.ceil((dagNr(p.startDate) - dagNr(idag)) / 7));
  const vanlig = p.axisMinutes ?? null;
  const lett = sum(p.axisMinutesLight);
  const iPerioden = (x: { startDate: string }) => x.startDate >= p.startDate && x.startDate <= p.endDate;
  const testuker = periode.periods.filter((x) => x.type === "TESTUKE" && iPerioden(x));
  const samlinger = periode.periods.filter((x) => (x.type === "TRENINGSSAMLING" || x.type === "HELDAGSSAMLING") && iPerioden(x) && x.id !== p.id);
  const uker = periode.weeks;
  const gj = leggSammen(uker.map((u) => u.completedByPyramid));
  const { grunnlag, kilde } = velgGrunnlag(leggSammen(uker.map((u) => u.fordelt)), leggSammen(uker.map((u) => u.byPyramid)));
  const naIndeks = uker.findIndex((u) => ukeErNa(u.weekStart, idag));
  const naUke = naIndeks >= 0 ? uker[naIndeks] : null;
  const t = tempo(uker.map((u) => ({ weekStart: u.weekStart, fordelt: u.fordelt, gjennomfort: u.completedMinutes })), idag);
  const tempoTekst = tempoSetning(t, { hva: "perioden", ferdig: fase === "for", startet: fase !== "etter", lagtDenneUka: naUke ? sum(naUke.byPyramid) : 0 });
  const nesteTest = testuker.find((x) => x.startDate >= idag);
  const tittel = fase === "for" ? "Perioden er ferdig" : fase === "etter" ? `Starter om ${omUker} ${omUker === 1 ? "uke" : "uker"}` : `Uke ${naIndeks + 1} av ${uker.length}`;
  const soyler: SoyleUke[] = uker.map((u) => ({
    nokkel: u.weekStart, weekNumber: u.weekNumber, href: url("uke", { uke: u.weekStart }),
    gj: u.completedByPyramid, lagtInn: u.byPyramid, fordelt: sum(u.fordelt) > 0 ? sum(u.fordelt) : null,
    na: ukeErNa(u.weekStart, idag), gatt: ukeErGatt(u.weekStart, idag), dato: dato(u.weekStart),
    merke: testuker.some((x) => x.startDate <= addDager(u.weekStart, 6) && x.endDate >= u.weekStart) ? "Testuke" : null,
  }));
  const hendelser: PlanHendelse[] = [
    ...testuker.map((x): PlanHendelse & { s: string } => ({ type: "test", navn: x.focus ? `Testuke · ${x.focus}` : "Testuke", tekst: ukeSpenn(x), dato: spenn(x), s: x.startDate })),
    ...samlinger.map((x): PlanHendelse & { s: string } => ({ type: "samling", navn: x.focus ? `${PERIODE_NAVN[x.type]} · ${x.focus}` : PERIODE_NAVN[x.type], tekst: ukeSpenn(x), dato: spenn(x), s: x.startDate })),
    ...p.turneringer.map((x): PlanHendelse & { s: string } => ({ type: "turn", navn: x.navn, tekst: `uke ${isoWeekNumber(x.dato)} · konkurransedag`, dato: dato(x.dato), s: x.dato })),
  ].sort((a, b) => a.s.localeCompare(b.s));

  return <div className="phn">
    <header className="phn-topp">
      <div className="phn-topp-rad">
        <div>
          <div className="phn-dato">Workbench · {ukeSpenn(p)} · {p.fraGruppe ? "Fra gruppa" : "Egen"}</div>
          <h1 className="phn-tittel">{PERIODE_NAVN[p.type]}</h1>
          <p className="phn-forklar">{dato(p.startDate, langDato).replace(` ${p.startDate.slice(0, 4)}`, p.startDate.slice(0, 4) === p.endDate.slice(0, 4) ? "" : ` ${p.startDate.slice(0, 4)}`)}–{dato(p.endDate, langDato)}.</p>
        </div>
        <div className="phn-knapper">
          <span className="phn-pil">
            {indeks > 0 ? <Link href={url("periode", { periode: perioder[indeks - 1].id })} aria-label="Forrige periode"><ChevronLeft className="phn-ikon" aria-hidden /></Link> : <span aria-hidden className="phn-pil-av"><ChevronLeft className="phn-ikon" /></span>}
            {indeks >= 0 && indeks < perioder.length - 1 ? <Link href={url("periode", { periode: perioder[indeks + 1].id })} aria-label="Neste periode"><ChevronRight className="phn-ikon" aria-hidden /></Link> : <span aria-hidden className="phn-pil-av"><ChevronRight className="phn-ikon" /></span>}
          </span>
          <button type="button" className="phn-knapp sek" onClick={() => setSkjema("rediger")}><Pencil className="phn-ikon" aria-hidden />Endre periode</button>
          <button type="button" className="phn-knapp sek" onClick={() => setSkjema("ny")}><Plus className="phn-ikon" aria-hidden />Ny periode</button>
          {utkast.length > 0 && <button type="button" className="phn-knapp pri" disabled={publiserer} onClick={() => { setValgte(new Set(utkast.filter((s) => !opptatt.has(s.id)).map((s) => s.id))); setPubliserApen(true); }}>{UI.publishPeriod} ({utkast.length})</button>}
        </div>
      </div>
      {nivaer}
    </header>

    <div className="phn-to-kol">
      <div className="phn-kol">
        <HeltKort label="Perioden i tall" className={`phn-periode-topp type-${p.type}`} tittel={tittel} gj={gj} grunnlag={grunnlag} kilde={kilde} under="av perioden"
          tempo={{ status: tempoTekst.status, tekst: <>{tempoTekst.tekst}{nesteTest && fase !== "for" ? ` Neste test er testuka ${dato(nesteTest.startDate).replace(/\.$/, "")}.` : ""}</> }}
          fase={uker.length > 0 ? <div className="phn-fase" role="img" aria-label={fase === "na" ? `Uke ${naIndeks + 1} av ${uker.length}` : tittel}>
            {uker.map((u) => <span key={u.weekStart} className={ukeErGatt(u.weekStart, idag) ? "ferdig" : ukeErNa(u.weekStart, idag) ? "na" : undefined} />)}
          </div> : undefined} />

        <section className="phn-kort" aria-label="Ukene">
          <div className="phn-sek-topp"><h2>Ukene</h2>{naUke && <Link className="phn-lenke" href={url("uke", { uke: naUke.weekStart })}>Åpne uka</Link>}</div>
          {uker.length > 0 ? <UkeSoyler uker={soyler} /> : <p className="phn-forklar">Ingen uker i perioden.</p>}
          <SoyleForklaring />
        </section>
        {fase === "for" && <Link className="phn-knapp sek" style={{ justifySelf: "start" }} href={periodeFerdigHref(p.id)}>Perioden er ferdig: se hvordan den gikk</Link>}
      </div>

      <div className="phn-kol">
        <section className="phn-kort" aria-label="Fokus">
          <span className="phn-undertittel">Fokus</span>
          <p className="phn-fokus">{p.focus ?? "Ikke satt."}</p>
          {vanlig && sum(vanlig) > 0
            ? <FordelingStolper m={vanlig} />
            : <p className="phn-forklar">Timer per uke er ikke satt. Velg «Endre periode» for å fordele timer per akse.</p>}
          {(vanlig || lett > 0 || testuker.length > 0) && <p className="phn-kilde">
            {vanlig ? `Timer per vanlig uke, sum ${varighet(sum(vanlig))}.` : ""}{lett > 0 ? ` Lett uke: ${varighet(lett)}.` : ""}{testuker.length ? ` ${testuker.map((x) => `Uke ${isoWeekNumber(x.startDate)}`).join(" og ")} er testuke.` : ""}
          </p>}
        </section>
        <section className="phn-kort" aria-label="Tester og samlinger">
          <div className="phn-sek-topp"><h2>Tester og samlinger</h2></div>
          <HendelseListe liste={hendelser} tom="Ingen tester, samlinger eller turneringer i perioden." />
        </section>
        {p.notat && <section className="phn-kort" aria-label="Notat">
          <span className="phn-undertittel">Notat</span>
          <div className="phn-sitat">{p.notat}</div>
        </section>}
      </div>
    </div>

    {skjema && <PH11PeriodeSkjema playerId={playerId} year={periode.year} periode={skjema === "rediger" ? p : null} onLukk={() => setSkjema(null)} onLagret={() => { setSkjema(null); router.refresh(); }} />}
    <PublishConfirmDialog
      open={publiserApen} okter={utkast} idag={idag} kicker={PERIODE_NAVN[p.type]} notater={notater} opptattIder={opptatt} valgte={valgte}
      onVeksle={(id) => setValgte((f) => { const n = new Set(f); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
      onVelgAlle={() => setValgte((f) => (f.size === utkast.length ? new Set() : new Set(utkast.map((s) => s.id))))}
      publiserer={publiserer} onLukk={() => setPubliserApen(false)}
      onPubliserValgte={() => publiser(utkast.filter((s) => valgte.has(s.id)).map((s) => s.id))}
      onPubliserAlle={() => publiser(utkast.map((s) => s.id))}
    />
  </div>;
}

type Akser = Record<PyramidArea, number>;
const TOM: Akser = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
/** Alt på 0 = ikke satt (null), så perioden ikke lagres med en falsk fordeling. */
const tilAkser = (m: Akser) => (AKSER.some((a) => m[a] > 0) ? m : null);

/** Periodeskjema: ark på mobil, dialog på PC. Rust bare på «Slett periode». */
export function PH11PeriodeSkjema({ playerId, year, periode, onLukk, onLagret }: {
  playerId: string; year: number; periode: YearPeriodBand | null; onLukk: () => void; onLagret: () => void;
}) {
  const ark = useRef<HTMLDialogElement>(null);
  const [type, setType] = useState<PeriodType>(periode?.type ?? "GRUNN");
  const [fra, setFra] = useState(periode?.startDate ?? `${year}-01-01`);
  const [til, setTil] = useState(periode?.endDate ?? `${year}-03-31`);
  const [fokus, setFokus] = useState(periode?.focus ?? "");
  const [notat, setNotat] = useState(periode?.notat ?? "");
  const [vanlig, setVanlig] = useState<Akser>({ ...TOM, ...(periode?.axisMinutes ?? {}) });
  const [lett, setLett] = useState<Akser>({ ...TOM, ...(periode?.axisMinutesLight ?? {}) });
  const [budsjett, setBudsjett] = useState<Akser>({ ...TOM, ...(periode?.sessionBudget ?? {}) });
  const [min, setMin] = useState(periode?.weeklyVolMin != null ? String(periode.weeklyVolMin) : "");
  const [maks, setMaks] = useState(periode?.weeklyVolMax != null ? String(periode.weeklyVolMax) : "");
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();
  useEffect(() => { ark.current?.showModal(); }, []);

  const lagre = () => start(async () => {
    setFeil(null);
    const r = await saveSeasonPeriod({ playerId, periodId: periode?.id, data: {
      lPhase: type, startDato: fra, sluttDato: til, fokus, notat,
      ukevolumMin: min === "" ? null : Number(min), ukevolumMax: maks === "" ? null : Number(maks),
      budsjett, axisMinutes: tilAkser(vanlig), axisMinutesLight: tilAkser(lett),
    } });
    if (!r.ok) { setFeil(r.error); return; }
    const kvittering = fordelingKvittering(r.data.fordeling, r.data.fordelingFeilet);
    if (kvittering) (r.data.fordelingFeilet ? toast.error : toast.success)(kvittering);
    onLagret();
  });
  const slett = () => periode && start(async () => {
    setFeil(null);
    const r = await deleteSeasonPeriod({ playerId, periodId: periode.id });
    if (!r.ok) { setFeil(r.error); return; }
    onLagret();
  });

  const steppere = (m: Akser, sett: (f: (m: Akser) => Akser) => void, hva: string) => <div className="phn-seksjon" style={{ gap: 6 }}>
    {AKSER.map((a) => <div key={a} className="phn-stepper">
      <b><i className={AKSE_KLASSE[a]} />{a}</b>
      <span className="phn-spor"><span className={AKSE_KLASSE[a]} style={{ width: `${Math.min(100, (m[a] / 420) * 100)}%` }} /></span>
      <button type="button" aria-label={`15 minutter mindre ${a}, ${hva}`} disabled={m[a] === 0} onClick={() => sett((x) => ({ ...x, [a]: Math.max(0, x[a] - 15) }))}>−</button>
      <output>{m[a] ? formaterVarighet(m[a]) : "0"}</output>
      <button type="button" aria-label={`15 minutter mer ${a}, ${hva}`} disabled={m[a] >= 3000} onClick={() => sett((x) => ({ ...x, [a]: Math.min(3000, x[a] + 15) }))}>+</button>
    </div>)}
  </div>;

  const kilde = periode ? (periode.fraGruppe ? "Fra gruppa" : "Egen") : "Ny";
  return <dialog ref={ark} className="phn-ark" aria-label={periode ? `Endre ${PERIODE_NAVN[periode.type]}` : "Ny periode"} onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
    <div className="phn-ark-kropp">
      <div className="phn-ark-topp">
        <div><span className="phn-dato">Periode · {kilde}</span><h2>{periode ? PERIODE_NAVN[periode.type] : "Ny periode"}</h2></div>
        <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
      </div>
      {feil && <p className="phn-melding" role="alert">{feil}</p>}
      <div className="phn-felt"><span>Type</span>
        <div className="phn-valg" role="group" aria-label="Type">{TYPER.map((t) => <button key={t} type="button" aria-pressed={t === type} onClick={() => setType(t)}>{PERIODE_NAVN[t]}</button>)}</div>
      </div>
      <div className="phn-to-felt">
        <label className="phn-felt">Første dag<input type="date" value={fra} onChange={(e) => setFra(e.target.value)} /></label>
        <label className="phn-felt">Siste dag<input type="date" value={til} onChange={(e) => setTil(e.target.value)} /></label>
      </div>
      <label className="phn-felt">Fokus<input type="text" value={fokus} maxLength={200} onChange={(e) => setFokus(e.target.value)} placeholder="Lengdekontroll 100–150 m" /></label>
      <div className="phn-felt"><span>Timer per vanlig uke</span>{steppere(vanlig, setVanlig, "vanlig uke")}<p className="phn-forklar">Sum {formaterVarighet(sum(vanlig))} per uke.</p></div>
      <label className="phn-felt">Notat<textarea rows={2} value={notat} maxLength={1000} onChange={(e) => setNotat(e.target.value)} /></label>
      <details className="phn-flere">
        <summary>Flere valg</summary>
        <div className="phn-seksjon">
          <div className="phn-felt"><span>Timer per lett uke</span>{steppere(lett, setLett, "lett uke")}</div>
          <div className="phn-felt"><span>Øktbudsjett per uke · antall økter</span>
            <div className="phn-fem">{AKSER.map((a) => <label key={a} className="phn-felt">{a}<input type="number" min={0} max={21} value={budsjett[a]} onChange={(e) => setBudsjett((b) => ({ ...b, [a]: Number(e.target.value) }))} /></label>)}</div>
          </div>
          <div className="phn-to-felt">
            <label className="phn-felt">Minst per uke (min)<input type="number" min={0} max={3000} value={min} onChange={(e) => setMin(e.target.value)} /></label>
            <label className="phn-felt">Mest per uke (min)<input type="number" min={0} max={3000} value={maks} onChange={(e) => setMaks(e.target.value)} /></label>
          </div>
        </div>
      </details>
      <p className="phn-kilde">{periode?.fraGruppe ? "Fra gruppas årsplan. Endrer du, gjelder det bare deg." : "Lagres i årsplanen din. Ukene fra og med denne uka får de nye timene."}</p>
      <div className="phn-ark-fot"><button type="button" className="phn-knapp pri" disabled={lagrer || !fra || !til} onClick={lagre}>{lagrer ? "Lagrer …" : "Lagre periode"}</button></div>
      {periode && <div className="phn-rust-sone">
        {!bekreftSlett
          ? <button type="button" className="phn-knapp rust" onClick={() => setBekreftSlett(true)}>Slett periode</button>
          : <button type="button" className="phn-knapp rust" disabled={lagrer} onClick={slett}>Bekreft sletting</button>}
        <span className="phn-kilde">Øktene i perioden blir liggende i uka.</span>
      </div>}
    </div>
  </dialog>;
}

function dagNr(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(a, m - 1, d) / 86_400_000);
}
