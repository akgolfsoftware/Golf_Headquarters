"use client";

/**
 * AK Golf HQ v2 — dataliv-hooks (retning C). 1:1-speil av hjelperne i
 * mockup-kilden (v2-core.jsx): count-up på hero-tall, mount-trigger for
 * width/draw-in. ALT honorerer prefers-reduced-motion (hopper animasjon,
 * viser sluttverdi direkte). Komma-desimal + fortegn (+/−) som i mockup.
 */
import { useEffect, useState } from "react";

/** Ett bevegelsesspråk: 180ms cubic-bezier(0.2,0,0,1). */
export const EASE = "cubic-bezier(0.2,0,0,1)";

/** true når brukeren har bedt om redusert bevegelse. */
export function reduced(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type NumMeta =
  | { ok: true; n: number; dec: number; signed: boolean }
  | { ok: false };

/** Parser mono-tall: komma-desimal + fortegn (+ / − / -). Ikke-numerisk → ok:false. */
function parseNum(v: number | string): NumMeta {
  if (typeof v === "number" && isFinite(v)) return { ok: true, n: v, dec: 0, signed: false };
  if (typeof v === "string") {
    const t = v.trim();
    const cleaned = t.replace(/−/g, "-").replace(/\s/g, "").replace(",", ".");
    if (/^[+-]?\d+(\.\d+)?$/.test(cleaned)) {
      const dot = cleaned.indexOf(".");
      return { ok: true, n: parseFloat(cleaned), dec: dot >= 0 ? cleaned.length - dot - 1 : 0, signed: t[0] === "+" };
    }
  }
  return { ok: false };
}

/** Formaterer et tall som kilde-verdien (samme antall desimaler, komma, fortegn). */
function fmtLike(n: number, m: Extract<NumMeta, { ok: true }>): string {
  const s = Math.abs(n).toFixed(m.dec).replace(".", ",");
  const sign = n < 0 ? "−" : m.signed && n > 0 ? "+" : "";
  return sign + s;
}

/**
 * useCountUp: teller 0 → mål på ~600ms ved mount/endring. Kun numerisk;
 * ikke-numerisk (f.eks. "68%") returneres uendret. Reduced-motion → målet direkte.
 */
export function useCountUp(value: number | string, dur = 600): string {
  const m = parseNum(value);
  const [disp, setDisp] = useState<string>(() => (m.ok ? fmtLike(0, m) : String(value)));
  useEffect(() => {
    if (!m.ok) {
      // Synk fra ny ikke-numerisk prop-verdi; bevisst synkron oppdatering.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisp(String(value));
      return;
    }
    if (reduced()) {
      setDisp(fmtLike(m.n, m));
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(fmtLike(m.n * e, m));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return m.ok ? disp : String(value);
}

/** true på <md-flaten (maks 767px) — SSR-trygg (false før mount). */
export function useMobile(): boolean {
  const [mobil, setMobil] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setMobil(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return mobil;
}

/** useMount: true etter to frames (trigger for width/draw-in-transitions). Reduced → true straks. */
export function useMount(): boolean {
  const [on, setOn] = useState(() => reduced());
  useEffect(() => {
    if (reduced()) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return on;
}
