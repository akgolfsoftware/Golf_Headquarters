"use client";

/* AK Golf HQ v2 — TEKNISK UTVIKLINGSPLAN (retning C «Presis»).
   Datamodell fra prisma/schema.prisma + src/lib/taxonomy.ts:
   TechnicalPlan → TechnicalPlanPosition (P1.0–P10.0, MORAD, sortOrder,
   hovedfokus) → PositionTask (krav: rep-mål Dry/Lav/Full, L-fase, CS-nivå,
   status PENDING/ACTIVE/DONE, trackStatus PAA_VEI/STAGNERER/FERDIG/INAKTIV)
   → PositionTaskTmGoal (TM-mål). AI Caddie → PlanSuggestion, coach godkjenner
   (PENDING/ACCEPTED/REJECTED/EDITED) — anbefaling, aldri sperre. Spilleren
   speiler samme plan i /portal/tren/teknisk-plan.
   Port av ui_kits/v2/v2-utviklingsplan.jsx → produksjons-TSX (diff-null). */

import { Fragment } from "react";
import { T, Caps, StatusPill, Kort, CTAPill, InnsiktChip } from "./core";
import { Icon } from "@/components/v2/icon";

/* P1.0–P10.0 (MORAD-kanon, src/lib/taxonomy.ts P_POSISJONER) */
const P_NAVN: Record<string, string> = {
  P1: "Adresse", P2: "Takeaway", P3: "Halvveis tilbake", P4: "Topp-posisjon", P5: "Transisjon",
  P6: "Halvveis ned", P7: "Impact", P8: "Tidlig oppfølging", P9: "Kølle parallell", P10: "Finish",
};

/* TrackStatus i klarspråk — informasjon, aldri sperre */
export type SporKey = "PAA_VEI" | "STAGNERER" | "FERDIG" | "INAKTIV";
const SPOR: Record<SporKey, { c: string; l: string }> = {
  PAA_VEI: { c: T.up, l: "På vei" },
  STAGNERER: { c: T.warn, l: "Står stille" },
  FERDIG: { c: T.up, l: "Ferdig" },
  INAKTIV: { c: T.mut, l: "Ikke trent på 14 d" },
};
export interface SporChipProps {
  s: SporKey;
}
export function SporChip({ s }: SporChipProps) {
  const m = SPOR[s] || SPOR.PAA_VEI;
  return <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: m.c, background: `color-mix(in srgb,${m.c} 12%,transparent)`, borderRadius: 5, padding: "3px 7px", whiteSpace: "nowrap" }}>{m.l}</span>;
}

/* Status-verdier tolereres i begge kasus (String(status).toLowerCase() i bruk). */
export type PosStatus = "done" | "active" | "pending";
export type TaskStatus = PosStatus | "DONE" | "ACTIVE" | "PENDING";

/* ── PRail — P1–P10 horisontal skinne m/ nå-posisjon ────
   posisjoner: [{ p, status:'done'|'active'|'pending', fokus }] —
   speiler TechnicalPlanPosition (status utledet av tasks). */
export interface Posisjon {
  p: string;
  status: PosStatus;
  fokus?: boolean;
}
const DEMO_RAIL: Posisjon[] = [
  { p: "P1", status: "done" }, { p: "P2", status: "done" }, { p: "P3", status: "done" },
  { p: "P4", status: "active", fokus: true }, { p: "P5", status: "pending" },
  { p: "P6", status: "pending" }, { p: "P7", status: "pending" }, { p: "P8", status: "pending" },
  { p: "P9", status: "pending" }, { p: "P10", status: "pending" },
];
export interface PRailProps {
  posisjoner?: Posisjon[];
  kompakt?: boolean;
  onVelg?: (p: string) => void;
}
export function PRail({ posisjoner = DEMO_RAIL, kompakt = false, onVelg }: PRailProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", paddingBottom: 2 }}>
      {posisjoner.map((x, i) => {
        const done = x.status === "done", on = x.status === "active";
        const size = kompakt ? 26 : 34;
        return (
          <Fragment key={x.p}>
            {i > 0 && <span style={{ flex: 1, minWidth: kompakt ? 8 : 14, height: 2, borderRadius: 2, background: done || on ? "rgba(209,248,67,0.4)" : T.track, marginTop: size / 2 - 1 }} />}
            <div onClick={onVelg ? () => onVelg(x.p) : undefined} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "none", cursor: onVelg ? "pointer" : "default", position: "relative" }}>
              {on && !kompakt && <span style={{ position: "absolute", top: -16 }}><Caps size={8} color={T.lime}>Nå</Caps></span>}
              <span style={{ width: size, height: size, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.mono, fontSize: kompakt ? 8.5 : 10, fontWeight: 700,
                background: on ? T.lime : done ? "rgba(209,248,67,0.12)" : T.panel2,
                border: `1px solid ${on ? "transparent" : done ? "rgba(209,248,67,0.35)" : T.border}`,
                color: on ? T.onLime : done ? T.lime : T.mut }}>
                {done ? <Icon name="check" size={kompakt ? 11 : 13} /> : x.p}
              </span>
              {!kompakt && <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, color: on ? T.fg : T.mut }}>{x.p}</span>}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

/* ── KravRad — én arbeidsoppgave (PositionTask) ─────────
   Rep-fremdrift = sum gjort/mål over Dry+Lav+Full. TM-mål-chip
   når PositionTaskTmGoal finnes. Status-huk: done/active/pending. */
export interface KravData {
  tittel?: string;
  status?: TaskStatus; /* PENDING | ACTIVE | DONE → pending/active/done */
  spor?: SporKey;
  repsGjort?: number;
  repsMaal?: number;
  lFase?: string | null;
  cs?: string | null;
  tmMaal?: string | null;
  tmNaadd?: boolean;
}
export interface KravRadProps extends KravData {
  last?: boolean;
  onClick?: () => void;
}
function KravHuk({ done, on }: { done: boolean; on: boolean }) {
  return (
    <span style={{ width: 24, height: 24, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none",
      background: done ? T.lime : "transparent",
      border: done ? "none" : on ? `2px solid ${T.lime}` : `1px dashed ${T.borderS}` }}>
      {done && <Icon name="check" size={13} style={{ color: T.onLime }} />}
    </span>
  );
}
export function KravRad({
  tittel = "Venstre arm parallell med skulderlinjen i P4",
  status = "active",
  spor = "PAA_VEI",
  repsGjort = 240, repsMaal = 300,
  lFase = "L-Ball", cs = "CS60",
  tmMaal = "Spredning 7-jern < 9,0 m", tmNaadd = false,
  last = false, onClick,
}: KravRadProps) {
  const st = String(status).toLowerCase();
  const done = st === "done", on = st === "active";
  return (
    <div onClick={onClick} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: last ? "none" : `1px solid ${T.border}`, cursor: onClick ? "pointer" : "default", opacity: st === "pending" ? 0.65 : 1 }}>
      <KravHuk done={done} on={on} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, textDecoration: done ? "line-through" : "none", textDecorationColor: T.mut }}>{tittel}</span>
          {!done && <SporChip s={spor} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
          {repsMaal > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 76, height: 5, borderRadius: 9999, background: T.track, overflow: "hidden", display: "inline-block" }}>
                <span style={{ display: "block", width: Math.min(100, (repsGjort / repsMaal) * 100) + "%", height: "100%", background: done ? T.up : T.lime, opacity: 0.9 }} />
              </span>
              <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{repsGjort}<span style={{ color: T.mut }}>/{repsMaal} reps</span></span>
            </span>
          )}
          {lFase && <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px" }}>{lFase}</span>}
          {cs && <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px" }}>{cs}</span>}
          {tmMaal && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 10.5, color: tmNaadd ? T.up : T.mut }}>
              <Icon name={tmNaadd ? "check" : "crosshair"} size={11} />{tmMaal}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── MilepaelKort — én P-milepæl m/ kravliste ───────────
   = TechnicalPlanPosition + tasks. hovedfokus → lime venstre-stripe
   (samme flagg som i Prisma). Godkjent-linje når coach har bekreftet. */
const DEMO_KRAV: KravData[] = [
  { tittel: "Hoftedreining 45° før armene starter ned", status: "done", spor: "FERDIG", repsGjort: 300, repsMaal: 300, lFase: "L-Kropp", cs: "CS50", tmMaal: null },
  { tittel: "Venstre arm parallell med skulderlinjen i P4", status: "active", spor: "PAA_VEI", repsGjort: 240, repsMaal: 300, lFase: "L-Ball", cs: "CS60", tmMaal: "Spredning 7-jern < 9,0 m" },
  { tittel: "Kølleblad square mot svingplan i P4", status: "pending", spor: "INAKTIV", repsGjort: 0, repsMaal: 200, lFase: "L-Kølle", cs: "CS50", tmMaal: "Face angle ±2° — 8/10 slag" },
];
export interface MilepaelKortProps {
  p?: string;
  navn?: string;
  hovedfokus?: boolean;
  krav?: KravData[];
  godkjentAv?: string | null;
  godkjentDato?: string;
}
export function MilepaelKort({
  p = "P4", navn, hovedfokus = true,
  krav = DEMO_KRAV,
  godkjentAv = "Anders Kristiansen", godkjentDato = "6. juli 2026",
}: MilepaelKortProps) {
  const ferdige = krav.filter((k) => String(k.status).toLowerCase() === "done").length;
  return (
    <div style={{ position: "relative", background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: "16px 18px 12px 21px", overflow: "hidden" }}>
      {hovedfokus && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: T.lime }} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 9 }}>
          <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: hovedfokus ? T.lime : T.fg2 }}>{p}</span>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{navn || P_NAVN[p] || p}</span>
          {hovedfokus && <StatusPill>Hovedfokus</StatusPill>}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg2, fontVariantNumeric: "tabular-nums", flex: "none" }}>{ferdige}<span style={{ color: T.mut }}>/{krav.length} krav</span></span>
      </div>
      <div style={{ marginTop: 6 }}>
        {krav.map((k, i) => <KravRad key={i} {...k} last={i === krav.length - 1} />)}
      </div>
      {godkjentAv && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, paddingTop: 11, borderTop: `1px solid ${T.border}` }}>
          <Icon name="badge-check" size={13} style={{ color: T.up }} />
          <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>Godkjent av <span style={{ color: T.fg2, fontWeight: 600 }}>{godkjentAv}</span> · {godkjentDato}</span>
        </div>
      )}
    </div>
  );
}

/* ── LaeringsTrapp — MORAD L-faser som nivåtrinn ────────
   L_FASER fra taxonomy.ts: L-Kropp → L-Arm → L-Kølle → L-Ball → L-Auto. */
export interface TrappTrinn {
  l: string;
  sub: string;
  cs: string;
}
const DEMO_TRAPP: TrappTrinn[] = [
  { l: "L-Kropp", sub: "Kroppen lærer", cs: "CS50–60" },
  { l: "L-Arm", sub: "Armene med", cs: "CS60–70" },
  { l: "L-Kølle", sub: "Kølle, sakte", cs: "CS60–75" },
  { l: "L-Ball", sub: "Ball og mål", cs: "CS70–85" },
  { l: "L-Auto", sub: "Automatisk under press", cs: "CS85–100" },
];
export interface LaeringsTrappProps {
  trinn?: TrappTrinn[];
  aktiv?: number;
  tittel?: string;
}
export function LaeringsTrapp({ trinn = DEMO_TRAPP, aktiv = 3, tittel = "Læringstrapp — hvor bevegelsen sitter nå" }: LaeringsTrappProps) {
  const H0 = 34, dH = 20;
  return (
    <Kort eyebrow={tittel} pad="16px 18px">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 7, marginTop: 4 }}>
        {trinn.map((t, i) => {
          const done = i < aktiv, on = i === aktiv;
          return (
            <div key={t.l} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: on ? T.lime : done ? T.fg2 : T.mut, display: "block", whiteSpace: "nowrap" }}>{t.l}</span>
                <span style={{ fontFamily: T.mono, fontSize: 8, color: T.mut, display: "block", marginTop: 2 }}>{t.cs}</span>
              </div>
              <div style={{ height: H0 + i * dH, borderRadius: "10px 10px 4px 4px", position: "relative",
                background: on ? "rgba(209,248,67,0.14)" : done ? T.panel3 : T.panel2,
                border: `1px solid ${on ? T.lime : done ? T.borderS : T.border}`,
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 7 }}>
                {done && <Icon name="check" size={12} style={{ color: T.fg2 }} />}
                {on && <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.lime }} />}
              </div>
            </div>
          );
        })}
      </div>
      <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, display: "block", marginTop: 12 }}>
        {trinn[aktiv] ? <>Nå: <span style={{ color: T.fg2, fontWeight: 600 }}>{trinn[aktiv].l}</span> — {trinn[aktiv].sub.toLowerCase()}. Anbefalt hastighet {trinn[aktiv].cs}.</> : "Alle trinn fullført."}
      </span>
    </Kort>
  );
}

/* ── UtviklingsplanOversikt — spiller-speil ─────────────
   Spilleren ser samme plan som coachen: aktiv P + neste krav.
   = TechnicalPlan (navn, periode) + aktiv posisjon + neste ACTIVE task. */
export interface UtviklingsplanOversiktProps {
  planNavn?: string;
  periode?: string;
  posisjoner?: Posisjon[];
  aktivP?: string;
  aktivNavn?: string;
  nesteKrav?: KravData;
  coachNote?: string | null;
  cta?: string;
}
export function UtviklingsplanOversikt({
  planNavn = "Teknisk utviklingsplan — sommer 2026", periode = "Spesialisering · uke 24–31",
  posisjoner = DEMO_RAIL, aktivP = "P4", aktivNavn,
  nesteKrav = { tittel: "Venstre arm parallell med skulderlinjen i P4", repsGjort: 240, repsMaal: 300, lFase: "L-Ball", cs: "CS60", spor: "PAA_VEI", status: "active", tmMaal: "Spredning 7-jern < 9,0 m" },
  coachNote = "Hold CS60 ut uken — vi tester CS80 mandag.", cta = "Start økt på dette",
}: UtviklingsplanOversiktProps) {
  return (
    <Kort tint eyebrow="Min utviklingsplan" action={<StatusPill tone="up">Aktiv</StatusPill>} pad="18px 20px">
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>{planNavn}</div>
      <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, display: "block", marginTop: 3 }}>{periode}</span>
      <div style={{ margin: "22px 0 6px" }}><PRail posisjoner={posisjoner} /></div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 12 }}>
        <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.lime }}>{aktivP}</span>
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{aktivNavn || P_NAVN[aktivP] || ""}</span>
      </div>
      <div style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: T.rRow + 2, padding: "2px 14px", marginTop: 10 }}>
        <div style={{ padding: "9px 0 0" }}><Caps size={8.5}>Neste krav</Caps></div>
        <KravRad {...nesteKrav} last />
      </div>
      {coachNote && <div style={{ marginTop: 12 }}><InnsiktChip>Fra Anders Kristiansen: {coachNote}</InnsiktChip></div>}
      <div style={{ marginTop: 14 }}><CTAPill icon="play">{cta}</CTAPill></div>
    </Kort>
  );
}

/* ── CoachGodkjenning — PlanSuggestion-rad ──────────────
   AI Caddie foreslår (NEW_TASK/ARCHIVE_TASK/RE_PRIORITIZE/ADJUST_GOAL…),
   coach velger: Godkjenn / Juster / Avvis. Anbefaling — aldri sperre. */
export interface CoachGodkjenningProps {
  type?: string;
  spiller?: string;
  p?: string;
  forslag?: string;
  evidens?: string;
  foreslaatt?: string;
  onGodkjenn?: () => void;
  onJuster?: () => void;
  onAvvis?: () => void;
  last?: boolean;
}
export function CoachGodkjenning({
  type = "Marker krav som ferdig", spiller = "Øyvind Rohjan", p = "P4",
  forslag = "«Venstre arm parallell i P4» — begge spor er i mål: 300/300 reps og spredning 8,4 m (mål 9,0 m), stabilt siste 14 dager.",
  evidens = "214 TrackMan-slag · siste 14 dager", foreslaatt = "I går 21:00",
  onGodkjenn, onJuster, onAvvis, last = false,
}: CoachGodkjenningProps) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <span style={{ width: 34, height: 34, borderRadius: 11, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon name="sparkles" size={14} style={{ color: T.lime }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 700, color: T.fg }}>{type}</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px" }}>{p}</span>
          <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>{spiller} · {foreslaatt}</span>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "6px 0 0" }}>{forslag}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginTop: 6 }}><Icon name="bar-chart" size={11} />{evidens}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <span onClick={onGodkjenn}><CTAPill icon="check">Godkjenn</CTAPill></span>
          <span onClick={onJuster}><CTAPill ghost icon="pencil">Juster</CTAPill></span>
          <span onClick={onAvvis}><CTAPill ghost>Avvis</CTAPill></span>
          <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginLeft: "auto" }}>Anbefaling — planen står til du velger.</span>
        </div>
      </div>
    </div>
  );
}
