"use client";

/**
 * StatsSesongVelger — sticky horizontal pill selector for tour seasons
 * Client component (manages active state).
 */

import { useState } from "react";

interface StatsSesongVelgerProps {
  sesonger: number[];
  defaultSesong?: number;
  onChangeSesong?: (aar: number) => void;
}

export function StatsSesongVelger({
  sesonger,
  defaultSesong,
  onChangeSesong,
}: StatsSesongVelgerProps) {
  const [aktiv, setAktiv] = useState(defaultSesong ?? sesonger[sesonger.length - 1]);

  const velg = (aar: number) => {
    setAktiv(aar);
    onChangeSesong?.(aar);
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 64,
        zIndex: 20,
        background: "var(--s-bg)",
        borderBottom: "1px solid var(--s-border)",
        padding: "12px 0",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--s-muted-fg)",
            whiteSpace: "nowrap",
            marginRight: 4,
          }}
        >
          Sesong:
        </span>
        {sesonger.map((aar) => {
          const isAktiv = aktiv === aar;
          return (
            <button
              key={aar}
              onClick={() => velg(aar)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.06em",
                fontWeight: isAktiv ? 600 : 400,
                padding: "6px 14px",
                borderRadius: 999,
                border: isAktiv ? "1.5px solid var(--s-primary)" : "1px solid var(--s-border)",
                background: isAktiv ? "var(--s-primary)" : "transparent",
                color: isAktiv ? "var(--s-primary-fg)" : "var(--s-fg)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all .15s ease",
              }}
            >
              {aar}
            </button>
          );
        })}
      </div>
    </div>
  );
}
