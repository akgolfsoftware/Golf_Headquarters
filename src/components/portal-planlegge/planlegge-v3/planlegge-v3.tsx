/**
 * Planlegge v3 — Athletic Editorial Living
 *
 * Port av workbench-v2/planlegge.jsx fra design-handoff.
 * 6 seksjoner: Hero, Aktiv plan, Pyramide-vekting, Drill-bibliotek,
 * Mine mål, Turneringer.
 */

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Brain,
  Check,
  Compass,
  Flag,
  HelpCircle,
  MapPin,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import "./planlegge-v3.css";

type Axis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type ActivePlan = {
  id: string;
  name: string;
  coach: string;
  startDate: string;
  endDate: string;
  currentWeek: number;
  totalWeeks: number;
  progress: number;
  milestones: Array<{
    id: string;
    label: string;
    weeks: string;
    status: "done" | "active" | "planned";
    summary: string;
    drills: number;
  }>;
};

export type AxisData = {
  axis: Axis;
  actualHours: number;
  targetHours: number;
  drills: number;
  sessionsThisWeek: number;
  lastSession: string;
  note: string;
};

export type DrillCategory = {
  id: string;
  label: string;
  count: number;
  axis: Axis;
  lastUsed: string;
  featured?: boolean;
  icon: "target" | "flag" | "zap" | "compass" | "mapPin" | "brain";
};

export type Goal = {
  id: string;
  title: string;
  deadline: string;
  current: number;
  target: number;
  progress: number;
  unit: "hcp" | "sg" | "stroke";
  trend: "up" | "down" | "flat";
  metric: string;
  priority?: boolean;
};

export type Tournament = {
  id: string;
  name: string;
  dateRange: string;
  location: string;
  status: "REGISTRERT" | "INTERESSERT" | "VURDERER" | "PLANLAGT";
  daysUntil: number;
  format: string;
  priority?: boolean;
};

export type PlanleggeV3Props = {
  user: { initials: string; name: string };
  activePlan: ActivePlan;
  axes: AxisData[];
  drillLib: DrillCategory[];
  goals: Goal[];
  tournaments: Tournament[];
};

const DRILL_ICONS: Record<DrillCategory["icon"], LucideIcon> = {
  target: Target,
  flag: Flag,
  zap: Zap,
  compass: Compass,
  mapPin: MapPin,
  brain: Brain,
};

function formatGoalNum(v: number, unit: Goal["unit"]) {
  if (unit === "hcp") return v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
  if (unit === "sg") return (v > 0 ? "+" : "") + v.toFixed(2);
  return v.toFixed(1);
}

function getAxisStatus(a: AxisData): "ok" | "over" | "under" {
  if (a.actualHours >= a.targetHours * 0.95 && a.actualHours <= a.targetHours * 1.1)
    return "ok";
  if (a.actualHours > a.targetHours) return "over";
  return "under";
}

export function PlanleggeV3({
  user,
  activePlan,
  axes,
  drillLib,
  goals,
  tournaments,
}: PlanleggeV3Props) {
  const totalDrills = drillLib.reduce((s, d) => s + d.count, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8 md:px-6">
      {/* ============ HERO ============ */}
      <section className="pv3-hero" aria-label="Planlegge hero">
        <Image
          src="/images/akademy/coaching-tripod.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="pv3-hero-img"
        />
        <div className="pv3-hero-grad-1" aria-hidden />
        <div className="pv3-hero-grad-2" aria-hidden />
        <div className="pv3-hero-inner">
          <div className="pv3-hero-top">
            <div className="pv3-hero-top-left">
              <span className="pv3-hero-pill">PLANLEGGE</span>
              <span className="pv3-hero-pill pv3-hero-pill-ghost">
                Aktiv plan · {activePlan.name}
              </span>
            </div>
            <Link
              href="/portal/meg"
              className="grid h-11 w-11 place-items-center rounded-full bg-accent font-mono text-xs font-bold text-accent-foreground transition-transform hover:scale-105"
              aria-label="Min profil"
            >
              {user.initials}
            </Link>
          </div>
          <div>
            <h1 className="pv3-hero-title">
              Planen, fra <em>A til Z</em>.
            </h1>
            <div className="pv3-hero-meta" role="list">
              <span className="pv3-hero-meta-item" role="listitem">
                <span>Uke</span>
                <span className="pv3-hero-meta-num">
                  {activePlan.currentWeek}
                  <span style={{ opacity: 0.55 }}>/{activePlan.totalWeeks}</span>
                </span>
              </span>
              <span className="pv3-hero-divider" aria-hidden />
              <span className="pv3-hero-meta-item" role="listitem">
                <span>Aktive mål</span>
                <span className="pv3-hero-meta-num">{goals.length}</span>
              </span>
              <span className="pv3-hero-divider" aria-hidden />
              <span className="pv3-hero-meta-item" role="listitem">
                <span>Drills i bibliotek</span>
                <span className="pv3-hero-meta-num">{totalDrills}</span>
              </span>
              <span className="pv3-hero-divider" aria-hidden />
              <span className="pv3-hero-meta-item" role="listitem">
                <span className="pv3-hero-meta-num accent">
                  {activePlan.progress}%
                </span>
                <span>gjennom build-period</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 01 · AKTIV PLAN ============ */}
      <section className="pv3-section" aria-labelledby="aktiv-plan-heading">
        <div className="pv3-section-head">
          <div className="pv3-section-head-left">
            <div className="pv3-section-ghostnum" aria-hidden>
              01
            </div>
            <p className="pv3-section-eyebrow">Det vi jobber mot</p>
            <h2 id="aktiv-plan-heading" className="pv3-section-title">
              Aktiv plan
            </h2>
            <p className="pv3-section-desc">
              Build-perioden mot {activePlan.name.split(" ")[0]} — {activePlan.totalWeeks}{" "}
              uker, {activePlan.milestones.length} milepæler. Du er i uke{" "}
              {activePlan.currentWeek} av {activePlan.totalWeeks}.
            </p>
          </div>
          <Link href="/portal/tren/aarsplan" className="pv3-section-cta">
            Plan-historikk <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>

        <article className="pv3-active-plan">
          <div className="pv3-active-plan-head">
            <div>
              <p className="pv3-active-plan-eyebrow">Aktiv plan</p>
              <h3 className="pv3-active-plan-title">{activePlan.name}</h3>
              <p className="pv3-active-plan-meta">
                {activePlan.startDate} – {activePlan.endDate} · Coach{" "}
                {activePlan.coach}
              </p>
            </div>
            <Link
              href="/portal/tren/teknisk-plan"
              className="pv3-pill-accent"
            >
              Plan-builder
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>

          <div className="pv3-progress">
            <div className="pv3-progress-track">
              <div
                className="pv3-progress-fill"
                style={{ width: `${activePlan.progress}%` }}
              />
            </div>
            <div className="pv3-progress-meta">
              <span>
                Uke {activePlan.currentWeek} av {activePlan.totalWeeks}
              </span>
              <span>{activePlan.progress}% fullført</span>
            </div>
          </div>

          <ol className="pv3-milestones" role="list">
            {activePlan.milestones.map((m) => (
              <li
                key={m.id}
                className={`pv3-milestone pv3-milestone-${m.status}`}
              >
                <button type="button" aria-label={`${m.label} — ${m.status}`}>
                  <span className="pv3-milestone-dot">
                    {m.status === "done" && (
                      <Check size={11} strokeWidth={2.5} />
                    )}
                    {m.status === "active" && (
                      <span className="pv3-milestone-pulse" />
                    )}
                  </span>
                  <div>
                    <div className="pv3-milestone-week">{m.weeks}</div>
                    <div className="pv3-milestone-label">{m.label}</div>
                    <div className="pv3-milestone-summary">{m.summary}</div>
                  </div>
                  <div className="pv3-milestone-aside">
                    <div className="pv3-milestone-aside-num">{m.drills}</div>
                    <div className="pv3-milestone-aside-label">drills</div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </article>
      </section>

      {/* ============ 02 · PYRAMIDE-VEKTING ============ */}
      <section className="pv3-section" aria-labelledby="pyramide-heading">
        <div className="pv3-section-head">
          <div className="pv3-section-head-left">
            <div className="pv3-section-ghostnum" aria-hidden>
              02
            </div>
            <p className="pv3-section-eyebrow">5-akse fordeling</p>
            <h2 id="pyramide-heading" className="pv3-section-title">
              Pyramide-vekting
            </h2>
            <p className="pv3-section-desc">
              Hvordan ukens timer er fordelt mellom de fem aksene — faktisk vs.
              plan.
            </p>
          </div>
          <button type="button" className="pv3-section-cta">
            <HelpCircle size={12} strokeWidth={2} />
            Hva er pyramide-balanse?
          </button>
        </div>

        <div className="pv3-axes-grid" role="list">
          {axes.map((a) => {
            const pct = Math.min(100, (a.actualHours / a.targetHours) * 100);
            const status = getAxisStatus(a);
            return (
              <button
                key={a.axis}
                type="button"
                className="pv3-axis-card"
                role="listitem"
              >
                <div className="pv3-axis-card-head">
                  <span className={`pv3-axis-dot ${a.axis}`} aria-hidden />
                  <span className="pv3-axis-label">{a.axis}</span>
                  <span
                    className={`pv3-axis-badge pv3-axis-badge-${status}`}
                  >
                    {status}
                  </span>
                </div>
                <div className="pv3-axis-hours">
                  <span className="pv3-axis-num">
                    {a.actualHours.toFixed(1)}
                  </span>
                  <span className="pv3-axis-num-sep">/</span>
                  <span className="pv3-axis-num-target">
                    {a.targetHours.toFixed(1)}
                  </span>
                  <span className="pv3-axis-unit">timer</span>
                </div>
                <div className="pv3-axis-bar" aria-hidden>
                  <div
                    className={`pv3-axis-bar-fill ${a.axis}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="pv3-axis-meta">
                  <span>
                    <strong>{a.drills}</strong> drills
                  </span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>
                    <strong>{a.sessionsThisWeek}</strong> økter/uke
                  </span>
                </div>
                <div className="pv3-axis-note">{a.note}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ 03 · DRILL-BIBLIOTEK ============ */}
      <section className="pv3-section" aria-labelledby="drill-heading">
        <div className="pv3-section-head">
          <div className="pv3-section-head-left">
            <div className="pv3-section-ghostnum" aria-hidden>
              03
            </div>
            <p className="pv3-section-eyebrow">Verktøykassen</p>
            <h2 id="drill-heading" className="pv3-section-title">
              Drill-bibliotek
            </h2>
            <p className="pv3-section-desc">
              Drills gruppert per fokusområde. Trykk en kategori for full liste.
            </p>
          </div>
          <Link href="/portal/drills" className="pv3-section-cta">
            Bla i biblioteket
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>

        <div className="pv3-drill-grid" role="list">
          {drillLib.map((d) => {
            const Icon = DRILL_ICONS[d.icon];
            return (
              <Link
                key={d.id}
                href={`/portal/drills?axis=${d.axis}`}
                className={`pv3-drill-tile ${d.featured ? "pv3-drill-tile-featured" : ""}`}
                role="listitem"
              >
                <div className="pv3-drill-tile-top">
                  <span className={`pv3-drill-tile-icon ${d.axis}`}>
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <span className={`pv3-axis-badge pv3-axis-badge-ok`}>
                    {d.axis}
                  </span>
                </div>
                <div className="pv3-drill-tile-label">{d.label}</div>
                <div className="pv3-drill-tile-meta">
                  <span>
                    <strong>{d.count}</strong> drills
                  </span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>brukt {d.lastUsed}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ 04 · MINE MÅL ============ */}
      <section className="pv3-section" aria-labelledby="mal-heading">
        <div className="pv3-section-head">
          <div className="pv3-section-head-left">
            <div className="pv3-section-ghostnum" aria-hidden>
              04
            </div>
            <p className="pv3-section-eyebrow">Det vi måler oss mot</p>
            <h2 id="mal-heading" className="pv3-section-title">
              Mine mål
            </h2>
            <p className="pv3-section-desc">
              {goals.length} aktive mål. Trykk for å se framgang over tid.
            </p>
          </div>
          <Link href="/portal/mal" className="pv3-section-cta">
            Nytt mål
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>

        {goals.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Ingen aktive mål enda. Opprett et mål for å begynne å spore
            framgang.
          </p>
        ) : (
          <div className="pv3-goals-grid" role="list">
            {goals.map((g) => {
              const TrendIcon =
                g.trend === "up"
                  ? TrendingUp
                  : g.trend === "down"
                    ? TrendingDown
                    : Minus;
              return (
                <Link
                  key={g.id}
                  href={`/portal/mal/goal/${g.id}`}
                  className={`pv3-goal-card ${g.priority ? "pv3-goal-card-priority" : ""}`}
                  role="listitem"
                >
                  <div className="pv3-goal-top">
                    <div>
                      <p className="pv3-goal-eyebrow">{g.metric}</p>
                      <h3 className="pv3-goal-title">{g.title}</h3>
                    </div>
                    <span className={`pv3-goal-trend pv3-goal-trend-${g.trend}`}>
                      <TrendIcon size={14} strokeWidth={2} />
                    </span>
                  </div>
                  <div className="pv3-goal-num-row">
                    <div className="pv3-goal-num">
                      {formatGoalNum(g.current, g.unit)}
                    </div>
                    <div className="pv3-goal-num-sep">
                      <ArrowRight size={14} />
                    </div>
                    <div className="pv3-goal-num pv3-goal-num-target">
                      {formatGoalNum(g.target, g.unit)}
                    </div>
                  </div>
                  <div className="pv3-goal-bar">
                    <div
                      className="pv3-goal-bar-fill"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <div className="pv3-goal-foot">
                    <span>
                      <strong>{g.progress}%</strong> mot mål
                    </span>
                    <span>{g.deadline}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ 05 · TURNERINGER ============ */}
      <section className="pv3-section" aria-labelledby="tourn-heading">
        <div className="pv3-section-head">
          <div className="pv3-section-head-left">
            <div className="pv3-section-ghostnum" aria-hidden>
              05
            </div>
            <p className="pv3-section-eyebrow">Kommende konkurranser</p>
            <h2 id="tourn-heading" className="pv3-section-title">
              Turneringer
            </h2>
            <p className="pv3-section-desc">
              {tournaments.length === 0
                ? "Ingen kommende turneringer. Meld deg på via turneringsplanleggeren."
                : `${tournaments.length} kommende turneringer.`}
            </p>
          </div>
          <Link href="/portal/tren/turneringer" className="pv3-section-cta">
            Sesong-kalender
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Ingen kommende turneringer. Bruk turneringsplanleggeren til å melde
            deg på.
          </p>
        ) : (
          <div className="pv3-tourn-list" role="list">
            {tournaments.map((t) => (
              <Link
                key={t.id}
                href={`/portal/tren/turneringer/${t.id}`}
                className={`pv3-tourn-row ${t.priority ? "pv3-tourn-row-priority" : ""}`}
                role="listitem"
              >
                <div className="pv3-tourn-date">
                  <div className="pv3-tourn-days">{t.daysUntil}</div>
                  <div className="pv3-tourn-days-label">dager</div>
                </div>
                <div className="pv3-tourn-meta">
                  <div className="pv3-tourn-name-line">
                    <span className="pv3-tourn-name">{t.name}</span>
                    {t.priority && (
                      <span className="pv3-tourn-badge-accent">Hovedmål</span>
                    )}
                  </div>
                  <div className="pv3-tourn-meta-line">
                    <span>{t.dateRange}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{t.location}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{t.format}</span>
                  </div>
                </div>
                <div className="pv3-tourn-aside">
                  <span
                    className={`pv3-tourn-status pv3-tourn-status-${t.status}`}
                  >
                    {t.status}
                  </span>
                  <ArrowRight size={16} strokeWidth={1.75} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
