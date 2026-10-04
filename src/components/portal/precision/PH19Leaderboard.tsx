"use client";

/**
 * PH19Leaderboard — Leaderboard og rangering i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 */

import Link from "next/link";
import { ArrowLeft, Lock, Trophy } from "lucide-react";
import { Ikon, StatusPille, TomTilstand } from "@/components/precision/pa";
import { formaterFortegn } from "@/lib/format-tall";
import type {
  LeaderboardTab,
  LeaderboardSgTab,
  LeaderboardV2Data,
} from "@/components/portal/v2/LeaderboardV2";

export type PH19LeaderboardProps = {
  data: LeaderboardV2Data;
};

const TABS: { key: LeaderboardTab; label: string; laast?: boolean }[] = [
  { key: "klubb", label: "Klubb" },
  { key: "venner", label: "Venner" },
  { key: "globalt", label: "Globalt", laast: true },
];

const SG_TABS: { key: LeaderboardSgTab; label: string }[] = [
  { key: "totalt", label: "Totalt" },
  { key: "approach", label: "Innspill" },
  { key: "short-game", label: "Nærspill" },
  { key: "putting", label: "Putting" },
];

function fmtSg(val: number | null): string {
  if (val == null) return "—";
  return formaterFortegn(val, 2);
}

export function PH19Leaderboard({ data }: PH19LeaderboardProps) {
  const { minRank, tab, sgTab, rader, meg } = data;

  return (
    <div className="pa-side" style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 880, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Målsetning › Rangering</span>
            <StatusPille tone="neutral">Siste 30 dager</StatusPille>
          </div>
          <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: 0 }}>Leaderboard</h1>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
            Rangering etter Strokes Gained mot scratch-spillere.
          </p>
        </div>
        <Link href="/portal/mal" className="pa-btn pa-btn--secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Ikon icon={ArrowLeft} size={15} name="arrow-left" />
          <span>Målsetninger</span>
        </Link>
      </header>

      {/* Gruppe-faner (Klubb, Venner, Globalt) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const aktiv = t.key === tab;
          if (t.laast) {
            return (
              <span
                key={t.key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px dashed var(--border-hairline)",
                  font: "var(--type-meta)",
                  color: "var(--text-muted)",
                }}
              >
                <Ikon icon={Lock} size={12} name="lock" />
                {t.label} (Tour)
              </span>
            );
          }
          return (
            <Link
              key={t.key}
              href={`/portal/mal/leaderboard?tab=${t.key}&sg=${sgTab}`}
              className={`pa-btn ${aktiv ? "pa-btn--primary" : "pa-btn--secondary"}`}
              style={{ borderRadius: 999, height: 34, fontSize: 13 }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* SG-kategori faner */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {SG_TABS.map((s) => {
          const aktiv = s.key === sgTab;
          return (
            <Link
              key={s.key}
              href={`/portal/mal/leaderboard?tab=${tab}&sg=${s.key}`}
              style={{
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 6,
                font: "var(--type-meta)",
                fontWeight: aktiv ? 600 : 400,
                color: aktiv ? "var(--text-primary)" : "var(--text-secondary)",
                background: aktiv ? "var(--surface-raised)" : "transparent",
                border: "1px solid",
                borderColor: aktiv ? "var(--border-strong)" : "transparent",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {/* Spillerens egen posisjon */}
      {meg && (
        <section
          aria-label="Din rangering"
          className="pa-card"
          style={{
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: "var(--surface-raised)",
            border: "2px solid var(--primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ font: "700 24px/1 var(--font-mono)", color: "var(--primary)" }}>
              #{minRank ?? "—"}
            </span>
            <div>
              <strong style={{ font: "var(--type-body-m)", color: "var(--text-primary)", display: "block" }}>
                {meg.navn} (Deg)
              </strong>
              <small style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                {meg.sub} · HCP {meg.hcp}
              </small>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ font: "700 18px/1 var(--font-mono)", color: meg.sg != null && meg.sg >= 0 ? "var(--ok)" : "var(--text-primary)", display: "block" }}>
              {fmtSg(meg.sg)}
            </span>
            <small style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
              {meg.runder} {meg.runder === 1 ? "runde" : "runder"}
            </small>
          </div>
        </section>
      )}

      {/* Leaderboard liste */}
      {rader.length === 0 ? (
        <div className="pa-card" style={{ padding: 32 }}>
          <TomTilstand
            icon={Trophy}
            title="Ingen runder registrert ennå"
            text="Logg din første 18-hulls runde for å bli med på lederkortet for din klubb."
            actions={
              <Link href="/portal/mal/runder/ny" className="pa-btn pa-btn--primary">
                Registrer runde
              </Link>
            }
          />
        </div>
      ) : (
        <section aria-label="Rangeringsliste" className="pa-card" style={{ padding: "8px 16px" }}>
          <div role="list">
            {rader.map((rad, i) => {
              const erMeg = rad.meg;
              return (
                <div
                  key={rad.id}
                  role="listitem"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                    fontWeight: erMeg ? 600 : 400,
                  }}
                >
                  <span style={{ font: "700 16px/1 var(--font-mono)", color: erMeg ? "var(--primary)" : "var(--text-secondary)" }}>
                    #{rad.rank}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ font: "var(--type-body-m)", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {rad.navn} {erMeg && "(Deg)"}
                    </span>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                      {rad.sub} · HCP {rad.hcp}
                    </span>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ font: "600 15px/1 var(--font-mono)", color: rad.sg != null && rad.sg >= 0 ? "var(--ok)" : "var(--text-primary)" }}>
                      {fmtSg(rad.sg)}
                    </span>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                      {rad.runder} {rad.runder === 1 ? "runde" : "runder"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
