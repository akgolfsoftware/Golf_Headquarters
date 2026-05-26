/**
 * PlayerHQ Dashboard — "Min Workbench"
 * Implementering av "AK Golf Workbench Unified.html" fra Claude Design-bundlen.
 *
 * Seksjoner:
 *   1. Hero (eyebrow + Inter Tight + Inter Tight italic)
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
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Target,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import "./dashboard.css";
import { GanttStripInteraktiv } from "./gantt-strip-interaktiv";

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
            <Link href="/portal/mal" className="phq-btn outline">
              <Target size={13} aria-hidden /> Nytt mål
            </Link>
            <Link href="/portal/statistikk" className="phq-btn outline">
              <BarChart3 size={13} aria-hidden /> Legg inn SG-statistikk
            </Link>
            <button type="button" className="phq-btn outline">
              <Sparkles size={13} aria-hidden /> AI-foreslå uke
            </button>
          </div>
        </section>

        {/* ============ 2. ÅRSPLAN GANTT ============ */}
        <GanttStripInteraktiv todayLeftPct={todayLeftPct} weekNumber={props.weekNumber} />

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

              <MalQuickCard goalsActive={props.goals.length} nextTournament={props.nextTournament} />
            </div>
          </div>
        </section>

        {/* ============ 4. STICKY FOOTER ============ */}
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
            <Link href="/portal/mal" className="phq-btn outline">
              <Target size={13} style={{ color: "var(--phq-brand)" }} aria-hidden /> Se mine mål
            </Link>
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

function MalQuickCard({
  goalsActive,
  nextTournament,
}: {
  goalsActive: number;
  nextTournament?: { name: string; daysAway: number };
}) {
  return (
    <div
      style={{
        background: "var(--phq-card)",
        border: "1px solid var(--phq-line)",
        borderRadius: "var(--phq-r-card)",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h4
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10.5,
            fontWeight: 700,
            color: "var(--phq-muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Mine mål
        </h4>
        <Link
          href="/portal/mal"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10.5,
            fontWeight: 700,
            color: "var(--phq-brand)",
            letterSpacing: "0.06em",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Se alle <ArrowRight size={11} aria-hidden />
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(0, 88, 64, 0.10)",
            color: "var(--phq-brand)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Target size={20} aria-hidden />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--phq-ink)",
            }}
          >
            {goalsActive > 0 ? `${goalsActive} aktive mål` : "Ingen mål satt enda"}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--phq-muted)",
              marginTop: 2,
            }}
          >
            {goalsActive > 0
              ? "Følg fremdrift på /portal/mal"
              : "Sett resultatmål og prosessmål for sesongen"}
          </div>
        </div>
      </div>

      <Link
        href="/portal/mal"
        className="phq-btn lime"
        style={{ justifyContent: "center", width: "100%" }}
      >
        <Plus size={13} aria-hidden /> {goalsActive > 0 ? "Nytt mål" : "Sett ditt første mål"}
      </Link>

      {nextTournament ? (
        <div
          style={{
            paddingTop: 12,
            borderTop: "1px solid var(--phq-line-soft)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <TrendingUp size={13} aria-hidden style={{ color: "var(--phq-brand)" }} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--phq-muted)",
              letterSpacing: "0.04em",
            }}
          >
            <strong style={{ color: "var(--phq-ink)" }}>{nextTournament.name}</strong>
            {" · "}
            <strong style={{ color: "var(--phq-brand)" }}>{nextTournament.daysAway} dager</strong>
          </span>
        </div>
      ) : null}
    </div>
  );
}
