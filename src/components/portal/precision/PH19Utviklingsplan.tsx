"use client";

/**
 * PH19Utviklingsplan — Spillerens utviklingsplan i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx og ui_kits/playerhq/screens/PH-TP.jsx
 *
 * Talentradar vises aldri for spilleren (jf. beslutning 28.09).
 * Viser P1–P10 tekniske krav, læringssteg, coach-forslag og milepæler.
 */

import Link from "next/link";
import { ArrowLeft, Check, Sparkles, Target } from "lucide-react";
import { Ikon, StatusPille, TomTilstand } from "@/components/precision/pa";
import type { UtviklingsplanData } from "@/components/portal/v2/UtviklingsplanV2";

export type PH19UtviklingsplanProps = {
  data: UtviklingsplanData;
};

export function PH19Utviklingsplan({ data }: PH19UtviklingsplanProps) {
  const { spillerNavn, talent, plan, forslag } = data;

  const erTom = !plan && !talent;

  return (
    <div className="pa-side" style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 880, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Plan · Utviklingsplan</span>
            {plan?.periode && <StatusPille tone="ok">{plan.periode.split("·")[0].trim()}</StatusPille>}
          </div>
          <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: 0 }}>Utviklingsplan</h1>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
            {plan ? `${plan.navn} · Posisjoner, krav og progresjon` : `Utviklingsplan for ${spillerNavn}`}
          </p>
        </div>
        <Link href="/portal/planlegge" className="pa-btn pa-btn--secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Ikon icon={ArrowLeft} size={15} name="arrow-left" />
          <span>Plan</span>
        </Link>
      </header>

      {erTom ? (
        <section className="pa-card" style={{ padding: 32 }}>
          <TomTilstand
            icon={Target}
            title="Ingen aktiv utviklingsplan"
            text="Du har ingen aktiv teknisk plan eller registrert utviklingsplan ennå. Coachen setter opp planen i Workbench."
            actions={
              <Link href="/portal/planlegge" className="pa-btn pa-btn--primary">
                Gå til treningsplan
              </Link>
            }
          />
        </section>
      ) : (
        <>
          {/* Teknisk plan: Posisjoner P1–P10 */}
          {plan && (
            <section className="pa-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Posisjoner P1.0–P10.0</span>
                <span style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>
                  {plan.posisjoner.filter((p) => p.status === "done").length} AV {plan.posisjoner.length} FULLFØRT
                </span>
              </div>

              {/* P-Rail */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, minmax(0, 1fr))", gap: 4 }}>
                {plan.posisjoner.map((p) => {
                  const erAktiv = p.status === "active";
                  const erFerdig = p.status === "done";
                  return (
                    <div
                      key={p.p}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        padding: "8px 2px",
                        borderRadius: 6,
                        border: erAktiv
                          ? "2px solid var(--primary)"
                          : erFerdig
                            ? "1px solid var(--ok)"
                            : "1px solid var(--border-hairline)",
                        background: erAktiv
                          ? "var(--surface-raised)"
                          : erFerdig
                            ? "var(--surface-card)"
                            : "transparent",
                      }}
                    >
                      <span style={{ font: "700 13px/1 var(--font-sans)", color: erAktiv ? "var(--text-primary)" : "var(--text-secondary)" }}>
                        {p.p}
                      </span>
                      {p.fokus && (
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)" }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Aktiv posisjon & Neste krav */}
              {plan.nesteKrav && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                      AKTIVT FOKUS · {plan.aktivP} {plan.aktivNavn ? `(${plan.aktivNavn})` : ""}
                    </span>
                    <StatusPille tone="ok">I fokus</StatusPille>
                  </div>
                  <h3 style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: 0 }}>
                    {plan.nesteKrav.tittel}
                  </h3>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", font: "var(--type-meta)", color: "var(--text-secondary)" }}>
                    <span>Repetisjoner: {plan.nesteKrav.repsGjort} / {plan.nesteKrav.repsMaal}</span>
                    {plan.nesteKrav.lFase && <span>Læringssteg: {plan.nesteKrav.lFase}</span>}
                    {plan.nesteKrav.tmMaal && <span>TrackMan: {plan.nesteKrav.tmMaal}</span>}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Læringssteg */}
          {plan?.laeringsAktiv != null && (
            <section className="pa-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Læringstrapp</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                {[
                  { t: "Uten ball", desc: "Tørrtrening & bevegelse" },
                  { t: "Lav hastighet", desc: "Balltreff & kontroll" },
                  { t: "Full hastighet", desc: "Automatisering & spill" },
                ].map((steg, idx) => {
                  const aktiv = idx === plan.laeringsAktiv;
                  const passert = plan.laeringsAktiv != null && idx < plan.laeringsAktiv;
                  return (
                    <div
                      key={steg.t}
                      style={{
                        padding: 12,
                        borderRadius: 6,
                        border: aktiv ? "2px solid var(--primary)" : "1px solid var(--border-hairline)",
                        background: aktiv ? "var(--surface-raised)" : "transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                        <strong style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{steg.t}</strong>
                        {passert && <Ikon icon={Check} size={14} name="check" />}
                      </div>
                      <small style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block", marginTop: 4 }}>
                        {steg.desc}
                      </small>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Milepæler per posisjon */}
          {plan?.milepaeler && plan.milepaeler.length > 0 && (
            <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: 0 }}>Oppgaver og posisjonskrav</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {plan.milepaeler.map((m) => (
                  <div key={m.p} className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <strong style={{ font: "var(--type-body-m)", color: "var(--text-primary)" }}>
                        {m.p} · {m.navn}
                      </strong>
                      {m.hovedfokus && <StatusPille tone="ok">Hovedfokus</StatusPille>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {m.krav.map((k) => (
                        <div
                          key={k.tittel}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 0",
                            borderTop: "1px solid var(--border-hairline)",
                          }}
                        >
                          <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{k.tittel}</span>
                          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                            {k.repsGjort} / {k.repsMaal} reps
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Forslag fra Coach / AI Caddie */}
          {forslag.length > 0 && (
            <section className="pa-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Ikon icon={Sparkles} size={16} name="sparkles" />
                <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Forslag fra coach</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {forslag.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      borderRadius: 6,
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{f.type} {f.p ? `(${f.p})` : ""}</strong>
                      <small style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{f.foreslaatt}</small>
                    </div>
                    <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>{f.forslag}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Talent-status (uten ulovlig radar) */}
          {talent && (
            <section className="pa-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Talentstatus</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>NIVÅ</span>
                  <span style={{ font: "var(--type-metric)", color: "var(--text-primary)" }}>{talent.niva}</span>
                </div>
                {talent.klubb && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>HJEMMEKLUBB</span>
                    <span style={{ font: "var(--type-body-m)", fontWeight: 600, color: "var(--text-primary)" }}>{talent.klubb}</span>
                  </div>
                )}
                {talent.region && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>REGION</span>
                    <span style={{ font: "var(--type-body-m)", fontWeight: 600, color: "var(--text-primary)" }}>{talent.region}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
