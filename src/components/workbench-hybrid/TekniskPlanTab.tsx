"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { ArrowRight } from "lucide-react";
import type { TekniskPlanWorkbenchContext } from "@/lib/teknisk-plan/types";
import { FONT, WB } from "./theme";

type TekniskPlanTabProps = {
  ctx: TekniskPlanWorkbenchContext | null;
  playerId?: string;
  isCoach?: boolean;
  onGoToSession?: () => void;
};

function metricLabel(metric: string): string {
  const map: Record<string, string> = {
    dispersion_m_std: "Spredning",
    spin_axis_avg_deg: "Spin-akse",
    smash_factor_mean: "Smash factor",
    smash_factor_std: "Smash-stabilitet",
    carry_mean: "Carry",
    side_std: "Sidevariasjon",
  };
  return map[metric] ?? metric.replace(/_/g, " ");
}

export function TekniskPlanTab({
  ctx,
  playerId,
  isCoach,
  onGoToSession,
}: TekniskPlanTabProps): ReactElement {
  if (!ctx) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          color: WB.muted,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ margin: "0 0 8px", color: WB.text, fontWeight: 600 }}>Ingen aktiv teknisk plan</p>
          <p style={{ margin: 0, maxWidth: 320 }}>
            Opprett en plan fra coach, eller åpne plan-byggeren for å komme i gang.
          </p>
          <Link
            href="/portal/tren/teknisk-plan"
            style={{
              display: "inline-flex",
              marginTop: 16,
              alignItems: "center",
              gap: 6,
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: WB.lime,
              textDecoration: "none",
            }}
          >
            Åpne tekniske planer
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    );
  }

  const focusBar = ctx.weakestP ?? ctx.pStability.find((p) => p.hovedfokus) ?? ctx.pStability[0];
  const tmGoals = ctx.focusTasks.flatMap((t) => t.tmGoals).slice(0, 4);

  const planHref = isCoach && playerId
    ? `/admin/teknisk-plan/${playerId}`
    : `/portal/tren/teknisk-plan/${ctx.planId}`;

  return (
    <div
      className="wb-scroll"
      style={{
        flex: 1,
        overflow: "auto",
        padding: 16,
        display: "grid",
        gridTemplateColumns: "minmax(240px, 280px) 1fr minmax(200px, 240px)",
        gap: 16,
        minHeight: 0,
      }}
    >
      {/* Venstre: P-stabilitet */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 700, color: WB.text }}>
            Teknisk plan
          </span>
          <Link
            href={planHref}
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: WB.lime,
              textDecoration: "none",
            }}
          >
            Rediger
          </Link>
        </div>
        <div
          style={{
            background: WB.cardBg,
            border: `1px solid ${WB.innerBorder}`,
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: `1px solid ${WB.innerBorderSoft}`,
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: WB.muted,
            }}
          >
            Svingposisjon · stabilitet P1–P10
          </div>
          <div style={{ padding: "12px 10px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 64, marginBottom: 8 }}>
              {ctx.pStability.map((p) => (
                <div
                  key={p.pNummer}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "100%",
                    gap: 3,
                  }}
                  title={`${p.navn}: ${p.pct} %`}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(4, p.pct)}%`,
                      background: p.color,
                      borderRadius: "2px 2px 0 0",
                      minHeight: 4,
                    }}
                  />
                  <span style={{ fontFamily: FONT.mono, fontSize: 7, color: WB.muted3 }}>{p.label}</span>
                </div>
              ))}
            </div>
            {ctx.weakestP ? (
              <p style={{ margin: 0, fontSize: 11, color: WB.muted2, lineHeight: 1.5 }}>
                <strong style={{ color: WB.lime }}>{ctx.weakestP.pNummer}</strong> ({ctx.weakestP.navn}) er
                minst stabil — {ctx.weakestP.pct} % rep-mål.
              </p>
            ) : null}
          </div>
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: WB.muted }}>
          {ctx.repsCurrent.toLocaleString("nb-NO")} / {ctx.repsTarget.toLocaleString("nb-NO")} reps ·{" "}
          {ctx.progressPct} %
        </div>
      </div>

      {/* Senter: aktivt fokus */}
      <div>
        <div
          style={{
            background: WB.cardBg,
            border: `1px solid ${WB.innerBorder}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: `1px solid ${WB.innerBorderSoft}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: WB.muted,
                  marginBottom: 4,
                }}
              >
                Aktivt fokus · {focusBar?.pNummer ?? "—"}
              </div>
              <span style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 700, color: WB.text }}>
                {ctx.navn}
              </span>
            </div>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 999,
                background: WB.limeSoft,
                color: WB.lime,
              }}
            >
              {ctx.status === "ACTIVE" ? "I GANG" : ctx.status}
            </span>
          </div>

          {tmGoals.length > 0 ? (
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${WB.innerBorderSoft}` }}>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: WB.muted,
                  marginBottom: 8,
                }}
              >
                TrackMan-mål
              </div>
              {tmGoals.map((g) => {
                const pct = g.progressPct ?? 0;
                return (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: WB.muted2, width: 120, flexShrink: 0 }}>
                      {metricLabel(g.metric)}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 5,
                        borderRadius: 3,
                        background: WB.railBg,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.max(2, pct)}%`,
                          background: g.inTarget ? WB.ok : WB.warn,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 10,
                        fontWeight: 600,
                        color: WB.text,
                        minWidth: 72,
                        textAlign: "right",
                      }}
                    >
                      {g.currentValue?.toFixed(1) ?? "—"} / {g.targetValue}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: WB.muted,
                padding: "0 14px",
                marginBottom: 6,
              }}
            >
              Tildelte oppgaver
            </div>
            {ctx.focusTasks.length === 0 ? (
              <p style={{ padding: "8px 14px", margin: 0, fontSize: 12, color: WB.muted }}>
                Ingen oppgaver i fokusområdet ennå.
              </p>
            ) : (
              ctx.focusTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 14px",
                    borderBottom: `1px solid ${WB.hairlineSoft}`,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: t.progressPct >= 100 ? WB.limeSoft : WB.railBg,
                      color: t.progressPct >= 100 ? WB.lime : WB.muted,
                      fontFamily: FONT.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {t.progressPct >= 100 ? "✓" : `${t.progressPct}`}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: WB.text }}>{t.tittel}</div>
                    <div style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted3, marginTop: 2 }}>
                      {t.omraade} · {t.koller.join(", ")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Høyre: coach + CTA */}
      <div>
        {ctx.coachName ? (
          <div
            style={{
              background: WB.cardBg,
              border: `1px solid ${WB.innerBorder}`,
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: WB.muted,
                marginBottom: 8,
              }}
            >
              Coach · {ctx.coachName}
            </div>
            {ctx.coachNote ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: WB.muted2,
                  borderLeft: `2px solid ${WB.lime}`,
                  paddingLeft: 10,
                }}
              >
                {ctx.coachNote}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: WB.muted }}>Ingen coach-notat ennå.</p>
            )}
            {ctx.coachNoteDate ? (
              <div style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted3, marginTop: 8 }}>
                {ctx.coachNoteDate}
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onGoToSession}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 999,
            border: "none",
            background: WB.lime,
            color: WB.limeDark,
            fontFamily: FONT.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Gå til økt med dette fokus
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}