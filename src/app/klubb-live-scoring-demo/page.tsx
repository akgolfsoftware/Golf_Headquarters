/**
 * PILOT — Klubb Live-scoring (broadcast/leaderboard)
 * Bygd fra wireframe/design-files-v2/screens/10-klubb-live-scoring.html
 * URL: /klubb-live-scoring-demo
 *
 * Mørk full-screen broadcast-modus. Egenstendig surface — bruker ikke design-token-bakgrunn.
 */

import { ArrowUp, ArrowDown, Minus, X } from "lucide-react";

type ScoreClass = "under" | "even" | "plus1" | "plus2" | "plus4";

type Row = {
  pos: number;
  name: string;
  club: string;
  holes: string;
  score: string;
  scoreClass: ScoreClass;
  total: number;
  trend: number;
  trendDir: "up" | "down" | "flat";
  rowClass?: "top1" | "top2" | "top3";
};

const rows: Row[] = [
  { pos: 1, name: "Mads Rønning", club: "GFGK", holes: "18 / 18", score: "−4", scoreClass: "under", total: 68, trend: 2, trendDir: "up", rowClass: "top1" },
  { pos: 2, name: "Joachim Tangen", club: "Bossum", holes: "18 / 18", score: "−2", scoreClass: "under", total: 70, trend: 1, trendDir: "up", rowClass: "top2" },
  { pos: 3, name: "Anna Karlsen", club: "GFGK", holes: "17 / 18", score: "−1", scoreClass: "under", total: 71, trend: 2, trendDir: "up", rowClass: "top3" },
  { pos: 4, name: "Markus Roinås Pedersen", club: "GFGK", holes: "18 / 18", score: "E", scoreClass: "even", total: 72, trend: 0, trendDir: "flat" },
  { pos: 5, name: "Henrik Nilsen", club: "WANG", holes: "16 / 18", score: "+1", scoreClass: "plus1", total: 73, trend: -1, trendDir: "down" },
  { pos: 6, name: "Lise Sandberg", club: "GFGK", holes: "18 / 18", score: "+2", scoreClass: "plus2", total: 74, trend: -2, trendDir: "down" },
  { pos: 7, name: "Emma Sørensen", club: "Bossum", holes: "17 / 18", score: "+2", scoreClass: "plus2", total: 74, trend: 0, trendDir: "flat" },
  { pos: 8, name: "Sondre Bråten", club: "GFGK", holes: "16 / 18", score: "+2", scoreClass: "plus2", total: 74, trend: 1, trendDir: "up" },
  { pos: 9, name: "Ida Lund", club: "WANG", holes: "17 / 18", score: "+3", scoreClass: "plus2", total: 75, trend: -1, trendDir: "down" },
  { pos: 10, name: "Petter Aas", club: "GFGK", holes: "15 / 18", score: "+5", scoreClass: "plus4", total: 77, trend: -3, trendDir: "down" },
];

type StripItem = {
  hole: string;
  time: string;
  player: string;
  result: string;
  isPar?: boolean;
};

const stripItems: StripItem[] = [
  { hole: "Hull 18", time: "14:32", player: "Mads Rønning", result: "BIRDIE −1" },
  { hole: "Hull 17", time: "14:31", player: "Anna Karlsen", result: "BIRDIE −1" },
  { hole: "Hull 18", time: "14:30", player: "Markus Pedersen", result: "PAR", isPar: true },
  { hole: "Hull 16", time: "14:28", player: "Henrik Nilsen", result: "BOGEY +1" },
  { hole: "Hull 17", time: "14:26", player: "Emma Sørensen", result: "PAR", isPar: true },
];

function scoreColor(c: ScoreClass): string {
  if (c === "under") return "text-[var(--color-accent)]";
  if (c === "even") return "text-white";
  if (c === "plus1") return "text-[#F4C430]";
  if (c === "plus2") return "text-[#E89D2A]";
  return "text-[#E0584C]";
}

export default function KlubbLiveScoringDemo() {
  return (
    <div
      className="grid h-screen min-h-screen w-full grid-rows-[80px_1fr_88px] overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #14302A 0%, #0A1F18 70%)",
      }}
    >
      {/* Top */}
      <div className="flex items-center border-b border-white/10 px-12">
        <div className="flex flex-1 items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-accent font-display text-[14px] font-bold text-accent-foreground">
            GFGK
          </div>
          <div className="font-display text-[24px] font-bold leading-none -tracking-[0.02em]">
            GFGK <b className="font-bold">· Klubbmesterskap 2026</b>
            <span className="ml-2 font-medium text-white/55">Senior herrer</span>
          </div>
        </div>
        <div className="flex-none text-center font-mono text-[18px] tabular-nums tracking-[0.06em] text-white/85">
          <b className="mr-3.5 font-semibold text-white">Runde 2</b>
          14:32
        </div>
        <div className="flex flex-1 items-center justify-end gap-3.5">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-accent/40 bg-accent/15 px-3.5 py-2 font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
            <span
              className="h-2.5 w-2.5 rounded-full bg-accent"
              style={{ boxShadow: "0 0 0 5px rgba(209,248,67,0.20)" }}
            />
            Live
          </span>
          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white"
            aria-label="Avslutt visning"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="overflow-hidden px-12 pt-6 pb-4">
        <table className="w-full border-separate" style={{ borderSpacing: "0 6px" }}>
          <thead>
            <tr>
              <th className="border-b border-white/10 px-4 pb-2 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50" style={{ width: 80 }}>
                Pos
              </th>
              <th className="border-b border-white/10 px-4 pb-2 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Spiller
              </th>
              <th className="border-b border-white/10 px-4 pb-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50" style={{ width: 120 }}>
                Hull
              </th>
              <th className="border-b border-white/10 px-4 pb-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50" style={{ width: 120 }}>
                Score
              </th>
              <th className="border-b border-white/10 px-4 pb-2 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50" style={{ width: 120 }}>
                Total
              </th>
              <th className="border-b border-white/10 px-4 pb-2 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50" style={{ width: 160 }}>
                Trend · 3 hull
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isTop1 = r.rowClass === "top1";
              const isTop23 = r.rowClass === "top2" || r.rowClass === "top3";
              const rowBg = isTop1
                ? "bg-accent/10"
                : isTop23
                  ? "bg-white/[0.05]"
                  : "bg-white/[0.03]";
              const borderCol = isTop1 ? "border-accent/20" : "border-white/5";
              return (
                <tr key={r.pos} className={rowBg}>
                  <td
                    className={`rounded-l-md border border-r-0 ${borderCol} px-4 py-3.5 ${
                      isTop1 ? "border-l-[3px] border-l-accent/40" : ""
                    }`}
                  >
                    <div
                      className={`w-14 text-left font-mono text-[28px] tabular-nums ${
                        isTop1 ? "text-accent" : "text-white/90"
                      }`}
                    >
                      {r.pos}.
                    </div>
                  </td>
                  <td className={`border-y ${borderCol} px-4 py-3.5`}>
                    <div className={`text-[22px] leading-tight ${isTop1 ? "font-semibold" : "font-medium"}`}>
                      {r.name}
                    </div>
                    <div className="mt-1 text-[14px] text-white/55">{r.club}</div>
                  </td>
                  <td className={`border-y ${borderCol} px-4 py-3.5`}>
                    <div className="text-center font-mono text-[18px] tabular-nums text-white/80">
                      {r.holes}
                    </div>
                  </td>
                  <td className={`border-y ${borderCol} px-4 py-3.5`}>
                    <div className={`text-center font-mono text-[26px] tabular-nums ${scoreColor(r.scoreClass)}`}>
                      {r.score}
                    </div>
                  </td>
                  <td className={`border-y ${borderCol} px-4 py-3.5`}>
                    <div
                      className={`text-right font-mono text-[26px] font-semibold tabular-nums ${
                        isTop1 ? "text-accent" : "text-white"
                      }`}
                    >
                      {r.total}
                    </div>
                  </td>
                  <td className={`rounded-r-md border border-l-0 ${borderCol} px-4 py-3.5`}>
                    <div
                      className={`inline-flex w-full items-center justify-end gap-1.5 font-mono text-[14px] tabular-nums ${
                        r.trendDir === "up"
                          ? "text-accent"
                          : r.trendDir === "down"
                            ? "text-[#E0584C]"
                            : "text-white/65"
                      }`}
                    >
                      {r.trendDir === "up" && <ArrowUp size={14} strokeWidth={2} />}
                      {r.trendDir === "down" && <ArrowDown size={14} strokeWidth={2} />}
                      {r.trendDir === "flat" && <Minus size={14} strokeWidth={2} />}
                      {r.trend > 0 ? `+${r.trend}` : r.trend === 0 ? "0" : r.trend}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Strip */}
      <div className="flex items-center border-t border-white/10 bg-black/40">
        <div className="flex h-22 flex-none items-center gap-2.5 border-r border-white/10 bg-accent/[0.06] px-6 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
          <span
            className="h-2 w-2 rounded-full bg-accent"
            style={{ boxShadow: "0 0 0 4px rgba(209,248,67,0.18)" }}
          />
          Siste hull
        </div>
        <div
          className="flex h-22 flex-1 items-center overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent 0, #000 4%, #000 96%, transparent 100%)",
          }}
        >
          {stripItems.map((it, i) => (
            <div
              key={i}
              className="flex h-full min-w-[320px] flex-none flex-col justify-center border-r border-white/[0.06] px-7"
            >
              <div className="inline-flex items-baseline gap-2.5">
                <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.08em] text-white/55">
                  {it.hole}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-white/40">{it.time}</span>
              </div>
              <div className="mt-1.5 text-[18px] font-medium leading-[1.2]">
                {it.player}{" "}
                <b
                  className={`ml-1 font-mono font-semibold ${
                    it.isPar ? "text-white" : "text-accent"
                  }`}
                >
                  {it.result}
                </b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
