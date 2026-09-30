"use client";

/**
 * PH-06 Fysisk økt i Precision Athletics: spilleren fører reps og kilo per serie, og kan
 * legge til eller fjerne serier. Styrke, kondisjon og bevegelighet som før; registreringen
 * lagres som klarspråktekst via fysLoggState.
 *
 * Bevisste avvik fra tegningen:
 *   - Serien har ingen «ferdig»-hake: modellen lagrer bare verdiene, og en serie i lista
 *     regnes som utført.
 *   - «Sist» og RIR vises ikke: plan→live-speilingen lagrer ingen av delene.
 *   - Pulssone vises som nøytrale valg (farge betyr bare akse).
 */

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { fysLoggState } from "@/lib/portal-live/fys-registrering";
import type { LiveV2Drill, DrillRepState } from "./types";
import type { SettRad } from "@/components/v2/fysisk";
import { MicButton } from "@/components/shared/mic-button";
import { Meta } from "@/components/precision/pa";
import { Kortseksjon, Stepper } from "@/components/portal/precision/PHOkt";

type FysModalitet = "styrke" | "kondisjon" | "bevegelighet";

function fysModalitet(drill: LiveV2Drill): FysModalitet {
  if (drill.fysBevegelighetType) return "bevegelighet";
  if (drill.fysTreningstype === "kondisjon" || drill.fysAktivitet || drill.repType === "TID") return "kondisjon";
  if (drill.fysTreningstype === "bevegelighet") return "bevegelighet";
  return "styrke";
}

const SONER = [["S1", "Rolig", "under 120"], ["S2", "Moderat", "120–140"], ["S3", "Terskel−", "140–160"], ["S4", "Terskel+", "160–175"], ["S5", "Maks", "over 175"]] as const;

export type FysDrillLoggerProps = { drill: LiveV2Drill; onChange: (state: DrillRepState) => void };

function Notat({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <Kortseksjon tittel="Notat (valgfritt)">
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input type="text" className="pa-okt-felt" aria-label="Notat" value={value} onChange={(e) => onChange(e.target.value)} placeholder="F.eks. «kjentes tungt siste sett»" style={{ paddingRight: 56 }} />
      <span style={{ position: "absolute", right: 4 }}><MicButton variant="suffix" onResult={(t) => onChange(value ? `${value} ${t}` : t)} /></span>
    </div>
  </Kortseksjon>;
}

const tilTall = (s: string): number => { const n = Number(s.replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : 0; };

export function FysDrillLogger({ drill, onChange }: FysDrillLoggerProps) {
  const modalitet = fysModalitet(drill);
  const settTall = drill.fysSett ?? drill.repSett ?? 3;
  const repsMaal = drill.fysReps ?? drill.repReps ?? 8;
  const startVekt = drill.fysVektKg ?? 20;

  const [sone, setSone] = useState("S3");
  const [varighetMin, setVarighetMin] = useState(drill.fysVarighetMin ?? drill.repMinutter ?? 10);
  const [bevegelseReps, setBevegelseReps] = useState(drill.fysReps ?? drill.plannedReps ?? 10);
  const [holdSek, setHoldSek] = useState(drill.fysHoldSek ?? 20);
  const [sett, setSett] = useState<{ reps: number; kg: string }[]>(() => Array.from({ length: settTall }, () => ({ reps: repsMaal, kg: String(startVekt).replace(".", ",") })));
  const [notat, setNotat] = useState("");
  const erHold = drill.fysBevegelighetType === "hold";

  const rader = (r: { reps: number; kg: string }[]): SettRad[] => r.map((x) => ({ vekt: tilTall(x.kg), reps: x.reps }));
  function meldStyrke(r: { reps: number; kg: string }[], n = notat) { setSett(r); onChange(fysLoggState({ type: "styrke", sett: rader(r), notat: n })); }
  function meldKondisjon(s: string, min: number, n = notat) { onChange(fysLoggState({ type: "kondisjon", minutter: min, sone: s, notat: n })); }
  function meldBevegelighet(reps: number, hold: number, n = notat) {
    onChange(fysLoggState(erHold ? { type: "hold", sekunder: hold, notat: n } : { type: "reps", repetisjoner: reps, notat: n }));
  }
  function haandterNotat(v: string) {
    setNotat(v);
    if (modalitet === "kondisjon") meldKondisjon(sone, varighetMin, v);
    else if (modalitet === "bevegelighet") meldBevegelighet(bevegelseReps, holdSek, v);
    else meldStyrke(sett, v);
  }

  if (modalitet === "kondisjon") return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Kortseksjon tittel="Varighet"><Stepper label="Varighet" value={varighetMin} min={0} max={180} enhet="min" onChange={(v) => { setVarighetMin(v); meldKondisjon(sone, v); }} /></Kortseksjon>
    <Kortseksjon tittel="Oppnådd pulssone">
      <div role="group" aria-label="Pulssone" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SONER.map(([id, navn, puls]) => <button key={id} type="button" className="pa-choice pa-choice--lg" aria-pressed={sone === id} style={{ justifyContent: "space-between", width: "100%", borderRadius: 8 }}
          onClick={() => { setSone(id); meldKondisjon(id, varighetMin); }}><span>{id} · {navn}</span><span style={{ font: "var(--type-meta)", opacity: 0.8 }}>{puls} slag/min</span></button>)}
      </div>
    </Kortseksjon>
    <Notat value={notat} onChange={haandterNotat} />
  </div>;

  if (modalitet === "bevegelighet") return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Kortseksjon tittel={erHold ? "Hold (sekunder)" : "Repetisjoner"}>
      {erHold
        ? <Stepper label="Hold" value={holdSek} min={0} max={300} step={5} enhet="s" onChange={(v) => { setHoldSek(v); meldBevegelighet(bevegelseReps, v); }} />
        : <Stepper label="Repetisjoner" value={bevegelseReps} min={0} max={200} enhet="reps" onChange={(v) => { setBevegelseReps(v); meldBevegelighet(v, holdSek); }} />}
    </Kortseksjon>
    <Notat value={notat} onChange={haandterNotat} />
  </div>;

  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <section aria-label={`Serier ${drill.name}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Meta>PLAN {settTall} × {repsMaal}{drill.fysVektKg != null ? ` @ ${String(drill.fysVektKg).replace(".", ",")} KG` : ""}</Meta>
      <div role="table" aria-label="Serier" style={{ display: "grid", gridTemplateColumns: "32px minmax(0,1fr) minmax(0,1fr)", gap: 8, alignItems: "center" }}>
        <Meta>#</Meta><Meta>REPS</Meta><Meta>KG</Meta>
        {sett.map((x, i) => <div key={i} role="row" style={{ display: "contents" }}>
          <Meta style={{ font: "var(--type-num-s)" }}>{i + 1}</Meta>
          <div style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1fr) 48px", alignItems: "center", gap: 4 }}>
            <button type="button" className="pa-iconbtn" style={{ width: 48, height: 52 }} aria-label={`Færre reps serie ${i + 1}`} onClick={() => meldStyrke(sett.map((y, j) => j === i ? { ...y, reps: Math.max(0, y.reps - 1) } : y))}><Minus size={18} aria-hidden /></button>
            <span style={{ font: "600 18px/1 var(--font-mono)", textAlign: "center", color: "var(--text-primary)" }}>{x.reps}</span>
            <button type="button" className="pa-iconbtn" style={{ width: 48, height: 52 }} aria-label={`Flere reps serie ${i + 1}`} onClick={() => meldStyrke(sett.map((y, j) => j === i ? { ...y, reps: y.reps + 1 } : y))}><Plus size={18} aria-hidden /></button>
          </div>
          <input className="pa-okt-felt" inputMode="decimal" aria-label={`Kilo serie ${i + 1}`} value={x.kg} style={{ minHeight: 52, fontFamily: "var(--font-mono)", fontSize: 18 }}
            onChange={(e) => meldStyrke(sett.map((y, j) => j === i ? { ...y, kg: e.target.value.replace(/[^\d,.]/g, "").slice(0, 5) } : y))} />
        </div>)}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="pa-btn pa-btn--ghost pa-btn--sm" style={{ minHeight: 44 }} onClick={() => meldStyrke([...sett, { ...sett[sett.length - 1] }])}><Plus size={16} aria-hidden />Legg til serie</button>
        <button type="button" className="pa-btn pa-btn--ghost pa-btn--sm" style={{ minHeight: 44 }} disabled={sett.length <= 1} onClick={() => meldStyrke(sett.slice(0, -1))}><Minus size={16} aria-hidden />Fjern serie</button>
      </div>
    </section>
    <Notat value={notat} onChange={haandterNotat} />
  </div>;
}
