"use client";

// Øktdetalj — full visning av én treningsøkt (oppvarming, hoveddel med
// AK-drills, test, evaluering). Portert fra designets detaljpanel.

import { ArrowLeft } from "lucide-react";

import type { Okt } from "../_data/wang-plan";
import { AkChip, IconChip } from "./primitiver";

export function OktDetalj({ okt, onBack }: { okt: Okt; onBack: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button
        onClick={onBack}
        className="wang-pressable"
        style={{
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          height: 38,
          padding: "0 16px",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: "var(--surface-card)",
          boxShadow: "var(--shadow-card-sm)",
          fontFamily: "var(--font-brand)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--text-primary)",
        }}
      >
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden /> Tilbake
      </button>

      <section
        style={{
          background: "var(--grad-hero-line)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-hero)",
          padding: "clamp(22px,4vw,30px)",
          color: "var(--text-on-dark)",
        }}
      >
        <div className="t-label" style={{ color: "var(--wang-mint)", marginBottom: 8 }}>
          {okt.longDate} · {okt.timeLabel}
        </div>
        <h1 style={{ margin: "0 0 12px", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "clamp(22px,4vw,30px)", lineHeight: 1.15 }}>
          {okt.title}
        </h1>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.9)", maxWidth: 660 }}>
          {okt.goal}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          <Pill>{okt.typeLabel}</Pill>
          <Pill>{okt.locName}</Pill>
          <Pill>{okt.periodName}</Pill>
        </div>
      </section>

      <Blokk tittel="Oppvarming">
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>{okt.warmup}</p>
      </Blokk>

      <section>
        <SeksjonTittel>Hoveddel</SeksjonTittel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {okt.drills.map((dr) => (
            <div key={dr.num} className="wang-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span
                  className="wang-num"
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    background: dr.tint,
                    color: dr.fg,
                    fontFamily: "var(--font-brand)",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {dr.num}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.45, color: "var(--text-primary)" }}>{dr.name}</div>
                  {dr.hasVol ? (
                    <div className="wang-num" style={{ marginTop: 4, fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, color: dr.fg }}>
                      {dr.volLabel}: {dr.volValue}
                    </div>
                  ) : null}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {dr.chips.map((c) => (
                  <AkChip key={c.label} label={c.label} value={c.value} tip={c.tip} color={c.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Blokk tittel="Test og måling">
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>{okt.test}</p>
      </Blokk>

      <Blokk tittel="Evaluering">
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>{okt.eval}</p>
      </Blokk>

      <section className="wang-card" style={{ padding: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <IconChip icon={okt.chipIcon} color={okt.chipColor} size={44} />
        <div>
          <div className="t-label" style={{ color: "var(--text-secondary)" }}>Kompetansemål per trinn</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {(["VG1", "VG2", "VG3"] as const).map((vg) => (
              <div key={vg} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span className="wang-num" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 12, color: "var(--wang-navy)", minWidth: 34 }}>{vg}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)" }}>{okt.comp[vg]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)", color: "var(--white)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>
      {children}
    </span>
  );
}

function SeksjonTittel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, margin: "2px 2px 12px", color: "var(--text-primary)" }}>{children}</div>;
}

function Blokk({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <section className="wang-card" style={{ padding: 20 }}>
      <div className="t-label" style={{ color: "var(--text-secondary)", marginBottom: 8 }}>{tittel}</div>
      {children}
    </section>
  );
}
