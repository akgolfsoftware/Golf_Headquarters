"use client";

/**
 * PH-11-MND Måned og PH-11-MNDSKJEMA Månedsskjema — nytt design (pakke 3, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan.html, malene «mnd» og «mndskjema». Stil: src/styles/playerhq-ny.css.
 *
 * Bare spilleren (PlayerHQ, §SPILLERENS WORKBENCH FÅR NIVÅENE). Coachen bruker fortsatt WorkbenchManed.
 * Lagring og fordeling nedover er saveMonthPlan (§PLANNIVÅENE HENGER SAMMEN).
 *
 * Avvik:
 *   - En uke hører til måneden der torsdagen ligger (som periodene), ikke mandagen som i utkastet.
 *   - Målsetninger kan ikke knyttes til en måned. Måneden viser målsetningene på nivået Måned med frist i måneden.
 *   - Evalueringen er én tekst, ikke én fra spilleren og én fra coachen. Notatet viser ikke hvem som skrev det.
 *   - «Legg til test» og «Legg til turnering» åpner Periode og Turneringer, der de legges inn i dag.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Plus, X } from "lucide-react";
import { UI } from "@/lib/domain/workbench/labels";
import { addMonths } from "@/lib/domain/workbench/operations";
import type { MaanedDetaljer, MonthViewModel, PlanningGoalSummary, PyramidArea } from "@/lib/domain/workbench/types";
import { workbenchUrl, type WbVisning } from "@/lib/workbench/visning-url";
import type { PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { saveMonthPlan } from "@/lib/workbench/wb-actions";
import { maanedKvittering } from "@/lib/workbench/maanedsplan-regler";
import { MAANED_AKSER, fraTimerMin, sumAkser, tilTimerMin, ukerSomLagres } from "@/lib/workbench/maaned-visning";
import { formaterVarighet } from "@/lib/format-tall";
import { PERIODE_NAVN } from "@/components/portal/precision/PH11Periode";
import "@/styles/playerhq-ny.css";

const AKSE_KLASSE: Record<PyramidArea, string> = { FYS: "akse-fys", TEK: "akse-tek", SLAG: "akse-slag", SPILL: "akse-spill", TURN: "akse-turn" };
const NIVAER: { id: WbVisning; navn: string }[] = [
  { id: "aar", navn: "År" }, { id: "periode", navn: "Periode" }, { id: "maned", navn: "Måned" }, { id: "uke", navn: "Uke" }, { id: "mal", navn: "Målsetninger" },
];
const kortDato = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" });
const ukedagDato = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
const dato = (iso: string, f = kortDato) => f.format(new Date(`${iso}T00:00:00Z`));
const tid = (min: number) => (min > 0 ? formaterVarighet(min) : "—");
const pst = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
type Uke = MaanedDetaljer["uker"][number];

function addDager(iso: string, n: number) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}
function ukeSpenn(uker: Uke[]) {
  if (!uker.length) return "";
  const a = uker[0].weekNumber, b = uker[uker.length - 1].weekNumber;
  return a === b ? `uke ${a}` : `uke ${a}–${b}`;
}
function hendelseDato(h: { startDate: string; endDate: string }) {
  return h.startDate === h.endDate ? dato(h.startDate) : `${dato(h.startDate)}–${dato(h.endDate)}`;
}

function StortTall({ minutter }: { minutter: number }) {
  const t = Math.floor(minutter / 60), m = minutter % 60;
  if (!t) return <strong>{m}<small>min</small></strong>;
  return <strong>{t}<small>t{m ? ` ${m} min` : ""}</small></strong>;
}

function Fordeling({ m, lys }: { m: Partial<Record<PyramidArea, number>>; lys?: boolean }) {
  const med = MAANED_AKSER.filter((a) => (m[a] ?? 0) > 0);
  return <span className={`phn-fordeling${lys ? " lys" : ""}`} role="img" aria-label={med.map((a) => `${a} ${tid(m[a] ?? 0)}`).join(", ") || "Ingen timer"}>
    {med.map((a) => <i key={a} className={AKSE_KLASSE[a]} style={{ flex: m[a] }} />)}
  </span>;
}

export type PH11ManedProps = {
  playerId: string;
  maned: MonthViewModel;
  goals: PlanningGoalSummary[];
  referanse: PlanReferanse;
  /** YYYY-MM-DD i Oslo. */
  idag: string;
};

export function PH11Maned({ playerId, maned, goals, referanse, idag }: PH11ManedProps) {
  const router = useRouter();
  const [skjema, setSkjema] = useState(false);
  const [aar, mnd] = maned.monthStart.split("-").map(Number);
  const navn = UI.monthNames[mnd - 1];
  const nav = navn.toLowerCase();
  const d: MaanedDetaljer = maned.detaljer ?? { uker: [], perioder: [], hendelser: [] };
  const plan = maned.maanedsplan ?? null;
  const sisteDag = addDager(addMonths(maned.monthStart, 1), -1);
  const fase = sisteDag < idag ? "for" : maned.monthStart > idag ? "etter" : "na";
  const url = (visning: WbVisning, ref: PlanReferanse = {}) => workbenchUrl(playerId, visning, { ...referanse, maned: maned.monthStart.slice(0, 7), ...ref }, "player");

  const fordelt: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  const lagtInn: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  for (const u of d.uker) for (const a of MAANED_AKSER) { fordelt[a] += u.fordelt?.[a] ?? 0; lagtInn[a] += u.lagtInn[a]; }
  const fordeltSum = sumAkser(fordelt), lagtInnSum = sumAkser(lagtInn);
  const gjennomfort = d.uker.reduce((s, u) => s + u.gjennomfort, 0);
  const visAkser = fase === "for" || fordeltSum === 0 ? lagtInn : fordelt;
  const maal = goals.filter((g) => g.planNivaa === "MANED" && g.targetDate && g.targetDate.slice(0, 7) === maned.monthStart.slice(0, 7));
  const periodeFokus = d.perioder.find((p) => p.focus)?.focus ?? null;
  const nesteManed = addMonths(maned.monthStart, 1);

  return <div className="phn">
    <header className="phn-topp">
      <div className="phn-topp-rad">
        <div>
          <div className="phn-dato">Workbench{d.perioder.length ? ` · ${d.perioder.map((p) => PERIODE_NAVN[p.type]).filter((x, i, l) => l.indexOf(x) === i).join(" og ")}` : ""}{d.uker.length ? ` · ${ukeSpenn(d.uker)}` : ""}</div>
          <h1 className="phn-tittel">{navn}{aar !== Number(idag.slice(0, 4)) ? ` ${aar}` : ""}</h1>
        </div>
        <div className="phn-knapper">
          <span className="phn-pil">
            <Link href={url("maned", { maned: addMonths(maned.monthStart, -1).slice(0, 7) })} aria-label="Forrige måned"><ChevronLeft className="phn-ikon" aria-hidden /></Link>
            <Link href={url("maned", { maned: nesteManed.slice(0, 7) })} aria-label="Neste måned"><ChevronRight className="phn-ikon" aria-hidden /></Link>
          </span>
          {plan && <button type="button" className="phn-knapp sek" onClick={() => setSkjema(true)}><Pencil className="phn-ikon" aria-hidden />Endre måned</button>}
        </div>
      </div>
      <nav className="phn-valg" aria-label="Nivå">
        {NIVAER.map((n) => <Link key={n.id} href={url(n.id)} aria-current={n.id === "maned" ? "page" : undefined}>{n.navn}</Link>)}
      </nav>
    </header>

    <div className="phn-per-grid">
      <div className="phn-seksjon" style={{ gap: 32 }}>
        <section className="phn-kort" aria-label="Måneden i tall">
          {fase === "for"
            ? <>
              <div className="phn-hoved"><StortTall minutter={gjennomfort} />{lagtInnSum > 0 && <span className="phn-trend">{pst(gjennomfort, lagtInnSum)} % av plan</span>}</div>
              <p className="phn-forklar">{lagtInnSum > 0 ? `Gjennomført i ${nav}, av ${tid(lagtInnSum)} lagt inn.` : `Ingen økter ble lagt inn i ${nav}.`}</p>
            </>
            : <>
              <div className="phn-hoved"><StortTall minutter={fordeltSum || lagtInnSum} /><span className="phn-trend">{d.uker.length} {d.uker.length === 1 ? "uke" : "uker"}</span></div>
              <p className="phn-forklar">{fordeltSum > 0
                ? `Fordelt i ${nav}. ${lagtInnSum > 0 ? `${tid(lagtInnSum)} er lagt inn som økter så langt.` : "Ingen økter er lagt inn ennå."}`
                : `Lagt inn i ${nav}. Perioden har ikke fordelt timer til ukene ennå.`}</p>
            </>}
          {sumAkser(visAkser) > 0 && <div className="phn-seksjon" style={{ gap: 8 }}>
            <Fordeling m={visAkser} />
            <div className="phn-lg-rad">{MAANED_AKSER.filter((a) => visAkser[a] > 0).map((a) => <span key={a} className="phn-lg"><i className={AKSE_KLASSE[a]} />{a} {tid(visAkser[a])}</span>)}</div>
          </div>}
        </section>

        <section className="phn-kort" aria-label="Uke for uke">
          <div className="phn-sek-topp"><h2>Uke for uke</h2><span className="phn-kilde">{fase === "for" ? "Gjennomført mot lagt inn" : "Lagt inn mot fordelt"}</span></div>
          <div className="phn-ukerader">
            {d.uker.map((u) => {
              const forbi = addDager(u.weekStart, 6) < idag;
              const na = u.weekStart <= idag && !forbi;
              const li = sumAkser(u.lagtInn), f = sumAkser(u.fordelt);
              const merke = u.endret ? "Endret i måneden" : na ? "Nå" : dato(u.weekStart);
              return <Link key={u.nokkel} href={url("uke", { uke: u.weekStart })} className={`phn-ukerad${na ? " na" : ""}`}>
                <span>Uke {u.weekNumber}<small>{merke}</small></span>
                {forbi || f === 0
                  ? <Fordeling m={u.lagtInn} lys={!forbi} />
                  : <span className="phn-lagtinn"><Fordeling m={u.fordelt ?? {}} lys /><em style={{ left: `${Math.min(100, pst(li, f))}%` }} aria-hidden /></span>}
                <span className="phn-v">{forbi ? tid(u.gjennomfort) : tid(li)}<small>{forbi ? (li ? `av ${tid(li)}` : "ingen økter") : f > 0 ? `av ${tid(f)}` : "ikke fordelt"}</small></span>
              </Link>;
            })}
          </div>
          <p className="phn-kilde">Uka arver fordelingen. Workbench viser hvor mye som mangler.</p>
        </section>

        <section className="phn-kort" aria-label="Tester og samlinger">
          <div className="phn-sek-topp"><h2>Tester og samlinger</h2></div>
          <div className="phn-liste">
            {d.hendelser.length === 0 && <p className="phn-forklar phn-prad">Ingen tester, samlinger eller turneringer i {nav}.</p>}
            {d.hendelser.map((h, i) => <div key={i} className="phn-hendelse">
              <span><b>{h.type === "TURNERING" ? h.navn : PERIODE_NAVN[h.type]}</b>{h.type !== "TURNERING" && h.navn && <><br /><span className="phn-kilde">{h.navn}</span></>}</span>
              <small>{hendelseDato(h)}</small>
            </div>)}
          </div>
        </section>
      </div>

      <div className="phn-seksjon" style={{ gap: 32 }}>
        <section className="phn-kort" aria-label="Fokus og målsetninger">
          <span className="phn-undertittel">Fokus</span>
          {plan?.fokus
            ? <p className="phn-fokus">{plan.fokus}</p>
            : <>
              <p className="phn-forklar">{plan ? "Ikke satt." : `Ingen månedsplan ennå. Timene kommer fra perioden${periodeFokus ? `, og periodens fokus gjelder: ${periodeFokus}` : ""}.`}</p>
              {!plan && <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => setSkjema(true)}><Plus className="phn-ikon" aria-hidden />Lag månedsplan</button></div>}
            </>}
          {maal.length > 0 && <div className="phn-knytt">{maal.map((g) => <Link key={g.id} href={url("mal")}><span><b>{g.title}</b><br />{g.category === "OUTCOME" ? "Resultatmål" : "Prosessmål"}{g.targetDate ? ` · frist ${dato(g.targetDate)}` : ""}</span></Link>)}</div>}
        </section>
        {plan?.notat && <section className="phn-kort" aria-label="Notat">
          <span className="phn-undertittel">Notat</span>
          <div className="phn-sitat">{plan.notat}</div>
        </section>}
        <section className="phn-kort" aria-label="Evaluering">
          <span className="phn-undertittel">Evaluering</span>
          {fase === "for"
            ? plan?.evaluering
              ? <div className="phn-sitat">{plan.evaluering}</div>
              : <><p className="phn-forklar">Ingen evaluering av {nav} ennå.</p><div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => setSkjema(true)}>Skriv evaluering</button></div></>
            : <p className="phn-forklar">Evalueringen av {nav} åpner {dato(nesteManed, ukedagDato)}.</p>}
        </section>
      </div>
    </div>

    {skjema && <PH11ManedSkjema playerId={playerId} maned={maned} idag={idag} fase={fase} maal={maal} url={url}
      onLukk={() => setSkjema(false)} onLagret={() => { setSkjema(false); router.refresh(); }} />}
  </div>;
}

type Verdier = Record<string, Record<PyramidArea, string>>;

/** Månedsskjema: ark på mobil, dialog på PC. */
function PH11ManedSkjema({ playerId, maned, idag, fase, maal, url, onLukk, onLagret }: {
  playerId: string; maned: MonthViewModel; idag: string; fase: "for" | "na" | "etter"; maal: PlanningGoalSummary[];
  url: (v: WbVisning, ref?: PlanReferanse) => string; onLukk: () => void; onLagret: () => void;
}) {
  const ark = useRef<HTMLDialogElement>(null);
  const plan = maned.maanedsplan ?? null;
  const uker = maned.detaljer?.uker ?? [];
  const [aar, mnd] = maned.monthStart.split("-").map(Number);
  const nav = UI.monthNames[mnd - 1].toLowerCase();
  const apne = new Set(uker.filter((u) => addDager(u.weekStart, 6) >= idag).map((u) => u.nokkel));
  const [fokus, setFokus] = useState(plan?.fokus ?? "");
  const [notat, setNotat] = useState(plan?.notat ?? "");
  const [evaluering, setEvaluering] = useState(plan?.evaluering ?? "");
  const [verdier, setVerdier] = useState<Verdier>(() => Object.fromEntries(uker.map((u) => [u.nokkel,
    Object.fromEntries(MAANED_AKSER.map((a) => [a, tilTimerMin(u.fordelt?.[a] ?? 0)])) as Record<PyramidArea, string>])));
  const [folg, setFolg] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();
  useEffect(() => { ark.current?.showModal(); }, []);

  const minutter = (nokkel: string, a: PyramidArea) => fraTimerMin(verdier[nokkel]?.[a] ?? "");
  const ugyldig = (n: number | null) => n === null || n % 15 !== 0 || n > 3000;
  const ukeSum = (nokkel: string) => MAANED_AKSER.reduce((s, a) => s + (minutter(nokkel, a) ?? 0), 0);
  const totalt = uker.reduce((s, u) => s + ukeSum(u.nokkel), 0);
  const endrede = uker.filter((u) => u.endret && apne.has(u.nokkel));

  const lagre = () => start(async () => {
    setFeil(null);
    const tall: Record<string, Record<PyramidArea, number>> = {};
    for (const u of uker) {
      if (!apne.has(u.nokkel)) continue;
      const rad = {} as Record<PyramidArea, number>;
      for (const a of MAANED_AKSER) {
        const n = minutter(u.nokkel, a);
        if (ugyldig(n)) { setFeil(`Uke ${u.weekNumber}, ${a}: skriv timer og minutter i hele kvarter, for eksempel 3:45.`); return; }
        rad[a] = n ?? 0;
      }
      tall[u.nokkel] = rad;
    }
    // Uker som er gått, beholder merket «Endret i måneden»; lagringen rører dem aldri.
    const gatte = Object.fromEntries(Object.entries(plan?.uker ?? {}).filter(([k]) => !apne.has(k)));
    const r = await saveMonthPlan({ playerId, data: {
      year: aar, month: mnd, fokus, notat, evaluering,
      uker: { ...gatte, ...ukerSomLagres({ uker, verdier: tall, apne, folgPerioden: folg }) },
    } });
    if (!r.ok) { setFeil(r.error); return; }
    (r.data.fordelingFeilet ? toast.error : toast.success)(maanedKvittering(r.data.kvittering, r.data.fordelingFeilet));
    onLagret();
  });

  return <dialog ref={ark} className="phn-ark" aria-label={plan ? "Endre månedsplan" : "Lag månedsplan"} onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
    <div className="phn-ark-kropp">
      <div className="phn-ark-topp">
        <div><span className="phn-dato">Workbench · {nav}{uker.length ? ` · ${ukeSpenn(uker)}` : ""}</span><h2>{plan ? "Endre månedsplan" : "Lag månedsplan"}</h2></div>
        <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
      </div>
      {feil && <p className="phn-melding" role="alert">{feil}</p>}
      <label className="phn-felt">Fokus<textarea rows={2} value={fokus} maxLength={200} onChange={(e) => setFokus(e.target.value)} placeholder="Hva skal måneden handle om?" /></label>

      <div className="phn-felt"><span>Målsetninger</span>
        {maal.length > 0
          ? <div className="phn-knytt">{maal.map((g) => <div key={g.id}><span><b>{g.title}</b><br />{g.category === "OUTCOME" ? "Resultatmål" : "Prosessmål"}</span></div>)}</div>
          : <p className="phn-forklar">Ingen målsetninger med frist i {nav}.</p>}
        <Link className="phn-lenke" href={url("mal")}><Plus className="phn-ikon" aria-hidden />Målsetninger</Link>
      </div>

      <div className="phn-felt"><span>Timer per akse, fordelt på ukene</span>
        <p className="phn-kilde">Timer og minutter, for eksempel 3:45. Uka arver tallet som fordelt.{apne.size < uker.length ? " Uker som er gått, kan ikke endres." : ""}</p>
        <div className="phn-uketab" style={{ ["--n" as string]: uker.length }}>
          <span />
          {uker.map((u) => <span key={u.nokkel} className="phn-uketab-h">Uke {u.weekNumber}{(u.endret || folg.has(u.nokkel)) && <small>{folg.has(u.nokkel) ? "Perioden" : "Endret"}</small>}</span>)}
          {MAANED_AKSER.map((a) => <div key={a} className="phn-uketab-rad">
            <b><i className={AKSE_KLASSE[a]} />{a}</b>
            {uker.map((u) => <input key={u.nokkel} inputMode="numeric" aria-label={`${a} uke ${u.weekNumber}`}
              disabled={!apne.has(u.nokkel) || folg.has(u.nokkel)} aria-invalid={ugyldig(minutter(u.nokkel, a)) || undefined}
              value={verdier[u.nokkel]?.[a] ?? ""}
              onChange={(e) => setVerdier((v) => ({ ...v, [u.nokkel]: { ...v[u.nokkel], [a]: e.target.value } }))} />)}
          </div>)}
          <span className="phn-undertittel">Sum</span>
          {uker.map((u) => <span key={u.nokkel} className="phn-uketab-s">{tilTimerMin(ukeSum(u.nokkel))}</span>)}
        </div>
        <p className="phn-forklar">{totalt > 0 ? `Fordelt i ${nav}: ${tid(totalt)}.` : `Ingen timer er fordelt i ${nav} ennå.`}</p>
        {endrede.length > 0 && <div className="phn-seksjon" style={{ gap: 6 }}>
          {endrede.map((u) => <label key={u.nokkel} className="phn-sjekk">
            <input type="checkbox" checked={folg.has(u.nokkel)} onChange={(e) => setFolg((s) => { const n = new Set(s); if (e.target.checked) n.add(u.nokkel); else n.delete(u.nokkel); return n; })} />
            Uke {u.weekNumber} følger perioden igjen
          </label>)}
        </div>}
      </div>

      <div className="phn-felt"><span>Tester og samlinger</span>
        {(maned.detaljer?.hendelser ?? []).length === 0
          ? <p className="phn-forklar">Ingen ennå.</p>
          : <div className="phn-liste">{maned.detaljer!.hendelser.map((h, i) => <div key={i} className="phn-hendelse"><span><b>{h.type === "TURNERING" ? h.navn : PERIODE_NAVN[h.type]}</b></span><small>{hendelseDato(h)}</small></div>)}</div>}
        <div className="phn-knapper">
          <Link className="phn-lenke" href={url("periode")}><Plus className="phn-ikon" aria-hidden />Legg til test</Link>
          <Link className="phn-lenke" href="/portal/planlegge/workbench?pille=turn"><Plus className="phn-ikon" aria-hidden />Legg til turnering</Link>
        </div>
      </div>

      <label className="phn-felt">Notat<textarea rows={3} value={notat} maxLength={2000} onChange={(e) => setNotat(e.target.value)} placeholder="Skoleuker, reiser, ting coach bør vite" /></label>
      {fase === "for" && <label className="phn-felt">Evaluering<textarea rows={4} value={evaluering} maxLength={4000} onChange={(e) => setEvaluering(e.target.value)} placeholder={`Hvordan gikk ${nav}?`} /></label>}
      <p className="phn-kilde">Lagres i månedsplanen din. Ukene fra og med denne uka får de nye timene.</p>
      <div className="phn-ark-fot"><button type="button" className="phn-knapp pri" disabled={lagrer} onClick={lagre}>{lagrer ? "Lagrer …" : "Lagre månedsplan"}</button></div>
    </div>
  </dialog>;
}
