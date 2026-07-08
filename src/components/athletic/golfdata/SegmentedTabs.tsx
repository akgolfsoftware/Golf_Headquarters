"use client";

import type React from "react";

/**
 * AK Golf HQ — SegmentedTabs
 * Pill-shaped active state on a dark rail, mono labels. Works as a short tab row
 * (3 choices) and as a period selector (Uke / Måned / 3 mnd / År). Active pill
 * is white (dark text) — the calm strong selection treatment.
 * Portet 1:1 fra Claude Design-prosjektets components/forms/SegmentedTabs.jsx
 * (hentet via DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-seg).
 */

export type SegmentedTabOption<V extends string = string> =
  | V
  | { value: V; label: React.ReactNode; disabled?: boolean };

export type SegmentedTabsProps<V extends string = string> = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  options?: SegmentedTabOption<V>[];
  value?: V;
  onChange?: (value: V) => void;
  size?: "sm" | "md";
  block?: boolean;
  disabled?: boolean;
};

export function SegmentedTabs<V extends string = string>({
  options = [],
  value,
  onChange,
  size = "md",
  block = false,
  disabled = false,
  className = "",
  style,
  ...rest
}: SegmentedTabsProps<V>) {
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o as React.ReactNode, disabled: false } : o));
  return (
    <div
      className={`ak-seg ak-seg--${size} ${block ? "ak-seg--block" : ""} ${disabled ? "ak-seg--disabled" : ""} ${className}`}
      role="tablist"
      aria-disabled={disabled || undefined}
      style={style}
      {...rest}
    >
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={value === it.value}
          disabled={disabled || ("disabled" in it && it.disabled) || undefined}
          onClick={() => onChange && onChange(it.value)}
          className="ak-seg__item"
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
