"use client";

/**
 * PH-RD-03 Slag, avansert redigering av slag på en lagret runde (/portal/mal/runder/[id]/slag), nytt design (pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, malen «slag» (hullhode, underlag, avstand, kølle, slaglista),
 * og malen «import» for UpGame-importen. Stil: playerhq-ny.css og playerhq-ny-runder.css.
 *
 * Erstatter SlagWizard og UpGameImportModal på denne siden med samme funksjon og samme handlinger: saveShot og
 * deleteShot (eiersjekk med assertRoundOwner), landingspunkt på banekartet (CourseMap, GPS lagres som før),
 * startpunkt fra forrige slags landing, og importUpGameHoleScores med kolonnekartlegging fra upgame-parse.
 *
 * Avvik:
 *   - Siden retter slag i en lagret runde, så knappene er «Lagre slag», «Legg til slag» og «Hull N», ikke
 *     «Neste slag» og «I hull» som i føringen ute. Ny føring gjøres i Registrer runde.
 *   - Stillingen (+1 etter 6 hull), «SG hittil» og avstandsknappene −10/−5/+5/+10 er ikke med: siden regner ikke SG
 *     underveis. Avstandene føres i felt med tall.
 *   - Underlag, slagtype, vind og straff har appens egne valg (ti underlag, åtte slagtyper), ikke tegningens seks underlag.
 *   - Kølle og underlag er ikke påkrevd: lagrede slag kan mangle dem, og lagring krevde dem ikke før.
 *   - Importen henter hulltall (score, putter, FIR, GIR) til denne runden fra én CSV, ikke mange runder som i tegningen.
 *     Forhåndsvisningen viser de tre første radene som tekst, ikke som tabell (ingen sidelengs rulling).
 *   - Sletting av et slag bekreftes i et ark med rust knapp (det eneste rust på skjermen).
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-RD-03-REDIGER.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { MapPin, Plus, Upload, X } from "lucide-react";
import { saveShot, deleteShot, importUpGameHoleScores, type ShotInput } from "@/app/portal/mal/runder/[id]/actions";
import dynamic from "next/dynamic";
import type { CourseMapHole, LatLngPoint } from "@/components/gameplan/course-map";
import {
  KOLONNE_MAP,
  type KolonneNøkkel,
  type ParsetRad,
  detekterKolonne,
  parseCSV,
  konverterRaderTilHoleScores,
} from "@/lib/runde-logg/upgame-parse";
import { formaterTall } from "@/lib/format-tall";
import { Tilbake } from "./PHRunderFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke4-skra.css";

export type SlagData = {
  id?: string;
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  club: string | null;
  lie: string;
  distanceToPin: number | null;
  distanceHit: number | null;
  windDir: string | null;
  shotType: string;
  isPenalty: boolean;
  notes: string | null;
  startLat: number | null;
  startLng: number | null;
  endLat: number | null;
  endLng: number | null;
};

/** Banegeometri for slag-kartet (null → bane uten kart). */
export type BaneKartData = {
  center: { lat: number; lng: number };
  geojson: GeoJSON.FeatureCollection;
  holes: CourseMapHole[];
};

export type PHRD03Props = {
  roundId: string;
  baneNavn: string;
  dato: string;
  eksisterendeSlag: SlagData[];
  baneKart: BaneKartData | null;
};

const KOLLER = ["Driver", "3-wood", "5-wood", "4-jern", "5-jern", "6-jern", "7-jern", "8-jern", "9-jern", "PW", "GW 50°", "SW 54°", "LW 58°", "Putter"];
const UNDERLAG: Array<[string, string]> = [["TEE", "Tee"], ["FAIRWAY", "Fairway"], ["SEMI_ROUGH", "Semi-rough"], ["ROUGH", "Rough"], ["DEEP_ROUGH", "Dypt rough"], ["BUNKER", "Bunker"], ["GREEN", "Green"], ["WATER", "Vann"], ["OOB", "OOB"], ["TREES", "Trær"]];
const TYPER: Array<[string, string]> = [["DRIVE", "Drive"], ["APPROACH", "Innspill"], ["CHIP", "Chip"], ["PITCH", "Pitch"], ["PUTT", "Putt"], ["BUNKER", "Bunkerslag"], ["RECOVERY", "Redningsslag"], ["DROP", "Drop"]];
const VIND: Array<[string, string]> = [["", "Ikke ført"], ["STILLE", "Stille"], ["MEDVIND", "Medvind"], ["MOTVIND", "Motvind"], ["VENSTRE", "Fra venstre"], ["HOYRE", "Fra høyre"]];
/* Mapbox lastes bare når banen har kart (tung pakke, og den trenger nettleseren). */
const CourseMap = dynamic(() => import("@/components/gameplan/course-map").then((m) => m.CourseMap), { ssr: false });

const navn = (liste: Array<[string, string]>, v: string | null) => liste.find(([k]) => k === v)?.[1] ?? v ?? "—";
const HULL = Array.from({ length: 18 }, (_, i) => i + 1);

const KOLONNE_NAVN: Record<KolonneNøkkel, string> = {
  hullNr: "Hullnummer · påkrevd", par: "Par", score: "Score (slag) · påkrevd", fir: "Fairway truffet", gir: "Green i regulation",
  putts: "Putter", forstePutt: "Første putt, lengde", straff: "Straffeslag", bunker: "Bunker", sandSave: "Sand save",
  scrambling: "Scrambling", kjørelengde: "Utslagslengde (m)",
};

function nyttSlag(holeNumber: number, holePar: number, shotNumber: number): SlagData {
  return {
    holeNumber, holePar, shotNumber, club: null,
    lie: shotNumber === 1 ? "TEE" : "FAIRWAY",
    distanceToPin: null, distanceHit: null, windDir: null,
    shotType: shotNumber === 1 && holePar >= 4 ? "DRIVE" : "APPROACH",
    isPenalty: false, notes: null, startLat: null, startLng: null, endLat: null, endLng: null,
  };
}

function Valg({ etikett, liste, verdi, onValg, ruter }: { etikett: string; liste: Array<[string, string]>; verdi: string; onValg: (v: string) => void; ruter?: boolean }) {
  return (
    <div className="phr-felt">
      <span className="phr-etikett">{etikett}</span>
      <div className={ruter ? "phr-ruter lav" : "phr-chips"} role="group" aria-label={etikett}>
        {liste.map(([k, t]) => <button key={k || "tom"} type="button" aria-pressed={verdi === k} onClick={() => onValg(k)}>{t}</button>)}
      </div>
    </div>
  );
}

function tall(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function SlettArk({ slag, pending, onJa, onLukk }: { slag: SlagData; pending: boolean; onJa: () => void; onLukk: () => void }) {
  const ark = useRef<HTMLDialogElement>(null);
  useEffect(() => { ark.current?.showModal(); }, []);
  return (
    <dialog ref={ark} className="phn-ark" aria-label="Slette slaget?" onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp">
          <h2>Slette slag {slag.shotNumber} på hull {slag.holeNumber}?</h2>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
        </div>
        <p className="phn-forklar">Slaget fjernes fra runden, og Strokes Gained regnes på nytt. Det kan ikke angres.</p>
        <div className="phn-ark-fot">
          <button type="button" className="phn-knapp rust" disabled={pending} onClick={onJa}>{pending ? "Sletter …" : "Slett slaget"}</button>
          <button type="button" className="phn-knapp sek" onClick={() => ark.current?.close()}>Behold</button>
        </div>
      </div>
    </dialog>
  );
}

function ImportArk({ roundId, onLukk }: { roundId: string; onLukk: () => void }) {
  const ark = useRef<HTMLDialogElement>(null);
  const fil = useRef<HTMLInputElement>(null);
  useEffect(() => { ark.current?.showModal(); }, []);
  const [steg, setSteg] = useState<"fil" | "kolonner" | "ferdig">("fil");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rader, setRader] = useState<ParsetRad[]>([]);
  const [kobling, setKobling] = useState<Record<KolonneNøkkel, string | null>>(
    () => Object.fromEntries((Object.keys(KOLONNE_MAP) as KolonneNøkkel[]).map((k) => [k, null])) as Record<KolonneNøkkel, string | null>,
  );
  const [advarsel, setAdvarsel] = useState<string | null>(null);
  const [sgMelding, setSgMelding] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function lesFil(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { headers: h, rader: r } = parseCSV(ev.target?.result as string);
      setHeaders(h);
      setRader(r);
      setKobling(Object.fromEntries((Object.keys(KOLONNE_MAP) as KolonneNøkkel[]).map((k) => [k, detekterKolonne(h, k)])) as Record<KolonneNøkkel, string | null>);
      setAdvarsel(null);
      setSteg("kolonner");
    };
    reader.readAsText(f, "utf-8");
  }

  function importer() {
    const { hull, advarsel: a } = konverterRaderTilHoleScores(rader, kobling);
    if (hull.length === 0) {
      setAdvarsel("Fant ingen gyldige hull i fila. Sjekk at kolonnen for hullnummer er riktig.");
      return;
    }
    setAdvarsel(a);
    startTransition(async () => {
      try {
        const res = await importUpGameHoleScores(roundId, hull);
        if (res.ok) { setSgMelding(res.sgMelding ?? null); setSteg("ferdig"); }
        else setAdvarsel(res.error ?? "Importen feilet. Prøv igjen.");
      } catch {
        setAdvarsel("Importen feilet. Prøv igjen.");
      }
    });
  }

  return (
    <dialog ref={ark} className="phn-ark" aria-label="Importer fra UpGame" onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp">
          <div><div className="phn-dato">Importer · {steg === "fil" ? "1 Fil" : steg === "kolonner" ? "2 Kolonner" : "3 Ferdig"}</div><h2>Hent hullene fra UpGame</h2></div>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
        </div>

        {steg === "fil" && (
          <div className="phrd-slipp">
            <Upload className="phn-ikon" aria-hidden />
            <b>Velg CSV-fil</b>
            <span className="phn-kilde">Last ned runden som CSV i UpGame. Ingenting lagres før du har sett over kolonnene.</span>
            <input ref={fil} type="file" accept=".csv,.txt" onChange={lesFil} hidden />
            <button type="button" className="phn-knapp sek" onClick={() => fil.current?.click()}>Velg fil</button>
          </div>
        )}

        {steg === "kolonner" && (
          <>
            <p className="phn-forklar">Fila har {rader.length} rader og {headers.length} kolonner. Kolonnene er gjettet fra overskriftene.</p>
            <div className="phrd-kobling">
              {(Object.keys(KOLONNE_NAVN) as KolonneNøkkel[]).map((k) => (
                <label key={k}>
                  <span>{KOLONNE_NAVN[k]}</span>
                  <select value={kobling[k] ?? ""} onChange={(e) => setKobling((p) => ({ ...p, [k]: e.target.value || null }))}>
                    <option value="">Ikke bruk</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </label>
              ))}
            </div>
            {rader.length > 0 && (
              <div className="phrd-csv" aria-label="De tre første radene">
                {rader.slice(0, 3).map((r, i) => <span key={i}>{headers.map((h) => `${h}: ${r[h] ?? ""}`).join(" · ")}</span>)}
              </div>
            )}
          </>
        )}

        {steg === "ferdig" && (
          <div className="phr-sjekk ok"><span><b>Hullene er lagret.</b> {sgMelding ?? "Score, putter, fairway og GIR per hull er lagt inn. Strokes Gained krever slag for slag."}</span></div>
        )}

        {advarsel && <p className="phr-melding" role="alert">{advarsel}</p>}

        <div className="phn-ark-fot">
          {steg === "kolonner" && (
            <button type="button" className="phn-knapp pri" disabled={pending || !kobling.hullNr || !kobling.score} onClick={importer}>
              {pending ? "Importerer …" : `Importer ${rader.length} hull`}
            </button>
          )}
          <button type="button" className="phn-knapp sek" onClick={() => ark.current?.close()}>{steg === "ferdig" ? "Lukk" : "Avbryt"}</button>
        </div>
      </div>
    </dialog>
  );
}

export function PHRD03RedigerSlag({ roundId, baneNavn, dato, eksisterendeSlag, baneKart }: PHRD03Props) {
  const [aktivtHull, setAktivtHull] = useState(1);
  const [alleSlag, setAlleSlag] = useState<SlagData[]>(eksisterendeSlag);
  const [redigert, setRedigert] = useState<SlagData | null>(null);
  const [nyPar, setNyPar] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [slettes, setSlettes] = useState<SlagData | null>(null);
  const [importAapen, setImportAapen] = useState(false);

  const hullSlag = alleSlag.filter((s) => s.holeNumber === aktivtHull).sort((a, b) => a.shotNumber - b.shotNumber);
  const par = hullSlag[0]?.holePar ?? nyPar;
  const antallPaa = (nr: number) => alleSlag.filter((s) => s.holeNumber === nr).length;

  function byttHull(nr: number) {
    setAktivtHull(nr);
    setNyPar(null);
    setRedigert(null);
    setFeil(null);
    setMelding(null);
  }

  function startNytt(p: number) {
    const nytt = nyttSlag(aktivtHull, p, hullSlag.length + 1);
    const forrige = hullSlag[hullSlag.length - 1];
    if (forrige?.endLat != null && forrige?.endLng != null) { nytt.startLat = forrige.endLat; nytt.startLng = forrige.endLng; }
    setRedigert(nytt);
    setFeil(null);
    setMelding(null);
  }

  function felt<K extends keyof SlagData>(k: K, v: SlagData[K]) {
    setRedigert((p) => (p ? { ...p, [k]: v } : p));
  }

  function settPunkt(p: LatLngPoint | null) {
    setRedigert((r) => (r ? { ...r, endLat: p?.lat ?? null, endLng: p?.lng ?? null } : r));
  }

  function lagre() {
    if (!redigert) return;
    if (!redigert.lie) { setFeil("Velg underlag."); return; }
    if (!redigert.shotType) { setFeil("Velg type slag."); return; }
    const r = redigert;
    setFeil(null);
    startTransition(async () => {
      try {
        const input: ShotInput = {
          holeNumber: r.holeNumber, holePar: r.holePar, shotNumber: r.shotNumber,
          club: r.club ?? undefined, lie: r.lie as ShotInput["lie"],
          distanceToPin: r.distanceToPin ?? undefined, distanceHit: r.distanceHit ?? undefined,
          windDir: (r.windDir as ShotInput["windDir"]) ?? undefined, shotType: r.shotType as ShotInput["shotType"],
          isPenalty: r.isPenalty, notes: r.notes ?? undefined,
          startLat: r.startLat ?? undefined, startLng: r.startLng ?? undefined, endLat: r.endLat ?? undefined, endLng: r.endLng ?? undefined,
        };
        await saveShot(roundId, input);
        setAlleSlag((prev) => [...prev.filter((s) => !(s.holeNumber === r.holeNumber && s.shotNumber === r.shotNumber)), r]
          .sort((a, b) => (a.holeNumber !== b.holeNumber ? a.holeNumber - b.holeNumber : a.shotNumber - b.shotNumber)));
        setRedigert(null);
        setMelding(`Slag ${r.shotNumber} på hull ${r.holeNumber} er lagret.`);
      } catch {
        setFeil("Noe gikk galt. Prøv igjen.");
      }
    });
  }

  function slett(s: SlagData) {
    if (!s.id) return;
    startTransition(async () => {
      try {
        await deleteShot(roundId, s.id!);
        setAlleSlag((prev) => prev.filter((x) => !(x.holeNumber === s.holeNumber && x.shotNumber === s.shotNumber)));
        setRedigert(null);
        setSlettes(null);
        setMelding(`Slag ${s.shotNumber} på hull ${s.holeNumber} er slettet.`);
      } catch {
        setSlettes(null);
        setFeil("Kunne ikke slette slaget.");
      }
    });
  }

  const geo = baneKart?.holes.find((h) => h.holeNumber === aktivtHull);
  const kartSenter = geo?.teeLat != null && geo?.teeLng != null ? { lat: geo.teeLat, lng: geo.teeLng } : baneKart?.center ?? null;
  const sikteLinje = geo?.teeLat != null && geo?.teeLng != null && geo?.greenLat != null && geo?.greenLng != null
    ? { tee: { lat: geo.teeLat, lng: geo.teeLng }, green: { lat: geo.greenLat, lng: geo.greenLng } } : null;

  return (
    <div className="phn phn-skra" data-od-id="playerhq-runde-rediger-slag">
      <SkraTopp
        lav
        etikett="Rediger slag"
        bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
        overlinje={`Rediger slag · ${baneNavn} · ${dato}`}
        tittel="Rediger slag"
        ingress="Rett enkeltslag på en lagret runde."
        handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Tilbake href={`/portal/mal/runder/${roundId}`} tekst="Runden" /></span><button type="button" className="phn-knapp pri skra-topp-knapp" onClick={() => setImportAapen(true)}><Upload className="phn-ikon" aria-hidden />Importer fra UpGame</button></span>}
      />
      <SkraFlyt lav>

      <div className="phr-hullhode">
        <div className="phr-hode-tekst">{baneNavn} · hull {aktivtHull} av 18</div>
        <h2>Hull {aktivtHull} <small>{par ? `Par ${par}` : "Par ikke valgt"} · {hullSlag.length} slag</small></h2>
        <div className="phr-stripe" role="group" aria-label="Velg hull">
          {HULL.map((nr) => {
            const n = antallPaa(nr);
            return (
              <button key={nr} type="button" className={nr === aktivtHull ? "naa" : n === 0 ? "ikke" : undefined}
                aria-pressed={nr === aktivtHull} aria-label={`Hull ${nr}, ${n} slag`} onClick={() => byttHull(nr)}>
                <i>{nr}</i><b>{n > 0 ? n : "—"}</b>
              </button>
            );
          })}
        </div>
      </div>

      <div className="phr-grid phr-to live">
        <div>
          {redigert ? (
            <section className="phn-seksjon" aria-label={`Slag ${redigert.shotNumber}`}>
              <div className="phn-sek-topp"><h2>Slag {redigert.shotNumber}{redigert.id ? "" : " · nytt"}</h2><span className="phn-kilde">Hull {redigert.holeNumber} · par {redigert.holePar}</span></div>
              <Valg etikett="Underlag" liste={UNDERLAG} verdi={redigert.lie} onValg={(v) => felt("lie", v)} ruter />
              <Valg etikett="Type slag" liste={TYPER} verdi={redigert.shotType} onValg={(v) => felt("shotType", v)} />
              <div className="phr-felt">
                <span className="phr-etikett">Kølle</span>
                <div className="phr-chips" role="group" aria-label="Kølle">
                  {KOLLER.map((k) => <button key={k} type="button" aria-pressed={redigert.club === k} onClick={() => felt("club", redigert.club === k ? null : k)}>{k}</button>)}
                </div>
              </div>
              <div className="phrd-felt-rad">
                <label className="phn-felt">Til hullet (m)
                  <input type="number" inputMode="numeric" min={0} max={600} value={redigert.distanceToPin ?? ""} onChange={(e) => felt("distanceToPin", tall(e.target.value))} />
                </label>
                <label className="phn-felt">Slått (m)
                  <input type="number" inputMode="numeric" min={0} max={400} value={redigert.distanceHit ?? ""} onChange={(e) => felt("distanceHit", tall(e.target.value))} />
                </label>
              </div>
              <Valg etikett="Vind" liste={VIND} verdi={redigert.windDir ?? ""} onValg={(v) => felt("windDir", v || null)} />
              <div className="phr-felt">
                <span className="phr-etikett">Straff</span>
                <div className="phr-chips"><button type="button" aria-pressed={redigert.isPenalty} onClick={() => felt("isPenalty", !redigert.isPenalty)}>Straffeslag (+1)</button></div>
              </div>
              <label className="phn-felt">Notat <span className="phr-paakrevd">valgfritt</span>
                <input type="text" value={redigert.notes ?? ""} maxLength={400} onChange={(e) => felt("notes", e.target.value || null)} />
              </label>
              <div className="phr-felt">
                <span className="phr-etikett">Landingspunkt</span>
                {baneKart && kartSenter ? (
                  <>
                    <div className="phrd-kart">
                      <CourseMap
                        key={`slag-kart-${aktivtHull}`}
                        center={kartSenter}
                        geojson={baneKart.geojson}
                        holes={baneKart.holes}
                        interactive
                        onKlikk={settPunkt}
                        sikte={redigert.endLat != null && redigert.endLng != null ? { lat: redigert.endLat, lng: redigert.endLng } : null}
                        aimLine={sikteLinje}
                        shotPoints={hullSlag.filter((s) => s.shotNumber !== redigert.shotNumber && s.endLat != null && s.endLng != null)
                          .map((s) => ({ lat: s.endLat as number, lng: s.endLng as number }))}
                      />
                    </div>
                    <div className="phrd-punkt">
                      <span><MapPin className="phn-ikon" aria-hidden style={{ width: 14, height: 14, verticalAlign: -2 }} /> {redigert.endLat != null && redigert.endLng != null ? `${formaterTall(redigert.endLat, 5, true)} N · ${formaterTall(redigert.endLng, 5, true)} Ø` : "Ingen posisjon. Trykk på kartet der ballen landet."}</span>
                      {redigert.endLat != null && <button type="button" className="phn-knapp sek" onClick={() => settPunkt(null)}>Fjern punktet</button>}
                    </div>
                  </>
                ) : <p className="phrd-kart-tom">Banen har ikke kart ennå. Slaget lagres uten landingspunkt.</p>}
              </div>
              {feil && <p className="phr-melding" role="alert">{feil}</p>}
              <div className="phr-handlinger">
                <button type="button" className="phn-knapp pri" disabled={pending} onClick={lagre}>{pending ? "Lagrer …" : "Lagre slag"}</button>
                <button type="button" className="phn-knapp sek" onClick={() => { setRedigert(null); setFeil(null); }}>Avbryt</button>
              </div>
              {redigert.id && <div className="phr-smaa"><button type="button" className="phn-knapp phr-knapp-tekst" onClick={() => setSlettes(redigert)}>Slett slaget</button></div>}
            </section>
          ) : !par ? (
            <section className="phn-seksjon" aria-label="Par">
              <div className="phn-sek-topp"><h2>Par på hull {aktivtHull}</h2><span className="phr-paakrevd">Påkrevd før første slag</span></div>
              <div className="phr-ruter" role="group" aria-label="Par">
                {[3, 4, 5].map((p) => <button key={p} type="button" aria-pressed={false} onClick={() => { setNyPar(p); startNytt(p); }}>Par {p}</button>)}
              </div>
            </section>
          ) : (
            <section className="phn-seksjon" aria-label="Neste steg">
              {melding && <p className="phr-sjekk ok" role="status">{melding}</p>}
              {feil && <p className="phr-melding" role="alert">{feil}</p>}
              <div className="phn-knapper">
                <button type="button" className="phn-knapp sek" onClick={() => startNytt(par)}><Plus className="phn-ikon" aria-hidden />Legg til slag {hullSlag.length + 1}</button>
                {aktivtHull < 18 && <button type="button" className="phn-knapp pri" onClick={() => byttHull(aktivtHull + 1)}>Hull {aktivtHull + 1}</button>}
              </div>
              {aktivtHull === 18 && <p className="phn-kilde">Hull 18 er siste hull.</p>}
            </section>
          )}
        </div>

        <div>
          <section className="phn-seksjon" aria-label="Slag på hullet">
            <div className="phn-sek-topp"><h2>Hull {aktivtHull} så langt</h2><span className="phn-kilde">{hullSlag.length > 0 ? `${hullSlag.length} slag` : "Ingen slag ennå"}</span></div>
            {hullSlag.length > 0 && (
              <div className="phr-slagliste">
                {hullSlag.map((s) => (
                  <button key={s.shotNumber} type="button" aria-pressed={redigert?.shotNumber === s.shotNumber} onClick={() => { setRedigert({ ...s }); setFeil(null); setMelding(null); }}>
                    <span className="nr">{s.shotNumber}</span>
                    <span><b>{navn(TYPER, s.shotType)}{s.club ? ` · ${s.club}` : ""}</b>{s.isPenalty && <span className="phr-straff">Straff</span>}
                      <span className="phn-kilde" style={{ display: "block" }}>{navn(UNDERLAG, s.lie)}</span></span>
                    <span className="v">{s.distanceToPin != null ? `${s.distanceToPin} m` : "—"}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="phn-kilde">Trykk på et slag for å rette det. Avstanden er til hullet før slaget.</p>
          </section>
        </div>
      </div>

      {slettes && <SlettArk slag={slettes} pending={pending} onJa={() => slett(slettes)} onLukk={() => setSlettes(null)} />}
      {importAapen && <ImportArk roundId={roundId} onLukk={() => setImportAapen(false)} />}
      <p className="phr-ingress">Ny runde føres i <Link href="/portal/runde/live">Slag for slag</Link>.</p>
      </SkraFlyt>
    </div>
  );
}
