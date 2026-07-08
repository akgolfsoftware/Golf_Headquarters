"use client";

import React from "react";
import { Icon } from "./Icon";
import { DataPreview } from "./DataPreview";

/**
 * AK Golf HQ — MaanedKalender (v2)
 * To moduser (lukket enum):
 *  - "varme" (default): månedsgrid m/ lime-varme etter øktmengde (dashbord).
 *  - "piller": Notion-månedsceller — inntil 3 økt-piller per dag (akse-prikk +
 *    trunkert tittel), «+N» ved flere, hover-«+ Ny», DnD av piller mellom dager
 *    (onFlytt; Escape avbryter). For planlegging.
 * Norsk uke (man først). I dag = signal-kant.
 * Portet 1:1 fra Claude Design-prosjektets components/calendar/MaanedKalender.jsx
 * (hentet via DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-maaned).
 */

const DAYS_NO = ["M", "T", "O", "T", "F", "L", "S"];

const AXIS_VAR = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" } as const;

export type MaanedAkse = keyof typeof AXIS_VAR;

export type MaanedOkt = {
  /** Stabil id — påkrevd for DnD og fornuftige klikk. */
  id?: string;
  tittel: string;
  /** Pyramide-akse — gir farget prikk foran tittelen. */
  akse?: MaanedAkse;
  /** Klokkeslett-etikett, f.eks. "09:00". */
  tid?: string;
  /** Valgfrie hover-detaljer (peek). */
  cs?: string;
  csNivaa?: string;
  arena?: string;
  trinn?: string | number;
};

export type MaanedDag = {
  date: number;
  /** Varme-modus: antall økter (styrer lime-intensitet). */
  oktAntall?: number;
  /** Piller-modus: dagens økter. */
  okter?: MaanedOkt[];
  today?: boolean;
};

export type MaanedFlytt = { id: string; fraDato: number; tilDato: number };

export type MaanedKalenderProps = {
  year?: number;
  /** 0-indeksert måned (Date-konvensjon) — som DS-kontrakten. */
  month?: number;
  days?: MaanedDag[];
  /** Varme-modus: valgt dato. */
  value?: number;
  onChange?: (date: number) => void;
  /** "varme" (default, dashbord) · "piller" (Notion-celler, planlegging). */
  modus?: "varme" | "piller";
  /** Maks synlige piller per celle før «+N flere». Default 3. */
  maksPiller?: number;
  onOktKlikk?: (okt: MaanedOkt, date: number) => void;
  onNyOkt?: (date: number) => void;
  onVisAlle?: (date: number) => void;
  onFlytt?: (flytt: MaanedFlytt) => void;
  className?: string;
  style?: React.CSSProperties;
};

function beregnCeller(y: number, m: number): (number | null)[] {
  const firstDay = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

type DragState = {
  id: string;
  okt: MaanedOkt;
  fraDato: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  flyttet: boolean;
  mål: number | null;
};

type PeekState = {
  x: number;
  y: number;
  label: string;
  value?: string | null;
  unit?: string;
  rows?: { color?: string; label: string; value: React.ReactNode }[] | null;
};

type FlyttApi = {
  kan: boolean;
  aktiv: string | null;
  mål: number | null;
  flyttet: () => boolean;
  start: (e: React.PointerEvent, o: MaanedOkt, dato: number) => void;
  beveg: (e: React.PointerEvent) => void;
  slipp: () => void;
  avbryt: () => void;
};

/* ── Piller-celle ─────────────────────────────────────────── */
function PillerCelle({
  date,
  info,
  maksPiller,
  onOktKlikk,
  onNyOkt,
  onVisAlle,
  flytt,
  onPeek,
}: {
  date: number;
  info: MaanedDag | Record<string, never>;
  maksPiller: number;
  onOktKlikk?: MaanedKalenderProps["onOktKlikk"];
  onNyOkt?: MaanedKalenderProps["onNyOkt"];
  onVisAlle?: MaanedKalenderProps["onVisAlle"];
  flytt: FlyttApi;
  onPeek?: (o: MaanedOkt | null, date?: number, e?: React.MouseEvent) => void;
}) {
  const okter = ("okter" in info ? info.okter : undefined) || [];
  const vis = okter.slice(0, maksPiller);
  const rest = okter.length - vis.length;
  const idag = "today" in info ? info.today : false;
  return (
    <div
      className={`ak-mnd-p${idag ? " ak-mnd-p--idag" : ""}${flytt.mål === date ? " ak-mnd-p--dropmål" : ""}`}
      data-dato={date}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <span className="ak-mnd-p__dato">{date}</span>
      </div>
      {onNyOkt && (
        <button type="button" className="ak-mnd-p__ny" onClick={() => onNyOkt(date)} aria-label={`Ny økt ${date}.`}>
          <Icon name="plus" size={12} />
        </button>
      )}
      {vis.map((o) => (
        <button
          key={o.id ?? o.tittel}
          type="button"
          className={`ak-pille${flytt.aktiv === (o.id ?? o.tittel) ? " ak-pille--drar" : ""}${flytt.kan && o.id != null ? " ak-pille--flyttbar" : ""}`}
          onClick={() => {
            if (!flytt.flyttet()) onOktKlikk?.(o, date);
          }}
          onPointerDown={(e) => flytt.start(e, o, date)}
          onPointerMove={flytt.beveg}
          onPointerUp={flytt.slipp}
          onPointerCancel={() => flytt.avbryt()}
          onMouseEnter={(e) => {
            if (!flytt.aktiv && onPeek) onPeek(o, date, e);
          }}
          onMouseLeave={() => onPeek && onPeek(null)}
          aria-label={`${o.tittel}${o.tid ? " " + o.tid : ""}`}
        >
          {o.akse && <span className="ak-pille__prikk" style={{ background: `var(--axis-${AXIS_VAR[o.akse]})` }}></span>}
          <span className="ak-pille__txt">{o.tittel}</span>
          {o.tid && <span className="ak-pille__tid">{o.tid}</span>}
        </button>
      ))}
      {rest > 0 && (
        <button type="button" className="ak-mnd-p__fler" onClick={() => onVisAlle && onVisAlle(date)}>
          +{rest} flere
        </button>
      )}
    </div>
  );
}

export function MaanedKalender({
  year,
  month,
  days = [],
  value,
  onChange,
  modus = "varme",
  maksPiller = 3,
  onOktKlikk,
  onNyOkt,
  onVisAlle,
  onFlytt,
  className = "",
  style,
}: MaanedKalenderProps) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const cells = beregnCeller(y, m);

  const dayMap: Record<number, MaanedDag> = {};
  days.forEach((d) => {
    dayMap[d.date] = d;
  });

  /* ── DnD-tilstand (piller-modus) ── */
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const dragRef = React.useRef<DragState | { flyttet: boolean } | null>(null);
  const settDrag = (v: DragState | null) => {
    dragRef.current = v;
    setDrag(v);
  };

  const målVed = (x: number, yy: number): number | null => {
    const el = document.elementFromPoint(x, yy);
    const celle = el && el.closest("[data-dato]");
    return celle ? Number(celle.getAttribute("data-dato")) : null;
  };

  const flytt: FlyttApi = {
    kan: !!onFlytt,
    aktiv: drag && drag.flyttet ? drag.id : null,
    mål: drag && drag.flyttet ? drag.mål : null,
    flyttet: () => !!(dragRef.current && dragRef.current.flyttet),
    start: (e, o, dato) => {
      if (!onFlytt || o.id == null || e.button !== 0) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      settDrag({ id: o.id, okt: o, fraDato: dato, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, flyttet: false, mål: null });
    },
    beveg: (e) => {
      const d = dragRef.current as DragState | null;
      if (!d || !("id" in d)) return;
      const flyttet = d.flyttet || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) >= 5;
      settDrag({ ...d, x: e.clientX, y: e.clientY, flyttet, mål: flyttet ? målVed(e.clientX, e.clientY) : null });
    },
    slipp: () => {
      const d = dragRef.current as DragState | null;
      if (!d || !("id" in d)) return;
      const varFlyttet = d.flyttet;
      const mål = d.mål;
      // behold flyttet-flagget ett tick så klikk-etter-drag ikke åpner peek
      settDrag(null);
      if (varFlyttet && mål != null && mål !== d.fraDato) onFlytt?.({ id: d.id, fraDato: d.fraDato, tilDato: mål });
      if (varFlyttet) {
        dragRef.current = { flyttet: true };
        setTimeout(() => {
          dragRef.current = null;
        }, 0);
      }
    },
    avbryt: () => settDrag(null),
  };

  const drarNaa = !!(drag && drag.flyttet);
  React.useEffect(() => {
    if (!drarNaa) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settDrag(null);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [drarNaa]);

  const maxOktAntall = Math.max(1, ...days.map((d) => d.oktAntall || 0));
  /* Cellene har overflow:hidden — hover-kortet rendres derfor fast (fixed) på rot-nivå. */
  const [peek, setPeek] = React.useState<PeekState | null>(null);
  const oktPeek = (o: MaanedOkt | null, _date?: number, e?: React.MouseEvent) => {
    if (o == null || !e) {
      setPeek(null);
      return;
    }
    const rows = [
      o.akse ? { color: `var(--axis-${AXIS_VAR[o.akse]})`, label: o.akse, value: o.cs || o.csNivaa || "—" } : null,
      o.arena != null ? { label: "Situasjon", value: o.arena } : null,
      o.trinn != null ? { label: "Trinn", value: o.trinn } : null,
    ].filter(Boolean) as PeekState["rows"];
    setPeek({
      x: e.clientX,
      y: e.clientY,
      label: o.tid ? `${o.tittel} · ${o.tid}` : o.tittel,
      rows: rows && rows.length ? rows : null,
      value: rows && rows.length ? null : o.tittel,
    });
  };

  return (
    <div className={`ak-maaned${modus === "piller" ? " ak-maaned--piller" : ""} ${className}`} style={style}>
      <div className="ak-maaned__hd">
        {DAYS_NO.map((d, i) => (
          <span key={i} className="ak-maaned__dow">
            {d}
          </span>
        ))}
      </div>
      <div className="ak-maaned__grid">
        {cells.map((date, i) => {
          if (!date)
            return (
              <div
                key={i}
                className={modus === "piller" ? "ak-mnd-p ak-mnd-p--utenfor" : "ak-maaned__cell ak-maaned__cell--empty"}
                aria-hidden="true"
              />
            );
          const info = dayMap[date] || {};
          if (modus === "piller") {
            return (
              <PillerCelle
                key={i}
                date={date}
                info={info}
                maksPiller={maksPiller}
                onOktKlikk={onOktKlikk}
                onNyOkt={onNyOkt}
                onVisAlle={onVisAlle}
                flytt={flytt}
                onPeek={oktPeek}
              />
            );
          }
          const isToday = info.today;
          const isActive = date === value;
          const heat = info.oktAntall ? info.oktAntall / maxOktAntall : 0;
          return (
            <button
              key={i}
              type="button"
              className={`ak-maaned__cell${isToday ? " ak-maaned__cell--today" : ""}${isActive ? " ak-maaned__cell--active" : ""}`}
              onClick={() => onChange && onChange(date)}
              onMouseEnter={(e) => {
                if (info.oktAntall && info.oktAntall > 0)
                  setPeek({
                    x: e.clientX,
                    y: e.clientY,
                    label: `Dag ${date}`,
                    value: `${info.oktAntall}`,
                    unit: info.oktAntall === 1 ? "økt" : "økter",
                  });
              }}
              onMouseLeave={() => setPeek(null)}
              aria-current={isToday ? "date" : undefined}
            >
              {heat > 0 && !isActive && (
                <span className="ak-maaned__heat" style={{ background: "var(--signal)", opacity: 0.08 + heat * 0.22 }} />
              )}
              {date}
              {info.oktAntall != null && info.oktAntall > 0 && !isActive && <span className="ak-maaned__dot" />}
            </button>
          );
        })}
      </div>
      {drag && drag.flyttet && (
        <div className="ak-maaned__spokelse" style={{ left: drag.x, top: drag.y }}>
          {drag.okt.akse && (
            <span className="ak-pille__prikk" style={{ background: `var(--axis-${AXIS_VAR[drag.okt.akse]})` }}></span>
          )}
          <span className="ak-pille__txt" style={{ maxWidth: 140 }}>
            {drag.okt.tittel}
          </span>
        </div>
      )}
      {peek && !(drag && drag.flyttet) && (
        <div style={{ position: "fixed", left: peek.x, top: peek.y - 6, zIndex: 60, pointerEvents: "none" }}>
          <DataPreview visible x={0} y={0} placement="top" label={peek.label} value={peek.value} unit={peek.unit} rows={peek.rows ?? undefined} />
        </div>
      )}
    </div>
  );
}
