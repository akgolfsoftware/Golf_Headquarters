"use client";

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
          background: `linear-gradient(to right, #005840 ${pct}%, #E5E3DD ${pct}%)`,
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
          background: #005840;
          border: 3px solid #D1F843;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,88,64,0.3);
          transition: transform 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #005840;
          border: 3px solid #D1F843;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
