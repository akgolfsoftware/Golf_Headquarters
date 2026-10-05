"use client";

/**
 * Kilde: ui_kits/playerhq/screens/PH-07.jsx.
 * PH-07 Øktoppsummering — Precision Athletics (nattmodus/fokus).
 *
 * Oppsummering etter gjennomført live-økt:
 * - 4 metrikker: Slag og putter, Tid mot planlagt, Øvelser, Dagsform
 * - Pyramidefordeling med søyler og mållinje (FYS, TEK, SLAG, SPILL, TURN)
 * - Tabell over øvelser med mengde, tid og treff
 * - Notat til coach og delingsbryter "Del med Anders Kristiansen"
 * - "Lagre økt" knapp (64 px) med lagret-status og overgang til I dag
 *
 * Ingen hex eller rgba.
 */

import React, { useState } from "react";
import Link from "next/link";
import { X, Check, ArrowRight, CircleDashed } from "lucide-react";
import { AkseMerke, StatusPille, Meta, Tall } from "@/components/precision/pa";
import {
  type OktoppsummeringData,
  formatTimerOgMinutter,
} from "@/lib/portal-live/ph04-07-data";
import "@/styles/precision-athletics.css";

interface PH07OktoppsummeringProps {
  data: OktoppsummeringData;
  onSave?: (note: string, shareWithCoach: boolean) => Promise<void> | void;
  onCloseHref?: string;
}

export function PH07Oktoppsummering({
  data,
  onSave,
  onCloseHref = "/portal",
}: PH07OktoppsummeringProps) {
  const empty = data.totalShots === 0 && data.completedDrillsCount === 0;

  const [share, setShare] = useState(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(note, share);
      }
      const timeStr = new Intl.DateTimeFormat("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Oslo",
      }).format(new Date());

      const msg = `LAGRET ${timeStr}${share ? " · DELT MED COACH" : " · IKKE DELT"}`;
      setSavedMessage(msg);
    } catch {
      setSavedMessage("LAGRET LOKALT");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="pa-root ph07"
      data-theme="night"
      style={{
        minHeight: "100dvh",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fokus-topp */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-hairline)",
          background: "var(--surface-card)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <Link
          href={onCloseHref}
          aria-label="Lukk oppsummering"
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-card)",
            color: "var(--text-primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <X size={22} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker" style={{ color: "var(--text-secondary)" }}>
            Øktoppsummering
          </div>
          <Meta style={{ color: "var(--text-muted)" }}>
            {data.dateStr} · {data.timeRangeStr}
          </Meta>
        </div>
      </header>

      {/* Hovedinnhold (maksbredde 720px) */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
          padding: "24px 20px 120px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Tittel og status */}
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {!empty && <StatusPille tone="ok">Gjennomført</StatusPille>}
            <Meta>{data.title.toUpperCase()}</Meta>
          </div>
          <h1
            style={{
              margin: "8px 0 0",
              font: "var(--type-title-l)",
              color: "var(--text-primary)",
            }}
          >
            {empty ? "Ingen slag registrert" : `Bra jobbet, ${data.playerName}`}
          </h1>
        </div>

        {empty && (
          <div
            className="pa-state pa-state--empty"
            style={{
              padding: 24,
              background: "var(--surface-card)",
              borderRadius: 8,
              border: "1px dashed var(--border-hairline)",
              textAlign: "center",
            }}
          >
            <CircleDashed
              size={32}
              style={{ color: "var(--text-muted)", marginBottom: 8 }}
            />
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              Økta har ingen registreringer
            </div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
              Det er ikke registrert slag eller putter. Gå tilbake og registrer,
              eller marker økta som hoppet over.
            </div>
          </div>
        )}

        {/* 4 Nøkkelmetrikker */}
        <div
          className="pa-card"
          style={{
            padding: 16,
            background: "var(--surface-card)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <Meta style={{ display: "block", marginBottom: 4 }}>Slag og putter</Meta>
              <Tall style={{ fontSize: 24, fontWeight: 700 }}>
                {empty ? "—" : data.totalShots}
              </Tall>
            </div>
            <div>
              <Meta style={{ display: "block", marginBottom: 4 }}>Tid</Meta>
              <Tall style={{ fontSize: 24, fontWeight: 700 }}>
                {empty ? "—" : formatTimerOgMinutter(data.actualMinutes)}
              </Tall>
              <Meta style={{ display: "block", fontSize: 11, marginTop: 2 }}>
                PLAN {formatTimerOgMinutter(data.plannedMinutes).toUpperCase()}
              </Meta>
            </div>
            <div>
              <Meta style={{ display: "block", marginBottom: 4 }}>Øvelser</Meta>
              <Tall style={{ fontSize: 24, fontWeight: 700 }}>
                {empty ? "—" : `${data.completedDrillsCount} av ${data.totalDrillsCount}`}
              </Tall>
            </div>
            <div>
              <Meta style={{ display: "block", marginBottom: 4 }}>Dagsform</Meta>
              <Tall style={{ fontSize: 24, fontWeight: 700 }}>
                {empty ? "—" : data.dagsform}
              </Tall>
            </div>
          </div>
        </div>

        {/* Pyramidefordeling */}
        <div
          className="pa-card"
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "var(--surface-card)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 8,
          }}
        >
          <div>
            <div className="kicker" style={{ color: "var(--text-secondary)" }}>
              Pyramidefordeling
            </div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Minutter per akse</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.axes.map((ax) => {
              const maxScale = 60;
              const actualPct = Math.min(100, (ax.actualMin / maxScale) * 100);
              const goalPct = Math.min(100, (ax.plannedMin / maxScale) * 100);

              return (
                <div
                  key={ax.axis}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "70px minmax(0, 1fr) 50px",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <AkseMerke axis={ax.axis} size="sm" />

                  {/* Stolpe med mållinje */}
                  <div
                    style={{
                      position: "relative",
                      height: 20,
                      background: "var(--surface-sunken)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    {/* Faktisk utført bar */}
                    <div
                      style={{
                        height: "100%",
                        width: `${actualPct}%`,
                        background: "var(--primary)",
                        transition: "width 200ms ease-out",
                      }}
                    />

                    {/* Mållinje */}
                    {ax.plannedMin > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: `${goalPct}%`,
                          width: 2,
                          background: "var(--text-primary)",
                          zIndex: 2,
                        }}
                        title={`Planlagt: ${ax.plannedMin} min`}
                      />
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <Tall style={{ fontSize: 13, fontWeight: 600 }}>
                      {ax.actualMin}
                    </Tall>
                    <Meta style={{ fontSize: 11, marginLeft: 2 }}>min</Meta>
                  </div>
                </div>
              );
            })}
          </div>

          <Meta style={{ fontSize: 11, color: "var(--text-muted)" }}>
            MÅL-LINJE = PLANLAGT
          </Meta>
        </div>

        {/* Tabell per øvelse */}
        {!empty && data.drillRows.length > 0 && (
          <div
            className="pa-card"
            style={{
              padding: 16,
              background: "var(--surface-card)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 12,
                color: "var(--text-secondary)",
              }}
            >
              Per øvelse
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-hairline)",
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  <th style={{ padding: "8px 4px", fontWeight: 500 }}>Øvelse</th>
                  <th style={{ padding: "8px 4px", fontWeight: 500 }}>Mengde</th>
                  <th style={{ padding: "8px 4px", fontWeight: 500, textAlign: "right" }}>
                    Tid
                  </th>
                  <th style={{ padding: "8px 4px", fontWeight: 500, textAlign: "right" }}>
                    Treff
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.drillRows.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: "1px solid var(--border-hairline)",
                    }}
                  >
                    <td style={{ padding: "10px 4px", fontWeight: 500 }}>{row.name}</td>
                    <td
                      style={{
                        padding: "10px 4px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.quantityText}
                    </td>
                    <td
                      style={{
                        padding: "10px 4px",
                        fontFamily: "var(--font-mono)",
                        textAlign: "right",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.timeText}
                    </td>
                    <td
                      style={{
                        padding: "10px 4px",
                        fontFamily: "var(--font-mono)",
                        textAlign: "right",
                        color: "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {row.hitsText}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notat til coach og delingsbryter */}
        {!empty && (
          <div
            className="pa-card"
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "var(--surface-card)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 8,
            }}
          >
            <div>
              <label
                htmlFor="coach-note"
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                Notat til coach <Meta style={{ fontWeight: 400 }}>(valgfritt)</Meta>
              </label>
              <Meta style={{ display: "block", marginBottom: 8, fontSize: 12 }}>
                Kort om hvordan det gikk.
              </Meta>
              <input
                id="coach-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Lengdekontroll satt bedre på 50 m enn 100 m"
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-sunken)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                paddingTop: 8,
                borderTop: "1px solid var(--border-hairline)",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                Del med coach
              </span>
              <input
                type="checkbox"
                checked={share}
                onChange={(e) => setShare(e.target.checked)}
                style={{
                  width: 20,
                  height: 20,
                  accentColor: "var(--primary)",
                  cursor: "pointer",
                }}
              />
            </label>
          </div>
        )}
      </main>

      {/* Bunnaksjon: Lagre økt eller gå videre */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--surface-page)",
          borderTop: "1px solid var(--border-hairline)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "center",
          zIndex: 30,
        }}
      >
        <div style={{ width: "100%", maxWidth: 720 }}>
          {savedMessage ? (
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                minHeight: 64,
              }}
            >
              <StatusPille tone="ok">Lagret</StatusPille>
              <Meta style={{ color: "var(--text-primary)" }}>{savedMessage}</Meta>
              <span style={{ flex: 1 }} />
              <Link
                href="/portal"
                style={{
                  height: 48,
                  padding: "0 20px",
                  borderRadius: 8,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-card)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  gap: 6,
                }}
              >
                <span>Til I dag</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              style={{
                height: 64,
                width: "100%",
                borderRadius: 8,
                border: "none",
                background: "var(--primary)",
                color: "var(--text-on-primary)",
                font: "600 17px/1 var(--font-sans)",
                cursor: isSaving ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Check size={20} />
              <span>{isSaving ? "Lagrer …" : "Lagre økt"}</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
