"use client";

/**
 * WORKBENCH V2 — aksjons-ark og «valgt økt»-handlinger. Utskilt fra
 * WorkbenchV2.tsx (~300-linjer-regelen): «Ny økt»-skjema, delt dag-pille-rad,
 * og flytt/slett-panelet for valgt økt i Balanse-kolonnen.
 *
 * Ærlighet (prosjekt-regel): kun v2-primitiver (T/Icon/Kort/Knapp/AkseChip) —
 * ingen rå hex, ingen ad-hoc UI utenom layout-divs (samme mønster som
 * WorkbenchV2.tsx for øvrig). Alle mutasjoner går via `actions`-prop fra
 * siden (spiller- eller coach-server-actions) — komponentene her kjenner
 * ikke Prisma.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import { T, Icon, Kort, Knapp, AkseChip } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { WeekEvent } from "@/lib/workbench/week-types";
import type { WeekSuggestion } from "@/lib/ai-plan/week-suggest";
import type { PlanStatus } from "@/generated/prisma/client";
import { fmtVarighet, toKl } from "@/lib/workbench/v2-format";
import { resolvePlanSessionLiveHref } from "@/lib/workbench/session-actions";
import { planSessionStartHref, v2SessionStartHref, type V2OktUiStatus } from "@/lib/portal/session-hrefs";

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

/** I6-hjelpere: samme kilde-/ferdig-logikk som ValgtOktSeksjon bruker ellers. */
function erPlanKilde(okt: WeekEvent): boolean {
  return (okt.source ?? "plan") === "plan";
}
function erFerdig(okt: WeekEvent): boolean {
  const st = okt.status ?? "PLANNED";
  return st === "COMPLETED" || st === "ABANDONED" || st === "SKIPPED" || st === "CANCELLED";
}
const AKSER: { v: AkseKey; l: string }[] = [
  { v: "FYS", l: "Fysisk" },
  { v: "TEK", l: "Teknikk" },
  { v: "SLAG", l: "Slag" },
  { v: "SPILL", l: "Spill" },
  { v: "TURN", l: "Turnering" },
];

/* ── Delt kontrakt: spiller- og coach-varianten av Workbench-mutasjonene ── */
export interface WorkbenchV2Actions {
  addSession: (input: {
    dayIndex: number;
    title: string;
    durMin: number;
    area: AkseKey;
    hour: number;
    minute: number;
    weekOffset?: number;
  }) => Promise<{ ok: boolean; sessionId?: string; error?: string }>;
  moveSession: (
    sessionId: string,
    dayIndex: number,
    weekOffset?: number,
  ) => Promise<{ ok: boolean; error?: string }>;
  removeSession: (sessionId: string) => Promise<{ ok: boolean; error?: string }>;
  /** I6: inline-redigering av valgt økt (tittel/akse/tid/varighet). */
  updateSession?: (
    sessionId: string,
    patch: { title?: string; pyramidArea?: AkseKey; hour?: number; minute?: number; durationMin?: number },
  ) => Promise<{ ok: boolean; error?: string }>;
  publish: () => Promise<{ ok: boolean; error?: string; status?: PlanStatus }>;
  /** Kun spiller-rolle. Utelatt → knappen skjules. */
  suggestWeek?: (weekOffset?: number) => Promise<{
    ok: boolean;
    suggestions?: WeekSuggestion[];
    usedAi?: boolean;
    message?: string;
  }>;
  /** Legg en valgt forslag-variant inn i uka. Kreves for ForslagArk. */
  applySuggestion?: (
    variant: WeekSuggestion,
    weekOffset?: number,
  ) => Promise<{ ok: boolean; count?: number; error?: string }>;
  /** Kun coach-rolle. Utelatt → knappen skjules. */
  duplicateWeek?: (weekOffset?: number) => Promise<{ ok: boolean; count?: number; error?: string }>;
  /** G7/fasit: legg inn mal-uke 1 fra en godkjent planmal (coldstart + bibliotek). */
  applyTemplate?: (templateId: string) => Promise<{ ok: boolean; error?: string }>;
}

/* ── Delt dag-pille-rad (7 dager, Man–Søn) ─────────────── */
export function DagPillRow({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (i: number) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {DAGER.map((d, i) => {
        const on = value === i;
        return (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onChange(i)}
            style={{
              appearance: "none",
              cursor: disabled ? "default" : "pointer",
              flex: 1,
              fontFamily: T.mono,
              fontSize: 9.5,
              fontWeight: 700,
              padding: "7px 0",
              borderRadius: 8,
              border: `1px solid ${on ? "transparent" : T.border}`,
              background: on ? T.lime : T.panel2,
              color: on ? T.onLime : T.fg2,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

function Felt({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.mut,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  appearance: "none",
  background: T.panel2,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: "9px 11px",
  color: T.fg,
  fontFamily: T.ui,
  fontSize: 13,
  outline: "none",
};

/* ── Ny økt — skjema-ark ────────────────────────────────── */
export interface NyOktInput {
  title: string;
  dayIndex: number;
  akse: AkseKey;
  hour: number;
  minute: number;
  durMin: number;
}
export interface NyOktArkProps {
  defaultDayIndex: number;
  /** «HH:MM» fra trykk på tom luke i tidslinja (I1). */
  defaultTid?: string;
  /** Forhåndsutfylling fra bibliotek-brikke (ett-klikks «legg til»). */
  defaultTitle?: string;
  defaultAkse?: AkseKey;
  defaultDurMin?: number;
  onLukk: () => void;
  onOpprett: (input: NyOktInput) => Promise<{ ok: boolean; error?: string }>;
}
export function NyOktArk({ defaultDayIndex, defaultTid, defaultTitle, defaultAkse, defaultDurMin, onLukk, onOpprett }: NyOktArkProps) {
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [dayIndex, setDayIndex] = useState(defaultDayIndex);
  const [akse, setAkse] = useState<AkseKey>(defaultAkse ?? "TEK");
  const [tid, setTid] = useState(defaultTid ?? "09:00");
  const [durMin, setDurMin] = useState(defaultDurMin ?? 60);
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const opprett = async () => {
    const [hStr, mStr] = tid.split(":");
    const hour = Math.max(0, Math.min(23, Number(hStr) || 0));
    const minute = Math.max(0, Math.min(59, Number(mStr) || 0));
    setLagrer(true);
    setFeil(null);
    const res = await onOpprett({ title: title.trim() || "Ny økt", dayIndex, akse, hour, minute, durMin });
    setLagrer(false);
    if (!res.ok) setFeil(res.error ?? "Kunne ikke opprette økten.");
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 70, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={lagrer ? undefined : onLukk}
        style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }}
      />
      <div
        style={{
          position: "relative", width: "min(420px, 100%)", maxHeight: "88vh", overflowY: "auto",
          background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
            Ny økt
          </h2>
          <button
            type="button"
            onClick={onLukk}
            disabled={lagrer}
            style={{
              appearance: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 8,
              background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex",
              alignItems: "center", justifyContent: "center", flex: "none",
            }}
          >
            <Icon name="x" size={14} style={{ color: T.fg2 }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          <Felt label="Tittel">
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. Wedge 60–100 m"
              maxLength={120}
            />
          </Felt>
          <Felt label="Dag">
            <DagPillRow value={dayIndex} onChange={setDayIndex} disabled={lagrer} />
          </Felt>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Felt label="Klokkeslett">
                <input type="time" style={inputStyle} value={tid} onChange={(e) => setTid(e.target.value)} disabled={lagrer} />
              </Felt>
            </div>
            <div style={{ flex: 1 }}>
              <Felt label="Varighet (min)">
                <input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  style={inputStyle}
                  value={durMin}
                  disabled={lagrer}
                  onChange={(e) => setDurMin(Math.max(5, Math.min(480, Number(e.target.value) || 60)))}
                />
              </Felt>
            </div>
          </div>
          <Felt label="Område">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {AKSER.map((a) => {
                const on = akse === a.v;
                return (
                  <button
                    key={a.v}
                    type="button"
                    disabled={lagrer}
                    onClick={() => setAkse(a.v)}
                    style={{
                      appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "7px 11px", borderRadius: 9999, border: `1px solid ${on ? "transparent" : T.border}`,
                      background: on ? T.lime : T.panel2, color: on ? T.onLime : T.fg2,
                      fontFamily: T.ui, fontSize: 11.5, fontWeight: 600,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: on ? T.onLime : T.ax[a.v] }} />
                    {a.l}
                  </button>
                );
              })}
            </div>
          </Felt>

          {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</span>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <Knapp ghost onClick={onLukk} disabled={lagrer}>
              Avbryt
            </Knapp>
            <Knapp icon="plus" onClick={opprett} disabled={lagrer}>
              {lagrer ? "Oppretter…" : "Opprett økt"}
            </Knapp>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Ukeforslag — 3 variantkort (konservativ/standard/aggressiv) ──
   AI-forslag er alltid en anbefaling spilleren aktivt tar i bruk — aldri
   auto-lagt inn. usedAi=false vises ærlig som standardforslag uten AI. */
const VARIANT_LABEL: Record<WeekSuggestion["variant"], string> = {
  konservativ: "Konservativ",
  standard: "Standard",
  aggressiv: "Aggressiv",
};

export interface ForslagArkProps {
  suggestions: WeekSuggestion[];
  usedAi: boolean;
  onLukk: () => void;
  /** Kalles med valgt variant; parent kaller applySuggestion + refresh. */
  onBruk: (variant: WeekSuggestion) => Promise<{ ok: boolean; count?: number; error?: string }>;
}

export function ForslagArk({ suggestions, usedAi, onLukk, onBruk }: ForslagArkProps) {
  const [brukes, setBrukes] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const bruk = async (variant: WeekSuggestion) => {
    if (brukes) return;
    setBrukes(variant.variant);
    setFeil(null);
    const res = await onBruk(variant);
    setBrukes(null);
    if (!res.ok) setFeil(res.error ?? "Kunne ikke legge inn forslaget.");
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 70, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={brukes ? undefined : onLukk}
        style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }}
      />
      <div
        style={{
          position: "relative", width: "min(760px, 100%)", maxHeight: "88vh", overflowY: "auto",
          background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
              Forslag til uka
            </h2>
            <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, display: "block", marginTop: 4 }}>
              {usedAi
                ? "Tre varianter basert på nivået ditt, fokusområdet og planen din. Velg den som passer uka."
                : "Standardforslag (uten AI) — tre varianter du kan bruke som utgangspunkt."}
            </span>
          </div>
          <button
            type="button"
            onClick={onLukk}
            disabled={brukes != null}
            style={{
              appearance: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 8,
              background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex",
              alignItems: "center", justifyContent: "center", flex: "none",
            }}
          >
            <Icon name="x" size={14} style={{ color: T.fg2 }} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 12,
            marginTop: 16,
          }}
        >
          {suggestions.map((s) => (
            <Kort key={s.variant} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>
                  {VARIANT_LABEL[s.variant]}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>
                  {s.totalSessions} økter
                </span>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fg2 }}>{s.focusBlend}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {s.sessions.map((okt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut, width: 26, flex: "none" }}>
                      {DAGER[okt.day] ?? ""}
                    </span>
                    <AkseChip a={okt.pyramidArea} />
                    <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {okt.title}
                    </span>
                    <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, flex: "none" }}>
                      {fmtVarighet(okt.durationMin)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto" }}>
                <Knapp
                  icon="plus"
                  onClick={() => bruk(s)}
                  disabled={brukes != null}
                >
                  {brukes === s.variant ? "Legger inn…" : "Bruk forslag"}
                </Knapp>
              </div>
            </Kort>
          ))}
        </div>

        {feil && (
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down, display: "block", marginTop: 12 }}>
            {feil}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Valgt økt — flytt/slett-panel (Balanse-kolonnen) ──── */
export interface ValgtOktSeksjonProps {
  okt: WeekEvent;
  actions?: WorkbenchV2Actions;
  weekOffset: number;
  /** Kalles etter vellykket flytt/sletting — parent kaller router.refresh(). */
  onEndret: () => void;
}
export function ValgtOktSeksjon({ okt, actions, weekOffset, onEndret }: ValgtOktSeksjonProps) {
  const router = useRouter();
  const [flyttApen, setFlyttApen] = useState(false);
  const [flyttLoading, setFlyttLoading] = useState(false);
  // I6: inline-redigering — hvilket felt er i redigeringsmodus.
  const [rediger, setRediger] = useState<null | "tittel" | "akse" | "tid">(null);
  const [tittelUtkast, setTittelUtkast] = useState(okt.ttl);
  const [tidUtkast, setTidUtkast] = useState(toKl(okt.h, okt.m));
  const [durUtkast, setDurUtkast] = useState(okt.durMin);
  const [lagrerFelt, setLagrerFelt] = useState(false);
  const kanRedigere = !!actions?.updateSession && !!okt.id && erPlanKilde(okt) && !erFerdig(okt);

  const lagreFelt = async (patch: Parameters<NonNullable<WorkbenchV2Actions["updateSession"]>>[1]) => {
    if (!actions?.updateSession || !okt.id || lagrerFelt) return;
    setLagrerFelt(true);
    setFeil(null);
    const res = await actions.updateSession(okt.id, patch);
    setLagrerFelt(false);
    if (res.ok) {
      setRediger(null);
      onEndret();
    } else {
      setFeil(res.error ?? "Kunne ikke lagre endringen.");
    }
  };
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [sletterLoading, setSletterLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  // Kilde styrer handlingene: flytt/slett-actions slår opp TrainingPlanSession
  // og ville feilet på en v2-id; v2-økter lenkes rett til live-flyten i stedet.
  const erPlan = (okt.source ?? "plan") === "plan";
  const status = okt.status ?? "PLANNED";
  const ferdig = status === "COMPLETED" || status === "ABANDONED" || status === "SKIPPED" || status === "CANCELLED";

  const startOkt = async () => {
    if (!okt.id || startLoading) return;
    setStartLoading(true);
    setFeil(null);
    const res = await resolvePlanSessionLiveHref(okt.id);
    setStartLoading(false);
    if (res.ok && res.href) router.push(res.href);
    else setFeil(res.error ?? "Kunne ikke starte økten.");
  };

  const flytt = async (dayIndex: number) => {
    if (!actions || !okt.id) return;
    setFlyttLoading(true);
    setFeil(null);
    const res = await actions.moveSession(okt.id, dayIndex, weekOffset);
    setFlyttLoading(false);
    if (res.ok) {
      setFlyttApen(false);
      onEndret();
    } else {
      setFeil(res.error ?? "Kunne ikke flytte økten.");
    }
  };

  const slett = async () => {
    if (!actions || !okt.id) return;
    setSletterLoading(true);
    setFeil(null);
    const res = await actions.removeSession(okt.id);
    setSletterLoading(false);
    setBekreftSlett(false);
    if (res.ok) onEndret();
    else setFeil(res.error ?? "Kunne ikke slette økten.");
  };

  return (
    <Kort tint pad="13px 14px">
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {kanRedigere ? (
          <button
            type="button"
            onClick={() => setRediger(rediger === "akse" ? null : "akse")}
            title="Trykk for å endre område"
            className="v2-press v2-focus"
            style={{ appearance: "none", background: "transparent", border: 0, padding: 0, cursor: "pointer", display: "inline-flex" }}
          >
            <AkseChip a={okt.eb as AkseKey} />
          </button>
        ) : (
          <AkseChip a={okt.eb as AkseKey} />
        )}
      </div>
      {rediger === "akse" && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
          {AKSER.map((a) => (
            <button
              key={a.v}
              type="button"
              disabled={lagrerFelt}
              onClick={() => lagreFelt({ pyramidArea: a.v })}
              style={{
                appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 9999,
                border: `1px solid ${okt.eb === a.v ? "transparent" : T.border}`,
                background: okt.eb === a.v ? T.lime : T.panel2, color: okt.eb === a.v ? T.onLime : T.fg2,
                fontFamily: T.ui, fontSize: 11, fontWeight: 600, opacity: lagrerFelt ? 0.5 : 1,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: okt.eb === a.v ? T.onLime : T.ax[a.v] }} />
              {a.l}
            </button>
          ))}
        </div>
      )}
      {rediger === "tittel" ? (
        <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
          <input
            autoFocus
            value={tittelUtkast}
            maxLength={120}
            disabled={lagrerFelt}
            onChange={(e) => setTittelUtkast(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") lagreFelt({ title: tittelUtkast.trim() || okt.ttl }); if (e.key === "Escape") setRediger(null); }}
            style={{ ...inputStyle, fontFamily: T.disp, fontSize: 15, fontWeight: 700 }}
          />
          <Knapp icon="check" disabled={lagrerFelt} onClick={() => lagreFelt({ title: tittelUtkast.trim() || okt.ttl })}>{""}</Knapp>
        </div>
      ) : (
        <div
          onClick={kanRedigere ? () => { setTittelUtkast(okt.ttl); setRediger("tittel"); } : undefined}
          title={kanRedigere ? "Trykk for å endre tittel" : undefined}
          style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, marginTop: 9, cursor: kanRedigere ? "text" : "default" }}
        >
          {okt.ttl}
        </div>
      )}
      {rediger === "tid" ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
          <input type="time" value={tidUtkast} disabled={lagrerFelt} onChange={(e) => setTidUtkast(e.target.value)} style={{ ...inputStyle, width: 110 }} />
          <input type="number" min={5} max={480} step={5} value={durUtkast} disabled={lagrerFelt} onChange={(e) => setDurUtkast(Math.max(5, Math.min(480, Number(e.target.value) || okt.durMin)))} style={{ ...inputStyle, width: 84 }} />
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>min</span>
          <Knapp
            icon="check"
            disabled={lagrerFelt}
            onClick={() => {
              const [h, m] = tidUtkast.split(":").map(Number);
              lagreFelt({ hour: Math.max(0, Math.min(23, h || 0)), minute: Math.max(0, Math.min(59, m || 0)), durationMin: durUtkast });
            }}
          >{""}</Knapp>
        </div>
      ) : (
        <div
          onClick={kanRedigere ? () => { setTidUtkast(toKl(okt.h, okt.m)); setDurUtkast(okt.durMin); setRediger("tid"); } : undefined}
          title={kanRedigere ? "Trykk for å endre tid og varighet" : undefined}
          style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4, cursor: kanRedigere ? "pointer" : "default" }}
        >
          {toKl(okt.h, okt.m)} · {fmtVarighet(okt.durMin)}
          {okt.meta.filter(([ic]) => ic === "map-pin").map(([, t]) => ` · ${t}`).join("")}
        </div>
      )}

      {okt.id && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Exit til gjennomføring: Start (plan, via live-flyt) / Se økt (ferdig eller v2) */}
          {erPlan ? (
            ferdig ? (
              <Link href={planSessionStartHref(okt.id, status as Parameters<typeof planSessionStartHref>[1])} style={{ textDecoration: "none", display: "block" }}>
                <Knapp ghost icon="eye" full>Se økt</Knapp>
              </Link>
            ) : (
              <Knapp icon="play" full disabled={startLoading} onClick={startOkt}>
                {startLoading ? "Åpner…" : status === "ACTIVE" || status === "PAUSED" ? "Fortsett økt" : "Start økt"}
              </Knapp>
            )
          ) : (
            <Link
              href={v2SessionStartHref(okt.id, (status === "COMPLETED" ? "done" : status === "ACTIVE" ? "now" : "upcoming") satisfies V2OktUiStatus)}
              style={{ textDecoration: "none", display: "block" }}
            >
              <Knapp ghost icon={ferdig ? "eye" : "play"} full>{ferdig ? "Se økt" : "Åpne økt"}</Knapp>
            </Link>
          )}
        </div>
      )}

      {okt.id && feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down, display: "block", marginTop: 8 }}>{feil}</span>}

      {actions && okt.id && erPlan && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {flyttApen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <DagPillRow value={-1} onChange={flytt} disabled={flyttLoading} />
              <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>Velg ny dag — klokkeslettet beholdes</span>
            </div>
          )}
          {!bekreftSlett ? (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Knapp ghost icon="calendar" full disabled={flyttLoading} onClick={() => setFlyttApen((v) => !v)}>
                  {flyttApen ? "Lukk" : "Flytt"}
                </Knapp>
              </div>
              <div style={{ flex: 1 }}>
                <Knapp ghost icon="trash-2" full onClick={() => setBekreftSlett(true)}>
                  Slett
                </Knapp>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Knapp icon="trash-2" full disabled={sletterLoading} onClick={slett}>
                  {sletterLoading ? "Sletter…" : "Bekreft sletting"}
                </Knapp>
              </div>
              <div style={{ flex: 1 }}>
                <Knapp ghost full disabled={sletterLoading} onClick={() => setBekreftSlett(false)}>
                  Avbryt
                </Knapp>
              </div>
            </div>
          )}
        </div>
      )}
    </Kort>
  );
}
