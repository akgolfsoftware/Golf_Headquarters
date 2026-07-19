"use client";

// WANG Årsplan (Coach) — trenerens periodiserte årsplan. Desktop-skall
// (navy sidebar + topbar) + Årsplan-oversikt og Periode-detalj. Portert fra
// Claude Design «WANG Årsplan - Coach». Demo-data; ingen ekte auth/DB ennå.

import { useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import Image from "next/image";

import {
  COACH_PERIODS,
  COACH_USER,
  FASE_TRINN,
  PERIOD_FASE_ACTIVE,
  PY_AXES,
  SIDEBAR_GROUPS,
  TIPS,
  type CoachPeriode,
} from "../_data/coach-arsplan";
import { HelpDot, Ikon } from "../_components/primitiver";

function dato(s: string): string {
  const MON = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  const d = new Date(s + "T12:00:00");
  return `${d.getDate()}. ${MON[d.getMonth()]} ${d.getFullYear()}`;
}

export function CoachArsplan() {
  const [selPeriod, setSelPeriod] = useState<string | null>(null);
  const periode = selPeriod ? COACH_PERIODS.find((p) => p.key === selPeriod) ?? null : null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* Sidebar (desktop) */}
      <aside className="wang-skjul-mobil" style={{ width: 260, flexShrink: 0, background: "var(--wang-navy)", color: "var(--text-on-dark)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "22px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/team-wang/wang-crest.svg" alt="WANG" width={34} height={45} style={{ height: 40, width: "auto" }} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 14, color: "var(--white)" }}>WANG Toppidrett</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-on-dark-dim)" }}>Treningsplattform</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 18 }}>
          {SIDEBAR_GROUPS.map((g) => (
            <div key={g.label}>
              <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-on-dark-dim)", padding: "0 12px 8px" }}>{g.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {g.items.map((it) => {
                  const aktiv = it.key === "arsplan";
                  return (
                    <span key={it.key} style={{ display: "flex", alignItems: "center", gap: 11, height: 40, padding: "0 12px", borderRadius: 12, fontFamily: "var(--font-brand)", fontWeight: 600, fontSize: 13.5, cursor: "default", background: aktiv ? "rgba(255,255,255,0.14)" : "transparent", color: aktiv ? "var(--white)" : "var(--text-on-dark-dim)" }}>
                      <Ikon name={it.icon} size={17} />{it.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 999, background: "var(--wang-mint)", color: "var(--navy-deep)", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 14 }}>AK</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, color: "var(--white)" }}>{COACH_USER.name}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-on-dark-dim)" }}>{COACH_USER.role}</div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ position: "sticky", top: 0, zIndex: 30, height: 64, background: "var(--surface-card)", boxShadow: "var(--shadow-card-sm)", display: "flex", alignItems: "center", gap: 16, padding: "0 clamp(16px,3vw,28px)" }}>
          <Image src="/team-wang/wang-crest.svg" alt="WANG" width={26} height={34} className="wang-vis-mobil" style={{ height: 32, width: "auto" }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 14px", borderRadius: 999, background: "var(--neutral-50)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12.5, color: "var(--text-primary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--wang-mint)" }} />WANG Toppidrett Fredrikstad
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 999, background: "var(--neutral-50)", color: "var(--text-secondary)" }}>
            <Bell size={18} strokeWidth={2} aria-hidden />
            <span style={{ position: "absolute", top: 8, right: 9, width: 8, height: 8, borderRadius: 999, background: "var(--cat-orange)", border: "2px solid var(--surface-card)" }} />
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 999, background: "var(--wang-navy)", color: "var(--white)", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 13 }}>AK</span>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22, maxWidth: 1080, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          {periode ? (
            <PeriodeDetalj periode={periode} onBack={() => setSelPeriod(null)} />
          ) : (
            <Oversikt onOpen={setSelPeriod} />
          )}
        </main>
      </div>
    </div>
  );
}

function Oversikt({ onOpen }: { onOpen: (key: string) => void }) {
  return (
    <>
      <section style={{ background: "var(--grad-hero-line)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-hero)", padding: "clamp(22px,4vw,30px)", color: "var(--text-on-dark)" }}>
        <div className="t-label" style={{ color: "var(--wang-mint)", marginBottom: 10 }}>Årsplan · Sesong 2026–2027</div>
        <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: "clamp(24px,4vw,32px)", lineHeight: 1.12 }}>Periodisert årsplan – golfgruppa</h1>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.55, color: "rgba(255,255,255,0.9)", maxWidth: 620 }}>
          Fire perioder fra august til juni. Hver periode har sin egen treningsfordeling (pyramide), læringsfase-fokus og mål. Trykk på en periode for detaljer.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        {COACH_PERIODS.map((p) => (
          <button key={p.key} onClick={() => onOpen(p.key)} className="wang-card wang-pressable" style={{ padding: 20, border: "none", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 28, padding: "0 12px", borderRadius: 999, background: p.tint, color: p.fg, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 12.5 }}>{p.name}</span>
              <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>{dato(p.start).replace(/ \d{4}$/, "")} – {dato(p.end).replace(/ \d{4}$/, "")}</span>
            </div>
            <PyramideBar p={p} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="t-label" style={{ color: "var(--text-secondary)" }}>Fase</span>
              <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12.5, color: "var(--wang-teal-text)" }}>{p.faseFokus}</span>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)" }}>{p.fokus}</p>
            <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, color: "var(--wang-teal-text)" }}>Se periode →</span>
          </button>
        ))}
      </div>
    </>
  );
}

function PeriodeDetalj({ periode, onBack }: { periode: CoachPeriode; onBack: () => void }) {
  const aktive = PERIOD_FASE_ACTIVE[periode.key] ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button onClick={onBack} className="wang-pressable" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: 999, border: "none", cursor: "pointer", background: "var(--surface-card)", boxShadow: "var(--shadow-card-sm)", fontFamily: "var(--font-brand)", fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden /> Alle perioder
      </button>

      <section className="wang-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 999, background: periode.tint, color: periode.fg, fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 13.5 }}>{periode.name}</span>
          <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{dato(periode.start)} – {dato(periode.end)}</span>
        </div>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>{periode.fokus}</p>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span className="t-label" style={{ color: "var(--text-secondary)" }}>Treningsfordeling</span>
            <HelpDot tip={TIPS.pyr} />
          </div>
          <PyramideBar p={periode} stor />
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <Kort tittel="Mål for perioden">
          {periode.maal.map((m, i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 8, alignItems: "start", padding: "5px 0" }}>
              <span style={{ marginTop: 6, width: 7, height: 7, borderRadius: 999, background: periode.color }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>{m}</span>
            </li>
          ))}
        </Kort>
        <Kort tittel="Tester og IUP">
          {periode.tester.map((t, i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 8, alignItems: "start", padding: "5px 0" }}>
              <span style={{ marginTop: 6, width: 7, height: 7, borderRadius: 999, background: "var(--cat-purple)" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>{t}</span>
            </li>
          ))}
          <li style={{ listStyle: "none", marginTop: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 28, padding: "0 12px", borderRadius: 999, background: "var(--tint-purple)", color: "var(--cat-purple)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12 }}>{periode.iup}</span>
          </li>
        </Kort>
        <Kort tittel="Turneringer">
          {periode.turneringer.map((t, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
              <Ikon name="trophy" size={15} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-primary)" }}>{t}</span>
            </li>
          ))}
        </Kort>
      </div>

      <section className="wang-card" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Læringsfaser</span>
          <HelpDot tip={TIPS.fase} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {FASE_TRINN.map((f) => {
            const aktiv = aktive.includes(f.name);
            return (
              <div key={f.n} style={{ padding: 14, borderRadius: 16, background: aktiv ? "var(--tint-teal)" : "var(--neutral-50)", border: aktiv ? "1px solid var(--wang-mint)" : "1px solid transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="wang-num" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 999, background: aktiv ? "var(--wang-teal)" : "var(--neutral-300)", color: "var(--white)", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 11 }}>{f.n}</span>
                  <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, color: aktiv ? "var(--wang-teal-text)" : "var(--text-primary)" }}>{f.name}</span>
                </div>
                <p style={{ margin: "8px 0 0", fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.45, color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PyramideBar({ p, stor }: { p: CoachPeriode; stor?: boolean }) {
  const segs = PY_AXES.filter(([a]) => p.pyr[a] > 0);
  return (
    <div>
      <div style={{ display: "flex", height: stor ? 26 : 18, borderRadius: 999, overflow: "hidden", background: "var(--neutral-100)" }}>
        {segs.map(([a, col]) => (
          <div key={a} title={`${a} ${p.pyr[a]} %`} style={{ width: `${p.pyr[a]}%`, background: col, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {p.pyr[a] >= 15 ? <span className="wang-num" style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 10.5, color: "var(--white)" }}>{a}</span> : null}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
        {segs.map(([a, col]) => (
          <span key={a} className="wang-num" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-secondary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: col }} />{a} {p.pyr[a]} %
          </span>
        ))}
      </div>
    </div>
  );
}

function Kort({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <section className="wang-card" style={{ padding: 20 }}>
      <div className="t-label" style={{ color: "var(--text-secondary)", marginBottom: 10 }}>{tittel}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>{children}</ul>
    </section>
  );
}
