import { cn } from "@/lib/utils";

export type ScorecardHole = {
  hole: number;
  par: number;
  score: number;
  sg?: number | null;
};

type RoundScorecardProps = {
  holes: ScorecardHole[];
  playedAt?: Date;
  courseName?: string;
  totalScore?: number;
  totalSg?: number | null;
  className?: string;
};

function scoreClass(score: number, par: number): string {
  const diff = score - par;
  if (diff <= -2) return "bg-accent text-primary border-primary";
  if (diff === -1) return "bg-primary text-primary-foreground border-primary";
  if (diff === 0) return "bg-card text-foreground border-border";
  if (diff === 1) return "bg-amber-50 text-amber-900 border-amber-300";
  return "bg-destructive/10 text-destructive border-destructive/40";
}

function scoreLabel(score: number, par: number): string {
  const diff = score - par;
  if (diff <= -2) return "Eagle+";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  return `+${diff}`;
}

export function RoundScorecard({
  holes,
  playedAt,
  courseName,
  totalScore,
  totalSg,
  className,
}: RoundScorecardProps) {
  const front = holes.filter((h) => h.hole <= 9);
  const back = holes.filter((h) => h.hole > 9);
  const frontScore = front.reduce((acc, h) => acc + h.score, 0);
  const frontPar = front.reduce((acc, h) => acc + h.par, 0);
  const backScore = back.reduce((acc, h) => acc + h.score, 0);
  const backPar = back.reduce((acc, h) => acc + h.par, 0);
  const total = totalScore ?? frontScore + backScore;
  const totalPar = frontPar + backPar;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold tracking-[-0.015em]">
            {courseName ?? "Scorecard"}
          </h3>
          {playedAt && (
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              {playedAt.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold leading-none">{total}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {total > totalPar ? "+" : ""}
            {total - totalPar} ({totalPar})
          </p>
          {typeof totalSg === "number" && (
            <p className={cn("mt-1 font-mono text-[11px] font-semibold", totalSg >= 0 ? "text-primary" : "text-destructive")}>
              SG {totalSg > 0 ? "+" : ""}
              {totalSg.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <NineHoleRow label="UT" holes={front} totalScore={frontScore} totalPar={frontPar} />
        <NineHoleRow label="INN" holes={back} totalScore={backScore} totalPar={backPar} />
      </div>
    </div>
  );
}

function NineHoleRow({
  label,
  holes,
  totalScore,
  totalPar,
}: {
  label: string;
  holes: ScorecardHole[];
  totalScore: number;
  totalPar: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {label} · {holes.length} hull
        </span>
        <span className="font-mono text-[11px] font-semibold">
          {totalScore} ({totalScore > totalPar ? "+" : ""}
          {totalScore - totalPar})
        </span>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {holes.map((h) => (
          <div
            key={h.hole}
            className={cn(
              "flex aspect-square min-w-0 flex-col items-center justify-center rounded-md border text-center",
              scoreClass(h.score, h.par),
            )}
            title={scoreLabel(h.score, h.par)}
          >
            <span className="font-mono text-[8px] uppercase tracking-[0.04em] opacity-70">
              {h.hole} · P{h.par}
            </span>
            <span className="font-display text-base font-bold leading-none">{h.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
