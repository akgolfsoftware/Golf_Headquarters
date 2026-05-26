"use client";

/**
 * LiveBar — tikkende klokke + neste økt + vær.
 * Port av workbench-v2/athletic.jsx LiveBar.
 * Vises som tynn rad under topbar.
 */

import { useEffect, useState } from "react";

export type LiveBarProps = {
  nextSession?: {
    title: string;
    startAt: Date;
  } | null;
  weather?: { club: string; tempC: number; summary: string } | null;
  onAlertClick?: () => void;
};

export function LiveBar({ nextSession, weather, onAlertClick }: LiveBarProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-9 items-center border-y border-border bg-card px-4 font-mono text-[11px] text-muted-foreground sm:px-6" />
    );
  }

  const minsUntilNext = nextSession
    ? Math.max(
        0,
        Math.round((nextSession.startAt.getTime() - now.getTime()) / 60_000),
      )
    : Infinity;
  const critical = minsUntilNext >= 0 && minsUntilNext < 30;

  const nowStr = now.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const untilLabel =
    nextSession && minsUntilNext < Infinity
      ? minsUntilNext >= 60
        ? `${Math.floor(minsUntilNext / 60)}t ${String(minsUntilNext % 60).padStart(2, "0")}min`
        : `${minsUntilNext} min`
      : null;

  return (
    <div
      className={`flex h-9 items-center gap-3 border-y px-4 font-mono text-[11px] uppercase tracking-[0.08em] sm:px-6 ${
        critical
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border bg-card text-muted-foreground"
      }`}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={onAlertClick}
        disabled={!onAlertClick}
        className="inline-flex items-center gap-1.5"
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            critical
              ? "animate-pulse bg-destructive"
              : "bg-success"
          }`}
          aria-hidden
        />
        <span className="font-semibold">
          {critical ? "Live · kritisk" : "Live"}
        </span>
      </button>

      <span className="h-3 w-px bg-current opacity-30" aria-hidden />

      <span className="inline-flex items-center gap-1.5">
        <span>Nå</span>
        <span className="font-bold tabular-nums text-foreground">{nowStr}</span>
      </span>

      {nextSession && untilLabel && (
        <>
          <span className="h-3 w-px bg-current opacity-30" aria-hidden />
          <span className="inline-flex items-center gap-1.5">
            <span>Neste</span>
            <span className="font-bold text-foreground">
              {nextSession.title.split("·").pop()?.trim() ?? nextSession.title}
            </span>
            <span>om</span>
            <span className="font-bold tabular-nums text-foreground">
              {untilLabel}
            </span>
          </span>
        </>
      )}

      {weather && (
        <span className="ml-auto inline-flex items-center gap-1.5">
          <span className="font-bold text-foreground">{weather.club}</span>
          <span className="font-bold tabular-nums text-foreground">
            {weather.tempC}°C
          </span>
          <span>{weather.summary}</span>
        </span>
      )}
    </div>
  );
}
