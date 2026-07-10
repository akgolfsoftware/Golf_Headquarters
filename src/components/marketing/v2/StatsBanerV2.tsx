"use client";

/**
 * AK Golf HQ v2 — /stats/baner (retning C, mørk).
 * Swap av (mlegacy)/stats/baner/page.tsx → v2-utseende. Data hentes 1:1 via
 * src/lib/stats/bane-queries.ts i page.tsx (server) og sendes inn som props.
 * Søk/region-filter portert fra BanedatabaseKlient.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, KpiFlis, FilterChips, TomTilstand } from "@/components/v2";
import type { BaneListItem } from "@/lib/stats/bane-queries";
import { StatsRamme, StatsSok, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, Lede, MCta, Seksjon } from "./marked-ramme";

const REGIONER = ["Alle", "Øst", "Vest", "Midt", "Sør", "Nord"];

export interface StatsBanerV2Props {
  baner: BaneListItem[];
  totalTurneringer: number;
  totalSpillere: number;
}

export function StatsBanerV2({ baner, totalTurneringer, totalSpillere }: StatsBanerV2Props) {
  const mobile = useMobile();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Alle");

  const filtrert = useMemo(() => {
    const q = query.toLowerCase();
    return baner.filter((b) => {
      const matchRegion = region === "Alle" || b.region === region;
      const matchQuery =
        !q ||
        b.navn.toLowerCase().includes(q) ||
        (b.kommune ?? "").toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [baner, query, region]);

  return (
    <StatsRamme mobile={mobile} aktiv="baner">
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <Eyebrow>AK Golf Stats · Baner</Eyebrow>
        <HeroT mobile={mobile} em="norske">
          Alle golfbaner.
        </HeroT>
        <Lede style={{ marginTop: 22, maxWidth: 560 }}>
          Vanskelighetsgrad, slope, course rating og vår statistikk fra ekte turneringer på hver bane.
        </Lede>
      </Seksjon>

      {/* KPI-strip */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: T.gap }}>
          <KpiFlis label="Baner" value={baner.length} />
          <KpiFlis label="Turneringer arrangert her" value={totalTurneringer} />
          <KpiFlis label="Spillere har spilt her" value={totalSpillere} />
        </div>
      </Seksjon>

      {/* Søk + grid */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 12, marginBottom: 24 }}>
          <StatsSok value={query} onChange={setQuery} placeholder="Søk bane eller klubb…" />
          <FilterChips items={REGIONER} active={[region]} onToggle={setRegion} />
        </div>

        {filtrert.length === 0 ? (
          <Kort>
            <TomTilstand icon="flag" title="Ingen baner matcher søket" sub="Prøv et annet søk eller en annen region." />
          </Kort>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
            {filtrert.map((b) => (
              <Link key={b.slug} href={`/stats/baner/${b.slug}`} style={{ textDecoration: "none" }}>
                <Kort hover pad="0">
                  <div
                    style={{
                      height: 96,
                      borderBottom: `1px solid ${T.border}`,
                      background: T.panel2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: T.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: T.mut,
                      textAlign: "center",
                      padding: "0 12px",
                    }}
                  >
                    <Icon name="image" size={14} style={{ marginRight: 6, flex: "none" }} />
                    {b.navn}
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Caps size={9}>
                        {(b.kommune ?? "").toUpperCase()} · {b.region.toUpperCase()}
                      </Caps>
                      {b.oppstartsaar && <Caps size={9}>{b.oppstartsaar}</Caps>}
                    </div>
                    <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 10 }}>{b.navn}</div>
                    <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
                      {[
                        ["Lengde", b.lengdeMeter != null ? `${b.lengdeMeter} m` : "—"],
                        ["Slope", b.slope ?? "—"],
                        ["CR", b.courseRating ?? "—"],
                        ["Par", b.par],
                      ].map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>{lbl}</div>
                          <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, marginTop: 2 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, marginTop: 12 }}>
                      {b.totaltAntallTurneringer} turneringer arrangert
                    </div>
                  </div>
                </Kort>
              </Link>
            ))}
          </div>
        )}
      </Seksjon>

      {/* Mersalg */}
      <Seksjon mobile={mobile}>
        <Kort tint pad={mobile ? "26px 22px" : "40px 44px"} style={{ textAlign: mobile ? "left" : "center" }}>
          <Caps color={T.lime} style={{ marginBottom: 14 }}>
            PlayerHQ
          </Caps>
          <SeksT mobile={mobile} em="din bane.">
            Spill smartere på
          </SeksT>
          <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, margin: "14px auto 0", maxWidth: 480, lineHeight: 1.65 }}>
            Logg runder, mål Strokes Gained og se nøyaktig hvilke hull du taper strokes på. Automatisk baneanalyse inkludert.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22, justifyContent: mobile ? "flex-start" : "center" }}>
            <MCta icon="arrow-right" href="/auth/signup">
              Start gratis
            </MCta>
            <MCta ghost href="/stats">
              Utforsk stats
            </MCta>
          </div>
        </Kort>
      </Seksjon>
    </StatsRamme>
  );
}
