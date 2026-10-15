"use client";

/**
 * PH-11-PER Periode og PH-11-PERSKJEMA Periodeskjema — nytt design (pakke 3, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan.html, malene «per» og «perskjema». Stil: src/styles/playerhq-ny.css.
 *
 * Bare spilleren (PlayerHQ, §SPILLERENS WORKBENCH FÅR NIVÅENE). Coachen bruker fortsatt WorkbenchPeriode.
 *
 * Avvik:
 *   - Ukene viser lagt inn per akse (WorkbenchSession). Utkastets «fordelt» per uke står i ukeplanen,
 *     som perioden ikke leser her; timer per vanlig og lett uke står øverst.
 *   - Målsetninger knyttet til perioden og evaluering når perioden er over finnes ikke i appen.
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
import { PublishConfirmDialog } from "@/components/workbench/PublishConfirmDialog";
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
const tid = (min: number) => (min > 0 ? formaterVarighet(min) : "—");
const sum = (m: Partial<Record<PyramidArea, number>> | null | undefined) => AKSER.reduce((s, a) => s + (m?.[a] ?? 0), 0);
const pst = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
function addDager(iso: string, n: number) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}
function ukeSpenn(p: { startDate: string; endDate: string }) {
  const a = isoWeekNumber(p.startDate), b = isoWeekNumber(p.endDate);
  return a === b ? `uke ${a}` : `uke ${a}–${b}`;
}

function StortTall({ minutter }: { minutter: number }) {
  const t = Math.floor(minutter / 60), m = minutter % 60;
  if (!t) return <strong>{m}<small>min</small></strong>;
  return <strong>{t}<small>t{m ? ` ${m} min` : ""}</small></strong>;
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
  const maksAkse = Math.max(1, ...AKSER.map((a) => vanlig?.[a] ?? 0));
  const lett = sum(p.axisMinutesLight);
  const testuker = periode.periods.filter((x) => x.type === "TESTUKE" && x.startDate >= p.startDate && x.startDate <= p.endDate);

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

    <div className="phn-per-grid">
      <div className="phn-seksjon" style={{ gap: 32 }}>
        <section className="phn-kort" aria-label="Perioden i tall">
          {fase === "for" && <>
            <div className="phn-hoved"><StortTall minutter={periode.completedMinutes} /><span className="phn-trend">{pst(periode.completedMinutes, periode.plannedToDateMinutes)} % av plan</span></div>
            <p className="phn-forklar">Gjennomført av {tid(periode.plannedToDateMinutes)} lagt inn. Perioden er ferdig.</p>
          </>}
          {fase === "na" && <>
            <div className="phn-hoved"><StortTall minutter={periode.plannedMinutes} />{periode.plannedToDateMinutes > 0 && <span className="phn-trend">{pst(periode.completedMinutes, periode.plannedToDateMinutes)} % gjennomført så langt</span>}</div>
            <p className="phn-forklar">Lagt inn i perioden. {tid(periode.completedMinutes)} gjennomført av {tid(periode.plannedToDateMinutes)} lagt inn til nå.</p>
          </>}
          {fase === "etter" && <>
            <div className="phn-hoved"><StortTall minutter={periode.plannedMinutes} /><span className="phn-trend">Starter om {omUker} {omUker === 1 ? "uke" : "uker"}</span></div>
            <p className="phn-forklar">Lagt inn i perioden. Hver uke arver timene herfra.</p>
          </>}
          <span className="phn-undertittel">Timer per vanlig uke</span>
          {vanlig
            ? <div className="phn-akserader">{AKSER.map((a) => <div key={a} className="phn-akserad"><b>{a}</b><span className="phn-spor"><span className={AKSE_KLASSE[a]} style={{ width: `${((vanlig[a] ?? 0) / maksAkse) * 100}%` }} /></span><span className="phn-v">{tid(vanlig[a] ?? 0)}</span></div>)}</div>
            : <p className="phn-forklar">Ikke satt. Velg «Endre periode» for å fordele timer per akse.</p>}
          {(vanlig || lett > 0 || testuker.length > 0) && <p className="phn-kilde">
            {vanlig ? `Sum ${tid(sum(vanlig))} per uke.` : ""}{lett > 0 ? ` Lett uke: ${tid(lett)}.` : ""}{testuker.length ? ` ${testuker.map((t) => `Uke ${isoWeekNumber(t.startDate)}`).join(" og ")} er testuke.` : ""}
          </p>}
        </section>

        <section className="phn-kort" aria-label="Ukene">
          <div className="phn-sek-topp"><h2>Ukene</h2><span className="phn-kilde">Lagt inn per akse</span></div>
          <div className="phn-ukerader">
            {periode.weeks.map((u) => {
              const na = u.weekStart <= idag && idag <= addDager(u.weekStart, 6);
              const forbi = addDager(u.weekStart, 6) < idag;
              const by = u.byPyramid;
              return <Link key={u.weekStart} href={url("uke", { uke: u.weekStart })} className={`phn-ukerad${na ? " na" : ""}`}>
                <span>Uke {u.weekNumber}<small>{dato(u.weekStart)}</small></span>
                <span className={`phn-fordeling${forbi || na ? "" : " lys"}`}>{by && AKSER.filter((a) => by[a]).map((a) => <i key={a} className={AKSE_KLASSE[a]} style={{ flex: by[a] }} />)}</span>
                <span className="phn-v">{forbi ? tid(u.completedMinutes) : tid(u.minutes)}<small>{forbi ? (u.minutes ? `${pst(u.completedMinutes, u.minutes)} % av ${tid(u.minutes)}` : "ingen økter") : `${u.sessionCount} ${u.sessionCount === 1 ? "økt" : "økter"}`}</small></span>
              </Link>;
            })}
          </div>
        </section>
      </div>

      <div className="phn-seksjon" style={{ gap: 32 }}>
        <section className="phn-kort" aria-label="Fokus">
          <span className="phn-undertittel">Fokus</span>
          <p className="phn-fokus">{p.focus ?? "Ikke satt."}</p>
        </section>
        {p.notat && <section className="phn-kort" aria-label="Notat">
          <span className="phn-undertittel">Notat</span>
          <div className="phn-sitat">{p.notat}</div>
        </section>}
        {p.turneringer.length > 0 && <section className="phn-kort" aria-label="Turneringer">
          <span className="phn-undertittel">Turneringer</span>
          <div className="phn-liste">{p.turneringer.map((t) => <div key={`${t.dato}${t.navn}`} className="phn-prad"><b>{t.navn}</b><small>uke {isoWeekNumber(t.dato)} · {dato(t.dato)}</small></div>)}</div>
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
