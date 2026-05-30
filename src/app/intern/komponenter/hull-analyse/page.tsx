import { HoleAnalysis } from "@/components/hole-analysis/hole-analysis";

export default function HullAnalyseDemo() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[440px]">
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          PlayerHQ · hull-analyse · spredning + SG
        </div>
        <h1 className="mb-5 font-display text-2xl font-bold tracking-tight text-foreground">
          Hvor lander ballen <em className="font-normal italic text-primary">egentlig</em>?
        </h1>
        <HoleAnalysis />
        <p className="mt-4 text-xs leading-[1.5] text-muted-foreground">
          Trykk på <b className="text-foreground">Tee total</b>-markøren i fairway for å se spredningen
          på hullet, eller bytt til SG + treningsdata for sonen.
        </p>
      </div>
    </div>
  );
}
