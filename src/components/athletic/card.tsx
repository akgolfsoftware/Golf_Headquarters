import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "./eyebrow";
import { PulseDot } from "./pulse-dot";

type AthleticCardProps = {
  label?: string;
  showPulse?: boolean;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

export function AthleticCard({
  label,
  showPulse,
  action,
  className,
  bodyClassName,
  children,
}: AthleticCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 md:p-6",
        className,
      )}
    >
      {(label || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {label && (
            <div className="flex items-center gap-2">
              {showPulse && <PulseDot size="sm" />}
              <AthleticEyebrow>{label}</AthleticEyebrow>
            </div>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
