"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  ariaLabel?: string;
};

/**
 * Touch- og click-drag-spinner for tallvalg. Bruker også mousewheel og
 * piltaster. Viser fem verdier i en lodrett strip (−2, −1, [valgt], +1, +2)
 * med dempet font på naboer for taktil feedback.
 */
export function NumberSpinner({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  ariaLabel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startY: number;
    startValue: number;
    active: boolean;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const clamp = useCallback(
    (n: number) => {
      const snapped = Math.round(n / step) * step;
      return Math.max(min, Math.min(max, snapped));
    },
    [min, max, step],
  );

  const setValue = useCallback(
    (next: number) => {
      const clamped = clamp(next);
      if (clamped !== value) onChange(clamped);
    },
    [clamp, onChange, value],
  );

  // Drag (pointer events dekker mus + touch)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onPointerMove(e: PointerEvent) {
      const ds = dragState.current;
      if (!ds || !ds.active) return;
      const deltaY = ds.startY - e.clientY; // opp = økning
      const stepsMoved = Math.round(deltaY / 16); // 16px per step
      const next = ds.startValue + stepsMoved * step;
      setValue(next);
    }

    function onPointerUp() {
      if (dragState.current) {
        dragState.current.active = false;
        dragState.current = null;
        setDragging(false);
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      setValue(value + dir * step);
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [setValue, value, step]);

  function onPointerDown(e: React.PointerEvent) {
    dragState.current = {
      startY: e.clientY,
      startValue: value,
      active: true,
    };
    setDragging(true);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      setValue(value + step);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      setValue(value - step);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      setValue(value + step * 5);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      setValue(value - step * 5);
    } else if (e.key === "Home") {
      e.preventDefault();
      setValue(min);
    } else if (e.key === "End") {
      e.preventDefault();
      setValue(max);
    }
  }

  // Lag strip av 5 verdier rundt valgt
  const stripValues = [-2, -1, 0, 1, 2].map((offset) => {
    const v = value + offset * step;
    const inRange = v >= min && v <= max;
    return { offset, v, inRange };
  });

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="Reduser"
        onClick={() => setValue(value - step)}
        disabled={value <= min}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-card text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronDown className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <div
        ref={containerRef}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={ariaLabel ?? label ?? "Velg verdi"}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className={`relative flex h-40 w-32 select-none flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ touchAction: "none" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />

        <div className="flex flex-col items-center justify-center gap-1">
          {stripValues.map(({ offset, v, inRange }) => {
            const isMain = offset === 0;
            const distance = Math.abs(offset);
            const opacity = isMain ? 1 : distance === 1 ? 0.4 : 0.18;
            const scale = isMain ? 1 : distance === 1 ? 0.7 : 0.5;
            return (
              <div
                key={offset}
                className={`font-mono tabular-nums leading-none ${
                  isMain
                    ? "text-3xl font-semibold text-foreground"
                    : "text-base text-muted-foreground"
                }`}
                style={{
                  opacity: inRange ? opacity : 0.08,
                  transform: `scale(${scale})`,
                  transition: dragging ? undefined : "all 120ms ease-out",
                }}
              >
                {inRange ? v : ""}
              </div>
            );
          })}
        </div>

        {label && (
          <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label="Øk"
        onClick={() => setValue(value + step)}
        disabled={value >= max}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-card text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronUp className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
