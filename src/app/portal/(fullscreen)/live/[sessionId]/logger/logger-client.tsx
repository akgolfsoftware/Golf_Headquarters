"use client";

/**
 * LoggerClient — en-hånds live-økt logger.
 *
 * Variant A: stor +1 touchtarget (96px lime), mindre BOM-knapp, sentral
 * 110px rep-counter med tabular-nums, mål-info, footer-nav (forrige/sett/
 * neste). Vibrer ved hver rep. localStorage-persistens for offline-bruk.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, X } from "lucide-react";

type Drill = {
  category: string;
  title: string;
  titleItalic: string;
  target: number;
  targetTotal: number;
  targetText: string;
  repsPlanned: number;
  drillIndex: number;
  drillTotal: number;
};

type Counts = { ok: number; miss: number };

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function LoggerClient({
  sessionId,
  drill,
}: {
  sessionId: string;
  drill: Drill;
}) {
  const storageKey = `live-logger:${sessionId}`;
  const [counts, setCounts] = useState<Counts>({ ok: 7, miss: 1 });
  const [elapsed, setElapsed] = useState(258); // 04:18

  // Restore fra localStorage ved mount (offline-buffer)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Counts;
        if (typeof parsed.ok === "number" && typeof parsed.miss === "number") {
          setCounts(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Persistér ved endring
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(counts));
    } catch {
      // ignore
    }
  }, [counts, storageKey]);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  function vibrate() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(40);
    }
  }

  function addOk() {
    vibrate();
    setCounts((c) => ({ ...c, ok: c.ok + 1 }));
  }

  function addMiss() {
    vibrate();
    setCounts((c) => ({ ...c, miss: c.miss + 1 }));
  }

  const total = counts.ok + counts.miss;
  const hitRate = total === 0 ? 0 : Math.round((counts.ok / total) * 100);
  const left = Math.max(0, drill.target - counts.ok);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0F2A22] text-white">
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 pt-6 pb-3"
        style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)" }}
      >
        <Link
          href={`/portal/live/${sessionId}/summary`}
          className="font-mono inline-flex min-h-11 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55"
        >
          <X className="h-3.5 w-3.5" /> Avslutt
        </Link>
        <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/55">
          {drill.drillIndex} / {drill.drillTotal} DRILLS
        </div>
        <div className="font-mono text-sm font-bold tabular-nums text-accent">
          {formatElapsed(elapsed)}
        </div>
      </header>

      {/* Drill-info */}
      <section className="px-5 text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: "rgba(209,248,67,0.15)" }}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-accent">
            {drill.category}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-accent/80">
            · {drill.repsPlanned} REPS
          </span>
        </span>
        <h1 className="font-display mt-3 text-2xl font-semibold leading-tight tracking-tight">
          {drill.title}{" "}
          <em
            className="font-normal not-italic"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              color: "#D1F843",
            }}
          >
            {drill.titleItalic}
          </em>
        </h1>
      </section>

      {/* Big counter */}
      <section className="flex flex-1 flex-col items-center justify-center px-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
          HIT / TOTAL
        </div>
        <div className="font-mono mt-1 flex items-baseline gap-1 tabular-nums">
          <div
            className="font-bold leading-none text-accent"
            style={{ fontSize: 110, letterSpacing: "-0.04em" }}
          >
            {counts.ok}
          </div>
          <div
            className="font-semibold text-white/30"
            style={{ fontSize: 60, letterSpacing: "-0.04em" }}
          >
            / {total}
          </div>
        </div>
        <div className="font-mono mt-1 text-xs uppercase tracking-[0.08em] text-accent tabular-nums">
          {hitRate}% HIT-RATE
        </div>
        <div className="font-mono mt-3 max-w-xs text-center text-[11px] leading-relaxed tracking-[0.06em] text-white/55">
          Mål: {drill.targetText}
          {left > 0 ? ` — du trenger ${left} til` : " — mål nådd ✓"}
        </div>
      </section>

      {/* Bottom CTAs (+1 INN / − BOM) */}
      <section className="grid grid-cols-[1fr_100px] gap-3 px-5 pb-4">
        <button
          type="button"
          onClick={addOk}
          className="font-display flex h-24 flex-col items-center justify-center gap-0.5 rounded-3xl bg-accent font-bold text-foreground active:brightness-95"
          style={{
            boxShadow:
              "0 4px 16px rgba(209,248,67,0.30), inset 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          <span className="text-3xl leading-none">+1</span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.10em] opacity-70">
            INN
          </span>
        </button>
        <button
          type="button"
          onClick={addMiss}
          className="font-display flex h-24 flex-col items-center justify-center gap-0.5 rounded-3xl font-bold text-white active:brightness-95"
          style={{ background: "rgba(163,45,45,0.85)" }}
        >
          <span className="text-2xl leading-none">−</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] opacity-75">
            BOM
          </span>
        </button>
      </section>

      {/* Footer nav (forrige / sett / neste) */}
      <footer
        className="flex items-center justify-between gap-3 px-5 pb-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        <button
          type="button"
          className="font-mono inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white/[0.06] px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.10em] text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Forrige
        </button>
        <button
          type="button"
          className="font-mono min-h-11 rounded-xl bg-white/[0.06] px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.10em] text-white"
        >
          Sett
        </button>
        <button
          type="button"
          className="font-mono inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-accent px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.10em] text-foreground"
        >
          Neste <ArrowRight className="h-3 w-3" />
        </button>
      </footer>
    </div>
  );
}
