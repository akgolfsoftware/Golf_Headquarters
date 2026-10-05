"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart2,
  ClipboardCheck,
  Compass,
  Flag,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  Ikon,
  KnappLenke,
  Sidehode,
  StatusPille,
  Meta,
  AkseMerke,
} from "@/components/precision/pa";
import { Bryter } from "@/components/precision/pa-a4";
import {
  formaterDesimal,
  formaterSg,
  beregnSpredning,
  MIN_RUNDER_FOR_KONKLUSJON,
  type StatsFane,
  type PH16StatsData,
  type SgRad,
} from "@/lib/portal-analyse/ph16-stats-data";

export interface PH16StatsProps {
  data: PH16StatsData;
  aktivFane?: StatsFane;
  initialFane?: StatsFane;
  pgaTourInit?: boolean;
}

const FANER: ReadonlyArray<{ id: StatsFane; tittel: string; ikon: typeof Flag; ikonNavn: string }> = [
  { id: "snitt", tittel: "Snittscore", ikon: Flag, ikonNavn: "flag" },
  { id: "sg", tittel: "Strokes Gained", ikon: BarChart2, ikonNavn: "bar-chart-2" },
  { id: "tren", tittel: "Trening", ikon: Activity, ikonNavn: "activity" },
  { id: "test", tittel: "Tester", ikon: ClipboardCheck, ikonNavn: "clipboard-check" },
];

export function PH16Stats({
  data: d,
  aktivFane,
  initialFane = "snitt",
  pgaTourInit = false,
}: PH16StatsProps) {
  const [fane, setFane] = useState<StatsFane>(aktivFane ?? initialFane);
  const [pgaTour, setPgaTour] = useState<boolean>(pgaTourInit);
  const [valgtKolle, setValgtKolle] = useState<string | null>(d.trening.trackman.koller[0] ?? null);

  const alleSgRader: SgRad[] = d.sg.flatMap((g) => g.rows);
  const sgVerdi = (r: SgRad) => (pgaTour ? r.pga : r.c);

  // Finn beste forbedring og største tap — bare målte verdier
  const bestTrend = [...alleSgRader]
    .filter((r) => r.d != null && r.d > 0)
    .sort((a, b) => (b.d ?? 0) - (a.d ?? 0))[0];

  const storsteTap = alleSgRader
    .filter((r): r is SgRad => sgVerdi(r) != null)
    .sort((a, b) => (sgVerdi(a) as number) - (sgVerdi(b) as number))
    .slice(0, 3);

  // TrackMan for valgt kølle
  const tmKolle = valgtKolle ? d.trening.trackman.data[valgtKolle] ?? null : null;
  const tmSpredning = tmKolle ? beregnSpredning(tmKolle.shots) : null;

  const antallSnitt = d.spiller.antallSnittRunder;
  const manglerRunder = Math.max(0, MIN_RUNDER_FOR_KONKLUSJON - antallSnitt);

  const curFane = FANER.find((f) => f.id === fane) ?? FANER[0];

  return (
    <div className="pa-side" style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px" }}>
      {/* Sidehode med handling */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <Sidehode
            kicker={`Stats · ${curFane.tittel}`}
            title="Stats"
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <KnappLenke
            variant="secondary"
            icon={Flag}
            iconName="flag"
            href="/portal/mal/runder/ny"
          >
            Registrer runde
          </KnappLenke>
        </div>
      </div>

      {/* 4 Faner (Tablist) */}
      <div
        role="tablist"
        aria-label="Stats faner"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {FANER.map((it) => {
          const erAktiv = fane === it.id;
          return (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={erAktiv}
              onClick={() => setFane(it.id)}
              style={{
                minHeight: 48,
                borderRadius: "var(--radius)",
                border: "1px solid " + (erAktiv ? "var(--border-ink)" : "var(--border-hairline)"),
                background: erAktiv ? "var(--primary)" : "var(--surface-card)",
                color: erAktiv ? "var(--text-on-primary)" : "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                font: "600 14px/1.2 var(--font-sans)",
                cursor: "pointer",
                padding: "0 12px",
                transition: "background var(--dur-base) var(--ease-out)",
              }}
            >
              <Ikon icon={it.ikon} size={16} name={it.ikonNavn} />
              <span>{it.tittel}</span>
            </button>
          );
        })}
      </div>

      {/* Øverst nå: Positiv trend og flest tapte slag */}
      <div
        className="pa-card"
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <span className="kicker">Øverst nå</span>
        {bestTrend && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "4px 0 8px",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                background: "var(--surface-sunken)",
                color: "var(--text-primary)",
                flex: "none",
              }}
            >
              <Ikon icon={TrendingUp} size={16} name="trending-up" />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  font: "600 15px/1.3 var(--font-sans)",
                  color: "var(--text-primary)",
                }}
              >
                {bestTrend.label}: {formaterSg(bestTrend.d)} slag per runde
              </span>
              <Meta>SISTE 10 RUNDER MOT DE 10 FØR</Meta>
            </div>
          </div>
        )}

        <div
          style={{
            borderTop: "1px solid var(--border-hairline)",
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                font: "600 13px/1.3 var(--font-sans)",
                color: "var(--text-secondary)",
              }}
            >
              Flest tapte slag
            </span>
            <Meta>
              PER RUNDE MOT {pgaTour ? "PGA TOUR" : "NESTE KATEGORI"}
            </Meta>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {storsteTap.length === 0 && (
              <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                {pgaTour
                  ? `— · Strokes Gained vises når minst ${MIN_RUNDER_FOR_KONKLUSJON} runder har målt SG.`
                  : "— · Referanse ikke satt for neste kategori."}
              </span>
            )}
            {storsteTap.map((r, i) => {
              const tapVerdi = sgVerdi(r);
              return (
                <div
                  key={r.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 12,
                    padding: "6px 0",
                    borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                  }}
                >
                  <Meta>{i + 1}</Meta>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      style={{
                        font: "500 14px/1.3 var(--font-sans)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {r.label}
                    </span>
                    <Meta>{r.n} RUNDER I GRUNNLAGET</Meta>
                  </div>
                  <span
                    style={{
                      font: "600 15px/1 var(--font-mono)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formaterSg(tapVerdi)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sammenligningsvelger (vises for relevante faner) */}
      {(fane === "snitt" || fane === "sg") && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
            padding: "10px 16px",
            background: "var(--surface-sunken)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border-hairline)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                font: "500 14px/1.3 var(--font-sans)",
                color: "var(--text-primary)",
              }}
            >
              Sammenligner mot {pgaTour ? "PGA Tour" : "Neste kategori"}
            </span>
            <Meta>
              {pgaTour
                ? "SG-REFERANSE PGA TOUR · SISTE 10 RUNDER"
                : "REFERANSE IKKE SATT · A–K-NIVÅENE ER IKKE VEDTATT"}
            </Meta>
          </div>
          <Bryter
            checked={pgaTour}
            onChange={(v) => setPgaTour(v)}
            label="Sammenlign med PGA Tour"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* FANE 1: SNITTSCORE */}
      {/* ========================================================================= */}
      {fane === "snitt" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Kategori A–K kort */}
          <div
            className="pa-card"
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span className="kicker">Kategori A–K</span>
              <Meta>
                {antallSnitt} AV 10 SISTE 18-HULLSRUNDER · BRUTTO SCORE
                {d.spiller.snittBrutto != null && antallSnitt < 8 ? " · FORELØPIG" : ""}
              </Meta>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  font: "600 44px/1 var(--font-mono)",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {formaterDesimal(d.spiller.snittBrutto, 1)}
              </span>
              <span
                style={{
                  font: "500 15px/1.3 var(--font-sans)",
                  color: "var(--text-secondary)",
                }}
              >
                slag i snitt · Kategori {d.spiller.kategori ?? "—"}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                font: "600 16px/1.35 var(--font-sans)",
                color: "var(--text-primary)",
              }}
            >
              {manglerRunder > 0
                ? `Registrer ${manglerRunder} ${manglerRunder === 1 ? "runde" : "runder"} til før snittet vises`
                : d.spiller.nesteKategori != null && d.spiller.slagTilNesteKategori != null
                ? `${formaterDesimal(d.spiller.slagTilNesteKategori, 1)} slag til Kategori ${d.spiller.nesteKategori}`
                : "Referanse ikke satt"}
            </p>

            {/* Skala for Kategori A–K — nivåtallene er ikke vedtatt, derfor ingen grenser */}
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  display: "flex",
                  gap: 2,
                  height: 24,
                  borderRadius: "var(--radius-inner)",
                  overflow: "hidden",
                }}
              >
                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].map((kat) => {
                  const erMin = kat === d.spiller.kategori;
                  const erNeste = kat === d.spiller.nesteKategori;
                  return (
                    <span
                      key={kat}
                      style={{
                        flex: 1,
                        display: "grid",
                        placeItems: "center",
                        background: erMin
                          ? "var(--primary)"
                          : erNeste
                          ? "var(--graphite-400)"
                          : "var(--surface-sunken)",
                        color: erMin || erNeste ? "var(--text-on-primary)" : "var(--text-muted)",
                        font: "600 11px/1 var(--font-sans)",
                      }}
                    >
                      {kat}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Runder liste */}
          <div
            className="pa-card"
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span className="kicker">Runder</span>
              <Meta>10 SISTE RUNDER · BRUTTO SCORE</Meta>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {d.runder.length === 0 && (
                <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                  Ingen runder registrert ennå.
                </span>
              )}
              {d.runder.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/portal/mal/runder/${r.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto auto",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          font: "600 15px/1.3 var(--font-sans)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {r.course}
                      </span>
                      {r.kind && (
                        <StatusPille tone={r.kind === "Turnering" ? "ok" : "neutral"}>
                          {r.kind}
                        </StatusPille>
                      )}
                    </div>
                    <Meta>
                      {r.date} · PAR {r.par ?? "—"}
                    </Meta>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        font: "600 17px/1 var(--font-mono)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {r.score}
                    </span>
                    <Meta style={{ display: "block" }}>
                      {r.diff == null
                        ? "—"
                        : r.diff === 0
                        ? "E"
                        : r.diff > 0
                        ? `+${r.diff}`
                        : `−${Math.abs(r.diff)}`}
                    </Meta>
                  </div>

                  <Ikon icon={ArrowRight} size={16} name="arrow-right" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FANE 2: STROKES GAINED */}
      {/* ========================================================================= */}
      {fane === "sg" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Snarvei til Skill map */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              padding: "12px 16px",
              background: "var(--surface-card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Ikon icon={Compass} size={20} name="compass" />
              <div>
                <span
                  style={{
                    font: "600 14px/1.3 var(--font-sans)",
                    color: "var(--text-primary)",
                  }}
                >
                  Skill map
                </span>
                <p
                  style={{
                    margin: 0,
                    font: "var(--type-body-s)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Se alle Strokes Gained-områdene plassert på en skjematisk hullskisse.
                </p>
              </div>
            </div>
            <KnappLenke
              variant="secondary"
              size="sm"
              icon={MapPin}
              iconName="map-pin"
              href="/portal/analysere/skill-map"
            >
              Se som kart
            </KnappLenke>
          </div>

          {/* 4 kategorier: Tee, Innspill, Nærspill, Putting */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              alignItems: "start",
            }}
          >
            {d.sg.map((gruppe) => {
              // Summen vises bare når alle områdene i gruppa er målt; ellers ville den vært for lav.
              const gruppeVerdier = gruppe.rows.map(sgVerdi);
              const gruppeSum = gruppeVerdier.every((v): v is number => v != null)
                ? Math.round(gruppeVerdier.reduce((sum, v) => sum + v, 0) * 10) / 10
                : null;
              return (
                <div
                  key={gruppe.g}
                  className="pa-card"
                  style={{
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="kicker">{gruppe.label}</span>
                    <span
                      style={{
                        font: "600 15px/1 var(--font-mono)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {formaterSg(gruppeSum)}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {gruppe.rows.map((r, i) => {
                      const v = sgVerdi(r);
                      return (
                        <div
                          key={r.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            paddingTop: i > 0 ? 8 : 0,
                            borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "minmax(0, 1.2fr) minmax(60px, 1fr) auto",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span
                                style={{
                                  font: "500 14px/1.3 var(--font-sans)",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {r.label}
                              </span>
                              <Meta>{r.n} RUNDER</Meta>
                            </div>

                            {/* SG bar */}
                            <div
                              aria-hidden="true"
                              style={{
                                position: "relative",
                                height: 8,
                                background: "var(--surface-sunken)",
                                borderRadius: 4,
                                overflow: "hidden",
                              }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  left: "50%",
                                  top: 0,
                                  bottom: 0,
                                  width: 2,
                                  background: "var(--text-muted)",
                                }}
                              />
                              {v != null && v !== 0 && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    bottom: 0,
                                    left: v < 0 ? `${50 - Math.min(50, Math.abs(v) * 40)}%` : "50%",
                                    width: `${Math.min(50, Math.abs(v) * 40)}%`,
                                    background: "var(--primary)",
                                  }}
                                />
                              )}
                            </div>

                            <span
                              style={{
                                font: "600 14px/1 var(--font-mono)",
                                color: "var(--text-primary)",
                                minWidth: 40,
                                textAlign: "right",
                              }}
                            >
                              {formaterSg(v)}
                            </span>
                          </div>

                          {pgaTour && r.prox && (
                            <span
                              style={{
                                font: "var(--type-meta)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              Nærhet: PGA {formaterDesimal(r.prox[1], 1)} m · Du {formaterDesimal(r.prox[0], 1)} m
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FANE 3: TRENING (TrackMan & Volum) */}
      {/* ========================================================================= */}
      {fane === "tren" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Pyramidefordeling */}
          <div
            className="pa-card"
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span className="kicker">Treningsfordeling</span>
              <Meta>{d.trening.pyramide.src}</Meta>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  font: "600 36px/1 var(--font-mono)",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {d.trening.pyramide.totalHours == null
                  ? "—"
                  : `${formaterDesimal(d.trening.pyramide.totalHours, 1)} t`}
              </span>
              <span
                style={{
                  font: "500 14px/1.3 var(--font-sans)",
                  color: "var(--text-secondary)",
                }}
              >
                totalt registrert siste 8 uker
              </span>
            </div>

            {/* Pyramideakser */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: 8,
                marginTop: 4,
              }}
            >
              {d.trening.pyramide.rows.length === 0 && (
                <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                  — · Fordelingen per akse vises når øktloggen er koblet til Stats.
                </span>
              )}
              {d.trening.pyramide.rows.map(([akse, pst, timer]) => (
                <div
                  key={akse}
                  style={{
                    padding: 10,
                    borderRadius: "var(--radius)",
                    background: "var(--surface-sunken)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <AkseMerke axis={akse} size="sm" />
                  <span
                    style={{
                      font: "600 16px/1 var(--font-mono)",
                      color: "var(--text-primary)",
                      marginTop: 4,
                    }}
                  >
                    {pst} %
                  </span>
                  <Meta>{formaterDesimal(timer, 1)} timer</Meta>
                </div>
              ))}
            </div>
          </div>

          {/* TrackMan-spredningskart og parametere */}
          <div
            className="pa-card"
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span className="kicker">TrackMan · Slag og spredning</span>
              {/* Køllevelger */}
              <div className="pa-seg" role="group" aria-label="Velg kølle" style={{ flexWrap: "wrap" }}>
                {d.trening.trackman.koller.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="pa-seg__opt"
                    aria-pressed={valgtKolle === k}
                    onClick={() => setValgtKolle(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {!tmKolle || !tmSpredning ? (
              <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                — · Ingen TrackMan-slag registrert ennå.
              </span>
            ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
                alignItems: "center",
              }}
            >
              {/* SVG Spredningskart */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <svg
                  role="img"
                  aria-label={`Spredning for ${valgtKolle}: ${tmKolle.antallSlag} slag`}
                  viewBox="0 0 240 240"
                  style={{
                    width: "100%",
                    maxWidth: 240,
                    height: "auto",
                    display: "block",
                    background: "var(--surface-sunken)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border-hairline)",
                  }}
                >
                  {/* Senterlinjer */}
                  <line x1="120" y1="0" x2="120" y2="240" stroke="var(--border-hairline)" />
                  <line x1="0" y1="120" x2="240" y2="120" stroke="var(--border-hairline)" />

                  {/* 2 SD Ellipse */}
                  <ellipse
                    cx={120 + tmSpredning.mx * 10}
                    cy={120}
                    rx={Math.max(10, tmSpredning.sdx * 14)}
                    ry={Math.max(10, tmSpredning.sdy * 4)}
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeDasharray="4 3"
                  />

                  {/* Slagpunkter */}
                  {tmKolle.shots.map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={120 + x * 10}
                      cy={120 - (y - tmSpredning.my) * 3}
                      r="3.5"
                      fill="var(--text-primary)"
                      fillOpacity="0.75"
                    />
                  ))}
                </svg>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    maxWidth: 240,
                  }}
                >
                  <Meta>SIDE ±{formaterDesimal(tmSpredning.sdx, 1)} M</Meta>
                  <Meta>LENGDE ±{formaterDesimal(tmSpredning.sdy, 1)} M</Meta>
                  <Meta>2 SD</Meta>
                </div>
              </div>

              {/* Parametertabell */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    font: "600 13px/1.3 var(--font-sans)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Nøkkelparametre ({tmKolle.antallSlag} slag)
                </span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {tmKolle.params.map((p, i) => (
                    <div
                      key={p.navn}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.2fr) auto auto",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 0",
                        borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                      }}
                    >
                      <span
                        style={{
                          font: "500 14px/1.3 var(--font-sans)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {p.navn}
                      </span>
                      <span
                        style={{
                          font: "600 14px/1 var(--font-mono)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {formaterDesimal(p.snitt, 1)} {p.enhet}
                      </span>
                      <Meta>{p.mal ? `MÅL ${p.mal}` : "—"}</Meta>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FANE 4: TESTER */}
      {/* ========================================================================= */}
      {fane === "test" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
          {d.tester.length === 0 && (
            <div
              className="pa-card"
              style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}
            >
              <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                — · Testresultatene vises i testbatteriet til de er koblet til Stats.
              </span>
              <KnappLenke variant="secondary" size="sm" href="/portal/tren/tester">
                Gå til tester
              </KnappLenke>
            </div>
          )}
          {d.tester.map((t) => {
            const sistVerdi = t.hist[t.hist.length - 1];
            const sistDato = t.dates[t.dates.length - 1];
            return (
              <div
                key={t.id}
                className="pa-card"
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="kicker">{t.by}</span>
                  <AkseMerke axis={t.axis} size="sm" />
                </div>

                <div>
                  <span
                    style={{
                      font: "600 16px/1.3 var(--font-sans)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {t.name}
                  </span>
                  <Meta style={{ display: "block", marginTop: 2 }}>{t.sub}</Meta>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      font: "600 28px/1 var(--font-mono)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formaterDesimal(sistVerdi, t.unit.includes("mph") ? 1 : 0)}
                  </span>
                  <span
                    style={{
                      font: "500 14px/1 var(--font-sans)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.unit}
                  </span>
                </div>

                <Meta>
                  SIST: {sistDato}
                  {t.norm != null && ` · NORM: ${t.norm} ${t.unit}`}
                </Meta>

                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  <KnappLenke
                    variant="secondary"
                    size="sm"
                    fullWidth
                    href="/portal/tren/tester"
                  >
                    Se testdetaljer
                  </KnappLenke>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
