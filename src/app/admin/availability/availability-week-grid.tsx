"use client";

/**
 * AvailabilityWeekGrid — drag-to-create tilgjengelighet på et time-rutenett.
 *
 * Klikk på en dag-kolonne ved en time, dra nedover, slipp → bekreft-popover
 * med anlegg-velger → lagres som ukentlig CoachAvailability. Eksisterende
 * ukentlige vinduer rendres som blokker (farget per anlegg). UKEN er ren UI;
 * lagring scoper alltid mot innlogget coach (server). Finpuss av drag-følelsen
 * skjer via Claude Design — dette er den funksjonelle grunnmuren.
 */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSlot } from "./actions";
import type { LocationOption } from "./slot-form";

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const DAY_START = 6; // 06:00
const DAY_END = 22; // 22:00
const ROWS = (DAY_END - DAY_START) * 2; // 30-min rader

export type WeekWindow = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  locationName: string | null;
};

function radTilTid(rad: number): string {
  const total = DAY_START * 60 + rad * 30;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function AvailabilityWeekGrid({
  locations,
  windows,
}: {
  locations: LocationOption[];
  windows: WeekWindow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const dragDag = useRef<number | null>(null);
  const [drag, setDrag] = useState<{ dag: number; a: number; b: number } | null>(null);
  const [bekreft, setBekreft] = useState<{ dag: number; start: string; end: string } | null>(null);
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [livePreview, setLivePreview] = useState<string>("");

  // Forbedret drag: bruk pointer events for touch + mus, bedre preview
  function startDrag(dag: number, rad: number, e?: React.PointerEvent) {
    dragDag.current = dag;
    setDrag({ dag, a: rad, b: rad });
    setLivePreview(radTilTid(rad));
    if (e) (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function moveDrag(dag: number, rad: number) {
    if (dragDag.current === dag) {
      setDrag((d) => {
        if (!d) return null;
        const newDrag = { ...d, b: rad };
        setLivePreview(`${radTilTid(Math.min(newDrag.a, newDrag.b))}–${radTilTid(Math.max(newDrag.a, newDrag.b) + 1)}`);
        return newDrag;
      });
    }
  }

  function endDrag() {
    if (!drag) return;
    const lav = Math.min(drag.a, drag.b);
    const hoy = Math.max(drag.a, drag.b);
    dragDag.current = null;
    setDrag(null);
    setLivePreview("");
    setFeil(null);
    // Sjekk overlap med eksisterende (enkel)
    const overlapping = windows.some(w => 
      w.weekday === drag.dag && 
      !(radTilTid(hoy + 1) <= w.startTime || radTilTid(lav) >= w.endTime)
    );
    if (overlapping) {
      setFeil("Overlapper med eksisterende vindu. Juster først.");
      return;
    }
    setBekreft({ dag: lav === hoy ? lav : lav, start: radTilTid(lav), end: radTilTid(hoy + 1) });
  }

  // Forbedring: støtt klikk for enkelt slot + drag
  function handleSlotClick(dag: number, rad: number) {
    if (drag) return; // ikke hvis drar
    const tid = radTilTid(rad);
    setBekreft({ dag, start: tid, end: radTilTid(rad + 1) });
  }

  function lagre() {
    if (!bekreft || !locationId) {
      setFeil("Velg et anlegg.");
      return;
    }
    startTransition(async () => {
      try {
        await addSlot({
          weekday: bekreft.dag,
          startTime: bekreft.start,
          endTime: bekreft.end,
          active: true,
          locationId,
        });
        setBekreft(null);
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <div className="select-none relative">
      {/* Live drag preview bar */}
      {livePreview && (
        <div className="absolute top-0 left-0 right-0 bg-accent/90 text-accent-foreground text-center py-1 font-mono text-xs z-10 rounded-t">
          Dragging: {livePreview} (slipp for å bekrefte)
        </div>
      )}
      <div className="grid grid-cols-[44px_repeat(7,1fr)] gap-px rounded-xl border border-border bg-border overflow-hidden">
        {/* Header */}
        <div className="bg-card" />
        {DAGER.map((d) => (
          <div key={d} className="bg-card py-1.5 text-center font-mono text-[9px] font-extrabold tracking-[0.08em] text-muted-foreground">
            {d}
          </div>
        ))}

        {/* Rader */}
        {Array.from({ length: ROWS }).map((_, rad) => {
          const erHel = rad % 2 === 0;
          return (
            <FragmentRow key={rad}>
              <div className="bg-card pr-1 text-right font-mono text-[8px] leading-[18px] text-muted-foreground">
                {erHel ? radTilTid(rad) : ""}
              </div>
              {DAGER.map((_, dag) => {
                const iDrag =
                  drag?.dag === dag &&
                  rad >= Math.min(drag.a, drag.b) &&
                  rad <= Math.max(drag.a, drag.b);
                return (
                  <button
                    key={dag}
                    type="button"
                    onPointerDown={(e) => startDrag(dag, rad, e)}
                    onPointerEnter={() => moveDrag(dag, rad)}
                    onPointerUp={endDrag}
                    onClick={() => handleSlotClick(dag, rad)}
                    className={
                      "h-[18px] w-full bg-card transition-colors cursor-crosshair " +
                      (iDrag ? "bg-accent/60 ring-1 ring-accent" : erHel ? "" : "bg-background/40") +
                      " hover:bg-secondary active:bg-accent/30"
                    }
                    aria-label={`${DAGER[dag]} ${radTilTid(rad)}`}
                  />
                );
              })}
            </FragmentRow>
          );
        })}
      </div>

      {/* Eksisterende vinduer (read-only oppsummering under rutenettet) */}
      {windows.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {windows.map((w) => (
            <span
              key={w.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/[0.08] px-2.5 py-1 font-mono text-[10px] text-success"
            >
              {DAGER[w.weekday]} {w.startTime}–{w.endTime}
              <span className="text-muted-foreground">· {w.locationName ?? "Alle steder"}</span>
            </span>
          ))}
        </div>
      )}

      {/* Bekreft-popover etter drag */}
      {bekreft && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Tilgjengelig{" "}
              <em className="font-normal text-primary md:italic">
                {DAGER[bekreft.dag]} {bekreft.start}–{bekreft.end}
              </em>
              ?
            </h3>
            <label className="mt-4 block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Anlegg
              </span>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-ring"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            {feil && (
              <div role="alert" className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {feil}
              </div>
            )}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBekreft(null)}
                disabled={pending}
                className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium hover:border-border"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={lagre}
                disabled={pending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Lagrer…" : "Godkjenn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
