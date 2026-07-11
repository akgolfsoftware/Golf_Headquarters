import { PYR_REKKEFOLGE } from "@/lib/pyramide";
import type { PyramidArea } from "@/generated/prisma/client";
import { PYR_COLOR, type PhaseStatus } from "./_pyr-color";

function Pill({
  tone,
  children,
}: {
  tone: PhaseStatus;
  children: React.ReactNode;
}) {
  const styles =
    tone === "done"
      ? "bg-primary/10 text-primary"
      : tone === "current"
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

export function PhaseCard({
  num,
  statusTone,
  name,
  dates,
  pct,
  pctLabel,
  pctMuted,
  current,
  pyr,
  sessions,
}: {
  num: string;
  statusTone: PhaseStatus;
  name: string;
  dates: string;
  pct: string;
  pctLabel: string;
  pctMuted?: boolean;
  current?: boolean;
  pyr: Record<PyramidArea, number>;
  sessions: { value: string; label: string }[];
}) {
  return (
    <section
      className={`rounded-lg bg-card p-6 ${
        current ? "border-2 border-accent" : "border border-border"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-sm px-2 py-1 font-mono text-[10px] font-semibold ${
                current
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {num}
            </span>
            <Pill tone={statusTone}>
              {statusTone === "done"
                ? "Fullført"
                : statusTone === "current"
                  ? "Pågår"
                  : "Planlagt"}
            </Pill>
          </div>
          <h2 className="font-display text-[22px] font-bold leading-[1.1] tracking-tight">
            {name}
          </h2>
          <div className="mt-2 font-mono text-[12px] text-muted-foreground">
            {dates}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`font-mono text-[28px] font-semibold tabular-nums leading-none ${
              pctMuted ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {pct}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {pctLabel}
          </div>
        </div>
      </div>

      <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-sm bg-secondary">
        {PYR_REKKEFOLGE.map((omr) => (
          <div
            key={omr}
            style={{ width: `${pyr[omr]}%`, background: PYR_COLOR[omr] }}
          />
        ))}
      </div>
      <div className="mt-2 mb-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        {PYR_REKKEFOLGE.map((omr) => (
          <span key={omr} className="inline-flex items-center gap-2">
            <i
              className="h-2 w-2 rounded-sm"
              style={{ background: PYR_COLOR[omr] }}
            />
            {omr} {pyr[omr]} %
          </span>
        ))}
      </div>

      <div className="flex justify-between border-t border-border pt-4">
        {sessions.map((s) => (
          <div key={s.label}>
            <div className="font-mono text-[16px] font-semibold tabular-nums leading-none text-foreground">
              {s.value}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
