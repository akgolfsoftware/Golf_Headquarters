"use client";

/**
 * PlayerHQ · Break-tabell — v2 Presis + B-pakke (referanse først, én aktiv variant).
 * Matte fra putt-core. T.* only (color-mix over T.forest).
 */

import { Fragment, useState } from "react";
import * as C from "@/lib/putt-core";
import { T, Caps, Tittel, Kort, HjelpTips } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

// ─── Lokale data (uendret fra legacy) ────────────────────────────────────────
const FOOT = ["1,3 fot", "5 fot", "6,6 fot", "8,2 fot", "9,8 fot", "13,1 fot", "16,4 fot", "19,7 fot"];
const GMAX = 125;
const GRADES = [
  { l: "Bratt ned", pct: 2, dir: +1 },
  { l: "Ned", pct: 1, dir: +1 },
  { l: "Flatt", pct: 0, dir: 0 },
  { l: "Opp", pct: 1, dir: -1 },
  { l: "Bratt opp", pct: 2, dir: -1 },
] as const;
const SPEED_FILL = [
  `color-mix(in srgb, ${T.forest} 38%, transparent)`,
  `color-mix(in srgb, ${T.forest} 60%, transparent)`,
  `color-mix(in srgb, ${T.forest} 86%, transparent)`,
];

function rateFor(stimp: number) { return stimp >= 11 ? 2.0 : 1.5; }

function heat(v: number) {
  const t = Math.pow(v / GMAX, 0.42);
  const a = 0.05 + t * 0.82;
  return {
    bg: `color-mix(in srgb, ${T.forest} ${Math.round(a * 100)}%, transparent)`,
    fg: a > 0.46 ? "rgba(255,255,255,0.95)" : T.fg,
  };
}

// ─── Delte kontroller ────────────────────────────────────────────────────────
function CtrlLabel({ children }: { children: React.ReactNode }) {
  return <Caps size={9} style={{ marginBottom: 8 }}>{children}</Caps>;
}

/* Enkeltvalg-segmenter — PillVelger-idiomet, men med flexWrap slik at
   8-elements lengdelister ikke sprenger mobilbredden. */
function Seg({ items, active, onPick }: { items: string[]; active: number; onPick: (i: number) => void }) {
  return (
    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 3, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 3 }}>
      {items.map((item, i) => {
        const on = i === active;
        return (
          <button
            key={i}
            className="v2-press v2-focus"
            onClick={() => onPick(i)}
            aria-pressed={on}
            style={{ appearance: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", padding: "7px 12px", borderRadius: 9, whiteSpace: "nowrap", background: on ? T.fg : "transparent", color: on ? T.bg : T.fg2, border: "none" }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function VHead({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap", marginBottom: 4 }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.onLime, background: T.lime, borderRadius: 7, padding: "5px 10px", whiteSpace: "nowrap" }}>
        {num}
      </span>
      <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em", color: T.fg }}>{title}</span>
      <span className="hidden md:block" style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10.5, color: T.mut, textAlign: "right", lineHeight: 1.6, maxWidth: 320 }}>
        {desc}
      </span>
    </div>
  );
}

// ─── Variant 1: Komplett matrise ─────────────────────────────────────────────
function MatriksView() {
  return (
    <div>
      <VHead num="Variant 01" title="Komplett matrise" desc="Hele veggkartet · AgencyOS-referanse. Fyll koder break-mengde." />
      <Kort>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
          {C.LEN.map((L, li) => (
            <LenBlock key={li} L={L} foot={FOOT[li]} />
          ))}
          <RefCard />
        </div>
        <HeatLegend />
      </Kort>
    </div>
  );
}

function LenBlock({ L, foot }: { L: C.LenEntry; foot: string }) {
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", background: T.panel2 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "9px 12px", background: T.panel3, borderBottom: `3px solid ${T.lime}` }}>
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{L.m}</span>
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: T.mut }}>{foot}</span>
        <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: T.mut }}>stimp →</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "50px repeat(3, 1fr)", gap: 1, background: T.border }}>
        <div style={{ background: T.panel3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, padding: "6px 0" }}>cm</div>
        {C.SPEEDS.map((s) => (
          <div key={s} style={{ background: T.panel3, textAlign: "center", fontFamily: T.mono, fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg, padding: "6px 0" }}>{s}</div>
        ))}
        {L.grid.map((row, si) => (
          <Fragment key={si}>
            <div style={{ background: T.panel2, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg2, paddingTop: 6, paddingBottom: 6 }}>
              {C.SLOPES[si]}
            </div>
            {row.map((v, vi) => {
              const h = heat(v);
              return (
                <div
                  key={`v-${si}-${vi}`}
                  style={{ textAlign: "center", fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", padding: "6px 0", background: h.bg, color: h.fg }}
                >
                  {v}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function RefCard() {
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", background: T.panel2, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: T.forest, borderBottom: `3px solid ${T.lime}` }}>
        <Icon name="ruler" size={14} style={{ color: T.lime }} />
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: "rgba(255,255,255,0.95)" }}>Referanse</span>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <RefRow icon="circle-dot" label="Hullkant" value="5,4 cm" />
        <RefRow icon="circle" label="Ball" value="4,0 cm" />
        <RefRow icon="footprints" label="Fot (str. 42)" value="30 cm" />
        <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
        <RefNote heading="Raske greener · stimp 11–13" body={<>1 % nedover/oppover gir ca. <strong style={{ color: T.fg, fontWeight: 700 }}>±2 på stimpen</strong>.</>} />
        <RefNote heading="Trege greener · stimp 8–10" body={<>2 % nedover/oppover gir ca. <strong style={{ color: T.fg, fontWeight: 700 }}>±3 på stimpen</strong>.</>} />
      </div>
    </div>
  );
}

function RefRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon name={icon} size={14} style={{ color: T.mut }} />
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>{label}</span>
      <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg }}>{value}</span>
    </div>
  );
}

function RefNote({ heading, body }: { heading: string; body: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Caps size={9} color={T.lime}>{heading}</Caps>
      <span style={{ fontFamily: T.ui, fontSize: 12, lineHeight: 1.5, color: T.mut }}>{body}</span>
    </div>
  );
}

function HeatLegend() {
  const stops = [2, 8, 20, 40, 70, 110];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <Caps size={9}>Fyll = break</Caps>
        <HjelpTips k="break" size={11} />
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>lite</span>
      <div style={{ display: "flex", height: 12, width: 200, borderRadius: 9999, overflow: "hidden", border: `1px solid ${T.border}` }}>
        {stops.map((v) => (
          <span key={v} style={{ flex: 1, background: heat(v).bg }} />
        ))}
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>mye</span>
      <span className="hidden sm:block" style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, color: T.mut }}>
        Skala er global — 6 m brekker dramatisk mer enn 1 m.
      </span>
    </div>
  );
}

// ─── Variant 2: Break-kalkulator ─────────────────────────────────────────────
function KalkulatorView() {
  const [len, setLen] = useState(4);
  const [slope, setSlope] = useState(3);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [gradeIdx, setGradeIdx] = useState(2);

  const base = C.SPEEDS[speedIdx];
  const g = GRADES[gradeIdx];
  const flat = C.LEN[len].grid[slope][speedIdx];
  const effStimp = base + g.dir * rateFor(base) * g.pct;
  const adj = g.dir === 0 ? flat : Math.round(C.breakAtStimp(len, slope, effStimp));
  const dCm = adj - flat;
  const dPct = flat ? Math.round((dCm / flat) * 100) : 0;

  return (
    <div>
      <VHead num="Variant 02" title="Break-kalkulator" desc="PlayerHQ-verktøy · velg situasjonen — inkl. opp/ned-fart — få ett tall og siktebildet." />
      <Kort>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "stretch" }}>
          {/* Kontroller */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div><CtrlLabel>Lengde</CtrlLabel><Seg items={C.LEN.map((l) => l.m)} active={len} onPick={setLen} /></div>
            <div><CtrlLabel>Fall</CtrlLabel><Seg items={C.SLOPES} active={slope} onPick={setSlope} /></div>
            <div><CtrlLabel>Greenhastighet · stimp <HjelpTips k="stimp" size={11} /></CtrlLabel><Seg items={C.SPEEDS.map(String)} active={speedIdx} onPick={setSpeedIdx} /></div>
            <div><CtrlLabel>Lengdehelning · opp / ned</CtrlLabel><Seg items={GRADES.map((x) => x.l)} active={gradeIdx} onPick={setGradeIdx} /></div>
            <AimDiagram lenCm={C.LEN[len].cm} breakCm={adj} />
          </div>

          {/* Svar-panel */}
          <div style={{ background: T.forest, borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <Caps size={10} color={T.lime}>Sikt utenfor hullet</Caps>
            <div style={{ fontFamily: T.mono, fontWeight: 700, lineHeight: 0.9, letterSpacing: "-0.04em", fontSize: 76, color: "rgba(255,255,255,0.96)", fontVariantNumeric: "tabular-nums", marginTop: 10 }}>
              {adj}
              <span style={{ fontSize: 28, fontWeight: 600, color: T.lime }}>&#8239;cm</span>
            </div>
            <DeltaBadge dCm={dCm} dPct={dPct} dir={g.dir} />
            <div style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.82)", letterSpacing: "0.02em", marginTop: 12 }}>
              {C.LEN[len].m} · {C.SLOPES[slope]} fall · stimp {base}
              {g.dir !== 0 ? ` · ${g.dir > 0 ? "ned" : "opp"} ${C.nb(g.pct)} %` : ""}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.lime, fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", marginTop: 8 }}>
              <Icon name="arrow-up-right" size={13} strokeWidth={2.5} />
              på høysiden
            </div>
            <EffText base={base} g={g} effStimp={effStimp} />
            <div style={{ marginTop: "auto", paddingTop: 18, display: "flex", gap: 24 }}>
              <ConvBlock n={C.comma1(adj / C.BALL_CM)} label="ballbredder" />
              <ConvBlock n={C.comma1(adj / C.HOLE_CM)} label="hullbredder" />
            </div>
          </div>
        </div>
      </Kort>
    </div>
  );
}

function DeltaBadge({ dCm, dPct, dir }: { dCm: number; dPct: number; dir: number }) {
  const felles: React.CSSProperties = { marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 12px", borderRadius: 9999, fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.02em", alignSelf: "flex-start" };
  if (dir === 0) {
    return (
      <div style={{ ...felles, background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.7)" }}>
        <Icon name="minus" size={13} strokeWidth={2.5} />flat putt · ingen fart-justering
      </div>
    );
  }
  if (dCm >= 0) {
    return (
      <div style={{ ...felles, background: T.lime, color: T.onLime }}>
        <Icon name="trending-up" size={13} strokeWidth={2.5} />+{dCm} cm · +{dPct} % vs flatt
      </div>
    );
  }
  return (
    <div style={{ ...felles, background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.95)" }}>
      <Icon name="trending-down" size={13} strokeWidth={2.5} />{dCm} cm · {dPct} % vs flatt
    </div>
  );
}

function EffText({ base, g, effStimp }: { base: number; g: (typeof GRADES)[number]; effStimp: number }) {
  const stil: React.CSSProperties = { marginTop: 12, fontFamily: T.mono, fontSize: 11, fontWeight: 600, lineHeight: 1.6, color: "rgba(255,255,255,0.62)", letterSpacing: "0.01em" };
  if (g.dir === 0) {
    return (
      <p style={stil}>
        Flat green spiller på oppgitt fart — stimp <strong style={{ color: T.lime, fontWeight: 700 }}>{base}</strong>.
      </p>
    );
  }
  const dirWord = g.dir > 0 ? "Nedover gjør greenen raskere" : "Oppover gjør greenen tregere";
  const ruleText = base >= 11 ? "1 % ≈ ±2" : "2 % ≈ ±3";
  return (
    <p style={stil}>
      {dirWord}: spiller som stimp <strong style={{ color: T.lime, fontWeight: 700 }}>{C.comma1(effStimp)}</strong>. ({ruleText} på stimpen.)
    </p>
  );
}

function ConvBlock({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontFamily: T.mono, fontSize: 21, fontWeight: 700, color: "rgba(255,255,255,0.96)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{n}</span>
      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>{label}</span>
    </div>
  );
}

function AimDiagram({ lenCm, breakCm }: { lenCm: number; breakCm: number }) {
  const W = 360, H = 300, padY = 38;
  const ballY = H - padY, holeY = padY, cx = 215;
  const pxPerCm = (ballY - holeY) / lenCm;
  const rawBreakPx = breakCm * pxPerCm;
  const breakPx = Math.max(6, Math.min(rawBreakPx, 150));
  const holeX = cx - breakPx;

  return (
    <div>
      <CtrlLabel>Siktebilde</CtrlLabel>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, background: T.panel2, padding: 12, display: "flex", justifyContent: "center" }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Siktebilde" style={{ display: "block", width: "100%", maxWidth: 320, height: "auto" }}>
          <line x1={cx} y1={ballY} x2={holeX} y2={holeY} stroke={T.borderS} strokeWidth="2" strokeDasharray="2 5" />
          <line x1={cx} y1={holeY} x2={holeX} y2={holeY} stroke={T.mut} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={cx} y1={ballY} x2={cx} y2={holeY} stroke={T.lime} strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
          <path d={`M ${cx} ${ballY} Q ${cx} ${holeY} ${holeX} ${holeY}`} fill="none" stroke={T.forest} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={holeX} cy={holeY} r="10" fill="none" stroke={T.fg} strokeWidth="2" />
          <circle cx={holeX} cy={holeY} r="3" fill={T.fg} />
          <circle cx={cx} cy={holeY} r="6" fill={T.lime} stroke={T.forest} strokeWidth="1.5" />
          <circle cx={cx} cy={ballY} r="5" fill={T.forest} stroke={T.borderS} strokeWidth="1" />
          <text x={(cx + holeX) / 2} y={holeY - 10} textAnchor="middle" fontSize="12" fontWeight="800" fill={T.fg} fontFamily="JetBrains Mono, monospace">{breakCm} cm</text>
          <text x={cx} y={ballY + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill={T.mut} fontFamily="JetBrains Mono, monospace">BALL</text>
          <text x={holeX} y={holeY + 24} textAnchor="middle" fontSize="10" fontWeight="700" fill={T.mut} fontFamily="JetBrains Mono, monospace">HULL</text>
          <text x={cx} y={holeY - 26} textAnchor="middle" fontSize="9" fontWeight="700" fill={T.lime} fontFamily="JetBrains Mono, monospace">SIKT</text>
        </svg>
      </div>
      <p style={{ margin: "8px 0 0", fontFamily: T.mono, fontSize: 10, color: T.mut, textAlign: "center", letterSpacing: "0.02em" }}>
        Sikt {breakCm} cm til høyre for hullet — la putten falle inn fra høysiden.
      </p>
    </div>
  );
}

// ─── Variant 3: Hastighets-sammenligning ─────────────────────────────────────
function SammenligningView() {
  const [len, setLen] = useState(4);
  const L = C.LEN[len];
  const localMax = Math.max(...L.grid.flat());
  const slow = L.grid[3][0], fast = L.grid[3][2];
  const speedPct = Math.round((fast / slow - 1) * 100);
  const growth = L.grid[5][1] / L.grid[0][1];

  return (
    <div>
      <VHead num="Variant 03" title="Hastighets-sammenligning" desc="Én lengde · hvordan greenfart forsterker breaken på hvert fall." />
      <Kort>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <CtrlLabel>Lengde</CtrlLabel>
            <Seg items={C.LEN.map((l) => l.m)} active={len} onPick={setLen} />
          </div>
          <p style={{ flex: 1, minWidth: 280, fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.6, color: T.fg, margin: 0 }}>
            På <strong>{L.m}</strong> legger en rask green (stimp 12) på{" "}
            <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.lime, fontVariantNumeric: "tabular-nums" }}>~{speedPct} %</span>{" "}
            mer break enn en treg (stimp 8) ved samme fall. Fra 0,5 % til 3 % fall{" "}
            <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.lime, fontVariantNumeric: "tabular-nums" }}>{C.comma1(growth)}×</span>-er utslaget.
          </p>
        </div>
        <div>
          {L.grid.map((row, si) => (
            <div key={si} style={{ display: "grid", gridTemplateColumns: "64px 1fr", alignItems: "center", gap: 14, padding: "10px 0", borderTop: si > 0 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg }}>{C.SLOPES[si]}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {row.map((v, sp) => {
                  const w = Math.max(3, Math.round((v / localMax) * 100));
                  return (
                    <div key={sp} style={{ display: "grid", gridTemplateColumns: "56px 1fr 56px", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>
                        Stimp {C.SPEEDS[sp]}
                      </span>
                      <div style={{ height: 12, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
                        <div style={{ width: `${w}%`, height: "100%", borderRadius: 9999, background: SPEED_FILL[sp], transition: `width 300ms ${T.ease}` }} />
                      </div>
                      <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg, textAlign: "right" }}>{v} cm</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          <Caps size={9}>Mørkere = raskere green</Caps>
          {([["Stimp 8 · treg", 0], ["Stimp 10", 1], ["Stimp 12 · rask", 2]] as [string, number][]).map(([label, i]) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg }}>
              <span style={{ display: "inline-block", width: 20, height: 10, borderRadius: 9999, background: SPEED_FILL[i] }} />
              {label}
            </span>
          ))}
        </div>
      </Kort>
    </div>
  );
}

// ─── Hovedskjerm ─────────────────────────────────────────────────────────────
export function BreakTabellV2() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Header */}
      <div>
        <Caps>PlayerHQ · Green-lesing</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>
            Hvor mye <em style={{ fontStyle: "italic", color: T.lime }}>brekker</em> putten?
          </Tittel>
        </div>
        <p style={{ margin: "12px 0 0", maxWidth: "64ch", fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.6, color: T.mut }}>
          Centimeter å sikte{" "}
          <strong style={{ color: T.fg, fontWeight: 600 }}>utenfor hullet, på høysiden</strong>{" "}
          — som funksjon av lengde, fall og greenhastighet (stimp). Samme referansetabell, tre måter å lese den på.
        </p>
      </div>

      <MatriksView />
      <KalkulatorView />
      <SammenligningView />

      <p style={{ margin: 0, paddingTop: 14, borderTop: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 10, color: T.mut, lineHeight: 1.7, letterSpacing: "0.02em" }}>
        <strong style={{ color: T.fg, fontWeight: 700 }}>Lesing:</strong> Tallene er centimeter å sikte på høysiden av hullet. Stimp = greenhastighet (høyere = raskere). Avlesningene gjelder en jevn, ensartet helling — les alltid det reelle fallet på stedet.{" "}
        <strong style={{ color: T.fg, fontWeight: 700 }}>Referanse:</strong> hullkant 5,4 cm · ball 4,0 cm · fot (str. 42) ≈ 30 cm.
      </p>
    </div>
  );
}
