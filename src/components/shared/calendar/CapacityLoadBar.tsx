// CapacityLoadBar — TAK-bar som viser hvor mye av kapasiteten som er brukt.
//
// Terskler:
//   < 70%  → grønn (ok)
//   70-90% → gul   (kjør forsiktig)
//   90-110%→ rød   (overbooket eller på grensen)
//   > 110% → rød + alarm-ikon

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Brukt kapasitet i samme enhet som maks (typisk minutter eller bookinger). */
  brukt: number;
  /** Maksimal kapasitet. */
  maks: number;
  label?: string;
  visAlarm?: boolean;
  className?: string;
};

function tersklerKlasser(prosent: number): { bar: string; text: string } {
  if (prosent < 70) {
    return { bar: "bg-pyr-fys", text: "text-pyr-fys" };
  }
  if (prosent < 90) {
    return { bar: "bg-pyr-spill", text: "text-pyr-spill" };
  }
  // 90-110 og over: bruk destructive
  return { bar: "bg-destructive", text: "text-destructive" };
}

export function CapacityLoadBar({ brukt, maks, label, visAlarm = true, className }: Props) {
  const prosent = maks === 0 ? 0 : (brukt / maks) * 100;
  const klipt = Math.min(prosent, 120);
  const klasser = tersklerKlasser(prosent);
  const alarm = visAlarm && prosent > 110;

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className={cn("font-mono tabular-nums font-medium", klasser.text)}>
            {prosent.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all", klasser.bar)}
          style={{ width: `${klipt}%` }}
          aria-label={`Kapasitet ${prosent.toFixed(0)}%`}
        />
        {/* 100 %-merke */}
        <div
          className="absolute top-0 h-full w-px bg-foreground/30"
          style={{ left: "83.33%" }}
          aria-hidden
        />
      </div>
      {alarm && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle size={14} strokeWidth={1.5} />
          <span>Overbooking — fordel om i uka</span>
        </div>
      )}
    </div>
  );
}
