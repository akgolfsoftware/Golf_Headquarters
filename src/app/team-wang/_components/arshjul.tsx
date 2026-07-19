"use client";

// Årshjul — SVG-donut portert fra designets buildWheel(). Klikkbare måneder,
// periodefarge per segment, turneringsmerker på ytterkanten, «nå»-visning i
// senteret. Deterministisk: «nå»-vinkelen kommer fra naaIso (Oslo-korrekt,
// beregnet klient-side i skallet).

import {
  COMPS,
  MONTH_ORDER,
  MON_SHORT,
  PERIOD_COL,
  monthInfo,
  monthPk,
} from "../_data/wang-plan";

const SIZE = 360;
const CX = 180;
const CY = 180;
const R_OUT = 150;
const R_IN = 104;

function pol(r: number, ang: number): [number, number] {
  const a = ((ang - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function arc(ro: number, ri: number, a0: number, a1: number): string {
  const p1 = pol(ro, a0);
  const p2 = pol(ro, a1);
  const p3 = pol(ri, a1);
  const p4 = pol(ri, a0);
  return `M${p1[0]} ${p1[1]} A${ro} ${ro} 0 0 1 ${p2[0]} ${p2[1]} L${p3[0]} ${p3[1]} A${ri} ${ri} 0 0 0 ${p4[0]} ${p4[1]} Z`;
}

export function Arshjul({
  selMonth,
  naaIso,
  onSelect,
}: {
  selMonth: string; // "år-måned", f.eks "2026-10"
  naaIso: string;
  onSelect: (m: number, y: number) => void;
}) {
  const now = new Date(naaIso + "T12:00:00");
  const [selY, selM] = selMonth.split("-").map(Number);
  const info = monthInfo(selM, selY, naaIso);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ width: "100%", maxWidth: 380, height: "auto", display: "block", margin: "0 auto", overflow: "visible" }}
      role="img"
      aria-label={`Årshjul – valgt måned ${info.name} ${info.year}`}
    >
      {MONTH_ORDER.map((mo, k) => {
        const key = `${mo[1]}-${mo[0]}`;
        const isSel = key === selMonth;
        const gap = 1.8;
        const a0 = k * 30 + gap;
        const a1 = (k + 1) * 30 - gap;
        const pk = monthPk(mo[0], mo[1]);
        const col = PERIOD_COL[pk];
        const ro = isSel ? R_OUT + 9 : R_OUT;
        const lp = pol((isSel ? R_OUT + 9 + R_IN : R_OUT + R_IN) / 2, (a0 + a1) / 2);
        const nm = MON_SHORT[mo[0]];
        const handler = () => onSelect(mo[0], mo[1]);
        return (
          <g key={key}>
            <path
              d={arc(ro, R_IN, a0, a1)}
              fill={col}
              opacity={pk === "pause" ? (isSel ? 0.7 : 0.4) : isSel ? 1 : 0.82}
              stroke={isSel ? "var(--white)" : "transparent"}
              strokeWidth={isSel ? 2.5 : 0}
              onClick={handler}
              style={{ cursor: "pointer", transition: "opacity .18s ease" }}
            />
            <text
              x={lp[0]}
              y={lp[1]}
              textAnchor="middle"
              dominantBaseline="middle"
              onClick={handler}
              style={{
                cursor: "pointer",
                fontFamily: "var(--font-brand)",
                fontWeight: isSel ? 800 : 600,
                fontSize: isSel ? "12.5px" : "11px",
                fill: pk === "pause" && !isSel ? "var(--text-secondary)" : "var(--white)",
                pointerEvents: "none",
              }}
            >
              {nm.charAt(0).toUpperCase() + nm.slice(1)}
            </text>
          </g>
        );
      })}

      {COMPS.map((c, i) => {
        const cd = new Date(c.iso + "T12:00:00");
        const idx = MONTH_ORDER.findIndex((o) => o[0] === cd.getMonth() && o[1] === cd.getFullYear());
        if (idx < 0) return null;
        const ang = (idx + (cd.getDate() - 1) / 31) * 30;
        const p = pol(R_OUT + 18, ang);
        return (
          <circle key={`c${i}`} cx={p[0]} cy={p[1]} r={4} fill="var(--cat-orange)" stroke="var(--surface-card)" strokeWidth={2} />
        );
      })}

      {(() => {
        const idx = MONTH_ORDER.findIndex((o) => o[0] === now.getMonth() && o[1] === now.getFullYear());
        if (idx < 0) return null;
        const nIdx = idx + (now.getDate() - 1) / 31;
        const np = pol(R_IN - 2, nIdx * 30);
        return <line x1={CX} y1={CY} x2={np[0]} y2={np[1]} stroke="var(--wang-navy)" strokeWidth={2.5} strokeLinecap="round" opacity={0.35} />;
      })()}

      <circle cx={CX} cy={CY} r={R_IN - 10} fill="var(--surface-card)" />
      <circle cx={CX} cy={CY} r={R_IN - 10} fill="none" stroke={info.periodColor} strokeWidth={2} opacity={0.5} />
      <text x={CX} y={CY - 34} textAnchor="middle" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "9.5px", letterSpacing: "0.12em", textTransform: "uppercase", fill: info.periodColor }}>
        {info.isNow ? "NÅ · " + info.periodShort : info.periodShort}
      </text>
      <text x={CX} y={CY - 8} textAnchor="middle" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "21px", fill: "var(--text-primary)" }}>
        {info.name}
      </text>
      <text x={CX} y={CY + 11} textAnchor="middle" style={{ fontFamily: "var(--font-body)", fontSize: "11px", fill: "var(--text-secondary)" }}>
        {info.year}
      </text>
      <text x={CX} y={CY + 38} textAnchor="middle" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "17px", fill: "var(--text-primary)" }}>
        {info.sessionCount} økter
      </text>
    </svg>
  );
}
