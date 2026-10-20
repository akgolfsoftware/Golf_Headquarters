"use client";

/**
 * PH-01 I dag i nytt design (designløftet 20.10.2026, godkjent av Anders samme dag).
 * Fasit: Claude Design-canvaset «PlayerHQ nøkkelskjermer» (https://claude.ai/artifact/XdsbBEHwJhdrD4YJMMpdK1),
 * tegningene «1 I dag · mobil 390» og «1 I dag · PC 1280». Stil: src/styles/playerhq-ny-idag.css (§Designløft).
 *
 * Rekkefølge: dato og snarvei til neste økt · tre tall (uka, snitt 10 runder, etter plan) · målsetninger ·
 * dagens økter (små fylte kort i aksefargen, trykk åpner hele økta) · forslag som venter · neste økt ·
 * nye meldinger · uka per dag · Strokes Gained · fireukerssjekk · mer om dagen.
 * PC fra 900 px: tallene står ved tittelen, og innholdet går i to kolonner.
 *
 * Avvik fra tegningen:
 *   - Treffbildet rundt flagget vises ikke: I dag-dataene har ingen slagplassering fra forrige økt.
 *     Målsetningen for økta står bare når den er satt (Anders 20.10).
 *   - «Etter plan» viser ikke utviklingen per uke: etterlevelsen regnes bare for hele fireukersvinduet.
 *   - Sidemenyen fra tegningen (søk, neste-kort, Opprett) hører til det felles skallet, som flyttes inn i
 *     Precision for alle flater samlet. PlayerHQSkall er uendret i denne endringen.
 */
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, ClipboardCheck, Play, RotateCw, X } from "lucide-react";
import { Ikon, Tidslinje, type Akse, type TidslinjePunkt } from "@/components/precision/pa";
import { formaterTall } from "@/lib/format-tall";
import { lagreDagsform } from "@/app/portal/dagsform-actions";
import { resolvePlayerApproval } from "@/lib/workbench/wb-actions";
import type { OktBilde } from "@/lib/portal/okt-bilde";
import { MIN_RUNDER, type Forbedringsomraade } from "@/lib/portal/ph01-forbedring";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";

const FORM = ["Tung", "Slapp", "Ok", "God", "Topp"] as const;
const AKSE_KODE: Record<Akse, string> = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
const AKSE_NAVN: Record<Akse, string> = { fys: "Fysisk", tek: "Teknisk", slag: "Golfslag", spill: "Spill", turn: "Turnering" };
const FYLL: Record<Akse, string> = { fys: "var(--phn-fys-ink)", tek: "var(--phn-tek-ink)", slag: "var(--phn-slag)", spill: "var(--phn-spill-ink)", turn: "var(--phn-turn)" };
/** Rekkefølgen nedenfra i en stablet dagssøyle: FYS er grunnmuren (beslutninger.md §FYS STÅR ALLTID NEDERST). */
const STABEL: Akse[] = ["fys", "tek", "slag", "spill", "turn"];

export type PH01Okt = {
  id: string; tid: string; slutt: string; tittel: string; akse: Akse; sted: string | null; min: number;
  antallOvelser: number; fokus: string | null; status: "Planlagt" | "Pågår" | "Gjennomført";
  href: string;
  bilde: OktBilde;
  /** «Om 2 t 10 min» eller null. */
  om: string | null;
  ovelser: { navn: string; min: number }[];
};
export type PH01Godkjenning = { id: string; tittel: string; tid: string; min: number; akse: Akse; sted: string | null; fraGruppe: boolean };
export type PH01Fys = { tittel: string; meta: string; rader: [string, string, string][]; href: string };
export type PH01Turn = { dager: number; tittel: string; sted: string | null; meta: string; href: string };
export type PH01Uka = { uke: number; gjortMin: number; planMin: number; akser: { akse: Akse; gjortMin: number; planMin: number }[] };
export type PH01Maal = {
  id: string; tittel: string; kategori: "Resultatmål" | "Prosessmål"; frist: string | null;
  pct: number | null; status: "on-track" | "behind" | "achieved" | "no-data"; href: string;
};
export type PH01Etterlevelse = { pct: number; gjortMin: number; planMin: number; periode: string };
export type PH01Fullfort = {
  uke: number; gjennomfort: number; totalt: number; igjen: number; hoppetOver: number;
  total: number; totalKilde: string;
  milepaeler: { antall: number; naadd: string | null }[];
};
export type PH01Popup = { id: string; kind: string; title: string; body: string | null; tid: string; href: string };
/** Snittscore brutto, siste ti runder. */
export type PH01Snitt = { verdi: number; endring: number | null; trend: number[]; dato: string | null };
/** Én dag i uka: minutter per akse, gjennomført eller planlagt. */
export type PH01Dag = { kort: string; iDag: boolean; segmenter: { akse: Akse; min: number; gjort: boolean }[] };
export type PH01NesteOkt = { dag: string; tid: string; tittel: string; akse: Akse; min: number; sted: string | null; antallOvelser: number; href: string };
export type PH01Melding = { fra: string; tekst: string; tid: string; href: string };
/** Strokes Gained per kategori, snitt siste runder (null når kategorien ikke er registrert). */
export type PH01Sg = { runder: number; dato: string | null; verdier: { navn: string; verdi: number | null }[] };

export type PH01Props = {
  tilstand: "data" | "tom" | "feil";
  dato: string; ingress: string; tomTekst: string; feilKode: string;
  okter: PH01Okt[]; nesteId: string | null; godkjenninger: PH01Godkjenning[];
  uka: PH01Uka | null;
  maal: PH01Maal[];
  /** Beholdt for eldre kall; I dag viser Strokes Gained fra `sg`. */
  forbedring?: Forbedringsomraade[];
  /** Antall runder med Strokes Gained (høyst 24). */
  sgRunder?: number;
  etterlevelse: PH01Etterlevelse | null;
  fireukerssjekk: { href: string } | null;
  dagsform: number | null; agenda: TidslinjePunkt[];
  fys: PH01Fys | null; turn: PH01Turn | null; fullfort: PH01Fullfort | null;
  popup: PH01Popup | null;
  snitt?: PH01Snitt | null;
  dager?: PH01Dag[];
  nesteOkt?: PH01NesteOkt | null;
  melding?: PH01Melding | null;
  sg?: PH01Sg | null;
  children?: React.ReactNode;
};


function useToast() {
  const [x, setX] = useState<{ t: string; k: number } | null>(null);
  useEffect(() => { if (!x) return; const h = setTimeout(() => setX(null), 2600); return () => clearTimeout(h); }, [x]);
  const el = x && <div style={{ position: "fixed", top: 16, left: 16, right: 16, display: "flex", justifyContent: "center", zIndex: 200, pointerEvents: "none" }}>
    <div key={x.k} role="status" className="pa-toast" style={{ pointerEvents: "auto", maxWidth: "100%" }}><span>{x.t}</span></div>
  </div>;
  return { vis: (t: string) => setX({ t, k: Date.now() }), el };
}


/** Minutter som timer med én desimal: 845 → «14,1», 120 → «2». */
const timerTekst = (min: number) => formaterTall(Math.round(min / 6) / 10, 1).replace(/,0$/, "");

/* ---------- Tre tall øverst ---------- */

function UkeBand({ uka }: { uka: PH01Uka }) {
  const plan = Math.max(1, uka.planMin);
  const gjort = uka.akser.filter((a) => a.gjortMin > 0);
  return <span className="tall-band" role="img" aria-label={`Gjennomført: ${gjort.map((a) => `${AKSE_KODE[a.akse]} ${a.gjortMin} minutter`).join(", ") || "ingenting ennå"}`}>
    {gjort.map((a, i) => <i key={a.akse} className="bred" style={{ width: `${a.gjortMin / plan * 100}%`, background: `var(--phn-${a.akse})`, animationDelay: `${300 + i * 40}ms` }} />)}
  </span>;
}

function Trend({ verdier }: { verdier: number[] }) {
  if (verdier.length < 2) return null;
  const min = Math.min(...verdier), maks = Math.max(...verdier), spenn = maks - min || 1;
  const pkt = verdier.map((v, i) => `${Math.round(1 + i / (verdier.length - 1) * 90)},${Math.round(4 + (v - min) / spenn * 20)}`).join(" ");
  const sist = pkt.split(" ").pop()!.split(",");
  return <svg className="tall-trend" viewBox="0 0 92 28" role="img" aria-label={`Bruttoscore siste ${verdier.length} runder: ${verdier.join(", ")}`}>
    <polyline className="tegn" points={pkt} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" pathLength={100} />
    <circle cx={sist[0]} cy={sist[1]} r="2.5" fill="currentColor" />
  </svg>;
}

function TreTall({ uka, snitt, e }: { uka: PH01Uka | null; snitt: PH01Snitt | null; e: PH01Etterlevelse | null }) {
  const timer = timerTekst;
  return <section className="tre-tall a-tall" aria-label="Slik ligger du an">
    <Link href="/portal/planlegge" className="tall">
      <span className="tall-etikett">Uka så langt</span>
      <b className="tall-verdi">{uka ? timer(uka.gjortMin) : "—"}<small> / {uka ? `${timer(uka.planMin)} t` : "— t"}</small></b>
      {uka && <UkeBand uka={uka} />}
      <span className="tall-kilde">Plan · uke {uka?.uke ?? "—"}</span>
    </Link>
    <Link href="/portal/analysere" className="tall">
      <span className="tall-etikett">Snitt 10 runder</span>
      <span className="tall-rad"><b className="tall-verdi">{snitt ? formaterTall(snitt.verdi, 1) : "—"}</b>{snitt && <Trend verdier={snitt.trend} />}</span>
      {snitt?.endring != null && snitt.endring !== 0 && <span className={`tall-endring ${snitt.endring < 0 ? "bedre" : ""}`}>{snitt.endring < 0 ? "↓" : "↑"} {formaterTall(Math.abs(snitt.endring), 1)} slag</span>}
      <span className="tall-kilde">Brutto · mot forrige 10{snitt?.dato ? ` · ${snitt.dato}` : ""}</span>
    </Link>
    <Link href="/portal/analysere/trening" className="tall">
      <span className="tall-etikett">Etter plan, 4 uker</span>
      <b className="tall-verdi">{e ? e.pct : "—"}<small> %</small></b>
      {e && <span className={`tall-endring ${e.pct >= 70 ? "bedre" : ""}`}>{e.pct >= 70 ? "→ i rute" : "Under 70 % av planen"}</span>}
      <span className="tall-kilde">Tid mot plan</span>
    </Link>
  </section>;
}

const MAAL_STATUS: Record<PH01Maal["status"], string> = { "on-track": "på vei", behind: "bak planen", achieved: "oppnådd", "no-data": "ingen data ennå" };

function Maalsetninger({ maal }: { maal: PH01Maal[] }) {
  if (maal.length === 0) return <section className="maal a-maal" aria-label="Målsetninger">
    <Link href="/portal/mal" className="maal-rad tom">Ingen målsetninger ennå. Sett en, så ser du fremdriften her.</Link>
  </section>;
  return <section className="maal a-maal" aria-label="Målsetninger">
    {maal.map((m, i) => {
      const pct = m.pct == null || m.status === "no-data" ? null : Math.max(0, Math.min(100, Math.round(m.pct)));
      return <Link key={m.id} href={m.href} className="maal-rad">
        <span className="maal-topp"><span>{m.tittel} <small>· {m.kategori === "Prosessmål" ? "prosessmål" : m.frist ? `innen ${m.frist}` : "resultatmål"}</small></span><b>{pct == null ? "—" : `${pct} %`}</b></span>
        <span className="maal-spor" aria-label={`${pct == null ? "Ingen fremdrift registrert" : `${pct} prosent`}, ${MAAL_STATUS[m.status]}`}><i className="bred" style={{ width: `${pct ?? 0}%`, animationDelay: `${500 + i * 60}ms` }} /></span>
      </Link>;
    })}
  </section>;
}

/* ---------- Dagens økter ---------- */

function OktKort({ s, onAapne }: { s: PH01Okt; onAapne: () => void }) {
  if (s.status === "Gjennomført") return <button type="button" className="okt-ferdig" onClick={onAapne} aria-label={`Se økta kl. ${s.tid}, ${s.tittel}, gjennomført`}>
    <span className="mono">{s.tid}</span><span className="okt-ferdig-navn">{s.tittel} · {AKSE_KODE[s.akse]} · {s.min} min</span><span className="phn-pille ok">Gjennomført</span>
  </button>;
  return <button type="button" className={`okt-fylt ${s.akse}`} onClick={onAapne} aria-label={`Åpne økta kl. ${s.tid}, ${s.tittel}`}>
    <span className="okt-fylt-topp"><b className="mono">{s.tid}</b><span className="okt-fylt-akse">{AKSE_KODE[s.akse]} · {s.min} MIN{s.status === "Pågår" ? " · PÅGÅR" : ""}</span></span>
    <b className="okt-fylt-navn">{s.tittel}</b>
    <span className="okt-fylt-meta">{[s.sted, `${s.antallOvelser} ${s.antallOvelser === 1 ? "øvelse" : "øvelser"}`, s.status === "Planlagt" ? s.om?.toLowerCase() : null].filter(Boolean).join(" · ")}</span>
    {s.fokus && <span className="okt-fylt-maal">Mål i dag: <b>{s.fokus}</b></span>}
  </button>;
}

/* ---------- Uka per dag ---------- */

function Uke({ uke, dager }: { uke: number; dager: PH01Dag[] }) {
  const maks = Math.max(120, ...dager.map((d) => d.segmenter.reduce((a, x) => a + x.min, 0)));
  const hoyde = 96, pxm = hoyde / maks;
  const t = (min: number) => min === 0 ? "—" : timerTekst(min);
  return <section className="uke a-uke" aria-label={`Uke ${uke}`}>
    <div className="sek-topp"><h2>Uke {uke}</h2>
      <span className="uke-forklar"><span><i className="gjort" />Gjennomført</span><span><i className="plan" />Planlagt</span></span></div>
    <div className="uke-graf" role="img" aria-label={`Uke ${uke}, timer per dag: ${dager.map((d) => `${d.kort} ${t(d.segmenter.reduce((a, x) => a + x.min, 0))}`).join(", ")}`} style={{ height: hoyde + 30 }}>
      {[60, 120].filter((m) => m <= maks).map((m) => <span key={m} className="uke-linje" aria-hidden style={{ bottom: Math.round(m * pxm) }}><span>{m / 60} t</span></span>)}
      <div className="uke-dager">{dager.map((d, di) => {
        const sum = d.segmenter.reduce((a, x) => a + x.min, 0), gjort = d.segmenter.filter((x) => x.gjort).reduce((a, x) => a + x.min, 0);
        const stabel = [...d.segmenter].sort((a, b) => STABEL.indexOf(b.akse) - STABEL.indexOf(a.akse));
        return <div key={d.kort} className={`uke-dag${d.iDag ? " i-dag" : ""}`} tabIndex={0} aria-label={`${d.kort}: ${t(sum)} timer, ${t(gjort)} gjennomført`}>
          <span className="uke-tips" role="tooltip"><b>{d.iDag ? "I dag" : d.kort}</b>
            {d.segmenter.length === 0 ? <span>Hviledag</span> : d.segmenter.map((x, i) => <span key={i} className="uke-tips-rad"><span>{AKSE_NAVN[x.akse]} {x.gjort ? "gjennomført" : "planlagt"}</span><b className="mono">{x.min} min</b></span>)}
          </span>
          <b className="uke-tall mono" style={{ animationDelay: `${620 + di * 40}ms` }}>{t(sum)}</b>
          {stabel.length === 0 ? <i className="uke-seg hvile" /> : stabel.map((x, si) => <i key={si} className={`uke-seg${x.gjort ? "" : " plan"}`} style={{ height: Math.max(4, Math.round(x.min * pxm) - 2), ["--seg" as string]: `var(--phn-${x.akse})`, ["--seg-ink" as string]: FYLL[x.akse], animationDelay: `${300 + di * 40 + si * 30}ms` }} />)}
        </div>;
      })}</div>
    </div>
    <div className="uke-navn" aria-hidden>{dager.map((d) => <span key={d.kort} className={d.iDag ? "i-dag" : ""}>{d.iDag ? "I dag" : d.kort}</span>)}</div>
  </section>;
}

/* ---------- Strokes Gained ---------- */

function Sg({ sg }: { sg: PH01Sg }) {
  if (sg.runder < MIN_RUNDER) return <section className="sg a-sg" aria-label="Strokes Gained">
    <div className="sek-topp"><h2>Strokes Gained</h2></div>
    <p className="phn-forklar">Registrer minst {MIN_RUNDER} runder med Strokes Gained, så ser du hvor du tjener og taper slag.</p>
  </section>;
  const maks = Math.max(0.5, ...sg.verdier.map((v) => Math.abs(v.verdi ?? 0)));
  const svakest = sg.verdier.reduce<{ navn: string; verdi: number } | null>((a, v) => v.verdi != null && (a == null || v.verdi < a.verdi) ? { navn: v.navn, verdi: v.verdi } : a, null);
  return <section className="sg a-sg" aria-label="Strokes Gained">
    <div className="sek-topp"><h2>Strokes Gained</h2></div>
    <div className="sg-rader">{sg.verdier.map((v, i) => {
      const b = v.verdi == null ? 0 : Math.abs(v.verdi) / maks * 50;
      const neg = (v.verdi ?? 0) < 0, sterk = svakest?.navn === v.navn && neg;
      return <div key={v.navn} className="sg-rad">
        <span className={sterk ? "sterk" : ""}>{v.navn}</span>
        <span className="sg-spor" aria-hidden><i className={`bred${neg ? " neg" : ""}${sterk ? " sterk" : ""}`} style={{ width: `${b}%`, animationDelay: `${500 + i * 60}ms` }} /></span>
        <b className="mono">{formaterTall(v.verdi, 1, true)}</b>
      </div>;
    })}</div>
    <span className="tall-kilde">Siste {sg.runder} runder{sg.dato ? ` · ${sg.dato}` : ""}</span>
  </section>;
}

function Oktvisning({ s, onLukk }: { s: PH01Okt; onLukk: () => void }) {
  const lukkRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    lukkRef.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onLukk(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onLukk]);
  const ferdig = s.status === "Gjennomført";
  const startTekst = ferdig ? "Se økta" : s.status === "Pågår" ? "Fortsett økt" : "Start økt";
  const sum = s.ovelser.reduce((a, o) => a + o.min, 0);
  return <>
    <button type="button" className="phn-oktvisning-bak" aria-label="Lukk hele økta" tabIndex={-1} onClick={onLukk} />
    <section className="phn-oktvisning" role="dialog" aria-modal="true" aria-label={`Hele økta: ${s.tittel}`}>
      <div className="ov-topp"><button ref={lukkRef} type="button" className="tilbake" onClick={onLukk}><Ikon icon={ChevronLeft} size={20} name="chevron-left" />I dag</button><span className="phn-kilde">{s.status}</span></div>
      <div className="ov-hode" style={{ background: FYLL[s.akse] }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public */}
        <img src={s.bilde.src} alt="" width={1400} height={933} style={{ objectPosition: s.bilde.posisjon }} />
        <div>
          <div className="okt-rad"><span className="akse-merke"><i />{AKSE_KODE[s.akse]}</span>{s.om && !ferdig && <span className="om">{s.om}</span>}</div>
          <div className="okt-tid">{s.tid}<small>–{s.slutt}</small></div>
          <h3>{s.tittel}</h3>
          <Link className="start" href={s.href}><Ikon icon={Play} size={20} name="play" />{startTekst}</Link>
        </div>
      </div>
      <div className="ov-kropp">
        <dl className="fakta">
          <div><dt>Varighet</dt><dd>{s.min} min</dd></div>
          <div><dt>Sted</dt><dd>{s.sted ?? "—"}</dd></div>
        </dl>
        {s.fokus && <div className="hvorfor"><b>Målsetning for økta</b>{s.fokus}</div>}
        <div className="phn-seksjon">
          <div className="phn-sek-topp"><h2>Øvelser</h2><span className="phn-kilde">{s.antallOvelser} {s.antallOvelser === 1 ? "øvelse" : "øvelser"}{sum > 0 ? ` · ${sum} min` : ""}</span></div>
          {s.ovelser.length === 0
            ? <p className="phn-forklar">Økta har ingen øvelser lagt inn ennå.</p>
            : <ol className="ovelser">{s.ovelser.map((o, i) => <li key={`${o.navn}-${i}`} className="ovelse"><span className="nr" style={{ background: FYLL[s.akse] }}>{i + 1}</span><strong>{o.navn}</strong><span className="ov-tid">{o.min > 0 ? `${o.min} min` : "—"}</span></li>)}</ol>}
        </div>
      </div>
      <div className="start-fast"><Link className="start" href={s.href}><Ikon icon={Play} size={20} name="play" />{startTekst}</Link></div>
    </section>
  </>;
}

function Godkjenning({ g, onSvar }: { g: PH01Godkjenning; onSvar: (id: string, ok: boolean, godtatt: boolean, feil?: string) => void }) {
  const [pending, start] = useTransition();
  const svar = (godtatt: boolean) => start(async () => {
    try {
      const res = await resolvePlayerApproval({ sessionId: g.id, decision: godtatt ? "ACCEPTED" : "REJECTED" });
      onSvar(g.id, res.ok, godtatt, res.ok ? undefined : res.error);
    } catch { onSvar(g.id, false, godtatt, "Svaret ble ikke bekreftet. Prøv igjen."); }
  });
  return <div className="fs" aria-busy={pending}>
    <div className="fs-topp"><div><strong>{g.fraGruppe ? "Forslag fra gruppen" : "Forslag fra coach"}</strong><small>I dag kl. {g.tid} · {g.min} min{g.sted ? ` · ${g.sted}` : ""}</small></div><span className="phn-pille vent"><i />Venter på deg</span></div>
    <div className="endring"><span className="phn-lg"><i className={`akse-${g.akse}`} />{AKSE_KODE[g.akse]}</span><strong>{g.tittel}</strong></div>
    <p className="phn-kilde">Avvis skjuler økta fra planen din.</p>
    <div className="phn-knapper">
      <button type="button" className="phn-knapp pri" disabled={pending} onClick={() => svar(true)}><Ikon icon={Check} size={20} name="check" />{pending ? "Sender svar …" : "Godta"}</button>
      <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => svar(false)}><Ikon icon={X} size={20} name="x" />Avvis</button>
    </div>
  </div>;
}

function Dagsform({ start, toast }: { start: number | null; toast: (t: string) => void }) {
  const [f, setF] = useState<number | null>(start == null ? null : start - 1);
  const [pending, begin] = useTransition();
  const velg = (i: number) => {
    const forrige = f;
    setF(i);
    begin(async () => {
      const res = await lagreDagsform({ verdi: i + 1 });
      if (res.ok) toast(`Dagsform lagret: ${i + 1} ${FORM[i]}`);
      else { setF(forrige); toast(res.feil); }
    });
  };
  return <section className="phn-kort" aria-label="Dagsform">
    <div className="phn-sek-topp"><h2>Dagsform</h2><span className="phn-kilde">{f == null ? "Ikke registrert" : `${f + 1} av 5 · ${FORM[f]}`}</span></div>
    <div className="form" role="group" aria-label="Dagsform">
      {FORM.map((x, i) => <button key={x} type="button" disabled={pending} aria-pressed={i === f} aria-label={`${i + 1} ${x}`} onClick={() => velg(i)}><b>{i + 1}</b><span>{x}</span></button>)}
    </div>
  </section>;
}

function Mer({ p, toast }: { p: PH01Props; toast: (t: string) => void }) {
  const f = p.fullfort;
  return <section className="phn-seksjon a-mer" aria-label="Mer om dagen">
    <div className="phn-sek-topp"><h2>Mer om dagen</h2></div>
    <div className="mer">
      <Dagsform start={p.dagsform} toast={toast} />
      <section className="phn-kort" aria-label="Agenda i dag">
        <div className="phn-sek-topp"><h2>Agenda i dag</h2><span className="phn-kilde">{p.agenda.length ? `${p.agenda.length} hendelser` : "—"}</span></div>
        {p.agenda.length ? <Tidslinje items={p.agenda} dense /> : <p className="phn-forklar">Ingenting planlagt i dag.</p>}
      </section>
      <section className="phn-kort" aria-label="Neste fysiske økt">
        <div className="phn-sek-topp"><h2>Neste fysiske økt</h2></div>
        {!p.fys ? <p className="phn-forklar">Ingen fysisk plan ennå. Fysiske økter kommer med treningsplanen.</p> : <>
          <div><strong className="blokk">{p.fys.tittel}</strong><span className="phn-kilde">{p.fys.meta}</span></div>
          {p.fys.rader.length > 0 && <div className="rader" role="list">{p.fys.rader.map(([n, q, r], i) => <div role="listitem" key={`${n}-${i}`}><span>{n}</span><span className="mono">{q}</span><span className="mono">{r}</span></div>)}</div>}
          <div><Link className="phn-knapp sek" href={p.fys.href}>Registrer sett</Link></div>
        </>}
      </section>
      <section className="phn-kort" aria-label="Neste turnering">
        <div className="phn-sek-topp"><h2>Neste turnering</h2></div>
        {!p.turn ? <><p className="phn-forklar">Ingen turnering i planen.</p><div><Link className="phn-knapp sek" href="/portal/tren/turneringer">Legg til turnering</Link></div></> : <>
          <div className="phn-hoved"><span className="stort">{p.turn.dager}</span><span>{p.turn.dager === 1 ? "dag igjen" : "dager igjen"}</span></div>
          <div><strong className="blokk">{[p.turn.tittel, p.turn.sted].filter(Boolean).join(" · ")}</strong><span className="phn-kilde">{p.turn.meta}</span></div>
          <div><Link className="phn-knapp sek" href={p.turn.href}>Se forberedelser</Link></div>
        </>}
      </section>
      <section className="phn-kort" aria-label="Fullførte økter">
        <div className="phn-sek-topp"><h2>Fullførte økter{f ? ` uke ${f.uke}` : ""}</h2><span className="phn-kilde">{f && f.totalt > 0 ? `${f.igjen} igjen · ${f.hoppetOver} hoppet over` : "—"}</span></div>
        <div className="phn-hoved"><span className="stort">{f && f.totalt > 0 ? f.gjennomfort : "—"}</span><span>av {f && f.totalt > 0 ? f.totalt : "—"} økter</span></div>
        <div className="milepael" role="list">{(f?.milepaeler ?? [{ antall: 10, naadd: null }, { antall: 50, naadd: null }, { antall: 100, naadd: null }]).map((m) => {
          const naadd = f != null && f.total >= m.antall;
          return <div role="listitem" key={m.antall} data-naadd={naadd}><b>{m.antall}</b><span>{!f ? "—" : naadd ? `Nådd ${m.naadd ?? ""}`.trim() : `${m.antall - f.total} igjen`}</span></div>;
        })}</div>
        <span className="phn-kilde">{f ? f.totalKilde : "—"}</span>
      </section>
    </div>
  </section>;
}

const ingenAbonnement = () => () => {};

function Popup({ p, toast }: { p: PH01Popup; toast: (t: string) => void }) {
  const K = `phq-popup-${p.id}`;
  const [lukket, setLukket] = useState(false);
  // Sett i denne fanen før? sessionStorage leses bare i nettleseren; serveren tegner ingen pop-up.
  const sett = useSyncExternalStore(ingenAbonnement, () => { try { return sessionStorage.getItem(K) != null; } catch { return false; } }, () => true);
  const open = !lukket && !sett;
  const lukk = () => { try { sessionStorage.setItem(K, "1"); } catch { /* privat modus */ } setLukket(true); };
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") lukk(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  });
  if (!open) return null;
  return <div className="pa-scrim" onClick={lukk}>
    <div className="pa-dialog" role="dialog" aria-modal="true" aria-label={p.kind} style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
      <div className="pa-dialog__head"><div className="pa-dialog__title">{p.kind}</div><button type="button" className="pa-iconbtn" aria-label="Lukk" onClick={lukk}><Ikon icon={X} size={18} name="x" /></button></div>
      <div className="pa-dialog__body"><div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span className="pa-meta">{p.tid}</span><strong style={{ font: "600 17px/1.3 var(--font-sans)" }}>{p.title}</strong>{p.body && <p style={{ margin: 0 }}>{p.body}</p>}</div></div>
      <div className="pa-dialog__foot"><div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", width: "100%" }}>
        <button type="button" className="pa-btn pa-btn--secondary" onClick={() => { lukk(); toast("Ligger i innboksen bak bjella"); }}>Ignorer</button>
        <Link href={p.href} className="pa-btn pa-btn--primary" onClick={lukk}>Les</Link>
      </div></div>
    </div>
  </div>;
}

export function PH01IDag(p: PH01Props) {
  const router = useRouter();
  const { vis: toast, el: toastEl } = useToast();
  const [besvart, setBesvart] = useState<{ id: string; tekst: string }[]>([]);
  const [aapen, setAapen] = useState<string | null>(null);
  const godkj = p.godkjenninger.filter((g) => !besvart.some((b) => b.id === g.id));
  const onSvar = (id: string, ok: boolean, godtatt: boolean, feil?: string) => {
    if (!ok) { toast(feil ?? "Svaret ble ikke lagret. Prøv igjen."); return; }
    const g = p.godkjenninger.find((x) => x.id === id);
    setBesvart((l) => [...l, { id, tekst: `${godtatt ? "Godtatt" : "Avvist"}: ${g?.tittel ?? "forslaget"}` }]);
    router.refresh();
  };
  const neste = p.okter.find((o) => o.id === p.nesteId) ?? null;
  const visOkt = p.okter.find((o) => o.id === aapen) ?? null;
  const ferdige = p.okter.filter((o) => o.status === "Gjennomført");
  const aktive = p.okter.filter((o) => o.status !== "Gjennomført");

  return <div className="phn phn-idag phn-idag2"><div className="idag2">
    <header className="a-over idag2-hode">
      <div className="phn-dato">{p.dato}</div>
      <h1 className="phn-tittel">I dag</h1>
      {p.tilstand !== "feil" && neste && <button type="button" className="snarvei2" onClick={() => setAapen(neste.id)}>
        <i aria-hidden />{neste.status === "Pågår" ? "Pågår nå" : "Neste"}: {neste.tid} {neste.tittel}{neste.om ? ` · ${neste.om.toLowerCase()}` : ""}
        <Ikon icon={ChevronRight} size={16} name="chevron-right" />
      </button>}
    </header>
    {p.tilstand === "feil" ? <section className="phn-kort a-tall" role="alert" aria-label="Feil">
      <h2 className="phn-h2">Kunne ikke hente dagens plan</h2>
      <p className="phn-forklar">Tilkoblingen ble brutt. Ingenting er endret i planen din.</p>
      <span className="phn-kilde">{p.feilKode}</span>
      <div><button type="button" className="phn-knapp sek" onClick={() => router.refresh()}><Ikon icon={RotateCw} size={20} name="rotate-cw" />Prøv igjen</button></div>
    </section> : <>
      {p.popup && <Popup p={p.popup} toast={toast} />}
      <TreTall uka={p.uka} snitt={p.snitt ?? null} e={p.etterlevelse} />
      <Maalsetninger maal={p.maal} />
      <div className="a-ekstra">{p.children}</div>
      <div className="idag2-kol idag2-v">
        <section className="dag2" aria-label="Dagens økter">
          <div className="sek-topp"><h2>Dagens økter</h2><Link className="phn-lenke" href="/portal/planlegge">Åpne Plan</Link></div>
          {p.okter.length === 0
            ? <div className="tom2"><p className="phn-forklar">{p.tomTekst}</p><div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/planlegge/workbench">Bygg økter i Workbench</Link><Link className="phn-knapp sek" href="/portal/mal/runder/ny">Registrer runde</Link></div></div>
            : <div className="dag2-liste">{ferdige.map((s) => <OktKort key={s.id} s={s} onAapne={() => setAapen(s.id)} />)}{aktive.map((s) => <OktKort key={s.id} s={s} onAapne={() => setAapen(s.id)} />)}</div>}
        </section>
        {neste && neste.status !== "Gjennomført" && <Link href={neste.href} className="start2 phn-mobil">
        <span><b>{neste.status === "Pågår" ? "Fortsett økt" : "Start økt"}</b><span>{neste.tittel} · {neste.tid}</span></span>
        <Ikon icon={Play} size={20} name="play" />
      </Link>}
        {p.nesteOkt && <section className="neste2" aria-label="Neste økt">
          <div className="sek-topp"><h2>Neste økt</h2></div>
          <Link href={p.nesteOkt.href} className="rad2">
            <span className="rad2-tid mono"><span>{p.nesteOkt.dag}</span><b>{p.nesteOkt.tid}</b></span>
            <i className="rad2-strek" style={{ background: `var(--phn-${p.nesteOkt.akse})` }} aria-hidden />
            <span className="rad2-tekst"><b>{p.nesteOkt.tittel}</b><span>{[AKSE_KODE[p.nesteOkt.akse], `${p.nesteOkt.min} min`, p.nesteOkt.sted, `${p.nesteOkt.antallOvelser} ${p.nesteOkt.antallOvelser === 1 ? "øvelse" : "øvelser"}`].filter(Boolean).join(" · ")}</span></span>
          </Link>
        </section>}
      </div>
      <div className="idag2-kol idag2-h">
        {(godkj.length > 0 || besvart.length > 0) && <section className="forslag2" aria-label="Forslag som venter">
          <div className="sek-topp"><h2>Forslag som venter</h2>{godkj.length > 0 && <span className="mono">{godkj.length}</span>}</div>
          <div className="forslag">
            {besvart.map((b) => <div key={b.id} className="kvittering" role="status"><Ikon icon={Check} size={20} name="check" /><span>{b.tekst}</span></div>)}
            {godkj.map((g) => <Godkjenning key={g.id} g={g} onSvar={onSvar} />)}
          </div>
        </section>}
        {p.melding && <section className="melding2" aria-label="Nye meldinger">
          <div className="sek-topp"><h2>Nye meldinger</h2><Link className="phn-lenke" href="/portal/varsler">Innboks</Link></div>
          <Link href={p.melding.href} className="melding2-rad"><span>«{p.melding.tekst}»</span><span className="tall-kilde">{p.melding.fra} · {p.melding.tid}</span></Link>
        </section>}
        {p.uka && p.dager && p.dager.length === 7 && <Uke uke={p.uka.uke} dager={p.dager} />}
        {p.sg && <Sg sg={p.sg} />}
      </div>
      {p.fireukerssjekk && <section className="phn-kort sjekk a-sjekk" aria-label="Fireukerssjekk">
        <div className="phn-sek-topp"><h2>Fireukerssjekk</h2></div>
        <p className="phn-forklar">Prosessmål, målsetninger og utviklingssjekken på ditt nivå. Tar rundt 10 minutter.</p>
        <div><Link className="phn-knapp sek" href={p.fireukerssjekk.href}><Ikon icon={ClipboardCheck} size={20} name="clipboard-check" />Start sjekken</Link></div>
      </section>}
      <Mer p={p} toast={toast} />
    </>}
    </div>
    {visOkt && <Oktvisning s={visOkt} onLukk={() => setAapen(null)} />}
    {toastEl}
  </div>;
}
