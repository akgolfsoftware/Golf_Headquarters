"use client";

/**
 * AgencyOS — Tidsvindu-skjema (opprett/endre/slett), v2-port 16. juli 2026.
 * Samme server actions (addSlot/updateSlot/deleteSlot) og samme state-
 * maskin (ukentlig vs. spesifikk dato, periode, repetisjon) uendret.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T, Caps } from "@/components/v2";
import { addSlot, updateSlot, deleteSlot } from "@/app/admin/(legacy)/availability/actions";

const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export type LocationOption = { id: string; name: string };

type Props = {
  locations: LocationOption[];
  initial?: {
    id: string;
    weekday: number | null;
    date: string | null;
    startTime: string;
    endTime: string;
    active: boolean;
    locationId: string | null;
    validFrom: string | null;
    validTo: string | null;
    recurrenceInterval: number | null;
  };
  defaultWeekday?: number;
  triggerLabel: string;
  triggerVariant?: "cta" | "lenke";
};

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", marginBottom: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>{label}</span>
      {children}
    </label>
  );
}
const inputStyle: React.CSSProperties = { width: "100%", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" };

function ModeKnapp({ aktiv, onClick, children }: { aktiv: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      style={{
        borderRadius: 10, border: `1px solid ${aktiv ? T.lime : T.border}`, padding: "10px 14px", fontSize: 13, fontWeight: 600,
        color: aktiv ? T.lime : T.fg, background: aktiv ? `color-mix(in srgb, ${T.lime} 10%, transparent)` : T.panel2, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function SlotFormV2({ locations, initial, defaultWeekday, triggerLabel, triggerVariant = "cta" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"weekly" | "date">(initial?.date ? "date" : "weekly");
  const [weekday, setWeekday] = useState(initial?.weekday ?? defaultWeekday ?? 0);
  const [date, setDate] = useState(initial?.date ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "10:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "18:00");
  const [active, setActive] = useState(initial?.active ?? true);
  const [locationId, setLocationId] = useState(initial?.locationId ?? locations[0]?.id ?? "");
  const [visPeriode, setVisPeriode] = useState(Boolean(initial?.validFrom || initial?.validTo));
  const [validFrom, setValidFrom] = useState(initial?.validFrom ?? "");
  const [validTo, setValidTo] = useState(initial?.validTo ?? "");
  const [recurrence, setRecurrence] = useState(initial?.recurrenceInterval ?? 1);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (startTime >= endTime) {
      setError("Slutt-tid må være etter start-tid.");
      return;
    }
    if (mode === "date" && !date) {
      setError("Velg en dato.");
      return;
    }
    if (!locationId) {
      setError("Velg et anlegg.");
      return;
    }
    setError(null);
    const payload = {
      weekday: mode === "weekly" ? weekday : null,
      date: mode === "date" ? date : null,
      startTime,
      endTime,
      active,
      locationId,
      validFrom: visPeriode && validFrom ? validFrom : null,
      validTo: visPeriode && validTo ? validTo : null,
      recurrenceInterval: mode === "weekly" ? recurrence : null,
    };
    startTransition(async () => {
      try {
        if (initial) await updateSlot(initial.id, payload);
        else await addSlot(payload);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm("Slett tidsvinduet?")) return;
    startTransition(async () => {
      try {
        await deleteSlot(initial.id);
        router.refresh();
      } catch {
        setError("Kunne ikke slette.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={
          triggerVariant === "lenke"
            ? { background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 11, color: T.lime, textTransform: "uppercase", letterSpacing: "0.06em" }
            : { borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: T.fg, cursor: "pointer" }
        }
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        style={{ borderRadius: T.rCard, border: `1px solid ${T.borderS}`, background: T.panel, padding: 0, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", maxWidth: 400, width: "100%", color: T.fg }}
      >
        <form onSubmit={lagre} style={{ padding: 22 }}>
          <Caps>{initial ? "Endre" : "Nytt"} tidsvindu</Caps>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <Felt label="Anlegg">
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)} style={inputStyle}>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </Felt>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <ModeKnapp aktiv={mode === "weekly"} onClick={() => setMode("weekly")}>Ukentlig</ModeKnapp>
              <ModeKnapp aktiv={mode === "date"} onClick={() => setMode("date")}>Spesifikk dato</ModeKnapp>
            </div>

            {mode === "weekly" ? (
              <>
                <Felt label="Ukedag">
                  <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} style={inputStyle}>
                    {DAGER.map((d, i) => (
                      <option key={d} value={i}>{d}</option>
                    ))}
                  </select>
                </Felt>
                <Felt label="Repetisjon">
                  <select value={recurrence} onChange={(e) => setRecurrence(Number(e.target.value))} style={inputStyle}>
                    <option value={1}>Hver uke</option>
                    <option value={2}>Annenhver uke</option>
                    <option value={3}>Hver tredje uke</option>
                    <option value={4}>Hver fjerde uke</option>
                  </select>
                </Felt>
              </>
            ) : (
              <Felt label="Dato">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
              </Felt>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Felt label="Start">
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
              </Felt>
              <Felt label="Slutt">
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
              </Felt>
            </div>

            {mode === "weekly" && (
              <div>
                <button
                  type="button"
                  onClick={() => setVisPeriode((v) => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}
                >
                  {visPeriode ? "− Periode" : "+ Begrens til periode (valgfritt)"}
                </button>
                {visPeriode && (
                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Felt label="Fra">
                      <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} style={inputStyle} />
                    </Felt>
                    <Felt label="Til">
                      <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} style={inputStyle} />
                    </Felt>
                  </div>
                )}
              </div>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: T.fg }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Aktiv (bookbar)
            </label>
          </div>

          {error && (
            <div role="alert" style={{ marginTop: 14, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontSize: 13, color: T.down }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8 }}>
            {initial && (
              <button
                type="button"
                onClick={slett}
                disabled={pending}
                style={{ borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 6%, transparent)`, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: T.down, cursor: "pointer", opacity: pending ? 0.6 : 1 }}
              >
                Slett
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              style={{ marginLeft: "auto", borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.fg, cursor: "pointer", opacity: pending ? 0.6 : 1 }}
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              style={{ borderRadius: 9999, border: "1px solid transparent", background: T.lime, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.onLime, cursor: "pointer", opacity: pending ? 0.6 : 1 }}
            >
              {pending ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
