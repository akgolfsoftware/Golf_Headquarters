"use client";

/**
 * AgencyOS v2 — Tilgjengelighet (`/admin/availability`, AgencyOS Bølge 3.31,
 * 2026-07-14). Port fra `(legacy)/availability/page.tsx` + `availability-
 * week-grid.tsx` + `availability-year-gantt.tsx` + `slot-form.tsx` +
 * `availability-actions.tsx` — samme tre visninger (Måned/Uke-drag/År-Gantt),
 * samme `addSlot`/`updateSlot`/`deleteSlot`-kontrakt (bor i `(legacy)/
 * availability/actions.ts`, uendret, inkl. no-dobbeltsted-vernet).
 *
 * Drag-til-opprett i uke-visningen bruker samme pointer-event-logikk som
 * legacy, kun re-skinnet til v2-tokens. Bekreft-popover og rediger/opprett-
 * skjema bruker `BunnArk` i stedet for native `<dialog>`/fixed-div.
 *
 * `calendarSync`-prop: `page.tsx` render'er `CalendarSyncSectionV2` (v2,
 * AgencyOS Bølge 3.36, delt med `/admin/settings/calendar`) og sender
 * resultatet inn som denne proppen — den er en async server-komponent og
 * kan derfor ikke importeres direkte i denne klient-komponenten (standard
 * Next.js-mønster for server-komponenter inni klient-komponenter).
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Caps, Tittel, Kort, Knapp, Icon, T, BunnArk } from "@/components/v2";
import { Inndata, Velger, Bryter } from "@/components/v2/skjema";
import { addSlot, updateSlot, deleteSlot, type SlotInput } from "@/app/admin/(legacy)/availability/actions";

const DAGER_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const DAGER_LANG = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
const MND_KORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const DAY_START = 6;
const DAY_END = 22;
const ROWS = (DAY_END - DAY_START) * 2;

export type LocationOption = { id: string; name: string };

export interface MonthCellV2 {
  day: number | null;
  range: string | null;
  erIdag: boolean;
}

export interface WeekWindowV2 {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  locationName: string | null;
}

export interface YearWindowV2 {
  id: string;
  locationName: string | null;
  label: string;
  validFromIso: string | null;
  validToIso: string | null;
}

export interface SlotRadV2 {
  id: string;
  weekday: number | null;
  dateTekst: string | null;
  startTime: string;
  endTime: string;
  active: boolean;
  locationId: string | null;
  locationName: string | null;
  dateIso: string | null;
  validFromIso: string | null;
  validToIso: string | null;
  recurrenceInterval: number | null;
}

function radTilTid(rad: number): string {
  const total = DAY_START * 60 + rad * 30;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ── Slett/opprett/rediger-skjema — BunnArk ─────────────── */

interface SlotFormInitial {
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
}

function SlotFormArkV2({ locations, initial, defaultWeekday, defaultStart, defaultEnd, onLukk }: {
  locations: LocationOption[];
  initial?: SlotFormInitial;
  defaultWeekday?: number;
  defaultStart?: string;
  defaultEnd?: string;
  onLukk: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"weekly" | "date">(initial?.date ? "date" : "weekly");
  const [weekday, setWeekday] = useState(initial?.weekday ?? defaultWeekday ?? 0);
  const [date, setDate] = useState(initial?.date ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? defaultStart ?? "10:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? defaultEnd ?? "18:00");
  const [active, setActive] = useState(initial?.active ?? true);
  const [locationId, setLocationId] = useState(initial?.locationId ?? locations[0]?.id ?? "");
  const [visPeriode, setVisPeriode] = useState(Boolean(initial?.validFrom || initial?.validTo));
  const [validFrom, setValidFrom] = useState(initial?.validFrom ?? "");
  const [validTo, setValidTo] = useState(initial?.validTo ?? "");
  const [recurrence, setRecurrence] = useState(initial?.recurrenceInterval ?? 1);

  function lagre() {
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
    const payload: SlotInput = {
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
        router.refresh();
        onLukk();
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
        onLukk();
      } catch {
        setError("Kunne ikke slette.");
      }
    });
  }

  return (
    <BunnArk tittel={<>{initial ? "Endre" : "Nytt"} <em style={{ fontStyle: "italic", color: T.lime }}>tidsvindu</em></>} onLukk={onLukk} laast={pending} bredde={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Velger label="Anlegg" value={locationId} onChange={setLocationId} options={locations.map((l) => ({ value: l.id, label: l.name }))} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button" onClick={() => setMode("weekly")} style={{ cursor: "pointer", borderRadius: 10, border: `1px solid ${mode === "weekly" ? T.lime : T.borderS}`, background: mode === "weekly" ? `color-mix(in srgb, ${T.lime} 10%, transparent)` : T.panel2, color: mode === "weekly" ? T.lime : T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 600, padding: "9px 0" }}>Ukentlig</button>
          <button type="button" onClick={() => setMode("date")} style={{ cursor: "pointer", borderRadius: 10, border: `1px solid ${mode === "date" ? T.lime : T.borderS}`, background: mode === "date" ? `color-mix(in srgb, ${T.lime} 10%, transparent)` : T.panel2, color: mode === "date" ? T.lime : T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 600, padding: "9px 0" }}>Spesifikk dato</button>
        </div>

        {mode === "weekly" ? (
          <>
            <Velger label="Ukedag" value={String(weekday)} onChange={(v) => setWeekday(Number(v))} options={DAGER_LANG.map((d, i) => ({ value: String(i), label: d }))} />
            <Velger
              label="Repetisjon"
              value={String(recurrence)}
              onChange={(v) => setRecurrence(Number(v))}
              options={[{ value: "1", label: "Hver uke" }, { value: "2", label: "Annenhver uke" }, { value: "3", label: "Hver tredje uke" }, { value: "4", label: "Hver fjerde uke" }]}
            />
          </>
        ) : (
          <Inndata label="Dato" type="date" value={date} onChange={setDate} />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inndata label="Start" type="time" value={startTime} onChange={setStartTime} mono />
          <Inndata label="Slutt" type="time" value={endTime} onChange={setEndTime} mono />
        </div>

        {mode === "weekly" && (
          <div>
            <button type="button" onClick={() => setVisPeriode((v) => !v)} style={{ appearance: "none", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>
              {visPeriode ? "− Periode" : "+ Begrens til periode (valgfritt)"}
            </button>
            {visPeriode && (
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Inndata label="Fra" type="date" value={validFrom} onChange={setValidFrom} />
                <Inndata label="Til" type="date" value={validTo} onChange={setValidTo} />
              </div>
            )}
          </div>
        )}

        <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 12 }}>
          <Bryter label="Aktiv (bookbar)" sub={undefined} checked={active} onChange={setActive} />
        </div>

        {error && <div role="alert" style={{ borderRadius: 8, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, padding: "8px 12px", fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{error}</div>}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {initial && <Knapp ghost onClick={slett} disabled={pending}>Slett</Knapp>}
          <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Knapp ghost onClick={onLukk} disabled={pending}>Avbryt</Knapp>
            <Knapp onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre"}</Knapp>
          </span>
        </div>
      </div>
    </BunnArk>
  );
}

/* ── Uke-visning (drag-to-create) ──────────────────────── */

function UkeVisningV2({ locations, windows }: { locations: LocationOption[]; windows: WeekWindowV2[] }) {
  const dragDag = useRef<number | null>(null);
  const [drag, setDrag] = useState<{ dag: number; a: number; b: number } | null>(null);
  const [livePreview, setLivePreview] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [bekreft, setBekreft] = useState<{ weekday: number; start: string; end: string } | null>(null);

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
        const nd = { ...d, b: rad };
        setLivePreview(`${radTilTid(Math.min(nd.a, nd.b))}–${radTilTid(Math.max(nd.a, nd.b) + 1)}`);
        return nd;
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
    const overlapping = windows.some((w) => w.weekday === drag.dag && !(radTilTid(hoy + 1) <= w.startTime || radTilTid(lav) >= w.endTime));
    if (overlapping) {
      setFeil("Overlapper med eksisterende vindu. Juster først.");
      return;
    }
    setBekreft({ weekday: drag.dag, start: radTilTid(lav), end: radTilTid(hoy + 1) });
  }

  function handleClick(dag: number, rad: number) {
    if (drag) return;
    setBekreft({ weekday: dag, start: radTilTid(rad), end: radTilTid(rad + 1) });
  }

  return (
    <div style={{ userSelect: "none", position: "relative" }}>
      {livePreview && (
        <div style={{ position: "absolute", top: -28, left: 0, right: 0, background: T.lime, color: T.onLime, textAlign: "center", padding: "4px 0", fontFamily: T.mono, fontSize: 11, borderRadius: "10px 10px 0 0" }}>
          Drar: {livePreview} (slipp for å bekrefte)
        </div>
      )}
      {feil && <div role="alert" style={{ marginBottom: 8, borderRadius: 8, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, padding: "6px 12px", fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `44px repeat(7, 1fr)`, gap: 1, borderRadius: 10, border: `1px solid ${T.border}`, background: T.border, overflow: "hidden" }}>
        <div style={{ background: T.panel }} />
        {DAGER_KORT.map((d) => (
          <div key={d} style={{ background: T.panel, padding: "6px 0", textAlign: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 800, letterSpacing: "0.05em", color: T.mut }}>{d}</div>
        ))}
        {Array.from({ length: ROWS }).map((_, rad) => {
          const erHel = rad % 2 === 0;
          return (
            <div key={rad} style={{ display: "contents" }}>
              <div style={{ background: T.panel, paddingRight: 4, textAlign: "right", fontFamily: T.mono, fontSize: 8, lineHeight: "18px", color: T.mut }}>{erHel ? radTilTid(rad) : ""}</div>
              {DAGER_KORT.map((_, dag) => {
                const iDrag = drag?.dag === dag && rad >= Math.min(drag.a, drag.b) && rad <= Math.max(drag.a, drag.b);
                return (
                  <button
                    key={dag}
                    type="button"
                    onPointerDown={(e) => startDrag(dag, rad, e)}
                    onPointerEnter={() => moveDrag(dag, rad)}
                    onPointerUp={endDrag}
                    onClick={() => handleClick(dag, rad)}
                    aria-label={`${DAGER_KORT[dag]} ${radTilTid(rad)}`}
                    style={{ appearance: "none", cursor: "crosshair", height: 18, width: "100%", border: "none", padding: 0, background: iDrag ? `color-mix(in srgb, ${T.lime} 55%, transparent)` : erHel ? T.panel : T.panel2 }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {windows.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {windows.map((w) => (
            <span key={w.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, border: `1px solid ${T.up}`, background: `color-mix(in srgb, ${T.up} 8%, transparent)`, padding: "5px 12px", fontFamily: T.mono, fontSize: 10, color: T.up }}>
              {DAGER_KORT[w.weekday]} {w.startTime}–{w.endTime}
              <span style={{ color: T.mut }}>· {w.locationName ?? "Alle steder"}</span>
            </span>
          ))}
        </div>
      )}

      {bekreft && (
        <BunnArk tittel={<>Tilgjengelig <em style={{ fontStyle: "italic", color: T.lime }}>{DAGER_LANG[bekreft.weekday]} {bekreft.start}–{bekreft.end}</em>?</>} onLukk={() => setBekreft(null)} bredde={400}>
          <SlotFormArkV2 locations={locations} defaultWeekday={bekreft.weekday} defaultStart={bekreft.start} defaultEnd={bekreft.end} onLukk={() => setBekreft(null)} />
        </BunnArk>
      )}
    </div>
  );
}

/* ── År-visning (Gantt) ────────────────────────────────── */

const GANTT_TONER = [T.up, T.info, T.warn, T.lime];

function aarsAndel(iso: string | null, kant: 0 | 1, year: number): number {
  if (!iso) return kant;
  const d = new Date(iso);
  if (d.getFullYear() < year) return 0;
  if (d.getFullYear() > year) return 1;
  const start = new Date(year, 0, 1).getTime();
  const slutt = new Date(year + 1, 0, 1).getTime();
  return Math.min(1, Math.max(0, (d.getTime() - start) / (slutt - start)));
}

function AarVisningV2({ year, windows }: { year: number; windows: YearWindowV2[] }) {
  const grupper = new Map<string, YearWindowV2[]>();
  for (const w of windows) {
    const navn = w.locationName ?? "Alle steder";
    if (!grupper.has(navn)) grupper.set(navn, []);
    grupper.get(navn)!.push(w);
  }
  const navnListe = Array.from(grupper.keys());
  const toneFor = (navn: string) => GANTT_TONER[navnListe.indexOf(navn) % GANTT_TONER.length];

  return (
    <Kort>
      <div style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center", gap: 12 }}>
        <Caps size={9}>{year}</Caps>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)" }}>
          {MND_KORT.map((mnd, i) => <span key={i} style={{ textAlign: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 800, letterSpacing: "0.05em", color: T.mut }}>{mnd}</span>)}
        </div>
      </div>

      {windows.length === 0 ? (
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen ukentlige tidsvinduer satt. Legg til vinduer med periode for å se dem fordelt over året.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {navnListe.map((navn) => (
            <div key={navn}>
              <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: 9999, background: toneFor(navn) }} />
                <span style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 700, color: T.fg }}>{navn}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {grupper.get(navn)!.map((w) => {
                  const fra = aarsAndel(w.validFromIso, 0, year);
                  const til = aarsAndel(w.validToIso, 1, year);
                  const bredde = Math.max(0.02, til - fra);
                  return (
                    <div key={w.id} style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center", gap: 12 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.mono, fontSize: 11, color: T.mut }}>{w.label}</span>
                      <div style={{ position: "relative", height: 20, borderRadius: 6, background: T.panel2 }}>
                        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(12, 1fr)" }}>
                          {MND_KORT.map((_, i) => <span key={i} style={{ borderLeft: i === 0 ? "none" : `1px solid color-mix(in srgb, ${T.border} 40%, transparent)` }} />)}
                        </div>
                        <div title={w.label} style={{ position: "absolute", top: 3, bottom: 3, borderRadius: 4, background: toneFor(navn), left: `${fra * 100}%`, width: `${bredde * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontFamily: T.mono, fontSize: 9, letterSpacing: "0.05em", color: T.mut }}>
        Bjelker uten satt periode spenner hele året. Sett «Begrens til periode» i et tidsvindu for å avgrense det til en sesong.
      </div>
    </Kort>
  );
}

/* ── Måned-visning ──────────────────────────────────────── */

function MaanedVisningV2({ mndNavn, y, cells, forrigeHref, nesteHref }: { mndNavn: string; y: number; cells: MonthCellV2[]; forrigeHref: string; nesteHref: string }) {
  return (
    <Kort>
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{mndNavn} {y}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <Link href={forrigeHref} aria-label="Forrige måned" style={{ display: "inline-flex", borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: 8 }}><Icon name="chevron-left" size={14} style={{ color: T.fg }} /></Link>
          <Link href={nesteHref} aria-label="Neste måned" style={{ display: "inline-flex", borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: 8 }}><Icon name="chevron-right" size={14} style={{ color: T.fg }} /></Link>
        </div>
      </div>

      <div style={{ marginBottom: 6, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {DAGER_KORT.map((w) => <span key={w} style={{ textAlign: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 800, letterSpacing: "0.05em", color: T.mut }}>{w}</span>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((c, i) =>
          c.day == null ? (
            <span key={`tom-${i}`} />
          ) : (
            <div key={c.day} style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 72, borderRadius: 10, border: `1px solid ${c.range ? T.up : T.border}`, background: c.range ? `color-mix(in srgb, ${T.up} 8%, transparent)` : T.panel2, padding: "8px 9px" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{c.day}</span>
                {c.erIdag && <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.lime }} />}
              </span>
              {c.range ? (
                <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.up }}>{c.range}</span>
              ) : (
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>—</span>
              )}
            </div>
          ),
        )}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", color: T.mut }}><span style={{ width: 12, height: 12, borderRadius: 4, border: `1px solid ${T.up}`, background: `color-mix(in srgb, ${T.up} 8%, transparent)` }} />ÅPEN FOR BOOKING</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", color: T.mut }}><span style={{ width: 12, height: 12, borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel2 }} />INGEN TID SATT</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", color: T.mut }}><span style={{ width: 6, height: 6, borderRadius: 9999, background: T.lime }} />I DAG</span>
      </div>
    </Kort>
  );
}

/* ── Hoved-eksport ──────────────────────────────────────── */

export function AdminTilgjengelighetV2({
  visning,
  mndNavn,
  y,
  cells,
  forrigeHref,
  nesteHref,
  aarForrigeHref,
  aarNesteHref,
  locations,
  ukeVinduer,
  aarsVinduer,
  slots,
  maanedHref,
  ukeHref,
  aarHref,
  calendarSync,
}: {
  visning: "maaned" | "uke" | "aar";
  mndNavn: string;
  y: number;
  cells: MonthCellV2[];
  forrigeHref: string;
  nesteHref: string;
  aarForrigeHref: string;
  aarNesteHref: string;
  locations: LocationOption[];
  ukeVinduer: WeekWindowV2[];
  aarsVinduer: YearWindowV2[];
  slots: SlotRadV2[];
  maanedHref: string;
  ukeHref: string;
  aarHref: string;
  calendarSync: ReactNode;
}) {
  const [nyttOpen, setNyttOpen] = useState(false);
  const [redigerId, setRedigerId] = useState<string | null>(null);
  const redigerSlot = slots.find((s) => s.id === redigerId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps size={9}>Gjennomføre · Tilgjengelighet</Caps>
          <Tittel em="åpen for booking.">Din måned,</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut, maxWidth: 480 }}>
            Sett tidsvinduer du er tilgjengelig, per anlegg. Grønne dager er åpne for spiller-booking. Du kan aldri være tilgjengelig to steder samtidig.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Knapp icon="plus" onClick={() => setNyttOpen(true)}>Nytt tidsvindu</Knapp>
          <Knapp ghost icon="refresh-cw" onClick={() => toast.info("Synkronisering skjer automatisk hvert 15. minutt")}>Synk</Knapp>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {([["maaned", "Måned", maanedHref], ["uke", "Uke (drag)", ukeHref], ["aar", "År", aarHref]] as const).map(([key, label, href]) => (
          <Link key={key} href={href} style={{ borderRadius: 9999, border: `1px solid ${visning === key ? "transparent" : T.borderS}`, background: visning === key ? T.lime : T.panel2, color: visning === key ? T.onLime : T.fg, textDecoration: "none", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, padding: "8px 16px" }}>{label}</Link>
        ))}
      </div>

      {visning === "uke" ? (
        <UkeVisningV2 locations={locations} windows={ukeVinduer} />
      ) : visning === "aar" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
            <Link href={aarForrigeHref} aria-label="Forrige år" style={{ display: "inline-flex", borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: 8 }}><Icon name="chevron-left" size={14} style={{ color: T.fg }} /></Link>
            <Link href={aarNesteHref} aria-label="Neste år" style={{ display: "inline-flex", borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: 8 }}><Icon name="chevron-right" size={14} style={{ color: T.fg }} /></Link>
          </div>
          <AarVisningV2 year={y} windows={aarsVinduer} />
        </div>
      ) : (
        <MaanedVisningV2 mndNavn={mndNavn} y={y} cells={cells} forrigeHref={forrigeHref} nesteHref={nesteHref} />
      )}

      <Kort eyebrow="Gjennomføre · Tilgjengelighet · Tidsvinduer">
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginBottom: 14 }}>Dine tidsvinduer</div>
        {slots.length === 0 ? (
          <div style={{ borderRadius: 10, border: `1px dashed ${T.border}`, padding: 16, fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen tidsvinduer satt ennå. Klikk «Nytt tidsvindu» for å legge til.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {slots.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{s.startTime}–{s.endTime}</span>{" "}
                  <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
                    {s.weekday !== null ? DAGER_LANG[s.weekday] : s.dateTekst ?? "—"} · {s.locationName ?? "Alle steder"}{!s.active && " · (av)"}
                  </span>
                </div>
                <Knapp ghost onClick={() => setRedigerId(s.id)}>Endre</Knapp>
              </div>
            ))}
          </div>
        )}
      </Kort>

      <Kort eyebrow="Gjennomføre · Tilgjengelighet · Google Calendar">
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginBottom: 6 }}>Koble kalender — velg hva som blokkerer booking</div>
        <p style={{ marginBottom: 14, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Familie-, jobb- og møtekalendere du huker av blokkerer automatisk booking-tid. Opptatt-tid kan aldri dobbeltbookes.</p>
        {calendarSync}
      </Kort>

      {nyttOpen && <SlotFormArkV2 locations={locations} onLukk={() => setNyttOpen(false)} />}
      {redigerSlot && (
        <SlotFormArkV2
          locations={locations}
          initial={{
            id: redigerSlot.id,
            weekday: redigerSlot.weekday,
            date: redigerSlot.dateIso,
            startTime: redigerSlot.startTime,
            endTime: redigerSlot.endTime,
            active: redigerSlot.active,
            locationId: redigerSlot.locationId,
            validFrom: redigerSlot.validFromIso,
            validTo: redigerSlot.validToIso,
            recurrenceInterval: redigerSlot.recurrenceInterval,
          }}
          onLukk={() => setRedigerId(null)}
        />
      )}
    </div>
  );
}
