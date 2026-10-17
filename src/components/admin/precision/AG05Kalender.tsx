"use client";

/**
 * AG-05 Kalender, pakke 3 (bygget natt 17.10 etter
 * docs/design-system/utkast-agencyos/kalender.html): Dag med kolonne per coach,
 * Uke, Måned og År, filter på coach, og visningen for assistant coach.
 * Uke, Dag og Måned deler datakilden (KalenderLagUkeData); År har egen.
 *
 * Reglene: farge er akse, aldri coach. Head coach ser alt. Assistant coach ser
 * egne økter og bookinger og alle gruppeøkter; andre coachers timer står som
 * «Opptatt» (maskert på serveren, maskerForSeer). Flytting av en økt lagres med
 * en gang, og spilleren varsles etter 10 sekunder med «Angre» i mellomtiden.
 *
 * Avvik mot utkastet:
 *   - Bookinger flyttes ikke fra kalenderen: der foreslår coachen ny tid fra
 *     bookingen, og spilleren godtar (§COACH SOM AVLYSER, 15.10). Gruppeøkter
 *     flyttes i gruppas plan. Bare enkeltøkter fra Workbench flyttes her.
 *   - Flytt-arket har dato og klokkeslett, ikke ferdige ledige tider.
 *   - Gruppeøkter viser antall spillere, ikke «påmeldte / plasser»: gruppa har
 *     ikke et plassantall i basen.
 *   - Bookingers akse leses fra tjenestenavnet (samme ordliste som Cockpit);
 *     uten treff er blokka nøytral grafitt.
 *   - «Google synket»-merket, forslag til ny gruppeøkt og treningssamling som
 *     egen blokk finnes ikke i koden. Skole, turneringer og tester (lagene) er beholdt.
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Knapp, KnappLenke, Nokkelverdier, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import {
  ALLE_LAG,
  LAG_LABEL,
  LAG_MENY_LABEL,
  filtrerCoach,
  iCoachKolonne,
  synlige,
  type KalenderHendelse,
  type KalenderLag,
} from "@/lib/domain/kalender-lag";
import type { KalenderLagUkeData } from "@/app/admin/kalender/lag/data";
import type { KalenderAarData } from "@/app/admin/kalender/aar-data";
import { flyttOktFraKalender, varsleOktFlyttet } from "@/app/admin/kalender/flytt-okt-actions";
import "@/styles/agencyos-ny-kalender.css";

const H0 = 6;
const H1 = 22;
const AKSER = ["fys", "tek", "slag", "spill", "turn"] as const;

function ukedagKort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d))).slice(0, 3);
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function dagMnd(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d}.${m}`;
}
function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}
const tid = (e: KalenderHendelse) => (e.heldag ? "Hele dagen" : e.startMin != null ? `${hhmm(e.startMin)}${e.sluttMin != null ? `–${hhmm(e.sluttMin)}` : ""}` : "—");
const fargeKlasse = (e: KalenderHendelse) => (e.opptatt ? "opptatt" : e.akse ?? "noy");
const initialer = (navn: string) => navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]?.toUpperCase()).join("");

/** Lagfilter: hvilke kalenderlag som vises. */
function useLagFilter(startLag?: KalenderLag) {
  const [valgt, setValgt] = useState<Set<KalenderLag>>(() => new Set(startLag ? [startLag] : ALLE_LAG));
  const veksle = (l: KalenderLag) => {
    const neste = new Set(valgt);
    if (neste.has(l)) neste.delete(l);
    else neste.add(l);
    setValgt(neste);
  };
  return { valgt, veksle };
}

function LagFilter({ valgt, veksle }: { valgt: ReadonlySet<KalenderLag>; veksle: (l: KalenderLag) => void }) {
  return <div className="chips" role="group" aria-label="Lag">
    {ALLE_LAG.map((l) => <button key={l} type="button" aria-pressed={valgt.has(l)} onClick={() => veksle(l)}>{LAG_MENY_LABEL[l]}</button>)}
  </div>;
}

function CoachFilter({ coacher, valgt, velg }: { coacher: KalenderLagUkeData["coacher"]; valgt: string | null; velg: (id: string | null) => void }) {
  if (coacher.length < 2) return null;
  return <div className="chips" role="group" aria-label="Coach">
    <button type="button" aria-pressed={valgt === null} onClick={() => velg(null)}>Alle coacher</button>
    {coacher.map((c) => <button key={c.id} type="button" aria-pressed={valgt === c.id} onClick={() => velg(c.id)}>{c.navn.split(" ")[0]}</button>)}
  </div>;
}

function AkseForklaring() {
  return <div className="lg-rad">{AKSER.map((a) => <span key={a} className="lg"><i className={`a-${a}`} />{a.toUpperCase()}</span>)}</div>;
}

/** Forrige · I dag · Neste — periode-navigasjonen (`nav` i datakilden). */
export function AG05Periode({ forrige, idag, neste, tekst }: { forrige: string; idag: string; neste: string; tekst?: string }) {
  return <div className="kal-nav" role="group" aria-label="Periode">
    <Link href={forrige} aria-label="Forrige"><ChevronLeft className="ikon" aria-hidden /></Link>
    <Link href={idag} className="idag">I dag</Link>
    <Link href={neste} aria-label="Neste"><ChevronRight className="ikon" aria-hidden /></Link>
    {tekst && <b>{tekst}</b>}
  </div>;
}

/**
 * Flytting med angre: lagres med en gang, spilleren varsles når 10 sekunder er
 * gått, eller med en gang hvis siden lukkes før det.
 */
function useFlyttMedAngre() {
  const router = useRouter();
  const [toast, setToast] = useState<{ tekst: string; angre?: () => void } | null>(null);
  const venter = useRef<{ oktId: string; timer: ReturnType<typeof setTimeout> } | null>(null);

  const sendVarsel = useCallback(() => {
    const v = venter.current;
    if (!v) return;
    clearTimeout(v.timer);
    venter.current = null;
    void varsleOktFlyttet(v.oktId);
  }, []);

  useEffect(() => {
    window.addEventListener("pagehide", sendVarsel);
    return () => { window.removeEventListener("pagehide", sendVarsel); sendVarsel(); };
  }, [sendVarsel]);

  const flyttet = (oktId: string, nyTid: string, fra: { dato: string; tid: string }) => {
    sendVarsel();
    const timer = setTimeout(() => { sendVarsel(); setToast({ tekst: "Spilleren har fått varsel om ny tid." }); }, 10_000);
    venter.current = { oktId, timer };
    setToast({
      tekst: `Flyttet til ${nyTid}. Spilleren varsles om 10 sek.`,
      angre: async () => {
        if (venter.current?.oktId === oktId) { clearTimeout(venter.current.timer); venter.current = null; }
        const res = await flyttOktFraKalender({ oktId, dato: fra.dato, tid: fra.tid });
        setToast({ tekst: res.ok ? "Angret. Ingen varsel sendt." : res.feil });
        router.refresh();
      },
    });
    router.refresh();
  };
  return { toast, lukkToast: () => setToast(null), flyttet };
}

function HendelseArk({ ev, onClose, onFlyttet }: { ev: KalenderHendelse; onClose: () => void; onFlyttet: (oktId: string, nyTid: string, fra: { dato: string; tid: string }) => void }) {
  const [dato, setDato] = useState(ev.dato);
  const [kl, setKl] = useState(ev.startMin != null ? hhmm(ev.startMin) : "16:00");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const kanFlytte = !!ev.flyttOktId && !ev.opptatt;

  const flytt = () => {
    if (!ev.flyttOktId) return;
    start(async () => {
      const res = await flyttOktFraKalender({ oktId: ev.flyttOktId!, dato, tid: kl });
      if (!res.ok) { setFeil(res.feil); return; }
      onFlyttet(ev.flyttOktId!, `${dato === ev.dato ? "" : `${dagMnd(dato)} `}${kl}`, res.fra);
      onClose();
    });
  };

  return <div className="ark-lag" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={ev.tittel} className="ark">
      <div className="ark-topp"><div><div className="dato">{LAG_LABEL[ev.lag]}{ev.gruppe ? " · gruppe" : ""}</div><h2>{kanFlytte ? `Flytt ${ev.tittel}` : ev.tittel}</h2></div>
        <button type="button" className="lukk" aria-label="Lukk" onClick={onClose}><X className="ikon" aria-hidden /></button></div>
      <Nokkelverdier rader={[
        ["Dato", `${ukedagKort(ev.dato)} ${dagMnd(ev.dato)}`],
        ["Tid", tid(ev)],
        [ev.gruppe ? "Økt" : "Hvem", ev.undertekst || "—"],
        ...(ev.gruppe ? [["Spillere", ev.antallSpillere != null ? String(ev.antallSpillere) : "—"] as [string, string]] : []),
        ["Kolliderer med", ev.kollidererMed && ev.kollidererMed.length > 0 ? (ev.kollidererMed.length === 1 ? "1 annen hendelse" : `${ev.kollidererMed.length} andre hendelser`) : "—"],
      ]} />
      {kanFlytte && <>
        <p className="forklar">Velg ny tid. Spilleren får varsel i appen etter 10 sekunder, så du rekker å angre.</p>
        <div className="to-felt">
          <label className="felt"><span className="etikett">Dato</span><input type="date" value={dato} onChange={(e) => setDato(e.target.value)} /></label>
          <label className="felt"><span className="etikett">Tid</span><input type="time" value={kl} onChange={(e) => setKl(e.target.value)} /></label>
        </div>
        {feil && <Varsel tone="advarsel">{feil}</Varsel>}
      </>}
      <div className="knapper">
        {kanFlytte && <Knapp stor disabled={pending || !dato || !kl} onClick={flytt}>{pending ? "Flytter …" : "Flytt"}</Knapp>}
        {ev.href && <KnappLenke stor variant={kanFlytte ? "sek" : "pri"} href={ev.href}>{ev.lag === "BOOKING" ? "Åpne booking" : ev.gruppe ? "Åpne gruppa" : "Åpne"}</KnappLenke>}
      </div>
    </div>
  </div>;
}

function Toast({ toast, lukk }: { toast: { tekst: string; angre?: () => void } | null; lukk: () => void }) {
  if (!toast) return null;
  return <div className="toast" role="status">
    <span>{toast.tekst}</span>
    {toast.angre ? <button type="button" onClick={toast.angre}>Angre</button> : <button type="button" onClick={lukk}>Lukk</button>}
  </div>;
}

function Blokk({ e, onClick, style }: { e: KalenderHendelse; onClick: () => void; style?: React.CSSProperties }) {
  const kollisjon = e.kollidererMed && e.kollidererMed.length > 0;
  if (e.opptatt) return <div className="k-okt opptatt" style={style}><b>Opptatt</b><span>{tid(e)}</span></div>;
  return <button type="button" className={`k-okt ${fargeKlasse(e)}${kollisjon ? " kolliderer" : ""}`} style={style} onClick={onClick}>
    <b>{e.tittel}</b>
    <span>{e.startMin != null ? hhmm(e.startMin) : "—"}{e.undertekst ? ` · ${e.undertekst}` : ""}{e.gruppe && e.antallSpillere != null ? ` · ${e.antallSpillere} spillere` : ""}</span>
  </button>;
}

function plassering(e: KalenderHendelse): React.CSSProperties {
  const start = Math.max(H0 * 60, e.startMin ?? H0 * 60);
  const slutt = Math.min(H1 * 60, e.sluttMin ?? start + 30);
  return { top: `calc(var(--time) * ${(start - H0 * 60) / 60} + 2px)`, height: `max(32px, calc(var(--time) * ${(slutt - start) / 60} - 4px))` };
}

function Nalinje({ dato, idagIso }: { dato: string; idagIso: string }) {
  const [min, setMin] = useState<number | null>(null);
  useEffect(() => {
    const oppdater = () => {
      const deler = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      setMin(Number(deler.find((d) => d.type === "hour")?.value) * 60 + Number(deler.find((d) => d.type === "minute")?.value));
    };
    oppdater();
    const t = setInterval(oppdater, 60_000);
    return () => clearInterval(t);
  }, []);
  if (dato !== idagIso || min == null || min < H0 * 60 || min > H1 * 60) return null;
  return <div className="k-na" style={{ top: `calc(var(--time) * ${(min - H0 * 60) / 60})` }} aria-hidden />;
}

/** AG-05 Dag (og AG-05-ASS for assistant coach): én kolonne per coach. */
export function AG05Dag({ data, dagIso, startLag, erHeadCoach }: { data: KalenderLagUkeData; dagIso?: string; startLag?: KalenderLag; erHeadCoach: boolean }) {
  const [valgt, setValgt] = useState<KalenderHendelse | null>(null);
  const [coach, setCoach] = useState<string | null>(null);
  const lag = useLagFilter(startLag);
  const flytt = useFlyttMedAngre();
  const dato = dagIso && data.dager.includes(dagIso) ? dagIso : data.dager.includes(data.idagIso) ? data.idagIso : data.dager[0];
  const dagens = filtrerCoach(synlige(data.hendelser, lag.valgt), coach).filter((e) => e.dato === dato);
  const kolonneHendelser = dagens.filter(iCoachKolonne);
  const andre = dagens.filter((e) => !iCoachKolonne(e)).sort((a, b) => (a.startMin ?? -1) - (b.startMin ?? -1));
  const kolonner = data.coacher.filter((c) => (coach ? c.id === coach : true));

  return <>
    {!erHeadCoach && <div className="kort dempet"><b className="undertittel">Du ser dine økter og gruppeøktene</b>
      <p className="forklar">Privattimene til andre coacher står som «Opptatt». Head coach ser hele kalenderen.</p></div>}
    <CoachFilter coacher={data.coacher} valgt={coach} velg={setCoach} />
    <LagFilter {...lag} />
    {dagens.length === 0
      ? <Tom tittel="Ingen økter denne dagen" tekst="Bookinger, gruppeøkter og spillernes økter kommer hit." handling={<KnappLenke href="/admin/bookinger?fane=ny">Ny booking</KnappLenke>} />
      : <>
        <div className="dagvis" style={{ ["--kol" as string]: Math.max(1, kolonner.length) }}>
          <span className="hd tom" />
          {kolonner.map((c) => <span key={c.id} className="hd"><span className="avatar liten" aria-hidden>{initialer(c.navn)}</span>{c.navn.split(" ")[0]}</span>)}
          <div className="timer">{Array.from({ length: H1 - H0 }, (_, i) => <span key={i}>{String(H0 + i).padStart(2, "0")}</span>)}</div>
          {kolonner.map((c) => <div key={c.id} className="kol">
            {kolonneHendelser.filter((e) => e.coachId === c.id).map((e) => <Blokk key={e.id} e={e} style={plassering(e)} onClick={() => setValgt(e)} />)}
            <Nalinje dato={dato} idagIso={data.idagIso} />
          </div>)}
        </div>
        {andre.length > 0 && <section className="seksjon">
          <div className="sek-topp"><h2>Ellers i dag</h2><span className="kilde">Spillernes økter, skole, turneringer og tester</span></div>
          <div className="ukevis">{andre.map((e) => e.opptatt
            ? <div key={e.id} className="u-okt opptatt"><b>{e.startMin != null ? hhmm(e.startMin) : "Dag"}</b><span>Opptatt</span></div>
            : <button key={e.id} type="button" className={`u-okt ${fargeKlasse(e)}`} onClick={() => setValgt(e)}>
              <b>{e.heldag ? "Dag" : e.startMin != null ? hhmm(e.startMin) : "—"}</b><span>{e.tittel}{e.undertekst ? ` · ${e.undertekst}` : ""} · {LAG_LABEL[e.lag]}</span>
            </button>)}</div>
        </section>}
        <AkseForklaring />
        <p className="kildetekst">Trykk en økt for å flytte den. Spilleren får varsel i appen etter 10 sekunder. Bookinger får forslag om ny tid fra bookingen.</p>
      </>}
    {valgt && <HendelseArk ev={valgt} onClose={() => setValgt(null)} onFlyttet={flytt.flyttet} />}
    <Toast toast={flytt.toast} lukk={flytt.lukkToast} />
  </>;
}

/** AG-05-UKE: kort per dag på mobil, tidsrutenett på PC. */
export function AG05Uke({ data: raa, startLag }: { data: KalenderLagUkeData; startLag?: KalenderLag }) {
  const [valgt, setValgt] = useState<KalenderHendelse | null>(null);
  const [coach, setCoach] = useState<string | null>(null);
  const lag = useLagFilter(startLag);
  const flytt = useFlyttMedAngre();
  const hendelser = filtrerCoach(synlige(raa.hendelser, lag.valgt), coach);
  const perDag = (d: string) => hendelser.filter((e) => e.dato === d).sort((a, b) => (a.startMin ?? -1) - (b.startMin ?? -1));
  const antall = hendelser.filter((e) => !e.heldag).length;

  return <>
    <CoachFilter coacher={raa.coacher} valgt={coach} velg={setCoach} />
    <LagFilter {...lag} />
    {!raa.dager.some((d) => perDag(d).length)
      ? <Tom tittel="Ingen økter denne uka" tekst="Sett tilgjengelighet først, så kan spillere booke og gruppeøkter legges oppå." handling={<KnappLenke href="/admin/kalender?fane=tilg">Sett tilgjengelighet</KnappLenke>} />
      : <>
        <div className="hoved"><strong>{antall}</strong><span className="forklar">økter og bookinger denne uka{coach ? "" : ", alle coacher"}</span></div>
        <div className="ukevis bare-mobil">
          {raa.dager.map((d) => <div key={d} className={`ukedag${d === raa.idagIso ? " idag" : ""}`}>
            <h3>{ukedagKort(d)} {dagMnd(d)} <span>{perDag(d).filter((e) => !e.heldag).length}</span></h3>
            {perDag(d).length ? perDag(d).map((e) => e.opptatt
              ? <div key={e.id} className="u-okt opptatt"><b>{e.startMin != null ? hhmm(e.startMin) : "Dag"}</b><span>Opptatt</span></div>
              : <button key={e.id} type="button" className={`u-okt ${fargeKlasse(e)}${e.kollidererMed?.length ? " kolliderer" : ""}`} onClick={() => setValgt(e)}>
                <b>{e.heldag ? "Dag" : e.startMin != null ? hhmm(e.startMin) : "—"}</b><span>{e.tittel}{e.undertekst ? ` · ${e.undertekst}` : ""}{e.gruppe && e.antallSpillere != null ? ` · ${e.antallSpillere} spillere` : ""}</span>
              </button>) : <span className="kilde">—</span>}
          </div>)}
        </div>
        <div className="uke-rutenett bare-pc" style={{ ["--kol" as string]: raa.dager.length }}>
          <span className="hd tom" />
          {raa.dager.map((d) => <span key={d} className={`hd${d === raa.idagIso ? " idag" : ""}`}>{ukedagKort(d)} {dagMnd(d)}</span>)}
          <div className="timer">{Array.from({ length: H1 - H0 }, (_, i) => <span key={i}>{String(H0 + i).padStart(2, "0")}</span>)}</div>
          {raa.dager.map((d) => {
            const es = perDag(d);
            const heldag = es.filter((e) => e.heldag);
            return <div key={d} className="kol">
              {heldag.length > 0 && <div className="heldag">{heldag.map((e) => <button key={e.id} type="button" className="k-okt heldag-okt" onClick={() => setValgt(e)}><b>{e.tittel}</b></button>)}</div>}
              {es.filter((e) => !e.heldag && e.startMin != null).map((e) => <Blokk key={e.id} e={e} style={plassering(e)} onClick={() => setValgt(e)} />)}
              <Nalinje dato={d} idagIso={raa.idagIso} />
            </div>;
          })}
        </div>
        <AkseForklaring />
      </>}
    {valgt && <HendelseArk ev={valgt} onClose={() => setValgt(null)} onFlyttet={flytt.flyttet} />}
    <Toast toast={flytt.toast} lukk={flytt.lukkToast} />
  </>;
}

/** AG-05-MND: rutenett med en prikk per økt i aksefargen. */
export function AG05Maned({ data, startLag }: { data: KalenderLagUkeData; startLag?: KalenderLag }) {
  const [coach, setCoach] = useState<string | null>(null);
  const lag = useLagFilter(startLag);
  const hendelser = filtrerCoach(synlige(data.hendelser, lag.valgt), coach);
  const iManed = new Set(data.rutenett.filter((c) => c.iManed).map((c) => c.dato));
  const antall = hendelser.filter((e) => !e.heldag && iManed.has(e.dato)).length;
  return <>
    <CoachFilter coacher={data.coacher} valgt={coach} velg={setCoach} />
    <LagFilter {...lag} />
    <div className="hoved"><strong>{antall}</strong><span className="forklar">økter og bookinger i {data.periode.toLowerCase()}</span></div>
    <div className="mnd">
      {["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"].map((d) => <span key={d} className="ukedn">{d}</span>)}
      {data.rutenett.map((c) => {
        const es = c.iManed ? hendelser.filter((e) => e.dato === c.dato) : [];
        const num = Number(c.dato.slice(8, 10));
        if (!c.iManed) return <span key={c.dato} className="d ut" aria-hidden><b>{num}</b></span>;
        return <Link key={c.dato} href={`/admin/kalender?fane=dag&dato=${c.dato}`} className={`d${c.dato === data.idagIso ? " idag" : ""}`} aria-label={`${c.dato}${es.length ? ` · ${es.length} hendelser` : ""}`}>
          <b>{num}</b>
          {es.length > 0 && <span className="prikker" aria-hidden>{es.slice(0, 12).map((e) => <i key={e.id} className={`a-${e.opptatt ? "noy" : e.akse ?? "noy"}`} />)}</span>}
          {es.length > 0 && <span className="ant">{es.length} {es.length === 1 ? "hendelse" : "hendelser"}</span>}
        </Link>;
      })}
    </div>
    <AkseForklaring />
  </>;
}

/** AG-05-AR: coachede økter per måned, minutter per akse som stablet stripe. */
export function AG05Aar({ data }: { data: KalenderAarData }) {
  if (data.totalt === 0) return <Tom tittel={`Ingen økter i ${data.aar}`} tekst="Året fylles når det finnes bookinger og gruppeøkter." />;
  const naa = new Date().getFullYear() === data.aar ? new Date().getMonth() : -1;
  return <>
    <div className="hoved"><strong>{data.totalt.toLocaleString("nb-NO")}</strong><span className="forklar">coachede økter i {data.aar} (bookinger og gruppeøkter)</span></div>
    <div className="arvis">
      {data.maneder.map((m, i) => {
        const sum = Object.values(m.minutter).reduce((a, b) => a + b, 0);
        return <div key={m.maaned} className={`ar-mnd${i === naa ? " naa" : ""}`}>
          <b>{m.navn}</b>
          <div className="stablet" aria-hidden>{sum > 0 && (["fys", "tek", "slag", "spill", "turn", "noy"] as const).map((a) => m.minutter[a] > 0
            ? <i key={a} className={`a-${a}`} style={{ width: `${(m.minutter[a] / sum) * 100}%` }} /> : null)}</div>
          <span>{m.okter === 0 ? "—" : `${m.okter} ${m.okter === 1 ? "økt" : "økter"}${m.framtid ? " planlagt" : ""}`}</span>
        </div>;
      })}
    </div>
    <AkseForklaring />
    <p className="kildetekst">Måneder fram i tid er planlagt, ikke gjennomført. Grå del av stripen er økter uten kjent akse.</p>
  </>;
}
