"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Clock,
  Pause,
  Play,
  StopCircle,
  X,
} from "lucide-react";
import { saveTapperCounts } from "./actions";

type Club = { id: string; name: string };

type Props = {
  sessionId: string;
  facilityLabel: string;
  defaultClubs: Club[];
  /** Tidligere lagrede tellinger (session_ball_logs) — gjenopptak etter refresh. */
  initialCounts?: Record<string, number>;
};

/**
 * Tapper-shell — fullscreen mørk modus med ett stort tap-felt.
 * Mobile-first: tap-knapp 120px høyde, store tap-targets, minimal UI.
 *
 * Tellingene persisteres til session_ball_logs: debounced ~5 s etter siste
 * tap, ved pause, og før navigering ut (avslutt/lukk).
 */
export function TapperShell({ sessionId, facilityLabel, defaultClubs, initialCounts }: Props) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>(() => ({
    ...Object.fromEntries(defaultClubs.map((c) => [c.id, 0])),
    ...(initialCounts ?? {}),
  }));
  const [activeClubId, setActiveClubId] = useState<string>(
    defaultClubs[0]?.id ?? "",
  );
  const [paused, setPaused] = useState(false);
  const [startedAt] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const [showClubPicker, setShowClubPicker] = useState(false);
  const [lagreFeil, setLagreFeil] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // ── Persistering: debounce + flush ──────────────────────────────
  const countsRef = useRef(counts);
  countsRef.current = counts;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function lagre(): Promise<boolean> {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const payload = Object.entries(countsRef.current).map(([club, count]) => ({ club, count }));
    try {
      const res = await saveTapperCounts(sessionId, payload);
      setLagreFeil(!res.ok);
      return res.ok;
    } catch {
      setLagreFeil(true);
      return false;
    }
  }

  function planleggLagring() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void lagre(), 5_000);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function avslutt() {
    await lagre();
    router.push(`/portal/live/${sessionId}`);
  }

  function handleTap() {
    if (paused) return;
    setCounts((prev) => ({
      ...prev,
      [activeClubId]: (prev[activeClubId] ?? 0) + 1,
    }));
    planleggLagring();
    // Haptic feedback hvis tilgjengelig
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(20);
      } catch {
        /* noop */
      }
    }
  }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeClub = defaultClubs.find((c) => c.id === activeClubId);
  const activeCount = counts[activeClubId] ?? 0;

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  // Long-press to confirm end
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [endProgress, setEndProgress] = useState(0);

  function startEndPress() {
    setEndProgress(0);
    const start = Date.now();
    longPressTimer.current = setInterval(() => {
      const pct = Math.min(1, (Date.now() - start) / 800);
      setEndProgress(pct);
      if (pct >= 1) {
        cancelEndPress();
        void avslutt();
      }
    }, 30);
  }
  function cancelEndPress() {
    if (longPressTimer.current) clearInterval(longPressTimer.current);
    longPressTimer.current = null;
    setEndProgress(0);
  }

  return (
    <div className="fixed inset-0 grid grid-rows-[56px_1fr_auto] overflow-hidden bg-[#0A1F18] text-white">
      {/* Radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(209,248,67,0.05) 0%, rgba(209,248,67,0) 60%)",
        }}
      />

      {/* Topbar */}
      <div className="relative z-10 flex items-center gap-2 border-b border-white/5 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.10em] text-white/95">
            Range-mode
          </div>
          <div className="hidden items-center gap-2 font-mono text-[12px] text-white/65 tabular-nums sm:inline-flex">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
            {fmtTime(startedAt)} → {fmtTime(now)}
          </div>
        </div>
        <div className="flex-1 truncate text-center font-sans text-[13px] text-white/60">
          {facilityLabel}
        </div>
        <button
          type="button"
          onClick={() => void avslutt()}
          aria-label="Lukk tapper"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Tap zone */}
      <div className="relative z-0 flex flex-col items-center justify-center px-4 pt-6">
        <button
          type="button"
          onClick={() => setShowClubPicker((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-accent bg-[rgba(209,248,67,0.08)] px-6 py-2.5 font-sans text-[14px] font-semibold text-white transition-colors hover:bg-[rgba(209,248,67,0.14)]"
        >
          <span className="text-accent">▲</span>
          <span className="font-semibold text-[15px]">
            {activeClub?.name ?? "Velg kølle"}
          </span>
          <span className="inline-flex items-center gap-1 border-l border-white/20 pl-4 font-sans text-[12px] text-white/65">
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
            Bytt
          </span>
        </button>

        {showClubPicker && (
          <div className="z-20 mt-2 flex max-w-full flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            {defaultClubs.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveClubId(c.id);
                  setShowClubPicker(false);
                }}
                className={`min-h-[44px] rounded-full px-4 py-2 font-sans text-[13px] font-medium transition-colors ${
                  c.id === activeClubId
                    ? "bg-accent text-accent-foreground"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div
          className="mt-8 font-mono font-medium leading-[0.9] text-accent tabular-nums"
          style={{
            fontSize: "clamp(120px, 28vw, 220px)",
            letterSpacing: "-0.06em",
            textShadow: "0 0 40px rgba(209,248,67,0.32)",
          }}
        >
          {activeCount}
        </div>
        <div className="mt-2 font-sans text-[16px] text-white/65 sm:text-[18px]">
          ball med {activeClub?.name.toLowerCase() ?? "valgt kølle"}
        </div>

        {/* Mini stats */}
        <div className="mt-8 flex max-w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-2">
          {defaultClubs.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="inline-flex items-baseline gap-1.5 font-mono text-[13px] tabular-nums text-white/75"
            >
              <span className="font-normal text-white/50">{c.name}</span>
              {counts[c.id] ?? 0}
            </div>
          ))}
          <div className="inline-flex items-baseline gap-1.5 font-mono text-[14px] font-medium tabular-nums text-accent">
            <span className="font-normal text-accent/65">Totalt</span>
            {totalCount}
          </div>
        </div>
      </div>

      {/* Floating right-side actions (desktop) */}
      <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
        <button
          type="button"
          onMouseDown={startEndPress}
          onMouseUp={cancelEndPress}
          onMouseLeave={cancelEndPress}
          onTouchStart={startEndPress}
          onTouchEnd={cancelEndPress}
          aria-label="Avslutt (hold inne)"
          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/20 bg-white/[0.04] text-white transition-colors hover:bg-white/10"
        >
          <StopCircle className="h-5 w-5" strokeWidth={1.75} />
          {endProgress > 0 && (
            <div
              className="absolute inset-0 -z-0 bg-accent/30"
              style={{
                clipPath: `inset(${(1 - endProgress) * 100}% 0 0 0)`,
              }}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setPaused((p) => {
              if (!p) void lagre();
              return !p;
            });
          }}
          aria-label={paused ? "Fortsett" : "Pause"}
          className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-white/[0.04] text-white transition-colors hover:bg-white/10"
        >
          {paused ? (
            <Play className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Pause className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* TAP-knapp */}
      <div
        className="relative z-10 px-4 pb-6 pt-2 sm:px-6 sm:pb-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        <button
          type="button"
          onClick={handleTap}
          disabled={paused}
          className="flex h-[120px] w-full flex-col items-center justify-center gap-1 rounded-[20px] text-foreground transition-transform active:scale-[0.985] disabled:opacity-50"
          style={{
            background: "linear-gradient(180deg, #D1F843 0%, #C2EE2F 100%)",
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 18px 40px rgba(209,248,67,0.22)",
          }}
        >
          <span
            className="font-display font-bold uppercase"
            style={{ fontSize: 32, letterSpacing: "0.06em", lineHeight: 1 }}
          >
            {paused ? "Pauset" : "Tap"}
          </span>
          <span
            className="font-sans font-medium"
            style={{ color: "rgba(10,31,24,0.62)", fontSize: 13 }}
          >
            {paused ? "trykk pause for å fortsette" : "for å logge én ball"}
          </span>
        </button>

        {/* Mobile pause/stop row */}
        <div className="mt-2 flex gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => {
              setPaused((p) => {
                if (!p) void lagre();
                return !p;
              });
            }}
            className="min-h-[56px] flex-1 rounded-2xl border border-white/20 bg-white/[0.04] font-sans text-[14px] font-medium text-white transition-colors hover:bg-white/10"
          >
            {paused ? "Fortsett" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => void avslutt()}
            className="min-h-[56px] flex-1 rounded-2xl border border-white/20 bg-white/[0.04] text-center font-sans text-[14px] font-medium text-white transition-colors hover:bg-white/10"
          >
            Avslutt
          </button>
        </div>

        <p className="mt-2 text-center font-mono text-[11px] text-white/40">
          {lagreFeil ? "Kunne ikke lagre — prøver igjen ved neste tap." : "Lagres automatisk."}
        </p>
      </div>
    </div>
  );
}
