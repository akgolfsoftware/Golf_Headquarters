"use client";

/**
 * StatsLeaderboardCard — dense 10-row mini-leaderboard
 * Used on /stats/leaderboards. Client for hover state.
 */

import { useState } from "react";
import { StatsIcon, type StatsIconName } from "./icon";
import Link from "next/link";

export interface LeaderboardRow {
  name: string;
  slug?: string;
  value: number | string;
}

interface StatsLeaderboardCardProps {
  title: string;
  sub?: string;
  rows: LeaderboardRow[];
  formatValue?: (v: number | string) => string;
  icon?: StatsIconName;
  seeAllHref?: string;
  /** If true, lower value = better (e.g. putts, scoring avg) */
  ascending?: boolean;
}

export function StatsLeaderboardCard({
  title,
  sub,
  rows,
  formatValue = (v) => String(v),
  icon,
  seeAllHref,
}: StatsLeaderboardCardProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const displayRows = rows.slice(0, 10);

  return (
    <div
      style={{
        background: "var(--s-card)",
        border: "1px solid var(--s-border)",
        borderRadius: "var(--s-r-lg)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 500,
            color: "var(--s-fg)",
          }}
        >
          {title}
        </span>
        {icon && (
          <StatsIcon name={icon} size={14} style={{ color: "var(--s-muted-fg)" }} />
        )}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--s-muted-fg)",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          {sub}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {displayRows.map((row, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1fr auto",
              gap: 10,
              padding: "7px 6px",
              borderBottom: i < displayRows.length - 1 ? "1px dashed var(--s-border)" : "none",
              alignItems: "center",
              fontSize: 13,
              borderRadius: 6,
              background: hoveredRow === i ? "var(--s-secondary)" : "transparent",
              transition: "background .12s ease",
              cursor: row.slug ? "pointer" : "default",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--s-muted-fg)",
              }}
            >
              {i + 1}
            </span>
            {row.slug ? (
              <Link
                href={`/stats/spillere/${row.slug}`}
                style={{
                  fontWeight: i < 3 ? 600 : 500,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {row.name}
              </Link>
            ) : (
              <span style={{ fontWeight: i < 3 ? 600 : 500 }}>{row.name}</span>
            )}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontVariantNumeric: "tabular-nums",
                fontSize: 13,
                fontWeight: 500,
                color: i < 3 ? "var(--s-primary)" : "inherit",
              }}
            >
              {formatValue(row.value)}
            </span>
          </div>
        ))}
      </div>

      {seeAllHref && (
        <Link
          href={seeAllHref}
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "var(--s-primary)",
            fontWeight: 500,
            textDecoration: "none",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
          }}
        >
          Se hele kategorien →
        </Link>
      )}
    </div>
  );
}
