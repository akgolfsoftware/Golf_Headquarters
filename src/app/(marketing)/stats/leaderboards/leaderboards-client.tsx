"use client";

/**
 * Leaderboards Client Components — søkeboks og sticky kategori-strip
 */

import { useState } from "react";
import { StatsIcon } from "@/components/stats/icon";

function SearchBox() {
  const [query, setQuery] = useState("");

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const SUGGESTIONS = ["drive", "sg total", "forbedring", "putting", "fairway", "gir", "scoring"];
  const filtered = query.trim()
    ? SUGGESTIONS.filter((s) => s.includes(query.toLowerCase()))
    : [];

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--s-card)",
          border: "1px solid var(--s-border)",
          borderRadius: 999,
          padding: "12px 20px",
          boxShadow: "var(--s-shadow-sm)",
        }}
      >
        <StatsIcon name="Search" size={16} style={{ color: "var(--s-muted-fg)", flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk i leaderboards — «drive», «sg total», «forbedring»…"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 14,
            fontFamily: "inherit",
            color: "var(--s-fg)",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--s-muted-fg)",
              padding: 0,
            }}
          >
            <StatsIcon name="X" size={14} />
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "var(--s-card)",
            border: "1px solid var(--s-border)",
            borderRadius: "var(--s-r-md)",
            boxShadow: "var(--s-shadow-md)",
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          {filtered.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery("");
                const map: Record<string, string> = {
                  drive: "pga",
                  "sg total": "pga",
                  forbedring: "norske",
                  putting: "pga",
                  fairway: "pga",
                  gir: "pga",
                  scoring: "pga",
                };
                scroll(map[s] ?? "pga");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 2,
                  background: "var(--s-accent)",
                  flexShrink: 0,
                }}
              />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const KATEGORIER = [
  { id: "pga", label: "PGA Tour" },
  { id: "korn-ferry", label: "Korn Ferry" },
  { id: "norske", label: "Norske" },
  { id: "klubber", label: "Klubber" },
  { id: "kuriositeter", label: "Kuriositeter" },
];

function KategoriStrip() {
  const [aktiv, setAktiv] = useState("pga");

  const klikk = (id: string) => {
    setAktiv(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "var(--s-bg)",
        borderBottom: "1px solid var(--s-border)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          padding: "0 48px",
          gap: 0,
          minWidth: "max-content",
        }}
      >
        {KATEGORIER.map((k) => {
          const isAktiv = aktiv === k.id;
          return (
            <button
              key={k.id}
              onClick={() => klikk(k.id)}
              style={{
                padding: "14px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: isAktiv ? 600 : 400,
                color: isAktiv ? "var(--s-fg)" : "var(--s-muted-fg)",
                background: "transparent",
                border: "none",
                borderBottom: isAktiv ? "2.5px solid var(--s-accent)" : "2.5px solid transparent",
                cursor: "pointer",
                transition: "all .15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {k.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const StatsLeaderboardsClient = { SearchBox, KategoriStrip };
