"use client";

// Plan → Kalender: årskalender (12 måneds-kort med hendelsestellere),
// månedskalender (i dag-markert, alle hendelser trykkbare, større touch-mål)
// og en kompakt ukevisning. Hendelser slås sammen fra demo-øktmaler + ekte
// AgencyOS-data (turneringer/tester/skolerute) via byggLiveKalenderHendelser.

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MONTHS_NO, MONTH_ORDER, SESSION_BY_ISO, SESSIONS, weekStartOf, iso as isoAv } from "../_data/wang-plan";
import { byggLiveKalenderHendelser, type DagHendelse } from "../_data/live-sesong";
import type { WangLiveData } from "../_data/hent-wang-gruppe";
import { IconChip } from "./primitiver";

type HendelseType = DagHendelse["type"];

const TYPE_LABEL: Record<HendelseType, string> = {
  okt: "Treningsøkt",
  konkurranse: "Turnering",
  prove: "Test",
  skole: "Skole",
  samling: "Samling",
};
const TYPE_IKON: Record<HendelseType, string> = {
  okt: "flag",
  konkurranse: "trophy",
  prove: "clipboard-list",
  skole: "calendar",
  samling: "users",
};
const TYPE_FARGE: Record<HendelseType, string> = {
  okt: "var(--wang-teal)",
  konkurranse: "var(--cat-orange)",
  prove: "var(--cat-purple)",
  skole: "var(--cat-blue)",
  samling: "var(--wang-navy)",
};
const TYPE_CHIPFARGE: Record<HendelseType, "teal" | "orange" | "purple" | "blue" | "navy"> = {
  okt: "teal",
  konkurranse: "orange",
  prove: "purple",
  skole: "blue",
  samling: "navy",
};

function isoOf(y: number, m: number, dag: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(dag).padStart(2, "0")}`;
}
const UKEDAG_KORT = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

export function FaneKalender({
  onOpen,
  naaIso,
  live = null,
  startValgtDag,
}: {
  onOpen: (id: string) => void;
  naaIso: string;
  live?: WangLiveData | null;
  /** Sett fra «Nøkkelhendelser» i Plan → Sesong — hopper rett til den dagen (bruk `key` på FaneKalender for å tvinge remount ved nytt hopp). */
  startValgtDag?: string | null;
}) {
  const startAar = startValgtDag ? Number(startValgtDag.slice(0, 4)) : MONTH_ORDER[0][1];
  const startMnd = startValgtDag ? Number(startValgtDag.slice(5, 7)) - 1 : MONTH_ORDER[0][0];
  const [sub, setSub] = useState<"Årskalender" | "Kalender" | "Uke">(startValgtDag ? "Kalender" : "Årskalender");
  const [ym, setYm] = useState<[number, number]>([startAar, startMnd]);

  const hendelser = byggLiveKalenderHendelser(SESSIONS, live);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 999, background: "var(--surface-card)", boxShadow: "var(--shadow-card-sm)", overflowX: "auto" }}>
          {(["Årskalender", "Kalender", "Uke"] as const).map((o) => (
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
            const teller: Record<HendelseType, number> = { okt: 0, konkurranse: 0, prove: 0, skole: 0, samling: 0 };
            Object.keys(hendelser).forEach((k) => {
              const [ky, km] = k.split("-").map(Number);
              if (ky === y && km - 1 === m) hendelser[k].forEach((e) => (teller[e.type] += 1));
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
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: TYPE_FARGE[t] }} />{teller[t]} {TYPE_LABEL[t].toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : sub === "Kalender" ? (
        <MaanedGrid ym={ym} setYm={setYm} onOpen={onOpen} naaIso={naaIso} hendelser={hendelser} startValgtDag={startValgtDag ?? null} />
      ) : (
        <UkeListe naaIso={naaIso} onOpen={onOpen} hendelser={hendelser} />
      )}
    </div>
  );
}

// ---- Månedskalender ------------------------------------------------------
function MaanedGrid({
  ym,
  setYm,
  onOpen,
  naaIso,
  hendelser,
  startValgtDag,
}: {
  ym: [number, number];
  setYm: (v: [number, number]) => void;
  onOpen: (id: string) => void;
  naaIso: string;
  hendelser: Record<string, DagHendelse[]>;
  startValgtDag?: string | null;
}) {
  const [y, m] = ym;
  const [valgtDag, setValgtDag] = useState<string | null>(startValgtDag ?? null);
  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const idx = MONTH_ORDER.findIndex((o) => o[0] === m && o[1] === y);
  const prev = () => { const p = MONTH_ORDER[Math.max(0, idx - 1)]; setYm([p[1], p[0]]); setValgtDag(null); };
  const next = () => { const p = MONTH_ORDER[Math.min(MONTH_ORDER.length - 1, idx + 1)]; setYm([p[1], p[0]]); setValgtDag(null); };

  return (
    <section className="wang-card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <RundKnapp label="Forrige måned" onClick={prev}><ChevronLeft size={16} strokeWidth={2.5} aria-hidden /></RundKnapp>
        <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 19, color: "var(--text-primary)" }}>{MONTHS_NO[m].charAt(0).toUpperCase() + MONTHS_NO[m].slice(1)} {y}</span>
        <RundKnapp label="Neste måned" onClick={next}><ChevronRight size={16} strokeWidth={2.5} aria-hidden /></RundKnapp>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, textAlign: "center", marginBottom: 6 }}>
        {UKEDAG_KORT.map((d) => (
          <span key={d} className="t-label" style={{ color: "var(--text-secondary)" }}>{d}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {Array.from({ length: startOffset }).map((_, i) => <span key={`t${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const dag = i + 1;
          const dagIso = isoOf(y, m, dag);
          const evs = hendelser[dagIso] ?? [];
          const prikker = [...new Set(evs.map((e) => e.type))];
          const erIDag = dagIso === naaIso;
          const erValgt = dagIso === valgtDag;
          return (
            <button
              key={dagIso}
              onClick={() => setValgtDag(erValgt ? null : dagIso)}
              className="wang-pressable"
              aria-label={`${dag}. ${MONTHS_NO[m]}${evs.length ? ` — ${evs.length} hendelse${evs.length === 1 ? "" : "r"}` : ""}`}
              style={{
                minHeight: 46,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "6px 2px",
                borderRadius: 12,
                border: erIDag ? "2px solid var(--wang-teal)" : "2px solid transparent",
                boxSizing: "border-box",
                cursor: "pointer",
                background: erValgt ? "var(--wang-navy)" : evs.length ? "var(--neutral-50)" : "transparent",
              }}
            >
              <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: evs.length || erIDag ? 700 : 500, color: erValgt ? "var(--white)" : "var(--text-primary)" }}>{dag}</span>
              <span style={{ display: "flex", gap: 3, height: 6 }}>
                {prikker.map((t) => <span key={t} style={{ width: 6, height: 6, borderRadius: 999, background: erValgt ? "var(--white)" : TYPE_FARGE[t] }} />)}
              </span>
            </button>
          );
        })}
      </div>
      {valgtDag ? (
        <DagDetalj dagIso={valgtDag} hendelser={hendelser[valgtDag] ?? []} onOpen={onOpen} onLukk={() => setValgtDag(null)} />
      ) : (
        <p style={{ margin: "16px 2px 0", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>Trykk på en dag for å se hendelser.</p>
      )}
    </section>
  );
}

function DagDetalj({
  dagIso,
  hendelser,
  onOpen,
  onLukk,
}: {
  dagIso: string;
  hendelser: DagHendelse[];
  onOpen: (id: string) => void;
  onLukk: () => void;
}) {
  const [, mS, dS] = dagIso.split("-").map(Number);
  const dagLabel = `${dS}. ${MONTHS_NO[mS - 1]}`;
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>{dagLabel}</span>
        <button onClick={onLukk} className="wang-pressable" style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>Lukk</button>
      </div>
      {hendelser.length === 0 ? (
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Ingen hendelser denne dagen.</p>
      ) : (
        hendelser.map((h, i) => {
          const sesjon = h.type === "okt" ? SESSION_BY_ISO[dagIso] : undefined;
          const klikkbar = !!sesjon;
          return (
            <div
              key={i}
              onClick={klikkbar ? () => onOpen(sesjon!.id) : undefined}
              className={klikkbar ? "wang-pressable" : undefined}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "var(--neutral-50)", cursor: klikkbar ? "pointer" : "default" }}
            >
              <IconChip icon={TYPE_IKON[h.type]} color={TYPE_CHIPFARGE[h.type]} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{h.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-secondary)", marginTop: 1 }}>
                  {TYPE_LABEL[h.type]}{h.time ? ` · ${h.time}` : ""}{h.sted ? ` · ${h.sted}` : ""}
                </div>
              </div>
              {klikkbar ? <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, color: "var(--wang-teal-text)", flexShrink: 0 }}>Se økt →</span> : null}
            </div>
          );
        })
      )}
    </div>
  );
}

// ---- Ukevisning ------------------------------------------------------------
function UkeListe({
  naaIso,
  onOpen,
  hendelser,
}: {
  naaIso: string;
  onOpen: (id: string) => void;
  hendelser: Record<string, DagHendelse[]>;
}) {
  const [offset, setOffset] = useState(0);
  const naa = new Date(naaIso + "T12:00:00");
  const ws = weekStartOf(naa);
  ws.setDate(ws.getDate() + offset * 7);
  const dager = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws);
    d.setDate(d.getDate() + i);
    return d;
  });
  const we = dager[6];
  const ukeLabel = ws.getMonth() === we.getMonth()
    ? `${ws.getDate()}.–${we.getDate()}. ${MONTHS_NO[we.getMonth()]}`
    : `${ws.getDate()}. ${MONTHS_NO[ws.getMonth()]} – ${we.getDate()}. ${MONTHS_NO[we.getMonth()]}`;

  return (
    <section className="wang-card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
        <RundKnapp label="Forrige uke" onClick={() => setOffset((n) => n - 1)}><ChevronLeft size={16} strokeWidth={2.5} aria-hidden /></RundKnapp>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{ukeLabel}</span>
          {offset !== 0 ? (
            <button onClick={() => setOffset(0)} className="wang-pressable" style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, border: "none", cursor: "pointer", background: "var(--tint-teal)", color: "var(--wang-teal-text)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11.5 }}>Denne uka</button>
          ) : null}
        </div>
        <RundKnapp label="Neste uke" onClick={() => setOffset((n) => n + 1)}><ChevronRight size={16} strokeWidth={2.5} aria-hidden /></RundKnapp>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {dager.map((d) => {
          const dagIso = isoAv(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())));
          const evs = hendelser[dagIso] ?? [];
          const erIDag = dagIso === naaIso;
          return (
            <div key={dagIso} className="wang-card" style={{ padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start", border: erIDag ? "2px solid var(--wang-teal)" : "2px solid transparent", boxSizing: "border-box" }}>
              <div style={{ flexShrink: 0, width: 46, textAlign: "center" }}>
                <div className="t-label" style={{ color: "var(--text-secondary)" }}>{UKEDAG_KORT[(d.getDay() + 6) % 7]}</div>
                <div className="wang-num" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 18, color: erIDag ? "var(--wang-teal-text)" : "var(--text-primary)" }}>{d.getDate()}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {evs.length === 0 ? (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>Ingen hendelser</span>
                ) : (
                  evs.map((h, i) => {
                    const sesjon = h.type === "okt" ? SESSION_BY_ISO[dagIso] : undefined;
                    const klikkbar = !!sesjon;
                    return (
                      <div
                        key={i}
                        onClick={klikkbar ? () => onOpen(sesjon!.id) : undefined}
                        className={klikkbar ? "wang-pressable" : undefined}
                        style={{ display: "flex", alignItems: "center", gap: 8, cursor: klikkbar ? "pointer" : "default" }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: TYPE_FARGE[h.type], flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.label}</span>
                        {h.time ? <span className="wang-num" style={{ flexShrink: 0, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }}>{h.time}</span> : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Legende() {
  const rows: [HendelseType, string][] = [["okt", "Treningsøkt"], ["konkurranse", "Turnering"], ["prove", "Test"], ["skole", "Skole"], ["samling", "Samling"]];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      {rows.map(([t, l]) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: TYPE_FARGE[t] }} />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function RundKnapp({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="wang-pressable" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 999, border: "1px solid var(--border-subtle)", cursor: "pointer", background: "var(--surface-card)", color: "var(--text-primary)", flexShrink: 0 }}>
      {children}
    </button>
  );
}
