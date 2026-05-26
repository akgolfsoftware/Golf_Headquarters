import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PillKind = "ok" | "warn" | "danger" | "accent" | "forest" | "muted" | "tier";
type PillDot = "d-ok" | "d-warn" | "d-danger" | "d-pulse";

export function HubPill({ kind, dot, children }: { kind: PillKind; dot?: PillDot; children: ReactNode }) {
  return (
    <span className={`hub-pill p-${kind}`}>
      {dot ? <span className={cn("hub-pill-dot", dot)} /> : null}
      {children}
    </span>
  );
}

export function HubKpiBar({ pct, tone = "ok" }: { pct: number; tone?: "ok" | "warn" | "err" }) {
  return (
    <div className="kpi-bar">
      <div className="kpi-bar-track">
        <div className={cn("kpi-bar-fill", `t-${tone}`)} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <span className="kpi-bar-label">{pct}%</span>
    </div>
  );
}

export function HubProgress({ done, total, tone = "ok" }: { done: number; total: number; tone?: "ok" | "warn" }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="hubprog">
      <div className="hubprog-row">
        <span className="hubprog-fig">
          {done}
          <span>/{total}</span>
        </span>
        <span className="hubprog-pct">{pct}%</span>
      </div>
      <div className="hubprog-track">
        <div className={cn("hubprog-fill", `t-${tone}`)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function PyramidMini() {
  const bars = [
    { lbl: "Fys", pct: 18, c: "hsl(var(--primary))" },
    { lbl: "Tek", pct: 32, c: "hsl(var(--primary))" },
    { lbl: "Slag", pct: 28, c: "hsl(var(--success))" },
    { lbl: "Spill", pct: 14, c: "hsl(var(--accent))" },
    { lbl: "Turn", pct: 8, c: "#C8B72A" },
  ];
  return (
    <div className="pyr-mini">
      {bars.map((b) => (
        <div className="pyr-mini-row" key={b.lbl}>
          <span className="pyr-mini-lbl">{b.lbl}</span>
          <span className="pyr-mini-bar">
            <span style={{ width: `${b.pct * 2.4}%`, background: b.c }} />
          </span>
          <span className="pyr-mini-pct">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export function HubSparkline({ variant = "up" }: { variant?: "up" | "down" }) {
  const path = variant === "up"
    ? "M2 18 L14 16 L26 19 L38 12 L50 14 L62 8 L74 11 L86 6"
    : "M2 6 L14 11 L26 8 L38 14 L50 12 L62 19 L74 16 L86 22";
  const dotY = variant === "up" ? 6 : 22;
  return (
    <svg className="spk" viewBox="0 0 90 28" width="90" height="28" preserveAspectRatio="none" aria-hidden>
      <path d={path} stroke="#005840" strokeWidth="1.6" fill="none" />
      <circle cx="86" cy={dotY} r="2.6" fill="#D1F843" stroke="#005840" strokeWidth="1.4" />
    </svg>
  );
}

export function NextTourn({ when, where, count }: { when: string; where: string; count: string }) {
  return (
    <div className="next-tourn">
      <span className="nt-when">{when}</span>
      <span className="nt-where">{where}</span>
      <span className="nt-cnt">{count}</span>
    </div>
  );
}

const WEEK_LABELS = ["ma", "ti", "on", "to", "fr", "lø", "sø"];

export function WeekStrip({ onDays = [], meDay }: { onDays?: number[]; meDay?: number }) {
  return (
    <div className="wk-strip">
      {WEEK_LABELS.map((d, i) => (
        <span key={d} className={cn("wk-cell", onDays.includes(i) ? "on" : "off", i === meDay && "me")}>
          <span className="wk-d">{d}</span>
        </span>
      ))}
    </div>
  );
}

export function CalMini({ marked = [0, 2], nowPct = 38 }: { marked?: number[]; nowPct?: number }) {
  return (
    <div className="cal-mini">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={cn("cm-tick", marked.includes(i) && "m")} />
      ))}
      <span className="cm-now" style={{ left: `${nowPct}%` }} />
    </div>
  );
}

export function TeamStrip({ avatars }: { avatars: { n: string; c: string }[] }) {
  return (
    <div className="team-strip">
      {avatars.map((p, i) => (
        <span key={i} className={cn("team-av", p.c)}>
          {p.n}
        </span>
      ))}
    </div>
  );
}

export function IntStrip({ pills }: { pills: { name: string; on: boolean }[] }) {
  return (
    <div className="int-strip">
      {pills.map((p) => (
        <span key={p.name} className={cn("int-pill", p.on ? "on" : "off")}>
          {p.name}
        </span>
      ))}
    </div>
  );
}

export function BagStrip({ clubs }: { clubs: string[] }) {
  return (
    <div className="bag-strip">
      {clubs.map((c, i) => (
        <span key={i} className="bag-club">
          {c}
        </span>
      ))}
    </div>
  );
}
