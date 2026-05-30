"use client";

/**
 * useNowTime — tickende klokke som returnerer decimal hours + label.
 *
 * Med `nowOverride` (decimal hours) kan klokken fryses for testing.
 *
 * @example
 * const { decimal, label } = useNowTime();
 * // decimal = 9.7, label = "09:42:18"
 */

import { useEffect, useState } from "react";

type NowTime = {
  decimal: number;
  hh: number;
  mm: number;
  ss: number;
  label: string;
  labelShort: string;
};

function getNowSeconds(): number {
  if (typeof window === "undefined") return 0;
  const d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

export function useNowTime(nowOverride?: number): NowTime {
  // Bare brukt for live-ticking. Hvis nowOverride er satt, ignoreres state-en
  // og overstyringen returneres direkte (derived).
  const [now, setNow] = useState<number>(() =>
    typeof nowOverride === "number" ? nowOverride * 3600 : getNowSeconds(),
  );

  useEffect(() => {
    // Hvis overstyrt: ikke tikker, bare lukk effekten umiddelbart.
    if (typeof nowOverride === "number") return;

    const tick = () => setNow(getNowSeconds());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nowOverride]);

  // Derived value: bruk overstyring hvis satt, ellers tikkende state
  const effective = typeof nowOverride === "number" ? nowOverride * 3600 : now;

  const decimal = effective / 3600;
  const hh = Math.floor(effective / 3600);
  const mm = Math.floor((effective % 3600) / 60);
  const ss = effective % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    decimal,
    hh,
    mm,
    ss,
    label: `${pad(hh)}:${pad(mm)}:${pad(ss)}`,
    labelShort: `${pad(hh)}:${pad(mm)}`,
  };
}
