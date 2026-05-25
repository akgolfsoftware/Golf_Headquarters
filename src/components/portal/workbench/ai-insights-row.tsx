/**
 * AiInsightsRow — 3-kort rad med AI-genererte innsikter for Player Workbench.
 *
 * Viser tre typer innsikt i en horisontal rad: HANDLING (sparkles),
 * OBSERVASJON (trending-up), MÅL (target). Hver card har eyebrow + body
 * + valgfri CTA-link. På desktop er det 3-kolonne grid, på mobile stacker
 * det til 1 kolonne.
 *
 * Athletic editorial: hver type har sin egen pyramide-akse-farge på
 * ikon-sirkelen + type-badge i toppen. HANDLING får primary border for
 * å løfte den mest aksjons-orienterte.
 *
 * Server-component-vennlig — ingen client-state. Bruker `Link` for CTA.
 *
 * Referanse: Sprint 1 Spor B (Player Workbench v2).
 */

import Link from "next/link";
import { ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";
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
  HANDLING: <Sparkles className="size-6" strokeWidth={1.5} aria-hidden />,
  OBSERVASJON: <TrendingUp className="size-6" strokeWidth={1.5} aria-hidden />,
  MAAL: <Target className="size-6" strokeWidth={1.5} aria-hidden />,
};

const TYPE_LABEL: Record<AiInsightType, string> = {
  HANDLING: "Handling",
  OBSERVASJON: "Observasjon",
  MAAL: "Mål",
};

/** Pyramide-akse-fargede ikon-sirkler per type. */
const ICON_CONTAINER: Record<AiInsightType, string> = {
  HANDLING: "bg-accent text-accent-foreground",
  OBSERVASJON: "bg-info/15 text-info",
  MAAL: "bg-primary/10 text-primary",
};

/** Type-badge farger — subtilere enn ikonet, men samme akse. */
const TYPE_BADGE: Record<AiInsightType, string> = {
  HANDLING: "bg-foreground text-background",
  OBSERVASJON: "bg-info/10 text-info",
  MAAL: "bg-primary/10 text-primary",
};

// ---------- Komponenter ----------

function InsightCard({ insight }: { insight: AiInsight }) {
  const icon = insight.icon ?? DEFAULT_ICON[insight.type];
  const isHandling = insight.type === "HANDLING";

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-5 rounded-2xl border bg-card p-6 sm:p-7",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        isHandling
          ? "border-foreground/15 shadow-md"
          : "border-border hover:border-foreground/20",
      )}
    >
      {/* Topp-rad: ikon + type-badge */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl",
            ICON_CONTAINER[insight.type],
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em]",
            TYPE_BADGE[insight.type],
          )}
        >
          {TYPE_LABEL[insight.type]}
        </span>
      </div>

      {/* Eyebrow */}
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {insight.eyebrow}
      </p>

      {/* Body — øket leading + størrelse for editorial feel */}
      <p className="flex-1 font-display text-[17px] font-medium leading-[1.45] tracking-[-0.005em] text-card-foreground">
        {insight.body}
      </p>

      {/* CTA */}
      {insight.cta && (
        <Link
          href={insight.cta.href}
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.10em]",
            "text-foreground transition-colors hover:text-primary",
          )}
        >
          {insight.cta.label}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
            aria-hidden
          />
        </Link>
      )}
    </article>
  );
}

export function AiInsightsRow({ insights, className }: AiInsightsRowProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5", className)}>
      {insights.map((insight, idx) => (
        <InsightCard key={`${insight.type}-${idx}`} insight={insight} />
      ))}
    </div>
  );
}
