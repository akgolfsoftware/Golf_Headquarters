"use client";

// Øktdetalj — full visning av én treningsøkt (oppvarming, hoveddel med
// AK-drills, test, evaluering). Portert fra designets detaljpanel.
// Utvidet: gjennomført/i dag/kommende-status, forrige/neste-navigasjon,
// kollapsbare AK-drill-kort (default lukket — kortere side å scrolle).

import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import type { Okt } from "../_data/wang-plan";
import { AkChip, IconChip } from "./primitiver";

export function OktDetalj({
  okt,
  naaIso,
  onBack,
  onPrev,
  onNext,
  forrigeLabel,
  nesteLabel,
}: {
  okt: Okt;
  naaIso: string;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  forrigeLabel?: string;
  nesteLabel?: string;
}) {
  const [apneDrills, setApneDrills] = useState<Set<number>>(new Set());
  const alleApne = apneDrills.size === okt.drills.length && okt.drills.length > 0;
  const toggleDrill = (num: number) => {
    setApneDrills((s) => {
      const n = new Set(s);
      if (n.has(num)) n.delete(num);
      else n.add(num);
      return n;
    });
  };
  const toggleAlle = () => setApneDrills(alleApne ? new Set() : new Set(okt.drills.map((d) => d.num)));

  const erGjennomfort = okt.iso < naaIso;
  const erIDag = okt.iso === naaIso;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={onBack}
          className="wang-pressable"
          style={{
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

        {onPrev || onNext ? (
          <div style={{ display: "inline-flex", gap: 8 }}>
            <NavKnapp label={forrigeLabel ? `Forrige: ${forrigeLabel}` : "Forrige økt"} onClick={onPrev} retning="forrige" />
            <NavKnapp label={nesteLabel ? `Neste: ${nesteLabel}` : "Neste økt"} onClick={onNext} retning="neste" />
          </div>
        ) : null}
      </div>

      <section
        style={{
          background: "var(--grad-hero-line)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-hero)",
          padding: "clamp(22px,4vw,30px)",
          color: "var(--text-on-dark)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span className="t-label" style={{ color: "var(--wang-mint)" }}>
            {okt.longDate} · {okt.timeLabel}
          </span>
          {erGjennomfort ? (
            <StatusBadge farge="mint">Gjennomført</StatusBadge>
          ) : erIDag ? (
            <StatusBadge farge="hvit">I dag</StatusBadge>
          ) : (
            <StatusBadge farge="dempet">Kommende økt</StatusBadge>
          )}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "2px 2px 12px" }}>
          <SeksjonTittel>Hoveddel</SeksjonTittel>
          {okt.drills.length > 0 ? (
            <button onClick={toggleAlle} className="wang-pressable" style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, color: "var(--wang-teal-text)" }}>
              {alleApne ? "Lukk alle" : "Åpne alle"}
            </button>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {okt.drills.map((dr) => {
            const apen = apneDrills.has(dr.num);
            return (
              <div key={dr.num} className="wang-card" style={{ padding: 0, overflow: "hidden" }}>
                <button
                  onClick={() => toggleDrill(dr.num)}
                  className="wang-pressable"
                  style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: 16, border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
                >
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
                  <ChevronDown size={18} strokeWidth={2} aria-hidden style={{ flexShrink: 0, marginTop: 6, color: "var(--text-secondary)", transition: "transform var(--dur) ease", transform: apen ? "rotate(180deg)" : undefined }} />
                </button>
                {apen ? (
                  <div style={{ padding: "0 16px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {dr.chips.map((c) => (
                      <AkChip key={c.label} label={c.label} value={c.value} tip={c.tip} color={c.color} />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
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

      {onPrev || onNext ? (
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          <NavKnapp label={forrigeLabel ? `Forrige: ${forrigeLabel}` : "Forrige økt"} onClick={onPrev} retning="forrige" fullWidth />
          <NavKnapp label={nesteLabel ? `Neste: ${nesteLabel}` : "Neste økt"} onClick={onNext} retning="neste" fullWidth />
        </div>
      ) : null}
    </div>
  );
}

function NavKnapp({
  label,
  onClick,
  retning,
  fullWidth,
}: {
  label: string;
  onClick?: () => void;
  retning: "forrige" | "neste";
  fullWidth?: boolean;
}) {
  const deaktivert = !onClick;
  return (
    <button
      onClick={onClick}
      disabled={deaktivert}
      aria-label={label}
      className={deaktivert ? undefined : "wang-pressable"}
      style={{
        flex: fullWidth ? 1 : undefined,
        minWidth: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: retning === "forrige" ? "flex-start" : "flex-end",
        gap: 6,
        height: 38,
        padding: "0 14px",
        borderRadius: 999,
        border: "1px solid var(--border-subtle)",
        cursor: deaktivert ? "default" : "pointer",
        background: "var(--surface-card)",
        opacity: deaktivert ? 0.4 : 1,
        fontFamily: "var(--font-brand)",
        fontWeight: 600,
        fontSize: 12.5,
        color: "var(--text-primary)",
      }}
    >
      {retning === "forrige" ? <ChevronLeft size={15} strokeWidth={2.2} aria-hidden style={{ flexShrink: 0 }} /> : null}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {retning === "neste" ? <ChevronRight size={15} strokeWidth={2.2} aria-hidden style={{ flexShrink: 0 }} /> : null}
    </button>
  );
}

function StatusBadge({ farge, children }: { farge: "mint" | "hvit" | "dempet"; children: React.ReactNode }) {
  const stil =
    farge === "mint"
      ? { background: "rgba(73,202,159,0.18)", color: "var(--wang-mint)" }
      : farge === "hvit"
        ? { background: "var(--white)", color: "var(--wang-navy)" }
        : { background: "rgba(255,255,255,0.1)", color: "var(--white)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", borderRadius: 999, fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", ...stil }}>
      {children}
    </span>
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
  return <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>{children}</div>;
}

function Blokk({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <section className="wang-card" style={{ padding: 20 }}>
      <div className="t-label" style={{ color: "var(--text-secondary)", marginBottom: 8 }}>{tittel}</div>
      {children}
    </section>
  );
}
