"use client";

// Skallet for WANG Årsplan 2026/27 — sticky header med fire pill-faner,
// scroll-til-topp ved fanebytte, kontaktkort og footer. Fasit:
// designsystem/wang/fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html
// (README §Informasjonsarkitektur).

import { useState } from "react";
import Image from "next/image";

import { FaneTrening } from "./fane-trening";
import { FaneSkole } from "./fane-skole";
import { FaneKalenderArsplan } from "./fane-kalender-arsplan";
import { FaneForeldreArsplan } from "./fane-foreldre-arsplan";
import { Wrap, fadeUpClass } from "./primitiver";
import type { Trinn } from "../../_data/arsplan-fasit-2026-27";

export type ArsplanFane = "trening" | "skole" | "kalender" | "foreldre";

const NAV: { key: ArsplanFane; label: string }[] = [
  { key: "trening", label: "Trening" },
  { key: "skole", label: "Skole" },
  { key: "kalender", label: "Kalender" },
  { key: "foreldre", label: "Foreldre" },
];

const SEKUNDAER: Record<ArsplanFane, { href: string; label: string }[]> = {
  trening: [
    { href: "#arsplan", label: "Årsplan" },
    { href: "#periodisering", label: "Periodisering" },
    { href: "#manedsplan", label: "Månedsplan" },
    { href: "#ukeplan", label: "Ukeplan" },
    { href: "#oktplaner", label: "Øktplaner" },
  ],
  skole: [
    { href: "#skoleplan", label: "Timeplan" },
    { href: "#kompetansemaal", label: "Kompetansemål" },
    { href: "#prover", label: "Prøver" },
  ],
  kalender: [{ href: "#kalender", label: "Kalender" }],
  foreldre: [
    { href: "#ukessammendrag", label: "Ukessammendrag" },
    { href: "#foreldremoter", label: "Foreldremøter" },
    { href: "#praktisk", label: "Praktisk" },
  ],
};

export function WangArsplanShell({ startFane = "trening" }: { startFane?: ArsplanFane }) {
  const [fane, setFane] = useState<ArsplanFane>(startFane);
  const [trinn, setTrinn] = useState<Trinn | "Alle trinn">("Alle trinn");

  function byttFane(f: ArsplanFane) {
    setFane(f);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ background: "var(--bg-app)", overflowX: "hidden", minHeight: "100vh" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          height: 56,
          background: "var(--surface-header)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Wrap>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 16 }}>
            <Image
              src="/team-wang/wang-logo-horizontal.svg"
              alt="WANG"
              width={110}
              height={36}
              style={{ height: 36, width: "auto" }}
              priority
            />
            <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {NAV.map((n) => {
                const aktiv = n.key === fane;
                return (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => byttFane(n.key)}
                    style={{
                      fontFamily: "var(--font-brand)",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "8px 14px",
                      minHeight: 40,
                      borderRadius: 999,
                      border: "none",
                      background: aktiv ? "var(--wang-navy)" : "transparent",
                      color: aktiv ? "var(--white)" : "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    {n.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </Wrap>
      </header>

      <div style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-card)" }}>
        <Wrap>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 0" }}>
            {SEKUNDAER[fane].map((s) => (
              <a
                key={s.href}
                href={s.href}
                style={{
                  textDecoration: "none",
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 12.5,
                  padding: "8px 15px",
                  borderRadius: 999,
                  background: "var(--neutral-50)",
                  color: "var(--text-primary)",
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </Wrap>
      </div>

      <main key={fane} className={fadeUpClass}>
        {fane === "trening" ? <FaneTrening trinn={trinn} onTrinn={setTrinn} /> : null}
        {fane === "skole" ? <FaneSkole trinn={trinn} onTrinn={setTrinn} /> : null}
        {fane === "kalender" ? <FaneKalenderArsplan onGaaTilTrening={() => byttFane("trening")} /> : null}
        {fane === "foreldre" ? <FaneForeldreArsplan /> : null}
      </main>

      <Wrap>
        <div
          style={{
            margin: "clamp(36px,6vw,56px) 0",
            padding: "20px 24px",
            borderRadius: 20,
            background: "var(--tint-teal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, color: "var(--wang-teal-text)" }}>
              Spørsmål om planen?
            </div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 2 }}>
              Anders Kristiansen — sportssjef og trener golf
            </div>
          </div>
        </div>
      </Wrap>

      <footer style={{ background: "var(--wang-navy)", color: "var(--white)", padding: "32px 0" }}>
        <Wrap>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Image
                src="/team-wang/wang-crest.svg"
                alt=""
                width={38}
                height={38}
                style={{ height: 38, width: "auto" }}
              />
              <div>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14 }}>
                  WANG Toppidrett Fredrikstad
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-on-dark-dim)" }}>Toppidrett golf</div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, color: "var(--wang-mint)" }}>
              Sammen lykkes vi
            </div>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
