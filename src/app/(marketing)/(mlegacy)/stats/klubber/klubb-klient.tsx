"use client";

/**
 * KlubbdatabaseKlient — søk + region-filter + grid
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { Reveal } from "@/components/stats/reveal";
import type { SEED_KLUBBER } from "./page";

type Klubb = (typeof SEED_KLUBBER)[number];

const REGIONER = ["Alle", "Øst", "Vest", "Midt", "Sør", "Nord"];

interface Props {
  klubber: Klubb[];
}

function initials(navn: string): string {
  return navn
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function KlubbdatabaseKlient({ klubber }: Props) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Alle");

  const filtrert = useMemo(() => {
    return klubber.filter((k) => {
      const matchRegion = region === "Alle" || k.region === region;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        k.navn.toLowerCase().includes(q) ||
        k.kommune.toLowerCase().includes(q) ||
        k.region.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [klubber, query, region]);

  return (
    <>
      {/* Søk */}
      <div className="klubber-search-row">
        <input
          type="search"
          className="klubber-searchbox"
          placeholder="Søk klubb eller kommune…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="klubber-chips">
          <span className="klubber-chip-label">Region</span>
          {REGIONER.map((r) => (
            <button
              key={r}
              className={`klubber-chip${region === r ? " active" : ""}`}
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
          Ingen klubber matcher søket.
        </div>
      ) : (
        <div className="klubber-grid-3">
          {filtrert.map((k, i) => (
            <Reveal key={k.slug} delay={i * 50}>
              <Link href={`/stats/klubber/${k.slug}`} className="klubber-card">
                <div className="klubber-card-header">
                  <div className="klubber-card-avatar">{initials(k.navn)}</div>
                  <span className="klubber-card-region">{k.region}</span>
                </div>
                <div>
                  <div className="klubber-card-name">{k.navn}</div>
                  <div className="klubber-card-meta">{k.kommune}</div>
                </div>
                <div className="klubber-card-stats">
                  <div className="klubber-card-stat">
                    <span className="klubber-card-stat-lbl">Spillere</span>
                    <span className="klubber-card-stat-val">{k.spillere}</span>
                  </div>
                  <div className="klubber-card-stat">
                    <span className="klubber-card-stat-lbl">Pro</span>
                    <span className="klubber-card-stat-val">{k.pro}</span>
                  </div>
                  <div className="klubber-card-stat">
                    <span className="klubber-card-stat-lbl">Junior</span>
                    <span className="klubber-card-stat-val">{k.junior}</span>
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
