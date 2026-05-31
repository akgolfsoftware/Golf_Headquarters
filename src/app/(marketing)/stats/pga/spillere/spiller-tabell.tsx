"use client";

/**
 * SpillerTabell — søk, tour-filter, sortering, paginering (50/side)
 * Dense tabular layout etter design 21.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import type { FlagCode } from "@/components/stats/flag-glyph";
import { Reveal } from "@/components/stats/reveal";

export type SpillerRad = {
  dgId: number;
  navn: string;
  land: string;
  tour: string;
  runder: number;
  sgTotal: number;
  drive: number;
  fairway: number;
  gir: number;
  scoring: number;
};

const TOURS = ["Alle", "PGA", "EURO", "KFT"];
// Kun SG Total er ekte/meningsfull i DataGolf-dataen — rå-stats (drive/fairway/
// gir/scoring) er relative ratings eller null, så de er fjernet fra tabellen.
const SORT_OPTIONS = [{ id: "sgTotal", label: "SG Total" }] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["id"];

const PAGE_SIZE = 50;

interface Props {
  spillere: SpillerRad[];
}

export function SpillerTabell({ spillere }: Props) {
  const [query, setQuery] = useState("");
  const [tour, setTour] = useState("Alle");
  const [sortBy, setSortBy] = useState<SortKey>("sgTotal");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let res = [...spillere];
    if (tour !== "Alle") {
      res = res.filter((s) => s.tour.toUpperCase() === tour);
    }
    if (query) {
      const q = query.toLowerCase();
      res = res.filter((s) => s.navn.toLowerCase().includes(q));
    }
    res.sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
    return res;
  }, [spillere, tour, query, sortBy]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page on filter change
  const handleTour = (t: string) => { setTour(t); setPage(0); };
  const handleSort = (s: SortKey) => { setSortBy(s); setPage(0); };
  const handleQuery = (q: string) => { setQuery(q); setPage(0); };

  return (
    <Reveal>
      {/* Filter row */}
      <div className="spillere-filter-row">
        <input
          type="search"
          className="spillere-searchbox"
          placeholder="Søk spiller — «McIlroy», «Hovland»…"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
        />
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div className="spillere-chips">
            <span className="spillere-chip-label">Tour</span>
            {TOURS.map((t) => (
              <button
                key={t}
                className={`spillere-chip${tour === t ? " active" : ""}`}
                onClick={() => handleTour(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="spillere-chips">
            <span className="spillere-chip-label">Sortér etter</span>
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.id}
                className={`spillere-chip${sortBy === o.id ? " active" : ""}`}
                onClick={() => handleSort(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="spillere-dtable">
        <thead>
          <tr>
            <th>#</th>
            <th>Spiller</th>
            <th>Land</th>
            <th>Tour</th>
            <th className="num">Runder</th>
            <th className="num">SG Total</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((s, i) => {
            const globalRank = page * PAGE_SIZE + i + 1;
            const erNorsk = s.land === "no";
            return (
              <tr key={s.dgId} className={erNorsk ? "norsk-row" : ""}>
                <td
                  className="mono"
                  style={{
                    color:
                      globalRank <= 3
                        ? "var(--primary)"
                        : "var(--muted-foreground)",
                    fontWeight: globalRank <= 3 ? 600 : 400,
                    fontSize: 12,
                  }}
                >
                  {globalRank}
                </td>
                <td>
                  <Link href={`/stats/pga/spillere/${s.dgId}`}>
                    {s.navn}
                  </Link>
                  {erNorsk && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        color: "var(--primary)",
                        background: "rgba(209,248,67,0.2)",
                        padding: "1px 6px",
                        borderRadius: 3,
                        fontWeight: 600,
                      }}
                    >
                      NO
                    </span>
                  )}
                </td>
                <td>
                  <FlagGlyph code={s.land as FlagCode} size={16} />
                </td>
                <td className="mono">{s.tour}</td>
                <td className="num">{s.runder || "—"}</td>
                <td
                  className="num"
                  style={{
                    color:
                      globalRank <= 3 ? "var(--primary)" : "inherit",
                    fontWeight: globalRank <= 3 ? 600 : 500,
                  }}
                >
                  {s.sgTotal ? `+${s.sgTotal.toFixed(2)}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Paginering */}
      {pages > 1 && (
        <div className="spillere-pagination">
          <button
            className="spillere-page-btn"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Forrige
          </button>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              padding: "6px 14px",
              color: "var(--muted-foreground)",
            }}
          >
            {page + 1} / {pages}
          </span>
          <button
            className="spillere-page-btn"
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Neste →
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
          }}
        >
          Ingen spillere matcher søket.
        </div>
      )}
    </Reveal>
  );
}
