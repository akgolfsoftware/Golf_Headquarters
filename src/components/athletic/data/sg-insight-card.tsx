import {
  AlertCircle,
  AlertTriangle,
  Award,
  Brain,
  Compass,
  Crosshair,
  Gauge,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticBadge } from "../badge";
import { AthleticEyebrow } from "../eyebrow";

export type Insight = {
  id: string;
  category:
    | "DISTANCE_GAPPING"
    | "CONSISTENCY_LEAK"
    | "TRAINING_GAP"
    | "D_PLANE_DRIFT"
    | "STRIKE_QUALITY"
    | "FATIGUE_PATTERN"
    | "EQUIPMENT_FIT"
    | "TEMPO_VARIANCE"
    | "PROGRESSION_TREND"
    | "SAME_DISTANCE_OPPORTUNITY";
  severity: number;
  title: string;
  body: string;
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
};

const CATEGORY_META: Record<
  Insight["category"],
  { icon: typeof AlertCircle; label: string; tone: string }
> = {
  DISTANCE_GAPPING: { icon: Target, label: "Distanse-gap", tone: "text-amber-600" },
  CONSISTENCY_LEAK: { icon: AlertTriangle, label: "Konsistens", tone: "text-amber-600" },
  TRAINING_GAP: { icon: Layers, label: "Trenings-gap", tone: "text-amber-600" },
  D_PLANE_DRIFT: { icon: Compass, label: "D-plane", tone: "text-destructive" },
  STRIKE_QUALITY: { icon: Crosshair, label: "Strike", tone: "text-destructive" },
  FATIGUE_PATTERN: { icon: Gauge, label: "Fatigue", tone: "text-destructive" },
  EQUIPMENT_FIT: { icon: Zap, label: "Utstyr", tone: "text-primary" },
  TEMPO_VARIANCE: { icon: Brain, label: "Tempo", tone: "text-amber-600" },
  PROGRESSION_TREND: { icon: TrendingUp, label: "Fremgang", tone: "text-primary" },
  SAME_DISTANCE_OPPORTUNITY: { icon: Award, label: "Mulighet", tone: "text-primary" },
};

type SgInsightCardProps = {
  insight: Insight;
  onAcknowledge?: () => void;
  onResolve?: () => void;
  className?: string;
};

export function SgInsightCard({ insight, onAcknowledge, onResolve, className }: SgInsightCardProps) {
  const meta = CATEGORY_META[insight.category];
  const Icon = meta.icon;
  const isResolved = !!insight.resolvedAt;
  const isAcked = !!insight.acknowledgedAt;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-4 md:p-6",
        insight.severity >= 4 ? "border-destructive/50" : "border-border",
        isResolved && "opacity-60",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            insight.severity >= 4 ? "bg-destructive/15" : "bg-muted",
          )}
        >
          <Icon className={cn("h-5 w-5", meta.tone)} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AthleticEyebrow>{meta.label}</AthleticEyebrow>
            <SeverityBadge severity={insight.severity} />
            {isResolved && <AthleticBadge variant="ok">Løst</AthleticBadge>}
            {isAcked && !isResolved && <AthleticBadge variant="neutral">Sett</AthleticBadge>}
          </div>
          <h4 className="mt-1.5 font-display text-base font-bold leading-tight tracking-[-0.01em] md:text-lg">
            {insight.title}
          </h4>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{insight.body}</p>

          {(onAcknowledge || onResolve) && !isResolved && (
            <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
              {onAcknowledge && !isAcked && (
                <button
                  type="button"
                  onClick={onAcknowledge}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Marker som sett
                </button>
              )}
              {onResolve && (
                <button
                  type="button"
                  onClick={onResolve}
                  className="font-semibold text-primary hover:underline"
                >
                  Marker som løst →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {insight.severity >= 4 && (
        <span className="absolute right-3 top-3">
          <Sparkles className="h-3 w-3 text-destructive" strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: number }) {
  const dots = Math.min(5, Math.max(1, severity));
  return (
    <span className="flex items-center gap-0.5" title={`Severity ${severity}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 w-2 rounded-sm",
            i < dots
              ? severity >= 4
                ? "bg-destructive"
                : severity >= 3
                  ? "bg-amber-500"
                  : "bg-primary"
              : "bg-muted",
          )}
        />
      ))}
    </span>
  );
}
