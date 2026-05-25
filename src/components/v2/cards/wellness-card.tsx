"use client";

import { Activity, Moon, Heart } from "lucide-react";
import { useCountUp } from "@/components/v2/hooks";
import type { Wellness } from "@/lib/v2-fixtures";

export type WellnessCardProps = {
  wellness: Wellness;
};

export default function WellnessCard({ wellness }: WellnessCardProps) {
  const [eVal, eRef] = useCountUp<HTMLDivElement>(wellness.energi, {
    duration: 900,
  });
  const [sVal, sRef] = useCountUp<HTMLDivElement>(wellness.søvn, {
    duration: 900,
    decimals: 1,
    delay: 80,
  });
  const [hVal, hRef] = useCountUp<HTMLDivElement>(wellness.hrv, {
    duration: 900,
    delay: 160,
  });

  const tileCls =
    "flex flex-col border border-border rounded-[14px] p-[14px] gap-[2px]";
  const trackStyle = {
    background: "color-mix(in oklab, var(--foreground) 3%, transparent)",
  } satisfies React.CSSProperties;

  return (
    <section className="card p-8 flex flex-col gap-[14px]">
      <div>
        <span className="eyebrow eyebrow-w-strek">Dagens kropp</span>
        <h3
          className="m-0 mt-2 mb-1 font-display font-bold tracking-[-0.02em]"
          style={{ fontSize: 28 }}
        >
          Velvære
        </h3>
        <p className="m-0 text-[13px] text-muted-foreground">
          Synker mot Garmin · sist oppdatert 07:45.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Energi */}
        <div ref={eRef} className={tileCls} style={trackStyle}>
          <div className="flex justify-between">
            <span className="eyebrow">Energi</span>
            <Activity size={14} className="text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-display tabular font-bold leading-none"
              style={{ fontSize: 32 }}
            >
              {eVal}
            </span>
            <span className="font-mono text-[12px] text-muted-foreground">
              /10
            </span>
          </div>
        </div>

        {/* Søvn */}
        <div ref={sRef} className={tileCls} style={trackStyle}>
          <div className="flex justify-between">
            <span className="eyebrow">Søvn</span>
            <Moon size={14} className="text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-display tabular font-bold leading-none"
              style={{ fontSize: 32 }}
            >
              {sVal}
            </span>
            <span className="font-mono text-[12px] text-muted-foreground">
              t
            </span>
          </div>
        </div>

        {/* HRV */}
        <div ref={hRef} className={tileCls} style={trackStyle}>
          <div className="flex justify-between">
            <span className="eyebrow">HRV</span>
            <Heart size={14} className="text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-display tabular font-bold leading-none"
              style={{ fontSize: 32 }}
            >
              {hVal}
            </span>
            <span className="font-mono text-[12px] text-muted-foreground">
              ms
            </span>
            <span
              className="font-mono text-[10px] ml-1"
              style={{ color: "var(--success)" }}
            >
              +{wellness.hrvDelta}
            </span>
          </div>
        </div>

        {/* Stress */}
        <div className={tileCls} style={trackStyle}>
          <div className="flex justify-between">
            <span className="eyebrow">Stress</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-display font-bold leading-none"
              style={{ fontSize: 28 }}
            >
              {wellness.stress}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
