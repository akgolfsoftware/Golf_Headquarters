"use client";
import { TL } from "@/lib/v2/train-lock";

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
import { Caps, StatusPill, Kort, CTAPill, InnsiktChip } from "./core";
import { Icon } from "@/components/v2/icon";
import { HjelpTips } from "@/components/v2/hjelp";

/* P1.0–P10.0 (MORAD-kanon, src/lib/taxonomy.ts P_POSISJONER) */
const P_NAVN: Record<string, string> = {
  P1: "Adresse", P2: "Takeaway", P3: "Halvveis tilbake", P4: "Topp-posisjon", P5: "Transisjon",
  P6: "Halvveis ned", P7: "Impact", P8: "Tidlig oppfølging", P9: "Kølle parallell", P10: "Finish",
};

/* TrackStatus i klarspråk — informasjon, aldri sperre */
export type SporKey = "PAA_VEI" | "STAGNERER" | "FERDIG" | "INAKTIV";
const SPOR: Record<SporKey, { c: string; l: string }> = {
  PAA_VEI: { c: TL.ok, l: "På vei" },
  STAGNERER: { c: TL.warn, l: "Står stille" },
  FERDIG: { c: TL.ok, l: "Ferdig" },
  INAKTIV: { c: TL.mute, l: "Ikke trent på 14 d" },
};
export interface SporChipProps {
  s: SporKey;
}
export function SporChip({ s }: SporChipProps) {
  const m = SPOR[s] || SPOR.PAA_VEI;
  return <span style={{ fontFamily: TL.font.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: m.c, background: `color-mix(in srgb,${m.c} 12%,transparent)`, borderRadius: 5, padding: "3px 7px", whiteSpace: "nowrap" }}>{m.l}</span>;
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
            {i > 0 && <span style={{ flex: 1, minWidth: kompakt ? 8 : 14, height: 2, borderRadius: 2, background: done || on ? "color-mix(in srgb, var(--tl-fill) 40%, transparent)" : TL.hair, marginTop: size / 2 - 1 }} />}
            <div onClick={onVelg ? () => onVelg(x.p) : undefined} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "none", cursor: onVelg ? "pointer" : "default", position: "relative" }}>
              {on && !kompakt && <span style={{ position: "absolute", top: -16 }}><Caps size={8} color={TL.fill}>Nå</Caps></span>}
              <span style={{ width: size, height: size, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: TL.font.mono, fontSize: kompakt ? 8.5 : 10, fontWeight: 700,
                background: on ? TL.fill : done ? "color-mix(in srgb, var(--tl-fill) 12%, transparent)" : TL.dock,
                border: `1px solid ${on ? "transparent" : done ? "color-mix(in srgb, var(--tl-fill) 35%, transparent)" : TL.hair}`,
                color: on ? TL.onFill : done ? TL.fill : TL.mute }}>
                {done ? <Icon name="check" size={kompakt ? 11 : 13} /> : x.p}
              </span>
              {!kompakt && <span style={{ fontFamily: TL.font.mono, fontSize: 8.5, fontWeight: 700, color: on ? TL.text : TL.mute }}>{x.p}</span>}
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
      background: done ? TL.fill : "transparent",
      border: done ? "none" : on ? `2px solid ${TL.fill}` : `1px dashed ${TL.hair}` }}>
      {done && <Icon name="check" size={13} style={{ color: TL.onFill }} />}
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
    <div onClick={onClick} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: last ? "none" : `1px solid ${TL.hair}`, cursor: onClick ? "pointer" : "default", opacity: st === "pending" ? 0.65 : 1 }}>
      <KravHuk done={done} on={on} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text, textDecoration: done ? "line-through" : "none", textDecorationColor: TL.mute }}>{tittel}</span>
          {!done && <SporChip s={spor} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
          {repsMaal > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 76, height: 5, borderRadius: 9999, background: TL.hair, overflow: "hidden", display: "inline-block" }}>
                <span style={{ display: "block", width: Math.min(100, (repsGjort / repsMaal) * 100) + "%", height: "100%", background: done ? TL.ok : TL.fill, opacity: 0.9 }} />
              </span>
              <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{repsGjort}<span style={{ color: TL.mute }}>/{repsMaal} reps</span></span>
            </span>
          )}
          {lFase && <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 5, padding: "2px 6px" }}>{lFase}</span>}
          {cs && <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 5, padding: "2px 6px" }}>{cs}</span>}
          {tmMaal && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.sans, fontSize: 10.5, color: tmNaadd ? TL.ok : TL.mute }}>
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
  { tittel: "Hoftedreining 45° før armene starter ned", status: "done", spor: "FERDIG", repsGjort: 300, repsMaal: 300, lFase: "Uten ball", cs: "CS50", tmMaal: null },
  { tittel: "Venstre arm parallell med skulderlinjen i P4", status: "active", spor: "PAA_VEI", repsGjort: 240, repsMaal: 300, lFase: "Lav hastighet", cs: "CS60", tmMaal: "Spredning 7-jern < 9,0 m" },
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
    <div style={{ position: "relative", background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "16px 18px 12px 21px", overflow: "hidden" }}>
      {hovedfokus && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: TL.fill }} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 9 }}>
          <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: hovedfokus ? TL.fill : TL.mute }}>{p}</span>
          <span style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text }}>{navn || P_NAVN[p] || p}</span>
          {hovedfokus && <StatusPill>Hovedfokus</StatusPill>}
        </span>
        <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums", flex: "none" }}>{ferdige}<span style={{ color: TL.mute }}>/{krav.length} krav</span></span>
      </div>
      <div style={{ marginTop: 6 }}>
        {krav.map((k, i) => <KravRad key={i} {...k} last={i === krav.length - 1} />)}
      </div>
      {godkjentAv && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, paddingTop: 11, borderTop: `1px solid ${TL.hair}` }}>
          <Icon name="badge-check" size={13} style={{ color: TL.ok }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>Godkjent av <span style={{ color: TL.mute, fontWeight: 600 }}>{godkjentAv}</span> · {godkjentDato}</span>
        </div>
      )}
    </div>
  );
}

/* ── LaeringsTrapp — læringsfasen som 3 nivåtrinn ────────
   Uten ball → Lav hastighet → Auto (grupperer MORAD-fasene under). */
export interface TrappTrinn {
  l: string;
  sub: string;
  cs: string;
}
const DEMO_TRAPP: TrappTrinn[] = [
  { l: "Uten ball", sub: "Grunnbevegelsen bygges", cs: "Ren bevegelse" },
  { l: "Lav hastighet", sub: "Ball i redusert tempo", cs: "CS50–80" },
  { l: "Auto", sub: "Automatisk under press", cs: "CS80–100" },
];
export interface LaeringsTrappProps {
  trinn?: TrappTrinn[];
  aktiv?: number;
  tittel?: string;
  hjelp?: boolean;
}
export function LaeringsTrapp({ trinn = DEMO_TRAPP, aktiv = 1, tittel = "Læringstrapp — hvor bevegelsen sitter nå", hjelp }: LaeringsTrappProps) {
  const H0 = 34, dH = 20;
  return (
    <Kort
      eyebrow={tittel}
      pad="16px 18px"
      action={hjelp ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <HjelpTips k="lFase" />
          <HjelpTips k="csNivaa" />
        </span>
      ) : undefined}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 7, marginTop: 4 }}>
        {trinn.map((t, i) => {
          const done = i < aktiv, on = i === aktiv;
          return (
            <div key={t.l} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 700, color: on ? TL.fill : done ? TL.mute : TL.mute, display: "block", whiteSpace: "nowrap" }}>{t.l}</span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 8.5, color: TL.mute, display: "block", marginTop: 2 }}>{t.cs}</span>
              </div>
              <div style={{ height: H0 + i * dH, borderRadius: "10px 10px 4px 4px", position: "relative",
                background: on ? "color-mix(in srgb, var(--tl-fill) 14%, transparent)" : done ? TL.dim : TL.dock,
                border: `1px solid ${on ? TL.fill : done ? TL.hair : TL.hair}`,
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 7 }}>
                {done && <Icon name="check" size={12} style={{ color: TL.mute }} />}
                {on && <span style={{ width: 7, height: 7, borderRadius: 9999, background: TL.fill }} />}
              </div>
            </div>
          );
        })}
      </div>
      <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, display: "block", marginTop: 12 }}>
        {trinn[aktiv] ? <>Nå: <span style={{ color: TL.mute, fontWeight: 600 }}>{trinn[aktiv].l}</span> — {trinn[aktiv].sub.toLowerCase()}. Anbefalt hastighet {trinn[aktiv].cs}.</> : "Alle trinn fullført."}
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
      <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 18, color: TL.text }}>{planNavn}</div>
      <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, display: "block", marginTop: 3 }}>{periode}</span>
      <div style={{ margin: "22px 0 6px" }}><PRail posisjoner={posisjoner} /></div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 12 }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 26, fontWeight: 700, color: TL.fill }}>{aktivP}</span>
        <span style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 16, color: TL.text }}>{aktivNavn || P_NAVN[aktivP] || ""}</span>
      </div>
      <div style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row + 2, padding: "2px 14px", marginTop: 10 }}>
        <div style={{ padding: "9px 0 0" }}><Caps size={8.5}>Neste krav</Caps></div>
        <KravRad {...nesteKrav} last />
      </div>
      {coachNote && <div style={{ marginTop: 12 }}><InnsiktChip>Fra Anders Kristiansen: {coachNote}</InnsiktChip></div>}
      <div style={{ marginTop: 14 }}><CTAPill icon="play">{cta}</CTAPill></div>
    </Kort>
  );
}

/* ── TalentProfil — TalentTracking-speil (radar + nivå + milepæler) ──
   GAP: mockupen v2-utviklingsplan.jsx hadde INGEN talent-visning. Bygget for
   merge-skjermen (talent + teknisk → én flate). Fem akser 1–10
   (fysisk/teknikk/taktikk/mental/motivasjon), fargenøytralt lime-fyll —
   speiler TalentTracking. Ærlig tom-tilstand håndteres av skjermen. */
export interface TalentAkse {
  akse: string;
  verdi: number;
}
export interface TalentMilepael {
  tittel: string;
  dato?: string | null;
  beskrivelse?: string | null;
}
function TalentRadarSvg({ data, max = 10, size = 220 }: { data: TalentAkse[]; max?: number; size?: number }) {
  const cx = size / 2, cy = size / 2 + 2, R = size / 2 - 30;
  const n = data.length || 1;
  const pt = (i: number, v: number): [number, number] => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2, r = (Math.max(0, Math.min(max, v)) / max) * R;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const poly = (vals: number[]): string => vals.map((v, i) => pt(i, v).map((c) => c.toFixed(1)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size, height: "auto", display: "block", margin: "0 auto" }} role="img" aria-label="Talentprofil per akse">
      {[1 / 3, 2 / 3, 1].map((f, ri) => (
        <polygon key={ri} points={poly(data.map(() => max * f))} fill="none" stroke={TL.hair} strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const [ex, ey] = pt(i, max);
        const [lx, ly] = pt(i, max * 1.24);
        return (
          <g key={d.akse}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={TL.hair} strokeWidth="1" />
            <text x={lx} y={ly + 3} textAnchor="middle" style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, fill: TL.mute }}>{d.akse}</text>
          </g>
        );
      })}
      <polygon points={poly(data.map((d) => d.verdi))} fill={`color-mix(in srgb, ${TL.fill} 14%, transparent)`} stroke={TL.fill} strokeWidth="1.8" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [px, py] = pt(i, d.verdi);
        return <circle key={i} cx={px} cy={py} r="3" fill={TL.fill} stroke={TL.elev} strokeWidth="1.5" />;
      })}
    </svg>
  );
}
export interface TalentProfilProps {
  niva?: string;
  klubb?: string | null;
  region?: string | null;
  radar?: TalentAkse[];
  milepaeler?: TalentMilepael[];
  maxVerdi?: number;
}
export function TalentProfil({ niva, klubb, region, radar = [], milepaeler = [], maxVerdi = 10 }: TalentProfilProps) {
  const meta = [klubb, region].filter(Boolean).join(" · ");
  const harRadar = radar.some((r) => r.verdi > 0);
  return (
    <Kort eyebrow="Talentprofil" action={niva ? <StatusPill tone="info">{niva}</StatusPill> : undefined}>
      {meta && <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, display: "block", marginBottom: harRadar ? 4 : 0 }}>{meta}</span>}
      {harRadar ? (
        <>
          <TalentRadarSvg data={radar} max={maxVerdi} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginTop: 12 }}>
            {radar.map((r) => (
              <div key={r.akse} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute, width: 30, flex: "none" }}>{r.akse}</span>
                <span style={{ flex: 1, height: 5, borderRadius: 9999, background: TL.hair, overflow: "hidden" }}>
                  <span style={{ display: "block", width: Math.min(100, (r.verdi / maxVerdi) * 100) + "%", height: "100%", background: TL.fill, opacity: 0.9 }} />
                </span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, fontWeight: 700, color: TL.mute, fontVariantNumeric: "tabular-nums", width: 32, textAlign: "right", flex: "none" }}>{r.verdi}<span style={{ color: TL.mute }}>/{maxVerdi}</span></span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, display: "block" }}>Ingen talentvurdering registrert ennå.</span>
      )}
      {milepaeler.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${TL.hair}` }}>
          <Caps size={8.5}>Milepæler</Caps>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
            {milepaeler.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: 9999, background: TL.fill, flex: "none", marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{m.tittel}</span>
                    {m.dato && <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute }}>{m.dato}</span>}
                  </div>
                  {m.beskrivelse && <p style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, lineHeight: 1.55, margin: "3px 0 0" }}>{m.beskrivelse}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
    <div style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: last ? "none" : `1px solid ${TL.hair}` }}>
      <span style={{ width: 34, height: 34, borderRadius: 11, background: TL.dim, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon name="sparkles" size={14} style={{ color: TL.fill }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 700, color: TL.text }}>{type}</span>
          <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 5, padding: "2px 6px" }}>{p}</span>
          <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>{spiller} · {foreslaatt}</span>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.6, margin: "6px 0 0" }}>{forslag}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.sans, fontSize: 10.5, color: TL.mute, marginTop: 6 }}><Icon name="bar-chart" size={11} />{evidens}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <span onClick={onGodkjenn}><CTAPill icon="check">Godkjenn</CTAPill></span>
          <span onClick={onJuster}><CTAPill ghost icon="pencil">Juster</CTAPill></span>
          <span onClick={onAvvis}><CTAPill ghost>Avvis</CTAPill></span>
          <span style={{ fontFamily: TL.font.sans, fontSize: 10.5, color: TL.mute, marginLeft: "auto" }}>Anbefaling — planen står til du velger.</span>
        </div>
      </div>
    </div>
  );
}
