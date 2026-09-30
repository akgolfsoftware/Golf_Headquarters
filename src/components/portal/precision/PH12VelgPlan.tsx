"use client";

/**
 * PH-12 Velg treningsplan (Planbygger), Precision Athletics. Tegning: Claude Design
 * 7d7c2994, ui_kits/playerhq/screens/PH-12.jsx (etag 1790520214001258).
 *
 * Fire steg: Mal, SMART-mål, Periode og volum, Oppsummering. Spilleren sender
 * planen til coach; coachen bygger øktene i Workbench.
 *
 * Avvik fra tegningen (se PR): «Foreslå med Caddie» er ikke med (ingen AI-planbygger
 * ved lansering); malene kommer fra PlanTemplate i stedet for de fire eksempelmalene;
 * timer per uke er ikke satt før spilleren velger (malene har ikke timer, vises «—»); startukene regnes fra i dag;
 * «Sendt» viser klokkeslett fra klokka, ikke navn på coach.
 */
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Layers, Send } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { AkseMerke, Knapp, KnappLenke, Meta, Tall } from "@/components/precision/pa";
import { Nokkelverdi } from "@/components/precision/pa-a4";
import { SegmentertValg } from "@/components/precision/pa-a2";
import { Felt, Inndata, Varsel } from "@/components/precision/pa-planhub";
import { Teller } from "@/components/precision/teknisk-plan/tp-deler";
import {
  JEVN_FORDELING, VELG_AKSER, fordelingSum, maalSetning, tusenskille, validerMaal,
  type Fordeling, type SmartMaal, type StartUke, type VelgAkse,
} from "@/lib/plan-builder/velg-plan";
import { formaterTall } from "@/lib/format-tall";
import type { SendPlanInput } from "@/lib/plan-builder/velg-plan-lagre";
import "@/styles/precision-a12.css";

export type VelgPlanMal = { id: string; navn: string; sub: string; uker: number; fordeling: Fordeling };
export type PH12Props = {
  maler: readonly VelgPlanMal[];
  startUker: readonly StartUke[];
  uleste: number;
  onSend: (input: SendPlanInput) => Promise<{ ok: true; planId: string } | { ok: false; error: string }>;
  workbenchHref: string;
  /** Skjermprøven: åpne på et bestemt steg. */
  startSteg?: number;
};

const TIMER_START = 12; // bare startpunkt for telleren, vises aldri som verdi før spilleren har valgt
const STEG = ["Mal", "SMART-mål", "Periode og volum", "Oppsummering"] as const;
const TOM: VelgPlanMal = { id: "tom", navn: "Tom plan", sub: "Bygg alt selv i Workbench", uker: 8, fordeling: JEVN_FORDELING };
const SMART = [
  ["s", "Spesifikt", "Hva vil du bli bedre på?", "Bedre lengdekontroll på innspill ca. 50 m"],
  ["m", "Målbart", "Hvilket tall viser at du er der?", "7 av 10 innenfor 4 m i test"],
  ["a", "Oppnåelig", "Hvor er du i dag, og hvorfor går det?", "Hvor er du i dag?"],
  ["r", "Relevant", "Hvorfor betyr dette noe for scoren?", "Hvorfor betyr det noe for scoren?"],
] as const;
const desimal = (n: number) => formaterTall(n, 1, true);
const klokke = () => new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date()).replace(".", ":");

function Fordelingsbar({ f }: { f: Fordeling }) {
  return <div className="ph12-bar" aria-hidden>{VELG_AKSER.map((a) => f[a] > 0 && <span key={a} title={`${a.toUpperCase()} ${f[a]} %`} style={{ flex: f[a], background: `var(--axis-${a})` }} />)}</div>;
}

export function PH12VelgPlan({ maler, startUker, uleste, onSend, workbenchHref, startSteg = 0 }: PH12Props) {
  const tomtGrunnlag = maler.length === 0;
  const valg = tomtGrunnlag ? [TOM] : [...maler, TOM];
  const [steg, setSteg] = useState(startSteg);
  const [malId, setMalId] = useState((tomtGrunnlag ? TOM : valg[0]).id);
  const mal = valg.find((x) => x.id === malId) ?? TOM;
  const [g, setG] = useState<SmartMaal>({ s: "", m: "", a: "", r: "", t: "" });
  const [forsokt, setForsokt] = useState(false);
  const [uker, setUker] = useState(mal.uker);
  const [timer, setTimer] = useState(TIMER_START);
  const [timerSatt, setTimerSatt] = useState(false);
  const [start, setStart] = useState(startUker[0]?.verdi ?? "");
  const [mix, setMix] = useState<Fordeling>(mal.fordeling);
  const [sendt, setSendt] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, run] = useTransition();

  const velg = (x: VelgPlanMal) => { setMalId(x.id); setUker(x.uker); setMix(x.fordeling); };
  const errs = validerMaal(g);
  const harFeil = Object.keys(errs).length > 0;
  const sum = fordelingSum(mix);
  const setning = maalSetning(g);
  const startLabel = startUker.find((u) => u.verdi === start)?.label ?? null;

  const neste = () => {
    if (steg === 1) { setForsokt(true); if (harFeil) return; }
    if (steg === 2 && (sum !== 100 || !timerSatt)) return;
    setSteg(Math.min(3, steg + 1));
    document.getElementById("pa-innhold")?.scrollTo(0, 0);
  };
  const send = () => run(async () => {
    setFeil(null);
    const r = await onSend({ malNavn: mal.navn, malId: mal.id === TOM.id ? null : mal.id, maal: g, startDato: start, uker, timerPerUke: timer, fordeling: mix });
    if (r.ok) setSendt(klokke()); else setFeil(r.error);
  });

  const aside = <div className="pa-card ph12-kort ph12-side" style={{ gap: 12 }}>
    <span className="kicker">Planen så langt</span>
    <Nokkelverdi items={[["Mal", mal.navn, { mono: false }], ["Mål", setning, { mono: false }], ["Start", steg >= 2 ? startLabel : null], ["Lengde", steg >= 2 ? `${uker} uker` : null], ["Volum", steg >= 2 && timerSatt ? `${timer} t/uke` : null], ["Totalt", steg >= 2 && timerSatt ? `${tusenskille(uker * timer)} t` : null]]} />
  </div>;

  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
    <div className="pa-side" style={{ maxWidth: 1200 }}>
      <header className="pa-pagehead"><div className="pa-pagehead__row"><div className="pa-pagehead__text">
        <nav className="pa-crumbs ph12-krum" aria-label="Brødsmulesti"><ol><li><a href="/portal/planlegge">Plan</a><span aria-hidden>/</span></li><li aria-current="page">Planbygger</li></ol></nav>
        <span className="kicker pa-pagehead__kicker">Plan · Planbygger</span>
        <h1 className="pa-pagehead__title">Lag en plan</h1>
        <p className="pa-pagehead__sub">Fire steg. Coachen din godkjenner planen før den blir aktiv.</p>
      </div></div></header>

      <ol aria-label="Steg" className="ph12-steg">{STEG.map((n, i) => {
        const on = i === steg, done = i < steg;
        return <li key={n} className={on ? "ph12-steg__na ph12-steg__aktiv" : done ? "ph12-steg__aktiv" : undefined}>
          <button type="button" aria-current={on ? "step" : undefined} disabled={i > steg || !!sendt} onClick={() => setSteg(i)}>
            <span className="ph12-steg__strek" />
            <span className="ph12-steg__rad"><span className="ph12-steg__nr">{done ? "✓" : i + 1}</span><span className="ph12-steg__navn">{n}</span></span>
          </button>
        </li>;
      })}</ol>

      <div className="ph12-kolonner">
        <div className="ph12-stabel">
          {steg === 0 && <div className="pa-card ph12-kort">
            <span className="kicker">Velg utgangspunkt</span>
            <div role="radiogroup" aria-label="Mal" className="ph12-maler">{valg.map((x) => <button key={x.id} type="button" role="radio" aria-checked={x.id === malId} className="ph12-mal" onClick={() => velg(x)}>
              <span className="ph12-mal__navn">{x.navn}</span><Meta style={{ overflowWrap: "anywhere" }}>{x.sub.toUpperCase()}</Meta>
            </button>)}</div>
            {tomtGrunnlag && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Malene blir tilgjengelige når coachen din har koblet deg til en gruppe. Du kan starte med en tom plan.</p>}
          </div>}

          {steg === 1 && <div className="pa-card ph12-kort" style={{ gap: 20 }}>
            <div><span className="kicker">SMART-mål</span><p style={{ margin: "6px 0 0", font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Ett mål per plan. Målet skal kunne testes.</p></div>
            {SMART.map(([k, l, hint, ph]) => <Felt key={k} label={l} hint={hint} required={k === "s" || k === "m"} valgfritt={k === "a" || k === "r"} error={forsokt && (k === "s" || k === "m") ? errs[k] : undefined}>
              <Inndata value={g[k]} placeholder={ph} onChange={(e) => setG({ ...g, [k]: e.target.value })} />
            </Felt>)}
            <Felt label="Tidsbestemt" hint="Datoen målet skal være nådd." required error={forsokt ? errs.t : undefined}>
              <Inndata mono type="date" value={g.t} onChange={(e) => setG({ ...g, t: e.target.value })} />
            </Felt>
            <div className="ph12-setning"><Meta>SLIK LESES MÅLET</Meta><p style={{ margin: "6px 0 0", font: "500 15px/1.4 var(--font-sans)", color: setning ? "var(--text-primary)" : "var(--text-muted)", textWrap: "pretty" }}>{setning ?? "—"}</p></div>
          </div>}

          {steg === 2 && <div className="pa-card ph12-kort" style={{ gap: 20 }}>
            <div className="pa-field"><span className="pa-field__label">Start</span>
              <SegmentertValg label="Start" value={start} options={startUker.map((u) => ({ id: u.verdi, label: u.label }))} onChange={setStart} /></div>
            <div className="ph12-to">
              <Teller label="Antall uker" verdi={uker} min={2} maks={52} storrelse="md" format={(v) => `${v} uker`} onEndre={setUker} />
              <Teller label="Timer per uke" verdi={timer} min={4} maks={30} storrelse="md" format={(v) => `${v} t`} onEndre={(v) => { setTimer(v); setTimerSatt(true); }} />
            </div>
            <div>
              <div className="ph12-hode" style={{ marginBottom: 12 }}><span className="pa-field__label">Fordeling per akse</span><Meta style={{ color: sum === 100 ? "var(--text-muted)" : "var(--warn)" }}>{sum} % AV 100 %</Meta></div>
              <div style={{ marginBottom: 12 }}><Fordelingsbar f={mix} /></div>
              <div className="ph12-akser">{VELG_AKSER.map((a: VelgAkse) => <div key={a} className="ph12-akse">
                <span className="ph12-akse__hode"><AkseMerke axis={a} /><Meta>{timerSatt ? `${desimal((timer * mix[a]) / 100)} T/UKE` : "—"}</Meta></span>
                <Teller label={`${a.toUpperCase()} prosent`} verdi={mix[a]} min={0} maks={80} steg={5} storrelse="sm" format={(v) => `${v} %`} onEndre={(v) => setMix({ ...mix, [a]: v })} />
              </div>)}</div>
              {!timerSatt && <div style={{ marginTop: 12 }}><Varsel tone="info" tittel="Velg timer per uke">Timer per uke kommer ikke fra malen. Velg selv hvor mange timer du har, så regnes fordelingen ut.</Varsel></div>}
              {sum !== 100 && <div style={{ marginTop: 12 }}><Varsel tone="warn" tittel={`Fordelingen er ${sum} %`}>Juster aksene til summen er 100 % før du går videre.</Varsel></div>}
            </div>
          </div>}

          {steg === 3 && <div className="pa-card ph12-kort" style={{ gap: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className={`pa-status${sendt ? " pa-status--info" : ""}`}><span className="pa-status__dot" />{sendt ? "Venter på coach" : "Utkast"}</span>
              <Meta>{sendt ? `SENDT TIL COACH ${sendt}` : "IKKE SENDT"}</Meta>
            </div>
            <p style={{ margin: 0, font: "600 17px/1.4 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{setning ?? "Ingen mål satt."}</p>
            <Nokkelverdi items={[["Mal", mal.navn, { mono: false }], ["Start", startLabel], ["Lengde", `${uker} uker`], ["Volum", timerSatt ? `${timer} t/uke` : null], ["Totalt", timerSatt ? `${tusenskille(uker * timer)} t` : null], ["Oppnåelig", g.a.trim() || null, { mono: false }], ["Relevant", g.r.trim() || null, { mono: false }]]} />
            <Fordelingsbar f={mix} />
            <div className="ph12-liste">{VELG_AKSER.map((a) => <span key={a}><AkseMerke axis={a} /><Tall style={{ font: "var(--type-num-s)" }}>{mix[a]} %</Tall></span>)}</div>
            {feil && <Varsel tone="signal" tittel="Planen ble ikke sendt">{feil}</Varsel>}
            {sendt && <Varsel tone="ok" tittel="Planen er sendt til coach">Den blir ikke aktiv før coachen har godkjent den.</Varsel>}
            {sendt && <div><KnappLenke variant="secondary" icon={Layers} iconName="layers" href={workbenchHref}>Åpne i Workbench</KnappLenke></div>}
          </div>}

          <div className="ph12-nav">
            <Knapp variant="ghost" icon={ArrowLeft} iconName="arrow-left" disabled={steg === 0 || !!sendt} onClick={() => setSteg(steg - 1)}>Tilbake</Knapp>
            {steg < 3
              ? <Knapp iconRight={ArrowRight} disabled={steg === 2 && (sum !== 100 || !timerSatt)} onClick={neste}>Neste: {STEG[steg + 1]}</Knapp>
              : <Knapp icon={Send} iconName="send" disabled={!!sendt} loading={pending} loadingText="Sender …" onClick={send}>Send til coach</Knapp>}
          </div>
        </div>
        {aside}
      </div>
    </div>
  </PlayerHQSkall>;
}
