"use client";

/**
 * PlayerHQ Meg · Symptom — v2 Presis + B-pakke (wizard, Neste/Lagre = grønn).
 */

import { useState, useTransition } from "react";
import {
  T,
  Caps,
  Kort,
  Knapp,
  Icon,
  FilterChips,
  PillVelger,
  ValgKort,
  Glider,
  TekstOmraade,
  Bryter,
  HjelpTips,
} from "@/components/v2";
import { logSymptom } from "@/app/portal/meg/helse/symptom/ny/actions";

type Side = "Venstre" | "Høyre" | "Midt / begge";
type View = "front" | "back";

const REGIONS = [
  { id: "hode", label: "Hode", side: null },
  { id: "skulder-h", label: "Skulder", side: "Høyre" as const },
  { id: "skulder-v", label: "Skulder", side: "Venstre" as const },
  { id: "bryst", label: "Bryst", side: null },
  { id: "albue-h", label: "Albue", side: "Høyre" as const },
  { id: "albue-v", label: "Albue", side: "Venstre" as const },
  { id: "haandledd-h", label: "Håndledd", side: "Høyre" as const },
  { id: "haandledd-v", label: "Håndledd", side: "Venstre" as const },
  { id: "hofte", label: "Hofte", side: null },
  { id: "kne-h", label: "Kne", side: "Høyre" as const },
  { id: "kne-v", label: "Kne", side: "Venstre" as const },
  { id: "ankel-h", label: "Ankel", side: "Høyre" as const },
  { id: "ankel-v", label: "Ankel", side: "Venstre" as const },
];

const MOVE_TRIGGERS = ["Svingbevegelse", "Sittende", "Gå", "Løft", "Bøy"];
const TIME_TRIGGERS = ["Morgen", "Etter trening", "Kveld", "Natt"];

const STEG_LABEL: Record<1 | 2 | 3, string> = {
  1: "Kroppskart",
  2: "Intensitet",
  3: "Trigger",
};

/** Kroppskart-soner (samme geometri som kildeskjermen). */
const SONER: {
  id: string;
  cx: number;
  cy: number;
  type: "circle" | "ellipse" | "rect";
  r?: number;
  rx?: number;
  ry?: number;
  w?: number;
  h?: number;
}[] = [
  { id: "hode", cx: 100, cy: 34, type: "ellipse", rx: 22, ry: 24 },
  { id: "skulder-h", cx: 128, cy: 92, type: "ellipse", rx: 18, ry: 14 },
  { id: "skulder-v", cx: 72, cy: 92, type: "ellipse", rx: 18, ry: 14 },
  { id: "bryst", cx: 100, cy: 127, type: "rect", w: 48, h: 38 },
  { id: "albue-h", cx: 148, cy: 160, type: "circle", r: 10 },
  { id: "albue-v", cx: 52, cy: 160, type: "circle", r: 10 },
  { id: "haandledd-h", cx: 155, cy: 218, type: "circle", r: 9 },
  { id: "haandledd-v", cx: 45, cy: 218, type: "circle", r: 9 },
  { id: "hofte", cx: 100, cy: 224, type: "rect", w: 56, h: 32 },
  { id: "kne-h", cx: 118, cy: 320, type: "circle", r: 11 },
  { id: "kne-v", cx: 82, cy: 320, type: "circle", r: 11 },
  { id: "ankel-h", cx: 118, cy: 412, type: "ellipse", rx: 8, ry: 11 },
  { id: "ankel-v", cx: 82, cy: 412, type: "ellipse", rx: 8, ry: 11 },
];

function StegHode({ eyebrow, tittel, em, sub }: { eyebrow: string; tittel: string; em: string; sub: string }) {
  return (
    <div>
      <Caps size={9}>{eyebrow}</Caps>
      <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.fg, margin: "8px 0 0", lineHeight: 1.15 }}>
        {tittel} <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>{em}</em>?
      </h2>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.6, color: T.mut, margin: "8px 0 0" }}>{sub}</p>
    </div>
  );
}

export function MegSymptomNyV2() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [view, setView] = useState<View>("front");
  const [selectedRegion, setSelectedRegion] = useState("skulder-h");
  const [side, setSide] = useState<Side>("Høyre");
  const [vas, setVas] = useState(4);
  const [varighet, setVarighet] = useState<"Akutt" | "Kronisk">("Kronisk");
  const [occurence, setOccurence] = useState<"Kun trening" | "Kun spill" | "Alltid">(
    "Kun spill",
  );
  const [moveTriggers, setMoveTriggers] = useState<string[]>([]);
  const [timeTriggers, setTimeTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [requestFysio, setRequestFysio] = useState(true);

  const region = REGIONS.find((r) => r.id === selectedRegion);

  function toggle(arr: string[], v: string): string[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function next() {
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await logSymptom({
          region: region?.label ?? "",
          side,
          vas,
          varighet,
          occurence,
          triggers: moveTriggers,
          daytimeTriggers: timeTriggers,
          note: note || undefined,
          requestFysio,
        });
      } catch {
        setError("Kunne ikke lagre symptom.");
      }
    });
  }

  return (
    <div style={{ maxWidth: 520, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Meg · Helse</Caps>
        <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: T.fg, margin: "10px 0 0", lineHeight: 1.1 }}>
          Legg til <em style={{ fontStyle: "italic", color: T.lime }}>symptom</em>
        </h1>
      </div>

      {/* Stegindikator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {([1, 2, 3] as const).map((i, idx) => {
          const done = i < step;
          const on = i === step;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                onClick={() => {
                  if (i <= step) setStep(i);
                }}
                aria-label={`Steg ${i}`}
                aria-current={on ? "step" : undefined}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: i <= step ? "pointer" : "default",
                  width: 30,
                  height: 30,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: T.mono,
                  fontSize: 11.5,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  background: done ? T.lime : on ? "transparent" : T.panel2,
                  border: `2px solid ${done || on ? T.lime : T.borderS}`,
                  color: done ? T.onLime : on ? T.lime : T.mut,
                }}
              >
                {done ? <Icon name="check" size={13} /> : i}
              </button>
              {idx < 2 && (
                <span style={{ width: 24, height: 2, borderRadius: 2, background: done ? `color-mix(in srgb, ${T.lime} 45%, transparent)` : T.track }} />
              )}
            </div>
          );
        })}
        <Caps size={9} style={{ marginLeft: 6 }}>
          {step} / 3 · {STEG_LABEL[step]}
        </Caps>
      </div>

      {/* STEG 1 — kroppskart */}
      {step === 1 && (
        <section style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <StegHode
            eyebrow="Kroppskart · steg 1"
            tittel="Hvor"
            em="kjenner du det"
            sub="Trykk på området der du har symptomet. Bytt for-/bakside ved behov."
          />

          <Kort>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <PillVelger
                options={[
                  { v: "front", l: "Forfra" },
                  { v: "back", l: "Bakfra" },
                ]}
                value={view}
                onChange={(v) => setView(v as View)}
              />
              <svg viewBox="0 0 200 440" style={{ height: 288, width: "auto" }}>
                <path
                  d="M100 8c-15 0-26 11-26 26 0 9 4 17 11 22-3 4-5 8-7 12-12 4-22 10-22 18v36c0 4 2 7 5 9l1 86c-7 4-11 11-11 18v62c0 14 11 25 25 25h.5v92c0 9 7 16 16 16 9 0 16-7 16-16v-92m14 0v92c0 9 7 16 16 16 9 0 16-7 16-16v-92h.5c14 0 25-11 25-25v-62c0-7-4-14-11-18l1-86c3-2 5-5 5-9V86c0-8-10-14-22-18-2-4-4-8-7-12 7-5 11-13 11-22 0-15-11-26-26-26z"
                  fill={T.panel2}
                  stroke={T.border}
                  strokeWidth="1.5"
                />
                {SONER.map((r) => {
                  const sel = selectedRegion === r.id;
                  const common = {
                    style: { cursor: "pointer" } as const,
                    fill: sel ? T.lime : T.panel3,
                    stroke: sel ? T.lime : T.borderS,
                    strokeWidth: 1.5,
                    onClick: () => {
                      setSelectedRegion(r.id);
                      if (r.id.endsWith("-h")) setSide("Høyre");
                      else if (r.id.endsWith("-v")) setSide("Venstre");
                      else setSide("Midt / begge");
                    },
                  };
                  if (r.type === "circle") {
                    return <circle key={r.id} cx={r.cx} cy={r.cy} r={r.r} {...common} />;
                  }
                  if (r.type === "ellipse") {
                    return <ellipse key={r.id} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} {...common} />;
                  }
                  return (
                    <rect
                      key={r.id}
                      x={r.cx - (r.w ?? 0) / 2}
                      y={r.cy - (r.h ?? 0) / 2}
                      width={r.w}
                      height={r.h}
                      rx="6"
                      {...common}
                    />
                  );
                })}
              </svg>
            </div>
          </Kort>

          <Kort eyebrow="Valgt område">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 12,
                background: T.panel2,
                border: `1px solid color-mix(in srgb, ${T.lime} 30%, transparent)`,
              }}
            >
              <span style={{ marginTop: 5, width: 9, height: 9, borderRadius: 9999, background: T.lime, flex: "none" }} />
              <div>
                <div style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg }}>
                  <em style={{ fontFamily: T.disp, fontStyle: "italic", color: T.lime }}>{side}</em>{" "}
                  {region?.label.toLowerCase()}
                </div>
                <Caps size={9} style={{ marginTop: 3 }}>{region?.label}</Caps>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <Caps size={9} style={{ marginBottom: 8 }}>Side *</Caps>
              <PillVelger
                options={[
                  { v: "Venstre", l: "Venstre" },
                  { v: "Høyre", l: "Høyre" },
                  { v: "Midt / begge", l: "Midt / begge" },
                ]}
                value={side}
                onChange={(v) => setSide(v as Side)}
              />
            </div>
          </Kort>
        </section>
      )}

      {/* STEG 2 — intensitet + varighet */}
      {step === 2 && (
        <section style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <StegHode
            eyebrow="Intensitet · varighet · steg 2"
            tittel="Hvor"
            em="vondt — og hvor lenge"
            sub="VAS-skalaen er 0–10 (0 = ingen smerte, 10 = verst tenkelig). Vær ærlig — coach og fysio bruker tallet til å prioritere oppfølging."
          />

          <Kort>
            <Glider label="Intensitet (VAS 0–10)" min={0} max={10} step={1} value={vas} onChange={setVas} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <Caps size={8.5}>Ingen smerte</Caps>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Caps size={8.5}>Verst tenkelig</Caps>
                <HjelpTips k="vas" size={11} />
              </span>
            </div>
          </Kort>

          <div>
            <Caps size={9} style={{ marginBottom: 8 }}>Varighet *</Caps>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <ValgKort tittel="Akutt" sub="Under 1 uke" valgt={varighet === "Akutt"} onClick={() => setVarighet("Akutt")} />
              <ValgKort tittel="Kronisk" sub="Over 1 uke" valgt={varighet === "Kronisk"} onClick={() => setVarighet("Kronisk")} />
            </div>
          </div>

          <div>
            <Caps size={9} style={{ marginBottom: 8 }}>Når kjenner du det? *</Caps>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(
                [
                  { id: "Kun trening" as const, desc: "Range / gym" },
                  { id: "Kun spill" as const, desc: "På banen" },
                  { id: "Alltid" as const, desc: "Også i hvile" },
                ]
              ).map((o) => (
                <ValgKort
                  key={o.id}
                  tittel={o.id}
                  tittelSuffix={o.desc}
                  valgt={occurence === o.id}
                  onClick={() => setOccurence(o.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STEG 3 — triggere + notat */}
      {step === 3 && (
        <section style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <StegHode
            eyebrow="Triggere · notat · steg 3"
            tittel="Hva"
            em="utløser"
            sub="Velg alle som passer — multivalg gir bedre mønstergjenkjenning over tid."
          />

          <div>
            <Caps size={9} style={{ marginBottom: 8 }}>Bevegelses-utløsere</Caps>
            <FilterChips
              items={MOVE_TRIGGERS}
              active={moveTriggers}
              onToggle={(t) => setMoveTriggers((p) => toggle(p, t))}
            />
          </div>

          <div>
            <Caps size={9} style={{ marginBottom: 8 }}>Tidspunkt på døgnet</Caps>
            <FilterChips
              items={TIME_TRIGGERS}
              active={timeTriggers}
              onToggle={(t) => setTimeTriggers((p) => toggle(p, t))}
            />
          </div>

          <div>
            <TekstOmraade
              label="Fritt notat (valgfritt)"
              value={note}
              rows={5}
              placeholder="Skriv kort hva du opplever — hjelper coach og fysio prioritere"
              onChange={(v) => setNote(v.slice(0, 500))}
            />
            <div style={{ textAlign: "right", fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4 }}>
              {note.length} / 500
            </div>
          </div>

          <Kort pad="14px 16px">
            <Bryter
              label="Be om time hos fysio"
              sub="Vi sender forespørsel til medisinsk team — de kontakter deg innen 24 t."
              checked={requestFysio}
              onChange={setRequestFysio}
            />
          </Kort>
        </section>
      )}

      {error && (
        <p
          role="alert"
          style={{
            fontFamily: T.ui,
            fontSize: 12.5,
            fontWeight: 500,
            color: T.down,
            background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`,
            borderRadius: 12,
            padding: "10px 14px",
            margin: 0,
          }}
        >
          {error}
        </p>
      )}

      {/* B: status-linje + én grønn Neste/Lagre full */}
      <div
        className="sticky bottom-[calc(84px+env(safe-area-inset-bottom))] md:bottom-4"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "12px",
          borderRadius: 16,
          background: T.panel,
          border: `1px solid ${T.border}`,
          boxShadow: "0 8px 24px color-mix(in srgb, " + T.fg + " 8%, transparent)",
        }}
      >
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: T.mono, fontSize: 10, color: T.mut, textAlign: "center" }}>
          {side} {region?.label.toLowerCase()} · VAS <strong style={{ color: T.fg }}>{vas}/10</strong>
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {step > 1 && (
            <Knapp ghost icon="arrow-left" disabled={pending} onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
              Tilbake
            </Knapp>
          )}
          <Knapp icon="arrow-right" full disabled={pending} onClick={next} style={{ minHeight: 44, flex: 1 }}>
            {step < 3 ? "Neste" : pending ? "Lagrer …" : "Lagre"}
          </Knapp>
        </div>
      </div>
    </div>
  );
}
