"use client";

type Props = {
  totalSteps: number;
  currentStep: number;
};

export function ProgressBar({ totalSteps, currentStep }: Props) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <span key={stepNum} className="flex items-center gap-2">
            <span
              className={[
                "block h-2.5 w-2.5 rounded-full border transition-all",
                isDone
                  ? "border-primary bg-primary"
                  : isActive
                  ? "border-primary bg-accent scale-125"
                  : "border-border bg-border",
              ].join(" ")}
              aria-label={
                isDone
                  ? `Steg ${stepNum} fullført`
                  : isActive
                  ? `Steg ${stepNum} (aktiv)`
                  : `Steg ${stepNum}`
              }
            />
            {i < totalSteps - 1 && (
              <span
                className={[
                  "block h-px w-6",
                  isDone ? "bg-primary" : "bg-border",
                ].join(" ")}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
