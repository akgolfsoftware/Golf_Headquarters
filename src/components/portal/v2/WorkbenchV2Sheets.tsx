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
import type { PlanStatus } from "@/generated/prisma/client";
import { fmtVarighet, toKl } from "@/lib/workbench/v2-format";
import { resolvePlanSessionLiveHref } from "@/lib/workbench/session-actions";
import { planSessionStartHref, v2SessionStartHref, type V2OktUiStatus } from "@/lib/portal/session-hrefs";

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
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
  publish: () => Promise<{ ok: boolean; error?: string; status?: PlanStatus }>;
  /** Kun spiller-rolle (Caddie-stub). Utelatt → knappen skjules. */
  suggestWeek?: (weekNumber: number) => Promise<{ ok: boolean; message?: string }>;
  /** Kun coach-rolle. Utelatt → knappen skjules. */
  duplicateWeek?: (weekOffset?: number) => Promise<{ ok: boolean; count?: number; error?: string }>;
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
  /** Forhåndsutfylling fra bibliotek-brikke (ett-klikks «legg til»). */
  defaultTitle?: string;
  defaultAkse?: AkseKey;
  defaultDurMin?: number;
  onLukk: () => void;
  onOpprett: (input: NyOktInput) => Promise<{ ok: boolean; error?: string }>;
}
export function NyOktArk({ defaultDayIndex, defaultTitle, defaultAkse, defaultDurMin, onLukk, onOpprett }: NyOktArkProps) {
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [dayIndex, setDayIndex] = useState(defaultDayIndex);
  const [akse, setAkse] = useState<AkseKey>(defaultAkse ?? "TEK");
  const [tid, setTid] = useState("09:00");
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AkseChip a={okt.eb as AkseKey} />
      </div>
      <div style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, marginTop: 9 }}>{okt.ttl}</div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4 }}>
        {toKl(okt.h, okt.m)} · {fmtVarighet(okt.durMin)}
        {okt.meta.filter(([ic]) => ic === "map-pin").map(([, t]) => ` · ${t}`).join("")}
      </div>

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
