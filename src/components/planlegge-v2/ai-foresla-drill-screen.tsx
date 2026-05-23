/**
 * /portal/ai/foresla-drill — pixel-perfekt port av
 * docs/design-handoff/planlegge/ai-foresla-drill.html
 *
 * Renderet som full-page modal (modal-backdrop full-screen) inntil vi har en
 * generisk modal-arkitektur. Lenkes til fra Planlegge/Treningsplan-tabben.
 */

import "./styles.css";
import Link from "next/link";
import { PlanleggeSprite } from "./icons";

type Drill = {
  rank: number;
  primary?: boolean;
  pyrTags: { kind: "fys" | "tek" | "slag" | "spill" | "turn"; label: string }[];
  category: string;
  name: string;
  metaItems: string[];
  matchPct: number;
  high?: boolean;
  why: React.ReactNode;
  ctaPrimary?: boolean;
};

const DRILLS: Drill[] = [
  {
    rank: 1,
    primary: true,
    pyrTags: [
      { kind: "slag", label: "SLAG" },
      { kind: "spill", label: "SPILL" },
    ],
    category: "Driver · gate · 25 min",
    name: "Driver gate-drill · 8 m landingskorridor",
    metaItems: ["25 min", "GFGK Range", "TrackMan kreves", "CS 4/5"],
    matchPct: 98,
    high: true,
    why: (
      <>
        Markus sin <strong>SG: Driving = -0,42</strong> i siste 3 runder. Sideavvik snitt har økt fra{" "}
        <strong>+2,1m → +4,8m</strong> siste 4 uker.{" "}
        <em>
          Denne drill-en trener &quot;tightning&quot; og passer optimalt før Sørlandsåpent — fairwayene er smale (28m
          snitt).
        </em>
      </>
    ),
    ctaPrimary: true,
  },
  {
    rank: 2,
    pyrTags: [{ kind: "slag", label: "SLAG" }],
    category: "Putt · 1-3 m",
    name: "Putt 1–3 m · ladder & reset",
    metaItems: ["20 min", "GFGK SP · Mulligan Indoor", "CS 3/5"],
    matchPct: 86,
    why: (
      <>
        SG: Putting <strong>-0,28</strong> på 1–3 m i siste 5 runder.{" "}
        <em>Pågående baseline-test viser 73% (under personlig 78% snitt).</em> Anbefalt 3×/uke i Spesialisering.
      </>
    ),
    ctaPrimary: true,
  },
  {
    rank: 3,
    pyrTags: [{ kind: "turn", label: "TURN" }],
    category: "Pre-shot · 7 sek",
    name: "Pre-shot rutine · 7-sek protokoll",
    metaItems: ["30 min", "m/ mentaltrener · video", "CS 3/5"],
    matchPct: 71,
    why: (
      <>
        TURN-disiplinen er <strong>0 av 4 tester</strong> tatt og <em>ingen baseline før turnering</em>. Coach Anders
        flagget pre-shot inkonsistens i siste turneringsanalyse (Olyo Vårcup, hull 8 + 13).
      </>
    ),
  },
];

export function AiForeslaDrillScreen() {
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      {/* Fadet bakgrunn */}
      <div className="behind" aria-hidden="true">
        <div className="b-side" />
        <div className="b-top" />
        <div className="b-card" style={{ top: "84px", left: "280px", right: "40px", height: "60px" }} />
        <div className="b-card" style={{ top: "160px", left: "280px", right: "40px", height: "48px" }} />
        <div className="b-card" style={{ top: "220px", left: "280px", right: "40px", height: "140px" }} />
        <div className="b-card" style={{ top: "376px", left: "280px", right: "40px", height: "380px" }} />
      </div>

      <div className="modal-backdrop">
        <div className="modal" role="dialog" aria-label="AI foreslå drill">
          {/* HEADER */}
          <div className="ai-head">
            <Link href="/portal/planlegge?tab=treningsplan" className="close" aria-label="Lukk">
              <svg fill="none" stroke="currentColor"><use href="#i-x" /></svg>
            </Link>

            <div className="eye">
              <svg width="11" height="11" fill="currentColor"><use href="#i-sparkles" /></svg>
              AI · DRILL-ANBEFALING
            </div>
            <h2>
              Foreslår 3 drills <em>tilpasset</em> Markus
            </h2>
            <div className="meta">Basert på Strokes-Gained, siste 90 dager · uke 21 i Spesialisering</div>

            <div className="ai-progress">
              <span className="dot" />
              <span className="txt">
                Analysert <strong>87 økter</strong> · <strong>412 målinger</strong> · <strong>3 turneringer</strong>
              </span>
              <span className="ms">2,1 s</span>
            </div>
          </div>

          {/* BODY */}
          <div className="ai-body">
            {DRILLS.map((d) => (
              <div key={d.rank} className={`ai-drill${d.primary ? " primary" : ""}`}>
                <div className="rank">{d.rank}</div>

                <div>
                  <div className="top">
                    {d.pyrTags.map((t) => (
                      <span key={t.label} className={`pyr pyr-${t.kind}`}>
                        {t.label}
                      </span>
                    ))}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9.5px",
                        color: "var(--muted)",
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      {d.category}
                    </span>
                    <div className="nm">{d.name}</div>
                  </div>
                  <div className="meta">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <use href="#i-clock" />
                    </svg>{" "}
                    {d.metaItems[0]}
                    {d.metaItems.slice(1).map((m, i) => (
                      <span key={i}>
                        <span className="sep">·</span> {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`gauge${d.high ? " high" : ""}`}>
                  <div className="val">
                    {d.matchPct}
                    <span className="u">%</span>
                  </div>
                  <div className="lbl">Match</div>
                </div>

                <div className="why">
                  <span className="lbl">Hvorfor denne?</span>
                  {d.why}
                </div>

                <div className="actions" style={{ gridColumn: 3, gridRow: 1 }}>
                  <button className={`btn ${d.ctaPrimary ? "btn-primary" : "btn-outline"} btn-sm`}>
                    <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-plus" /></svg>
                    Legg til uka
                  </button>
                  <button className="btn btn-ghost btn-xs">Vis detaljer</button>
                </div>
              </div>
            ))}

            <div className="bench" style={{ marginTop: "6px" }}>
              <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-info" /></svg>
              <div className="txt">
                Drills lagt til ukens plan blir <strong>sendt til coach Anders for godkjenning</strong> hvis du er
                under 18. Du får varsel når godkjent.
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="ai-foot">
            <span className="ghost">
              3 av 48 drills i biblioteket · sortert på <strong>Match-score</strong>
            </span>
            <button className="btn btn-outline btn-sm">
              <svg fill="none" stroke="currentColor"><use href="#i-refresh" /></svg>
              Foreslå flere
            </button>
            <button className="btn btn-primary btn-sm">
              <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-check" /></svg>
              Legg til alle 3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
