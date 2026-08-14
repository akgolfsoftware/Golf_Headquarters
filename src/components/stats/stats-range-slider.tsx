"use client";
import { T } from "@/lib/v2/tokens";

/**
 * StatsRangeSlider — styled range input matching design bundle aesthetics.
 * Shows current value as floating label.
 */

interface StatsRangeSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
}

export function StatsRangeSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: StatsRangeSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ position: "relative", paddingTop: 4 }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          appearance: "none",
          height: 6,
          borderRadius: 3,
          background: `linear-gradient(to right, ${T.farge.forestMerke} ${pct}%, ${T.farge.linjeMerke} ${pct}%)`,
          outline: "none",
          cursor: "pointer",
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--p-cta);
          border: 3px solid var(--p-bg);
          cursor: pointer;
          box-shadow: var(--p-shadow);
          transition: transform 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--p-cta);
          border: 3px solid var(--p-bg);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
