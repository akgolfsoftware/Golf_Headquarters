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
 *
 * Designløftet 20.10 (canvas «AgencyOS nøkkelskjermer», rad 5 Kalender, godkjent av
 * Anders): coachvalget er den felles nedtrekksmenyen, lagene har prikk i lagfargen,
 * gjennomførte økter er lyse, tester har ramme, og på PC åpner en time seg som et kort
 * ved siden av timen med betalingsmåte, «Foreslå ny tid» og «Avlys» (begge på bookingen).
 * Mobil beholder arket nedenfra. Forslag til nye gruppeøkter står i Innboks, ikke her.
 *
 * Skrå-drakten 22.10 (bølge 1, pakke A3, skissen https://claude.ai/artifact/NCP3fcTH2qNSYJtYVfWwNa §3):
 * AG05KalenderSide gir toppen med banebilde og fire tall, hovedkortet med neste økt i aksefargen,
 * og visningene i ett hvitt kort over hele bredden. På mobil står Dag som liste per coach.
 * Avvik:
 *   - «Ledige plasser» og «Forslag til gruppeøkt» finnes ikke i dataene og står som «—».
 *   - «Spillere i dag» telles på navnet i enkeltøktene og bookingene pluss antallet i gruppeøktene.
 *     En spiller som både har enkeltøkt og gruppeøkt samme dag, telles to ganger.
 *   - «Start live» finnes bare for bookinger (Øktarket starter live-økta). Workbench- og gruppeøkter
 *     har bare «Åpne økt».
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Nedtrekk } from "@/components/precision/Nedtrekk";
import { SkraFlyt, SkraHelt, SkraKort, SkraStat, SkraTopp } from "@/components/precision/skra/Skra";
import { Knapp, KnappLenke, Nokkelverdier, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import {
  ALLE_LAG,
  betalingTekst,
  LAG_LABEL,
  LAG_MENY_LABEL,
  filtrerCoach,
  iCoachKolonne,
  synlige,
  type KalenderAkse,
  type KalenderHendelse,
  type KalenderLag,
} from "@/lib/domain/kalender-lag";
import type { KalenderLagUkeData } from "@/app/admin/kalender/lag/data";
import type { KalenderAarData } from "@/app/admin/kalender/aar-data";
import { flyttOktFraKalender, varsleOktFlyttet } from "@/app/admin/kalender/flytt-okt-actions";
import "@/styles/agencyos-ny-kalender.css";
import "@/styles/agencyos-ny-kalender-skra.css";

const KAL_BILDE = "/images/playerhq/green-25m.jpg";
/** Mørk aksefarge for hovedkortet (hvit tekst må leses). Ukjent akse: grafitt. Samme som Cockpit. */
const HELT_FARGE: Record<KalenderAkse, string> = { fys: "var(--fys-ink)", tek: "var(--tek-ink)", slag: "var(--slag)", spill: "var(--spill-ink)", turn: "var(--turn)" };

/** Tallene i toppen. `null` = finnes ikke i dataene, vises som «—». */
export type AG05Tall = { okterIdag: number | null; spillereIdag: number | null; ledigePlasser: number | null; forslagGruppeokt: number | null };

/** Hovedkortet: økta som pågår, ellers neste økt i dag for den som ser. */
export type AG05Neste = {
  pagar: boolean;
  start: string;
  slutt: string | null;
  hvem: string;
  meta: string;
  akse: KalenderAkse | null;
  liveHref: string | null;
  aapneHref: string | null;
};

/** Bare økter med klokkeslett som binder en coach: bookinger og Workbench-/gruppeøkter, aldri maskert tid. */
const erCoachetOkt = (e: KalenderHendelse) => !e.heldag && !e.opptatt && e.startMin != null && (e.lag === "BOOKING" || e.lag === "OEKTER");

/** Tallene for dagen: økter og spillere (navn i enkeltøkter og bookinger, antall i gruppeøkter). */
export function kalenderTallIdag(hendelser: readonly KalenderHendelse[], idagIso: string): Pick<AG05Tall, "okterIdag" | "spillereIdag"> {
  const dagens = hendelser.filter((e) => e.dato === idagIso && erCoachetOkt(e));
  const navn = new Set<string>();
  let iGrupper = 0;
  for (const e of dagens) {
    if (e.gruppe) iGrupper += e.antallSpillere ?? 0;
    else {
      const hvem = e.lag === "BOOKING" ? e.tittel : e.undertekst;
      if (hvem) navn.add(hvem.toLocaleLowerCase("nb-NO"));
    }
  }
  return { okterIdag: dagens.length, spillereIdag: navn.size + iGrupper };
}

/**
 * Neste økt for den som ser: økta som pågår, ellers den første som ikke er ferdig. Bare egne økter
 * (coachId), så hovedkortet aldri viser en annen coachs time. Ingen igjen: null.
 */
export function nesteOkt(hendelser: readonly KalenderHendelse[], idagIso: string, naaMin: number, seerId: string): AG05Neste | null {
  const egne = hendelser
    .filter((e) => e.dato === idagIso && erCoachetOkt(e) && e.coachId === seerId && !e.gjennomfort)
    .sort((a, b) => a.startMin! - b.startMin!);
  const e = egne.find((x) => (x.sluttMin ?? x.startMin! + 30) > naaMin);
  if (!e) return null;
  const bookingId = e.lag === "BOOKING" && e.href?.startsWith("/admin/bookinger/") ? e.href.slice("/admin/bookinger/".length) : null;
  // Booking og gruppeøkt: tittelen er spilleren eller gruppa. Enkeltøkt: tittelen er økta, spilleren står under.
  const enkeltokt = e.lag === "OEKTER" && !e.gruppe;
  return {
    pagar: e.startMin! <= naaMin,
    start: hhmm(e.startMin!),
    slutt: e.sluttMin != null ? hhmm(e.sluttMin) : null,
    hvem: enkeltokt ? (e.undertekst ?? e.tittel) : e.tittel,
    meta: [enkeltokt ? e.tittel : e.undertekst, e.gruppe && e.antallSpillere != null ? `${e.antallSpillere} spillere` : null].filter(Boolean).join(" · "),
    akse: e.akse ?? null,
    liveHref: bookingId ? `/admin/gjennomfore/okter/${bookingId}` : null,
    aapneHref: e.href ?? null,
  };
}

const AKSE_LANG: Record<KalenderAkse, string> = { fys: "Fysisk", tek: "Teknisk", slag: "Golfslag", spill: "Spill", turn: "Turnering" };
const tallTekst = (n: number | null) => (n == null ? "—" : n);

/**
 * Skallet for /admin/kalender i Skrå-drakten: topp med bilde og fire tall, hovedkortet med neste økt,
 * og fanene med visningen i ett hvitt kort. Visningene selv er AG05Dag, AG05Uke, AG05Maned, AG05Aar,
 * Stall-dag og Tilgjengelighet.
 */
export function AG05KalenderSide({ overlinje, tall, neste, faner, navigasjon, children }: {
  overlinje: string;
  tall: AG05Tall;
  neste: AG05Neste | null;
  faner: readonly { id: string; label: string; href: string; aktiv: boolean }[];
  navigasjon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return <div className="agn-s agn-kal-skra">
    <SkraTopp
      etikett="Kalender"
      bilde={KAL_BILDE}
      bildePosisjon="50% 55%"
      overlinje={overlinje}
      tittel="Kalender"
      handling={<div className="knapper kal-skra-knapper">
        <KnappLenke variant="pri" href="/admin/bookinger?fane=ny">Ny booking</KnappLenke>
        <KnappLenke href="/admin/kalender/hendelse/ny">Ny hendelse</KnappLenke>
      </div>}
      tall={<>
        <SkraStat verdi={tallTekst(tall.okterIdag)} etikett="Økter i dag" href="/admin/kalender?fane=dag" />
        <SkraStat verdi={tallTekst(tall.spillereIdag)} etikett="Spillere i dag" />
        <SkraStat verdi={tallTekst(tall.ledigePlasser)} etikett="Ledige plasser" ariaLabel={tall.ledigePlasser == null ? "Ledige plasser: ikke regnet ut" : undefined} />
        <SkraStat verdi={tallTekst(tall.forslagGruppeokt)} etikett="Forslag til gruppeøkt" href="/admin/innboks" ariaLabel={tall.forslagGruppeokt == null ? "Forslag til gruppeøkt: ikke regnet ut. Åpne Innboks" : undefined} />
      </>}
    />
    <SkraFlyt className="kal-skra-flyt">
      {neste && <SkraHelt
        etikett={`${neste.pagar ? "Pågår nå" : "Neste økt"}: ${neste.hvem}`}
        farge={neste.akse ? HELT_FARGE[neste.akse] : undefined}
        overlinje={`${neste.pagar ? "Pågår nå" : "Neste økt i dag"}${neste.akse ? ` · ${AKSE_LANG[neste.akse]}` : ""}`}
        tid={neste.start}
        tidEtter={neste.slutt ? `–${neste.slutt}` : undefined}
        tittel={neste.hvem}
        meta={neste.meta || undefined}
        handlinger={[
          ...(neste.liveHref ? [{ tekst: "Start live", href: neste.liveHref }] : []),
          ...(neste.aapneHref ? [{ tekst: "Åpne økt", href: neste.aapneHref, sekundaer: !!neste.liveHref }] : []),
        ]}
      />}
      <SkraKort etikett="Kalender" className="kal-skra-kort">
        <nav className="valg" aria-label="Visning">
          {faner.map((f) => <Link key={f.id} href={f.href} aria-current={f.aktiv ? "page" : undefined}>{f.label}</Link>)}
        </nav>
        {navigasjon}
        <div className="pa-root kal-innhold">{children}</div>
      </SkraKort>
    </SkraFlyt>
  </div>;
}

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
  return <div className="chips kal-lag" role="group" aria-label="Vis i kalenderen">
    <span className="kal-lag-etikett">Vis</span>
    {ALLE_LAG.map((l) => <button key={l} type="button" aria-pressed={valgt.has(l)} onClick={() => veksle(l)}><i className={`lag-prikk lag-${l.toLowerCase()}`} aria-hidden />{LAG_MENY_LABEL[l]}</button>)}
  </div>;
}

/** Coachvalget: felles nedtrekksmeny med antall timer per coach. Vises bare med to eller flere coacher. */
function CoachFilter({ coacher, valgt, velg, hendelser }: { coacher: KalenderLagUkeData["coacher"]; valgt: string | null; velg: (id: string | null) => void; hendelser: readonly KalenderHendelse[] }) {
  if (coacher.length < 2) return null;
  const tell = (id: string | null) => String(hendelser.filter((e) => !e.heldag && (id === null || e.coachId === id)).length);
  const valg = [{ verdi: "alle", navn: "Alle coacher", antall: tell(null) }, ...coacher.map((c) => ({ verdi: c.id, navn: c.navn, antall: tell(c.id) }))];
  return <Nedtrekk etikett="Coach" valg={valg} verdi={valgt ?? "alle"} onVelg={(v) => velg(v === "alle" ? null : v)} hoyre />;
}

/** «12 økter · 14,5 t»: timer regnes bare av hendelser med klokkeslett, aldri av opptatt tid. */
function oppsummer(hendelser: readonly KalenderHendelse[]): string {
  const timet = hendelser.filter((e) => !e.heldag && !e.opptatt && e.startMin != null);
  const min = timet.reduce((s, e) => s + Math.max(0, (e.sluttMin ?? e.startMin! + 30) - e.startMin!), 0);
  if (timet.length === 0) return "—";
  return `${timet.length} ${timet.length === 1 ? "økt" : "økter"} · ${(min / 60).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} t`;
}

function Verktoy({ children, sum }: { children: React.ReactNode; sum: string }) {
  return <div className="kal-verktoy">{children}<span className="kal-sum">{sum}</span></div>;
}

function AkseForklaring() {
  return <>
    <div className="lg-rad">{AKSER.map((a) => <span key={a} className="lg"><i className={`a-${a}`} />{a.toUpperCase()}</span>)}</div>
    <p className="kildetekst">Fylt = planlagt · lys = gjennomført · stripet = opptatt · ramme = test</p>
  </>;
}

const PC_FRA = "(min-width: 900px)";
function useErPc(): boolean {
  const [pc, setPc] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PC_FRA);
    const oppdater = () => setPc(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return pc;
}

/** Valgt hendelse og hvor den ble trykket (for kortet ved siden av timen på PC). */
type Valgt = { ev: KalenderHendelse; anker: DOMRect | null };
const KORT_B = 316;
function kortPlass(anker: DOMRect): React.CSSProperties {
  const hoyre = anker.right + 8 + KORT_B <= window.innerWidth - 12;
  const left = hoyre ? anker.right + 8 : Math.max(12, anker.left - 8 - KORT_B);
  const top = Math.min(Math.max(12, anker.top - 24), window.innerHeight - 420);
  return { left, top: Math.max(12, top), transformOrigin: hoyre ? "top left" : "top right" };
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

function HendelseArk({ ev, anker, onClose, onFlyttet }: { ev: KalenderHendelse; anker?: DOMRect | null; onClose: () => void; onFlyttet: (oktId: string, nyTid: string, fra: { dato: string; tid: string }) => void }) {
  const pc = useErPc();
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
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

  const erBooking = ev.lag === "BOOKING" && !!ev.href;
  const kanEndreBooking = erBooking && !ev.gjennomfort;
  const kort = pc && anker;
  return <div className={kort ? "kal-kort-lag" : "ark-lag"} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={ev.tittel} className={kort ? "kal-kort" : "ark"} style={kort ? kortPlass(anker) : undefined}>
      <div className="ark-topp"><div><div className="dato">{LAG_LABEL[ev.lag]}{ev.gruppe ? " · gruppe" : ""}</div><h2>{kanFlytte ? `Flytt ${ev.tittel}` : ev.tittel}</h2></div>
        <button type="button" className="lukk" aria-label="Lukk" onClick={onClose}><X className="ikon" aria-hidden /></button></div>
      <Nokkelverdier rader={[
        ["Dato", `${ukedagKort(ev.dato)} ${dagMnd(ev.dato)}`],
        ["Tid", tid(ev)],
        [ev.gruppe ? "Økt" : "Hvem", ev.undertekst || "—"],
        ...(ev.gruppe ? [["Spillere", ev.antallSpillere != null ? String(ev.antallSpillere) : "—"] as [string, string]] : []),
        ["Kolliderer med", ev.kollidererMed && ev.kollidererMed.length > 0 ? (ev.kollidererMed.length === 1 ? "1 annen hendelse" : `${ev.kollidererMed.length} andre hendelser`) : "—"],
        ...(erBooking ? [
          ["Betaling", betalingTekst(ev.betaling)] as [string, string],
          ["Status", ev.gjennomfort ? "Gjennomført" : ev.nyTidForeslatt ? "Ny tid foreslått, venter på spilleren" : "Bekreftet"] as [string, string],
        ] : []),
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
      {kanEndreBooking && <>
        <div className="kal-kort-to">
          <KnappLenke href={`${ev.href}#ny-tid`}>Foreslå ny tid</KnappLenke>
          <KnappLenke href={`${ev.href}#avlys`}>Avlys</KnappLenke>
        </div>
        <p className="kildetekst">Ny tid gjelder først når spilleren godtar. Avlyser du, får spilleren alt tilbake.</p>
      </>}
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

/** Gjennomført: bookingen er merket ferdig, eller dagen er passert. */
const erFerdig = (e: KalenderHendelse, idagIso: string) => !!e.gjennomfort || e.dato < idagIso;

function Blokk({ e, onClick, style, idagIso, coachKort }: { e: KalenderHendelse; onClick: (anker: DOMRect) => void; style?: React.CSSProperties; idagIso: string; coachKort?: string }) {
  const kollisjon = e.kollidererMed && e.kollidererMed.length > 0;
  if (e.opptatt) return <div className="k-okt opptatt" style={style}><b>Opptatt</b><span>{tid(e)}</span></div>;
  const klasser = ["k-okt", e.lag === "TESTER" ? "test" : fargeKlasse(e), erFerdig(e, idagIso) ? "ferdig" : "", kollisjon ? "kolliderer" : ""].filter(Boolean).join(" ");
  return <button type="button" className={klasser} style={style} onClick={(ev) => onClick(ev.currentTarget.getBoundingClientRect())}>
    <b>{e.tittel}{coachKort ? <small className="k-coach">{coachKort}</small> : null}</b>
    <span>{e.startMin != null ? hhmm(e.startMin) : "—"}{e.undertekst ? ` · ${e.undertekst}` : ""}{e.gruppe && e.antallSpillere != null ? ` · ${e.antallSpillere} spillere` : ""}</span>
  </button>;
}

function plassering(e: KalenderHendelse): React.CSSProperties {
  const start = Math.max(H0 * 60, e.startMin ?? H0 * 60);
  const slutt = Math.min(H1 * 60, e.sluttMin ?? start + 30);
  return { top: `calc(var(--time) * ${(start - H0 * 60) / 60} + 2px)`, height: `max(44px, calc(var(--time) * ${(slutt - start) / 60} - 4px))` };
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
  const [valgt, setValgt] = useState<Valgt | null>(null);
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
    <Verktoy sum={oppsummer(dagens)}>
      <CoachFilter coacher={data.coacher} valgt={coach} velg={setCoach} hendelser={synlige(data.hendelser, lag.valgt).filter((e) => e.dato === dato)} />
      <LagFilter {...lag} />
    </Verktoy>
    {dagens.length === 0
      ? <Tom tittel="Ingen økter denne dagen" tekst="Bookinger, gruppeøkter og spillernes økter kommer hit." handling={<KnappLenke href="/admin/bookinger?fane=ny">Ny booking</KnappLenke>} />
      : <>
        {/* Mobil: dagen som liste per coach, aldri et rutenett som må rulles sidelengs. */}
        <div className="kal-dagliste bare-mobil">
          {kolonner.map((c) => {
            const es = kolonneHendelser.filter((e) => e.coachId === c.id).sort((a, b) => (a.startMin ?? -1) - (b.startMin ?? -1));
            return <section key={c.id} className="kal-coach" aria-label={c.navn}>
              <h3><span className="avatar liten" aria-hidden>{initialer(c.navn)}</span>{c.navn}<span className="ant">{es.length || "—"}</span></h3>
              {es.length === 0 ? <span className="kilde">Ingen økter</span> : es.map((e) => e.opptatt
                ? <div key={e.id} className="u-okt opptatt"><b>{tid(e)}</b><span>Opptatt</span></div>
                : <button key={e.id} type="button" className={`u-okt ${e.lag === "TESTER" ? "test" : fargeKlasse(e)}${erFerdig(e, data.idagIso) ? " ferdig" : ""}${e.kollidererMed?.length ? " kolliderer" : ""}`} onClick={() => setValgt({ ev: e, anker: null })}>
                  <b>{tid(e)}</b><span>{e.tittel}{e.undertekst ? ` · ${e.undertekst}` : ""}{e.gruppe && e.antallSpillere != null ? ` · ${e.antallSpillere} spillere` : ""}</span>
                </button>)}
            </section>;
          })}
        </div>
        <div className="dagvis bare-pc" style={{ ["--kol" as string]: Math.max(1, kolonner.length) }}>
          <span className="hd tom" />
          {kolonner.map((c) => <span key={c.id} className="hd"><span className="avatar liten" aria-hidden>{initialer(c.navn)}</span>{c.navn.split(" ")[0]}</span>)}
          <div className="timer">{Array.from({ length: H1 - H0 }, (_, i) => <span key={i}>{String(H0 + i).padStart(2, "0")}</span>)}</div>
          {kolonner.map((c) => <div key={c.id} className="kol">
            {kolonneHendelser.filter((e) => e.coachId === c.id).map((e) => <Blokk key={e.id} e={e} style={plassering(e)} idagIso={data.idagIso} onClick={(anker) => setValgt({ ev: e, anker })} />)}
            <Nalinje dato={dato} idagIso={data.idagIso} />
          </div>)}
        </div>
        {andre.length > 0 && <section className="seksjon">
          <div className="sek-topp"><h2>Ellers i dag</h2><span className="kilde">Spillernes økter, skole, turneringer og tester</span></div>
          <div className="ukevis">{andre.map((e) => e.opptatt
            ? <div key={e.id} className="u-okt opptatt"><b>{e.startMin != null ? hhmm(e.startMin) : "Dag"}</b><span>Opptatt</span></div>
            : <button key={e.id} type="button" className={`u-okt ${fargeKlasse(e)}`} onClick={() => setValgt({ ev: e, anker: null })}>
              <b>{e.heldag ? "Dag" : e.startMin != null ? hhmm(e.startMin) : "—"}</b><span>{e.tittel}{e.undertekst ? ` · ${e.undertekst}` : ""} · {LAG_LABEL[e.lag]}</span>
            </button>)}</div>
        </section>}
        <AkseForklaring />
        <p className="kildetekst">Trykk en økt for å flytte den. Spilleren får varsel i appen etter 10 sekunder. Bookinger får forslag om ny tid fra bookingen.</p>
      </>}
    {valgt && <HendelseArk ev={valgt.ev} anker={valgt.anker} onClose={() => setValgt(null)} onFlyttet={flytt.flyttet} />}
    <Toast toast={flytt.toast} lukk={flytt.lukkToast} />
  </>;
}

/** AG-05-UKE: kort per dag på mobil, tidsrutenett på PC. */
export function AG05Uke({ data: raa, startLag }: { data: KalenderLagUkeData; startLag?: KalenderLag }) {
  const [valgt, setValgt] = useState<Valgt | null>(null);
  const [coach, setCoach] = useState<string | null>(null);
  const lag = useLagFilter(startLag);
  const flytt = useFlyttMedAngre();
  const hendelser = filtrerCoach(synlige(raa.hendelser, lag.valgt), coach);
  const perDag = (d: string) => hendelser.filter((e) => e.dato === d).sort((a, b) => (a.startMin ?? -1) - (b.startMin ?? -1));
  const coachKort = (id?: string | null) => (raa.coacher.length > 1 && id ? initialer(raa.coacher.find((c) => c.id === id)?.navn ?? "") : undefined);

  return <>
    <Verktoy sum={oppsummer(hendelser)}>
      <CoachFilter coacher={raa.coacher} valgt={coach} velg={setCoach} hendelser={synlige(raa.hendelser, lag.valgt)} />
      <LagFilter {...lag} />
    </Verktoy>
    {!raa.dager.some((d) => perDag(d).length)
      ? <Tom tittel="Ingen økter denne uka" tekst="Sett tilgjengelighet først, så kan spillere booke og gruppeøkter legges oppå." handling={<KnappLenke href="/admin/kalender?fane=tilg">Sett tilgjengelighet</KnappLenke>} />
      : <>
        <div className="ukevis bare-mobil">
          {raa.dager.map((d) => <div key={d} className={`ukedag${d === raa.idagIso ? " idag" : ""}`}>
            <h3>{ukedagKort(d)} {dagMnd(d)} <span>{perDag(d).filter((e) => !e.heldag).length}</span></h3>
            {perDag(d).length ? perDag(d).map((e) => e.opptatt
              ? <div key={e.id} className="u-okt opptatt"><b>{e.startMin != null ? hhmm(e.startMin) : "Dag"}</b><span>Opptatt</span></div>
              : <button key={e.id} type="button" className={`u-okt ${e.lag === "TESTER" ? "test" : fargeKlasse(e)}${erFerdig(e, raa.idagIso) ? " ferdig" : ""}${e.kollidererMed?.length ? " kolliderer" : ""}`} onClick={() => setValgt({ ev: e, anker: null })}>
                <b>{e.heldag ? "Dag" : e.startMin != null ? hhmm(e.startMin) : "—"}</b><span>{e.tittel}{e.undertekst ? ` · ${e.undertekst}` : ""}{e.gruppe && e.antallSpillere != null ? ` · ${e.antallSpillere} spillere` : ""}</span>
              </button>) : <span className="kilde">—</span>}
          </div>)}
        </div>
        <div className="uke-rutenett bare-pc" style={{ ["--kol" as string]: raa.dager.length }}>
          <span className="hd tom" />
          {raa.dager.map((d) => <span key={d} className={`hd dag-hd${d === raa.idagIso ? " idag" : ""}`}><span className="ukd">{ukedagKort(d)}</span><b>{Number(d.slice(8, 10))}</b><span className="sum">{oppsummer(perDag(d)).split(" · ")[1] ?? "—"}</span></span>)}
          <div className="timer">{Array.from({ length: H1 - H0 }, (_, i) => <span key={i}>{String(H0 + i).padStart(2, "0")}</span>)}</div>
          {raa.dager.map((d) => {
            const es = perDag(d);
            const heldag = es.filter((e) => e.heldag);
            return <div key={d} className="kol">
              {heldag.length > 0 && <div className="heldag">{heldag.map((e) => <button key={e.id} type="button" className={`k-okt heldag-okt${e.lag === "TURNERING" ? " turn" : ""}`} onClick={(ev) => setValgt({ ev: e, anker: ev.currentTarget.getBoundingClientRect() })}><b>{e.tittel}</b></button>)}</div>}
              {es.filter((e) => !e.heldag && e.startMin != null).map((e) => <Blokk key={e.id} e={e} style={plassering(e)} idagIso={raa.idagIso} coachKort={coachKort(e.coachId)} onClick={(anker) => setValgt({ ev: e, anker })} />)}
              <Nalinje dato={d} idagIso={raa.idagIso} />
            </div>;
          })}
        </div>
        <AkseForklaring />
      </>}
    {valgt && <HendelseArk ev={valgt.ev} anker={valgt.anker} onClose={() => setValgt(null)} onFlyttet={flytt.flyttet} />}
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
    <Verktoy sum={oppsummer(hendelser.filter((e) => iManed.has(e.dato)))}>
      <CoachFilter coacher={data.coacher} valgt={coach} velg={setCoach} hendelser={synlige(data.hendelser, lag.valgt)} />
      <LagFilter {...lag} />
    </Verktoy>
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
