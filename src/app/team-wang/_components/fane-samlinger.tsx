"use client";

// Plan → Samlinger: treningssamlinger (ekspanderbare kort) + heldagssamlinger.
// Portert fra designets Samlinger-seksjon.

import { useState } from "react";
import { Calendar, ChevronDown, Flag } from "lucide-react";

import { FULL_DAY_CAMPS, TRAINING_CAMPS, campStatus } from "../_data/wang-plan";
import { IconChip, StatusChip } from "./primitiver";

export function FaneSamlinger() {
  const [apen, setApen] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="wang-card" style={{ padding: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <IconChip icon="users" color="navy" size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Generell informasjon</div>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)", maxWidth: 680 }}>
            Utover de faste ukentlige øktene har golfgruppa flere samlinger gjennom sesongen.{" "}
            <strong style={{ color: "var(--text-primary)" }}>Treningssamlinger</strong> går over flere dager med ekstra trening, mens{" "}
            <strong style={{ color: "var(--text-primary)" }}>heldagssamlinger</strong> er temadager. Oppmøte er obligatorisk – meld fra til trener ved fravær. Detaljert program legges ut i forkant av hver samling.
          </p>
        </div>
      </div>

      <section>
        <SeksjonTittel>Treningssamlinger</SeksjonTittel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          {TRAINING_CAMPS.map((c) => {
            const st = campStatus(c.status);
            const er = apen === c.name;
            return (
              <div key={c.name} className="wang-card wang-pressable" onClick={() => setApen(er ? null : c.name)} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <StatusChip color={st.statusColor} icon={st.statusIcon} label={st.statusLabel} />
                    <ChevronDown size={18} strokeWidth={2} aria-hidden style={{ color: "var(--text-secondary)", transition: "transform var(--dur) ease", transform: er ? "rotate(180deg)" : undefined }} />
                  </div>
                </div>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>{c.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 2 }}>
                  <InfoRad ikon={<Calendar size={15} strokeWidth={2} aria-hidden />} label="Dato" verdi={c.dato} mono />
                  <InfoRad ikon={<Flag size={15} strokeWidth={2} aria-hidden />} label="Hvor" verdi={c.hvor} />
                </div>
                {er ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 2, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
                    <DetaljRad label="Arrangør" verdi={c.arrangor} />
                    <DetaljRad label="Påmelding" verdi={c.pamelding} />
                    <DetaljRad label="Påmeldingsfrist" verdi={c.pamfrist} mono />
                    <DetaljRad label="Egenandel" verdi={c.egenandel} sterk />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SeksjonTittel>Heldagssamlinger</SeksjonTittel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FULL_DAY_CAMPS.map((dd) => (
            <div key={dd.iso + dd.tema} className="wang-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div className="wang-num" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 96, height: 38, padding: "0 14px", borderRadius: 12, background: "var(--tint-navy)", color: "var(--wang-navy)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, textAlign: "center" }}>{dd.dato}</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{dd.tema}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 3, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--neutral-300)" }} />{dd.hvor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SeksjonTittel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, margin: "2px 2px 12px", color: "var(--text-primary)" }}>{children}</div>;
}

function InfoRad({ ikon, label, verdi, mono }: { ikon: React.ReactNode; label: string; verdi: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
      {ikon}
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--text-secondary)" }}>{label}</span>
      <span className={mono ? "wang-num" : undefined} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)" }}>{verdi}</span>
    </div>
  );
}

function DetaljRad({ label, verdi, mono, sterk }: { label: string; verdi: string; mono?: boolean; sterk?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--text-secondary)" }}>{label}</span>
      <span className={mono ? "wang-num" : undefined} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: sterk ? "var(--wang-teal-text)" : "var(--text-primary)", fontWeight: sterk ? 700 : 400, textAlign: "right" }}>{verdi}</span>
    </div>
  );
}
