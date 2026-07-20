"use client";

// Skole-fane: Vurdering (kompetansemål VG1–VG3 per fag), Timeplan og
// Skolerute/prøver. Kilde: WANGs elevsamtale- og vurderingsdokumenter, portert
// til datamodellen (KM / TIMETABLE / SCHOOL / EXAM_PLAN).

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  EXAM_PLAN,
  KM,
  KM_LEVEL_COLORS,
  SCHOOL,
  TIMETABLE,
  TT_DAYS,
  TT_TIMES,
  type FagKey,
  type Trinn,
} from "../_data/wang-plan";
import type { WangLiveData, WangSkoleDagDb } from "../_data/hent-wang-gruppe";
import { IconChip, Tabs, yearPillStyle } from "./primitiver";

const OMR_IKON: Record<string, string> = {
  Ferdighetstrening: "target",
  Basistrening: "dumbbell",
  Konkurransetrening: "trophy",
  "Idrett- og bevegelsesaktivitet": "activity",
  "Helsefremmende livsstil": "heart-pulse",
};

export function FaneSkole({ live = null }: { live?: WangLiveData | null }) {
  const [sub, setSub] = useState<"Vurdering" | "Timeplan" | "Skolerute og prøver">("Vurdering");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)" }}>Skole</h1>
        <Tabs options={["Vurdering", "Timeplan", "Skolerute og prøver"]} value={sub} onChange={(v) => setSub(v as typeof sub)} />
      </div>
      {sub === "Vurdering" ? <Vurdering /> : sub === "Timeplan" ? <Timeplan /> : <Skolerute live={live} />}
    </div>
  );
}

// ---- Vurdering (kompetansemål) -----------------------------------------
function Vurdering() {
  const [fag, setFag] = useState<FagKey>("top");
  const [nivaa, setNivaa] = useState<Trinn>("VG1");
  const [omrApen, setOmrApen] = useState<number | null>(0);
  const [kodeApen, setKodeApen] = useState<string | null>(null);

  const L = KM[fag].levels[nivaa];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Kompetansemål og vurdering</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3 }}>Fra WANGs elevsamtale- og vurderingsdokumenter · VG1–VG3</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {(Object.keys(KM) as FagKey[]).map((f) => (
            <button key={f} onClick={() => { setFag(f); setOmrApen(0); setKodeApen(null); }} className="wang-pressable" style={{ ...navPill(fag === f) }}>{KM[f].label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["VG1", "VG2", "VG3"] as Trinn[]).map((n) => (
          <button key={n} onClick={() => { setNivaa(n); setOmrApen(0); setKodeApen(null); }} className="wang-pressable" style={yearPillStyle(nivaa === n)}>{n}</button>
        ))}
      </div>

      <div className="wang-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>{L.fagnavn}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>Lærer: {L.laerer || "ikke oppgitt i malen"}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {L.skala.map((lab, i) => (
              <span key={lab} style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", borderRadius: 999, background: KM_LEVEL_COLORS[i][0], color: KM_LEVEL_COLORS[i][1], fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11.5, whiteSpace: "nowrap" }}>{lab}</span>
            ))}
          </div>
        </div>

        {/* Målområder */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {L.omraader.map((o, oi) => {
            const nKod = o.delmaal.reduce((a, dm) => a + dm.koder.length, 0);
            const apen = omrApen === oi;
            return (
              <div key={o.navn} style={{ borderRadius: 16, background: "var(--neutral-50)", overflow: "hidden" }}>
                <button onClick={() => setOmrApen(apen ? null : oi)} className="wang-pressable" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
                  <IconChip icon={OMR_IKON[o.navn] ?? "target"} color="navy" size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{o.navn}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{o.delmaal.length} kompetansemål · {nKod} delkompetanser</div>
                  </div>
                  <ChevronDown size={18} strokeWidth={2} aria-hidden style={{ flexShrink: 0, color: "var(--text-secondary)", transition: "transform var(--dur) ease", transform: apen ? "rotate(180deg)" : undefined }} />
                </button>
                {apen ? (
                  <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {o.delmaal.map((dm, di) => (
                      <div key={di} style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface-card)" }}>
                        <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12.5, color: "var(--wang-navy)" }}>{dm.t}</div>
                        <p style={{ margin: "4px 0 0", fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)" }}>{dm.mal}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Kjennetegn på måloppnåelse per kompetansekode */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <div className="t-label" style={{ color: "var(--text-secondary)" }}>Kjennetegn på måloppnåelse</div>
          {Object.keys(L.koder).map((k) => {
            const v = L.koder[k];
            const apen = kodeApen === k;
            return (
              <div key={k} style={{ borderRadius: 14, border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
                <button onClick={() => setKodeApen(apen ? null : k)} className="wang-pressable" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
                  <span className="wang-num" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 34, height: 24, padding: "0 8px", borderRadius: 8, background: "var(--tint-navy)", color: "var(--wang-navy)", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 11 }}>{k}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.45, color: "var(--text-primary)" }}>{v[0]}</span>
                  <ChevronDown size={18} strokeWidth={2} aria-hidden style={{ flexShrink: 0, color: "var(--text-secondary)", transition: "transform var(--dur) ease", transform: apen ? "rotate(180deg)" : undefined }} />
                </button>
                {apen ? (
                  <div style={{ padding: "0 14px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                    {L.skala.map((lab, i) => {
                      const txt = v[i + 1];
                      return (
                        <div key={lab} style={{ borderRadius: 12, padding: "12px 14px", background: txt ? KM_LEVEL_COLORS[i][0] : "var(--surface-card)" }}>
                          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: txt ? KM_LEVEL_COLORS[i][1] : "var(--text-secondary)" }}>{lab.split(" · ")[0]}</div>
                          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.5, color: txt ? "var(--text-primary)" : "var(--text-secondary)", fontStyle: txt ? "normal" : "italic" }}>{txt || "Kjennetegn ikke fastsatt i kildedokumentet ennå."}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---- Timeplan ----------------------------------------------------------
function Timeplan() {
  const [klasse, setKlasse] = useState<Trinn>("VG1");
  const rows = TIMETABLE[klasse];
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["VG1", "VG2", "VG3"] as Trinn[]).map((n) => (
          <button key={n} onClick={() => setKlasse(n)} className="wang-pressable" style={yearPillStyle(klasse === n)}>{n}</button>
        ))}
      </div>
      <div className="wang-card" style={{ padding: 18, overflowX: "auto" }}>
        <div style={{ minWidth: 620 }}>
          <div style={{ display: "grid", gridTemplateColumns: `110px repeat(${TT_DAYS.length},1fr)`, gap: 6, marginBottom: 6 }}>
            <span />
            {TT_DAYS.map((d) => <span key={d} className="t-label" style={{ color: "var(--text-secondary)", textAlign: "center" }}>{d}</span>)}
          </div>
          {TT_TIMES.map((time, i) => (
            <div key={time} style={{ display: "grid", gridTemplateColumns: `110px repeat(${TT_DAYS.length},1fr)`, gap: 6, marginBottom: 6 }}>
              <span className="wang-num" style={{ display: "flex", alignItems: "center", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>{time}</span>
              {rows[i].map((c, ci) => (
                <span key={ci} style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 52, padding: "6px 8px", borderRadius: 12, boxSizing: "border-box", fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.25, background: c.g ? "var(--tint-teal)" : "var(--neutral-50)", color: c.g ? "var(--wang-teal-text)" : "var(--text-primary)", fontWeight: c.g ? 700 : 500 }}>{c.t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Skolerute og prøver -----------------------------------------------
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function kortDato(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MND_KORT[m - 1]} ${y}`;
}
function nesteDag(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
function skoleType(tittel: string): string {
  const t = tittel.toLowerCase();
  if (t === "siste skoledag") return "Avslutning";
  if (t.includes("planleggingsdag")) return "Elevfri";
  if (t.includes("ferie")) return "Ferie";
  return "Fridag";
}
/** Grupperer sammenhengende dager med samme tittel til én rad (f.eks. 5 høstferie-dager → «28. sep – 2. okt»). */
function grupperSkoleDager(dager: WangSkoleDagDb[]): { iso: string; dato: string; name: string; type: string }[] {
  const sortert = [...dager].sort((a, b) => a.dato.localeCompare(b.dato));
  const grupper: { start: string; slutt: string; tittel: string }[] = [];
  for (const d of sortert) {
    const siste = grupper[grupper.length - 1];
    if (siste && siste.tittel === d.tittel && nesteDag(siste.slutt) === d.dato) {
      siste.slutt = d.dato;
    } else {
      grupper.push({ start: d.dato, slutt: d.dato, tittel: d.tittel });
    }
  }
  return grupper.map((g) => ({
    iso: g.start,
    dato: g.start === g.slutt ? kortDato(g.start) : `${kortDato(g.start)} – ${kortDato(g.slutt)}`,
    name: g.tittel,
    type: skoleType(g.tittel),
  }));
}

function Skolerute({ live }: { live: WangLiveData | null }) {
  const skoleListe = live && live.skoleDager.length > 0 ? grupperSkoleDager(live.skoleDager) : SCHOOL;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22 }}>
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "2px 2px 12px" }}>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Skolerute 2026–2027</div>
          {live && live.skoleDager.length > 0 ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 11px", borderRadius: 999, background: "var(--tint-teal)", color: "var(--wang-teal-text)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--wang-mint)" }} />Synket fra AgencyOS
            </span>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {skoleListe.map((s) => (
            <div key={s.iso + s.name} className="wang-card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div className="wang-num" style={{ flexShrink: 0, minWidth: 108, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>{s.dato}</div>
              <div style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>{s.name}</div>
              <span style={{ flexShrink: 0, fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-secondary)" }}>{s.type}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <SeksjonTittel>Prøveplan</SeksjonTittel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXAM_PLAN.map((e) => (
            <div key={e.iso + e.fag} className="wang-card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div className="wang-num" style={{ flexShrink: 0, minWidth: 96, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>{e.dato}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>{e.fag}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{e.type}</div>
              </div>
              <span className="wang-num" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 999, background: "var(--tint-navy)", color: "var(--wang-navy)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11 }}>{e.klasse}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function navPill(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    height: 40,
    padding: "0 16px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-brand)",
    fontWeight: 600,
    fontSize: 13,
    background: active ? "var(--wang-navy)" : "var(--neutral-50)",
    color: active ? "var(--white)" : "var(--text-secondary)",
  };
}

function SeksjonTittel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, margin: "2px 2px 12px", color: "var(--text-primary)" }}>{children}</div>;
}
