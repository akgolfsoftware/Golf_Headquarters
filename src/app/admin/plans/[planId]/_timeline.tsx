import { PYR_COLOR } from "./_pyr-color";
import type { Fase } from "./_faser";

function TimelineBar({
  label,
  thin,
  count,
  children,
}: {
  label: string;
  thin?: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mt-2 grid items-center gap-2 py-1"
      style={{ gridTemplateColumns: `80px repeat(1, 1fr)` }}
      data-count={count}
    >
      <div className="font-mono text-[11px] font-semibold text-muted-foreground">
        {label}
      </div>
      <div
        className="relative overflow-hidden rounded-md bg-secondary"
        style={{ height: thin ? 18 : 28 }}
      >
        {children}
      </div>
    </div>
  );
}

function BarFill({
  left,
  width,
  color,
  children,
  textDark,
}: {
  left: number;
  width: number;
  color: string;
  children?: React.ReactNode;
  textDark?: boolean;
}) {
  return (
    <div
      className={`absolute top-0 flex h-full items-center px-2 font-mono text-[11px] font-semibold ${
        textDark ? "text-foreground" : "text-white"
      }`}
      style={{ left: `${left}%`, width: `${width}%`, background: color }}
    >
      {children}
    </div>
  );
}

export function FaseTimeline({ faser }: { faser: Fase[] }) {
  if (faser.length === 0) return null;
  const current = faser.find((f) => f.status === "current");

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {faser.length}-ukers tidslinje · auto-generert
          </div>
          <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug">
            Faseinndeling og pyramide-vekting per uke
          </h3>
          <p className="mt-2 text-[12px] leading-[1.5] text-muted-foreground">
            Striper viser dominerende pyramide-lag. Aktiv uke er framhevet.
          </p>
        </div>
        {current && (
          <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
            Aktiv · {current.ukeLabel}
          </span>
        )}
      </div>

      {/* Uke-rad */}
      <div
        className="grid gap-px rounded-md bg-border p-px"
        style={{
          gridTemplateColumns: `80px repeat(${faser.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="bg-card" />
        {faser.map((f) => (
          <div
            key={f.key}
            className="bg-card py-2 text-center"
            style={
              f.status === "current"
                ? { background: "rgba(209,248,67,0.15)" }
                : undefined
            }
          >
            <div className="font-mono text-[11px] font-semibold text-muted-foreground">
              {f.ukeLabel}
            </div>
            <div className="mt-1 text-[10px] font-medium text-muted-foreground">
              {f.dateLabel}
              {f.status === "current" && " · NÅ"}
            </div>
          </div>
        ))}
      </div>

      {/* Status-stripe */}
      <TimelineBar label="Status" count={faser.length}>
        {faser.map((f, i) => (
          <BarFill
            key={f.key}
            left={(i / faser.length) * 100}
            width={100 / faser.length}
            color={
              f.status === "done"
                ? PYR_COLOR.FYS
                : f.status === "current"
                  ? PYR_COLOR.SLAG
                  : "var(--secondary)"
            }
            textDark={f.status === "current"}
          >
            {f.status === "done"
              ? "Fullført"
              : f.status === "current"
                ? "Pågår"
                : "Planlagt"}
          </BarFill>
        ))}
      </TimelineBar>

      {/* SLAG-vekt */}
      <TimelineBar label="SLAG-vekt" thin count={faser.length}>
        {faser.map((f, i) => (
          <BarFill
            key={f.key}
            left={(i / faser.length) * 100}
            width={100 / faser.length}
            color={`rgba(209,248,67,${0.2 + (f.slagPct / 100) * 0.75})`}
          />
        ))}
      </TimelineBar>

      {/* SPILL-vekt */}
      <TimelineBar label="SPILL-vekt" thin count={faser.length}>
        {faser.map((f, i) => (
          <BarFill
            key={f.key}
            left={(i / faser.length) * 100}
            width={100 / faser.length}
            color={`rgba(184,133,42,${0.2 + (f.spillPct / 100) * 0.7})`}
          />
        ))}
      </TimelineBar>
    </section>
  );
}
