"use client";

/* AK Golf HQ v2 — DOMENE-KOMPONENTER (retning C «Presis»).
   Datakontrakter speiler src/components/athletic/golfdata/ (OektKort, ListRow,
   Tag, Avatar, StatusDot, LiveStatus m.fl.) — gjenskapt i v2-idiomet.
   Komponeres av kjerneprimitivene i ./core (mockupens window.V2).
   Port av ui_kits/v2/v2-domene.jsx → produksjons-TSX (diff-null).
   Alle props har demo-data som default → alt kan rendres rett i galleriet. */

import type { ReactNode } from "react";
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

/* ── OktKort — økt m/ akse-stripe, tid, sted, status ─────
   Kontrakt fra golfdata/OektKort: title, axis, time, duration,
   location, coach, state (live/done/planned/cancelled). */
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
}
export function OktKort({
  title = "Teknikk — P4 topp-posisjon", axis = "TEK", time = "07:15", duration = "90 min",
  location = "Toppgolf Oslo", coach = "Anders Kristiansen", state = "planned", naa = false, onClick,
}: OktKortProps) {
  const st = OKT_STATUS[state] || OKT_STATUS.planned;
  return (
    <div onClick={onClick} style={{ position: "relative", background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rRow + 4, padding: "14px 16px 14px 19px", overflow: "hidden", cursor: onClick ? "pointer" : "default" }}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: T.ax[axis] || T.mut }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 7 }}>
            {time && <MetaBit icon="clock"><span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{time}</span>{duration && <span> · {duration}</span>}</MetaBit>}
            {location && <MetaBit icon="map-pin">{location}</MetaBit>}
            {coach && <MetaBit icon="user">{coach}</MetaBit>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>
          {axis && <AkseChip a={axis} />}
          {naa ? <StatusPill>Nå</StatusPill> : <StatusPill tone={st.tone}>{st.l}</StatusPill>}
        </div>
      </div>
    </div>
  );
}

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
          <div style={{ maxWidth: "78%", padding: "10px 13px", borderRadius: 14, borderBottomRightRadius: m.meg ? 4 : 14, borderBottomLeftRadius: m.meg ? 14 : 4, background: m.meg ? "rgba(0,88,64,0.45)" : T.panel2, border: `1px solid ${m.meg ? "rgba(0,88,64,0.6)" : T.border}` }}>
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
  sg?: string;
  sgDir?: "up" | "down";
  sgDelta?: string;
  status?: SevKey;
  sistAktiv?: string;
  onClick?: () => void;
}
export function SpillerKort({
  navn = "Øyvind Rohjan", kategori = "Elite junior", hcp = "+1,2",
  sg = "+2,4", sgDir = "up", sgDelta = "+0,3", status = "ok",
  sistAktiv = "Trente i går", onClick,
}: SpillerKortProps) {
  return (
    <Kort pad="14px 16px" style={{ cursor: onClick ? "pointer" : "default" }}>
      <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AvatarInit navn={navn} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 700, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{navn}</div>
          <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 2 }}>{kategori} · Hcp <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{hcp}</span> · {sistAktiv}</div>
        </div>
        <div style={{ textAlign: "right", flex: "none" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "flex-end" }}>
            <span style={{ fontFamily: T.mono, fontSize: 19, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{sg}</span>
            {sgDelta && <DeltaChip v={sgDelta} dir={sgDir} />}
          </div>
          <div style={{ marginTop: 5, display: "flex", justifyContent: "flex-end" }}><SevChip s={status} /></div>
        </div>
      </div>
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
  type = "Justér plan", kilde = "AI Caddie · basert på 214 TrackMan-slag siste 14 dager",
  hvorfor = "Spredningen på 7-jern er nede i 8,4 m (mål: 9,0 m) og har vært stabil i 14 dager. P4-oppgaven er i praksis ferdig.",
  hva = "Marker «P4 — venstre arm parallell» som fullført og flytt fokus til P6 halvveis ned.",
  effekt = "Frigjør ca. 2 timer i uken til nærspill, der SG-gapet er størst.",
  onBruk, onAvvis,
}: AnbefalingsKortProps) {
  return (
    <Kort pad="16px 18px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon name="sparkles" size={14} style={{ color: T.lime }} />
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{type}</span>
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>Forslag</span>
      </div>
      <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, display: "block", marginTop: 4 }}>{kilde}</span>
      <AnbSeksjon l="Hvorfor">{hvorfor}</AnbSeksjon>
      <AnbSeksjon l="Hva">{hva}</AnbSeksjon>
      <AnbSeksjon l="Forventet effekt">{effekt}</AnbSeksjon>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
        <span onClick={onBruk}><CTAPill icon="check">Bruk forslag</CTAPill></span>
        <span onClick={onAvvis}><CTAPill ghost>Avvis</CTAPill></span>
        <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginLeft: "auto" }}>Du bestemmer — planen endres ikke før du velger.</span>
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
}
export function LiveBar({
  tittel = "Teknikk — P4 topp-posisjon", tid = "42:18", deltakere = null, cta = "Åpne økt", onClick,
}: LiveBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 9999, padding: "9px 10px 9px 16px" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flex: "none" }}>
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: T.down, boxShadow: `0 0 0 3px color-mix(in srgb,${T.down} 25%,transparent)` }} />
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: T.down }}>LIVE</span>
      </span>
      <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tittel}</span>
      {deltakere != null && <MetaBit icon="users"><span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{deltakere}</span></MetaBit>}
      <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", flex: "none" }}>{tid}</span>
      <span onClick={onClick}><CTAPill icon="play">{cta}</CTAPill></span>
    </div>
  );
}
