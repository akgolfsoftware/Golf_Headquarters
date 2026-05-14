"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  X,
  Plus,
  ChevronRight,
  Clock,
  Target,
  Dumbbell,
  Check,
  Loader2,
} from "lucide-react";
import { opprettRaskOkt } from "./actions";
import type { PyramidArea } from "@/generated/prisma/client";

// ── Typer ──────────────────────────────────────────────────────────────────

export type KalenderEvent = {
  sessionId?: string;
  title: string;
  meta: string;
  tone: "coach" | "self" | "group" | "round" | "tourn" | "fysio";
  top: number;
  height: number;
  status: "done" | "plan" | "skip" | "late";
  tier?: "fys" | "tek" | "slag" | "spill" | "turn";
  pyramidArea?: string;
  durationMin?: number;
  drillCount?: number;
  rationale?: string;
};

export type Favoritt = {
  title: string;
  pyramidArea: PyramidArea;
  durationMin: number;
};

const PYR_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

// Static class strings — Tailwind scans these at build time (no dynamic templates)
const TIER_COLOR: Record<string, string> = {
  fys: "bg-pyr-fys/20 border-l-4 border-l-pyr-fys",
  tek: "bg-pyr-tek/20 border-l-4 border-l-pyr-tek",
  slag: "bg-pyr-slag/20 border-l-4 border-l-pyr-slag",
  spill: "bg-pyr-spill/20 border-l-4 border-l-pyr-spill",
  turn: "bg-pyr-turn/20 border-l-4 border-l-pyr-turn",
};

const TONE_CLASS: Record<string, string> = {
  coach: "bg-accent/40 text-foreground border-l-4 border-l-accent",
  self: "bg-secondary text-foreground border border-dashed border-border border-l-4 border-l-primary",
  group: "bg-primary text-primary-foreground border-l-4 border-l-primary",
  round: "bg-accent/30 text-foreground border-l-4 border-l-accent",
  tourn: "bg-foreground text-accent border-l-4 border-l-accent",
  fysio: "bg-secondary text-muted-foreground border-l-4 border-l-border",
};

const STATUS_DOT: Record<string, string> = {
  done: "bg-primary",
  plan: "bg-accent",
  skip: "bg-destructive",
  late: "bg-destructive/60",
};

// ── Hjelpefunksjoner ───────────────────────────────────────────────────────

const HOUR_HEIGHT = 54; // px per time
const FIRST_HOUR = 6;

function yTilTid(y: number): { hour: number; min: number } {
  const totalMin = Math.max(0, (y / HOUR_HEIGHT) * 60);
  const hour = Math.min(21, Math.floor(totalMin / 60) + FIRST_HOUR);
  const min = Math.round((totalMin % 60) / 15) * 15; // snap til kvarter
  return { hour: min === 60 ? hour + 1 : hour, min: min === 60 ? 0 : min };
}

function formaterTid(hour: number, min: number): string {
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function formaterDag(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ── Hoved-komponent ────────────────────────────────────────────────────────

export function KalenderInteraktiv({
  eventsPerDag,
  dager,
  todayLine,
  favoritter,
  isFree,
}: {
  eventsPerDag: KalenderEvent[][];
  dager: Date[];
  todayLine: { dag: number; top: number } | null;
  favoritter: Favoritt[];
  isFree: boolean;
}) {
  // Slot-hover: viser tidslabel på tom celle
  const [hoverSlot, setHoverSlot] = useState<{
    col: number;
    y: number;
    tid: string;
  } | null>(null);

  // Klikket slot: åpner modal
  const [selectedSlot, setSelectedSlot] = useState<{
    col: number;
    dato: Date;
    hour: number;
    min: number;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const handleColMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, colIndex: number) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const { hour, min } = yTilTid(y);
      setHoverSlot({ col: colIndex, y, tid: formaterTid(hour, min) });
    },
    []
  );

  const handleColClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, colIndex: number) => {
      // Ikke åpne modal hvis man klikker på en eksisterende event
      if ((e.target as HTMLElement).closest("[data-event]")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const { hour, min } = yTilTid(y);
      setSelectedSlot({ col: colIndex, dato: dager[colIndex], hour, min });
    },
    [dager]
  );

  const lukkeModal = useCallback(() => setSelectedSlot(null), []);

  return (
    <div className="relative">
      {/* Kalender-grid */}
      <div ref={gridRef} className="grid grid-cols-[60px_repeat(7,1fr)]">
        {/* Tidslinje-kolonne */}
        <div className="flex flex-col">
          {Array.from({ length: 16 }, (_, i) => i + FIRST_HOUR).map((h) => (
            <div
              key={h}
              className="h-[54px] border-b border-r border-border/60 px-2 py-2 text-right font-mono text-[10px] text-muted-foreground"
            >
              {String(h).padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* Dag-kolonner */}
        {dager.map((dag, colIdx) => (
          <div
            key={colIdx}
            className="relative min-h-[864px] cursor-crosshair border-l border-border/60"
            onMouseMove={(e) => handleColMouseMove(e, colIdx)}
            onMouseLeave={() => setHoverSlot(null)}
            onClick={(e) => handleColClick(e, colIdx)}
          >
            {/* Nå-linje */}
            {todayLine?.dag === colIdx && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-10 h-0.5 bg-destructive"
                style={{ top: todayLine.top }}
              >
                <span className="absolute -left-2 -top-1 h-2 w-2 rounded-full bg-destructive" />
              </div>
            )}

            {/* Hover-indikator på tom slot */}
            {hoverSlot?.col === colIdx && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-20 flex items-center gap-1.5 px-2"
                style={{ top: hoverSlot.y - 10 }}
              >
                <div className="h-px flex-1 bg-primary/40" />
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  {hoverSlot.tid}
                </span>
              </div>
            )}

            {/* Events */}
            {eventsPerDag[colIdx].map((ev, j) => (
              <EventCard
                key={j}
                ev={ev}
                onHover={() => undefined}
                onLeave={() => undefined}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Slot-modal */}
      {selectedSlot && (
        <SlotModal
          dato={selectedSlot.dato}
          hour={selectedSlot.hour}
          min={selectedSlot.min}
          favoritter={favoritter}
          isFree={isFree}
          onLukk={lukkeModal}
        />
      )}
    </div>
  );
}

// ── Event-kort med hover-preview ───────────────────────────────────────────

function EventCard({
  ev,
  onHover,
  onLeave,
}: {
  ev: KalenderEvent;
  onHover: (ev: KalenderEvent, top: number) => void;
  onLeave: () => void;
}) {
  const [showPopover, setShowPopover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const toneClass = (ev.tier ? TIER_COLOR[ev.tier] : null) ?? TONE_CLASS[ev.tone] ?? TONE_CLASS.coach;

  const handleMouseEnter = () => {
    setShowPopover(true);
    onHover(ev, ev.top);
  };

  const handleMouseLeave = () => {
    setShowPopover(false);
    onLeave();
  };

  const inner = (
    <div
      ref={cardRef}
      data-event="true"
      className={`absolute left-1 right-1 rounded-md px-2 py-1.5 text-xs leading-tight transition-shadow text-foreground ${toneClass} ${showPopover ? "shadow-lg ring-1 ring-primary/30" : ""}`}
      style={{ top: ev.top, height: ev.height }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="line-clamp-1 font-semibold">{ev.title}</span>
        <span
          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[ev.status]}`}
        />
      </div>
      <div className="mt-0.5 font-mono text-[10px] opacity-75">{ev.meta}</div>

      {/* Popover preview */}
      {showPopover && (
        <div
          className="absolute left-full top-0 z-50 ml-2 w-56 rounded-xl border border-border bg-card p-4 shadow-xl"
          style={{ maxWidth: "calc(100vw - 200px)" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {ev.pyramidArea && (
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
              {PYR_LABEL[ev.pyramidArea] ?? ev.pyramidArea}
            </span>
          )}
          <p className="font-semibold text-foreground">{ev.title}</p>
          <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
              {ev.meta}
              {ev.durationMin && ` · ${ev.durationMin} min`}
            </div>
            {ev.drillCount != null && ev.drillCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Target className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                {ev.drillCount} drill{ev.drillCount === 1 ? "" : "s"}
              </div>
            )}
            {ev.rationale && (
              <p className="italic text-foreground/60">&ldquo;{ev.rationale}&rdquo;</p>
            )}
          </div>
          {ev.sessionId && (
            <Link
              href={`/portal/tren/${ev.sessionId}`}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Åpne økt
              <ChevronRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return inner;
}

// ── Slot-modal (klikk på tom tid) ─────────────────────────────────────────

const STANDARD_FAVORITTER: Favoritt[] = [
  { title: "Teknisk økt", pyramidArea: "TEK", durationMin: 60 },
  { title: "Putting-runde", pyramidArea: "SLAG", durationMin: 30 },
  { title: "Fysisk trening", pyramidArea: "FYS", durationMin: 45 },
];

function SlotModal({
  dato,
  hour,
  min,
  favoritter,
  isFree,
  onLukk,
}: {
  dato: Date;
  hour: number;
  min: number;
  favoritter: Favoritt[];
  isFree: boolean;
  onLukk: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [opprettet, setOpprettet] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const tidStr = formaterTid(hour, min);
  const datoStr = formaterDag(dato);

  const scheduledAt = new Date(dato);
  scheduledAt.setHours(hour, min, 0, 0);

  const viseFavoritter = favoritter.length > 0 ? favoritter : STANDARD_FAVORITTER;

  function opprett(fav: Favoritt) {
    if (isFree) return;
    setFeil(null);
    startTransition(async () => {
      const res = await opprettRaskOkt({
        title: fav.title,
        pyramidArea: fav.pyramidArea,
        durationMin: fav.durationMin,
        scheduledAt: scheduledAt.toISOString(),
      });
      if (res.ok) {
        setOpprettet(fav.title);
        setTimeout(onLukk, 1200);
      } else {
        setFeil(res.feil);
      }
    });
  }

  const nyOktUrl = `/portal/ny-okt?dato=${scheduledAt.toISOString().slice(0, 10)}&tid=${tidStr}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onLukk}
      />

      {/* Modal */}
      <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Ny økt
            </p>
            <p className="mt-0.5 font-semibold text-foreground">
              {datoStr} · {tidStr}
            </p>
          </div>
          <button
            type="button"
            onClick={onLukk}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Innhold */}
        <div className="p-4 space-y-3">
          {opprettet ? (
            <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-4 text-primary">
              <Check className="h-5 w-5 shrink-0" strokeWidth={2.5} />
              <p className="text-sm font-semibold">{opprettet} lagt til!</p>
            </div>
          ) : (
            <>
              {isFree ? (
                <div className="rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3 text-center text-sm text-muted-foreground">
                  Hurtig-opprett krever Pro.{" "}
                  <Link href="/portal/meg/abonnement" className="font-medium text-primary hover:underline">
                    Oppgrader
                  </Link>
                </div>
              ) : (
                <>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Rask-start
                  </p>
                  <div className="space-y-2">
                    {viseFavoritter.map((fav) => (
                      <button
                        key={fav.title}
                        type="button"
                        disabled={pending}
                        onClick={() => opprett(fav)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                      >
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                          {pending ? (
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                          ) : (
                            <Dumbbell className="h-4 w-4" strokeWidth={1.75} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {fav.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {PYR_LABEL[fav.pyramidArea] ?? fav.pyramidArea} · {fav.durationMin} min
                          </p>
                        </div>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {feil && (
                <p className="text-xs text-destructive">{feil}</p>
              )}

              <div className="border-t border-border pt-2">
                <Link
                  href={nyOktUrl}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Opprett tilpasset økt
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
