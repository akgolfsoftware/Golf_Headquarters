"use client";

/**
 * PH-12 Velg treningsplan i nytt design (pakke 4, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «velg». Stil: playerhq-ny-ovelser.css.
 *
 * Spilleren velger selv en standardplan for kategorien sin (vedtak 28.09) og kan alltid bygge uka
 * selv i Workbench. Ingen AI-planbygger. Valget lagres med sendPlanTilCoachV2: en plan uten økter med
 * fordeling per akse, og målsetningen spilleren skriver. Coachen legger inn øktene i Workbench.
 *
 * De fem standardplanene (src/lib/plan-builder/standardplaner.ts) står øverst, anbefalt etter turneringsnivået
 * fra oppstarten. Malene for kategorien (PlanTemplate) beholdes under «Flere maler».
 *
 * Avvik:
 *   - Timer per uke og fordeling er tegningens eksempler. Kortet merkes «Eksempel» som i utkastet,
 *     fordi innholdet i standardplanene ikke er skrevet ennå (åpent hos Anders). Malene for kategorien
 *     viser økter per uke, fordi de bare har antall økter.
 *   - «Velg» åpner et ark med start, lengde, timer per uke, fordeling og målsetning før valget lagres:
 *     planen trenger dette for å kunne lagres. Utkastet lagrer med ett trykk.
 *   - Planen lagres som utkast hos coachen (plan uten økter). Utkastet sier at planen gjelder med en
 *     gang; i appen legger coachen inn øktene først. «Send til coach» som eget steg er fjernet.
 *   - Uten turneringsnivå fra oppstarten er ingen plan anbefalt, og Klubbspilleren er valgt først.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-12.
 */
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, ChevronRight, ChartLine, X } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { formaterTall } from "@/lib/format-tall";
import { oktBilde } from "@/lib/portal/okt-bilde";
import {
  VELG_AKSER, fordelingSum, validerMaal, type Fordeling, type MaalFeil, type SmartMaal, type StartUke, type VelgAkse,
} from "@/lib/plan-builder/velg-plan";
import type { SendPlanInput } from "@/lib/plan-builder/velg-plan-lagre";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-ovelser.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke8-skra.css";

export type VelgPlanMal = {
  id: string; navn: string; beskrivelse: string | null; uker: number; okterPerUke: number; fordeling: Fordeling; anbefalt: boolean;
  /** Standardplanene har timer per uke og eget bilde; malene for kategorien har bare økter per uke. */
  timerPerUke?: number; bilde?: string;
};
export type PH12Props = {
  /** De fem standardplanene. */
  maler: readonly VelgPlanMal[];
  /** Malene for spillerens kategori (PlanTemplate), under «Flere maler». */
  kategoriMaler?: readonly VelgPlanMal[];
  /** null: spilleren har ingen kategori ennå (for få runder og ingen HCP). */
  kategori: { navn: string; snitt: number | null } | null;
  startUker: readonly StartUke[];
  uleste: number;
  onSend: (input: SendPlanInput) => Promise<{ ok: true; planId: string } | { ok: false; error: string }>;
  workbenchHref: string;
  /** Skjermprøven: åpne arket for valgt plan ved første visning. */
  startMedArk?: boolean;
};

const KODE: Record<VelgAkse, string> = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };

function storsteAkse(f: Fordeling): VelgAkse {
  return VELG_AKSER.reduce((a, k) => (f[k] > f[a] ? k : a), VELG_AKSER[0]);
}

function Fordelingsstrek({ f }: { f: Fordeling }) {
  return (
    <span className="phn-ov-fordeling" role="img" aria-label={`Fordeling: ${VELG_AKSER.map((a) => `${KODE[a]} ${f[a]} %`).join(", ")}`}>
      {VELG_AKSER.map((a) => f[a] > 0 && <i key={a} className={`akse-${a}`} style={{ width: `${f[a]}%` }} />)}
    </span>
  );
}

export function PH12VelgPlan({ maler, kategoriMaler = [], kategori, startUker, uleste, onSend, workbenchHref, startMedArk }: PH12Props) {
  const [valgtId, setValgtId] = useState(maler.find((m) => m.anbefalt)?.id ?? maler.find((m) => m.id === "std-klubbspilleren")?.id ?? maler[0]?.id ?? "");
  const [ark, setArk] = useState(!!startMedArk && maler.length > 0);
  const [melding, setMelding] = useState<string | null>(null);
  const valgt = [...maler, ...kategoriMaler].find((m) => m.id === valgtId) ?? null;

  const kort = (m: VelgPlanMal) => {
    const b = m.bilde ? { src: m.bilde, posisjon: "center" } : oktBilde(KODE[storsteAkse(m.fordeling)], m.navn);
    return (
      <button key={m.id} type="button" className="phn-ov-plankort" aria-pressed={m.id === valgtId} onClick={() => setValgtId(m.id)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
        <img src={b.src} alt="" width={1400} height={933} loading="lazy" style={{ objectPosition: b.posisjon }} />
        <span className="phn-ov-pk-tekst">
          <span className="phn-ov-pk-rad">
            <span><span className="phn-ov-pk-navn">{m.navn}</span>{m.anbefalt && <span className="phn-kilde" style={{ display: "block" }}>Anbefalt ut fra turneringsnivået ditt</span>}</span>
            {m.timerPerUke != null
              ? <span className="phn-ov-pk-tall">{m.timerPerUke}<small>t/uke</small></span>
              : <span className="phn-ov-pk-tall">{m.okterPerUke}<small>økter/uke</small></span>}
          </span>
          <span className="phn-forklar">{m.beskrivelse ?? `${m.uker} uker · ${m.okterPerUke} økter i uka.`}</span>
          <Fordelingsstrek f={m.fordeling} />
          <span className="phn-ov-pk-rad"><span className="phn-ov-estimat">Eksempel</span><span className="phn-ov-valgt"><Check className="phn-ikon" aria-hidden />Valgt</span></span>
        </span>
      </button>
    );
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <div className="phn phn-skra">
      <SkraTopp
        lav
        etikett="Treningsplan"
        bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
        overlinje="Plan · treningsplan"
        tittel="Velg treningsplan"
        ingress={kategori ? `Fem standardplaner, tilpasset ${kategori.navn}. Du velger selv, og kan alltid endre øktene i Workbench.` : "Fem standardplaner. Du velger selv, og kan alltid endre øktene i Workbench."}
      />
      <SkraFlyt lav>

        {melding && <p className="phn-ov-status" role="status"><Check className="phn-ikon" aria-hidden /><span>{melding} <Link href={workbenchHref}>Åpne Workbench</Link></span></p>}

        {kategori && (
          <div className="phn-kort phn-ov-malkort" style={{ background: "var(--phn-sand-100)" }}>
            <span className="phn-ov-ikonboks"><ChartLine className="phn-ikon" aria-hidden /></span>
            <span><b className="phn-ov-under">{kategori.navn} · snitt {kategori.snitt != null ? formaterTall(kategori.snitt, 1, true) : "—"}</b>
              <span className="phn-kilde" style={{ display: "block" }}>{kategori.snitt != null ? "Brutto snitt av rundene i sesongen. Planene tilpasses kategorien." : "Ingen runder i sesongen ennå. Kategorien er satt fra handicap."}</span></span>
          </div>
        )}

        <section className="phn-seksjon" aria-label="Standardplaner">
          <div className="phn-ov-planer">{maler.map(kort)}</div>
        </section>

        {kategoriMaler.length > 0 && (
          <details className="phn-ov-flere">
            <summary>Flere maler for {kategori?.navn ?? "kategorien din"} ({kategoriMaler.length}) <ChevronDown className="phn-ikon" aria-hidden /></summary>
            <div className="phn-ov-innmat"><div className="phn-ov-planer">{kategoriMaler.map(kort)}</div></div>
          </details>
        )}

        {!kategori && (
          <section className="phn-kort" style={{ background: "var(--phn-sand-100)" }}>
            <b className="phn-ov-under">Ingen kategori ennå</b>
            <p className="phn-forklar">Kategorien settes fra brutto snittscore. Registrer minst fire runder, så tilpasses planene deg.</p>
            <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/mal/runder/ny">Registrer runde</Link></div>
          </section>
        )}

        <Link className="phn-rad-lenke" href={workbenchHref}>
          <span><b>Bygg uka selv i Workbench</b><span className="phn-kilde">Uten standardplan. Kopier forrige uke, eller legg inn øktene selv.</span></span>
          <ChevronRight className="phn-ikon" aria-hidden />
        </Link>

        {valgt && <div className="phn-ov-festet"><button type="button" className="phn-knapp pri phn-ov-knapp-stor" onClick={() => setArk(true)}>Velg {valgt.navn}</button></div>}
        {ark && valgt && <VelgArk mal={valgt} startUker={startUker} onSend={onSend} onLukk={() => setArk(false)} onValgt={(t) => { setArk(false); setMelding(t); }} />}
      </SkraFlyt>
      </div>
    </PlayerHQSkall>
  );
}

const TOM_MAAL: SmartMaal = { s: "", m: "", a: "", r: "", t: "" };

function VelgArk({ mal, startUker, onSend, onLukk, onValgt }: {
  mal: VelgPlanMal; startUker: readonly StartUke[]; onSend: PH12Props["onSend"]; onLukk: () => void; onValgt: (tekst: string) => void;
}) {
  const ark = useRef<HTMLDialogElement>(null);
  const [start, setStart] = useState(startUker[0]?.verdi ?? "");
  const [uker, setUker] = useState(mal.uker);
  const [timer, setTimer] = useState(Math.min(30, Math.max(4, mal.timerPerUke ?? 12)));
  const [mix, setMix] = useState<Fordeling>(mal.fordeling);
  const [g, setG] = useState<SmartMaal>(TOM_MAAL);
  const [forsokt, setForsokt] = useState<MaalFeil | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, run] = useTransition();
  useEffect(() => { ark.current?.showModal(); }, []);
  const sum = fordelingSum(mix);
  const startNavn = startUker.find((u) => u.verdi === start)?.label ?? start;

  const lagre = () => {
    const errs = validerMaal(g);
    setForsokt(errs);
    if (Object.keys(errs).length > 0 || sum !== 100 || !start) return;
    run(async () => {
      setFeil(null);
      const r = await onSend({ malNavn: mal.navn, malId: mal.id, maal: g, startDato: start, uker, timerPerUke: timer, fordeling: mix });
      if (r.ok) onValgt(`${mal.navn} er valgt fra ${startNavn.toLowerCase()}. Coachen din legger inn øktene i Workbench. Ukene før er ikke endret.`);
      else setFeil(r.error);
    });
  };

  const stepper = (navn: string, verdi: number, min: number, maks: number, steg: number, sett: (v: number) => void, vis: string, klasse?: string) => (
    <div className="phn-stepper">
      <b>{klasse && <i className={klasse} />}{navn}</b>
      <span className="phn-spor"><span className={klasse ?? "akse-tek"} style={{ width: `${Math.min(100, ((verdi - min) / (maks - min)) * 100)}%`, background: klasse ? undefined : "var(--phn-g900)" }} /></span>
      <button type="button" aria-label={`${navn} ned`} disabled={verdi <= min} onClick={() => sett(Math.max(min, verdi - steg))}>−</button>
      <output>{vis}</output>
      <button type="button" aria-label={`${navn} opp`} disabled={verdi >= maks} onClick={() => sett(Math.min(maks, verdi + steg))}>+</button>
    </div>
  );

  return (
    <dialog ref={ark} className="phn-ark" aria-label={`Velg ${mal.navn}`} onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp">
          <div><span className="phn-dato">Treningsplan</span><h2>{mal.navn}</h2></div>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
        </div>
        {feil && <p className="phn-melding" role="alert">{feil}</p>}
        <div className="phn-felt"><span>Start</span>
          <div className="phn-valg" role="group" aria-label="Start">{startUker.map((u) => <button key={u.verdi} type="button" aria-pressed={u.verdi === start} onClick={() => setStart(u.verdi)}>{u.label}</button>)}</div>
        </div>
        <div className="phn-seksjon" style={{ gap: 6 }}>
          {stepper("Uker", uker, 2, 52, 1, setUker, `${uker} uker`)}
          {stepper("Timer", timer, 4, 30, 1, setTimer, `${timer} t/uke`)}
        </div>
        <div className="phn-felt"><span>Fordeling per akse · {sum} % av 100 %</span>
          <div className="phn-seksjon" style={{ gap: 6 }}>
            {VELG_AKSER.map((a) => <div key={a}>{stepper(KODE[a], mix[a], 0, 80, 5, (v) => setMix((x) => ({ ...x, [a]: v })), `${mix[a]} %`, `akse-${a}`)}</div>)}
          </div>
          {sum !== 100 && <p className="phn-melding" role="alert">Juster aksene til summen er 100 %.</p>}
        </div>
        <label className="phn-felt">Målsetning: hva vil du bli bedre på?<input type="text" value={g.s} maxLength={300} placeholder="Bedre lengdekontroll på innspill 50–100 m" onChange={(e) => setG({ ...g, s: e.target.value })} /></label>
        {forsokt?.s && <p className="phn-melding" role="alert">{forsokt.s}</p>}
        <label className="phn-felt">Hvilket tall viser at du er der?<input type="text" value={g.m} maxLength={300} placeholder="7 av 10 innenfor 4 m i test" onChange={(e) => setG({ ...g, m: e.target.value })} /></label>
        {forsokt?.m && <p className="phn-melding" role="alert">{forsokt.m}</p>}
        <label className="phn-felt">Dato målsetningen skal være nådd<input type="date" value={g.t} onChange={(e) => setG({ ...g, t: e.target.value })} /></label>
        {forsokt?.t && <p className="phn-melding" role="alert">{forsokt.t}</p>}
        <details className="phn-ov-flere">
          <summary>Flere felt <ChevronDown className="phn-ikon" aria-hidden /></summary>
          <div className="phn-ov-innmat">
            <label className="phn-felt">Hvor er du i dag?<input type="text" value={g.a} maxLength={500} onChange={(e) => setG({ ...g, a: e.target.value })} /></label>
            <label className="phn-felt">Hvorfor betyr det noe for scoren?<input type="text" value={g.r} maxLength={500} onChange={(e) => setG({ ...g, r: e.target.value })} /></label>
          </div>
        </details>
        <p className="phn-kilde">Planen gjelder fra {startNavn.toLowerCase()}. Ukene før er ikke endret.</p>
        <button type="button" className="phn-knapp pri phn-ov-knapp-stor" disabled={lagrer} onClick={lagre}>{lagrer ? "Lagrer …" : `Velg ${mal.navn}`}</button>
      </div>
    </dialog>
  );
}
