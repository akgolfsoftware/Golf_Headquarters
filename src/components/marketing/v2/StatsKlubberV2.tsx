"use client";

/**
 * AK Golf HQ v2 — /stats/klubber (retning C, mørk).
 * Swap av (mlegacy)/stats/klubber/page.tsx → v2-utseende. Data (SEED_KLUBBER +
 * hentKlubbStats) er 1:1 videreført fra legacy-siden; kun presentasjonen er
 * byttet til StatsRamme + delte v2-primitiver. Søk/region-filter er portert
 * fra KlubbdatabaseKlient.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Kort, Caps, KpiFlis, FilterChips, TomTilstand } from "@/components/v2";
import { StatsRamme, StatsSok, StatsStatusBar, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, Lede, MCta, Seksjon } from "./marked-ramme";

export interface KlubbRad {
  slug: string;
  navn: string;
  kommune: string;
  region: string;
  spillere: number;
  pro: number;
  college: number;
  junior: number;
  turneringer: number;
}

const REGIONER = ["Alle", "Øst", "Vest", "Midt", "Sør", "Nord"];

function initialer(navn: string): string {
  return navn
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export interface StatsKlubberV2Props {
  klubber: KlubbRad[];
  totalSpillere: number;
  totalTurneringer: number;
}

export function StatsKlubberV2({ klubber, totalSpillere, totalTurneringer }: StatsKlubberV2Props) {
  const mobile = useMobile();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Alle");

  const filtrert = useMemo(() => {
    const q = query.toLowerCase();
    return klubber.filter((k) => {
      const matchRegion = region === "Alle" || k.region === region;
      const matchQuery =
        !q ||
        k.navn.toLowerCase().includes(q) ||
        k.kommune.toLowerCase().includes(q) ||
        k.region.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [klubber, query, region]);

  const flestSpillere = [...klubber].sort((a, b) => b.spillere - a.spillere)[0];
  const mestTurneringer = [...klubber].sort((a, b) => b.turneringer - a.turneringer)[0];
  const mestPro = [...klubber].sort((a, b) => b.pro + b.college - (a.pro + a.college))[0];

  return (
    <StatsRamme mobile={mobile} aktiv="klubber">
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <Eyebrow>AK Golf Stats · Klubber</Eyebrow>
        <StatsStatusBar
          label={`${klubber.length} klubber`}
          tone="info"
          meta={
            filtrert.length !== klubber.length
              ? `${filtrert.length} treff nå · ${totalSpillere} spillere`
              : `${totalSpillere} spillere · ${totalTurneringer} turneringer`
          }
        />
        <HeroT mobile={mobile} em="norske">
          Alle golfklubber.
        </HeroT>
        <Lede style={{ marginTop: 22, maxWidth: 560 }}>
          Spillere, pro-talent, juniorprogram og turneringshistorikk for alle norske golfklubber i databasen vår.
        </Lede>
        <div style={{ marginTop: 20 }}>
          <MCta icon="arrow-right" href={flestSpillere ? `/stats/klubber/${flestSpillere.slug}` : "/stats/spillere"}>
            {flestSpillere ? `Se ${flestSpillere.navn}` : "Utforsk spillere"}
          </MCta>
        </div>
      </Seksjon>

      {/* KPI-strip */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: T.gap }}>
          <KpiFlis label="Klubber" value={klubber.length} />
          <KpiFlis label="Spillere registrert" value={totalSpillere} />
          <KpiFlis label="Turneringer registrert" value={totalTurneringer} />
        </div>
      </Seksjon>

      {/* Fremhevet */}
      {flestSpillere && mestTurneringer && mestPro && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Caps>Fremhevet</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile} em="ledende klubber.">
              Tre
            </SeksT>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 24 }}>
            {[
              { k: flestSpillere, label: "Flest spillere", val: flestSpillere.spillere, sub: "registrerte spillere" },
              { k: mestTurneringer, label: "Mest turneringer", val: mestTurneringer.turneringer, sub: "turneringer arrangert" },
              { k: mestPro, label: "Mest pro-talent", val: mestPro.pro + mestPro.college, sub: "pro + college-commits" },
            ].map(({ k, label, val, sub }) => (
              <Link key={k.slug} href={`/stats/klubber/${k.slug}`} style={{ textDecoration: "none" }}>
                <Kort hover pad="20px 22px">
                  <Caps size={9}>{label}</Caps>
                  <div style={{ fontFamily: T.mono, fontSize: 36, fontWeight: 700, color: T.fg, marginTop: 10, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginTop: 12 }}>{k.navn}</div>
                  <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, marginTop: 4 }}>
                    {k.kommune} · {k.region} · {sub}
                  </div>
                </Kort>
              </Link>
            ))}
          </div>
        </Seksjon>
      )}

      {/* Søk + grid */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 12, marginBottom: 24 }}>
          <StatsSok value={query} onChange={setQuery} placeholder="Søk klubb eller kommune…" />
          <FilterChips items={REGIONER} active={[region]} onToggle={setRegion} />
        </div>

        {filtrert.length === 0 ? (
          <Kort>
            <TomTilstand icon="building-2" title="Ingen klubber matcher søket" sub="Prøv et annet søk eller en annen region." />
          </Kort>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
            {filtrert.map((k) => (
              <Link key={k.slug} href={`/stats/klubber/${k.slug}`} style={{ textDecoration: "none" }}>
                <Kort hover>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9999,
                        background: T.panel2,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: T.mono,
                        fontSize: 12,
                        fontWeight: 700,
                        color: T.lime,
                      }}
                    >
                      {initialer(k.navn)}
                    </span>
                    <Caps size={9}>{k.region}</Caps>
                  </div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 14 }}>{k.navn}</div>
                  <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 2 }}>{k.kommune}</div>
                  <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                    {[
                      ["Spillere", k.spillere],
                      ["Pro", k.pro],
                      ["Junior", k.junior],
                    ].map(([lbl, val]) => (
                      <div key={lbl}>
                        <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>{lbl}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg, marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
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
          <SeksT mobile={mobile} em="din klubb.">
            Spill for
          </SeksT>
          <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, margin: "14px auto 0", maxWidth: 480, lineHeight: 1.65 }}>
            Logg runder og se din klubbs statistikk i sanntid. Sammenlign deg med andre spillere på banen din.
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
