"use client";

import type React from "react";

/**
 * AK Golf HQ — FilterPills
 * Horizontally scrolling pill-filter bar. multi=true allows multiple selections.
 * Filters: [{value, label, count?, axis?}] — axis adds the categorical colour dot.
 * value: single value or array when multi=true.
 * Portet 1:1 fra Claude Design-prosjektets components/structure/FilterPills.jsx
 * (hentet via DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-fps / .ak-fp).
 */

export type FilterItem<V = unknown> = {
  value: V;
  label: string;
  count?: number;
  /** Pyramide-akse (fys/tek/slag/spill/turn) — gir kategorisk fargeprikk. */
  axis?: string;
};

export type FilterPillsProps<V = unknown> = {
  filters?: FilterItem<V>[];
  value?: V | V[] | null;
  onChange?: (value: V | V[] | null) => void;
  multi?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function FilterPills<V = unknown>({
  filters = [],
  value,
  onChange,
  multi = false,
  className = "",
  style,
}: FilterPillsProps<V>) {
  const isActive = (f: FilterItem<V>) => {
    if (multi) return Array.isArray(value) && (value as V[]).includes(f.value);
    return value === f.value;
  };
  const handleClick = (f: FilterItem<V>) => {
    if (multi) {
      const arr = Array.isArray(value) ? (value as V[]) : [];
      const next = arr.includes(f.value) ? arr.filter((v) => v !== f.value) : [...arr, f.value];
      onChange?.(next);
    } else {
      onChange?.(value === f.value ? null : f.value);
    }
  };
  return (
    <div className={`ak-fps ${className}`} style={style}>
      {filters.map((f, i) => (
        <button
          key={i}
          type="button"
          className="ak-fp"
          data-active={isActive(f) ? "" : undefined}
          onClick={() => handleClick(f)}
        >
          {f.axis && <span className="ak-fp__axis" style={{ background: `var(--axis-${f.axis.toLowerCase()})` }} />}
          {f.label}
          {f.count != null && <span className="ak-fp__count">{f.count}</span>}
        </button>
      ))}
    </div>
  );
}
