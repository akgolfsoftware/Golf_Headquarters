"use client";

/* AK Golf HQ v2 — DOMENE-KOMPONENTER (retning C «Presis»).
   Datakontrakter speiler src/components/athletic/golfdata/ (OektKort, ListRow,
   Tag, Avatar, StatusDot, LiveStatus m.fl.) — gjenskapt i v2-idiomet.
   Komponeres av kjerneprimitivene i ./core (mockupens window.V2).
   Port av ui_kits/v2/v2-domene.jsx → produksjons-TSX (diff-null).
   Alle props har demo-data som default → alt kan rendres rett i galleriet. */

import { useState, type ReactNode } from "react";
import type { AkseKey } from "@/lib/v2/tokens";
import {
  T,
  Kort,
  Caps,
  StatusPill,
  AkseChip,
  Rad,
  TomTilstand,
  AvatarInit,
  TallHero,
  NivaSkala,
  DeltaChip,
  SevChip,
  InnsiktChip,
  CTAPill,
  type StatusTone,
  type SevKey,
} from "./core";
import { Icon } from "@/components/v2/icon";

/* Delt: status-chip for økt/booking (klarspråk, aldri sperre-språk) */
type OktState = "live" | "done" | "planned" | "cancelled";
const OKT_STATUS: Record<OktState, { tone: StatusTone; l: string }> = {
  live: { tone: "down", l: "Live" },
  done: { tone: "up", l: "Fullført" },
  planned: { tone: "info", l: "Planlagt" },
  cancelled: { tone: "down", l: "Avlyst" },
};

interface MetaBitProps {
  icon: string;
  children?: ReactNode;
}
function MetaBit({ icon, children }: MetaBitProps) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}><Icon name={icon} size={12} />{children}</span>;
}

/* ── OktKort / OektKort — økt (showroom: tidskolonne + fargekant + CTA) ─
   Alias OektKort = Open Design-navn (Fase 2 domain top 5). */
export interface OktKortProps {
  title?: string;
  axis?: AkseKey;
  time?: string;
  duration?: string;
  location?: string;
  coach?: string;
  state?: OktState;
  naa?: boolean;
  onClick?: () => void;
  cta?: ReactNode;
  ctaGhost?: ReactNode;
  onCta?: () => void;
  onCtaGhost?: () => void;
  meta?: ReactNode;
  footerTall?: ReactNode;
}
export function OktKort({
  title = "Teknikk — P4 topp-posisjon",
  axis = "TEK",
  time = "07:15",
  duration = "90 min",
  location = "Toppgolf Oslo",
  coach = "Anders Kristiansen",
  state = "planned",
  naa = false,
  onClick,
  cta,
  ctaGhost,
  onCta,
  onCtaGhost,
  meta,
  footerTall,
}: OktKortProps) {
  const st = OKT_STATUS[state] || OKT_STATUS.planned;
  const kant =
    state === "done" ? T.up : state === "live" ? T.down : state === "cancelled" ? T.mut : T.forest;
  return (
    <div
      onClick={onClick}
      className={onClick ? "v2-kort-h" : undefined}
      style={{
        position: "relative",
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        padding: 0,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 12,
          bottom: 12,
          width: 3,
          borderRadius: T.rPill,
          background: kant,
        }}
        aria-hidden
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "72px 1fr",
          gap: 12,
          padding: "14px 16px 14px 18px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 12,
            color: T.mut,
            lineHeight: 1.35,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {time && <b style={{ display: "block", color: T.fg, fontWeight: 600 }}>{time}</b>}
          {duration}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, lineHeight: 1.2 }}>{title}</div>
            {naa ? <StatusPill>Nå</StatusPill> : <StatusPill tone={st.tone}>{st.l}</StatusPill>}
          </div>
          {(meta || location || coach) && (
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 4 }}>
              {meta ?? (
                <>
                  {location}
                  {location && coach ? " · " : ""}
                  {coach}
                </>
              )}
            </div>
          )}
          {axis && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              <AkseChip a={axis} />
            </div>
          )}
          {(cta || ctaGhost || footerTall) && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: `1px solid ${T.border}`,
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {footerTall && <span style={{ flex: 1, minWidth: 0 }}>{footerTall}</span>}
              {cta && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onCta?.();
                  }}
                >
                  <CTAPill icon="play">{cta}</CTAPill>
                </span>
              )}
              {ctaGhost && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onCtaGhost?.();
                  }}
                >
                  <CTAPill ghost>{ctaGhost}</CTAPill>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Open Design-navn — samme som OktKort. */
export const OektKort = OktKort;
export type OektKortProps = OktKortProps;

/* ── BookingKort — bestilt time m/ coach, sted, status ── */
export type BookingStatus = "bekreftet" | "venter" | "avlyst";
export interface BookingKortProps {
  tittel?: string;
  dato?: string;
  tid?: string;
  coach?: string;
  sted?: string;
  status?: BookingStatus;
}
export function BookingKort({
  tittel = "Privattime — nærspill", dato = "Tor 16. juli", tid = "14:00–15:00",
  coach = "Anders Kristiansen", sted = "AK Golf Academy, Fredrikstad",
  status = "bekreftet",
}: BookingKortProps) {
  const map: Record<BookingStatus, { tone: StatusTone; l: string }> = { bekreftet: { tone: "up", l: "Bekreftet" }, venter: { tone: "warn", l: "Venter på bekreftelse" }, avlyst: { tone: "down", l: "Avlyst" } };
  const s = map[status] || map.venter;
  return (
    <Kort pad="15px 17px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Caps>Booking</Caps><StatusPill tone={s.tone}>{s.l}</StatusPill>
      </div>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 9 }}>{tittel}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 9 }}>
        <MetaBit icon="calendar">{dato}</MetaBit>
        <MetaBit icon="clock"><span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{tid}</span></MetaBit>
        <MetaBit icon="user">{coach}</MetaBit>
        <MetaBit icon="map-pin">{sted}</MetaBit>
      </div>
    </Kort>
  );
}

/* ── KvitteringKort — betaling m/ linjer og sum ───────── */
export interface KvitteringLinje {
  l: string;
  v: string;
}
export interface KvitteringKortProps {
  tittel?: string;
  nr?: string;
  dato?: string;
  status?: string;
  linjer?: KvitteringLinje[];
  sum?: string;
  valuta?: string;
}
export function KvitteringKort({
  tittel = "Kvittering", nr = "2026-0341", dato = "1. juli 2026", status = "Betalt",
  linjer = [{ l: "PlayerHQ månedlig", v: "299,00" }, { l: "Privattime 60 min", v: "950,00" }],
  sum = "1 249,00", valuta = "kr",
}: KvitteringKortProps) {
  return (
    <Kort pad="15px 17px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Caps>{tittel} · {nr}</Caps><StatusPill tone="up">{status}</StatusPill>
      </div>
      <div style={{ marginTop: 6 }}>
        {linjer.map((x, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>{x.l}</span>
            <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{x.v}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 11 }}>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Totalt · {dato}</span>
          <span style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{sum} <span style={{ fontSize: 11, color: T.mut }}>{valuta}</span></span>
        </div>
      </div>
    </Kort>
  );
}

/* ── VarselRad — notifikasjon m/ ulest-prikk ──────────── */
export interface VarselRadProps {
  icon?: string;
  tittel?: ReactNode;
  sub?: ReactNode;
  tid?: string;
  ulest?: boolean;
  last?: boolean;
  onClick?: () => void;
}
export function VarselRad({
  icon = "bell", tittel = "Anders Kristiansen kommenterte økten din", sub = "«Bra tempo i P4 — hold CS60 en uke til.»",
  tid = "12 min", ulest = true, last = false, onClick,
}: VarselRadProps) {
  return (
    <Rad
      onClick={onClick} last={last}
      leading={
        <span style={{ position: "relative", width: 34, height: 34, borderRadius: 11, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name={icon} size={15} style={{ color: T.fg2 }} />
          {ulest && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 9999, background: T.lime, border: `2px solid ${T.panel}` }} />}
        </span>
      }
      title={<span style={{ fontWeight: ulest ? 700 : 600 }}>{tittel}</span>}
      sub={sub}
      meta={<span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, flex: "none" }}>{tid}</span>}
      trailing={null}
    />
  );
}

/* ── MeldingsTraad — chat-bobler (coach ↔ spiller) ─────── */
export interface Melding {
  meg: boolean;
  fra?: string;
  tekst: string;
  tid: string;
}
export interface MeldingsTraadProps {
  meldinger?: Melding[];
}
export function MeldingsTraad({
  meldinger = [
    { meg: false, fra: "Anders Kristiansen", tekst: "Så på TrackMan-økten din — spredningen på 7-jern er nede i 8,4 m. Sterkt.", tid: "09:12" },
    { meg: true, tekst: "Takk! Kjente at P4-følelsen satt mye bedre i dag.", tid: "09:15" },
    { meg: false, fra: "Anders Kristiansen", tekst: "Enig. Vi holder CS60 ut uken, så tester vi CS80 på mandag.", tid: "09:16" },
  ],
}: MeldingsTraadProps) {
  if (!meldinger.length) return <TomTilstand icon="message-circle" title="Ingen meldinger ennå" sub="Start samtalen med coachen din." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {meldinger.map((m, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.meg ? "flex-end" : "flex-start" }}>
          <div style={{ maxWidth: "78%", padding: "10px 13px", borderRadius: 14, borderBottomRightRadius: m.meg ? 4 : 14, borderBottomLeftRadius: m.meg ? 14 : 4, background: m.meg ? T.farge.forestMerkeA45 : T.panel2, border: `1px solid ${m.meg ? "${T.farge.forestMerkeA60}" : T.border}` }}>
            {!m.meg && m.fra && <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, display: "block", marginBottom: 4 }}>{m.fra}</span>}
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.55 }}>{m.tekst}</span>
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, marginTop: 4, padding: "0 4px" }}>{m.tid}</span>
        </div>
      ))}
    </div>
  );
}

/* ── DeltakerListe — påmeldte m/ status ───────────────── */
export interface Deltaker {
  navn: string;
  rolle: string;
  status: string;
  tone: StatusTone;
}
export interface DeltakerListeProps {
  tittel?: string;
  deltakere?: Deltaker[];
}
export function DeltakerListe({
  tittel = "Deltakere", deltakere = [
    { navn: "Øyvind Rohjan", rolle: "Spiller", status: "Påmeldt", tone: "up" },
    { navn: "Sara Lindqvist", rolle: "Spiller", status: "Påmeldt", tone: "up" },
    { navn: "Jonas Berg", rolle: "Spiller", status: "Venter", tone: "warn" },
    { navn: "Anders Kristiansen", rolle: "Coach", status: "Vert", tone: "lime" },
  ],
}: DeltakerListeProps) {
  return (
    <Kort eyebrow={`${tittel} · ${deltakere.length}`} pad="15px 17px">
      <div>
        {deltakere.length === 0 && <TomTilstand icon="users" title="Ingen påmeldte ennå" sub="Deltakere vises her når noen melder seg på." />}
        {deltakere.map((d, i) => (
          <Rad key={i} last={i === deltakere.length - 1}
            leading={<AvatarInit navn={d.navn} />}
            title={d.navn} sub={d.rolle}
            meta={<StatusPill tone={d.tone}>{d.status}</StatusPill>}
            trailing={null}
          />
        ))}
      </div>
    </Kort>
  );
}

/* ── TestResultatKort — fysisk/teknisk test m/ krav ───── */
export interface TestResultatKortProps {
  test?: string;
  verdi?: number | string;
  enhet?: string;
  delta?: string;
  dir?: "up" | "down";
  krav?: string;
  pct?: number;
  stops?: string[];
  dato?: string;
  bestaatt?: boolean;
}
export function TestResultatKort({
  test = "Carry driver", verdi = "248", enhet = "m", delta = "+6 m", dir = "up",
  krav = "Krav CS100: 255 m", pct = 76, stops = ["CS80", "CS90", "CS100", "CS110"],
  dato = "Testet 4. juli 2026", bestaatt = false,
}: TestResultatKortProps) {
  return (
    <Kort eyebrow="Testresultat" action={<StatusPill tone={bestaatt ? "up" : "warn"}>{bestaatt ? "Nådd" : "På vei"}</StatusPill>} pad="16px 18px">
      <TallHero label={test} value={verdi} unit={enhet} delta={delta} dir={dir} size={44} />
      <div style={{ marginTop: 16 }}><NivaSkala pct={pct} stops={stops} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2 }}>{krav}</span>
        <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>{dato}</span>
      </div>
    </Kort>
  );
}

/* ── TurneringNedtelling — neste turnering ────────────── */
export interface TurneringNedtellingProps {
  navn?: string;
  dato?: string;
  sted?: string;
  dager?: number;
  fokus?: ReactNode;
}
export function TurneringNedtelling({
  navn = "Norgescup 4 — Larvik GK", dato = "23.–25. juli", sted = "Larvik", dager = 14,
  fokus = "Uken før: nedtrapping og nærspill",
}: TurneringNedtellingProps) {
  return (
    <Kort tint eyebrow="Neste turnering" pad="16px 18px">
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: "none", textAlign: "center" }}>
          <span style={{ fontFamily: T.mono, fontSize: 48, fontWeight: 700, color: T.lime, lineHeight: 0.9, fontVariantNumeric: "tabular-nums", display: "block" }}>{dager}</span>
          <Caps size={9} style={{ marginTop: 6, textAlign: "center" }}>dager</Caps>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{navn}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 7 }}>
            <MetaBit icon="calendar">{dato}</MetaBit>
            <MetaBit icon="map-pin">{sted}</MetaBit>
          </div>
          {fokus && <div style={{ marginTop: 10 }}><InnsiktChip>{fokus}</InnsiktChip></div>}
        </div>
      </div>
    </Kort>
  );
}

/* ── FakturaRad — faktura i liste ─────────────────────── */
export type FakturaStatus = "betalt" | "aapen" | "forfalt";
export interface FakturaRadProps {
  nr?: string;
  hva?: string;
  belop?: string;
  valuta?: string;
  forfall?: string;
  status?: FakturaStatus;
  last?: boolean;
  onClick?: () => void;
}
export function FakturaRad({
  nr = "F-2026-118", hva = "Coaching juni — Performance", belop = "4 500,00", valuta = "kr",
  forfall = "15. juli", status = "aapen", last = false, onClick,
}: FakturaRadProps) {
  const map: Record<FakturaStatus, { tone: StatusTone; l: string }> = { betalt: { tone: "up", l: "Betalt" }, aapen: { tone: "info", l: "Åpen" }, forfalt: { tone: "down", l: "Forfalt" } };
  const s = map[status] || map.aapen;
  return (
    <Rad
      onClick={onClick} last={last}
      leading={<span style={{ width: 34, height: 34, borderRadius: 11, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="file-text" size={15} style={{ color: T.fg2 }} /></span>}
      title={hva}
      sub={<><span style={{ fontFamily: T.mono }}>{nr}</span> · forfall {forfall}</>}
      meta={
        <span style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{belop} <span style={{ fontSize: 10, color: T.mut }}>{valuta}</span></span>
          <StatusPill tone={s.tone}>{s.l}</StatusPill>
        </span>
      }
    />
  );
}

/* ── SamtykkeKort — foreldresamtykke i klarspråk ──────── */
export type SamtykkeStatus = "gitt" | "venter";
export interface SamtykkeKortProps {
  tittel?: string;
  status?: SamtykkeStatus;
  tekst?: ReactNode;
  forelder?: ReactNode;
}
export function SamtykkeKort({
  tittel = "Foreldresamtykke", status = "venter",
  tekst = "Øyvind er under 18 år. En foresatt må bekrefte at han kan bruke PlayerHQ og dele treningsdata med coachen sin.",
  forelder = "Sendt til kari.rohjan@gmail.com · 2. juli",
}: SamtykkeKortProps) {
  const gitt = status === "gitt";
  return (
    <Kort pad="16px 18px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon name="shield" size={15} style={{ color: gitt ? T.up : T.warn }} />
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{tittel}</span>
        </span>
        <StatusPill tone={gitt ? "up" : "warn"}>{gitt ? "Samtykke gitt" : "Venter på svar"}</StatusPill>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0" }}>{tekst}</p>
      <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, display: "block", marginTop: 8 }}>{forelder}</span>
      {!gitt && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <CTAPill icon="send">Send påminnelse</CTAPill>
          <CTAPill ghost>Endre e-post</CTAPill>
        </div>
      )}
    </Kort>
  );
}

/* ── SpillerKort — coach-stall: avatar, kategori, SG, status ── */
export interface SpillerKortProps {
  navn?: string;
  kategori?: string;
  hcp?: string;
  sg?: string | null;
  sgDir?: "up" | "down";
  sgDelta?: string;
  status?: SevKey;
  sistAktiv?: string;
  onClick?: () => void;
  /** KPI-stripe under (showroom). null → —. */
  runder?: string | number | null;
  adherence?: string | null;
  /** Vis KPI-stripe (default true når runder/adherence er satt, ellers compact). */
  medKpiStripe?: boolean;
}
export function SpillerKort({
  navn = "Øyvind Rohjan",
  kategori = "Elite junior",
  hcp = "+1,2",
  sg = "+2,4",
  sgDir = "up",
  sgDelta = "+0,3",
  status = "ok",
  sistAktiv = "Trente i går",
  onClick,
  runder = null,
  adherence = null,
  medKpiStripe,
}: SpillerKortProps) {
  const stripe = medKpiStripe ?? (runder != null || adherence != null);
  const sgVis = sg === null || sg === undefined || sg === "" ? "—" : sg;
  const runderVis = runder === null || runder === undefined || runder === "" ? "—" : String(runder);
  const adhVis = adherence === null || adherence === undefined || adherence === "" ? "—" : adherence;
  return (
    <Kort
      pad="14px 16px"
      hover={Boolean(onClick)}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AvatarInit navn={navn} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: T.disp,
              fontSize: 16,
              fontWeight: 600,
              color: T.fg,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {navn}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
            <StatusPill tone="info">
              HCP <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{hcp}</span>
            </StatusPill>
            {kategori && <StatusPill tone="lime">{kategori}</StatusPill>}
          </div>
          {!stripe && sistAktiv && (
            <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 6 }}>{sistAktiv}</div>
          )}
        </div>
        {!stripe && (
          <div style={{ textAlign: "right", flex: "none" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "flex-end" }}>
              <span style={{ fontFamily: T.mono, fontSize: 19, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{sgVis}</span>
              {sgDelta && sgVis !== "—" && <DeltaChip v={sgDelta} dir={sgDir} />}
            </div>
            <div style={{ marginTop: 5, display: "flex", justifyContent: "flex-end" }}>
              <SevChip s={status} />
            </div>
          </div>
        )}
      </div>
      {stripe && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            borderTop: `1px solid ${T.border}`,
            marginTop: 14,
            paddingTop: 14,
          }}
        >
          <div>
            <Caps size={9}>SG snitt</Caps>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{sgVis}</span>
              {sgDelta && sgVis !== "—" && <DeltaChip v={sgDelta} dir={sgDir} />}
            </div>
          </div>
          <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 14 }}>
            <Caps size={9}>Runder</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: T.fg, fontVariantNumeric: "tabular-nums", display: "block", marginTop: 4 }}>{runderVis}</span>
          </div>
          <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 14 }}>
            <Caps size={9}>Adherence</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: T.fg, fontVariantNumeric: "tabular-nums", display: "block", marginTop: 4 }}>{adhVis}</span>
          </div>
        </div>
      )}
    </Kort>
  );
}

/* ── FokusSpillerBlokk — spilleren coachen bør se på nå ── */
export interface FokusTall {
  l: string;
  v: string;
}
export interface FokusSpillerBlokkProps {
  navn?: string;
  kategori?: string;
  hvorfor?: ReactNode;
  tall?: FokusTall[];
  cta?: ReactNode;
}
export function FokusSpillerBlokk({
  navn = "Øyvind Rohjan", kategori = "Elite junior",
  hvorfor = "Nærspill-SG har falt 0,8 siste 3 uker, og planetterlevelsen er nede på 60 %. Verdt en prat før Norgescup.",
  tall = [{ l: "SG totalt", v: "+2,4" }, { l: "SG nærspill", v: "−0,8" }, { l: "Etterlevelse", v: "60 %" }],
  cta = "Åpne Workbench",
}: FokusSpillerBlokkProps) {
  return (
    <Kort tint eyebrow="Fokus-spiller" action={<SevChip s="medium" />} pad="16px 18px">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AvatarInit navn={navn} size={44} />
        <div>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>{navn}</div>
          <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>{kategori}</div>
        </div>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0" }}>{hvorfor}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tall.length}, 1fr)`, gap: 10, marginTop: 14 }}>
        {tall.map((x, i) => (
          <div key={i} style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: T.rRow, padding: "10px 12px" }}>
            <Caps size={8.5}>{x.l}</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: x.v.indexOf("−") === 0 ? T.down : T.fg, fontVariantNumeric: "tabular-nums", display: "block", marginTop: 6 }}>{x.v}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}><CTAPill icon="arrow-right">{cta}</CTAPill></div>
    </Kort>
  );
}

/* ── AnbefalingsKort — AI-forslag. Alltid anbefaling, aldri sperre. ── */
export interface AnbefalingsKortProps {
  type?: string;
  kilde?: ReactNode;
  hvorfor?: ReactNode;
  hva?: ReactNode;
  effekt?: ReactNode;
  /** Showroom: fjerde felt i anbefalingskontrakten. */
  hvorforNaa?: ReactNode;
  onBruk?: () => void;
  onAvvis?: () => void;
}
function AnbSeksjon({ l, children }: { l: string; children?: ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <Caps size={8.5} color={T.fg2}>{l}</Caps>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "4px 0 0" }}>{children}</p>
    </div>
  );
}
export function AnbefalingsKort({
  type = "Justér plan",
  kilde = "AI Caddie · basert på 214 TrackMan-slag siste 14 dager",
  hvorfor = "Spredningen på 7-jern er nede i 8,4 m (mål: 9,0 m) og har vært stabil i 14 dager. P4-oppgaven er i praksis ferdig.",
  hva = "Marker «P4 — venstre arm parallell» som fullført og flytt fokus til P6 halvveis ned.",
  effekt = "Frigjør ca. 2 timer i uken til nærspill, der SG-gapet er størst.",
  hvorforNaa = "GRUNN-fase: volum før TURN-uke.",
  onBruk,
  onAvvis,
}: AnbefalingsKortProps) {
  return (
    <Kort pad="0" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>
          <Icon name="sparkles" size={12} style={{ color: T.lime }} />
          Anbefaling
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: T.mono,
            fontSize: 9,
            color: T.mut,
            border: `1px solid ${T.border}`,
            borderRadius: T.rPill,
            padding: "2px 8px",
          }}
        >
          {type}
        </span>
      </div>
      <div style={{ padding: "14px 16px" }}>
        {kilde && <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, display: "block", marginBottom: 4 }}>{kilde}</span>}
        <AnbSeksjon l="Hvorfor">{hvorfor}</AnbSeksjon>
        <AnbSeksjon l="Hva">{hva}</AnbSeksjon>
        <AnbSeksjon l="Forventet effekt">{effekt}</AnbSeksjon>
        {hvorforNaa && <AnbSeksjon l="Hvorfor nå">{hvorforNaa}</AnbSeksjon>}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderTop: `1px solid ${T.border}`,
          flexWrap: "wrap",
        }}
      >
        <span onClick={onBruk}><CTAPill icon="check">Bruk forslag</CTAPill></span>
        <span onClick={onAvvis}><CTAPill ghost>Avvis</CTAPill></span>
        <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginLeft: "auto" }}>
          Du bestemmer — planen endres ikke før du velger.
        </span>
      </div>
    </Kort>
  );
}

/* ── LiveBar — pågående økt (sticky) m/ timer og CTA ──── */
export interface LiveBarProps {
  tittel?: string;
  tid?: string;
  deltakere?: number | null;
  cta?: ReactNode;
  onClick?: () => void;
  /** kritisk = rød flate (starter snart); default = normal live med lime-prikk */
  kritisk?: boolean;
}
export function LiveBar({
  tittel = "Teknikk — P4 topp-posisjon",
  tid = "42:18",
  deltakere = null,
  cta = "Åpne økt",
  onClick,
  kritisk = false,
}: LiveBarProps) {
  const prikk = kritisk ? T.down : T.lime;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 52,
        background: kritisk ? T.down : T.panel3,
        border: `1px solid ${kritisk ? "transparent" : T.borderS}`,
        borderRadius: T.rPill,
        padding: "9px 10px 9px 16px",
        color: kritisk ? T.onForest : undefined,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flex: "none" }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: T.rPill,
            background: kritisk ? T.onForest : prikk,
            boxShadow: kritisk ? undefined : `0 0 0 3px color-mix(in srgb,${prikk} 25%,transparent)`,
          }}
        />
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: kritisk ? T.onForest : prikk,
          }}
        >
          {kritisk ? "STARTER SNART" : "LIVE"}
        </span>
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: T.ui,
          fontSize: 13,
          fontWeight: 600,
          color: kritisk ? T.onForest : T.fg,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {tittel}
      </span>
      {deltakere != null && (
        <MetaBit icon="users">
          <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums", color: kritisk ? T.onForest : undefined }}>{deltakere}</span>
        </MetaBit>
      )}
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 14,
          fontWeight: 700,
          color: kritisk ? T.onForest : T.fg,
          fontVariantNumeric: "tabular-nums",
          flex: "none",
        }}
      >
        {tid}
      </span>
      {cta && (
        <span onClick={onClick}>
          <CTAPill icon="play">{cta}</CTAPill>
        </span>
      )}
    </div>
  );
}

/* ── VideoKort — coach-video m/ thumbnail-fallback + play-overlay ─────
   Presentasjonelt kort for PlayerHQ «Coach-videoer». Kontrakt fra
   golfdata/PlayerVideoCard (title, tag, notes, coach, dato) utvidet med
   thumbnailUrl + varighet. Bilde som ikke lastes faller GRASIØST til
   forest-gradient (aldri brutt-bilde-ikon). Klikk/pending/feil eies av
   skjermen (signert URL hentes der) — kortet er rent presentasjonelt. */
export interface VideoKortProps {
  title: string;
  coach: string;
  tag?: string | null;
  dato: string;
  varighet?: string | null;
  thumbnailUrl?: string | null;
  onClick?: () => void;
  pending?: boolean;
  error?: string | null;
}
export function VideoKort({
  title, coach, tag, dato, varighet, thumbnailUrl, onClick, pending = false, error = null,
}: VideoKortProps) {
  const [bildeFeilet, setBildeFeilet] = useState(false);
  const visBilde = Boolean(thumbnailUrl) && !bildeFeilet;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="v2-kort-h"
        style={{
          appearance: "none", textAlign: "left", cursor: pending ? "default" : "pointer",
          background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard,
          padding: 0, overflow: "hidden", display: "flex", flexDirection: "column",
          minWidth: 0, opacity: pending ? 0.6 : 1, transition: `transform 180ms ${T.ease}, border-color 180ms ${T.ease}`,
        }}
      >
        {/* Media — fallback-gradient ligger alltid i bunn; bildet legges over */}
        <span style={{ position: "relative", display: "block", aspectRatio: "16 / 9", background: `linear-gradient(150deg, ${T.forest}, ${T.bg})` }}>
          {visBilde && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbnailUrl as string}
              alt=""
              onError={() => setBildeFeilet(true)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
          {/* Play-knapp midtstilt */}
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 9999, background: T.lime, boxShadow: `0 6px 18px color-mix(in srgb,${T.bg} 55%,transparent)` }}>
              <Icon name="play" size={20} style={{ color: T.onLime }} />
            </span>
          </span>
          {/* Varighet-badge */}
          {varighet && (
            <span style={{ position: "absolute", right: 8, bottom: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg, background: `color-mix(in srgb,${T.bg} 70%,transparent)`, borderRadius: 6, padding: "3px 7px", fontVariantNumeric: "tabular-nums" }}>
              {varighet}
            </span>
          )}
        </span>
        {/* Tekst */}
        <span style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px 14px" }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: T.fg }}>{title}</span>
          <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 12px" }}>
            <MetaBit icon="user">{coach}</MetaBit>
            {tag && (
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 7px" }}>{tag}</span>
            )}
            <MetaBit icon="calendar">{dato}</MetaBit>
          </span>
        </span>
      </button>
      {error && (
        <span role="alert" style={{ fontFamily: T.ui, fontSize: 12, color: T.down, background: `color-mix(in srgb,${T.down} 10%,transparent)`, border: `1px solid color-mix(in srgb,${T.down} 30%,transparent)`, borderRadius: 10, padding: "6px 10px" }}>
          {error}
        </span>
      )}
    </div>
  );
}
