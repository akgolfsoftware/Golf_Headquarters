"use client";

/**
 * PH-01 I dag i nytt design (designbrevet 13.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/idag.html (utkast 4). Stil: src/styles/playerhq-ny-idag.css.
 *
 * Rekkefølge (mobil): dato og ingress · snarvei til neste økt · uka som ring · målsetninger ·
 * dagens økter (fylte kort med bilde, trykk åpner hele økta) · forslag og endringer ·
 * forbedringsområder · det går bra · fireukerssjekk · mer om dagen.
 *
 * Avvik:
 *   - Målsetningene viser fremdrift i prosent og status fra appens målberegning. Start- og nå-verdi
 *     og streken for «der du burde vært» finnes ikke i datamodellen, så de vises ikke.
 *   - Prosessmål per uke med prikker vises ikke: prosessmål har ingen ukentlig telling i koden.
 *   - Forbedringsområdene sammenligner ikke med neste kategori (Broadie-estimat) og har ingen
 *     forklarende setning per slaglengde: SG lagres bare per kategori per runde.
 *   - «Det går bra nå» viser bare etterlevelsen siste fire uker. Putting-andel og personlige
 *     rekorder fra tester er ikke koblet til I dag ennå.
 *   - «Hvorfor i dag», treningsmiljø, måleutstyr og køller i hele økta vises ikke: I dag-dataene
 *     har bare målsetning, sted og øvelsesnavn med minutter.
 *   - Spill-elementer (plan-rekke, lukk ringen) er ikke avgjort og vises ikke. Fullførte økter med
 *     milepæler er beholdt under «Mer om dagen», sammen med dagsform, agenda, fysisk og turnering.
 *   - WANG-trenerens forslag (Trenerforslag) beholder sin egen komponent og vises under ringen.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-01.
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
const AKSER: Akse[] = ["fys", "tek", "slag", "spill", "turn"];
const AKSE_KODE: Record<Akse, string> = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
const FYLL: Record<Akse, string> = { fys: "var(--phn-fys-ink)", tek: "var(--phn-tek-ink)", slag: "var(--phn-slag)", spill: "var(--phn-spill-ink)", turn: "var(--phn-turn)" };

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
export type PH01Props = {
  tilstand: "data" | "tom" | "feil";
  dato: string; ingress: string; tomTekst: string; feilKode: string;
  okter: PH01Okt[]; nesteId: string | null; godkjenninger: PH01Godkjenning[];
  uka: PH01Uka | null;
  maal: PH01Maal[];
  forbedring: Forbedringsomraade[];
  /** Antall runder med Strokes Gained bak forbedringsområdene (høyst 24). */
  sgRunder?: number;
  etterlevelse: PH01Etterlevelse | null;
  fireukerssjekk: { href: string } | null;
  dagsform: number | null; agenda: TidslinjePunkt[];
  fys: PH01Fys | null; turn: PH01Turn | null; fullfort: PH01Fullfort | null;
  popup: PH01Popup | null;
  children?: React.ReactNode;
};

/** «14 t 5 min», «45 min», «0 min». */
function tidTekst(min: number): string {
  const m = Math.max(0, Math.round(min));
  const t = Math.floor(m / 60), r = m % 60;
  if (t === 0) return `${r} min`;
  return r === 0 ? `${t} t` : `${t} t ${r} min`;
}
/** Stolpetall som i tegningen: «0», «3 t», «5 t 50». */
const kortTid = (min: number) => { const m = Math.max(0, Math.round(min)); const t = Math.floor(m / 60), r = m % 60; return t === 0 ? `${r}` : r === 0 ? `${t} t` : `${t} t ${r}`; };

function useToast() {
  const [x, setX] = useState<{ t: string; k: number } | null>(null);
  useEffect(() => { if (!x) return; const h = setTimeout(() => setX(null), 2600); return () => clearTimeout(h); }, [x]);
  const el = x && <div style={{ position: "fixed", top: 16, left: 16, right: 16, display: "flex", justifyContent: "center", zIndex: 200, pointerEvents: "none" }}>
    <div key={x.k} role="status" className="pa-toast" style={{ pointerEvents: "auto", maxWidth: "100%" }}><span>{x.t}</span></div>
  </div>;
  return { vis: (t: string) => setX({ t, k: Date.now() }), el };
}

function Ring({ uka }: { uka: PH01Uka }) {
  const r = 66, omkrets = 2 * Math.PI * r, mellom = 2;
  const plan = uka.planMin;
  const pct = plan > 0 ? Math.min(100, Math.round(uka.gjortMin / plan * 100)) : 0;
  const medPlan = uka.akser.filter((a) => a.planMin > 0);
  const seg = medPlan.map((a, i) => {
    const start = medPlan.slice(0, i).reduce((sum, x) => sum + x.planMin / plan * omkrets, 0);
    const lengde = a.planMin / plan * omkrets;
    const gjort = Math.min(a.gjortMin, a.planMin) / plan * omkrets;
    return { akse: a.akse, start, lengde: Math.max(0, lengde - mellom), gjort: Math.max(0, Math.min(gjort, lengde - mellom)) };
  });
  return <div className="hero-ring" role="img" aria-label={`${pct} prosent av ukas planlagte tid gjennomført`}>
    <svg viewBox="0 0 160 160" aria-hidden>
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--phn-sand-150)" strokeWidth="16" />
      {seg.map((s) => <circle key={`p-${s.akse}`} cx="80" cy="80" r={r} fill="none" stroke={`var(--phn-${s.akse})`} strokeOpacity=".28" strokeWidth="16" strokeDasharray={`${s.lengde} ${omkrets}`} strokeDashoffset={-s.start} />)}
      {seg.filter((s) => s.gjort > 0).map((s) => <circle key={`g-${s.akse}`} cx="80" cy="80" r={r} fill="none" stroke={`var(--phn-${s.akse})`} strokeWidth="16" strokeDasharray={`${s.gjort} ${omkrets}`} strokeDashoffset={-s.start} />)}
    </svg>
    <div className="ring-tall"><strong>{pct}<small>%</small></strong><span>av uka</span></div>
  </div>;
}

function Hero({ uka }: { uka: PH01Uka }) {
  const rader = AKSER.map((a) => uka.akser.find((x) => x.akse === a)).filter((x): x is PH01Uka["akser"][number] => x != null && x.planMin + x.gjortMin > 0);
  return <section className="phn-kort hero a-hero" aria-label={`Uke ${uka.uke}`}>
    <Ring uka={uka} />
    <div className="hero-tekst">
      <div className="hero-topp"><h2>Uke {uka.uke}</h2><span>{tidTekst(uka.gjortMin)} av {tidTekst(uka.planMin)}</span></div>
      <div className="akser">
        {rader.map((x) => <div className="akse" key={x.akse}>
          <b className={`ink-${x.akse}`}>{AKSE_KODE[x.akse]}</b>
          <div className="stolpe" aria-hidden><span className={`akse-${x.akse}`} style={{ width: `${x.planMin > 0 ? Math.min(100, x.gjortMin / x.planMin * 100) : 100}%` }} /></div>
          <span className="t" aria-label={`${AKSE_KODE[x.akse]} ${tidTekst(x.gjortMin)} av ${tidTekst(x.planMin)}`}>{kortTid(x.gjortMin)} / {kortTid(x.planMin)}</span>
        </div>)}
      </div>
    </div>
  </section>;
}

const MAAL_STATUS: Record<PH01Maal["status"], [string, string]> = {
  "on-track": ["På vei", "ok"], behind: ["Bak planen", "vent"], achieved: ["Oppnådd", "ok"], "no-data": ["Ingen data ennå", "noy"],
};

function Maalsetninger({ maal }: { maal: PH01Maal[] }) {
  return <section className="phn-kort a-prog" aria-label="Slik ligger du an">
    <div className="phn-sek-topp"><h2>Slik ligger du an</h2><Link className="phn-lenke" href="/portal/mal">Målsetninger</Link></div>
    {maal.length === 0
      ? <p className="phn-forklar">Du har ingen målsetninger ennå. Sett en målsetning, så ser du fremdriften her.</p>
      : <div className="prog-grid">{maal.map((m) => {
        const [tekst, tone] = MAAL_STATUS[m.status];
        const pct = m.pct == null || m.status === "no-data" ? null : Math.round(m.pct);
        return <Link key={m.id} href={m.href} className="mr">
          <div className="mr-topp"><div><strong>{m.tittel}</strong><small>{[m.kategori, m.frist ? `frist ${m.frist}` : "ingen frist"].join(" · ")}</small></div><span className={`phn-pille ${tone}`}><i />{tekst}</span></div>
          <div className="spor" aria-hidden><span style={{ width: `${pct ?? 0}%` }} /></div>
          <div className="mr-tall"><span>Fremdrift</span><span>{pct == null ? "—" : `${pct} %`}</span></div>
        </Link>;
      })}</div>}
  </section>;
}

function OktKort({ s, neste, onAapne }: { s: PH01Okt; neste: boolean; onAapne: () => void }) {
  const ferdig = s.status === "Gjennomført";
  return <button type="button" className={`phn-okt ${s.akse} okt`} data-ferdig={ferdig} onClick={onAapne} aria-label={`Åpne økta kl. ${s.tid}, ${s.tittel}`}>
    {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
    <img src={s.bilde.src} alt="" width={1400} height={933} loading={neste ? "eager" : "lazy"} style={{ objectPosition: s.bilde.posisjon }} />
    <span className="okt-tekst">
      <span className="okt-rad"><span className="akse-merke"><i />{AKSE_KODE[s.akse]}</span><span className="om">{ferdig ? "Gjennomført" : s.status === "Pågår" ? "Pågår" : s.om ?? ""}</span></span>
      <span className="okt-tid">{s.tid}<small>–{s.slutt}</small></span>
      <span className="phn-navn navn">{s.tittel}</span>
      <span className="okt-info"><span>{s.min} min</span>{s.sted && <span>{s.sted}</span>}</span>
      <span className="okt-fot"><span>{s.antallOvelser} {s.antallOvelser === 1 ? "øvelse" : "øvelser"}</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{ferdig ? "Se økta" : "Åpne økta"}<Ikon icon={ChevronRight} size={20} name="chevron-right" /></span></span>
    </span>
  </button>;
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

function Forbedring({ omr, sgRunder = 0 }: { omr: Forbedringsomraade[]; sgRunder?: number }) {
  return <section className="phn-kort a-forb" aria-label="Forbedringsområder">
    <div className="phn-sek-topp"><h2>Forbedringsområder</h2></div>
    {omr.length === 0
      ? <p className="phn-forklar">{sgRunder >= MIN_RUNDER
        ? `Du taper ikke slag på noe område i snitt de siste ${sgRunder} rundene med Strokes Gained.`
        : "Registrer minst fire runder med Strokes Gained, så ser du hvor du taper slag."}</p>
      : <>
        <span className="phn-kilde" style={{ marginTop: -8 }}>Strokes Gained · snitt siste {Math.max(...omr.map((o) => o.runder))} runder</span>
        <div className="forb">{omr.map((o) => {
          const min = Math.min(...o.trend), maks = Math.max(...o.trend), spenn = maks - min || 1;
          const pkt = o.trend.map((v, i) => [Math.round(2 + (o.trend.length === 1 ? 46 : i / (o.trend.length - 1) * 92)), Math.round(24 - (v - min) / spenn * 20)] as const);
          const sist = pkt[pkt.length - 1]!;
          return <div className="fo" key={o.kode}>
            <div className="fo-hode"><strong>{o.navn} · {o.kode}</strong><small>{o.runder} runder</small>{o.forelopigTil && <span className="forelopig">Foreløpig, sikker fra {o.forelopigTil} runder</span>}</div>
            <div className="fo-hoyre"><span className="sg">{formaterTall(o.verdi, 1, true)}</span>
              <svg viewBox="0 0 96 28" role="img" aria-label={`Trend siste ${o.runder} runder, fra ${formaterTall(o.trend[0] ?? null, 1, true)} til ${formaterTall(o.trend[o.trend.length - 1] ?? null, 1, true)}`}><path d={pkt.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ")} fill="none" stroke="var(--phn-slag)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx={sist[0]} cy={sist[1]} r="3.5" fill="var(--phn-slag)" /></svg>
            </div>
          </div>;
        })}</div>
      </>}
  </section>;
}

function Bra({ e }: { e: PH01Etterlevelse }) {
  return <section className="phn-kort a-bra" aria-label="Det går bra nå">
    <div className="phn-sek-topp"><h2>{e.pct >= 70 ? "Det går bra nå" : "Etterlevelse"}</h2></div>
    <div className="bra">
      <div className="br"><span className="sym"><Ikon icon={Check} size={20} name="check" /></span><div><strong>{e.pct} % av planlagt tid gjennomført</strong><span>{tidTekst(e.gjortMin)} av {tidTekst(e.planMin)}.</span><small>Etterlevelse · {e.periode}</small></div></div>
    </div>
  </section>;
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

  return <div className="phn phn-idag"><div className="idag">
    <div className="a-over">
      <div className="phn-dato">{p.dato}</div>
      <h1 className="phn-tittel">I dag</h1>
      {p.tilstand !== "feil" && <p className="phn-ingress">{p.ingress}</p>}
    </div>
    {p.tilstand === "feil" ? <section className="phn-kort a-hero" role="alert" aria-label="Feil">
      <h2 className="phn-h2">Kunne ikke hente dagens plan</h2>
      <p className="phn-forklar">Tilkoblingen ble brutt. Ingenting er endret i planen din.</p>
      <span className="phn-kilde">{p.feilKode}</span>
      <div><button type="button" className="phn-knapp sek" onClick={() => router.refresh()}><Ikon icon={RotateCw} size={20} name="rotate-cw" />Prøv igjen</button></div>
    </section> : <>
      {p.popup && <Popup p={p.popup} toast={toast} />}
      {neste && <button type="button" className="snarvei a-snar" onClick={() => setAapen(neste.id)}>
        <span className="prikk" aria-hidden />
        <span><b>{neste.status === "Pågår" ? "Pågår nå" : "Neste økt"}: {neste.tittel}</b><span>kl. {neste.tid}{neste.om ? ` · ${neste.om.toLowerCase()}` : ""} · {neste.antallOvelser} {neste.antallOvelser === 1 ? "øvelse" : "øvelser"}</span></span>
        <Ikon icon={ChevronRight} size={20} name="chevron-right" />
      </button>}
      {p.uka ? <Hero uka={p.uka} /> : <section className="phn-kort a-hero" aria-label="Uka">
        <div className="phn-sek-topp"><h2>Uka</h2><span className="phn-kilde">— av —</span></div>
        <p className="phn-forklar">Uten treningsplan er det ingen uke å måle mot. Legg inn økter, så ser du tiden per akse mot det planen sier.</p>
        <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/planlegge/workbench">Bygg økter i Workbench</Link><Link className="phn-knapp sek" href="/portal/planlegge">Se planen</Link></div>
      </section>}
      <div className="a-ekstra">{p.children}</div>
      <Maalsetninger maal={p.maal} />
      <section className="phn-seksjon a-dag" aria-label="Dagens økter">
        <div className="phn-sek-topp"><h2>Dagens økter</h2></div>
        {p.okter.length === 0
          ? <div className="phn-kort"><p className="phn-forklar">{p.tomTekst}</p><div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/planlegge/workbench">Bygg økter i Workbench</Link><Link className="phn-knapp sek" href="/portal/mal/runder/ny">Registrer runde</Link></div></div>
          : <div className="dagen">{p.okter.map((s) => <OktKort key={s.id} s={s} neste={s.id === p.nesteId} onAapne={() => setAapen(s.id)} />)}</div>}
      </section>
      {(godkj.length > 0 || besvart.length > 0) && <section className="phn-kort a-forslag" aria-label="Forslag og endringer">
        <div className="phn-sek-topp"><h2>Forslag og endringer{godkj.length > 0 && <span className="antall">{godkj.length}</span>}</h2></div>
        <div className="forslag">
          {besvart.map((b) => <div key={b.id} className="kvittering" role="status"><Ikon icon={Check} size={20} name="check" /><span>{b.tekst}</span></div>)}
          {godkj.map((g) => <Godkjenning key={g.id} g={g} onSvar={onSvar} />)}
        </div>
      </section>}
      <Forbedring omr={p.forbedring} sgRunder={p.sgRunder} />
      {p.etterlevelse && <Bra e={p.etterlevelse} />}
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
