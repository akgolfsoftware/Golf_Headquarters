/**
 * AiInsightsRow — 3-kort rad med AI-genererte innsikter for Player Workbench.
 *
 * Viser tre typer innsikt i en horisontal rad: HANDLING (sparkles),
 * OBSERVASJON (trending-up), MÅL (target). Hver card har eyebrow + body
 * + valgfri CTA-link. På desktop er det 3-kolonne grid, på mobile stacker
 * det til 1 kolonne.
 *
 * Server-component-vennlig — ingen client-state. Bruker `Link` for CTA.
 *
 * Referanse: Sprint 1 Spor B (Player Workbench v2).
 */

import Link from "next/link";
import { ChevronRight, Sparkles, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type AiInsightType = "HANDLING" | "OBSERVASJON" | "MAAL";

export type AiInsight = {
  type: AiInsightType;
  /** Overstyr standardikon hvis ønsket. Default settes fra `type`. */
  icon?: React.ReactNode;
  eyebrow: string;
  body: string;
  cta?: { label: string; href: string };
};

export type AiInsightsRowProps = {
  /** Eksakt 3 innsikter — én per type (HANDLING, OBSERVASJON, MAAL). */
  insights: AiInsight[];
  className?: string;
};

// ---------- Konstanter ----------

const DEFAULT_ICON: Record<AiInsightType, React.ReactNode> = {
  HANDLING: <Sparkles className="size-5" strokeWidth={1.5} aria-hidden />,
  OBSERVASJON: <TrendingUp className="size-5" strokeWidth={1.5} aria-hidden />,
  MAAL: <Target className="size-5" strokeWidth={1.5} aria-hidden />,
};

// ---------- Komponenter ----------

function InsightCard({ insight }: { insight: AiInsight }) {
  const icon = insight.icon ?? DEFAULT_ICON[insight.type];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card p-6",
        "transition-all hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-md",
            "bg-accent text-accent-foreground",
          )}
        >
          {icon}
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {insight.eyebrow}
        </span>
      </div>

      <p className="flex-1 text-base leading-relaxed text-card-foreground">
        {insight.body}
      </p>

      {insight.cta && (
        <Link
          href={insight.cta.href}
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium text-primary",
            "transition-colors hover:text-primary/80",
          )}
        >
          {insight.cta.label}
          <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function AiInsightsRow({ insights, className }: AiInsightsRowProps) {
  return (
    <section className={cn("space-y-4", className)} aria-label="AI-innsikt">
      <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        AI-innsikt
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {insights.map((insight, idx) => (
          <InsightCard key={`${insight.type}-${idx}`} insight={insight} />
        ))}
      </div>
    </section>
  );
}
