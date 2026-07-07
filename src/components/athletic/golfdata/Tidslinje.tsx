"use client";

import React from "react";
import { DataPreview } from "./DataPreview";

/**
 * AK Golf HQ — Tidslinje
 * Portet 1:1 fra design-handover v13 (components/calendar/Tidslinje.jsx).
 * Horisontale baner (Notion-Timeline): rad per spiller/gruppe/ressurs,
 * periodebarer + hendelsespunkter på felles tidsakse (enheter, f.eks. uker).
 * DnD: flytt-drag (snap til enhet, på tvers av baner), kant-drag for varighet,
 * Alt+piltaster (±1 enhet; Shift = varighet), Escape avbryter.
 * Nå-markør i lime — én per visning.
 * CSS: ./golfdata.css (.ak-tl / .ak-tlbane / .ak-tlbar / .ak-tlpkt).
 */

export type TidslinjeAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type TidslinjeFlytt = { id: string; baneId: string | null; fra: number; til: number };

export type TidslinjeProps = {
  /** Total lengde på tidsaksen i enheter (f.eks. 52 uker). */
  total: number;
  /** Zoom-nivå — styrer tick-tetthet og etikettformat. (Reservert i kit-kilden — ticks eies av kalleren.) */
  zoom?: "uke" | "maned" | "kvartal";
  /** Etiketter for aksen: { ved: enhet, tekst: "Jan" }. Utledes ikke — kalleren eier kalenderen. */
  ticks?: { ved: number; tekst: string }[];
  /** Nå-markør (enhet, desimal OK) — lime linje. Én per visning. */
  naa?: number;
  /**
   * Aktiverer drag: flytt av barer (horisontal, snap til heltall) og
   * kant-drag (endre varighet). Kalles ved slipp/tastaturflytt.
   */
  onFlytt?: (flytt: TidslinjeFlytt) => void;
  /** Baner: <Tidslinje.Bane>. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export type TidslinjeBaneProps = {
  /** Stabil id — påkrevd for drag på tvers av baner. */
  id?: string;
  /** Rad-etikett (spiller/gruppe/ressurs) — vises i venstre kolonne. */
  etikett?: React.ReactNode;
  /** Barer og punkter. */
  children?: React.ReactNode;
};

export type TidslinjeBarProps = {
  /** Stabil id — påkrevd for at baren skal være flyttbar. */
  id?: string;
  /** Start/slutt i enheter (fra inklusiv, til eksklusiv). */
  fra: number;
  til: number;
  /** Pyramide-akse — venstrekant + soft bakgrunn. */
  akse?: TidslinjeAkse;
  /** Dempet variant (forslag/utkast) — stiplet kant. */
  utkast?: boolean;
  onClick?: () => void;
  /** Innhold — tekst/chips. Baren eier ikke innholdsdesignet. */
  children?: React.ReactNode;
};

export type TidslinjePunktProps = {
  /** Posisjon i enheter. */
  ved: number;
  /** Punktfarge-variant: "turnering" (default, TURN-akse) eller "peak" (lime — maks én per visning). */
  variant?: "turnering" | "peak";
  etikett?: string;
  onClick?: () => void;
};

type DragTip = { tipX: number; tipY: number; tekst: string };

type TlCtxType = {
  total: number;
  onFlytt?: (flytt: TidslinjeFlytt) => void;
  registrer: (id: string, el: HTMLDivElement | null) => void;
  baneVed: (y: number) => string | null;
  setDrag: React.Dispatch<React.SetStateAction<DragTip | null>>;
  rotRef: React.RefObject<HTMLDivElement | null>;
};

const Ctx = React.createContext<TlCtxType | null>(null);
const BaneCtx = React.createContext<string | null>(null);

const AXIS_VAR: Record<TidslinjeAkse, string> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

function TidslinjeRoot({
  total,
  ticks = [],
  naa,
  onFlytt,
  children,
  className = "",
  style,
}: TidslinjeProps) {
  const baneRef = React.useRef(new Map<string, HTMLDivElement>());
  const [drag, setDrag] = React.useState<DragTip | null>(null); // {tipX, tipY, tekst}
  const registrer = React.useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) baneRef.current.set(id, el);
    else baneRef.current.delete(id);
  }, []);
  const baneVed = React.useCallback((y: number): string | null => {
    let best: string | null = null;
    baneRef.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) best = id;
    });
    return best;
  }, []);
  const rotRef = React.useRef<HTMLDivElement>(null);
  const ctx: TlCtxType = { total, onFlytt, registrer, baneVed, setDrag, rotRef };
  return (
    <Ctx.Provider value={ctx}>
      <div ref={rotRef} className={`ak-tl${drag ? " ak-tl--drar" : ""} ${className}`} style={{ position: "relative", ...style }}>
        <div className="ak-tl__hode">
          <div className="ak-tl__hjorne"></div>
          <div className="ak-tl__akse" aria-hidden="true">
            {ticks.map((t, i) => (
              <span key={i} className="ak-tl__tick" style={{ left: `${(t.ved / total) * 100}%` }}>{t.tekst}</span>
            ))}
          </div>
        </div>
        <div className="ak-tl__kropp">
          {children}
          {naa != null && (
            <div className="ak-tl__naa" style={{ left: `calc(148px + (100% - 148px) * ${naa / total})` }}></div>
          )}
        </div>
        {drag && <div className="ak-tl__dragtid" style={{ left: drag.tipX, top: drag.tipY }}>{drag.tekst}</div>}
      </div>
    </Ctx.Provider>
  );
}

function Bane({ id, etikett, children }: TidslinjeBaneProps) {
  const ctx = React.useContext(Ctx);
  const registrer = ctx ? ctx.registrer : null;
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (id != null && registrer) {
      registrer(id, ref.current);
      return () => registrer(id, null);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- kit-eksakt: registrer er stabil (useCallback [])
  }, [id]);
  return (
    <div className="ak-tlbane">
      <div className="ak-tlbane__etikett">{etikett}</div>
      <div className="ak-tlbane__flate" ref={ref}>
        <BaneCtx.Provider value={id != null ? id : null}>{children}</BaneCtx.Provider>
      </div>
    </div>
  );
}

type DragModus = "flytt" | "kant-h" | "kant-v";

function Bar({ id, fra, til, akse, utkast = false, onClick, children }: TidslinjeBarProps) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("Tidslinje.Bar må brukes inne i <Tidslinje>.");
  const { total, onFlytt, baneVed, setDrag, rotRef } = ctx;
  const baneId = React.useContext(BaneCtx);
  const flyttbar = !!(onFlytt && id != null);
  const [drar, setDrar] = React.useState<DragModus | null>(null); // 'flytt' | 'kant-h' | 'kant-v'
  const [ghost, setGhost] = React.useState<{ fra: number; til: number } | null>(null); // {fra, til}
  const start = React.useRef<{ x: number; y: number; modus: DragModus; flyttet: boolean; flateEl: Element | null } | null>(null);
  const varighet = til - fra;

  const flateBredde = () => {
    const el = start.current && start.current.flateEl;
    return el ? el.getBoundingClientRect().width : 1;
  };
  const enheterFor = (dx: number) => Math.round((dx / flateBredde()) * total);

  const begynn = (e: React.PointerEvent<HTMLElement>, modus: DragModus) => {
    if (!flyttbar || e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, modus, flyttet: false, flateEl: e.currentTarget.closest(".ak-tlbane__flate") };
  };
  const beveg = (e: React.PointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (!s.flyttet && Math.abs(dx) < 4 && Math.abs(e.clientY - s.y) < 4) return;
    s.flyttet = true;
    if (!drar) setDrar(s.modus);
    const d = enheterFor(dx);
    let nyFra = fra,
      nyTil = til;
    if (s.modus === "flytt") {
      nyFra = Math.min(Math.max(fra + d, 0), total - varighet);
      nyTil = nyFra + varighet;
    } else if (s.modus === "kant-h") {
      nyTil = Math.min(Math.max(til + d, fra + 1), total);
    } else {
      nyFra = Math.max(Math.min(fra + d, til - 1), 0);
    }
    setGhost({ fra: nyFra, til: nyTil });
    const rot = rotRef.current;
    if (!rot) return;
    const gr = rot.getBoundingClientRect();
    setDrag({ tipX: e.clientX - gr.left, tipY: e.clientY - gr.top, tekst: `${nyFra + 1}–${nyTil}` });
  };
  const slipp = (e: React.PointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s) return;
    start.current = null;
    const g = ghost;
    setDrar(null);
    setGhost(null);
    setDrag(null);
    if (!s.flyttet) return;
    if (!g) return;
    const nyBane = s.modus === "flytt" ? baneVed(e.clientY) : null;
    if (onFlytt && id != null && (g.fra !== fra || g.til !== til || (nyBane != null && nyBane !== baneId))) {
      onFlytt({ id, baneId: nyBane != null ? nyBane : baneId, fra: g.fra, til: g.til });
    }
  };
  React.useEffect(() => {
    if (!drar) return undefined;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        start.current = null;
        setDrar(null);
        setGhost(null);
        setDrag(null);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [drar, setDrag]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!flyttbar || !e.altKey || !onFlytt || id == null) return;
    let handled = true;
    const d = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (d !== 0 && e.shiftKey) {
      const nyTil = Math.min(Math.max(til + d, fra + 1), total);
      if (nyTil !== til) onFlytt({ id, baneId, fra, til: nyTil });
    } else if (d !== 0) {
      const nyFra = Math.min(Math.max(fra + d, 0), total - varighet);
      if (nyFra !== fra) onFlytt({ id, baneId, fra: nyFra, til: nyFra + varighet });
    } else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const visFra = ghost ? ghost.fra : fra;
  const visTil = ghost ? ghost.til : til;
  const ax = akse ? AXIS_VAR[akse] : null;
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      className={`ak-tlbar${utkast ? " ak-tlbar--utkast" : ""}${flyttbar ? " ak-tlbar--flyttbar" : ""}${drar ? " ak-tlbar--drar" : ""}`}
      onClick={() => {
        if (!start.current && !drar) onClick?.();
      }}
      onPointerDown={(e) => begynn(e, "flytt")}
      onPointerMove={beveg}
      onPointerUp={slipp}
      onPointerCancel={() => {
        start.current = null;
        setDrar(null);
        setGhost(null);
        setDrag(null);
      }}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        left: `${(visFra / total) * 100}%`,
        width: `${((visTil - visFra) / total) * 100}%`,
        ...(ax ? { background: `var(--axis-${ax}-soft)`, borderLeftColor: `var(--axis-${ax})` } : {}),
      }}
      aria-label={`Uke ${fra + 1}–${til}${flyttbar ? " — flyttbar: Alt + piltaster, Shift for varighet" : ""}`}
    >
      <span className="ak-tlbar__txt">{children}</span>
      {hover && !drar && (
        <DataPreview
          visible
          x="50%"
          y={0}
          placement="top"
          label={`Uke ${fra + 1}–${til}`}
          value={akse ? undefined : typeof children === "string" ? children : `${til - fra} uker`}
          rows={akse ? [{ color: `var(--axis-${ax})`, label: akse, value: `${til - fra} uker` }] : undefined}
        />
      )}
      {flyttbar && (
        <React.Fragment>
          <span className="ak-tlbar__kant ak-tlbar__kant--v" onPointerDown={(e) => begynn(e, "kant-v")} onPointerMove={beveg} onPointerUp={slipp} aria-hidden="true"></span>
          <span className="ak-tlbar__kant ak-tlbar__kant--h" onPointerDown={(e) => begynn(e, "kant-h")} onPointerMove={beveg} onPointerUp={slipp} aria-hidden="true"></span>
        </React.Fragment>
      )}
    </button>
  );
}

function Punkt({ ved, variant = "turnering", etikett, onClick }: TidslinjePunktProps) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("Tidslinje.Punkt må brukes inne i <Tidslinje>.");
  const { total } = ctx;
  return (
    <button
      type="button"
      className={`ak-tlpkt${variant === "peak" ? " ak-tlpkt--peak" : ""}`}
      style={{ left: `${(ved / total) * 100}%` }}
      onClick={onClick}
      title={etikett}
      aria-label={etikett || `Hendelse uke ${ved + 1}`}
    ></button>
  );
}

/**
 * Tidslinje — horisontale baner (Notion-Timeline-mønsteret): én rad per
 * spiller/gruppe/ressurs, barer for perioder, punkter for hendelser.
 * Generaliserer Periodeplan (som består som ferdig-komponert spesialtilfelle).
 */
export const Tidslinje = Object.assign(TidslinjeRoot, { Bane, Bar, Punkt });
