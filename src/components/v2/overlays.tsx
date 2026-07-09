"use client";

/* AK Golf HQ v2 — OVERLEGG (retning C «Presis», fase 4).
   Modaler, ark, skuffer, popovers, tooltips, toasts, bannere og kommandopalett.
   Alle rendres STATISK i åpen demo-tilstand (ingen portaler) slik at de kan
   screenshotes i galleriet. Port av ui_kits/v2/v2-overlays.jsx → produksjons-TSX
   (diff-null). Primitiver fra ./core, tokens/ikon fra grunnstein. */

import type { CSSProperties, ReactNode } from "react";
import { T, Caps, Rad, AkseChip, CTAPill, type StatusTone } from "./core";
import type { AkseKey } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

/* ── Intern demo-ramme: posisjonert innhold på scrim — kun for galleri ── */
type RammeAlign = "center" | "bottom" | "right" | "top";
interface RammeProps {
  w?: number;
  h?: number;
  scrim?: boolean;
  align?: RammeAlign;
  children?: ReactNode;
}
function Ramme({ w = 560, h = 360, scrim = true, align = "center", children }: RammeProps) {
  const al: Record<RammeAlign, CSSProperties> = {
    center: { alignItems: "center", justifyContent: "center" },
    bottom: { flexDirection: "column", justifyContent: "flex-end" },
    right: { justifyContent: "flex-end" },
    top: { flexDirection: "column", justifyContent: "flex-start" },
  };
  return (
    <div style={{ position: "relative", width: w, height: h, background: T.bg, border: `1px solid ${T.border}`, borderRadius: T.rCard, overflow: "hidden", display: "flex", ...al[align] }}>
      {scrim && <div style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />}
      {children}
    </div>
  );
}

interface KbdProps {
  children?: ReactNode;
}
function Kbd({ children }: KbdProps) {
  return <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut, background: T.panel3, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px", whiteSpace: "nowrap" }}>{children}</span>;
}

function LukkKnapp() {
  return (
    <span style={{ width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}>
      <Icon name="x" size={14} style={{ color: T.fg2 }} />
    </span>
  );
}

/* ── Modal: r20-panel m/ tittel, lukk og footer-knapper ── */
export interface ModalProps {
  title?: ReactNode;
  body?: ReactNode;
  avbryt?: ReactNode;
  bekreft?: ReactNode;
  w?: number;
  h?: number;
}
export function Modal({
  title = "Slett økten?",
  body = "Økten «Wedge 60–100 m» fjernes fra uke 29. Loggførte data fra tidligere gjennomføringer beholdes.",
  avbryt = "Avbryt", bekreft = "Slett økten", w = 560, h = 340,
}: ModalProps) {
  return (
    <Ramme w={w} h={h}>
      <div style={{ position: "relative", width: 430, background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg, margin: 0, lineHeight: 1.2 }}>{title}</h2>
          <LukkKnapp />
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "10px 0 0" }}>{body}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <CTAPill ghost>{avbryt}</CTAPill>
          <CTAPill>{bekreft}</CTAPill>
        </div>
      </div>
    </Ramme>
  );
}

/* ── Ark: bunn-sheet mobil m/ håndtak ─────────────────── */
export interface ArkItem {
  t: string;
  s: string;
  a: AkseKey;
}
export interface ArkProps {
  title?: ReactNode;
  items?: ArkItem[];
  h?: number;
}
export function Ark({
  title = "Velg treningsområde",
  items = [
    { t: "Nærspill", s: "Chip, pitch og bunker", a: "SPILL" },
    { t: "Putting", s: "Lengdekontroll og lesing", a: "SPILL" },
    { t: "Driver", s: "Køllehastighet og retning", a: "SLAG" },
    { t: "Jern", s: "Treffbilde og avstandskontroll", a: "TEK" },
  ], h = 480,
}: ArkProps) {
  return (
    <Ramme w={390} h={h} align="bottom">
      <div style={{ position: "relative", background: T.panel, border: `1px solid ${T.borderS}`, borderBottom: "none", borderRadius: "20px 20px 0 0", padding: "10px 20px 26px" }}>
        <span style={{ display: "block", width: 36, height: 4, borderRadius: 9999, background: T.borderS, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>{title}</h2>
          <LukkKnapp />
        </div>
        {items.map((x, i) => (
          <Rad key={i} title={x.t} sub={x.s} meta={<AkseChip a={x.a} />} last={i === items.length - 1} />
        ))}
      </div>
    </Ramme>
  );
}

/* ── Skuff: side-drawer desktop ───────────────────────── */
export interface SkuffRow {
  l: ReactNode;
  v: ReactNode;
}
export interface SkuffProps {
  title?: ReactNode;
  eyebrow?: ReactNode;
  rows?: SkuffRow[];
  cta?: ReactNode;
  w?: number;
  h?: number;
}
export function Skuff({
  title = "Øktdetaljer", eyebrow = "Torsdag 9. juli · 07:30",
  rows = [
    { l: "Område", v: "Nærspill" }, { l: "Varighet", v: "1,5 t" },
    { l: "Miljø", v: "Bane" }, { l: "Fokus", v: "Landing 60–100 m" },
  ],
  cta = "Åpne i Workbench", w = 720, h = 420,
}: SkuffProps) {
  return (
    <Ramme w={w} h={h} align="right">
      <div style={{ position: "relative", width: 300, background: T.panel, borderLeft: `1px solid ${T.borderS}`, display: "flex", flexDirection: "column", padding: "18px 20px", boxShadow: "-24px 0 60px rgba(0,0,0,0.45)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div>
            <Caps size={9}>{eyebrow}</Caps>
            <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: T.fg, margin: "6px 0 0" }}>{title}</h2>
          </div>
          <LukkKnapp />
        </div>
        <div style={{ marginTop: 14, flex: 1 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{r.l}</span>
              <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg }}>{r.v}</span>
            </div>
          ))}
        </div>
        <CTAPill icon="arrow-right">{cta}</CTAPill>
      </div>
    </Ramme>
  );
}

/* ── Popover: liten meny forankret under trigger ──────── */
export interface PopoverItem {
  i: string;
  t: string;
  farge?: string;
}
export interface PopoverProps {
  trigger?: ReactNode;
  items?: PopoverItem[];
  w?: number;
  h?: number;
}
export function Popover({
  trigger = "Handlinger",
  items = [
    { i: "pencil", t: "Rediger økt" },
    { i: "copy", t: "Dupliser til uke 30" },
    { i: "trash-2", t: "Slett økt", farge: T.down },
  ], w = 360, h = 250,
}: PopoverProps) {
  return (
    <Ramme w={w} h={h} scrim={false}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
        <CTAPill ghost icon="chevron-down">{trigger}</CTAPill>
        <div style={{ width: 220, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 14, padding: 6, boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
          {items.map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, cursor: "pointer", background: i === 0 ? T.panel2 : "transparent" }}>
              <Icon name={x.i} size={14} style={{ color: x.farge || T.fg2 }} />
              <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: x.farge || T.fg }}>{x.t}</span>
            </div>
          ))}
        </div>
      </div>
    </Ramme>
  );
}

/* ── Verktoytips: mørk tooltip over element ───────────── */
export interface VerktoytipsProps {
  tekst?: ReactNode;
  trigger?: ReactNode;
  verdi?: ReactNode;
  w?: number;
  h?: number;
}
export function Verktoytips({ tekst = "SG mot CS100-referansen, siste 8 runder", trigger = "SG totalt", verdi = "+1,8", w = 360, h = 170 }: VerktoytipsProps) {
  return (
    <Ramme w={w} h={h} scrim={false}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
        <span style={{ maxWidth: 230, textAlign: "center", fontFamily: T.ui, fontSize: 11.5, color: T.fg, lineHeight: 1.5, background: "rgb(34,37,34)", border: `1px solid ${T.borderS}`, borderRadius: 9, padding: "8px 11px", boxShadow: "0 10px 26px rgba(0,0,0,0.4)" }}>{tekst}</span>
        <span style={{ width: 9, height: 9, background: "rgb(34,37,34)", borderRight: `1px solid ${T.borderS}`, borderBottom: `1px solid ${T.borderS}`, transform: "rotate(45deg)", marginTop: -12 }} />
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, background: T.panel2, border: `1px dashed ${T.borderS}`, borderRadius: 10, padding: "7px 13px", marginTop: 4 }}>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>{trigger}</span>
          <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg }}>{verdi}</span>
        </span>
      </div>
    </Ramme>
  );
}

/* ── Toast: nederst m/ ikon, melding og angre ─────────── */
export interface ToastProps {
  ikon?: string;
  melding?: ReactNode;
  angre?: ReactNode;
  tone?: StatusTone;
  w?: number;
  h?: number;
}
export function Toast({ ikon = "check", melding = "Økten er logget — 1,5 t nærspill", angre = "Angre", tone = "up", w = 560, h = 170 }: ToastProps) {
  const c: string = { up: T.up, warn: T.warn, down: T.down, info: T.info, lime: T.lime }[tone];
  return (
    <Ramme w={w} h={h} scrim={false} align="bottom">
      <div style={{ position: "relative", alignSelf: "center", display: "flex", alignItems: "center", gap: 11, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 14, padding: "11px 14px", margin: "0 0 18px", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
        <span style={{ width: 26, height: 26, borderRadius: 9999, background: `color-mix(in srgb,${c} 14%,transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name={ikon} size={13} style={{ color: c }} />
        </span>
        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.fg }}>{melding}</span>
        {angre && <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.lime, cursor: "pointer", marginLeft: 6 }}>{angre}</span>}
        <Icon name="x" size={13} style={{ color: T.mut, cursor: "pointer", marginLeft: 2 }} />
      </div>
    </Ramme>
  );
}

/* ── Banner: info/advarsel-stripe øverst — klarspråk ──── */
export type BannerTone = "info" | "advarsel" | "ok";
export interface BannerProps {
  tone?: BannerTone;
  tekst?: ReactNode;
  cta?: ReactNode;
  w?: number;
}
export function Banner({ tone = "info", tekst = "TrackMan-synk pågår — nye slag vises om noen minutter.", cta = "Se status", w = 720 }: BannerProps) {
  const m: { c: string; i: string } = { info: { c: T.info, i: "info" }, advarsel: { c: T.warn, i: "alert-triangle" }, ok: { c: T.up, i: "check" } }[tone] || { c: T.info, i: "info" };
  return (
    <div style={{ width: w, display: "flex", alignItems: "center", gap: 10, background: `color-mix(in srgb,${m.c} 9%,${T.panel})`, border: `1px solid color-mix(in srgb,${m.c} 30%,transparent)`, borderRadius: 12, padding: "10px 14px" }}>
      <Icon name={m.i} size={15} style={{ color: m.c, flex: "none" }} />
      <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: T.fg, lineHeight: 1.5 }}>{tekst}</span>
      {cta && <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: m.c, cursor: "pointer", whiteSpace: "nowrap" }}>{cta} →</span>}
      <Icon name="x" size={13} style={{ color: T.mut, cursor: "pointer" }} />
    </div>
  );
}

/* ── KommandoPalett: ⌘K-overlegg (Fey/Vapi-idiomet) ───── */
export interface KommandoItem {
  i: string;
  t: string;
  k?: string;
  aktiv?: boolean;
}
export interface KommandoGruppe {
  l: string;
  items: KommandoItem[];
}
export interface KommandoPalettProps {
  sok?: ReactNode;
  grupper?: KommandoGruppe[];
  w?: number;
  h?: number;
}
export function KommandoPalett({
  sok = "Søk eller hopp til …",
  grupper = [
    { l: "Handlinger", items: [
      { i: "plus", t: "Logg ny økt", k: "⌘ N", aktiv: true },
      { i: "calendar", t: "Planlegg uke 29 i Workbench", k: "⌘ P" },
    ] },
    { l: "Sist brukt", items: [
      { i: "user", t: "Øyvind Rohjan — Oversikt" },
      { i: "bar-chart", t: "SG-analyse · Nærspill" },
    ] },
    { l: "Alle sider", items: [
      { i: "home", t: "Hjem", k: "G H" },
      { i: "play", t: "Gjør", k: "G G" },
    ] },
  ], w = 760, h = 470,
}: KommandoPalettProps) {
  return (
    <Ramme w={w} h={h}>
      <div style={{ position: "relative", width: 520, background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 28px 70px rgba(0,0,0,0.55)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>
          <Icon name="search" size={15} style={{ color: T.mut, flex: "none" }} />
          <span style={{ flex: 1, fontFamily: T.ui, fontSize: 14, color: T.mut }}>{sok}</span>
          <Kbd>ESC</Kbd>
        </div>
        <div style={{ padding: "8px 8px 10px" }}>
          {grupper.map((g, gi) => (
            <div key={gi} style={{ marginTop: gi ? 6 : 0 }}>
              <Caps size={8.5} style={{ padding: "6px 10px 4px" }}>{g.l}</Caps>
              {g.items.map((x, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, background: x.aktiv ? T.panel3 : "transparent", position: "relative", cursor: "pointer" }}>
                  {x.aktiv && <span style={{ position: "absolute", left: 0, top: 7, bottom: 7, width: 2, borderRadius: 2, background: T.lime }} />}
                  <Icon name={x.i} size={14} style={{ color: x.aktiv ? T.lime : T.fg2 }} />
                  <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13, fontWeight: x.aktiv ? 600 : 500, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.t}</span>
                  {x.k && <Kbd>{x.k}</Kbd>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Ramme>
  );
}
