"use client";

import { useMemo, useReducer, useState, type CSSProperties, type ReactElement } from "react";
import { Check, ChevronRight, Sparkles, Star, X } from "lucide-react";
import { sendCoachSkillPlan } from "@/lib/workbench/coach-skill-actions";
import { FONT, WB } from "./theme";
import type { RosterPlayer } from "./Topbar";

/**
 * Coach-Skill-veiviser — fasit «Workbench Coach-Skill.dc.html».
 * Tre steg: Profil → Generer → Send. Alt lever i komponent-state; «Send» er en
 * tydelig stub (ingen DB-skriving) — coach godkjenner alltid før reell sending.
 *
 * AI-Caddie / spillernivå-for-AI er skjult bak SHOW_AI-flagget (V2, ikke koblet).
 */

// AI-varianten er ikke lansert. Hold V2-feltene skjult til Anders gir grønt lys.
const SHOW_AI = false;

type Tier = "elite" | "utvikling" | "bygging" | "grunnmur";
type Period = "GRUNN" | "SPESIAL" | "TURNERING" | "EVAL";
type PyrKey = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

/** Spillerkategori A–K (A = topp … K = nybegynner). Snittscore fylles inn av AK Golf. */
const CAT_DEFS: { cat: string; label: string; sub: string }[] = [
  { cat: "A", label: "PGA / DP World Tour", sub: "snittscore ≈ 69–71" },
  { cat: "B", label: "Profesjonell undertur", sub: "snittscore ≈ 71–73" },
  { cat: "C", label: "Elite amatør / landslag", sub: "snittscore ≈ 72–74" },
  { cat: "D", label: "Nasjonal junior-elite", sub: "snittscore ≈ 73–75" },
  { cat: "E", label: "Regional elite", sub: "snittscore ≈ 75–77" },
  { cat: "F", label: "Lavt klubbhandicap", sub: "snittscore ≈ 77–80" },
  { cat: "G", label: "Etablert konkurransespiller", sub: "snittscore ≈ 80–84" },
  { cat: "H", label: "Utviklingsspiller", sub: "snittscore ≈ 84–88" },
  { cat: "I", label: "Aktiv klubbspiller", sub: "snittscore ≈ 88–94" },
  { cat: "J", label: "Fritidsspiller", sub: "snittscore ≈ 94–100" },
  { cat: "K", label: "Nybegynner i klubb", sub: "lærer grunnferdigheter" },
];

const PERIOD_OPTS: { v: Period; label: string }[] = [
  { v: "GRUNN", label: "Grunnperiode" },
  { v: "SPESIAL", label: "Spesialiseringsperiode" },
  { v: "TURNERING", label: "Turneringsperiode" },
  { v: "EVAL", label: "Evalueringsperiode" },
];

const FACILITY_OPTS: { v: string; label: string }[] = [
  { v: "matte", label: "Matte/nett innendørs" },
  { v: "range", label: "Range" },
  { v: "sim", label: "Trackman simulator" },
  { v: "gym", label: "Gym" },
  { v: "green", label: "Putting green" },
  { v: "bunker", label: "Bunker" },
  { v: "driving", label: "Driving range" },
];

const PYR_KEYS: PyrKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const PYR_LABEL: Record<PyrKey, string> = { FYS: "Fysisk", TEK: "Teknikk", SLAG: "Golfslag", SPILL: "Spill", TURN: "Turnering" };
const PYR_COLOR: Record<PyrKey, string> = {
  FYS: WB.ok, // pyr-fys / grønn
  TEK: WB.warn, // pyr-tek / oransje
  SLAG: "#84A9FF", // pyr-slag / blå
  SPILL: WB.lime, // accent / lime
  TURN: WB.err, // pyr-turn / korall
};

// Periodens regelbaserte pyramidefordeling (økter per akse) — fra fasit.
const PERIOD_PYR: Record<Period, Record<PyrKey, number>> = {
  GRUNN: { FYS: 4, TEK: 3, SLAG: 2, SPILL: 1, TURN: 0 },
  SPESIAL: { FYS: 2, TEK: 3, SLAG: 3, SPILL: 2, TURN: 0 },
  TURNERING: { FYS: 1, TEK: 1, SLAG: 2, SPILL: 2, TURN: 2 },
  EVAL: { FYS: 2, TEK: 2, SLAG: 1, SPILL: 1, TURN: 1 },
};

const PERIOD_NAME: Record<Period, string> = {
  GRUNN: "grunnperioden",
  SPESIAL: "spesialiseringsperioden",
  TURNERING: "turneringsperioden",
  EVAL: "evalueringsperioden",
};

const DAY_NAMES = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const CAT_TITLE: Record<PyrKey, string> = { FYS: "Fysisk", TEK: "Teknikk", SLAG: "Golfslag", SPILL: "Spill", TURN: "Turnering" };

// ── nivåtilpasset øktformel (A=elite … K=grunnmur) ──
function tierOf(cat: string): Tier {
  if ("ABC".includes(cat)) return "elite";
  if ("DEF".includes(cat)) return "utvikling";
  if ("GHI".includes(cat)) return "bygging";
  return "grunnmur";
}

const TIER_FORMULA: Record<Tier, { cs: string; lfase: string; praksis: string; miljo: string; ball: string }> = {
  elite: { cs: "CS90–100", lfase: "L_AUTO", praksis: "Variasjon/konkurranse", miljo: "M3–M5", ball: "med ball, full fart" },
  utvikling: { cs: "CS70–90", lfase: "L_BALL → L_AUTO", praksis: "Blokk → variasjon", miljo: "M2–M3", ball: "med ball, kontrollert" },
  bygging: { cs: "CS60–70", lfase: "L_KØLLE/L_BALL", praksis: "Blokk", miljo: "M1–M2", ball: "med ball, lav fart" },
  grunnmur: { cs: "CS50–60", lfase: "L_KROPP/L_ARM", praksis: "Blokk", miljo: "M0–M1", ball: "uten ball — bygg bevegelsen" },
};

const TIER_LABEL: Record<Tier, string> = {
  elite: "Elite (A–C)",
  utvikling: "Utvikling (D–F)",
  bygging: "Bygging (G–I)",
  grunnmur: "Grunnmur (J–K)",
};

const TIER_COLOR: Record<Tier, string> = {
  elite: WB.lime,
  utvikling: "#84A9FF",
  bygging: WB.warn,
  grunnmur: WB.ok,
};

function durLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h && mm) return `${h}t ${mm}m`;
  if (h) return `${h}t`;
  return `${mm}m`;
}

// ───────── state ─────────

type State = {
  step: 1 | 2 | 3;
  level: string;
  perWeek: number;
  timeMin: number;
  period: Period;
  facilities: string[];
  recipients: string[];
  pyrDist: Record<PyrKey, number>;
};

type Action =
  | { type: "goStep"; step: 1 | 2 | 3 }
  | { type: "next" }
  | { type: "back" }
  | { type: "setLevel"; level: string }
  | { type: "incWeek" }
  | { type: "decWeek" }
  | { type: "incTime" }
  | { type: "decTime" }
  | { type: "setPeriod"; period: Period }
  | { type: "toggleFacility"; v: string }
  | { type: "toggleRecipient"; v: string }
  | { type: "pyrInc"; key: PyrKey }
  | { type: "pyrDec"; key: PyrKey };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "goStep":
      return { ...s, step: a.step };
    case "next":
      return { ...s, step: Math.min(3, s.step + 1) as 1 | 2 | 3 };
    case "back":
      return { ...s, step: Math.max(1, s.step - 1) as 1 | 2 | 3 };
    case "setLevel":
      return { ...s, level: a.level };
    case "incWeek":
      return { ...s, perWeek: Math.min(10, s.perWeek + 1) };
    case "decWeek":
      return { ...s, perWeek: Math.max(1, s.perWeek - 1) };
    case "incTime":
      return { ...s, timeMin: Math.min(1200, s.timeMin + 30) };
    case "decTime":
      return { ...s, timeMin: Math.max(120, s.timeMin - 30) };
    case "setPeriod":
      return { ...s, period: a.period };
    case "toggleFacility":
      return {
        ...s,
        facilities: s.facilities.includes(a.v) ? s.facilities.filter((x) => x !== a.v) : [...s.facilities, a.v],
      };
    case "toggleRecipient":
      return {
        ...s,
        recipients: s.recipients.includes(a.v) ? s.recipients.filter((x) => x !== a.v) : [...s.recipients, a.v],
      };
    case "pyrInc":
      return { ...s, pyrDist: { ...s.pyrDist, [a.key]: Math.min(7, s.pyrDist[a.key] + 1) } };
    case "pyrDec":
      return { ...s, pyrDist: { ...s.pyrDist, [a.key]: Math.max(0, s.pyrDist[a.key] - 1) } };
    default:
      return s;
  }
}

// ───────── small shared styles ─────────

const card: CSSProperties = {
  background: WB.cardBg,
  border: `1px solid ${WB.innerBorderSoft}`,
  borderRadius: 13,
  padding: "18px 20px",
};

const eyebrow: CSSProperties = {
  fontFamily: FONT.mono,
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: WB.muted3,
};

// ───────── props ─────────

export type CoachSkillWizardProps = {
  coachName: string;
  /** Spilleren Workbench står på nå (forhåndsvelges som mottaker). */
  currentPlayerName: string;
  currentInitials: string;
  /** userId for «denne Workbench-spilleren» — løser opp «__current__»-mottakeren ved lagring. */
  currentPlayerId: string;
  /** Coachens øvrige spillere — øvrige mottakere i steg 3. */
  players: RosterPlayer[];
  onClose: () => void;
};

export function CoachSkillWizard({
  coachName,
  currentPlayerName,
  currentInitials,
  currentPlayerId,
  players,
  onClose,
}: CoachSkillWizardProps): ReactElement {
  const [s, dispatch] = useReducer(reducer, undefined, (): State => ({
    step: 1,
    level: "A",
    perWeek: 5,
    timeMin: 600,
    period: "GRUNN",
    facilities: ["range", "gym"],
    recipients: ["__current__"],
    pyrDist: { FYS: 2, TEK: 1, SLAG: 1, SPILL: 1, TURN: 0 },
  }));

  // «Send nå»: lagre konfigurasjonen som periode-blokk hos hver mottaker.
  const [sender, setSender] = useState(false);
  async function handleSend(): Promise<void> {
    if (sender) return;
    // «__current__» → denne spilleren; «__group__» utvides server-side til spillerens gruppe.
    const harGruppe = s.recipients.includes("__group__");
    const recipientUserIds = [
      ...new Set(
        s.recipients
          .map((r) => (r === "__current__" ? currentPlayerId : r))
          .filter((r): r is string => Boolean(r) && r !== "__group__"),
      ),
    ];
    if (recipientUserIds.length === 0 && !harGruppe) {
      onClose();
      return;
    }
    setSender(true);
    try {
      await sendCoachSkillPlan({
        recipientUserIds,
        includeGroupOfUserId: harGruppe && currentPlayerId ? currentPlayerId : undefined,
        level: s.level,
        period: s.period,
        perWeek: s.perWeek,
        timeMin: s.timeMin,
        pyrDist: s.pyrDist,
        facilities: s.facilities,
      });
    } finally {
      setSender(false);
      onClose();
    }
  }

  const tier = tierOf(s.level);
  const tf = TIER_FORMULA[tier];

  // Regelbasert ukeskall fra periode + perWeek (fasit-logikk).
  const genDays = useMemo(() => {
    const pyr = PERIOD_PYR[s.period];
    const pool: PyrKey[] = [];
    PYR_KEYS.forEach((c) => {
      for (let i = 0; i < pyr[c]; i++) pool.push(c);
    });
    const perDay: PyrKey[][] = [[], [], [], [], [], [], []];
    const order = [0, 2, 4, 1, 3, 5, 6];
    let di = 0;
    pool.slice(0, s.perWeek + 3).forEach((c) => {
      perDay[order[di % 7]].push(c);
      di++;
    });
    const minPer = Math.round(s.timeMin / Math.max(1, pool.length));
    const sessionFormula = (cat: PyrKey): { cs: string; praksis: string } => {
      if (cat === "FYS") return { cs: "—", praksis: tier === "elite" ? "Power/eksplosivt" : "Styrke/kontroll" };
      if (cat === "TEK") return { cs: tf.cs, praksis: tier === "grunnmur" ? "Uten ball · L_KROPP" : tf.lfase };
      return { cs: tf.cs, praksis: tf.praksis };
    };
    return DAY_NAMES.map((label, i) => ({
      label,
      weekend: i >= 5,
      sessions: perDay[i].map((c) => {
        const f = sessionFormula(c);
        return { cat: c, dur: durLabel(minPer), title: `${CAT_TITLE[c]}-skall`, cs: f.cs, praksis: f.praksis };
      }),
    }));
  }, [s.period, s.perWeek, s.timeMin, tier, tf]);

  const budgetChips = useMemo(() => {
    const pyr = PERIOD_PYR[s.period];
    return PYR_KEYS.map((c) => ({ key: c, label: `${c} ${pyr[c]}`, on: pyr[c] > 0 }));
  }, [s.period]);

  const engineLine = `Regelbasert skall for ${PERIOD_NAME[s.period]} · ${s.perWeek} økter/uke · ${durLabel(s.timeMin)} totalt. Pyramidefordeling følger ordbokens invarianter.`;

  const pyrSum = PYR_KEYS.reduce((a, c) => a + s.pyrDist[c], 0);
  const pyrSumOk = pyrSum === s.perWeek;

  // Mottakere: nåværende spiller + coachens øvrige + en gruppe-rad.
  const recipients = useMemo(() => {
    const others = players.filter((p) => p.name !== currentPlayerName).slice(0, 4);
    const list: { v: string; name: string; meta: string; initials: string; color: string }[] = [
      { v: "__current__", name: currentPlayerName, meta: "Denne Workbench-spilleren", initials: currentInitials, color: WB.lime },
      ...others.map((p) => ({ v: p.id, name: p.name, meta: "Spiller i stallen", initials: p.initials, color: "#84A9FF" })),
      { v: "__group__", name: "Gruppe via AK Golf", meta: "Gruppe · individuell tidsblokk", initials: "GR", color: WB.ok },
    ];
    return list;
  }, [players, currentPlayerName, currentInitials]);

  const navHint: Record<1 | 2 | 3, string> = {
    1: "Neste: generer forslag",
    2: "Neste: se gjennom og send",
    3: "Send til spiller",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Coach-Skill"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(7,16,12,0.62)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 1100,
          height: "min(820px, 92vh)",
          display: "flex",
          flexDirection: "column",
          background: WB.panelBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 50px 110px -40px rgba(0,0,0,0.7)",
          fontFamily: FONT.sans,
          color: WB.text,
        }}
      >
        {/* TOPBAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 20px",
            height: 56,
            borderBottom: `1px solid ${WB.panelBorder}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: WB.lime,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={16} color={WB.limeDark} strokeWidth={2.2} />
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: WB.muted }}>
            AGENCYOS
          </span>
          <ChevronRight size={13} color={WB.muted3} strokeWidth={2.4} />
          <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: WB.lime }}>
            COACH-SKILL
          </span>
          <span style={{ fontSize: 13, color: WB.muted }}>{coachName}</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {SHOW_AI && (
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: WB.warn,
                  background: "rgba(232,163,61,0.16)",
                  borderRadius: 6,
                  padding: "5px 10px",
                }}
              >
                AI-MOTOR: V2 · SKJULT VED LANSERING
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Lukk"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: `1px solid ${WB.panelBorder}`,
                background: WB.cardBg,
                color: WB.muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* STEP RAIL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: `1px solid ${WB.innerBorderSoft}`,
            flexShrink: 0,
          }}
        >
          {(["Profil", "Generer", "Send"] as const).map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = n === s.step;
            const done = n < s.step;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "goStep", step: n })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      background: active ? WB.lime : done ? WB.ok : WB.cardBgAlt,
                      color: active || done ? WB.limeDark : WB.muted,
                      border: active || done ? "none" : `1px solid ${WB.panelBorder}`,
                    }}
                  >
                    {done ? <Check size={13} strokeWidth={3} /> : n}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: active ? WB.text : WB.muted }}>{label}</span>
                </button>
                {i < 2 && (
                  <span
                    style={{
                      width: 48,
                      height: 1,
                      margin: "0 14px",
                      background: done ? WB.ok : WB.panelBorder,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: "auto", padding: "26px 24px 40px" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            {s.step === 1 && <StepProfil s={s} dispatch={dispatch} pyrSum={pyrSum} pyrSumOk={pyrSumOk} />}
            {s.step === 2 && (
              <StepGenerer
                tier={tier}
                tf={tf}
                engineLine={engineLine}
                budgetChips={budgetChips}
                genDays={genDays}
              />
            )}
            {s.step === 3 && <StepSend s={s} dispatch={dispatch} recipients={recipients} />}
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 24px",
            height: 68,
            borderTop: `1px solid ${WB.innerBorderSoft}`,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => dispatch({ type: "back" })}
            disabled={s.step === 1}
            style={{
              background: WB.cardBgAlt,
              border: `1px solid ${WB.panelBorder}`,
              color: s.step === 1 ? WB.muted3 : WB.muted2,
              borderRadius: 10,
              padding: "11px 20px",
              cursor: s.step === 1 ? "default" : "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Tilbake
          </button>
          <div style={{ flex: 1 }} />
          {s.step === 3 ? (
            <span style={{ fontSize: 11.5, color: WB.muted3 }}>
              Lagres som spillerens periode-blokk ved sending (coach godkjenner alltid først).
            </span>
          ) : (
            <span style={{ fontSize: 12, color: WB.muted }}>{navHint[s.step]}</span>
          )}
          <button
            type="button"
            disabled={sender}
            onClick={() => (s.step === 3 ? handleSend() : dispatch({ type: "next" }))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: s.step === 3 ? WB.ok : WB.lime,
              color: WB.limeDark,
              border: "none",
              borderRadius: 10,
              padding: "11px 22px",
              cursor: sender ? "wait" : "pointer",
              opacity: sender ? 0.6 : 1,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {s.step === 3 ? (sender ? "Sender…" : "Send nå") : "Neste"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────── STEG 1: PROFIL ─────────

type StepProps = { s: State; dispatch: React.Dispatch<Action> };

function StepProfil({
  s,
  dispatch,
  pyrSum,
  pyrSumOk,
}: StepProps & { pyrSum: number; pyrSumOk: boolean }): ReactElement {
  return (
    <>
      <h2 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 26, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Hvem er denne planen for?
      </h2>
      <p style={{ fontSize: 14, color: WB.muted, margin: "0 0 26px", maxWidth: "60ch" }}>
        Sett kriteriene én gang. Skillen gjenbrukes for alle spillere som matcher.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Spillerkategori A–K */}
        <div style={card}>
          <div style={{ ...eyebrow, marginBottom: 12 }}>Spillerkategori (A–K)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CAT_DEFS.map((o) => {
              const on = o.cat === s.level;
              return (
                <button
                  key={o.cat}
                  type="button"
                  onClick={() => dispatch({ type: "setLevel", level: o.cat })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "9px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    border: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                    background: on ? "rgba(209,248,67,0.08)" : WB.cardBgAlt,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      flexShrink: 0,
                      borderRadius: 7,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      background: on ? WB.lime : WB.railBg,
                      color: on ? WB.limeDark : WB.muted,
                      border: on ? "none" : `1px solid ${WB.panelBorder}`,
                    }}
                  >
                    {o.cat}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: WB.text }}>{o.label}</div>
                    <div style={{ fontSize: 11, color: WB.muted }}>{o.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 10.5, color: WB.muted3, marginTop: 12 }}>
            Snittscore fylles inn av AK Golf.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Økter per uke */}
          <Stepper
            label="Økter per uke"
            value={String(s.perWeek)}
            fill={(s.perWeek / 10) * 100}
            onDec={() => dispatch({ type: "decWeek" })}
            onInc={() => dispatch({ type: "incWeek" })}
          />
          {/* Tid per uke */}
          <Stepper
            label="Tid per uke"
            value={durLabel(s.timeMin)}
            fill={(s.timeMin / 1200) * 100}
            onDec={() => dispatch({ type: "decTime" })}
            onInc={() => dispatch({ type: "incTime" })}
          />

          {/* Spillernivå (for AI) — skjult til AI-varianten lanseres */}
          {SHOW_AI && (
            <div style={{ ...card, border: `1px dashed rgba(132,169,255,0.3)` }}>
              <div style={{ ...eyebrow, color: "#84A9FF", marginBottom: 8 }}>Spillernivå for AI · V2</div>
              <div style={{ fontSize: 11, color: WB.muted3 }}>Skjult til AI-varianten lanseres.</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Periode */}
        <div style={card}>
          <div style={{ ...eyebrow, marginBottom: 12 }}>Periode akkurat nå</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {PERIOD_OPTS.map((o) => {
              const on = o.v === s.period;
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => dispatch({ type: "setPeriod", period: o.v })}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "7px 12px",
                    borderRadius: 9999,
                    cursor: "pointer",
                    border: `1px solid ${on ? "#84A9FF" : WB.panelBorder}`,
                    color: on ? WB.limeDark : WB.muted,
                    background: on ? "#84A9FF" : WB.cardBgAlt,
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fasiliteter */}
        <div style={card}>
          <div style={{ ...eyebrow, marginBottom: 12 }}>Tilgjengelige fasiliteter</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {FACILITY_OPTS.map((o) => {
              const on = s.facilities.includes(o.v);
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => dispatch({ type: "toggleFacility", v: o.v })}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "7px 12px",
                    borderRadius: 9999,
                    cursor: "pointer",
                    border: `1px solid ${on ? WB.ok : WB.panelBorder}`,
                    color: on ? WB.limeDark : WB.muted,
                    background: on ? WB.ok : WB.cardBgAlt,
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pyramide-fordeling */}
      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={eyebrow}>Fordeling på pyramiden — økter per uke</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: pyrSumOk ? WB.ok : WB.warn }}>
            {pyrSumOk ? `stemmer med ${s.perWeek} økter/uke ✓` : `${pyrSum} av ${s.perWeek} økter fordelt`}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
          {PYR_KEYS.map((c) => (
            <div
              key={c}
              style={{
                background: WB.cardBg,
                border: `1px solid ${WB.innerBorderSoft}`,
                borderRadius: 11,
                padding: "12px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 9,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: PYR_COLOR[c] }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: WB.muted2 }}>{PYR_LABEL[c]}</span>
              </div>
              <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: WB.text, lineHeight: 1 }}>
                {s.pyrDist[c]}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <PyrBtn onClick={() => dispatch({ type: "pyrDec", key: c })}>−</PyrBtn>
                <PyrBtn onClick={() => dispatch({ type: "pyrInc", key: c })}>+</PyrBtn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Stepper({
  label,
  value,
  fill,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  fill: number;
  onDec: () => void;
  onInc: () => void;
}): ReactElement {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={eyebrow}>{label}</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: WB.lime }}>{value}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <PyrBtn onClick={onDec} big>
          −
        </PyrBtn>
        <div style={{ flex: 1, height: 6, borderRadius: 9999, background: WB.railBg, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.round(fill)}%`, background: WB.lime }} />
        </div>
        <PyrBtn onClick={onInc} big>
          +
        </PyrBtn>
      </div>
    </div>
  );
}

function PyrBtn({ children, onClick, big }: { children: string; onClick: () => void; big?: boolean }): ReactElement {
  const sz = big ? 30 : 26;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: sz,
        height: sz,
        borderRadius: big ? 8 : 7,
        border: "none",
        background: WB.cardBgAlt,
        color: WB.text,
        cursor: "pointer",
        fontSize: big ? 16 : 14,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

// ───────── STEG 2: GENERER ─────────

type GenDay = { label: string; weekend: boolean; sessions: { cat: PyrKey; dur: string; title: string; cs: string; praksis: string }[] };

function StepGenerer({
  tier,
  tf,
  engineLine,
  budgetChips,
  genDays,
}: {
  tier: Tier;
  tf: { cs: string; lfase: string; praksis: string; miljo: string; ball: string };
  engineLine: string;
  budgetChips: { key: PyrKey; label: string; on: boolean }[];
  genDays: GenDay[];
}): ReactElement {
  const tierColor = TIER_COLOR[tier];
  const rows = [
    { k: "Hastighet (CS)", v: tf.cs },
    { k: "Læringsfase", v: tf.lfase },
    { k: "Praksistype", v: tf.praksis },
    { k: "Miljø", v: tf.miljo },
    { k: "Teknikk", v: tf.ball },
  ];
  const note =
    tier === "grunnmur"
      ? "Lavt nivå → mest teknikk uten ball, lav hastighet, blokk-praksis. Bygg bevegelsen før press og miljø heves."
      : tier === "elite"
        ? "Høyt nivå → høy hastighet, L_AUTO, variasjon/konkurranse og turneringslikt miljø."
        : "Formelen strammes gradvis opp etter hvert som teknikken modnes.";

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
        <div>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 26, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Forslag til ukeplan
          </h2>
          <p style={{ fontSize: 14, color: WB.muted, margin: 0, maxWidth: "62ch" }}>{engineLine}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...eyebrow, fontSize: 9 }}>Pyramide-budsjett</div>
          <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
            {budgetChips.map((b) => (
              <span
                key={b.key}
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9.5,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 6,
                  color: WB.limeDark,
                  background: PYR_COLOR[b.key],
                  opacity: b.on ? 1 : 0.3,
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* NIVÅTILPASSET FORMEL */}
      <div
        style={{
          ...card,
          borderLeft: `3px solid ${tierColor}`,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
          <span style={eyebrow}>Øktformel · nivåtilpasset</span>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              color: tierColor,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 6,
              padding: "3px 9px",
            }}
          >
            {TIER_LABEL[tier]}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9, marginBottom: 12 }}>
          {rows.map((r) => (
            <div key={r.k} style={{ background: WB.cardBg, border: `1px solid ${WB.innerBorderSoft}`, borderRadius: 9, padding: "10px 11px" }}>
              <div style={{ fontSize: 9.5, color: WB.muted, marginBottom: 5 }}>{r.k}</div>
              <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 13, color: WB.text, lineHeight: 1.2 }}>{r.v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: WB.muted2 }}>{note}</div>
      </div>

      {/* UKEGRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginBottom: 16 }}>
        {genDays.map((d) => (
          <div
            key={d.label}
            style={{
              borderRadius: 11,
              border: `1px solid ${WB.innerBorderSoft}`,
              overflow: "hidden",
              background: d.weekend ? WB.railBg : WB.cardBg,
            }}
          >
            <div style={{ textAlign: "center", padding: "8px 0", borderBottom: `1px solid ${WB.panelBorder}` }}>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: WB.muted,
                }}
              >
                {d.label}
              </div>
            </div>
            <div style={{ padding: 7, display: "flex", flexDirection: "column", gap: 6, minHeight: 90 }}>
              {d.sessions.map((sess, idx) => (
                <div
                  key={idx}
                  style={{
                    background: WB.cardBgAlt,
                    border: `1px solid ${WB.panelBorder}`,
                    borderLeft: `3px solid ${PYR_COLOR[sess.cat]}`,
                    borderRadius: 8,
                    padding: "8px 9px",
                  }}
                >
                  <div style={{ fontFamily: FONT.mono, fontSize: 8.5, color: WB.muted }}>{sess.dur}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: WB.text, lineHeight: 1.2, margin: "2px 0 5px" }}>{sess.title}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {[sess.cs, sess.praksis].map((chip, ci) => (
                      <span
                        key={ci}
                        style={{
                          fontFamily: FONT.mono,
                          fontSize: 7.5,
                          fontWeight: 700,
                          letterSpacing: "0.03em",
                          color: PYR_COLOR[sess.cat],
                          background: `${PYR_COLOR[sess.cat]}1a`,
                          borderRadius: 4,
                          padding: "2px 5px",
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* VALIDERINGSLINJE */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: WB.cardBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 11, padding: "13px 16px" }}>
        <Check size={17} color={WB.ok} strokeWidth={2.2} />
        <span style={{ fontSize: 12.5, color: WB.muted2 }}>
          Validert mot periodens invarianter: volum-tak, CS-tak, kun L_AUTO, min. 2 hviledager.{" "}
          <strong style={{ color: WB.ok }}>Alt innenfor.</strong>
        </span>
      </div>

      {SHOW_AI && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 11,
            background: "linear-gradient(150deg,rgba(209,248,67,0.06),#163027 55%)",
            border: "1px dashed rgba(209,248,67,0.32)",
            borderRadius: 11,
            padding: "12px 15px",
            marginTop: 10,
          }}
        >
          <Star size={15} color={WB.lime} fill={WB.lime} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: WB.warn,
                background: "rgba(232,163,61,0.16)",
                borderRadius: 5,
                padding: "2px 7px",
              }}
            >
              V2 · SKJULT
            </span>{" "}
            <span style={{ fontSize: 12, color: WB.muted }}>
              AI Caddie ville fylt øktskallene med drills mot svakeste SG-kategori. I V1 legges kun skallet — coach fyller drills manuelt.
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// ───────── STEG 3: SEND ─────────

type Recipient = { v: string; name: string; meta: string; initials: string; color: string };

function StepSend({
  s,
  dispatch,
  recipients,
}: StepProps & { recipients: Recipient[] }): ReactElement {
  return (
    <>
      <h2 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 26, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Send til spiller
      </h2>
      <p style={{ fontSize: 14, color: WB.muted, margin: "0 0 24px", maxWidth: "60ch" }}>
        Coach godkjenner alltid før sending. Mål legges automatisk i spillerens målsetninger.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
        {/* Mottakere */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ ...eyebrow, marginBottom: 14 }}>Mottakere</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {recipients.map((r) => {
              const on = s.recipients.includes(r.v);
              return (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => dispatch({ type: "toggleRecipient", v: r.v })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    border: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                    background: on ? "rgba(209,248,67,0.07)" : WB.cardBgAlt,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `2px solid ${on ? WB.lime : WB.muted3}`,
                      background: on ? WB.lime : "transparent",
                    }}
                  >
                    {on && <Check size={11} color={WB.limeDark} strokeWidth={3} />}
                  </span>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: r.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: WB.limeDark,
                    }}
                  >
                    {r.initials}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: WB.text }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: WB.muted }}>{r.meta}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: WB.muted, marginBottom: 5 }}>Oppstart</div>
              <div style={{ background: WB.railBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 9, padding: "9px 11px", fontFamily: FONT.mono, fontSize: 12.5, color: WB.text }}>
                16.06.2026
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: WB.muted, marginBottom: 5 }}>Slutt</div>
              <div style={{ background: WB.railBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 9, padding: "9px 11px", fontFamily: FONT.mono, fontSize: 12.5, color: WB.text }}>
                13.07.2026
              </div>
            </div>
          </div>
        </div>

        {/* Melding + Mål */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ ...eyebrow, marginBottom: 10 }}>Melding til spiller</div>
            <div style={{ background: WB.railBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 9, padding: "11px 13px", fontSize: 12.5, lineHeight: 1.5, color: WB.muted2, minHeight: 74 }}>
              Fire uker grunnperiode. Fokus på å bygge driver-bevegelsen lavt i pyramiden — matte og range. Vi hever ikke press før spredningen er stabil.
            </div>
          </div>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ ...eyebrow, marginBottom: 10 }}>Mål som følger med</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {["Driver-spredning under ±10 m", "4 FYS-økter fullført per uke"].map((g) => (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: WB.muted2 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#84A9FF" }} />
                  {g}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10.5, color: WB.muted3, marginTop: 10 }}>
              Merkes som <strong style={{ color: WB.muted }}>coach-satt</strong> — adskilt fra spillerens egne mål.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
