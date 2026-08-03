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

/* Paper-radiusskala (designsystem/paper/tokens/akhq-tokens.css): r-sm 8 · r
   (app-default) 12 · r-pill 999. T fra ./core dekker allerede disse tallene
   (rTag=8, rRow=12, rPill=9999) — gjenbrukt her under Paper-navn for
   lesbarhet i denne filen. Ingen nye tokens innført, ingen verdier endret. */
const PAPER_R_SM = T.rTag; // 8 — Paper --r-sm (lukkeknapper, chips, verktøytips)
const PAPER_R = T.rRow; // 12 — Paper --r (app-default: modal, ark-topp, popover)

/* Lukkeknapp — størrelse/radius følger Paper sin spesifikasjon per lag
   (Ark-håndtaket ER lukkeknappen i Paper, Modal lukkes kun via handlingsraden
   — begge bruker derfor ikke denne lenger; Skuff sin er 32 px/r-sm). */
function LukkKnapp({ size = 44, radius = PAPER_R, iconSize = 16 }: { size?: number; radius?: number | string; iconSize?: number }) {
  return (
    <button
      type="button"
      aria-label="Lukk"
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        width: size,
        height: size,
        borderRadius: radius,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flex: "none",
        color: "inherit",
        padding: 0,
      }}
    >
      <Icon name="x" size={iconSize} style={{ color: T.fg2 }} />
    </button>
  );
}

/* ── Modal: r12-panel m/ tittel, body og footer-knapper (Paper Modal —
   ingen hjørne-X; dialogen lukkes kun via handlingsraden) ── */
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="v2-modal-title"
        style={{
          position: "relative",
          width: 420,
          maxWidth: "calc(100% - 24px)",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: PAPER_R,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "var(--v2-shadow)",
        }}
      >
        <h2 id="v2-modal-title" style={{ fontFamily: T.disp, fontWeight: 500, fontSize: 16, color: T.fg, margin: 0 }}>{title}</h2>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5, margin: 0 }}>{body}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
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
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "relative",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderBottom: "none",
          borderRadius: `${PAPER_R}px ${PAPER_R}px 0 0`,
          padding: "12px 16px 24px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Håndtaket ER lukkeknappen i Paper (BottomSheet.prompt.md) — ingen
            separat hjørne-X ved siden av tittelen. */}
        <span style={{ display: "block", width: 36, height: 4, borderRadius: T.rPill, background: T.borderS, margin: "0 auto" }} aria-hidden />
        <h2 style={{ fontFamily: T.disp, fontWeight: 500, fontSize: 16, color: T.fg, margin: 0 }}>{title}</h2>
        <div>
          {items.map((x, i) => (
            <Rad key={i} title={x.t} sub={x.s} meta={<AkseChip a={x.a} />} last={i === items.length - 1} />
          ))}
        </div>
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
      {/* Paper Drawer: tre regioner (header/body/footer), border-left uten
          skygge, 420 px standardbredde. Fotraden ligger utenfor skrollområdet. */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "relative",
          width: 420,
          maxWidth: "100%",
          height: "100%",
          background: T.panel,
          borderLeft: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 16px 12px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ flex: 1 }}>
            <Caps size={9} style={{ marginBottom: 2 }}>{eyebrow}</Caps>
            <h2 style={{ fontFamily: T.disp, fontWeight: 500, fontSize: 17, lineHeight: 1.25, color: T.fg, margin: 0 }}>{title}</h2>
          </div>
          <LukkKnapp size={32} radius={PAPER_R_SM} iconSize={14} />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{r.l}</span>
              <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 16px", borderTop: `1px solid ${T.border}` }}>
          <CTAPill icon="arrow-right">{cta}</CTAPill>
        </div>
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
        {/* Paper Popover-laget (akhq-pop-lay): 288 px, r(12), s3-padding, delt
            skygge-token. Radraden under er AK-eget menyinnhold — Paper har
            ikke tegnet menyanatomien her (se PR-beskrivelsen). */}
        <div style={{ width: 288, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: PAPER_R, padding: 12, boxShadow: "var(--v2-shadow)" }}>
          {items.map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", minHeight: 44, borderRadius: T.rRow, cursor: "pointer", background: i === 0 ? T.panel2 : "transparent" }}>
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
      {/* Paper Tooltip: mono 11px, r-sm(8), 6px 8px-padding, ingen kant, ingen
          pil — kun 6 px luft ned mot utløseren (Tooltip.jsx). */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <span style={{ maxWidth: 240, textAlign: "left", fontFamily: T.mono, fontSize: 11, letterSpacing: "0.01em", color: T.fg, lineHeight: 1.35, background: "rgb(34,37,34)", borderRadius: PAPER_R_SM, padding: "6px 8px", boxShadow: "var(--v2-shadow)" }}>{tekst}</span>
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, background: T.panel2, border: `1px dashed ${T.borderS}`, borderRadius: 10, padding: "7px 13px" }}>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>{trigger}</span>
          <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg }}>{verdi}</span>
        </span>
      </div>
    </Ramme>
  );
}

/* ── Toast: blekkflate m/ 6px tone-prikk, melding og angre ─────────── */
export interface ToastProps {
  melding?: ReactNode;
  angre?: ReactNode;
  tone?: StatusTone;
  w?: number;
  h?: number;
}
export function Toast({ melding = "Økten er logget — 1,5 t nærspill", angre = "Angre", tone = "up", w = 560, h = 170 }: ToastProps) {
  const c: string = { up: T.up, warn: T.warn, down: T.down, info: T.info, lime: T.lime }[tone];
  return (
    <Ramme w={w} h={h} scrim={false} align="bottom">
      {/* Paper Toast (Toast.prompt.md): «fargen ligger i prikken, ikke
          flaten» — 6px prikk, ingen ikon-sirkel. Ingen dismiss-X (den
          forsvinner selv); «Angre» er AK sin egen handling, ikke i Paper. */}
      <div
        role="status"
        style={{
          position: "relative",
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: T.panel3,
          border: `1px solid ${T.border}`,
          borderRadius: PAPER_R_SM,
          padding: "12px 16px",
          margin: "0 0 24px",
          boxShadow: "var(--v2-shadow)",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: T.rPill, background: c, flex: "none" }} aria-hidden />
        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, flex: 1 }}>{melding}</span>
        {angre && (
          <button type="button" className="v2-focus" style={{ appearance: "none", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.lime, cursor: "pointer", background: "transparent", border: "none", minHeight: 44, padding: "0 8px" }}>
            {angre}
          </button>
        )}
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
    <div
      role="status"
      style={{
        width: w,
        maxWidth: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 48,
        background: `color-mix(in srgb,${m.c} 9%,${T.panel})`,
        border: `1px solid color-mix(in srgb,${m.c} 30%,transparent)`,
        borderRadius: T.rRow,
        padding: "10px 14px",
      }}
    >
      <Icon name={m.i} size={15} style={{ color: m.c, flex: "none" }} />
      <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: T.fg, lineHeight: 1.5 }}>{tekst}</span>
      {cta && (
        <button type="button" className="v2-focus" style={{ appearance: "none", fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: m.c, cursor: "pointer", whiteSpace: "nowrap", background: "transparent", border: "none", minHeight: 44 }}>
          {cta} →
        </button>
      )}
      <button type="button" aria-label="Lukk banner" className="v2-focus" style={{ appearance: "none", background: "transparent", border: "none", cursor: "pointer", minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
        <Icon name="x" size={14} style={{ color: T.mut }} />
      </button>
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
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", minHeight: 44, borderRadius: T.rRow, background: x.aktiv ? T.panel3 : "transparent", position: "relative", cursor: "pointer" }}>
                  {x.aktiv && <span style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: T.lime }} />}
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
