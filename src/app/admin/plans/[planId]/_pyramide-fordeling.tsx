import { PYR_REKKEFOLGE, PYR_LABEL } from "@/lib/pyramide";
import type { PyramidArea } from "@/generated/prisma/client";
import { PYR_COLOR } from "./_pyr-color";

export function PyramideFordeling({
  fordeling,
}: {
  fordeling: Record<PyramidArea, number>;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-[16px] font-semibold leading-snug">
        Pyramide-fordeling
      </h3>
      <div className="space-y-2">
        {PYR_REKKEFOLGE.map((omr) => (
          <div key={omr} className="flex items-center gap-2 text-xs">
            <span className="w-14 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {PYR_LABEL[omr]}
            </span>
            <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-secondary">
              <div
                className="h-full"
                style={{
                  width: `${Math.max(fordeling[omr], 2)}%`,
                  background: PYR_COLOR[omr],
                }}
              />
            </div>
            <span className="w-10 text-right font-mono tabular-nums">
              {fordeling[omr]} %
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
