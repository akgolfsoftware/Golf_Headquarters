"use client";

/**
 * BanedatabaseKlient — søk + region-filter + grid
 * Client component for interaktivitet.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { Reveal } from "@/components/stats/reveal";
import type { BaneListItem } from "@/lib/stats/bane-queries";

const REGIONER = ["Alle", "Øst", "Vest", "Midt", "Sør", "Nord"];

interface Props {
  baner: BaneListItem[];
}

export function BanedatabaseKlient({ baner }: Props) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Alle");

  const filtrert = useMemo(() => {
    return baner.filter((b) => {
      const matchRegion = region === "Alle" || b.region === region;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        b.navn.toLowerCase().includes(q) ||
        (b.kommune ?? "").toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [baner, query, region]);

  return (
    <>
      {/* Søk */}
      <div className="baner-search-row">
        <input
          type="search"
          className="baner-searchbox"
          placeholder="Søk bane eller klubb…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="baner-chips">
          <span className="baner-chip-label">Region</span>
          {REGIONER.map((r) => (
            <button
              key={r}
              className={`baner-chip${region === r ? " active" : ""}`}
              onClick={() => setRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtrert.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            letterSpacing: "0.06em",
          }}
        >
          Ingen baner matcher søket.
        </div>
      ) : (
        <div className="baner-grid-3">
          {filtrert.map((b, i) => (
            <Reveal key={b.slug} delay={i * 50}>
              <Link href={`/stats/baner/${b.slug}`} className="baner-card">
                <div className="baner-card-img">
                  BANEBILDE · {b.navn.toUpperCase()}
                </div>
                <div className="baner-card-body">
                  <div className="baner-card-eyebrow">
                    <span>
                      {(b.kommune ?? "").toUpperCase()} · {b.region.toUpperCase()}
                    </span>
                    <span>{b.oppstartsaar}</span>
                  </div>
                  <h3 className="baner-card-title">{b.navn}</h3>
                  <div className="baner-card-stats">
                    <div className="baner-stat-item">
                      <span className="baner-stat-label">Lengde</span>
                      <span className="baner-stat-val">
                        {b.lengdeMeter != null ? `${b.lengdeMeter} m` : "—"}
                      </span>
                    </div>
                    <div className="baner-stat-item">
                      <span className="baner-stat-label">Slope</span>
                      <span className="baner-stat-val">
                        {b.slope ?? "—"}
                      </span>
                    </div>
                    <div className="baner-stat-item">
                      <span className="baner-stat-label">CR</span>
                      <span className="baner-stat-val">
                        {b.courseRating ?? "—"}
                      </span>
                    </div>
                    <div className="baner-stat-item">
                      <span className="baner-stat-label">Par</span>
                      <span className="baner-stat-val">{b.par}</span>
                    </div>
                  </div>
                  <div className="baner-card-foot">
                    {b.totaltAntallTurneringer} turneringer arrangert
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
