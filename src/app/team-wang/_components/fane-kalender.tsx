"use client";

// Plan → Kalender: årskalender (12 måneds-kort med hendelsestellere) +
// månedskalender med hendelsesprikker. Dag med treningsøkt åpner øktdetalj.

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  EVENTS,
  EVENT_FARGER,
  MONTHS_NO,
  MONTH_ORDER,
  SESSION_BY_ISO,
  type HendelseType,
} from "../_data/wang-plan";

const TYPE_LABEL: Record<HendelseType, string> = {
  okt: "Treningsøkt",
  konkurranse: "Turnering",
  prove: "Test",
  skole: "Skole",
};

function isoOf(y: number, m: number, dag: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(dag).padStart(2, "0")}`;
}

export function FaneKalender({ onOpen }: { onOpen: (id: string) => void }) {
  const [sub, setSub] = useState<"Årskalender" | "Kalender">("Årskalender");
  const [ym, setYm] = useState<[number, number]>([MONTH_ORDER[0][1], MONTH_ORDER[0][0]]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 999, background: "var(--surface-card)", boxShadow: "var(--shadow-card-sm)" }}>
          {(["Årskalender", "Kalender"] as const).map((o) => (
            <button key={o} onClick={() => setSub(o)} className="wang-pressable" style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 16px", borderRadius: 999, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-brand)", fontWeight: 600, fontSize: 13, background: o === sub ? "var(--wang-navy)" : "transparent", color: o === sub ? "var(--white)" : "var(--text-secondary)" }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <Legende />

      {sub === "Årskalender" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {MONTH_ORDER.map(([m, y]) => {
            const teller: Record<HendelseType, number> = { okt: 0, konkurranse: 0, prove: 0, skole: 0 };
            Object.keys(EVENTS).forEach((k) => {
              const [ky, km] = k.split("-").map(Number);
              if (ky === y && km - 1 === m) EVENTS[k].forEach((e) => (teller[e.type] += 1));
            });
            const total = Object.values(teller).reduce((a, b) => a + b, 0);
            return (
              <button
                key={`${y}-${m}`}
                onClick={() => { setYm([y, m]); setSub("Kalender"); }}
                className="wang-card wang-pressable"
                style={{ padding: 18, border: "none", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{MONTHS_NO[m].charAt(0).toUpperCase() + MONTHS_NO[m].slice(1)}</span>
                  <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>{y}</span>
                </div>
                {total === 0 ? (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>Ingen hendelser</span>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(Object.keys(teller) as HendelseType[]).filter((t) => teller[t] > 0).map((t) => (
                      <span key={t} className="wang-num" style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: "var(--neutral-50)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11.5, color: "var(--text-secondary)" }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: EVENT_FARGER[t] }} />{teller[t]} {TYPE_LABEL[t].toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <MaanedGrid ym={ym} setYm={setYm} onOpen={onOpen} />
      )}
    </div>
  );
}

function MaanedGrid({ ym, setYm, onOpen }: { ym: [number, number]; setYm: (v: [number, number]) => void; onOpen: (id: string) => void }) {
  const [y, m] = ym;
  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const idx = MONTH_ORDER.findIndex((o) => o[0] === m && o[1] === y);
  const prev = () => { const p = MONTH_ORDER[Math.max(0, idx - 1)]; setYm([p[1], p[0]]); };
  const next = () => { const p = MONTH_ORDER[Math.min(MONTH_ORDER.length - 1, idx + 1)]; setYm([p[1], p[0]]); };

  return (
    <section className="wang-card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <RundKnapp label="Forrige måned" onClick={prev}><ChevronLeft size={16} strokeWidth={2.5} aria-hidden /></RundKnapp>
        <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 19, color: "var(--text-primary)" }}>{MONTHS_NO[m].charAt(0).toUpperCase() + MONTHS_NO[m].slice(1)} {y}</span>
        <RundKnapp label="Neste måned" onClick={next}><ChevronRight size={16} strokeWidth={2.5} aria-hidden /></RundKnapp>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, textAlign: "center", marginBottom: 6 }}>
        {["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"].map((d) => (
          <span key={d} className="t-label" style={{ color: "var(--text-secondary)" }}>{d}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {Array.from({ length: startOffset }).map((_, i) => <span key={`t${i}`} style={{ aspectRatio: "1" }} />)}
        {Array.from({ length: days }).map((_, i) => {
          const dag = i + 1;
          const dagIso = isoOf(y, m, dag);
          const evs = EVENTS[dagIso] ?? [];
          const sesjon = SESSION_BY_ISO[dagIso];
          const prikker = [...new Set(evs.map((e) => e.type))];
          return (
            <button
              key={dagIso}
              onClick={() => sesjon && onOpen(sesjon.id)}
              className="wang-pressable"
              style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 2, borderRadius: 12, border: "none", cursor: sesjon ? "pointer" : "default", background: evs.length ? "var(--neutral-50)" : "transparent" }}
            >
              <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: evs.length ? 700 : 500, color: "var(--text-primary)" }}>{dag}</span>
              <span style={{ display: "flex", gap: 3, height: 6 }}>
                {prikker.map((t) => <span key={t} style={{ width: 6, height: 6, borderRadius: 999, background: EVENT_FARGER[t] }} />)}
              </span>
            </button>
          );
        })}
      </div>
      <p style={{ margin: "16px 2px 0", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>Trykk på en dag med treningsøkt for å se full øktdetalj.</p>
    </section>
  );
}

function Legende() {
  const rows: [HendelseType, string][] = [["okt", "Treningsøkt"], ["konkurranse", "Turnering"], ["prove", "Test"], ["skole", "Skole"]];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      {rows.map(([t, l]) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: EVENT_FARGER[t] }} />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function RundKnapp({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="wang-pressable" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 999, border: "1px solid var(--border-subtle)", cursor: "pointer", background: "var(--surface-card)", color: "var(--text-primary)" }}>
      {children}
    </button>
  );
}
