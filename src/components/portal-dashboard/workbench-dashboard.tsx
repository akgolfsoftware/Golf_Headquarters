/**
 * PlayerHQ Dashboard — "Min Workbench"
 * Implementering av "AK Golf Workbench Unified.html" fra Claude Design-bundlen.
 *
 * Seksjoner:
 *   1. Hero (eyebrow + Inter Tight + Instrument Serif italic)
 *   2. Årsplan-gantt med periode-blokker + turneringsflagg + "I dag"-pin
 *   3. Workbench 3-pane (profil + ukekalender + drills/periodisering)
 *   4. Mål-tracker (3 mål-kort)
 *   5. Innsikt (SG-trend, slag-prioritering, DataGolf-sammenligning)
 *   6. TrackMan-timeline (5 siste økter)
 *   7. Sticky footer (uke-oppsummering)
 */

import Link from "next/link";
import {
  Plus,
  MessageSquare,
  Sparkles,
  Check,
  Star,
  Flag,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingDown,
  ArrowRight,
  Download,
} from "lucide-react";
import "./dashboard.css";

export interface WorkbenchDashboardProps {
  playerName: string;
  playerInitials: string;
  hcpString: string;
  category: string;
  club: string;
  weekNumber: number;
  weekRange: string; // "19—25 mai 2026"
  streak: { active: boolean[]; total: number; longest: number };
  goals: {
    title: string;
    pct: number; // 0..100
    label: string; // "60 %" or "50 dager"
    type: "hcp" | "tournament" | "course";
  }[];
  coach: { name: string; initials: string };
  pyramide: { area: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"; pct: number }[];
  activePlan?: {
    name: string;
    weeksLabel: string;
    progressPct: number;
    csTarget?: string;
  };
  nextTournament?: { name: string; daysAway: number };
  coachMessage?: { text: string; timeAgo: string };
  tmSessions: {
    date: string; // "12. MAI · ONS"
    title: string;
    metric: string;
    unit: string;
    color: "forest" | "tek" | "accent" | "warn";
    sparkPoints: string;
  }[];
}

const PYR_LIST: WorkbenchDashboardProps["pyramide"][number]["area"][] = [
  "FYS",
  "TEK",
  "SLAG",
  "SPILL",
  "TURN",
];

export function WorkbenchDashboard(props: WorkbenchDashboardProps) {
  // Gantt-koordinater (statisk: sesong 2026)
  const todayMonth = new Date().getMonth(); // 0-11
  const todayDay = new Date().getDate();
  const monthDays = new Date(new Date().getFullYear(), todayMonth + 1, 0).getDate();
  const todayLeftPct = (todayMonth * 100) / 12 + ((todayDay - 1) / monthDays) * (100 / 12);

  const pyramidPctByArea = (a: string) =>
    props.pyramide.find((p) => p.area === a)?.pct ?? 0;

  return (
    <div className="phq-scope">
      <div className="phq-page">

        {/* ============ 1. HERO ============ */}
        <section className="phq-hero">
          <div>
            <div className="phq-eyebrow">
              MIN WORKBENCH · UKE {props.weekNumber} · {props.weekRange.toUpperCase()}
            </div>
            <h1>
              Min <em>workbench</em> — bygg, juster, be om hjelp
            </h1>
          </div>
          <div className="phq-hero-actions">
            <Link href="/portal/ny-okt" className="phq-btn lime">
              <Plus size={13} aria-hidden /> Ny økt
            </Link>
            <Link href="/portal/coach" className="phq-btn forest">
              <MessageSquare size={13} aria-hidden /> Be om økt fra coach
            </Link>
            <button type="button" className="phq-btn outline">
              <Sparkles size={13} aria-hidden /> AI-foreslå uke
            </button>
            <button type="button" className="phq-btn outline">
              <Check size={13} aria-hidden /> Logg gjennomført økt
            </button>
          </div>
        </section>

        {/* ============ 2. ÅRSPLAN GANTT ============ */}
        <GanttStrip todayLeftPct={todayLeftPct} weekNumber={props.weekNumber} />

        {/* ============ 3. WORKBENCH 3-PANE ============ */}
        <section>
          <div className="phq-wb-tabs">
            <button className="phq-wb-tab" type="button">DAG</button>
            <button className="phq-wb-tab active" type="button">
              UKE <span className="count">{props.weekNumber}</span>
            </button>
            <button className="phq-wb-tab" type="button">MÅNED</button>
            <button className="phq-wb-tab" type="button">SESONG</button>
          </div>

          <div className="phq-wb-grid">
            {/* PANE A — profile */}
            <div className="phq-pane-a">
              <div className="phq-profile-hero">
                <div className="av-big">{props.playerInitials}</div>
                <div className="nm">{props.playerName}</div>
                <div className="meta">HCP {props.hcpString} · {props.category} · {props.club}</div>
                <div className="status-pill">
                  <Check size={11} aria-hidden />
                  På plan denne uka
                </div>
              </div>

              <div className="phq-pa-card">
                <h4>Mine mål</h4>
                {props.goals.map((g, i) => (
                  <div key={i} className="phq-goal-row">
                    <div className="top">
                      <span className="gname">{g.title}</span>
                      <span className="gval">{g.label}</span>
                    </div>
                    <div className="phq-goal-bar">
                      <div style={{ width: `${g.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="phq-pa-card">
                <h4>Min streak</h4>
                <div className="phq-streak-grid">
                  {props.streak.active.map((on, i) => {
                    const isToday = i === props.streak.active.length - 1;
                    const cls = isToday ? "today" : on ? "on" : "";
                    return <span key={i} className={`phq-streak-cell ${cls}`} />;
                  })}
                </div>
                <div className="phq-streak-meta">
                  <strong>{props.streak.total} av {props.streak.active.length}</strong> dager · lengste {props.streak.longest} d
                </div>
              </div>

              <div className="phq-coach-card-dark">
                <div className="row">
                  <span className="av">{props.coach.initials}</span>
                  <div>
                    <div className="nm">{props.coach.name}</div>
                    <div className="role">HEAD COACH</div>
                  </div>
                </div>
                <div className="actions">
                  <button type="button" className="phq-btn lime-outline sm">
                    <MessageSquare size={11} aria-hidden /> Send melding
                  </button>
                  <Link href="/portal/coach" className="phq-btn lime sm">
                    <Plus size={11} aria-hidden /> Be om økt
                  </Link>
                </div>
              </div>
            </div>

            {/* PANE B — Calendar */}
            <CalendarPane weekRange={props.weekRange} weekNumber={props.weekNumber} />

            {/* PANE C — Drills + period */}
            <div className="phq-pane-c">
              <div className="phq-rec-card">
                <h4>Anbefalt for deg</h4>
                {[
                  { name: "Pitch fra rough", reason: "COACH FORESLÅR" },
                  { name: "Beinbøy intervall", reason: "INGEN FYS PÅ 9 DAGER" },
                  { name: "Putting 3—6m", reason: "SG HAR SUNKET" },
                ].map((rec, i) => (
                  <div key={i} className="phq-rec-row">
                    <span className="ic" aria-hidden><Target size={13} /></span>
                    <div>
                      <div className="name">{rec.name}</div>
                      <div className="reason">{rec.reason}</div>
                    </div>
                    <button type="button" className="phq-btn lime xs">Bruk</button>
                  </div>
                ))}
              </div>

              <div className="phq-drills-card">
                <div className="head">
                  <h4>Mine drills</h4>
                  <span className="ct">14 tilgjengelige</span>
                </div>
                <div className="phq-drill-tabs">
                  <button type="button" className="phq-drill-tab active">Alle</button>
                  <button type="button" className="phq-drill-tab">Favoritter</button>
                  <button type="button" className="phq-drill-tab">
                    Coach tildelt<span className="nbadge">5</span>
                  </button>
                </div>
                {[
                  { nm: "Pitch 50—100m", disc: "slag", time: "60 min", badge: { label: "TILDELT", cls: "forest" } },
                  { nm: "Putting 0—3m blokk", disc: "slag", time: "30 min", badge: { label: "FAVORITT", cls: "lime" } },
                  { nm: "Beinbøy + core", disc: "fys", time: "30 min", badge: null },
                  { nm: "Iron CS70→CS80", disc: "tek", time: "90 min", badge: { label: "TILDELT", cls: "forest" } },
                  { nm: "Driver grunntrening", disc: "tek", time: "60 min", badge: null },
                  { nm: "Bunker eskalering", disc: "slag", time: "45 min", badge: null },
                ].map((d, i) => (
                  <div key={i} className="phq-drill-row">
                    <div>
                      <div className="nm">{d.nm}</div>
                      <div className="meta">
                        <span className={`phq-disc ${d.disc}`}>{d.disc.toUpperCase()}</span>
                        <span className="pip" />
                        <span>{d.time}</span>
                      </div>
                    </div>
                    {d.badge ? (
                      <span className={`phq-badge ${d.badge.cls}`}>{d.badge.label}</span>
                    ) : <span />}
                  </div>
                ))}
              </div>

              {props.activePlan ? (
                <PeriodCard
                  plan={props.activePlan}
                  pyramide={props.pyramide}
                  countdown={props.nextTournament}
                  coachMessage={props.coachMessage}
                  coachInitials={props.coach.initials}
                />
              ) : null}
            </div>
          </div>
        </section>

        {/* ============ 4. GOALS TRACKER ROW ============ */}
        <section>
          <div className="phq-section-head">
            <h2>Mine <em>mål</em> i sikte</h2>
            <span className="phq-eyebrow">3 AKTIVE MÅL</span>
          </div>
          <GoalsRow goals={props.goals} />
          <div className="phq-add-goal-row">
            <button type="button" className="phq-btn outline sm">
              <Plus size={13} style={{ color: "var(--phq-brand)" }} aria-hidden /> Nytt mål
            </button>
          </div>
        </section>

        {/* ============ 5. INSIGHT STRIP ============ */}
        <section>
          <div className="phq-section-head">
            <h2>Hva jeg må <em>jobbe med</em></h2>
            <span className="phq-eyebrow">SISTE 90 DAGER · DATAGOLF SAMMENLIGNING</span>
          </div>
          <InsightStrip />
        </section>

        {/* ============ 6. TRACKMAN STRIP ============ */}
        <section className="phq-tm-strip">
          <div className="phq-section-head">
            <h2>Min <em>TrackMan</em> · siste økter</h2>
            <button type="button" className="phq-btn outline sm">
              <Download size={13} style={{ color: "var(--phq-brand)" }} aria-hidden /> Importer ny økt
            </button>
          </div>
          <div className="phq-tm-cards">
            {props.tmSessions.map((s, i) => (
              <Link key={i} href="/portal/trackman" className="phq-tm-card">
                <span className="date">{s.date.toUpperCase()}</span>
                <span className="ttl">{s.title}</span>
                <svg className="phq-tm-mini-svg" viewBox="0 0 100 32" preserveAspectRatio="none">
                  <polyline
                    points={s.sparkPoints}
                    fill="none"
                    stroke={sparkColor(s.color)}
                    strokeWidth="1.75"
                  />
                </svg>
                <span className="metric">
                  {s.metric} <span className="unit">{s.unit}</span>
                </span>
                <span className="open">
                  Åpne <ArrowRight size={11} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ 7. STICKY FOOTER ============ */}
        <footer className="phq-sticky-foot">
          <div className="phq-foot-left">
            <span className="lbl">Min pyramide denne uka</span>
            <div className="phq-foot-pyr">
              {PYR_LIST.map((a) => {
                const pct = pyramidPctByArea(a);
                return (
                  <div key={a} className={`phq-foot-pyr-bar ${a.toLowerCase()}`}>
                    <div className="bar"><div style={{ width: `${pct}%` }} /></div>
                    <span className="pct">{a} {pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="phq-foot-mid">
            <b>4</b> PLANLAGT<span className="pip" /><b>1</b> FULLFØRT<span className="pip" /><b>195</b> MIN<span className="pip" /><b>67%</b> PYRAMIDE
          </div>
          <div className="phq-foot-right">
            <button type="button" className="phq-btn outline">
              <Sparkles size={13} style={{ color: "var(--phq-brand)" }} aria-hidden /> Be om økt-forslag
            </button>
            <Link href="/portal/ny-okt" className="phq-btn lime">
              <Plus size={13} aria-hidden /> Logg ny økt
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function GanttStrip({ todayLeftPct, weekNumber }: { todayLeftPct: number; weekNumber: number }) {
  return (
    <section className="phq-gantt">
      <div className="phq-gantt-head">
        <h3>Sesong 2026 · min årsplan</h3>
        <div className="phq-gantt-legend">
          <span><i style={{ background: "var(--phq-brand)" }} />Aktiv periode</span>
          <span><i style={{ background: "var(--phq-accent)" }} />Hovedmål-turnering</span>
          <span><i style={{ background: "var(--phq-danger)" }} />Konkurranse</span>
          <span><i style={{ background: "var(--phq-danger)" }} />I dag</span>
        </div>
      </div>

      <div className="phq-gantt-months">
        {["JAN","FEB","MAR","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DES"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <div className="phq-gantt-track">
          <div className="phq-gantt-block b1" style={{ left: "0%", width: "25%" }}>GRUNNTRENING</div>
          <div className="phq-gantt-block b2" style={{ left: "16.66%", width: "12.5%" }}>OPPBYGGING</div>
          <div className="phq-gantt-block b3" style={{ left: "25%", width: "16.66%" }}>SPESIALISERING · AKTIV</div>
          <div className="phq-gantt-block b4" style={{ left: "41.66%", width: "20.83%" }}>KONKURRANSE</div>
          <div className="phq-gantt-block b5" style={{ left: "66.66%", width: "16.66%" }}>OVERGANG</div>
          <div className="phq-gantt-block b6" style={{ left: "83.33%", width: "16.66%" }}>HVILE</div>
          <div className="phq-gantt-today" style={{ left: `${todayLeftPct}%` }} />
        </div>

        <div className="phq-gantt-flags">
          <div className="phq-gantt-flag star" style={{ left: "calc(41.66% + (9/30)*8.33%)" }}>
            <Star size={14} aria-hidden />
            <span className="lbl">10. JUN · SØRLANDSÅPENT</span>
          </div>
          <div className="phq-gantt-flag" style={{ left: "calc(41.66% + (23/30)*8.33%)" }}>
            <Flag size={14} aria-hidden />
            <span className="lbl">24. JUN · BOSSUM</span>
          </div>
          <div className="phq-gantt-flag star" style={{ left: "calc(50% + (7/31)*8.33%)" }}>
            <Star size={14} aria-hidden />
            <span className="lbl">8. JUL · NM SLAG</span>
          </div>
          <div className="phq-gantt-flag" style={{ left: "calc(50% + (21/31)*8.33%)" }}>
            <Flag size={14} aria-hidden />
            <span className="lbl">22. JUL · TRONDHEIM</span>
          </div>
          <div className="phq-gantt-flag" style={{ left: "calc(58.33% + (4/31)*8.33%)" }}>
            <Flag size={14} aria-hidden />
            <span className="lbl">5. AUG · GFGK MESTERSKAP</span>
          </div>
        </div>
      </div>

      <div className="phq-gantt-weeks">
        <div className="phq-week-strip">
          {[-3, -2, -1, 0, 1].map((diff) => {
            const w = weekNumber + diff;
            const active = diff === 0;
            return (
              <span key={diff} className={`phq-week-cell ${active ? "active" : ""}`}>U{w}</span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CalendarPane({ weekRange, weekNumber }: { weekRange: string; weekNumber: number }) {
  const days = [
    { dow: "MAN · I DAG", day: "19", today: true },
    { dow: "TIR", day: "20" },
    { dow: "ONS", day: "21" },
    { dow: "TOR", day: "22" },
    { dow: "FRE", day: "23" },
    { dow: "LØR", day: "24", weekend: true },
    { dow: "SØN", day: "25", weekend: true },
  ];

  const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  return (
    <div className="phq-pane-b">
      <div className="phq-cal-head">
        <h3>Uke {weekNumber} · {weekRange}</h3>
        <div className="nav">
          <button type="button" aria-label="Forrige uke"><ChevronLeft size={12} aria-hidden /></button>
          <span className="lbl">UKE {weekNumber}</span>
          <button type="button" aria-label="Neste uke"><ChevronRight size={12} aria-hidden /></button>
        </div>
      </div>
      <div className="phq-cal-grid">
        <div className="phq-cal-time-corner" />
        {days.map((d) => (
          <div
            key={d.dow}
            className={`phq-cal-daycol-head ${d.today ? "today" : ""} ${d.weekend ? "weekend" : ""}`}
          >
            <span className="dow">{d.dow}</span>
            <span className="day">{d.day}</span>
          </div>
        ))}

        {times.map((t, rowIdx) => (
          <CalRow key={t} time={t} rowIdx={rowIdx} />
        ))}
      </div>
    </div>
  );
}

function CalRow({ time, rowIdx }: { time: string; rowIdx: number }) {
  // Map: which event lives in which cell for this row (matching the design)
  // events keyed by colIdx 0..6
  const events: Record<number, React.ReactNode> = {};

  if (rowIdx === 1) {
    // 09:00
    events[0] = (
      <div className="phq-cal-block slag done" style={{ top: 4, height: 76 }}>
        <div className="title">Pitch 50—100m</div>
        <div className="meta">
          <span className="phq-disc slag">SLAG</span>
          <span className="phq-badge done"><Check size={10} aria-hidden />FULLFØRT</span>
        </div>
      </div>
    );
    events[2] = (
      <div className="phq-cal-block slag" style={{ top: 4, height: 116 }}>
        <div className="title">Bunker-eskalering</div>
        <div className="meta">
          <span className="phq-disc slag">SLAG</span>
          <span className="phq-badge lime">SELVPLANLAGT</span>
        </div>
      </div>
    );
    events[5] = (
      <div className="phq-cal-block tournament" style={{ top: 4, height: 316 }}>
        <div className="title">Bossum Open · Runde 1</div>
        <div className="meta">
          <span className="phq-disc slag" style={{ background: "var(--phq-accent)", color: "var(--phq-brand-dark)", borderColor: "transparent" }}>TURN</span>
          <span className="phq-mono" style={{ color: "var(--phq-accent)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em" }}>09:00—13:00</span>
        </div>
      </div>
    );
  }
  if (rowIdx === 3) {
    // 11:00
    events[1] = (
      <div className="phq-cal-empty-hint" style={{ top: 4, height: 116 }}>
        Selvplanlegg eller<br />be om økt
      </div>
    );
    events[4] = (
      <div className="phq-cal-block tek" style={{ top: 4, height: 76 }}>
        <div className="title">Driver grunntrening</div>
        <div className="meta">
          <span className="phq-disc tek">TEK</span>
          <span className="phq-badge coach">AV ANDERS</span>
        </div>
      </div>
    );
  }
  if (rowIdx === 6) {
    // 14:00
    events[0] = (
      <div className="phq-cal-block tek" style={{ top: 4, height: 116 }}>
        <div className="title">Iron CS70→CS80</div>
        <div className="meta">
          <span className="phq-disc tek">TEK</span>
          <span className="phq-badge coach">AV ANDERS</span>
        </div>
      </div>
    );
  }
  if (rowIdx === 7) {
    // 15:00
    events[3] = (
      <div className="phq-cal-empty-hint" style={{ top: 4, height: 116 }}>
        Selvplanlegg eller<br />be om økt
      </div>
    );
    events[6] = (
      <div className="phq-cal-cta" style={{ top: 4, height: 196 }}>
        <span className="plus"><Plus size={12} aria-hidden /></span>
        <span className="lbl">BE OM<br />PLAN-JUSTERING</span>
        <ArrowRight size={13} aria-hidden style={{ color: "var(--phq-ink)" }} />
      </div>
    );
  }

  return (
    <>
      <div className="phq-cal-time">{time}</div>
      {[0, 1, 2, 3, 4, 5, 6].map((col) => {
        const isToday = col === 0;
        const weekend = col >= 5;
        return (
          <div
            key={col}
            className={`phq-cal-cell ${isToday ? "today" : ""} ${weekend ? "weekend" : ""}`.trim()}
          >
            {events[col]}
          </div>
        );
      })}
    </>
  );
}

function PeriodCard({
  plan,
  pyramide,
  countdown,
  coachMessage,
  coachInitials,
}: {
  plan: WorkbenchDashboardProps["activePlan"];
  pyramide: WorkbenchDashboardProps["pyramide"];
  countdown?: { name: string; daysAway: number };
  coachMessage?: { text: string; timeAgo: string };
  coachInitials: string;
}) {
  if (!plan) return null;
  const circumference = 2 * Math.PI * 40;
  const progDash = (plan.progressPct / 100) * circumference;

  return (
    <div className="phq-period-card">
      <h4>AKTIV PERIODE</h4>
      <div className="pname">{plan.name}</div>
      <div className="pmeta">{plan.weeksLabel}{plan.csTarget ? ` · ${plan.csTarget}` : ""}</div>

      <div className="phq-pyr-mini">
        {["TURN", "SPILL", "SLAG", "TEK", "FYS"].map((area) => {
          const p = pyramide.find((x) => x.area === area)?.pct ?? 0;
          return (
            <div key={area} className={`phq-pyr-mini-row ${area.toLowerCase()}`}>
              <span className="nm">{area}</span>
              <div className="bar"><div style={{ width: `${p}%` }} /></div>
              <span className="pct">{p}%</span>
            </div>
          );
        })}
      </div>

      <div className="phq-ring-block">
        <svg className="phq-ring-svg" viewBox="0 0 100 100">
          <circle className="ring-track" cx="50" cy="50" r="40" />
          <circle
            className="ring-prog"
            cx="50"
            cy="50"
            r="40"
            strokeDasharray={`${progDash} ${circumference}`}
          />
          <text x="50" y="50">{plan.progressPct}%</text>
        </svg>
        <div className="info">
          <div className="k">FREMDRIFT</div>
          <div className="lbl">{plan.csTarget ? `mot ${plan.csTarget.split("→")[1]?.trim() ?? "mål"}` : "mot mål"}</div>
        </div>
      </div>

      {countdown ? (
        <div className="phq-countdown">
          <span className="nm">{countdown.name}</span>
          <span className="days">{countdown.daysAway} DAGER</span>
        </div>
      ) : null}

      {coachMessage ? (
        <div className="phq-coach-msg">
          <div className="top">
            <span className="av">{coachInitials}</span>
            <span className="meta">ANDERS K. · {coachMessage.timeAgo}</span>
          </div>
          <p className="quote">&ldquo;{coachMessage.text}&rdquo;</p>
        </div>
      ) : null}
    </div>
  );
}

function GoalsRow({ goals }: { goals: WorkbenchDashboardProps["goals"] }) {
  const circumference = 2 * Math.PI * 42;
  return (
    <div className="phq-goals-row">
      {/* Goal 1 — ring (typically tournament) */}
      {goals[0] ? (
        <div className="phq-goal-card">
          <div className="gtype">{goals[0].type === "tournament" ? "RESULTATMÅL" : "PROSESSMÅL"}</div>
          <h3>{goals[0].title}</h3>
          <div className="ring-row">
            <svg className="phq-ring-big" viewBox="0 0 100 100">
              <circle className="ring-track" cx="50" cy="50" r="42" />
              <circle
                className="ring-prog"
                cx="50"
                cy="50"
                r="42"
                strokeDasharray={`${(goals[0].pct / 100) * circumference} ${circumference}`}
              />
              <text x="50" y="50">{goals[0].pct}%</text>
            </svg>
            <div>
              <span className="days">{goals[0].label.toUpperCase()}</span>
              <p className="quote" style={{ marginTop: 8 }}>
                &ldquo;Forbedre approach +0,4 SG for 50 % sannsynlighet.&rdquo;
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Goal 2 — scoreline */}
      <div className="phq-goal-card">
        <div className="gtype">PROSESSMÅL</div>
        <h3>Snitt under 72 på Srixon</h3>
        <svg className="phq-scoreline-svg" viewBox="0 0 320 80" preserveAspectRatio="none">
          <line x1="0" y1="36" x2="320" y2="36" stroke="#E5E3DD" strokeDasharray="3 3" strokeWidth="1" />
          <polyline
            points="10,52 38,30 65,46 92,18 119,38 146,28 173,14 200,22 227,38 254,16 281,10 308,24"
            fill="none"
            stroke="#005840"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="308" cy="24" r="3.5" fill="#D1F843" stroke="#005840" strokeWidth="1.5" />
          <text x="0" y="78" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">68</text>
          <text x="304" y="78" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">79</text>
          <text x="0" y="36" dy="-2" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990" textAnchor="start">72</text>
        </svg>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span className="chip"><TrendingDown size={11} aria-hidden />71,4</span>
          <span className="phq-mono" style={{ fontSize: 10.5, color: "var(--phq-muted)" }}>5/7 SISTE UNDER 72</span>
        </div>
      </div>

      {/* Goal 3 — HCP zone */}
      <div className="phq-goal-card">
        <div className="gtype">RESULTATMÅL</div>
        <h3>HCP under +2,0 innen sesongslutt</h3>
        <div className="phq-progress-zone">
          <div className="fill" style={{ width: "60%" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span className="days">82 DAGER IGJEN</span>
          <span className="phq-mono" style={{ fontSize: 10.5, color: "var(--phq-muted)" }}>+3,5 → +2,0</span>
        </div>
        <p className="quote">&ldquo;1,5 forbedring i HCP — på sporet til halvveis 60 %.&rdquo;</p>
      </div>
    </div>
  );
}

function InsightStrip() {
  return (
    <div className="phq-insight-row">
      {/* SG Trend chart */}
      <div className="phq-ins-card">
        <h3>SG-trend siste 90 dager</h3>
        <div className="sub">STROKES GAINED · PER DISIPPLIN</div>
        <svg className="phq-sg-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
          <line x1="32" y1="20" x2="400" y2="20" stroke="#EFEDE6" />
          <line x1="32" y1="60" x2="400" y2="60" stroke="#EFEDE6" />
          <line x1="32" y1="100" x2="400" y2="100" stroke="#D8D5CB" />
          <line x1="32" y1="140" x2="400" y2="140" stroke="#EFEDE6" />
          <line x1="32" y1="180" x2="400" y2="180" stroke="#EFEDE6" />
          <text x="0" y="22" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">+1,5</text>
          <text x="0" y="62" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">+0,75</text>
          <text x="0" y="104" fontFamily="JetBrains Mono" fontSize="8" fill="#5E5C57">0</text>
          <text x="0" y="144" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">-0,75</text>
          <text x="0" y="184" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">-1,5</text>
          <text x="64" y="195" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">MAR</text>
          <text x="156" y="195" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">APR</text>
          <text x="248" y="195" fontFamily="JetBrains Mono" fontSize="8" fill="#9C9990">MAI</text>
          <polyline points="40,98 80,92 120,90 160,85 200,82 240,80 280,78 320,76 360,76 400,74" fill="none" stroke="#005840" strokeWidth="2" />
          <polyline points="40,90 80,96 120,104 160,112 200,122 240,128 280,134 320,138 360,142 400,146" fill="none" stroke="#A32D2D" strokeWidth="2" />
          <polyline points="40,108 80,104 120,100 160,98 200,94 240,90 280,88 320,84 360,82 400,80" fill="none" stroke="#1A7D56" strokeWidth="2" />
          <polyline points="40,118 80,114 120,108 160,100 200,92 240,84 280,76 320,68 360,62 400,56" fill="none" stroke="#BFE933" strokeWidth="3" />
          <circle cx="400" cy="56" r="3.5" fill="#D1F843" stroke="#005840" strokeWidth="1.5" />
        </svg>
        <div className="phq-sg-legend">
          <span><i style={{ background: "#005840" }} />Off-the-tee</span>
          <span><i style={{ background: "#A32D2D" }} />Approach</span>
          <span><i style={{ background: "#1A7D56" }} />Around-green</span>
          <span><i style={{ background: "#BFE933" }} />Putting</span>
        </div>
      </div>

      {/* Slag-prioritering */}
      <div className="phq-ins-card">
        <h3>Slag-prioritering</h3>
        <div className="sub">SØRLANDSÅPENT · OM 21 DAGER</div>
        <div className="phq-prio-list">
          {[
            { n: "01", nm: "Approach 100—150m", val: "+0,42 SG potensial", reason: "Bossum har 6 hull i dette området" },
            { n: "02", nm: "Putting 3—6m", val: "+0,38 SG potensial", reason: "SG har sunket 0,4 siste 30 dager" },
            { n: "03", nm: "Driver-presisjon", val: "+0,22 SG potensial", reason: "Smale fairways på Bossum" },
          ].map((p) => (
            <div key={p.n} className="phq-prio-row">
              <span className="num">{p.n}</span>
              <div>
                <div className="nm">{p.nm}</div>
                <span className="sgval">{p.val}</span>
                <div className="reason">{p.reason}</div>
              </div>
              <button type="button" className="phq-btn outline xs">Opprett drill</button>
            </div>
          ))}
        </div>
      </div>

      {/* DataGolf comparison */}
      <div className="phq-ins-card">
        <h3>Du vs DataGolf</h3>
        <div className="sub">KATEGORI A1 · GJ.SNITT FOR HCP +3 TIL +4</div>
        {[
          { nm: "OFF-THE-TEE", delta: "-0,12", cls: "mid" as const, dir: "right" as const, width: 8 },
          { nm: "APPROACH", delta: "-0,42", cls: "down" as const, dir: "right" as const, width: 28 },
          { nm: "AROUND-GREEN", delta: "+0,15", cls: "up" as const, dir: "left" as const, width: 10 },
          { nm: "PUTTING", delta: "-0,28", cls: "mid" as const, dir: "right" as const, width: 18 },
          { nm: "STRATEGY", delta: "+0,08", cls: "up" as const, dir: "left" as const, width: 6 },
        ].map((d) => (
          <div key={d.nm} className="phq-dg-row">
            <div className="top">
              <span className="nm">{d.nm}</span>
              <span className={`delta ${d.cls}`}>{d.delta}</span>
            </div>
            <div className="phq-dg-bar">
              <span className="zero" />
              <span
                className={`fill ${d.cls}`}
                style={d.dir === "right" ? { right: "50%", width: `${d.width}%` } : { left: "50%", width: `${d.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function sparkColor(c: "forest" | "tek" | "accent" | "warn"): string {
  switch (c) {
    case "forest": return "#005840";
    case "tek": return "#1A7D56";
    case "accent": return "#BFE933";
    case "warn": return "#B8852A";
  }
}
