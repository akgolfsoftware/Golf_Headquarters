"use client";

/**
 * PH19Talent — Talent-visning for spiller i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 *
 * Beslutning 28.09: «Talentradar vises aldri for spilleren. Talent «Min plan»,
 * roadmap og sammenligning med andre spillere utgår (28.09).»
 * Visningen her gir spilleren saklig innsyn i eget nivå og testresultater
 * uten ulovlig radar eller benchmarking mot andre spillere.
 */

import Link from "next/link";
import { ArrowLeft, Star, Target } from "lucide-react";
import { Ikon, StatusPille, TomTilstand } from "@/components/precision/pa";
import { TalentFaner, type TalentFaneId } from "@/components/portal/v2/TalentFaner";

export type PH19TalentProps = {
  fane: TalentFaneId;
  ikkeIProgrammet?: boolean;
  niva?: string;
  klubb?: string | null;
  region?: string | null;
  testNivaaer?: Array<{
    omraade: string;
    omraadeLabel: string;
    testNavn: string;
    sisteScore: number;
    unit?: string;
    sisteDato: string;
    antallTester: number;
    trend?: string | null;
  }>;
  milepaeler?: Array<{
    tittel: string;
    dato?: string | null;
    beskrivelse?: string | null;
    fullfort?: boolean;
  }>;
  perioder?: Array<{
    id: string;
    navn: string;
    startDato: string;
    sluttDato: string;
    aktiv: boolean;
  }>;
};

export function PH19Talent({
  fane,
  ikkeIProgrammet,
  niva = "—",
  klubb,
  region,
  testNivaaer = [],
  milepaeler = [],
  perioder = [],
}: PH19TalentProps) {
  if (ikkeIProgrammet) {
    return (
      <div className="pa-side" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880, margin: "0 auto", width: "100%" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>PlayerHQ · Talent</span>
            <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: "4px 0 0" }}>Talentprogram</h1>
          </div>
          <Link href="/portal/meg" className="pa-btn pa-btn--secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Ikon icon={ArrowLeft} size={15} name="arrow-left" />
            <span>Meg</span>
          </Link>
        </header>

        <section className="pa-card" style={{ padding: 32 }}>
          <TomTilstand
            icon={Star}
            title="Du er ikke i talent-programmet ennå"
            text="Talent-programmet er forbeholdt spillere invitert inn i satsingsgrupper. Snakk med coachen din om kravene og målsetningene som kreves."
            actions={
              <Link href="/portal/mal" className="pa-btn pa-btn--primary">
                Gå til målsetninger
              </Link>
            }
          />
        </section>
      </div>
    );
  }

  return (
    <div className="pa-side" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 880, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>PlayerHQ · Talent</span>
            <StatusPille tone="ok">Nivå {niva}</StatusPille>
          </div>
          <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: 0 }}>
            {fane === "mitt-niva"
              ? "Mitt nivå"
              : fane === "min-plan"
                ? "Min plan"
                : fane === "roadmap"
                  ? "Roadmap"
                  : "Sammenligning"}
          </h1>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
            {klubb ? `${klubb}` : "AK Golf"} {region ? `· ${region}` : ""}
          </p>
        </div>
        <Link href="/portal/meg" className="pa-btn pa-btn--secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Ikon icon={ArrowLeft} size={15} name="arrow-left" />
          <span>Meg</span>
        </Link>
      </header>

      {/* Faner */}
      <TalentFaner aktiv={fane} />

      {/* Innhold per fane */}
      {fane === "mitt-niva" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Statuskort */}
          <section className="pa-card" style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            <div>
              <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>SPILERNIVÅ</span>
              <p style={{ font: "var(--type-metric)", color: "var(--text-primary)", margin: "4px 0 0" }}>{niva}</p>
            </div>
            {klubb && (
              <div>
                <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>KLUBB</span>
                <p style={{ font: "var(--type-body-m)", fontWeight: 600, color: "var(--text-primary)", margin: "4px 0 0" }}>{klubb}</p>
              </div>
            )}
            {region && (
              <div>
                <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>REGION</span>
                <p style={{ font: "var(--type-body-m)", fontWeight: 600, color: "var(--text-primary)", margin: "4px 0 0" }}>{region}</p>
              </div>
            )}
          </section>

          {/* Testnivåer per område */}
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <h2 style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: 0 }}>Gjennomførte tester</h2>
              <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{testNivaaer.length} OMRÅDER</span>
            </div>

            {testNivaaer.length === 0 ? (
              <div className="pa-card" style={{ padding: 24 }}>
                <p style={{ font: "var(--type-body-m)", color: "var(--text-secondary)", margin: 0 }}>
                  Ingen gjennomførte tester registrert ennå. Tester registreres sammen med coachen i treningsøkter.
                </p>
              </div>
            ) : (
              <div className="pa-card" style={{ padding: "8px 16px" }}>
                <div role="list">
                  {testNivaaer.map((t, idx) => (
                    <div
                      key={t.omraade}
                      role="listitem"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        alignItems: "center",
                        gap: 16,
                        padding: "12px 0",
                        borderTop: idx > 0 ? "1px solid var(--border-hairline)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                        <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{t.omraadeLabel.toUpperCase()}</span>
                        <strong style={{ font: "var(--type-body-m)", color: "var(--text-primary)" }}>{t.testNavn}</strong>
                        <small style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>Sist testet: {t.sisteDato}</small>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ font: "700 18px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                          {t.sisteScore} {t.unit}
                        </span>
                        {t.trend && (
                          <small style={{ font: "var(--type-meta)", color: "var(--ok)", display: "block", marginTop: 4 }}>
                            {t.trend}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {fane === "min-plan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="pa-card" style={{ padding: 20 }}>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Milepæler i planen</span>
            {milepaeler.length === 0 ? (
              <p style={{ font: "var(--type-body-m)", color: "var(--text-secondary)", margin: "12px 0 0" }}>
                Ingen milepæler opprettet i talentplanen ennå.
              </p>
            ) : (
              <div role="list" style={{ marginTop: 12 }}>
                {milepaeler.map((m, i) => (
                  <div
                    key={i}
                    role="listitem"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 0",
                      borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                    }}
                  >
                    <div>
                      <strong style={{ font: "var(--type-body-m)", color: "var(--text-primary)", display: "block" }}>{m.tittel}</strong>
                      {m.beskrivelse && <small style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>{m.beskrivelse}</small>}
                    </div>
                    {m.dato && <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{m.dato}</span>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {fane === "roadmap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="pa-card" style={{ padding: 20 }}>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Sesongplan og perioder</span>
            {perioder.length === 0 ? (
              <p style={{ font: "var(--type-body-m)", color: "var(--text-secondary)", margin: "12px 0 0" }}>
                Ingen perioder definert i sesongplanen ennå.
              </p>
            ) : (
              <div role="list" style={{ marginTop: 12 }}>
                {perioder.map((p, i) => (
                  <div
                    key={p.id}
                    role="listitem"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 0",
                      borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                    }}
                  >
                    <div>
                      <strong style={{ font: "var(--type-body-m)", color: "var(--text-primary)" }}>{p.navn}</strong>
                      {p.aktiv && <span style={{ marginLeft: 8 }}><StatusPille tone="ok">Aktiv</StatusPille></span>}
                    </div>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                      {p.startDato} → {p.sluttDato}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {fane === "sammenligning" && (
        <section className="pa-card" style={{ padding: 24 }}>
          <TomTilstand
            icon={Target}
            title="Sammenligning forvaltes av coach"
            text="I henhold til AK Golfs retningslinjer vises ikke sammenligninger mot andre spillere i spillerportalen. Coach og sportslig ledelse analyserer kohorter i AgencyOS for å tilpasse treningen din."
            actions={
              <Link href="/portal/mal" className="pa-btn pa-btn--primary">
                Se egne målsetninger
              </Link>
            }
          />
        </section>
      )}
    </div>
  );
}
