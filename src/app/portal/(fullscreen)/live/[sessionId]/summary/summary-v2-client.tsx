"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Save,
  Send,
  Star,
  Target,
  Video,
} from "lucide-react";

type Pyr = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type SummaryV2Data = {
  sessionId: string;
  title: string;
  coachName: string;
  durationMin: number;
  plannedMin: number;
  totalReps: { dry: number; lav: number; full: number };
  plannedReps: { dry: number; lav: number; full: number };
  hitRate: number; // 0..1
  pyrTotals: { area: Pyr; reps: number; pct: number }[];
  drills: {
    id: string;
    index: number;
    name: string;
    pyramidArea: Pyr;
    actual: { dry: number; lav: number; full: number };
    target: { dry: number; lav: number; full: number };
    tm: { smashFactor: string; ballSpeed: string; launchAngle: string } | null;
    notes: string;
    videoCount: number;
  }[];
};

const PYR_TONE: Record<Pyr, { bg: string; text: string; tile: string }> = {
  FYS: { bg: "bg-[rgba(0,88,64,0.13)]", text: "text-[#005840]", tile: "bg-[#005840]" },
  TEK: { bg: "bg-[rgba(26,125,86,0.13)]", text: "text-[#1A7D56]", tile: "bg-[#1A7D56]" },
  SLAG: { bg: "bg-[rgba(209,248,67,0.55)]", text: "text-[#0A1F17]", tile: "bg-[#D1F843] text-[#0A1F17]" },
  SPILL: { bg: "bg-[rgba(184,133,42,0.13)]", text: "text-[#B8852A]", tile: "bg-[#B8852A]" },
  TURN: { bg: "bg-[rgba(94,92,87,0.13)]", text: "text-[#5E5C57]", tile: "bg-[#5E5C57]" },
};

export function SummaryV2Client({ data }: { data: SummaryV2Data }) {
  const [open, setOpen] = useState<string | null>(data.drills[0]?.id ?? null);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const totalReps =
    data.totalReps.dry + data.totalReps.lav + data.totalReps.full;
  const plannedReps =
    data.plannedReps.dry + data.plannedReps.lav + data.plannedReps.full;
  const hitRatePct = Math.round(data.hitRate * 100);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-[920px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href={`/portal/live/${data.sessionId}/active`}
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[12px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbake til økt
        </Link>

        {/* HERO */}
        <section
          className="overflow-hidden rounded-2xl border border-border p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, #FAFAF7 0%, #FFFFFF 60%, rgba(209,248,67,0.16) 100%)",
          }}
        >
          <div className="inline-flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2C7D52]" />
            ØKT FULLFØRT · OPPSUMMERING
          </div>
          <h1 className="mt-3 font-display text-[28px] font-medium leading-[1.05] -tracking-[0.02em] text-foreground sm:text-[36px]">
            {data.title}
          </h1>
          <p className="mt-2 font-mono text-[11.5px] text-muted-foreground">
            Med {data.coachName} · {data.durationMin} min (planlagt{" "}
            {data.plannedMin} min)
          </p>
        </section>

        {/* TOTALER */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi
            label="VARIGHET"
            value={String(data.durationMin)}
            unit="min"
            sub={`av ${data.plannedMin}`}
            featured
            icon={<Clock className="h-3.5 w-3.5" strokeWidth={1.75} />}
          />
          <Kpi
            label="TOTAL REPS"
            value={String(totalReps)}
            unit="reps"
            sub={`av ${plannedReps}`}
            icon={<Target className="h-3.5 w-3.5" strokeWidth={1.75} />}
          />
          <Kpi label="HIT-RATE" value={`${hitRatePct}%`} unit="" sub="mål nådd" />
          <Kpi
            label="DRILLS"
            value={String(data.drills.length)}
            unit="ferdige"
            sub="fullført"
          />
        </section>

        {/* REPS PER KATEGORI */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
              Reps per kategori
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              dry / lav / full
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {(["dry", "lav", "full"] as const).map((k) => {
              const label = k === "dry" ? "Dry-swing" : k === "lav" ? "Lav" : "Full";
              const v = data.totalReps[k];
              const p = data.plannedReps[k];
              const pct = p > 0 ? Math.min(100, (v / p) * 100) : 0;
              return (
                <div
                  key={k}
                  className="rounded-xl border border-border bg-secondary/30 p-3"
                >
                  <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display text-[22px] font-semibold tabular-nums text-foreground">
                      {v}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      / {p}
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PYRAMIDE-FORDELING */}
        {data.pyrTotals.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
              Pyramide-fordeling
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {data.pyrTotals.map((p) => {
                const t = PYR_TONE[p.area];
                return (
                  <div
                    key={p.area}
                    className={`flex items-center justify-between rounded-md px-3 py-2 ${t.bg}`}
                  >
                    <span className={`font-mono text-[11px] font-bold ${t.text}`}>
                      {p.area}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-foreground">
                      {p.reps} reps · {p.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* PER-DRILL ACCORDION */}
        <section>
          <h2 className="mb-3 font-display text-[16px] font-semibold -tracking-[0.01em] text-foreground">
            Per drill
          </h2>
          <div className="flex flex-col gap-2">
            {data.drills.map((d) => {
              const tone = PYR_TONE[d.pyramidArea];
              const isOpen = open === d.id;
              const actualTotal = d.actual.dry + d.actual.lav + d.actual.full;
              const targetTotal = d.target.dry + d.target.lav + d.target.full;
              const pct =
                targetTotal > 0
                  ? Math.min(100, Math.round((actualTotal / targetTotal) * 100))
                  : 0;
              return (
                <div
                  key={d.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : d.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/30"
                  >
                    <div
                      className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-md font-mono text-[11px] font-bold text-white ${tone.tile}`}
                    >
                      {String(d.index).padStart(2, "0")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[14px] font-semibold -tracking-[0.005em] text-foreground">
                        {d.name}
                      </div>
                      <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground tabular-nums">
                        {actualTotal} / {targetTotal} reps · {pct}%
                      </div>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${tone.bg} ${tone.text}`}
                    >
                      {d.pyramidArea}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                    )}
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t border-border bg-secondary/20 p-4">
                      {/* Faktisk vs mål */}
                      <div className="grid grid-cols-3 gap-2">
                        {(["dry", "lav", "full"] as const).map((k) => {
                          const label = k === "dry" ? "Dry" : k === "lav" ? "Lav" : "Full";
                          return (
                            <div
                              key={k}
                              className="rounded-md bg-card p-2.5 text-center"
                            >
                              <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                                {label}
                              </div>
                              <div className="mt-1 flex items-baseline justify-center gap-1">
                                <span className="font-mono text-[16px] font-semibold tabular-nums text-foreground">
                                  {d.actual[k]}
                                </span>
                                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                  / {d.target[k]}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* TM-data */}
                      {d.tm && (
                        <div className="rounded-md bg-card p-3">
                          <div className="mb-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            TrackMan-snitt
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <TmCell label="Smash" value={d.tm.smashFactor} />
                            <TmCell label="Ball speed" value={d.tm.ballSpeed} />
                            <TmCell label="Launch" value={d.tm.launchAngle} />
                          </div>
                        </div>
                      )}

                      {/* Notater */}
                      {d.notes && (
                        <div className="rounded-md bg-card p-3">
                          <div className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            <FileText className="h-3 w-3" strokeWidth={2} />
                            Notat
                          </div>
                          <p className="font-sans text-[12.5px] leading-[1.5] text-foreground">
                            {d.notes}
                          </p>
                        </div>
                      )}

                      {/* Video-thumbs */}
                      {d.videoCount > 0 && (
                        <div className="rounded-md bg-card p-3">
                          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            <Video className="h-3 w-3" strokeWidth={2} />
                            {d.videoCount} video{d.videoCount === 1 ? "" : "er"}
                          </div>
                          <div className="flex gap-2">
                            {Array.from({ length: d.videoCount }).map((_, i) => (
                              <div
                                key={i}
                                className="grid h-16 w-24 place-items-center rounded-md bg-primary/10"
                              >
                                <Video
                                  className="h-5 w-5 text-primary"
                                  strokeWidth={1.5}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SELVEVALUERING */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Hvordan føltes økten?
          </div>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = (hover || stars) >= n;
              return (
                <button
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setStars(n)}
                  className="p-1 transition-transform active:scale-90"
                  aria-label={`${n} stjerner`}
                >
                  <Star
                    className={`h-9 w-9 ${filled ? "fill-[#D1F843] text-[#0A1F17]" : "text-muted-foreground/40"}`}
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
            <span className="ml-2 font-mono text-[12px] text-muted-foreground tabular-nums">
              {stars}/5
            </span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Kommentar til Anders (frivillig)…"
            rows={3}
            className="mt-3 w-full rounded-md border border-border bg-background p-3 font-sans text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-1 focus:ring-ring"
          />
        </section>
      </div>

      {/* STICKY BOTTOM BAR */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-[920px] items-center gap-2 px-4 py-3 sm:gap-3">
          <button className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 font-sans text-[13px] font-semibold text-foreground hover:border-foreground/30">
            <Save className="h-4 w-4" strokeWidth={2} />
            Lagre uten å sende
          </button>
          <button className="inline-flex min-h-11 flex-[1.4] items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 font-display text-[14px] font-semibold text-accent-foreground hover:opacity-90">
            <Send className="h-4 w-4" strokeWidth={2} />
            Send til {data.coachName.split(" ")[0]}
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  featured,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  featured?: boolean;
  icon?: React.ReactNode;
}) {
  if (featured) {
    return (
      <div
        className="rounded-xl p-4 text-primary-foreground"
        style={{
          background: "linear-gradient(135deg, #003A2A 0%, #005840 100%)",
        }}
      >
        <div className="flex items-center gap-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] opacity-70">
          {icon && <span className="opacity-60">{icon}</span>}
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-display text-[28px] font-semibold -tracking-[0.02em] text-accent tabular-nums">
            {value}
          </span>
          {unit && <span className="font-mono text-[11px] opacity-70">{unit}</span>}
        </div>
        {sub && (
          <div className="mt-0.5 font-mono text-[10px] opacity-65">{sub}</div>
        )}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {icon && <span className="text-muted-foreground/70">{icon}</span>}
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[24px] font-semibold -tracking-[0.02em] text-foreground tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}

function TmCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[14px] font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}
