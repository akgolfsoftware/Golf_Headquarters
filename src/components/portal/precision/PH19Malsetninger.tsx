"use client";

/**
 * PH-19 Målsetninger — Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx og ui_kits/toppidrett/MalScreen.jsx
 *
 * «Mål» heter Målsetninger.
 * Talentradar vises aldri for spilleren.
 */

import Link from "next/link";
import { ArrowLeft, ChevronRight, Plus, Sparkles, Target, Trophy } from "lucide-react";
import { Ikon, StatusPille, TomTilstand } from "@/components/precision/pa";
import type { PH19Goal, PH19MalData } from "@/lib/portal-mal/ph19-mal-data";
import { formatDesimal } from "@/lib/portal-mal/ph19-mal-data";

export type PH19MalsetningerProps = {
  data: PH19MalData;
  visIup?: boolean;
  state?: "data" | "tom" | "laster" | "feil";
  onRetry?: () => void;
};

function toneForStatus(status: PH19Goal["status"], pct: number): "ok" | "warn" | "neutral" {
  if (status === "achieved" || (status === "on-track" && pct >= 80)) return "ok";
  if (status === "behind") return "warn";
  return "neutral";
}

export function PH19Malsetninger({
  data,
  visIup,
  state = data.goals.length === 0 ? "tom" : "data",
  onRetry,
}: PH19MalsetningerProps) {
  if (state === "laster") {
    return (
      <div className="pa-side" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880, margin: "0 auto" }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Plan › Workbench · Målsetning</span>
          <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: 0 }}>Målsetninger</h1>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>Henter målsetningene …</p>
        </header>
        <div className="pa-card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ font: "var(--type-body-m)", color: "var(--text-secondary)" }}>Laster inn dine målsetninger …</p>
        </div>
      </div>
    );
  }

  if (state === "feil") {
    return (
      <div className="pa-side" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880, margin: "0 auto" }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Plan › Workbench · Målsetning</span>
          <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: 0 }}>Målsetninger</h1>
        </header>
        <div className="pa-card" style={{ padding: 32, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p style={{ font: "600 13px/1 var(--font-mono)", color: "var(--warn)" }}>FEIL 503 · MÅLSETNING</p>
          <h2 style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: 0 }}>Målsetningene kunne ikke hentes</h2>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>Ingenting er endret. Prøv igjen senere.</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="pa-btn pa-btn--secondary"
              style={{ marginTop: 8 }}
            >
              Prøv på nytt
            </button>
          )}
        </div>
      </div>
    );
  }

  const { antall, antallResultat, antallProsess, goals, milepael } = data;
  const erTom = state === "tom" || goals.length === 0;

  const grupper = [
    {
      kategori: "OUTCOME",
      label: "Resultatmål",
      forklaring: "Resultatet du arbeider mot i sesongen",
      goals: goals.filter((g) => g.category === "OUTCOME"),
    },
    {
      kategori: "PROCESS",
      label: "Prosessmål",
      forklaring: "Handlingene og treningsrutinene som fører deg dit",
      goals: goals.filter((g) => g.category === "PROCESS"),
    },
  ];

  return (
    <div className="pa-side" style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 880, margin: "0 auto", width: "100%" }}>
      {/* Toppseksjon med Kicker, Tittel og Handlinger */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Plan › Workbench · Målsetning</span>
            {antall > 0 && <StatusPille tone="ok">{antall} {antall === 1 ? "aktiv" : "aktive"}</StatusPille>}
          </div>
          <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: 0 }}>Målsetninger</h1>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
            Tegnes ferdig i Workbench i runde 29.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Link href="/portal/meg" className="pa-btn pa-btn--secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Ikon icon={ArrowLeft} size={15} name="arrow-left" />
            <span>Meg</span>
          </Link>
          <Link href="/portal/ai/mal-bygger" className="pa-btn pa-btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Ikon icon={Plus} size={15} name="plus" />
            <span>{goals.length === 0 ? "Sett første mål" : "Nytt mål"}</span>
          </Link>
        </div>
      </header>

      {/* Lenke til Workbench */}
      <Link
        href="/portal/planlegge/bygger"
        className="pa-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          textDecoration: "none",
          color: "inherit",
          border: "1px solid var(--border-hairline)",
        }}
      >
        <Ikon icon={Sparkles} size={18} name="sparkles" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <strong style={{ font: "var(--type-body-m)", fontWeight: 600, color: "var(--text-primary)" }}>Bygg treningsplan</strong>
          <small style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>Lag en plan i Workbench som følger målsetningene dine</small>
        </div>
        <Ikon icon={ChevronRight} size={16} name="chevron-right" />
      </Link>

      {/* Tom tilstand */}
      {erTom ? (
        <section aria-label="Ingen målsetninger" className="pa-card" style={{ padding: 32 }}>
          <TomTilstand
            icon={Target}
            title="Ingen målsetninger ennå"
            text="Lag målsetningene sammen med coachen i Workbench."
            actions={
              <Link href="/portal/planlegge/bygger" className="pa-btn pa-btn--primary">
                Åpne Workbench
              </Link>
            }
          />
        </section>
      ) : (
        <>
          {/* Oppsummering av tall */}
          <section
            aria-label="Måloppsummering"
            className="pa-card"
            style={{
              padding: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>RESULTATMÅL</span>
              <span style={{ font: "var(--type-metric)", color: "var(--text-primary)" }}>{antallResultat}</span>
              <small style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>Det du ønsker å oppnå</small>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>PROSESSMÅL</span>
              <span style={{ font: "var(--type-metric)", color: "var(--text-primary)" }}>{antallProsess}</span>
              <small style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>Gjentakende treninger og vaner</small>
            </div>
            {milepael && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Ikon icon={Trophy} size={12} name="trophy" /> SISTE MILEPÆL
                </span>
                <span style={{ font: "var(--type-body-m)", fontWeight: 600, color: "var(--text-primary)" }}>{milepael.tittel}</span>
                <small style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>{milepael.dato}</small>
              </div>
            )}
          </section>

          {/* Målsetningsgrupper */}
          {grupper.map((gruppe) => {
            if (gruppe.goals.length === 0) return null;
            return (
              <section key={gruppe.kategori} aria-label={gruppe.label} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div>
                    <h2 style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: 0 }}>{gruppe.label}</h2>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{gruppe.forklaring}</span>
                  </div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>{gruppe.goals.length} MÅL</span>
                </div>

                <div className="pa-card" style={{ padding: "8px 16px", display: "flex", flexDirection: "column" }}>
                  <div role="list">
                    {gruppe.goals.map((g, i) => (
                      <Link
                        key={g.id}
                        href={`/portal/mal/goal/${g.id}`}
                        role="listitem"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) auto",
                          gap: 16,
                          alignItems: "center",
                          minHeight: 64,
                          padding: "12px 0",
                          borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                          <span style={{ font: "500 15px/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>
                            {g.sentence || g.title}
                          </span>
                          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                            {g.src} · FRIST {g.due}
                          </span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                          <span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                            {formatDesimal(g.now)} {g.unit}
                          </span>
                          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                            MÅL {formatDesimal(g.target)}
                          </span>
                          <StatusPille tone={toneForStatus(g.status, g.pct)}>
                            {g.statusLabel} ({g.pct} %)
                          </StatusPille>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* Evaluering og sesongsjekk */}
      {visIup && (
        <div style={{ marginTop: 8 }}>
          <Link
            href="/portal/mal/evaluering"
            className="pa-btn pa-btn--secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span>Utviklingssjekk og sesongevaluering</span>
            <Ikon icon={ChevronRight} size={15} name="chevron-right" />
          </Link>
        </div>
      )}
    </div>
  );
}
