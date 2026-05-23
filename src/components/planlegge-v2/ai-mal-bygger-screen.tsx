/**
 * /portal/ai/mal-bygger — pixel-perfekt port av
 * docs/design-handoff/planlegge/ai-mal-bygger.html (steg 2 av 3 — AI-generer)
 */

import "./styles.css";
import Link from "next/link";
import { PlanleggeSprite } from "./icons";

type SmartPill = { ltr: string; v: string; lbl: string };
type Kpi = { l: string; v: string; ok?: boolean };

type Goal = {
  type: "resultat" | "prosess" | "atferd";
  typeLabel: string;
  badgeRight?: { color: string; label: string };
  name: React.ReactNode;
  smart: SmartPill[];
  kpis: Kpi[];
  dep?: React.ReactNode;
  selected?: boolean;
};

const GOALS: Goal[] = [
  {
    type: "resultat",
    typeLabel: "Resultat",
    badgeRight: { color: "var(--forest)", label: "HOVED-MÅL" },
    name: (
      <>
        HCP <em>4,8 → 2,5</em> innen sesongslutt
      </>
    ),
    smart: [
      { ltr: "S", v: "HCP-mål", lbl: "Specific" },
      { ltr: "M", v: "-2,3 HCP", lbl: "Measurable" },
      { ltr: "A", v: "12 mnd lin.", lbl: "Achievable" },
      { ltr: "R", v: "A1-krav", lbl: "Relevant" },
      { ltr: "T", v: "30. okt", lbl: "Time-bound" },
    ],
    kpis: [
      { l: "Forventet ranking-poeng", v: "+280 p" },
      { l: "Sannsynlighet", v: "68%", ok: true },
      { l: "Avhengig av", v: "Mål 2 + 3" },
    ],
    dep: (
      <>
        Markus&apos; siste 12-mnd HCP-progresjon: <strong>6,8 → 4,8</strong> (snitt -0,17/mnd).{" "}
        <em>
          Med Spesialisering-perioden 1. mai → 14. juni og 7 turneringer planlagt, er -2,3 HCP realistisk men strekkende.
        </em>{" "}
        Forutsetter SG: Driving + 0,5 og SG: Putting + 0,3.
      </>
    ),
    selected: true,
  },
  {
    type: "prosess",
    typeLabel: "Prosess",
    badgeRight: { color: "var(--muted)", label: "DRIVES MÅL 1" },
    name: (
      <>
        Driver Basic PEI under <em>0,055</em> i 6 av 10 forsøk
      </>
    ),
    smart: [
      { ltr: "S", v: "PEI < 0,055", lbl: "Specific" },
      { ltr: "M", v: "6 av 10", lbl: "Measurable" },
      { ltr: "A", v: "PR 0,054", lbl: "Achievable" },
      { ltr: "R", v: "PGA Top 40", lbl: "Relevant" },
      { ltr: "T", v: "31. aug", lbl: "Time-bound" },
    ],
    kpis: [
      { l: "Test-frekvens", v: "2×/mnd" },
      { l: "Sannsynlighet", v: "82%", ok: true },
      { l: "Trener", v: "Driver-volum" },
    ],
    dep: (
      <>
        Sett din nye PR (0,054) i dag — <em>&quot;6 av 10&quot; målet bygger konsistens, ikke peaks</em>. Tvinger 20+ Driver Basic-tester før sesongslutt, og legger grunnlaget for SG: Driving + 0,5.
      </>
    ),
    selected: true,
  },
  {
    type: "prosess",
    typeLabel: "Prosess",
    name: (
      <>
        Putt 1–3 m: <em>78% → 86%</em> innen 14. juli
      </>
    ),
    smart: [
      { ltr: "S", v: "Putt 1-3m", lbl: "Specific" },
      { ltr: "M", v: "+8 pp", lbl: "Measurable" },
      { ltr: "A", v: "A1 snitt 85%", lbl: "Achievable" },
      { ltr: "R", v: "NM jr forb.", lbl: "Relevant" },
      { ltr: "T", v: "14. juli", lbl: "Time-bound" },
    ],
    kpis: [
      { l: "Drill-volum", v: "90 putt/uke" },
      { l: "Sannsynlighet", v: "71%", ok: true },
      { l: "SG-impact", v: "+0,28" },
    ],
  },
  {
    type: "atferd",
    typeLabel: "Atferd",
    name: (
      <>
        Pre-shot rutine <em>7 sek</em> · 90% av slag i turnering
      </>
    ),
    smart: [
      { ltr: "S", v: "7-sek rutine", lbl: "Specific" },
      { ltr: "M", v: "90% videoanalyse", lbl: "Measurable" },
      { ltr: "A", v: "i dag 62%", lbl: "Achievable" },
      { ltr: "R", v: "TURN-disiplin", lbl: "Relevant" },
      { ltr: "T", v: "18. aug", lbl: "Time-bound" },
    ],
    kpis: [
      { l: "Tester", v: "MTQ + pre-shot" },
      { l: "Sannsynlighet", v: "54%" },
      { l: "Coach-fokus", v: "Mentaltrener" },
    ],
  },
];

export function AiMalByggerScreen() {
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <div className="behind" aria-hidden="true">
        <div className="b-side" />
        <div className="b-top" />
        <div className="b-card" style={{ top: "84px", left: "280px", right: "40px", height: "60px" }} />
        <div className="b-card" style={{ top: "160px", left: "280px", right: "40px", height: "48px" }} />
        <div className="b-card" style={{ top: "220px", left: "280px", width: "280px", height: "200px" }} />
        <div className="b-card" style={{ top: "220px", left: "580px", width: "280px", height: "200px" }} />
        <div className="b-card" style={{ top: "220px", left: "880px", width: "280px", height: "200px" }} />
      </div>

      <div className="modal-backdrop">
        <div className="modal" role="dialog" aria-label="AI mål-bygger">
          {/* HEADER */}
          <div className="ai-head">
            <Link href="/portal/planlegge?tab=mal" className="close" aria-label="Lukk">
              <svg fill="none" stroke="currentColor"><use href="#i-x" /></svg>
            </Link>

            <div className="row">
              <div className="eye">
                <svg width="11" height="11" fill="currentColor"><use href="#i-sparkles" /></svg>
                AI · MÅL-BYGGER
              </div>
            </div>
            <h2>
              Foreslår 4 SMART-mål for <em>sesong</em> 2026
            </h2>

            <div className="stepper">
              <div className="s done">
                <div className="num">
                  <svg fill="none" stroke="currentColor" strokeWidth="3"><use href="#i-check" /></svg>
                </div>
                <div className="lbl">Input</div>
              </div>
              <div className="bar done" />
              <div className="s active">
                <div className="num">2</div>
                <div className="lbl">AI-generer</div>
              </div>
              <div className="bar" />
              <div className="s">
                <div className="num">3</div>
                <div className="lbl">Velg + lagre</div>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="ai-body">
            {/* Step 1 recap */}
            <div className="recap">
              <span className="ic">
                <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-target" /></svg>
              </span>
              <div className="body">
                <div className="lbl">DITT INPUT · STEG 1</div>
                <div className="ttl">
                  &quot;Vil bryte gjennom som A1-spiller og kvalifisere til Olyo Tour Finalen i august.&quot;
                </div>
                <div className="meta">
                  Kategori: <strong style={{ color: "var(--ink)", fontWeight: 700 }}>Resultat + Prosess</strong>
                  <span style={{ color: "var(--subtle)", margin: "0 6px" }}>·</span>
                  Tidshorisont:{" "}
                  <strong style={{ color: "var(--ink)", fontWeight: 700 }}>Sesong 2026 (7 mnd)</strong>
                  <span style={{ color: "var(--subtle)", margin: "0 6px" }}>·</span>
                  Sammenheng: <strong style={{ color: "var(--ink)", fontWeight: 700 }}>HCP 4.8 i dag</strong>
                </div>
              </div>
              <button className="edit">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: "-1px", marginRight: "3px" }}>
                  <use href="#i-edit" />
                </svg>
                Endre
              </button>
            </div>

            <div className="ai-sec-h">
              <div className="eyebrow">AI-GENERERT · 4 SMART-MÅL</div>
              <span className="ct">3,4 s</span>
              <button className="btn btn-ghost btn-xs" style={{ marginLeft: "auto" }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-refresh" /></svg>
                Generer på nytt
              </button>
            </div>

            {GOALS.map((g, i) => (
              <div key={i} className={`gcard${g.selected ? " selected" : ""}`}>
                <div className="gchk">
                  <svg fill="none" stroke="currentColor" strokeWidth="3"><use href="#i-check" /></svg>
                </div>

                <div>
                  <div className="top">
                    <span className={`g-type ${g.type}`}>{g.typeLabel}</span>
                    {g.badgeRight && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9.5px",
                          color: g.badgeRight.color,
                          letterSpacing: "0.10em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                        }}
                      >
                        {g.badgeRight.label}
                      </span>
                    )}
                  </div>
                  <div className="nm">{g.name}</div>

                  <div className="smart">
                    {g.smart.map((p) => (
                      <div key={p.ltr} className="sm-pill">
                        <div className="ltr">{p.ltr}</div>
                        <span className="v">{p.v}</span>
                        <span className="lbl">{p.lbl}</span>
                      </div>
                    ))}
                  </div>

                  <div className="gkpi">
                    {g.kpis.map((k, j) => (
                      <div key={j} className="item">
                        <div className="l">{k.l}</div>
                        <div className={`v${k.ok ? " ok" : ""}`}>{k.v}</div>
                      </div>
                    ))}
                  </div>

                  {g.dep && (
                    <div className="dep">
                      <span className="lbl">Begrunnelse</span>
                      {g.dep}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="bench">
              <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-sparkles" /></svg>
              <div className="txt">
                <strong>2 av 4 valgt</strong> · sammen dekker de Resultat + Prosess. AI anbefaler å velge maks{" "}
                <strong>3 mål</strong> per sesong for å holde fokus skarpt.
              </div>
            </div>
          </div>

          <div className="ai-foot">
            <span className="ghost">
              Steg <strong>2 av 3</strong> · neste: tilpass &amp; lagre
            </span>
            <button className="btn btn-ghost btn-sm">
              <svg fill="none" stroke="currentColor"><use href="#i-arrow-left" /></svg>
              Tilbake
            </button>
            <button className="btn btn-primary btn-sm">
              Til steg 3 · velg + lagre
              <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-arrow-right" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
