/**
 * TestUkeKommende — spillerens nedtelling til neste testuke.
 *
 * Vises øverst på /portal/tren/tester når en testuke er satt opp.
 * Returnerer null hvis countdown === null (ingen testuke planlagt).
 *
 * Krever TestWeek-modell for full aktivering (Bolk 3 TODO).
 */
import { Crosshair, Dumbbell, Flag, MapPin, Moon, Target, Trophy } from "lucide-react";
import type { PyramidArea } from "@/generated/prisma/client";

export type TestItem = {
  name: string;
  area: PyramidArea;
  dagLabel: string;
  klokkeslett: string;
  sted: string;
};

type Props = {
  countdown: number | null;
  totalDays?: number;
  tester: TestItem[];
};

const AREA_ICON: Record<PyramidArea, React.ElementType> = {
  FYS: Dumbbell,
  TEK: Crosshair,
  SLAG: Target,
  SPILL: Flag,
  TURN: Trophy,
};

const AREA_COLOR: Record<PyramidArea, string> = {
  FYS: "#005840",
  TEK: "#B8852A",
  SLAG: "#2563EB",
  SPILL: "#D1F843",
  TURN: "#A32D2D",
};

const AREA_LABEL: Record<PyramidArea, string> = {
  FYS: "FYSISK",
  TEK: "TEKNISK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURNERING",
};

function CountdownRing({ daysLeft, totalDays }: { daysLeft: number; totalDays: number }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const elapsed = Math.max(0, Math.min(1, (totalDays - daysLeft) / totalDays));
  const dashFilled = elapsed * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 160 160" className="h-[160px] w-[160px] -rotate-90">
        {/* Track */}
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="12"
        />
        {/* Progress */}
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="var(--warning)"
          strokeWidth="12"
          strokeDasharray={`${dashFilled} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-[36px] font-extrabold leading-none tracking-tight text-foreground">
          {daysLeft}
        </span>
        <span className="mt-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          DAGER IGJEN
        </span>
      </div>
    </div>
  );
}

export function TestUkeKommende({ countdown, totalDays = 56, tester }: Props) {
  if (countdown === null) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-warning/30 bg-warning/5">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-warning/20 px-4 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-warning">
          TESTUKE NÆRMER SEG
        </span>
      </div>

      <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-start">
        {/* Countdown ring */}
        <div className="flex flex-col items-center gap-2 sm:shrink-0">
          <CountdownRing daysLeft={countdown} totalDays={totalDays} />
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
            <Moon size={10} strokeWidth={2} />
            For-uken: hold det lett
          </div>
        </div>

        {/* Test list */}
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-semibold leading-snug text-foreground">
            Din testuke er{" "}
            <em className="not-italic text-primary">om {countdown} dager</em>
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Hold uka før lett — vi vil ha deg uthvilt til testene.
          </p>

          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {tester.length === 0 && (
              <p className="px-4 py-5 text-center text-xs text-muted-foreground">
                Tester ikke satt opp ennå.
              </p>
            )}
            {tester.map((t, i) => {
              const Icon = AREA_ICON[t.area];
              const color = AREA_COLOR[t.area];
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  {/* Area dot */}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${color}18`, color }}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  {/* Name + area */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold leading-tight text-foreground">
                      {t.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {AREA_LABEL[t.area]}
                    </div>
                  </div>
                  {/* When + where */}
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[12px] font-semibold text-foreground">{t.klokkeslett}</span>
                    <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                      <MapPin size={8} strokeWidth={2} />
                      {t.sted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
