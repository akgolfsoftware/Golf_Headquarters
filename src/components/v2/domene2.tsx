"use client";

/* AK Golf HQ v2 — DOMENE-KOMPONENTER 2 (retning C «Presis»).
   Fortsettelse av domene.tsx: AK-formel, nivåer/benchmark, oppgaver,
   velvære, tidsvalg og forelder-visning. Port av ui_kits/v2/v2-domene2.jsx
   → produksjons-TSX (diff-null). Primitiver fra "./core", grunnstein fra
   @/lib/v2/*. Regler: mono-tall m/ komma-desimal, «—» for manglende data,
   opp/ned = T.up/T.down (ALDRI lime), lime kun aksent/hero, klarspråk
   (ARG=Nærspill). Demo-data som default-props → alt rendres rett. */

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { T, fmtSg, type AkseKey } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { AkseChip, Caps, Kort, StatusPill, InnsiktChip, AvatarInit } from "./core";

/* ── Delte hjelpere ───────────────────────────────────── */
function mono(size: number, color: string = T.fg, weight: number = 700): CSSProperties {
  return { fontFamily: T.mono, fontSize: size, fontWeight: weight, color, fontVariantNumeric: "tabular-nums" };
}
const KAT_NAVN: Record<string, string> = { OTT: "Tee-slag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting" };

export interface BitProps {
  icon?: string;
  monoTekst?: boolean;
  children?: ReactNode;
}
/* nøytral formel-brikke (samme form som AkseChip) */
export function Bit({ icon, monoTekst, children }: BitProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: monoTekst ? T.mono : T.ui, fontSize: monoTekst ? 9 : 11, fontWeight: monoTekst ? 700 : 600, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px", whiteSpace: "nowrap" }}>
      {icon && <Icon name={icon} size={11} style={{ color: T.mut }} />}{children}
    </span>
  );
}

/* ── LFaseBadge — læringsfase L1–L5 m/ mini-progresjon ── */
const LFASE_NAVN: Record<number, string> = { 1: "Lære", 2: "Stabilisere", 3: "Variere", 4: "Prestere", 5: "Overføre" };
export interface LFaseBadgeProps {
  fase?: string;
  label?: ReactNode | null;
  kompakt?: boolean;
}
export function LFaseBadge({ fase = "L3", label = null, kompakt = false }: LFaseBadgeProps) {
  const n = Math.max(1, Math.min(5, parseInt(String(fase).replace(/\D/g, ""), 10) || 1));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 8px" }}>
      <span style={{ ...mono(9.5, T.fg) }}>L{n}</span>
      <span style={{ display: "inline-flex", gap: 2.5 }}>
        {[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ width: 4, height: 4, borderRadius: 9999, background: i <= n ? T.fg2 : T.track }} />)}
      </span>
      {!kompakt && <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>{label || LFASE_NAVN[n]}</span>}
    </span>
  );
}

/* ── AKFormelChip — øktens oppsett som kompakt chip-rad ──
   AK-formel: akse · SG-kategori · miljø · intensitet · L-fase. */
export interface AKFormel {
  akse?: AkseKey;
  kategori?: string;
  miljo?: string;
  intensitet?: string;
  lFase?: string;
}
export interface AKFormelChipProps {
  formel?: AKFormel;
  visLFaseNavn?: boolean;
}
export function AKFormelChip({
  formel = { akse: "SLAG", kategori: "APP", miljo: "Bane", intensitet: "CS80", lFase: "L3" },
  visLFaseNavn = false,
}: AKFormelChipProps) {
  const f = formel || {};
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {f.akse && <AkseChip a={f.akse} />}
      {f.kategori && <Bit>{KAT_NAVN[f.kategori] || f.kategori}</Bit>}
      {f.miljo && <Bit icon="map-pin">{f.miljo}</Bit>}
      {f.intensitet && <Bit monoTekst>{f.intensitet}</Bit>}
      {f.lFase && <LFaseBadge fase={f.lFase} kompakt={!visLFaseNavn} />}
    </div>
  );
}

/* ── BenchmarkBadge — nivåmerke m/ percentil ──────────── */
export interface BenchmarkBadgeProps {
  nivaa?: string;
  percentil?: number | null;
  sammenheng?: string;
  label?: ReactNode;
}
export function BenchmarkBadge({ nivaa = "CS90", percentil = 72, sammenheng = "av spillere i din kategori", label = "Klubbhastighet" }: BenchmarkBadgeProps) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: T.rRow, padding: "10px 14px" }}>
      <span style={{ width: 48, height: 40, borderRadius: 10, background: T.panel3, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", ...mono(13), flex: "none" }}>{nivaa || "—"}</span>
      <div style={{ minWidth: 0 }}>
        <Caps size={8.5}>{label}</Caps>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
          <span style={{ ...mono(15) }}>{percentil == null ? "—" : `${percentil}.`}</span>
          <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>percentil {sammenheng}</span>
        </div>
      </div>
    </div>
  );
}

/* ── DiffKort — før → etter m/ pil og dom ─────────────── */
export interface DiffKortProps {
  label?: ReactNode;
  foer?: string | null;
  etter?: string | null;
  enhet?: string;
  delta?: string | null;
  god?: boolean;
  periode?: ReactNode;
}
export function DiffKort({
  label = "Spredning 7-jern", foer = "11,2", etter = "8,4", enhet = "m",
  delta = "−2,8 m", god = true, periode = "siste 30 dager",
}: DiffKortProps) {
  const c = god ? T.up : T.down;
  return (
    <Kort pad="15px 17px">
      <Caps size={9}>{label}</Caps>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 12 }}>
        <span style={{ ...mono(20, T.mut, 600) }}>{foer == null ? "—" : foer}</span>
        <Icon name="arrow-right" size={15} style={{ color: T.mut, alignSelf: "center" }} />
        <span style={{ ...mono(32), lineHeight: 0.95 }}>{etter == null ? "—" : etter}<span style={{ fontSize: 13, color: T.mut, marginLeft: 4 }}>{enhet}</span></span>
        {delta != null && <span style={{ ...mono(10.5, c), background: `color-mix(in srgb,${c} 12%,transparent)`, borderRadius: 5, padding: "2px 6px" }}>{delta}</span>}
      </div>
      {periode && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, display: "block", marginTop: 9 }}>{periode}</span>}
    </Kort>
  );
}

/* ── FleksMerke — fleksibel eller låst tid (klarspråk) ── */
export interface FleksMerkeProps {
  fleks?: boolean;
  tekst?: string | null;
}
export function FleksMerke({ fleks = true, tekst = null }: FleksMerkeProps) {
  const c = fleks ? T.info : T.mut;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: c, background: `color-mix(in srgb,${c} 10%,transparent)`, borderRadius: 9999, padding: "4px 9px" }}>
      <Icon name={fleks ? "unlock" : "lock"} size={10} />
      {tekst || (fleks ? "Fleksibel tid" : "Fast tid")}
    </span>
  );
}

/* ── LiveStatus — puls-prikk + tekst ──────────────────── */
export type LiveTone = "down" | "up" | "lime" | "warn" | "info";
export interface LiveStatusProps {
  tekst?: ReactNode;
  tone?: LiveTone;
  tid?: ReactNode | null;
}
export function LiveStatus({ tekst = "Økt pågår", tone = "down", tid = null }: LiveStatusProps) {
  const c: string = { down: T.down, up: T.up, lime: T.lime, warn: T.warn, info: T.info }[tone] || T.down;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <style>{`@keyframes v2puls { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 35%, transparent); } 100% { box-shadow: 0 0 0 8px transparent; } }`}</style>
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: c, color: c, animation: "v2puls 1.6s ease-out infinite", flex: "none" }} />
      <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>{tekst}</span>
      {tid && <span style={{ ...mono(12, T.fg2, 600) }}>{tid}</span>}
    </span>
  );
}

/* ── NivaStige — vertikale nivåtrinn m/ nå-markør ─────── */
export interface NivaStigeProps {
  trinn?: string[];
  naa?: string;
  beskrivelser?: Record<string, ReactNode>;
}
export function NivaStige({
  trinn = ["CS110", "CS100", "CS90", "CS80", "CS70"], /* øverst = høyest */
  naa = "CS90", beskrivelser = { CS90: "Neste test 18. juli" },
}: NivaStigeProps) {
  const naaIdx = trinn.indexOf(naa);
  return (
    <div>
      {trinn.map((t, i) => {
        const er = i === naaIdx, over = naaIdx !== -1 && i < naaIdx, naadd = naaIdx !== -1 && i > naaIdx;
        return (
          <div key={t} style={{ display: "flex", gap: 12 }}>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flex: "none" }}>
              <span style={{ width: er ? 14 : 8, height: er ? 14 : 8, borderRadius: 9999, marginTop: er ? 2 : 5, flex: "none", background: er ? T.lime : naadd ? T.fg2 : "transparent", border: er ? `2px solid ${T.panel}` : `1.5px solid ${naadd ? T.fg2 : T.borderS}` }} />
              {i < trinn.length - 1 && <span style={{ width: 1, flex: 1, minHeight: 14, background: T.border }} />}
            </span>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: i === trinn.length - 1 ? 0 : 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ ...mono(12.5, er ? T.fg : over ? T.mut : T.fg2) }}>{t}</span>
                {er && <StatusPill>Nå</StatusPill>}
                {naadd && <Icon name="check" size={12} style={{ color: T.up }} />}
              </div>
              {beskrivelser && beskrivelser[t] && <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, display: "block", marginTop: 3 }}>{beskrivelser[t]}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── OppgaveKort — oppgave m/ frist og status ─────────── */
type OppgaveStatus = "aapen" | "paagaar" | "fullfort" | "forfalt";
type OppgaveTone = "info" | "warn" | "up" | "down";
const OPPGAVE_STATUS: Record<OppgaveStatus, { tone: OppgaveTone; l: string; ikon: string }> = {
  aapen:    { tone: "info", l: "Åpen",     ikon: "circle" },
  paagaar:  { tone: "warn", l: "Pågår",    ikon: "loader" },
  fullfort: { tone: "up",   l: "Fullført", ikon: "check" },
  forfalt:  { tone: "down", l: "Forfalt",  ikon: "alert-triangle" },
};
export interface OppgaveKortProps {
  tittel?: ReactNode;
  sub?: ReactNode;
  frist?: ReactNode;
  status?: OppgaveStatus; /* aapen | paagaar | fullfort | forfalt */
  akse?: AkseKey; /* FYS/TEK/SLAG/SPILL/TURN */
  onClick?: () => void;
}
export function OppgaveKort({
  tittel = "Loggfør puttetest 3–6 ft", sub = "Fra treningsplanen · uke 28",
  frist = "Fredag 10. juli", status = "aapen",
  akse = "SLAG", onClick,
}: OppgaveKortProps) {
  const s = OPPGAVE_STATUS[status] || OPPGAVE_STATUS.aapen;
  const ferdig = status === "fullfort";
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rRow + 4, padding: "13px 16px", cursor: onClick ? "pointer" : "default" }}>
      <span style={{ width: 34, height: 34, borderRadius: 11, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon name={s.ikon} size={15} style={{ color: { info: T.info, warn: T.warn, up: T.up, down: T.down }[s.tone] }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: ferdig ? T.fg2 : T.fg, textDecoration: ferdig ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tittel}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
          {sub && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>{sub}</span>}
          {frist && !ferdig && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 11, color: status === "forfalt" ? T.down : T.mut }}><Icon name="clock" size={11} />{frist}</span>}
        </div>
      </div>
      {akse && <AkseChip a={akse} />}
      <StatusPill tone={s.tone}>{s.l}</StatusPill>
    </div>
  );
}

/* ── SGSplittKort — SG delt på OTT/APP/ARG/PUTT, kompakt ── */
export interface SGKategori {
  k: string;
  sg: number | null;
}
export interface SGSplittKortProps {
  kategorier?: SGKategori[];
  baseline?: ReactNode;
}
export function SGSplittKort({
  kategorier = [{ k: "OTT", sg: 0.3 }, { k: "APP", sg: 0.6 }, { k: "ARG", sg: -0.4 }, { k: "PUTT", sg: -1.2 }],
  baseline = "Broadie scratch",
}: SGSplittKortProps) {
  return (
    <Kort pad="14px 16px">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <Caps>SG-splitt</Caps>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>mot {baseline}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${kategorier.length}, 1fr)`, gap: 8 }}>
        {kategorier.map((x, i) => {
          const c = x.sg == null ? T.mut : x.sg >= 0 ? T.up : T.down;
          return (
            <div key={x.k} style={{ textAlign: "center", padding: "8px 4px", borderLeft: i === 0 ? "none" : `1px solid ${T.border}` }}>
              <span style={{ ...mono(16, c), display: "block", lineHeight: 1 }}>{x.sg == null ? "—" : fmtSg(x.sg)}</span>
              <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, display: "block", marginTop: 6 }}>{KAT_NAVN[x.k] || x.k}</span>
            </div>
          );
        })}
      </div>
    </Kort>
  );
}

/* ── VelvaereKort — søvn/energi/motivasjon 1–5 ────────── */
export interface VelvaereVerdier {
  sovn?: number | null;
  energi?: number | null;
  motivasjon?: number | null;
}
export interface VelvaereKortProps {
  verdier?: VelvaereVerdier;
  dato?: ReactNode;
  merknad?: ReactNode;
}
export function VelvaereKort({
  verdier = { sovn: 4, energi: 3, motivasjon: 5 }, dato = "I dag, 07:05",
  merknad = "Litt tung i beina etter gårsdagens FYS-økt.",
}: VelvaereKortProps) {
  const rader: { key: keyof VelvaereVerdier; l: string; ikon: string }[] = [
    { key: "sovn", l: "Søvn", ikon: "moon" },
    { key: "energi", l: "Energi", ikon: "zap" },
    { key: "motivasjon", l: "Motivasjon", ikon: "heart" },
  ];
  const farge = (v: number | null | undefined) => (v == null ? T.mut : v <= 2 ? T.down : v === 3 ? T.warn : T.up);
  return (
    <Kort eyebrow="Velvære" action={<span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{dato}</span>} pad="15px 17px">
      {rader.map((r, i) => {
        const v = verdier ? verdier[r.key] : null, c = farge(v);
        return (
          <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i === rader.length - 1 ? "none" : `1px solid ${T.border}` }}>
            <Icon name={r.ikon} size={14} style={{ color: T.fg2, flex: "none" }} />
            <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>{r.l}</span>
            <span style={{ display: "inline-flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((d) => <span key={d} style={{ width: 8, height: 8, borderRadius: 9999, background: v != null && d <= v ? c : T.track }} />)}
            </span>
            <span style={{ width: 30, textAlign: "right", ...mono(12, v == null ? T.mut : T.fg) }}>{v == null ? "—" : `${v}/5`}</span>
          </div>
        );
      })}
      {merknad && <div style={{ marginTop: 10 }}><InnsiktChip>{merknad}</InnsiktChip></div>}
    </Kort>
  );
}

/* ── TidsVelger — klokkeslett-velger (mock) ───────────── */
export interface TidsVelgerProps {
  label?: ReactNode;
  valgt?: string;
  forslag?: string[];
  onChange?: ((t: string) => void) | null;
}
export function TidsVelger({
  label = "Starttid", valgt = "07:15",
  forslag = ["06:30", "07:15", "08:00", "16:30", "17:15"],
  onChange = null,
}: TidsVelgerProps) {
  const [tid, setTid] = useState(valgt);
  const velg = (t: string) => { setTid(t); onChange?.(t); };
  const knapp: CSSProperties = { width: 34, height: 34, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" };
  const skift = (min: number) => {
    const [h, m] = tid.split(":").map(Number);
    const tot = (h * 60 + m + min + 1440) % 1440;
    velg(`${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`);
  };
  return (
    <Kort pad="15px 17px">
      <Caps size={9}>{label}</Caps>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, margin: "14px 0 4px" }}>
        <span style={knapp} onClick={() => skift(-15)}><Icon name="minus" size={14} style={{ color: T.fg2 }} /></span>
        <span style={{ ...mono(40), letterSpacing: "-0.02em", lineHeight: 1 }}>{tid}</span>
        <span style={knapp} onClick={() => skift(15)}><Icon name="plus" size={14} style={{ color: T.fg2 }} /></span>
      </div>
      <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, textAlign: "center", marginBottom: 12 }}>± 15 min</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {forslag.map((t) => {
          const on = t === tid;
          return (
            <button key={t} onClick={() => velg(t)} style={{ appearance: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", padding: "6px 12px", borderRadius: 9999, color: on ? T.onLime : T.fg2, background: on ? T.lime : T.panel2, border: `1px solid ${on ? "transparent" : T.border}` }}>{t}</button>
          );
        })}
      </div>
    </Kort>
  );
}

/* ── BarnProgresjonKort — forelder ser barnets uke i klarspråk ── */
export interface BarnTall {
  l: ReactNode;
  v: ReactNode;
}
export interface BarnProgresjonKortProps {
  barn?: string;
  uke?: ReactNode;
  oppsummering?: ReactNode;
  tall?: BarnTall[];
  fraCoach?: ReactNode;
  coach?: ReactNode;
}
export function BarnProgresjonKort({
  barn = "Øyvind Rohjan", uke = "Uke 28",
  oppsummering = "Øyvind har fullført 4 av 5 planlagte økter denne uken. Han har jobbet mest med putting og nærspill, og coachen er fornøyd med fremgangen.",
  tall = [{ l: "Økter fullført", v: "4 av 5" }, { l: "Timer trent", v: "9,5 t" }, { l: "Neste økt", v: "Tor 14:00" }],
  fraCoach = "Godt trykk denne uken — han er klar for helgens turnering.",
  coach = "Anders Kristiansen",
}: BarnProgresjonKortProps) {
  return (
    <Kort tint pad="16px 18px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
          <AvatarInit navn={barn} size={38} />
          <span>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, display: "block" }}>{barn}</span>
            <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>Slik gikk uken</span>
          </span>
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "4px 8px" }}>{uke}</span>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0" }}>{oppsummering}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tall.length}, 1fr)`, gap: 10, marginTop: 14 }}>
        {tall.map((x, i) => (
          <div key={i} style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: T.rRow, padding: "10px 12px" }}>
            <Caps size={8.5}>{x.l}</Caps>
            <span style={{ ...mono(15), display: "block", marginTop: 6 }}>{x.v}</span>
          </div>
        ))}
      </div>
      {fraCoach && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, padding: "10px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
          <Icon name="message-circle" size={13} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>«{fraCoach}» <span style={{ color: T.mut }}>— {coach}</span></span>
        </div>
      )}
    </Kort>
  );
}
