"use client";

/**
 * AvailabilityWeekGrid — drag-to-create tilgjengelighet på et time-rutenett,
 * v2-port 16. juli 2026. Samme drag/klikk-logikk og samme addSlot-action
 * uendret — kun presentasjonslaget er nytt (T-tokens i stedet for Tailwind).
 *
 * Klikk på en dag-kolonne ved en time, dra nedover, slipp → bekreft-popover
 * med anlegg-velger → lagres som ukentlig CoachAvailability.
 */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/components/v2";
import { addSlot } from "@/app/admin/(legacy)/availability/actions";
import type { LocationOption } from "./AdminSlotFormV2";

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const DAY_START = 6;
const DAY_END = 22;
const ROWS = (DAY_END - DAY_START) * 2;

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

export function AvailabilityWeekGridV2({ locations, windows }: { locations: LocationOption[]; windows: WeekWindow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const dragDag = useRef<number | null>(null);
  const [drag, setDrag] = useState<{ dag: number; a: number; b: number } | null>(null);
  const [bekreft, setBekreft] = useState<{ dag: number; start: string; end: string } | null>(null);
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [livePreview, setLivePreview] = useState<string>("");

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
    const overlapping = windows.some(
      (w) => w.weekday === drag.dag && !(radTilTid(hoy + 1) <= w.startTime || radTilTid(lav) >= w.endTime),
    );
    if (overlapping) {
      setFeil("Overlapper med eksisterende vindu. Juster først.");
      return;
    }
    setBekreft({ dag: lav, start: radTilTid(lav), end: radTilTid(hoy + 1) });
  }

  function handleSlotClick(dag: number, rad: number) {
    if (drag) return;
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
        await addSlot({ weekday: bekreft.dag, startTime: bekreft.start, endTime: bekreft.end, active: true, locationId });
        setBekreft(null);
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <div style={{ userSelect: "none", position: "relative" }}>
      {livePreview && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: `color-mix(in srgb, ${T.lime} 90%, transparent)`, color: T.onLime, textAlign: "center", padding: "4px 0", fontFamily: T.mono, fontSize: 11, zIndex: 10, borderRadius: "10px 10px 0 0" }}>
          Dragging: {livePreview} (slipp for å bekrefte)
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `44px repeat(7, 1fr)`, gap: 1, borderRadius: 12, border: `1px solid ${T.border}`, background: T.border, overflow: "hidden" }}>
        <div style={{ background: T.panel }} />
        {DAGER.map((d) => (
          <div key={d} style={{ background: T.panel, padding: "6px 0", textAlign: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: T.mut }}>
            {d}
          </div>
        ))}

        {Array.from({ length: ROWS }).map((_, rad) => {
          const erHel = rad % 2 === 0;
          return (
            <FragmentRow key={rad}>
              <div style={{ background: T.panel, paddingRight: 4, textAlign: "right", fontFamily: T.mono, fontSize: 8, lineHeight: "18px", color: T.mut }}>
                {erHel ? radTilTid(rad) : ""}
              </div>
              {DAGER.map((_, dag) => {
                const iDrag = drag?.dag === dag && rad >= Math.min(drag.a, drag.b) && rad <= Math.max(drag.a, drag.b);
                return (
                  <button
                    key={dag}
                    type="button"
                    onPointerDown={(e) => startDrag(dag, rad, e)}
                    onPointerEnter={() => moveDrag(dag, rad)}
                    onPointerUp={endDrag}
                    onClick={() => handleSlotClick(dag, rad)}
                    aria-label={`${DAGER[dag]} ${radTilTid(rad)}`}
                    style={{
                      height: 18, width: "100%", cursor: "crosshair", border: "none", padding: 0,
                      background: iDrag ? `color-mix(in srgb, ${T.lime} 55%, transparent)` : erHel ? T.panel : T.panel2,
                    }}
                  />
                );
              })}
            </FragmentRow>
          );
        })}
      </div>

      {windows.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {windows.map((w) => (
            <span
              key={w.id}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.up} 30%, transparent)`, background: `color-mix(in srgb, ${T.up} 8%, transparent)`, padding: "4px 10px", fontFamily: T.mono, fontSize: 10, color: T.up }}
            >
              {DAGER[w.weekday]} {w.startTime}–{w.endTime}
              <span style={{ color: T.mut }}>· {w.locationName ?? "Alle steder"}</span>
            </span>
          ))}
        </div>
      )}

      {bekreft && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.55)", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 380, borderRadius: T.rCard, border: `1px solid ${T.borderS}`, background: T.panel, padding: 22, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <h3 style={{ margin: 0, fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>
              Tilgjengelig <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>{DAGER[bekreft.dag]} {bekreft.start}–{bekreft.end}</em>?
            </h3>
            <label style={{ display: "block", marginTop: 16 }}>
              <span style={{ display: "block", marginBottom: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>Anlegg</span>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                style={{ width: "100%", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" }}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </label>
            {feil && (
              <div role="alert" style={{ marginTop: 12, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontSize: 13, color: T.down }}>
                {feil}
              </div>
            )}
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setBekreft(null)} disabled={pending} style={{ borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.fg, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
                Avbryt
              </button>
              <button type="button" onClick={lagre} disabled={pending} style={{ borderRadius: 9999, border: "1px solid transparent", background: T.lime, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.onLime, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
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
