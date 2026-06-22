"use client";

import { ArrowUp, ArrowDown, Minus, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CellState = "over" | "near" | "under" | "untested" | "testing";

export type MatrixCellData = {
  state: CellState;
  value: string;
  delta?: { dir: "up" | "down" | "flat"; text: string };
  when: string;
  overdue?: boolean;
};

export type TestColumn = {
  key: string;
  name: string;
  unit: string;
  goal: string;
  axis: "fys" | "tek" | "slag" | "spill" | "turn";
};

export type MatrixPlayer = {
  id: string;
  initials: string;
  name: string;
  group: "WANG" | "GFGK" | "AKA";
  sub: string;
  avatarClass?: string;
  assign?: { label: string; badge?: number; done?: boolean };
};

const cellCls: Record<CellState, string> = {
  over: "bg-success/10 text-success",
  near: "bg-warning/15 text-warning-foreground",
  under: "bg-destructive/10 text-destructive",
  untested: "bg-secondary text-muted-foreground",
  testing: "bg-accent/15 text-primary motion-safe:animate-pulse",
};

const axisDot = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
} as const;

const grpCls = {
  WANG: "bg-secondary text-muted-foreground",
  GFGK: "bg-pyr-fys-track text-success-foreground",
  AKA: "bg-accent text-primary",
} as const;

export function LegendStrip({ className }: { className?: string }) {
  const items: { cls: string; label: string }[] = [
    { cls: "bg-success", label: "Over mål" },
    { cls: "bg-warning", label: "Nær mål" },
    { cls: "bg-destructive", label: "Under mål" },
    { cls: "bg-muted-foreground", label: "Ikke testet" },
    { cls: "bg-accent", label: "Pågår nå" },
  ];
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          <span className={cn("h-2 w-2 rounded-[3px]", i.cls)} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function TestMatrix({
  columns,
  players,
  cell,
  onAssign,
  onCellClick,
  className,
}: {
  columns: TestColumn[];
  players: MatrixPlayer[];
  cell: (playerId: string, colKey: string) => MatrixCellData | undefined;
  onAssign?: (playerId: string) => void;
  onCellClick?: (playerId: string, colKey: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-card px-3 py-2.5 text-left align-bottom">
              <span className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">Spiller</span>
            </th>
            {columns.map((c) => (
              <th key={c.key} className="px-2 py-2.5 align-bottom">
                <div className="flex flex-col items-start gap-0.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", axisDot[c.axis])} />
                  <span className="text-[11px] font-bold leading-tight text-foreground">{c.name}</span>
                  <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{c.unit}</span>
                  <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.08em] text-primary">{c.goal}</span>
                </div>
              </th>
            ))}
            <th className="px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0">
              <td className="sticky left-0 z-10 bg-card px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full font-display text-[11px] font-bold", p.avatarClass ?? "bg-secondary text-foreground")}>
                    {p.initials}
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("rounded-[3px] px-[5px] py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]", grpCls[p.group])}>{p.group}</span>
                      <span className="text-xs font-bold text-foreground">{p.name}</span>
                    </span>
                    <span className="mt-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{p.sub}</span>
                  </div>
                </div>
              </td>
              {columns.map((c) => {
                const d = cell(p.id, c.key);
                if (!d) return <td key={c.key} className="px-1.5 py-1.5" />;
                const DeltaIcon = d.delta?.dir === "up" ? ArrowUp : d.delta?.dir === "down" ? ArrowDown : Minus;
                return (
                  <td key={c.key} className="px-1.5 py-1.5">
                    <button
                      type="button"
                      onClick={() => onCellClick?.(p.id, c.key)}
                      className={cn(
                        "relative flex w-full flex-col items-center gap-0.5 rounded-md px-2 py-1.5 transition-transform hover:scale-[1.03]",
                        cellCls[d.state],
                      )}
                    >
                      {d.overdue && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />}
                      <span className="font-mono text-[13px] font-bold tabular-nums leading-none">{d.value}</span>
                      {d.delta && (
                        <span className={cn("inline-flex items-center gap-0.5 font-mono text-[9px] font-bold tabular-nums", d.delta.dir === "up" ? "text-success" : d.delta.dir === "down" ? "text-destructive" : "text-muted-foreground")}>
                          <DeltaIcon className="h-2.5 w-2.5" strokeWidth={2} />{d.delta.text}
                        </span>
                      )}
                      <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.06em] opacity-70">{d.when}</span>
                    </button>
                  </td>
                );
              })}
              <td className="px-2 py-2.5">
                <button
                  type="button"
                  onClick={() => onAssign?.(p.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em]",
                    p.assign?.done ? "border-border bg-card text-foreground hover:bg-secondary" : "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {p.assign?.done ? <Check className="h-2.5 w-2.5" strokeWidth={2} /> : <Plus className="h-2.5 w-2.5" strokeWidth={2} />}
                  {p.assign?.label ?? "Tildel"}
                  {p.assign?.badge != null && (
                    <span className="ml-0.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-extrabold tabular-nums text-primary">
                      {p.assign.badge}
                    </span>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
