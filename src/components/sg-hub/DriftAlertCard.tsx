import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import type { DriftAlert, DriftMetric } from "@/lib/sg-hub/drift-detection";

type Props = {
  alert: DriftAlert;
};

const METRIC_LABEL: Record<DriftMetric, string> = {
  clubPath: "Club Path",
  faceAngle: "Face Angle",
  totalDistance: "Total Distance",
};

const METRIC_UNIT: Record<DriftMetric, string> = {
  clubPath: "°",
  faceAngle: "°",
  totalDistance: "m",
};

const numberFmt = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NBSP = " ";

export function DriftAlertCard({ alert }: Props) {
  const TrendIcon = alert.direction === "up" ? TrendingUp : TrendingDown;
  const unit = METRIC_UNIT[alert.metric];
  const label = METRIC_LABEL[alert.metric];
  const signed = `${alert.slopePerWeek > 0 ? "+" : ""}${numberFmt.format(
    alert.slopePerWeek
  )}`;

  return (
    <article className="rounded-xl border border-border bg-card p-6">
      <header className="flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Drift oppdaget · {alert.weeks} uker
          </p>
          <h4 className="mt-1 text-sm font-semibold">
            {alert.club} — {label} drifter
          </h4>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground">
          <TrendIcon className="h-3 w-3" />
          {signed}
          {NBSP}
          {unit}/uke
        </span>
      </header>

      <p className="mt-2 text-sm text-muted-foreground">
        {label} har endret seg med {signed}
        {NBSP}
        {unit} per uke — over terskel på{NBSP}
        {numberFmt.format(alert.threshold)}
        {NBSP}
        {unit}/uke. Vurder en sjekk-økt for å justere før biasen biter seg fast.
      </p>
    </article>
  );
}
