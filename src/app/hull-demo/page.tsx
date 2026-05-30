import { HoleAnalysis } from "@/components/hole-analysis/hole-analysis";

// Midlertidig offentlig demo (ikke gated) for remote-visning. Fjernes etter review.
export default function HullDemo() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[440px]">
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          PlayerHQ · hull-analyse · demo
        </div>
        <h1 className="mb-5 font-display text-2xl font-bold tracking-tight text-foreground">
          Hull-analyse <em className="font-normal italic text-primary">kategorier</em>
        </h1>
        <HoleAnalysis />
      </div>
    </div>
  );
}
