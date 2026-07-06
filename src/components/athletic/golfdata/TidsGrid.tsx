"use client";

import React from "react";
import { DataPreview, type DataPreviewRow } from "./DataPreview";
import { Icon } from "./Icon";

/**
 * AK Golf HQ — TidsGrid
 * Portet 1:1 fra design-handover v13 (components/calendar/TidsGrid.jsx).
 * Dag-/ukevisning med tidsakse. Notion-ro: hairline timelinjer, ingen
 * celle-rammer; hover/fokus i tom slot avslører «+ Ny». Nå-linjen er lime.
 * Blokker er children; akse-farge som venstrekant, booking-tilstander for
 * availability. DRAG & DROP: blokker med id flyttes med peker (snap :30,
 * på tvers av kolonner) og tastatur (Alt+piltaster). Escape avbryter.
 * CSS: ./golfdata.css (.ak-tg / .ak-tgb).
 */

export type TidsGridAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type TidsGridFlytt = {
  id: string;
  kolonneId: string | null;
  fra: number;
  til: number;
  retning?: -1 | 1;
};

export type TidsGridProps = {
  /** Første og siste time på aksen (0–24). Default 7–21. */
  fraTime?: number;
  tilTime?: number;
  /** Høyde per time i px. Default 56. */
  timeHoyde?: number;
  /** Vis nå-linjen (lime). Timeverdi m/ desimal, f.eks. 14.5. Utelat for å skjule. */
  naa?: number;
  /**
   * Aktiverer drag & drop for blokker med `id`. Kalles ved slipp/tastaturflytt:
   * { id, kolonneId, fra, til } — snappet til :30. Tastatur: Alt+↑↓ = ±30 min;
   * Alt+←→ gir { …, retning: -1|1 } (kalleren bytter kolonne). Escape avbryter drag.
   * DRA NEDERSTE KANT endrer varighet: samme onFlytt med ny `til` (min 0,5t, `fra` uendret)
   * — kalleren re-validerer arena/volum live.
   */
  onFlytt?: (flytt: TidsGridFlytt) => void;
  /** Kolonner: <TidsGrid.Kolonne>. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export type TidsGridKolonneProps = {
  /** Stabil id — påkrevd for drag på tvers av kolonner. */
  id?: string;
  /** Kolonne-header, f.eks. "Man 19" eller "Bane 1". */
  header?: React.ReactNode;
  /** Marker kolonnen som i dag (header-tall får signal-pille). */
  idag?: boolean;
  /** Kalles ved klikk/Enter i tom slot med timeverdi (desimal, snappet til :30). */
  onNyOkt?: (time: number) => void;
  /** Blokker: <TidsGrid.Blokk>. */
  children?: React.ReactNode;
};

export type TidsGridBlokkProps = {
  /** Stabil id — påkrevd for at blokken skal være flyttbar (onFlytt på grid-et). */
  id?: string;
  /** Start/slutt som desimaltimer, f.eks. 9 og 10.5. */
  fra: number;
  til: number;
  /** Pyramide-akse — gir venstrekant + soft bakgrunn. */
  akse?: TidsGridAkse;
  /** Booking-tilstand (availability): åpen/holdt/booket — brukes i stedet for akse. */
  tilstand?: "apen" | "holdt" | "booket";
  /** AK-formel-detaljer vist i hover-preview (fra jsx-kilden, utover .d.ts). */
  arena?: React.ReactNode;
  trinn?: React.ReactNode;
  cs?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  /** Innhold — tittel, chips osv. Grid-et eier ikke kortdesignet. */
  children?: React.ReactNode;
  /** Kolonnedeling ved overlapp: indeks og antall (settes av kalleren). */
  spor?: number;
  antallSpor?: number;
};

type DragTip = { tipX: number; tipY: number; tid: string };

type GridCtxType = {
  fraTime: number;
  tilTime: number;
  timeHoyde: number;
  naa?: number;
  onFlytt?: (flytt: TidsGridFlytt) => void;
  registrer: (id: string, el: HTMLDivElement | null) => void;
  kolonneVed: (x: number) => string | null;
  setDrag: React.Dispatch<React.SetStateAction<DragTip | null>>;
};

const GridCtx = React.createContext<GridCtxType>({ fraTime: 7, tilTime: 21, timeHoyde: 56 } as GridCtxType);
const KolCtx = React.createContext<string | null>(null);

const AXIS_VAR: Record<TidsGridAkse, string> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const fmtTime = (t: number) => `${String(Math.floor(t)).padStart(2, "0")}:${t % 1 ? "30" : "00"}`;

function TidsGridRoot({
  fraTime = 7,
  tilTime = 21,
  timeHoyde = 56,
  naa,
  onFlytt,
  children,
  className = "",
  style,
}: TidsGridProps) {
  const timer: number[] = [];
  for (let t = fraTime; t <= tilTime; t++) timer.push(t);
  const hoyde = (tilTime - fraTime) * timeHoyde;
  const kolRef = React.useRef(new Map<string, HTMLDivElement>()); // id -> element
  const [drag, setDrag] = React.useState<DragTip | null>(null); // {tipX, tipY, tid}
  const registrer = React.useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) kolRef.current.set(id, el);
    else kolRef.current.delete(id);
  }, []);
  /** Finn kolonne-id fra clientX (midtpunkt-avstand). */
  const kolonneVed = React.useCallback((x: number): string | null => {
    let best: string | null = null;
    let bestDist = Infinity;
    kolRef.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right) {
        best = id;
        bestDist = 0;
      } else {
        const d = Math.min(Math.abs(x - r.left), Math.abs(x - r.right));
        if (bestDist > 0 && d < bestDist) {
          bestDist = d;
          best = id;
        }
      }
    });
    return best;
  }, []);
  const ctx: GridCtxType = { fraTime, tilTime, timeHoyde, naa, onFlytt, registrer, kolonneVed, setDrag };
  return (
    <GridCtx.Provider value={ctx}>
      <div className={`ak-tg${drag ? " ak-tg--drar" : ""} ${className}`} style={{ position: "relative", ...style }}>
        <div className="ak-tg__akse" aria-hidden="true">
          <div style={{ height: 34 }}></div>
          <div style={{ position: "relative", height: hoyde }}>
            {timer.map((t) => (
              <span key={t} className="ak-tg__aksetime" style={{ top: (t - fraTime) * timeHoyde }}>
                {fmtTime(t)}
              </span>
            ))}
          </div>
        </div>
        <div className="ak-tg__kols">{children}</div>
        {drag && (
          <div className="ak-tg__dragtid" style={{ left: drag.tipX, top: drag.tipY }}>{drag.tid}</div>
        )}
      </div>
    </GridCtx.Provider>
  );
}

function Kolonne({ id, header, idag = false, onNyOkt, children }: TidsGridKolonneProps) {
  const { fraTime, tilTime, timeHoyde, naa, registrer } = React.useContext(GridCtx);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (id != null) {
      registrer(id, ref.current);
      return () => registrer(id, null);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- kit-eksakt: registrer er stabil (useCallback [])
  }, [id]);
  const timer: number[] = [];
  for (let t = fraTime; t < tilTime; t++) timer.push(t);
  const hoyde = (tilTime - fraTime) * timeHoyde;
  const visNaa = naa != null && naa >= fraTime && naa <= tilTime;
  return (
    <div className="ak-tg__kol" ref={ref}>
      <div className={`ak-tg__kolhd${idag ? " ak-tg__kolhd--idag" : ""}`}>
        {idag && <span className="ak-tg__idagdot" aria-hidden="true"></span>}
        {header}
      </div>
      <div className="ak-tg__flate" style={{ height: hoyde }}>
        {timer.map((t) => (
          <div key={t} className="ak-tg__timelinje" style={{ top: (t - fraTime) * timeHoyde }} aria-hidden="true"></div>
        ))}
        {onNyOkt &&
          timer.map((t) => (
            <button
              key={`s${t}`}
              type="button"
              className="ak-tg__slot"
              style={{ top: (t - fraTime) * timeHoyde + 1, height: timeHoyde - 2 }}
              onClick={() => onNyOkt(t)}
              aria-label={`Ny økt ${fmtTime(t)}`}
            >
              <span><Icon name="plus" size={12} />Ny</span>
            </button>
          ))}
        <KolCtx.Provider value={id != null ? id : null}>{children}</KolCtx.Provider>
        {visNaa && (
          <div className="ak-tg__naa" style={{ top: (naa - fraTime) * timeHoyde }}>
            <div className="ak-tg__naalinje"></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Blokk({
  id,
  fra,
  til,
  akse,
  tilstand,
  arena,
  trinn,
  cs,
  onClick,
  children,
  spor = 0,
  antallSpor = 1,
}: TidsGridBlokkProps) {
  const grid = React.useContext(GridCtx);
  const [peekXY, setPeekXY] = React.useState<{ x: number; y: number } | null>(null);
  const kolonneId = React.useContext(KolCtx);
  const { fraTime, tilTime, timeHoyde, onFlytt, kolonneVed, setDrag } = grid;
  const flyttbar = !!(onFlytt && id != null);
  const [drar, setDrar] = React.useState(false);
  const [delta, setDelta] = React.useState({ x: 0, y: 0 });
  const start = React.useRef<{ x: number; y: number; flyttet: boolean } | null>(null);
  const varighet = til - fra;
  const maksFra = tilTime - varighet;

  const klampSnap = (t: number) => Math.min(Math.max(Math.round(t * 2) / 2, fraTime), maksFra);

  /* Endre varighet: dra nederste kant. Snap :30, min 0,5t, klamp til tilTime.
     Fyrer onFlytt med ny `til` (fra uendret) → konsumenten re-validerer arena/volum live. */
  const [resz, setResz] = React.useState(0);
  const rstart = React.useRef<{ y: number; dy: number } | null>(null);
  const klampSnapTil = (t: number) => Math.min(Math.max(Math.round(t * 2) / 2, fra + 0.5), tilTime);
  const onResizeDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    rstart.current = { y: e.clientY, dy: 0 };
  };
  const onResizeMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!rstart.current) return;
    e.stopPropagation();
    const dy = e.clientY - rstart.current.y;
    rstart.current.dy = dy;
    setResz(dy);
    const nyTil = klampSnapTil(til + dy / timeHoyde);
    const gridEl = e.currentTarget.closest(".ak-tg");
    if (!gridEl) return;
    const gr = gridEl.getBoundingClientRect();
    setDrag({ tipX: e.clientX - gr.left, tipY: e.clientY - gr.top, tid: `${fmtTime(fra)}–${fmtTime(nyTil)} · ${String(nyTil - fra).replace(".", ",")} t` });
  };
  const resizeEnd = (commit: boolean) => {
    if (!rstart.current) return;
    const dy = rstart.current.dy;
    rstart.current = null;
    setResz(0);
    setDrag(null);
    if (!commit) return;
    const nyTil = klampSnapTil(til + dy / timeHoyde);
    if (nyTil !== til && onFlytt && id != null) onFlytt({ id, kolonneId, fra, til: nyTil });
  };
  React.useEffect(() => {
    if (resz === 0) return undefined;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") resizeEnd(false);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  });

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!flyttbar || e.button !== 0) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, flyttet: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!start.current.flyttet && Math.hypot(dx, dy) < 5) return;
    start.current.flyttet = true;
    if (!drar) setDrar(true);
    setDelta({ x: dx, y: dy });
    const nyFra = klampSnap(fra + dy / timeHoyde);
    const gridEl = e.currentTarget.closest(".ak-tg");
    if (!gridEl) return;
    const gr = gridEl.getBoundingClientRect();
    setDrag({ tipX: e.clientX - gr.left, tipY: e.clientY - gr.top, tid: `${fmtTime(nyFra)}–${fmtTime(nyFra + varighet)}` });
  };
  const avslutt = (commit: boolean, e?: React.PointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    const var_ = start.current;
    start.current = null;
    setDrar(false);
    setDelta({ x: 0, y: 0 });
    setDrag(null);
    if (!var_.flyttet) return; // klikk — la onClick håndtere
    if (!commit || !e) return;
    const nyFra = klampSnap(fra + (e.clientY - var_.y) / timeHoyde);
    const nyKol = kolonneVed(e.clientX);
    if (onFlytt && id != null && (nyFra !== fra || (nyKol != null && nyKol !== kolonneId))) {
      onFlytt({ id, kolonneId: nyKol != null ? nyKol : kolonneId, fra: nyFra, til: nyFra + varighet });
    }
  };
  React.useEffect(() => {
    if (!drar) return undefined;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") avslutt(false);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!flyttbar || !e.altKey || !onFlytt || id == null) return;
    let handled = true;
    if (e.key === "ArrowUp") {
      const nyFra = Math.max(fra - 0.5, fraTime);
      if (nyFra !== fra) onFlytt({ id, kolonneId, fra: nyFra, til: nyFra + varighet });
    } else if (e.key === "ArrowDown") {
      const nyFra = Math.min(fra + 0.5, maksFra);
      if (nyFra !== fra) onFlytt({ id, kolonneId, fra: nyFra, til: nyFra + varighet });
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      onFlytt({ id, kolonneId, fra, til, retning: e.key === "ArrowLeft" ? -1 : 1 });
    } else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const top = (fra - fraTime) * timeHoyde;
  const h = Math.max(varighet * timeHoyde - 3 + resz, 20);
  const w = 100 / antallSpor;
  const ax = akse ? AXIS_VAR[akse] : null;
  const cls = tilstand ? ` ak-tgb--${tilstand}` : "";
  const akRows: DataPreviewRow[] = [];
  if (akse) akRows.push({ color: `var(--axis-${ax})`, label: akse, value: cs || "—" });
  if (arena != null) akRows.push({ label: "Arena", value: arena });
  if (trinn != null) akRows.push({ label: "Trinn", value: trinn });
  return (
    <React.Fragment>
      <button
        type="button"
        className={`ak-tgb${cls}${flyttbar ? " ak-tgb--flyttbar" : ""}${drar || resz !== 0 ? " ak-tgb--drar" : ""}`}
        onClick={(e) => {
          if (start.current == null && !drar) onClick?.(e);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => avslutt(true, e)}
        onPointerCancel={() => avslutt(false)}
        onKeyDown={onKeyDown}
        onMouseEnter={(e) => setPeekXY({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setPeekXY(null)}
        style={{
          top,
          height: h,
          left: `calc(${spor * w}% + 3px)`,
          width: `calc(${w}% - 6px)`,
          ...(drar ? { transform: `translate(${delta.x}px, ${delta.y}px)` } : {}),
          ...(ax ? { background: `var(--axis-${ax}-soft)`, borderLeftColor: `var(--axis-${ax})` } : {}),
        }}
        aria-label={`${fmtTime(fra)}–${fmtTime(til)}${flyttbar ? " — flyttbar: Alt + piltaster" : ""}`}
      >
        {children}
        {flyttbar && (
          <span
            className="ak-tgb__resize"
            onPointerDown={onResizeDown}
            onPointerMove={onResizeMove}
            onPointerUp={() => resizeEnd(true)}
            onPointerCancel={() => resizeEnd(false)}
            onClick={(e) => e.stopPropagation()}
            aria-hidden="true"
          />
        )}
      </button>
      {peekXY && !drar && resz === 0 && (
        <div style={{ position: "fixed", left: peekXY.x, top: peekXY.y - 6, zIndex: 60, pointerEvents: "none" }}>
          <DataPreview
            visible
            x={0}
            y={0}
            placement="top"
            label={`${fmtTime(fra)}–${fmtTime(til)}`}
            rows={akRows.length ? akRows : undefined}
            value={akRows.length ? undefined : akse || "Økt"}
          />
        </div>
      )}
    </React.Fragment>
  );
}

/**
 * Tidsgrid — dag-/ukevisning med tidsakse. Compound:
 * `TidsGrid` (akse + nå-linje) · `TidsGrid.Kolonne` (én dag/ressurs) ·
 * `TidsGrid.Blokk` (posisjonert av fra/til; innhold = children).
 * Hover/fokus i tomme slots viser «+ Ny» (Notion-mønsteret).
 */
export const TidsGrid = Object.assign(TidsGridRoot, { Kolonne, Blokk });
