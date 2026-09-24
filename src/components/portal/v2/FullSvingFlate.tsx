"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Full sving-flate — filter + TM-progresjon inne i teknisk plan (ikke egen app).
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { Caps, Kort, StatusPill, Icon } from "@/components/v2";
import { DispersionMap, DispersionBucketBar, type SigmaLevel } from "@/components/trackman/DispersionMap";
import type { DispersionMapResult, DispersionMapShot } from "@/lib/trackman/dispersion-map";

export type FullSvingTaskRad = {
  id: string;
  tittel: string;
  pNummer: string;
  koller: string[];
  goals: Array<{
    id: string;
    metric: string;
    baseline: number;
    target: number;
    current: number | null;
    progressPct: number | null;
    inTarget: boolean;
    lastUpdated: string | null;
  }>;
};

export type FullSvingFlateProps = {
  tasks: FullSvingTaskRad[];
  dispersion?: DispersionMapResult | null;
  latestSessionDate?: string | null;
  /** Når true, kalles onFilterChange for å skjule ikke-fullsving i listen under. */
  onFilterChange?: (onlyFullsving: boolean) => void;
};

const METRIC_LABEL: Record<string, string> = {
  smash_factor_mean: "Smash snitt",
  smash_factor_std: "Smash spredning",
  carry_mean: "Carry snitt",
  club_speed_mean: "Klubbhastighet",
  ball_speed_mean: "Ballhastighet",
  side_std: "Side spredning",
  club_path_mean: "Svingbane (path)",
  club_path_std: "Svingbane spredning",
  face_angle_mean: "Bladvinkel (face)",
  face_angle_std: "Bladvinkel spredning",
  face_to_path_mean: "Blad mot bane",
  face_to_path_std: "Blad mot bane spredning",
  attack_angle_mean: "Angrepsvinkel",
  attack_angle_std: "Angrepsvinkel spredning",
  launch_angle_mean: "Utgangsvinkel",
  launch_angle_std: "Utgangsvinkel spredning",
  spin_rate_mean: "Spinn",
  spin_rate_std: "Spinn spredning",
};

function metricLabel(m: string): string {
  return METRIC_LABEL[m] ?? m.replace(/_/g, " ");
}

export function FullSvingFlate({
  tasks,
  dispersion,
  latestSessionDate,
  onFilterChange,
}: FullSvingFlateProps) {
  const [onlyFullsving, setOnlyFullsving] = useState(false);
  const [selectedShot, setSelectedShot] = useState<DispersionMapShot | null>(null);
  const [sigma, setSigma] = useState<SigmaLevel>(1);
  const [visKart, setVisKart] = useState(true);

  const medMaal = useMemo(
    () => tasks.filter((t) => t.goals.length > 0),
    [tasks],
  );
  const medData = useMemo(
    () =>
      tasks.filter((t) => t.goals.some((g) => g.current != null)),
    [tasks],
  );

  if (tasks.length === 0) return null;

  const toggle = () => {
    const next = !onlyFullsving;
    setOnlyFullsving(next);
    onFilterChange?.(next);
  };

  return (
    <Kort>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <Caps size={9}>Full sving · teknisk plan</Caps>
          <p
            style={{
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
              color: TL.text,
              margin: "8px 0 0",
            }}
          >
            {tasks.length} fullsving-oppgave{tasks.length === 1 ? "" : "r"}
            {medData.length > 0
              ? ` · ${medData.length} med TrackMan-data`
              : " · ingen TrackMan-data ennå"}
          </p>
          <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: "4px 0 0" }}>
            {medMaal.length} med TM-mål · last opp TrackMan for å oppdatere «nå»
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={toggle}
            className="v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              borderRadius: 999,
              border: `1px solid ${onlyFullsving ? TL.fill : TL.hair}`,
              background: onlyFullsving ? "color-mix(in srgb, var(--tl-fill) 14%, transparent)" : TL.dim,
              color: TL.text,
              fontFamily: TL.font.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "8px 12px",
            }}
          >
            {onlyFullsving ? "Viser kun full sving" : "Filtrer: full sving"}
          </button>
          <Link
            href="/portal/mal/trackman"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 14px",
            }}
          >
            <Icon name="upload" size={14} />
            Importer TrackMan
          </Link>
        </div>
      </div>

      {dispersion && dispersion.shots.length > 0 ? (
        <div
          style={{
            marginTop: 16,
            borderRadius: TL.radius.card,
            border: `1px solid ${TL.hair}`,
            background: TL.dock,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div>
              <Caps size={9}>Automatisk TrackMan-spredning · {latestSessionDate ?? "Siste økt"}</Caps>
              <div
                style={{
                  fontFamily: TL.font.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: TL.text,
                  marginTop: 2,
                }}
              >
                {dispersion.n} slag registrert
                {dispersion.medianCarry != null ? ` · Median carry: ${dispersion.medianCarry} m` : ""}
                {dispersion.offlineBias != null
                  ? ` · Bias: ${dispersion.offlineBias > 0 ? "+" : ""}${dispersion.offlineBias} m ${dispersion.offlineBias > 0 ? "høyre" : dispersion.offlineBias < 0 ? "venstre" : "rett"}`
                  : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setSigma(sigma === 1 ? 2 : 1)}
                className="v2-focus"
                style={{
                  background: TL.dim,
                  border: `1px solid ${TL.hair}`,
                  borderRadius: 6,
                  color: TL.text,
                  fontFamily: TL.font.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                {sigma}σ ellipse
              </button>
              <button
                type="button"
                onClick={() => setVisKart(!visKart)}
                className="v2-focus"
                style={{
                  background: TL.dim,
                  border: `1px solid ${TL.hair}`,
                  borderRadius: 6,
                  color: TL.mute,
                  fontFamily: TL.font.mono,
                  fontSize: 10,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                {visKart ? "Skjul kart" : "Vis kart"}
              </button>
            </div>
          </div>

          {visKart && (
            <div style={{ maxWidth: 440, margin: "0 auto", width: "100%" }}>
              <DispersionMap
                shots={dispersion.shots}
                oneSigmaEllipse={dispersion.oneSigmaEllipse}
                twoSigmaEllipse={dispersion.twoSigmaEllipse}
                hasEllipse={dispersion.hasEllipse}
                sigma={sigma}
                selectedShotId={selectedShot?.id ?? null}
                onSelectShot={setSelectedShot}
                showBiasArrow={false}
                variant="approach"
                mode="satellite"
              />
              {dispersion.hasEllipse && (
                <div style={{ marginTop: 8 }}>
                  <DispersionBucketBar {...dispersion.bucketShare} />
                </div>
              )}
            </div>
          )}

          {dispersion.caddieSentence && (
            <p
              style={{
                fontFamily: TL.font.sans,
                fontSize: 12,
                color: TL.mute,
                textAlign: "center",
                margin: "10px 0 0",
                fontStyle: "italic",
              }}
            >
              {dispersion.caddieSentence}
            </p>
          )}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {tasks.slice(0, 8).map((t) => {
          const siste = t.goals
            .filter((g) => g.lastUpdated)
            .map((g) => g.lastUpdated!)
            .sort()
            .at(-1);
          return (
            <div
              key={t.id}
              style={{
                borderRadius: 12,
                border: `1px solid ${TL.hair}`,
                background: TL.dock,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: TL.font.mono,
                      fontSize: 10,
                      fontWeight: 700,
                      color: TL.mute,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t.pNummer}
                  </span>
                  <div
                    style={{
                      fontFamily: TL.font.sans,
                      fontSize: 14,
                      fontWeight: 700,
                      color: TL.text,
                      marginTop: 2,
                    }}
                  >
                    {t.tittel}
                  </div>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, marginTop: 2 }}>
                    {t.koller.join(", ") || "Alle køller"}
                    {siste ? ` · TM ${siste}` : ""}
                  </div>
                </div>
                {t.goals.some((g) => g.inTarget) && (
                  <StatusPill tone="up">I mål</StatusPill>
                )}
              </div>
              {t.goals.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {t.goals.map((g) => (
                    <div
                      key={g.id}
                      style={{
                        borderRadius: 8,
                        background: TL.dim,
                        padding: "8px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: TL.font.mono,
                          fontSize: 9,
                          fontWeight: 700,
                          color: TL.mute,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {metricLabel(g.metric)}
                      </div>
                      <div
                        style={{
                          fontFamily: TL.font.mono,
                          fontSize: 13,
                          fontWeight: 700,
                          color: TL.text,
                          marginTop: 4,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {g.current != null ? g.current : "—"}
                        <span style={{ color: TL.mute, fontWeight: 600, fontSize: 11 }}>
                          {" "}
                          / {g.target}
                        </span>
                      </div>
                      {g.progressPct != null && (
                        <div
                          style={{
                            marginTop: 6,
                            height: 4,
                            borderRadius: 999,
                            background: TL.hair,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, g.progressPct)}%`,
                              height: "100%",
                              background: g.inTarget ? TL.fill : TL.fill,
                              borderRadius: 999,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: "8px 0 0" }}>
                  Ingen TM-mål satt på denne oppgaven.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Kort>
  );
}
