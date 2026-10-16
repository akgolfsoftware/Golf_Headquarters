"use client";

/**
 * Hurtigknappen i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/_shared/Hurtigknapp.jsx, etag 1790587884753587).
 *
 * Én delt komponent, montert én gang i skallet. 56 × 56 px grafitt, kan dras
 * hvor som helst og klemmes 8 px fra kanten. Under fem piksler bevegelse er et
 * trykk, ikke et drag. Posisjonen huskes per app. Menyen snur når den ellers
 * ville gått utenfor flaten. Ikke på nattflater (beslutninger.md §Hurtigknappen).
 */
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Plus, type LucideIcon } from "lucide-react";
import { Ikon } from "./pa";

export type Hurtighandling = { id: string; label: string; icon: LucideIcon; iconName: string; href: string };

const SIZE = 56, EDGE = 8, TAP = 5, MENU_W = 264;
type Pos = { x: number; y: number };

export function klemPosisjon(p: Pos, W: number, H: number, bunn: number): Pos {
  return { x: Math.max(EDGE, Math.min(W - SIZE - EDGE, p.x)), y: Math.max(EDGE, Math.min(H - SIZE - EDGE - bunn, p.y)) };
}

function lesLagret(key: string): Pos | null {
  try {
    const p = JSON.parse(localStorage.getItem(key) ?? "null") as unknown;
    if (p && typeof p === "object" && typeof (p as Pos).x === "number" && typeof (p as Pos).y === "number") return p as Pos;
  } catch { /* privat modus o.l.: start i hjørnet */ }
  return null;
}

export function Hurtigknapp({ app, handlinger, bunn = 0 }: { app: "aos" | "phq"; handlinger: readonly Hurtighandling[]; bunn?: number }) {
  const key = `${app}-fab`;
  const [pos, setPos] = useState<Pos | null>(null);
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const st = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const moved = useRef(false);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const vp = () => [document.documentElement.clientWidth, window.innerHeight] as const;

  useEffect(() => {
    // Posisjonen avhenger av vinduet og localStorage, som bare finnes i nettleseren.
    const start = requestAnimationFrame(() => {
      const [W, H] = vp();
      setPos(klemPosisjon(lesLagret(key) ?? { x: W - SIZE - 24, y: H - SIZE - 24 - bunn }, W, H, bunn));
    });
    const r = () => { const [w, h] = vp(); setPos((p) => (p ? klemPosisjon(p, w, h, bunn) : p)); };
    window.addEventListener("resize", r);
    return () => { cancelAnimationFrame(start); window.removeEventListener("resize", r); };
  }, [key, bunn]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    const c = (e: globalThis.PointerEvent) => { const t = e.target as Node; if (!menu.current?.contains(t) && !btn.current?.contains(t)) setOpen(false); };
    document.addEventListener("keydown", k);
    document.addEventListener("pointerdown", c);
    requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>("a")?.focus());
    return () => { document.removeEventListener("keydown", k); document.removeEventListener("pointerdown", c); };
  }, [open]);

  if (!pos) return null;

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    st.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const s = st.current;
    if (!s) return;
    const dx = e.clientX - s.sx, dy = e.clientY - s.sy;
    if (!moved.current && Math.hypot(dx, dy) < TAP) return;
    if (!moved.current) { moved.current = true; setDrag(true); setOpen(false); }
    const [W, H] = vp();
    setPos(klemPosisjon({ x: s.ox + dx, y: s.oy + dy }, W, H, bunn));
  };
  const up = () => {
    if (!st.current) return;
    st.current = null;
    if (moved.current) {
      setDrag(false);
      try { localStorage.setItem(key, JSON.stringify(pos)); } catch { /* ikke lagret: posisjonen gjelder denne visningen */ }
    }
  };
  const click = () => { if (moved.current) { moved.current = false; return; } setOpen((o) => !o); };

  const [W, H] = vp();
  const mh = handlinger.length * 52 + 16;
  const hoyre = pos.x + MENU_W > W - EDGE;
  const over = pos.y + SIZE + 8 + mh > H - EDGE - bunn;

  return <>
    <button ref={btn} type="button" aria-label="Hurtighandlinger" aria-haspopup="menu" aria-expanded={open} data-fab={app}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={click}
      style={{ position: "fixed", zIndex: 120, left: pos.x, top: pos.y, width: SIZE, height: SIZE, borderRadius: "var(--radius)", border: "none", background: "var(--primary)", color: "var(--text-on-primary)", display: "grid", placeItems: "center", cursor: drag ? "grabbing" : "pointer", touchAction: "none", boxShadow: drag ? "var(--shadow-modal)" : "var(--shadow-card)", transition: drag ? "none" : "box-shadow 160ms var(--ease-out)" }}>
      <span style={{ display: "inline-flex", transform: open ? "rotate(45deg)" : "none", transition: "transform 160ms var(--ease-out)" }}><Ikon icon={Plus} size={24} name="plus" /></span>
    </button>
    {open && <div ref={menu} role="menu" aria-label="Hurtighandlinger"
      style={{ position: "fixed", zIndex: 121, width: Math.min(MENU_W, W - EDGE * 2), boxSizing: "border-box", left: hoyre ? Math.max(EDGE, pos.x + SIZE - MENU_W) : pos.x, top: over ? Math.max(EDGE, pos.y - 8 - mh) : pos.y + SIZE + 8, background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: 8, boxShadow: "var(--shadow-modal)", padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
      {handlinger.map((a) => <Link key={a.id} href={a.href} role="menuitem" className="pa-fab__item" onClick={() => setOpen(false)}>
        <Ikon icon={a.icon} size={18} name={a.iconName} />{a.label}
      </Link>)}
    </div>}
  </>;
}
