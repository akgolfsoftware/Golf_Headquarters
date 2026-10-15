"use client";

/**
 * PH-RD-02 Oppsett, PH-RD-03 Slag, PH-RD-04 Putt og PH-RD-05 SG hittil — nytt design
 * (pakke 5, godkjent av Anders 14.10.2026, utkast 2 med farge). Alltid lyst, også ute på banen (vedtak 14.10).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, skjermene «oppsett», «slag», «putt» og «sg». Stil: playerhq-ny-runder.css.
 * Runden lagres med lagreLoggetRunde (slag for slag, SG regnes på serveren). Bare brutto score.
 *
 * Avvik:
 *   - Lagringen er byttet fra logRoundManual (bare hullscore) til lagreLoggetRunde, så slagene, puttene og typen
 *     (turnering eller trening) blir lagret og SG regnes. Den forrige skjermen lagret ikke slagene.
 *   - Par og lengde per hull hentes fra banens hull (hentBaneHull). Mangler banen hulldata, velger du par selv,
 *     og lengden er avstanden du fører på første slag. Den faste hull-lista (STANDARD_18_HOLES) og de faste banene brukes ikke lenger.
 *   - Tee er tatt ut av oppsettet, og «Turnering fra planen din» finnes ikke: runden kobles ikke til en turnering ennå.
 *   - Putt: break og helling følger datamodellen, ikke tegningens to valg (åpent hos Anders): Break er
 *     Venstre til høyre · Høyre til venstre · Oppover · Nedover, og «Helling» er hvor mye greenen heller (Svak · Moderat · Kraftig).
 *     Fart ved bom er Kort eller Lang.
 *   - SG hittil viser «—»: SG regnes på serveren mot referansen når runden lagres. Arket viser hvor mange hull som er ferdige.
 *   - Kladden på telefonen lagres etter hvert ferdige hull, ikke etter hvert slag. Hullet du står på, er bare i minnet.
 *   - Et ført slag rettes med «Angre siste»; raden i lista kan ikke trykkes.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-RD-03.
 */

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, Lock, X } from "lucide-react";
import { hentBaneHull, lagreLoggetRunde } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import { lesKladdCached, lesKladdServer, lagreKladd, slettKladd, type RundeKladd } from "@/lib/runde-logg/draft";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import type { Ph0809Data } from "@/lib/portal-runder/load-ph08-09";
import type { PuttRegistrering } from "@/lib/runde-logg/types";
import { fotTilMeter, fraLoggetHull, meterTilFot, slagPaaHull, tilLoggetHull, type LiveSlagInn, type Underlag } from "@/lib/portal-runder/live-slag";
import { hullNumre } from "@/lib/portal-runder/rask-score";
import { formaterTall } from "@/lib/format-tall";
import { SkMerke, tilParTekst } from "./PHRunderFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";

type HullValg = "18" | "ut" | "inn";
type BaneHull = { holeNumber: number; par: number | null; lengdeMeter: number | null };
type Ferdig = { par: number; slag: LiveSlagInn[] };
type Oppsett = { baneId: string; dato: string; type: "trening" | "turnering"; antall: 9 | 18; start: 1 | 10 };

const BAG = ["Driver", "3-tre", "5-tre", "4-hybrid", "4-jern", "5-jern", "6-jern", "7-jern", "8-jern", "9-jern", "PW", "52°", "56°", "60°"];
const UNDERLAG_VALG: Underlag[] = ["Tee", "Fairway", "Rough", "Bunker", "Recovery", "Green"];
const BREAK: { v: PuttRegistrering["breakRetning"]; navn: string }[] = [
  { v: "VENSTRE_HOYRE", navn: "Venstre til høyre" }, { v: "HOYRE_VENSTRE", navn: "Høyre til venstre" },
  { v: "OPPOVER", navn: "Oppover" }, { v: "NEDOVER", navn: "Nedover" },
];
const HELLING: { v: PuttRegistrering["slopeAlvorlighet"]; navn: string }[] = [
  { v: "SVAK", navn: "Svak" }, { v: "MODERAT", navn: "Moderat" }, { v: "KRAFTIG", navn: "Kraftig" },
];
const BOM: { v: NonNullable<PuttRegistrering["linjeMiss"]>; navn: string }[] = [
  { v: "VENSTRE", navn: "Venstre" }, { v: "HOYRE", navn: "Høyre" }, { v: "PAA_LINJE", navn: "På linja" },
];

const iDag = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
const KL = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const abonnerIngen = () => () => {};

function hullValgFra(o: Oppsett): HullValg {
  return o.antall === 18 ? "18" : o.start === 10 ? "inn" : "ut";
}
function rekkefolge(o: Oppsett): number[] {
  const nr = hullNumre(hullValgFra(o));
  return o.antall === 18 && o.start === 10 ? [...nr.slice(9), ...nr.slice(0, 9)] : nr;
}

function Ark({ tittel, onLukk, children }: { tittel: string; onLukk: () => void; children: ReactNode }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onLukk(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onLukk]);
  return (
    <div className="phr-lag">
      <div className="phn-ark" role="dialog" aria-modal="true" aria-label={tittel} style={{ margin: "auto auto 0" }}>
        <div className="phn-ark-kropp">
          <div className="phn-ark-topp"><h2>{tittel}</h2><button type="button" className="phn-lukk" aria-label="Lukk" onClick={onLukk}><X className="phn-ikon" aria-hidden /></button></div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Valg<T extends string>({ navn, valg, verdi, onVelg, klasse = "phr-ruter lav" }: {
  navn: string; valg: { v: T; navn: string }[]; verdi: T | null; onVelg: (v: T) => void; klasse?: string;
}) {
  return (
    <div className={klasse} role="group" aria-label={navn}>
      {valg.map((x) => <button key={x.v} type="button" aria-pressed={verdi === x.v} onClick={() => onVelg(x.v)}>{x.navn}</button>)}
    </div>
  );
}

function Krav({ ok, tekst = "Påkrevd" }: { ok: boolean; tekst?: string }) {
  return <span className={`phr-paakrevd${ok ? "" : " mangler"}`}>{tekst}</span>;
}

export interface PH08RundeLiveProps {
  data: Ph0809Data;
  rundeId?: string;
  /** Startvisning. Brukes av prøvefila (tests/visual/precision/skjermer/PH-RD-03.tsx); siden starter alltid i oppsettet. */
  visning?: "oppsett" | "slag" | "putt" | "sg";
}

export function PH08RundeLive({ data, visning = "oppsett" }: PH08RundeLiveProps) {
  const router = useRouter();
  const eierId = useLokalDataEier();
  const snapshot = useCallback(() => lesKladdCached(eierId), [eierId]);
  const lagretKladd = useSyncExternalStore(abonnerIngen, snapshot, lesKladdServer);
  const [kladdHandtert, setKladdHandtert] = useState(false);
  const kladd: RundeKladd | null = !kladdHandtert && lagretKladd && lagretKladd.steg !== "oppsett" && lagretKladd.foringsModus !== "hurtig" ? lagretKladd : null;

  const [steg, setSteg] = useState<"oppsett" | "foring">(visning === "oppsett" ? "oppsett" : "foring");
  const [o, setO] = useState<Oppsett>({ baneId: data.baner[0]?.id ?? "", dato: iDag(), type: "trening", antall: 18, start: 1 });
  const [baneHull, setBaneHull] = useState<{ id: string; hull: BaneHull[] } | null>(null);
  const [ferdige, setFerdige] = useState<Record<number, Ferdig>>({});
  const [aktivt, setAktivt] = useState(1);
  const [parValg, setParValg] = useState<Record<number, number>>({});
  const [slag, setSlag] = useState<LiveSlagInn[]>([]);
  const [lie, setLie] = useState<Underlag>(visning === "putt" ? "Green" : "Tee");
  const [avst, setAvst] = useState("");
  const [kolle, setKolle] = useState<string | null>(null);
  const [puttBreak, setPuttBreak] = useState<PuttRegistrering["breakRetning"] | null>(null);
  const [puttHelling, setPuttHelling] = useState<PuttRegistrering["slopeAlvorlighet"] | null>(null);
  const [puttInn, setPuttInn] = useState<boolean | null>(null);
  const [puttFart, setPuttFart] = useState<"KORT" | "FORBI" | null>(null);
  const [puttBom, setPuttBom] = useState<NonNullable<PuttRegistrering["linjeMiss"]> | null>(null);
  const [visKrav, setVisKrav] = useState(false);
  const [ark, setArk] = useState<null | "sg" | "avslutt" | "forkast">(visning === "sg" ? "sg" : null);
  const [melding, setMelding] = useState<string | null>(null);
  const [lagrer, setLagrer] = useState(false);

  useEffect(() => {
    if (!o.baneId) return;
    let aktiv = true;
    hentBaneHull(o.baneId)
      .then((h) => { if (aktiv) setBaneHull({ id: o.baneId, hull: Array.isArray(h) ? h : [] }); })
      .catch(() => { if (aktiv) setBaneHull({ id: o.baneId, hull: [] }); });
    return () => { aktiv = false; };
  }, [o.baneId]);

  const bane = data.baner.find((b) => b.id === o.baneId) ?? null;
  const rekke = rekkefolge(o);
  const fraBane = (nr: number) => (baneHull?.id === o.baneId ? baneHull.hull.find((h) => h.holeNumber === nr) : undefined);
  const parFor = (nr: number): number | null => ferdige[nr]?.par ?? fraBane(nr)?.par ?? parValg[nr] ?? null;
  const par = parFor(aktivt);
  const lengde = fraBane(aktivt)?.lengdeMeter ?? null;
  const ferdigeNr = rekke.filter((nr) => ferdige[nr]);
  const brutto = ferdigeNr.reduce((s, nr) => s + slagPaaHull(ferdige[nr].slag), 0);
  const parFerdig = ferdigeNr.reduce((s, nr) => s + ferdige[nr].par, 0);
  const putt = lie === "Green";
  const avstTall = Number(avst.replace(",", "."));
  const nesteNr = slagPaaHull(slag) + 1;

  const nullstillSkjema = (nyLie: Underlag) => {
    setLie(nyLie); setAvst(""); setKolle(null); setVisKrav(false);
    setPuttBreak(null); setPuttHelling(null); setPuttInn(null); setPuttFart(null); setPuttBom(null);
  };

  const lagreLokalt = (nyeFerdige: Record<number, Ferdig>, nesteAktivt: number) => {
    if (!bane) return;
    const valg = hullValgFra(o);
    const naturlig = hullNumre(valg);
    const ok = lagreKladd(eierId, {
      versjon: 1, modus: "live", foringsModus: "slag", steg: "foring",
      oppsett: { courseId: bane.id, courseNavn: bane.navn, roundType: o.type, hullValg: valg, playedAt: o.dato },
      hullData: naturlig.filter((nr) => nyeFerdige[nr]).map((nr) => tilLoggetHull(nr, nyeFerdige[nr].par, nyeFerdige[nr].slag)),
      aktivtHullIdx: Math.max(0, naturlig.indexOf(nesteAktivt)),
    });
    if (!ok) setMelding("Runden kunne ikke lagres på telefonen. Hold siden åpen til runden er lagret.");
  };

  const startRunden = () => {
    if (!bane) return;
    setSteg("foring");
    setAktivt(rekke[0]);
    setSlag([]);
    nullstillSkjema("Tee");
    setAvst(fraBane(rekke[0])?.lengdeMeter ? String(fraBane(rekke[0])?.lengdeMeter) : "");
    setKladdHandtert(true);
    lagreLokalt({}, rekke[0]);
  };

  const gjenopprett = (k: RundeKladd) => {
    const valg = k.oppsett.hullValg;
    const nyO: Oppsett = { baneId: k.oppsett.courseId ?? o.baneId, dato: k.oppsett.playedAt.slice(0, 10), type: k.oppsett.roundType,
      antall: valg === "18" ? 18 : 9, start: valg === "inn" ? 10 : 1 };
    const nyeFerdige: Record<number, Ferdig> = {};
    for (const h of k.hullData) nyeFerdige[h.holeNumber] = { par: h.par, slag: fraLoggetHull(h) };
    const naturlig = hullNumre(valg);
    const neste = naturlig[k.aktivtHullIdx] ?? naturlig.find((nr) => !nyeFerdige[nr]) ?? naturlig[0];
    setO(nyO); setFerdige(nyeFerdige); setAktivt(neste); setSlag([]); nullstillSkjema("Tee");
    setSteg("foring"); setKladdHandtert(true);
  };

  const forkast = () => {
    slettKladd(eierId);
    setArk(null); setKladdHandtert(true); setFerdige({}); setSlag([]); setSteg("oppsett");
    setMelding("Runden er forkastet.");
  };

  const byggSlag = (iHull: boolean): LiveSlagInn | null => {
    setVisKrav(true);
    if (par == null) { setMelding("Velg par for hullet først."); return null; }
    if (!(avstTall > 0)) { setMelding(putt ? "Før lengden på putten i fot." : "Før avstanden til hullet."); return null; }
    if (putt) {
      if (!puttBreak || !puttHelling || puttInn == null) { setMelding("Velg break, helling og resultat."); return null; }
      if (!puttInn && (!puttFart || !puttBom)) { setMelding("Velg fart og hvor putten bommet."); return null; }
      const p: PuttRegistrering = iHull || puttInn
        ? { breakRetning: puttBreak, slopeAlvorlighet: puttHelling, fartUtfall: "HOLED" }
        : { breakRetning: puttBreak, slopeAlvorlighet: puttHelling, fartUtfall: puttFart as "KORT" | "FORBI", linjeMiss: puttBom as NonNullable<PuttRegistrering["linjeMiss"]> };
      return { lie: "Green", avstandM: fotTilMeter(avstTall), kolle: "Putter", putt: p };
    }
    if (slag.length === 0 && lie === "Tee" && avstTall < 40) { setMelding("Utslaget må være minst 40 m fra hullet."); return null; }
    if (!kolle) { setMelding("Velg køllen du slo med."); return null; }
    return { lie, avstandM: avstTall, kolle };
  };

  const fullforHull = (alle: LiveSlagInn[]) => {
    const p = par as number;
    const nye = { ...ferdige, [aktivt]: { par: p, slag: alle } };
    setFerdige(nye);
    const n = slagPaaHull(alle);
    const neste = rekke.find((nr) => !nye[nr]);
    lagreLokalt(nye, neste ?? aktivt);
    setSlag([]);
    if (neste == null) {
      setMelding(`Hull ${aktivt}: ${n} slag (${tilParTekst(n - p)}). Alle hull er ført.`);
      setArk("avslutt");
      return;
    }
    setAktivt(neste);
    nullstillSkjema("Tee");
    const l = fraBane(neste)?.lengdeMeter;
    if (l) setAvst(String(l));
    setMelding(`Hull ${aktivt}: ${n} slag (${tilParTekst(n - p)}). Neste: hull ${neste}${parFor(neste) ? `, par ${parFor(neste)}` : ""}.`);
  };

  const nesteSlag = () => {
    const s = byggSlag(false);
    if (!s) return;
    if (putt && puttInn) { fullforHull([...slag, s]); return; }
    setSlag([...slag, s]);
    setMelding(putt ? `Putt ${slag.filter((x) => x.lie === "Green").length + 1} er ført.` : null);
    nullstillSkjema(putt ? "Green" : "Fairway");
  };

  const iHull = () => {
    const s = byggSlag(true);
    if (s) fullforHull([...slag, s]);
  };

  const straff = () => {
    if (!slag.length) { setMelding("Før slaget først, så legger du til straffeslaget."); return; }
    setSlag(slag.map((s, i) => (i === slag.length - 1 ? { ...s, straff: true } : s)));
    setMelding(`Ett straffeslag lagt til på slag ${slag.length}.`);
  };

  const angre = () => {
    if (!slag.length) return;
    const siste = slag[slag.length - 1];
    setSlag(slag.slice(0, -1));
    nullstillSkjema(siste.lie);
    setAvst(String(siste.lie === "Green" ? meterTilFot(siste.avstandM) : siste.avstandM));
    if (siste.lie !== "Green") setKolle(siste.kolle);
    setMelding(`Slag ${slag.length} er tatt bort.`);
  };

  const lagre = async () => {
    if (!bane || ferdigeNr.length === 0 || lagrer) return;
    setLagrer(true);
    try {
      const hull = rekke.filter((nr) => ferdige[nr]).map((nr) => tilLoggetHull(nr, ferdige[nr].par, ferdige[nr].slag));
      const svar = await lagreLoggetRunde({ courseId: bane.id, playedAt: o.dato, hull, roundType: o.type });
      slettKladd(eierId);
      router.push(svar?.roundId ? `/portal/mal/runder/${svar.roundId}?lagret=1` : "/portal/mal/runder");
    } catch (err) {
      console.error("Kunne ikke lagre runden:", err);
      setMelding("Runden kunne ikke lagres over nett. Ferdige hull er lagret på telefonen.");
      setLagrer(false);
      setArk(null);
    }
  };

  const meldinger = <div className="phn-meldinger" aria-live="polite">{melding && <p className="phr-melding" role="status">{melding}</p>}</div>;

  /* ---------- Tom og feil ---------- */
  if (data.feil || data.baner.length === 0) {
    return (
      <div className="phn phr-fullskjerm">
        <button type="button" className="phr-tilbake" onClick={() => router.push("/portal/mal/runder/ny")}><ChevronLeft className="phn-ikon" aria-hidden />Velg nivå</button>
        <div className="phr-topp"><div className="phn-dato">Registrer runde · Slag for slag</div><h1 className="phn-tittel">Ny runde</h1></div>
        <section className="phn-kort phr-kort-dempet" role={data.feil ? "alert" : undefined}>
          <h2 className="phr-undertittel">{data.feil ? "Banene kunne ikke hentes" : "Ingen baner å velge"}</h2>
          <p className="phn-forklar">{data.feil ? "Ingenting er endret. Slag du har ført før, ligger fortsatt på telefonen. Prøv igjen." : "Det finnes ingen baner i AK Golf ennå, så runden kan ikke lagres. Si fra til coachen din."}</p>
        </section>
      </div>
    );
  }

  /* ---------- PH-RD-02 Oppsett ---------- */
  if (steg === "oppsett") {
    return (
      <div className="phn phr-fullskjerm">
        <button type="button" className="phr-tilbake" onClick={() => router.push("/portal/mal/runder/ny")}><ChevronLeft className="phn-ikon" aria-hidden />Velg nivå</button>
        <div className="phr-topp phr-smal">
          <div className="phn-dato">Registrer runde · steg 2 av 2 · Slag for slag</div>
          <h1 className="phn-tittel">Ny runde</h1>
        </div>
        {kladd && (
          <section className="phr-kladd phr-smal" aria-label="Runde som ikke er ferdig">
            <div className="phr-kladd-topp">
              <span className="phr-kladd-ikon"><Flag className="phn-ikon" aria-hidden /></span>
              <span>
                <b className="phr-undertittel">Du har en runde som ikke er ferdig</b>
                <span className="phn-kilde" style={{ display: "block" }}>
                  {kladd.oppsett.courseNavn || "—"} · {kladd.hullData.length} av {kladd.oppsett.hullValg === "18" ? 18 : 9} hull · lagret på telefonen {KL.format(new Date(kladd.oppdatert))}
                </span>
              </span>
            </div>
            <div className="phn-knapper">
              <button type="button" className="phn-knapp sek" onClick={() => gjenopprett(kladd)}>Gjenopprett</button>
              <button type="button" className="phn-knapp phr-knapp-tekst" onClick={() => setArk("forkast")}>Forkast</button>
            </div>
          </section>
        )}
        <div className="phr-grid phr-smal">
          <label className="phn-felt">Bane
            <select value={o.baneId} onChange={(e) => setO({ ...o, baneId: e.target.value })}>
              {data.baner.map((b) => <option key={b.id} value={b.id}>{b.navn}</option>)}
            </select>
          </label>
          <label className="phn-felt">Dato
            <input type="date" value={o.dato} max={iDag()} onChange={(e) => setO({ ...o, dato: e.target.value })} />
          </label>
          <div className="phr-felt">
            <span className="phr-etikett">Type</span>
            <div className="phn-valg phr-valg" role="group" aria-label="Type">
              <button type="button" data-t="turnering" aria-pressed={o.type === "turnering"} onClick={() => setO({ ...o, type: "turnering" })}>Turnering</button>
              <button type="button" aria-pressed={o.type === "trening"} onClick={() => setO({ ...o, type: "trening" })}>Trening</button>
            </div>
            {o.type === "turnering" && <span className="phr-hjelp">Bare offisielle turneringer. Interne konkurranser føres som trening.</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
            <div className="phr-felt">
              <span className="phr-etikett">Antall hull</span>
              <div className="phn-valg phr-valg" role="group" aria-label="Antall hull">
                {([9, 18] as const).map((n) => <button key={n} type="button" aria-pressed={o.antall === n} onClick={() => setO({ ...o, antall: n })}>{n}</button>)}
              </div>
            </div>
            <div className="phr-felt">
              <span className="phr-etikett">Start på hull</span>
              <div className="phn-valg phr-valg" role="group" aria-label="Start på hull">
                {([1, 10] as const).map((n) => <button key={n} type="button" aria-pressed={o.start === n} onClick={() => setO({ ...o, start: n })}>{n}</button>)}
              </div>
            </div>
          </div>
          <p className="phr-laast"><Lock className="phn-ikon" aria-hidden /><span>Runden lagres på telefonen etter hvert ferdige hull. Faller nettet ut, mister du ikke hullene du har ført.</span></p>
          {meldinger}
          <div className="phr-festet"><button type="button" className="phn-knapp pri phr-knapp-stor" disabled={!bane} onClick={startRunden}>Start runden</button></div>
        </div>
        {ark === "forkast" && kladd && (
          <Ark tittel={`Forkaste runden på ${kladd.oppsett.courseNavn || "banen"}?`} onLukk={() => setArk(null)}>
            <p className="phn-forklar">{kladd.hullData.length} ferdige hull slettes fra telefonen. Det kan ikke angres.</p>
            <div className="phn-knapper"><button type="button" className="phn-knapp rust" onClick={forkast}>Forkast runden</button><button type="button" className="phn-knapp sek" onClick={() => setArk(null)}>Behold</button></div>
          </Ark>
        )}
      </div>
    );
  }

  /* ---------- PH-RD-03 Slag og PH-RD-04 Putt ---------- */
  const typeTekst = o.type === "turnering" ? "Turneringsrunde" : "Treningsrunde";
  const puttNr = slag.filter((s) => s.lie === "Green").length + 1;
  return (
    <div className="phn phr-fullskjerm">
      <div className="phr-hode-rad">
        <button type="button" className="phr-tilbake" onClick={() => setArk("avslutt")}><ChevronLeft className="phn-ikon" aria-hidden />Avslutt</button>
        <button type="button" className="phn-knapp sek" onClick={() => setArk("sg")}>SG hittil</button>
      </div>

      <section className="phr-hullhode" aria-label={`Hull ${aktivt}`}>
        <span className="phr-hode-tekst">{typeTekst} · {bane?.navn ?? "—"}</span>
        <h1>Hull {aktivt} <small>{par != null ? `Par ${par}` : "Par ikke valgt"}{lengde != null ? ` · ${lengde} m` : ""} · slag {nesteNr}{putt ? ` · putt ${puttNr}` : ""}</small></h1>
        <div className="phr-stilling">
          <span className="phn-pille">{ferdigeNr.length ? `${tilParTekst(brutto - parFerdig)} etter ${ferdigeNr.length} hull` : "Første hull"}</span>
          <span>{brutto ? `${brutto} slag` : "Ingen slag ennå"} · brutto</span>
        </div>
        <div className="phr-stripe" role="group" aria-label="Hullene">
          {rekke.map((nr) => {
            const f = ferdige[nr];
            const naa = nr === aktivt;
            return (
              <button key={nr} type="button" className={naa ? "naa" : f ? "" : "ikke"} aria-current={naa ? "step" : undefined} disabled={!!f}
                aria-label={`Hull ${nr}${f ? `, ${slagPaaHull(f.slag)} slag` : ""}`}
                onClick={() => { if (!f && !naa) { setAktivt(nr); setSlag([]); nullstillSkjema("Tee"); const l = fraBane(nr)?.lengdeMeter; if (l) setAvst(String(l)); } }}>
                <i>{nr}</i><b>{f ? <SkMerke slag={slagPaaHull(f.slag)} par={f.par} /> : naa ? "•" : "—"}</b>
              </button>
            );
          })}
        </div>
      </section>

      <div className="phr-grid phr-to live">
        <div>
          <section className="phn-seksjon" aria-label={putt ? "Putten" : "Slaget"}>
            {par == null && (
              <div className="phr-felt">
                <div className="phr-etikett-rad"><span className="phr-etikett">Par</span><Krav ok={!visKrav} tekst="Påkrevd · banen har ikke par for hullet" /></div>
                <Valg navn="Par" klasse="phr-ruter" valg={[3, 4, 5].map((p) => ({ v: String(p), navn: `Par ${p}` }))} verdi={null} onVelg={(v) => setParValg({ ...parValg, [aktivt]: Number(v) })} />
              </div>
            )}
            <div className="phr-felt">
              <div className="phr-etikett-rad"><span className="phr-etikett">Underlag</span><span className="phr-paakrevd">Påkrevd</span></div>
              <Valg navn="Underlag" klasse="phr-ruter" valg={UNDERLAG_VALG.filter((u) => u !== "Tee" || slag.length === 0).map((u) => ({ v: u, navn: u }))} verdi={lie}
                onVelg={(v) => { if (v !== lie) { nullstillSkjema(v); if (v === "Green") setMelding("På green: putten føres i fot."); } }} />
            </div>
            <div className="phr-felt">
              <div className="phr-etikett-rad"><span className="phr-etikett" id="phr-avst">{putt ? "Lengde" : "Avstand til hullet"}</span><Krav ok={!visKrav || avstTall > 0} tekst={putt ? "Påkrevd · i fot" : "Påkrevd · trykk på tallet for å rette"} /></div>
              <div className="phr-avstand">
                <button type="button" aria-label={putt ? "En fot kortere" : "En meter kortere"} onClick={() => setAvst(String(Math.max(1, (avstTall || 1) - 1)))}>−</button>
                <label><input type="number" inputMode="numeric" min={1} max={putt ? 120 : 600} value={avst} placeholder="—" aria-labelledby="phr-avst" onChange={(e) => setAvst(e.target.value)} /><span className="phr-enhet">{putt ? "fot" : "m"}</span></label>
                <button type="button" aria-label={putt ? "En fot lengre" : "En meter lengre"} onClick={() => setAvst(String((avstTall || 0) + 1))}>+</button>
              </div>
              <div className="phr-hopp">
                {putt
                  ? [3, 6, 10, 20].map((n) => <button key={n} type="button" onClick={() => setAvst(String(n))}>{n}</button>)
                  : [-10, -5, 5, 10].map((d) => <button key={d} type="button" onClick={() => setAvst(String(Math.max(1, (avstTall || 0) + d)))}>{d > 0 ? `+${d}` : `−${-d}`}</button>)}
              </div>
            </div>
            {putt ? (
              <>
                <div className="phr-felt"><div className="phr-etikett-rad"><span className="phr-etikett">Break</span><Krav ok={!visKrav || !!puttBreak} /></div>
                  <Valg navn="Break" klasse="phr-ruter lav to" valg={BREAK} verdi={puttBreak} onVelg={setPuttBreak} /></div>
                <div className="phr-felt"><div className="phr-etikett-rad"><span className="phr-etikett">Helling</span><Krav ok={!visKrav || !!puttHelling} /></div>
                  <Valg navn="Helling" valg={HELLING} verdi={puttHelling} onVelg={setPuttHelling} /></div>
                <div className="phr-felt"><div className="phr-etikett-rad"><span className="phr-etikett">Resultat</span><Krav ok={!visKrav || puttInn != null} /></div>
                  <Valg navn="Resultat" klasse="phr-ruter to" valg={[{ v: "inn", navn: "I hull" }, { v: "bom", navn: "Bom" }]} verdi={puttInn == null ? null : puttInn ? "inn" : "bom"} onVelg={(v) => setPuttInn(v === "inn")} /></div>
                {puttInn === false && (
                  <>
                    <div className="phr-felt"><span className="phr-etikett">Fart</span>
                      <Valg navn="Fart" klasse="phr-ruter lav to" valg={[{ v: "KORT" as const, navn: "Kort" }, { v: "FORBI" as const, navn: "Lang" }]} verdi={puttFart} onVelg={setPuttFart} /></div>
                    <div className="phr-felt"><span className="phr-etikett">Bom</span>
                      <Valg navn="Bom" valg={BOM} verdi={puttBom} onVelg={setPuttBom} /></div>
                  </>
                )}
                <button type="button" className="phn-knapp pri phr-knapp-stor" onClick={nesteSlag}>{puttInn ? `Ferdig med hull ${aktivt}` : "Neste putt"}</button>
              </>
            ) : (
              <>
                <div className="phr-felt"><div className="phr-etikett-rad"><span className="phr-etikett">Kølle</span><Krav ok={!visKrav || !!kolle} tekst={visKrav && !kolle ? "Velg kølle" : "Påkrevd"} /></div>
                  <div className={`phr-chips${visKrav && !kolle ? " feil" : ""}`} role="group" aria-label="Kølle">
                    {BAG.map((k) => <button key={k} type="button" aria-pressed={kolle === k} onClick={() => setKolle(k)}>{k}</button>)}
                  </div></div>
                <div className="phr-handlinger">
                  <button type="button" className="phn-knapp pri" onClick={nesteSlag}>Neste slag</button>
                  <button type="button" className="phn-knapp sek" onClick={iHull}><Flag className="phn-ikon" aria-hidden />I hull</button>
                </div>
              </>
            )}
            <div className="phr-smaa">
              <button type="button" className="phn-knapp sek" onClick={straff}>+ Straffeslag</button>
              <button type="button" className="phn-knapp phr-knapp-tekst" disabled={!slag.length} onClick={angre}>Angre siste</button>
            </div>
            {meldinger}
          </section>
        </div>
        <div>
          <section className="phn-seksjon" aria-label="Slag på hullet">
            <div className="phn-sek-topp"><h2>Hull {aktivt} så langt</h2><span className="phn-kilde">{slag.length ? `${slagPaaHull(slag)} slag` : "Ingen slag ennå"}</span></div>
            {slag.length ? (
              <div className="phr-slagliste">
                {slag.map((s, i) => (
                  <div key={i}>
                    <span className="nr">{i + 1}</span>
                    <span><b>{s.lie}{s.straff && <span className="phr-straff">+1 straff</span>}</b><span className="phn-kilde" style={{ display: "block" }}>{s.kolle}</span></span>
                    <span className="v">{s.lie === "Green" ? `${meterTilFot(s.avstandM)} fot` : `${formaterTall(s.avstandM, 0)} m`}</span>
                  </div>
                ))}
              </div>
            ) : <p className="phn-kilde">Ingen slag ennå.</p>}
            <p className="phn-kilde">Neste slag starter av seg selv. Rett et slag med «Angre siste».</p>
          </section>
        </div>
      </div>

      {ark === "sg" && (
        <Ark tittel="SG hittil" onLukk={() => setArk(null)}>
          <div className="phn-hoved"><strong>—</strong><span className="phr-estimat">Estimat</span></div>
          <p className="phn-forklar">Strokes Gained regnes når runden er lagret, mot referansen for nivået ditt. Da får du SG per kategori med en gang.</p>
          <div className="phr-felt">
            <span className="phr-etikett">Ferdige hull: {ferdigeNr.length} av {rekke.length}</span>
            <div className="phr-dekning" aria-hidden style={{ display: "grid", gridTemplateColumns: "repeat(9,minmax(0,1fr))", gap: 3 }}>
              {rekke.map((nr) => <i key={nr} style={{ height: 8, borderRadius: 2, background: ferdige[nr] ? "var(--phn-g900)" : "var(--phn-sand-150)" }} />)}
            </div>
          </div>
          <p className="phn-kilde">Én runde gir ingen konklusjon; Stats bruker snittet av mange runder.</p>
          <button type="button" className="phn-knapp pri phr-knapp-stor" onClick={() => setArk(null)}>Fortsett runden</button>
        </Ark>
      )}
      {ark === "avslutt" && (
        <Ark tittel="Avslutte runden?" onLukk={() => setArk(null)}>
          <p className="phn-forklar">
            {ferdigeNr.length} av {rekke.length} hull er ført. Brutto {ferdigeNr.length ? `${brutto} (${tilParTekst(brutto - parFerdig)})` : "—"}.
            {ferdigeNr.length < rekke.length ? " Lagrer du nå, lagres bare de ferdige hullene." : ""}
          </p>
          <div className="phn-ark-fot">
            <button type="button" className="phn-knapp pri phr-knapp-stor" disabled={!ferdigeNr.length || lagrer} onClick={lagre}>{lagrer ? "Lagrer …" : `Lagre runden (${ferdigeNr.length} hull)`}</button>
            <button type="button" className="phn-knapp sek" onClick={() => setArk(null)}>Fortsett runden</button>
          </div>
          <div className="phn-rust-sone">
            <button type="button" className="phn-knapp rust" onClick={() => setArk("forkast")}>Forkast runden</button>
          </div>
        </Ark>
      )}
      {ark === "forkast" && (
        <Ark tittel={`Forkaste runden på ${bane?.navn ?? "banen"}?`} onLukk={() => setArk(null)}>
          <p className="phn-forklar">{ferdigeNr.length} hull og {brutto} slag slettes fra telefonen. Det kan ikke angres.</p>
          <div className="phn-knapper"><button type="button" className="phn-knapp rust" onClick={forkast}>Forkast runden</button><button type="button" className="phn-knapp sek" onClick={() => setArk(null)}>Behold</button></div>
        </Ark>
      )}
    </div>
  );
}
